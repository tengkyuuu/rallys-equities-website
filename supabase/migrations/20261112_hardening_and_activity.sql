-- Two things, both safe to re-run. Paste into Supabase → SQL Editor → Run.
--
-- A. Security hardening (was editor/security-hardening.sql; never applied to the restored
--    project). Visitors could insert form submissions and upload files straight through the
--    public key, skipping the website's validation and rate limits. The website's forms use
--    the server-side key and one-time signed upload links, so they keep working.
--
-- B. Activity history: who did what in the admin. Rows are written only by database
--    triggers (running as the table owner), so nobody can add, change or erase them from
--    the admin or the API. Every signed-in user can read them (the admin's Activity page).

begin;

-- ── A. Security hardening ────────────────────────────────────────────────────────
alter table public.form_submissions enable row level security;
drop policy if exists fs_public_insert on public.form_submissions;
revoke insert on public.form_submissions from anon, authenticated;
grant insert on public.form_submissions to service_role;
drop policy if exists fu_public_insert on storage.objects;

-- Storage itself enforces upload size and type (matches lib/forms/schema.ts).
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
where id = 'form-uploads';

-- Editor image uploads: images only, 10 MB max.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']   -- no SVG: it can carry scripts
where id = 'content-images';

-- ── B. Activity history ──────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,
  actor_email text,                 -- 'system' for server-side jobs and the invite function
  action      text not null,        -- e.g. post.edited, site.published, submission.deleted
  target      text not null default '',
  details     jsonb not null default '{}'::jsonb
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);

alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;
drop policy if exists audit_log_read on public.audit_log;
create policy audit_log_read on public.audit_log for select to authenticated using (true);

create or replace function public.audit_write(p_action text, p_target text, p_details jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into audit_log (actor_id, actor_email, action, target, details)
  values (
    auth.uid(),
    coalesce(nullif(auth.jwt() ->> 'email', ''), case when auth.uid() is null then 'system' end),
    p_action,
    coalesce(p_target, ''),
    coalesce(p_details, '{}'::jsonb)
  );
end;
$$;
revoke execute on function public.audit_write(text, text, jsonb) from public, anon, authenticated;

-- Blog posts: draft rows only (publishing copies every post, logged once as site.published).
create or replace function public.audit_blog_posts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed text[];
begin
  if coalesce(new.scope, old.scope) <> 'draft' then
    return null;
  end if;
  if tg_op = 'INSERT' then
    perform audit_write('post.created', new.title, jsonb_build_object('id', new.id, 'slug', new.slug, 'published', new.published));
  elsif tg_op = 'DELETE' then
    perform audit_write('post.deleted', old.title, jsonb_build_object('id', old.id, 'slug', old.slug));
  else
    changed := array_remove(array[
      case when new.title     is distinct from old.title     then 'title'     end,
      case when new.slug      is distinct from old.slug      then 'slug'      end,
      case when new.date      is distinct from old.date      then 'date'      end,
      case when new.cover     is distinct from old.cover     then 'cover'     end,
      case when new.excerpt   is distinct from old.excerpt   then 'excerpt'   end,
      case when new.body      is distinct from old.body      then 'body'      end,
      case when new.published is distinct from old.published then 'published' end
    ], null);
    if cardinality(changed) = 0 then
      return null;
    end if;
    perform audit_write('post.edited', new.title,
      jsonb_build_object('id', new.id, 'fields', to_jsonb(changed), 'published', new.published)
      || case when new.title is distinct from old.title then jsonb_build_object('old_title', old.title) else '{}'::jsonb end);
  end if;
  return null;
end;
$$;
drop trigger if exists audit_blog_posts on public.blog_posts;
create trigger audit_blog_posts after insert or update or delete on public.blog_posts
  for each row execute function public.audit_blog_posts();

-- Site settings: which parts of the draft changed; a write to the published row is a publish.
create or replace function public.audit_site_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed text[];
  before  jsonb := case when tg_op = 'UPDATE' then coalesce(old.data, '{}'::jsonb) else '{}'::jsonb end;
  after   jsonb := coalesce(new.data, '{}'::jsonb);
begin
  if new.scope = 'published' then
    perform audit_write('site.published', 'Website',
      jsonb_build_object('live_posts', (select count(*) from blog_posts where scope = 'draft' and published)));
    return null;
  end if;
  select coalesce(array_agg(k order by k), '{}') into changed
  from jsonb_object_keys(before || after) as k
  where k not in ('version', 'posts') and (after -> k) is distinct from (before -> k);
  if cardinality(changed) > 0 then
    perform audit_write('settings.saved', 'Site settings', jsonb_build_object('parts', to_jsonb(changed)));
  end if;
  return null;
end;
$$;
drop trigger if exists audit_site_content on public.site_content;
create trigger audit_site_content after insert or update on public.site_content
  for each row execute function public.audit_site_content();

-- Submissions: handled / reopened / deleted. No personal data is copied into the log.
create or replace function public.audit_form_submissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform audit_write('submission.deleted', old.kind || ' #' || old.id, jsonb_build_object('id', old.id, 'kind', old.kind, 'reference', old.reference, 'received', old.created_at));
  elsif new.handled is distinct from old.handled then
    perform audit_write(case when new.handled then 'submission.handled' else 'submission.reopened' end,
      new.kind || ' #' || new.id, jsonb_build_object('id', new.id, 'kind', new.kind, 'reference', new.reference));
  end if;
  return null;
end;
$$;
drop trigger if exists audit_form_submissions on public.form_submissions;
create trigger audit_form_submissions after update or delete on public.form_submissions
  for each row execute function public.audit_form_submissions();

-- Editors: invited (by an owner, through the invite function), joined, removed.
create or replace function public.audit_invites()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform audit_write('editor.invited', new.email, '{}'::jsonb);
  elsif tg_op = 'DELETE' then
    perform audit_write('editor.removed', old.email, '{}'::jsonb);
  elsif old.accepted_at is null and new.accepted_at is not null then
    perform audit_write('editor.joined', new.email, '{}'::jsonb);
  end if;
  return null;
end;
$$;
drop trigger if exists audit_invites on public.invites;
create trigger audit_invites after insert or update or delete on public.invites
  for each row execute function public.audit_invites();

commit;

-- Check (should list no fs_public_insert / fu_public_insert, and the four audit triggers):
select tablename, policyname, cmd from pg_policies
where (schemaname = 'public' and tablename = 'form_submissions') or (schemaname = 'storage' and tablename = 'objects');
select event_object_table, trigger_name from information_schema.triggers where trigger_name like 'audit_%' order by 1;
