"use client";

import { createContext, useContext, useEffect, useId, useState, type RefObject } from "react";
import { useTransform, type EasingFunction } from "framer-motion";
import { MONO, easeInCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { EXIT_DROP, MAX_EXTRA, NARROW_ICON_SCALE, NARROW_STAGE_PX, TL, VB_H, VB_W } from "./DexaSceneData";

/* Small motion helpers shared by the DEXA scene parts. Every value is a pure
   function of the scroll progress `p`. */

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const linear = (t: number) => t;

/* Snap ease: a short overshoot, milder than easeOutBack. */
export const easeSnap = (t: number) => {
  const c1 = 0.9;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const TXT = `${MONO} text-[11px]`;

export type Span = readonly [number, number];

export function useSpan(p: MV, span: Span, ease?: (t: number) => number): MV {
  return useSeg(p, span[0], span[1], ease);
}

/* Shared exit of the chapter 2 layers: they fade out fast while sinking, so nothing of the
   old chapter is left on screen when the chart card lifts. */
export function useExit(p: MV): { drop: MV; fade: MV } {
  const t = useSpan(p, TL.exit);
  const drop = useTransform(t, (v) => easeInCubic(v) * EXIT_DROP);
  const fade = useTransform(t, (v) => 1 - easeOutCubic(v));
  return { drop, fade };
}

export function useKeys(
  p: MV,
  keys: readonly number[],
  vals: readonly number[],
  ease?: EasingFunction | EasingFunction[],
): MV {
  return useTransform(p, [...keys], [...vals], { clamp: true, ease });
}

/* One shared value that is 0 outside the snaps and runs 0 to 1 right after each. */
export function usePing(p: MV, times: readonly number[], len = 0.035): MV {
  const a = useSeg(p, times[0], times[0] + len);
  const b = useSeg(p, times[1], times[1] + len);
  const c = useSeg(p, times[2], times[2] + len);
  return useTransform([a, b, c], (vals: number[]) => vals.find((v) => v > 0 && v < 1) ?? 0);
}

export function useUid(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

export const px = (v: number) => v.toFixed(2);

/* Stage measures for the current box: `extra` is the added viewBox height, see ZONE in the
   data file; `narrow` marks a phone-width box. Both are set only from the resize observer,
   which also reports the first size, so they start flat (server render and desktop) and
   never depend on scroll. */
export type Stage = { extra: number; narrow: boolean };
const FLAT_STAGE: Stage = { extra: 0, narrow: false };
export const StageContext = createContext<Stage>(FLAT_STAGE);
export const useExtra = () => useContext(StageContext).extra;
/* Badge size in stage units: `wide` on a normal stage, `narrow` (default 1.25x) on a phone. */
export function useIconSize(wide: number, narrow = wide * NARROW_ICON_SCALE): number {
  return useContext(StageContext).narrow ? narrow : wide;
}

export function useStageExtra(ref: RefObject<SVGSVGElement | null>): Stage {
  const [stage, setStage] = useState(FLAT_STAGE);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const units = width > 0 ? (VB_W * height) / width : VB_H;
      const extra = Math.round(Math.min(MAX_EXTRA, Math.max(0, units - VB_H)));
      const narrow = width > 0 && width < NARROW_STAGE_PX;
      setStage((prev) => (prev.extra === extra && prev.narrow === narrow ? prev : { extra, narrow }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return stage;
}
