
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

try {
    const content = fs.readFileSync('.env.local', 'utf8');

    // Simple parser
    const env = {};
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });

    const url = env['NEXT_PUBLIC_SUPABASE_URL'];
    const key = env['SUPABASE_SERVICE_ROLE_KEY'];

    console.log('URL:', url);
    console.log('Key found:', !!key, key ? key.substring(0, 5) + '...' : '');

    if (!url || !key) {
        console.error('Missing credentials');
        process.exit(1);
    }

    const supabase = createClient(url, key);

    async function test() {
        console.log('Testing connection...');
        const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Supabase Connection OK. Data:', data); // data is null for count with head:true usually
        }
    }

    test();

} catch (e) {
    console.error('Error:', e);
}
