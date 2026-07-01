// ════════════════════════════════════════════════════════════════
// Supabase Edge Function: market
// Returns real Pakistan Stock Exchange index data (KSE-100 + sub-indices)
// fetched server-side from PSX's public data portal (dps.psx.com.pk), so
// the browser never hits CORS and no API key is exposed.
//
// GET  /functions/v1/market   →
//   { indices: { KSE100:{current,change,changePct,prevClose,asOf,series}, KSE30:{…}, KMI30:{…}, ALLSHR:{…} },
//     asOf, delayed:true, source:"Pakistan Stock Exchange" }
//
// Deploy:  supabase functions deploy market
//   (or paste into the dashboard's function editor — Edge Functions → Create function → "market")
// The frontend calls it with the public anon key, so JWT verification can stay ON.
// ════════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const UA = "Mozilla/5.0 (compatible; RallysEquities/1.0; +https://rallysequities.com)";
const SYMBOLS = ["KSE100", "KSE30", "KMI30", "ALLSHR"];

async function psx(path: string): Promise<number[][]> {
  const r = await fetch("https://dps.psx.com.pk/timeseries/" + path, {
    headers: { "User-Agent": UA, "Accept": "application/json" },
  });
  if (!r.ok) throw new Error(`PSX ${path} HTTP ${r.status}`);
  const j = await r.json();
  if (j.status !== 1 || !Array.isArray(j.data)) throw new Error(`PSX ${path} bad payload`);
  return j.data as number[][];
}

function summarize(eod: number[][]) {
  const cur = eod[0];
  const prev = eod[1] ?? eod[0];
  const current = cur[1];
  const prevClose = prev[1];
  const change = current - prevClose;
  return {
    current,
    prevClose,
    change,
    changePct: prevClose ? (change / prevClose) * 100 : 0,
    asOf: cur[0] * 1000,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    // Fetch each index's end-of-day series (gives current + previous close).
    const results = await Promise.all(
      SYMBOLS.map(async (sym) => {
        try { return [sym, summarize(await psx("eod/" + sym))] as const; }
        catch { return [sym, null] as const; }
      }),
    );
    const indices: Record<string, unknown> = {};
    let asOf = 0;
    for (const [sym, data] of results) {
      if (data) { indices[sym] = data; asOf = Math.max(asOf, data.asOf); }
    }
    if (!indices.KSE100) {
      return new Response(JSON.stringify({ error: "KSE100 unavailable upstream" }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // KSE-100 intraday curve for the hero chart (downsampled, oldest → newest).
    try {
      const int = await psx("int/KSE100");
      const pts = int.map((p) => p[1]).reverse();
      const step = Math.max(1, Math.floor(pts.length / 60));
      const series = pts.filter((_, i) => i % step === 0);
      if (series[series.length - 1] !== pts[pts.length - 1]) series.push(pts[pts.length - 1]);
      (indices.KSE100 as Record<string, unknown>).series = series;
    } catch { /* chart series is optional */ }

    const body = JSON.stringify({
      indices,
      asOf,
      delayed: true,
      source: "Pakistan Stock Exchange (dps.psx.com.pk)",
    });
    return new Response(body, {
      headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }),
      { status: 502, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
