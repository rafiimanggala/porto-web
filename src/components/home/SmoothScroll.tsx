"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

// Eases wheel input into a weightier, gliding scroll, closest to what gives
// viens-la.com's stacking cards their "b3" feel. Lenis still drives real
// document scrollY (window.scrollTo under the hood) -- unlike viens-la's own
// engine, which replaces native scroll with a transform on a wrapper
// (confirmed: their document.body.scrollHeight is 28px, a fake/broken
// native scroll). position: sticky, IntersectionObserver-based dock
// highlighting, and #anchor links all keep working exactly as before; this
// only smooths the input that feeds them.
//
// Renders nothing either way -- ReactLenis with no children always outputs
// null, so branching on reduced motion here can't cause a hydration
// mismatch (both branches render null server-side and on first paint).
export default function SmoothScroll() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return <ReactLenis root options={{ duration: 1.15, smoothWheel: true, syncTouch: false }} />;
}
