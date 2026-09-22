"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

// The sticky-swap image panel only earns its keep with room beside the row
// list (lg) and a pointer precise enough to make a scroll-linked crossfade
// read as intentional rather than jumpy -- same capability check Featured.tsx
// runs for its own sticky stack, plus the lg breakpoint the two-column layout
// needs. useSyncExternalStore (same pattern as orbit/useOrbitCapable.ts) keeps
// SSR and the first client render identical, instead of flipping state inside
// an effect. Reduced motion falls back to the plain per-row layout too.
const QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useWorkReelSticky(): boolean {
  const capable = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const reduce = useReducedMotion();
  return capable && !reduce;
}
