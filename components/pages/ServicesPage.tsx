import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import PricingPlans from '@/components/pricing/PricingPlans';
import MoreServices from '@/components/services/MoreServices';
import ServiceShowcase from '@/components/services/ServiceShowcase';
import ServicesIntro from '@/components/services/ServicesIntro';
import { SHOWCASES } from '@/components/services/showcases';
import CtaBlock from '@/components/ui/CtaBlock';
import type { PricingOverride } from '@/lib/content-types';

export default function ServicesPage({ pricing }: { pricing?: PricingOverride }) {
  return (
    <>
      <section className="sec">
        <ServicesIntro />
        <div style={{ marginTop: '64px' }}>
          {SHOWCASES.map((s) => (
            <ServiceShowcase key={s.id} s={s} />
          ))}
        </div>
        <MoreServices />
      </section>
      {/* PRICING — plan cards are managed from /admin → Pricing (applyPricing); data-plan ids are stable keys */}
      <PricingPlans pricing={pricing} />
      <CtaBlock
        style={{ marginTop: '72px' }}
        title={
          <>
            Ready to <em>Start</em> <span>Investing?</span>
          </>
        }
        text="Join thousands of Pakistanis who trust Rallys Equities with their financial future."
        actions={
          <>
            <OpenAccount as="button" className="bbig bbig-g">
              Open Account Now
            </OpenAccount>
            <GoTo as="button" page="locations" className="bbig bbig-o">
              Visit Our Office
            </GoTo>
          </>
        }
      />
    </>
  );
}
