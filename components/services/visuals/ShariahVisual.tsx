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
  // Hover reacts to a real mouse only; taps select via onClick and stay selected (see services-visuals.spec).
  const [ref, seen] = useInView<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const on = active !== null ? SEGMENTS[active] : null;

  return (
    <div
      ref={ref}
      className={seen ? 'illo is-in' : 'illo'}
      role="group"
      aria-label="Illustration of sectors within the KMI-30 Shariah-compliant universe"
    >
      <div className="illo-head">Sector mix</div>
      <div className="illo-donut-row" onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}>
        <div className="illo-donut">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            {SEGMENTS.map((s, i) => (
              <g
                key={s.name}
                className={`illo-seg-g illo-c${i + 1}${active === i ? ' is-active' : ''}${active !== null && active !== i ? ' is-dim' : ''}`}
                style={{ transform: active === i ? `translate(${s.dx}px, ${s.dy}px)` : undefined }}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                onClick={() => setActive(i)}
              >
                <path d={s.d} style={{ '--d': `${i * 120}ms` } as CSSProperties} />
              </g>
            ))}
          </svg>
          <div className={on ? 'illo-donut-center is-sector' : 'illo-donut-center'} aria-live="polite">
            <strong>{on ? on.name : 'KMI-30'}</strong>
            {on ? <i className={`illo-c${active! + 1}`} aria-hidden="true" /> : <span>Halal universe</span>}
          </div>
        </div>
        <ul className="illo-legend">
          {SEGMENTS.map((s, i) => (
            <li key={s.name}>
              <button
                type="button"
                className={active === i ? 'is-active' : undefined}
                aria-pressed={active === i}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(i)}
              >
                <i className={`illo-c${i + 1}`} />
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="illo-foot">
        <span className="illo-check">
          <Check />
        </span>
        <div>
          <strong>Shariah certified — screened by advisory board</strong>
          <span className="illo-note">Reviewed periodically for continued compliance</span>
        </div>
      </div>
    </div>
  );
}
