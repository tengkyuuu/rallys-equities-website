import PageLink from '@/components/nav/PageLink';
import Eyebrow from '@/components/ui/Eyebrow';
import FeatureList from '@/components/ui/FeatureList';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';
import ServiceCard from '@/components/ui/ServiceCard';

const STEPS = [
  {
    title: 'Understand the Basics',
    text: 'The Pakistan Stock Exchange (PSX) is where shares of listed companies are bought and sold. Investors acquire ownership stakes and seek returns through appreciation and dividends.',
  },
  {
    title: 'Open a Trading Account',
    text: 'Complete the account forms, submit identity and income documentation, and obtain your platform credentials.',
  },
  {
    title: 'Learn How Trading Works',
    text: 'Our platforms enable real-time buying and selling, price monitoring, portfolio tracking, and access to research materials.',
  },
  {
    title: 'Start Small and Grow',
    text: 'We recommend beginners to start with small investments and gradually build their portfolios as they gain knowledge and confidence.',
  },
  {
    title: 'Stay Informed',
    text: 'Successful investing requires staying updated on PSX market trends, company performance, and financial news.',
  },
];

const STRATEGIES = [
  [
    '1. Long-Term Value Investing',
    'Focus on buying fundamentally strong companies listed on PSX and holding them for long-term growth — analyze fundamentals rather than reacting to market swings.',
  ],
  [
    '2. Dividend Investing',
    'Choose companies that provide consistent dividend payouts — stable firms that deliver recurring income to shareholders.',
  ],
  [
    '3. Growth Stock Investing',
    'Invest in emerging companies and high-growth sectors such as technology, banking, and energy — higher returns with greater volatility risk.',
  ],
  [
    '4. Diversification Strategy',
    'Spread your investments across different sectors, asset classes, and companies listed on PSX, so underperformance in one holding is offset by gains elsewhere.',
  ],
  [
    '5. Short-Term Trading',
    'Benefit from price fluctuations within days or weeks using technical analysis and market timing — demands considerable expertise.',
  ],
  [
    'Beginner Tips',
    'Diversify across sectors · Avoid emotional decisions · Invest within your means · Prioritize long-term growth · Consult licensed professionals.',
  ],
];

const WHY_THEY_WORK = [
  [
    'Adaptable for All Levels',
    'From first-time investors to seasoned traders, each strategy can be scaled to your experience and risk appetite.',
  ],
  ['Research-Backed', 'Grounded in fundamentals, company performance, and sector dynamics rather than speculation or hype.'],
  ['Goal-Aligned', 'Chosen to match your objectives — income, growth, or capital preservation — over your chosen time horizon.'],
  ['Risk-Managed', 'Diversification and discipline keep downside in check while you pursue long-term wealth growth.'],
];

const cards = (list: string[][]) =>
  list.map(([title, text]) => (
    <ServiceCard key={title} title={title}>
      {text}
    </ServiceCard>
  ));

export default function EducationPage() {
  return (
    <>
      <PageHero
        tag="Investor Relations"
        title={
          <>
            Investor <em>Education</em>
          </>
        }
        lede="Investor Education Guide for Smarter Investing."
      />
      <section className="sec">
        {/* Investor Education */}
        <div style={{ marginTop: '8px' }} id="ir-education">
          <SectionTitle tag="Investor Education" as="h3" size={30}>
            Your 5-Step Path to <em>PSX Success</em>
          </SectionTitle>
          <div className="imgwrap light rv" style={{ maxWidth: '860px', margin: '8px 0 30px' }}>
            <img
              src="/assets/img/5-step-path.webp"
              alt="Your 5-Step Path to PSX Success infographic"
              loading="lazy"
              width="1920"
              height="942"
            />
          </div>
          <FeatureList
            items={STEPS.map((s, i) => ({ icon: i + 1, ...s }))}
            style={{ maxWidth: '760px' }}
            iconStyle={{ fontSize: '11px', fontWeight: '700', color: 'var(--g3)' }}
          />
          <div style={{ marginTop: '36px' }} id="ir-strategies">
            <Eyebrow style={{ marginBottom: '14px' }}>Top Five Investment Strategies</Eyebrow>
            <div className="svc-grid">{cards(STRATEGIES)}</div>
            <Eyebrow style={{ margin: '30px 0 14px' }}>Why These Strategies Work in PSX</Eyebrow>
            <div className="svc-grid">{cards(WHY_THEY_WORK)}</div>
          </div>
          <p className="sub" style={{ marginTop: '24px', fontSize: '12.5px' }}>
            Want to understand your rights as a shareholder too? Read the{' '}
            <PageLink page="awareness" style={{ color: 'var(--g3)', cursor: 'pointer', textDecoration: 'underline' }}>
              Investor Awareness &amp; Shareholders' Rights guide →
            </PageLink>
          </p>
          <div className="imgwrap rv" style={{ maxWidth: '860px', marginTop: '24px' }}>
            <img src="/assets/img/stock-exchange-psx.webp" alt="PSX data portal review session" loading="lazy" width="1000" height="546" />
          </div>
        </div>
      </section>
    </>
  );
}
