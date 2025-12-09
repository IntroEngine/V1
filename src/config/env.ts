export const env = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    HUBSPOT_ACCESS_TOKEN: process.env.HUBSPOT_ACCESS_TOKEN || '',
    // Add other secrets here
};

// Simple validation
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY'];
if (typeof window === 'undefined') { // Only check on server
    const missing = required.filter(key => !process.env[key] && !process.env[`NEXT_PUBLIC_${key}`]); // Simplified check
    if (missing.length > 0) {
        console.warn(`[Config] Missing environment variables: ${missing.join(', ')}`);
    }
}
