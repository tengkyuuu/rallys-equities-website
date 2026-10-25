import type { CSSProperties, ReactNode } from 'react';

const TONE = { gold: 'var(--au)', green: 'var(--g3)' } as const;

/** Tinted, rounded box for a short note or statement. */
export default function Callout({
  tone = 'gold',
  style,
  children,
}: {
  tone?: keyof typeof TONE;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const c = TONE[tone];
  return (
    <div
      style={{
        border: `1px solid color-mix(in srgb, ${c} 25%, transparent)`,
        borderRadius: '16px',
        padding: '26px',
        background: `color-mix(in srgb, ${c} 5%, transparent)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
