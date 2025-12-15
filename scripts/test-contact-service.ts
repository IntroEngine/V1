
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getContacts(userId: string) {
    console.log(`Fetching contacts for user: ${userId}`);
    const { data, error } = await supabaseAdmin
        .from('contacts')
        .select(`
            *,
            prospects (
                company_name,
                domain
            )
        `)
        .eq('user_id', userId)
        .limit(5); // Just fetch 5 to check structure

    if (error) {
        console.error('Error fetching contacts:', error);
    } else {
        console.log(`Fetched ${data?.length} contacts`);
        console.log('Sample contact:', JSON.stringify(data?.[0], null, 2));
    }
}

// Use the user ID found in the previous step
const TARGET_USER_ID = 'a2d31f72-6166-4cde-bd11-364f3e1c508c';
getContacts(TARGET_USER_ID);
