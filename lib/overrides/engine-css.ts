/* CSS generated from the editor record — pure functions, used both on the server
   (initial <head>) and by the browser engine (live editor updates). */
import type { SiteContent } from '@/lib/content-types';

/* Specificity is raised one notch above the stylesheet's own :root / body.light rules, so
   these win wherever the <style> tag lands in <head>. */
export function themeCss(theme: SiteContent['theme']) {
  if (!theme) return '';
  const kv = (o: Record<string, string> = {}) =>
    Object.keys(o)
      .map((k) => `${k}:${o[k]}`)
      .join(';');
  const css: string[] = [];
  if (theme.dark && Object.keys(theme.dark).length) css.push(`html:root{${kv(theme.dark)}}`);
  if (theme.light && Object.keys(theme.light).length) css.push(`html body.light{${kv(theme.light)}}`);
  return css.join('\n');
}

export function fontCss(fonts: SiteContent['fonts']) {
  const out: string[] = [];
  for (const [v, stack] of [
    ['--font-display', fonts?.display],
    ['--font-body', fonts?.body],
  ] as const)
    if (stack) out.push(`${v}:${stack}`);
  return out.length ? `:root{${out.join(';')}}` : '';
}

/** First quoted family in each font stack, for the Google Fonts stylesheet URL. */
export const fontFamilies = (fonts: SiteContent['fonts']) =>
  [fonts?.display, fonts?.body].map((s) => /'([^']+)'/.exec(String(s || ''))?.[1]).filter((f): f is string => !!f);

export const googleFontHref = (family: string) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap`;

/** Hidden `sel:` keys as CSS rules — survive live re-renders (ticker, hero stocks…). */
export function hiddenCss(hidden: SiteContent['hidden']) {
  return Object.keys(hidden || {})
    .filter((k) => k.startsWith('sel:'))
    .map((k) => `${k.slice(4)}{display:none!important}`)
    .join('\n');
}
