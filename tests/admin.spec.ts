import { expect, test, type Page } from '@playwright/test';
import { EDITOR, collectConsoleIssues, marketDown, mockState, resetContent } from './helpers';

/* The visual editor (public/editor.js) on /admin, signed in against the mock Supabase.
   Publishing writes the mock's `published` row and revalidates the site, so a second page
   plays the visitor. Content is reset after every test. */

type Api = { showPage(id: string): void };
const showPage = (page: Page, id: string) => page.evaluate((i) => (window as unknown as { RE_API: Api }).RE_API.showPage(i), id);
const plan = (page: Page, id: string) => page.locator(`.prc[data-plan="${id}"]`);

async function signIn(page: Page) {
  await page.goto('/admin');
  await page.fill('.re-login input[type="email"]', EDITOR.email);
  await page.fill('.re-login input[type="password"]', EDITOR.password);
  await page.click('.re-login .re-btn-pri');
  await page.locator('.re-side-nav').getByText('Edit website').click();
  await page.waitForSelector('.re-bar');
}

async function publish(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.click('.re-bar button:has-text("Publish")');
  await page.click('.re-overlay button:has-text("Publish")');
  await expect(page.locator('.re-count')).toHaveText('All changes saved');
}

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});
test.afterEach(async ({ request }) => {
  await resetContent(request);
});

test('admin boots with every page in one document, loads the editor, no CSP violations', async ({ page }) => {
  const issues = collectConsoleIssues(page);
  await page.goto('/admin');
  await expect(page.locator('.re-login')).toBeVisible();
  expect(await page.locator('.page').count()).toBe(38);
  await expect(page.locator('#page-home')).toHaveClass(/active/);
  await expect(page.locator('#preloader')).toHaveClass(/done/);
  expect(issues.cspViolations).toEqual([]);
  expect(issues.pageErrors).toEqual([]);
});

test('in the admin, links switch pages in place and never leave /admin', async ({ page }) => {
  await page.goto('/admin');
  await page.evaluate(() => (document.querySelector('#nav-services') as HTMLElement).click());
  await expect(page.locator('#page-services')).toHaveClass(/active/);
  await expect(page.locator('#page-home')).not.toHaveClass(/active/);
  await expect(page.locator('#nav-services')).toHaveClass(/active/);
  expect(new URL(page.url()).pathname).toBe('/admin');
});

test('wrong password is refused', async ({ page }) => {
  await page.goto('/admin');
  await page.fill('.re-login input[type="email"]', EDITOR.email);
  await page.fill('.re-login input[type="password"]', 'wrong');
  await page.click('.re-login .re-btn-pri');
  await expect(page.locator('.re-login')).toContainText(/invalid/i);
});

test('pricing panel edits, highlights and hides plans, and visitors see it after publish', async ({ page, context, request }) => {
  const issues = collectConsoleIssues(page);
  await signIn(page);
  await showPage(page, 'services');
  await plan(page, 'individual').locator('.prc-price').click();
  await expect(page.locator('.re-pricing.open')).toHaveCount(1);
  await expect(page.locator('[data-f="individual.price"]')).toBeFocused();
  await page.keyboard.type('PKR 500');
  await expect(plan(page, 'individual').locator('.prc-price')).toHaveText('PKR 500');

  const panel = page.locator('.re-pricing');
  await panel.locator('[data-sec="individual"] .re-siterow', { hasText: 'Highlight' }).click();
  await panel.locator('[data-sec="corporate"] .re-siterow').first().click();
  await expect(plan(page, 'individual')).toHaveClass(/feat/);
  await expect(plan(page, 'corporate')).toHaveClass(/prc-off/);
  await publish(page);
  expect(
    (await mockState(request)).site_content.find((r: { scope: string }) => r.scope === 'published').data.pricing.plans.individual.price,
  ).toBe('PKR 500');

  const visitor = await context.newPage();
  await marketDown(visitor);
  await visitor.goto('/services');
  await expect(plan(visitor, 'individual').locator('.prc-price')).toHaveText('PKR 500');
  await expect(plan(visitor, 'individual').locator('.prc-price')).toHaveClass(/prc-mid/);
  await expect(plan(visitor, 'individual').locator('.prc-badge')).toBeVisible();
  await expect(plan(visitor, 'shariah').locator('.prc-badge')).toHaveCount(0);
  await expect(plan(visitor, 'corporate')).toBeHidden();
  expect(issues.pageErrors).toEqual([]);
});

test('text toolbar Done / Original, and Undo', async ({ page }) => {
  await signIn(page);
  await showPage(page, 'services');
  const sub = page.locator('[data-edit="plans.sub"]');
  const original = (await sub.textContent())!.trim();
  await sub.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' NEW');
  await page.locator('.re-fmt button[aria-label="Done (Enter)"]').dispatchEvent('mousedown');
  await expect(sub).toHaveText(original + ' NEW');

  // "Original" compares against /admin's untouched server markup
  await sub.click();
  await page.locator('.re-fmt button[aria-label="Put back the original wording"]').dispatchEvent('mousedown');
  await expect(sub).toHaveText(original);
  await expect(page.locator('.re-count')).toHaveText('All changes saved');
  await page.locator('.re-bar button[aria-label="Undo"]').click();
  await expect(sub).toHaveText(original + ' NEW');
});

test('a text edit published from the editor shows for visitors, after client-side navigation too', async ({ page, context }) => {
  await signIn(page);
  await showPage(page, 'about');
  // a handle, not a locator: once edited, the heading gains data-edit and no longer matches the selector
  const h2 = (await page.locator('#page-about h2:not([data-edit])').first().elementHandle())!;
  await h2.click();
  await page.keyboard.press('End');
  await page.keyboard.type(' ZZ');
  await page.keyboard.press('Enter');
  const key = (await h2.getAttribute('data-edit'))!;
  expect(key).toMatch(/h2\d/); // a position key (possibly anchored to a tagged ancestor)
  await publish(page);

  const visitor = await context.newPage();
  await marketDown(visitor);
  await visitor.goto('/about');
  await expect(visitor.locator('#page-about h2', { hasText: / ZZ$/ })).toHaveCount(1);
  await visitor.goto('/faq');
  await visitor.locator('#nav-about').click(); // waits for the preloader to lift
  await expect(visitor).toHaveURL(/\/about$/);
  await expect(visitor.locator('#page-about h2', { hasText: / ZZ$/ })).toHaveCount(1);
});

test('hiding a page in the editor hides it for visitors', async ({ page, context }) => {
  await signIn(page);
  await page.locator('.re-bar button[aria-label="Site"], .re-bar button:has-text("Site")').first().click();
  await page.locator('.re-group', { hasText: 'Pages' }).locator('.re-siterow', { hasText: 'Careers' }).click();
  await publish(page);
  const visitor = await context.newPage();
  await marketDown(visitor);
  await visitor.goto('/careers');
  await expect(visitor).toHaveURL(/\/$/);
});

test('leaving with unsaved changes asks first', async ({ page }) => {
  await signIn(page);
  await showPage(page, 'services');
  await plan(page, 'individual').locator('.prc-price').click();
  await page.keyboard.type('PKR 9');
  const dialog = new Promise((res) =>
    page.once('dialog', (d) => {
      res(d.type());
      d.dismiss().catch(() => {});
    }),
  );
  await page.close({ runBeforeUnload: true });
  expect(await dialog).toBe('beforeunload');
});
