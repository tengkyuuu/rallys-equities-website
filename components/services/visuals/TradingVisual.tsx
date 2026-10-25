'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useInView } from './useInView';

const Chart = dynamic(() => import('./TradingChart'), { ssr: false, loading: () => <div className="vis-chart-ph" /> });

const UpArrow = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <path d="M5 1.5L9 7.5H1Z" fill="currentColor" />
  </svg>
);

/** Investment & Trading: a live-looking order book. Illustration only; no prices are shown. */
export default function TradingVisual() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const accent = side === 'buy' ? 'var(--g3)' : 'var(--dn)';

  return (
    <div
      ref={ref}
      className={`vis vis-${side}`}
      role="group"
      aria-label="Illustration of a trading screen: price chart, quotes and an order ticket"
    >
      <div className="vis-head">
        <span className="vis-live" />
        Live order book
      </div>
      {seen ? <Chart accent={accent} /> : <div className="vis-chart-ph" />}
      <div className="vis-cols">
        {['Company A', 'Company B'].map((c) => (
          <div key={c}>
            <span className="vis-label">{c}</span>
            <strong>Live price</strong>
            <span className="vis-up">
              <UpArrow /> Up
            </span>
          </div>
        ))}
        <div className="vis-ticket">
          <div className="vis-seg" role="radiogroup" aria-label="Order side">
            {(['buy', 'sell'] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={side === s}
                className={side === s ? 'is-on' : undefined}
                onClick={() => setSide(s)}
              >
                {s === 'buy' ? 'Buy' : 'Sell'}
              </button>
            ))}
          </div>
          <strong>Market order</strong>
          <span className="vis-note">Instant execution</span>
        </div>
      </div>
    </div>
  );
}
