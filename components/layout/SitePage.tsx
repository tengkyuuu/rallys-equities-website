import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { getSiteContent } from '@/lib/content';
import { breadcrumbLd } from '@/lib/metadata';
import type { PageId } from '@/lib/site';

type Props = {
  id: PageId;
  children: ReactNode;
  /** breadcrumb leaf for pages whose title isn't the generic one (blog posts) */
  crumb?: { name: string; path: string };
};

/* One page of the site. The `#page-<id>` wrapper is load-bearing: the editor's saved
   keys are rooted at it (e.g. `home.div4-div2-…`). A page hidden from /admin redirects home. */
export default async function SitePage({ id, children, crumb }: Props) {
  const content = await getSiteContent();
  if (id !== 'home' && content.hidden?.[`page:${id}`]) redirect('/');
  return (
    <>
      {id !== 'home' && <JsonLd data={breadcrumbLd(id, crumb)} />}
      <div className="page active" id={`page-${id}`}>
        {children}
      </div>
    </>
  );
}
