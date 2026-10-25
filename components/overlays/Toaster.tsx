'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { dismiss, getServerToasts, getToasts, subscribe, type Toast } from '@/lib/toast';

const ICON = { ok: '✓', info: 'ⓘ', err: '⚠' } as const;

function ToastItem({ t }: { t: Toast }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div className={`re-toast ${t.type}${shown && !t.leaving ? ' show' : ''}`}>
      <span className="re-toast-ic">{ICON[t.type]}</span>
      <div className="re-toast-msg">{t.msg}</div>
      <button className="re-toast-x" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
        &times;
      </button>
    </div>
  );
}

export default function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getToasts, getServerToasts);
  if (!toasts.length) return null;
  return (
    <div id="reToastWrap" className="re-toast-wrap">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}
