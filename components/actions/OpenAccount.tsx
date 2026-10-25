'use client';

import { createElement, type HTMLAttributes } from 'react';
import { ACCOUNT_OPENING_URL } from '@/lib/site';

type Props = HTMLAttributes<HTMLElement> & { as: 'button' | 'div' | 'a' };

/** "Open Account" — the online account-opening form runs on the CDC/eClear portal, in a new tab. */
export default function OpenAccount({ as, ...rest }: Props) {
  if (as === 'a') {
    return <a href={ACCOUNT_OPENING_URL} target="_blank" rel="noopener noreferrer" data-action="open-account" {...rest} />;
  }
  return createElement(as, {
    ...rest,
    onClick: () => window.open(ACCOUNT_OPENING_URL, '_blank', 'noopener'),
  });
}
