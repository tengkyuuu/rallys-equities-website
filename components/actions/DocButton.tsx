'use client';

import type { ButtonHTMLAttributes } from 'react';
import type { PolicySlug } from '@/lib/policies';
import { useDocViewer } from '@/components/overlays/DocViewer';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { slug: PolicySlug };

/** A policy chip: opens the document in the view-only viewer (deliberately not a link). */
export default function DocButton({ slug, ...rest }: Props) {
  const { open } = useDocViewer();
  return <button data-doc={slug} {...rest} onClick={() => open(slug)} />;
}
