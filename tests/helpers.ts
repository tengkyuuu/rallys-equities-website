import type { APIRequestContext, Page } from '@playwright/test';

export const MOCK = 'http://127.0.0.1:54321';
export const EDITOR = { email: 'editor@example.com', password: 'correct-horse-battery' };

/** Console noise worth failing on: CSP violations, uncaught errors, console.error. */
export function collectConsoleIssues(page: Page) {
  const issues = { cspViolations: [] as string[], consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (m) => {
    const t = m.text();
    if (/Content Security Policy|Refused to/i.test(t)) issues.cspViolations.push(t);
    // the market feed is mocked as down in most tests; that 502 is expected
    else if (m.type() === 'error' && !/status of 502/.test(t)) issues.consoleErrors.push(t);
  });
  page.on('pageerror', (e) => issues.pageErrors.push(e.message));
  return issues;
}

/** The market feed answers 502, as PSX's portal does today. */
export const marketDown = (page: Page) =>
  page.route('**/api/market', (r) =>
    r.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"KSE100 unavailable upstream"}' }),
  );

export async function mockState(request: APIRequestContext) {
  return (await request.get(`${MOCK}/__test/state`)).json();
}

/** Back to the fixture content, and make the site drop its cached copy. */
export async function resetContent(request: APIRequestContext) {
  await request.post(`${MOCK}/__test/reset`);
  const s = await (await request.post(`${MOCK}/auth/v1/token?grant_type=password`, { data: EDITOR })).json();
  await request.post('/api/revalidate', { headers: { Authorization: `Bearer ${s.access_token}` } });
}

/** A unique client address per test, so the API rate limits don't leak between tests.
    (Locally `next start` trusts X-Forwarded-For; on Vercel the platform sets it.) */
export const freshIp = () => `10.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}`;
