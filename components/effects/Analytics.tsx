'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/* GA4 + Sentry. Both are no-ops until NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_SENTRY_DSN are set.
   Scripts are injected from here, so the CSP's 'strict-dynamic' trusts them without
   allowlisting their hosts. Page views are sent per route; /admin is never tracked. */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    Sentry?: { init(o: { dsn: string; environment: string }): void };
  }
}

function loadScript(src: string, crossOrigin?: boolean, onload?: () => void) {
  const s = document.createElement('script');
  s.src = src;
  if (crossOrigin) s.crossOrigin = 'anonymous';
  if (onload) s.onload = onload;
  document.head.appendChild(s);
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (SENTRY_DSN) {
      loadScript('https://cdn.jsdelivr.net/npm/@sentry/browser@7/build/bundle.min.js', true, () =>
        window.Sentry?.init({ dsn: SENTRY_DSN, environment: location.hostname === 'www.rallysequities.com' ? 'production' : 'preview' }),
      );
    }
    if (GA_ID) {
      window.dataLayer = window.dataLayer || [];
      // gtag.js reads the Arguments objects pushed here, so this must not be an arrow function
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { send_page_view: false });
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID));
    }
  }, []);

  useEffect(() => {
    if (!GA_ID || pathname === '/admin') return;
    window.gtag?.('event', 'page_view', { page_path: pathname, page_title: document.title });
  }, [pathname]);

  return null;
}
