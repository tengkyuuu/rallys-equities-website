create table if not exists public.invites (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  role         text not null default 'editor',
  invited_by   uuid references auth.users(id),
  auth_user_id uuid,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz,
  accepted_at  timestamptz
);
create index if not exists invites_email_idx on public.invites (lower(email));
alter table public.invites enable row level security;
grant select on public.invites to authenticated;
grant update (accepted_at) on public.invites to authenticated;
drop policy if exists "authenticated read invites" on public.invites;
create policy "authenticated read invites" on public.invites for select to authenticated using (true);
drop policy if exists "accept own invite" on public.invites;
create policy "accept own invite" on public.invites for update to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'))
  with check (lower(email) = lower(auth.jwt() ->> 'email'));
