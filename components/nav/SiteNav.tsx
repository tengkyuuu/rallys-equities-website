'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { showAdminPage, useAdminPage } from '@/lib/admin/pages';
import { pageIdForPath, pathFor, type PageId } from '@/lib/site';

/* How in-site links navigate. On the public site every page is its own route, so
   links are real <a href> navigations. Inside /admin all pages live in one document
   (the visual editor needs that), so links switch pages in place instead of leaving
   the editor. */
export type SiteNavigator = {
  intercept: boolean;
  /** the page currently on screen */
  current: PageId | null;
  go: (page: PageId, section?: string) => void;
};

const SiteNavContext = createContext<SiteNavigator | null>(null);

/** Provided once, in the root layout, around everything (chrome included). */
export function SiteNavRoot({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const adminPage = useAdminPage();
  const admin = pathname === '/admin';
  const value = useMemo<SiteNavigator>(
    () =>
      admin
        ? { intercept: true, current: adminPage, go: showAdminPage }
        : {
            intercept: false,
            current: pageIdForPath(pathname),
            go: (page, section) => router.push(pathFor(page) + (section ? '#' + section : '')),
          },
    [admin, adminPage, pathname, router],
  );
  return <SiteNavContext.Provider value={value}>{children}</SiteNavContext.Provider>;
}

export function useSiteNav(): SiteNavigator {
  const ctx = useContext(SiteNavContext);
  if (!ctx) throw new Error('useSiteNav must be used inside <SiteNavRoot>');
  return ctx;
}
