import { notFound } from 'next/navigation';
import SitePage from '@/components/layout/SitePage';
import PostPage from '@/components/pages/PostPage';
import JsonLd from '@/components/seo/JsonLd';
import { getPost } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { PAGE_META, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

const postPath = (slug: string) => '/blog/' + encodeURIComponent(slug);
const slugOf = async (params: Props['params']) => {
  const s = (await params).slug;
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export async function generateMetadata({ params }: Props) {
  const hit = await getPost(await slugOf(params));
  if (!hit) return pageMetadata('insights');
  const p = hit.post;
  return pageMetadata('post', {
    title: p.title ? `${p.title} — Rallys Equities Blogs` : 'Rallys Equities Blogs',
    desc: (p.excerpt || PAGE_META.insights.desc).slice(0, 160),
    path: postPath(p.slug),
  });
}

export default async function Page({ params }: Props) {
  const hit = await getPost(await slugOf(params));
  if (!hit) notFound();
  const { post: p, index, posts } = hit;
  const url = SITE_URL + postPath(p.slug);
  const published = Date.parse(p.date || '');
  return (
    <SitePage id="post" crumb={{ name: p.title || 'Untitled', path: postPath(p.slug) }}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title || 'Untitled',
          description: p.excerpt || '',
          url,
          author: { '@type': 'Organization', name: 'Rallys Equities' },
          publisher: {
            '@type': 'Organization',
            name: 'Rallys Equities',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/img/logo.png` },
          },
          ...(isNaN(published) ? {} : { datePublished: new Date(published).toISOString() }),
          ...(p.cover ? { image: p.cover } : {}),
        }}
      />
      <PostPage post={p} more={posts.filter((_, n) => n !== index).slice(0, 3)} />
    </SitePage>
  );
}
