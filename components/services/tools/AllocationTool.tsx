'use client';

import dynamic from 'next/dynamic';
import { useId, useState } from 'react';

const Chart = dynamic(() => import('./AllocationChart'), { ssr: false, loading: () => <div className="tool-chart-ph" /> });

const SECTORS = ['Banks', 'Energy', 'Cement', 'Other'] as const;

/** Portfolio management: the visitor sets a sector mix and a cap; the chart shows what a review would flag. */
export default function AllocationTool() {
  const id = useId();
  // an even split as the neutral starting point, not a recommendation
  const [mix, setMix] = useState<number[]>(SECTORS.map(() => 25));
  const [cap, setCap] = useState(40);
  const total = mix.reduce((a, b) => a + b, 0);
  const over = SECTORS.filter((_, i) => mix[i] > cap);
  const rows = SECTORS.map((name, i) => ({ name, value: mix[i] }));

  const status =
    total !== 100
      ? { warn: true, text: `Your sectors add up to ${total}%. Adjust them to 100%.` }
      : over.length
        ? {
            warn: true,
            text: `${over.join(' and ')} ${over.length > 1 ? 'are' : 'is'} above your ${cap}% cap. At the next review we would propose trimming back.`,
          }
        : { warn: false, text: `Every sector is within your ${cap}% cap. Nothing is traded until you approve it.` };

  return (
    <div className="tool">
      <div className="tool-top">
        <h4 className="tool-title">Plan your sector mix</h4>
      </div>
      <Chart rows={rows} cap={cap} />
      <p className={status.warn ? 'tool-status-line is-warn' : 'tool-status-line'} aria-live="polite">
        {status.text}
      </p>
      <div className="tool-sliders">
        {SECTORS.map((name, i) => (
          <label key={name} htmlFor={`${id}-${i}`}>
            <span>
              {name}
              <b>{mix[i]}%</b>
            </span>
            <input
              id={`${id}-${i}`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={mix[i]}
              onChange={(e) => setMix(mix.map((v, j) => (j === i ? Number(e.target.value) : v)))}
            />
          </label>
        ))}
        <label htmlFor={`${id}-cap`} className="is-cap">
          <span>
            Sector cap
            <b>{cap}%</b>
          </span>
          <input id={`${id}-cap`} type="range" min={20} max={60} step={5} value={cap} onChange={(e) => setCap(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
