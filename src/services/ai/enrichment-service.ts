"use server"

import { createClient } from "@/utils/supabase/server"
import { openai } from "@/lib/openai"
import { getICPDefinition } from "@/app/actions/icp-actions"

export type ProspectRecommendation = {
    name: string
    domain: string
    industry: string
    topics: string[]
    score: number
    reason: string
}

export async function findLookalikes(): Promise<{ prospects: ProspectRecommendation[], error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        // 1. Get real ICP
        const icp = await getICPDefinition()
        if (!icp) throw new Error("No ICP defined. Please configure your ICP first.")

        // 2. Get Existing Network to Exclude
        // We shouldn't suggest companies the user already knows!
        const { data: network } = await supabase
            .from("user_connections")
            .select("company_name, company_domain")
            .eq("user_id", user.id)
            .limit(500) // Increased limit

        // Also exclude already saved prospects
        const { data: existingProspects } = await supabase
            .from("prospects")
            .select("domain")
            .eq("user_id", user.id)

        const networkDomains = new Set(network?.map(n => n.company_domain?.toLowerCase()).filter(Boolean));
        const prospectDomains = new Set(existingProspects?.map(p => p.domain?.toLowerCase()).filter(Boolean));

        const excludedCompanies = network?.map(n => n.company_name).slice(0, 50).join(", ") || "";

        // 3. Prepare Prompt
        const prompt = `
        Act as a B2B Sales Prospecting Agent.
        The user has defined their Ideal Customer Profile (ICP) as follows:
        - Target Industries: ${icp.target_industries?.join(", ") || "Any"}
        - Target Locations: ${icp.target_locations?.join(", ") || "Global"}
        - Company Size: ${icp.company_size_min || 0} - ${icp.company_size_max || "Unlimited"} employees
        - Key Roles: ${icp.key_roles?.join(", ")}
        - Tech Stack: ${icp.target_technologies?.join(", ") || "N/A"}
        - Pain Points: ${icp.pain_points || "N/A"}
        - Exclusions (Anti-ICP): ${icp.anti_icp_criteria || "None"}

        IMPORTANT EXCLUSIONS:
        The user ALREADY knows these companies, so DO NOT suggest them:
        [${excludedCompanies}]
        
        TASK:
        Generate a list of 5 REAL, HIGH-QUALITY companies that fit this ICP perfectly/lookalikes but are NOT in the exclusion list above.
        Focus on finding "Lookalikes" - companies that look similar to the best companies in the target industries.
        Do NOT invent companies. Use real famous or well-known startups/companies that fit the description.

        Return strictly valid JSON in this format:
        {
            "prospects": [
                {
                    "name": "Company Name",
                    "domain": "company.com",
                    "industry": "Industry",
                    "topics": ["Reason 1", "Reason 2"],
                    "score": 95,
                    "reason": "Why this is a good match"
                }
            ]
        }
        `

        // 4. Call OpenAI
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
            temperature: 0.7
        })

        const content = completion.choices[0].message.content
        if (!content) throw new Error("No content from AI")

        const result = JSON.parse(content)
        let prospects: ProspectRecommendation[] = result.prospects || []

        // Post-filtering
        prospects = prospects.filter(p => {
            const d = p.domain?.toLowerCase();
            return d && !networkDomains.has(d) && !prospectDomains.has(d);
        });

        return { prospects }
    } catch (e: any) {
        console.error("AI Enrichment Failed:", e)
        return { prospects: [], error: e.message || "Failed to generate AI recommendations" }
    }
}

import { supabaseAdmin } from "@/config/supabase"

// ... (findLookalikes remains the same, I will just target the import section and the function)

export async function saveProspect(prospect: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // Validate essential fields
    if (!prospect.name) return { error: "Missing company name" };

    const { error } = await supabaseAdmin
        .from("prospects")
        .upsert({
            user_id: user.id,
            company_name: prospect.name,
            domain: prospect.domain, // inferred logic might make this empty string if missing?
            icp_score: prospect.score,
            topics_detected: prospect.topics || [],
            status: "new",
            source: 'ai_expansion'
        }, { onConflict: "user_id, domain" })

    if (error) {
        console.error("Error saving prospect:", error)
        return { error: error.message }
    }

    return { success: true }
}
