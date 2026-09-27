"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { MEASURES, measureById, type MeasureId } from "./MtmKitData";
import { MeasureField } from "./MtmKitCards";
import { Garment } from "./MtmFitSceneGarment";
import { GateRow } from "./MtmFitSceneGate";
import { CheckLog } from "./MtmFitSceneLog";
import { shakeAt, useFieldMotion } from "./MtmFitSceneMotion";

function FieldCell({ p, id }: { p: MV; id: MeasureId }) {
  const m = measureById(id);
  const { value, reveal, status } = useFieldMotion(p, id);
  const x = useTransform(p, (v): number => (id === "sleeve" ? shakeAt(v) : 0));
  return (
    <motion.div style={{ x }}>
      <MeasureField label={m.label} unit={m.unit} value={value} range={[m.min, m.max]} status={status} reveal={reveal} letters={m.letters} />
    </motion.div>
  );
}

export function FormPage({ p }: { p: MV }) {
  return (
    <div className="absolute inset-0 flex flex-col gap-2 p-2.5 @[520px]:gap-4 @[520px]:p-4 @[520px]:[@media(min-height:820px)]:pb-[76px]">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)] gap-2 @[520px]:gap-4">
        <div className="relative min-h-0">
          <Garment p={p} />
        </div>
        <CheckLog p={p} />
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-2 @[520px]:gap-x-3 @[520px]:gap-y-3">
        {MEASURES.map((m) => (
          <FieldCell key={m.id} p={p} id={m.id} />
        ))}
      </div>
      <GateRow p={p} />
    </div>
  );
}
