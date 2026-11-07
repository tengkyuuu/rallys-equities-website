'use client';

import Link from 'next/link';

import { toast } from '@/lib/toast';
import { chosen, filled, longEnough, looksLikeEmail, useFields } from './useFields';
import { useSubmission } from './useSubmission';
import FormStatus from './FormStatus';

/* Bottom-of-home pair. Same kinds and payload shape as the dedicated Feedback and
   Complaints pages, so the alert email and the admin inbox render them identically.
   Feedback keeps Email optional (we can't reply without one, but the client's field
   list omitted it), so it is only checked when something was typed. */

const INCOMPLETE = 'Please complete the highlighted fields.';

export function HomeFeedbackForm() {
  const f = useFields(['hfb-name', 'hfb-phone', 'hfb-email', 'hfb-subj', 'hfb-msg'] as const);
  const sub = useSubmission('feedback', undefined, f.serverErrors);

  const submit = () => {
    if (
      f.validate([
        ['hfb-name', filled],
        ['hfb-subj', filled],
        ['hfb-msg', longEnough],
        ['hfb-email', (v) => v === '' || looksLikeEmail(v)],
      ]).length
    ) {
      toast(INCOMPLETE, 'err');
      return;
    }
    sub.send({
      name: f.get('hfb-name'),
      email: f.get('hfb-email'),
      phone: f.get('hfb-phone'),
      subject: f.get('hfb-subj'),
      message: f.get('hfb-msg'),
      category: 'General Feedback',
      source: 'Home page',
    });
  };

  return (
    <>
      <div className="fbc-card" id="hfbBox" style={sub.boxStyle}>
        <div className="fgrid">
          <div className="fg">
            <label className="flbl" htmlFor="hfb-name">
              Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('hfb-name', 'finput')} placeholder="Your full name" />
            {f.error('hfb-name')}
          </div>
          <div className="fg">
            <label className="flbl" htmlFor="hfb-phone">
              Contact Number (optional)
            </label>
            <input type="tel" {...f.bind('hfb-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
            {f.error('hfb-phone')}
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl" htmlFor="hfb-email">
            Email (optional)
          </label>
          <input type="email" {...f.bind('hfb-email', 'finput')} placeholder="So we can reply to you" />
          {f.error('hfb-email')}
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl" htmlFor="hfb-subj">
            Subject <span className="req">*</span>
          </label>
          <input type="text" {...f.bind('hfb-subj', 'finput')} placeholder="What is this about?" />
          {f.error('hfb-subj')}
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl" htmlFor="hfb-msg">
            Message / Feedback <span className="req">*</span>
          </label>
          <textarea {...f.bind('hfb-msg', 'ftarea')} placeholder="Tell us what you think" />
          {f.error('hfb-msg')}
        </div>{' '}
        <FormStatus state={sub} />
        <button className="fnext" style={{ width: '100%' }} onClick={submit} disabled={sub.disabled} aria-busy={sub.pending}>
          {sub.pending ? 'Sending…' : sub.remaining > 0 ? `Try again in ${sub.remaining}s` : 'Submit Feedback'}
        </button>
      </div>
      <div className="fbc-done" id="hfbDone" role="status" tabIndex={-1} style={sub.doneStyle}>
        <div style={{ fontSize: '26px', marginBottom: '6px' }}>✓</div>
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

export function HomeComplaintForm() {
  const f = useFields(['hcmp-name', 'hcmp-email', 'hcmp-phone', 'hcmp-cat', 'hcmp-msg'] as const);
  const sub = useSubmission('complaint', undefined, f.serverErrors);

  const submit = () => {
    if (
      f.validate([
        ['hcmp-name', filled],
        ['hcmp-email', looksLikeEmail],
        ['hcmp-cat', chosen],
        ['hcmp-msg', longEnough],
      ]).length
    ) {
      toast(INCOMPLETE, 'err');
      return;
    }
    sub.send({
      name: f.get('hcmp-name'),
      email: f.get('hcmp-email'),
      phone: f.get('hcmp-phone'),
      category: f.get('hcmp-cat'),
      message: f.get('hcmp-msg'),
      source: 'Home page',
    });
  };

  return (
    <>
      <div className="fbc-card" id="hcmpBox" style={sub.boxStyle}>
        <div className="fgrid">
          <div className="fg">
            <label className="flbl" htmlFor="hcmp-name">
              Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('hcmp-name', 'finput')} placeholder="Your full name" />
            {f.error('hcmp-name')}
          </div>
          <div className="fg">
            <label className="flbl" htmlFor="hcmp-email">
              Email <span className="req">*</span>
            </label>
            <input type="email" {...f.bind('hcmp-email', 'finput')} placeholder="Email address" />
            {f.error('hcmp-email')}
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl" htmlFor="hcmp-phone">
            Contact Number (optional)
          </label>
          <input type="tel" {...f.bind('hcmp-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
          {f.error('hcmp-phone')}
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl" htmlFor="hcmp-cat">
            Category <span className="req">*</span>
          </label>
          <select {...f.bind('hcmp-cat', 'fselect')}>
            <option value="">Select category</option>
            <option>Account / Login Issues</option>
            <option>Transaction Problem</option>
            <option>Customer Service</option>
            <option>Financial Guidance Issue</option>
            <option>Other</option>
          </select>
          {f.error('hcmp-cat')}
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl" htmlFor="hcmp-msg">
            Details of complaint <span className="req">*</span>
          </label>
          <textarea {...f.bind('hcmp-msg', 'ftarea')} placeholder="Describe what happened, with dates if possible" />
          {f.error('hcmp-msg')}
        </div>{' '}
        <FormStatus state={sub} />
        <button className="fnext" style={{ width: '100%' }} onClick={submit} disabled={sub.disabled} aria-busy={sub.pending}>
          {sub.pending ? 'Sending…' : sub.remaining > 0 ? `Try again in ${sub.remaining}s` : 'Submit Complaint'}
        </button>
      </div>
      <div className="fbc-done" id="hcmpDone" role="status" tabIndex={-1} style={sub.doneStyle}>
        <div style={{ fontSize: '26px', marginBottom: '6px' }}>✓</div>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Complaint logged</div>
        <div style={{ fontSize: '12px', color: 'var(--mt)' }}>
          Our compliance team will review it and respond. Keep an eye on your email.
        </div>
        {sub.done && (
          <Link className="form-next-link" href="/">
            Return to home
          </Link>
        )}
      </div>
    </>
  );
}
