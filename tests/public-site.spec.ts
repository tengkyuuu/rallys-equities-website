import { expect, test } from '@playwright/test';
import { collectConsoleIssues, marketDown } from './helpers';

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});

test('home page loads clean: no console, CSP or hydration errors', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/');
  await expect(page).toHaveTitle('Rallys Equities — SECP-Licensed PSX Stock Broker in Lahore');
  await expect(page.locator('#page-home')).toHaveClass(/active/);
  await expect(page.locator('#preloader')).toHaveClass(/done/);
  expect(issues.cspViolations).toEqual([]);
  expect(issues.pageErrors).toEqual([]);
  expect(issues.consoleErrors).toEqual([]);
});

test('every page route renders its own page with the right title', async ({ page }) => {
  const routes: [string, string, string][] = [
    ['/services', 'services', 'PSX Brokerage Services in Lahore — Rallys Equities'],
    ['/services/trading', 'trading', 'PSX Stock, IPO & ETF Trading — Rallys Equities'],
    ['/investors/policies', 'policies', 'Compliance Policies & Procedures — Rallys Equities'],
    ['/tools/dcf-calculator', 'dcf', 'DCF Calculator: Intrinsic Value of a Stock — Rallys Equities'],
    ['/contact', 'locations', 'Contact a PSX Stock Broker in Lahore — Rallys Equities'],
    ['/open-account', 'account', 'Open a PSX Trading Account Online — Rallys Equities'],
    ['/blog', 'insights', 'PSX Market Insights & Investing Blog — Rallys Equities'],
  ];
  for (const [path, id, title] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator(`#page-${id}`)).toHaveClass(/active/);
    await expect(page.locator('.page')).toHaveCount(1);
  }
});

test('nav and mega-menu links navigate client-side and light up their section', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/');
  await page.click('#nav-services');
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator('#nav-services')).toHaveClass(/active/);
  await page.locator('.nav-links .dd a[data-page="trading"]').click({ force: true });
  await expect(page).toHaveURL(/\/services\/trading$/);
  await expect(page.locator('#page-trading')).toHaveClass(/active/);
  await expect(page.locator('#nav-services')).toHaveClass(/active/); // sub-page keeps its parent lit
  expect(issues.cspViolations).toEqual([]);
});

test('buttons that navigate (not links) go to their page', async ({ page }) => {
  await page.goto('/');
  await page.locator('#page-home .hero-acts button', { hasText: 'Our Services' }).click();
  await expect(page).toHaveURL(/\/services$/);
  await page.locator('.nav .logo').click();
  await expect(page).toHaveURL(/\/$/);
});

test('browser Back / Forward walk real history', async ({ page }) => {
  await page.goto('/');
  await page.click('#nav-markets');
  await expect(page).toHaveURL(/\/markets$/);
  await page.locator('#nav-misc').click();
  await expect(page).toHaveURL(/\/faq$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/markets$/);
  await expect(page.locator('#page-markets')).toHaveClass(/active/);
  await page.goBack();
  await expect(page.locator('#page-home')).toHaveClass(/active/);
  await page.goForward();
  await expect(page).toHaveURL(/\/markets$/);
});

test('mobile menu opens, locks scrolling, and closes on navigation', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 850 });
  await page.goto('/');
  await page.click('#hamBtn');
  await expect(page.locator('#mnav')).toHaveClass(/open/);
  await expect(page.locator('#hamBtn')).toHaveClass(/open/);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.locator('#mnav a[data-page="faq"]').click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.locator('#mnav')).not.toHaveClass(/open/);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('theme toggle switches to light mode and remembers it', async ({ page }) => {
  await page.goto('/');
  await page.click('#themeToggle');
  await expect(page.locator('body')).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/light/); // applied before first paint, no flash
  await page.click('#themeToggle');
  await expect(page.locator('body')).not.toHaveClass(/light/);
});

test('policies open in the view-only viewer, which blocks save/print shortcuts', async ({ page }) => {
  await page.goto('/investors/policies');
  await page.locator('button[data-doc="complaint-policy"]').click();
  await expect(page.locator('#docOv')).toHaveClass(/open/);
  await expect(page.locator('#docTtl')).toHaveText('Complaint Policy');
  await expect(page.locator('#docFrame')).toHaveAttribute('src', /\/assets\/policies\/complaint-policy\.pdf#toolbar=0/);
  await page.keyboard.press('Control+s');
  await expect(page.locator('.re-toast')).toContainText('view-only');
  await page.keyboard.press('Escape');
  await expect(page.locator('#docOv')).not.toHaveClass(/open/);
});

test('an unknown URL gets the standalone 404 page with a 404 status', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  const res = await page.goto('/this-path-does-not-exist-xyz');
  expect(res?.status()).toBe(404);
  await expect(page.locator('.code')).toHaveText('404');
  await expect(page.locator('nav.nav')).toHaveCount(0);
  expect(issues.cspViolations).toEqual([]);
});

test('old URLs redirect: /index.html, /set-password.html, ?edit=1', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/services?edit=1');
  await expect(page).toHaveURL(/\/admin/);
});
