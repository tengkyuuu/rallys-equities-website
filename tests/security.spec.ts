import { expect, test } from '@playwright/test';
import { collectConsoleIssues, freshIp, marketDown } from './helpers';

test('security headers on every page', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['strict-transport-security']).toContain('max-age=63072000');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-frame-options']).toBe('SAMEORIGIN');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy']).toContain('camera=()');
  expect(h['x-powered-by']).toBeUndefined();
});

test('scripts are locked to a per-request nonce: no inline handlers, no unsafe-inline', async ({ request }) => {
  const [a, b] = [await request.get('/'), await request.get('/')];
  const csp = a.headers()['content-security-policy'];
  const script = csp.split(';').find((d) => d.trim().startsWith('script-src'))!;
  expect(script).toContain("'strict-dynamic'");
  expect(script).not.toContain("'unsafe-inline'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'self'");
  const nonce = /'nonce-([^']+)'/.exec(script)![1];
  expect(/'nonce-([^']+)'/.exec(b.headers()['content-security-policy'])![1]).not.toBe(nonce); // fresh per request

  const html = await a.text();
  // every executable inline <script> carries the nonce
  for (const tag of html.match(/<script(?![^>]*application\/ld\+json)[^>]*>/g) || []) expect(tag).toContain(`nonce="${nonce}"`);
  // no inline event handler attributes anywhere in the markup
  expect(html).not.toMatch(/<[a-z][^>]*\son[a-z]+=["']/i);
});

test('the browser blocks injected markup that tries to run code (the classic XSS vector)', async ({ page }) => {
  await marketDown(page);
  const issues = collectConsoleIssues(page);
  await page.goto('/');
  await page.evaluate(() => {
    const box = document.createElement('div');
    box.innerHTML =
      '<img src="/x-missing.png" onerror="window.__injected = 1"><a id="jsLink" href="javascript:window.__injected = 2">x</a>';
    document.body.appendChild(box);
  });
  await page.waitForTimeout(500); // let the image fail
  await page.click('#jsLink', { force: true });
  expect(await page.evaluate(() => (window as unknown as { __injected?: number }).__injected)).toBeUndefined();
  expect(issues.cspViolations.length).toBeGreaterThan(0);
});

test('blog bodies are sanitised on the server: no scripts, handlers or javascript: links', async ({ page, request }) => {
  const html = await (await request.get('/blog/kse-100-outlook-q3')).text();
  const body = html.slice(html.indexOf('class="blog-post"'), html.indexOf('class="post-share"'));
  expect(body).toContain('Banks lead the rally.');
  expect(body).not.toMatch(/<script|onerror|javascript:/i);
  expect(body).toContain('href="https://example.com" rel="noopener noreferrer" target="_blank"');
  await marketDown(page);
  await page.goto('/blog/kse-100-outlook-q3');
  expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
});

test('the market API is same-origin only (no wildcard CORS)', async ({ request }) => {
  const res = await request.get('/api/market');
  expect(res.headers()['access-control-allow-origin']).toBeUndefined();
});

test('form API rejects malformed and oversized input', async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': freshIp() } });
  expect((await request.post('/api/submissions', { data: { kind: 'nope', data: {} } })).status()).toBe(400);
  expect((await request.post('/api/submissions', { data: { kind: 'contact', data: { name: 'A', email: 'x' } } })).status()).toBe(400);
  expect(
    (
      await request.post('/api/submissions', {
        data: { kind: 'contact', data: { name: 'Ali', email: 'a@b.co', subject: 'General Inquiry', message: 'x'.repeat(6000) } },
      })
    ).status(),
  ).toBe(400);
  // files can only reference paths this server signed for this form
  const forged = {
    kind: 'career',
    data: { name: 'Ali', email: 'a@b.co', position: 'Other' },
    files: [{ field: 'cv', path: '../../etc/passwd', name: 'cv.pdf', type: 'application/pdf', size: 10 }],
  };
  expect((await request.post('/api/submissions', { data: forged })).status()).toBe(400);
  // upload signing refuses wrong types, unknown fields and big files
  expect(
    (
      await request.post('/api/submissions/uploads', {
        data: { kind: 'career', files: [{ field: 'cv', name: 'cv.exe', type: 'application/x-msdownload', size: 10 }] },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post('/api/submissions/uploads', {
        data: { kind: 'contact', files: [{ field: 'cv', name: 'cv.pdf', type: 'application/pdf', size: 10 }] },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post('/api/submissions/uploads', {
        data: { kind: 'career', files: [{ field: 'cv', name: 'cv.pdf', type: 'application/pdf', size: 6 * 1024 * 1024 }] },
      })
    ).status(),
  ).toBe(400);
});

test('the form API rate-limits a single client', async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': freshIp() } });
  const statuses: number[] = [];
  for (let i = 0; i < 10; i++) statuses.push((await request.post('/api/submissions', { data: { kind: 'nope', data: {} } })).status());
  expect(statuses.slice(0, 8).every((s) => s === 400)).toBe(true);
  expect(statuses.slice(8)).toEqual([429, 429]);
});

test('cache revalidation requires a signed-in editor', async ({ request }) => {
  expect((await request.post('/api/revalidate')).status()).toBe(401);
  expect((await request.post('/api/revalidate', { headers: { Authorization: 'Bearer forged' } })).status()).toBe(401);
});

test('form writes reject cross-site requests, non-JSON and oversized streams', async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': freshIp() } });
  expect((await request.post('/api/submissions', { headers: { Origin: 'https://attacker.example' }, data: {} })).status()).toBe(403);
  expect((await request.post('/api/submissions', { headers: { 'Sec-Fetch-Site': 'cross-site' }, data: {} })).status()).toBe(403);
  expect((await request.post('/api/submissions', { headers: { 'Content-Type': 'text/plain' }, data: '{}' })).status()).toBe(415);
  expect((await request.post('/api/submissions', { data: { padding: 'x'.repeat(40_000) } })).status()).toBe(413);
  await request.dispose();
});

test('throttling includes a retry time and uploads have a separate server limit', async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': freshIp() } });
  for (let i = 0; i < 20; i++) expect((await request.post('/api/submissions/uploads', { data: {} })).status()).toBe(400);
  const response = await request.post('/api/submissions/uploads', { data: {} });
  expect(response.status()).toBe(429);
  expect(Number(response.headers()['retry-after'])).toBeGreaterThan(0);
  expect(response.headers()['cache-control']).toBe('no-store');
  await request.dispose();
});

test('signed upload receipts reject modified metadata and forged signatures', async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': freshIp() } });
  const file = { field: 'cv', name: 'cv.pdf', type: 'application/pdf', size: 12 };
  const signed = await request.post('/api/submissions/uploads', { data: { kind: 'career', files: [file] } });
  expect(signed.status()).toBe(200);
  const {
    uploads: [upload],
  } = await signed.json();
  const body = {
    kind: 'career',
    data: { name: 'Ayesha', email: 'ayesha@example.com', position: 'Other' },
    files: [{ ...file, path: upload.path, receipt: upload.receipt }],
  };
  expect((await request.post('/api/submissions', { data: { ...body, files: [{ ...body.files[0], size: 14 }] } })).status()).toBe(400);
  expect(
    (
      await request.post('/api/submissions', {
        data: { ...body, files: [{ ...body.files[0], receipt: `${Date.now() + 60_000}.${'0'.repeat(64)}` }] },
      })
    ).status(),
  ).toBe(400);
  expect((await request.post('/api/submissions/uploads', { data: { kind: 'career', files: [file, file] } })).status()).toBe(400);
  await request.dispose();
});
