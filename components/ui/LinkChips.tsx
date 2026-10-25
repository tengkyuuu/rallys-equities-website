import { Fragment, type CSSProperties } from 'react';

export type LinkChip = { href: string; label: string; /** Marker before the label; defaults to ↗. */ icon?: string };

type Props = {
  items: LinkChip[];
  style?: CSSProperties;
  /** Anchors the editor keys of the chips to a fixed name, so reordering never re-points edits. */
  rekey?: string;
  /** Wrap each label in a stretching span (the layout used on /portal). */
  wrapLabel?: boolean;
};

/** Grid of external-link chips (`.pol-grid` / `.pol-chip`). http(s) links open in a new tab. */
export default function LinkChips({ items, style, rekey, wrapLabel }: Props) {
  return (
    <div className="pol-grid" style={style} data-rekey={rekey}>
      {items.map((c, i) => {
        const external = c.href.startsWith('http');
        return (
          <Fragment key={c.href}>
            {i > 0 && ' '}
            <a
              className="pol-chip"
              href={c.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener' : undefined}
              style={{ textDecoration: 'none', color: 'var(--tx)' }}
            >
              <span className="pn">{c.icon ?? '↗'}</span>
              {wrapLabel ? <span style={{ flex: '1' }}>{c.label}</span> : c.label}
            </a>
          </Fragment>
        );
      })}
    </div>
  );
}
