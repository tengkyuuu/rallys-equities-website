-- Apply AFTER editor/supabase-forms.sql, with SUPABASE_SERVICE_ROLE_KEY configured
-- on the website server. This closes direct anonymous writes that bypass API limits.
begin;
alter table public.form_submissions enable row level security;
drop policy if exists fs_public_insert on public.form_submissions;
revoke insert on public.form_submissions from anon, authenticated;
grant insert on public.form_submissions to service_role;
drop policy if exists fu_public_insert on storage.objects;

-- Storage, rather than browser metadata, enforces the upload size and MIME limits.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
where id = 'form-uploads';
commit;

-- Verify: fs_public_insert and fu_public_insert must be absent; the bucket private.
select schemaname, tablename, policyname, roles, cmd from pg_policies
where (schemaname = 'public' and tablename = 'form_submissions')
   or (schemaname = 'storage' and tablename = 'objects');
select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id = 'form-uploads';
