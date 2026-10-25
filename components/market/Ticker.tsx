'use client';

import { TICKER_SYMS, fmt, type MarketResponse } from '@/lib/market';
import { isLive, useMarket } from './MarketProvider';
import PsxPortalLink from './PsxPortalLink';
import StockLogo from './StockLogo';

type Item = { key: string; label: string; price: number; pct: number; logo?: boolean };

/** Only symbols the feed actually returned, in ticker order. */
function tickerItems({ indices, stocks }: MarketResponse): Item[] {
  const items: Item[] = [];
  const idx = (key: string, label: string, info = indices[key as keyof typeof indices]) => {
    if (info && info.current > 0) items.push({ key, label, price: info.current, pct: info.changePct });
  };
  idx('KSE100', 'KSE-100');
  idx('KSE30', 'KSE-30');
  idx('KMI30', 'KMI-30');
  for (const s of TICKER_SYMS) {
    const d = stocks?.[s];
    if (d && d[0] > 0) items.push({ key: s, label: s, price: d[0], pct: d[2] || 0, logo: true });
  }
  return items;
}

export default function Ticker() {
  const m = useMarket();
  const items = isLive(m) ? tickerItems(m.data) : [];

  return (
    <div className="ticker">
      <div className={`ticker-wrap${items.length ? '' : ' is-static'}`} id="tickerWrap">
        {items.length ? (
          // three copies so the CSS marquee loops seamlessly
          [0, 1, 2].flatMap((copy) =>
            items.map((it) => (
              <div className="ti" key={`${copy}-${it.key}`}>
                {it.logo && <StockLogo sym={it.key} size={16} />}
                <span className="ts">{it.label}</span>
                <span className="tp">{fmt(it.price)}</span>
                <span className={it.pct >= 0 ? 'tu' : 'td'}>
                  {it.pct >= 0 ? '+' : ''}
                  {it.pct.toFixed(2)}%
                </span>
              </div>
            )),
          )
        ) : (
          <div className="ti ti-note">
            {m.mode === 'loading' ? (
              'Loading PSX market data…'
            ) : (
              <>
                <span className="tn-l">PSX market prices are temporarily unavailable</span>
                <span className="tn-s">Live PSX prices unavailable</span>
                {' · '}
                <PsxPortalLink>View on the PSX Data Portal</PsxPortalLink>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
