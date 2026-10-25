import PageLink from '@/components/nav/PageLink';
import { PHONES, SOCIAL, WHATSAPP_URL } from '@/lib/company';
import { FOOTER_COLUMNS, FOOTER_LEGAL } from '@/lib/menus';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer>
      {/* oversized display wordmark, clipped by the footer — the footer's signature detail. Purely decorative and aria-hidden; sits behind everything at low opacity. */}
      <div className="foot-mark" aria-hidden="true">
        Rallys Equities
      </div>
      <div className="foot-top">
        <div className="foot-lede">
          <div className="foot-lock">
            <Logo />
          </div>
          <p className="foot-say">
            Making investment in the Pakistan Stock Exchange simple, secure and transparent — licensed and regulated by the SECP &amp; PSX.
          </p>{' '}
          <span className="fb-urdu">رالیز ایکویٹیز — آپ کا قابل اعتماد مالی ساتھی</span>{' '}
          <div className="foot-soc">
            <a
              className="fsoc"
              href="https://www.facebook.com/profile.php?id=61584496977916"
              target="_blank"
              rel="noopener"
              aria-label="Rallys Equities on Facebook"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13v-2c0-.6.4-1 1-1z" />
              </svg>
            </a>{' '}
            <a className="fsoc" href={SOCIAL.instagram} target="_blank" rel="noopener" aria-label="Rallys Equities on Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <rect x="3.5" y="3.5" width="17" height="17" rx="4.6" />
                <circle cx="12" cy="12" r="3.6" />
                <circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>{' '}
            <a className="fsoc" href={SOCIAL.linkedin} target="_blank" rel="noopener" aria-label="Rallys Equities on LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.5 8.5h-3v11h3v-11zM5 4a1.7 1.7 0 1 0 0 3.4A1.7 1.7 0 0 0 5 4zm5.5 4.5h-3v11h3v-6c0-1.6 2.4-1.8 2.4 0v6h3v-6.4c0-4.5-4.6-4.3-5.4-2.1V8.5z" />
              </svg>
            </a>{' '}
            <a className="fsoc" href={WHATSAPP_URL} target="_blank" rel="noopener" aria-label="Message Rallys Equities on WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.1 14.1c-.2.6-1.2 1.2-1.7 1.2-.5 0-2.4-.3-4.5-2.3-2-2-2.4-3.7-2.4-4.3 0-.6.6-1.5 1.1-1.7.2-.1.5-.1.7.1l.9 1.4c.1.2.1.4 0 .6l-.4.5c-.1.2-.2.4 0 .6.3.5 1.6 2 2.4 2.3.2.1.4.1.5-.1l.5-.6c.2-.2.4-.2.6-.1l1.4.8c.3.1.4.4.3.7z" />
              </svg>
            </a>
          </div>
        </div>
        <nav className="foot-cols" aria-label="Footer">
          {/* Mirrors the services actually shown in the nav — see FOOTER_COLUMNS. */}
          {FOOTER_COLUMNS.map((col) => (
            <div className="fc2" key={col.label}>
              <h5>{col.label}</h5>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <PageLink page={l.page} section={l.section}>
                      {l.label}
                    </PageLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      {/* contact strip */}
      <div className="foot-contact">
        <a className="fct" href={`tel:${PHONES.office.tel}`}>
          <span className="fct-ic">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
            </svg>
          </span>{' '}
          <span className="fct-tx">
            <b>{PHONES.office.display}</b>
            <em>{PHONES.mobile.display}</em>
          </span>
        </a>{' '}
        <a className="fct" href="mailto:hello@rallysequities.com">
          <span className="fct-ic">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>{' '}
          <span className="fct-tx">
            <b>hello@rallysequities.com</b>
            <em>We reply within one business day</em>
          </span>
        </a>{' '}
        <PageLink page="locations" className="fct">
          <span className="fct-ic">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>{' '}
          <span className="fct-tx">
            <b>Lahore Stock Exchange Building</b>
            <em>Office # 408, 4th Floor, Khayaban-e-Aiwan-e-Iqbal</em>
          </span>
        </PageLink>
      </div>
      {/* ══════ JAMA PUNJI — investor education partner ══════ Client asked for this at the very bottom of the page, at a size where the logo, slogan and name read clearly, and deliberately NOT grouped with the regulatory authorities. Rendered at 76px tall against a 461×109 source, so it is still being downscaled and stays crisp. */}
      <div className="jp-band">
        <div className="jp-eyebrow">Investor Education Partner</div>{' '}
        <a
          className="jp-logo"
          href="https://jamapunji.pk/financial-planning/financial-basics-0"
          target="_blank"
          rel="noopener"
          aria-label="Jama Punji — Financial Basics, the SECP investor education portal (opens in a new tab)"
        >
          <img
            src="/assets/img/jamapunji.png"
            alt="Jama Punji — the Securities and Exchange Commission of Pakistan's investor education portal"
            width="461"
            height="109"
            loading="lazy"
          />
        </a>{' '}
        <p className="jp-note">
          Learn the fundamentals of investing at <strong style={{ color: 'var(--mt)' }}>jamapunji.pk</strong> — the Securities &amp;
          Exchange Commission of Pakistan's official investor education portal.
        </p>
      </div>
      <div className="footer-bot">
        <div className="foot-cred">
          <span className="brand-chip foot-psx">
            <img
              src="/assets/img/psx-logo.png"
              alt="Pakistan Stock Exchange"
              width="100"
              height="117"
              style={{ height: '38px' }}
              loading="lazy"
            />
          </span>{' '}
          <p>
            © 2026 Rallys Equities (Pvt) Ltd. All rights reserved.
            <br />
            <span>SECP Licensed Broker · PSX TREC No. 553</span>
          </p>
        </div>
        <div className="footer-leg">
          {FOOTER_LEGAL.map((l) => (
            <PageLink key={l.page} page={l.page}>
              {l.label}
            </PageLink>
          ))}
        </div>
      </div>
      <div className="footer-dis">
        <strong style={{ color: 'var(--mt)' }}>Risk Disclaimer:</strong> Investing in securities involves risk. Past performance is not
        indicative of future results. Rallys Equities (Pvt) Ltd is licensed by SECP and is a TREC holder of Pakistan Stock Exchange. Client
        assets held at CDC. Please read our Risk Disclosure Statement before investing.
      </div>
    </footer>
  );
}
