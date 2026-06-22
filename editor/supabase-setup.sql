-- ════════════════════════════════════════════════════════════════
-- Rallys Equities — content editor database setup
-- Run this once in the Supabase dashboard:  SQL Editor → New query → paste → Run
-- ════════════════════════════════════════════════════════════════

-- 1) Table that holds the site content (one row for the live "published"
--    content, one row for the in-progress "draft").
create table if not exists site_content (
  scope      text primary key,            -- 'draft' | 'published'
  data       jsonb not null default '{}', -- { version, text, img, imgMeta, calcInfo, theme }
  version    int   not null default 1,
  updated_at timestamptz not null default now()
);

-- Seed the two rows so they always exist.
insert into site_content (scope, data) values ('published', '{}'), ('draft', '{}')
  on conflict (scope) do nothing;

-- 2) Row-Level Security:
--    • the PUBLIC (anonymous visitors) may READ the 'published' row only.
--    • the OWNER (a logged-in Supabase user) may read/write everything.
alter table site_content enable row level security;

drop policy if exists pub_read   on site_content;
drop policy if exists owner_read  on site_content;
drop policy if exists owner_write on site_content;

create policy pub_read   on site_content for select
  using (scope = 'published');

create policy owner_read on site_content for select to authenticated
  using (true);

create policy owner_write on site_content for all to authenticated
  using (true) with check (true);

-- 3) Storage bucket for uploaded images (public read; only the logged-in
--    owner can upload). Create the bucket in Dashboard → Storage → New bucket
--    named exactly:  content-images   (mark it "Public").
-- Then the public CDN URLs of uploaded images are readable by everyone,
-- while uploads require an authenticated session (default Storage policy).

-- 3b) Storage policies for the 'content-images' bucket:
--     public can READ uploaded images; only a logged-in owner can UPLOAD/REPLACE.
--     (Run this AFTER you've created the bucket in step 3.)
drop policy if exists "content_images_read"   on storage.objects;
drop policy if exists "content_images_insert" on storage.objects;
drop policy if exists "content_images_update" on storage.objects;
create policy "content_images_read"   on storage.objects for select using (bucket_id = 'content-images');
create policy "content_images_insert" on storage.objects for insert to authenticated with check (bucket_id = 'content-images');
create policy "content_images_update" on storage.objects for update to authenticated using (bucket_id = 'content-images');

-- 4) Create the owner login:  Dashboard → Authentication → Users → Add user
--    (email + password, "Auto Confirm User" ON). That email/password is what the client logs in with.
