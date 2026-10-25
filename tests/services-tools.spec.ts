import { expect, test, type Page } from '@playwright/test';
import { marketDown } from './helpers';

test.beforeEach(async ({ page }) => {
  await marketDown(page);
});

const tool = (page: Page, id: string) => page.locator(`#${id} .sdi`);

test('order ticket: value from the visitor’s own numbers, real T+1 dates, explanation per order type', async ({ page }) => {
  // Friday 30 Oct 2026, 16:00 in Karachi: after the close, so the trade rolls to Monday
  await page.clock.setFixedTime(new Date('2026-10-30T11:00:00Z'));
  await page.goto('/services');
  const t = tool(page, 'svc-trading');
  await expect(t.locator('.tool-big')).toHaveText('—'); // nothing invented before input
  await expect(t.locator('.tool-status')).toHaveText('PSX closed now');
  await expect(t.locator('.tool-timeline li').nth(0).locator('strong')).toHaveText('Mon 2 Nov');
  await expect(t.locator('.tool-timeline li').nth(2).locator('strong')).toHaveText('Tue 3 Nov');

  await t.getByLabel('Shares').pressSequentially('500');
  await t.getByLabel('Price per share (estimate)').pressSequentially('84.5');
  await expect(t.locator('.tool-big')).toHaveText('PKR 42,250');
  await t.getByRole('radio', { name: 'Sell' }).click();
  await t.getByRole('radio', { name: 'Stop' }).click();
  await expect(t.getByLabel('Your stop price')).toBeVisible();
  await expect(t.locator('.tool-explain')).toContainText('falls to your stop');
  await expect(t.locator('.tool-result .tool-k')).toHaveText('Sale value');
});

test('purification: splits the visitor’s dividend in a donut, and rejects impossible percentages', async ({ page }) => {
  await page.goto('/services');
  const s = tool(page, 'svc-shariah');
  await expect(s.locator('.tool-donut-center strong')).toHaveText('—');
  await s.getByLabel('Dividend received').pressSequentially('25000');
  await s.getByLabel('Non-permissible income').fill('3.2');
  await expect(s.locator('.tool-donut-center strong')).toHaveText('PKR 800');
  await expect(s.locator('.tool-ledger dd')).toHaveText(['PKR 24,200', 'PKR 800']);
  await expect(s.locator('.recharts-pie-sector')).toHaveCount(2);
  await s.getByLabel('Non-permissible income').fill('150');
  await expect(s.locator('.tool-warn')).toHaveText('Enter a percentage from 0 to 100.');
});

test('allocation planner: the chart and message follow the sliders and the cap', async ({ page }) => {
  await page.goto('/services');
  const a = tool(page, 'svc-portfolio');
  const status = a.locator('.tool-status-line');
  await expect(status).toContainText('within your 40% cap');
  await expect(a.locator('.recharts-bar-rectangle')).toHaveCount(4);

  const sliders = a.locator('input[type=range]');
  await sliders.nth(1).fill('50'); // Energy: total now 125%
  await expect(status).toHaveText('Your sectors add up to 125%. Adjust them to 100%.');
  for (const [i, v] of [
    [0, '15'],
    [2, '20'],
    [3, '15'],
  ] as const)
    await sliders.nth(i).fill(v);
  await expect(status).toContainText('Energy is above your 40% cap');
  await sliders.nth(4).fill('50'); // raise the cap
  await expect(status).toContainText('within your 50% cap');
});
