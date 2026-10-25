import type { ReactNode } from 'react';

type Props = {
  /** Small uppercase label above the title ("About Us", "Investor Relations"…). */
  tag: ReactNode;
  /** The h1. Wrap the highlighted words in <em> (gold) and <span> (emerald). */
  title: ReactNode;
  lede: ReactNode;
  /** 'bull' adds the market-chart backdrop used on /markets. */
  variant?: 'bull';
};

/** The banner at the top of every inner page. */
export default function PageHero({ tag, title, lede, variant }: Props) {
  return (
    <section className={variant ? `phero phero-${variant}` : 'phero'}>
      <div className="stag">{tag}</div>
      <h1>{title}</h1>
      <p>{lede}</p>
    </section>
  );
}
