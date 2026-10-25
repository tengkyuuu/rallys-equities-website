import type { ReactNode } from 'react';
import FeatureList, { type Feature } from '@/components/ui/FeatureList';
import SectionTitle from '@/components/ui/SectionTitle';

export type Showcase = {
  /** Anchor id, linked from the nav and footer (e.g. /services#svc-trading). */
  id: string;
  /** Put the illustration on the left. */
  reverse?: boolean;
  tag: string;
  title: ReactNode;
  text: ReactNode;
  urdu?: string;
  features: Feature[];
  /** The call-to-action button. */
  action: ReactNode;
  /** The animated illustration beside the copy (components/services/visuals). */
  illustration: ReactNode;
};

/** One headline service on /services: copy, three features and a button beside an illustration. */
export default function ServiceShowcase({ s }: { s: Showcase }) {
  return (
    <div className={s.reverse ? 'sdg rev' : 'sdg'} id={s.id}>
      <div>
        <SectionTitle tag={s.tag} as="h3" size={34}>
          {s.title}
        </SectionTitle>
        <p className="sub">{s.text}</p>
        {s.urdu && (
          <>
            {' '}
            <span className="urdu">{s.urdu}</span>{' '}
          </>
        )}
        <FeatureList items={s.features} /> {s.action}
      </div>
      <div className="sdi">{s.illustration}</div>
    </div>
  );
}
