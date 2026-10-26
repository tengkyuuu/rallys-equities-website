/* Routes, titles and descriptions for every page — the single source of truth for
   navigation, <head> metadata, breadcrumbs and the sitemap. Page ids are the legacy
   `#page-<id>` ids: the visual editor's saved keys are rooted at them, so they must
   never be renamed. */

export const SITE_URL = 'https://www.rallysequities.com';
export const SITE_NAME = 'Rallys Equities';
export const ACCOUNT_OPENING_URL = 'https://aof.eclear.com.pk/repl';
export const CONTACT_EMAIL = 'hello@rallysequities.com';

/** name: short label (breadcrumbs, editor); title + desc: the search-result title and snippet. */
type Meta = { path: string; name: string; title: string; desc: string };

export const PAGE_META = {
  home: {
    path: '/',
    name: 'Home',
    title: 'Rallys Equities — SECP-Licensed PSX Stock Broker in Lahore',
    desc: 'SECP-licensed PSX broker in Lahore (TREC No. 553). Trade stocks online, invest Shariah-compliant and get a personal relationship manager, in Urdu or English.',
  },
  services: {
    path: '/services',
    name: 'Our Services',
    title: 'PSX Brokerage Services in Lahore — Rallys Equities',
    desc: 'Stock trading, Shariah-compliant investing, portfolio management, research and corporate accounts on the Pakistan Stock Exchange, from a licensed Lahore broker.',
  },
  markets: {
    path: '/markets',
    name: 'PSX Live Markets',
    title: 'PSX Live Markets & KSE-100 Index — Rallys Equities',
    desc: 'KSE-100, KSE-30, KMI-30 and All Share index values plus PSX stock prices from the Pakistan Stock Exchange, delayed about 15 minutes, on Rallys Equities.',
  },
  locations: {
    path: '/contact',
    name: 'Contact Us',
    title: 'Contact a PSX Stock Broker in Lahore — Rallys Equities',
    desc: 'Visit Rallys Equities at Office #408, Lahore Stock Exchange Building, or call 042-36366667. Open an account, get trading support or book an appointment.',
  },
  about: {
    path: '/about',
    name: 'About Us',
    title: 'About Rallys Equities — SECP-Licensed PSX Broker, Lahore',
    desc: 'Rallys Equities (Pvt) Ltd is a SECP-licensed PSX brokerage in Lahore, TREC No. 553, founded in 2025 by a leadership team with 35+ years of market experience.',
  },
  account: {
    path: '/open-account',
    name: 'Open a Brokerage Account',
    title: 'Open a PSX Trading Account Online — Rallys Equities',
    desc: 'Open your PSX trading account online in five steps: personal details, finances, preferences and CNIC documents. Or complete it on the CDC eClear portal.',
  },
  mission: {
    path: '/mission',
    name: 'Our Mission & Vision',
    title: 'Our Mission & Vision — Rallys Equities',
    desc: 'Our mission: make PSX investing transparent, efficient and inclusive. Our vision: a trusted, technology-driven brokerage. Plus official company details.',
  },
  management: {
    path: '/management',
    name: 'Our Management',
    title: 'Leadership & Management Team — Rallys Equities',
    desc: 'Meet the leadership of Rallys Equities: Muhammad Fayyaz (CEO), Hasham Fayyaz (COO) and Tayyab Kaleem Khan (CCO), with 35+ years of combined market experience.',
  },
  rating: {
    path: '/rating',
    name: 'Management Rating',
    title: 'Management Rating — Rallys Equities',
    desc: 'Management rating for Rallys Equities (Pvt) Ltd: the formal evaluation has not yet been conducted; this page will carry the official rating once issued.',
  },
  governance: {
    path: '/governance',
    name: 'Corporate Governance',
    title: 'Corporate Governance & Shareholding — Rallys Equities',
    desc: 'Board of directors, shareholding structure and external auditors of Rallys Equities (Pvt) Ltd, a SECP-licensed PSX brokerage with strong promoter ownership.',
  },
  trading: {
    path: '/services/trading',
    name: 'Investment & Trading',
    title: 'PSX Stock, IPO & ETF Trading — Rallys Equities',
    desc: 'Trade equities, IPOs, mutual funds, ETFs, bonds and Sukuk on the PSX with fast execution, T+1 settlement via CDC and NCCPL, and competitive brokerage rates.',
  },
  corporate: {
    path: '/services/corporate-accounts',
    name: 'Corporate & Institutional Accounts',
    title: 'Corporate & Institutional PSX Accounts — Rallys Equities',
    desc: 'Brokerage accounts for companies, funds and family offices: corporate KYC support, role-based approvals, custom reports and a dedicated desk on the PSX.',
  },
  portfolio: {
    path: '/services/portfolio-management',
    name: 'Portfolio Management',
    title: 'Portfolio Management Services in Pakistan — Rallys Equities',
    desc: 'A rules-based portfolio plan for your goals: allocations, sector caps and rebalancing proposed by our team, with every trade approved by you. Reviewed quarterly.',
  },
  research: {
    path: '/services/market-research',
    name: 'Market Research',
    title: 'PSX Market Research & Stock Analysis — Rallys Equities',
    desc: 'Daily and weekly PSX market recaps, sector notes, earnings dates and plain-language explainers from the Rallys Equities research desk, plus opt-in alerts.',
  },
  shariah: {
    path: '/services/shariah-investing',
    name: 'Shariah Compliant Investing',
    title: 'Shariah-Compliant Investing on the PSX — Rallys Equities',
    desc: 'Invest in Shariah-compliant PSX stocks: screened universes and KMI indices, portfolio reviews and dividend-purification guidance from Rallys Equities.',
  },
  platforms: {
    path: '/services/trading-platforms',
    name: 'Online Trading Platforms',
    title: 'Online Stock Trading: Web & Mobile — Rallys Equities',
    desc: 'Trade PSX stocks on web and mobile: live quotes, charts, price alerts, market, limit and stop orders, downloadable statements and two-factor security.',
  },
  support: {
    path: '/services/support',
    name: 'Customer Support',
    title: 'Investor Support & Customer Service — Rallys Equities',
    desc: 'Help with account opening, platform setup, orders, statements and corporate actions, by phone, WhatsApp or email, from the Rallys Equities support desk.',
  },
  portal: {
    path: '/investors/portal',
    name: 'Investor Portal',
    title: 'Investor Portal: Complaints & Disclosures — Rallys Equities',
    desc: 'Investor grievances, regulatory disclosures and complaint routes to the SECP and PSX. No pending investor complaints or penal actions against Rallys Equities.',
  },
  education: {
    path: '/investors/education',
    name: 'Investor Education',
    title: 'How to Invest in the Pakistan Stock Exchange — Rallys Equities',
    desc: 'A five-step guide to investing in the Pakistan Stock Exchange for beginners, plus five common PSX investment strategies, from value investing to diversification.',
  },
  financial: {
    path: '/investors/financial-highlights',
    name: 'Financial Highlights',
    title: 'Financial Highlights & Reports — Rallys Equities',
    desc: 'Financial disclosures from Rallys Equities (Pvt) Ltd, a SECP-licensed PSX brokerage. Quarterly reports for 2026 are published here once finalised and approved.',
  },
  awareness: {
    path: '/investors/awareness',
    name: 'Investor Education & Awareness',
    title: 'Investor Awareness & Shareholder Rights — Rallys Equities',
    desc: 'Investor awareness for the PSX: how to choose a licensed broker, how trades settle and the rights you hold as a shareholder under the Companies Act, 2017.',
  },
  policies: {
    path: '/investors/policies',
    name: 'Policies and Procedures',
    title: 'Compliance Policies & Procedures — Rallys Equities',
    desc: 'Read all 11 Rallys Equities compliance policies: AML/CFT, internal controls, conflicts of interest, complaints, order recording, record retention and more.',
  },
  cagr: {
    path: '/tools/cagr-calculator',
    name: 'CAGR Calculator',
    title: 'CAGR Calculator: Annual Growth Rate — Rallys Equities',
    desc: 'Free CAGR calculator: find the compound annual growth rate of an investment in PKR from what you invested, its final value and the years held.',
  },
  sip: {
    path: '/tools/sip-calculator',
    name: 'SIP Calculator',
    title: 'SIP Calculator for Monthly Investing — Rallys Equities',
    desc: 'Free SIP calculator for Pakistan: estimate how a monthly investment could grow at an expected yearly return over your chosen period. Results are estimates.',
  },
  invest: {
    path: '/tools/investment-calculator',
    name: 'Investment Calculator',
    title: 'Investment Growth Calculator (PKR) — Rallys Equities',
    desc: 'Free investment calculator: see how a lump sum plus monthly contributions could grow in PKR at an expected annual return. Results are estimates only.',
  },
  depr: {
    path: '/tools/depreciation-calculator',
    name: 'Depreciation Calculator',
    title: 'Inflation & Purchasing Power Calculator — Rallys Equities',
    desc: 'See how inflation erodes the purchasing power of cash. Enter an amount, a start year, the years and an inflation rate to find what your money is really worth.',
  },
  xrate: {
    path: '/tools/ex-rate-calculator',
    name: 'Ex-Rate Calculator',
    title: 'Ex-Dividend, Bonus & Rights Price Calculator — Rallys Equities',
    desc: 'Work out the ex-price of a PSX share after a cash dividend, bonus issue or rights issue, from the closing rate and face value. Free and instant.',
  },
  dcf: {
    path: '/tools/dcf-calculator',
    name: 'DCF Calculator',
    title: 'DCF Calculator: Intrinsic Value of a Stock — Rallys Equities',
    desc: 'Estimate a share’s intrinsic value with a free DCF calculator from free cash flow per share, growth, and growth- and terminal-stage discount rates.',
  },
  fcf: {
    path: '/tools/fcf-calculator',
    name: 'Free Cash Flow Calculator',
    title: 'Free Cash Flow Calculator — Rallys Equities',
    desc: 'Project a company’s free cash flow and cash per share from its six-year averages, equity and shares outstanding with a free FCF calculator.',
  },
  drawdown: {
    path: '/tools/drawdown-calculator',
    name: 'Drawdown Calculator',
    title: 'Drawdown & Recovery Calculator — Rallys Equities',
    desc: 'See how a balance shrinks with a loss each period, the total drawdown from peak, and the gain needed to recover, with a free drawdown calculator.',
  },
  faq: {
    path: '/faq',
    name: 'Frequently Asked Questions',
    title: 'PSX Investing FAQs — Rallys Equities',
    desc: 'Answers about investing on the PSX with Rallys Equities: opening an account, minimum investment, safety of funds, platforms, brokerage charges and withdrawals.',
  },
  downloads: {
    path: '/downloads',
    name: 'Useful Downloads',
    title: 'Downloads & Policy Documents — Rallys Equities',
    desc: 'Read all 11 Rallys Equities compliance policies on the page, find regulator resources, and open your PSX account online through the eClear portal.',
  },
  links: {
    path: '/useful-links',
    name: 'Useful Links',
    title: 'Useful Links: SECP, PSX, CDC & NCCPL — Rallys Equities',
    desc: 'Official links every PSX investor needs: SECP, Pakistan Stock Exchange, CDC, NCCPL and the State Bank, plus CDC services and online complaint portals.',
  },
  complaints: {
    path: '/complaints',
    name: 'Submit a Complaint',
    title: 'Submit a Complaint — Rallys Equities',
    desc: 'Lodge a complaint with Rallys Equities and get a prompt, transparent response, or escalate it to the PSX and SECP online complaint portals.',
  },
  careers: {
    path: '/careers',
    name: 'Careers',
    title: 'Careers at a PSX Brokerage in Lahore — Rallys Equities',
    desc: 'Join Rallys Equities in Lahore: roles for stockbrokers, research analysts and graduates at a SECP-licensed PSX brokerage. Apply online with your CV.',
  },
  feedback: {
    path: '/feedback',
    name: 'Submit Feedback',
    title: 'Submit Feedback — Rallys Equities',
    desc: 'Tell Rallys Equities how we are doing. Share feedback and suggestions about our service, trading platforms or website; every message reaches our team.',
  },
  insights: {
    path: '/blog',
    name: 'Our Blogs',
    title: 'PSX Market Insights & Investing Blog — Rallys Equities',
    desc: 'PSX market commentary, research notes and investor education from the Rallys Equities desk: stock market basics, sectors, strategies and Shariah investing.',
  },
  post: {
    path: '/blog',
    name: 'Our Blogs',
    title: 'PSX Market Insights & Investing Blog — Rallys Equities',
    desc: 'PSX market commentary, research notes and investor education from the Rallys Equities desk: stock market basics, sectors, strategies and Shariah investing.',
  },
} satisfies Record<string, Meta>;

