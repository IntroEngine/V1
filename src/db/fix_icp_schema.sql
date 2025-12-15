-- Add the missing column if it doesn't exist
ALTER TABLE icp_definitions 
ADD COLUMN IF NOT EXISTS digital_maturity TEXT CHECK (digital_maturity IN ('Low', 'Medium', 'High', 'Any'));

-- Reload PostgREST schema cache to ensure it sees the new column
NOTIFY pgrst, 'reload config';
