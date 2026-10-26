import type { Metadata } from 'next';
import { CALCULATORS } from './calculators/data';
import { OFFICE_DIRECTIONS_URL, SOCIAL } from './company';
import { SERVICE_PAGES, type ServicePageId } from './services';
import { CONTACT_EMAIL, PAGE_META, SITE_NAME, SITE_URL, breadcrumbItems, shortTitle, type PageId } from './site';

const LOGO = `${SITE_URL}/assets/img/logo.png`;
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** The 1200×630 share image for a page (app/og/[id]/route.tsx). */
export const ogImageUrl = (id: PageId) => `${SITE_URL}/og/${id}`;

/** <head> metadata for one page: title, description, canonical URL, Open Graph and Twitter. */
export function pageMetadata(id: PageId, override?: { title?: string; desc?: string; path?: string; image?: string }): Metadata {
  const m = { ...PAGE_META[id], ...override };
  const url = SITE_URL + m.path;
  const image = { url: override?.image ?? ogImageUrl(id), width: 1200, height: 630, alt: m.title };
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_PK', title: m.title, description: m.desc, url, images: [image] },
    twitter: { card: 'summary_large_image', title: m.title, description: m.desc, images: [image.url] },
  };
}

/* The business, once per page (site layout). FinancialService is a LocalBusiness, so this also
   feeds the map/knowledge panel: name, address, hours, phones, licence and profiles. */
export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  '@id': ORG_ID,
  name: 'Rallys Equities (Pvt) Ltd',
  alternateName: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: LOGO },
  image: ogImageUrl('home'),
  description:
    'SECP-licensed stock brokerage on the Pakistan Stock Exchange (TREC No. 553), in the Lahore Stock Exchange Building: online trading, Shariah-compliant investing, portfolio management and research.',
  foundingDate: '2025',
  email: CONTACT_EMAIL,
  telephone: '+92-42-36366667',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Office #408, 4th Floor, Lahore Stock Exchange Building, Khayaban-e-Aiwan-e-Iqbal',
    addressLocality: 'Lahore',
    addressRegion: 'Punjab',
    addressCountry: 'PK',
  },
  hasMap: OFFICE_DIRECTIONS_URL,
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+92-42-36366667', availableLanguage: ['English', 'Urdu'] },
    { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+92-316-9991907', availableLanguage: ['English', 'Urdu'] },
  ],
  identifier: { '@type': 'PropertyValue', propertyID: 'PSX TREC', value: '553' },
  memberOf: { '@type': 'Organization', name: 'Pakistan Stock Exchange', url: 'https://www.psx.com.pk/' },
  areaServed: { '@type': 'Country', name: 'Pakistan' },
  knowsLanguage: ['en', 'ur'],
  sameAs: [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin],
};

export const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  inLanguage: 'en-PK',
  publisher: { '@id': ORG_ID },
};

export function breadcrumbLd(id: PageId, leaf?: { name: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems(id, leaf).map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path,
    })),
  };
}

/** Extra structured data for a page type: each service is a Service, each calculator a free WebApplication. */
export function pageLd(id: PageId): object[] {
  const url = SITE_URL + PAGE_META[id].path;
  if (id in SERVICE_PAGES)
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: shortTitle(id),
        serviceType: shortTitle(id),
        description: PAGE_META[id].desc,
        url,
        image: SITE_URL + SERVICE_PAGES[id as ServicePageId].image.src,
        provider: { '@id': ORG_ID },
        areaServed: { '@type': 'Country', name: 'Pakistan' },
      },
    ];
  if (id in CALCULATORS)
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: shortTitle(id),
        description: PAGE_META[id].desc,
        url,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR' },
        publisher: { '@id': ORG_ID },
      },
    ];
  return [];
}

/** BlogPosting for one post. */
export function blogPostingLd(p: { title?: string; excerpt?: string; cover?: string; date?: string }, url: string) {
  const published = Date.parse(p.date || '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: (p.title || 'Untitled').slice(0, 110),
    description: p.excerpt || '',
    url,
    mainEntityOfPage: url,
    inLanguage: 'en-PK',
    author: { '@type': 'Organization', '@id': ORG_ID, name: SITE_NAME, url: `${SITE_URL}/` },
    publisher: { '@type': 'Organization', '@id': ORG_ID, name: SITE_NAME, logo: { '@type': 'ImageObject', url: LOGO } },
    image: p.cover || ogImageUrl('insights'),
    ...(isNaN(published) ? {} : { datePublished: new Date(published).toISOString(), dateModified: new Date(published).toISOString() }),
  };
}
