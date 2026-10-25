/* CONTENT-OVERRIDE ENGINE (browser only)
   Applies the visual editor's published record on top of the rendered markup. Edits
   are keyed by element position, so this works directly on the DOM:

     data-edit / data-rekey="<key>"   explicitly tagged element
     <page>.<tagN-tagN-…>            nth-of-type path from #page-<page> ('site' = <html>)
     <anchor-key>/<tagN-…>            path below a tagged ancestor (stable across reorders)
     sel:<css>  ·  page:<id>          CSS selector · a whole page

   Position keys are only stable because the markup keeps the original structure; see
   tests/content-keys.spec.ts. Ported verbatim in behaviour from the original site, since
   both the public site and editor.js (via window.RE_API) depend on it. */

import type { SiteContent } from '@/lib/content-types';
import { sanitizeFragment } from './sanitize';
import { applyPricing } from './pricing-dom';
import { fontCss, fontFamilies, googleFontHref, hiddenCss, themeCss } from './engine-css';

export const cssVar = (name: string, el?: Element | null) =>
  getComputedStyle(el || document.body)
    .getPropertyValue(name)
    .trim();

export function cssRGB(name: string, el?: Element | null) {
  const v = cssVar(name, el);
  const hex = /^#([0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  const rgb = /rgba?\(([^)]+)\)/i.exec(v);
  if (rgb)
    return rgb[1]
      .split(',')
      .slice(0, 3)
      .map((x) => parseInt(x))
      .join(',');
  return '18,184,124';
}

const cssEsc = (s: string) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

/* ── key resolution ── */

/* Next.js always renders an empty `<div hidden>` metadata placeholder as the first child
   of <body>. The original site had nothing there, so keys skip it when counting siblings:
   `site.body1-div5-…` still means the ticker, exactly as it did before the migration. */
const isFrameworkNode = (el: Element) =>
  el.tagName === 'DIV' && el.parentElement?.tagName === 'BODY' && el.hasAttribute('hidden') && !el.firstElementChild;

/** Walk a path like `div3-h21` (h21 = 1st <h2>, not 21st <h>) from `node`. */
export function walkPath(node: Element, path: string): Element | null {
  for (const seg of path.split('-')) {
    const m = /^(h[1-6]|[a-z]+)(\d+)$/i.exec(seg);
    if (!m) return null;
    const tag = m[1].toUpperCase();
    let cnt = +m[2],
      found: Element | null = null;
    for (const c of node.children) {
      if (c.tagName === tag && !isFrameworkNode(c) && --cnt === 0) {
        found = c;
        break;
      }
    }
    if (!found) return null;
    node = found;
  }
  return node;
}

function resolveKey(key: string): Element | null {
  const slash = key.lastIndexOf('/');
  if (slash > 0) {
    const anchor = reResolve(key.slice(0, slash))[0];
    return anchor ? walkPath(anchor, key.slice(slash + 1)) : null;
  }
  const dot = key.indexOf('.');
  if (dot < 0) return null;
  const base = key.slice(0, dot);
  const root = base === 'site' ? document.documentElement : document.getElementById('page-' + base);
  return root ? walkPath(root, key.slice(dot + 1)) : null;
}

/** Any key form → matching elements. */
export function reResolve(key: string): Element[] {
  if (key.startsWith('sel:')) return [...document.querySelectorAll(key.slice(4))];
  if (key.startsWith('page:')) {
    const p = document.getElementById('page-' + key.slice(5));
    return p ? [p] : [];
  }
  const hit = document.querySelector(`[data-rekey="${cssEsc(key)}"],[data-edit="${cssEsc(key)}"]`);
  if (hit) return [hit];
  const n = resolveKey(key);
  return n ? [n] : [];
}

function reTargets(attr: string, key: string): Element[] {
  const m = document.querySelectorAll(`[${attr}="${cssEsc(key)}"]`);
  if (m.length) return [...m];
  const n = resolveKey(key);
  if (n) {
    n.setAttribute(attr, key);
    return [n];
  } // stamp so the target stays bound once siblings reorder
  return [];
}

/** Stable, reversible key for an untagged element (the editor uses this to save edits). */
export function getEditKey(el: HTMLElement): string {
  if (el.dataset.edit) return el.dataset.edit;
  if (el.dataset.rekey) return el.dataset.rekey;
  const page = el.closest('[id^="page-"]');
  const parts: string[] = [];
  let n: HTMLElement | null = el;
  while (n && n !== page && n.parentElement) {
    let i = 1,
      s: Element = n;
    while (s.previousElementSibling) {
      s = s.previousElementSibling;
      if (s.tagName === n.tagName && !isFrameworkNode(s)) i++;
    }
    parts.unshift(n.tagName.toLowerCase() + i);
    const anc: HTMLElement = n.parentElement;
    if (anc !== page && (anc.dataset?.rekey || anc.dataset?.edit)) return `${anc.dataset.rekey || anc.dataset.edit}/${parts.join('-')}`;
    n = anc;
  }
  return (page ? page.id.replace('page-', '') : 'site') + '.' + parts.join('-');
}

