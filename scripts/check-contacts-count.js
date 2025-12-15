
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkContacts() {
    console.log('Checking contacts table...');

    // Get total count
    const { count, error: countError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting contacts:', countError);
    } else {
        console.log(`Total contacts in DB: ${count}`);
    }

    // Check unique users
    const { data: users, error: userError } = await supabase
        .from('contacts')
        .select('user_id');

    if (userError) {
        console.error('Error fetching users:', userError);
    } else {
        const userIds = [...new Set(users.map(u => u.user_id))];
        console.log(`Unique User IDs in contacts: ${userIds.length}`);
        userIds.forEach(id => console.log(`- ${id}`));

        // Check connections for the first user
        if (userIds.length > 0) {
            const uId = userIds[0];
            const { count: connCount } = await supabase
                .from('user_connections')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', uId);
            console.log(`User ${uId} has ${connCount} connections in My Network`);
        }
    }
}

checkContacts().then(() => console.log('Done.')).catch(err => console.error(err));
