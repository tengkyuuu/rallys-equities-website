import SitePage from '@/components/layout/SitePage';
import BlogPage from '@/components/pages/BlogPage';
import { getPosts } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('insights');

export default async function Page() {
  const posts = await getPosts();
  return (
    <SitePage id="insights">
      <BlogPage posts={posts} />
    </SitePage>
  );
}
