const { test, expect } = require('@playwright/test');
const { applySecurityHeaders, collectConsoleIssues } = require('./helpers');

// The editor's local-preview store (any passphrase, saves to localStorage) — no Supabase needed.
const LOCAL_CFG = 'window.RE_SUPABASE={url:"",anonKey:""};window.RE_SUPABASE_READY=false;';

test.beforeEach(async ({ context, page }) => {
  await applySecurityHeaders(context);
  await page.route('**/editor/supabase-config.js', (r) => r.fulfill({ contentType: 'application/javascript', body: LOCAL_CFG }));
  await page.goto('/?edit=1');
  await page.fill('.re-login input', 'test');
  await page.click('.re-login .re-btn-pri');
  await page.locator('.re-side-nav').getByText('Edit website').click();
  await page.waitForSelector('.re-bar');
});

const plan = (page, id) => page.locator(`.prc[data-plan="${id}"]`);

test('pricing panel edits, highlights and hides plans, and visitors see it after publish', async ({ page, context }) => {
  const issues = collectConsoleIssues(page);
  await page.evaluate(() => showPage('services'));
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

  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.click('.re-bar button:has-text("Publish")');
  await page.click('.re-overlay button:has-text("Publish")');
  await expect(page.locator('.re-count')).toHaveText('All changes saved');

  const visitor = await context.newPage();
  await visitor.goto('/services');
  await expect(plan(visitor, 'individual').locator('.prc-price')).toHaveText('PKR 500');
  await expect(plan(visitor, 'individual').locator('.prc-badge')).toBeVisible();
  await expect(plan(visitor, 'shariah').locator('.prc-badge')).toHaveCount(0);
  await expect(plan(visitor, 'corporate')).toBeHidden();
  expect(issues.pageErrors).toEqual([]);
});

test('PKR quick pick starts an amount, and Restore original puts a price back', async ({ page }) => {
  await page.evaluate(() => showPage('services'));
  await plan(page, 'individual').locator('.prc-price').click();
  const box = page.locator('[data-f="individual.price"]');
  const sec = page.locator('[data-sec="individual"]');
  await sec.locator('.re-chip2', { hasText: 'PKR' }).click();
  await expect(box).toHaveValue('PKR ');
  await expect(box).toBeFocused();
  await page.keyboard.type('750');
  await expect(plan(page, 'individual').locator('.prc-price')).toHaveText('PKR 750');
  await expect(sec.locator('.re-chip2', { hasText: 'PKR' })).toHaveClass(/\bon\b/);
  await expect(sec.locator('.re-prc-tag-ed')).toBeVisible();

  await box.fill('1500');
  await sec.locator('.re-chip2', { hasText: 'PKR' }).click();
  await expect(box).toHaveValue('PKR 1500');                       // keeps a number already typed

  await sec.locator('.re-prc-field').filter({ has: box }).getByRole('button', { name: 'Restore original' }).click();
  await expect(box).toHaveValue('Free');
  await expect(plan(page, 'individual').locator('.prc-price')).toHaveText('Free');
  await expect(sec.locator('.re-prc-tag-ed')).toBeHidden();
  await expect(page.locator('.re-count')).toHaveText('All changes saved');   // back to the original — nothing left to save
});

test('plan sections collapse, and switches stay reachable while collapsed', async ({ page }) => {
  await page.locator('.re-bar button[aria-label="Pricing"]').click();
  const corp = page.locator('[data-sec="corporate"]');
  await expect(corp.locator('[data-f="corporate.price"]')).toHaveCount(0);      // collapsed by default
  await corp.locator('.re-siterow').first().click();                            // hide without expanding
  await expect(plan(page, 'corporate')).toHaveClass(/prc-off/);
  await expect(corp.locator('.re-prc-tag', { hasText: 'Hidden' })).toBeVisible();
  await corp.locator('.re-prc-tog').click();
  await expect(corp.locator('[data-f="corporate.price"]')).toBeVisible();
});

