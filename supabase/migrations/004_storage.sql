-- AaykarDesk storage wiring
-- Creates the two private buckets and the storage.objects RLS policies so:
--   * authenticated CA users can upload/read notice PDFs for their firm's cases
--     (path convention: notices/{case_id}/{filename})
--   * the anonymous client portal can upload documents through a valid magic
--     link, and the owning firm can read them back
--     (path convention: client-uploads/{token}/{checklist_item_id}/{filename})
set search_path to public, extensions;

-- ---------------------------------------------------------------------------
-- Buckets (private). Safe to re-run.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('notices', 'notices', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('client-uploads', 'client-uploads', false)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Helper predicates used by the storage policies.
-- ---------------------------------------------------------------------------
create or replace function firm_owns_case(p_case uuid)
returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from cases where id = p_case and firm_id = current_firm_id());
$$;

create or replace function is_active_link_token(p_token text)
returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from magic_links
    where token = p_token and is_active = true and expires_at > now()
  );
$$;

create or replace function firm_owns_link_token(p_token text)
returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from magic_links m
    join cases c on c.id = m.case_id
    where m.token = p_token and c.firm_id = current_firm_id()
  );
$$;

grant execute on function firm_owns_case(uuid) to authenticated;
grant execute on function is_active_link_token(text) to anon, authenticated;
grant execute on function firm_owns_link_token(text) to authenticated;

-- ---------------------------------------------------------------------------
-- storage.objects policies
-- ---------------------------------------------------------------------------
-- Notice PDFs: firm-scoped read/write, keyed on the {case_id} top folder.
drop policy if exists "firm manage notice files" on storage.objects;
create policy "firm manage notice files" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'notices'
    and firm_owns_case(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'notices'
    and firm_owns_case(((storage.foldername(name))[1])::uuid)
  );

-- Client uploads: anyone holding a valid magic-link token may upload under
-- that token's folder; the owning firm can read the files back.
drop policy if exists "portal upload client files" on storage.objects;
create policy "portal upload client files" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'client-uploads'
    and is_active_link_token((storage.foldername(name))[1])
  );

drop policy if exists "firm read client files" on storage.objects;
create policy "firm read client files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-uploads'
    and firm_owns_link_token((storage.foldername(name))[1])
  );

-- ---------------------------------------------------------------------------
-- Record the real storage path when a client uploads through the portal.
-- Replaces the 003 version (which stored the file name as the path).
-- ---------------------------------------------------------------------------
drop function if exists portal_upload_document(text, uuid, text, integer, text);

create or replace function portal_upload_document(
  p_token text,
  p_item_id uuid,
  p_file_path text,
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
    values (v_link.id, p_item_id, p_file_path, p_file_name, p_file_size, p_file_type);
end;
$$;

grant execute on function portal_upload_document(text, uuid, text, text, integer, text) to anon, authenticated;
