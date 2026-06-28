-- ════════════════════════════════════════════════════════════════
-- Rallys Equities — FORM SUBMISSIONS backend (Supabase)
-- Takes the website forms out of "demo mode": contact, complaint,
-- feedback, career and account-opening applications are saved here,
-- and uploaded documents go to a private Storage bucket.
--
-- Run this ONCE:  Supabase dashboard → SQL Editor → New query → paste → Run
-- (Safe to re-run — uses IF NOT EXISTS / DROP POLICY IF EXISTS.)
-- ════════════════════════════════════════════════════════════════

-- 1) The submissions table. One row per form sent from the website.
create table if not exists form_submissions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('contact','complaint','feedback','career','application')),
  reference   text,                              -- e.g. RE-2026-12345 (applications)
  data        jsonb not null default '{}'::jsonb,-- all the typed fields
  files       jsonb not null default '[]'::jsonb,-- [{field,path,name,type,size}]
  handled     boolean not null default false     -- you can tick "handled" in the editor inbox
);
create index if not exists form_submissions_created_idx on form_submissions (created_at desc);
create index if not exists form_submissions_kind_idx    on form_submissions (kind);

-- 2) Security (Row-Level Security):
--    • the PUBLIC (anonymous website visitors) may ONLY INSERT (send a form).
--      They can never read, edit or delete submissions.
--    • the OWNER (you, logged in to the editor) may read / update / delete.
alter table form_submissions enable row level security;

grant insert on form_submissions to anon;
grant select, update, delete on form_submissions to authenticated;

drop policy if exists fs_public_insert on form_submissions;
drop policy if exists fs_owner_select on form_submissions;
drop policy if exists fs_owner_update on form_submissions;
drop policy if exists fs_owner_delete on form_submissions;

create policy fs_public_insert on form_submissions for insert to anon          with check (true);
create policy fs_owner_select on form_submissions for select to authenticated using (true);
create policy fs_owner_update on form_submissions for update to authenticated using (true) with check (true);
create policy fs_owner_delete on form_submissions for delete to authenticated using (true);

-- 3) Storage bucket for uploaded documents (CNIC images, CVs, etc.)
--    FIRST create the bucket in the dashboard:
--      Storage → New bucket → name EXACTLY:  form-uploads   → leave "Public" OFF (private).
--    THEN run the policies below so visitors can upload and only you can read.
drop policy if exists fu_public_insert on storage.objects;
drop policy if exists fu_owner_select  on storage.objects;
create policy fu_public_insert on storage.objects for insert to anon
  with check (bucket_id = 'form-uploads');
create policy fu_owner_select  on storage.objects for select to authenticated
  using (bucket_id = 'form-uploads');

-- Done. The website can now save submissions, and the editor's
-- "Submissions" inbox (logged in) can read them. Email alerts are set
-- up separately — see editor/FORMS-SETUP.md.
