/* Live pricing preview for the editor: patches the rendered plan cards and form options
   in place. The public site renders the same result on the server (components/pricing). */

import type { PricingOverride } from '@/lib/content-types';
import { PRICING_DEFAULTS, pricingValue, priceSizeClass, visiblePlanCount } from '@/lib/pricing';

export const pricingDefaults = () => PRICING_DEFAULTS;
export { pricingValue };

export function applyPricing(p?: PricingOverride) {
  const v = pricingValue(p);
  const setT = (n: Element | null, t: string) => {
    if (n && n.textContent !== t) n.textContent = t;
  };
  document.getElementById('pricing-sec')?.classList.toggle('prc-off', !v.show);
  document.querySelectorAll<HTMLElement>('.prc[data-plan]').forEach((c) => {
    const id = c.dataset.plan!,
      x = v.plans[id];
    if (!x) return;
    setT(c.querySelector('.prc-name'), x.name);
    setT(c.querySelector('.prc-period'), x.period);
    const pr = c.querySelector('.prc-price');
    if (pr) {
      setT(pr, x.price);
      const size = priceSizeClass(x.price);
      pr.classList.toggle('prc-mid', size === 'prc-mid');
      pr.classList.toggle('prc-long', size === 'prc-long');
    }
    const ul = c.querySelector('.prc-features');
    if (ul && [...ul.children].map((li) => li.textContent).join('\n') !== x.features.join('\n')) {
      ul.replaceChildren(
        ...x.features.map((t) => {
          const li = document.createElement('li');
          li.textContent = t;
          return li;
        }),
      );
    }
    const btn = c.querySelector('button');
    setT(btn, x.btn);
    const feat = v.featured === id;
    c.classList.toggle('feat', feat);
    let b = c.querySelector('.prc-badge');
    if (feat) {
      if (!b) {
        b = document.createElement('div');
        b.className = 'prc-badge';
        c.prepend(b);
      }
      setT(b, v.badge);
    } else b?.remove();
    btn?.classList.toggle('bbig-g', feat);
    btn?.classList.toggle('bbig-o', !feat);
    c.classList.toggle('prc-off', !x.show);
  });
  const grid = document.querySelector<HTMLElement>('.price-grid');
  if (grid) {
    const n = visiblePlanCount(v);
    if (n) grid.dataset.n = String(n);
    else delete grid.dataset.n;
  }
  document.querySelectorAll<HTMLElement>('.ac-opt[data-val]').forEach((o) => {
    const x = v.form[o.dataset.val!];
    if (!x) return;
    setT(o.querySelector('.ac-n'), x.name);
    setT(o.querySelector('.ac-d'), x.desc);
    setT(o.querySelector('.ac-p'), x.price);
  });
}
