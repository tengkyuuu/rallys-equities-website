import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import SectionTitle from '@/components/ui/SectionTitle';

/** Value statements styled as quote cards. These are the firm's own claims, not customer testimonials. */
const VALUES = [
  {
    badge: 'Licensed & Regulated',
    quote:
      'Every account is SECP-licensed and PSX-regulated, with client assets held securely at CDC Pakistan under a valid TREC (No. 553).',
    urdu: 'مکمل ریگولیٹڈ اور محفوظ۔',
    name: 'Regulated & Secure',
    role: 'SECP · PSX · CDC',
  },
  {
    badge: 'Transparent & Fair',
    quote:
      'Competitive brokerage rates and clear, upfront pricing — no hidden charges, and every transaction handled with accuracy and accountability.',
    urdu: 'شفاف اور منصفانہ قیمتیں۔',
    name: 'Fair & Transparent',
    role: 'No hidden charges',
    highlight: true,
  },
  {
    badge: 'Expert Guidance',
    quote:
      '35+ years of combined market leadership with dedicated relationship managers — guidance for first-time and seasoned investors alike, in Urdu & English.',
    urdu: 'ماہرین کی رہنمائی، اردو و انگریزی میں۔',
    name: 'Expert Support',
    role: 'Urdu & English',
  },
];

/** Photo + pitch, then three value statements (not customer testimonials — none exist yet). */
export default function WhyChooseUs() {
  return (
    <section className="sec">
      <div style={{ textAlign: 'center' }}>
        <SectionTitle tag="Why Choose Us">
          Trusted Across <em>Pakistan</em>
        </SectionTitle>
      </div>
      <div className="why-row">
        <div className="imgwrap float-bob rv rv-l">
          <img
            src="/assets/img/why-choose-us.jpg"
            alt="Investment analysis at Rallys Equities"
            loading="lazy"
            width="330"
            height="443"
            data-edit-img="home.why.photo"
          />
        </div>
        <div className="rv rv-r">
          <h3 className="sh" style={{ fontSize: '28px', marginBottom: '10px' }}>
            Why Investors <em>Choose</em> Rallys Equities
          </h3>
          <p className="sub" style={{ maxWidth: 'none' }}>
            Licensed and regulated by SECP &amp; PSX, we combine 35+ years of combined market leadership with modern trading technology.
            Competitive brokerage rates, transparent pricing, dedicated relationship managers, and Shariah-compliant investing — every
            transaction handled with accuracy and accountability.
          </p>
          <div style={{ marginTop: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <OpenAccount as="button" className="bbig bbig-g">
              Open Your Account
            </OpenAccount>
            <GoTo as="button" page="about" className="bbig bbig-o">
              About Us
            </GoTo>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <SectionTitle tag="Why Investors Choose Us">
          Built on <em>Trust &amp; Transparency</em>
        </SectionTitle>
      </div>
      <div className="testi-grid">
        {VALUES.map((v, i) => (
          <div
            className="testi"
            key={v.name}
            style={v.highlight ? { borderColor: 'color-mix(in srgb, var(--au) 35%, transparent)' } : undefined}
          >
            <div className="testi-stars">{`✦ ${v.badge}`}</div>
            <div className="testi-q">{`"${v.quote}"`}</div>
            <div className="testi-qu">{`"${v.urdu}"`}</div>
            <div className="testi-auth">
              <div className="testi-av">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="testi-name">{v.name}</div>
                <div className="testi-role">{v.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
