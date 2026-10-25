'use client';

import { toast } from '@/lib/toast';
import { chosen, filled, longEnough, looksLikeEmail, useFields } from './useFields';
import { useSubmission } from './useSubmission';

export default function ComplaintForm() {
  const f = useFields(['cmp-name', 'cmp-email', 'cmp-phone', 'cmp-cat', 'cmp-msg'] as const);
  const sub = useSubmission('complaint');

  const submit = () => {
    if (
      f.validate([
        ['cmp-name', filled],
        ['cmp-email', looksLikeEmail],
        ['cmp-cat', chosen],
        ['cmp-msg', longEnough],
      ]).length
    ) {
      toast('Please complete the highlighted fields.', 'err');
      return;
    }
    sub.send({
      name: f.get('cmp-name'),
      email: f.get('cmp-email'),
      phone: f.get('cmp-phone'),
      category: f.get('cmp-cat'),
      message: f.get('cmp-msg'),
    });
  };

  return (
    <>
      <div
        style={{ border: '1px solid var(--gb)', borderRadius: '18px', padding: '42px', background: 'var(--gl)', ...sub.boxStyle }}
        id="cmpBox"
      >
        <div className="fgrid">
          <div className="fg">
            <label className="flbl">
              Full Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('cmp-name', 'finput')} placeholder="Enter your full name" />
          </div>
          <div className="fg">
            <label className="flbl">
              Email Address <span className="req">*</span>
            </label>
            <input type="email" {...f.bind('cmp-email', 'finput')} placeholder="Email address" />
          </div>
        </div>
        <div className="fgrid">
          <div className="fg">
            <label className="flbl">Phone (optional)</label>
            <input type="tel" {...f.bind('cmp-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
          </div>
          <div className="fg">
            <label className="flbl">
              Complaint Category <span className="req">*</span>
            </label>
            <select {...f.bind('cmp-cat', 'fselect')}>
              <option value="">Select category</option>
              <option>Account / Login Issues</option>
              <option>Transaction Problem</option>
              <option>Customer Service</option>
              <option>Financial Guidance Issue</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl">
            Complaint Details <span className="req">*</span>
          </label>
          <textarea {...f.bind('cmp-msg', 'ftarea')} placeholder="Describe your complaint in detail" />
        </div>{' '}
        <button className="fnext" style={{ width: '100%' }} onClick={submit}>
          Submit Complaint
        </button>
      </div>
      <div
        style={{
          display: sub.done ? 'block' : 'none',
          border: '1px solid color-mix(in srgb, var(--up) 35%, transparent)',
          borderRadius: '18px',
          padding: '36px',
          background: 'color-mix(in srgb, var(--up) 7%, transparent)',
          textAlign: 'center',
        }}
        id="cmpDone"
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Complaint received</div>
        <div style={{ fontSize: '12px', color: 'var(--mt)' }}>
          We've logged your complaint and our compliance team will respond at the email you provided. For urgent matters, call 042-36366667.
        </div>
      </div>
    </>
  );
}
