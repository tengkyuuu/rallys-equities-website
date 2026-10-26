'use client';

import { useRef, useState, type CSSProperties } from 'react';
import GoTo from '@/components/nav/GoTo';
import { submitErrorMessage, submitForm } from '@/lib/forms/submit';
import type { FormOption } from '@/lib/pricing';
import { toast } from '@/lib/toast';
import { filled, looksLikeEmail, useFields } from './useFields';

/* Online account application: five steps, then a reference number. Step 1 is validated
   here (and every field again on the server). Documents upload straight to storage. */

const FIELD_IDS = [
  'f-fn',
  'f-ln',
  'f-fn2',
  'f-cnic',
  'f-dob',
  'f-gender',
  'f-mob',
  'f-email',
  'f-addr',
  'f-city',
  'f-prov',
  'f-emp',
  'f-employer',
  'f-income',
  'f-src',
  'f-bank',
  'f-iban',
  'f-exp',
  'f-obj',
] as const;

/** 12345-1234567-1 as you type */
function formatCnic(raw: string) {
  const v = raw.replace(/\D/g, '');
  if (v.length <= 5) return v;
  if (v.length <= 12) return v.slice(0, 5) + '-' + v.slice(5);
  return v.slice(0, 5) + '-' + v.slice(5, 12) + '-' + v.slice(12, 13);
}

const STEPS = [
  ['Personal Information', 'CNIC, name, contact'],
  ['Financial Details', 'Income, employment, bank'],
  ['Account Preferences', 'Account type, Halal'],
  ['Upload Documents', 'CNIC, address proof'],
  ['Review & Submit', 'Confirm everything'],
] as const;

const AC_TYPES = [
  { val: 'standard', priceColor: 'var(--g3)' },
  { val: 'halal', priceColor: 'var(--g3)' },
  { val: 'premium', priceColor: 'var(--au)' },
] as const;
type AcType = (typeof AC_TYPES)[number]['val'];

const RISKS = [
  { val: 'conservative', name: 'Conservative', desc: 'Low risk, steady returns' },
  { val: 'moderate', name: 'Moderate', desc: 'Balanced risk and growth' },
  { val: 'aggressive', name: 'Aggressive', desc: 'High risk, high potential' },
] as const;
type Risk = (typeof RISKS)[number]['val'];

const EXTRA_SERVICES = [
  'Receive PSX market alerts via SMS/WhatsApp',
  'Subscribe to Rallys weekly research reports',
  'Enroll in free investor education program (Urdu available)',
  'Request callback from a relationship manager',
];

const UPLOADS = [
  {
    field: 'cnicFront',
    id: 'uf-cnicF',
    label: 'CNIC — Front Side',
    title: 'Upload CNIC Front',
    sub: 'JPG, PNG or PDF · Max 5MB',
    accept: '.jpg,.jpeg,.png,.pdf',
  },
  {
    field: 'cnicBack',
    id: 'uf-cnicB',
    label: 'CNIC — Back Side',
    title: 'Upload CNIC Back',
    sub: 'JPG, PNG or PDF · Max 5MB',
    accept: '.jpg,.jpeg,.png,.pdf',
  },
  {
    field: 'addressProof',
    id: 'uf-addr',
    label: 'Proof of Address',
    title: 'Upload Proof of Address',
    sub: 'JPG, PNG or PDF · Max 5MB',
    accept: '.jpg,.jpeg,.png,.pdf',
    hint: 'Utility bill, bank statement or rental agreement (last 3 months)',
  },
  {
    field: 'photo',
    id: 'uf-photo',
    label: 'Passport-size Photo',
    title: 'Upload Photograph',
    sub: 'JPG or PNG · Max 2MB',
    accept: '.jpg,.jpeg,.png',
    hint: 'Recent colour photo, white background',
  },
] as const;

