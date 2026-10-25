'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CONTACT_EMAIL } from '@/lib/site';
import { POLICY_DOCS, policyViewerSrc, type PolicySlug } from '@/lib/policies';
import { toast } from '@/lib/toast';

/* View-only document viewer. A browser must receive a file to render it, so nothing can
   stop a determined visitor pulling it from the network panel. What this does: opens
   in-page (no PDF toolbar with download/print), the chips are buttons not links (no
   "Save link as"), and context menu, Ctrl/Cmd+S and Ctrl/Cmd+P are suppressed while open. */

type Phase = 'closed' | 'open' | 'in';
type DocState = { slug: PolicySlug | null; phase: Phase };
type Ctx = { state: DocState; open: (slug: PolicySlug) => void; close: () => void };

const DocCtx = createContext<Ctx | null>(null);

export function useDocViewer() {
  const c = useContext(DocCtx);
  if (!c) throw new Error('useDocViewer must be used inside <DocViewerProvider>');
  return c;
}

export function DocViewerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DocState>({ slug: null, phase: 'closed' });
  const lastFocus = useRef<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const open = useCallback((slug: PolicySlug) => {
    clearTimeout(timer.current);
    lastFocus.current = document.activeElement as HTMLElement | null;
    setState({ slug, phase: 'open' });
    requestAnimationFrame(() => setState((s) => (s.slug === slug ? { slug, phase: 'in' } : s)));
  }, []);

  const close = useCallback(() => {
    setState((s) => (s.phase === 'closed' ? s : { ...s, phase: 'open' }));
    // drop the src after the fade so the PDF stops loading
    timer.current = setTimeout(() => setState({ slug: null, phase: 'closed' }), 280);
    try {
      lastFocus.current?.focus();
    } catch {
      /* element gone */
    }
  }, []);

  const value = useMemo(() => ({ state, open, close }), [state, open, close]);
  return <DocCtx.Provider value={value}>{children}</DocCtx.Provider>;
}

export default function DocViewer() {
  const { state, close } = useDocViewer();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const visible = state.phase !== 'closed';
  const entering = state.phase === 'in';

  useEffect(() => {
    if (!entering) return;
    document.body.style.overflow = 'hidden';
    const guard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      const k = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p')) {
        e.preventDefault();
        e.stopPropagation();
        toast('This document is view-only.', 'err');
      }
    };
    document.addEventListener('keydown', guard, true);
    const f = setTimeout(() => closeBtn.current?.focus(), 60);
    return () => {
      document.removeEventListener('keydown', guard, true);
      document.body.style.overflow = '';
      clearTimeout(f);
    };
  }, [entering, close]);

  return (
    <div
      className={`doc-ov${visible ? ' open' : ''}${entering ? ' in' : ''}`}
      id="docOv"
      role="dialog"
      aria-modal="true"
      aria-labelledby="docTtl"
      onContextMenu={visible ? (e) => e.preventDefault() : undefined}
    >
      <div className="doc-bar">
        <span className="doc-ttl" id="docTtl">
          {state.slug ? POLICY_DOCS[state.slug] : 'Document'}
        </span>
        <button ref={closeBtn} className="doc-x" type="button" aria-label="Close document" onClick={close}>
          ✕
        </button>
      </div>
      <div className="doc-body">
        <iframe
          id="docFrame"
          title="Policy document"
          referrerPolicy="no-referrer"
          src={state.slug ? policyViewerSrc(state.slug) : undefined}
        />
      </div>
      <div className="doc-foot">
        This document is provided for viewing only and may not be downloaded, printed, or redistributed. Need a copy for your records? Email{' '}
        <strong style={{ color: 'var(--mt)' }}>{CONTACT_EMAIL}</strong>.
      </div>
    </div>
  );
}
