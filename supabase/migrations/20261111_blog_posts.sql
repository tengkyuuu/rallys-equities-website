-- Blog posts get their own table: one row per post per scope ('draft' | 'published'),
-- mirroring site_content. Before this, all posts lived inside site_content.data.posts
-- (~9.6 MB per row), so every editor login downloaded ~19 MB, every save re-sent every
-- post, and a failed load could look like "no posts".
--
-- Safe to re-run. Apply in the Supabase dashboard SQL editor (or `supabase db push`),
-- then copy the posts across with `node scripts/migrate-posts.mjs`.

create table if not exists public.blog_posts (
  scope      text not null check (scope in ('draft', 'published')),
  id         text not null,
  slug       text,
  title      text not null default '',
  date       text not null default '',          -- 'YYYY-MM-DD', kept as text exactly as the editor writes it
  cover      text not null default '',
  excerpt    text not null default '',
  body       text not null default '',
  published  boolean not null default true,
  -- original order inside the old posts array, so same-date posts keep their order;
  -- posts written later by the editor leave it empty and sort after (as they did before)
  position   integer,
  -- lets the editor tell "Live" from "Edited" without downloading every body
  body_sig   text generated always as (md5(body)) stored,
  -- word count of the body with tags stripped (the site shows "N min read" on list pages)
  words      integer generated always as (
               cardinality(array_remove(regexp_split_to_array(regexp_replace(body, '<[^>]*>', ' ', 'g'), '\s+'), ''))
             ) stored,
  updated_at timestamptz not null default now(),
  primary key (scope, id)
);

create unique index if not exists blog_posts_scope_slug_key on public.blog_posts (scope, slug);
create index if not exists blog_posts_scope_date_idx on public.blog_posts (scope, date desc, position);

alter table public.blog_posts enable row level security;

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

-- Same rules as site_content: visitors read published posts only; a signed-in editor reads/writes all.
drop policy if exists blog_posts_pub_read on public.blog_posts;
create policy blog_posts_pub_read on public.blog_posts for select
  using (scope = 'published' and published);

drop policy if exists blog_posts_owner_read on public.blog_posts;
create policy blog_posts_owner_read on public.blog_posts for select to authenticated
  using (true);

drop policy if exists blog_posts_owner_write on public.blog_posts;
create policy blog_posts_owner_write on public.blog_posts for all to authenticated
  using (true) with check (true);

-- Publish = make the draft live, in one transaction: the site settings and every post.
-- Runs with the caller's rights (RLS still applies), so only signed-in editors can use it.
create or replace function public.publish_site()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (select 1 from site_content where scope = 'draft') then
    raise exception 'No draft to publish';
  end if;

  insert into site_content (scope, data, version, updated_at)
  select 'published', data, version, now() from site_content where scope = 'draft'
  on conflict (scope) do update
    set data = excluded.data, version = excluded.version, updated_at = excluded.updated_at;

  delete from blog_posts where scope = 'published';
  insert into blog_posts (scope, id, slug, title, date, cover, excerpt, body, published, position, updated_at)
  select 'published', id, slug, title, date, cover, excerpt, body, published, position, now()
  from blog_posts where scope = 'draft';
end;
$$;

revoke execute on function public.publish_site() from public, anon;
grant execute on function public.publish_site() to authenticated;
