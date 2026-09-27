import { useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { clamp01 } from "./PipeKitMath";

/* Pure helpers for the shorts scene. */

const EDGE = 0.012;

/** A window of progress [a, b] with an optional edge width for the fade in and out. */
export type Span = readonly [number, number] | readonly [number, number, number];

/** 0 before a, ramps up over `rise`, holds, ramps down to 0 at b over `fall`. */
export function trap(v: number, a: number, b: number, rise = EDGE, fall = rise): number {
  return clamp01(Math.min((v - a) / rise, (b - v) / fall));
}

export const spanValue = (v: number, spans: readonly Span[]) => spans.reduce((m, s) => Math.max(m, trap(v, s[0], s[1], s[2] ?? EDGE)), 0);

export function useSpans(p: MV, spans: readonly Span[]): MV {
  return useTransform(p, (v) => spanValue(v, spans));
}

/** Eased 0..1 progress of the window [a, b]. */
export const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

export const insetTop = (t: number) => `inset(0 0 ${((1 - t) * 100).toFixed(2)}% 0)`;
export const insetLeft = (t: number) => `inset(0 ${((1 - t) * 100).toFixed(2)}% 0 0)`;

/** Whole seconds left on a poll countdown of `total` seconds at progress t (1 = just started, 0 = done). */
export const countdown = (total: number, t: number) => Math.ceil(total * (1 - t) - 1e-6);
