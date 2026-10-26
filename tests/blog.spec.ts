import { expect, test } from '@playwright/test';
import { collectConsoleIssues, marketDown } from './helpers';

// Fixture posts (tests/fixtures/content.json), newest first, drafts excluded:
//   kse-100-outlook-q3 · an-older-post-without-a-slug (no slug field) · post-2 (no title)

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});

test('the list is rendered on the server: newest post featured, the rest in the grid, drafts hidden', async ({ page, request }) => {
  const html = await (await request.get('/blog')).text();
  expect(html).toContain('KSE-100 Outlook for Q3'); // in the HTML itself, not fetched by the browser
  expect(html).not.toContain('Unpublished draft');
  await page.goto('/blog');
  await expect(page.locator('#blogFeat .blog-feat h3')).toHaveText('KSE-100 Outlook for Q3');
  await expect(page.locator('#blogList .blog-card')).toHaveCount(2);
  await expect(page.locator('#blogEmpty')).toBeHidden();
  await expect(page.locator('#blogFeat .blog-meta')).toContainText('August 1, 2026');
});

test('cards open their post (click and keyboard)', async ({ page }) => {
  await page.goto('/blog');
  await page.locator('#blogFeat .blog-feat').click();
  await expect(page).toHaveURL(/\/blog\/kse-100-outlook-q3$/);
  await page.goBack();
  await page.locator('#blogList .blog-card').first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/blog\/an-older-post-without-a-slug$/);
});

test('a post page has its own title, canonical URL and BlogPosting schema', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/blog/kse-100-outlook-q3');
  await expect(page).toHaveTitle('KSE-100 Outlook for Q3 — Rallys Equities Blogs');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.rallysequities.com/blog/kse-100-outlook-q3');
  await expect(page.locator('#page-post .blog-title')).toHaveText('KSE-100 Outlook for Q3');
  await expect(page.locator('#page-post .post-more .blog-card')).toHaveCount(2);
  const schema = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent!))
      .find((d) => d['@type'] === 'BlogPosting'),
  );
  expect(schema.headline).toBe('KSE-100 Outlook for Q3');
  expect(schema.datePublished).toContain('2026-08-01');
  expect(issues.pageErrors).toEqual([]);
});

test('posts without a slug or title still get working URLs', async ({ page }) => {
  await page.goto('/blog/an-older-post-without-a-slug');
  await expect(page.locator('#page-post .blog-title')).toHaveText('An Older Post Without A Slug');
  await page.goto('/blog/post-2');
  await expect(page.locator('#page-post .blog-title')).toHaveText('Untitled');
});

test('unknown and unpublished posts are 404s', async ({ page }) => {
  expect((await page.goto('/blog/no-such-post'))?.status()).toBe(404);
  expect((await page.goto('/blog/unpublished-draft'))?.status()).toBe(404);
});

test('copy-link shares the post URL; "All blogs" goes back to the list', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/blog/kse-100-outlook-q3');
  await page.locator('.post-sh', { hasText: 'Copy link' }).click();
  await expect(page.locator('.re-toast')).toContainText('Link copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/blog\/kse-100-outlook-q3$/);
  await page.locator('.blog-back').click();
  await expect(page).toHaveURL(/\/blog$/);
});

test('sitemap lists every page and every published post, never drafts', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.headers()['content-type']).toContain('xml');
  const xml = await res.text();
  for (const loc of [
    '/',
    '/services/trading',
    '/tools/dcf-calculator',
    '/faq',
    '/blog',
    '/blog/kse-100-outlook-q3',
    '/blog/an-older-post-without-a-slug',
    '/blog/post-2',
  ]) {
    expect(xml).toContain(`<loc>https://www.rallysequities.com${loc === '/' ? '/' : loc}</loc>`);
  }
  expect(xml).not.toContain('unpublished-draft');
  expect(xml.match(/<loc>https:\/\/www\.rallysequities\.com\/blog<\/loc>/g)).toHaveLength(1);
});

test('the list is paginated with real links once there are more posts than fit on a page', async () => {
  const { blogPage, pageWindow, PER_PAGE } = await import('../lib/blog-pages');
  const posts = Array.from({ length: 1 + PER_PAGE * 3 + 5 }, (_, i) => i); // 1 featured + 3 full pages + 5
  expect(blogPage(posts, 1)).toMatchObject({ featured: 0, pages: 4 });
  expect(blogPage(posts, 1)!.list).toHaveLength(PER_PAGE);
  expect(blogPage(posts, 4)!.list).toEqual([1 + PER_PAGE * 3, 2 + PER_PAGE * 3, 3 + PER_PAGE * 3, 4 + PER_PAGE * 3, 5 + PER_PAGE * 3]);
  expect(blogPage(posts, 4)!.featured).toBeUndefined();
  expect(blogPage(posts, 5)).toBeNull();
  expect(pageWindow(6, 36)).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 36]);
});
