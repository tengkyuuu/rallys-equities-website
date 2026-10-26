import type { CSSProperties, ReactNode } from 'react';

type Props = {
  /** The h2. Wrap highlighted words in <em> / <span>. */
  title: ReactNode;
  /** Optional Urdu line under the title. */
  urdu?: string;
  text: ReactNode;
  /** The buttons (OpenAccount, GoTo…). */
  actions: ReactNode;
  /** Optional row of ✓ reassurance points under the buttons. */
  notes?: string[];
  style?: CSSProperties;
};

/** The full-width "Open an account" call-to-action band that closes a page. */
export default function CtaBlock({ title, urdu, text, actions, notes, style }: Props) {
  return (
    <div className="cta-block" style={style}>
      <div className="cta-inner">
        <h2>{title}</h2>
        {urdu && (
          <>
            {' '}
            <span className="cta-urdu" lang="ur">{urdu}</span>{' '}
          </>
        )}
        <p>{text}</p>
        <div className="cta-btns">{actions}</div>
        {notes && (
          <div className="cta-note">
            {notes.map((n) => (
              <span key={n}>{`✓ ${n}`}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
