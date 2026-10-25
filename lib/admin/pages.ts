'use client';

import { useSyncExternalStore } from 'react';
import type { PageId } from '@/lib/site';

/* /admin page switching. Every page is in the document there (the editor needs that),
   so switching is a class toggle, exactly as the original single-page site did — the
   page divs stay out of React's className control because the editor also marks them
   hidden (`re-hid`). Nav highlighting subscribes to the current page. */

let current: PageId = 'home';
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useAdminPage = () =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => 'home' as PageId,
  );

export function showAdminPage(id: PageId, section?: string) {
  const target = document.getElementById('page-' + id);
  if (target?.classList.contains('re-hid') && id !== 'home') id = 'home'; // page hidden in the editor → home
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) {
    pg.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  current = id;
  listeners.forEach((l) => l());
  // canvases sized while hidden need a redraw now they're visible
  setTimeout(() => window.dispatchEvent(new Event('re-recolor')), 80);
  if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}
