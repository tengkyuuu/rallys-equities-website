'use client';

import { createElement, useCallback, useState, type ChangeEvent } from 'react';

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
  const [serverMessages, setServerMessages] = useState<Partial<Record<K, string>>>({});

  const bind = (id: K, base: Base) => ({
    id,
    value: values[id],
    className: errors.has(id) ? `${base} err` : base,
    'aria-invalid': errors.has(id),
    'aria-describedby': errors.has(id) ? `${id}-error` : undefined,
    maxLength: base === 'ftarea' ? 5000 : /email/.test(id) ? 254 : /phone|mob|iban/.test(id) ? 40 : /cnic/.test(id) ? 15 : 200,
    onChange: (e: ChangeEvent<El>) => {
      const v = format?.[id] ? format[id]!(e.target.value) : e.target.value;
      setValues((s) => ({ ...s, [id]: v }));
      setErrors((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      setServerMessages((s) => ({ ...s, [id]: undefined }));
    },
  });

  const get = useCallback((id: K) => values[id].trim(), [values]);

  /** Marks failing fields; returns the ids that failed (empty = valid). */
  const validate = (rules: Rule<K>[]) => {
    setServerMessages({});
    const bad = rules.filter(([id, ok]) => !ok(values[id].trim())).map(([id]) => id);
    setErrors(new Set(bad));
    if (bad.length) document.getElementById(bad[0])?.focus();
    return bad;
  };

  const serverErrors = (fields: Record<string, string>) => {
    const aliases: Record<string, string> = {
      fn: 'firstName',
      ln: 'lastName',
      fn2: 'fatherOrHusband',
      msg: 'message',
      subj: 'subject',
      pos: 'position',
      cat: 'category',
      cover: 'coverLetter',
      mob: 'mobile',
      addr: 'address',
      prov: 'province',
      emp: 'employment',
      src: 'sourceOfFunds',
      exp: 'experience',
      obj: 'objective',
    };
    const messages: Partial<Record<K, string>> = {};
    for (const id of ids) {
      const suffix = id.slice(id.indexOf('-') + 1);
      const message = fields[aliases[suffix] || suffix];
      if (message) messages[id] = message;
    }
    setServerMessages(messages);
    setErrors(new Set(Object.keys(messages) as K[]));
    const first = Object.keys(messages)[0];
    if (first) document.getElementById(first)?.focus();
  };
  const error = (id: K) =>
    errors.has(id)
      ? createElement(
          'p',
          { id: `${id}-error`, className: 'field-error', role: 'alert' },
          serverMessages[id] ||
            (/email/.test(id)
              ? 'Enter a valid email address, such as name@example.com.'
              : /cnic/.test(id)
                ? 'Enter all 13 digits of your CNIC.'
                : /mob/.test(id)
                  ? 'Enter a valid contact number with at least 9 characters.'
                  : 'Please complete this field.'),
        )
      : null;
  return { bind, get, validate, values, error, serverErrors };
}
