const { test, expect } = require('@playwright/test');
const { applySecurityHeaders, collectConsoleIssues } = require('./helpers');

test.beforeEach(async ({ context }) => {
  await applySecurityHeaders(context);
});

test('home page loads clean, no console/CSP errors', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Rallys Equities/);
  expect(issues.cspViolations).toEqual([]);
  expect(issues.pageErrors).toEqual([]);
});

test('direct deep link to a nested path renders the right page', async ({ page }) => {
  await page.goto('/services/trading');
  await expect(page).toHaveTitle('Investment & Trading — Rallys Equities');
  await expect(page.locator('#page-trading')).toHaveClass(/active/);
  await expect(page.locator('#page-home')).not.toHaveClass(/active/);
  await expect(page.locator('#nav-services')).toHaveClass(/active/);
});

test('nav click and mega-menu click update the URL without a full reload', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/');
  await page.click('#nav-services');
  await expect(page).toHaveURL(/\/services$/);

  const tradingLink = page.locator('[onclick*="showPage(\'trading\')"]').first();
  await tradingLink.click({ force: true });
  await expect(page).toHaveURL(/\/services\/trading$/);
  expect(issues.cspViolations).toEqual([]);
});

test('browser Back/Forward walks real history correctly', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => showPage('markets'));
  await page.evaluate(() => showPage('faq'));
  await expect(page).toHaveURL(/\/faq$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/markets$/);
  await expect(page.locator('#page-markets')).toHaveClass(/active/);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#page-home')).toHaveClass(/active/);

  await page.goForward();
  await expect(page).toHaveURL(/\/markets$/);
});

test('mobile menu opens and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 850 });
  await page.goto('/');
  await page.click('#hamBtn');
  await expect(page.locator('#mnav')).toHaveClass(/open/);
  const homeLink = page.locator('#mnav [onclick*="showPage(\'home\')"]').first();
  await homeLink.click({ force: true });
  await expect(page.locator('#mnav')).not.toHaveClass(/open/);
});

test('an unmapped path still loads the SPA shell without JS errors', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/this-path-does-not-exist-xyz');
  expect(issues.pageErrors).toEqual([]);
});
