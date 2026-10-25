import Eyebrow from '@/components/ui/Eyebrow';
import LinkChips, { type LinkChip } from '@/components/ui/LinkChips';
import PageHero from '@/components/ui/PageHero';
import { ACCOUNT_OPENING_URL } from '@/lib/site';

const REGULATORS: LinkChip[] = [
  { href: 'https://www.psx.com.pk/', label: 'Pakistan Stock Exchange (PSX)' },
  { href: 'https://www.secp.gov.pk/', label: 'Securities & Exchange Commission of Pakistan (SECP)' },
  { href: 'https://www.cdcpakistan.com/', label: 'Central Depository Company (CDC)' },
  { href: 'https://www.nccpl.com.pk/', label: 'National Clearing Company (NCCPL)' },
  { href: 'https://www.sbp.org.pk/', label: 'State Bank of Pakistan' },
  { href: ACCOUNT_OPENING_URL, label: 'eClear Account Opening Portal' },
];

const INVESTOR_SERVICES: LinkChip[] = [
  { href: 'http://cdcpakistan.com/about-us/cdc-access/', label: 'CDC Access Details' },
  { href: 'https://www.cdcaccess.com.pk/', label: 'CDC Investor Account Services' },
  { href: 'https://cdcpakistan.com/about-us/cdc-access/sms/', label: 'CDC SMS Services Details' },
  { href: 'https://cdcpakistan.com/about-us/cdc-access/cdc-access-ivr/', label: 'CDC IVR Services Details' },
  { href: 'https://www.psx.com.pk/psx/resources-and-tools/investors/investors-complaints', label: 'PSX Online Complaint Portal' },
  { href: 'https://sdms.secp.gov.pk/', label: 'SECP Online Complaint Portal' },
  { href: 'https://www.nccpl.com.pk/en/products-services/uin-information-system-uis', label: 'NCCPL UIS Service' },
];

export default function LinksPage() {
  return (
    <>
      <PageHero
        tag="Miscellaneous"
        title={
          <>
            Useful <em>Links</em>
          </>
        }
        lede="Regulators and market bodies every PSX investor should know."
      />
      <section className="sec">
        <div style={{ marginTop: '8px' }} id="misc-links">
          <Eyebrow style={{ marginBottom: '14px' }}>Regulators &amp; Market Bodies</Eyebrow>
          <LinkChips items={REGULATORS} style={{ maxWidth: '820px' }} />
          <Eyebrow style={{ margin: '32px 0 14px' }}>Investor Services &amp; Complaint Portals</Eyebrow>
          <LinkChips items={INVESTOR_SERVICES} style={{ maxWidth: '820px' }} />
        </div>
      </section>
    </>
  );
}
