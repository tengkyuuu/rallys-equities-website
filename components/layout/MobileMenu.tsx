'use client';

import { useEffect, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import PageLink from '@/components/nav/PageLink';
import OpenAccount from '@/components/actions/OpenAccount';
import { MOBILE_NAV } from '@/lib/menus';
import { setMobileMenu, useMobileMenu } from '@/lib/mobile-menu';

const TOP_LINK = { fontSize: '15px', color: 'var(--tx)', fontWeight: '600' } as const;

export default function MobileMenu() {
  const open = useMobileMenu();
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenu(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // any in-site link closes the drawer, including one to the page already open
  const closeOnLink = (e: MouseEvent) => {
    if ((e.target as Element).closest('a[data-page]')) setMobileMenu(false);
  };

  return (
    <div className={`mnav${open ? ' open' : ''}`} id="mnav" onClick={closeOnLink}>
      {MOBILE_NAV.map((g) =>
        'link' in g ? (
          <div className="mnav-group" key={g.link.page}>
            <PageLink page={g.link.page} style={TOP_LINK}>
              {g.link.label}
            </PageLink>
          </div>
        ) : (
          <div className="mnav-group" key={g.heading}>
            <span>{g.heading}</span>
            {g.links.map((l) => (
              <PageLink key={l.page} page={l.page}>
                {l.label}
              </PageLink>
            ))}
          </div>
        ),
      )}
      <OpenAccount as="button" className="bbig bbig-g">
        Open Account — کھاتہ کھولیں
      </OpenAccount>
    </div>
  );
}
