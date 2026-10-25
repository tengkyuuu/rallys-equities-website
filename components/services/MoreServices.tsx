import { Fragment } from 'react';
import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import ServiceCard from '@/components/ui/ServiceCard';
import SectionTitle from '@/components/ui/SectionTitle';

const MORE_SERVICES = [
  {
    id: 'svc-corporate',
    title: 'Corporate & Institutional Accounts',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="9" width="18" height="13" rx="2" stroke="var(--g3)" strokeWidth="1.7" />
        <path d="M9 9L9 6Q9 3 13 3Q17 3 17 6L17 9" stroke="var(--g3)" strokeWidth="1.7" fill="none" />
        <circle cx="13" cy="15.5" r="2.2" stroke="var(--g3)" strokeWidth="1.4" />
      </svg>
    ),
    intro:
      'Onboard companies, funds, and family offices with compliant documentation, board resolutions, and authorized trader lists. Enable multi-user access with maker-checker approvals and user-level permissions. We provide tailored reports — execution quality, exposure, corporate actions — and careful handling of larger tickets or blocks (where available).',
    includes: [
      'Corporate KYC & documentation support',
      'Role-based access and approvals',
      'Custom reports (TCA, ledgers, actions)',
      'Dedicated desk and service SLAs',
    ],
    link: (
      <OpenAccount as="div" className="svc-link">
        Open Your Account →
      </OpenAccount>
    ),
  },
  {
    id: 'svc-research',
    title: 'Market Research',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M3 19L9 7L15 13L21 3" stroke="var(--g3)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="21" cy="3" r="1.8" fill="var(--g3)" />
        <line x1="3" y1="22" x2="23" y2="22" stroke="var(--g3)" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
    intro:
      'Stay oriented with concise market summaries, sector snapshots, and earnings calendar highlights. We keep the language simple, focus on what moved markets, and explain why it mattered — useful for decision support without hype. Get regular updates, investor education pieces, and tools to interpret data responsibly.',
    includes: [
      'Daily/weekly recaps and top movers',
      'Earnings dates and key takeaways',
      'Sector notes and simple explainers',
      'Opt-in email/WhatsApp alerts',
    ],
    link: (
      <GoTo as="div" page="markets" className="svc-link">
        See live markets →
      </GoTo>
    ),
  },
  {
    id: 'svc-platforms',
    title: 'Online Trading Platforms',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="7" width="18" height="13" rx="2" stroke="var(--g3)" strokeWidth="1.7" />
        <rect x="8" y="3" width="10" height="5" rx="1" stroke="var(--g3)" strokeWidth="1.4" />
        <line x1="9" y1="13" x2="17" y2="13" stroke="var(--g3)" strokeWidth="1.3" />
        <line x1="9" y1="16" x2="14" y2="16" stroke="var(--g3)" strokeWidth="1.3" />
      </svg>
    ),
    intro:
      'Trade anywhere with stable web and mobile platforms. Build watchlists, set price alerts, and place market/limit/stop orders in a few taps. Review ledgers, contract notes, and P&L with downloadable statements. Sign-in security and session controls help protect access, while our support team assists with platform setup and troubleshooting.',
    includes: [
      'Live quotes, charts, and alerts',
      'Day/IOC/GTC (if supported) order validity',
      'Downloadable ledgers and contract notes',
      '2FA and session-level security',
    ],
    link: (
      <OpenAccount as="div" className="svc-link">
        Open Your Account →
      </OpenAccount>
    ),
  },
  {
    id: 'svc-support',
    title: 'Customer Support — Customer & Investor Education',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="10" r="4" stroke="var(--g3)" strokeWidth="1.7" />
        <path d="M4 22Q4 16 13 16Q22 16 22 22" stroke="var(--g3)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      </svg>
    ),
    intro:
      'Great brokerage is great service. Our desk helps with account opening, platform setup, order placement basics, reconciliations, and corporate actions. Reach us via phone, WhatsApp, or email during support hours; visit in person where available. For concerns, use our complaints & grievances path so we can resolve issues quickly and transparently.',
    includes: [
      'Onboarding and platform walkthroughs',
      'Order, statements, and actions support',
      'Phone/WhatsApp/email ticketing with SLAs',
      'Clear escalation/complaints pathway',
    ],
    link: (
      <GoTo as="div" page="locations" className="svc-link">
        Contact support →
      </GoTo>
    ),
  },
];

/** "Everything Else We Offer": the four secondary services, with what each includes. */
export default function MoreServices() {
  return (
    <>
      <div style={{ marginTop: '72px', textAlign: 'center' }}>
        <SectionTitle tag="More Services" as="h3" size={34}>
          Everything Else We <em>Offer</em>
        </SectionTitle>
      </div>
      <div className="svc-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        {MORE_SERVICES.map((m) => (
          <ServiceCard key={m.id} id={m.id} icon={m.icon} title={m.title} footer={m.link}>
            {m.intro}
            <br />
            <br />
            <strong style={{ color: 'var(--au)' }}>What you get:</strong>
            {m.includes.map((x) => (
              <Fragment key={x}>
                <br />
                {`• ${x}`}
              </Fragment>
            ))}
          </ServiceCard>
        ))}
      </div>
    </>
  );
}
