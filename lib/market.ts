/* PSX market data: types, the featured-securities list and formatting helpers.
   Rule: real or nothing. Every number comes from /api/market; this file holds names
   and sectors only, never prices. */

export type IndexInfo = {
  current: number;
  prevClose: number;
  change: number;
  changePct: number;
  asOf?: string | number;
  /** intraday closes, oldest → newest */
  series?: number[];
  /** daily history: [epoch ms, close] oldest → newest */
  eod?: [number, number][];
};

/** [price, change, changePct, volume, name, sector] */
export type StockRow = [number, number, number, number, string, string];

export type MarketResponse = {
  indices: { KSE100?: IndexInfo; KSE30?: IndexInfo; KMI30?: IndexInfo; ALLSHR?: IndexInfo };
  stocks?: Record<string, StockRow>;
  delayed?: boolean;
};

/** 'loading' until the first answer · 'live' once real data arrived · 'down' if it never did */
export type DataMode = 'loading' | 'live' | 'down';

export const PSX_PORTAL = 'https://dps.psx.com.pk/';

/* Featured securities — names and sectors only; prices always come from the feed */
export const PSX = [
  { sym: 'ATRL', name: 'Attock Refinery Ltd', sector: 'Refinery' },
  { sym: 'MEBL', name: 'Meezan Bank Ltd', sector: 'Banks' },
  { sym: 'PSO', name: 'Pakistan State Oil', sector: 'Energy' },
  { sym: 'HBL', name: 'Habib Bank Limited', sector: 'Banks' },
  { sym: 'PPL', name: 'Pakistan Petroleum', sector: 'Energy' },
  { sym: 'NBP', name: 'National Bank of Pak.', sector: 'Banks' },
  { sym: 'FABL', name: 'Faysal Bank Ltd', sector: 'Banks' },
  { sym: 'TRG', name: 'TRG Pakistan Ltd', sector: 'Technology' },
  { sym: 'NESTLE', name: 'Nestlé Pakistan', sector: 'FMCG' },
  { sym: 'NPL', name: 'Nishat Power Ltd', sector: 'Power' },
  { sym: 'KEL', name: 'K-Electric Ltd', sector: 'Power' },
  { sym: 'FCCL', name: 'Fauji Cement Co.', sector: 'Cement' },
  { sym: 'UNITY', name: 'Unity Foods Ltd', sector: 'FMCG' },
  { sym: 'PSX', name: 'Pakistan Stock Exchange', sector: 'Financial' },
  { sym: 'ABOT', name: 'Abbott Laboratories', sector: 'Pharma' },
  { sym: 'HMB', name: 'Habib Metropolitan Bank', sector: 'Banks' },
  { sym: 'BAFL', name: 'Bank Alfalah Ltd', sector: 'Banks' },
  { sym: 'AICL', name: 'Adamjee Insurance', sector: 'Insurance' },
  { sym: 'SEARL', name: 'The Searle Company', sector: 'Pharma' },
  { sym: 'UPFL', name: 'Unilever Pakistan Foods', sector: 'FMCG' },
  { sym: 'DCR', name: 'Dolmen City REIT', sector: 'REIT' },
  { sym: 'PGLC', name: 'Pak Gulf Leasing Co.', sector: 'Leasing' },
  { sym: 'AGL', name: 'Agritech Ltd', sector: 'Chemicals' },
];

export const TICKER_SYMS = [
  'ATRL',
  'MEBL',
  'PSO',
  'HBL',
  'PPL',
  'NBP',
  'FABL',
  'TRG',
  'NESTLE',
  'KEL',
  'FCCL',
  'UNITY',
  'ABOT',
  'BAFL',
  'SEARL',
];

export const fmt = (n: number) => n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtVol = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n || 0));
export const nowStr = () =>
  new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

/** PSX regular session: Mon–Fri 09:30–15:30 Pakistan time. */
export function isPSXOpen(now = new Date()) {
  const pk = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const h = pk.getHours(),
    m = pk.getMinutes(),
    d = pk.getDay();
  return d > 0 && d < 6 && (h > 9 || (h === 9 && m >= 30)) && (h < 15 || (h === 15 && m <= 30));
}

export const stockLogoSrc = (sym: string) => `/assets/img/stocks/${sym === 'PSX' ? 'PSX-1' : sym}.png`;

/** Deterministic pastel monogram for companies without a logo file. */
export function monogram(sym: string, size: number) {
  const s =
    String(sym || '?')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') || '?';
  let hsh = 0;
  for (let i = 0; i < s.length; i++) hsh = (hsh * 31 + s.charCodeAt(i)) >>> 0;
  const hue = hsh % 360;
  return {
    initials: s.slice(0, size < 20 ? 2 : 3),
    style: {
      width: size + 'px',
      height: size + 'px',
      fontSize: Math.max(7, Math.round(size * 0.38)) + 'px',
      background: `hsl(${hue},44%,90%)`,
      color: `hsl(${hue},52%,30%)`,
    },
  };
}
