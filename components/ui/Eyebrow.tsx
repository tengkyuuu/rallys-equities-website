import type { CSSProperties, ReactNode } from 'react';

/** Small gold uppercase label above a list or block ("Policy Documents", "Key Features"…). */
export default function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: '12px',
        fontWeight: '700',
        color: 'var(--au)',
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
