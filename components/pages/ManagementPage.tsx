import Callout from '@/components/ui/Callout';
import PageHero from '@/components/ui/PageHero';

/** Leadership team. `photo` is the editor key the client uses to swap in a real portrait. */
const LEADERS = [
  {
    name: 'Muhammad Fayyaz',
    role: 'Chief Executive Officer (CEO)',
    alt: 'Portrait of Muhammad Fayyaz, Chief Executive Officer',
    photo: 'management.photo.ceo',
    highlight: true,
    bio: "With over 35 years of experience across the Pakistan Stock Exchange and Mercantile Exchange, Muhammad Fayyaz brings deep market knowledge and seasoned leadership to Rallys Equities. His extensive understanding of trading structures, regulatory frameworks, and investor behavior has been instrumental in establishing the firm's credibility and long-term vision. Under his leadership, the company continues to uphold the core values of trust, transparency, and disciplined performance in Pakistan's capital markets.",
  },
  {
    name: 'Hasham Fayyaz',
    role: 'Chief Operating Officer (COO)',
    alt: 'Portrait of Hasham Fayyaz, Chief Operating Officer',
    photo: 'management.photo.coo',
    bio: 'Hasham Fayyaz represents the next generation of brokerage leadership, combining a strong academic foundation in Finance and Data Analytics with an entrepreneurial mindset. He focuses on operational efficiency, client experience, and the adoption of technology-driven processes that enhance how investors interact with the PSX. His analytical approach and forward-looking vision play a key role in aligning traditional market expertise with modern brokerage practices at Rallys Equities.',
  },
  {
    name: 'Tayyab Kaleem Khan',
    role: 'Chief Compliance Officer (CCO)',
    alt: 'Portrait of Tayyab Kaleem Khan, Chief Compliance Officer',
    photo: 'management.photo.cco',
    bio: 'Tayyab Kaleem Khan is a seasoned professional with extensive experience in corporate governance, executive leadership, and operational management. Serving as a Director across multiple private limited companies, he brings strong board-level insight into regulatory oversight, accountability, and sustainable business practices. His ability to balance strategic governance with hands-on operational understanding ensures that Rallys Equities consistently maintains robust compliance standards and regulatory discipline.',
  },
];

export default function ManagementPage() {
  return (
    <>
      <PageHero
        tag="About Us"
        title={
          <>
            Our <em>Management</em>
          </>
        }
        lede="Decades of market experience, modern financial expertise, and strong governance."
      />
      <section className="sec">
        {/* LEADERSHIP */}
        <div style={{ marginTop: '8px', textAlign: 'center' }} id="leadership">
          <p className="sub" style={{ margin: '14px auto 0', textAlign: 'center' }}>
            At Rallys Equities, our leadership team combines decades of market experience with modern financial expertise and strong
            governance. Each member of our management brings a distinct strength, ensuring strategic direction, operational excellence, and
            strict regulatory compliance across the organization.
          </p>
        </div>
        <div className="testi-grid">
          {LEADERS.map((l) => (
            <div
              className="testi"
              key={l.name}
              style={l.highlight ? { borderColor: 'color-mix(in srgb, var(--au) 35%, transparent)' } : undefined}
            >
              <div className="lead-photo">
                <img src="/assets/img/team-placeholder.png" alt={l.alt} loading="lazy" data-edit-img={l.photo} />
              </div>
              <div className="testi-auth" style={{ marginBottom: '14px' }}>
                <div>
                  <div className="testi-name">{l.name}</div>
                  <div className="testi-role">{l.role}</div>
                </div>
              </div>
              <div className="testi-q">{l.bio}</div>
            </div>
          ))}
        </div>
        {/* LEADERSHIP PHILOSOPHY */}
        <Callout style={{ marginTop: '36px', padding: '28px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "var(--font-display,'Cormorant Garamond',serif)",
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--au)',
              marginBottom: '10px',
            }}
          >
            Leadership Philosophy
          </div>
          <p className="sub" style={{ maxWidth: '760px', margin: '0 auto' }}>
            The management of Rallys Equities is guided by a shared commitment to integrity, accountability, and investor protection. By
            combining legacy market experience with modern operational thinking and strong compliance culture, the leadership team ensures
            that the firm remains resilient, transparent, and aligned with the highest standards of Pakistan's capital markets.
          </p>
        </Callout>
      </section>
    </>
  );
}
