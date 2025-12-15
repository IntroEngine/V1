
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createContactsTable() {
    console.log('Attempting to create contacts table...');

    // We cannot run raw SQL easily without extensions. 
    // However, we can try to use the REST API to check if table exists by selecting from it.
    const { error: checkError } = await supabase.from('contacts').select('count', { count: 'exact', head: true });

    if (!checkError) {
        console.log('Contacts table already exists.');
        return;
    }

    console.log('Contacts table missing. Please run the following SQL in your Supabase SQL Editor:');
    console.log(`
    CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        company_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        linkedin_url TEXT,
        phone TEXT,
        title TEXT,
        role TEXT,
        source TEXT DEFAULT 'manual', 
        hubspot_contact_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, email)
    );
    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);
    `);
}

createContactsTable();
