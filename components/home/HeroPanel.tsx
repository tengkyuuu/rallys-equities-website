'use client';

/**
 * The right-hand card of the home hero. Every visitor gets the growth estimator (the client
 * chose it in Nov 2026). Two alternatives stay reachable for review:
 *   /?hero=market  the KSE-100 market card (real PSX data or "unavailable"; tests use it)
 *   /?hero=path    the "Start here" path finder
 * Nothing here invents market data: the path finder states facts about the firm, and the
 * estimator only does arithmetic on numbers the visitor chooses.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from 'react';
import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import HeroMarketCard from '@/components/market/HeroMarketCard';
import type { PageId } from '@/lib/site';

type Variant = 'market' | 'path' | 'calc';

// The ?hero= override is read on the client only; the server renders the default (estimator).
const noSubscribe = () => () => {};
function readVariant(): Variant {
  const v = new URLSearchParams(location.search).get('hero');
  return v === 'path' || v === 'market' ? v : 'calc';
}
const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroPanel() {
  const variant = useSyncExternalStore(noSubscribe, readVariant, () => 'calc' as Variant);
  if (variant === 'path') return <PathFinder />;
  if (variant === 'calc') return <GrowthEstimator />;
  return <HeroMarketCard />;
}

/* ───────────────────────── Option A: path finder ───────────────────────── */

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
    {children}
  </svg>
);

const PATHS: {
  id: string;
  label: string;
  sub: string;
  icon: ReactNode;
  title: string;
  text: string;
  points: string[];
  page: PageId;
  cta: string;
}[] = [
  {
    id: 'first',
    label: 'I’m new to investing',
    sub: 'First PSX account',
    icon: <path d="M12 21V10m0 0c0-3 2-5 6-5 0 4-2 6-6 5Zm0 3c0-2.500-1.500-4-5-4 0 3.500 2 5 5 4Z" />,
    title: 'Start with a person, not a call centre',
    text: 'Open your first PSX account online in five steps, with a relationship manager to walk you through it.',
    points: ['Your own relationship manager, in Urdu or English', 'Your shares are held in your name at CDC Pakistan', 'Plain-language guides and eight free calculators'],
    page: 'education',
    cta: 'How investing works',
  },
  {
    id: 'shariah',
    label: 'Shariah-compliant',
    sub: 'Screened investing',
    icon: <path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500ZM16 5l.700 1.800L18.500 7.500l-1.800.700L16 10l-.700-1.800-1.800-.700 1.800-.700L16 5Z" />,
    title: 'Invest in line with your faith',
    text: 'Shariah-compliant investing is a core service at Rallys, not an add-on.',
    points: ['Screened Shariah-compliant universe of PSX shares', 'Portfolio reviews for ongoing compliance', 'Dividend-purification guidance'],
    page: 'shariah',
    cta: 'Shariah investing',
  },
  {
    id: 'trader',
    label: 'I trade actively',
    sub: 'Rates & platforms',
    icon: <path d="M4 19h16M7 15V9m0 6v2m0-8V6m5 7V8m0 5v3m0-8V5m5 9v-3m0 3v3m0-6V9" />,
    title: 'Low, transparent rates and a real desk',
    text: 'Trade on mobile and web with research that arrives before the bell.',
    points: ['Competitive brokerage, no hidden charges', 'Mobile and web trading platforms', 'Daily and weekly PSX research notes'],
    page: 'trading',
    cta: 'Trading services',
  },
  {
    id: 'corp',
    label: 'Company or fund',
    sub: 'Corporate accounts',
    icon: <path d="M4 20V6l8-3v17m0-11 8 2v9M2 20h20M8 9v.010M8 13v.010M8 17v.010M16 14v.010M16 17v.010" />,
    title: 'A dedicated desk for institutions',
    text: 'Accounts for companies, funds and family offices, set up around your approval process.',
    points: ['Corporate KYC support from start to finish', 'Role-based approvals and custom reports', 'A dedicated desk at the Lahore Stock Exchange Building'],
    page: 'corporate',
    cta: 'Corporate accounts',
  },
];

const ROTATE_MS = 6000;

function PathFinder() {
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState(false); // rotates until the visitor takes over
  const [paused, setPaused] = useState(false);
  const reduce = useSyncExternalStore(noSubscribe, prefersReducedMotion, () => true);
  const auto = !picked && !reduce;

  useEffect(() => {
    if (!auto || paused) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % PATHS.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [auto, paused, active]);

  const pick = (i: number) => {
    setPicked(true);
    setActive(i);
  };
  const p = PATHS[active];

  return (
    <div className="pcard hx" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="hx-top">
        <span className="hx-eyebrow">Start here</span>
        <span className="hx-topnote">What brings you to the market?</span>
      </div>
      <div className="hx-path">
        <div className="hx-tabs" role="tablist" aria-label="Choose what describes you" aria-orientation="vertical">
          {PATHS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              id={`hx-tab-${t.id}`}
              aria-selected={i === active}
              aria-controls="hx-panel"
              tabIndex={i === active ? 0 : -1}
              className={`hx-tab${i === active ? ' on' : ''}`}
              onClick={() => pick(i)}
              onKeyDown={(e) => {
                const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                if (!d) return;
                e.preventDefault();
                const n = (i + d + PATHS.length) % PATHS.length;
                pick(n);
                document.getElementById(`hx-tab-${PATHS[n].id}`)?.focus();
              }}
            >
              <span className="hx-tab-ic">
                <Icon>{t.icon}</Icon>
              </span>
              <span>
                <span className="hx-tab-l">{t.label}</span>
                <span className="hx-tab-s">{t.sub}</span>
              </span>
              {i === active && auto && !paused && <span className="hx-prog" style={{ animationDuration: `${ROTATE_MS}ms` }} />}
            </button>
          ))}
        </div>
        <div className="hx-panel" role="tabpanel" id="hx-panel" aria-labelledby={`hx-tab-${p.id}`} key={p.id}>
          <h2 className="hx-h">{p.title}</h2>
          <p className="hx-p">{p.text}</p>
          <ul className="hx-pts">
            {p.points.map((pt) => (
              <li key={pt}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="7.250" fill="none" stroke="currentColor" strokeWidth="1" opacity=".45" />
                  <path d="M4.800 8.300 7 10.400l4.200-4.600" fill="none" stroke="currentColor" strokeWidth="1.500" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {pt}
              </li>
            ))}
          </ul>
          <div className="hx-acts">
            <GoTo as="button" page={p.page} className="hx-btn hx-btn-g">
              {p.cta} <span aria-hidden="true">→</span>
            </GoTo>
            <OpenAccount as="button" className="hx-btn hx-btn-o">
              Open an account
            </OpenAccount>
          </div>
        </div>
      </div>
      <div className="hx-foot">
        <span>SECP licensed · TREC No. 553</span>
        <span>Assets held at CDC Pakistan</span>
        <span>PSX Investor Protection Fund</span>
      </div>
    </div>
  );
}

