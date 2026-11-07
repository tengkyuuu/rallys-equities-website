'use client';

import { useEffect, useRef, useState } from 'react';
import type { SubmissionKind } from '@/lib/forms/schema';
import { SubmitError, submitErrorMessage, submitForm } from '@/lib/forms/submit';
import { toast } from '@/lib/toast';

/** Sends a form; on success the form box is hidden and its "done" panel shown.
    A failure shows a real error (never a fake success), so a lead is never silently lost. */
export function useSubmission(kind: SubmissionKind, what?: string, onFieldErrors?: (fields: Record<string, string>) => void) {
  const [done, setDone] = useState(false);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slow, setSlow] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);
  useEffect(() => {
    if (!retryAt) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, [pending]);

  const send = async (data: Record<string, unknown>, files?: [string, File][]) => {
    if (busy.current || Date.now() < retryAt || offline) return false;
    busy.current = true;
    setPending(true);
    setSlow(false);
    setError('');
    setFieldErrors({});
    setProgress('Preparing your submission…');
    try {
      await submitForm(kind, data, files, setProgress);
      setDone(true);
      return true;
    } catch (e) {
      const message = submitErrorMessage(e, what);
      setError(message);
      if (e instanceof SubmitError) {
        setFieldErrors(e.fields || {});
        if (e.fields) onFieldErrors?.(e.fields);
        if (e.status === 429) setRetryAt(Date.now() + (e.retryAfter || 60) * 1000);
      }
      toast(message, 'err');
      return false;
    } finally {
      busy.current = false;
      setPending(false);
      setSlow(false);
    }
  };

  return {
    done,
    send,
    pending,
    progress,
    slow,
    error,
    fieldErrors,
    offline,
    remaining,
    disabled: pending || offline || remaining > 0,
    boxStyle: done ? { display: 'none' } : undefined,
    doneStyle: done ? { display: 'block' } : undefined,
  };
}
