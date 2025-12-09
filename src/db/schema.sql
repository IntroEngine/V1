-- ==============================================================================
-- INTROENGINE V2 - INITIAL SCHEMA (SUPABASE/POSTGRES)
-- Multi-tenant architecture (account_id based)
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 0. UTILITIES & TRIGGERS
-- ==============================================================================

-- Function to automatically update 'updated_at' timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- 1. ACCOUNTS (Tenants)
-- Represents a customer/business entity using the SaaS.
-- ==============================================================================
create table public.accounts (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    domain text,
    industry text,
    employee_range text,
    plan text default 'standard', -- e.g., 'free', 'standard', 'enterprise'
    is_active boolean default true,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Trigger for updated_at
create trigger update_accounts_updated_at
before update on public.accounts
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- 2. USERS
-- Users belonging to an account. Linked to Supabase Auth in future via 'auth_user_id' if needed.
-- ==============================================================================
create table public.users (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    email text unique not null,
    full_name text not null,
    role text default 'member', -- 'admin', 'member', 'viewer'
    is_active boolean default true,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_users_account_id on public.users(account_id);
create index idx_users_email on public.users(email);

-- Trigger for updated_at
create trigger update_users_updated_at
before update on public.users
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- 3. COMPANIES (Targets)
-- The B2B target companies the account wants to sell to.
-- ==============================================================================
create table public.companies (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    
    name text not null,
    website text,
    domain text,
    country text,
    industry text,
    size_bucket text, -- '1-10', '11-50', '51-200', etc.
    source text default 'manual', -- 'import', 'hubspot', 'manual'
    status text default 'new', -- 'new', 'qualified', 'open', 'closed'
    hubspot_company_id text,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_companies_account_id on public.companies(account_id);
create index idx_companies_domain on public.companies(domain);
create index idx_companies_status on public.companies(status);

-- Trigger for updated_at
create trigger update_companies_updated_at
before update on public.companies
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- 4. CONTACTS
-- People network. Can be Bridges (my network) or Targets (prospects).
-- ==============================================================================
create table public.contacts (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    company_id uuid references public.companies(id) on delete set null,
    
    full_name text not null,
    email text,
    linkedin_url text,
    role_title text,
    seniority text, -- 'C-Level', 'VP', 'Director', 'Manager', 'IC'
    type text not null default 'unknown', -- 'bridge' (my network), 'target' (prospect), 'unknown'
    source text default 'manual',
    hubspot_contact_id text,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_contacts_account_id on public.contacts(account_id);
create index idx_contacts_company_id on public.contacts(company_id);
create index idx_contacts_type on public.contacts(type);
create index idx_contacts_email on public.contacts(email);

-- Trigger for updated_at
create trigger update_contacts_updated_at
before update on public.contacts
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- 5. CONTACT RELATIONSHIPS (Graph)
-- Connects contacts to establish 1st or 2nd degree paths.
-- Contact 1 -> Knows -> Contact 2
-- ==============================================================================
create table public.contact_relationships (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    
    contact_id_1 uuid not null references public.contacts(id) on delete cascade,
    contact_id_2 uuid not null references public.contacts(id) on delete cascade,
    
    relationship_type text default 'knows', -- 'colleague', 'ex_colleague', 'friend', 'social'
    strength integer default 1 check (strength between 1 and 5),
    notes text,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Prevent duplicate edges in same direction (undirected graph logic usually handled in app or via double insert)
    constraint uq_contact_relationship unique (contact_id_1, contact_id_2)
);

-- Indexes
create index idx_relationships_account_id on public.contact_relationships(account_id);
create index idx_relationships_c1 on public.contact_relationships(contact_id_1);
create index idx_relationships_c2 on public.contact_relationships(contact_id_2);

-- Trigger for updated_at
create trigger update_contact_relationships_updated_at
before update on public.contact_relationships
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- 6. OPPORTUNITIES
-- The core output: Identified paths to a target company via a specific contact or outbound.
-- ==============================================================================
create table public.opportunities (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    
    company_id uuid not null references public.companies(id) on delete cascade,
    target_contact_id uuid references public.contacts(id) on delete set null, -- The prospect
    bridge_contact_id uuid references public.contacts(id) on delete set null, -- The connector (for Intros)
    
    type text not null, -- 'intro_direct', 'intro_second_degree', 'outbound_cold'
    status text default 'suggested', -- 'suggested', 'approved', 'contacted', 'meeting_booked', 'rejected'
    
    hubspot_deal_id text,
    
    suggested_intro_message text,
    suggested_outbound_message text,
    last_action_at timestamp with time zone,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_opportunities_account_id on public.opportunities(account_id);
create index idx_opportunities_company_id on public.opportunities(company_id);
create index idx_opportunities_status on public.opportunities(status);

-- Trigger for updated_at
create trigger update_opportunities_updated_at
before update on public.opportunities
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- 7. SCORES
-- AI-calculated metrics for prioritization. One-to-One with Opportunities usually.
-- ==============================================================================
create table public.scores (
    id uuid primary key default gen_random_uuid(),
    opportunity_id uuid not null references public.opportunities(id) on delete cascade unique,
    
    industry_fit_score integer default 0 check (industry_fit_score between 0 and 100),
    buying_signal_score integer default 0 check (buying_signal_score between 0 and 100),
    intro_strength_score integer default 0 check (intro_strength_score between 0 and 100),
    lead_potential_score integer default 0 check (lead_potential_score between 0 and 100),
    
    raw_metadata jsonb, -- AI reasoning or extra tags
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_scores_opportunity_id on public.scores(opportunity_id);

-- Trigger for updated_at
create trigger update_scores_updated_at
before update on public.scores
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- 8. ACTIVITY LOGS
-- Audit trail for actions.
-- ==============================================================================
create table public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    user_id uuid references public.users(id) on delete set null,
    opportunity_id uuid references public.opportunities(id) on delete set null,
    
    action_type text not null, -- 'login', 'sync_hubspot', 'generate_opps'
    payload jsonb,
    
    created_at timestamp with time zone default now()
);

-- Indexes
create index idx_activity_logs_account_id on public.activity_logs(account_id);
create index idx_activity_logs_created_at on public.activity_logs(created_at desc);


-- ==============================================================================
-- 9. SETTINGS
-- Per-account configuration.
-- ==============================================================================
create table public.settings (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade unique,
    
    primary_industry text,
    target_roles text[], -- PostgreSQL Array: ARRAY['CEO', 'CTO']
    avg_ticket_size numeric,
    sales_cycle_days integer,
    tone text default 'professional',
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Trigger for updated_at
create trigger update_settings_updated_at
before update on public.settings
for each row execute procedure update_updated_at_column();


-- ==============================================================================
-- RLS (ROW LEVEL SECURITY) TEMPLATES
-- ==============================================================================
-- 
-- Enable RLS on all tables:
-- alter table public.accounts enable row level security;
-- alter table public.users enable row level security;
-- ... etc
--
-- Example Policy: Users can only see data belonging to their account_id
-- 
-- create policy "Users view their own account data" on public.contacts
-- for select using (
--   account_id in (
--     select account_id from public.users where email = auth.email() -- or id = auth.uid() mapped
--   )
-- );
