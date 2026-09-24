"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, type MV } from "./HealthSceneParts";

/* Shared building blocks of the insights scene. Everything here is a pure
   function of the progress motion values it receives. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pct = (v: number) => `${v.toFixed(3)}%`;

type Ease = (t: number) => number;

/* Piecewise value of v over strictly increasing xs, eased inside each segment. */
export function keyframes(v: number, xs: readonly number[], ys: readonly number[], ease: Ease = easeInOutCubic) {
  const last = xs.length - 1;
  if (v <= xs[0]) return ys[0];
  if (v >= xs[last]) return ys[last];
  const i = xs.findIndex((x, j) => v >= x && v < xs[j + 1]);
  return lerp(ys[i], ys[i + 1], ease((v - xs[i]) / (xs[i + 1] - xs[i])));
}

export function useKeys(p: MV, xs: readonly number[], ys: readonly number[], ease?: Ease): MV {
  return useTransform(p, (v) => keyframes(v, xs, ys, ease));
}

export function segAt(v: number, a: number, b: number, ease?: Ease) {
  const t = clamp01((v - a) / (b - a));
  return ease ? ease(t) : t;
}

export const linear: Ease = (t) => t;

export function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`relative h-full overflow-hidden rounded-xl border border-line-strong bg-surface-1 ${className}`}>
      {children}
    </div>
  );
}

export function MonoLabel({ children, className = "", plain = false }: { children: ReactNode; className?: string; plain?: boolean }) {
  const tone = plain ? "" : "uppercase tracking-[0.12em]";
  return <span className={`${MONO} whitespace-nowrap text-[11px] text-mute ${tone} ${className}`}>{children}</span>;
}

/* Diagonal stripes in a tone: the look of a measurement that does not exist. */
export const hatch = (tone: string): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(135deg, color-mix(in oklab, ${tone} 60%, transparent) 0 2px, transparent 2px 6px)`,
});

/* Complementary clips: the old face is clipped away from the left while its
   replacement is clipped in from the left, with a thin accent line between. */
export function useSwap(f: MV) {
  const outClip = useTransform(f, (v) => `inset(0 0 0 ${pct(clamp01(v) * 100)})`);
  const inClip = useTransform(f, (v) => `inset(0 ${pct(100 - clamp01(v) * 100)} 0 0)`);
  const edge = useTransform(f, (v) => pct(clamp01(v) * 100));
  const edgeOp = useTransform(f, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return { outClip, inClip, edge, edgeOp };
}

export function SwapEdge({ edge, op }: { edge: MotionValue<string>; op: MV }) {
  return (
    <motion.i
      aria-hidden
      style={{ left: edge, opacity: op }}
      className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

/* Text that writes itself: a clip that opens to the right with a caret at its edge. */
export function Typed({ t, className = "", children }: { t: MV; className?: string; children: ReactNode }) {
  const clip = useTransform(t, (v) => `inset(0 ${pct(100 - clamp01(v) * 100)} 0 0)`);
  const left = useTransform(t, (v) => pct(clamp01(v) * 100));
  const caret = useTransform(t, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  return (
    <div className={`relative ${className}`}>
      <motion.div style={{ clipPath: clip }}>{children}</motion.div>
      <motion.i
        aria-hidden
        style={{ left, opacity: caret }}
        className="pointer-events-none absolute inset-y-[8%] w-0.5 -translate-x-1/2 rounded-full bg-accent"
      />
    </div>
  );
}
