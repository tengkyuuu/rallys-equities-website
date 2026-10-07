# Market data (PSX)

> **Current status (October 2026): no live prices.** PSX now answers every request to its data
> portal with **403 Forbidden**, so `/api/market` returns 502 and the site shows
> **"Market data unavailable"** with a link to the PSX Data Portal. The site never shows invented
> or placeholder numbers. To bring prices back, Rallys needs a data source it is licensed to use:
> see [Getting prices back](#getting-prices-back).

## The rule: real or nothing

Every market number on the site comes from `/api/market`. There is **no simulation fallback**
and no hard-coded figures in the page.

| Situation | What visitors see |
|---|---|
| Waiting for the first response | "Loading market data…" and dashes (—) instead of values |
| `/api/market` fails and has never succeeded this visit | **MARKET DATA UNAVAILABLE**; the panel, ticker and Markets table say prices are temporarily unavailable and link to the PSX Data Portal |
| `/api/market` succeeds | **PSX · DELAYED**, with the indices, chart, company rows, ticker and full Markets table from the response |
| It succeeded earlier, then a refresh fails | The last real figures stay up; they are PSX's own and still labelled delayed |

Other details:
- The 1W/1M/YTD chart tabs are disabled unless the response includes real daily history (`indices.KSE100.eod`).
- Company rows and ticker items appear only for symbols the response actually contains.
- The fixed "PKR Exchange Rates" block was removed because it was never live.

This behaviour is covered by [`tests/market-data.spec.js`](tests/market-data.spec.js), which
mocks `/api/market` as down, loading and live.

The `PSX` array in `index.html` lists names and sectors only (featured rows, ticker order, the
logo wall). It holds no prices.

---

## How it works

The browser can't call PSX directly (no CORS), so a **Vercel serverless function**
([`api/market.js`](api/market.js)) fetches the data server-side. The site polls `/api/market`
once a minute and expects this response:

```json
{ "indices": { "KSE100": { "current", "prevClose", "change", "changePct", "asOf", "series": [...], "eod": [[ms, close], ...] },
               "KSE30": {...}, "KMI30": {...}, "ALLSHR": {...} },
  "stocks":  { "HBL": [price, change, changePct, volume, name, sector], ... },
  "delayed": true }
```

Today `api/market.js` builds that response from PSX's data portal (`dps.psx.com.pk`):
`timeseries/eod/*` for the indices, `timeseries/int/KSE100` for the intraday chart, `market-watch`
for company prices and `symbols` for sector names. **All four now return 403.**

## Getting prices back

PSX's own terms say commercial use of its website data is *"strictly prohibited unless acquired
with prior approval of PSX"*, so don't work around the 403. The options:

1. **Rallys's own trading or back-office vendor.** As a PSX broker, Rallys already receives market
   data; ask the vendor for a delayed feed or API for the website.
2. **A PSX-authorized data vendor**, e.g. Capital Stake (contact@capitalstake.com), which offers
   real-time, delayed and end-of-day APIs. PSX publishes the full list of authorized vendors.
3. **PSX directly:** marketdatarequest@psx.com.pk.

Free sources were checked in October 2026 and none are usable on a commercial website:
- **TradingView widgets:** PSX symbols show "only available on TradingView".
- **Yahoo Finance:** PSX prices stopped updating in July 2024.
- **Free "PSX APIs":** they re-serve the same blocked portal.
- **Twelve Data and EODHD:** PSX needs a paid plan, and the free plans are personal or testing use only.

Once a source is chosen, only `api/market.js` changes: map the provider's response to the shape
above. The front end needs no changes, and prices return automatically.

---

## Notes
- **Legacy/unused:** [`supabase/functions/market/index.ts`](supabase/functions/market/index.ts)
  is an earlier, indices-only version. Nothing calls it, so it's safe to delete or ignore.
