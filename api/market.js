// ════════════════════════════════════════════════════════════════
// Vercel Serverless Function:  GET /api/market
// Returns REAL Pakistan Stock Exchange index data (KSE-100 + sub-indices)
// fetched server-side from PSX's public data portal (dps.psx.com.pk).
// The browser can't call PSX directly (no CORS); this runs on Vercel's
// server, so the site fetches same-origin /api/market with no CORS issue.
// Deploys automatically on git push — no separate setup needed.
// ════════════════════════════════════════════════════════════════
const UA = 'Mozilla/5.0 (compatible; RallysEquities/1.0; +https://rallysequities.com)';
const SYMBOLS = ['KSE100', 'KSE30', 'KMI30', 'ALLSHR'];

async function psx(path) {
  const r = await fetch('https://dps.psx.com.pk/timeseries/' + path, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
  });
  if (!r.ok) throw new Error('PSX ' + path + ' HTTP ' + r.status);
  const j = await r.json();
  if (j.status !== 1 || !Array.isArray(j.data)) throw new Error('PSX ' + path + ' bad payload');
  return j.data;
}

function summarize(eod) {
  const cur = eod[0], prev = eod[1] || eod[0];
  const current = cur[1], prevClose = prev[1];
  const change = current - prevClose;
  return { current, prevClose, change, changePct: prevClose ? (change / prevClose) * 100 : 0, asOf: cur[0] * 1000 };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // cache at the Vercel edge for 60s, serve stale up to 5 min while refreshing
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  try {
    const raw = await Promise.all(SYMBOLS.map(async (sym) => {
      try { return [sym, await psx('eod/' + sym)]; }
      catch { return [sym, null]; }
    }));
    const indices = {};
    let asOf = 0;
    for (const [sym, data] of raw) {
      if (!data) continue;
      indices[sym] = summarize(data);
      asOf = Math.max(asOf, indices[sym].asOf);
      // KSE-100 gets ~1yr of daily closes so the 1W / 1M / YTD chart tabs work
      if (sym === 'KSE100') indices.KSE100.eod = data.slice(0, 260).reverse().map((r) => [r[0] * 1000, r[1]]);
    }
    if (!indices.KSE100) { res.status(502).json({ error: 'KSE100 unavailable upstream' }); return; }

    // KSE-100 intraday curve for the hero chart (downsampled, oldest -> newest)
    try {
      const int = await psx('int/KSE100');
      const pts = int.map((p) => p[1]).reverse();
      const step = Math.max(1, Math.floor(pts.length / 60));
      const series = pts.filter((_, i) => i % step === 0);
      if (series[series.length - 1] !== pts[pts.length - 1]) series.push(pts[pts.length - 1]);
      indices.KSE100.series = series;
    } catch { /* series optional */ }

    res.status(200).json({ indices, asOf, delayed: true, source: 'Pakistan Stock Exchange (dps.psx.com.pk)' });
  } catch (e) {
    res.status(502).json({ error: String(e && e.message || e) });
  }
};
