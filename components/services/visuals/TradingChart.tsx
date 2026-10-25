'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { prefersReducedMotion } from './useInView';

/* A drawn shape, not market data: a gentle rising curve with some texture. No values are shown. */
const SHAPE = Array.from({ length: 48 }, (_, i) => ({
  i,
  y: 40 + i * 1.15 + 6 * Math.sin(i / 3.2) + 2.5 * Math.sin(i / 1.3),
}));

/** The order-book chart: draws in when shown; a crosshair follows the pointer. Loaded on demand. */
export default function TradingChart({ accent }: { accent: string }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={SHAPE} margin={{ top: 10, right: 6, bottom: 0, left: 6 }}>
        <defs>
          <linearGradient id="illo-trade-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--gb)" strokeDasharray="3 5" />
        <XAxis dataKey="i" hide />
        <YAxis hide domain={['dataMin - 6', 'dataMax + 4']} />
        <Tooltip cursor={{ stroke: 'var(--au)', strokeWidth: 1, strokeDasharray: '3 3' }} content={() => null} isAnimationActive={false} />
        <Area
          type="monotone"
          dataKey="y"
          stroke={accent}
          strokeWidth={2.2}
          fill="url(#illo-trade-fill)"
          activeDot={{ r: 5, fill: accent, stroke: 'var(--nv2)', strokeWidth: 2.5 }}
          isAnimationActive={!prefersReducedMotion()}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
