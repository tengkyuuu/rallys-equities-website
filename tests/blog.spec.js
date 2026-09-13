const { test, expect } = require('@playwright/test');
const { applySecurityHeaders, collectConsoleIssues } = require('./helpers');

test.beforeEach(async ({ context }) => {
  await applySecurityHeaders(context);
});

// There's no real published post in this environment, so these tests seed window.__POSTS
// directly (mirroring what renderBlog() would populate from real Supabase content) and
// drive the same functions the real site uses (openPost, postSlug, sharePost).

test('opening a post sets a real /blog/<slug> URL, title and BlogPosting schema', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    window.__POSTS = [{ title: 'KSE-100 Outlook for Q3', slug: 'kse-100-outlook-q3', excerpt: 'A short market note.', date: '2026-08-01', published: true }];
    document.getElementById('postView').innerHTML = ''; // openPost writes into this
    openPost(0);
    return {
      path: location.pathname,
      title: document.title,
      canonical: document.getElementById('metaCanon').getAttribute('href'),
      schema: JSON.parse(document.getElementById('postLd').textContent),
    };
  });
  expect(result.path).toBe('/blog/kse-100-outlook-q3');
  expect(result.title).toBe('KSE-100 Outlook for Q3 — Rallys Equities Blogs');
  expect(result.canonical).toBe('http://localhost:4173/blog/kse-100-outlook-q3');
  expect(result.schema['@type']).toBe('BlogPosting');
  expect(result.schema.headline).toBe('KSE-100 Outlook for Q3');
  expect(result.schema.datePublished).toContain('2026-08-01');
});

test('navigating away from a post removes its BlogPosting schema', async ({ page }) => {
  await page.goto('/');
  const hasSchemaAfterLeaving = await page.evaluate(() => {
    window.__POSTS = [{ title: 'Test Post', slug: 'test-post', excerpt: 'x', date: '2026-08-01', published: true }];
    document.getElementById('postView').innerHTML = '';
    openPost(0);
    showPage('home');
    return !!document.getElementById('postLd');
  });
  expect(hasSchemaAfterLeaving).toBe(false);
});

test('a legacy post with no slug field still gets a working URL derived from its title', async ({ page }) => {
  await page.goto('/');
  const path = await page.evaluate(() => {
    window.__POSTS = [{ title: 'An Older Post Without A Slug', excerpt: 'x', date: '2026-01-01', published: true }];
    document.getElementById('postView').innerHTML = '';
    openPost(0);
    return location.pathname;
  });
  expect(path).toBe('/blog/an-older-post-without-a-slug');
});

test('direct deep link to /blog/<slug> resolves once the matching post loads', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/blog/kse-100-outlook-q3');
  await page.waitForTimeout(300);
  // simulate the async Supabase content arriving after boot, same as renderBlog() does on the real site
  const path = await page.evaluate(() => {
    renderBlog([{ title: 'KSE-100 Outlook for Q3', slug: 'kse-100-outlook-q3', excerpt: 'x', date: '2026-08-01', published: true }]);
    return location.pathname;
  });
  expect(path).toBe('/blog/kse-100-outlook-q3');
  const title = await page.title();
  expect(title).toBe('KSE-100 Outlook for Q3 — Rallys Equities Blogs');
  expect(issues.pageErrors).toEqual([]);
});

test('copy-link shares the real post URL, not the generic /blog list page', async ({ page }) => {
  await page.goto('/');
  const copied = await page.evaluate(async () => {
    window.__POSTS = [{ title: 'Shareable Post', slug: 'shareable-post', excerpt: 'x', date: '2026-08-01', published: true }];
    let captured = null;
    navigator.clipboard.writeText = (t) => { captured = t; return Promise.resolve(); };
    sharePost('copy', 0);
    return captured;
  });
  expect(copied).toBe('http://localhost:4173/blog/shareable-post');
});
