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
  expect(html).toMatch(/<meta name="description" content="Our mission: make PSX investing transparent/);
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

test('every page has exactly one h1', async ({ request }) => {
  for (const p of ['/', '/services', '/contact', '/about', '/open-account', '/investors/education', '/tools/cagr-calculator', '/blog']) {
    const html = await (await request.get(p)).text();
    expect((html.match(/<h1[\s>]/g) || []).length, p).toBe(1);
  }
});

test('each page has its own 1200×630 share image, and the card is a real PNG', async ({ request }) => {
  const html = await (await request.get('/services')).text();
  expect(html).toContain('<meta property="og:image" content="https://www.rallysequities.com/og/services"/>');
  expect(html).toContain('<meta name="twitter:card" content="summary_large_image"/>');
  expect(html).toContain('<meta property="og:locale" content="en_PK"/>');
  const img = await request.get('/og/services');
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toBe('image/png');
  const png = await img.body();
  expect(png.readUInt32BE(16)).toBe(1200); // IHDR width
  expect(png.readUInt32BE(20)).toBe(630); // IHDR height
});

test('structured data: business details, website, services and free calculators', async ({ page }) => {
  await page.goto('/services/shariah-investing');
  const org = await ld(page, 'FinancialService');
  expect(org.address.streetAddress).toContain('Lahore Stock Exchange Building');
  expect(org.identifier.value).toBe('553');
  expect(org.openingHoursSpecification.opens).toBe('09:00');
  expect((await ld(page, 'WebSite')).url).toBe('https://www.rallysequities.com/');
  const service = await ld(page, 'Service');
  expect(service.provider['@id']).toBe(org['@id']);
  await page.goto('/tools/sip-calculator');
  const app = await ld(page, 'WebApplication');
  expect(app.offers.price).toBe('0');
  expect(app.applicationCategory).toBe('FinanceApplication');
});

test('Urdu text is marked as Urdu', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect((html.match(/lang="ur"/g) || []).length).toBeGreaterThanOrEqual(5);
});

test('blog list pages: out-of-range or junk page numbers are 404s, page 1 canonical is /blog', async ({ request }) => {
  expect((await request.get('/blog?page=99')).status()).toBe(404);
  expect((await request.get('/blog?page=abc')).status()).toBe(404);
  const html = await (await request.get('/blog?page=1')).text();
  expect(html).toContain('<link rel="canonical" href="https://www.rallysequities.com/blog"/>');
});
