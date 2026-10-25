'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { SiteContent } from '@/lib/content-types';
import { applyOverrides } from '@/lib/overrides/engine';

/* Applies the published editor record's position-keyed edits (text, images, hidden and
   reordered elements) to the page on screen. Theme, fonts, pricing and selector-hidden
   elements are already in the server HTML. Runs before paint on every navigation, since
   each route brings fresh markup. /admin is skipped: the editor applies its own draft. */
export default function ContentOverrides({ content }: { content: SiteContent }) {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (pathname === '/admin') return;
    applyOverrides(content);
  }, [pathname, content]);
  return null;
}
