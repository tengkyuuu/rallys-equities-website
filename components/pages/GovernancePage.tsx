import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';
import ServiceCard from '@/components/ui/ServiceCard';

const SHAREHOLDERS = [
  { name: 'Hasham Fayyaz', role: 'Chief Operating Officer', pct: '89%', color: 'var(--g3)' },
  { name: 'Muhammad Fayyaz', role: 'Chief Executive Officer', pct: '10%', color: 'var(--au)' },
  { name: 'Tayyab Kaleem Khan', role: 'Chief Compliance Officer', pct: '1%', color: 'var(--tx)' },
];

const GOLD_TITLE = { color: 'var(--au)' };

export default function GovernancePage() {
  return (
    <>
      <PageHero
        tag="About Us"
        title={
          <>
            Corporate <em>Governance</em>
          </>
        }
        lede="Transparent leadership, clear ownership, and independent oversight."
      />
      <section className="sec">
        {/* CORPORATE GOVERNANCE */}
        <div style={{ marginTop: '8px' }} id="governance">
          <SectionTitle tag="Corporate Governance" as="h3" size={34}>
            Transparent Leadership,
            <br />
            <em>Independent Oversight</em>
          </SectionTitle>
          <p className="sub" style={{ marginTop: '8px' }}>
            At Rallys Equities (Pvt) Ltd, strong corporate governance is central to how we operate — transparent leadership, clear
            ownership, and independent oversight build stakeholder trust.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '36px' }} className="svc-grid">
            <ServiceCard title="Board of Directors" titleStyle={GOLD_TITLE}>
              Three directors guide the company — Muhammad Fayyaz, Hasham Fayyaz, and Tayyab Kaleem Khan — providing strategic direction and
              oversight in line with regulatory requirements and ethical standards.
            </ServiceCard>
            <ServiceCard title="Shareholding Structure" titleStyle={GOLD_TITLE}>
              Hasham Fayyaz — 89% · Muhammad Fayyaz — 10% · Tayyab Kaleem Khan — 1%.
              <br />
              <br />
              This structure aligns management and shareholders on long-term company growth.
            </ServiceCard>
            <ServiceCard title="External Auditors" titleStyle={GOLD_TITLE}>
              Independent external auditors ensure transparency, accuracy, and compliance in financial reporting.
              <br />
              <br />
              <strong style={{ color: 'var(--tx)' }}>Javaid Jalal Amjad &amp; Company</strong>
              <br />
              384 N Samanabad, Ravi Town, Lahore, Punjab.
            </ServiceCard>
          </div>
          <div className="gov-donut rv">
            <svg
              className="donut"
              viewBox="0 0 180 180"
              role="img"
              aria-label="Shareholding pattern: Hasham Fayyaz 89%, Muhammad Fayyaz 10%, Tayyab Kaleem Khan 1%"
            >
              <circle r="70" cx="90" cy="90" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="22" />
              <circle
                className="d-seg"
                r="70"
                cx="90"
                cy="90"
                fill="none"
                stroke="var(--g3)"
                strokeWidth="22"
                style={{ '--seg': '391.4' }}
                transform="rotate(-90 90 90)"
              />
              <circle
                className="d-seg"
                r="70"
                cx="90"
                cy="90"
                fill="none"
                stroke="var(--au)"
                strokeWidth="22"
                style={{ '--seg': '44' }}
                transform="rotate(230.4 90 90)"
              />
              <circle
                className="d-seg"
                r="70"
                cx="90"
                cy="90"
                fill="none"
                stroke="var(--tx)"
                strokeWidth="22"
                style={{ '--seg': '4.4' }}
                transform="rotate(266.4 90 90)"
              />
              <text
                x="90"
                y="84"
                textAnchor="middle"
                fill="var(--tx)"
                fontSize="22"
                fontWeight="700"
                fontFamily="var(--font-display,'Cormorant Garamond',serif)"
              >
                100%
              </text>
              <text x="90" y="102" textAnchor="middle" fill="rgba(246,242,234,.5)" fontSize="9" letterSpacing="1.5">
                PROMOTER OWNED
              </text>
            </svg>{' '}
            <div>
              <div
                className="svc-title"
                style={{
                  color: 'var(--au)',
                  fontFamily: "var(--font-display,'Cormorant Garamond',serif)",
                  fontSize: '24px',
                  marginBottom: '6px',
                }}
              >
                Shareholding Pattern
              </div>
              <p className="sub" style={{ maxWidth: 'none', fontSize: '12.5px', marginBottom: '18px' }}>
                Strong promoter ownership aligns management and shareholders, reinforcing long-term commitment to the firm's growth and
                stability.
              </p>
              <div className="dleg">
                {SHAREHOLDERS.map((h) => (
                  <div className="dleg-row" key={h.name}>
                    <span className="dleg-dot" style={{ background: h.color }} />
                    {`${h.name} — ${h.role}`}
                    <span className="dleg-pct">{h.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
