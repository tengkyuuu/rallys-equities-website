'use client';

import { createElement, type HTMLAttributes, type MouseEvent } from 'react';
import type { PageId } from '@/lib/site';
import { useSiteNav } from './SiteNav';

type Props = HTMLAttributes<HTMLElement> & {
  /** Rendered tag. Kept identical to the original markup: the editor's saved keys count tags. */
  as: 'button' | 'div' | 'span' | 'li' | 'article';
  page: PageId;
  /** Element id to scroll to after navigating. */
  section?: string;
  type?: 'button' | 'submit' | 'reset';
};

/** A non-link element (button, card…) that navigates to another page when clicked. */
export default function GoTo({ as, page, section, onClick, ...rest }: Props) {
  const nav = useSiteNav();
  return createElement(as, {
    'data-page': page,
    ...rest,
    onClick: (e: MouseEvent<HTMLElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) nav.go(page, section);
    },
  });
}
