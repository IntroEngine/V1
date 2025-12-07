-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Contacts Table (My Network)
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  linkedin_url text,
  current_company text,
  current_title text,
  -- Store past experience as JSONB: [{ company: "Google", title: "PM", start_year: 2020, end_year: 2022 }]
  past_companies jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Targets Table (ICP Companies)
create table targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  domain text,
  industry text,
  size_range text,
  icp_score integer default 0, -- 0 to 100
  created_at timestamp with time zone default now()
);

-- 3. Opportunities Table (The core findings)
create type intro_type as enum ('DIRECT', 'SECOND_LEVEL', 'INFERRED', 'OUTBOUND');

create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  target_id uuid references targets(id) not null,
  contact_id uuid references contacts(id), -- Nullable if OUTBOUND (no contact found)
  type intro_type not null,
  status text default 'new', -- new, contacted, meeting_booked, closed
  
  -- Scores (0-100)
  score_industry_fit integer default 0,
  score_buying_signal integer default 0,
  score_intro_strength integer default 0,
  score_lead_potential integer default 0,
  score_total integer default 0,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. Messages (Generated Outbound/Follow-ups)
create table messages (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references opportunities(id) on delete cascade not null,
  content text not null,
  flavor text, -- e.g., 'formal', 'casual', 'sales-heavy'
  created_at timestamp with time zone default now()
);

-- RLS Policies (Basic)
alter table contacts enable row level security;
alter table targets enable row level security;
alter table opportunities enable row level security;
alter table messages enable row level security;

create policy "Users can view their own data" on contacts for all using (auth.uid() = user_id);
create policy "Users can view their own targets" on targets for all using (auth.uid() = user_id);
create policy "Users can view their own opportunities" on opportunities for all using (auth.uid() = user_id);
create policy "Users can view their own messages" on messages for all using (
  exists (select 1 from opportunities where id = messages.opportunity_id and user_id = auth.uid())
);
