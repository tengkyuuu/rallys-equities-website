import GoTo from '@/components/nav/GoTo';
import OpenAccount from '@/components/actions/OpenAccount';
import type { PricingOverride } from '@/lib/content-types';
import { PLAN_ACTIONS, priceSizeClass, pricingValue, visiblePlanCount } from '@/lib/pricing';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');
const BTN_STYLE = { width: '100%', justifyContent: 'center' } as const;

/** Services → "Choose Your Account Plan". Managed from /admin → Pricing. */
export default function PricingPlans({ pricing }: { pricing?: PricingOverride }) {
  const v = pricingValue(pricing);
  return (
    <section className={cx('sec sec-alt', !v.show && 'prc-off')} id="pricing-sec">
      <div style={{ textAlign: 'center' }}>
        <div className="stag" data-edit="plans.tag">
          Account Types
        </div>
        <h2 className="sh" data-edit="plans.heading">
          Choose Your <em>Account</em> <span>Plan</span>
        </h2>
        <p className="sub" style={{ margin: '0 auto', textAlign: 'center' }} data-edit="plans.sub">
          All accounts are SECP regulated with CDC asset protection. No hidden fees.
        </p>
      </div>
      <div className="price-grid" data-rekey="plans" data-n={visiblePlanCount(v)}>
        {v.order.map((id) => {
          const plan = v.plans[id],
            feat = v.featured === id,
            action = PLAN_ACTIONS[id];
          const btnClass = cx('bbig', feat ? 'bbig-g' : 'bbig-o');
          return (
            <div key={id} className={cx('prc', feat && 'feat', !plan.show && 'prc-off')} data-plan={id} data-rekey={`plans.${id}`}>
              {feat && <div className="prc-badge">{v.badge}</div>}
              <div className="prc-name">{plan.name}</div>
              <div className={cx('prc-price', priceSizeClass(plan.price))}>{plan.price}</div>
              <div className="prc-period">{plan.period}</div>
              <ul className="prc-features">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              {action === 'open-account' ? (
                <OpenAccount as="button" className={btnClass} style={BTN_STYLE}>
                  {plan.btn}
                </OpenAccount>
              ) : (
                <GoTo as="button" page={action.page} className={btnClass} style={BTN_STYLE}>
                  {plan.btn}
                </GoTo>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
