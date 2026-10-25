'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { DataMode, MarketResponse } from '@/lib/market';

/* PSX market data — real or nothing. Polls /api/market once a minute. Until a response
   arrives, or whenever the feed is unavailable, widgets say so instead of showing
   figures: a licensed brokerage must never display invented prices.
   A failed refresh after real data keeps those (real, PSX-dated) figures up. */

export type MarketState = {
  mode: DataMode;
  data: MarketResponse | null;
  /** bumps on every fetch attempt so widgets can refresh "updated at" labels */
  updatedAt: number;
};

const MarketCtx = createContext<MarketState>({ mode: 'loading', data: null, updatedAt: 0 });

export const useMarket = () => useContext(MarketCtx);

/** true once real index data has arrived */
export const isLive = (m: MarketState): m is MarketState & { data: MarketResponse } => m.mode === 'live' && !!m.data?.indices.KSE100;

async function fetchMarket(): Promise<MarketResponse | null> {
  try {
    const r = await fetch('/api/market', { signal: AbortSignal.timeout(6000) });
    const j = r.ok ? ((await r.json()) as MarketResponse) : null;
    return j?.indices?.KSE100 && j.indices.KSE100.current > 0 ? j : null;
  } catch {
    return null;
  }
}

export default function MarketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MarketState>({ mode: 'loading', data: null, updatedAt: 0 });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const j = await fetchMarket();
      if (!alive) return;
      setState((s) =>
        j
          ? { mode: 'live', data: j, updatedAt: Date.now() }
          : { mode: s.mode === 'live' ? 'live' : 'down', data: s.data, updatedAt: Date.now() },
      );
    };
    load();
    const iv = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  return <MarketCtx.Provider value={state}>{children}</MarketCtx.Provider>;
}
