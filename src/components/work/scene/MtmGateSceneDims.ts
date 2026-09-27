import { useTransform, type MotionValue } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { BAD_ENTRY, MEASURES, measureById, type MeasureId } from "./MtmKitData";
import { clamp01, useKeys, useMv } from "./MtmKitMath";
import { CHIPS_SAVED, CHIP, T, labelOf } from "./MtmGateSceneData";
import { typedAt, type FreshMotion } from "./MtmGateSceneFields";

/* Dimension lines on the shirt drawing. A line is drawn while its value stands behind the choice: pinned from a saved
   pattern, or typed into the fresh fitting. The sleeve line is as long as its value, so a sleeve of 112 runs off the cuff. */

export type Dim = { draw: MV; status: MV };
export type SleeveDim = { draw: MV; status: MV; cm: MV; label: MotionValue<string> };
export type DimMotion = { height: Dim; collar: Dim; band: Dim; waist: Dim; sleeve: SleeveDim };

/* A saved pattern pins its values in MEASURES order, so each line draws in the slot of its own chip. The cup has no line on a shirt. */
const orderOf = (id: MeasureId) => MEASURES.findIndex((m) => m.id === id);
const SAVED_ORDER = { height: orderOf("height"), collar: orderOf("collar"), sleeve: orderOf("sleeve"), band: orderOf("band"), waist: orderOf("waist") } as const;
const OK_STATUS = 1;
const NAME = labelOf(measureById(BAD_ENTRY.id));

function useSaved(p: MV, i: number): MV {
  const a = CHIPS_SAVED + i * CHIP.stagger;
  return useKeys(p, [a, a + CHIP.draw, T.dimsClear[0], T.dimsClear[1]], [0, 1, 1, 0]);
}

function useEither(a: MV, b: MV): MV {
  return useTransform([a, b], ([x, y]: number[]) => Math.max(x, y));
}

function useSavedThenFresh(p: MV, fresh: MV): MV {
  return useTransform([p, fresh], ([v, s]: number[]) => (v < T.paneFresh[0] ? OK_STATUS : s));
}

/* The sleeve line is as long as the number typed so far, and its chip names the digits typed so far, so shirt and field agree. */
function useSleeveDim(p: MV, f: FreshMotion): SleeveDim {
  const saved = useSaved(p, SAVED_ORDER.sleeve);
  const cm = useTransform([f.sleeve.cm, saved], ([typed, s]: number[]) => Math.max(typed, BAD_ENTRY.fixed * s));
  const draw = useTransform(cm, (c) => clamp01(c / BAD_ENTRY.fixed));
  const label = useTransform(p, (v) => `${NAME} ${v < T.paneFresh[0] ? BAD_ENTRY.fixed : typedAt(v)}`);
  return { draw, status: useSavedThenFresh(p, f.sleeve.status), cm, label };
}

export function useDimMotion(p: MV, f: FreshMotion): DimMotion {
  const ok = useMv(OK_STATUS);
  return {
    height: { draw: useEither(useSaved(p, SAVED_ORDER.height), f.height.line), status: useSavedThenFresh(p, f.height.status) },
    collar: { draw: useEither(useSaved(p, SAVED_ORDER.collar), f.collar.line), status: useSavedThenFresh(p, f.collar.status) },
    band: { draw: useSaved(p, SAVED_ORDER.band), status: ok },
    waist: { draw: useSaved(p, SAVED_ORDER.waist), status: ok },
    sleeve: useSleeveDim(p, f),
  };
}
