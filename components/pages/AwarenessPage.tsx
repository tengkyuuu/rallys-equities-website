import PageLink from '@/components/nav/PageLink';
import Callout from '@/components/ui/Callout';
import PageHero from '@/components/ui/PageHero';
import ServiceCard from '@/components/ui/ServiceCard';

const READ_GUIDE = (
  <>
    {' '}
    <PageLink page="education" className="svc-link">
      Read the guide →
    </PageLink>
  </>
);

export default function AwarenessPage() {
  return (
    <>
      <PageHero
        tag="Investor Relations"
        title={
          <>
            Investor Education &amp; <em>Awareness</em>
          </>
        }
        lede="Informed investors make better decisions — know your rights and how the market protects you."
      />
      <section className="sec">
        <div className="svc-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <ServiceCard
            icon={
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 3L22 7v6c0 5-4 8-9 10-5-2-9-5-9-10V7z" stroke="var(--g3)" strokeWidth="1.6" fill="none" />
                <path d="M9.5 13l2.5 2.5L17 10" stroke="var(--g3)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Investor Awareness Guide"
            footer={READ_GUIDE}
          >
            A practical guide to the fundamentals of trading on the PSX — how to open an account, how to verify and choose a licensed
            broker, how transactions and settlement work, the protections available to investors, and how to resolve complaints through the
            proper regulatory channels. Informed investors make better decisions; this guide is here to keep your investing secure and
            compliant.
          </ServiceCard>
          <ServiceCard
            icon={
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M5 3h11l5 5v15H5z" stroke="var(--g3)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
                <path d="M16 3v5h5" stroke="var(--g3)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
                <line x1="9" y1="13" x2="17" y2="13" stroke="var(--g3)" strokeWidth="1.3" />
                <line x1="9" y1="17" x2="17" y2="17" stroke="var(--g3)" strokeWidth="1.3" />
              </svg>
            }
            title="Shareholders' Rights Guide"
            footer={READ_GUIDE}
          >
            Issued under the <strong style={{ color: 'var(--au)' }}>Companies Act, 2017</strong>, this guide explains your entitlements as a
            shareholder — receiving dividends, exercising voting rights, attending general meetings, electing directors, and reviewing
            financial statements. Understanding these rights helps you influence corporate governance, raise concerns, and protect your
            interests through lawful engagement.
          </ServiceCard>
        </div>
        <Callout tone="green" style={{ marginTop: '30px', padding: '24px', maxWidth: '860px' }}>
          <p className="sub" style={{ maxWidth: 'none' }}>
            Together, these two resources cover both the <strong style={{ color: 'var(--g3)' }}>transactional</strong> side of investing
            (trading, broker protections) and the <strong style={{ color: 'var(--g3)' }}>ownership</strong> side (shareholder governance
            rights) — supporting investors at every stage of their journey on the Pakistan Stock Exchange.
          </p>
        </Callout>
      </section>
    </>
  );
}
