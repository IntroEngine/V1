
-- Create contacts table
DROP TABLE IF EXISTS contacts CASCADE;
CREATE TABLE contacts (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- RLS
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

-- Trigger for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload config';
