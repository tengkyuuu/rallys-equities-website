'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { drawDrawdown, drawGrowth, drawSeries } from '@/lib/calculators/charts';
import { COMPUTE, type Block, type CalcResult, type Tone } from '@/lib/calculators/compute';
import type { CalculatorDef, CalculatorId } from '@/lib/calculators/data';

/** Live thousands separators for money inputs, keeping the caret in place. */
function formatMoney(e: FormEvent<HTMLInputElement>) {
  const el = e.currentTarget,
    caret = el.selectionStart ?? el.value.length,
    len = el.value.length;
  const parts = el.value.replace(/[^\d.]/g, '').split('.');
  if (parts[0] !== '') parts[0] = Number(parts[0]).toLocaleString('en-US');
  el.value = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('').slice(0, 2) : parts[0];
  const pos = Math.max(0, caret + el.value.length - len);
  try {
    el.setSelectionRange(pos, pos);
  } catch {
    /* number inputs */
  }
}

/** A chart canvas, redrawn when the theme changes. */
function Canvas({ id, draw }: { id: string; draw: (cv: HTMLCanvasElement) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const redraw = () => ref.current && draw(ref.current);
    redraw();
    addEventListener('re-recolor', redraw);
    addEventListener('resize', redraw);
    return () => {
      removeEventListener('re-recolor', redraw);
      removeEventListener('resize', redraw);
    };
  }, [draw]);
  return <canvas id={id} ref={ref} role="img" aria-label="Chart of the result" />;
}

function Chart({ keys, caption, children }: { keys: [string, Tone][]; caption?: string; children: React.ReactNode }) {
  return (
    <figure className="calc-chart">
      <figcaption className="cc-legend">
        {keys.map(([name, tone]) => (
          <span key={name}>
            <i className={`cc-key cc-${tone}`} aria-hidden="true" />
            {name}
          </span>
        ))}
        {caption && <span className="cc-caption">{caption}</span>}
      </figcaption>
      {children}
    </figure>
  );
}

function ResultBlock({ b }: { b: Block }) {
  switch (b.kind) {
    case 'series':
      return (
        <Chart keys={b.series.map((s) => [s.name, s.tone])} caption={b.caption}>
          <Canvas id={b.id} draw={(cv) => drawSeries(cv, b.labels, b.series, b.type)} />
        </Chart>
      );
    case 'growth':
      return (
        <Chart
          keys={[
            ['Amount invested', 'muted'],
            ['Projected value', 'accent'],
          ]}
          caption={b.xLabel}
        >
          <Canvas id={b.id} draw={(cv) => drawGrowth(cv, b.value, b.invested)} />
        </Chart>
      );
    case 'ddChart':
      return (
        <Chart keys={[['Balance left after each period', 'loss']]} caption={`Periods 1–${b.bars.length}`}>
          <Canvas id={b.id} draw={(cv) => drawDrawdown(cv, b.bars, b.start)} />
        </Chart>
      );
    case 'table':
      return (
        <details className="calc-breakdown">
          <summary>{b.title}</summary>
          <div className="calc-breakdown-scroll">
            <table className="dd-table">
              <thead>
                <tr>
                  {b.headers.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) =>
                      j === 0 ? (
                        <th key={j} scope="row">
                          {c}
                        </th>
                      ) : (
                        <td key={j}>{c}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      );
  }
}

function Result({ r }: { r: CalcResult }) {
  return (
    <>
      <p className="calc-answer">
        {r.answer.map((part, i) =>
          typeof part === 'string' ? (
            part
          ) : (
            <strong key={i} className={part.tone === 'loss' ? 'is-loss' : undefined}>
              {part.em}
            </strong>
          ),
        )}
      </p>
      <dl className="calc-ledger">
        {r.rows.map(([k, v, tone]) => (
          <div className="calc-row" key={k}>
            <dt className="calc-k">{k}</dt>
            <dd className={`calc-v${tone ? ' is-' + tone : ''}`}>{v}</dd>
          </div>
        ))}
      </dl>
      {r.blocks.map((b, i) => (
        <ResultBlock key={i} b={b} />
      ))}
    </>
  );
}

export default function CalculatorCard({ id, def }: { id: CalculatorId; def: CalculatorDef }) {
  const card = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{ run: number; r: CalcResult } | null>(null);

  const calculate = (e?: FormEvent) => {
    e?.preventDefault();
    const num = (fid: string) => parseFloat((card.current?.querySelector<HTMLInputElement>('#' + fid)?.value || '').replace(/,/g, ''));
    const r = COMPUTE[id](num);
    if (r) setResult((prev) => ({ run: (prev?.run ?? 0) + 1, r })); // incomplete inputs leave the last result up
  };

  return (
    <div className="calc-card" id={def.cardId} ref={card}>
      <div className="calc-title">{def.cardTitle}</div>
      <p className="calc-sub">{def.sub}</p>
      {def.formula && <p className="calc-formula">{def.formula}</p>}
      <form className="calc-fields" onSubmit={calculate} noValidate>
        {def.fields.map((f) => (
          <div className="fg" key={f.id}>
            <label className="flbl" htmlFor={f.id}>
              {f.label}
            </label>
            {f.money ? (
              <input type="text" inputMode="numeric" className="finput" id={f.id} placeholder={f.placeholder} onInput={formatMoney} />
            ) : (
              <input type="number" className="finput" id={f.id} placeholder={f.placeholder} min={f.min} max={f.max} step={f.step} />
            )}
          </div>
        ))}
        <button className="calc-btn" type="submit">
          {def.button}
        </button>
      </form>
      <section className={`calc-out${result ? ' show' : ''}`} id={def.outId} key={result?.run} aria-live="polite">
        {result && <Result r={result.r} />}
      </section>
    </div>
  );
}