export type PageId = keyof typeof PAGE_META;
export const PAGE_IDS = Object.keys(PAGE_META) as PageId[];

/** Which top-level nav item lights up for a page. */
export const NAV_PARENT: Partial<Record<PageId, string>> = {
  mission: 'about',
  management: 'about',
  rating: 'about',
  governance: 'about',
  trading: 'services',
  corporate: 'services',
  portfolio: 'services',
  research: 'services',
  shariah: 'services',
  platforms: 'services',
  support: 'services',
  portal: 'investors',
  education: 'investors',
  awareness: 'investors',
  financial: 'investors',
  policies: 'investors',
  cagr: 'tools',
  sip: 'tools',
  invest: 'tools',
  depr: 'tools',
  xrate: 'tools',
  dcf: 'tools',
  fcf: 'tools',
  drawdown: 'tools',
  faq: 'misc',
  downloads: 'misc',
  links: 'misc',
  careers: 'misc',
  complaints: 'misc',
  feedback: 'misc',
  post: 'insights',
};

/* Sub-pages under a hub with its own landing page (Services, About) get a 3-level
   breadcrumb; Investor Relations/Tools/Misc have no hub page to link to. */
const BREADCRUMB_HUB: Record<string, PageId> = { services: 'services', about: 'about' };

export const pathFor = (id: PageId) => PAGE_META[id].path;

const PATH_TO_ID = new Map<string, PageId>();
for (const id of PAGE_IDS) if (!PATH_TO_ID.has(PAGE_META[id].path)) PATH_TO_ID.set(PAGE_META[id].path, id);

/** Page id for a pathname (`/blog/<slug>` → 'post'); null for unknown paths. */
export function pageIdForPath(pathname: string): PageId | null {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (/^\/blog\/[^/]+$/.test(p)) return 'post';
  return PATH_TO_ID.get(p) ?? null;
}

export const navParent = (id: PageId) => NAV_PARENT[id] ?? id;
export const shortTitle = (id: PageId) => PAGE_META[id].name;

export function breadcrumbItems(id: PageId, leaf?: { name: string; path: string }) {
  const items = [{ name: 'Home', path: '/' }];
  const m = PAGE_META[id];
  const hub = BREADCRUMB_HUB[NAV_PARENT[id] ?? ''];
  if (hub && PAGE_META[hub].path !== m.path) items.push({ name: shortTitle(hub), path: PAGE_META[hub].path });
  items.push(leaf ?? { name: shortTitle(id), path: m.path });
  return items;
}
