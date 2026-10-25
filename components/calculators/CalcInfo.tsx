import type { CalcBlock } from '@/lib/content-types';
import { sanitizeInline } from '@/lib/sanitize-server';

const html = (s: string) => ({ __html: sanitizeInline(s) });

/** Educational write-up under a calculator. Blocks may carry editor formatting, so they are sanitised. */
export default function CalcInfo({ blocks }: { blocks: CalcBlock[] }) {
  return (
    <section className="sec calc-info">
      <div className="ci-wrap">
        {blocks.map((b, i) =>
          typeof b === 'string' ? (
            <p key={i} dangerouslySetInnerHTML={html(b)} />
          ) : 'h' in b ? (
            <h3 key={i} dangerouslySetInnerHTML={html(b.h)} />
          ) : 'f' in b ? (
            <div key={i} className="ci-formula" dangerouslySetInnerHTML={html(b.f)} />
          ) : (
            <ul key={i}>
              {b.ul.map((li, j) => (
                <li key={j} dangerouslySetInnerHTML={html(li)} />
              ))}
            </ul>
          ),
        )}
      </div>
    </section>
  );
}
