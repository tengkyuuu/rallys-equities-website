import type { PageId } from './site';

/* Navigation menus. Labels differ slightly between the header, the mobile drawer and
   the footer (e.g. "All Services", "Shariah Investing"), so each has its own list —
   but they all point at PageIds, so a route can never be mistyped. */

export type MenuLink = { page: PageId; label: string; section?: string };
export type MenuColumn = { label: string; links: MenuLink[] };
export type NavItem = {
  /** suffix of the `#nav-<id>` element that lights up for this item and its children */
  id: string;
  label: string;
  page: PageId;
  columns?: MenuColumn[];
};

export const HEADER_NAV: NavItem[] = [
  { id: 'home', label: 'Home', page: 'home' },
  { id: 'markets', label: 'Markets', page: 'markets' },
  {
    id: 'services',
    label: 'Services',
    page: 'services',
    columns: [
      {
        label: 'Trading & Investment',
        links: [
          { page: 'trading', label: 'Investment & Trading' },
          { page: 'portfolio', label: 'Portfolio Management' },
          { page: 'corporate', label: 'Corporate Accounts' },
          { page: 'research', label: 'Market Research' },
        ],
      },
      {
        label: 'Platforms & Support',
        links: [
          { page: 'shariah', label: 'Shariah Compliant Investing' },
          { page: 'platforms', label: 'Online Trading Platforms' },
          { page: 'support', label: 'Customer Support' },
        ],
      },
    ],
  },
  {
    id: 'investors',
    label: 'Investor Relations',
    page: 'portal',
    columns: [
      {
        label: 'Investor Relations',
        links: [
          { page: 'portal', label: 'Investor Portal' },
          { page: 'education', label: 'Investor Education' },
          { page: 'financial', label: 'Financial Highlights' },
          { page: 'policies', label: 'Policies and Procedures' },
        ],
      },
    ],
  },
  {
    id: 'misc',
    label: 'Miscellaneous',
    page: 'faq',
    columns: [
      {
        label: 'Resources',
        links: [
          { page: 'faq', label: 'FAQ' },
          { page: 'downloads', label: 'Useful Downloads' },
          { page: 'links', label: 'Useful Links' },
        ],
      },
      {
        label: 'Support',
        links: [
          { page: 'careers', label: 'Careers' },
          { page: 'complaints', label: 'Complaints' },
          { page: 'feedback', label: 'Feedback' },
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'About Us',
    page: 'about',
    columns: [
      {
        label: 'About Us',
        links: [
          { page: 'mission', label: 'Mission & Vision' },
          { page: 'management', label: 'Our Management' },
          { page: 'rating', label: 'Management Rating' },
          { page: 'governance', label: 'Corporate Governance' },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    page: 'cagr',
    columns: [
      {
        label: 'Growth Calculators',
        links: [
          { page: 'cagr', label: 'CAGR Calculator' },
          { page: 'sip', label: 'SIP Calculator' },
          { page: 'invest', label: 'Investment Calculator' },
          { page: 'depr', label: 'Depreciation Calculator' },
        ],
      },
      {
        label: 'Valuation Calculators',
        links: [
          { page: 'xrate', label: 'X Rate Calculator' },
          { page: 'dcf', label: 'DCF Calculator' },
          { page: 'fcf', label: 'Projected FCF & Cash Calculator' },
          { page: 'drawdown', label: 'Drawdown Calculator' },
        ],
      },
    ],
  },
  { id: 'locations', label: 'Contact Us', page: 'locations' },
];

/** Mobile drawer: a single link renders as a top-level row, a group renders under its heading. */
export type MobileGroup = { link: MenuLink } | { heading: string; links: MenuLink[] };

export const MOBILE_NAV: MobileGroup[] = [
  { link: { page: 'home', label: 'Home' } },
  { link: { page: 'markets', label: 'Markets' } },
  {
    heading: 'Services',
    links: [
      { page: 'services', label: 'All Services' },
      { page: 'trading', label: 'Investment & Trading' },
      { page: 'portfolio', label: 'Portfolio Management' },
      { page: 'corporate', label: 'Corporate Accounts' },
      { page: 'research', label: 'Market Research' },
      { page: 'shariah', label: 'Shariah Compliant Investing' },
      { page: 'platforms', label: 'Online Trading Platforms' },
      { page: 'support', label: 'Customer Support' },
    ],
  },
  {
    heading: 'Investor Relations',
    links: [
      { page: 'portal', label: 'Investor Portal' },
      { page: 'education', label: 'Investor Education' },
      { page: 'financial', label: 'Financial Highlights' },
      { page: 'policies', label: 'Policies and Procedures' },
    ],
  },
  {
    heading: 'Miscellaneous',
    links: [
      { page: 'faq', label: 'FAQ' },
      { page: 'downloads', label: 'Useful Downloads' },
      { page: 'links', label: 'Useful Links' },
      { page: 'careers', label: 'Careers' },
      { page: 'complaints', label: 'Complaints' },
      { page: 'feedback', label: 'Feedback' },
    ],
  },
  {
    heading: 'About Us',
    links: [
      { page: 'about', label: 'About Rallys Equities' },
      { page: 'mission', label: 'Mission & Vision' },
      { page: 'management', label: 'Our Management' },
      { page: 'rating', label: 'Management Rating' },
      { page: 'governance', label: 'Corporate Governance' },
    ],
  },
  {
    heading: 'Tools',
    links: [
      { page: 'cagr', label: 'CAGR Calculator' },
      { page: 'sip', label: 'SIP Calculator' },
      { page: 'invest', label: 'Investment Calculator' },
      { page: 'depr', label: 'Depreciation Calculator' },
      { page: 'xrate', label: 'X Rate Calculator' },
      { page: 'dcf', label: 'DCF Calculator' },
      { page: 'fcf', label: 'Projected FCF & Cash Calculator' },
      { page: 'drawdown', label: 'Drawdown Calculator' },
    ],
  },
  { link: { page: 'locations', label: 'Contact Us' } },
];

/* Footer columns mirror the services actually shown in the nav. The client hid
   Portfolio Management and Market Research from the header dropdown and the home grid
   via the CMS, so the Services column must not put them back. */
export const FOOTER_COLUMNS: MenuColumn[] = [
  {
    label: 'Services',
    links: [
      { page: 'trading', label: 'Investment & Trading' },
      { page: 'corporate', label: 'Corporate Accounts' },
      { page: 'shariah', label: 'Shariah Investing' },
      { page: 'platforms', label: 'Online Trading Platforms' },
      { page: 'support', label: 'Customer Support' },
      { page: 'markets', label: 'Live Markets' },
    ],
  },
  {
    label: 'Company',
    links: [
      { page: 'about', label: 'About Us' },
      { page: 'mission', label: 'Mission & Vision' },
      { page: 'management', label: 'Our Management' },
      { page: 'governance', label: 'Corporate Governance' },
      { page: 'careers', label: 'Careers' },
      { page: 'locations', label: 'Contact Us' },
    ],
  },
  {
    label: 'Investor Relations',
    links: [
      { page: 'portal', label: 'Investor Portal' },
      { page: 'education', label: 'Investor Education' },
      { page: 'financial', label: 'Financial Highlights' },
      { page: 'policies', label: 'Policies & Procedures' },
      { page: 'rating', label: 'Management Rating' },
    ],
  },
  {
    label: 'Blogs & Tools',
    links: [
      { page: 'insights', label: 'Blogs' },
      { page: 'cagr', label: 'Investor Calculators' },
      { page: 'education', label: 'Top Five Strategies', section: 'ir-strategies' },
      { page: 'faq', label: 'FAQ' },
      { page: 'downloads', label: 'Useful Downloads' },
      { page: 'links', label: 'Useful Links' },
    ],
  },
];

export const FOOTER_LEGAL: MenuLink[] = [
  { page: 'policies', label: 'Policies & Procedures' },
  { page: 'governance', label: 'Corporate Governance' },
  { page: 'complaints', label: 'Complaints' },
  { page: 'feedback', label: 'Feedback' },
];
