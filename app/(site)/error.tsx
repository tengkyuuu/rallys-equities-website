'use client';

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="state-recovery" role="alert">
      <h2>We couldn’t load this page</h2>
      <p>The connection or service may be temporarily unavailable. Try loading it again, or contact our team if you need help.</p>
      <button className="fnext" onClick={reset}>
        Try loading again
      </button>
      <p>
        <a href="/contact">Contact Rallys Equities</a>
      </p>
    </section>
  );
}
