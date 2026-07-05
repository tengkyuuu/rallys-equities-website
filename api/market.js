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

// Parse PSX's market-watch table (one fetch = every listed company's live price).
// Each row's data-order cells are: [symbol, LDCP(prevClose), open, high, low, CURRENT, change, change%, volume]
async function marketWatch() {
  const r = await fetch('https://dps.psx.com.pk/market-watch', { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('market-watch HTTP ' + r.status);
  const html = await r.text();
  const tb = html.match(/<tbody[\s\S]*?<\/tbody>/i);
  const stocks = {};
  if (!tb) return stocks;
  const rows = tb[0].match(/<tr[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const symM = row.match(/data-search="([^"]+)"/);
    if (!symM) continue;
    const o = [...row.matchAll(/data-order="([^"]*)"/g)].map((m) => m[1]);
    const n = (i) => { const v = parseFloat(o[i]); return isNaN(v) ? null : v; };
    const current = n(5);
    if (current == null) continue;
    stocks[symM[1]] = [current, n(6) || 0, n(7) || 0, n(8) || 0]; // [price, change, change%, volume]
  }
  return stocks;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // cache at the Vercel edge for 60s, serve stale up to 5 min while refreshing
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  try {
    // Fetch everything from PSX in parallel (indices + intraday + all stock prices)
    const [raw, intr, stocks] = await Promise.all([
      Promise.all(SYMBOLS.map(async (sym) => { try { return [sym, await psx('eod/' + sym)]; } catch { return [sym, null]; } })),
      psx('int/KSE100').catch(() => null),
      marketWatch().catch(() => null),
    ]);

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

    // KSE-100 intraday curve for the 1D chart (downsampled, oldest -> newest)
    if (intr) {
      const pts = intr.map((p) => p[1]).reverse();
      const step = Math.max(1, Math.floor(pts.length / 60));
      const series = pts.filter((_, i) => i % step === 0);
      if (series[series.length - 1] !== pts[pts.length - 1]) series.push(pts[pts.length - 1]);
      indices.KSE100.series = series;
    }

    res.status(200).json({
      indices,
      stocks: (stocks && Object.keys(stocks).length) ? stocks : null,
      asOf, delayed: true, source: 'Pakistan Stock Exchange (dps.psx.com.pk)',
    });
  } catch (e) {
    res.status(502).json({ error: String(e && e.message || e) });
  }
};
