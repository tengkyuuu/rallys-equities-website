import OpenAccount from '@/components/actions/OpenAccount';
import GoTo from '@/components/nav/GoTo';
import Eyebrow from '@/components/ui/Eyebrow';
import FeatureList from '@/components/ui/FeatureList';
import PageHero from '@/components/ui/PageHero';
import type { ServiceDetail } from '@/lib/services';

const TICK = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7L6 10L11 4" stroke="var(--g3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** One service (Investment & Trading, Corporate Accounts, …): hero, photo, intro, feature list. */
export default function ServiceDetailPage({ service: s }: { service: ServiceDetail }) {
  return (
    <>
      <PageHero
        tag={s.tag}
        title={
          <>
            {s.title} <em>{s.titleEm}</em>
          </>
        }
        lede={s.lede}
      />
      <section className="sec" style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div className="imgwrap rv" style={{ marginBottom: '36px' }}>
          <img
            src={s.image.src}
            alt={s.image.alt}
            loading="lazy"
            width={s.image.width}
            height={s.image.height}
            style={{ height: '330px', objectFit: 'cover' }}
          />
        </div>
        <p className="sub" style={{ maxWidth: 'none', fontSize: '14px' }}>
          {s.intro}
        </p>
        <Eyebrow style={{ margin: '30px 0 6px' }}>{s.featuresLabel}</Eyebrow>
        <FeatureList items={s.features.map((f) => ({ icon: TICK, title: f }))} style={{ maxWidth: '640px' }} />
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <OpenAccount as="button" className="bbig bbig-g">
            Open Your Account
          </OpenAccount>
          <GoTo as="button" page="services" className="bbig bbig-o">
            All Services
          </GoTo>
        </div>
      </section>
    </>
  );
}
