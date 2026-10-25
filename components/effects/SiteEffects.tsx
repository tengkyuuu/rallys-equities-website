'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initHero, initReveal, initTilt, revealFirstViewport, startCounters } from './page-effects';

declare global {
  interface Window {
    /** set by the /admin boot narrator: while `held`, the preloader stays up */
    RE_BOOT?: { held: boolean; stage(msg: string, pct: number): void; finish(): void };
    RE_HIDE_PRE?: () => void;
  }
}

/** Site-wide chrome behaviour: preloader, scroll progress bar, back-to-top. */
function useChrome() {
  useEffect(() => {
    const pre = document.getElementById('preloader');
    // measure from when the document became interactive, like the original inline script
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const t0 = nav?.domInteractive ?? performance.now();
    const hidePre = () => {
      if (!pre || pre.classList.contains('done')) return;
      if (window.RE_BOOT?.held) return; // on /admin the boot narrator owns the curtain
      const wait = Math.max(0, 650 - (performance.now() - t0));
      setTimeout(() => {
        pre.classList.add('done');
        revealFirstViewport();
      }, wait);
    };
    window.RE_HIDE_PRE = hidePre;
    if (document.readyState === 'complete') hidePre();
    else addEventListener('load', hidePre);
    const cap = setTimeout(hidePre, Math.max(0, 2400 - (performance.now() - t0)));

    const prog = document.getElementById('scrollProg'),
      toTop = document.getElementById('toTop');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const sc = scrollY,
          max = document.documentElement.scrollHeight - innerHeight;
        if (prog) prog.style.width = (max > 0 ? (sc / max) * 100 : 0) + '%';
        toTop?.classList.toggle('show', sc > 600);
        ticking = false;
      });
    };
    const top = () => scrollTo({ top: 0, behavior: 'smooth' });
    addEventListener('scroll', onScroll, { passive: true });
    toTop?.addEventListener('click', top);
    return () => {
      removeEventListener('load', hidePre);
      clearTimeout(cap);
      removeEventListener('scroll', onScroll);
      toTop?.removeEventListener('click', top);
    };
  }, []);
}

/** Motion for the page on screen; re-runs after every navigation. */
function usePageMotion() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const cleanups = [initReveal(), startCounters(), initTilt(), initHero()];
    // pages after the first don't sit behind the preloader: reveal what's in view now
    if (document.getElementById('preloader')?.classList.contains('done')) requestAnimationFrame(revealFirstViewport);
    return () => cleanups.forEach((c) => c());
  }, [pathname]);
}

export default function SiteEffects() {
  useChrome();
  usePageMotion();
  return null;
}
