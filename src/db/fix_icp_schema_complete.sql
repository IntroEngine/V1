-- Ensure all ICP columns exist to prevent further errors
ALTER TABLE icp_definitions 
ADD COLUMN IF NOT EXISTS target_industries TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company_size_min INTEGER,
ADD COLUMN IF NOT EXISTS company_size_max INTEGER,
ADD COLUMN IF NOT EXISTS target_technologies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS digital_maturity TEXT CHECK (digital_maturity IN ('Low', 'Medium', 'High', 'Any')),
ADD COLUMN IF NOT EXISTS target_locations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS key_roles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pain_points TEXT,
ADD COLUMN IF NOT EXISTS opportunity_triggers TEXT,
ADD COLUMN IF NOT EXISTS anti_icp_criteria TEXT;

-- Reload schema cache
NOTIFY pgrst, 'reload config';
