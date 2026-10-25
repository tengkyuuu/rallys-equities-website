'use client';

import { useCallback, useState, type ChangeEvent } from 'react';

type Base = 'finput' | 'fselect' | 'ftarea';
type El = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type Rule<K extends string> = [K, (v: string) => boolean];

export const filled = (v: string) => v.length > 1;
export const chosen = (v: string) => v !== '';
export const longEnough = (v: string) => v.length > 2;
export const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+$/.test(v);

/** Controlled text/select/textarea fields keyed by element id, with the forms' red-outline validation. */
export function useFields<K extends string>(ids: readonly K[], format?: Partial<Record<K, (v: string) => string>>) {
  const [values, setValues] = useState(() => Object.fromEntries(ids.map((id) => [id, ''])) as Record<K, string>);
  const [errors, setErrors] = useState<ReadonlySet<K>>(new Set());

  const bind = (id: K, base: Base) => ({
    id,
    value: values[id],
    className: errors.has(id) ? `${base} err` : base,
    onChange: (e: ChangeEvent<El>) => {
      const v = format?.[id] ? format[id]!(e.target.value) : e.target.value;
      setValues((s) => ({ ...s, [id]: v }));
    },
  });

  const get = useCallback((id: K) => values[id].trim(), [values]);

  /** Marks failing fields; returns the ids that failed (empty = valid). */
  const validate = (rules: Rule<K>[]) => {
    const bad = rules.filter(([id, ok]) => !ok(values[id].trim())).map(([id]) => id);
    setErrors(new Set(bad));
    return bad;
  };

  return { bind, get, validate, values };
}
