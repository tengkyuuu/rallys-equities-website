import PageLink from '@/components/nav/PageLink';
import PolicyDocList from '@/components/policies/PolicyDocList';
import Eyebrow from '@/components/ui/Eyebrow';
import PageHero from '@/components/ui/PageHero';
import ServiceCard from '@/components/ui/ServiceCard';
import { ACCOUNT_OPENING_URL } from '@/lib/site';

export default function DownloadsPage() {
  return (
    <>
      <PageHero
        tag="Miscellaneous"
        title={
          <>
            Useful <em>Downloads</em>
          </>
        }
        lede="Easy access to important resources."
      />
      <section className="sec">
        <div style={{ marginTop: '8px' }} id="misc-downloads">
          <div className="svc-grid" style={{ marginTop: '32px' }}>
            <ServiceCard
              title="Account Opening"
              footer={
                <a className="svc-link" href={ACCOUNT_OPENING_URL} target="_blank" rel="noopener">
                  Open online →
                </a>
              }
            >
              Open your account online through the PSX eClear portal — no paperwork to download.
            </ServiceCard>
            <ServiceCard
              title="Compliance Policies"
              footer={
                <PageLink page="policies" className="svc-link">
                  View Policies &amp; Procedures →
                </PageLink>
              }
            >
              All 11 of our published policies can be read below, and on the Policies &amp; Procedures page.
            </ServiceCard>
            <ServiceCard
              title="Regulator Resources"
              footer={
                <PageLink page="links" className="svc-link">
                  View useful links →
                </PageLink>
              }
            >
              PSX, SECP, CDC and NCCPL portals, plus investor education material.
            </ServiceCard>
          </div>
          {/* POLICY DOCUMENTS — the real files. Deliberately excludes assets/docs/*, which are still ~1 KB placeholders; publishing those as if genuine would be worse than omitting them until the signed originals arrive. */}
          <div style={{ marginTop: '56px' }} id="misc-policy-downloads">
            <Eyebrow style={{ marginBottom: '6px' }}>Policy Documents</Eyebrow>
            <p className="sub" style={{ margin: '0 0 4px' }}>
              Every policy governing how we operate — select one to read it here on the page.
            </p>
            <PolicyDocList variant="compact" rekey="downloads.policies" style={{ maxWidth: '820px' }} />
            <p className="sub" style={{ marginTop: '16px', fontSize: '12px' }}>
              Shown for viewing only. Need a copy for your records, or a text-readable version? Email{' '}
              <strong style={{ color: 'var(--g3)' }}>hello@rallysequities.com</strong>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
