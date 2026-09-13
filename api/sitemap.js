// ════════════════════════════════════════════════════════════════
// Vercel Serverless Function:  GET /sitemap.xml (rewritten from vercel.json)
// A hand-maintained static sitemap.xml goes stale the moment a new blog
// post is published — this generates it fresh each time, folding in every
// published post's real URL alongside the static page list. Reads the same
// Supabase config the public site already uses (editor/supabase-config.js)
// instead of duplicating the URL/anon key here.
// ════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.rallysequities.com';

// Mirrors PAGE_META's paths in index.html. Duplicated here (not imported) because this
// function runs in a separate Node runtime with no access to that client-side JS object —
// same trade-off already made for the vercel.json rewrite list and robots.txt.
const STATIC_PATHS = [
  '/', '/services', '/markets', '/contact', '/about', '/open-account', '/mission',
  '/management', '/rating', '/governance', '/services/trading', '/services/corporate-accounts',
  '/services/portfolio-management', '/services/market-research', '/services/shariah-investing',
  '/services/trading-platforms', '/services/support', '/investors/portal', '/investors/education',
  '/investors/financial-highlights', '/investors/awareness', '/investors/policies',
  '/tools/cagr-calculator', '/tools/sip-calculator', '/tools/investment-calculator',
  '/tools/depreciation-calculator', '/tools/ex-rate-calculator', '/tools/dcf-calculator',
  '/tools/fcf-calculator', '/tools/drawdown-calculator', '/faq', '/downloads', '/useful-links',
  '/complaints', '/careers', '/feedback', '/blog',
];

// Same slugify() as index.html/editor.js — must stay in sync with both.
function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function readSupabaseConfig() {
  try {
    const src = fs.readFileSync(path.join(process.cwd(), 'editor', 'supabase-config.js'), 'utf8');
    const url = (src.match(/url:\s*"([^"]*)"/) || [])[1];
    const anonKey = (src.match(/anonKey:\s*"([^"]*)"/) || [])[1];
    return url && anonKey ? { url, anonKey } : null;
  } catch {
    return null;
  }
}

// Mirrors renderBlog()'s exact filter+sort+index logic in index.html, so a legacy post
// that predates the slug field (and therefore falls back to "post-<i>") gets the SAME
// index here as it does on the live site — otherwise the sitemap could point at a
// slug that resolves to a different post than intended, or to nothing at all.
async function fetchPostSlugs() {
  const cfg = readSupabaseConfig();
  if (!cfg) return [];
  try {
    const r = await fetch(cfg.url + '/rest/v1/site_content?scope=eq.published&select=data', {
      headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey },
    });
    if (!r.ok) return [];
    const rows = await r.json();
    const posts = (rows && rows[0] && rows[0].data && rows[0].data.posts) || [];
    const pub = posts.filter((p) => p && p.published !== false)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    return pub.map((p, i) => p.slug || slugify(p.title) || ('post-' + i));
  } catch {
    return [];
  }
}

module.exports = async (req, res) => {
  const slugs = await fetchPostSlugs();
  const urls = [...STATIC_PATHS, ...slugs.map((s) => '/blog/' + s)];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => '<url><loc>' + BASE + u + '</loc></url>').join('\n')
    + '\n</urlset>\n';
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
