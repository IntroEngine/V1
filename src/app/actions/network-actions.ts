"use server"

import { matchNetworkToICP, seedDemoNetwork, getStoredNetworkMatches } from "@/services/icp-matching-service"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function runNetworkAnalysis() {
    return await matchNetworkToICP()
}

export async function getSavedAnalysis(page: number = 1, limit: number = 10) {
    return await getStoredNetworkMatches(page, limit)
}

export async function seedNetworkData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        await seedDemoNetwork(user.id)
        revalidatePath("/icp-target")
        return { success: true }
    }
    return { error: "Unauthorized" }
}
