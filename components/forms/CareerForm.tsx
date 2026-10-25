'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast';
import { chosen, filled, looksLikeEmail, useFields } from './useFields';
import { useSubmission } from './useSubmission';

export default function CareerForm() {
  const f = useFields(['car-name', 'car-email', 'car-phone', 'car-pos', 'car-cover'] as const);
  const sub = useSubmission('career');
  const [cv, setCv] = useState<File>();

  const submit = () => {
    if (
      f.validate([
        ['car-name', filled],
        ['car-email', looksLikeEmail],
        ['car-pos', chosen],
      ]).length
    ) {
      toast('Please complete the highlighted fields.', 'err');
      return;
    }
    sub.send(
      {
        name: f.get('car-name'),
        email: f.get('car-email'),
        phone: f.get('car-phone'),
        position: f.get('car-pos'),
        coverLetter: f.get('car-cover'),
      },
      cv ? [['cv', cv]] : [],
    );
  };

  return (
    <>
      <div
        style={{
          border: '1px solid var(--gb)',
          borderRadius: '18px',
          padding: '30px',
          background: 'var(--gl)',
          marginTop: '24px',
          ...sub.boxStyle,
        }}
        id="carBox"
      >
        <div className="fgrid">
          <div className="fg">
            <label className="flbl">
              Full Name <span className="req">*</span>
            </label>
            <input type="text" {...f.bind('car-name', 'finput')} placeholder="Enter your full name" />
          </div>
          <div className="fg">
            <label className="flbl">
              Email Address <span className="req">*</span>
            </label>
            <input type="email" {...f.bind('car-email', 'finput')} placeholder="Email address" />
          </div>
        </div>
        <div className="fgrid">
          <div className="fg">
            <label className="flbl">Phone (optional)</label>
            <input type="tel" {...f.bind('car-phone', 'finput')} placeholder="+92-3XX-XXXXXXX" />
          </div>
          <div className="fg">
            <label className="flbl">
              Position <span className="req">*</span>
            </label>
            <select {...f.bind('car-pos', 'fselect')}>
              <option value="">Select position</option>
              <option>Trading Analyst</option>
              <option>Finance Manager</option>
              <option>Customer Support</option>
              <option>Marketing Executive</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl">Cover Letter</label>
          <textarea {...f.bind('car-cover', 'ftarea')} placeholder="Tell us why you'd be a great fit" />
        </div>
        <div className="fg" style={{ marginBottom: '16px' }}>
          <label className="flbl">Upload CV (PDF / DOC)</label>{' '}
          <label
            className="upbox"
            htmlFor="car-cv"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px dashed var(--gb)',
              borderRadius: '10px',
              padding: '14px',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '18px' }}>📎</span>
            <span id="car-cv-lbl" style={{ fontSize: '12px', color: 'var(--mt)' }}>
              {cv ? '✓ ' + cv.name : 'Choose a file (PDF, DOC, DOCX)'}
            </span>
          </label>{' '}
          <input
            type="file"
            id="car-cv"
            accept=".pdf,.doc,.docx,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => setCv(e.target.files?.[0])}
          />
        </div>{' '}
        <button className="fnext" style={{ width: '100%' }} onClick={submit}>
          Submit Application
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
        id="carDone"
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Application received</div>
        <div style={{ fontSize: '12px', color: 'var(--mt)' }}>
          Thank you for your interest in Rallys Equities. If your profile matches an opening, our team will be in touch.
        </div>
      </div>
    </>
  );
}
