import type { PageId } from './site';

/* Service detail pages (Services → …). One template, components/pages/ServiceDetailPage. */
export type ServiceDetail = {
  tag: string;
  title: string;
  titleEm: string;
  lede: string;
  image: { src: string; alt: string; width: number; height: number };
  intro: string;
  featuresLabel: string;
  features: string[];
};

export const SERVICE_PAGES = {
  trading: {
    tag: 'Services',
    title: 'Investment &',
    titleEm: 'Trading',
    lede: 'Fast and reliable order execution for individual and institutional investors on the PSX.',
    image: {
      src: '/assets/img/psx-stock-trading.webp',
      alt: 'PSX stock trading',
      width: 1450,
      height: 950,
    },
    intro:
      'We provide access to a broad range of financial products and seamless trading experiences on the Pakistan Stock Exchange (PSX) with reliability, transparency, and efficiency. Buy and sell listed shares using market, limit, and stop orders with real-time execution through secure custody arrangements. Settlement occurs via the T+1 system managed by CDC and NCCPL, with comprehensive handling of dividends, rights, and bonus issues. Whether you are a newcomer or a seasoned trader, you get expert guidance to help you understand order types, settlement, and costs.',
    featuresLabel: 'What you get',
    features: [
      'Equities — listed shares, IPOs, corporate actions',
      'Funds — mutual funds and ETFs',
      'Fixed Income — bonds, Sukuk, money market instruments',
      'Shariah-Compliant Investments — Islamic equities, funds, Sukuk',
      'Portfolio Services — managed and advisory accounts',
    ],
  },
  corporate: {
    tag: 'Services',
    title: 'Corporate',
    titleEm: 'Accounts',
    lede: 'Corporate & Institutional Accounts',
    image: {
      src: '/assets/img/corporate-accounts.webp',
      alt: 'Corporate accounts',
      width: 1450,
      height: 950,
    },
    intro:
      'Onboard companies, funds, and family offices with compliant documentation, board resolutions, and authorized trader lists. Enable multi-user access with maker-checker approvals and user-level permissions. We provide tailored reports—execution quality, exposure, corporate actions—and careful handling of larger tickets or blocks (where available).',
    featuresLabel: 'What you get',
    features: [
      'Corporate KYC & documentation support',
      'Role-based access and approvals',
      'Custom reports (TCA, ledgers, actions)',
      'Dedicated desk and service SLAs',
    ],
  },
  portfolio: {
    tag: 'Services',
    title: 'Portfolio',
    titleEm: 'Management',
    lede: 'A rules-based framework for your goals while you retain control.',
    image: {
      src: '/assets/img/portfolio-management.webp',
      alt: 'Portfolio management',
      width: 1450,
      height: 950,
    },
    intro:
      'Get a rules-based framework for your goals while you retain control. We propose allocations, sector caps, and rebalancing plans; you approve each trade. Expect drawdown limits, position sizing discipline, and quarterly reviews that keep your portfolio aligned to objectives without surprises. Ideal for investors who want structure and accountability without handing over discretion.',
    featuresLabel: 'What you get',
    features: ['Goal-based allocation & sector caps', 'Rebalance plans and periodic reviews', 'Position-size and drawdown guidelines'],
  },
  research: {
    tag: 'Services',
    title: 'Market',
    titleEm: 'Research',
    lede: 'Concise market summaries, sector snapshots, and earnings highlights.',
    image: {
      src: '/assets/img/market-research.webp',
      alt: 'Market research and insights',
      width: 2000,
      height: 1125,
    },
    intro:
      'Stay oriented with concise market summaries, sector snapshots, and earnings calendar highlights. We keep the language simple, focus on what moved markets, and explain why it mattered—useful for decision support without hype. Get regular updates, investor education pieces, and tools to interpret data responsibly.',
    featuresLabel: 'What you get',
    features: [
      'Daily/weekly recaps and top movers',
      'Earnings dates and key takeaways',
      'Sector notes and simple explainers',
      'Opt-in email/WhatsApp alerts',
    ],
  },
  shariah: {
    tag: 'Services',
    title: 'Shariah Compliant',
    titleEm: 'Investing',
    lede: 'Values-aligned investing on the PSX.',
    image: {
      src: '/assets/img/shariah-investing.webp',
      alt: 'Shariah compliant investing',
      width: 1450,
      height: 950,
    },
    intro:
      'Build portfolios aligned to Shariah-compliant universes and indices on the PSX. We offer screened investment lists, implement practical portfolio guidelines, and deliver dividend-purification guidance, so your approach stays values-aligned and consistent.',
    featuresLabel: 'What you get',
    features: [
      'Access to screened universes and indices',
      'Portfolio construction and periodic reviews',
      'Purification guidance where applicable',
      'Education focused on rules-based investing',
    ],
  },
  platforms: {
    tag: 'Services',
    title: 'Online Trading',
    titleEm: 'Platforms',
    lede: 'Trade anywhere with stable web and mobile platforms.',
    image: {
      src: '/assets/img/online-trading.webp',
      alt: 'Online trading platforms',
      width: 2000,
      height: 1125,
    },
    intro:
      'Trade anywhere with stable web and mobile platforms. Build watchlists, set price alerts, and place market/limit/stop orders in a few taps. Review ledgers, contract notes, and P&L with downloadable statements. Sign-in security and session controls help protect access, while our support team assists with platform setup and troubleshooting.',
    featuresLabel: 'What you get',
    features: [
      'Live quotes, charts, and alerts',
      'Day/IOC/GTC (if supported) order validity',
      'Downloadable ledgers and contract notes',
      '2FA and session-level security',
    ],
  },
  support: {
    tag: 'Services',
    title: 'Customer',
    titleEm: 'Support',
    lede: 'Customer & Investor Education',
    image: {
      src: '/assets/img/customer-support.webp',
      alt: 'Customer support',
      width: 2000,
      height: 1125,
    },
    intro:
      'Great brokerage is great service. Our desk helps with account opening, platform setup, order placement basics, reconciliations, and corporate actions. Reach us via phone, WhatsApp, or email during support hours; visit in person where available. For concerns, use our complaints & grievances path so we can resolve issues quickly and transparently.',
    featuresLabel: 'What you get',
    features: [
      'Onboarding and platform walkthroughs',
      'Order, statements, and actions support',
      'Phone/WhatsApp/email ticketing with SLAs',
      'Clear escalation/complaints pathway',
    ],
  },
} satisfies Partial<Record<PageId, ServiceDetail>>;

export type ServicePageId = keyof typeof SERVICE_PAGES;
