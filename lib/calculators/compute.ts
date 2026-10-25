import type { CalculatorId } from './data';

/* Calculator maths (unchanged from the original site). Each returns:
   - answer: the result stated as one sentence; `{ em }` parts are the figures to stress
   - rows:   the supporting figures, as label / value (/ tone)
   - blocks: chart and table blocks shown under them
   or null when inputs are incomplete. */

/** Colour roles, resolved from the theme where they're drawn. */
export type Tone = 'accent' | 'muted' | 'loss';
export type Series = { name: string; tone: Tone; data: number[] };
export type Block =
  | { kind: 'series'; id: string; labels: string[]; series: Series[]; type: 'bar' | 'line'; caption?: string }
  | { kind: 'growth'; id: string; value: number[]; invested: number[]; xLabel: string }
  | { kind: 'table'; title: string; headers: string[]; rows: (string | number)[][] }
  | { kind: 'ddChart'; id: string; bars: number[]; start: number };
export type Row = [label: string, value: string, tone?: 'gain' | 'loss'];
export type AnswerPart = string | { em: string; tone?: 'loss' };
export type CalcResult = { answer: AnswerPart[]; rows: Row[]; blocks: Block[] };

/** Reads a field (thousands separators allowed) → number or NaN. */
export type Num = (id: string) => number;

// non-breaking space: the currency never wraps away from its amount
const pk = (n: number) => 'PKR ' + n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pk0 = (n: number) => 'PKR ' + Math.round(n).toLocaleString('en-PK');
const gp = (n: number) => Math.round(n).toLocaleString('en-PK'); // grouped integer
const int = (n: number) => n.toLocaleString('en-PK', { maximumFractionDigits: 0 });
const pct = (n: number) => n.toFixed(2) + '%';
const years = (y: number) => y + ' year' + (y > 1 ? 's' : '');

function cagr(num: Num): CalcResult | null {
  const b = num('cagr-b'),
    e = num('cagr-e'),
    y = num('cagr-y');
  if (!(b > 0 && e > 0 && y > 0)) return null;
  const c = (Math.pow(e / b, 1 / y) - 1) * 100;
  const yrs: string[] = [],
    inv: number[] = [],
    fin: number[] = [],
    rows: string[][] = [];
  for (let t = 1; t <= y; t++) {
    const fvt = b * Math.pow(e / b, t / y);
    yrs.push('Y' + t);
    inv.push(b);
    fin.push(fvt);
    rows.push(['Year ' + t, gp(b), gp(fvt - b), gp(fvt)]);
  }
  return {
    answer: [`${pk0(b)} grew to ${pk0(e)} over ${years(y)}: an average of `, { em: pct(c) }, ' a year.'],
    rows: [
      ['Total Invested', pk(b)],
      ['Final Value', pk(e)],
      ['Gains', pk(e - b), e >= b ? 'gain' : 'loss'],
      ['Absolute Return', pct((e / b - 1) * 100)],
    ],
    blocks: [
      {
        kind: 'series',
        id: 'cagr-chart',
        labels: yrs,
        series: [
          { name: 'Invested', tone: 'muted', data: inv },
          { name: 'Value', tone: 'accent', data: fin },
        ],
        type: 'bar',
        caption: years(y),
      },
      { kind: 'table', title: 'Year-by-year breakdown', headers: ['Year', 'Invested', 'Gain', 'Value'], rows },
    ],
  };
}

function sip(num: Num): CalcResult | null {
  const p = num('sip-p'),
    r = num('sip-r'),
    y = num('sip-y');
  if (!(p > 0 && r > 0 && y > 0)) return null;
  const i = r / 100 / 12,
    n = y * 12;
  const fv = p * (((Math.pow(1 + i, n) - 1) * (1 + i)) / i),
    dep = p * n;
  const yrs: string[] = [],
    inv: number[] = [],
    fin: number[] = [],
    rows: string[][] = [];
  for (let t = 1; t <= y; t++) {
    const months = t * 12,
      invested = p * months,
      fvt = p * (((Math.pow(1 + i, months) - 1) * (1 + i)) / i);
    yrs.push('Y' + t);
    inv.push(invested);
    fin.push(fvt);
    rows.push(['Year ' + t, gp(invested), gp(fvt - invested), gp(fvt)]);
  }
  return {
    answer: [`Investing ${pk0(p)} a month for ${years(y)} at ${r}% could grow to `, { em: pk(fv) }, '.'],
    rows: [
      ['Total Amount Deposited', pk(dep)],
      ['Total Earnings', pk(fv - dep), 'gain'],
    ],
    blocks: [
      {
        kind: 'series',
        id: 'sip-chart',
        labels: yrs,
        series: [
          { name: 'Deposited', tone: 'muted', data: inv },
          { name: 'Value', tone: 'accent', data: fin },
        ],
        type: 'bar',
        caption: years(y),
      },
      { kind: 'table', title: 'Year-by-year breakdown', headers: ['Year', 'Deposited', 'Gain', 'Value'], rows },
    ],
  };
}

