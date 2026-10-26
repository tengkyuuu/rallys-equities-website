import { Fragment, type ReactNode } from 'react';
const ARROW = (
  <svg width="38" height="18" viewBox="0 0 38 18" fill="none">
    <path d="M2 9L32 9M26 3L34 9L26 15" stroke="rgba(200,168,75,.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
import SectionTitle from '@/components/ui/SectionTitle';

const STEPS: { title: ReactNode; text: ReactNode; icon: ReactNode }[] = [
  {
    title: 'Create Account',
    text: 'Fill CNIC details online. Account approved in 24–48 hours by SECP-compliant process.',
    icon: (
      <svg viewBox="0 0 74 74" fill="none" width="74" height="74">
        <circle cx="37" cy="37" r="35" fill="rgba(10,107,75,.15)" stroke="rgba(18,184,124,.4)" strokeWidth="1.5" />
        <rect x="22" y="24" width="30" height="26" rx="3" fill="rgba(10,107,75,.2)" stroke="var(--g3)" strokeWidth="1.5" />
        <line x1="28" y1="32" x2="46" y2="32" stroke="var(--g3)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="28" y1="37" x2="46" y2="37" stroke="var(--g3)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="28" y1="42" x2="38" y2="42" stroke="var(--g3)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="52" cy="50" r="9" fill="var(--nv2)" stroke="var(--au)" strokeWidth="1.5" />
        <text x="52" y="54" textAnchor="middle" fill="var(--au)" fontSize="10" fontWeight="700" fontFamily="sans-serif">
          1
        </text>
      </svg>
    ),
  },
  {
    title: 'Fund Account',
    text: 'Deposit via HBL, UBL, Easypaisa, JazzCash or direct bank transfer. No minimum deposit.',
    icon: (
      <svg viewBox="0 0 74 74" fill="none" width="74" height="74">
        <circle cx="37" cy="37" r="35" fill="rgba(200,168,75,.1)" stroke="rgba(200,168,75,.4)" strokeWidth="1.5" />
        <rect x="24" y="26" width="26" height="18" rx="3" fill="rgba(200,168,75,.15)" stroke="var(--au)" strokeWidth="1.5" />
        <path d="M30 36L36 41L44 31" stroke="var(--au)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="52" r="9" fill="var(--nv2)" stroke="var(--au)" strokeWidth="1.5" />
        <text x="52" y="56" textAnchor="middle" fill="var(--au)" fontSize="10" fontWeight="700" fontFamily="sans-serif">
          2
        </text>
      </svg>
    ),
  },
  {
    title: 'Start Trading',
    text: "Search any PSX stock, tap Buy, and you're a Pakistani investor in the market!",
    icon: (
      <svg viewBox="0 0 74 74" fill="none" width="74" height="74">
        <circle cx="37" cy="37" r="35" fill="rgba(10,107,75,.15)" stroke="rgba(18,184,124,.4)" strokeWidth="1.5" />
        <polyline points="20,46 28,33 36,39 44,28 54,25" stroke="var(--g3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="54" cy="25" r="3.5" fill="var(--g3)" />
        <line x1="22" y1="50" x2="54" y2="50" stroke="rgba(18,184,124,.3)" strokeWidth="1" />
        <circle cx="52" cy="57" r="9" fill="var(--nv2)" stroke="var(--au)" strokeWidth="1.5" />
        <text x="52" y="61" textAnchor="middle" fill="var(--au)" fontSize="10" fontWeight="700" fontFamily="sans-serif">
          3
        </text>
      </svg>
    ),
  },
];

/** Three steps to start investing. */
export default function HowItWorks() {
  return (
    <div className="sec-alt" style={{ padding: '72px 52px' }}>
      <div style={{ textAlign: 'center' }}>
        <SectionTitle tag="How It Works" style={{ marginBottom: '6px' }}>
          Start Investing in <em>3 Steps</em>
        </SectionTitle>
        <span className="urdu" lang="ur" style={{ textAlign: 'center', display: 'block' }}>
          صرف ۳ آسان قدموں میں سرمایہ کاری شروع کریں
        </span>
      </div>
      <div className="how-steps">
        {STEPS.map((st, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="how-arrow">{ARROW}</div>}
            <div className="how-step">
              <div className="how-icon">{st.icon}</div>
              <div className="how-title">{st.title}</div>
              <div className="how-desc">{st.text}</div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
