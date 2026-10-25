/* Routes, titles and descriptions for every page — the single source of truth for
   navigation, <head> metadata, breadcrumbs and the sitemap. Page ids are the legacy
   `#page-<id>` ids: the visual editor's saved keys are rooted at them, so they must
   never be renamed. */

export const SITE_URL = 'https://www.rallysequities.com';
export const SITE_NAME = 'Rallys Equities';
export const ACCOUNT_OPENING_URL = 'https://aof.eclear.com.pk/repl';
export const CONTACT_EMAIL = 'hello@rallysequities.com';

type Meta = { path: string; title: string; desc: string };

export const PAGE_META = {
  home: {
    path: '/',
    title: 'Rallys Equities (Pvt) Ltd — Trusted Brokerage in Pakistan',
    desc: 'Rallys Equities (Pvt) Ltd makes investing in the Pakistan Stock Exchange (PSX) simple, secure and transparent — a licensed, SECP-regulated brokerage house.',
  },
  services: {
    path: '/services',
    title: 'Our Services — Rallys Equities',
    desc: 'From your first trade to a multi-crore portfolio, Rallys Equities has a service designed for every stage of your investment journey on the PSX.',
  },
  markets: {
    path: '/markets',
    title: 'PSX Live Markets — Rallys Equities',
    desc: 'PSX index values and stock prices (delayed about 15 minutes), brought to you by Rallys Equities.',
  },
  locations: {
    path: '/contact',
    title: 'Contact Us — Rallys Equities',
    desc: 'Get in touch with Rallys Equities — phone, email, our Lahore Stock Exchange Building office, and a contact form for account opening and support.',
  },
  about: {
    path: '/about',
    title: 'About Us — Rallys Equities',
    desc: "Rallys Equities' mission, management and governance — a SECP- and PSX-licensed brokerage built on trust, transparency and disciplined execution.",
  },
  account: {
    path: '/open-account',
    title: 'Open a Brokerage Account — Rallys Equities',
    desc: 'Open a Rallys Equities trading account online in five simple steps — personal information, financial details, preferences, documents and review.',
  },
  mission: {
    path: '/mission',
    title: 'Our Mission & Vision — Rallys Equities',
    desc: 'Building success through trust, transparency and disciplined execution on the Pakistan Stock Exchange.',
  },
  management: {
    path: '/management',
    title: 'Our Management — Rallys Equities',
    desc: 'Meet the team behind Rallys Equities — decades of market experience, modern financial expertise and strong governance.',
  },
  rating: {
    path: '/rating',
    title: 'Management Rating — Rallys Equities',
    desc: 'A key measure of investment success — see how Rallys Equities is rated.',
  },
  governance: {
    path: '/governance',
    title: 'Corporate Governance — Rallys Equities',
    desc: 'Transparent leadership, clear ownership and independent oversight at Rallys Equities.',
  },
  trading: {
    path: '/services/trading',
    title: 'Investment & Trading — Rallys Equities',
    desc: 'Fast and reliable order execution on the Pakistan Stock Exchange for individual and institutional investors.',
  },
  corporate: {
    path: '/services/corporate-accounts',
    title: 'Corporate & Institutional Accounts — Rallys Equities',
    desc: 'Corporate and institutional brokerage accounts from Rallys Equities, built for organizations investing on the PSX.',
  },
  portfolio: {
    path: '/services/portfolio-management',
    title: 'Portfolio Management — Rallys Equities',
    desc: 'A rules-based portfolio management framework for your goals, while you retain control of every decision.',
  },
  research: {
    path: '/services/market-research',
    title: 'Market Research — Rallys Equities',
    desc: 'Concise market summaries, sector snapshots and earnings highlights from the Rallys Equities research desk.',
  },
  shariah: {
    path: '/services/shariah-investing',
    title: 'Shariah Compliant Investing — Rallys Equities',
    desc: 'Values-aligned, Shariah-compliant investing on the Pakistan Stock Exchange with Rallys Equities.',
  },
  platforms: {
    path: '/services/trading-platforms',
    title: 'Online Trading Platforms — Rallys Equities',
    desc: "Trade anywhere with Rallys Equities' stable web and mobile trading platforms.",
  },
  support: {
    path: '/services/support',
    title: 'Customer Support — Rallys Equities',
    desc: 'Customer and investor support from Rallys Equities — here to help with your account and trading questions.',
  },
  portal: {
    path: '/investors/portal',
    title: 'Investor Portal — Rallys Equities',
    desc: 'The Rallys Equities investor portal — designed to promote transparency, investor protection and open communication.',
  },
  education: {
    path: '/investors/education',
    title: 'Investor Education — Rallys Equities',
    desc: 'An investor education guide for smarter, more informed investing on the Pakistan Stock Exchange.',
  },
  financial: {
    path: '/investors/financial-highlights',
    title: 'Financial Highlights — Rallys Equities',
    desc: 'Rallys Equities is committed to transparency and timely financial disclosure.',
  },
  awareness: {
    path: '/investors/awareness',
    title: 'Investor Education & Awareness — Rallys Equities',
    desc: 'Informed investors make better decisions — know your rights and how the market protects you.',
  },
  policies: {
    path: '/investors/policies',
    title: 'Policies and Procedures — Rallys Equities',
    desc: 'The compliance framework that governs how Rallys Equities operates.',
  },
  cagr: {
    path: '/tools/cagr-calculator',
    title: 'CAGR Calculator — Rallys Equities',
    desc: 'Calculate the compound annual growth rate (CAGR) of your investment — a key measure of investment success.',
  },
  sip: {
    path: '/tools/sip-calculator',
    title: 'SIP Calculator — Rallys Equities',
    desc: 'Estimate the potential returns on your systematic monthly investments with the Rallys Equities SIP calculator.',
  },
  invest: {
    path: '/tools/investment-calculator',
    title: 'Investment Calculator — Rallys Equities',
    desc: 'Plan your wealth growth easily with the Rallys Equities investment calculator.',
  },
  depr: {
    path: '/tools/depreciation-calculator',
    title: 'Depreciation Calculator — Rallys Equities',
    desc: 'See how inflation erodes the purchasing power of cash over time.',
  },
  xrate: {
    path: '/tools/ex-rate-calculator',
    title: 'Ex-Rate Calculator — Rallys Equities',
    desc: 'Simplify ex-dividend, ex-bonus and ex-rights share price calculations.',
  },
  dcf: {
    path: '/tools/dcf-calculator',
    title: 'DCF Calculator — Rallys Equities',
    desc: 'Estimate the intrinsic value of a company or investment using discounted cash flow analysis.',
  },
  fcf: {
    path: '/tools/fcf-calculator',
    title: 'Free Cash Flow Calculator — Rallys Equities',
    desc: 'Project free cash flow and cash position from six-year averages.',
  },
  drawdown: {
    path: '/tools/drawdown-calculator',
    title: 'Drawdown Calculator — Rallys Equities',
    desc: 'Measure the decline from peak to trough in an investment, and what it takes to recover.',
  },
  faq: {
    path: '/faq',
    title: 'Frequently Asked Questions — Rallys Equities',
    desc: 'Answers about PSX investing, accounts, trading platforms and support at Rallys Equities.',
  },
  downloads: {
    path: '/downloads',
    title: 'Useful Downloads — Rallys Equities',
    desc: 'Easy access to important resources and documents from Rallys Equities.',
  },
  links: {
    path: '/useful-links',
    title: 'Useful Links — Rallys Equities',
    desc: 'Regulators and market bodies every PSX investor should know.',
  },
  complaints: {
    path: '/complaints',
    title: 'Submit a Complaint — Rallys Equities',
    desc: 'Have a concern? Rallys Equities resolves complaints quickly and transparently.',
  },
  careers: {
    path: '/careers',
    title: 'Careers — Rallys Equities',
    desc: 'Grow with Rallys Equities — explore career opportunities at a SECP-licensed Pakistan Stock Exchange brokerage.',
  },
  feedback: {
    path: '/feedback',
    title: 'Submit Feedback — Rallys Equities',
    desc: 'Your feedback helps Rallys Equities improve. Tell us about your experience.',
  },
  insights: {
    path: '/blog',
    title: 'Our Blogs — Rallys Equities',
    desc: 'Research notes, market commentary and investor education from the Rallys Equities desk.',
  },
  post: {
    path: '/blog',
    title: 'Our Blogs — Rallys Equities',
    desc: 'Research notes, market commentary and investor education from the Rallys Equities desk.',
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
export const shortTitle = (id: PageId) => PAGE_META[id].title.split(' — ')[0];

export function breadcrumbItems(id: PageId, leaf?: { name: string; path: string }) {
  const items = [{ name: 'Home', path: '/' }];
  const m = PAGE_META[id];
  const hub = BREADCRUMB_HUB[NAV_PARENT[id] ?? ''];
  if (hub && PAGE_META[hub].path !== m.path) items.push({ name: shortTitle(hub), path: PAGE_META[hub].path });
  items.push(leaf ?? { name: shortTitle(id), path: m.path });
  return items;
}
