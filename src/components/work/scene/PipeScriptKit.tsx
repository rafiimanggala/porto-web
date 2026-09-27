"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, motionValue, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { clamp01, pct } from "./PipeKitMath";
import { AH, AW } from "./PipeScriptData";

/* Shared bits of the script scene: the fixed-ratio artboard and its unit system, wipes between chapters, a position
   swap and a few small pure helpers. Everything is a pure function of the progress values it receives. */

/** Length of n stage units (1 unit is about 1 px on a phone, scaled with the artboard). */
export const u = (n: number) => `calc(var(--u) * ${n})`;
/** Font size of n units, never below 11 px so text that scales in or out stays at 10 px or more. */
export const fs = (n: number) => `max(11px, calc(var(--u) * ${n}))`;
/** Same with a higher floor, for chips that shrink a little while they move. */
export const fsChip = (n: number) => `max(12px, calc(var(--u) * ${n}))`;
export const X = (x: number) => `${((x / AW) * 100).toFixed(3)}%`;
export const Y = (y: number) => `${((y / AH) * 100).toFixed(3)}%`;

export const TXT = 10.5;
export const SMALL = 10;

export const boxAt = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: X(x), top: Y(y), width: X(w), height: Y(h) });

/** A 358 by 420 board centred in the visual, as large as fits. Children use percent of it and `u()` lengths. */
export function Artboard({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [container-type:inline-size]"
        style={{ width: `min(100cqw, calc(100cqh * ${AW} / ${AH}))`, aspectRatio: `${AW} / ${AH}` }}
      >
        <div className="absolute inset-0" style={{ ["--u" as string]: `calc(100cqw / ${AW})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const ONE = motionValue(1);
const ZERO = motionValue(0);

/** One page of a wipe: visible from the left up to `enter`, and covered from the left up to `leave`. */
export function Layer({ enter = ONE, leave = ZERO, className = "absolute inset-0", children }: { enter?: MV; leave?: MV; className?: string; children: ReactNode }) {
  const clip = useTransform([enter, leave], ([e, l]: number[]) => `inset(0 ${pct(100 - e * 100)} 0 ${pct(l * 100)})`);
  return (
    <motion.div style={{ clipPath: clip }} className={className}>
      {children}
    </motion.div>
  );
}

/** The thin accent line that rides the front of a wipe. */
export function Edge({ front, style }: { front: MV; style: CSSProperties }) {
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return <motion.i aria-hidden style={{ ...style, left, opacity }} className="pointer-events-none absolute z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent" />;
}

/** Position swap: two stacked lines in a clipped box, `t` slides `a` out and `b` in. */
export function Roll({ t, a, b, className = "" }: { t: MV; a: ReactNode; b: ReactNode; className?: string }) {
  const y = useTransform(t, (v) => pct(-clamp01(v) * 50));
  return (
    <span className={`block h-[1.4em] overflow-hidden leading-[1.4em] ${className}`}>
      <motion.span style={{ y }} className="flex flex-col">
        <span className="whitespace-nowrap">{a}</span>
        <span className="whitespace-nowrap">{b}</span>
      </motion.span>
    </span>
  );
}

/** Triangle pulse: 1 at `at`, 0 at `at` plus or minus `w`. */
export const tri = (v: number, at: number, w: number) => clamp01(1 - Math.abs(v - at) / w);

/** 0..1 ramp of the ripple that started last, 0 outside any ripple. */
export function ripples(v: number, times: readonly number[], dur: number) {
  const hit = times.find((t) => v > t && v < t + dur);
  return hit === undefined ? 0 : (v - hit) / dur;
}

/** `color-mix` of two css colours, `t` 0 gives a, 1 gives b. */
export const blend = (a: string, b: string, t: number) => `color-mix(in oklab, ${a} ${((1 - clamp01(t)) * 100).toFixed(1)}%, ${b})`;
