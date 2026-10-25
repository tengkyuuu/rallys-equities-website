'use client';

import dynamic from 'next/dynamic';
import { useId, useState } from 'react';
import { formatMoney, parseMoney, pkr } from '@/lib/money';

const Donut = dynamic(() => import('./PurificationDonut'), { ssr: false, loading: () => <div className="tool-donut-ph" /> });

/** Shariah-compliant investing: how much of a dividend to purify, from the visitor's own numbers. */
export default function PurificationTool() {
  const id = useId();
  const [dividend, setDividend] = useState(NaN);
  const [percent, setPercent] = useState(NaN);
  const badPercent = percent < 0 || percent > 100;
  const ready = dividend > 0 && percent >= 0 && !badPercent;
  const give = ready ? Math.round(dividend * percent) / 100 : 0;
  const keep = ready ? dividend - give : 0;

  return (
    <div className="tool">
      <div className="tool-top">
        <h4 className="tool-title">Work out your purification</h4>
      </div>
      <div className="tool-fields">
        <label htmlFor={`${id}-d`}>
          Dividend received
          <input
            id={`${id}-d`}
            className="finput"
            type="text"
            inputMode="decimal"
            placeholder="PKR"
            onInput={(e) => {
              formatMoney(e);
              setDividend(parseMoney(e.currentTarget.value));
            }}
          />
        </label>
        <label htmlFor={`${id}-p`}>
          Non-permissible income
          <span className="tool-suffix">
            <input
              id={`${id}-p`}
              className="finput"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              placeholder="0.0"
              aria-describedby={`${id}-ph`}
              onInput={(e) => setPercent(e.currentTarget.value === '' ? NaN : Number(e.currentTarget.value))}
            />
            <span>%</span>
          </span>
        </label>
      </div>
      <p className="tool-explain" id={`${id}-ph`}>
        The company&rsquo;s share of income from non-compliant sources, from its Shariah screening. Your relationship manager can give it to
        you.
      </p>
      <div className="tool-donut-row">
        <div className="tool-donut">
          <Donut keep={keep} give={give} />
          <div className="tool-donut-center" aria-hidden="true">
            <span className="tool-k">To charity</span>
            <strong>{ready ? pkr(give) : '—'}</strong>
          </div>
        </div>
        <div className="tool-ledger" aria-live="polite">
          {badPercent ? (
            <p className="tool-warn">Enter a percentage from 0 to 100.</p>
          ) : ready ? (
            <dl>
              <div>
                <dt>
                  <i className="sw-keep" />
                  You keep
                </dt>
                <dd>{pkr(keep)}</dd>
              </div>
              <div>
                <dt>
                  <i className="sw-give" />
                  Give to charity
                </dt>
                <dd>{pkr(give)}</dd>
              </div>
            </dl>
          ) : (
            <p className="tool-note">Enter a dividend and the percentage to see the split.</p>
          )}
        </div>
      </div>
    </div>
  );
}
