import { expect, test, type Page } from '@playwright/test';
import { EDITOR, marketDown, mockState, resetContent } from './helpers';

/* Guards added after the November 2026 review (docs/risk-assessment-2026-11.md):
   two editors can't overwrite each other, deletes wait until the admin knows what is live,
   and every change shows up in the Activity history. */

async function signInToBlog(page: Page) {
  await marketDown(page);
  await page.goto('/admin');
  await page.fill('.re-login input[type="email"]', EDITOR.email);
  await page.fill('.re-login input[type="password"]', EDITOR.password);
  await page.click('.re-login .re-btn-pri');
  await page.locator('[data-nav="blog"]').click();
  await expect(page.locator('.re-post-row')).toHaveCount(4);
}

async function editTitle(page: Page, from: string, to: string) {
  await page.locator('.re-post-row', { hasText: from }).getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('.re-postbody')).not.toContainText('Loading');
  await page.getByRole('textbox', { name: 'Post title' }).fill(to);
}

test.afterEach(async ({ request }) => {
  await resetContent(request);
});

test('a second editor saving over newer changes is stopped, not silently overwriting', async ({ browser, request }) => {
  const a = await (await browser.newContext()).newPage();
  const b = await (await browser.newContext()).newPage();
  await signInToBlog(a);
  await signInToBlog(b); // both loaded the same draft

  await editTitle(a, 'KSE-100 Outlook for Q3', 'Edited by A');
  await a.getByRole('button', { name: 'Save without publishing' }).click();
  await expect(a.locator('.re-post-row', { hasText: 'Edited by A' })).toBeVisible();

  await editTitle(b, 'An Older Post Without A Slug', 'Edited by B');
  await b.getByRole('button', { name: 'Save without publishing' }).click();
  await expect(b.locator('.re-toast')).toContainText('Someone else saved changes');

  const draft = (await mockState(request)).blog_posts.filter((r: { scope: string }) => r.scope === 'draft');
  expect(draft.find((r: { id: string }) => r.id === 'p1').title).toBe('Edited by A'); // A's work survived
  expect(draft.find((r: { id: string }) => r.id === 'p2').title).toBe('An Older Post Without A Slug'); // B wrote nothing

  // after reloading (a fresh tab, same signed-in browser), B sees A's change and can save
  const b2 = await b.context().newPage();
  await marketDown(b2);
  await b2.goto('/admin');
  await b2.locator('[data-nav="blog"]').click();
  await expect(b2.locator('.re-post-row', { hasText: 'Edited by A' })).toBeVisible();
  await editTitle(b2, 'An Older Post Without A Slug', 'Edited by B');
  await b2.getByRole('button', { name: 'Save without publishing' }).click();
  await expect(b2.locator('.re-post-row', { hasText: 'Edited by B' })).toBeVisible();
});

test('deleting a post waits until the admin knows what is on the website', async ({ page, request }) => {
  let failLive = true;
  let writes = 0;
  await page.route(/\/rest\/v1\/(site_content|blog_posts)\?/, (route) => {
    const r = route.request();
    if (r.method() !== 'GET') writes++;
    if (failLive && r.method() === 'GET' && r.url().includes('blog_posts') && r.url().includes('scope=eq.published'))
      return route.fulfill({ status: 500, json: { message: 'upstream timeout' } });
    return route.fallback();
  });
  await signInToBlog(page);
  await expect(page.locator('.re-toast')).toContainText('Could not check what is on the website', { timeout: 15_000 });
  await page.locator('.re-post-row', { hasText: 'KSE-100 Outlook for Q3' }).getByRole('button', { name: 'Delete post' }).click();
  await expect(page.locator('.re-toast')).toContainText('can’t check what is on the website');
  await expect(page.locator('.re-overlay')).toHaveCount(0); // no confirm dialog, nothing deleted
  expect(writes).toBe(0);

  failLive = false; // the retry triggered by that click succeeds
  await expect(page.locator('.re-post-row', { hasText: 'KSE-100 Outlook for Q3' })).toContainText('Live', { timeout: 15_000 });
  await page.locator('.re-post-row', { hasText: 'KSE-100 Outlook for Q3' }).getByRole('button', { name: 'Delete post' }).click();
  await expect(page.locator('.re-overlay')).toContainText('comes off the website');
  await page.click('.re-overlay button:has-text("Delete")');
  await expect(page.locator('.re-post-row')).toHaveCount(3);
  const pub = (await mockState(request)).blog_posts.filter((r: { scope: string }) => r.scope === 'published');
  expect(pub.map((r: { id: string }) => r.id)).not.toContain('p1'); // really off the website
});

test('the Activity page lists who did what', async ({ page }) => {
  await signInToBlog(page);
  await editTitle(page, 'KSE-100 Outlook for Q3', 'KSE-100 Outlook (revised)');
  await page.getByRole('button', { name: 'Save without publishing' }).click();
  await expect(page.locator('.re-post-row', { hasText: 'KSE-100 Outlook (revised)' })).toBeVisible();
  await page.locator('.re-post-row', { hasText: 'Unpublished draft' }).getByRole('button', { name: 'Delete post' }).click();
  await page.click('.re-overlay button:has-text("Delete")');
  await expect(page.locator('.re-post-row')).toHaveCount(3);

  await page.locator('[data-nav="activity"]').click();
  const list = page.locator('.re-inv-list');
  await expect(list).toContainText('Edited “KSE-100 Outlook (revised)” — title (was “KSE-100 Outlook for Q3”)');
  await expect(list).toContainText('Deleted the post “Unpublished draft”');
  await expect(list.locator('.re-inv-row').first()).toContainText(EDITOR.email);
  // newest first
  await expect(list.locator('.re-inv-row').first()).toContainText('Deleted the post');
  await page.getByRole('combobox', { name: 'Show activity by' }).selectOption(EDITOR.email);
  await expect(list.locator('.re-inv-row')).toHaveCount(2);
});
