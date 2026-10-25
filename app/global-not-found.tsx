import type { Metadata } from 'next';
import { connection } from 'next/server';
import '@/styles/not-found.css';

export const metadata: Metadata = {
  title: 'Page Not Found — Rallys Equities',
  robots: { index: false, follow: true },
  icons: { icon: { url: '/assets/img/favicon.png', type: 'image/png' } },
};

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';

/** 404 for any URL that matches no route. Standalone, like the original 404.html.
    Rendered per request so Next's scripts carry the CSP nonce (see proxy.ts). */
export default async function GlobalNotFound() {
  await connection();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body>
        <div className="wrap">
          <div className="lm">RE</div>
          <div className="code">404</div>
          <h1>This page doesn't exist</h1>
          <p>The page you're looking for may have moved or the link may be out of date. Here are a few places to go instead.</p>
          <div className="btns">
            {/* plain links on purpose: this page has its own root layout, so leaving it is a full page load */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="b b-g" href="/">
              Back to Home
            </a>
            <a className="b b-o" href="/contact">
              Contact Us
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
