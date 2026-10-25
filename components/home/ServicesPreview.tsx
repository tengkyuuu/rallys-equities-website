import type { ReactNode } from 'react';
import ServiceCard from '@/components/ui/ServiceCard';
import type { PageId } from '@/lib/site';
import GoTo from '@/components/nav/GoTo';
import SectionTitle from '@/components/ui/SectionTitle';

const SERVICES: { page: PageId; title: ReactNode; icon: ReactNode; text: ReactNode }[] = [
  {
    page: 'trading',
    title: <>Investment &amp; Trading</>,
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <polyline points="3,19 9,11 15,14 23,5" stroke="var(--g3)" strokeWidth="1.8" strokeLinecap="round" />
        <polyline points="19,5 23,5 23,9" stroke="var(--g3)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    text: 'Fast and reliable order execution for individual and institutional investors — equities, IPOs, funds, fixed income and Sukuk on the PSX.',
  },
  {
    page: 'portfolio',
    title: 'Portfolio Management',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="9" stroke="var(--g3)" strokeWidth="1.7" />
        <path d="M13 8L13 13L17 16" stroke="var(--g3)" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
    text: 'Customized investment strategies aligned with your goals — allocations, sector caps and rebalancing plans where you approve each trade.',
  },
  {
    page: 'corporate',
    title: 'Corporate Accounts',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="9" width="18" height="13" rx="2" stroke="var(--g3)" strokeWidth="1.7" />
        <path d="M9 9L9 6Q9 3 13 3Q17 3 17 6L17 9" stroke="var(--g3)" strokeWidth="1.7" fill="none" />
        <circle cx="13" cy="15.5" r="2.2" stroke="var(--g3)" strokeWidth="1.4" />
      </svg>
    ),
    text: 'Professional guidance for businesses and institutional clients, with structured execution and consistent governance.',
  },
  {
    page: 'research',
    title: 'Market Research',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M3 19L9 7L15 13L21 3" stroke="var(--g3)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="21" cy="3" r="1.8" fill="var(--g3)" />
        <line x1="3" y1="22" x2="23" y2="22" stroke="var(--g3)" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
    text: 'Access to expert analysis, reports, and stock recommendations backed by real-time PSX research.',
  },
  {
    page: 'platforms',
    title: 'Online Trading Platforms',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="7" width="18" height="13" rx="2" stroke="var(--g3)" strokeWidth="1.7" />
        <rect x="8" y="3" width="10" height="5" rx="1" stroke="var(--g3)" strokeWidth="1.4" />
        <line x1="9" y1="13" x2="17" y2="13" stroke="var(--g3)" strokeWidth="1.3" />
        <line x1="9" y1="16" x2="14" y2="16" stroke="var(--g3)" strokeWidth="1.3" />
      </svg>
    ),
    text: 'Seamless access to PSX online trading through secure mobile and desktop platforms.',
  },
  {
    page: 'shariah',
    title: 'Shariah Compliant Investing',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 3L19 7L19 17Q19 22 13 24Q7 22 7 17L7 7Z" stroke="var(--g3)" strokeWidth="1.7" fill="none" />
        <path d="M10 15L12 17L16 12" stroke="var(--g3)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: 'Build portfolios aligned to Shariah-compliant universes and indices on the PSX, with screened lists and purification guidance. آپ کا دین، آپ کی دولت۔',
  },
  {
    page: 'support',
    title: 'Customer Support',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="10" r="4" stroke="var(--g3)" strokeWidth="1.7" />
        <path d="M4 22Q4 16 13 16Q22 16 22 22" stroke="var(--g3)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      </svg>
    ),
    text: 'Dedicated support team to assist you at every step of your trading journey — by phone, email or in person.',
  },
];

/** The seven services as cards, each linking to its own page. */
export default function ServicesPreview() {
  return (
    <section className="sec">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <SectionTitle tag="Our Services" tagProps={{ 'data-edit': 'home.services.tag' }} data-edit="home.services.heading">
            Complete Investment <em>Solutions</em> for <span>Pakistan</span>
          </SectionTitle>
        </div>{' '}
        <GoTo as="button" page="services" className="bbig bbig-o" style={{ alignSelf: 'flex-end' }}>
          View All →
        </GoTo>
      </div>
      <div className="svc-grid">
        {SERVICES.map((s) => (
          <ServiceCard
            key={s.page}
            icon={s.icon}
            title={s.title}
            footer={
              <GoTo as="div" page={s.page} className="svc-link">
                Learn more →
              </GoTo>
            }
          >
            {s.text}
          </ServiceCard>
        ))}
      </div>
    </section>
  );
}
