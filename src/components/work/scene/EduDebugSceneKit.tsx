"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, type MV } from "./HealthSceneParts";

/* Shared helpers; everything is a pure function of progress. */

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

/* Eased 0..1 progress of a window, as a plain function (for text readouts). */
export function segAt(v: number, a: number, b: number, ease?: Ease) {
  const t = clamp01((v - a) / (b - a));
  return ease ? ease(t) : t;
}

/* Fade in at a, hold, fade out at b. Pass a negative a or b above 1 to keep an end open. */
export function useSpan(p: MV, a: number, b: number, edge = 0.01): MV {
  return useTransform(p, [a, a + edge, b, b + edge], [0, 1, 1, 0]);
}

export const LABEL = `${MONO} text-[10px] uppercase tracking-[0.12em] text-mute @[30rem]:text-[11px]`;
export const TEXT = `${MONO} text-[10.5px] @[30rem]:text-[12.5px]`;
export const PAD = "clamp(10px,3cqw,22px)";

export function MonoLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`${LABEL} ${className}`}>{children}</span>;
}

/* Revealed from the left as pagePos passes k, covered as it passes k + 1. */
export function Page({ pagePos, k, children }: { pagePos: MV; k: number; children: ReactNode }) {
  const shown = useTransform(pagePos, (v) => clamp01(v - (k - 1)));
  const cover = useTransform(pagePos, (v) => clamp01(v - k));
  const clip = useTransform([shown, cover], ([s, c]: number[]) => `inset(0 ${pct(100 - s * 100)} 0 ${pct(c * 100)})`);
  const opacity = useTransform(cover, (c) => 1 - 0.45 * c);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      <motion.div style={{ opacity }} className="h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ScanEdge({ pagePos, k }: { pagePos: MV; k: number }) {
  const front = useTransform(pagePos, (v) => clamp01(v - (k - 1)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity }}
      className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

/* Position swap: two stacked lines in a clipped box, `t` rolls A out and B in. */
export function Roll({ t, a, b, className = "" }: { t: MV; a: ReactNode; b: ReactNode; className?: string }) {
  const y = useTransform(t, (v) => pct(-clamp01(v) * 50));
  return (
    <span className={`block h-[1.45em] overflow-hidden leading-[1.45em] ${className}`}>
      <motion.span style={{ y }} className="flex flex-col">
        <span className="truncate">{a}</span>
        <span className="truncate">{b}</span>
      </motion.span>
    </span>
  );
}
