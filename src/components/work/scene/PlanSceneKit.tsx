"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, type MV } from "./HealthSceneParts";
import { SRC_COLOR, type Src } from "./PlanSceneData";

/* Shared building blocks of the plan scene. Everything here is a pure function
   of the progress motion values it receives. */

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

export function Roll({ t, from, to, toClass = "" }: { t: MV; from: string; to: string; toClass?: string }) {
  const y = useTransform(t, (v) => pct(-clamp01(v) * 50));
  return (
    <span className="-mx-[3px] inline-block h-[1.35em] overflow-hidden align-bottom leading-[1.35em]">
      <motion.span style={{ y }} className="flex flex-col">
        <span className="px-[3px]">{from}</span>
        <span className={`px-[3px] ${toClass}`}>{to}</span>
      </motion.span>
    </span>
  );
}

export const CHANGED = "rounded-[4px] bg-accent text-fg";

export function TagChip({ label, src, className = "" }: { label: string; src: Src; className?: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[4px] px-[3px] ${MONO} text-[10px] leading-[15px] text-fg @lg:px-1 ${className}`}
      style={{ background: `color-mix(in oklab, ${SRC_COLOR[src]} 42%, transparent)` }}
    >
      {label}
    </span>
  );
}

export function Dot({ src, className = "" }: { src: Src; className?: string }) {
  return <i aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`} style={{ background: SRC_COLOR[src] }} />;
}

export function MonoLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`${MONO} text-[10px] uppercase tracking-[0.12em] text-mute @lg:text-[11px] ${className}`}>{children}</span>
  );
}

/* A grid cell that starts as a dashed empty slot and becomes solid as `t` runs. */
export function Frame({ t, flash, className = "", children }: { t: MV; flash?: MV; className?: string; children: ReactNode }) {
  const solid = useTransform(t, [0, 0.08], [0, 1], { clamp: true });
  const dashed = useTransform(solid, (v) => 1 - v);
  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <motion.i aria-hidden style={{ opacity: dashed }} className="absolute inset-0 rounded-md border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: solid }} className="absolute inset-0 rounded-md border border-line-strong bg-surface-1" />
      {flash ? <motion.i aria-hidden style={{ opacity: flash }} className="absolute inset-0 bg-accent/30" /> : null}
      {children}
    </div>
  );
}

/* Position swap: two stacked lines in a clipped box, `t` slides A out and B in. */
export function Swap({ t, a, b, className = "" }: { t: MV; a: ReactNode; b: ReactNode; className?: string }) {
  const y = useTransform(t, (v) => pct(-clamp01(v) * 50));
  return (
    <span className={`block h-[1.4em] overflow-hidden leading-[1.4em] ${className}`}>
      <motion.span style={{ y }} className="flex flex-col">
        <span className="truncate">{a}</span>
        <span className="truncate">{b}</span>
      </motion.span>
    </span>
  );
}
