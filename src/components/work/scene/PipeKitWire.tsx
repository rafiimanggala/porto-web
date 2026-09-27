"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { cubicPath, type Pt, type WirePath } from "./PipeKitPath";

export * from "./PipeKitPath";

/* Wires and moving dots for an svg stage. Use them inside a parent <svg viewBox> with the default
   preserveAspectRatio (uniform scale), so stroke widths and pathLength behave. Build paths once, at module
   scope or in a useMemo, with linePath, cubicPath, elbowPath, polyPath or loopBackPath. */

export type WireTone = "accent" | "mint" | "sun" | "sky" | "rose";
const TONE: Record<WireTone, string> = {
  accent: "var(--color-accent)",
  mint: "var(--color-mint)",
  sun: "var(--color-sun)",
  sky: "var(--color-sky)",
  rose: "var(--color-rose)",
};

const WIRE_WIDTH = 2;
const DASH = "3 5";
const ARROW = "M-6.5 -3.6L0 0L-6.5 3.6Z";
const ARROW_FROM = 0.9;
const END_FADE = 24;

type WireProps = {
  /** Prebuilt path. Wins over from/to. */
  path?: WirePath;
  /** Shortcut: draws a cubic S curve from `from` to `to`. */
  from?: Pt;
  to?: Pt;
  /** 0..1: how much of the accent overlay is drawn along the wire. */
  draw: MV;
  tone?: WireTone;
  width?: number;
  /** Dash the resting wire. */
  dashed?: boolean;
  /** Arrowhead at the end, fades in as the overlay arrives. */
  arrow?: boolean;
};

function Arrowhead({ path, draw, tone, width }: { path: WirePath; draw: MV; tone: WireTone; width: number }) {
  const opacity = useTransform(draw, [ARROW_FROM, 1], [0, 1]);
  const [x, y] = path.at(1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${path.angleAt(1)})`}>
      <motion.path d={ARROW} style={{ opacity }} fill={TONE[tone]} stroke={TONE[tone]} strokeWidth={width * 0.6} strokeLinejoin="round" />
    </g>
  );
}

/** Resting wire in line-strong plus an overlay that draws itself as `draw` runs from 0 to 1. */
export function Wire({ path, from, to, draw, tone = "accent", width = WIRE_WIDTH, dashed = false, arrow = false }: WireProps) {
  const shown = useTransform(draw, (v) => (v > 0.001 ? 1 : 0));
  const route = path ?? (from && to ? cubicPath(from, to) : undefined);
  if (!route) return null;
  return (
    <g>
      <path d={route.d} fill="none" stroke="var(--color-line-strong)" strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? DASH : undefined} />
      <motion.path
        d={route.d}
        fill="none"
        stroke={TONE[tone]}
        strokeWidth={width}
        strokeLinecap="round"
        style={{ pathLength: draw, opacity: shown }}
      />
      {arrow ? <Arrowhead path={route} draw={draw} tone={tone} width={width} /> : null}
    </g>
  );
}

/** Position (path units) and heading (degrees) of a point riding `path` at `progress`. For placing any svg item on a wire. */
export function usePathPoint(path: WirePath, progress: MV) {
  const x = useTransform(progress, (v) => path.at(v)[0]);
  const y = useTransform(progress, (v) => path.at(v)[1]);
  const angle = useTransform(progress, (v) => path.angleAt(v));
  return { x, y, angle };
}

const TRAIL_STEP = 0.028;
const TRAIL_FADE = 0.3;
const TRAIL_SHRINK = 0.2;

function PulseDot({ path, progress, r, tone, lag, index }: { path: WirePath; progress: MV; r: number; tone: WireTone; lag: number; index: number }) {
  const shifted = useTransform(progress, (v) => v - lag);
  const { x, y } = usePathPoint(path, shifted);
  const opacity = useTransform(shifted, (v) => Math.max(0, Math.min(1, v * END_FADE, (1 - v) * END_FADE)) * (1 - TRAIL_FADE * index));
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r * (1 - TRAIL_SHRINK * index)}
      style={{ opacity }}
      fill={TONE[tone]}
      stroke="var(--color-bg)"
      strokeWidth={1.4}
    />
  );
}

type PulseProps = {
  path: WirePath;
  /** 0..1 along the path. The dot is hidden at exactly 0 and 1. */
  progress: MV;
  /** Dot radius in path units. Default 3.6. */
  r?: number;
  tone?: WireTone;
  /** Extra fading dots behind the head, 0 to 3. Default 0. */
  trail?: number;
};

/** A dot that rides `path` at `progress`. */
export function Pulse({ path, progress, r = 3.6, tone = "accent", trail = 0 }: PulseProps) {
  const count = Math.min(3, Math.max(0, trail)) + 1;
  return (
    <g>
      {Array.from({ length: count }, (_, k) => count - 1 - k).map((i) => (
        <PulseDot key={i} path={path} progress={progress} r={r} tone={tone} lag={i * TRAIL_STEP} index={i} />
      ))}
    </g>
  );
}
