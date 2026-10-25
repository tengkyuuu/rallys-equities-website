import { expect, test } from '@playwright/test';
import { marketDown } from './helpers';

/* The visual editor saves edits keyed by element position (e.g. `home.div4-div2-div3-div2`,
   `site.body1-nav1-…`). Fixture content: tests/fixtures/content.json. */

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});

test('published text edits, hidden elements and theme colours apply to the right elements', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#page-home .how-steps .how-step').nth(1).locator('.how-title')).toHaveText('Fund Accounts');
  const cards = page.locator('#page-home .svc-grid > .svc-card');
  await expect(cards.nth(1)).toHaveClass(/re-hid/);
  await expect(cards.nth(1)).toBeHidden();
  await expect(cards.nth(3)).toBeHidden();
  await expect(cards.nth(0)).toBeVisible();
  // theme override is in the server HTML, so it holds from the first paint
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--au2').trim())).toBe('#e2c071');
});

test('edits re-apply after client-side navigation brings in a new page', async ({ page }) => {
  await page.goto('/faq');
  await page.locator('#nav-home').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#page-home .how-steps .how-step').nth(1).locator('.how-title')).toHaveText('Fund Accounts');
  await expect(page.locator('#page-home .svc-grid > .svc-card').nth(1)).toBeHidden();
});

test('a page hidden in the editor redirects home and its links are hidden', async ({ page }) => {
  await page.goto('/rating');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('a[data-page="rating"]').first()).toBeHidden();
});

/* Every element's key must resolve back to that element — otherwise an edit saved in
   /admin would silently land somewhere else (or nowhere) for visitors. /admin holds every
   page plus the chrome, which is exactly what the editor generates keys from. */
test('every element key round-trips, for page content and site chrome', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/admin'); // load the engine via the admin bridge (exposes window.RE_API)
  await page.waitForFunction(() => !!(window as unknown as { RE_API?: unknown }).RE_API);
  const bad = await page.evaluate(() => {
    const api = (window as unknown as { RE_API: { getEditKey(el: Element): string; reResolve(k: string): Element[] } }).RE_API;
    const misses: string[] = [];
    const roots = [
      ...document.querySelectorAll('.page'),
      document.querySelector('body > nav')!,
      document.querySelector('#mnav')!,
      document.querySelector('body > footer')!,
      document.querySelector('.ticker')!,
    ];
    for (const root of roots) {
      for (const el of root.querySelectorAll('*')) {
        // SVG tag names are lower-case, which the original engine's key format never handled;
        // the editor doesn't target icons, so they are out of scope (unchanged from the old site)
        if (el instanceof SVGElement) continue;
        const key = api.getEditKey(el);
        if (api.reResolve(key)[0] !== el) misses.push(key);
      }
    }
    return misses;
  });
  expect(bad).toEqual([]);
});

test('keys saved on the old single-page site resolve to the same elements here', async ({ page }) => {
  // live production keys at the time of the migration, and what each one pointed at
  const LEGACY: [string, string, string][] = [
    ['/', 'home.div4-div2-div3-div2', 'Fund Account'],
    ['/', 'home.section2-div2-div2', 'Portfolio Management'],
    ['/', 'home.section2-div2-div4', 'Market Research'],
    ['/services', 'services.section1', 'What We Offer'],
  ];
  for (const [path, key, text] of LEGACY) {
    await page.goto('/admin');
    await page.waitForFunction(() => !!(window as unknown as { RE_API?: unknown }).RE_API);
    const found = await page.evaluate(
      (k) => (window as unknown as { RE_API: { reResolve(k: string): Element[] } }).RE_API.reResolve(k)[0]?.textContent ?? null,
      key,
    );
    expect(found, `${key} (${path})`).toContain(text);
  }
});
