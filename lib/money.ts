import type { FormEvent } from 'react';

/** Live thousands separators for money inputs (onInput), keeping the caret in place. */
export function formatMoney(e: FormEvent<HTMLInputElement>) {
  const el = e.currentTarget,
    caret = el.selectionStart ?? el.value.length,
    len = el.value.length;
  const parts = el.value.replace(/[^\d.]/g, '').split('.');
  if (parts[0] !== '') parts[0] = Number(parts[0]).toLocaleString('en-US');
  el.value = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('').slice(0, 2) : parts[0];
  const pos = Math.max(0, caret + el.value.length - len);
  try {
    el.setSelectionRange(pos, pos);
  } catch {
    /* number inputs */
  }
}

/** The number in a formatted money field, or NaN when it is empty. */
export const parseMoney = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(/,/g, '')));

/** PKR 12,345 (whole rupees) or PKR 12,345.50 when there are paisa. */
export const pkr = (n: number) =>
  'PKR ' + n.toLocaleString('en-PK', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
