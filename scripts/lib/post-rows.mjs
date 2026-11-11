// Turning the old site_content.data.posts arrays into blog_posts rows.
// Shared by scripts/migrate-posts.mjs (the real one-off copy) and tests/mock-supabase.mjs
// (so the test database is seeded exactly the way production will be).
import crypto from 'node:crypto';

/** Same as slugify() in lib/content.ts — keep the two in step. */
export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

/**
 * id → slug for every post, freezing the URLs the site serves today.
 *
 * Before the move, posts without a slug got one at read time (lib/content.ts loadPosts):
 * `p.slug || slugify(p.title) || 'post-' + i`, where i is the post's position in the
 * newest-first list of published posts. Storing exactly that keeps every old link working.
 * If two posts end up with the same slug, the site only ever served the first (in that
 * order), so later ones get "-2", "-3"… — they were unreachable anyway.
 */
export function freezeSlugs(publishedPosts, draftPosts = []) {
  const live = (publishedPosts || []).filter((p) => p && p.published !== false).sort(byDateDesc);
  const slugs = new Map();
  live.forEach((p, i) => slugs.set(p.id, p.slug || slugify(p.title) || `post-${i}`));
  // everything else (unpublished posts, draft-only posts): their own slug, the title, or the id
  for (const p of [...(publishedPosts || []), ...(draftPosts || [])]) {
    if (p && !slugs.has(p.id)) slugs.set(p.id, p.slug || slugify(p.title) || `post-${slugify(p.id) || 'x'}`);
  }
  const taken = new Set();
  const renamed = [];
  // claim in the order the site resolved them: live posts first, newest first
  const order = [...live.map((p) => p.id), ...[...slugs.keys()].filter((id) => !live.some((p) => p.id === id))];
  for (const id of order) {
    const base = slugs.get(id);
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    if (slug !== base) renamed.push({ id, from: base, to: slug });
    taken.add(slug);
    slugs.set(id, slug);
  }
  return { slugs, renamed };
}

/** The columns the database computes itself (generated columns in the SQL migration). */
export function derived(body) {
  const b = String(body ?? '');
  return {
    body_sig: crypto.createHash('md5').update(b, 'utf8').digest('hex'),
    words: b
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length,
  };
}

/** One old post object → the row we write (generated columns left out). */
export function toRow(scope, p, slug, position) {
  return {
    scope,
    id: String(p.id),
    slug,
    title: p.title ?? '',
    date: p.date ?? '',
    cover: p.cover ?? '',
    excerpt: p.excerpt ?? '',
    body: p.body ?? '',
    published: p.published !== false,
    position,
  };
}

/** Everything that must survive the copy, for comparing source and destination. */
export const fingerprint = (r) =>
  crypto
    .createHash('sha256')
    .update(JSON.stringify([r.scope, r.id, r.slug, r.title, r.date, r.cover, r.excerpt, r.body, r.published, r.position ?? null]))
    .digest('hex');
