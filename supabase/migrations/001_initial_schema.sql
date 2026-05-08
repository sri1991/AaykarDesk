-- AaykarDesk initial schema
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  gstin text,
  email text,
  phone text,
  address text,
  created_at timestamptz default now()
);

create table users (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms(id) on delete cascade,
  auth_id uuid unique,
  name text not null,
  email text not null,
  role text default 'member' check (role in ('admin', 'partner', 'member')),
  created_at timestamptz default now()
);

create table cases (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms(id) on delete cascade not null,
  created_by uuid references users(id),
  case_number text,
  client_name text not null,
  client_pan text,
  client_email text,
  client_phone text,
  assessment_year text not null,
  notice_section text,
  notice_type text,
  ao_name text,
  ward_circle text,
  jurisdiction text,
  deadline date,
  deadline_type text,
  status text default 'new' check (status in (
    'new', 'extraction_pending', 'awaiting_documents',
    'documents_received', 'triage_pending', 'triage_complete',
    'draft_ready', 'response_filed', 'closed'
  )),
  priority text default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table notices (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade not null,
  file_path text not null,
  file_name text not null,
  file_size integer,
  page_count integer,
  raw_extraction jsonb,
  created_at timestamptz default now()
);

create table checklist_items (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade not null,
  document_name text not null,
  description text,
  is_mandatory boolean default true,
  status text default 'pending' check (status in ('pending', 'uploaded', 'verified', 'rejected')),
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table magic_links (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade not null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  client_name text,
  client_phone text,
  is_active boolean default true,
  expires_at timestamptz default (now() + interval '30 days'),
  accessed_at timestamptz,
  created_at timestamptz default now()
);

create table client_uploads (
  id uuid primary key default uuid_generate_v4(),
  magic_link_id uuid references magic_links(id) on delete cascade not null,
  checklist_item_id uuid references checklist_items(id),
  file_path text not null,
  file_name text not null,
  file_size integer,
  file_type text,
  ai_classification text,
  validation_status text default 'pending' check (validation_status in ('pending', 'valid', 'invalid', 'needs_review')),
  validation_notes text,
  uploaded_at timestamptz default now()
);

create table extractions (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade not null,
  extraction_type text not null check (extraction_type in ('notice_fields', 'document_classification', 'triage')),
  model_used text,
  input_tokens integer,
  output_tokens integer,
  result jsonb not null,
  confidence float,
  processing_time_ms integer,
  created_at timestamptz default now()
);

create table triage_results (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade not null,
  discrepancies jsonb,
  section_mapping jsonb,
  risk_assessment text,
  summary text,
  draft_response text,
  status text default 'pending' check (status in ('pending', 'processing', 'complete', 'failed')),
  created_at timestamptz default now()
);

create index idx_cases_firm_id on cases(firm_id);
create index idx_cases_status on cases(status);
create index idx_cases_deadline on cases(deadline);
create index idx_magic_links_token on magic_links(token);
create index idx_magic_links_case_id on magic_links(case_id);
create index idx_checklist_items_case_id on checklist_items(case_id);
create index idx_client_uploads_magic_link on client_uploads(magic_link_id);

alter table firms enable row level security;
alter table users enable row level security;
alter table cases enable row level security;
alter table notices enable row level security;
alter table checklist_items enable row level security;
alter table magic_links enable row level security;
alter table client_uploads enable row level security;
alter table extractions enable row level security;
alter table triage_results enable row level security;

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at
  before update on cases
  for each row execute function update_updated_at();

-- Helper: current user's firm_id
create or replace function current_firm_id() returns uuid
language sql stable security definer set search_path = public as $$
  select firm_id from users where auth_id = auth.uid() limit 1
$$;

-- Firm-scoped read/write for authenticated CA users
create policy "firm members read own cases" on cases
  for select using (firm_id = current_firm_id());
create policy "firm members write own cases" on cases
  for all using (firm_id = current_firm_id())
  with check (firm_id = current_firm_id());

create policy "firm members read checklist" on checklist_items
  for select using (
    exists(select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );
create policy "firm members write checklist" on checklist_items
  for all using (
    exists(select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  ) with check (
    exists(select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );

-- Magic link: public select by token (anon)
create policy "anon read magic link by token" on magic_links
  for select using (is_active = true and expires_at > now());

-- Storage buckets must be created separately via Supabase UI / CLI:
--   notices (private)
--   client-uploads (private, with policy granting writes via valid magic link)
