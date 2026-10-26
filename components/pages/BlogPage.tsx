import Link from 'next/link';
import { FeaturedPost, PostCard } from '@/components/blog/parts';
import PageHero from '@/components/ui/PageHero';
import { blogPageHref, pageWindow } from '@/lib/blog-pages';
import type { PublishedPost } from '@/lib/content';

type Props = {
  /** The newest post, shown large (page 1 only). */
  featured?: PublishedPost;
  posts?: PublishedPost[];
  page?: number;
  pages?: number;
};

/** Blogs list, one page of it (see lib/blog-pages). Posts are written in /admin → Blog Posts.
    Inside /admin nothing is passed: the editor fills these containers itself to preview drafts. */
export default function BlogPage({ featured: feat, posts, page = 1, pages = 1 }: Props) {
  const rest = posts ?? [];
  const empty = posts !== undefined && !feat && !rest.length;
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
        <div className="blog-empty" id="blogEmpty" style={{ display: empty ? 'block' : 'none' }}>
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
        {pages > 1 && (
          <nav className="blog-pager" aria-label="Blog pages">
            {page > 1 && (
              <Link href={blogPageHref(page - 1)} rel="prev" className="blog-pager-step">
                ← Newer
              </Link>
            )}
            <ol>
              {pageWindow(page, pages).map((n, i) =>
                n === '…' ? (
                  <li key={'gap' + i} aria-hidden="true">
                    …
                  </li>
                ) : (
                  <li key={n}>
                    <Link href={blogPageHref(n)} aria-current={n === page ? 'page' : undefined}>
                      {n}
                    </Link>
                  </li>
                ),
              )}
            </ol>
            {page < pages && (
              <Link href={blogPageHref(page + 1)} rel="next" className="blog-pager-step">
                Older →
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
