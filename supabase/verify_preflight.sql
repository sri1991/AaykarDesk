-- AaykarDesk migration preflight
-- Run in Supabase → SQL Editor AFTER applying 001–004.
-- Every row should read PASS. Any FAIL points at the migration that didn't apply.
with checks as (
  select 'fn ensure_user_provisioned'                 as item, count(*) > 0 as ok from pg_proc where proname = 'ensure_user_provisioned'
  union all select 'fn current_firm_id',                count(*) > 0 from pg_proc where proname = 'current_firm_id'
  union all select 'fn get_case_by_token',             count(*) > 0 from pg_proc where proname = 'get_case_by_token'
  union all select 'fn portal_upload_document (6 args)',count(*) > 0 from pg_proc where proname = 'portal_upload_document' and pronargs = 6
  union all select 'old portal_upload_document removed',count(*) = 0 from pg_proc where proname = 'portal_upload_document' and pronargs = 5
  union all select 'fn portal_remove_document',         count(*) > 0 from pg_proc where proname = 'portal_remove_document'
  union all select 'fn firm_owns_case',                 count(*) > 0 from pg_proc where proname = 'firm_owns_case'
  union all select 'fn is_active_link_token',           count(*) > 0 from pg_proc where proname = 'is_active_link_token'
  union all select 'fn firm_owns_link_token',           count(*) > 0 from pg_proc where proname = 'firm_owns_link_token'
  union all select 'bucket notices',                    count(*) > 0 from storage.buckets where id = 'notices'
  union all select 'bucket client-uploads',             count(*) > 0 from storage.buckets where id = 'client-uploads'
  union all select 'policy storage: notices',           count(*) > 0 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'firm manage notice files'
  union all select 'policy storage: client upload',     count(*) > 0 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'portal upload client files'
  union all select 'policy storage: client read',       count(*) > 0 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'firm read client files'
  union all select 'policy cases write',                count(*) > 0 from pg_policies where tablename = 'cases' and policyname = 'firm members write own cases'
  union all select 'policy magic_links manage',         count(*) > 0 from pg_policies where tablename = 'magic_links' and policyname = 'firm manage magic links'
  union all select 'policy extractions manage',         count(*) > 0 from pg_policies where tablename = 'extractions' and policyname = 'firm manage extractions'
  union all select 'policy triage manage',              count(*) > 0 from pg_policies where tablename = 'triage_results' and policyname = 'firm manage triage'
  union all select 'policy client_uploads read',        count(*) > 0 from pg_policies where tablename = 'client_uploads' and policyname = 'firm read uploads'
)
select item, case when ok then 'PASS' else 'FAIL' end as status
from checks
order by status desc, item;

-- ---------------------------------------------------------------------------
-- Optional functional smoke for the portal RPC (token-based, no auth needed,
-- so it runs in the SQL editor). Returns the case bundle as JSON if wiring is
-- correct. Requires at least one active magic link to exist.
-- ---------------------------------------------------------------------------
-- select get_case_by_token((select token from magic_links where is_active limit 1));
