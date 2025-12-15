'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOpportunityStatus(id: string, type: 'Intro' | 'Outbound', newStatus: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    try {
        if (type === 'Intro') {
            const { error } = await supabase
                .from('inferred_relationships')
                .update({ status: newStatus })
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
        } else {
            // Outbound (Prospects)
            // Map pipeline status to prospect status if needed, or store directly if verified
            const { error } = await supabase
                .from('prospects')
                .update({ status: newStatus })
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
        }

        revalidatePath('/opportunities')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Error updating opportunity status:", error)
        throw new Error("Failed to update status")
    }
}