function invest(num: Num): CalcResult | null {
  const p = num('inv-p') || 0,
    m = num('inv-m') || 0,
    r = num('inv-r'),
    y = num('inv-y');
  if (!((p > 0 || m > 0) && r > 0 && y > 0)) return null;
  const i = r / 100 / 12,
    n = y * 12;
  const sipFv = (t: number) => (m > 0 && t ? m * (((Math.pow(1 + i, t) - 1) * (1 + i)) / i) : 0);
  const total = p * Math.pow(1 + i, n) + sipFv(n),
    invested = p + m * n;
  const value: number[] = [],
    inv: number[] = [];
  for (let t = 0; t <= n; t++) {
    value.push(p * Math.pow(1 + i, t) + sipFv(t));
    inv.push(p + m * t);
  }
  return {
    answer: [`In ${years(y)}, your investment could be worth `, { em: pk(total) }, '.'],
    rows: [
      ['Total Invested', pk(invested)],
      ['Total Earnings', pk(total - invested), 'gain'],
    ],
    blocks: [{ kind: 'growth', id: 'inv-chart', value, invested: inv, xLabel: years(y) }],
  };
}

function depr(num: Num): CalcResult | null {
  const c = num('dep-c'),
    sy = num('dep-sy'),
    y = num('dep-y'),
    inf = num('dep-i');
  if (!(c > 0 && y > 0 && inf >= 0 && sy > 0)) return null;
  const f = inf / 100;
  const yrs: string[] = [],
    dv: number[] = [],
    ivl: number[] = [],
    rows: (string | number)[][] = [];
  for (let t = 1; t <= y; t++) {
    const d = c / Math.pow(1 + f, t),
      iv = c * Math.pow(1 + f, t);
    yrs.push(String(sy + t));
    dv.push(d);
    ivl.push(iv);
    rows.push([sy + t, pct(inf), gp(d), gp(iv)]);
  }
  // purchasing power of the cash after y years · cost of today's basket after y years
  return {
    answer: [
      `At ${inf}% inflation, ${pk0(c)} kept as cash will buy only `,
      { em: pk(c / Math.pow(1 + f, y)), tone: 'loss' },
      ` of today's goods by ${sy + y}.`,
    ],
    rows: [
      ['Initial Cash Value', pk(c)],
      ['Years Covered', `${sy} – ${sy + y}`],
      ['Last Inflation Value', pk(c * Math.pow(1 + f, y))],
    ],
    blocks: [
      {
        kind: 'series',
        id: 'dep-chart',
        labels: yrs,
        series: [
          { name: 'Depreciated Value', tone: 'loss', data: dv },
          { name: 'Inflation Value', tone: 'accent', data: ivl },
        ],
        type: 'line',
        caption: y + ' years',
      },
      { kind: 'table', title: 'Year-by-year breakdown', headers: ['Year', 'Inflation', 'Depreciated Value', 'Inflation Value'], rows },
    ],
  };
}

