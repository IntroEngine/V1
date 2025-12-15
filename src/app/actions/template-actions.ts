"use server"

import { createClient } from "@/utils/supabase/server"
import { TemplateService } from "@/services/ai/template-service"

export async function generateActionTemplate(opportunityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // 1. Fetch User Context (Profile) - Do this first as it's common
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, job_title, company_name")
        .eq("id", user.id)
        .single()

    const userContext = profile
        ? `${profile.full_name} (${profile.job_title} at ${profile.company_name})`
        : "A professional contact"

    // 2. Try to find in Inferred Relationships (Intro)
    // Note: inferred_relationships usually stores 'supporting_data' jsonb with bridge contact info
    const { data: introOpp } = await supabase
        .from("inferred_relationships")
        .select("*")
        .eq("id", opportunityId)
        .single()

    if (introOpp) {
        // IT IS AN INTRO OPPORTUNITY
        const targetCompany = introOpp.target_company

        // Extract Bridge Contact from supporting_data
        let bridgeName = "Unknown Connection"
        if (introOpp.supporting_data && introOpp.supporting_data.bridge_contact) {
            const c = introOpp.supporting_data.bridge_contact
            bridgeName = c.name || c.firstName || "Friend"
        }

        // Target Contact is usually generic or in target_contact logic? 
        // For inferred, we might not have a specific target contact yet, or it's implicitly "Key Decision Maker"
        // Let's use a placeholder if not present.
        const targetName = "Decision Maker"
        const reason = introOpp.reasoning || "Explore synergies"

        const content = await TemplateService.generateIntroRequest(
            bridgeName,
            targetName,
            targetCompany,
            userContext,
            reason
        )
        return { content }
    }

    // 3. Try to find in Prospects (Outbound)
    const { data: prospect } = await supabase
        .from("prospects")
        .select("*")
        .eq("id", opportunityId)
        .single()

    if (prospect) {
        // IT IS AN TOUBOUND OPPORTUNITY
        const targetCompany = prospect.company_name
        const targetName = "Key Contact" // Prospects might not have a contact person attached yet
        const valueProp = prospect.description || "We help companies improve their network reach."

        const content = await TemplateService.generateColdMessage(
            targetName,
            targetCompany,
            userContext,
            valueProp
        )
        return { content }
    }

    return { error: "Opportunity not found (ID does not match Intro or Prospect)" }
}
