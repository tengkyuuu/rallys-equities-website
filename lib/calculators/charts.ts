/* Canvas drawing for calculator results (browser only). Flat fills from three theme
   roles: emerald for the value, a quiet neutral for money put in, red for losses.
   Sized from the containing figure. */
import { cssRGB } from '@/lib/overrides/engine';
import type { Series, Tone } from './compute';

const rgb = (cv: HTMLCanvasElement, tone: Tone) =>
  tone === 'accent' ? cssRGB('--g3', cv) : tone === 'loss' ? cssRGB('--dn', cv) : cssRGB('--tx', cv);
const fill = (cv: HTMLCanvasElement, tone: Tone, alpha = 1) => `rgba(${rgb(cv, tone)},${tone === 'muted' ? alpha * 0.26 : alpha})`;
const axis = (cv: HTMLCanvasElement) => getComputedStyle(cv).getPropertyValue('--chart-axis').trim() || 'rgba(246,242,234,.42)';
const grid = (cv: HTMLCanvasElement) => `rgba(${cssRGB('--tx', cv)},.08)`;

/** Compact axis number: 1.2M / 350K */
function fmtShort(n: number) {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return Math.round(n / 1e3) + 'K';
  return Math.round(n).toString();
}

/** Crisp canvas at the device pixel ratio; returns the context and CSS-pixel size. */
function setup(cv: HTMLCanvasElement, height: number) {
  const w = Math.max(280, cv.parentElement!.clientWidth),
    dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = w * dpr;
  cv.height = height * dpr;
  cv.style.width = w + 'px';
  cv.style.height = height + 'px';
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = "500 10px 'Plus Jakarta Sans',sans-serif";
  return { ctx, w, h: height };
}

/** Baseline plus two quiet gridlines, labelled on the left. */
function gridlines(
  ctx: CanvasRenderingContext2D,
  cv: HTMLCanvasElement,
  Y: (v: number) => number,
  mn: number,
  mx: number,
  left: number,
  right: number,
) {
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const f of [0, 0.5, 1]) {
    const v = mn + (mx - mn) * f,
      y = Math.round(Y(v)) + 0.5;
    ctx.strokeStyle = f === 0 ? `rgba(${cssRGB('--tx', cv)},.22)` : grid(cv);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    ctx.fillStyle = axis(cv);
    ctx.fillText(fmtShort(v), left - 8, y);
  }
}

function topRoundedBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = Math.min(3, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

/** Grouped bars or lines with a value axis; the last value of the leading series is labelled. */
export function drawSeries(cv: HTMLCanvasElement, labels: string[], series: Series[], type: 'bar' | 'line') {
  const { ctx, w, h } = setup(cv, 220);
  const padL = 44,
    padR = 8,
    padT = 22,
    padB = 24;
  const all = series.flatMap((s) => s.data);
  const mx = Math.max(...all, 0) || 1,
    mn = Math.min(0, ...all),
    n = labels.length;
  const plotW = w - padL - padR,
    plotH = h - padT - padB;
  const Y = (v: number) => padT + plotH - ((v - mn) / (mx - mn || 1)) * plotH;
  gridlines(ctx, cv, Y, mn, mx, padL, w - padR);

  const step = Math.max(1, Math.ceil(n / 10));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = axis(cv);
  const lead = series[series.length - 1];
  let labelAt: [number, number] | null = null;

  if (type === 'line') {
    const X = (i: number) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    labels.forEach((lb, i) => {
      if (i % step === 0 || i === n - 1) ctx.fillText(lb, X(i), h - 6);
    });
    for (const s of series) {
      ctx.beginPath();
      s.data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.strokeStyle = fill(cv, s.tone);
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
      const li = s.data.length - 1;
      ctx.beginPath();
      ctx.arc(X(li), Y(s.data[li]), 3, 0, Math.PI * 2);
      ctx.fillStyle = fill(cv, s.tone);
      ctx.fill();
    }
    labelAt = [X(n - 1), Y(lead.data[n - 1])];
  } else {
    const slot = plotW / n,
      groupW = Math.min(slot * 0.62, 56),
      gap = series.length > 1 ? 3 : 0,
      bw = (groupW - gap * (series.length - 1)) / series.length;
    labels.forEach((lb, i) => {
      if (i % step === 0 || i === n - 1) ctx.fillText(lb, padL + i * slot + slot / 2, h - 6);
    });
    labels.forEach((_, i) => {
      series.forEach((s, si) => {
        const v = s.data[i],
          x = padL + i * slot + (slot - groupW) / 2 + si * (bw + gap),
          top = Y(Math.max(v, 0)),
          base = Y(Math.min(v, 0));
        ctx.fillStyle = fill(cv, s.tone);
        topRoundedBar(ctx, x, top, Math.max(2, bw), Math.max(1, base - top));
        if (s === lead && i === n - 1) labelAt = [x + bw / 2, top];
      });
    });
  }
  if (labelAt) {
    const [x, y] = labelAt;
    ctx.fillStyle = fill(cv, lead.tone);
    ctx.font = "700 11px 'Plus Jakarta Sans',sans-serif";
    ctx.textAlign = x > w - 40 ? 'right' : 'center';
    ctx.fillText(fmtShort(lead.data[lead.data.length - 1]), x, y - 7);
  }
}

/** Growth: value line over a faint flat area, amount invested as a dashed neutral line. */
export function drawGrowth(cv: HTMLCanvasElement, valueSeries: number[], investedSeries: number[]) {
  const { ctx, w, h } = setup(cv, 200);
  const padL = 44,
    padR = 8,
    padT = 22,
    padB = 10;
  const mx = Math.max(...valueSeries) || 1,
    n = valueSeries.length;
  const X = (i: number) => padL + (i / (n - 1)) * (w - padL - padR);
  const Y = (v: number) => padT + (h - padT - padB) - (v / mx) * (h - padT - padB);
  gridlines(ctx, cv, Y, 0, mx, padL, w - padR);
  const line = (s: number[]) => {
    ctx.beginPath();
    s.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
  };
  line(valueSeries);
  ctx.lineTo(X(n - 1), Y(0));
  ctx.lineTo(X(0), Y(0));
  ctx.closePath();
  ctx.fillStyle = fill(cv, 'accent', 0.12);
  ctx.fill();
  line(valueSeries);
  ctx.strokeStyle = fill(cv, 'accent');
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
  line(investedSeries);
  ctx.strokeStyle = `rgba(${rgb(cv, 'muted')},.5)`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  const last = valueSeries[n - 1];
  ctx.beginPath();
  ctx.arc(X(n - 1), Y(last), 3.5, 0, Math.PI * 2);
  ctx.fillStyle = fill(cv, 'accent');
  ctx.fill();
  ctx.font = "700 11px 'Plus Jakarta Sans',sans-serif";
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(fmtShort(last), X(n - 1), Y(last) - 9);
}

/** Drawdown: the balance left after each period. */
export function drawDrawdown(cv: HTMLCanvasElement, bars: number[], startBal: number) {
  const { ctx, w, h } = setup(cv, 200);
  const padL = 44,
    padR = 8,
    padT = 14,
    padB = 10,
    n = bars.length;
  const plotW = w - padL - padR;
  const Y = (v: number) => padT + (h - padT - padB) - (v / startBal) * (h - padT - padB);
  gridlines(ctx, cv, Y, 0, startBal, padL, w - padR);
  const slot = plotW / n,
    bw = Math.min(30, slot * 0.6);
  ctx.fillStyle = fill(cv, 'loss', 0.85);
  bars.forEach((v, i) => topRoundedBar(ctx, padL + i * slot + (slot - bw) / 2, Y(v), bw, Y(0) - Y(v)));
}
