import { notFound } from 'next/navigation';
import SitePage from '@/components/layout/SitePage';
import PostPage from '@/components/pages/PostPage';
import JsonLd from '@/components/seo/JsonLd';
import { getPost } from '@/lib/content';
import { blogPostingLd, pageMetadata } from '@/lib/metadata';
import { PAGE_META, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

const postPath = (slug: string) => '/blog/' + encodeURIComponent(slug);
/** A post's cover as an absolute URL (share images must be absolute), or undefined. */
const absolute = (src?: string) => (!src ? undefined : /^https?:\/\//.test(src) ? src : SITE_URL + (src.startsWith('/') ? '' : '/') + src);
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
    image: absolute(p.cover),
  });
}

export default async function Page({ params }: Props) {
  const hit = await getPost(await slugOf(params));
  if (!hit) notFound();
  const { post: p, index, posts } = hit;
  const url = SITE_URL + postPath(p.slug);
  return (
    <SitePage id="post" crumb={{ name: p.title || 'Untitled', path: postPath(p.slug) }}>
      <JsonLd data={blogPostingLd({ ...p, cover: absolute(p.cover) }, url)} />
      <PostPage post={p} more={posts.filter((_, n) => n !== index).slice(0, 3)} />
    </SitePage>
  );
}
