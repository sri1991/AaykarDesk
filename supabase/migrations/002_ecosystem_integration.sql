-- AaykarDesk ecosystem integration addendum
-- Adds faceless / regime metadata, Tally import status, client financial data
-- (Tally + 26AS + AIS) and reference guidance produced during extraction.

alter table cases add column if not exists is_faceless boolean default true;
alter table cases add column if not exists assessment_regime text
  check (assessment_regime in ('faceless', 'jurisdictional', 'transfer_pricing', 'search_case'));
alter table cases add column if not exists tally_company_name text;
alter table cases add column if not exists tally_import_status text default 'none'
  check (tally_import_status in ('none', 'pending', 'imported', 'failed'));

create table if not exists client_financial_data (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade not null,
  source text not null check (source in ('tally_xml', 'tally_manual', '26as_json', 'ais_json', 'manual_entry')),
  data_type text not null,
  data jsonb not null,
  assessment_year text,
  period_from date,
  period_to date,
  imported_at timestamptz default now()
);

create index if not exists idx_client_financial_case on client_financial_data(case_id);

alter table extractions add column if not exists reference_guidance jsonb;

-- Tally / source metadata for each requested document so the UI can hint
-- where to fetch each item from.
alter table checklist_items add column if not exists tally_exportable boolean default false;
alter table checklist_items add column if not exists suggested_source text
  check (suggested_source in ('tally', 'bank', 'employer', 'client_records', 'government_portal'));

alter table client_financial_data enable row level security;

create policy "firm members read financial data" on client_financial_data
  for select using (
    exists(select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );
create policy "firm members write financial data" on client_financial_data
  for all using (
    exists(select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  ) with check (
    exists(select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );
