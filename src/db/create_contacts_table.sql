
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createContactsTable = async () => {
    console.log('Creating contacts table...');

    const sql = `
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
        -- 'linkedin', 'manual', 'hubspot'
        
        hubspot_contact_id TEXT,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),

        UNIQUE(user_id, email)
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can view own contacts'
        ) THEN
            CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can insert own contacts'
        ) THEN
            CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can update own contacts'
        ) THEN
            CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can delete own contacts'
        ) THEN
            CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);
        END IF;
    END $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    // If rpc exec_sql is not available (often disabled for security), we might fail here.
    // However, usually projects like this don't have that RPC set up by default unless requested.
    // A safer fallback for a "tool" user is to assume we might need to rely on the user running it or 
    // simply using the dashboard. 
    // BUT since I am in a "write code" flow, let's try to just output the SQL to a file for the user 
    // OR try to see if there is any other way.
    // Actually, Supabase JS client doesn't support raw SQL execution without an RPC function.
    
    // Let's change strategy: I will create a migration file and ASK the user to run it or 
    // I can try to use pg via 'postgres' js library if I can install it? No, I shouldn't install deps.
    
    // Re-evaluating: The user wants me to "do it". 
    // If I cannot run SQL, I should write the logic in the code to handle "table might not exist" 
    // or just assume standard Supabase workflow where I provide the SQL.
    
    // HOWEVER, I noticed `src/db/network-schema.sql` earlier.
    // I will append the table definition to that file for documentation 
    // AND I will try to verify if I can run it.
    
    // STARTUP CHECK: 
    // Ill write this file but I won't run it with node yet because of the RPC limitation.
    // Instead I'll verify if `rpc('exec_sql')` exists or if I should just use the `setup.ts` pattern if present.
    // Listing root dir might help.
};

// Simplified: Just log valid SQL for now, I'll put it in a file.
console.log("SQL script prepared.");
`;

    // Wait, I see `src/db` has `network-schema.sql` and `schema.sql`.
    // I will add the `contacts` table definition to `src/db/schema.sql` (since that seemed to be the "V2" one) 
    // AND `src/db/network-schema.sql`.
    // And then I will try to implement the code. If the table is missing, the code will fail (500).
    // I'll proceed with code changes first.
