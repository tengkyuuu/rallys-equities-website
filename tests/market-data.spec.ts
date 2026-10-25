import { expect, test, type Page, type Route } from '@playwright/test';

// The site must show real PSX data or say it's unavailable — never invented numbers.
// /api/market is mocked so each state is deterministic. The "live" payload is synthetic.
const day = 864e5,
  now = Date.now();
const LIVE = {
  indices: {
    KSE100: {
      current: 111111.11,
      prevClose: 110000,
      change: 1111.11,
      changePct: 1.01,
      asOf: now,
      series: [110000, 110500, 110800, 111111.11],
      eod: Array.from({ length: 30 }, (_, i) => [now - (29 - i) * day, 105000 + i * 200]),
    },
    KSE30: { current: 22222.22, prevClose: 22300, change: -77.78, changePct: -0.35, asOf: now },
    KMI30: { current: 33333.33, prevClose: 33000, change: 333.33, changePct: 1.01, asOf: now },
    ALLSHR: { current: 44444.44, prevClose: 44000, change: 444.44, changePct: 1.01, asOf: now },
  },
  stocks: {
    ATRL: [777.77, 7.77, 1.01, 1200000, 'Attock Refinery Limited', 'Refinery'],
    MEBL: [333.33, -3.33, -0.99, 900000, 'Meezan Bank Limited', 'Banks'],
    HBL: [222.22, 2.22, 1.01, 800000, 'Habib Bank Limited', 'Banks'],
  },
  delayed: true,
};

const down = (r: Route) => r.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"KSE100 unavailable upstream"}' });
const live = (r: Route) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(LIVE) });
async function open(page: Page, mock: (r: Route) => unknown, path = '/') {
  await page.route('**/api/market', mock);
  await page.goto(path);
}

test('feed down: hero panel shows "unavailable", no figures, nothing drifts', async ({ page }) => {
  await open(page, down);
  await expect(page.locator('#dataLbl')).toHaveText('MARKET DATA UNAVAILABLE');
  await expect(page.locator('#pDown')).toBeVisible();
  await expect(page.locator('#pDown a')).toHaveAttribute('href', 'https://dps.psx.com.pk/');
  for (const id of ['#k100', '#k30', '#k30m', '#kase']) await expect(page.locator(id)).toHaveText('—');
  await expect(page.locator('#heroStocks .srow')).toHaveCount(0);
  await expect(page.locator('.pcard .cw')).toBeHidden();
  const strip = (t: string) => t.replace(/\d{1,2}:\d{2}:\d{2}/, '');
  const before = strip(await page.locator('.pcard').innerText());
  await page.waitForTimeout(3500); // the old simulation ticked every 3 s
  expect(strip(await page.locator('.pcard').innerText())).toBe(before);
  expect(await page.locator('.pcard').innerText()).not.toMatch(/SIMULATED|Indicative|\d{2,3},\d{3}\.\d{2}/);
});

test('feed down: ticker and Markets page show a notice, not prices', async ({ page }) => {
  await open(page, down, '/markets');
  const ticker = page.locator('#tickerWrap');
  await expect(ticker).toHaveClass(/is-static/);
  await expect(ticker).toContainText('temporarily unavailable');
  expect(await ticker.innerText()).not.toMatch(/\d+\.\d{2}/);
  await expect(page.locator('#mktTbody td.mkt-down')).toContainText('temporarily unavailable');
  await expect(page.locator('#mktTime')).toHaveText('Prices unavailable');
  for (const id of ['#mk100', '#mk30', '#mkmi']) await expect(page.locator(id)).toHaveText('—');
});

test('feed down on a phone: the ticker notice fits the screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, down);
  const note = page.locator('#tickerWrap .ti-note');
  await expect(note).toBeVisible();
  const box = (await note.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
});

test('while waiting for the first answer it says "loading", never placeholder numbers', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });
  await open(page, async (r) => {
    await gate;
    await live(r);
  });
  await expect(page.locator('#dataSub')).toHaveText('— loading…');
  await expect(page.locator('#k100')).toHaveText('—');
  await expect(page.locator('#pDown')).toHaveText('Loading market data…');
  release();
  await expect(page.locator('#k100')).toHaveText('111,111.11');
});

test('feed live: every figure on screen comes from the feed', async ({ page }) => {
  await open(page, live);
  await expect(page.locator('#dataLbl')).toHaveText('PSX · DELAYED');
  await expect(page.locator('#k100')).toHaveText('111,111.11');
  await expect(page.locator('#k100c')).toHaveText('▲ +1111.11 (+1.01%)');
  await expect(page.locator('#k30')).toHaveText('22,222.22');
  await expect(page.locator('.pcard .ixch').nth(0)).toHaveText('▼ -0.35%');
  await expect(page.locator('.pcard .ixch').nth(1)).toHaveText('▲ +1.01%'); // exactly one sign
  const rows = page.locator('#heroStocks .srow');
  await expect(rows).toHaveCount(3); // only symbols the feed returned
  await expect(rows.first()).toContainText('777.77');
  await expect(page.locator('#pDown')).toBeHidden();
  await expect(page.locator('#tickerWrap')).not.toHaveClass(/is-static/);
  await expect(page.locator('#tickerWrap')).toContainText('777.77');
  await expect(page.locator('.pcard .ptab', { hasText: '1W' })).toBeEnabled(); // real daily history present

  await page.locator('#nav-markets').click();
  await expect(page.locator('#mk30c')).toHaveText('▼ -0.35%');
  await expect(page.locator('#mk100c')).toHaveText('▲ +1.01%');
  await expect(page.locator('#mktTbody tr')).toHaveCount(3);
  await expect(page.locator('#mktTbody tr').first()).toContainText('ATRL'); // most active first
  await page.fill('#mktSearch', 'banks');
  await expect(page.locator('#mktTbody tr')).toHaveCount(2);
  await page.fill('#mktSearch', 'zzz');
  await expect(page.locator('#mktTbody')).toContainText('No securities match “zzz”');
});

test('1W tab redraws from daily history and the badge describes that slice', async ({ page }) => {
  await open(page, live);
  await page.locator('.pcard .ptab', { hasText: '1W' }).click();
  await expect(page.locator('.pcard .ptab', { hasText: '1W' })).toHaveClass(/on/);
  await expect(page.locator('#pCtx')).toContainText('Past week');
  await expect(page.locator('#k100c')).toHaveText('▲ +1000.00 (+0.91%)'); // last 6 closes: 109,800 → 110,800
  await expect(page.locator('.pcard .clbl span')).toHaveCount(3);
});

test('feed live without daily history: 1W/1M/YTD are disabled rather than invented', async ({ page }) => {
  const noEod = JSON.parse(JSON.stringify(LIVE));
  delete noEod.indices.KSE100.eod;
  await open(page, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(noEod) }));
  await expect(page.locator('#k100')).toHaveText('111,111.11');
  for (const t of ['1W', '1M', 'YTD']) await expect(page.locator('.pcard .ptab', { hasText: t })).toBeDisabled();
});
