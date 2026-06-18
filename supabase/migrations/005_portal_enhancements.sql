-- AaykarDesk client portal enhancements
-- Adds the fields behind the six portal enhancements:
--   1. CA-controlled reasoning visibility per document item
--   2. File-type guidance per slot
--   5. Plain-language notice summary for the client
--   6. Mandatory vs optional indicator (column already existed; defaults clarified)
-- All columns are added with backward-compatible defaults so existing rows keep
-- working without a data backfill.
set search_path to public, extensions;

-- --- Enhancement 5: plain-language notice summary (case level) --------------
alter table cases add column if not exists client_notice_summary text;
alter table cases add column if not exists show_notice_summary boolean default true;

-- --- Enhancement 1: split description + CA reasoning visibility --------------
-- `description` is retained for backward compatibility and is treated as the
-- client_description when the new column is null (handled in the app layer).
alter table checklist_items add column if not exists client_description text;
alter table checklist_items add column if not exists internal_reasoning text;
alter table checklist_items
  add column if not exists share_reasoning_with_client boolean default false;

-- --- Enhancement 2: accepted file types per slot ----------------------------
alter table checklist_items
  add column if not exists accepted_file_types text[]
  default array['pdf', 'jpg', 'png']::text[];

-- Backfill existing rows that predate the new columns so the portal renders
-- sensibly (existing items were effectively mandatory and accepted common types).
update checklist_items
  set accepted_file_types = array['pdf', 'jpg', 'png']::text[]
  where accepted_file_types is null;
update checklist_items set is_mandatory = true where is_mandatory is null;

-- get_case_by_token already returns checklist + uploads via to_jsonb(), so the
-- new columns flow to the client portal automatically with no RPC change.
