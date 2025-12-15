
-- Add unique constraint on user_id and company_name to prospects table
-- This allows upserting companies by name when domain is unknown (e.g. from LinkedIn import)

ALTER TABLE prospects
ADD CONSTRAINT prospects_user_id_company_name_key UNIQUE (user_id, company_name);
