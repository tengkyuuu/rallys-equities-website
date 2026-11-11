import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Post, SiteContent } from './content-types';
import { SUPABASE_URL, supabaseHeaders } from './supabase-config';

/* Published editor content, read on the server.

   Site settings are the small `published` row of site_content. Blog posts are rows in
   blog_posts, fetched only by the blog routes. (Older records may still carry a `posts`
   array inside site_content; it is never read.) */

export const CONTENT_TAG = 'site-content';
const REVALIDATE_S = 60;

const FIELDS = ['text', 'img', 'imgMeta', 'theme', 'fonts', 'hidden', 'order', 'pricing', 'calcInfo', 'version'] as const;
const OVERRIDES_URL = `${SUPABASE_URL}/rest/v1/site_content?scope=eq.published&select=${FIELDS.map((f) => `${f}:data->${f}`).join(',')}`;
const PAGE = 1000;
const POST_LIST_COLS = 'id,slug,title,date,cover,excerpt,published,position,words';
const POSTS_URL = `${SUPABASE_URL}/rest/v1/blog_posts?scope=eq.published&published=eq.true&select=${POST_LIST_COLS}`;
const POST_BODY_URL = `${SUPABASE_URL}/rest/v1/blog_posts?scope=eq.published&published=eq.true&select=body`;

/** Overrides minus posts. Never throws: if Supabase is unreachable the site shows its built-in defaults. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const r = await fetch(OVERRIDES_URL, { headers: supabaseHeaders, next: { revalidate: REVALIDATE_S, tags: [CONTENT_TAG] } });
    if (!r.ok) return {};
    const rows = (await r.json()) as SiteContent[];
    const row = rows[0] ?? {};
    return Object.fromEntries(Object.entries(row).filter(([, v]) => v != null)) as SiteContent;
  } catch {
    return {};
  }
}

/* Lists fetch every column except the body (~350 KB for ~1,000 posts instead of ~9.5 MB);
   a post page fetches its own body. Both sit in Next's data cache under CONTENT_TAG, so
   they refresh every minute or at once when the editor publishes (/api/revalidate).
   Loaders throw on failure, and a thrown result is never cached. */

export type PublishedPost = Post & { slug: string; readTime: string };

export function slugify(s: string | undefined) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/** ~200 wpm over the stripped body (counted by the database as `words`), never below 1 minute. */
export const readTimeOf = (words: number | undefined) => Math.max(1, Math.round((words || 0) / 200)) + ' min read';

async function loadPosts(): Promise<PublishedPost[]> {
  // Supabase answers at most 1,000 rows per request, so read the list in pages
  const rows: (Post & { position?: number | null })[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const r = await fetch(`${POSTS_URL}&order=id&limit=${PAGE}&offset=${offset}`, { headers: supabaseHeaders, cache: 'no-store' });
    if (!r.ok) throw new Error(`Could not load posts: ${r.status}`);
    const page = (await r.json()) as typeof rows;
    if (!Array.isArray(page)) throw new Error('Could not load posts: unexpected response');
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  // newest first; same-date posts keep their original order (position), new ones after
  const pos = (p: { position?: number | null }) => (p.position == null ? Infinity : p.position);
  return rows
    .filter((p) => p && p.published !== false)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || pos(a) - pos(b))
    .map((p, i) => ({ ...p, slug: p.slug || slugify(p.title) || `post-${i}`, readTime: readTimeOf(p.words) }));
}

async function loadBody(id: string): Promise<string> {
  const r = await fetch(`${POST_BODY_URL}&id=eq.${encodeURIComponent(id)}`, { headers: supabaseHeaders, cache: 'no-store' });
  if (!r.ok) throw new Error(`Could not load post ${id}: ${r.status}`);
  const rows = (await r.json()) as { body?: string }[];
  return rows[0]?.body ?? '';
}

const cachedPosts = unstable_cache(loadPosts, ['blog-posts-list'], { revalidate: REVALIDATE_S, tags: [CONTENT_TAG] });
const cachedBody = unstable_cache(loadBody, ['blog-post-body'], { revalidate: REVALIDATE_S, tags: [CONTENT_TAG] });

/** Published posts, newest first. Never throws: if Supabase is unreachable the list is empty. */
export async function getPosts(): Promise<PublishedPost[]> {
  try {
    return await cachedPosts();
  } catch {
    return [];
  }
}

/** One published post with its body, or null if no live post has that slug. If the body
    can't be loaded this throws, so a hiccup shows an error page instead of a 404. */
export async function getPost(slug: string) {
  const posts = await getPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  return { post: { ...posts[i], body: await cachedBody(posts[i].id) }, index: i, posts };
}