/* ─────────────────────── Option B: growth estimator ─────────────────────── */

const rupees = (n: number) => 'PKR ' + Math.round(n).toLocaleString('en-US');

function Slider(props: { label: string; value: number; min: number; max: number; step: number; show: string; onChange: (n: number) => void }) {
  const { label, value, min, max, step, show, onChange } = props;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="hx-sl">
      <span className="hx-sl-top">
        <span>{label}</span>
        <output>{show}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--pct' as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

const W = 560,
  H = 150,
  PAD = 6;

function GrowthEstimator() {
  const [monthly, setMonthly] = useState(25000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  // value at the end of each year: monthly contributions, compounded monthly
  const rows = useMemo(() => {
    const r = rate / 100 / 12;
    return Array.from({ length: years + 1 }, (_, y) => {
      const n = y * 12;
      return { y, invested: monthly * n, value: r ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n };
    });
  }, [monthly, years, rate]);

  const end = rows[rows.length - 1];
  const max = end.value || 1;
  const x = (y: number) => PAD + (y / years) * (W - PAD * 2);
  const yy = (v: number) => H - PAD - (v / max) * (H - PAD * 2 - 8);
  const line = (k: 'value' | 'invested') => rows.map((r, i) => `${i ? 'L' : 'M'}${x(r.y).toFixed(1)},${yy(r[k]).toFixed(1)}`).join(' ');
  const area = (k: 'value' | 'invested') => `${line(k)} L${x(years)},${H - PAD} L${x(0)},${H - PAD} Z`;

  const shown = rows[hover ?? years];
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const box = svg.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    setHover(Math.round(f * years));
  };

  return (
    <div className="pcard hx">
      <div className="hx-top">
        <span className="hx-eyebrow">Growth estimator</span>
        <span className="hx-topnote">An illustration, not a forecast</span>
      </div>
      <div className="hx-calc">
        <div className="hx-res">
          <div>
            <div className="hx-res-l">{hover === null || hover === years ? `Estimated value after ${years} years` : `Estimated value after ${shown.y} ${shown.y === 1 ? 'year' : 'years'}`}</div>
            <div className="hx-res-v">{rupees(shown.value)}</div>
          </div>
          <dl className="hx-legend">
            <div>
              <dt>
                <i className="k-inv" />
                You invest
              </dt>
              <dd>{rupees(shown.invested)}</dd>
            </div>
            <div>
              <dt>
                <i className="k-gro" />
                Estimated growth
              </dt>
              <dd>{rupees(shown.value - shown.invested)}</dd>
            </div>
          </dl>
        </div>

        <svg
          ref={svg}
          className="hx-chart"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Chart: investing ${rupees(monthly)} a month for ${years} years at ${rate}% a year grows to about ${rupees(end.value)}, of which ${rupees(end.invested)} is what you put in.`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="hxg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--g3)" stopOpacity=".42" />
              <stop offset="1" stopColor="var(--g3)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - f * (H - PAD * 2 - 8)} y2={H - PAD - f * (H - PAD * 2 - 8)} className="hx-grid" />
          ))}
          <path d={area('value')} fill="url(#hxg)" />
          <path d={area('invested')} className="hx-inv-a" />
          <path d={line('invested')} className="hx-inv-l" vectorEffect="non-scaling-stroke" />
          <path d={line('value')} className="hx-val-l" vectorEffect="non-scaling-stroke" />
          <line x1={x(shown.y)} x2={x(shown.y)} y1={PAD} y2={H - PAD} className="hx-scrub" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="hx-axis">
          <span>Today</span>
          <span>Year {Math.round(years / 2)}</span>
          <span>Year {years}</span>
        </div>

        <div className="hx-sliders">
          <Slider label="Monthly investment" value={monthly} min={5000} max={200000} step={5000} show={rupees(monthly)} onChange={setMonthly} />
          <Slider label="For how long" value={years} min={1} max={30} step={1} show={`${years} ${years === 1 ? 'year' : 'years'}`} onChange={(n) => (setHover(null), setYears(n))} />
          <Slider label="Yearly return you assume" value={rate} min={0} max={25} step={0.5} show={`${rate}%`} onChange={setRate} />
        </div>

        <div className="hx-calc-foot">
          <p>Returns are not guaranteed. Share prices can fall as well as rise, and you may get back less than you invest.</p>
          <GoTo as="button" page="invest" className="hx-btn hx-btn-o">
            Full calculator <span aria-hidden="true">→</span>
          </GoTo>
        </div>
      </div>
    </div>
  );
}
