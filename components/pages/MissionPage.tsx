import OpenAccount from '@/components/actions/OpenAccount';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';
import ServiceCard from '@/components/ui/ServiceCard';

const STATEMENT_STYLE = {
  card: { padding: '36px 30px', textAlign: 'center' },
  icon: { margin: '0 auto 18px', width: '58px', height: '58px' },
  title: { fontFamily: "var(--font-display,'Cormorant Garamond',serif)", fontSize: '26px', color: 'var(--au)' },
  desc: { fontSize: '13px', lineHeight: '1.85' },
} as const;

const STATEMENTS = [
  {
    title: 'Our Mission',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="11" stroke="var(--g3)" strokeWidth="1.8" />
        <circle cx="15" cy="15" r="6" stroke="var(--g3)" strokeWidth="1.5" />
        <circle cx="15" cy="15" r="2.2" fill="var(--au)" />
      </svg>
    ),
    text: 'At Rallys Equities, we strive to make investing transparent, efficient, and inclusive—helping individuals, institutions, and corporates make informed financial decisions and achieve sustainable long-term growth.',
  },
  {
    title: 'Our Vision',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path
          d="M3 15C3 15 8 7 15 7C22 7 27 15 27 15C27 15 22 23 15 23C8 23 3 15 3 15Z"
          stroke="var(--g3)"
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="15" r="4" stroke="var(--au)" strokeWidth="1.7" />
      </svg>
    ),
    text: "To be recognized as Pakistan's most trusted and innovative brokerage firm, setting the benchmark for integrity, client service, and technology-driven investment solutions. Our vision is to lead transformation in the PSX ecosystem by combining global best practices with deep local expertise, creating a more empowered and confident investor community.",
  },
];

const COMPANY_DETAILS = [
  ['Company Name', 'Rallys Equities (Pvt) Ltd'],
  ['Company Registration Number', 'G686666'],
  ['TREC No (Trading Right Entitlement Certificate)', '553'],
  ['National Tax Number (NTN)', 'G686666-2'],
  ['Official Email', 'hello@rallysequities.com'],
  ['Registered Office Address', 'Office # 408, 4th Floor, Lahore Stock Exchange Building, Khayaban-e-Aiwan-e-Iqbal, Lahore, Pakistan'],
];

const PUBLIC_RECORDS = [
  {
    title: 'Trading Right Entitlement (TRE) Certificate',
    text: "Official TRE Certificate confirming Rallys Equities' right to trade on the Pakistan Stock Exchange.",
    href: '/assets/docs/tre-certificate.pdf',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="3" width="18" height="20" rx="2" stroke="var(--g3)" strokeWidth="1.7" />
        <line x1="8" y1="9" x2="18" y2="9" stroke="var(--g3)" strokeWidth="1.3" />
        <line x1="8" y1="13" x2="18" y2="13" stroke="var(--g3)" strokeWidth="1.3" />
        <line x1="8" y1="17" x2="14" y2="17" stroke="var(--g3)" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    title: 'Admission Notice — TRE Certificate Holder',
    text: 'PSX admission notice recognizing Rallys Equities (Pvt) Ltd as a TRE Certificate Holder.',
    href: '/assets/docs/admission-notice.pdf',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 3L21 7L21 14Q21 20 13 23Q5 20 5 14L5 7Z" stroke="var(--g3)" strokeWidth="1.7" fill="none" />
        <path d="M9.5 13L12 15.5L17 9.5" stroke="var(--g3)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Office Opening Notice',
    text: 'Official notice of the opening of the Rallys Equities (Private) Limited office at the Lahore Stock Exchange Building.',
    href: '/assets/docs/office-opening-notice.pdf',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M4 22L4 10L13 4L22 10L22 22" stroke="var(--g3)" strokeWidth="1.7" fill="none" strokeLinejoin="round" />
        <rect x="10" y="15" width="6" height="7" stroke="var(--g3)" strokeWidth="1.4" />
      </svg>
    ),
  },
];

const HIGHLIGHTS = [
  'Licensed & Regulated by SECP & PSX',
  'Trusted by Investors Across Pakistan',
  'Competitive Brokerage Rates',
  'Advanced Trading Platforms (Mobile & Web)',
  'Dedicated Relationship Managers & Market Experts',
  'Shariah Compliant Investing',
];

export default function MissionPage() {
  return (
    <>
      <PageHero
        tag="About Us"
        title={
          <>
            Our Mission &amp; <em>Vision</em>
          </>
        }
        lede="Building success through trust, transparency, and disciplined execution on the Pakistan Stock Exchange."
      />
      <section className="sec">
        <div style={{ textAlign: 'center' }}>
          <SectionTitle tag="Statements">
            Guiding Principles of <em>Rallys Equities</em>
          </SectionTitle>
        </div>
        <div className="svc-grid" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: '1000px', margin: '44px auto 0' }}>
          {STATEMENTS.map((s) => (
            <ServiceCard
              key={s.title}
              style={STATEMENT_STYLE.card}
              icon={s.icon}
              iconStyle={STATEMENT_STYLE.icon}
              title={s.title}
              titleStyle={STATEMENT_STYLE.title}
              descStyle={STATEMENT_STYLE.desc}
            >
              {s.text}
            </ServiceCard>
          ))}
        </div>
        {/* ABOUT RALLYS EQUITIES — COMPANY DETAILS */}
        <div style={{ marginTop: '64px' }} id="company-details">
          <SectionTitle tag="About Rallys Equities" as="h3" size={34}>
            Official Company <em>Details</em>
          </SectionTitle>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '28px', maxWidth: '820px' }}
            className="pol-grid"
          >
            {COMPANY_DETAILS.map(([label, value]) => (
              <div className="pol-chip" key={label}>
                <span className="pn">▣</span>
                <span>
                  <strong style={{ color: 'var(--au)' }}>{label}</strong>
                  <br />
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* PUBLIC RECORDS — PSX REGULATORY STATUS */}
        <div style={{ marginTop: '56px' }} id="public-records">
          <SectionTitle tag="Public Records" as="h3" size={34}>
            Regulatory Status — <em>Pakistan Stock Exchange</em>
          </SectionTitle>
          <p className="sub" style={{ marginTop: '8px' }}>
            Rallys Equities (Pvt) Ltd is a TREC holder of the Pakistan Stock Exchange — Certificate No. 553. Official records are published
            by PSX.
          </p>
          <div className="svc-grid" style={{ marginTop: '32px' }}>
            {PUBLIC_RECORDS.map((r) => (
              <ServiceCard
                key={r.href}
                icon={r.icon}
                title={r.title}
                footer={
                  <a className="svc-link" href={r.href} target="_blank" rel="noopener">
                    View official PDF →
                  </a>
                }
              >
                {r.text}
              </ServiceCard>
            ))}
          </div>
        </div>
        {/* KEY HIGHLIGHTS */}
        <div style={{ marginTop: '56px' }}>
          <SectionTitle tag="Key Highlights" as="h3" size={34}>
            Reasons For <em>Choosing Us</em>
          </SectionTitle>
          <div className="pol-grid" style={{ maxWidth: '900px', marginTop: '28px' }}>
            {HIGHLIGHTS.map((h, i) => (
              <div className="pol-chip" key={h}>
                <span className="pn">{String(i + 1).padStart(2, '0')}</span>
                {h}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <OpenAccount as="button" className="bbig bbig-g">
            Open Your Account
          </OpenAccount>
        </div>
      </section>
    </>
  );
}
