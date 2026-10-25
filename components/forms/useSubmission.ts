'use client';

import { useRef, useState } from 'react';
import type { SubmissionKind } from '@/lib/forms/schema';
import { submitErrorMessage, submitForm } from '@/lib/forms/submit';
import { toast } from '@/lib/toast';

/** Sends a form; on success the form box is hidden and its "done" panel shown.
    A failure shows a real error (never a fake success), so a lead is never silently lost. */
export function useSubmission(kind: SubmissionKind, what?: string) {
  const [done, setDone] = useState(false);
  const busy = useRef(false);

  const send = async (data: Record<string, unknown>, files?: [string, File][]) => {
    if (busy.current) return false; // ignore double clicks
    busy.current = true;
    try {
      await submitForm(kind, data, files);
      setDone(true);
      return true;
    } catch (e) {
      toast(submitErrorMessage(e, what), 'err');
      return false;
    } finally {
      busy.current = false;
    }
  };

  return {
    done,
    send,
    boxStyle: done ? { display: 'none' } : undefined,
    doneStyle: done ? { display: 'block' } : undefined,
  };
}
