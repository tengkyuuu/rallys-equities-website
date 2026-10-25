import { expect, test } from '@playwright/test';
import { collectConsoleIssues } from './helpers';

/* Where editor invite and password-reset emails land. These run the page's script for
   real, so they also prove the CSP lets it run. */

test('an expired invite link explains the problem', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/set-password#error=access_denied&error_description=Email+link+is+invalid+or+has+expired');
  await expect(page.locator('h2')).toHaveText('Link problem');
  await expect(page.locator('.muted')).toHaveText('Email link is invalid or has expired');
  expect(issues.cspViolations).toEqual([]);
  expect(issues.pageErrors).toEqual([]);
});

test('a link without a session ends at "invalid", after verifying', async ({ page }) => {
  await page.goto('/set-password');
  await expect(page.locator('.boot-t')).toHaveText('Verifying your invite');
  await expect(page.locator('h2')).toHaveText('Link problem', { timeout: 10_000 });
});

test('the page is noindex and rendered per request (so its scripts carry the nonce)', async ({ request }) => {
  const res = await request.get('/set-password');
  const nonce = /'nonce-([^']+)'/.exec(res.headers()['content-security-policy'])![1];
  const html = await res.text();
  expect(html).toContain(`nonce="${nonce}"`);
  expect(html).toContain('<meta name="robots" content="noindex, nofollow"/>');
});
