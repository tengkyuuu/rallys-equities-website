import PageHero from '@/components/ui/PageHero';
import { FAQ } from '@/lib/faq';

export default function FaqPage() {
  return (
    <>
      <PageHero
        tag="Miscellaneous"
        title={
          <>
            Frequently Asked <em>Questions</em>
          </>
        }
        lede="Answers about PSX investing, accounts, platforms, and support."
      />
      <section className="sec">
        <div style={{ marginTop: '8px' }} id="misc-faq">
          <div className="faq-list">
            {FAQ.map((it) => (
              <details className="faq-item" key={it.q}>
                <summary>{it.q}</summary>
                <div className="faq-a">{it.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
