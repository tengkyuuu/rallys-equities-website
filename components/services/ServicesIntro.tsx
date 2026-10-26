import SectionTitle from '@/components/ui/SectionTitle';

/** Opening of /services: heading, Urdu line, lede and the devices photo. */
export default function ServicesIntro() {
  return (
    <div className="svc-hero-row">
      <div>
        <SectionTitle tag="What We Offer" as="h1">
          World-Class Services,
          <br />
          <em>Built for</em> <span>Pakistan</span>
        </SectionTitle>{' '}
        <span className="urdu" lang="ur">پاکستان کے لیے بہترین مالی خدمات</span>{' '}
        <p className="sub" style={{ marginTop: '12px' }}>
          From your first trade to a multi-crore portfolio, Rallys Equities has a service designed for every stage of your investment
          journey.
        </p>
      </div>
      <div className="imgwrap float-bob rv rv-r">
        <img
          src="/assets/img/trading-devices.webp"
          alt="Rallys Equities trading platforms on desktop, tablet and mobile"
          fetchPriority="high"
          width="1080"
          height="1080"
        />
      </div>
    </div>
  );
}
