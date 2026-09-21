"use client";

import { useEffect, type RefObject } from "react";
import { EXTRUSION_REST, EXTRUSION_SWING } from "./extrusion";

const EASE = 0.12;
const SETTLE = 0.001;

type Vec = { x: number; y: number };

function applyVars(el: HTMLElement, v: Vec): void {
  el.style.setProperty("--dx", `${EXTRUSION_REST.dx + v.x * EXTRUSION_SWING.dx}em`);
  el.style.setProperty("--dy", `${EXTRUSION_REST.dy + v.y * EXTRUSION_SWING.dy}em`);
}

function isOnScreen(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

// Pointer parallax for the wordmark extrusion. Fine pointers only and never with
// reduced motion. No React state: a rAF loop eases toward the pointer and writes two
// CSS custom properties, and it stops by itself once it has settled.
export function useExtrusionParallax(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    let target: Vec = { x: 0, y: 0 };
    let current: Vec = { x: 0, y: 0 };
    let raf = 0;

    const frame = () => {
      current = {
        x: current.x + (target.x - current.x) * EASE,
        y: current.y + (target.y - current.y) * EASE,
      };
      applyVars(el, current);
      const moving =
        Math.abs(target.x - current.x) > SETTLE || Math.abs(target.y - current.y) > SETTLE;
      raf = moving ? requestAnimationFrame(frame) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (!isOnScreen(el)) return;
      target = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
      if (!raf) raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}
