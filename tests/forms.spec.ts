import { expect, test, type APIRequestContext } from '@playwright/test';
import { freshIp, marketDown, mockState } from './helpers';

type Row = { kind: string; reference: string | null; data: Record<string, string>; files: { field: string; path: string; type: string }[] };
const latest = async (request: APIRequestContext, kind: string): Promise<Row | undefined> =>
  ((await mockState(request)).form_submissions as Row[]).filter((r) => r.kind === kind).pop();

const PDF = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') };
const PNG = (name: string) => ({ name, mimeType: 'image/png', buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) });

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': freshIp() });
  await marketDown(page);
});

test('contact form: highlights missing fields, then sends and confirms', async ({ page, request }) => {
  await page.goto('/contact');
  await page.click('#cfBox .fnext');
  await expect(page.locator('#cf-name')).toHaveClass(/\berr\b/);
  await expect(page.locator('#cf-subj')).toHaveClass(/\berr\b/);
  await expect(page.locator('.re-toast')).toContainText('Please complete the highlighted fields.');

  await page.fill('#cf-name', 'Ayesha Khan');
  await page.fill('#cf-email', 'ayesha@example.com');
  await page.selectOption('#cf-subj', 'Client Support');
  await page.fill('#cf-msg', 'Please call me about my account.');
  await page.click('#cfBox .fnext');
  await expect(page.locator('#cfDone')).toBeVisible();
  await expect(page.locator('#cfBox')).toBeHidden();
  const row = await latest(request, 'contact');
  expect(row?.data).toMatchObject({
    name: 'Ayesha Khan',
    email: 'ayesha@example.com',
    subject: 'Client Support',
    message: 'Please call me about my account.',
  });
});

test('"Book an appointment" scrolls to the form and focuses the name field', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Book an appointment' }).click();
  await expect(page.locator('#cf-name')).toBeFocused();
});

test('a failed send shows a real error and keeps the form (never a fake success)', async ({ page }) => {
  await page.route('**/api/submissions', (r) =>
    r.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"save-failed"}' }),
  );
  await page.goto('/complaints');
  await page.fill('#cmp-name', 'Bilal');
  await page.fill('#cmp-email', 'bilal@example.com');
  await page.selectOption('#cmp-cat', 'Other');
  await page.fill('#cmp-msg', 'Something went wrong.');
  await page.click('#cmpBox .fnext');
  await expect(page.locator('.re-toast')).toContainText('couldn’t send your details');
  await expect(page.locator('#cmpBox')).toBeVisible();
  await expect(page.locator('#cmpDone')).toBeHidden();
});

test('home feedback: email is optional, but checked when given', async ({ page, request }) => {
  await page.goto('/');
  await page.fill('#hfb-name', 'Sara');
  await page.fill('#hfb-subj', 'Great app');
  await page.fill('#hfb-msg', 'Very easy to use.');
  await page.fill('#hfb-email', 'not-an-email');
  await page.click('#hfbBox .fnext');
  await expect(page.locator('#hfb-email')).toHaveClass(/\berr\b/);
  await page.fill('#hfb-email', '');
  await page.click('#hfbBox .fnext');
  await expect(page.locator('#hfbDone')).toBeVisible();
  expect((await latest(request, 'feedback'))?.data).toMatchObject({
    name: 'Sara',
    subject: 'Great app',
    category: 'General Feedback',
    source: 'Home page',
  });
});

test('careers: the CV uploads straight to storage and the application references it', async ({ page, request }) => {
  await page.goto('/careers');
  await page.fill('#car-name', 'Usman');
  await page.fill('#car-email', 'usman@example.com');
  await page.selectOption('#car-pos', 'Trading Analyst');
  await page.setInputFiles('#car-cv', PDF);
  await expect(page.locator('#car-cv-lbl')).toHaveText('✓ cv.pdf');
  await page.click('#carBox .fnext');
  await expect(page.locator('#carDone')).toBeVisible();
  const row = await latest(request, 'career');
  expect(row?.files).toHaveLength(1);
  expect(row!.files[0]).toMatchObject({ field: 'cv', type: 'application/pdf' });
  expect((await mockState(request)).objects).toContain('form-uploads/' + row!.files[0].path);
});

test('account application: five steps, validation, documents, reference number', async ({ page, request }) => {
  await page.goto('/open-account');
  await page.click('#step1 .fnext');
  await expect(page.locator('#f-cnic')).toHaveClass(/\berr\b/);
  await expect(page.locator('#f-fn')).toBeFocused();

  await page.fill('#f-fn', 'Ahmed');
  await page.fill('#f-ln', 'Khan');
  await page.fill('#f-cnic', '3520212345671');
  await expect(page.locator('#f-cnic')).toHaveValue('35202-1234567-1'); // formatted as you type
  await page.fill('#f-mob', '+92-300-1234567');
  await page.fill('#f-email', 'ahmed@example.com');
  await page.selectOption('#f-city', 'Lahore');
  await page.selectOption('#f-prov', 'Punjab');
  await page.click('#step1 .fnext');
  await expect(page.locator('#step2')).toHaveClass(/active/);
  await expect(page.locator('#ao-n1')).toHaveText('✓');
  await expect(page.locator('#progFill')).toHaveAttribute('style', /width: 40%/);

  await page.selectOption('#f-bank', 'Meezan Bank');
  await page.click('#step2 .fnext');
  await page.locator('.ac-opt[data-val="halal"]').click();
  await expect(page.locator('.ac-opt[data-val="halal"]')).toHaveClass(/active-opt/);
  await page.locator('.risk-opt[data-val="aggressive"]').click();
  await page.click('#step3 .fnext');

  await page.setInputFiles('#uf-cnicF', PNG('front.png'));
  await page.setInputFiles('#uf-cnicB', PNG('back.png'));
  await page.setInputFiles('#uf-addr', PDF);
  await page.setInputFiles('#uf-photo', PNG('me.png'));
  await expect(page.locator('#uf-photo-lbl')).toHaveText('✓ me.png');
  await page.click('#step4 .fnext');

  await expect(page.locator('#rv-name')).toHaveText('Ahmed Khan');
  await expect(page.locator('#rv-city')).toHaveText('Lahore / Punjab');
  await expect(page.locator('#rv-actype')).toHaveText('Halal');
  await expect(page.locator('#rv-risk')).toHaveText('Aggressive');
  await page.click('#step5 .fnext');
  await expect(page.locator('.re-toast')).toContainText('tick all three consent boxes');
  for (const id of ['#chk1', '#chk2', '#chk3']) await page.check(id);
  await page.click('#step5 .fnext');

  await expect(page.locator('#successScr')).toHaveClass(/show/);
  const ref = (await page.locator('#refNum').textContent())!;
  expect(ref).toMatch(/^RE-\d{4}-\d{5}$/);
  const row = await latest(request, 'application');
  expect(row?.reference).toBe(ref);
  expect(row?.data).toMatchObject({
    firstName: 'Ahmed',
    cnic: '35202-1234567-1',
    accountType: 'halal',
    riskTolerance: 'aggressive',
    bank: 'Meezan Bank',
  });
  expect(row?.files.map((f) => f.field).sort()).toEqual(['addressProof', 'cnicBack', 'cnicFront', 'photo']);
});
