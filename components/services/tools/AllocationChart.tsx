'use client';

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type Row = { name: string; value: number };

/** Each sector's share against the cap line (loaded on demand: Recharts is large). */
export default function AllocationChart({ rows, cap }: { rows: Row[]; cap: number }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={rows} margin={{ top: 22, right: 4, bottom: 0, left: -18 }} accessibilityLayer={false}>
        <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: 'var(--gb)' }} tick={{ fill: 'var(--mt)', fontSize: 12 }} />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--mt)', fontSize: 11 }}
        />
        <ReferenceLine
          y={cap}
          stroke="var(--au)"
          strokeDasharray="4 4"
          label={{ value: `Cap ${cap}%`, position: 'insideTopRight', fill: 'var(--au)', fontSize: 11, fontWeight: 700 }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={46} animationDuration={350}>
          {rows.map((r) => (
            <Cell key={r.name} fill={r.value > cap ? 'var(--dn)' : 'var(--g3)'} />
          ))}
          <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} fill="var(--tx)" fontSize={12} fontWeight={600} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
