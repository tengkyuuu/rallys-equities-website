import { FeaturedPost, PostCard } from '@/components/blog/parts';
import PageHero from '@/components/ui/PageHero';
import type { PublishedPost } from '@/lib/content';

/** Blogs list. Posts are written in /admin → Blog Posts. Inside /admin `posts` is
    omitted: the editor fills these containers itself to preview drafts. */
export default function BlogPage({ posts }: { posts?: PublishedPost[] }) {
  const [feat, ...rest] = posts ?? [];
  return (
    <>
      <PageHero
        tag="Blogs"
        title={
          <>
            Our <em>Blogs</em>
          </>
        }
        lede="Research notes, market commentary and investor education from the Rallys Equities desk."
      />
      <section className="sec">
        <div id="blogFeat">{feat && <FeaturedPost p={feat} />}</div>
        <div className="blog-grid" id="blogList">
          {rest.map((p) => (
            <PostCard key={p.id || p.slug} p={p} />
          ))}
        </div>
        <div className="blog-empty" id="blogEmpty" style={{ display: posts && !posts.length ? 'block' : 'none' }}>
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--au)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 13H8" />
            <path d="M16 17H8" />
          </svg>{' '}
          <b>New blogs are on the way</b>{' '}
          <span>Our desk publishes market commentary, research notes and investor education here. Check back soon.</span>
        </div>
      </section>
    </>
  );
}
