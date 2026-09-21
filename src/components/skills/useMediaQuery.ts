"use client";

import { useSyncExternalStore } from "react";

// Subscribes to a media query. The server snapshot is false, so the first
// client render matches the server HTML and the real value lands right after
// hydration.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
