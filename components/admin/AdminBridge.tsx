'use client';

import { useLayoutEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { showAdminPage } from '@/lib/admin/pages';
import { renderBlog, renderCalcInfo, slugify } from '@/lib/admin/render-dom';
import { CALC_INFO } from '@/lib/calculators/data';
import type { SiteContent } from '@/lib/content-types';
import {
  applyFonts,
  applyHidden,
  applyOrder,
  applyOverrides,
  cssVar,
  getEditKey,
  injectThemeOverrides,
  reResolve,
  sigStampKids,
  walkPath,
} from '@/lib/overrides/engine';
import { applyPricing, pricingDefaults, pricingValue } from '@/lib/overrides/pricing-dom';
import { sanitizeFragment, sanitizePost } from '@/lib/overrides/sanitize';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase-config';

/* The bridge between /admin and the visual editor (public/editor.js, which predates the
   Next.js app). It exposes the same window.RE_API the original single-page site did,
   then loads the editor, which takes over the page after login. */

type Win = Window & Record<string, unknown>;

let overrides: SiteContent = {};
const goHome = () => showAdminPage('home');

function setOverrides(d: SiteContent) {
  overrides = d || {};
  applyOverrides(overrides, { live: true, onHidePage: goHome });
  renderBlog(overrides.posts);
}

/** Factory default of a CSS variable for dark (light=false) or light mode, ignoring theme overrides. */
function defaultVar(name: string, light: boolean) {
  const body = document.body,
    had = body.classList.contains('light');
  body.classList.toggle('light', light);
  const tag = document.getElementById('theme-overrides'),
    saved = tag?.textContent ?? '';
  if (tag) tag.textContent = '';
  const v = getComputedStyle(body).getPropertyValue(name).trim();
  if (tag) tag.textContent = saved;
  body.classList.toggle('light', had);
  return v;
}

/* Holds the branded preloader up and reports what is really happening between "page
   loaded" and "admin ready". `finish` is idempotent; a hard cap guarantees nobody is
   trapped behind the overlay if a request stalls. */
function bootNarrator() {
  const RB = {
    held: true,
    over: false,
    t0: Date.now(),
    msg: '',
    sw: 0 as ReturnType<typeof setTimeout> | 0,
    stage(msg: string, pct: number) {
      if (this.over) return; // once closing, nothing may re-narrate backwards
      const pre = document.getElementById('preloader'),
        st = document.getElementById('plStatus'),
        bar = document.getElementById('plBar');
      if (!pre) return;
      pre.classList.add('pl-admin');
      const sub = document.getElementById('plSub');
      if (sub) sub.textContent = 'Website Admin';
      bar?.classList.add('det');
      // fade the old line out before swapping; the newest message wins if stages arrive together
      this.msg = msg;
      if (st && st.textContent !== msg) {
        if (st.textContent) {
          st.classList.remove('in');
          if (this.sw) clearTimeout(this.sw);
          this.sw = setTimeout(() => {
            st.textContent = RB.msg;
            st.classList.add('in');
          }, 200);
        } else {
          st.textContent = msg;
          requestAnimationFrame(() => st.classList.add('in'));
        }
      }
      const fill = bar?.firstElementChild as HTMLElement | null;
      if (fill) fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
    },
    finish() {
      if (this.over) return;
      this.over = true;
      const bar = document.getElementById('plBar'),
        fill = bar?.firstElementChild as HTMLElement | null,
        st = document.getElementById('plStatus');
      if (fill) fill.style.width = '100%';
      // a curtain that vanishes in 40ms reads as a glitch: hold a floor so the reveal is deliberate
      const wait = Math.max(0, 1000 - (Date.now() - this.t0));
      setTimeout(() => {
        st?.classList.remove('in');
        this.held = false; // only now may the curtain lift
        setTimeout(() => window.RE_HIDE_PRE?.(), 260);
      }, wait);
    },
  };
  return RB;
}

export default function AdminBridge() {
  useLayoutEffect(() => {
    const w = window as unknown as Win;
    w.RE_SUPABASE = { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
    w.RE_SUPABASE_READY = true;
    w.supabase = { createClient };
    w.RE_API = {
      applyOverrides: setOverrides,
      setOverrides,
      get overrides() {
        return overrides;
      },
      injectThemeOverrides,
      applyFonts,
      sanitizeFragment,
      sanitizePost,
      getEditKey,
      cssVar,
      refreshCalcInfo: () => renderCalcInfo(overrides),
      applyHidden: (h: SiteContent['hidden']) => applyHidden(h, goHome),
      applyOrder,
      sigStampKids,
      reResolve,
      renderBlog,
      showPage: showAdminPage,
      slugify,
      applyPricing,
      pricingDefaults,
      pricingValue,
      walkPath,
      get calcInfo() {
        return CALC_INFO;
      },
      defaultVar,
    };

    const RB = bootNarrator();
    window.RE_BOOT = RB;
    RB.stage('Preparing your workspace', 16);
    const cap = setTimeout(() => RB.finish(), 14000); // never trap the visitor behind the overlay

    renderCalcInfo({});
    applyPricing({}); // same as the original boot: defaults, then the editor applies its draft

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/editor.css';
    document.head.appendChild(css);
    RB.stage('Loading the editor', 44);
    const s = document.createElement('script');
    s.src = '/editor.js';
    s.onerror = () => RB.finish(); // editor unreachable → drop the curtain now
    document.body.appendChild(s);

    return () => clearTimeout(cap);
  }, []);
  return null;
}
