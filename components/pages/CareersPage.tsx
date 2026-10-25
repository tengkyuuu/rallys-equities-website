import CareerForm from '@/components/forms/CareerForm';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';
import ServiceCard from '@/components/ui/ServiceCard';

const REASONS = [
  ['Professional Growth', 'Access to continuous training and career development in capital markets.'],
  ['Innovative Environment', 'Exposure to modern trading platforms and data-driven investment strategies.'],
  ['Client-Centric Culture', 'Be part of a team that prioritizes transparency and investor success.'],
  ['Mentorship & Support', 'Guidance from experienced market professionals and senior brokers.'],
  ['Competitive Rewards', 'Attractive salary packages and performance-based incentives.'],
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        tag="Careers"
        title={
          <>
            Grow With Us in the <em>Pakistan Stock Exchange</em> <span>(PSX)</span>
          </>
        }
        lede="At Rallys Equities (Pvt) Ltd, we believe that our people are our greatest strength."
      />
      <section className="sec">
        <p className="sub" style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          As a trusted brokerage firm in the Pakistan Stock Exchange (PSX), we are committed to building a team of dedicated professionals
          who are passionate about financial markets, client success, and ethical trading practices. Joining us means becoming part of a
          dynamic, fast-growing brokerage that values integrity, innovation, and excellence. Whether you are an experienced stockbroker,
          research analyst, or fresh graduate eager to explore opportunities in the PSX, we offer a platform where your skills and ambitions
          can thrive.
        </p>
        <SectionTitle tag="Why Work With Us" tagProps={{ style: { marginTop: '40px' } }} size={32}>
          Reasons to <em>Join</em> Our Team
        </SectionTitle>
        <div className="svc-grid" style={{ marginTop: '24px' }}>
          {REASONS.map(([title, text]) => (
            <ServiceCard key={title} title={title}>
              {text}
            </ServiceCard>
          ))}
        </div>
        <div style={{ maxWidth: '720px', margin: '44px auto 0' }} id="careers-form">
          <SectionTitle tag="Apply Now" as="h3" size={28}>
            Submit Your <em>Application</em>
          </SectionTitle>
          <CareerForm />
        </div>
      </section>
    </>
  );
}
