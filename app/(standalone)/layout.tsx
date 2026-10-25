import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';

/* Root layout for pages that stand alone, outside the site chrome (invite / password
   set-up). Moving between root layouts is a full page load, so their styles stay apart.

   Rendered per request: Next.js only stamps the CSP nonce onto its scripts during a
   request, and a prerendered page's scripts would be blocked by the policy. */

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

export default async function StandaloneLayout({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/img/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
