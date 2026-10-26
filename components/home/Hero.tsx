import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import HeroMarketCard from '@/components/market/HeroMarketCard';

/** Home hero: headline, calls to action, trust row and the live market card. */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-photo" />
      <div className="hero-grid" /> <canvas id="heroFx" aria-hidden="true" />{' '}
      <svg
        style={{
          position: 'absolute',
          right: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '460px',
          height: '460px',
          opacity: '.045',
          zIndex: '0',
          pointerEvents: 'none',
        }}
        viewBox="0 0 500 500"
      >
        <circle cx="250" cy="250" r="240" fill="none" stroke="var(--g)" strokeWidth="1" />
        <circle cx="250" cy="250" r="190" fill="none" stroke="var(--au)" strokeWidth=".5" strokeDasharray="4 6" />
        <circle cx="315" cy="250" r="185" fill="#05101E" />
        <polygon points="410,190 428,250 410,310 490,264 458,250 490,236" fill="var(--tx)" opacity=".85" />
        <circle cx="250" cy="250" r="110" fill="none" stroke="var(--g)" strokeWidth=".5" strokeDasharray="2 8" />
      </svg>{' '}
      <div className="hero-l">
        <div className="hero-badge">
          <div className="dot" />
          Pakistan's Premier TREC Broker
        </div>{' '}
        <span className="hero-urdu" lang="ur">پاکستان اسٹاک ایکسچینج کا سب سے قابل اعتماد بروکر</span>{' '}
        <h1 data-edit="home.hero.headline">
          Invest in
          <br />
          <em>Pakistan's</em>
          <br />
          <span>Future</span>
        </h1>
        <div className="hero-tag" data-edit="home.hero.tagline">
          World-class services for Pakistan's capital markets
        </div>
        <p className="hero-p" data-edit="home.hero.paragraph">
          At Rallys Equities (Pvt) Ltd, we make investing in the Pakistan Stock Exchange (PSX) simple, secure, and transparent. As a
          licensed and SECP-regulated brokerage firm, we provide a full suite of trading and investment solutions backed by real-time
          research, expert advisory, and cutting-edge technology.
        </p>
        <div className="hero-acts">
          <OpenAccount as="button" className="bbig bbig-g">
            Open Your Account
          </OpenAccount>{' '}
          <GoTo as="button" page="services" className="bbig bbig-o">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 4L9 6.5L5 9V4Z" fill="currentColor" />
            </svg>
            Our Services
          </GoTo>
        </div>
        <div className="trust-row">
          <span className="tc">✓ SECP Licensed</span>
          <div className="tsep" /> <span className="tc">🏦 PSX Regulated</span>
          <div className="tsep" /> <span className="tc">💰 Competitive Rates</span>
          <div className="tsep" /> <span className="tc">📱 Mobile &amp; Web Platforms</span>
          <div className="tsep" /> <span className="tc">🕌 Shariah-Compliant Investing</span>
        </div>
      </div>
      <div className="hero-r">
        <HeroMarketCard />
      </div>
    </section>
  );
}
