import Callout from '@/components/ui/Callout';
import Eyebrow from '@/components/ui/Eyebrow';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';

export default function FinancialPage() {
  return (
    <>
      <PageHero
        tag="Investor Relations"
        title={
          <>
            Financial <em>Highlights</em>
          </>
        }
        lede="Committed to transparency and timely financial disclosure."
      />
      <section className="sec">
        {/* Financial Highlights */}
        <div style={{ marginTop: '8px' }} id="ir-financial">
          <SectionTitle tag="Financial Highlights" as="h3" size={30}>
            Timely <em>Financial Disclosure</em>
          </SectionTitle>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '36px',
              alignItems: 'start',
              marginTop: '28px',
              maxWidth: '1080px',
            }}
          >
            <div className="imgwrap rv">
              <img
                src="/assets/img/bg-4-1.webp"
                alt="Financial highlights coming soon"
                loading="lazy"
                width="2000"
                height="1125"
                style={{ height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <Callout>
                <p className="sub" style={{ maxWidth: 'none', marginBottom: '12px' }}>
                  Rallys Equities (Pvt) Ltd is committed to transparency and timely financial disclosure.
                </p>
                <p className="sub" style={{ maxWidth: 'none' }}>
                  The quarterly financial report for 2026 will be published here once finalized and approved.
                </p>
              </Callout>
              {/* QUARTERLY REPORT 2026 — download slot; swap the placeholder for a linked chip when the PDF lands */}
              <div style={{ marginTop: '32px' }} id="ir-quarterly">
                <Eyebrow style={{ marginBottom: '14px' }}>Quarterly Report 2026</Eyebrow>
                <div className="pol-grid">
                  <div className="pol-chip" style={{ opacity: '.62', cursor: 'default' }}>
                    <span className="pn">Q1</span>
                    <span style={{ flex: '1' }}>Quarterly Report 2026 — Q1</span>
                    <span className="pdf-tag" style={{ color: 'var(--mt2)' }}>
                      AWAITING APPROVAL
                    </span>
                  </div>
                </div>
                <p className="sub" style={{ marginTop: '16px', fontSize: '12px' }}>
                  Download links appear here as each report is finalized and approved. For an earlier copy, email{' '}
                  <strong style={{ color: 'var(--g3)' }}>hello@rallysequities.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
