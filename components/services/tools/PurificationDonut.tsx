'use client';

import { Cell, Pie, PieChart } from 'recharts';

/** Donut of what the investor keeps vs gives to charity (loaded on demand: Recharts is large). */
export default function PurificationDonut({ keep, give }: { keep: number; give: number }) {
  const empty = !(keep + give > 0);
  const data = empty
    ? [{ name: 'empty', value: 1, fill: 'var(--gb)' }]
    : [
        { name: 'Keep', value: keep, fill: 'var(--g3)' },
        { name: 'Give to charity', value: give, fill: 'var(--au)' },
      ];
  return (
    <PieChart width={176} height={176} accessibilityLayer={false}>
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        innerRadius={58}
        outerRadius={84}
        startAngle={90}
        endAngle={-270}
        paddingAngle={!empty && give > 0 && keep > 0 ? 2 : 0}
        cornerRadius={4}
        stroke="none"
        animationDuration={450}
      >
        {data.map((d) => (
          <Cell key={d.name} fill={d.fill} />
        ))}
      </Pie>
    </PieChart>
  );
}
