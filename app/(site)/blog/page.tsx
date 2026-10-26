import { notFound } from 'next/navigation';
import SitePage from '@/components/layout/SitePage';
import BlogPage from '@/components/pages/BlogPage';
import { blogPage, blogPageHref } from '@/lib/blog-pages';
import { getPosts } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { PAGE_META } from '@/lib/site';

type Props = { searchParams: Promise<{ page?: string }> };

const pageNumber = async (searchParams: Props['searchParams']) => {
  const raw = (await searchParams).page;
  return raw === undefined ? 1 : Number(raw);
};

/** Each list page is its own canonical URL with its own title, so page 2+ is never a duplicate of page 1. */
export async function generateMetadata({ searchParams }: Props) {
  const n = await pageNumber(searchParams);
  if (n === 1 || !Number.isInteger(n)) return pageMetadata('insights');
  const m = PAGE_META.insights;
  return pageMetadata('insights', {
    title: m.title.replace(' — ', ` (Page ${n}) — `),
    desc: `Page ${n} of the Rallys Equities blog: older PSX market commentary, research notes and investor education articles.`,
    path: blogPageHref(n),
  });
}

export default async function Page({ searchParams }: Props) {
  const n = await pageNumber(searchParams);
  const slice = blogPage(await getPosts(), n);
  if (!slice) notFound();
  return (
    <SitePage id="insights">
      <BlogPage featured={slice.featured} posts={slice.list} page={n} pages={slice.pages} />
    </SitePage>
  );
}
