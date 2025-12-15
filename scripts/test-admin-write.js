
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!adminUrl || !adminKey) {
    console.error('Missing credentials for test.');
    process.exit(1);
}

const supabaseAdmin = createClient(adminUrl, adminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testWrite() {
    console.log('Testing Admin Write...');

    // 1. Get a connection ID
    const { data: conn, error: fetchError } = await supabaseAdmin
        .from('user_connections')
        .select('id')
        .limit(1)
        .single();

    if (fetchError || !conn) {
        console.error('Could not fetch a connection to test update on:', fetchError);
        return;
    }

    console.log('Found connection ID:', conn.id);

    // 2. Try to update it
    const { error: updateError } = await supabaseAdmin
        .from('user_connections')
        .upsert({
            id: conn.id,
            icp_match_score: 99, // Test value
            icp_match_type: 'ICP Match',
            icp_last_analyzed: new Date().toISOString()
        }, { onConflict: 'id' });

    if (updateError) {
        console.error('Admin Update FAILED:', updateError);
    } else {
        console.log('Admin Update SUCCESS.');
    }
}

testWrite();
