"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(notify: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
}

// Hydration-safe reduced-motion flag. framer-motion's useReducedMotion returns
// null on the server but the real value on the first client render, so anything
// that changes markup from it can mismatch the server HTML. Here the server
// snapshot is always false, so hydration matches and the real value lands in the
// re-render right after.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
