import type { ReactNode } from 'react';
const FEATURES: { title: ReactNode; text: ReactNode; icon: ReactNode }[] = [
  {
    title: <>Licensed &amp; Regulated</>,
    text: <>Fully licensed and regulated by SECP &amp; PSX</>,
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="rgba(10,107,75,.15)" stroke="rgba(18,184,124,.3)" strokeWidth="1" />
        <polyline
          points="16,44 24,32 30,36 40,24 48,18"
          stroke="var(--g3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="48" cy="18" r="3" fill="var(--g3)" />
      </svg>
    ),
  },
  {
    title: 'Advanced Trading Platforms',
    text: <>Secure PSX online trading on mobile &amp; web</>,
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="rgba(200,168,75,.1)" stroke="rgba(200,168,75,.3)" strokeWidth="1" />
        <line x1="18" y1="22" x2="18" y2="48" stroke="var(--up)" strokeWidth="1" />
        <rect x="14" y="30" width="8" height="18" fill="var(--up)" rx="1" />
        <line x1="28" y1="18" x2="28" y2="48" stroke="var(--dn)" strokeWidth="1" />
        <rect x="24" y="28" width="8" height="20" fill="var(--dn)" rx="1" />
        <line x1="38" y1="14" x2="38" y2="48" stroke="var(--up)" strokeWidth="1" />
        <rect x="34" y="20" width="8" height="28" fill="var(--up)" rx="1" />
        <line x1="48" y1="10" x2="48" y2="48" stroke="var(--up)" strokeWidth="1" />
        <rect x="44" y="16" width="8" height="32" fill="var(--up)" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Shariah Compliant Investing',
    text: <>Portfolios aligned to Shariah-compliant universes &amp; indices</>,
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="rgba(10,107,75,.12)" stroke="rgba(18,184,124,.3)" strokeWidth="1" />
        <rect x="18" y="38" width="28" height="14" fill="rgba(18,184,124,.25)" stroke="var(--g3)" strokeWidth="1" />
        <path d="M18 38Q18 26 32 24Q46 26 46 38" fill="rgba(18,184,124,.2)" stroke="var(--g3)" strokeWidth="1.2" />
        <rect x="28" y="42" width="8" height="10" fill="rgba(10,107,75,.3)" stroke="var(--g3)" strokeWidth="1" />
        <line x1="32" y1="24" x2="32" y2="18" stroke="var(--au)" strokeWidth="1.5" />
        <path d="M29 20Q32 16 35 20Q33 19 32 21Q31 19 29 20Z" fill="var(--au)" />
      </svg>
    ),
  },
  {
    title: 'Dedicated Experts',
    text: <>Relationship managers &amp; market experts at your side</>,
    icon: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="rgba(200,168,75,.1)" stroke="rgba(200,168,75,.3)" strokeWidth="1" />
        <path d="M32 14L46 20L46 34Q46 44 32 50Q18 44 18 34L18 20Z" fill="rgba(10,107,75,.2)" stroke="var(--g3)" strokeWidth="1.5" />
        <path d="M26 32L30 36L38 28" stroke="var(--up)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/** Four-up band of what sets Rallys apart, under the stats. */
export default function FeatureBand() {
  return (
    <div className="feat-band">
      {FEATURES.map((f, i) => (
        <div className="fc" key={i}>
          <div className="fi">{f.icon}</div>
          <div className="ft">{f.title}</div>
          <div className="fd">{f.text}</div>
        </div>
      ))}
    </div>
  );
}
