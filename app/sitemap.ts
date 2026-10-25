import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/content';
import { PAGE_IDS, PAGE_META, SITE_URL } from '@/lib/site';

/** /sitemap.xml — every page plus every published post's /blog/<slug> URL, generated fresh. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [...new Set(PAGE_IDS.filter((id) => id !== 'post').map((id) => PAGE_META[id].path))];
  const posts = [...new Set((await getPosts()).map((p) => '/blog/' + encodeURIComponent(p.slug)))];
  return [...pages, ...posts].map((path) => ({ url: SITE_URL + path }));
}
