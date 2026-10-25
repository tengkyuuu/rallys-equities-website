import type { CalcBlock } from '@/lib/content-types';
import { CALCULATORS, CALC_DISCLAIMER, CALC_INFO, type CalculatorId } from '@/lib/calculators/data';
import CalcInfo from './CalcInfo';
import CalculatorCard from './CalculatorCard';
import PageHero from '@/components/ui/PageHero';

/** A Tools page: hero, the calculator card, disclaimer and (for most) the write-up. */
export default function CalculatorPage({ id, info, admin }: { id: CalculatorId; info?: CalcBlock[]; admin?: boolean }) {
  const def = CALCULATORS[id];
  // only calculators that ship a write-up have one (an override replaces its text)
  const blocks = CALC_INFO[id] && (info ?? CALC_INFO[id]);
  return (
    <>
      <PageHero
        tag={def.tag}
        title={
          <>
            {def.title} <em>{def.titleEm}</em>
          </>
        }
        lede={def.lede}
      />
      <section className="sec" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          <CalculatorCard id={id} def={def} />
          <p className="sub" style={{ marginTop: '18px', fontSize: '11px', maxWidth: 'none' }}>
            {CALC_DISCLAIMER}
          </p>
        </div>
      </section>
      {/* in /admin the editor renders the write-up itself, from its working copy */}
      {blocks && !admin && <CalcInfo blocks={blocks} />}
    </>
  );
}