const STEP_ACTIVE: CSSProperties = { background: 'var(--g)', color: '#fff', borderColor: 'var(--g)' };
const STEP_DONE: CSSProperties = { background: 'rgba(46,204,138,.15)', color: 'var(--up)', borderColor: 'rgba(46,204,138,.3)' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const top = () => window.scrollTo({ top: 0, behavior: 'instant' });

const UPLOAD_ICON = (
  <div className="upload-icon">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3L10 13M6 7L10 3L14 7" stroke="var(--g3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="14" width="14" height="3" rx="1" fill="rgba(18,184,124,.2)" stroke="var(--g3)" strokeWidth="1" />
    </svg>
  </div>
);

function Field({ label, req, children, err }: { label: string; req?: boolean; children: React.ReactNode; err?: string }) {
  return (
    <div className="fg">
      <label className="flbl">
        {label}
        {req && (
          <>
            {' '}
            <span className="req">*</span>
          </>
        )}
      </label>
      {children}
      {err && <div className="ferr">{err}</div>}
    </div>
  );
}

function Options({ placeholder, options }: { placeholder: string; options: string[] }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </>
  );
}

function Nav({ back, next, onBack, onNext }: { back?: boolean; next: string; onBack?: () => void; onNext: () => void }) {
  return (
    <div className="fnav">
      {back ? (
        <button className="fprev" onClick={onBack}>
          ← Back
        </button>
      ) : (
        <div />
      )}
      <button className="fnext" onClick={onNext}>
        {next}
      </button>
    </div>
  );
}

function ReviewRow({ k, v, id }: { k: string; v: string; id: string }) {
  return (
    <div className="rv-row">
      <span className="rv-k">{k}</span>
      <span className="rv-v" id={id}>
        {v || '—'}
      </span>
    </div>
  );
}

export default function AccountOpening({ options }: { options: Record<string, FormOption> }) {
  const f = useFields(FIELD_IDS, { 'f-cnic': formatCnic });
  const [step, setStep] = useState(1);
  const [navigated, setNavigated] = useState(false); // the original only styled the step circles after the first move
  const [acType, setAcType] = useState<AcType>('standard');
  const [risk, setRisk] = useState<Risk>('moderate');
  const [lang, setLang] = useState<'english' | 'urdu'>('english');
  const [extras, setExtras] = useState([true, false, false, false]);
  const [consent, setConsent] = useState([false, false, false]);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [reference, setReference] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const sending = useRef(false);

  const go = (n: number) => {
    setStep(n);
    setNavigated(true);
    top();
  };

  const next = (n: number) => {
    if (n === 1) {
      const bad = f.validate([
        ['f-fn', filled],
        ['f-ln', filled],
        ['f-cnic', (v) => v.replace(/\D/g, '').length === 13],
        ['f-mob', (v) => v.length > 8],
        ['f-email', looksLikeEmail],
      ]);
      if (bad.length) {
        document.getElementById(bad[0])?.focus();
        return;
      }
    }
    go(n + 1);
  };

  const submit = async () => {
    if (!consent.every(Boolean)) {
      toast('Please tick all three consent boxes before submitting.', 'err');
      return;
    }
    if (sending.current) return;
    sending.current = true;
    const g = f.get;
    const ref = `RE-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload = {
      reference: ref,
      firstName: g('f-fn'),
      lastName: g('f-ln'),
      fatherOrHusband: g('f-fn2'),
      cnic: g('f-cnic'),
      dob: g('f-dob'),
      gender: g('f-gender'),
      mobile: g('f-mob'),
      email: g('f-email'),
      address: g('f-addr'),
      city: g('f-city'),
      province: g('f-prov'),
      employment: g('f-emp'),
      employer: g('f-employer'),
      income: g('f-income'),
      sourceOfFunds: g('f-src'),
      bank: g('f-bank'),
      iban: g('f-iban'),
      experience: g('f-exp'),
      objective: g('f-obj'),
      accountType: acType,
      riskTolerance: risk,
      language: lang,
      services: EXTRA_SERVICES.filter((_, i) => extras[i]).join('; '),
    };
    const attached = UPLOADS.flatMap((u) => (files[u.field] ? [[u.field, files[u.field]!] as [string, File]] : []));
    try {
      await submitForm('application', payload, attached);
      setReference(ref);
      top();
    } catch (e) {
      toast(submitErrorMessage(e, 'submit your application'), 'err');
    } finally {
      sending.current = false;
    }
  };

  const v = f.values;
  // the review panel is filled in from the first render, exactly as the original did on page open
  const dash = (s: string) => s.trim() || '—';
  const sel = (id: (typeof FIELD_IDS)[number], base: 'finput' | 'fselect' | 'ftarea' = 'fselect') => f.bind(id, base);

  return (
    <div className="ao-wrap">
      {/* Sidebar */}
      <div className="ao-side">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div className="lm-img">
            <img src="/assets/img/logo.png" alt="Rallys Equities logo" data-edit-img="brand.logo" />
          </div>
          <div>
            <span className="lt-main">Rallys Equities</span>
            <span className="lt-sub">Account Opening</span>
          </div>
        </div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: '700',
            color: 'var(--au)',
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Your Progress
        </div>
        <div className="ao-steps-list" id="sideSteps">
          {STEPS.map(([title, sub], i) => {
            const n = i + 1,
              state = n === step ? 'active' : n < step ? 'done' : '';
            return [
              i > 0 && <div className="ao-connector" key={'c' + n} />,
              <div className={`ao-step${state ? ' ' + state : ''}`} id={`ao-s${n}`} key={n}>
                <div
                  className="ao-step-n"
                  id={`ao-n${n}`}
                  style={navigated ? (state === 'active' ? STEP_ACTIVE : state === 'done' ? STEP_DONE : undefined) : undefined}
                >
                  {state === 'done' ? '✓' : n}
                </div>
                <div>
                  <div className="ao-step-title">{title}</div>
                  <div className="ao-step-sub">{sub}</div>
                </div>
              </div>,
            ];
          })}
        </div>
        <div className="ao-trust">
          <div className="ao-tb">
            <div className="ao-tbi">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L10 3L10 7Q10 10 6 11Q2 10 2 7L2 3Z" stroke="var(--g3)" strokeWidth="1.2" fill="none" />
                <path d="M4 6L5.5 7.5L8 5" stroke="var(--g3)" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </div>
            SECP Regulated &amp; Compliant
          </div>
          <div className="ao-tb">
            <div className="ao-tbi">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="2" y="4" width="8" height="7" rx="1" stroke="var(--g3)" strokeWidth="1.1" />
                <path d="M4 4L4 3Q4 1 6 1Q8 1 8 3L8 4" stroke="var(--g3)" strokeWidth="1.1" fill="none" />
              </svg>
            </div>
            256-bit SSL encrypted
          </div>
          <div className="ao-tb">
            <div className="ao-tbi">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="5" r="2.5" stroke="var(--g3)" strokeWidth="1.1" />
                <path
                  d="M1.5 11C1.5 8.5 3.5 7 6 7C8.5 7 10.5 8.5 10.5 11"
                  stroke="var(--g3)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            CDC registered protection
          </div>
          <div className="ao-tb">
            <div className="ao-tbi">🕌</div>Shariah-compliant investing
          </div>
        </div>
        <div
          style={{
            marginTop: '18px',
            padding: '14px',
            borderRadius: '12px',
            background: 'color-mix(in srgb, var(--au) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--au) 15%, transparent)',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--au)', marginBottom: '6px' }}>Need Help?</div>
          <div style={{ fontSize: '11px', color: 'var(--mt)', lineHeight: '1.7' }}>
            📞 <span style={{ color: 'var(--g3)' }}>042-36366667 · 0316-9991907</span>
            <br />
            📧 hello@rallysequities.com
            <br />
            🏢 Visit us at LSE Building, Lahore
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px' }}>
            <a
              href="https://aof.eclear.com.pk/repl"
              target="_blank"
              rel="noopener"
              style={{ color: 'var(--g3)', textDecoration: 'underline' }}
            >
              Or apply via the official PSX eClear portal ↗
            </a>
          </div>
        </div>
      </div>
      {/* Main Form */}
      <div className="ao-main">
        {/* the page heading for search engines and screen readers; the form steps carry the visible titles */}
        <h1 className="sr-only">Open your Rallys Equities account</h1>
        <div className="prog-bar">
          <div className="prog-fill" id="progFill" style={{ width: (reference ? 100 : (step / 5) * 100) + '%' }} />
        </div>
        {/* SUCCESS SCREEN */}
        <div id="successScr" className={`success-scr${reference ? ' show' : ''}`}>
          <div className="success-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M10 18L15 23L26 12" stroke="var(--up)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="success-title">
            Application <em>Submitted!</em>
          </h2>
          <p className="success-sub">
            Congratulations! Your Rallys Equities account application has been received. Our compliance team will review your documents
            within <strong>1–2 business days</strong>.
          </p>
          <div className="success-ref">
            <div className="success-ref-lbl">Application Reference</div>
            <div className="success-ref-val" id="refNum">
              {reference ?? 'RE-2026-XXXXX'}
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--mt)', marginBottom: '24px' }}>
            Confirmation sent to your email and WhatsApp. Quote this reference for any queries.
          </p>
          <div className="nxt-steps">
            <div className="nxt-step">
              <div className="nxt-n">1</div>
              <div className="nxt-title">Document Verification</div>
              <div className="nxt-desc">Compliance team verifies your CNIC and address proof within 24 hours.</div>
            </div>
            <div className="nxt-step">
              <div className="nxt-n">2</div>
              <div className="nxt-title">CDC Account Creation</div>
              <div className="nxt-desc">Your Central Depository Company investor account is created automatically.</div>
            </div>
            <div className="nxt-step">
              <div className="nxt-n">3</div>
              <div className="nxt-title">Fund &amp; Start Trading</div>
              <div className="nxt-desc">Transfer funds via bank/Easypaisa and start trading PSX stocks immediately.</div>
            </div>
          </div>{' '}
          <GoTo as="button" page="home" className="bbig bbig-g" style={{ marginTop: '32px' }}>
            Return to Home
          </GoTo>
        </div>
        {/* FORM BODY */}
        <div id="formBody" style={reference ? { display: 'none' } : undefined}>
          {/* STEP 1: Personal */}
          <div className={`fsec${step === 1 ? ' active' : ''}`} id="step1">
            <div className="ao-fh">
              <h2>
                Personal <em>Information</em>
              </h2>
              <p>Provide your details exactly as they appear on your CNIC. Fields marked * are required.</p>
            </div>
            <div className="fgrid">
              <Field label="First Name" req err="Please enter your first name">
                <input type="text" {...f.bind('f-fn', 'finput')} placeholder="e.g. Ahmed" />
              </Field>
              <Field label="Last Name" req err="Please enter your last name">
                <input type="text" {...f.bind('f-ln', 'finput')} placeholder="e.g. Khan" />
              </Field>
            </div>
            <div className="fgrid">
              <Field label="Father's / Husband's Name" req>
                <input type="text" {...f.bind('f-fn2', 'finput')} placeholder="As on CNIC" />
              </Field>
              <Field label="CNIC Number" req err="Enter valid 13-digit CNIC">
                <input type="text" {...f.bind('f-cnic', 'finput')} placeholder="XXXXX-XXXXXXX-X" maxLength={15} />
              </Field>
            </div>
            <div className="fgrid">
              <Field label="Date of Birth" req>
                <input type="date" {...f.bind('f-dob', 'finput')} />
              </Field>
              <Field label="Gender" req>
                <select {...sel('f-gender')}>
                  <Options placeholder="Select gender" options={['Male', 'Female', 'Prefer not to say']} />
                </select>
              </Field>
            </div>
            <div className="fgrid">
              <Field label="Mobile Number" req err="Enter valid Pakistani mobile number">
                <input type="tel" {...f.bind('f-mob', 'finput')} placeholder="+92-3XX-XXXXXXX" />
              </Field>
              <Field label="Email Address" req err="Enter a valid email address">
                <input type="email" {...f.bind('f-email', 'finput')} placeholder="your@email.com" />
              </Field>
            </div>
            <div className="fg full" style={{ marginBottom: '16px' }}>
              <label className="flbl">
                Residential Address <span className="req">*</span>
              </label>
              <textarea {...f.bind('f-addr', 'ftarea')} placeholder="House/Flat No., Street, Area, City" />
            </div>
            <div className="fgrid">
              <Field label="City" req>
                <select {...sel('f-city')}>
                  <Options
                    placeholder="Select city"
                    options={[
                      'Karachi',
                      'Lahore',
                      'Islamabad',
                      'Rawalpindi',
                      'Faisalabad',
                      'Peshawar',
                      'Quetta',
                      'Multan',
                      'Hyderabad',
                      'Other',
                    ]}
                  />
                </select>
              </Field>
              <Field label="Province" req>
                <select {...sel('f-prov')}>
                  <Options
                    placeholder="Select province"
                    options={['Sindh', 'Punjab', 'KPK', 'Balochistan', 'Islamabad (ICT)', 'Gilgit-Baltistan', 'AJK']}
                  />
                </select>
              </Field>
            </div>
            <Nav next="Next: Financial Details →" onNext={() => next(1)} />
          </div>
          {/* STEP 2: Financial */}
          <div className={`fsec${step === 2 ? ' active' : ''}`} id="step2">
            <div className="ao-fh">
              <h2>
                Financial <em>Details</em>
              </h2>
              <p>Required by SECP regulations for KYC compliance. All data is encrypted and secure.</p>
            </div>
            <div className="fgrid">
              <Field label="Employment Status" req>
                <select {...sel('f-emp')}>
                  <Options
                    placeholder="Select status"
                    options={[
                      'Employed (Private Sector)',
                      'Employed (Government)',
                      'Self-Employed / Business',
                      'Freelancer',
                      'Student',
                      'Retired',
                      'Housewife',
                      'Other',
                    ]}
                  />
                </select>
              </Field>
              <Field label="Employer / Business Name">
                <input type="text" {...f.bind('f-employer', 'finput')} placeholder="Company or business name" />
              </Field>
            </div>
            <div className="fgrid">
              <Field label="Annual Income (PKR)" req>
                <select {...sel('f-income')}>
                  <Options
                    placeholder="Select range"
                    options={[
                      'Below PKR 5 Lakh',
                      'PKR 5–10 Lakh',
                      'PKR 10–25 Lakh',
                      'PKR 25–50 Lakh',
                      'PKR 50L – 1 Crore',
                      'Above PKR 1 Crore',
                    ]}
                  />
                </select>
              </Field>
              <Field label="Source of Funds" req>
                <select {...sel('f-src')}>
                  <Options
                    placeholder="Select source"
                    options={[
                      'Salary / Employment',
                      'Business Profits',
                      'Freelance / Consulting',
                      'Inheritance / Gift',
                      'Savings / Investment Returns',
                      'Rental Income',
                      'Other',
                    ]}
                  />
                </select>
              </Field>
            </div>
            <div className="fgrid">
              <Field label="Bank Name" req>
                <select {...sel('f-bank')}>
                  <Options
                    placeholder="Select bank"
                    options={[
                      'HBL – Habib Bank',
                      'MCB Bank',
                      'UBL – United Bank',
                      'Meezan Bank',
                      'Bank Al Falah',
                      'Standard Chartered',
                      'Allied Bank',
                      'Bank Al Habib',
                      'Faysal Bank',
                      'JS Bank',
                      'NBP – National Bank',
                      'Askari Bank',
                      'Other',
                    ]}
                  />
                </select>
              </Field>
              <Field label="IBAN / Account Number" req>
                <input type="text" {...f.bind('f-iban', 'finput')} placeholder="PK00XXXX0000000000000000" />
              </Field>
            </div>
            <div className="fg" style={{ marginBottom: '16px' }}>
              <label className="flbl">Investment Experience</label>
              <select {...sel('f-exp')}>
                <Options
                  placeholder="Select level"
                  options={[
                    'First-time investor',
                    'Beginner (1–2 years)',
                    'Intermediate (3–5 years)',
                    'Experienced (5–10 years)',
                    'Expert (10+ years)',
                  ]}
                />
              </select>
            </div>
            <div className="fg" style={{ marginBottom: '16px' }}>
              <label className="flbl">
                Investment Objective <span className="req">*</span>
              </label>
              <select {...sel('f-obj')}>
                <Options
                  placeholder="Select objective"
                  options={[
                    'Capital Growth (long-term)',
                    'Regular Income (dividends)',
                    'Retirement Planning',
                    'Education Fund',
                    'Short-term Trading',
                    'Wealth Preservation',
                  ]}
                />
              </select>
            </div>
            <Nav back next="Next: Account Preferences →" onBack={() => go(1)} onNext={() => next(2)} />
          </div>
          {/* STEP 3: Preferences */}
          <div className={`fsec${step === 3 ? ' active' : ''}`} id="step3">
            <div className="ao-fh">
              <h2>
                Account <em>Preferences</em>
              </h2>
              <p>Choose the account type and features that match your investment goals and values.</p>
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label className="flbl" style={{ marginBottom: '12px', display: 'block' }}>
                Account Type <span className="req">*</span>
              </label>{' '}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} id="acTypeGrid">
                {AC_TYPES.map(({ val, priceColor }) => (
                  <div key={val} className={`ac-opt${acType === val ? ' active-opt' : ''}`} data-val={val} onClick={() => setAcType(val)}>
                    <div className="ac-n" style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                      {options[val].name}
                    </div>
                    <div className="ac-d" style={{ fontSize: '10px', color: 'var(--mt)', lineHeight: '1.6' }}>
                      {options[val].desc}
                    </div>
                    <div className="ac-p" style={{ fontSize: '11px', color: priceColor, fontWeight: '600', marginTop: '8px' }}>
                      {options[val].price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label className="flbl" style={{ marginBottom: '12px', display: 'block' }}>
                Risk Tolerance <span className="req">*</span>
              </label>{' '}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} id="riskGrid">
                {RISKS.map((r) => (
                  <div
                    key={r.val}
                    className={`risk-opt${risk === r.val ? ' active-risk' : ''}`}
                    data-val={r.val}
                    onClick={() => setRisk(r.val)}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '3px' }}>{r.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--mt)' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="flbl" style={{ marginBottom: '12px', display: 'block' }}>
                Communication Language
              </label>{' '}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    border: '1px solid var(--gb)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="lang"
                    value="english"
                    checked={lang === 'english'}
                    onChange={() => setLang('english')}
                    style={{ accentColor: 'var(--g)' }}
                  />
                  <span style={{ fontSize: '13px' }}>English</span>
                </label>{' '}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    border: '1px solid var(--gb)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="lang"
                    value="urdu"
                    checked={lang === 'urdu'}
                    onChange={() => setLang('urdu')}
                    style={{ accentColor: 'var(--g)' }}
                  />
                  <span style={{ fontSize: '13px', fontFamily: "'Noto Nastaliq Urdu',serif", direction: 'rtl' }}>اردو</span>
                </label>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="flbl" style={{ marginBottom: '12px', display: 'block' }}>
                Additional Services (optional)
              </label>{' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {EXTRA_SERVICES.map((s, i) => (
                  <label className="fcheck" key={s}>
                    <input
                      type="checkbox"
                      checked={extras[i]}
                      onChange={(e) => setExtras((x) => x.map((on, j) => (j === i ? e.target.checked : on)))}
                    />
                    <span className="fcheck-lbl">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <Nav back next="Next: Upload Documents →" onBack={() => go(2)} onNext={() => next(3)} />
          </div>
          {/* STEP 4: Documents */}
          <div className={`fsec${step === 4 ? ' active' : ''}`} id="step4">
            <div className="ao-fh">
              <h2>
                Upload <em>Documents</em>
              </h2>
              <p>Required by SECP regulations for identity verification. Documents are encrypted and handled confidentially.</p>
            </div>
            {[UPLOADS.slice(0, 2), UPLOADS.slice(2)].map((row, ri) => (
              <div className="fgrid" key={ri}>
                {row.map((u) => (
                  <div className="fg" key={u.id}>
                    <label className="flbl">
                      {u.label} <span className="req">*</span>
                    </label>{' '}
                    {'hint' in u && <div style={{ fontSize: '10px', color: 'var(--mt2)', marginBottom: '8px' }}>{u.hint}</div>}
                    <div className="upload-box" onClick={() => fileInputs.current[u.id]?.click()}>
                      {UPLOAD_ICON}
                      <div className="upload-title" id={`${u.id}-lbl`}>
                        {files[u.field] ? '✓ ' + files[u.field]!.name : u.title}
                      </div>
                      <div className="upload-sub">{u.sub}</div>{' '}
                      <input
                        type="file"
                        className="upload-input"
                        id={u.id}
                        accept={u.accept}
                        ref={(el) => {
                          fileInputs.current[u.id] = el;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFiles((s) => ({ ...s, [u.field]: file }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div
              style={{
                background: 'color-mix(in srgb, var(--au) 6%, transparent)',
                border: '1px solid color-mix(in srgb, var(--au) 18%, transparent)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--au)', marginBottom: '6px' }}>📋 Document Requirements</div>
              <div style={{ fontSize: '11px', color: 'var(--mt)', lineHeight: '1.75' }}>
                • CNIC must be valid and not expired
                <br />• All documents must be clearly readable — no blurry photos
                <br />• PDFs accepted for utility bills and bank statements
                <br />• Documents older than 3 months will not be accepted as address proof
              </div>
            </div>
            <Nav back next="Next: Review & Submit →" onBack={() => go(3)} onNext={() => next(4)} />
          </div>
          {/* STEP 5: Review */}
          <div className={`fsec${step === 5 ? ' active' : ''}`} id="step5">
            <div className="ao-fh">
              <h2>
                Review &amp; <em>Submit</em>
              </h2>
              <p>Please review all information carefully. You can go back to any step to make changes.</p>
            </div>
            <div className="rv-sec">
              <div className="rv-title">Personal Information</div>
              <ReviewRow k="Full Name" id="rv-name" v={[dash(v['f-fn']), dash(v['f-ln'])].join(' ')} />
              <ReviewRow k="CNIC" id="rv-cnic" v={dash(v['f-cnic'])} />
              <ReviewRow k="Date of Birth" id="rv-dob" v={dash(v['f-dob'])} />
              <ReviewRow k="Mobile" id="rv-mob" v={dash(v['f-mob'])} />
              <ReviewRow k="Email" id="rv-email" v={dash(v['f-email'])} />
              <ReviewRow
                k="City / Province"
                id="rv-city"
                v={[v['f-city'], v['f-prov']]
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .join(' / ')}
              />
            </div>
            <div className="rv-sec">
              <div className="rv-title">Financial Details</div>
              <ReviewRow k="Employment" id="rv-emp" v={dash(v['f-emp'])} />
              <ReviewRow k="Annual Income" id="rv-inc" v={dash(v['f-income'])} />
              <ReviewRow k="Source of Funds" id="rv-src" v={dash(v['f-src'])} />
              <ReviewRow k="Bank" id="rv-bank" v={dash(v['f-bank'])} />
            </div>
            <div className="rv-sec">
              <div className="rv-title">Account Preferences</div>
              <ReviewRow k="Account Type" id="rv-actype" v={cap(acType)} />
              <ReviewRow k="Risk Tolerance" id="rv-risk" v={cap(risk)} />
              <ReviewRow k="Language" id="rv-lang" v={lang} />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'I confirm that all information provided is accurate and complete. I understand that providing false information is a violation of SECP regulations.',
                null,
                'I consent to Rallys Equities verifying my identity with NADRA and other regulatory bodies as required by SECP.',
              ].map((text, i) => (
                <label className="fcheck" key={i}>
                  <input
                    type="checkbox"
                    id={`chk${i + 1}`}
                    checked={consent[i]}
                    onChange={(e) => setConsent((c) => c.map((on, j) => (j === i ? e.target.checked : on)))}
                  />
                  <span className="fcheck-lbl">
                    {text ?? (
                      <>
                        I have read and agree to Rallys Equities'{' '}
                        <a href="/assets/docs/terms-of-service.pdf" target="_blank" rel="noopener">
                          Terms of Service
                        </a>
                        ,{' '}
                        <a href="/assets/docs/privacy-policy.pdf" target="_blank" rel="noopener">
                          Privacy Policy
                        </a>
                        , and{' '}
                        <a href="/assets/docs/risk-disclosure.pdf" target="_blank" rel="noopener">
                          Risk Disclosure Statement
                        </a>
                        .
                      </>
                    )}
                  </span>
                </label>
              ))}
            </div>
            <div className="fnav">
              <button className="fprev" onClick={() => go(4)}>
                ← Back
              </button>
              <button className="fnext" style={{ padding: '12px 36px', fontSize: '14px' }} onClick={submit}>
                ✓ Submit Application
              </button>
            </div>
          </div>
        </div>
        {/* end formBody */}
      </div>
      {/* end ao-main */}
    </div>
  );
}
