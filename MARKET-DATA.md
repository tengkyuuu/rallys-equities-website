# Live market data (real KSE-100)

The site shows the **real KSE-100** index (plus KSE-30, KMI-30 and the All-Share index) and the
real intraday KSE-100 chart, pulled from the **Pakistan Stock Exchange's own public data portal**
(`dps.psx.com.pk`). Individual stock rows in the table/ticker remain a realistic **simulation** and
are clearly labelled *“indicative.”*

Because a browser can't call PSX directly (no CORS), a tiny **Supabase Edge Function** fetches the
data server-side and the website polls it once a minute. If the function is ever unreachable, the
site falls back to its simulation automatically — it never breaks.

> **Labelling:** the index panel reads **“PSX · DELAYED”** with a note that prices are ~15-min
> delayed and individual stock rows are indicative. This is the honest, low-compliance-risk framing
> for a SECP-licensed broker. For *true real-time* display you'd license PSX's real-time feed.

---

## One-time setup (~3 minutes)

Deploy the function — no secrets or API keys needed.

1. Supabase dashboard → **Edge Functions** → **Create a function** → name it exactly `market`.
2. Paste the entire contents of
   [`supabase/functions/market/index.ts`](supabase/functions/market/index.ts) → **Deploy**.
   *(CLI alternative: `supabase functions deploy market`.)*

That's it. The website already calls `…/functions/v1/market` with your public anon key, so leave
**Verify JWT** on. Within a minute the KSE-100 panel switches from “SIMULATED” to “PSX · DELAYED”
with live numbers.

### Check it worked
Open the function's URL in a browser tab (you'll be prompted for auth) or just load the live site —
the index panel should show the current KSE-100 value and a green **PSX · DELAYED** badge during
/ after market hours.

---

## Notes & limits
- **Source:** PSX public data portal (`dps.psx.com.pk/timeseries/...`). It's PSX's own data feeding a
  PSX brokerage's site, but for production it's worth confirming acceptable-use with PSX and keeping
  the “delayed / indicative” labelling.
- **If the numbers ever stop updating:** PSX may have changed the endpoint or be rate-limiting the
  function's region. The site keeps working (simulated) meanwhile. Check the function's **Logs**.
- **Individual stocks** are not real on the free tier — global data providers cover PSX equities
  poorly. To make the full stock board real, you'd add a paid PSX-equity data provider (see the
  “Index + real stock board” option we discussed) and extend this same function.
