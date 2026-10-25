import { BlogMeta, PostCard } from '@/components/blog/parts';
import PostShare from '@/components/blog/PostShare';
import PageLink from '@/components/nav/PageLink';
import type { PublishedPost } from '@/lib/content';
import { sanitizePostHtml } from '@/lib/sanitize-server';

type Props = { post?: PublishedPost; more?: PublishedPost[] };

/** One blog post, with up to three others to read next. Inside /admin `post` is
    omitted and the editor renders its preview into #postView. */
export default function PostPage({ post: p, more = [] }: Props) {
  return (
    <>
      <section className="sec" style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div id="postView">
          {p && (
            <>
              <PageLink page="insights" className="blog-back">
                ← All blogs
              </PageLink>
              <div className="post-head">
                <BlogMeta p={p} />
                <h1 className="blog-title">{p.title || 'Untitled'}</h1>
                {p.excerpt && (
                  <p className="sub" style={{ maxWidth: '62ch', margin: 0 }}>
                    {p.excerpt}
                  </p>
                )}
                <div className="post-rule" />
              </div>
              {p.cover && <img className="blog-hero" src={p.cover} alt="" />}
              <div className="blog-post" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(p.body) }} />
              <PostShare slug={p.slug} title={p.title} />
              {more.length > 0 && (
                <div className="post-more">
                  <div className="post-more-h">More blogs</div>
                  <div className="blog-grid">
                    {more.map((m) => (
                      <PostCard key={m.id || m.slug} p={m} excerpt={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
