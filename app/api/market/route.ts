import { NextResponse } from 'next/server';
import type { IndexInfo, MarketResponse, StockRow } from '@/lib/market';

/* GET /api/market — PSX index and company data for the site's market widgets, fetched
   server-side (the browser can't call PSX: no CORS). Responds 502 when PSX doesn't
   answer, and the widgets then say prices are unavailable; nothing is ever invented.

   Status (Oct 2026): PSX answers every request with 403, so this returns 502. PSX's
   terms prohibit unapproved commercial use of its site data, so don't work around it.
   Swap the source for a licensed feed instead; see MARKET-DATA.md. */

const UA = 'Mozilla/5.0 (compatible; RallysEquities/1.0; +https://rallysequities.com)';
const SYMBOLS = ['KSE100', 'KSE30', 'KMI30', 'ALLSHR'] as const;
const decodeEnt = (s: string) =>
  String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");

/** [epoch seconds, value, …] rows, newest first */
type Row = [number, number, ...unknown[]];

async function psx(path: string): Promise<Row[]> {
  const r = await fetch('https://dps.psx.com.pk/timeseries/' + path, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`PSX ${path} HTTP ${r.status}`);
  const j = await r.json();
  if (j.status !== 1 || !Array.isArray(j.data)) throw new Error(`PSX ${path} bad payload`);
  return j.data;
}

function summarize(eod: Row[]): IndexInfo {
  const cur = eod[0],
    prev = eod[1] || eod[0];
  const current = cur[1],
    prevClose = prev[1],
    change = current - prevClose;
  return { current, prevClose, change, changePct: prevClose ? (change / prevClose) * 100 : 0, asOf: cur[0] * 1000 };
}

/* PSX's market-watch table: one fetch = every listed company's live price. Each row's
   data-order cells: [symbol, LDCP, open, high, low, CURRENT, change, change%, volume] */
async function marketWatch() {
  const r = await fetch('https://dps.psx.com.pk/market-watch', { headers: { 'User-Agent': UA }, cache: 'no-store' });
  if (!r.ok) throw new Error('market-watch HTTP ' + r.status);
  const tb = (await r.text()).match(/<tbody[\s\S]*?<\/tbody>/i);
  const stocks: Record<string, StockRow> = {};
  if (!tb) return stocks;
  for (const row of tb[0].match(/<tr[\s\S]*?<\/tr>/gi) || []) {
    const sym = row.match(/data-search="([^"]+)"/)?.[1];
    if (!sym) continue;
    const o = [...row.matchAll(/data-order="([^"]*)"/g)].map((m) => m[1]);
    const n = (i: number) => {
      const v = parseFloat(o[i]);
      return isNaN(v) ? null : v;
    };
    const current = n(5);
    if (current == null) continue;
    stocks[sym] = [current, n(6) || 0, n(7) || 0, n(8) || 0, row.match(/data-title="([^"]+)"/)?.[1] ?? sym, ''];
  }
  return stocks;
}

/** Readable names and sectors (market-watch only has numeric sector codes). */
async function symbolsMeta() {
  const r = await fetch('https://dps.psx.com.pk/symbols', { headers: { 'User-Agent': UA }, cache: 'no-store' });
  if (!r.ok) throw new Error('symbols HTTP ' + r.status);
  const m: Record<string, { name: string; sector: string }> = {};
  for (const s of (await r.json()) as { symbol?: string; name?: string; sectorName?: string }[]) {
    if (s?.symbol) m[s.symbol] = { name: s.name || '', sector: s.sectorName || '' };
  }
  return m;
}

const CACHE = { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' };

export async function GET() {
  try {
    const [raw, intr, stocks, secMap] = await Promise.all([
      Promise.all(SYMBOLS.map(async (sym) => [sym, await psx('eod/' + sym).catch(() => null)] as const)),
      psx('int/KSE100').catch(() => null),
      marketWatch().catch(() => null),
      symbolsMeta().catch(() => ({}) as Awaited<ReturnType<typeof symbolsMeta>>),
    ]);
    if (stocks)
      for (const sym in stocks) {
        const m = secMap[sym];
        stocks[sym][4] = m?.name || decodeEnt(stocks[sym][4]);
        stocks[sym][5] = m?.sector || '';
      }

    const indices: MarketResponse['indices'] = {};
    let asOf = 0;
    for (const [sym, data] of raw) {
      if (!data) continue;
      const info = summarize(data);
      // KSE-100 gets ~1 year of daily closes so the 1W / 1M / YTD chart tabs work
      if (sym === 'KSE100')
        info.eod = data
          .slice(0, 260)
          .reverse()
          .map((r) => [r[0] * 1000, r[1]]);
      indices[sym] = info;
      asOf = Math.max(asOf, Number(info.asOf));
    }
    if (!indices.KSE100) return NextResponse.json({ error: 'KSE100 unavailable upstream' }, { status: 502, headers: CACHE });

    // KSE-100 intraday curve for the 1D chart (downsampled, oldest → newest)
    if (intr) {
      const pts = intr.map((p) => p[1]).reverse();
      const step = Math.max(1, Math.floor(pts.length / 60));
      const series = pts.filter((_, i) => i % step === 0);
      if (series[series.length - 1] !== pts[pts.length - 1]) series.push(pts[pts.length - 1]);
      indices.KSE100.series = series;
    }

    return NextResponse.json(
      {
        indices,
        stocks: stocks && Object.keys(stocks).length ? stocks : null,
        asOf,
        delayed: true,
        source: 'Pakistan Stock Exchange (dps.psx.com.pk)',
      },
      { headers: CACHE },
    );
  } catch (e) {
    return NextResponse.json({ error: String((e as Error)?.message || e) }, { status: 502, headers: CACHE });
  }
}
