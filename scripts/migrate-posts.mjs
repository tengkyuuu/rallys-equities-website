#!/usr/bin/env node
// One-off: copy blog posts out of site_content.data.posts into the blog_posts table.
//
//   node scripts/migrate-posts.mjs --dry-run   read and check only; writes nothing
//   node scripts/migrate-posts.mjs             back up, copy, then verify every post
//   node scripts/migrate-posts.mjs --strip     after the new site is confirmed working:
//                                              remove `posts` from both site_content rows
//
// Needs supabase/migrations/20261111_blog_posts.sql applied first. Reads
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment or .env.local.
// Every run that writes saves a full JSON backup of both site_content rows first, under
// .migration/blog-posts-move/ (git-ignored). Nothing is ever deleted from site_content
// except by --strip, and --strip refuses unless blog_posts already matches it post-for-post.
import fs from 'node:fs';
import path from 'node:path';
import { derived, fingerprint, freezeSlugs, slugify, toRow } from './lib/post-rows.mjs';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const STRIP = args.has('--strip');
const OUT = path.join('.migration', 'blog-posts-move');
const PAGE = 1000;

function env() {
  const e = { ...process.env };
  if (fs.existsSync('.env.local'))
    for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && !(m[1] in process.env)) e[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  return e;
}
const E = env();
const URL_ = E.NEXT_PUBLIC_SUPABASE_URL || E.SUPABASE_URL;
const KEY = E.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (environment or .env.local).');
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function api(method, pathQuery, body, extra = {}) {
  const r = await fetch(`${URL_}/rest/v1/${pathQuery}`, {
    method,
    headers: { ...H, ...extra },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok)
    throw Object.assign(new Error(`${method} ${pathQuery.split('?')[0]} → ${r.status} ${text.slice(0, 300)}`), { status: r.status, text });
  return text ? JSON.parse(text) : null;
}

async function readAll(scope) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = await api('GET', `blog_posts?scope=eq.${scope}&select=*&order=id&limit=${PAGE}&offset=${offset}`);
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

const fail = (msg) => {
  console.error('\n✗ ' + msg);
  process.exit(1);
};

// ── 1. source: both site_content rows ───────────────────────────────────────────
const content = await api('GET', 'site_content?select=scope,data,version,updated_at');
const byScope = Object.fromEntries(content.map((r) => [r.scope, r]));
for (const s of ['draft', 'published']) if (!byScope[s]) fail(`site_content has no "${s}" row.`);
const src = {
  published: Array.isArray(byScope.published.data?.posts) ? byScope.published.data.posts : [],
  draft: Array.isArray(byScope.draft.data?.posts) ? byScope.draft.data.posts : [],
};
console.log(`site_content: ${src.published.length} published posts, ${src.draft.length} draft posts`);

// ── 2. table present? ───────────────────────────────────────────────────────────
let tableReady = true;
try {
  await api('GET', 'blog_posts?select=id&limit=1');
} catch (e) {
  if (e.status === 404 || /42P01|does not exist|schema cache/i.test(e.text || '')) tableReady = false;
  else throw e;
}
if (!tableReady && !DRY) fail('The blog_posts table does not exist yet. Apply supabase/migrations/20261111_blog_posts.sql first.');

// ── 3. expected rows, with today's URLs frozen ──────────────────────────────────
for (const s of ['published', 'draft']) {
  const ids = src[s].map((p) => p?.id);
  if (ids.some((id) => id == null || id === '')) fail(`A ${s} post has no id.`);
  if (new Set(ids).size !== ids.length) fail(`Duplicate post ids in the ${s} posts.`);
}
const { slugs, renamed } = freezeSlugs(src.published, src.draft);
const expected = {};
for (const s of ['published', 'draft']) expected[s] = src[s].map((p, i) => toRow(s, p, slugs.get(p.id), i));

// The URL each published post has today (lib/content.ts before this change) must not move.
const oldLive = src.published
  .filter((p) => p && p.published !== false)
  .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  .map((p, i) => ({ id: p.id, url: p.slug || slugify(p.title) || `post-${i}` }));
const firstWithUrl = new Map();
for (const o of oldLive) if (!firstWithUrl.has(o.url)) firstWithUrl.set(o.url, o.id);
const moved = oldLive.filter((o) => firstWithUrl.get(o.url) === o.id && slugs.get(o.id) !== o.url);
if (moved.length) fail(`${moved.length} live post URL(s) would change, e.g. ${JSON.stringify(moved.slice(0, 3))}`);
const derivedCount = src.published.filter((p) => !p.slug).length;
console.log(
  `slugs: ${derivedCount} published posts had no stored slug and keep their derived URL; ${renamed.length} unreachable duplicate(s) renamed`,
);
if (renamed.length) console.log('  renamed:', JSON.stringify(renamed.slice(0, 10)));

const report = {
  at: new Date().toISOString(),
  source: { published: src.published.length, draft: src.draft.length },
  derivedSlugs: derivedCount,
  renamed,
};

// ── 4. --strip: only when blog_posts already equals site_content's posts ────────
async function verify() {
  const result = { ok: true, scopes: {} };
  for (const s of ['published', 'draft']) {
    const rows = await readAll(s);
    const want = new Map(expected[s].map((r) => [r.id, fingerprint(r)]));
    const got = new Map(rows.map((r) => [r.id, fingerprint(r)]));
    const missing = [...want.keys()].filter((id) => !got.has(id));
    const extra = [...got.keys()].filter((id) => !want.has(id));
    const differ = [...want.keys()].filter((id) => got.has(id) && got.get(id) !== want.get(id));
    const badSig = rows.filter((r) => r.body_sig !== derived(r.body).body_sig).map((r) => r.id);
    const wordDiff = rows
      .filter((r) => r.words !== derived(r.body).words)
      .map((r) => ({ id: r.id, db: r.words, js: derived(r.body).words }));
    const ok = !missing.length && !extra.length && !differ.length && !badSig.length;
    result.ok &&= ok;
    result.scopes[s] = {
      expected: want.size,
      found: rows.length,
      matching: want.size - missing.length - differ.length,
      missing,
      extra,
      differ,
      badSig,
      wordDiff: wordDiff.slice(0, 20),
      wordDiffCount: wordDiff.length,
    };
    console.log(
      `${ok ? '✓' : '✗'} ${s}: ${result.scopes[s].matching}/${want.size} posts identical` +
        (missing.length ? `, ${missing.length} missing` : '') +
        (extra.length ? `, ${extra.length} extra` : '') +
        (differ.length ? `, ${differ.length} different` : '') +
        (badSig.length ? `, ${badSig.length} bad body_sig` : '') +
        (wordDiff.length ? ` (read-time word count differs from the site's old count on ${wordDiff.length})` : ''),
    );
  }
  return result;
}

function backup() {
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `site_content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(content));
  console.log(`backup: ${file} (${(fs.statSync(file).size / 1e6).toFixed(1)} MB)`);
  return file;
}

if (DRY) {
  report.mode = 'dry-run';
  report.tableReady = tableReady;
  if (tableReady) report.verify = await verify();
  console.log(`\nDry run: nothing written.${tableReady ? '' : ' (blog_posts table not created yet.)'}`);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'report-dry-run.json'), JSON.stringify(report, null, 2));
  process.exit(0);
}

if (STRIP) {
  if (!src.published.length && !src.draft.length) {
    console.log('site_content holds no posts any more — nothing to strip.');
    process.exit(0);
  }
  const v = await verify();
  if (!v.ok) fail('blog_posts does not match site_content yet; refusing to strip. Run without --strip first.');
  report.backup = backup();
  for (const s of ['draft', 'published']) {
    const data = { ...byScope[s].data };
    delete data.posts;
    await api('PATCH', `site_content?scope=eq.${s}`, { data });
  }
  const after = await api('GET', 'site_content?select=scope,posts:data->posts');
  if (after.some((r) => r.posts != null)) fail('posts still present in site_content after strip.');
  console.log('✓ removed `posts` from both site_content rows (blog_posts is now the only copy; backup kept).');
  report.mode = 'strip';
  fs.writeFileSync(path.join(OUT, 'report-strip.json'), JSON.stringify(report, null, 2));
  process.exit(0);
}

// ── 5. copy ─────────────────────────────────────────────────────────────────────
const existing = { published: await readAll('published'), draft: await readAll('draft') };
if (existing.published.length || existing.draft.length) {
  const v = await verify();
  if (v.ok) {
    console.log('\nblog_posts already matches site_content exactly — nothing to do.');
    process.exit(0);
  }
  if (!args.has('--replace'))
    fail(
      `blog_posts already has rows (${existing.published.length} published, ${existing.draft.length} draft) that differ from site_content.\n` +
        '  Someone may have saved posts with the new admin since. Re-run with --replace to overwrite blog_posts from site_content.',
    );
}
report.backup = backup();
if (args.has('--replace')) for (const s of ['published', 'draft']) await api('DELETE', `blog_posts?scope=eq.${s}`);
for (const s of ['published', 'draft']) {
  const rows = expected[s];
  for (let i = 0; i < rows.length; i += 100)
    await api('POST', 'blog_posts?on_conflict=scope,id', rows.slice(i, i + 100), { Prefer: 'resolution=merge-duplicates,return=minimal' });
  console.log(`copied ${rows.length} ${s} posts`);
}
report.mode = 'copy';
report.verify = await verify();
fs.writeFileSync(path.join(OUT, 'report-copy.json'), JSON.stringify(report, null, 2));
if (!report.verify.ok)
  fail(`Copy finished but verification failed — see ${path.join(OUT, 'report-copy.json')}. site_content is untouched.`);
console.log(`\n✓ All posts copied and verified. site_content is untouched. Report: ${path.join(OUT, 'report-copy.json')}`);
