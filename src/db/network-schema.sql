-- ============================================
-- MI RED / MY NETWORK - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: user_profiles
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Professional Info
  current_company TEXT,
  current_title TEXT,
  current_location TEXT,
  
  -- Historical Data (JSONB for flexibility)
  past_companies JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"company": "Microsoft", "title": "PM", "start": "2018", "end": "2020"}]
  
  -- Expertise
  industries_expertise TEXT[] DEFAULT '{}',
  -- Example: ['SaaS', 'B2B', 'Enterprise']
  
  strengths_tags TEXT[] DEFAULT '{}',
  -- Example: ['Sales', 'Product', 'Engineering']
  
  -- Metadata
  profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness BETWEEN 0 AND 100),
  linkedin_imported BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_industries ON user_profiles USING GIN(industries_expertise);
CREATE INDEX idx_user_profiles_completeness ON user_profiles(profile_completeness);

-- ============================================
-- TABLE: user_work_history
-- ============================================
CREATE TABLE user_work_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company Info
  company_name TEXT NOT NULL,
  company_domain TEXT,
  company_industry TEXT,
  
  -- Role Info
  title TEXT NOT NULL,
  seniority TEXT CHECK (seniority IN ('C-Level', 'VP', 'Director', 'Manager', 'IC')),
  
  -- Dates
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  
  -- Additional
  description TEXT,
  achievements TEXT[] DEFAULT '{}',
  
  -- Metadata
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'linkedin', 'hubspot')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (end_date IS NULL OR end_date >= start_date),
  CHECK (is_current = false OR end_date IS NULL)
);

-- Indexes
CREATE INDEX idx_work_history_user_id ON user_work_history(user_id);
CREATE INDEX idx_work_history_company ON user_work_history(company_name);
CREATE INDEX idx_work_history_dates ON user_work_history(user_id, start_date, end_date);
CREATE INDEX idx_work_history_current ON user_work_history(user_id, is_current) WHERE is_current = true;

-- ============================================
-- TABLE: user_connections
-- ============================================
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Connection Info
  company_name TEXT NOT NULL,
  company_domain TEXT,
  
  -- Relationship Strength (1-5)
  relationship_strength INTEGER NOT NULL CHECK (relationship_strength BETWEEN 1 AND 5),
  -- 5 = Very Strong (ex-colleague, close friend)
  -- 4 = Strong (worked together, regular contact)
  -- 3 = Medium (met several times, occasional contact)
  -- 2 = Weak (met once or twice)
  -- 1 = Very Weak (LinkedIn connection only)
  
  -- Contact Details (Optional)
  contact_count INTEGER DEFAULT 0 CHECK (contact_count >= 0),
  key_contacts JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"name": "John Doe", "title": "VP Sales", "relationship": "ex-colleague"}]
  
  -- Context
  connection_type TEXT CHECK (connection_type IN ('ex-colleague', 'client', 'vendor', 'investor', 'other')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'linkedin', 'inferred')),
  last_interaction_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, company_name)
);

-- Indexes
CREATE INDEX idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX idx_user_connections_company ON user_connections(company_name);
CREATE INDEX idx_user_connections_strength ON user_connections(relationship_strength);
CREATE INDEX idx_user_connections_type ON user_connections(connection_type);

