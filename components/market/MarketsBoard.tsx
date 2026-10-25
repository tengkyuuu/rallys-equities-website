'use client';

import { useMemo, useState } from 'react';
import { fmt, fmtVol, nowStr, type IndexInfo } from '@/lib/market';
import { isLive, useMarket } from './MarketProvider';
import PsxPortalLink from './PsxPortalLink';
import StockLogo from './StockLogo';

const SEARCH_STYLE = {
  flex: '1',
  minWidth: '180px',
  maxWidth: '280px',
  background: 'var(--nv3)',
  border: '1px solid var(--gb)',
  borderRadius: '8px',
  padding: '8px 12px',
  color: 'var(--tx)',
  fontSize: '12px',
  outline: 'none',
} as const;
const upDown = (up: boolean) => (up ? 'var(--up)' : 'var(--dn)');

function IndexCard({ name, id, info, live }: { name: string; id: string; info?: IndexInfo; live: boolean }) {
  const show = live && info && isFinite(info.changePct);
  const up = !!info && info.changePct >= 0;
  return (
    <div className="mkt-idxc">
      <div className="mkt-idxn">{name}</div>
      <div className="mkt-idxv" id={id}>
        {live && info ? fmt(info.current) : '—'}
      </div>
      <div className="mkt-idxc2" id={id + 'c'} style={show ? { color: upDown(up) } : undefined}>
        {show ? `${up ? '▲ ' : '▼ '}${up ? '+' : ''}${info!.changePct.toFixed(2)}%` : ''}
      </div>
    </div>
  );
}

/** Markets page: the three headline indices and the full PSX board, most active first, searchable. */
export default function MarketsBoard() {
  const m = useMarket();
  const live = isLive(m);
  const [query, setQuery] = useState('');
  const ix = live ? m.data.indices : {};
  const stocks = live ? m.data.stocks : null;

  const list = useMemo(() => {
    if (!stocks) return [];
    return Object.keys(stocks)
      .map((sym) => {
        const d = stocks[sym];
        return { sym, name: d[4] || sym, price: d[0], ch: d[1] || 0, pch: d[2] || 0, vol: d[3] || 0, sector: d[5] || '' };
      })
      .sort((a, b) => b.vol - a.vol);
  }, [stocks]);

  const q = query.trim().toLowerCase();
  const rows = q
    ? list.filter((x) => x.sym.toLowerCase().includes(q) || x.name.toLowerCase().includes(q) || x.sector.toLowerCase().includes(q))
    : list;
  // m.updatedAt changes on every poll, so the "updated" time is re-read then
  const status =
    !live || !stocks
      ? m.mode === 'loading'
        ? 'Loading…'
        : 'Prices unavailable'
      : `${rows.length} of ${list.length} listed · updated ${nowStr()}`;

  return (
    <>
      <div className="mkt-idx">
        <IndexCard name="KSE-100" id="mk100" info={ix.KSE100} live={live} />
        <IndexCard name="KSE-30" id="mk30" info={ix.KSE30} live={live} />
        <IndexCard name="KMI-30 (Halal)" id="mkmi" info={ix.KMI30} live={live} />
      </div>
      <div className="mkt-table-wrap">
        <div className="mkt-table-head" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <span className="mkt-table-title">All PSX Securities</span>
          <input
            type="text"
            id="mktSearch"
            placeholder="🔍 Search any of ~490 listed companies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={SEARCH_STYLE}
          />
          <span style={{ fontSize: '10px', color: 'var(--mt2)' }} id="mktTime" suppressHydrationWarning>
            {status}
          </span>
        </div>
        <div className="mkt-table">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '30%' }}>Company</th>
                <th style={{ width: '18%' }}>Price (PKR)</th>
                <th style={{ width: '14%' }}>Change</th>
                <th style={{ width: '16%' }}>Chg %</th>
                <th style={{ width: '12%' }}>Volume</th>
                <th style={{ width: '10%' }}>Sector</th>
              </tr>
            </thead>
            <tbody id="mktTbody">
              {!live || !stocks ? (
                <tr>
                  <td colSpan={6} className="mkt-down">
                    {m.mode === 'loading' ? (
                      'Loading prices…'
                    ) : (
                      <>
                        Live prices are temporarily unavailable.
                        <br />
                        <PsxPortalLink>View them on the PSX Data Portal</PsxPortalLink>
                      </>
                    )}
                  </td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--mt2)', fontSize: '13px' }}>
                    No securities match “{q}”. Try a symbol like <strong style={{ color: 'var(--au)' }}>MEBL</strong> or a sector like{' '}
                    <strong style={{ color: 'var(--au)' }}>banks</strong>.
                  </td>
                </tr>
              ) : (
                rows.map((s) => {
                  const up = s.ch >= 0;
                  return (
                    <tr key={s.sym}>
                      <td>
                        <div className="mkt-sym">
                          <StockLogo sym={s.sym} size={24} />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--au)', fontSize: '12.5px' }}>{s.sym}</div>
                            <div style={{ fontSize: '11px', color: 'var(--mt2)' }}>{s.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{fmt(s.price)}</td>
                      <td style={{ fontWeight: '600', color: upDown(up) }}>
                        {up ? '+' : ''}
                        {s.ch.toFixed(2)}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 7px',
                            borderRadius: '100px',
                            fontSize: '10px',
                            fontWeight: '700',
                            background: up ? 'rgba(46,204,138,.12)' : 'rgba(232,69,69,.11)',
                            color: upDown(up),
                          }}
                        >
                          {up ? '▲' : '▼'}
                          {Math.abs(s.pch).toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ color: 'var(--mt)' }}>{fmtVol(s.vol)}</td>
                      <td style={{ fontSize: '11.5px', color: 'var(--mt2)' }}>{s.sector}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
