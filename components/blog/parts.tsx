import type { PublishedPost } from '@/lib/content';
import BlogCard from './BlogCard';

export const fmtPostDate = (d?: string) => {
  const t = Date.parse(d || '');
  return t ? new Date(t).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : d || '';
};

export const Arrow = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </svg>
);

/** date · reading time */
export const BlogMeta = ({ p }: { p: PublishedPost }) => (
  <div className="blog-meta">
    <span>{fmtPostDate(p.date)}</span>
    <i />
    <span className="rt">{p.readTime}</span>
  </div>
);

const NoCover = ({ feat }: { feat?: boolean }) => (
  <div className={feat ? 'blog-feat-cov blog-nocov' : 'blog-nocov'}>
    <span>Rallys</span>
  </div>
);

/** Newest post: the wide editorial card at the top of the list. */
export function FeaturedPost({ p }: { p: PublishedPost }) {
  return (
    <BlogCard slug={p.slug} className="blog-feat">
      {p.cover ? (
        <div className="blog-feat-cov">
          <img loading="lazy" src={p.cover} alt="" />
        </div>
      ) : (
        <NoCover feat />
      )}
      <div className="blog-feat-body">
        <span className="blog-feat-tag">Latest blog</span>
        <BlogMeta p={p} />
        <h3>{p.title || 'Untitled'}</h3>
        {p.excerpt && <p>{p.excerpt}</p>}
        <span className="blog-more">
          Read the full note <Arrow />
        </span>
      </div>
    </BlogCard>
  );
}

export function PostCard({ p, excerpt = true }: { p: PublishedPost; excerpt?: boolean }) {
  return (
    <BlogCard slug={p.slug} className="blog-card">
      {p.cover ? (
        <div className="blog-cover">
          <img loading="lazy" src={p.cover} alt="" />
        </div>
      ) : (
        <NoCover />
      )}
      <div className="blog-body">
        <BlogMeta p={p} />
        <h3>{p.title || 'Untitled'}</h3>
        {excerpt && p.excerpt && <p>{p.excerpt}</p>}
        <span className="blog-more">
          Read more <Arrow />
        </span>
      </div>
    </BlogCard>
  );
}
