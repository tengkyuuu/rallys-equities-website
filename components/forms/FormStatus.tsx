'use client';

import type { useSubmission } from './useSubmission';

export default function FormStatus({ state }: { state: ReturnType<typeof useSubmission> }) {
  if (state.done) return null;
  return (
    <section className="form-status" aria-label="Submission status" aria-live="polite" aria-atomic="true">
      {state.offline ? (
        <p className="form-notice" role="status">
          <strong>You’re offline.</strong> Your details remain on this page. Reconnect to send; keep this tab open.
        </p>
      ) : state.pending ? (
        <div className="form-notice" role="status">
          <strong>{state.progress}</strong>
          {state.slow && <p>This is taking longer than usual. Keep this page open; we’ll show a confirmation when it finishes.</p>}
        </div>
      ) : state.error ? (
        <div className="form-notice form-notice-error" role="alert">
          <strong>{state.error}</strong>
          <p>
            {state.remaining > 0
              ? `Try again in ${state.remaining} seconds. Your details are still here.`
              : 'Your details are still here. Review them and use the send button to try again.'}
          </p>
        </div>
      ) : null}
    </section>
  );
}
