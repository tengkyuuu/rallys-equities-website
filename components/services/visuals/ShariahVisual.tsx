'use client';

import { useState, type CSSProperties } from 'react';
import { useInView } from './useInView';

/* Segment sizes give the donut its shape; they are not shown or claimed as figures. */
const SECTORS = [
  { name: 'Banks', size: 42 },
  { name: 'Energy', size: 28 },
  { name: 'Cement', size: 18 },
  { name: 'Other', size: 12 },
];

const R_OUT = 84,
  R_IN = 60,
  PAD = 0.035,
  TOTAL = SECTORS.reduce((s, x) => s + x.size, 0);

const point = (r: number, a: number) => `${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`;

/** Annulus segment from angle a0 to a1 (radians, 0 = 3 o'clock). */
function arc(a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${point(R_OUT, a0)}A${R_OUT} ${R_OUT} 0 ${large} 1 ${point(R_OUT, a1)}L${point(R_IN, a1)}A${R_IN} ${R_IN} 0 ${large} 0 ${point(R_IN, a0)}Z`;
}

const SEGMENTS = SECTORS.map((s, i) => {
  const before = SECTORS.slice(0, i).reduce((sum, x) => sum + x.size, 0);
  const a0 = -Math.PI / 2 + (before / TOTAL) * 2 * Math.PI + PAD / 2;
  const a1 = -Math.PI / 2 + ((before + s.size) / TOTAL) * 2 * Math.PI - PAD / 2;
  const mid = (a0 + a1) / 2;
  return { ...s, d: arc(a0, a1), dx: Math.cos(mid) * 6, dy: Math.sin(mid) * 6 };
});

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 8.2L7.1 10.2L11 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Shariah-compliant investing: the KMI-30 universe as a donut; point at a sector to lift it out. */
export default function ShariahVisual() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const on = active !== null ? SEGMENTS[active] : null;

  return (
    <div
      ref={ref}
      className={seen ? 'vis is-in' : 'vis'}
      role="group"
      aria-label="Illustration of sectors within the KMI-30 Shariah-compliant universe"
    >
      <div className="vis-head">Sector mix</div>
      <div className="vis-donut-row" onMouseLeave={() => setActive(null)}>
        <div className="vis-donut">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            {SEGMENTS.map((s, i) => (
              <g
                key={s.name}
                className={`vis-seg-g vis-c${i + 1}${active === i ? ' is-active' : ''}${active !== null && active !== i ? ' is-dim' : ''}`}
                style={{ transform: active === i ? `translate(${s.dx}px, ${s.dy}px)` : undefined }}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <path d={s.d} style={{ '--d': `${i * 120}ms` } as CSSProperties} />
              </g>
            ))}
          </svg>
          <div className={on ? 'vis-donut-center is-sector' : 'vis-donut-center'} aria-live="polite">
            <strong>{on ? on.name : 'KMI-30'}</strong>
            {on ? <i className={`vis-c${active! + 1}`} aria-hidden="true" /> : <span>Halal universe</span>}
          </div>
        </div>
        <ul className="vis-legend">
          {SEGMENTS.map((s, i) => (
            <li key={s.name}>
              <button
                type="button"
                className={active === i ? 'is-active' : undefined}
                aria-pressed={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(i)}
              >
                <i className={`vis-c${i + 1}`} />
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="vis-foot">
        <span className="vis-check">
          <Check />
        </span>
        <div>
          <strong>Shariah certified — screened by advisory board</strong>
          <span className="vis-note">Reviewed periodically for continued compliance</span>
        </div>
      </div>
    </div>
  );
}
