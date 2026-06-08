-- AaykarDesk application data access
-- Wires the authenticated CA app and the public client portal to real data:
--   1. Idempotent provisioning of a firm + user for each auth user
--   2. The RLS policies missing from 001/002 (notices, extractions, triage,
--      magic_links writes, client_uploads reads, users/firms self-reads)
--   3. SECURITY DEFINER RPCs for the anonymous client portal, so RLS stays
--      fully closed and the portal can only touch a case via a valid token.
set search_path to public, extensions;

-- ---------------------------------------------------------------------------
-- Provisioning: every authenticated user gets a firm + user row on first call.
-- ---------------------------------------------------------------------------
create or replace function ensure_user_provisioned()
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_firm uuid;
  v_email text;
  v_name text;
begin
  select firm_id into v_firm from users where auth_id = auth.uid() limit 1;
  if v_firm is not null then
    return v_firm;
  end if;

  select email, coalesce(raw_user_meta_data ->> 'full_name', email)
    into v_email, v_name
    from auth.users where id = auth.uid();

  insert into firms (name, email)
    values (coalesce(nullif(split_part(v_email, '@', 1), '') || '''s Firm', 'My Firm'), v_email)
    returning id into v_firm;

  insert into users (firm_id, auth_id, name, email, role)
    values (v_firm, auth.uid(), coalesce(v_name, v_email, 'CA'), coalesce(v_email, ''), 'admin');

  return v_firm;
end;
$$;

grant execute on function ensure_user_provisioned() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS policies that 001/002 left unset (RLS is on, but no policy = no access).
-- ---------------------------------------------------------------------------
drop policy if exists "users read own" on users;
create policy "users read own" on users
  for select using (auth_id = auth.uid());

drop policy if exists "firms read own" on firms;
create policy "firms read own" on firms
  for select using (id = current_firm_id());

drop policy if exists "firm manage notices" on notices;
create policy "firm manage notices" on notices
  for all using (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  ) with check (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );

drop policy if exists "firm manage extractions" on extractions;
create policy "firm manage extractions" on extractions
  for all using (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  ) with check (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );

drop policy if exists "firm manage triage" on triage_results;
create policy "firm manage triage" on triage_results
  for all using (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  ) with check (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );

-- magic_links: 001 only granted anon SELECT by token; firm users need to
-- create/rotate links for their own cases.
drop policy if exists "firm manage magic links" on magic_links;
create policy "firm manage magic links" on magic_links
  for all using (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  ) with check (
    exists (select 1 from cases c where c.id = case_id and c.firm_id = current_firm_id())
  );

-- client_uploads: the CA reads uploads for their firm's cases (via the link).
drop policy if exists "firm read uploads" on client_uploads;
create policy "firm read uploads" on client_uploads
  for select using (
    exists (
      select 1 from magic_links m
      join cases c on c.id = m.case_id
      where m.id = magic_link_id and c.firm_id = current_firm_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Public client portal RPCs (token-scoped, SECURITY DEFINER).
-- ---------------------------------------------------------------------------
create or replace function get_case_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_link magic_links;
  v_case cases;
  v_checklist jsonb;
  v_uploads jsonb;
begin
  select * into v_link
    from magic_links
    where token = p_token and is_active = true and expires_at > now()
    limit 1;
  if not found then
    return null;
  end if;

  update magic_links set accessed_at = now() where id = v_link.id;

  select * into v_case from cases where id = v_link.case_id;

  select coalesce(jsonb_agg(to_jsonb(ci) order by ci.sort_order), '[]'::jsonb)
    into v_checklist
    from checklist_items ci where ci.case_id = v_link.case_id;

  select coalesce(jsonb_agg(to_jsonb(cu) order by cu.uploaded_at desc), '[]'::jsonb)
    into v_uploads
    from client_uploads cu where cu.magic_link_id = v_link.id;

  return jsonb_build_object(
    'case', to_jsonb(v_case),
    'magicLink', to_jsonb(v_link),
    'checklist', v_checklist,
    'uploads', v_uploads
  );
end;
$$;

grant execute on function get_case_by_token(text) to anon, authenticated;

create or replace function portal_upload_document(
  p_token text,
  p_item_id uuid,
  p_file_name text,
  p_file_size integer,
  p_file_type text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_link magic_links;
begin
  select * into v_link
    from magic_links
    where token = p_token and is_active = true and expires_at > now()
    limit 1;
  if not found then
    raise exception 'invalid or expired link';
  end if;

  if not exists (select 1 from checklist_items where id = p_item_id and case_id = v_link.case_id) then
    raise exception 'document does not belong to this case';
  end if;

  update checklist_items set status = 'uploaded' where id = p_item_id;

  insert into client_uploads (magic_link_id, checklist_item_id, file_path, file_name, file_size, file_type)
    values (v_link.id, p_item_id, p_file_name, p_file_name, p_file_size, p_file_type);
end;
$$;

grant execute on function portal_upload_document(text, uuid, text, integer, text) to anon, authenticated;

create or replace function portal_remove_document(p_token text, p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_link magic_links;
begin
  select * into v_link
    from magic_links
    where token = p_token and is_active = true and expires_at > now()
    limit 1;
  if not found then
    raise exception 'invalid or expired link';
  end if;

  if not exists (select 1 from checklist_items where id = p_item_id and case_id = v_link.case_id) then
    raise exception 'document does not belong to this case';
  end if;

  update checklist_items set status = 'pending' where id = p_item_id;
  delete from client_uploads
    where magic_link_id = v_link.id and checklist_item_id = p_item_id;
end;
$$;

grant execute on function portal_remove_document(text, uuid) to anon, authenticated;
