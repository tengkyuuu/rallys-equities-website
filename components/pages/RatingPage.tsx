import Callout from '@/components/ui/Callout';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';

export default function RatingPage() {
  return (
    <>
      <PageHero
        tag="About Us"
        title={
          <>
            Management <em>Rating</em>
          </>
        }
        lede="A key measure of investment success."
      />
      <section className="sec">
        {/* MANAGEMENT RATING */}
        <div style={{ marginTop: '8px' }} id="rating">
          <SectionTitle tag="Management Rating" as="h3" size={34}>
            A Key Measure of
            <br />
            <em>Investment Success</em>
          </SectionTitle>
          <Callout style={{ marginTop: '24px', maxWidth: '760px' }}>
            <p className="sub" style={{ maxWidth: 'none', marginBottom: '12px' }}>
              At Rallys Equities, we place strong emphasis on governance, leadership quality, and operational discipline as core pillars of
              our business.
            </p>
            <p className="sub" style={{ maxWidth: 'none' }}>
              The management rating for Rallys Equities (Pvt) Ltd has not yet been conducted. The formal evaluation will be completed by the
              relevant rating or regulatory authority, after which this section will be updated with the official rating and commentary.
              Until then, the firm remains committed to maintaining high standards of transparency, compliance, and accountability across
              all levels of management.
            </p>
          </Callout>
        </div>
      </section>
    </>
  );
}
