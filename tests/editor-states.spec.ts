import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { EDITOR, marketDown, resetContent } from './helpers';

async function login(page: Page) {
  await page.fill('.re-login input[type="email"]', EDITOR.email);
  await page.fill('.re-login input[type="password"]', EDITOR.password);
  await page.click('.re-login .re-btn-pri');
  await expect(page.locator('.re-login')).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});
test.afterEach(async ({ request }) => {
  await resetContent(request);
});

test('inbox empty and zero-search states provide recovery actions', async ({ page }) => {
  let hasData = false;
  await page.route('**/rest/v1/form_submissions?*', (route) =>
    route.fulfill({
      json: hasData
        ? [
            {
              id: 'example',
              kind: 'contact',
              created_at: new Date().toISOString(),
              data: { name: 'Ayesha Khan', email: 'ayesha@example.com', message: 'Account inquiry' },
              files: [],
            },
          ]
        : [],
    }),
  );
  await page.goto('/admin');
  await login(page);
  await page.locator('[data-nav="submissions"]').click();
  await expect(page.locator('.re-sub-list')).toContainText('No submissions yet');
  await mkdir('screenshots/ui-states', { recursive: true });
  await page.locator('.re-main-inner').screenshot({ path: 'screenshots/ui-states/empty-inbox.png' });
  hasData = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.locator('.re-sub-list')).toContainText('Ayesha Khan');
  await page.getByRole('searchbox', { name: 'Search submissions' }).fill('no-such-person');
  await expect(page.locator('.re-sub-list')).toContainText('No matching submissions');
  await page.locator('.re-main-inner').screenshot({ path: 'screenshots/ui-states/zero-search-results.png' });
  await page.getByRole('button', { name: 'Clear search and filters' }).click();
  await expect(page.locator('.re-sub-list')).toContainText('Ayesha Khan');
});

test('expired editor session keeps an unsaved blog composition for the same account', async ({ page }) => {
  await page.goto('/admin');
  await login(page);
  await page.locator('[data-nav="blog"]').click();
  await page.getByRole('button', { name: 'Write a new post', exact: true }).first().click();
  await page.getByRole('textbox', { name: 'Post title', exact: true }).fill('A private draft to recover');
  await page.locator('.re-postbody').fill('This composition must survive session expiry.');
  await page.evaluate(async () => {
    type Client = { auth: { getSession(): Promise<unknown>; signOut(): Promise<unknown> } };
    const w = window as unknown as {
      supabase: { createClient(url: string, key: string): Client };
      RE_SUPABASE: { url: string; anonKey: string };
    };
    const client = w.supabase.createClient(w.RE_SUPABASE.url, w.RE_SUPABASE.anonKey);
    await client.auth.getSession();
    await client.auth.signOut();
  });
  await expect(page.locator('.re-login')).toContainText('Your session expired');
  const recovery = await page.evaluate(() =>
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith('re-recovery:'))
      .map((key) => sessionStorage.getItem(key))
      .join(''),
  );
  expect(recovery).toContain('A private draft to recover');
  expect(recovery).toContain('This composition must survive');
  await mkdir('screenshots/ui-states', { recursive: true });
  await page.locator('.re-login-card').screenshot({ path: 'screenshots/ui-states/session-expired.png' });
  await login(page);
  await page.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await page.locator('[data-nav="blog"]').click();
  await expect(page.locator('.re-post-list, .re-sub-list')).toContainText('A private draft to recover');
});
