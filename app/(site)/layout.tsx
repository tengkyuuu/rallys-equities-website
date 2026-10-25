import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';

import '@/styles/links.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/sections.css';
import '@/styles/footer.css';
import '@/styles/navigation.css';
import '@/styles/tools.css';
import '@/styles/graphics.css';
import '@/styles/luxury.css';
import '@/styles/immersive.css';
import '@/styles/light-theme.css';
import '@/styles/responsive.css';
import '@/styles/blog.css';
import '@/styles/forms-dynamic.css';
import '@/styles/toast.css';

import ContentHead from '@/components/content/ContentHead';
import ContentOverrides from '@/components/content/ContentOverrides';
import Analytics from '@/components/effects/Analytics';
import SiteEffects from '@/components/effects/SiteEffects';
import { BackToTop, WhatsAppBubble } from '@/components/layout/FloatingActions';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Nav from '@/components/layout/Nav';
import Preloader from '@/components/layout/Preloader';
import MarketProvider from '@/components/market/MarketProvider';
import Ticker from '@/components/market/Ticker';
import DocViewer, { DocViewerProvider } from '@/components/overlays/DocViewer';
import Toaster from '@/components/overlays/Toaster';
import { SiteNavRoot } from '@/components/nav/SiteNav';
import JsonLd from '@/components/seo/JsonLd';
import { getSiteContent } from '@/lib/content';
import { ORGANIZATION_LD } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  icons: { icon: { url: '/assets/img/favicon.png', type: 'image/png' } },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap';

/* Dark is the default theme; apply a saved "light" choice before first paint so there's no flash. */
const THEME_INIT = `try{if(localStorage.getItem('re-theme')==='light')document.body.classList.add('light')}catch(e){}`;

/* Body order matters: the editor's saved keys for site chrome count elements from <body>
   (e.g. `site.body1-nav1-…`), so the chrome below keeps the original document order. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const content = await getSiteContent();

  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/assets/img/page-title.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href={FONTS} rel="stylesheet" />
        <JsonLd data={ORGANIZATION_LD} />
        <ContentHead content={content} />
      </head>
      <body suppressHydrationWarning>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <SiteNavRoot>
          <DocViewerProvider>
            <MarketProvider>
              <Preloader />
              <div id="scrollProg" />
              <DocViewer />
              <Nav />
              <MobileMenu />
              <Ticker />
              {children}
              <WhatsAppBubble />
              <BackToTop />
              <Footer />
              <Toaster />
              <ContentOverrides content={content} />
              <SiteEffects />
              <Analytics />
            </MarketProvider>
          </DocViewerProvider>
        </SiteNavRoot>
      </body>
    </html>
  );
}
