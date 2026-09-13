const { test, expect } = require('@playwright/test');
const path = require('path');

// Unit-tests the actual exported handler from api/sitemap.js (not a reimplementation) by
// mocking global.fetch and a minimal res object — no running Vercel dev server needed.
function makeRes() {
  const res = { statusCode: null, headers: {}, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  res.send = (b) => { res.body = b; return res; };
  return res;
}

test('sitemap includes every static page plus published post slugs, and excludes drafts', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => [{
      data: {
        posts: [
          { slug: 'kse-100-outlook-q3', title: 'KSE-100 outlook for Q3', published: true, date: '2026-08-01' },
          { title: 'A legacy post with no slug field', published: true, date: '2026-07-01' }, // pre-slug post → falls back to post-<i>
          { slug: 'unpublished-draft', title: 'Draft', published: false, date: '2026-09-01' },
        ],
      },
    }],
  });
  delete require.cache[require.resolve('../api/sitemap.js')];
  const handler = require('../api/sitemap.js');
  const res = makeRes();
  await handler({}, res);
  global.fetch = originalFetch;

  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toContain('application/xml');
  expect(res.body).toContain('<loc>https://www.rallysequities.com/</loc>');
  expect(res.body).toContain('<loc>https://www.rallysequities.com/blog</loc>');
  expect(res.body).toContain('<loc>https://www.rallysequities.com/blog/kse-100-outlook-q3</loc>');
  expect(res.body).not.toContain('unpublished-draft');
  // no slug field → falls back to slugify(title), same as postSlug() on the client
  expect(res.body).toContain('<loc>https://www.rallysequities.com/blog/a-legacy-post-with-no-slug-field</loc>');
});

test('sitemap falls back to a numeric slug only when the title itself has no usable characters', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => [{ data: { posts: [{ title: '', published: true, date: '2026-08-01' }] } }],
  });
  delete require.cache[require.resolve('../api/sitemap.js')];
  const handler = require('../api/sitemap.js');
  const res = makeRes();
  await handler({}, res);
  global.fetch = originalFetch;
  expect(res.body).toContain('<loc>https://www.rallysequities.com/blog/post-0</loc>');
});

test('sitemap still returns the static paths if Supabase is unreachable', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('network down'); };
  delete require.cache[require.resolve('../api/sitemap.js')];
  const handler = require('../api/sitemap.js');
  const res = makeRes();
  await handler({}, res);
  global.fetch = originalFetch;

  expect(res.statusCode).toBe(200);
  expect(res.body).toContain('<loc>https://www.rallysequities.com/</loc>');
  expect(res.body).toContain('<loc>https://www.rallysequities.com/faq</loc>');
});
