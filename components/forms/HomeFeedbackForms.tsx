'use client';

import { toast } from '@/lib/toast';
import { chosen, filled, longEnough, looksLikeEmail, useFields } from './useFields';
import { useSubmission } from './useSubmission';

/* Bottom-of-home pair. Same kinds and payload shape as the dedicated Feedback and
   Complaints pages, so the alert email and the admin inbox render them identically.
   Feedback keeps Email optional (we can't reply without one, but the client's field
   list omitted it), so it is only checked when something was typed. */

const INCOMPLETE = 'Please complete the highlighted fields.';

export function HomeFeedbackForm() {
  const f = useFields(['hfb-name', 'hfb-phone', 'hfb-email', 'hfb-subj', 'hfb-msg'] as const);
  const sub = useSubmission('feedback');

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
            <label className="flbl">
              Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('hfb-name', 'finput')} placeholder="Your full name" />
          </div>
          <div className="fg">
            <label className="flbl">Contact Number (optional)</label>
            <input type="tel" {...f.bind('hfb-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl">Email (optional)</label>
          <input type="email" {...f.bind('hfb-email', 'finput')} placeholder="So we can reply to you" />
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl">
            Subject <span className="req">*</span>
          </label>
          <input type="text" {...f.bind('hfb-subj', 'finput')} placeholder="What is this about?" />
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl">
            Message / Feedback <span className="req">*</span>
          </label>
          <textarea {...f.bind('hfb-msg', 'ftarea')} placeholder="Tell us what you think" />
        </div>{' '}
        <button className="fnext" style={{ width: '100%' }} onClick={submit}>
          Submit Feedback
        </button>
      </div>
      <div className="fbc-done" id="hfbDone" style={sub.doneStyle}>
        <div style={{ fontSize: '26px', marginBottom: '6px' }}>✓</div>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Feedback received</div>
        <div style={{ fontSize: '12px', color: 'var(--mt)' }}>Thank you for helping us improve. We read every submission.</div>
      </div>
    </>
  );
}

export function HomeComplaintForm() {
  const f = useFields(['hcmp-name', 'hcmp-email', 'hcmp-phone', 'hcmp-cat', 'hcmp-msg'] as const);
  const sub = useSubmission('complaint');

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
            <label className="flbl">
              Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('hcmp-name', 'finput')} placeholder="Your full name" />
          </div>
          <div className="fg">
            <label className="flbl">
              Email <span className="req">*</span>
            </label>
            <input type="email" {...f.bind('hcmp-email', 'finput')} placeholder="Email address" />
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl">Contact Number (optional)</label>
          <input type="tel" {...f.bind('hcmp-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
        </div>
        <div className="fg" style={{ marginBottom: '14px' }}>
          <label className="flbl">
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
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl">
            Details of complaint <span className="req">*</span>
          </label>
          <textarea {...f.bind('hcmp-msg', 'ftarea')} placeholder="Describe what happened, with dates if possible" />
        </div>{' '}
        <button className="fnext" style={{ width: '100%' }} onClick={submit}>
          Submit Complaint
        </button>
      </div>
      <div className="fbc-done" id="hcmpDone" style={sub.doneStyle}>
        <div style={{ fontSize: '26px', marginBottom: '6px' }}>✓</div>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Complaint logged</div>
        <div style={{ fontSize: '12px', color: 'var(--mt)' }}>
          Our compliance team will review it and respond. Keep an eye on your email.
        </div>
      </div>
    </>
  );
}
