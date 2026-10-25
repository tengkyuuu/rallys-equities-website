import type { ReactNode } from 'react';

/** Two-column support layout: the form on the left, a help card on the right (stacks on mobile). */
export default function FormWithAside({ form, aside }: { form: ReactNode; aside: ReactNode }) {
  return (
    <section className="sec" style={{ maxWidth: '1160px', margin: '0 auto' }}>
      <div className="ctc-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '40px', alignItems: 'start' }}>
        <div>{form}</div>
        {aside}
      </div>
    </section>
  );
}
