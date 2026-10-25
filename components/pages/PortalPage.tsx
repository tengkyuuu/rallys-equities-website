import LinkChips, { type LinkChip } from '@/components/ui/LinkChips';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';
import ServiceCard from '@/components/ui/ServiceCard';

/** Regulatory disclosures. Update these when the firm's status changes. */
const DISCLOSURES = [
  ['✓ Investor Grievances', 'At present, no investor grievances have been reported against Rallys Equities (Pvt) Ltd.'],
  [
    '✓ Pending Investor Complaints',
    'There are no pending investor complaints against the brokerage firm with the Pakistan Stock Exchange or any regulatory authority.',
  ],
  [
    '✓ Regulatory Actions Disclosure',
    'As of date, no penal action has been taken against Rallys Equities (Pvt) Ltd by the Securities and Exchange Commission of Pakistan or the Pakistan Stock Exchange.',
  ],
];

const LODGEMENT: LinkChip[] = [
  { href: 'https://xs.secp.gov.pk/', label: 'SECP — Complaints & Queries Portal (SECP-XS)' },
  { href: 'http://www.csir.psx.com.pk/?type=2', label: 'PSX — Online Complaint Portal (CSIR)' },
  {
    href: 'https://www.psx.com.pk/psx/resources-and-tools/investors/investors-complaints',
    label: 'PSX — Investor Complaints (forms & procedure)',
  },
  { href: 'mailto:investor.complaints@psx.com.pk', label: 'PSX — investor.complaints@psx.com.pk', icon: '✉' },
];

export default function PortalPage() {
  return (
    <>
      <PageHero
        tag="Investor Relations"
        title={
          <>
            Investor <em>Portal</em>
          </>
        }
        lede="Designed to promote transparency, investor protection, and open communication."
      />
      <section className="sec">
        {/* Investor Portal */}
        <div style={{ marginTop: '8px' }} id="ir-portal">
          <SectionTitle tag="Investor Portal" as="h3" size={30}>
            Grievances &amp; <em>Regulatory Reporting</em>
          </SectionTitle>
          <p className="sub" style={{ marginTop: '8px' }}>
            Our Investor Portal is designed to promote transparency, investor protection, and open communication — a centralized location
            for information regarding grievances, regulatory reporting, and complaint channels.
          </p>
          <div className="disc-grid" data-rekey="portal.disclosures">
            {DISCLOSURES.map(([title, text]) => (
              <ServiceCard key={title} title={title} titleStyle={{ color: 'var(--g3)' }}>
                {text}
              </ServiceCard>
            ))}
            <ServiceCard title="Investor Complaints Contact" titleStyle={{ color: 'var(--au)' }}>
              Investors may contact the designated address below for any concerns, complaints, or feedback related to our services:
              <br />
              <br />
              <a href="mailto:hello@rallysequities.com" style={{ color: 'var(--g3)', fontWeight: '700', textDecoration: 'none' }}>
                hello@rallysequities.com
              </a>
              <br />
              <br />
              All investor communications are reviewed seriously and addressed in a timely and transparent manner.
            </ServiceCard>
          </div>
        </div>
        {/* ONLINE COMPLAINT LODGEMENT — regulator escalation routes */}
        <div style={{ marginTop: '56px' }} id="ir-lodgement">
          <SectionTitle tag="Escalation" as="h3" size={30}>
            Online Complaint <em>Lodgement</em>
          </SectionTitle>
          <p className="sub" style={{ marginTop: '8px' }}>
            If you are not satisfied with the resolution provided by the brokerage firm, a complaint may be lodged directly with the
            regulators for independent review.
          </p>
          <LinkChips items={LODGEMENT} style={{ maxWidth: '820px' }} rekey="portal.lodgement" wrapLabel />
          <p className="sub" style={{ marginTop: '16px', fontSize: '12px' }}>
            If the PSX complaint portal is unreachable, use the PSX Investor Complaints page or the email address above — both are official
            routes to the Regulatory Affairs Division.
          </p>
        </div>
      </section>
    </>
  );
}
