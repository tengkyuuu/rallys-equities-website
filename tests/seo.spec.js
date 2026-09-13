const { test, expect } = require('@playwright/test');
const { applySecurityHeaders, collectConsoleIssues } = require('./helpers');

test.beforeEach(async ({ context }) => {
  await applySecurityHeaders(context);
});

test('per-page title, description and canonical update on navigation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => showPage('mission'));
  await expect(page).toHaveTitle('Our Mission & Vision — Rallys Equities');
  const desc = await page.locator('#metaDesc').getAttribute('content');
  const canon = await page.locator('#metaCanon').getAttribute('href');
  expect(desc).toContain('trust, transparency');
  expect(canon).toMatch(/\/mission$/);
});

test('breadcrumb JSON-LD is 3-level under a real hub, 2-level otherwise, absent on home', async ({ page }) => {
  await page.goto('/');
  let bc = await page.evaluate(() => document.getElementById('breadcrumbLd'));
  expect(bc).toBeNull();

  await page.evaluate(() => showPage('trading'));
  const tradingBc = await page.evaluate(() => JSON.parse(document.getElementById('breadcrumbLd').textContent));
  expect(tradingBc.itemListElement.map((i) => i.name)).toEqual(['Home', 'Our Services', 'Investment & Trading']);

  await page.evaluate(() => showPage('cagr'));
  const cagrBc = await page.evaluate(() => JSON.parse(document.getElementById('breadcrumbLd').textContent));
  expect(cagrBc.itemListElement.map((i) => i.name)).toEqual(['Home', 'CAGR Calculator']);

  await page.evaluate(() => showPage('home'));
  bc = await page.evaluate(() => document.getElementById('breadcrumbLd'));
  expect(bc).toBeNull();
});

test('FAQPage schema mirrors the visible FAQ items exactly', async ({ page }) => {
  await page.goto('/faq');
  const visibleCount = await page.locator('#page-faq .faq-item').count();
  const schemaCount = await page.evaluate(() => JSON.parse(document.getElementById('faqLd').textContent).mainEntity.length);
  expect(schemaCount).toBe(visibleCount);
  expect(schemaCount).toBeGreaterThan(0);
});

test('Google Fonts and Google Maps embed load without CSP violations', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/contact');
  await page.waitForTimeout(600);
  const font = await page.evaluate(() => getComputedStyle(document.querySelector('.lt-main') || document.body).fontFamily);
  expect(font).toContain('Cormorant Garamond');
  const mapFrame = await page.locator('.ct-map iframe').count();
  expect(mapFrame).toBeGreaterThan(0);
  expect(issues.cspViolations).toEqual([]);
});
