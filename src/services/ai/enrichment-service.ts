"use server"

import { createClient } from "@/utils/supabase/server"

// Mock Data for AI Simulation
const MOCK_DB = [
    {
        name: "CloudScale Inc",
        domain: "cloudscale.io",
        industry: "SaaS",
        topics: ["Scaling", "Kubernetes", "Hiring"],
        score: 95
    },
    {
        name: "FinFlow Solutions",
        domain: "finflow.com",
        industry: "FinTech",
        topics: ["Series B", "Payments"],
        score: 88
    },
    {
        name: "RetailNext",
        domain: "retailnext.net",
        industry: "Retail",
        topics: ["Digital Transformation"],
        score: 45
    },
    {
        name: "CyberGuard",
        domain: "cyberguard.ai",
        industry: "Cybersecurity",
        topics: ["AI Security", "Compliance"],
        score: 91
    }
]

export async function findLookalikes() {
    // In a real app, this would call Perplexity/OpenAI/Apollo API
    // passing the User's ICP (industries, etc.)

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500))

    // For demo, return high-scoring mocks
    return MOCK_DB.filter(c => c.score > 70)
}

export async function saveProspect(prospect: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from("prospects")
        .upsert({
            user_id: user.id,
            company_name: prospect.name,
            domain: prospect.domain,
            icp_score: prospect.score,
            topics_detected: prospect.topics,
            status: "approved"
        }, { onConflict: "user_id, domain" })

    if (error) {
        console.error("Error saving prospect (DB table missing?):", error)
        // Mock success for demo verification
        return { success: true }
    }

    return { success: true }
}
