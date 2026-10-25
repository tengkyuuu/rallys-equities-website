import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import type { Showcase } from './ServiceShowcase';
import AllocationTool from './tools/AllocationTool';
import OrderTicket from './tools/OrderTicket';
import PurificationTool from './tools/PurificationTool';

/** The three headline services on /services, in order. `id`s are link targets (nav, footer). */
export const SHOWCASES: Showcase[] = [
  {
    id: 'svc-trading',
    tag: '01 — Investment & Trading',
    title: (
      <>
        Investment &amp;
        <br />
        <em>Trading on the PSX</em>
      </>
    ),
    text: 'Fast and reliable order execution for individual and institutional investors. Access a broad range of financial products — equities, IPOs, mutual funds, ETFs, bonds, Sukuk and money market instruments — with reliability, transparency and efficiency.',
    features: [
      {
        title: 'Real-Time Execution',
        text: 'Buy and sell listed shares using market, limit, and stop orders with real-time execution.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polyline points="2,10 6,5 10,7.5 14,2" stroke="var(--g3)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        title: 'T+1 Settlement',
        text: 'Secure custody with settlement via the T+1 system managed by CDC and NCCPL — dividends, rights and bonus issues handled for you.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="var(--g3)" strokeWidth="1.5" />
            <path d="M8 5L8 8L11 9.5" stroke="var(--g3)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        title: 'Expert Guidance',
        text: 'Competitive brokerage rates and expert guidance on order types, settlement and costs — for newcomers and seasoned traders alike.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--g3)" strokeWidth="1.5" />
            <path d="M2 7L14 7" stroke="var(--g3)" strokeWidth="1" />
          </svg>
        ),
      },
    ],
    action: (
      <GoTo as="button" page="account" className="bbig bbig-g" style={{ marginTop: '22px' }}>
        Start Trading Today
      </GoTo>
    ),
    illustration: <OrderTicket />,
  },
  {
    id: 'svc-shariah',
    reverse: true,
    tag: '02 — Shariah Compliant Investing',
    title: (
      <>
        Shariah-Compliant
        <br />
        <em>Investing</em>
      </>
    ),
    text: 'Build portfolios aligned to Shariah-compliant universes and indices on the PSX. We offer screened investment lists, practical portfolio guidelines, and dividend-purification guidance, so your approach stays values-aligned and consistent.',
    urdu: 'آپ کا دین، آپ کی دولت — اطمینان کے ساتھ سرمایہ کاری کریں',
    features: [
      {
        title: 'Screened Universes',
        text: 'Access to screened Shariah-compliant universes and indices on the PSX.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L12 5L12 10Q12 14 8 15Q4 14 4 10L4 5Z" stroke="var(--g3)" strokeWidth="1.4" fill="none" />
            <path d="M6 9L7.5 10.5L10 7.5" stroke="var(--g3)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        title: 'Periodic Reviews',
        text: 'Portfolio construction with periodic reviews and rules-based investing education.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="var(--g3)" strokeWidth="1.4" />
            <path d="M8 5L8 8L11 9" stroke="var(--g3)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        title: 'Purification Guidance',
        text: 'Dividend-purification guidance where applicable, keeping your approach values-aligned.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--g3)" strokeWidth="1.4" />
            <line x1="2" y1="7" x2="14" y2="7" stroke="var(--g3)" strokeWidth=".8" />
          </svg>
        ),
      },
    ],
    action: (
      <OpenAccount as="button" className="bbig bbig-g" style={{ marginTop: '22px' }}>
        Open Halal Account
      </OpenAccount>
    ),
    illustration: <PurificationTool />,
  },
  {
    id: 'svc-portfolio',
    tag: '03 — Portfolio Management',
    title: (
      <>
        Portfolio
        <br />
        <em>Management</em>
      </>
    ),
    text: 'A rules-based framework for your goals while you retain control. We propose allocations, sector caps, and rebalancing plans; you approve each trade. Ideal for investors who want structure and accountability without handing over discretion.',
    features: [
      {
        title: 'Goal-Based Allocation',
        text: 'Goal-based allocation and sector caps proposed by our team — you approve each trade.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="var(--g3)" strokeWidth="1.4" />
            <path d="M2 14Q2 10 8 10Q14 10 14 14" stroke="var(--g3)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </svg>
        ),
      },
      {
        title: 'Disciplined Risk Control',
        text: 'Position-size and drawdown guidelines with rebalance plans and quarterly reviews.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 12L3 6L8 3L13 6L13 12Z" stroke="var(--g3)" strokeWidth="1.4" fill="none" />
            <path d="M6 12L6 9L10 9L10 12" stroke="var(--g3)" strokeWidth="1.2" />
          </svg>
        ),
      },
      {
        title: <>Reports &amp; Reviews</>,
        text: 'Periodic performance reports and reviews that keep your portfolio aligned to your objectives.',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="var(--g3)" strokeWidth="1.4" />
            <line x1="5" y1="7" x2="11" y2="7" stroke="var(--g3)" strokeWidth="1" />
            <line x1="5" y1="10" x2="9" y2="10" stroke="var(--g3)" strokeWidth="1" />
          </svg>
        ),
      },
    ],
    action: (
      <GoTo as="button" page="account" className="bbig bbig-g" style={{ marginTop: '22px' }}>
        Book Free Consultation
      </GoTo>
    ),
    illustration: <AllocationTool />,
  },
];
