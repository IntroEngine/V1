
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

async function checkProspectsTable() {
    console.log('Checking prospects table columns...');

    // Try to select columns.
    const { data, error } = await supabase
        .from('prospects')
        .select('id, company_name, domain, icp_score, topics_detected, status')
        .limit(1);

    if (error) {
        console.error('Error selecting from prospects:', error.message);
    } else {
        console.log('Success! Columns exist.');
    }
}

checkProspectsTable();
