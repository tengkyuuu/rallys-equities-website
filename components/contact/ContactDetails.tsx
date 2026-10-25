import { Fragment, type ReactNode } from 'react';
import OpenAccount from '@/components/actions/OpenAccount';
import { BookAppointmentButton } from '@/components/forms/ContactForm';
import { OFFICE_DIRECTIONS_URL, PHONES, SOCIAL } from '@/lib/company';
import { CONTACT_EMAIL } from '@/lib/site';

const ROWS: { label: ReactNode; icon: ReactNode; value: ReactNode }[] = [
  {
    label: <>Call &amp; WhatsApp</>,
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <path
          d="M4 3H7L8.5 7L7 8.5C8 10.5 11.5 14 13.5 15L15 13.5L19 15V18C17.5 20 4 14.5 3 8Z"
          stroke="var(--g3)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    ),
    value: (
      <>
        <a href={`tel:${PHONES.office.tel}`}>{PHONES.office.display}</a>
        <br />
        <a href={`tel:${PHONES.mobile.tel}`}>{PHONES.mobile.display}</a>
      </>
    ),
  },
  {
    label: 'Email',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="12" rx="2" stroke="var(--g3)" strokeWidth="1.5" />
        <path d="M3 8L11 13L19 8" stroke="var(--g3)" strokeWidth="1.3" />
      </svg>
    ),
    value: (
      <>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <small>General · Client support · Careers · Partnerships</small>
      </>
    ),
  },
  {
    label: 'Head Office',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2C7.5 2 5 4.8 5 8C5 12.5 11 20 11 20S17 12.5 17 8C17 4.8 14.5 2 11 2Z"
          stroke="var(--g3)"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="11" cy="8" r="2.4" fill="var(--g3)" />
      </svg>
    ),
    value: (
      <>
        <a href={OFFICE_DIRECTIONS_URL} target="_blank" rel="noopener">
          Office #408, 4th Floor, Lahore Stock Exchange Building ↗
        </a>
        <small>Khayaban-e-Aiwan-e-Iqbal, Lahore, Pakistan · Get directions</small>
      </>
    ),
  },
  {
    label: 'Business Hours',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="var(--g3)" strokeWidth="1.5" />
        <path d="M11 6.5V11L14 13" stroke="var(--g3)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    value: (
      <>
        Monday – Friday · 9:00 AM – 6:00 PM<small>Sat &amp; Sun closed · PSX trading 09:30–15:30 PKT</small>
      </>
    ),
  },
];

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    handle: 'Rallys Equities',
    href: SOCIAL.linkedin,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5A2.5 2.5 0 002.5 6 2.5 2.5 0 005 8.5 2.5 2.5 0 007.5 6 2.5 2.5 0 004.98 3.5zM3 9h4v12H3zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05 4 0 4.74 2.64 4.74 6.07V21h-4v-5.32c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    handle: '@rallyssequities',
    href: SOCIAL.instagram,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    handle: 'Rallys Equities Profile',
    href: SOCIAL.facebook,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 8.5V6.9c0-.8.2-1.3 1.4-1.3H17V2.6C16.6 2.5 15.6 2.4 14.5 2.4c-2.4 0-4 1.5-4 4.1v2H8v3h2.5V21h3.5v-8.5h2.5l.4-3z" />
      </svg>
    ),
  },
];

/** Left panel of /contact: phone, email, office, hours, social links and the two buttons. */
export default function ContactDetails() {
  return (
    <div className="ct-panel">
      <div className="ct-eyebrow">Reach us directly</div>
      <h3>Rallys Equities — Lahore</h3>
      {ROWS.map((r, i) => (
        <div className="ct-row" key={i}>
          <div className="ct-ic">{r.icon}</div>
          <div>
            <div className="ct-l">{r.label}</div>
            <div className="ct-v">{r.value}</div>
          </div>
        </div>
      ))}
      <div className="ct-social">
        {SOCIAL_LINKS.map((s, i) => (
          <Fragment key={s.name}>
            {i > 0 && ' '}
            <a className="ct-soc" href={s.href} target="_blank" rel="noopener" aria-label={`${s.name} — ${s.handle}`}>
              {s.icon}
              <span className="ct-soc-tx">
                <span>{s.name}</span>
                <b>{s.handle}</b>
              </span>
            </a>
          </Fragment>
        ))}
      </div>
      <div className="ct-cta">
        <BookAppointmentButton />{' '}
        <OpenAccount as="button" className="bbig bbig-o" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
          Open account online via eClear ↗
        </OpenAccount>
      </div>
    </div>
  );
}
