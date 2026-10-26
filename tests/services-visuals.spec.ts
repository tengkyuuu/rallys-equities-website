import { expect, test, type Page } from '@playwright/test';
import { marketDown } from './helpers';

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});

const visual = (page: Page, id: string) => page.locator(`#${id} .sdi`);

test('the service illustrations show no figures and ask for no input', async ({ page }) => {
  await page.goto('/services');
  for (const id of ['svc-trading', 'svc-shariah', 'svc-portfolio']) {
    const v = visual(page, id);
    await v.scrollIntoViewIfNeeded();
    await expect(v.locator('input, select, textarea')).toHaveCount(0);
    // "KMI-30" is the index's name; anything else numeric would be invented data
    expect((await v.innerText()).replace(/KMI-30/g, '')).not.toMatch(/\d|%|PKR/);
  }
});

test('trading: the chart draws in, and Buy/Sell recolours the ticket', async ({ page }) => {
  await page.goto('/services');
  const t = visual(page, 'svc-trading');
  await t.scrollIntoViewIfNeeded();
  await expect(t.locator('.recharts-area-curve')).toHaveCount(1);
  await t.getByRole('radio', { name: 'Sell' }).click();
  await expect(t.locator('.illo')).toHaveClass(/illo-sell/);
  await expect(t.getByRole('radio', { name: 'Sell' })).toHaveAttribute('aria-checked', 'true');
});

test('shariah: pointing at a sector names it in the centre of the donut', async ({ page }) => {
  await page.goto('/services');
  const s = visual(page, 'svc-shariah');
  await s.scrollIntoViewIfNeeded();
  await expect(s.locator('.illo')).toHaveClass(/is-in/); // client code is running
  await expect(s.locator('.illo-donut-center strong')).toHaveText('KMI-30');
  await s.getByRole('button', { name: 'Cement' }).hover();
  await expect(s.locator('.illo-donut-center strong')).toHaveText('Cement');
  await expect(s.locator('.illo-seg-g.is-active')).toHaveCount(1);
});

test('portfolio: the drifted mix rebalances on its own once seen, and the toggle switches back', async ({ page }) => {
  await page.goto('/services');
  const p = visual(page, 'svc-portfolio');
  await p.scrollIntoViewIfNeeded();
  await expect(p.getByRole('radio', { name: 'Rebalanced' })).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
  await expect(p.locator('.illo-caption')).toContainText('Back to your agreed allocation');
  await p.getByRole('radio', { name: 'Drifted' }).click();
  await expect(p.locator('.illo-caption')).toContainText('pulled your mix away');
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('tapping a donut sector or its legend entry selects it', async ({ page }) => {
    await page.goto('/services');
    const s = visual(page, 'svc-shariah');
    await s.scrollIntoViewIfNeeded();
    // the donut adds is-in once its client code runs; tapping before then would hit inert server HTML
    await expect(s.locator('.illo')).toHaveClass(/is-in/);
    await s.getByRole('button', { name: 'Energy' }).tap();
    await expect(s.locator('.illo-donut-center strong')).toHaveText('Energy');
    await s.locator('.illo-seg-g').nth(2).tap();
    await expect(s.locator('.illo-donut-center strong')).toHaveText('Cement');
  });
});

test('illustration styles never leak onto the rest of the site (buttons in revealed sections keep their look)', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('.why-row .bbig-g');
  await btn.scrollIntoViewIfNeeded();
  await expect(page.locator('.why-row .rv-r.vis')).toHaveCount(1); // the reveal ran
  await expect(btn).toHaveCSS('padding-top', '12px');
  await expect(btn).not.toHaveCSS('background-image', 'none');
});
