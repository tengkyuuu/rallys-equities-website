import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import CtaBlock from '@/components/ui/CtaBlock';
import SectionTitle from '@/components/ui/SectionTitle';

const FACTS = [
  { value: '2025', label: 'Established', color: 'var(--au)' },
  { value: '35+', label: 'Yrs Combined Experience', color: 'var(--g3)' },
  { value: '7', label: 'Core Services', color: 'var(--au)' },
];

export default function AboutPage() {
  return (
    <>
      <section className="sec">
        <SectionTitle tag="Our Story — Mission & Vision" tagProps={{ id: 'mission' }} as="h1">
          Trust, Transparency &amp;
          <br />
          <em>Disciplined Execution</em>
        </SectionTitle>{' '}
        <span className="urdu" lang="ur">اعتماد، شفافیت اور منظم عملدرآمد — ہمارے بنیادی اصول</span>{' '}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', marginTop: '48px', alignItems: 'center' }}>
          <div>
            <p className="sub" style={{ marginBottom: '18px' }}>
              <strong style={{ color: 'var(--au)' }}>Our Mission:</strong> At Rallys Equities, we strive to make investing transparent,
              efficient, and inclusive — helping individuals, institutions, and corporates make informed financial decisions and achieve
              sustainable long-term growth.
            </p>
            <p className="sub" style={{ marginBottom: '18px' }}>
              <strong style={{ color: 'var(--au)' }}>Our Vision:</strong> To be recognized as Pakistan's most trusted and innovative
              brokerage firm, setting the benchmark for integrity, client service, and technology-driven investment solutions. Our vision is
              to lead transformation in the Pakistan Stock Exchange (PSX) ecosystem by combining global best practices with deep local
              expertise, creating a more empowered and confident investor community.
            </p>
            <p className="sub">
              Established in 2025 and operating from the Lahore Stock Exchange Building, Rallys Equities holds TREC No. 553 and blends
              legacy market expertise with modern brokerage standards — backed by 35+ combined years of market experience in its leadership
              team.
            </p>
            <div style={{ display: 'flex', gap: '32px', marginTop: '32px' }}>
              {FACTS.map((f) => (
                <div key={f.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-display,'Cormorant Garamond',serif)",
                      fontSize: '40px',
                      fontWeight: '700',
                      color: f.color,
                    }}
                  >
                    {f.value}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{f.label}</div>
                </div>
              ))}
            </div>{' '}
            <GoTo as="button" page="account" className="bbig bbig-g" style={{ marginTop: '28px' }}>
              Join Our Family
            </GoTo>
          </div>
          <div style={{ background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: '18px', padding: '32px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--au)',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Our Core Values
            </div>
            <div className="about-vals">
              <div className="aval">
                <div className="aval-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 2L10 6H14L11 8.5L12 13L8 10.5L4 13L5 8.5L2 6H6Z"
                      stroke="var(--g3)"
                      strokeWidth="1.2"
                      fill="rgba(18,184,124,.2)"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Trust</h4>
                  <p>Consistent governance and investor confidence drive everything we do.</p>
                </div>
              </div>
              <div
                className="aval"
                style={{
                  background: 'color-mix(in srgb, var(--au) 5%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--au) 15%, transparent)',
                }}
              >
                <div className="aval-icon" style={{ background: 'color-mix(in srgb, var(--au) 15%, transparent)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="6" r="3" stroke="var(--au)" strokeWidth="1.3" />
                    <path d="M2 14C2 11 5 9 8 9C11 9 14 11 14 14" stroke="var(--au)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h4>Transparency</h4>
                  <p>Clarity and compliance in all client interactions — client-first, always.</p>
                </div>
              </div>
              <div className="aval">
                <div className="aval-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2 L10 5H14L11 7.5L12 11L8 9L4 11L5 7.5L2 5H6Z" stroke="var(--g3)" strokeWidth="1.2" fill="none" />
                  </svg>
                </div>
                <div>
                  <h4>Disciplined Execution</h4>
                  <p>Accuracy and accountability in every transaction we handle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="sec sec-alt">
        <SectionTitle tag="Who We Are">
          A Brokerage Built on <em>Experience</em> &amp; <span>Integrity</span>
        </SectionTitle>
        <div style={{ maxWidth: '860px', marginTop: '22px' }}>
          <p className="sub" style={{ maxWidth: 'none', marginBottom: '16px' }}>
            Rallys Equities (Pvt) Ltd is a licensed brokerage firm operating on the Pakistan Stock Exchange (PSX), founded in 2025 by a
            father-and-son leadership team with more than 35 years of combined experience. The company holds a valid Trading Right
            Entitlement Certificate (TREC No. 553), authorizing it to provide brokerage services in full compliance with PSX and SECP
            regulations. From its inception, Rallys Equities has focused on building a robust operational framework supported by secure
            settlement and custody mechanisms, strong internal controls, and a client-first service philosophy.
          </p>
          <p className="sub" style={{ maxWidth: 'none', marginBottom: '16px' }}>
            Our services are designed to support a diverse client base — including individual investors, corporates, and institutions —
            through structured access to equities, funds, fixed-income instruments, and Shariah-compliant investment solutions.
          </p>
          <p className="sub" style={{ maxWidth: 'none' }}>
            With transparent reporting, reliable trade execution, and dedicated client support, Rallys Equities ensures that every
            transaction is handled with accuracy and accountability. We believe long-term success in the capital markets is built on
            consistency, governance, and investor confidence — principles that continue to guide our growth and relationships.
          </p>
        </div>
      </section>
      <CtaBlock
        title={
          <>
            Join the Rallys <em>Family</em>
          </>
        }
        text="Open your account today and become part of Pakistan's growing investor community."
        actions={
          <>
            <OpenAccount as="button" className="bbig bbig-g">
              Open Your Account
            </OpenAccount>
            <GoTo as="button" page="locations" className="bbig bbig-o">
              Visit Us
            </GoTo>
          </>
        }
      />
    </>
  );
}
