
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Checking user_connections columns...');

    // Check for data
    const { count, error } = await supabase
        .from('user_connections')
        .select('*', { count: 'exact', head: true })
        .not('icp_match_score', 'is', null);

    if (error) {
        console.error('Error counting:', error.message);
    } else {
        console.log(`Found ${count} records with icp_match_score.`);
    }
}

checkColumns();
