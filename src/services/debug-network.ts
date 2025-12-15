
import { createClient } from "@/utils/supabase/server"

export async function debugNetworkData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return console.log("No user")

    const { data: connections } = await supabase
        .from("user_connections")
        .select("*")
        .limit(5)

    console.log("DEBUG CONNECTIONS:", JSON.stringify(connections, null, 2))

    const { data: icp } = await supabase
        .from("icp_definitions")
        .select("*")
        .eq("user_id", user.id)
        .single()

    console.log("DEBUG ICP:", JSON.stringify(icp, null, 2))
}
