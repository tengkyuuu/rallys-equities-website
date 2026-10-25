import type { Metadata } from 'next';
import { PAGE_META, SITE_NAME, SITE_URL, breadcrumbItems, type PageId } from './site';
import { SOCIAL } from './company';

const OG_IMAGE = `${SITE_URL}/assets/img/logo.png`;

/** <head> metadata for one page: title, description, canonical URL, Open Graph and Twitter. */
export function pageMetadata(id: PageId, override?: { title?: string; desc?: string; path?: string }): Metadata {
  const m = { ...PAGE_META[id], ...override };
  const url = SITE_URL + m.path;
  return {
    title: m.title,
    description: m.desc,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: SITE_NAME, title: m.title, description: m.desc, url, images: [OG_IMAGE] },
    twitter: { card: 'summary', title: m.title, description: m.desc, images: [OG_IMAGE] },
  };
}

export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'Rallys Equities (Pvt) Ltd',
  url: `${SITE_URL}/`,
  logo: OG_IMAGE,
  image: OG_IMAGE,
  description:
    'Making investment in the Pakistan Stock Exchange simple, secure and transparent — licensed and regulated by the SECP & PSX.',
  email: 'hello@rallysequities.com',
  telephone: '+92-42-36366667',
  address: { '@type': 'PostalAddress', streetAddress: 'LSE Building', addressLocality: 'Lahore', addressCountry: 'PK' },
  sameAs: [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin],
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
