"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

// True when a 2D canvas context can be created. Cached after the first probe.
function detect(): boolean {
  if (cached !== null) return cached;
  try {
    cached = document.createElement("canvas").getContext("2d") !== null;
  } catch (error) {
    console.warn("doodle: 2D canvas probe failed, showing the fallback", error);
    cached = false;
  }
  return cached;
}

const subscribe = () => () => {};

// Server and first hydration pass say "supported" so markup matches; a real
// browser without canvas flips to the fallback right after.
export function useCanvasSupport(): boolean {
  return useSyncExternalStore(subscribe, detect, () => true);
}
