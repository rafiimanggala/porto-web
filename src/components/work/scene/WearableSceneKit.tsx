"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, motionValue, useTransform, type MotionValue } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { PANEL, STAGE_H, STAGE_W, type Rect } from "./WearableSceneData";

/* Stage-relative sizing, a typewriter and the complementary clip pane. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const frac = (v: number) => v - Math.floor(v);

const MIN_TEXT_PX = 10;
export const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;
export const sx = (x: number) => pct(x, STAGE_W);
export const sy = (y: number) => pct(y, STAGE_H);
export const cq = (u: number) => `${((u / STAGE_W) * 100).toFixed(3)}cqw`;
export const fs = (u: number, maxPx = 14) => `clamp(${MIN_TEXT_PX}px, ${cq(u)}, ${maxPx}px)`;

export const stageBox = (r: Rect): CSSProperties => ({
  left: sx(r.x),
  top: sy(r.y),
  width: sx(r.w),
  height: sy(r.h),
});

export const panelBox = (r: Rect): CSSProperties => ({
  left: pct(r.x - PANEL.x, PANEL.w),
  top: pct(r.y - PANEL.y, PANEL.h),
  width: pct(r.w, PANEL.w),
  height: pct(r.h, PANEL.h),
});

export const panelXPct = (x: number) => ((x - PANEL.x) / PANEL.w) * 100;

export const ONE: MV = motionValue(1);
export const ZERO: MV = motionValue(0);
export type MVS = MotionValue<string>;

export const DEVICE_COLORS = ["var(--color-mint)", "var(--color-sky)", "var(--color-sun)"] as const;

const insetX = (from: number, to: number) =>
  `inset(0 ${(100 - to).toFixed(2)}% 0 ${from.toFixed(2)}%)`;

/* Shows only the band between outF and inF, so two swapping panes never overlap. */
export function ClipPane({
  inF = ONE,
  outF = ZERO,
  className = "",
  children,
}: {
  inF?: MV;
  outF?: MV;
  className?: string;
  children: ReactNode;
}) {
  const clip = useTransform([inF, outF], ([a, b]: number[]) => insetX(b * 100, a * 100));
  return (
    <motion.div style={{ clipPath: clip }} className={`absolute inset-0 ${className}`}>
      {children}
    </motion.div>
  );
}

export function SwapEdge({ front, t }: { front: MV; t: MV }) {
  const left = useTransform(front, (f) => `${(f * 100).toFixed(2)}%`);
  const opacity = useTransform(t, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity }}
      className="pointer-events-none absolute bottom-1 top-1 z-10 w-0.5 -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

export function Typed({
  p,
  a,
  b,
  text,
  className = "",
  style,
}: {
  p: MV;
  a: number;
  b: number;
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const n = useTransform(p, (v) => Math.floor(clamp01((v - a) / (b - a)) * text.length));
  const shown = useTransform(n, (k) => text.slice(0, k));
  const rest = useTransform(n, (k) => text.slice(k));
  const caret = useTransform(n, (k) => (k > 0 && k < text.length ? 1 : 0));
  return (
    <span className={className} style={style}>
      <motion.span>{shown}</motion.span>
      <motion.i aria-hidden style={{ opacity: caret }} className="relative inline-block h-[1em] w-0 align-[-0.14em]">
        <b className="absolute left-0 top-0 h-full w-[2px] bg-accent" />
      </motion.i>
      <motion.span className="opacity-0">{rest}</motion.span>
    </span>
  );
}

export function Mono({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={`${MONO} ${className}`} style={{ fontSize: fs(10.2), ...style }}>
      {children}
    </span>
  );
}

/* Hides a stroke until its draw progress passes `min`, so a path never shows as a loose dash at zero. */
export function useDrawn(len: MV, min = 0.003): MV {
  return useTransform(len, (v): number => (v < min ? 0 : 1));
}

export function bezier(pts: readonly [number, number][], t: number): [number, number] {
  const [p0, p1, p2, p3] = pts;
  const u = 1 - t;
  const c = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [
    c[0] * p0[0] + c[1] * p1[0] + c[2] * p2[0] + c[3] * p3[0],
    c[0] * p0[1] + c[1] * p1[1] + c[2] * p2[1] + c[3] * p3[1],
  ];
}

export const cubicD = (pts: readonly [number, number][]) =>
  `M ${pts[0][0]} ${pts[0][1]} C ${pts[1][0]} ${pts[1][1]}, ${pts[2][0]} ${pts[2][1]}, ${pts[3][0]} ${pts[3][1]}`;

export const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const pt = (d: number) => `${(cx + r * Math.cos(rad(d))).toFixed(2)} ${(cy + r * Math.sin(rad(d))).toFixed(2)}`;
  return `M ${pt(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1)}`;
};
