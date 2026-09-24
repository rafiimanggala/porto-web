"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, type MV } from "./HealthSceneParts";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pct = (v: number) => `${v.toFixed(3)}%`;
export const bell = (t: number) => Math.sin(Math.PI * clamp01(t));

type Ease = (t: number) => number;

/* Piecewise value of v over non-decreasing xs, eased inside each segment. */
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

/* Eased 0..1 progress of a window, as a plain function (for text and clips). */
export function segAt(v: number, a: number, b: number, ease?: Ease) {
  const t = clamp01((v - a) / (b - a));
  return ease ? ease(t) : t;
}

function segmentAt(v: number, xs: readonly number[]) {
  const last = xs.length - 1;
  if (v <= xs[0]) return { i: 0, t: 0 };
  if (v >= xs[last]) return { i: last - 1, t: 1 };
  const i = xs.findIndex((x, j) => v >= x && v < xs[j + 1]);
  return { i, t: (v - xs[i]) / (xs[i + 1] - xs[i]) };
}

/* Holds ys[i] and switches to ys[i + 1] at the middle of segment i. */
export function snapKeys(v: number, xs: readonly number[], ys: readonly number[]) {
  const { i, t } = segmentAt(v, xs);
  return t >= 0.5 ? ys[i + 1] : ys[i];
}

/* 0..1..0 while v is inside a segment whose value changes, else 0. */
export function flightAt(v: number, xs: readonly number[], ys: readonly number[]) {
  const { i, t } = segmentAt(v, xs);
  return ys[i] === ys[i + 1] ? 0 : bell(t);
}

export function MonoLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`${MONO} text-[10px] uppercase tracking-[0.12em] text-mute @[34rem]:text-[11px] ${className}`}>{children}</span>
  );
}

/* Complementary page swap: page k comes in from the left while page k - 1 is
   clipped away from the left by the same amount, with a thin accent edge. */
function WipePage({ pos, k, children }: { pos: MV; k: number; children: ReactNode }) {
  const shown = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const cover = useTransform(pos, (v) => clamp01(v - k));
  const clip = useTransform([shown, cover], ([s, c]: number[]) => `inset(0 ${pct(100 - s * 100)} 0 ${pct(c * 100)})`);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

function WipeEdge({ pos, k }: { pos: MV; k: number }) {
  const front = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity }}
      className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

export function WipePages({ pos, pages, className = "" }: { pos: MV; pages: readonly ReactNode[]; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {pages.map((page, k) => (
        <WipePage key={k} pos={pos} k={k}>
          {page}
        </WipePage>
      ))}
      {pages.slice(1).map((_, i) => (
        <WipeEdge key={i} pos={pos} k={i + 1} />
      ))}
    </div>
  );
}

/* Small hexagon badge, tinted by a token colour. */
export function HexDot({ color, opacity = 0.6, className = "h-3 w-[10.4px]" }: { color: string; opacity?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="-9 -10 18 20" className={`shrink-0 ${className}`}>
      <polygon
        points="0,-9 7.8,-4.5 7.8,4.5 0,9 -7.8,4.5 -7.8,-4.5"
        fill={color}
        fillOpacity={opacity}
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
