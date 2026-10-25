'use client';

import { useSyncExternalStore } from 'react';

/* Open/closed state of the mobile drawer, shared by the hamburger (in <Nav>) and the
   drawer itself (<MobileMenu>), which are siblings in the layout. */
let open = false;
const listeners = new Set<() => void>();

export function setMobileMenu(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function useMobileMenu() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
