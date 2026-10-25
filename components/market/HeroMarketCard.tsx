'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { PSX, fmt, nowStr, type IndexInfo, type MarketResponse } from '@/lib/market';
import { drawSparkline } from './chart';
import { isLive, useMarket } from './MarketProvider';
import PsxPortalLink from './PsxPortalLink';
import StockLogo from './StockLogo';

const RANGES = ['1D', '1W', '1M', 'YTD'] as const;
type Range = (typeof RANGES)[number];
const INTRADAY_LABELS = ['09:30', '11:00', '12:30', '14:00', '15:30'];
const shortDate = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const upDown = (up: boolean): CSSProperties => ({ color: up ? 'var(--up)' : 'var(--dn)' });

/** ▲ +1.23% (or ▲ +12.34 (+1.23%) with points); empty when there's nothing real to show. */
function changeText(info: IndexInfo | undefined, withPoints = false) {
  if (!info || !isFinite(info.changePct)) return null;
  const up = info.changePct >= 0,
    pct = (up ? '+' : '') + info.changePct.toFixed(2) + '%';
  return { up, text: (up ? '▲ ' : '▼ ') + (withPoints ? `${up ? '+' : ''}${info.change.toFixed(2)} (${pct})` : pct) };
}

/** The slice of real daily history a 1W/1M/YTD tab draws. */
function eodSlice(eod: [number, number][], range: Exclude<Range, '1D'>) {
  if (range === 'YTD') {
    const yr = new Date().getFullYear();
    const pts = eod.filter((p) => new Date(p[0]).getFullYear() === yr);
    return pts.length < 2 ? eod.slice(-130) : pts;
  }
  return eod.slice(range === '1W' ? -6 : -23); // ~1 trading week / ~1 month
}

