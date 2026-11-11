#!/usr/bin/env node
// Live-site health check, run every 15 minutes by .github/workflows/monitor.yml.
// Checks what a visitor would notice (pages load, the blog has its posts, old links work)
// plus the database directly. Any failure exits 1, so GitHub emails the repo owner.
// Each check retries before failing, so one slow response doesn't raise an alarm.
//
//   node scripts/monitor.mjs                  check https://www.rallysequities.com
//   SITE=http://localhost:3000 node scripts/monitor.mjs
//
// Querying the database every 15 minutes also keeps the Free-plan project from being
// paused for inactivity.
import fs from 'node:fs';

const SITE = (process.env.SITE || 'https://www.rallysequities.com').replace(/\/$/, '');
const MIN_POSTS = Number(process.env.MIN_POSTS || 900); // fewer live posts than this = something is wrong
const ATTEMPTS = 3;

// The public (anon) key is meant to be public; take it from the site's own config.
const cfg = fs.readFileSync(new URL('../lib/supabase-config.ts', import.meta.url), 'utf8');
const SB_URL = process.env.SUPABASE_URL || /SUPABASE_URL \|\| '([^']+)'/.exec(cfg)?.[1];
const SB_ANON = process.env.SUPABASE_ANON_KEY || /SUPABASE_ANON_KEY \|\|\s*'([^']+)'/.exec(cfg)?.[1];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, headers = {}) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'RallysEquities-HealthCheck/1.0', ...headers },
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  });
  return { status: r.status, headers: r.headers, text: await r.text() };
}

const results = [];
async function check(name, fn) {
  let last;
  for (let i = 1; i <= ATTEMPTS; i++) {
    try {
      const detail = await fn();
      results.push({ name, ok: true, detail });
      return;
    } catch (e) {
      last = e;
      if (i < ATTEMPTS) await sleep(15_000);
    }
  }
  results.push({ name, ok: false, detail: last?.message || String(last) });
}
const must = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

let firstPost = null;

await check('Home page', async () => {
  const r = await get(SITE + '/');
  must(r.status === 200, `HTTP ${r.status}`);
  must(/Rallys Equities/i.test(r.text), 'page has no "Rallys Equities" text');
  return 'HTTP 200';
});

await check('Blog list shows posts', async () => {
  const r = await get(SITE + '/blog');
  must(r.status === 200, `HTTP ${r.status}`);
  const links = [...new Set((r.text.match(/href="\/blog\/[^"?#]+"/g) || []).map((s) => s.slice(6, -1)))];
  must(links.length >= 10, `only ${links.length} post links on /blog`);
  firstPost = links[0];
  return `${links.length} posts on page 1`;
});

await check('A blog post opens', async () => {
  must(firstPost, 'no post link found on /blog');
  const r = await get(SITE + firstPost);
  must(r.status === 200, `${firstPost} → HTTP ${r.status}`);
  must(/class="blog-title"/.test(r.text) && /class="blog-post"/.test(r.text), `${firstPost} has no post content`);
  return firstPost;
});

await check('Sitemap lists every post', async () => {
  const r = await get(SITE + '/sitemap.xml');
  must(r.status === 200, `HTTP ${r.status}`);
  const n = (r.text.match(/\/blog\/[^<]+<\/loc>/g) || []).length;
  must(n >= MIN_POSTS, `${n} post URLs (expected at least ${MIN_POSTS})`);
  return `${n} post URLs`;
});

await check('Admin page loads', async () => {
  const r = await get(SITE + '/admin');
  must(r.status === 200, `HTTP ${r.status}`);
  return 'HTTP 200';
});

await check('Database answers and holds the posts', async () => {
  must(SB_URL && SB_ANON, 'could not read the Supabase URL/key from lib/supabase-config.ts');
  const r = await get(`${SB_URL}/rest/v1/blog_posts?scope=eq.published&published=eq.true&select=id`, {
    apikey: SB_ANON,
    Authorization: `Bearer ${SB_ANON}`,
    Prefer: 'count=exact',
    Range: '0-0',
  });
  must(r.status === 200 || r.status === 206, `HTTP ${r.status} ${r.text.slice(0, 120)}`);
  const total = Number((r.headers.get('content-range') || '').split('/')[1]);
  must(total >= MIN_POSTS, `${total} published posts in the database (expected at least ${MIN_POSTS})`);
  return `${total} published posts`;
});

const bad = results.filter((r) => !r.ok);
const lines = results.map((r) => `${r.ok ? '✅' : '❌'} ${r.name} — ${r.detail}`);
console.log(`Health check for ${SITE} at ${new Date().toISOString()}\n` + lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### ${bad.length ? '❌ Problems found' : '✅ All good'} — ${SITE}\n\n${lines.map((l) => `- ${l}`).join('\n')}\n`,
  );
process.exit(bad.length ? 1 : 0);
