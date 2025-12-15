
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { count: cCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
    console.log(`Contacts Total: ${cCount}`);

    const { data: users } = await supabase.from('contacts').select('user_id').limit(1);
    if (users.length > 0) {
        const userId = users[0].user_id;
        console.log(`User: ${userId}`);
        const { count: ucCount } = await supabase.from('user_connections').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        console.log(`User Connections (My Network): ${ucCount}`);
    }
}

run().catch(console.error);
