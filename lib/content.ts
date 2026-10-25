import 'server-only';
import type { Post, SiteContent } from './content-types';
import { SUPABASE_URL, supabaseHeaders } from './supabase-config';

/* Published editor content, read on the server.

   The record also holds every blog post (~8 MB today), which the old site made every
   visitor download on every page. Here pages fetch only the small override fields, and
   posts are fetched separately and only by the blog routes. */

export const CONTENT_TAG = 'site-content';
const REVALIDATE_S = 60;

const FIELDS = ['text', 'img', 'imgMeta', 'theme', 'fonts', 'hidden', 'order', 'pricing', 'calcInfo', 'version'] as const;
const OVERRIDES_URL = `${SUPABASE_URL}/rest/v1/site_content?scope=eq.published&select=${FIELDS.map((f) => `${f}:data->${f}`).join(',')}`;
const POSTS_URL = `${SUPABASE_URL}/rest/v1/site_content?scope=eq.published&select=posts:data->posts`;

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

/* Posts are too large for Next's data cache (2 MB per entry), so they are cached in
   memory per server instance and refreshed every minute, or at once on publish. */
let postsCache: { at: number; posts: Promise<PublishedPost[]> } | null = null;

export function invalidatePosts() {
  postsCache = null;
}

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

/** ~200 wpm over the stripped body, rounded, never below 1 minute. */
export function readTime(body: string | undefined) {
  const words = String(body || '')
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + ' min read';
}

async function loadPosts(): Promise<PublishedPost[]> {
  try {
    const r = await fetch(POSTS_URL, { headers: supabaseHeaders, cache: 'no-store' });
    if (!r.ok) return [];
    const rows = (await r.json()) as { posts?: Post[] }[];
    const all = Array.isArray(rows[0]?.posts) ? rows[0].posts : [];
    return (
      all
        .filter((p) => p && p.published !== false)
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        // posts saved before the editor had slugs derive one from the title, so old links keep working
        .map((p, i) => ({ ...p, slug: p.slug || slugify(p.title) || `post-${i}`, readTime: readTime(p.body) }))
    );
  } catch {
    return [];
  }
}

/** Published posts, newest first. */
export function getPosts(): Promise<PublishedPost[]> {
  if (!postsCache || Date.now() - postsCache.at > REVALIDATE_S * 1000) {
    const posts = loadPosts();
    postsCache = { at: Date.now(), posts };
    // a failed load must not be cached for a whole minute
    posts.then((p) => {
      if (!p.length && postsCache?.posts === posts) postsCache = null;
    });
  }
  return postsCache.posts;
}

export async function getPost(slug: string) {
  const posts = await getPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  return i < 0 ? null : { post: posts[i], index: i, posts };
}
