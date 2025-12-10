"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type ICPFormData = {
    target_industries: string[]
    company_size_min?: number
    company_size_max?: number
    target_technologies: string[]
    digital_maturity: "Low" | "Medium" | "High" | "Any"
    target_locations: string[]
    key_roles: string[]
    pain_points?: string
    opportunity_triggers?: string
    anti_icp_criteria?: string
}

export async function saveICPDefinition(data: ICPFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Utterly unauthorized" }
    }

    try {
        const { error } = await supabase
            .from("icp_definitions")
            .upsert({
                user_id: user.id,
                ...data,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "user_id"
            })

        if (error) throw error

        revalidatePath("/icp-target")
        return { success: true }
    } catch (e) {
        console.error("Error saving ICP:", e)
        return { error: "Failed to save ICP definition" }
    }
}

export async function getICPDefinition() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from("icp_definitions")
        .select("*")
        .eq("user_id", user.id)
        .single()

    return data
}
