import { expect, test, type Page } from '@playwright/test';
import { collectConsoleIssues, marketDown } from './helpers';

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});

const ld = (page: Page, type: string) =>
  page.evaluate(
    (t) =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => JSON.parse(s.textContent || '{}'))
        .find((d) => d['@type'] === t),
    type,
  );

test('each page has its own title, description, canonical and Open Graph tags in the HTML', async ({ request }) => {
  const html = await (await request.get('/mission')).text();
  expect(html).toContain('<title>Our Mission &amp; Vision — Rallys Equities</title>');
  expect(html).toMatch(/<meta name="description" content="Building success through trust, transparency/);
  expect(html).toContain('<link rel="canonical" href="https://www.rallysequities.com/mission"/>');
  expect(html).toContain('<meta property="og:title" content="Our Mission &amp; Vision — Rallys Equities"/>');
  expect(html).toContain('<meta name="robots" content="index, follow"/>');
});

test('metadata is in <head> on first byte (no streamed metadata)', async ({ request }) => {
  const html = await (await request.get('/faq')).text();
  expect(html.indexOf('<title>')).toBeLessThan(html.indexOf('<body'));
});

test('breadcrumb JSON-LD: 3 levels under a real hub, 2 otherwise, none on home', async ({ page }) => {
  await page.goto('/');
  expect(await ld(page, 'BreadcrumbList')).toBeUndefined();
  await page.goto('/services/trading');
  expect((await ld(page, 'BreadcrumbList')).itemListElement.map((i: { name: string }) => i.name)).toEqual([
    'Home',
    'Our Services',
    'Investment & Trading',
  ]);
  await page.goto('/tools/cagr-calculator');
  expect((await ld(page, 'BreadcrumbList')).itemListElement.map((i: { name: string }) => i.name)).toEqual(['Home', 'CAGR Calculator']);
});

test('organisation schema on every page; FAQPage schema mirrors the visible FAQ', async ({ page }) => {
  await page.goto('/faq');
  expect((await ld(page, 'FinancialService')).name).toBe('Rallys Equities (Pvt) Ltd');
  const visible = await page.locator('#page-faq .faq-item').count();
  const faq = await ld(page, 'FAQPage');
  expect(faq.mainEntity.length).toBe(visible);
  expect(faq.mainEntity[0].name).toBe(await page.locator('#page-faq .faq-item summary').first().textContent());
});

test('Google Fonts and the Google Maps embed load without CSP violations', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/contact');
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.lt-main')!).fontFamily)).toContain('Cormorant Garamond');
  await expect(page.locator('.ct-map iframe')).toHaveCount(1);
  expect(issues.cspViolations).toEqual([]);
});

test('robots.txt keeps crawlers out of the admin and points at the sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain('Disallow: /admin');
  expect(txt).toContain('Sitemap: https://www.rallysequities.com/sitemap.xml');
});

test('/admin and /set-password are noindex', async ({ request }) => {
  for (const p of ['/admin', '/set-password'])
    expect(await (await request.get(p)).text()).toContain('<meta name="robots" content="noindex, nofollow"/>');
});
