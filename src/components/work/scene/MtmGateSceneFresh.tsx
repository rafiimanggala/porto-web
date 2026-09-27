"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import type { Measure } from "./MtmKitData";
import { MeasureField } from "./MtmKitCards";
import { clamp01 } from "./MtmKitMath";
import { FRESH_FIELDS, HINT, LAYOUT, SLEEVE } from "./MtmGateSceneData";
import type { FieldMotion, SleeveMotion } from "./MtmGateSceneFields";
import type { GateMotion } from "./MtmGateSceneMotion";
import { TabsSpacer } from "./MtmGateSceneSaved";
import { Ink } from "./MtmGateSceneWipe";

/* The fresh fitting page. Height and collar type in and pass. The sleeve is typed wrong, corrected, then edited again and abandoned. */

function FreshField({ measure, field }: { measure: Measure; field: FieldMotion }) {
  return (
    <MeasureField
      label={measure.label}
      unit={measure.unit}
      value={measure.sample}
      range={[measure.min, measure.max]}
      status={field.status}
      reveal={field.reveal}
    />
  );
}

function SleeveField({ field }: { field: SleeveMotion }) {
  return (
    <MeasureField
      label={SLEEVE.label}
      unit={SLEEVE.unit}
      value={field.text}
      range={[SLEEVE.min, SLEEVE.max]}
      status={field.status}
      reveal={field.reveal}
    />
  );
}

function CancelChip({ press }: { press: MV }) {
  const ring = useTransform(press, (t) => (t > 0 && t < 1 ? (1 - t) * 0.8 : 0));
  const scale = useTransform(press, (t) => 1 + 0.14 * t);
  const fill = useTransform(press, (t) => Math.sin(Math.PI * clamp01(t)));
  return (
    <span className="relative inline-flex h-6 items-center rounded-full border border-line-strong px-3 text-[11px] leading-none text-dim">
      <motion.i style={{ opacity: fill }} className="absolute -inset-px rounded-full bg-accent/20" />
      <motion.i style={{ scale, opacity: ring }} className="absolute -inset-px rounded-full border-2 border-accent" />
      <span className="relative">{HINT.cancel}</span>
    </span>
  );
}

export function FreshPane({ m }: { m: GateMotion }) {
  return (
    <Ink className="flex h-full flex-col" style={{ padding: LAYOUT.panePad, gap: LAYOUT.gap }}>
      <TabsSpacer />
      <div className="grid grid-cols-3 gap-2">
        <FreshField measure={FRESH_FIELDS[0]} field={m.fresh.height} />
        <FreshField measure={FRESH_FIELDS[1]} field={m.fresh.collar} />
        <SleeveField field={m.fresh.sleeve} />
      </div>
      <div className="flex items-center justify-between">
        <span className={`${MONO} text-[10px] text-mute`}>{HINT.unit}</span>
        <CancelChip press={m.cancel} />
      </div>
    </Ink>
  );
}
