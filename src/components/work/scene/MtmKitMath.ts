import { useMemo } from "react";
import { motionValue } from "framer-motion";
import type { MV } from "./HealthSceneParts";

export { clamp01, lerp, pct, segAt, keyframes, useKeys, useSpan } from "./PipeKitMath";

/* Small helpers of the made-to-measure kit. Every animated prop of the kit accepts a MotionValue or a plain number. */

export type MvIn = MV | number;

/** A MotionValue from a MotionValue or a constant. Pass booleans through Number(). */
export function useMv(input: MvIn): MV {
  return useMemo(() => (typeof input === "number" ? motionValue(input) : input), [input]);
}

export type ToneName = "accent" | "mint" | "sun" | "sky" | "rose";

export const TONE_VAR: Readonly<Record<ToneName, string>> = {
  accent: "var(--color-accent)",
  mint: "var(--color-mint)",
  sun: "var(--color-sun)",
  sky: "var(--color-sky)",
  rose: "var(--color-rose)",
};

/** `amount` percent (0..1) of colour `a` over colour `b`, as a CSS colour. */
export const mixColor = (a: string, amount: number, b: string) =>
  `color-mix(in oklab, ${a} ${(Math.min(1, Math.max(0, amount)) * 100).toFixed(1)}%, ${b})`;

/** Transparent tint of a tone, for chips and fills. */
export const toneTint = (tone: ToneName, amount: number) => mixColor(TONE_VAR[tone], amount, "transparent");

/** Booleans become 0 or 1, so a card can take `selected` as a flag or as a scrubbed value. */
export const num = (x: MvIn | boolean): MvIn => (typeof x === "boolean" ? Number(x) : x);

const NEUTRAL_LINE = "var(--color-line-strong)";

/** Status s in -1..1 as a colour: rose towards -1, `neutral` at 0, mint towards 1. */
export const statusMix = (s: number, neutral: string = NEUTRAL_LINE) =>
  mixColor(s >= 0 ? TONE_VAR.mint : TONE_VAR.rose, Math.abs(s), neutral);
