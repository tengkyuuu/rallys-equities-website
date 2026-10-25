import GoTo from '@/components/nav/GoTo';
import { PSX } from '@/lib/market';
import StockLogo from './StockLogo';

/** "Power Your Portfolio" logo wall of featured PSX companies; each opens Markets. */
export default function PerfGrid() {
  return (
    <div className="perf-grid" id="perfGrid">
      {PSX.map((s) => (
        <GoTo as="div" page="markets" key={s.sym} className="perf-chip" title={`${s.name} — view live markets`}>
          <StockLogo sym={s.sym} size={46} alt={s.name} className="" />
          <span className="pfs">{s.sym}</span>
          <span className="pfn">{s.name}</span>
        </GoTo>
      ))}
    </div>
  );
}
