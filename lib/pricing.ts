import type { PageId } from './site';
import type { PricingOverride } from './content-types';

/* Account plans (Services → "Choose Your Account Plan") and the account-type options in
   the online application form. These are the defaults; the editor's Pricing panel stores
   only what changed (content.pricing), merged by pricingValue(). Plan ids are stable keys. */

type PlanAction = { page: PageId } | 'open-account';
export type Plan = { name: string; price: string; period: string; features: string[]; btn: string };
export type FormOption = { name: string; desc: string; price: string };

export const PLAN_ACTIONS: Record<string, PlanAction> = {
  individual: { page: 'account' },
  shariah: 'open-account',
  corporate: { page: 'account' },
};

export const PRICING_DEFAULTS = {
  order: ['individual', 'shariah', 'corporate'],
  featured: 'shariah',
  badge: 'Most Popular',
  plans: {
    individual: {
      name: 'Individual',
      price: 'Free',
      period: 'Account opening · Competitive rates',
      btn: 'Get Started',
      features: [
        'PSX equity trading',
        'Real-time market data',
        'Online trading platforms (mobile & web)',
        'Market research & insights',
        'Dedicated customer support',
      ],
    },
    shariah: {
      name: 'Shariah Compliant',
      price: 'Free',
      period: 'Values-aligned investing',
      btn: 'Open Account',
      features: [
        'Everything in Individual',
        'Screened Shariah-compliant universes',
        'Portfolio construction & periodic reviews',
        'Dividend-purification guidance',
        'Rules-based investing education',
      ],
    },
    corporate: {
      name: 'Corporate',
      price: 'Custom',
      period: 'For businesses & institutions',
      btn: 'Contact Us',
      features: [
        'Professional institutional guidance',
        'Portfolio management framework',
        'Dedicated relationship manager',
        'Priority market research access',
      ],
    },
  } as Record<string, Plan>,
  form: {
    standard: { name: 'Standard', desc: 'Full PSX access, mutual funds, IPOs. Best for most investors.', price: 'Free · No minimum' },
    halal: { name: '🕌 Halal Account', desc: 'KMI-30 Shariah-screened. Certified by our advisory board.', price: 'Free · No minimum' },
    premium: { name: 'Premium', desc: 'Dedicated advisor, advanced analytics. PKR 50L+ portfolios.', price: 'PKR 50L minimum' },
  } as Record<string, FormOption>,
};

export type PricingValue = {
  show: boolean;
  featured: string;
  badge: string;
  order: string[];
  plans: Record<string, Plan & { show: boolean }>;
  form: Record<string, FormOption>;
};

/** Defaults with the published changes merged in. */
export function pricingValue(p: PricingOverride = {}): PricingValue {
  const d = PRICING_DEFAULTS;
  const plans: PricingValue['plans'] = {};
  for (const id of d.order) {
    const o = p.plans?.[id] || {};
    plans[id] = { ...d.plans[id], ...o, show: o.show !== false };
  }
  const form: PricingValue['form'] = {};
  for (const k in d.form) form[k] = { ...d.form[k], ...(p.form?.[k] || {}) };
  return { plans, form, order: d.order, show: p.show !== false, featured: p.featured ?? d.featured, badge: p.badge || d.badge };
}

/** Long prices get a smaller type size. */
export const priceSizeClass = (price: string) => (price.length > 10 ? 'prc-long' : price.length > 4 ? 'prc-mid' : '');

/** `data-n` on the grid when some plans are hidden, so the rest centre. */
export function visiblePlanCount(v: PricingValue) {
  const shown = v.order.filter((id) => v.plans[id].show).length;
  return shown && shown < v.order.length ? shown : undefined;
}
