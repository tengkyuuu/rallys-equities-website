import type { ReactNode } from 'react';
const REGULATORS: { name: ReactNode; text: ReactNode; icon: ReactNode }[] = [
  {
    name: 'SECP Licensed',
    text: <>Securities &amp; Exchange Commission of Pakistan — apex financial regulator.</>,
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 3L30 8L30 20Q30 28 18 32Q6 28 6 20L6 8Z" fill="rgba(10,107,75,.2)" stroke="var(--g3)" strokeWidth="1.5" />
        <path d="M13 18L16 21L23 14" stroke="var(--up)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'PSX TREC Holder',
    text: 'Trading Right Entitlement Certificate — direct market access on PSX.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="6" y="10" width="24" height="18" rx="3" fill="rgba(200,168,75,.15)" stroke="var(--au)" strokeWidth="1.5" />
        <path d="M12 10L12 7Q12 4 18 4Q24 4 24 7L24 10" stroke="var(--au)" strokeWidth="1.5" fill="none" />
        <line x1="12" y1="19" x2="24" y2="19" stroke="var(--au)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    name: 'CDC Registered',
    text: 'Client assets held at Central Depository Company of Pakistan.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="8" y="8" width="20" height="20" rx="3" fill="rgba(10,107,75,.2)" stroke="var(--g3)" strokeWidth="1.5" />
        <line x1="13" y1="14" x2="23" y2="14" stroke="var(--g3)" strokeWidth="1.3" />
        <line x1="13" y1="18" x2="23" y2="18" stroke="var(--g3)" strokeWidth="1.3" />
        <line x1="13" y1="22" x2="18" y2="22" stroke="var(--g3)" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    name: 'Investor Protection',
    text: 'PSX Investor Protection Fund covers all client accounts.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="13" fill="rgba(46,204,138,.1)" stroke="var(--up)" strokeWidth="1.5" />
        <path d="M13 18L16 21L23 14" stroke="var(--up)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];
import SectionTitle from '@/components/ui/SectionTitle';

/** Regulator logos; `delay` staggers the reveal animation. */
const LOGOS = [
  { src: '/assets/img/stocks/brand-02.png', alt: 'SECP', label: 'SECP', height: '111', delay: '.0s' },
  { src: '/assets/img/psx-logo.png', alt: 'Pakistan Stock Exchange', label: 'PSX', height: '117', delay: '.08s' },
  { src: '/assets/img/stocks/brand-04.png', alt: 'CDC', label: 'CDC Pakistan', height: '83', delay: '.16s' },
  { src: '/assets/img/stocks/brand-06.png', alt: 'NCCPL', label: 'NCCPL', height: '90', delay: '.24s' },
];

/** Regulator cards and the regulator logo strip. */
export default function Regulatory() {
  return (
    <>
      <section className="sec sec-alt">
        <div style={{ textAlign: 'center' }}>
          <SectionTitle tag="Regulatory Compliance">
            Fully <em>Regulated</em> &amp; <span>Secured</span>
          </SectionTitle>
          <p className="sub" style={{ margin: '0 auto', textAlign: 'center' }}>
            Every rupee you invest is protected by Pakistan's strongest regulatory framework.
          </p>
        </div>
        <div className="reg-grid">
          {REGULATORS.map((r, i) => (
            <div className="reg-card" key={i}>
              {r.icon}
              <div className="reg-name">{r.name}</div>
              <div className="reg-desc">{r.text}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="reg-strip">
        {LOGOS.map((l) => (
          <div className="reg-strip-item brand-chip rv" style={{ '--rvd': l.delay }} key={l.label}>
            <img src={l.src} alt={l.alt} loading="lazy" width="100" height={l.height} />
            <span className="rst">{l.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
