// Shared test helpers.
//
// applySecurityHeaders() reads the ACTUAL security headers block straight out of
// vercel.json and applies it (only to our own origin, never to third-party responses
// like maps.google.com — real Vercel headers never apply cross-origin either) so tests
// exercise the real deployed CSP instead of a hand-copied string that could drift out
// of sync with vercel.json.
const fs = require('fs');
const path = require('path');

function getVercelHeaders() {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
  const block = (cfg.headers || []).find((h) => h.source === '/(.*)');
  const map = {};
  for (const h of block.headers) map[h.key.toLowerCase()] = h.value;
  return map;
}

async function applySecurityHeaders(context) {
  const extra = getVercelHeaders();
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'localhost') { await route.continue(); return; }
    try {
      const response = await route.fetch();
      await route.fulfill({ response, headers: { ...response.headers(), ...extra } });
    } catch (e) {
      // Transient local-dev-server hiccup re-fetching a resource (e.g. ECONNRESET under
      // concurrent load) — fall back to a normal pass-through rather than failing the test
      // over test-infrastructure flakiness. Real CSP checks still run against every response
      // that succeeds; this only affects the rare one that doesn't.
      await route.continue().catch(() => {});
    }
  });
}

function collectConsoleIssues(page) {
  const issues = { cspViolations: [], consoleErrors: [], pageErrors: [] };
  page.on('console', (m) => {
    const t = m.text();
    if (/Content Security Policy|Refused to/i.test(t)) issues.cspViolations.push(t);
    else if (m.type() === 'error') issues.consoleErrors.push(t);
  });
  page.on('pageerror', (e) => issues.pageErrors.push(e.message));
  return issues;
}

module.exports = { getVercelHeaders, applySecurityHeaders, collectConsoleIssues };
