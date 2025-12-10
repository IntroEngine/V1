import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Server-side admin client
// Fallback to placeholder to prevent build-time crash if envs are missing
const adminUrl = env.SUPABASE_URL || 'https://placeholder.supabase.co';
const adminKey = env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export const supabaseAdmin = createClient(adminUrl, adminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Client-side/Anon client (for use if needed in utils, though usually hooks are used in components)
const clientUrl = env.SUPABASE_URL || 'https://placeholder.supabase.co';
const clientKey = env.SUPABASE_ANON_KEY || 'placeholder';

export const supabaseClient = createClient(clientUrl, clientKey);
