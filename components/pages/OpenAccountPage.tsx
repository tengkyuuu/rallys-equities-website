import AccountOpening from '@/components/forms/AccountOpening';
import type { PricingOverride } from '@/lib/content-types';
import { pricingValue } from '@/lib/pricing';

/** Open Account: the five-step online application. Account-type options come from /admin → Pricing. */
export default function OpenAccountPage({ pricing }: { pricing?: PricingOverride }) {
  return <AccountOpening options={pricingValue(pricing).form} />;
}
