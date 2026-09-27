import { useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { BAD_ENTRY, MEASURES, measureById, type MeasureId } from "./MtmKitData";
import { clamp01, keyframes, segAt } from "./MtmKitMath";
import { FIELD_T, LAYOUT, SLEEVE_FLIP, SLEEVE_T, STRETCH } from "./MtmFitSceneData";

const linear = (t: number) => t;

const SLEEVE_TYPE_XS = [SLEEVE_T.type[0], SLEEVE_T.type[1], SLEEVE_T.back[0], SLEEVE_T.back[1], SLEEVE_T.retype[0], SLEEVE_T.retype[1]] as const;
const SLEEVE_ARM_XS = [SLEEVE_T.bad[0], SLEEVE_T.bad[1], SLEEVE_T.back[0], SLEEVE_T.back[1], SLEEVE_T.ok[0], SLEEVE_T.ok[1]] as const;
const SLEEVE_YS = [0, 1, 1, 0, 0, 1] as const;

export function revealAt(v: number, id: MeasureId): number {
  if (id === "sleeve") return keyframes(v, SLEEVE_TYPE_XS, SLEEVE_YS, linear);
  return segAt(v, FIELD_T[id].type[0], FIELD_T[id].type[1], linear);
}

export function valueAt(v: number, id: MeasureId): number {
  if (id !== "sleeve") return measureById(id).sample;
  return v < SLEEVE_FLIP ? BAD_ENTRY.typed : BAD_ENTRY.fixed;
}

export function armedAt(v: number, id: MeasureId): number {
  if (id === "sleeve") return keyframes(v, SLEEVE_ARM_XS, SLEEVE_YS, linear);
  return segAt(v, FIELD_T[id].check[0], FIELD_T[id].check[1], linear);
}

/* One flat function of p per field: -1 out of range, 1 in range, scaled by how far the check has run. Never chain it through other derived
   values: a MeasureField combines status with reveal, and inputs of different depth make the combined value stale after a large jump. */
export function statusAt(v: number, id: MeasureId): number {
  const m = measureById(id);
  const n = valueAt(v, id);
  return (n >= m.min && n <= m.max ? 1 : -1) * clamp01(armedAt(v, id));
}

const doneAt = (id: MeasureId) => (id === "sleeve" ? SLEEVE_T.ok[1] : FIELD_T[id].check[1]);

export const validCount = (v: number) => MEASURES.filter((m) => v >= doneAt(m.id)).length;

export type FieldMotion = { readonly value: MV; readonly reveal: MV; readonly status: MV };

export function useFieldMotion(p: MV, id: MeasureId): FieldMotion {
  const reveal = useTransform(p, (v) => revealAt(v, id));
  const value = useTransform(p, (v): number => valueAt(v, id));
  const status = useTransform(p, (v) => statusAt(v, id));
  return { value, reveal, status };
}

const SHAKE_CYCLES = 2.5;

/** A damped sideways shake of `px` over the window [a, b]. */
export function shake(v: number, a: number, b: number, px: number): number {
  const t = segAt(v, a, b);
  return t <= 0 || t >= 1 ? 0 : Math.sin(t * Math.PI * 2 * SHAKE_CYCLES) * (1 - t) * px;
}

export const shakeAt = (v: number) => shake(v, SLEEVE_T.bad[0], SLEEVE_T.bad[1] + 0.012, 4);

/** 0 in the short window, 1 in the stretched one. */
export const stretchAt = (v: number) => keyframes(v, LAYOUT.xs, STRETCH);
