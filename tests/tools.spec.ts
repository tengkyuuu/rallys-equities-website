import { expect, test } from '@playwright/test';
import { marketDown } from './helpers';

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});

test('CAGR: money inputs format as you type; results, chart and yearly table appear', async ({ page }) => {
  await page.goto('/tools/cagr-calculator');
  await page.locator('#cagr-b').pressSequentially('100000');
  await expect(page.locator('#cagr-b')).toHaveValue('100,000');
  await page.locator('#cagr-e').pressSequentially('250000');
  await page.fill('#cagr-y', '5');
  await page.click('#calc-cagr .calc-btn');
  const out = page.locator('#cagr-out');
  await expect(out).toHaveClass(/show/);
  await expect(out.locator('.calc-answer')).toHaveText('PKR 100,000 grew to PKR 250,000 over 5 years: an average of 20.11% a year.');
  await expect(out.locator('.calc-answer strong')).toHaveText('20.11%');
  await expect(out.locator('.calc-row', { hasText: 'Gains' }).locator('.calc-v')).toHaveText('PKR 150,000.00');
  await expect(out.locator('canvas#cagr-chart')).toHaveCount(1);
  await expect(out.locator('.dd-table tbody tr')).toHaveCount(5);
});

test('incomplete inputs leave the result panel untouched', async ({ page }) => {
  await page.goto('/tools/sip-calculator');
  await page.click('#calc-sip .calc-btn');
  await expect(page.locator('#sip-out')).not.toHaveClass(/show/);
});

test('drawdown: per-period table and bar chart', async ({ page }) => {
  await page.goto('/tools/drawdown-calculator');
  await page.locator('#dd-sb').pressSequentially('100000');
  await page.fill('#dd-pd', '3');
  await page.fill('#dd-l', '10');
  await page.click('#calc-dd .calc-btn');
  await expect(page.locator('#dd-out .calc-answer strong')).toHaveText('PKR 72,900.00');
  await expect(page.locator('#dd-out .calc-row', { hasText: 'Total Loss %' }).locator('.calc-v')).toHaveText('27.10%');
  await expect(page.locator('#dd-out .dd-table tbody tr')).toHaveCount(3);
  await expect(page.locator('#dd-out canvas#dd-chart')).toHaveCount(1);
});

test('calculators with a write-up show it; the others do not', async ({ page }) => {
  await page.goto('/tools/cagr-calculator');
  await expect(page.locator('#page-cagr .calc-info h3').first()).toHaveText('What is CAGR?');
  await page.goto('/tools/investment-calculator');
  await expect(page.locator('#page-invest .calc-info')).toHaveCount(0);
});
