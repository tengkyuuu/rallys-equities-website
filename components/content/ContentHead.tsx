import type { SiteContent } from '@/lib/content-types';
import { fontCss, fontFamilies, googleFontHref, hiddenCss, themeCss } from '@/lib/overrides/engine-css';

/** Published theme colours, fonts and selector-hidden elements, server-rendered into
    <head> so they apply from the first paint. The editor updates these same tags by id. */
export default function ContentHead({ content }: { content: SiteContent }) {
  return (
    <>
      {fontFamilies(content.fonts).map((f) => (
        <link key={f} id={'gf-' + f.replace(/[^A-Za-z0-9]+/g, '')} rel="stylesheet" href={googleFontHref(f)} />
      ))}
      <style id="theme-overrides">{themeCss(content.theme)}</style>
      <style id="font-overrides">{fontCss(content.fonts)}</style>
      <style id="re-hidden-css">{hiddenCss(content.hidden)}</style>
    </>
  );
}