-- ============================================
-- TABLE: linkedin_imports
-- ============================================
CREATE TABLE linkedin_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Raw Data
  raw_positions JSONB DEFAULT '[]'::jsonb,
  raw_connections JSONB DEFAULT '[]'::jsonb,
  
  -- Processed Data
  processed_companies TEXT[] DEFAULT '{}',
  processed_contacts_count INTEGER DEFAULT 0,
  
  -- Processing Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Metadata
  file_name TEXT,
  file_size INTEGER,
  import_type TEXT CHECK (import_type IN ('positions', 'connections', 'full')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_linkedin_imports_user_id ON linkedin_imports(user_id);
CREATE INDEX idx_linkedin_imports_status ON linkedin_imports(status);
CREATE INDEX idx_linkedin_imports_created ON linkedin_imports(created_at DESC);

-- ============================================
-- TABLE: inferred_relationships
-- ============================================
CREATE TABLE inferred_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Inference Details
  target_company TEXT NOT NULL,
  bridge_company TEXT, -- Company that creates the connection
  
  -- Inference Logic
  inference_type TEXT NOT NULL CHECK (inference_type IN ('ALUMNI', 'INDUSTRY', 'GEOGRAPHY', 'MUTUAL_CONNECTION')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  reasoning TEXT,
  
  -- Supporting Data
  supporting_data JSONB DEFAULT '{}'::jsonb,
  -- Example: {"overlap_years": 2, "same_department": true, "mutual_contacts": 5}
  
  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiry for stale inferences
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_inferred_relationships_user_id ON inferred_relationships(user_id);
CREATE INDEX idx_inferred_relationships_target ON inferred_relationships(target_company);
CREATE INDEX idx_inferred_relationships_score ON inferred_relationships(confidence_score);
CREATE INDEX idx_inferred_relationships_type ON inferred_relationships(inference_type);
CREATE INDEX idx_inferred_relationships_active ON inferred_relationships(user_id, is_active) WHERE is_active = true;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inferred_relationships ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for user_work_history
CREATE POLICY "Users can view own work history"
  ON user_work_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work history"
  ON user_work_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work history"
  ON user_work_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own work history"
  ON user_work_history FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_connections
CREATE POLICY "Users can view own connections"
  ON user_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON user_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON user_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON user_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for linkedin_imports
CREATE POLICY "Users can view own imports"
  ON linkedin_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imports"
  ON linkedin_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for inferred_relationships
CREATE POLICY "Users can view own inferred relationships"
  ON inferred_relationships FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_work_history_updated_at
  BEFORE UPDATE ON user_work_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile RECORD;
  work_count INTEGER;
  conn_count INTEGER;
BEGIN
  SELECT * INTO profile FROM user_profiles WHERE user_id = p_user_id;
  
  IF profile IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Current company (20 points)
  IF profile.current_company IS NOT NULL THEN
    score := score + 20;
  END IF;
  
  -- Current title (10 points)
  IF profile.current_title IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Industries (15 points)
  IF array_length(profile.industries_expertise, 1) > 0 THEN
    score := score + 15;
  END IF;
  
  -- Strengths (10 points)
  IF array_length(profile.strengths_tags, 1) > 0 THEN
    score := score + 10;
  END IF;
  
  -- Work history (25 points)
  SELECT COUNT(*) INTO work_count FROM user_work_history WHERE user_id = p_user_id;
  IF work_count >= 2 THEN
    score := score + 25;
  ELSIF work_count = 1 THEN
    score := score + 15;
  END IF;
  
  -- Connections (20 points)
  SELECT COUNT(*) INTO conn_count FROM user_connections WHERE user_id = p_user_id;
  IF conn_count >= 5 THEN
    score := score + 20;
  ELSIF conn_count >= 2 THEN
    score := score + 10;
  ELSIF conn_count >= 1 THEN
    score := score + 5;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Uncomment to insert sample data
/*
INSERT INTO user_profiles (user_id, current_company, current_title, current_location, industries_expertise, strengths_tags)
VALUES (
  'auth_user_id_here',
  'TechCorp SA',
  'VP of Product',
  'Madrid, Spain',
  ARRAY['SaaS', 'B2B', 'Enterprise'],
  ARRAY['Product', 'Sales', 'Strategy']
);
*/

-- ============================================
-- TABLE: icp_definitions
-- ============================================
CREATE TABLE icp_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core Definition
  target_industries TEXT[] DEFAULT '{}',
  company_size_min INTEGER,
  company_size_max INTEGER,
  target_technologies TEXT[] DEFAULT '{}',
  digital_maturity TEXT CHECK (digital_maturity IN ('Low', 'Medium', 'High', 'Any')),
  target_locations TEXT[] DEFAULT '{}',
  
  -- Roles & Personas
  key_roles TEXT[] DEFAULT '{}', -- e.g. ["CTO", "VP Engineering"]
  
  -- Strategy
  pain_points TEXT,
  opportunity_triggers TEXT,
  anti_icp_criteria TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id) -- Enforce 1 ICP per user for now
);

-- Indexes
CREATE INDEX idx_icp_definitions_user_id ON icp_definitions(user_id);

-- RLS
ALTER TABLE icp_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ICP"
  ON icp_definitions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ICP"
  ON icp_definitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ICP"
  ON icp_definitions FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_icp_definitions_updated_at
  BEFORE UPDATE ON icp_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: prospects (Layer 3: Outbound/AI)
-- ============================================
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  company_name TEXT NOT NULL,
  domain TEXT,
  
  icp_score INTEGER,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected')),
  
  -- Extended Company Profile
  industry TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  
  -- HubSpot Sync
  hubspot_id TEXT,
  hubspot_synced_at TIMESTAMPTZ,
  
  topics_detected TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'ai_expansion',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, domain)
);

CREATE INDEX idx_prospects_user_id ON prospects(user_id);
CREATE INDEX idx_prospects_status ON prospects(status);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prospects" ON prospects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prospects" ON prospects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prospects" ON prospects FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

