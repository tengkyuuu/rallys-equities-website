import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/content';
import { PAGE_IDS, PAGE_META, SITE_URL } from '@/lib/site';

/** /sitemap.xml — every page plus every published post's /blog/<slug> URL, generated fresh.
    Posts carry their publish date as lastmod; pages have no reliable edit date, so none is claimed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [...new Set(PAGE_IDS.filter((id) => id !== 'post').map((id) => PAGE_META[id].path))].map((path) => ({
    url: SITE_URL + path,
  }));
  const seen = new Set<string>();
  const posts = (await getPosts()).flatMap((p) => {
    const url = SITE_URL + '/blog/' + encodeURIComponent(p.slug);
    if (seen.has(url)) return [];
    seen.add(url);
    const date = Date.parse(p.date || '');
    return [{ url, ...(isNaN(date) ? {} : { lastModified: new Date(date) }) }];
  });
  return [...pages, ...posts];
}
