import OpenAccount from '@/components/actions/OpenAccount';
import PolicyDocList from '@/components/policies/PolicyDocList';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';

export default function PoliciesPage() {
  return (
    <>
      <PageHero
        tag="Investor Relations"
        title={
          <>
            Policies and <em>Procedures</em>
          </>
        }
        lede="The compliance framework that governs how we operate."
      />
      <section className="sec">
        {/* Policies & Procedures */}
        <div style={{ marginTop: '8px' }} id="ir-policies">
          <SectionTitle tag="Policies and Procedures" as="h3" size={30}>
            Our Compliance <em>Framework</em>
          </SectionTitle>
          <p className="sub" style={{ marginTop: '8px' }}>
            Every policy below is published in full. Select any document to read it here on the page — these are provided for viewing only.
          </p>
          {/* rekey anchors the editable keys of everything inside to "policies.docgrid/…" so they stay stable if this list is reordered later (see getEditKey) */}
          <PolicyDocList variant="numbered" rekey="policies.docgrid" />
          <p className="sub" style={{ marginTop: '18px', fontSize: '12px' }}>
            These are scanned copies of the signed originals, shown for reading only. Need a copy for your records, or a
            screen-reader-friendly version? Email <strong style={{ color: 'var(--g3)' }}>hello@rallysequities.com</strong> and we'll send
            one.
          </p>
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <OpenAccount as="button" className="bbig bbig-g">
              Open Your Account
            </OpenAccount>
          </div>
        </div>
      </section>
    </>
  );
}
