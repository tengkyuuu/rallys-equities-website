'use client';

import Link from 'next/link';

import { toast } from '@/lib/toast';
import { chosen, filled, longEnough, looksLikeEmail, useFields } from './useFields';
import { useSubmission } from './useSubmission';
import FormStatus from './FormStatus';

export default function FeedbackForm() {
  const f = useFields(['fb-name', 'fb-email', 'fb-phone', 'fb-cat', 'fb-msg'] as const);
  const sub = useSubmission('feedback', undefined, f.serverErrors);

  const submit = () => {
    if (
      f.validate([
        ['fb-name', filled],
        ['fb-email', looksLikeEmail],
        ['fb-cat', chosen],
        ['fb-msg', longEnough],
      ]).length
    ) {
      toast('Please complete the highlighted fields.', 'err');
      return;
    }
    sub.send({
      name: f.get('fb-name'),
      email: f.get('fb-email'),
      phone: f.get('fb-phone'),
      category: f.get('fb-cat'),
      message: f.get('fb-msg'),
    });
  };

  return (
    <>
      <div
        style={{ border: '1px solid var(--gb)', borderRadius: '18px', padding: '42px', background: 'var(--gl)', ...sub.boxStyle }}
        id="fbBox"
      >
        <div className="fgrid">
          <div className="fg">
            <label className="flbl" htmlFor="fb-name">
              Full Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('fb-name', 'finput')} placeholder="Enter your full name" />
            {f.error('fb-name')}
          </div>
          <div className="fg">
            <label className="flbl" htmlFor="fb-email">
              Email Address <span className="req">*</span>
            </label>
            <input type="email" {...f.bind('fb-email', 'finput')} placeholder="Email address" />
            {f.error('fb-email')}
          </div>
        </div>
        <div className="fgrid">
          <div className="fg">
            <label className="flbl" htmlFor="fb-phone">
              Phone (optional)
            </label>
            <input type="tel" {...f.bind('fb-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
            {f.error('fb-phone')}
          </div>
          <div className="fg">
            <label className="flbl" htmlFor="fb-cat">
              Feedback Category <span className="req">*</span>
            </label>
            <select {...f.bind('fb-cat', 'fselect')}>
              <option value="">Select category</option>
              <option>General Feedback</option>
              <option>Service Quality</option>
              <option>Trading Platform Experience</option>
              <option>Customer Support Experience</option>
              <option>Account Opening Process</option>
              <option>Website Usability</option>
              <option>Investment &amp; Research Tools</option>
              <option>Suggestions for Improvement</option>
              <option>Other</option>
            </select>
            {f.error('fb-cat')}
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl" htmlFor="fb-msg">
            Feedback Details <span className="req">*</span>
          </label>
          <textarea {...f.bind('fb-msg', 'ftarea')} placeholder="Share your feedback in detail" />
          {f.error('fb-msg')}
        </div>{' '}
        <FormStatus state={sub} />
        <button className="fnext" style={{ width: '100%' }} onClick={submit} disabled={sub.disabled} aria-busy={sub.pending}>
          {sub.pending ? 'Sending…' : sub.remaining > 0 ? `Try again in ${sub.remaining}s` : 'Submit Feedback'}
        </button>
      </div>
      <div
        style={{
          display: sub.done ? 'block' : 'none',
          border: '1px solid color-mix(in srgb, var(--up) 35%, transparent)',
          borderRadius: '18px',
          padding: '36px',
          background: 'color-mix(in srgb, var(--up) 7%, transparent)',
          marginTop: '24px',
          textAlign: 'center',
        }}
        id="fbDone"
        role="status"
        tabIndex={-1}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Feedback received</div>
        <div style={{ fontSize: '12px', color: 'var(--mt)' }}>Thank you for helping us improve. We read every submission.</div>
        {sub.done && (
          <Link className="form-next-link" href="/">
            Return to home
          </Link>
        )}
      </div>
    </>
  );
}
