'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { pathFor, type PageId } from '@/lib/site';
import { useSiteNav } from './SiteNav';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  page: PageId;
  /** Element id on the target page to scroll to. */
  section?: string;
};

/** A link to another page of the site. `data-page` lets the editor (and page-hiding) find every route in. */
export default function PageLink({ page, section, onClick, children, ...rest }: Props) {
  const nav = useSiteNav();
  const path = pathFor(page);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (nav.intercept) {
      e.preventDefault();
      nav.go(page, section);
      return;
    }
    if (!section && location.pathname === path) window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return (
    <Link href={section ? `${path}#${section}` : path} data-page={page} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
