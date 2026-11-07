'use client';

import Link from 'next/link';

import { toast } from '@/lib/toast';
import { chosen, filled, longEnough, looksLikeEmail, useFields } from './useFields';
import { useSubmission } from './useSubmission';
import FormStatus from './FormStatus';

/** Contact page: scrolls to the message form and puts the cursor in the name field. */
export function BookAppointmentButton() {
  const open = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('cf-name')?.focus(), 600);
  };
  return (
    <button className="bbig bbig-g" style={{ width: '100%', display: 'block', textAlign: 'center' }} onClick={open}>
      Book an appointment
    </button>
  );
}

export default function ContactForm() {
  const f = useFields(['cf-name', 'cf-email', 'cf-phone', 'cf-subj', 'cf-msg'] as const);
  const sub = useSubmission('contact', undefined, f.serverErrors);

  const submit = () => {
    if (
      f.validate([
        ['cf-name', filled],
        ['cf-email', looksLikeEmail],
        ['cf-subj', chosen],
        ['cf-msg', longEnough],
      ]).length
    ) {
      toast('Please complete the highlighted fields.', 'err');
      return;
    }
    sub.send({
      name: f.get('cf-name'),
      email: f.get('cf-email'),
      phone: f.get('cf-phone'),
      subject: f.get('cf-subj'),
      message: f.get('cf-msg'),
    });
  };

  return (
    <>
      <div id="cfBox" style={sub.boxStyle}>
        <div className="fgrid">
          <div className="fg">
            <label className="flbl" htmlFor="cf-name">
              Your Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('cf-name', 'finput')} placeholder="Enter name here" />
            {f.error('cf-name')}
          </div>
          <div className="fg">
            <label className="flbl" htmlFor="cf-email">
              Email Address <span className="req">*</span>
            </label>
            <input type="email" {...f.bind('cf-email', 'finput')} placeholder="Email address" />
            {f.error('cf-email')}
          </div>
        </div>
        <div className="fgrid">
          <div className="fg">
            <label className="flbl" htmlFor="cf-phone">
              Phone (optional)
            </label>
            <input type="tel" {...f.bind('cf-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
            {f.error('cf-phone')}
          </div>
          <div className="fg">
            <label className="flbl" htmlFor="cf-subj">
              Subject <span className="req">*</span>
            </label>
            <select {...f.bind('cf-subj', 'fselect')}>
              <option value="">Select subject</option>
              <option>General Inquiry</option>
              <option>Client Support</option>
              <option>Careers &amp; HR</option>
              <option>Corporate Partnerships</option>
            </select>
            {f.error('cf-subj')}
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl" htmlFor="cf-msg">
            Message <span className="req">*</span>
          </label>
          <textarea {...f.bind('cf-msg', 'ftarea')} placeholder="How can we help?" />
          {f.error('cf-msg')}
        </div>{' '}
        <FormStatus state={sub} />
        <button className="fnext" style={{ width: '100%' }} onClick={submit} disabled={sub.disabled} aria-busy={sub.pending}>
          {sub.pending ? 'Sending…' : sub.remaining > 0 ? `Try again in ${sub.remaining}s` : 'Send Message'}
        </button>
      </div>
      <div style={{ display: sub.done ? 'block' : 'none', textAlign: 'center', padding: '22px 0' }} id="cfDone" role="status" tabIndex={-1}>
        <div style={{ fontSize: '30px', color: 'var(--up)', marginBottom: '8px' }}>✓</div>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: 'var(--tx)' }}>Message received!</div>
        <div style={{ fontSize: '12.5px', color: 'var(--mt)', lineHeight: '1.7', maxWidth: '340px', margin: '0 auto' }}>
          Thank you for reaching out. Our team will get back to you at the email you provided. For urgent matters, call 042-36366667.
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