test('text toolbar Done / Original buttons, and the toolbar Undo button', async ({ page }) => {
  await page.evaluate(() => showPage('services'));
  const sub = page.locator('[data-edit="plans.sub"]');
  const original = (await sub.textContent()).trim();
  await sub.click(); await page.keyboard.press('End'); await page.keyboard.type(' NEW');
  await page.locator('.re-fmt button[aria-label="Done (Enter)"]').dispatchEvent('mousedown');
  await expect(sub).toHaveText(original + ' NEW');
  await expect(page.locator('.re-fmt')).toHaveCount(0);

  await sub.click();
  await page.locator('.re-fmt button[aria-label="Put back the original wording"]').dispatchEvent('mousedown');
  await expect(sub).toHaveText(original);
  await expect(page.locator('.re-count')).toHaveText('All changes saved');   // restoring drops the override, not a copy of it
  await expect(page.locator('.re-bar button:has-text("Save draft")')).toBeDisabled();

  const undoBtn = page.locator('.re-bar button[aria-label="Undo"]');
  await expect(undoBtn).toBeEnabled();
  await undoBtn.click();
  await expect(sub).toHaveText(original + ' NEW');
});

test('leaving with unsaved changes asks first', async ({ page }) => {
  await page.evaluate(() => showPage('services'));
  await plan(page, 'individual').locator('.prc-price').click();
  await page.keyboard.type('PKR 9');
  const dialog = new Promise((res) => page.once('dialog', (d) => { res(d.type()); d.dismiss().catch(() => {}); }));
  await page.close({ runBeforeUnload: true });
  expect(await dialog).toBe('beforeunload');
});

test('clicking a button label in edit mode edits it instead of following it', async ({ page }) => {
  await page.evaluate(() => showPage('services'));
  const cta = page.locator('#page-services .cta-block button').first();
  const before = (await cta.textContent()).trim();
  await cta.click();
  await expect(page.locator('#page-services')).toHaveClass(/active/);
  await page.locator('.re-overlay input').press('End');
  await page.keyboard.type(' now');
  await page.keyboard.press('Enter');
  await expect(cta).toHaveText(before + ' now');
  await expect(page.locator('.re-overlay')).toHaveCount(0);           // Enter must not re-open the dialog
  await expect(page.locator('#page-services')).toHaveClass(/active/);
});

test('Escape cancels only the current text edit', async ({ page }) => {
  await page.evaluate(() => showPage('services'));
  const sub = page.locator('[data-edit="plans.sub"]');
  await sub.click(); await page.keyboard.press('End'); await page.keyboard.type(' ONE'); await page.keyboard.press('Enter');
  await sub.click(); await page.keyboard.press('End'); await page.keyboard.type(' TWO'); await page.keyboard.press('Escape');
  await expect(sub).toHaveText(/ ONE$/);
  await page.click('.re-bar button:has-text("Save draft")');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('re-content-draft')).text['plans.sub']);
  expect(saved).toMatch(/ ONE$/);
});

test('an edited <h2> without a data-edit key re-applies after reload', async ({ page }) => {
  await page.evaluate(() => showPage('about'));
  const h2 = await page.locator('#page-about h2:not([data-edit])').first().elementHandle();
  await h2.click(); await page.keyboard.press('End'); await page.keyboard.type(' ZZ'); await page.keyboard.press('Enter');
  const key = await h2.getAttribute('data-edit');
  expect(key).toMatch(/h2\d/);
  await page.click('.re-bar button:has-text("Publish")');
  await page.click('.re-overlay button:has-text("Publish")');
  await expect(page.locator('.re-count')).toHaveText('All changes saved');
  await page.goto('/about');
  const text = await page.evaluate((k) => window.RE_API.reResolve(k)[0].textContent.trim(), key);
  expect(text.endsWith(' ZZ')).toBe(true);
});
