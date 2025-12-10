
import { createClient } from "@/utils/supabase/server"

type MatchResult = {
    companyName: string
    matchScore: number // 0-100
    matchType: "ICP Match" | "ICP Parcial" | "No ICP"
    matchingCriteria: string[] // e.g. ["Industry", "Size"]
    missingCriteria: string[] // e.g. ["Location"]
    source: "Network" | "Work History"
    connectionStrength?: number
}

export async function matchNetworkToICP(): Promise<{ matches: MatchResult[], error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { matches: [], error: "Unauthorized" }

    // 1. Get ICP Definition
    const { data: icp } = await supabase
        .from("icp_definitions")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (!icp) return { matches: [], error: "No ICP defined" }

    // 2. Get Network Data (Connections)
    // Note: In a real scenario, we might need to join with a 'companies' table if normalized.
    // For now, we assume user_connections contains enough info or we match loosely.
    const { data: connections } = await supabase
        .from("user_connections")
        .select("*")
        .eq("user_id", user.id)

    // 3. Simple Matching Logic (Heuristic)
    // Since we lack deep enriched data on every connection in this schema version,
    // we will simulate the matching logic based on available strings.
    // In production, this would query a Company Database.

    const matches: MatchResult[] = []

    if (!connections) return { matches: [] }

    for (const conn of connections) {
        let score = 0
        const criteria = []
        const missing = []

        // Mock check - in reality, we'd check conn.company_industry vs icp.target_industries
        // But user_connections schema doesn't have 'industry' yet (it's in work_history).
        // Let's assume we can fetch it or we're just stubbing the logic structure.

        // --- LOGIC STUB ---
        // If company name contains "Tech" or "SaaS" -> Industry Match (Example)
        const isTech = conn.company_name.toLowerCase().includes("tech") || conn.company_name.toLowerCase().includes("soft");
        const industryMatch = icp.target_industries?.some((ind: string) => ind.toLowerCase() === "saas" || ind.toLowerCase() === "tech")

        if (isTech && industryMatch) {
            score += 50
            criteria.push("Industry")
        } else {
            missing.push("Industry")
        }

        // Final Classification
        let type: MatchResult["matchType"] = "No ICP"
        if (score >= 80) type = "ICP Match"
        else if (score >= 40) type = "ICP Parcial"

        if (type !== "No ICP") {
            matches.push({
                companyName: conn.company_name,
                matchScore: score,
                matchType: type,
                matchingCriteria: criteria,
                missingCriteria: missing,
                source: "Network",
                connectionStrength: conn.relationship_strength
            })
        }
    }

    return { matches: matches.sort((a, b) => b.matchScore - a.matchScore) }
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