function xrate(num: Num): CalcResult | null {
  const cr = num('xr-cr'),
    fv = num('xr-fv'),
    d = (num('xr-d') || 0) / 100,
    b = (num('xr-b') || 0) / 100,
    r = (num('xr-r') || 0) / 100;
  if (!(cr > 0 && fv > 0)) return null;
  const xd = cr - fv * d,
    xb = cr / (1 + b),
    xr = (cr + fv * r) / (1 + r),
    xbr = (cr - fv * d + fv * r) / (1 + b + r);
  return {
    answer: ['With the dividend, bonus and rights applied, the adjusted price is ', { em: pk(xbr) }, '.'],
    rows: [
      ['XD Rate', pk(xd)],
      ['XB Rate', pk(xb)],
      ['XR Rate', pk(xr)],
    ],
    blocks: [
      {
        kind: 'series',
        id: 'xr-chart',
        labels: ['CR', 'XD', 'XB', 'XR', 'XBR'],
        series: [{ name: 'Price (PKR)', tone: 'accent', data: [cr, xd, xb, xr, xbr] }],
        type: 'bar',
        caption: 'Rate comparison',
      },
    ],
  };
}

function dcf(num: Num): CalcResult | null {
  const cf = num('dcf-cf'),
    price = num('dcf-p'),
    g = num('dcf-g') / 100,
    rg = num('dcf-rg') / 100,
    rt = num('dcf-rt') / 100;
  if (!(cf > 0 && price > 0) || isNaN(g) || isNaN(rg) || isNaN(rt)) return null;
  // Two-stage: years 1–10 grown at g, discounted at the growth-stage rate;
  // years 11–20 held at the year-10 level, discounted at the terminal-stage rate.
  let iv = 0;
  for (let t = 1; t <= 10; t++) iv += (cf * Math.pow(1 + g, t)) / Math.pow(1 + rg, t);
  const c10 = cf * Math.pow(1 + g, 10);
  for (let t = 11; t <= 20; t++) iv += c10 / Math.pow(1 + rt, t);
  const mos = ((iv - price) / iv) * 100;
  return {
    answer: ['Estimated intrinsic value: ', { em: pk(iv) }, ' a share.'],
    rows: [
      ['Current Share Price', pk(price)],
      ['Margin of Safety', pct(mos), mos >= 0 ? 'gain' : 'loss'],
    ],
    blocks: [],
  };
}

function fcf(num: Num): CalcResult | null {
  const eq = num('fcf-eq'),
    sh = num('fcf-sh'),
    c = num('fcf-c'),
    ca = num('fcf-ca'),
    g = num('fcf-g') / 100;
  if (!(c > 0 && sh > 0) || isNaN(g)) return null;
  const n = 6; // projected over the 6-year averaging window
  const pfcf = c * Math.pow(1 + g, n),
    pcash = (ca > 0 ? ca : 0) * Math.pow(1 + g, n);
  const rows: Row[] = [
    ['Projected Cash', pk(pcash)],
    ['Projected FCF / Share', pk(pfcf / sh)],
    ['Projected Cash / Share', pk(pcash / sh)],
  ];
  if (eq > 0) rows.push(['Equity / Share', pk(eq / sh)]);
  return { answer: ['In six years, free cash flow could reach ', { em: pk(pfcf) }, '.'], rows, blocks: [] };
}

function drawdown(num: Num): CalcResult | null {
  const sb = num('dd-sb'),
    pd = num('dd-pd'),
    l = num('dd-l');
  if (!(sb > 0 && pd > 0 && pd <= 60 && l > 0 && l < 100)) return null;
  let bal = sb;
  const rows: string[][] = [],
    bars: number[] = [];
  for (let t = 1; t <= pd; t++) {
    const start = bal,
      end = bal * (1 - l / 100);
    rows.push([String(t), int(start), int(end), int(sb - end), pct(((sb - end) / sb) * 100)]);
    bars.push(end);
    bal = end;
  }
  return {
    answer: [`After ${pd} period${pd > 1 ? 's' : ''} of ${l}% losses, ${pk0(sb)} falls to `, { em: pk(bal), tone: 'loss' }, '.'],
    rows: [
      ['Total Loss', pk(sb - bal), 'loss'],
      ['Total Loss %', pct(((sb - bal) / sb) * 100), 'loss'],
    ],
    blocks: [
      { kind: 'ddChart', id: 'dd-chart', bars, start: sb },
      {
        kind: 'table',
        title: 'Period-by-period breakdown',
        headers: ['Period', 'Starting Balance', 'Ending Balance', 'Total Loss', 'Total Loss %'],
        rows,
      },
    ],
  };
}

export const COMPUTE: Record<CalculatorId, (num: Num) => CalcResult | null> = { cagr, sip, invest, depr, xrate, dcf, fcf, drawdown };
