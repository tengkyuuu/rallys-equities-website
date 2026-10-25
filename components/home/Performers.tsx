import PerfGrid from '@/components/market/PerfGrid';
import SectionTitle from '@/components/ui/SectionTitle';

/** Featured PSX companies with live prices (PerfGrid). */
export default function Performers() {
  return (
    <section className="sec">
      <div style={{ textAlign: 'center' }}>
        <SectionTitle tag="Featured Securities">
          Power Your Portfolio with <em>Leading PSX</em> <span>Performers</span>
        </SectionTitle>
        <p className="sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          Trade Pakistan's most established companies — banking, energy, technology, pharmaceuticals and consumer staples, all featured on
          our platform.
        </p>
      </div>
      <PerfGrid />
    </section>
  );
}
