'use client';

import { toast } from '@/lib/toast';

/** Copy link / WhatsApp / LinkedIn for a post's canonical /blog/<slug> URL. */
export default function PostShare({ slug, title }: { slug: string; title?: string }) {
  const url = () => location.origin + '/blog/' + encodeURIComponent(slug);
  const text = (title || 'Rallys Equities blog') + ' — Rallys Equities';
  const copy = () => {
    if (!navigator.clipboard?.writeText) {
      toast('Could not copy the link.', 'err');
      return;
    }
    navigator.clipboard.writeText(url()).then(
      () => toast('Link copied to your clipboard.'),
      () => toast('Could not copy the link.', 'err'),
    );
  };
  const open = (href: string) => window.open(href, '_blank', 'noopener');
  return (
    <div className="post-share">
      <span className="post-share-l">Share</span>
      <button className="post-sh" type="button" onClick={copy}>
        Copy link
      </button>
      <button className="post-sh" type="button" onClick={() => open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url()))}>
        WhatsApp
      </button>
      <button
        className="post-sh"
        type="button"
        onClick={() => open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url()))}
      >
        LinkedIn
      </button>
    </div>
  );
}
