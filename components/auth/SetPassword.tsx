'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase-config';

/* Finishes an editor invite (or a password reset): Supabase signs the visitor in from
   the link's URL hash, then they choose a password. The four checks and their wording
   match the admin's Change-password dialog; only the length is enforced. */

const CHECKS: [string, (v: string) => boolean][] = [
  ['8 characters or more', (v) => v.length >= 8],
  ['Upper and lower case', (v) => /[a-z]/.test(v) && /[A-Z]/.test(v)],
  ['At least one number', (v) => /\d/.test(v)],
  ['A symbol, like ! ? or @', (v) => /[^A-Za-z0-9]/.test(v)],
];
const WEAK = /^(password|passw0rd|12345678|123456789|qwerty123|letmein|welcome1|iloveyou|rallys123|admin123)$/i;
const LABELS = ['', 'Too weak', 'Weak', 'Good', 'Strong'];

function score(v: string) {
  if (!v) return 0;
  let s = CHECKS.filter(([, ok]) => ok(v)).length;
  if (v.length >= 14) s++;
  if (v.length < 8 || WEAK.test(v)) s = Math.min(s, 1);
  return Math.max(1, Math.min(4, s));
}

type Phase = { kind: 'boot' } | { kind: 'form' } | { kind: 'done' } | { kind: 'invalid'; msg: string };

function PasswordField({
  label,
  placeholder,
  aria,
  value,
  onChange,
  onEnter,
  inputRef,
  children,
}: {
  label: string;
  placeholder: string;
  aria: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  children?: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div className="pwrow">
        <input
          ref={inputRef}
          type={shown ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete="new-password"
          aria-label={aria}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter') onEnter();
          }}
        />
        <button
          type="button"
          className="eye"
          aria-label={shown ? 'Hide password' : 'Show password'}
          onClick={() => {
            setShown(!shown);
            inputRef.current?.focus();
          }}
        >
          {shown ? 'Hide' : 'Show'}
        </button>
      </div>
      {children}
    </div>
  );
}

// an expired or used link comes back with the auth server's error in the URL hash
const noSubscribe = () => () => {};
const hashError = () => new URLSearchParams(location.hash.replace(/^#/, '')).get('error_description')?.replace(/\+/g, ' ') ?? null;

export default function SetPassword() {
  const sb = useRef<SupabaseClient | null>(null);
  const linkError = useSyncExternalStore(noSubscribe, hashError, () => null);
  const [checked, setPhase] = useState<Phase>({ kind: 'boot' });
  const phase: Phase = linkError ? { kind: 'invalid', msg: linkError } : checked;
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const pwRef = useRef<HTMLInputElement>(null);
  const pw2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hashError()) return;
    const client = (sb.current = createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
    let n = 0,
      timer: ReturnType<typeof setTimeout>;
    // give the client time to consume the session from the URL hash
    const poll = () =>
      client.auth.getSession().then(
        ({ data }) => {
          if (data.session) {
            setPhase({ kind: 'form' });
            return;
          }
          if (++n > 20) {
            setPhase({ kind: 'invalid', msg: 'This invite link is invalid or has expired. Please ask for a fresh one.' });
            return;
          }
          timer = setTimeout(poll, 150);
        },
        () => {
          if (++n > 20) setPhase({ kind: 'invalid', msg: 'We couldn’t verify this link. Please ask for a fresh invite.' });
          else timer = setTimeout(poll, 150);
        },
      );
    poll();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase.kind === 'form') setTimeout(() => pwRef.current?.focus(), 60);
  }, [phase.kind]);

  /* Flip the invitee's invites row to accepted so the admin's Editors list stops showing
     "Pending". RLS lets a signed-in user update only their own row. Best effort. */
  const markAccepted = async () => {
    try {
      const email = (await sb.current!.auth.getUser()).data.user?.email;
      if (email)
        await sb
          .current!.from('invites')
          .update({ accepted_at: new Date().toISOString() })
          .eq('email', email.toLowerCase())
          .is('accepted_at', null);
    } catch {
      /* never blocks success */
    }
  };

  const submit = async () => {
    setErr('');
    if (pw.length < 8) {
      setErr('Please use at least 8 characters.');
      pwRef.current?.focus();
      return;
    }
    if (WEAK.test(pw)) {
      setErr('That password is too easy to guess — try something else.');
      pwRef.current?.focus();
      return;
    }
    if (pw !== pw2) {
      setErr('The two passwords don’t match.');
      pw2Ref.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const { error } = await sb.current!.auth.updateUser({ password: pw });
      if (error) throw error;
      markAccepted();
      setPhase({ kind: 'done' });
    } catch (e) {
      setErr((e as Error)?.message || 'Could not set your password.');
      setBusy(false);
    }
  };

  const s = score(pw);
  return (
    <div id="stage">
      {phase.kind === 'boot' && (
        <div className="boot" role="status" aria-live="polite">
          <span className="boot-ring" aria-hidden="true" />
          <div className="boot-t">Verifying your invite</div>
          <div className="boot-d">One moment while we check your link.</div>
          <div className="boot-bar" aria-hidden="true">
            <i />
          </div>
        </div>
      )}
      {phase.kind === 'form' && (
        <div>
          <h2>Welcome</h2>
          <p className="lead">Set a password to finish setting up your editor account for the Rallys Equities website.</p>
          <PasswordField
            label="Create a password"
            placeholder="At least 8 characters"
            aria="New password"
            value={pw}
            onChange={setPw}
            onEnter={submit}
            inputRef={pwRef}
          >
            <div className="meter">
              <div className="bars" aria-hidden="true">
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} className={'bar' + (k < s && pw ? ' on' + s : '')} />
                ))}
              </div>
              <div className="slbl">{pw ? 'Strength: ' + LABELS[s] : 'Use at least 8 characters.'}</div>
              <ul className="reqs">
                {CHECKS.map(([label, ok]) => (
                  <li key={label} className={'req' + (ok(pw) ? ' ok' : '')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7D8B9B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PasswordField>
          <PasswordField
            label="Confirm password"
            placeholder="Type it again"
            aria="Confirm password"
            value={pw2}
            onChange={setPw2}
            onEnter={submit}
            inputRef={pw2Ref}
          />
          <div className="err" role="alert">
            {err}
          </div>
          <button className="btn" disabled={busy} onClick={submit}>
            {busy ? 'Setting up…' : 'Create my account'}
          </button>
        </div>
      )}
      {phase.kind === 'done' && (
        <div className="center">
          <div className="ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0A6B4B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2>You’re all set</h2>
          <p className="muted">Your password is saved. You can now sign in and start editing the website.</p>
          <a className="btn" href="/admin" style={{ textDecoration: 'none' }}>
            Go to the editor
          </a>
        </div>
      )}
      {phase.kind === 'invalid' && (
        <div className="center">
          <div className="ico warn">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h2>Link problem</h2>
          <p className="muted">{phase.msg}</p>
          {/* a full page load: the site has a different root layout */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="link" href="/">
            Back to the website
          </a>
        </div>
      )}
    </div>
  );
}
