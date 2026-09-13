/* ════════════════════════════════════════════════════════════════
   Sentry error monitoring for the Rallys Equities website.

   Paste your Sentry DSN below (Sentry → Settings → Projects → <project>
   → Client Keys (DSN)). Until you do, this is a no-op — nothing loads,
   nothing breaks, the site behaves exactly as it does today.

   Note: the CSP in vercel.json already allows Sentry's ingest endpoints
   (*.ingest.sentry.io / *.ingest.us.sentry.io / *.ingest.de.sentry.io).
   If your Sentry org uses a different ingest host, the browser console
   will show a CSP violation the first time an error tries to report —
   just add that host to connect-src in vercel.json.
   ════════════════════════════════════════════════════════════════ */
window.RE_SENTRY = {
  dsn: ""   // e.g. "https://abc123@o000000.ingest.us.sentry.io/0000000"
};