/* ── theme, fonts ── */

function styleTag(id: string) {
  let tag = document.getElementById(id);
  if (!tag) {
    tag = document.createElement('style');
    tag.id = id;
    document.head.appendChild(tag);
  }
  return tag;
}

/** Late <style> so equal-specificity :root / body.light rules win. */
export function injectThemeOverrides(theme: SiteContent['theme']) {
  if (!theme) return;
  styleTag('theme-overrides').textContent = themeCss(theme);
}

export function applyFonts(fonts: SiteContent['fonts']) {
  for (const family of fontFamilies(fonts)) {
    const id = 'gf-' + family.replace(/[^A-Za-z0-9]+/g, '');
    if (document.getElementById(id)) continue;
    const l = document.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href = googleFontHref(family);
    document.head.appendChild(l);
  }
  styleTag('font-overrides').textContent = fontCss(fonts);
}

/* ── hide / reorder ── */

export function sigStampKids(parent: Element) {
  for (const c of parent.children) if (c instanceof HTMLElement && !c.dataset.rekey) c.dataset.rekey = getEditKey(c);
}

export function applyHidden(hidden: SiteContent['hidden'], onHidePage?: (id: string) => void) {
  document.querySelectorAll('.re-hid').forEach((n) => n.classList.remove('re-hid'));
  hidden = hidden || {};
  for (const k in hidden) {
    if (k.startsWith('sel:')) continue;
    if (k.startsWith('page:')) {
      const id = k.slice(5),
        pg = document.getElementById('page-' + id);
      if (pg) pg.classList.add('re-hid');
      // every route in: the <li> when it holds nothing else
      document.querySelectorAll(`[data-page="${cssEsc(id)}"]`).forEach((a) => {
        const box = a.parentElement?.tagName === 'LI' ? a.parentElement : a;
        box.classList.add('re-hid');
      });
      if (pg?.classList.contains('active')) onHidePage?.(id);
    } else reResolve(k).forEach((n) => n.classList.add('re-hid'));
  }
  styleTag('re-hidden-css').textContent = hiddenCss(hidden);
}

export function applyOrder(order: SiteContent['order']) {
  order = order || {};
  for (const pk in order) {
    const parent = reResolve(pk)[0] as HTMLElement | undefined;
    if (!parent) continue;
    if (!pk.startsWith('page:') && !parent.dataset.rekey) parent.dataset.rekey = pk; // children anchor to this key on both sides
    sigStampKids(parent);
    const map: Record<string, Element> = {};
    for (const c of parent.children) if (c instanceof HTMLElement && c.dataset.rekey) map[c.dataset.rekey] = c;
    order[pk].forEach((k) => {
      const c = map[k];
      if (c) parent.appendChild(c);
    });
  }
}

/* ── apply a whole record ── */

export type ApplyOptions = {
  /** pricing and theme are server-rendered on the public site; only the editor re-applies them live */
  live?: boolean;
  onHidePage?: (id: string) => void;
};

export function applyOverrides(data: SiteContent, opts: ApplyOptions = {}) {
  if (!data || typeof data !== 'object') return;
  if (opts.live) {
    injectThemeOverrides(data.theme);
    applyFonts(data.fonts);
  }
  const ord = data.order || {};
  // stamp while the DOM is still in source order
  for (const pk in ord) {
    const p = reResolve(pk)[0] as HTMLElement | undefined;
    if (!p) continue;
    if (!pk.startsWith('page:') && !p.dataset.rekey) p.dataset.rekey = pk;
    sigStampKids(p);
  }
  const t = data.text || {};
  for (const k in t)
    reTargets('data-edit', k).forEach((el) => {
      el.innerHTML = sanitizeFragment(t[k]);
    });
  const im = data.img || {},
    meta = data.imgMeta || {};
  for (const k in im) {
    reTargets('data-edit-img', k).forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      img.src = im[k];
      const m = meta[k];
      if (m) {
        if (m.srcset != null) img.srcset = m.srcset;
        if (m.alt != null) img.alt = m.alt;
      }
    });
  }
  if (opts.live) applyPricing(data.pricing);
  applyHidden(data.hidden, opts.onHidePage);
  applyOrder(ord);
}
