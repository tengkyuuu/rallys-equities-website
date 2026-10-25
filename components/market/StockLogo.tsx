'use client';

import { useState } from 'react';
import { monogram, stockLogoSrc } from '@/lib/market';

/** Company logo; falls back to a branded initials monogram when the file is missing. */
export default function StockLogo({
  sym,
  size,
  alt = '',
  className = 'slogo',
}: {
  sym: string;
  size: number;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    const m = monogram(sym, size);
    return (
      <span className="slogo-mono" aria-hidden="true" style={m.style}>
        {m.initials}
      </span>
    );
  }
  return <img className={className || undefined} src={stockLogoSrc(sym)} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
