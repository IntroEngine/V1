
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/config/supabase"
import { openai } from "@/lib/openai"

type MatchResult = {
    companyName: string
    matchScore: number // 0-100
    matchType: "ICP Match" | "ICP Parcial" | "No ICP"
    matchingCriteria: string[] // e.g. ["Industry", "Size"]
    missingCriteria: string[] // e.g. ["Location"]
    source: "Network" | "Work History"
    connectionStrength?: number
}

async function analyzeBatchWithAI(companies: { name: string, domain?: string, id: string }[], icp: any): Promise<any[]> {
    if (companies.length === 0) return []

    const prompt = `
    Act as a B2B Analyst. The user is looking for companies matching this ICP:
    - Industries: ${icp.target_industries?.join(", ") || "Any"}
    - Company Size: ${icp.company_size_min || 0} to ${icp.company_size_max || "Unlimited"} employees
    - Roles: ${icp.key_roles?.join(", ") || "Any"}
    - Keywords: ${icp.target_technologies?.join(", ")} ${icp.pain_points || ""}

    Analyze the following list of companies from the user's network.
    Identify which ones are a GOOD or PARTIAL fit for this ICP based on their known public reputation/industry.
    
    CRITICAL INSTRUCTIONS:
    1. SIZE IS STRICT: You MUST estimate the current employee count of the company. If it is outside the range (${icp.company_size_min || 0} - ${icp.company_size_max || "Unlimited"}), you MUST REJECT IT, even if the industry fits perfectly.
       - Example: If max is 50 and company has 300 (e.g. Mercadona Tech, Glovo), REJECT IT.
    2. Ignore companies that are clearly completely different (e.g. if looking for Tech, ignore Restaurants).

    Companies:
    ${companies.map(c => `- ID: ${c.id} | Name: ${c.name} | Domain: ${c.domain || "N/A"}`).join("\n")}

    Return a JSON object with a "matches" array containing ONLY the companies that match (Score > 40).
    Format:
    {
        "matches": [
            {
                "id": "company_id",
                "score": 85,
                "reason": ["Industry Fit", "Size ~30 employees"]
            }
        ]
    }
    `

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        })

        const content = completion.choices[0].message.content
        if (!content) return []
        const result = JSON.parse(content)
        return result.matches || []
    } catch (e) {
        console.error("Batch AI Analysis failed:", e)
        return []
    }
}

export async function matchNetworkToICP(): Promise<{ matches: MatchResult[], totalAnalyzed: number, error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { matches: [], totalAnalyzed: 0, error: "Unauthorized" }

    // 1. Get ICP Definition
    const { data: icp } = await supabase
        .from("icp_definitions")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (!icp) return { matches: [], totalAnalyzed: 0, error: "No ICP defined" }

    // 2. Get Network Data
    const { data: connections } = await supabase
        .from("user_connections")
        .select("id, company_name, company_domain, relationship_strength, key_contacts, contact_count")
        .eq("user_id", user.id)

    if (!connections || connections.length === 0) return { matches: [], totalAnalyzed: 0 }

    // 3. Batch Processing
    const BATCH_SIZE = 50
    const companyList = connections.map(c => ({
        id: c.id,
        name: c.company_name,
        domain: c.company_domain
    }))

    const chunks = []
    for (let i = 0; i < companyList.length; i += BATCH_SIZE) {
        chunks.push(companyList.slice(i, i + BATCH_SIZE))
    }

    // Run AI in parallel (limited concurrency could be better but let's try parallel for speed)
    // Note: With 1500 contacts -> 30 calls. It might take ~30-60s.
    const results = await Promise.all(chunks.map(chunk => analyzeBatchWithAI(chunk, icp)))

    // Flatten results
    const aiMatchesMap = new Map()
    results.flat().forEach((m: any) => {
        if (m && m.id) aiMatchesMap.set(m.id, m)
    })

    // 4. Build Final Results AND Persist
    const matches: MatchResult[] = []

    // Prepare update payloads
    const updates = []

    for (const conn of connections) {
        const aiMatch = aiMatchesMap.get(conn.id)
        let score = 0
        let criteria: string[] = []
        let type: MatchResult["matchType"] = "No ICP"

        // Base inclusion: AI Match OR Very Strong Connection (VIP)
        if (aiMatch || conn.relationship_strength === 5) {
            score = aiMatch ? aiMatch.score : 0
            criteria = aiMatch ? aiMatch.reason : []

            // Add points for relationship strength
            if (conn.relationship_strength >= 4) {
                score = Math.min(100, score + 10)
                criteria.push("Strong Relationship")
            }

            // Classification
            if (score >= 75) type = "ICP Match"
            else if (score >= 40) type = "ICP Parcial"

            // Force VIPs to be at least partial
            if (conn.relationship_strength === 5 && type === "No ICP") {
                type = "ICP Parcial"
                score = 50
                criteria.push("VIP Connection")
            }

            if (type !== "No ICP") {
                matches.push({
                    companyName: conn.company_name,
                    matchScore: score,
                    matchType: type,
                    matchingCriteria: criteria,
                    missingCriteria: [], // AI doesn't return missing, we imply it
                    source: "Network",
                    connectionStrength: conn.relationship_strength
                })

                // Add to updates
                // IMPORTANT: Upsert requires non-nullable fields if it decides to insert,
                // or if it replaces the row. Include company_name etc to be safe.
                updates.push({
                    id: conn.id,
                    user_id: user.id,
                    company_name: conn.company_name, // Required
                    contact_count: conn.contact_count, // Likely required
                    relationship_strength: conn.relationship_strength,
                    icp_match_score: score,
                    icp_match_reason: criteria,
                    icp_match_type: type,
                    icp_last_analyzed: new Date().toISOString()
                })
            }
        }
    }

    // Persist updates in batch
    if (updates.length > 0) {
        // Use Admin client to bypass any potential RLS on update
        const { error: updateError } = await supabaseAdmin
            .from("user_connections")
            .upsert(updates, { onConflict: "id" })

        if (updateError) {
            console.error("Error saving ICP matches:", updateError)
        }
    }

    return { matches: matches.sort((a, b) => b.matchScore - a.matchScore), totalAnalyzed: connections.length }
}

