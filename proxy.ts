import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL } from '@/lib/supabase-config';

/* Per-request Content-Security-Policy with a fresh script nonce. Next.js reads the
   nonce from the request's CSP header and stamps it on its own scripts; scripts those
   load (editor.js, gtag) are trusted transitively via 'strict-dynamic'. Inline event
   handler attributes and javascript: URLs are therefore blocked outright.

   style-src keeps 'unsafe-inline': the design relies on style attributes and the
   editor injects theme <style> tags. That is the narrower, lower-risk half of CSP. */
// only this project's Supabase, not every *.supabase.co tenant
const SUPABASE = new URL(SUPABASE_URL).origin;
const SUPABASE_WS = SUPABASE.replace(/^http/, 'ws');

function csp(nonce: string) {
  const dev = process.env.NODE_ENV === 'development';
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? ` 'unsafe-eval'` : ''}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: ${SUPABASE}`,
    `connect-src 'self' ${SUPABASE} ${SUPABASE_WS} https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com`,
    `frame-src 'self' https://maps.google.com https://www.google.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = csp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  matcher: [
    {
      // pages only — skip API routes, build output, and anything with a file extension (public/)
      source: '/((?!api/|_next/static|_next/image|assets/|.*\\.[a-zA-Z0-9]+$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
