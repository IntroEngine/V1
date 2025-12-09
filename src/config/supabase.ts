import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Server-side admin client
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Client-side/Anon client (for use if needed in utils, though usually hooks are used in components)
export const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
