import { Fragment, type CSSProperties } from 'react';
import DocButton from '@/components/actions/DocButton';
import { POLICY_DOCS, POLICY_SHORT_TITLES, type PolicySlug } from '@/lib/policies';

const SLUGS = Object.keys(POLICY_DOCS) as PolicySlug[];

type Props = {
  /** 'numbered': 01–11 with full titles (/policies). 'compact': ↓ with short titles (/downloads). */
  variant: 'numbered' | 'compact';
  /** Anchors the editor keys of the chips to a fixed name, so reordering never re-points edits. */
  rekey: string;
  style?: CSSProperties;
};

/** Every published policy as a grid of chips; each opens the view-only document viewer. */
export default function PolicyDocList({ variant, rekey, style }: Props) {
  const numbered = variant === 'numbered';
  return (
    <div className="pol-grid" style={style} data-rekey={rekey}>
      {SLUGS.map((slug, i) => (
        <Fragment key={slug}>
          {i > 0 && ' '}
          <DocButton slug={slug} type="button" className="pol-chip" style={{ textDecoration: 'none', color: 'var(--tx)' }}>
            <span className="pn">{numbered ? String(i + 1).padStart(2, '0') : '↓'}</span>
            <span style={{ flex: '1' }}>{numbered ? POLICY_DOCS[slug] : (POLICY_SHORT_TITLES[slug] ?? POLICY_DOCS[slug])}</span>
            <span className="pdf-tag">{numbered ? 'VIEW ↗' : 'VIEW'}</span>
          </DocButton>
        </Fragment>
      ))}
    </div>
  );
}
