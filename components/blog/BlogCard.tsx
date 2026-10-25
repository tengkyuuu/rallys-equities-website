'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/** A whole-card link to a post (the original's <article role="link"> markup and keyboard behaviour). */
export default function BlogCard({ slug, className, children }: { slug: string; className: string; children: ReactNode }) {
  const router = useRouter();
  const href = '/blog/' + encodeURIComponent(slug);
  const open = () => router.push(href);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };
  return (
    <article
      className={className}
      role="link"
      tabIndex={0}
      data-href={href}
      onClick={open}
      onKeyDown={onKey}
      onMouseEnter={() => router.prefetch(href)}
    >
      {children}
    </article>
  );
}
