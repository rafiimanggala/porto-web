"use client";

import { useSyncExternalStore } from "react";

// The orbit is for a capable desktop only: wide viewport and a fine pointer.
// useSyncExternalStore with a `false` server snapshot keeps SSR and the first
// client render identical (accordion), then upgrades after hydration with no
// mismatch warning.
const QUERY = "(min-width: 768px) and (pointer: fine)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useOrbitCapable(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

const noopSubscribe = () => () => {};

// False while rendering on the server and during hydration, true afterwards.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
