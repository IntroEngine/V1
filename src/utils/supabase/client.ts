import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/env'

export function createClient() {
    return createBrowserClient(
        env.SUPABASE_URL || 'https://placeholder.supabase.co',
        env.SUPABASE_ANON_KEY || 'placeholder'
    )
}
