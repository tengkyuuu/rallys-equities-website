import { expect, test } from '@playwright/test';

// The home hero's interactive card: the growth estimator by default, alternatives by ?hero=.

test('home hero shows the growth estimator, and the sliders recalculate it', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.hero .hx-calc');
  await expect(card).toBeVisible();
  await expect(page.locator('.hero')).toHaveClass(/hero-v2/);
  // defaults: PKR 25,000 a month for 10 years at an assumed 12%
  await expect(card.locator('.hx-res-v')).toHaveText('PKR 5,750,967');
  await expect(card.locator('.hx-legend dd').first()).toHaveText('PKR 3,000,000');

  const sliders = card.locator('input[type=range]');
  await sliders.nth(2).fill('0'); // a 0% assumption grows nothing
  await expect(card.locator('.hx-res-v')).toHaveText('PKR 3,000,000');
  await sliders.nth(1).fill('5');
  await expect(card.locator('.hx-res-l')).toHaveText('Estimated value after 5 years');
  await expect(card.locator('.hx-res-v')).toHaveText('PKR 1,500,000');

  // it is an illustration, and says so
  await expect(card).toContainText('Returns are not guaranteed');
  // and it never shows market figures
  await expect(page.locator('#k100')).toHaveCount(0);
});

test('the estimator fits a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const box = (await page.locator('.hero .hx').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test('?hero=path shows the path finder and ?hero=market the market card', async ({ page }) => {
  await page.goto('/?hero=path');
  await page.locator('#hx-tab-shariah').click();
  await expect(page.locator('#hx-panel')).toContainText('Invest in line with your faith');
  await page.goto('/?hero=market');
  await expect(page.locator('#dataLbl')).toBeVisible();
});
