const { test, expect } = require('@playwright/test');
const { applySecurityHeaders, collectConsoleIssues } = require('./helpers');

test.beforeEach(async ({ context }) => {
  await applySecurityHeaders(context);
});

test('admin (?edit=1) boots and loads editor.js + Supabase CDN script without CSP violations', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/?edit=1');
  await page.waitForTimeout(2500);
  const preloaderExists = await page.locator('#preloader').count();
  expect(preloaderExists).toBeGreaterThan(0);
  expect(issues.cspViolations).toEqual([]);
});

test('admin mode never rewrites the address bar', async ({ page }) => {
  await page.goto('/?edit=1');
  await page.waitForTimeout(1000);
  await page.evaluate(() => showPage('services'));
  await page.waitForTimeout(300);
  const url = new URL(page.url());
  expect(url.pathname).toBe('/');
  expect(url.search).toBe('?edit=1');
});
