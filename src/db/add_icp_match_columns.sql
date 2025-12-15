ALTER TABLE user_connections
ADD COLUMN IF NOT EXISTS icp_match_score INTEGER,
ADD COLUMN IF NOT EXISTS icp_match_reason TEXT[], -- Stored as array of strings
ADD COLUMN IF NOT EXISTS icp_match_type TEXT,
ADD COLUMN IF NOT EXISTS icp_last_analyzed TIMESTAMP WITH TIME ZONE;
