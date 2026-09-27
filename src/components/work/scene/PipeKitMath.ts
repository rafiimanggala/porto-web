import { useTransform } from "framer-motion";
import { easeInOutCubic, type MV } from "./HealthSceneParts";

/* Small pure helpers shared by every pipeline scene. */

type Ease = (t: number) => number;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pct = (v: number) => `${v.toFixed(3)}%`;

/** Eased 0..1 progress of the window [a, b] at value v. */
export function segAt(v: number, a: number, b: number, ease?: Ease) {
  const t = clamp01((v - a) / (b - a));
  return ease ? ease(t) : t;
}

/** Piecewise value of v over strictly increasing xs, eased inside each segment. */
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

/** Fade in at a, hold, fade out at b. Use a below 0 or b above 1 to keep an end open. */
export function useSpan(p: MV, a: number, b: number, edge = 0.012): MV {
  return useTransform(p, [a, a + edge, b - edge, b], [0, 1, 1, 0]);
}
