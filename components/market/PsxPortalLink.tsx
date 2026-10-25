import { PSX_PORTAL } from '@/lib/market';

/** Shown wherever live prices are unavailable: send visitors to PSX's own portal. */
export default function PsxPortalLink({ children }: { children: string }) {
  return (
    <a href={PSX_PORTAL} target="_blank" rel="noopener noreferrer">
      {children} ↗
    </a>
  );
}