export async function seedDemoNetwork(userId: string) {
    const supabase = await createClient()

    // Sample Connections
    const connections = [
        {
            user_id: userId,
            company_name: "TechCorp SA",
            company_domain: "techcorp.com",
            relationship_strength: 5,
            contact_count: 3,
            connection_type: "ex-colleague",
            source: "manual",
            key_contacts: [{ name: "Juan Pérez", title: "CTO", relationship: "ex-colleague" }]
        },
        {
            user_id: userId,
            company_name: "Global Banks Old",
            company_domain: "globalbanks.com",
            relationship_strength: 2,
            contact_count: 1,
            connection_type: "client",
            source: "linkedin",
            key_contacts: [{ name: "Maria Garcia", title: "Procurement", relationship: "client" }]
        },
        {
            user_id: userId,
            company_name: "Innovate AI",
            company_domain: "innovate.ai",
            relationship_strength: 4,
            contact_count: 2,
            connection_type: "investor",
            source: "inferred",
            key_contacts: [{ name: "Alex Chen", title: "Founder", relationship: "investor" }]
        },
        {
            user_id: userId,
            company_name: "Retail Giant",
            company_domain: "retailgiant.com",
            relationship_strength: 1,
            contact_count: 5,
            connection_type: "other",
            source: "linkedin",
        }
    ]

    // Upsert to avoid duplicates but refresh data
    for (const conn of connections) {
        await supabase.from("user_connections").upsert(conn, { onConflict: "user_id, company_name" })
    }
}

export async function getStoredNetworkMatches(page: number = 1, limit: number = 10): Promise<{ matches: MatchResult[], totalAnalyzed: number, totalCount: number }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { matches: [], totalAnalyzed: 0, totalCount: 0 }

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get Data
    const { data: connections, count } = await supabase
        .from("user_connections")
        .select("id, company_name, relationship_strength, icp_match_score, icp_match_reason, icp_match_type, icp_last_analyzed", { count: 'exact' })
        .eq("user_id", user.id)
        .not('icp_match_type', 'is', null)
        .order('icp_match_score', { ascending: false })
        .range(from, to)

    if (!connections) return { matches: [], totalAnalyzed: 0, totalCount: 0 }

    const matches: MatchResult[] = connections.map(conn => ({
        companyName: conn.company_name,
        matchScore: conn.icp_match_score || 0,
        matchType: (conn.icp_match_type as any) || "No ICP",
        matchingCriteria: conn.icp_match_reason || [],
        missingCriteria: [],
        source: "Network",
        connectionStrength: conn.relationship_strength
    }))

    return { matches, totalAnalyzed: count || 0, totalCount: count || 0 }
}
