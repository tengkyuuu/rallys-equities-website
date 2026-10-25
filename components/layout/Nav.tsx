'use client';

import { useEffect, useState } from 'react';
import GoTo from '@/components/nav/GoTo';
import PageLink from '@/components/nav/PageLink';
import OpenAccount from '@/components/actions/OpenAccount';
import { useSiteNav } from '@/components/nav/SiteNav';
import { HEADER_NAV } from '@/lib/menus';
import { isPSXOpen } from '@/lib/market';
import { setMobileMenu, useMobileMenu } from '@/lib/mobile-menu';
import { navParent } from '@/lib/site';
import Logo from './Logo';

function toggleTheme() {
  const light = document.body.classList.toggle('light');
  try {
    localStorage.setItem('re-theme', light ? 'light' : 'dark');
  } catch {
    /* storage blocked */
  }
  setTimeout(() => window.dispatchEvent(new Event('re-recolor')), 60); // canvases redraw in the new palette
}

/** "PSX Live" until the clock is known on the client, then open/closed. */
function MarketStatus() {
  const [label, setLabel] = useState('PSX Live');
  useEffect(() => {
    const tick = () => setLabel(isPSXOpen() ? 'PSX Open' : 'PSX Closed');
    tick();
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, []);
  return <span id="mktStatus">{label}</span>;
}

export default function Nav() {
  const { current } = useSiteNav();
  const menuOpen = useMobileMenu();
  const active = current ? navParent(current) : null;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <GoTo as="div" page="home" className="logo">
          <Logo />
        </GoTo>
        <ul className="nav-links">
          {HEADER_NAV.map((item) => (
            <li key={item.id}>
              <PageLink
                page={item.page}
                id={`nav-${item.id}`}
                className={[item.columns && 'ddt', active === item.id && 'active'].filter(Boolean).join(' ') || undefined}
              >
                {item.label}
              </PageLink>
              {item.columns && (
                <div className="dd">
                  <div className="dd-inner">
                    {item.columns.map((col) => (
                      <div className="dd-col" key={col.label}>
                        <div className="dd-col-lbl">{col.label}</div>
                        {col.links.map((l) => (
                          <PageLink key={l.page} page={l.page}>
                            {l.label}
                          </PageLink>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <div className="live-badge">
            <div className="dot" />
            <MarketStatus />
          </div>
          <button className="theme-toggle" id="themeToggle" aria-label="Toggle light / dark mode" onClick={toggleTheme}>
            <svg className="ic-moon" width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            <svg className="ic-sun" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <GoTo as="button" page="account" className="btn btn-ghost">
            Log In
          </GoTo>
          <OpenAccount as="button" className="btn btn-primary">
            Open Account
          </OpenAccount>
          <button
            className={`ham${menuOpen ? ' open' : ''}`}
            id="hamBtn"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMobileMenu(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
