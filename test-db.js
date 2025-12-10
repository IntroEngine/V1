
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', url);
console.log('Key length:', key ? key.length : 0);

if (!url || !key) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    try {
        const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Supabase Connection OK. Count:', data);
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