function HeroStocks({ data }: { data: MarketResponse }) {
  const stocks = data.stocks;
  const rows = stocks ? PSX.filter((s) => stocks[s.sym]?.[0] > 0).slice(0, 5) : [];
  if (!rows.length)
    return (
      <div id="heroStocks">
        <div className="pnote">Company prices are temporarily unavailable.</div>
      </div>
    );
  return (
    <div id="heroStocks">
      {rows.map((s) => {
        const d = stocks![s.sym],
          ch = d[1] || 0,
          pch = d[2] || 0,
          up = ch >= 0;
        return (
          <div className="srow" key={s.sym}>
            <div className="sco">
              <StockLogo sym={s.sym} size={24} />
              <div>
                <div className="sname">{s.sym}</div>
                <div className="ssub">{s.name.slice(0, 14)}</div>
              </div>
            </div>
            <div className="sprice">{fmt(d[0])}</div>
            <div className="schg" style={upDown(up)}>
              {up ? '+' : ''}
              {ch.toFixed(2)}
            </div>
            <div className="spct">
              <span className={`pill ${up ? 'pill-u' : 'pill-d'}`}>
                {up ? '▲' : '▼'}
                {Math.abs(pch).toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubIndex({ name, edit, id, info, live }: { name: string; edit: string; id: string; info?: IndexInfo; live: boolean }) {
  const ch = live ? changeText(info) : null;
  return (
    <div className="ixc">
      <div className="ixn" data-edit={edit} data-edit-free="1">
        {name}
      </div>
      <div className="ixv" id={id}>
        {live && info ? fmt(info.current) : '—'}
      </div>
      <div className="ixch" style={ch ? upDown(ch.up) : undefined}>
        {ch?.text ?? ''}
      </div>
    </div>
  );
}

/** Home hero: KSE-100 card with chart, featured companies and sub-indices. Real PSX data or "unavailable". */
export default function HeroMarketCard() {
  const m = useMarket();
  const live = isLive(m);
  const ix = live ? m.data.indices : {};
  const eod = ix.KSE100?.eod;
  const hasEod = !!(eod && eod.length >= 2);
  const [picked, setPicked] = useState<Range>('1D');
  const range: Range = picked !== '1D' && !hasEod ? '1D' : picked; // multi-day tabs need real daily history

  const [clock, setClock] = useState('--:--:--');
  useEffect(() => {
    const tick = () => setClock(nowStr());
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // what the chart, change badge, axis labels and caption describe
  let series: number[] = live ? (ix.KSE100?.series ?? []) : [];
  let labels = INTRADAY_LABELS;
  let change = live ? changeText(ix.KSE100, true) : null;
  let caption = '';
  if (range !== '1D' && eod) {
    const pts = eodSlice(eod, range),
      n = pts.length;
    series = pts.map((p) => p[1]);
    labels = [shortDate(pts[0][0]), shortDate(pts[Math.floor(n / 2)][0]), shortDate(pts[n - 1][0])];
    // computed from THIS slice, so the badge always matches the line on screen
    const first = pts[0][1],
      last = pts[n - 1][1],
      d = last - first,
      pct = first ? (d / first) * 100 : 0,
      up = d >= 0;
    change = { up, text: `${up ? '▲' : '▼'} ${up ? '+' : ''}${d.toFixed(2)} (${up ? '+' : ''}${pct.toFixed(2)}%)` };
    caption = `${range === '1W' ? 'Past week' : range === '1M' ? 'Past month' : 'Year to date'} · ${shortDate(pts[0][0])} – ${shortDate(pts[n - 1][0])}`;
  }

  const canvas = useRef<HTMLCanvasElement>(null);
  const seriesKey = series.join(',');
  useEffect(() => {
    const draw = () => {
      if (canvas.current) drawSparkline(canvas.current, live ? series : []);
    };
    draw();
    addEventListener('re-recolor', draw); // theme toggle / editor colour changes
    return () => removeEventListener('re-recolor', draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seriesKey stands in for the array
  }, [live, seriesKey]);

  const loading = m.mode === 'loading';
  return (
    <div className={`pcard${live ? '' : ' is-down'}`}>
      <div className="pstatus">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={`psdot${live ? '' : ' off'}`} />
          <span className={`pslbl${live ? '' : ' off'}`} id="dataLbl">
            {live ? 'PSX · DELAYED' : loading ? 'MARKET DATA' : 'MARKET DATA UNAVAILABLE'}
          </span>
          <span id="dataSub" style={{ color: 'var(--mt2)', fontSize: '9px', marginLeft: '5px' }}>
            {live ? '— Prices from PSX · delayed ~15 min' : loading ? '— loading…' : '— live prices are temporarily unavailable'}
          </span>
        </div>{' '}
        <span className="pstime" id="psxClock">
          {clock}
        </span>
      </div>
      <div className="phead">
        <div>
          <div className="pidxl" data-edit="pcard.idxlabel" data-edit-free="1">
            KSE-100 Index
          </div>
          <div className="pidxv" id="k100">
            {live && ix.KSE100 ? fmt(ix.KSE100.current) : '—'}
          </div>
          <div className="pidxc" id="k100c" style={change ? upDown(change.up) : undefined}>
            {change?.text ?? ''}
          </div>
          <div
            className="pctx"
            id="pCtx"
            style={{ display: caption ? 'block' : 'none', fontSize: '9px', color: 'var(--mt2)', marginTop: '2px', fontWeight: '600' }}
          >
            {caption}
          </div>
          <div className="pvol" style={{ fontSize: '9px', color: 'var(--mt2)', marginTop: '2px' }} data-edit="pcard.vol" data-edit-free="1">
            Trading hours 09:30–15:30 PKT
          </div>
        </div>
        <div className="ptabs">
          {RANGES.map((r, i) => (
            <Fragment key={r}>
              {i > 0 && ' '}
              <button className={`ptab${range === r ? ' on' : ''}`} disabled={r !== '1D' && !hasEod} onClick={() => setPicked(r)}>
                {r}
              </button>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="cw">
        <canvas id="heroChart" ref={canvas} />
      </div>
      <div className="clbl">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <div className="shdr">
        <span className="sh-co" data-edit="pcard.th1" data-edit-free="1">
          Company
        </span>
        <span className="sh-price" data-edit="pcard.th2" data-edit-free="1">
          Price
        </span>
        <span className="sh-chg" data-edit="pcard.th3" data-edit-free="1">
          Chg
        </span>
        <span className="sh-pct" data-edit="pcard.th4" data-edit-free="1">
          %
        </span>
      </div>
      {live ? <HeroStocks data={m.data} /> : <div id="heroStocks" />}
      <div className="pdown" id="pDown" role="status">
        {loading ? (
          'Loading market data…'
        ) : (
          <>
            Live market prices are temporarily unavailable.
            <br />
            <PsxPortalLink>View live prices on the PSX Data Portal</PsxPortalLink>
          </>
        )}
      </div>
      <div className="idxrow">
        <SubIndex name="KSE-30" edit="pcard.ix1" id="k30" info={ix.KSE30} live={live} />
        <SubIndex name="KMI-30" edit="pcard.ix2" id="k30m" info={ix.KMI30} live={live} />
        <SubIndex name="ALLSHR" edit="pcard.ix3" id="kase" info={ix.ALLSHR} live={live} />
      </div>
    </div>
  );
}
