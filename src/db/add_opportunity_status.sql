-- Add status tracking to Inferred Relationships (Intros)
ALTER TABLE public.inferred_relationships 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Suggested';

-- Validate status values for Inferred Relationships
ALTER TABLE public.inferred_relationships 
DROP CONSTRAINT IF EXISTS inferred_relationships_status_check;

ALTER TABLE public.inferred_relationships 
ADD CONSTRAINT inferred_relationships_status_check 
CHECK (status IN ('Suggested', 'Requested', 'In Progress', 'Won', 'Lost'));

-- Ensure Prospects (Outbound) support these statuses
-- Prospects usually have 'new', 'contacted', 'replied', etc.
-- We will map them for consistency or allow the same set.

ALTER TABLE public.prospects 
DROP CONSTRAINT IF EXISTS prospects_status_check;

-- Extending prospects status to include pipeline stages
ALTER TABLE public.prospects 
ADD CONSTRAINT prospects_status_check 
CHECK (status IN ('new', 'contacted', 'replied', 'rejected', 'qualified', 'converted', 
                  'Suggested', 'Requested', 'In Progress', 'Won', 'Lost'));
