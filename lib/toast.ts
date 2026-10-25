/* Tiny toast store — on-brand replacement for alert(). Rendered by <Toaster />. */
export type ToastType = 'ok' | 'err' | 'info';
export type Toast = { id: number; msg: string; type: ToastType; leaving: boolean };

let toasts: Toast[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: Toast[]) => {
  toasts = next;
  emit();
};

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export const getToasts = () => toasts;
const EMPTY: Toast[] = [];
export const getServerToasts = () => EMPTY;

export function dismiss(id: number) {
  set(toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
  setTimeout(() => set(toasts.filter((t) => t.id !== id)), 420);
}

export function toast(msg: string, type: ToastType = 'err') {
  const id = ++seq;
  set([...toasts, { id, msg, type, leaving: false }]);
  setTimeout(() => dismiss(id), 6000);
  return id;
}
