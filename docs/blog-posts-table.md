# Blog posts table

Blog posts are stored one row per post in `public.blog_posts`, with a `draft` and a
`published` row for each post (the same split as `site_content`). Site settings — text,
images, theme, pricing, hidden pages — stay in the two small `site_content` rows.

Until November 2026 every post lived inside `site_content.data.posts`, about 9.6 MB per row.
The admin downloaded both rows (~19 MB) on every login, every Save re-sent all posts, and a
failed load could look like "0 posts". Now:

| | Before | After |
| --- | --- | --- |
| Admin login | ~19 MB | under 1 MB: post lists without bodies, plus settings |
| Open a post to edit | already loaded | that post's body only |
| Save | every post | only the posts you changed |
| Publish | uploads everything twice | one server-side step (`publish_site()`) |

## Columns

`scope`, `id`, `slug`, `title`, `date` (text, `YYYY-MM-DD`), `cover`, `excerpt`, `body`,
`published`, `position` (original order for same-date posts), and two columns the database
computes: `body_sig` (md5 of the body, so the admin can show Live/Edited without bodies) and
`words` (for "N min read"). Visitors can read published rows only; signed-in editors can read
and write everything. See [the migration](../supabase/migrations/20261111_blog_posts.sql).

## Going live (in this order)

The new code reads only `blog_posts`, so the table must exist and hold the posts **before**
the code is deployed. Until then the live site keeps reading `site_content` as before.

1. **Create the table.** In the Supabase dashboard → SQL Editor, paste and run
   `supabase/migrations/20261111_blog_posts.sql`. It is safe to run twice.
2. **Copy the posts.** From the project folder:
   ```bash
   node scripts/migrate-posts.mjs --dry-run
   node scripts/migrate-posts.mjs
   ```
   The script backs up both `site_content` rows to `.migration/blog-posts-move/`, copies
   every post, then re-reads each one and compares it field by field. It ends with
   `✓ All posts copied and verified` or stops with an error, leaving `site_content` untouched.
3. **Deploy the code** (merge/push to `main`; Vercel deploys it).
4. **Check the live site:** `/blog`, a few posts, the sitemap, and in the admin edit, save
   and publish one post.
5. **Only after that works,** remove the old copy from `site_content`:
   ```bash
   node scripts/migrate-posts.mjs --strip
   ```
   It refuses unless `blog_posts` still matches `site_content` post-for-post, and backs up
   first. Hold off on this for a few days if you prefer; nothing reads the old copy.

## URLs

382 posts had no stored slug; the site made one from the title each time. The copy stores
exactly that slug, so their links don't change. 12 posts shared a URL with another post, so
visitors could never reach them; they get a `-2` URL and are now reachable (and are added to
the sitemap).
