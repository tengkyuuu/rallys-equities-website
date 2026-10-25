'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from './useInView';

/* Bar shapes for the two states; not shown or claimed as figures. */
const SECTORS = ['Banks', 'Energy', 'Cement', 'Other'];
const MIX = { drifted: [48, 22, 19, 11], rebalanced: [35, 25, 20, 20] } as const;
type State = keyof typeof MIX;

const CAPTION: Record<State, string> = {
  drifted: 'Markets have pulled your mix away from the plan.',
  rebalanced: 'Back to your agreed allocation, after you approve the trades.',
};

const Person = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.8 14C3.3 11.2 5.4 9.8 8 9.8C10.6 9.8 12.7 11.2 13.2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** Portfolio management: a client dashboard; toggle to watch a drifted mix rebalance. */
export default function PortfolioVisual() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [state, setState] = useState<State>('drifted');
  const [active, setActive] = useState<number | null>(null);
  const touched = useRef(false);

  // the one authored moment: once in view, the drifted mix glides back to plan (unless the visitor already chose)
  useEffect(() => {
    if (!seen) return;
    const t = setTimeout(() => {
      if (!touched.current) setState('rebalanced');
    }, 1800);
    return () => clearTimeout(t);
  }, [seen]);

  return (
    <div
      ref={ref}
      className={seen ? 'illo is-in' : 'illo'}
      role="group"
      aria-label="Illustration of a portfolio dashboard with allocation and rebalancing"
    >
      <div className="illo-head">Portfolio dashboard</div>
      <div className="illo-stats">
        <div>
          <span className="illo-label">Total value</span>
          <strong>Updated live</strong>
          <span className="illo-note">Track performance anytime</span>
        </div>
        <div>
          <span className="illo-label">YTD return</span>
          <strong className="illo-gold">Your actual return</strong>
          <span className="illo-note">Reviewed each quarter</span>
        </div>
      </div>
      <div className="illo-alloc">
        <div className="illo-alloc-top">
          <span className="illo-label">Allocation</span>
          <div className="illo-seg" role="radiogroup" aria-label="Allocation state">
            {(['drifted', 'rebalanced'] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={state === s}
                className={state === s ? 'is-on' : undefined}
                onClick={() => {
                  touched.current = true;
                  setState(s);
                }}
              >
                {s === 'drifted' ? 'Drifted' : 'Rebalanced'}
              </button>
            ))}
          </div>
        </div>
        <div className="illo-bar" onMouseLeave={() => setActive(null)}>
          {SECTORS.map((name, i) => (
            <span
              key={name}
              className={`illo-c${i + 1}${active !== null && active !== i ? ' is-dim' : ''}`}
              style={{ flexGrow: seen ? MIX[state][i] : 0 }}
              onMouseEnter={() => setActive(i)}
            />
          ))}
        </div>
        <p className="illo-caption" aria-live="polite">
          {CAPTION[state]}
        </p>
        <ul className="illo-legend illo-legend-inline">
          {SECTORS.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                className={active === i ? 'is-active' : undefined}
                aria-pressed={active === i}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <i className={`illo-c${i + 1}`} />
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="illo-foot">
        <span className="illo-check">
          <Person />
        </span>
        <div>
          <strong>Advisor notes</strong>
          <span className="illo-note">Personalised guidance from your relationship manager</span>
        </div>
      </div>
    </div>
  );
}
