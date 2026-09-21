# Live market data (real PSX)

The site shows **real Pakistan Stock Exchange data**: the KSE-100 index (plus KSE-30, KMI-30 and
the All-Share index), the intraday KSE-100 chart, and **live prices for every listed company** —
not just a curated few. All of it is fetched server-side from PSX's own public data
(`dps.psx.com.pk`) and is delayed ~15 minutes.

Because a browser can't call PSX directly (no CORS), a **Vercel serverless function**
([`api/market.js`](api/market.js)) fetches everything server-side and the website polls
`/api/market` once a minute. If that request ever fails, the site falls back to a realistic
simulation automatically — it never visibly breaks, it just silently stops being real for that
poll and the badge switches to "SIMULATED."

> **Labelling:** the index panel reads **"PSX · DELAYED"** with a note that prices are ~15-min
> delayed. This is the honest, low-compliance-risk framing for a SECP-licensed broker. For *true
> real-time* display you'd need to license PSX's real-time feed.

---

## How it works

`api/market.js` deploys automatically with the site on Vercel (no separate setup, no secrets or
API keys needed) and does three things per request, in parallel:

1. **Indices** — `dps.psx.com.pk/timeseries/eod/{KSE100,KSE30,KMI30,ALLSHR}` for current value,
   previous close, and ~1 year of daily closes (powers the 1W/1M/YTD chart tabs).
2. **Intraday chart** — `dps.psx.com.pk/timeseries/int/KSE100` for the live 1D hero chart.
3. **Every listed company's live price** — scrapes PSX's own `market-watch` page (price, change,
   %, volume, name, sector for the whole exchange), enriched with readable sector names from
   `dps.psx.com.pk/symbols`.

The frontend ([index.html](index.html), `fetchKSE()`) calls `/api/market`, and if the response
includes a non-empty `stocks` object, every stock row on the site — the featured board and the
ticker — uses those real prices. The `PSX` array in `index.html` (with its `base` prices and
`beta` values) only drives the **fallback simulation** used when `/api/market` is unreachable.

### Check it worked
Load the live site — the panel should show the current KSE-100 value and a green
**PSX · DELAYED** badge with "Live prices from PSX · delayed ~15 min" during / after market hours.
If it instead says **SIMULATED — Indicative data (live feed unavailable)**, the live fetch failed;
check Vercel's function logs for `/api/market`.

---

## Notes & limits
- **Source:** PSX's own public data portal and market-watch page. It's PSX's own data feeding a
  PSX brokerage's site, but for production it's worth confirming acceptable-use with PSX and
  keeping the "delayed" labelling.
- **If the numbers ever stop updating:** PSX may have changed a page's markup/endpoint or be
  rate-limiting Vercel's region. The site keeps working (simulated) meanwhile — check the Vercel
  function logs for `/api/market`.
- **Legacy/unused:** [`supabase/functions/market/index.ts`](supabase/functions/market/index.ts)
  was an earlier version of this (indices only, no per-stock prices, Supabase Edge Functions
  instead of Vercel). The frontend no longer calls it — `/api/market` replaced it. It's left in
  the repo but isn't deployed or referenced; safe to delete or ignore.
