import type { NextConfig } from 'next';

/* Static security headers. The Content-Security-Policy is per-request (it carries a
   nonce), so it is set in proxy.ts instead. */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const config: NextConfig = {
  // the e2e suite builds against a mock Supabase into its own directory (see playwright.config.ts)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  reactStrictMode: true,
  /* Blocking (non-streamed) metadata for every client. Streaming puts a <div hidden>
     at the top of <body>, which would shift the editor's body-level element keys. */
  htmlLimitedBots: /.*/,
  agentRules: false,
  experimental: {
    globalNotFound: true,
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/set-password.html', destination: '/set-password', permanent: true },
      // the editor used to open on any page with ?edit=1; it lives at /admin now
      { source: '/:path((?!admin).*)', has: [{ type: 'query', key: 'edit' }], destination: '/admin', permanent: false },
    ];
  },
};

export default config;
