import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { freshIp, marketDown } from './helpers';

async function contact(page: Page) {
  await page.goto('/contact');
  await page.fill('#cf-name', 'Ayesha Khan');
  await page.fill('#cf-email', 'ayesha@example.com');
  await page.selectOption('#cf-subj', 'Client Support');
  await page.fill('#cf-msg', 'Please help me with my trading account.');
}
async function capture(page: Page, name: string) {
  await mkdir('screenshots/ui-states', { recursive: true });
  await page
    .locator('#cfBox')
    .screenshot({
      path: `screenshots/ui-states/${name}.png`,
    style: 'nav.nav, #tickerWrap, .wa-fab, #toTop, #scrollProg { visibility: hidden !important; }',
    });
}
test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': freshIp() });
  await marketDown(page);
});

test('inline errors are associated with inputs and clear when edited', async ({ page }) => {
  await page.goto('/contact');
  await page.click('#cfBox .fnext');
  await expect(page.locator('#cf-name')).toBeFocused();
  await expect(page.locator('#cf-email')).toHaveAttribute('aria-describedby', 'cf-email-error');
  await expect(page.locator('#cf-email-error')).toContainText('valid email');
  await capture(page, 'inline-validation-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await capture(page, 'inline-validation-mobile');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.fill('#cf-email', 'ayesha@example.com');
  await expect(page.locator('#cf-email-error')).toHaveCount(0);
});

test('sending prevents duplicates and explains a slow connection', async ({ page }) => {
  let sends = 0;
  await page.route('**/api/submissions', async (route) => {
    sends++;
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    await route.fulfill({ json: { ok: true } });
  });
  await contact(page);
  await page.click('#cfBox .fnext');
  await expect(page.locator('#cfBox .fnext')).toBeDisabled();
  await expect(page.locator('#cfBox .form-status')).toContainText('taking longer', { timeout: 12_000 });
  await capture(page, 'slow-connection');
  await expect(page.locator('#cfDone')).toBeVisible();
  expect(sends).toBe(1);
  await page.locator('#cfDone').screenshot({ path: 'screenshots/ui-states/success.png' });
});

test('offline blocks sending and reconnecting preserves input', async ({ page, context }) => {
  await contact(page);
  await context.setOffline(true);
  await expect(page.locator('#cfBox .form-status')).toContainText('offline');
  await expect(page.locator('#cfBox .fnext')).toBeDisabled();
  await capture(page, 'offline');
  await context.setOffline(false);
  await expect(page.locator('#cfBox .fnext')).toBeEnabled();
  await expect(page.locator('#cf-msg')).toHaveValue('Please help me with my trading account.');
});

test('rate limit countdown prevents immediate retries without discarding values', async ({ page }) => {
  await page.route('**/api/submissions', (route) =>
    route.fulfill({ status: 429, headers: { 'Retry-After': '3' }, json: { error: 'Too many attempts. Please wait before trying again.' } }),
  );
  await contact(page);
  await page.click('#cfBox .fnext');
  await expect(page.locator('#cfBox .form-status')).toContainText('Too many attempts');
  await expect(page.locator('#cfBox .fnext')).toBeDisabled();
  await capture(page, 'rate-limited');
  await expect(page.locator('#cfBox .fnext')).toBeEnabled({ timeout: 5000 });
  await expect(page.locator('#cf-name')).toHaveValue('Ayesha Khan');
});

for (const status of [403, 502]) {
  test(`${status} errors provide persistent recovery and retain the form`, async ({ page }) => {
    await page.route('**/api/submissions', (route) => route.fulfill({ status, json: { error: 'save-failed' } }));
    await contact(page);
    await page.click('#cfBox .fnext');
    await expect(page.locator('#cfBox .form-status')).toContainText(status === 403 ? 'blocked for security' : 'couldn’t');
    await expect(page.locator('#cfDone')).toBeHidden();
    await expect(page.locator('#cfBox .fnext')).toBeEnabled();
    await capture(page, status === 403 ? 'permission-denied' : 'recoverable-error');
  });
}

test('server validation messages appear under the exact input', async ({ page }) => {
  await page.route('**/api/submissions', (route) =>
    route.fulfill({
      status: 400,
      json: { error: 'Please complete the highlighted fields.', fields: { email: 'Use a valid email address.' } },
    }),
  );
  await contact(page);
  await page.click('#cfBox .fnext');
  await expect(page.locator('#cf-email-error')).toHaveText('Use a valid email address.');
  await expect(page.locator('#cf-email')).toBeFocused();
});
