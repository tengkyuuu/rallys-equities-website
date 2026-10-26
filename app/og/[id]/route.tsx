import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { PAGE_IDS, PAGE_META, type PageId } from '@/lib/site';

/* /og/<page id>: the 1200×630 image shown when a page is shared (WhatsApp, Facebook, LinkedIn, X)
   and in some search results. Rendered once at build time for every page. */

export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => PAGE_IDS.map((id) => ({ id }));

/** A Google Font as TTF for the image renderer; falls back to the default font if offline. */
async function font(family: string, weight: number) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id as PageId;
  const page = PAGE_META[id === 'post' ? 'insights' : id] ?? PAGE_META.home;
  const headline = id === 'home' ? 'Invest in Pakistan’s Future' : page.name;
  const logo = `data:image/png;base64,${(await readFile(path.join(process.cwd(), 'public/assets/img/logo.png'))).toString('base64')}`;
  const [display, body] = await Promise.all([font('Cormorant Garamond', 700), font('Plus Jakarta Sans', 600)]);
  const fonts = [
    ...(display ? [{ name: 'Display', data: display, weight: 700 as const }] : []),
    ...(body ? [{ name: 'Body', data: body, weight: 600 as const }] : []),
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 76px',
        background:
          'radial-gradient(ellipse 70% 90% at 85% 20%, rgba(18,184,124,.22), transparent 60%), linear-gradient(160deg, #081828 0%, #05101E 70%)',
        color: '#F6F2EA',
        fontFamily: 'Body',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <img src={logo} width={84} height={84} alt="" style={{ borderRadius: 18, background: '#F6F2EA' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'Display', fontSize: 40, color: '#E2C070' }}>Rallys Equities</span>
          <span style={{ fontSize: 17, letterSpacing: 4, color: 'rgba(246,242,234,.6)' }}>PAKISTAN STOCK EXCHANGE</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ width: 96, height: 4, borderRadius: 2, background: '#C8A84B' }} />
        <span style={{ fontFamily: 'Display', fontSize: headline.length > 30 ? 66 : 80, lineHeight: 1.05, maxWidth: 980 }}>{headline}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24 }}>
        <span style={{ color: '#12B87C' }}>SECP-licensed · PSX TREC No. 553 · Lahore</span>
        <span style={{ color: 'rgba(246,242,234,.7)' }}>rallysequities.com</span>
      </div>
    </div>,
    { width: 1200, height: 630, fonts },
  );
}
