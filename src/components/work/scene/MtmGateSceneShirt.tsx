"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { BAD_ENTRY, FABRICS, fabricColor, measureById } from "./MtmKitData";
import { TONE_VAR, clamp01, mixColor, statusMix } from "./MtmKitMath";
import { PICK, T, labelOf } from "./MtmGateSceneData";
import type { Dim, DimMotion, SleeveDim } from "./MtmGateSceneDims";

/* A flat long sleeve shirt as a pattern sheet: the fabric fills it, collar and cuffs appear when chosen, and dimension lines
   show the numbers that stand behind the choice. */

const VB_W = 240;
const VB_H = 150;
const INK = "var(--color-fg)";
const PAPER = "color-mix(in oklab, var(--color-fg) 84%, transparent)";
const BODY = "M104 24L70 32L40 84L56 92L84 58L86 138H154L156 58L184 92L200 84L170 32L136 24Q120 40 104 24Z";
const COLLAR = "M102 22L88 44L118 54L120 38ZM138 22L152 44L122 54L120 38Z";
const CUFFS = "M40 84L56 92L53 99L36 91ZM200 84L184 92L187 99L204 91Z";
const PLACKET = "M120 54V138";
const BUTTONS = [68, 88, 108, 128] as const;
const CUFF_BUTTONS = [[43, 91.5], [49, 94.5], [197, 91.5], [191, 94.5]] as const;
const LINE_W = 1.6;
const TICK = 4;
/* A line fades in by its length in drawing units, so a line that is almost retracted is already gone and leaves no speck. */
const LINE_FROM = 3;
const LINE_RAMP = 8;
const CAP_AFTER = 18;
const CAP_RAMP = 8;
/* Lines also fade with the share of them that is drawn, so a line that retracts dims as it shrinks instead of leaving crisp debris. */
const FADE_FROM = 0.3;
const FADE_RAMP = 0.4;
const END_FROM = 0.9;
const END_RAMP = 0.07;
const DOT_FROM = 14;
const DOT_RAMP = 8;
const CHIP_GAP = 6;

const SHOULDER = [70, 32] as const;
const CUFF_END = [40, 84] as const;
const SLEEVE_LEN = Math.hypot(CUFF_END[0] - SHOULDER[0], CUFF_END[1] - SHOULDER[1]);
const DIR = [(CUFF_END[0] - SHOULDER[0]) / SLEEVE_LEN, (CUFF_END[1] - SHOULDER[1]) / SLEEVE_LEN] as const;
const OFFSET = 9;
const START = [SHOULDER[0] - OFFSET * DIR[1], SHOULDER[1] + OFFSET * DIR[0]] as const;
const UNITS_PER_CM = SLEEVE_LEN / BAD_ENTRY.fixed;

type Spec = { id: "height" | "collar" | "band" | "waist"; x1: number; y1: number; x2: number; y2: number; text: string; chipDx?: number };
/* The chip text names the measure by its MEASURES label and shows its sample value, so the shirt reads like the pinned chips. */
const sample = (id: Spec["id"]) => {
  const m = measureById(id);
  return `${labelOf(m)} ${m.sample}`;
};
const SPECS: readonly Spec[] = [
  { id: "height", x1: 246, y1: 24, x2: 246, y2: 138, text: sample("height") },
  { id: "collar", x1: 104, y1: 9, x2: 136, y2: 9, text: sample("collar"), chipDx: 10 },
  { id: "band", x1: 84, y1: 72, x2: 156, y2: 72, text: sample("band") },
  { id: "waist", x1: 85, y1: 112, x2: 155, y2: 112, text: sample("waist") },
];

const xPct = (x: number) => `${((x / VB_W) * 100).toFixed(3)}%`;
const yPct = (y: number) => `${((y / VB_H) * 100).toFixed(3)}%`;

const fadeOf = (d: number) => clamp01((d - FADE_FROM) / FADE_RAMP);

function tickAt(s: Spec, x: number, y: number) {
  return s.x1 === s.x2 ? `M${x - TICK} ${y}H${x + TICK}` : `M${x} ${y - TICK}V${y + TICK}`;
}

function ShirtBody({ p }: { p: MV }) {
  const fabric = useSeg(p, T.fabric[0], T.fabric[1], easeOutCubic);
  const collar = useSeg(p, T.collar[0], T.collar[1], easeOutCubic);
  const cuff = useSeg(p, T.cuff[0], T.cuff[1], easeOutCubic);
  const fill = useTransform(fabric, (t) => mixColor(fabricColor(FABRICS[PICK.fabric]), t, "var(--color-surface-2)"));
  const collarY = useTransform(collar, (t) => (1 - t) * -5);
  return (
    <g stroke={INK} strokeWidth={LINE_W} strokeLinejoin="round" strokeLinecap="round">
      <motion.path d={BODY} style={{ fill }} />
      <path d={PLACKET} fill="none" strokeWidth={1.2} />
      {BUTTONS.map((y) => (
        <circle key={y} cx={120} cy={y} r={1.6} fill={INK} stroke="none" />
      ))}
      <motion.g style={{ opacity: collar, y: collarY }}>
        <path d={COLLAR} fill={PAPER} />
      </motion.g>
      <motion.g style={{ opacity: cuff }}>
        <path d={CUFFS} fill={PAPER} />
        {CUFF_BUTTONS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill={INK} stroke="none" />
        ))}
      </motion.g>
    </g>
  );
}

function DimStroke({ spec, dim }: { spec: Spec; dim: Dim }) {
  const color = useTransform(dim.status, (s) => statusMix(s, TONE_VAR.accent));
  const len = Math.hypot(spec.x2 - spec.x1, spec.y2 - spec.y1);
  const line = useTransform(dim.draw, (d) => Math.min(fadeOf(d), clamp01((d * len - LINE_FROM) / LINE_RAMP)));
  const start = useTransform(dim.draw, (d) => Math.min(fadeOf(d), clamp01((d * len - CAP_AFTER) / CAP_RAMP)));
  const end = useTransform(dim.draw, (d) => clamp01((d - END_FROM) / END_RAMP));
  const common = { fill: "none", strokeWidth: LINE_W, strokeLinecap: "round" } as const;
  return (
    <g>
      <motion.path d={`M${spec.x1} ${spec.y1}L${spec.x2} ${spec.y2}`} {...common} style={{ pathLength: dim.draw, opacity: line, stroke: color }} />
      <motion.path d={tickAt(spec, spec.x1, spec.y1)} {...common} style={{ opacity: start, stroke: color }} />
      <motion.path d={tickAt(spec, spec.x2, spec.y2)} {...common} style={{ opacity: end, stroke: color }} />
    </g>
  );
}

function SleeveStroke({ dim }: { dim: SleeveDim }) {
  const color = useTransform(dim.status, (s) => statusMix(s, TONE_VAR.accent));
  const x2 = useTransform(dim.cm, (c) => START[0] + DIR[0] * c * UNITS_PER_CM);
  const y2 = useTransform(dim.cm, (c) => START[1] + DIR[1] * c * UNITS_PER_CM);
  const on = useTransform(dim.cm, (c) => Math.min(fadeOf(c / BAD_ENTRY.fixed), clamp01((c - DOT_FROM) / DOT_RAMP)));
  return (
    <g>
      <motion.line x1={START[0]} y1={START[1]} x2={x2} y2={y2} strokeWidth={LINE_W} strokeLinecap="round" style={{ stroke: color, opacity: on }} />
      <motion.circle cx={START[0]} cy={START[1]} r={2.2} style={{ fill: color, opacity: on }} />
      <motion.circle cx={x2} cy={y2} r={2.2} style={{ fill: color, opacity: on }} />
    </g>
  );
}

const CHIP_BASE = `${MONO} absolute whitespace-nowrap -translate-y-1/2 rounded-[4px] border bg-surface-1 px-1 py-[1px] text-[10px] leading-3 tabular-nums text-fg`;
const CHIP_CENTER = `${CHIP_BASE} -translate-x-1/2`;
const CHIP_END = `${CHIP_BASE} -translate-x-full`;

type ChipProps = { left: string | MotionValue<string>; top: string | MotionValue<string>; draw: MV; status: MV; end?: boolean; children: ReactNode };

/* `end` sets the chip so that its right edge sits on `left`: the sleeve chip stands beside its line, in the free space outside the shirt. */
function DimChip({ left, top, draw, status, end = false, children }: ChipProps) {
  const opacity = useTransform(draw, (d) => Math.min(1, Math.max(0, (d - 0.5) * 2)));
  const borderColor = useTransform(status, (s) => statusMix(s, TONE_VAR.accent));
  return (
    <motion.span style={{ left, top, opacity, borderColor }} className={end ? CHIP_END : CHIP_CENTER}>
      {children}
    </motion.span>
  );
}

function SleeveChip({ dim }: { dim: SleeveDim }) {
  const left = useTransform(dim.cm, (c) => xPct(START[0] + (DIR[0] * c * UNITS_PER_CM) / 2 - CHIP_GAP));
  const top = useTransform(dim.cm, (c) => yPct(START[1] + (DIR[1] * c * UNITS_PER_CM) / 2));
  return (
    <DimChip left={left} top={top} draw={dim.draw} status={dim.status} end>
      <motion.span>{dim.label}</motion.span>
    </DimChip>
  );
}

const BOX_H = "min(100cqh - 16px, 150px)";

export function ShirtArt({ p, dims }: { p: MV; dims: DimMotion }) {
  return (
    <div className="relative" style={{ height: BOX_H, aspectRatio: `${VB_W} / ${VB_H}` }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
        <ShirtBody p={p} />
        {SPECS.map((spec) => (
          <DimStroke key={spec.id} spec={spec} dim={dims[spec.id]} />
        ))}
        <SleeveStroke dim={dims.sleeve} />
      </svg>
      {SPECS.map((spec) => (
        <DimChip key={spec.id} left={xPct((spec.x1 + spec.x2) / 2 + (spec.chipDx ?? 0))} top={yPct((spec.y1 + spec.y2) / 2)} draw={dims[spec.id].draw} status={dims[spec.id].status}>
          {spec.text}
        </DimChip>
      ))}
      <SleeveChip dim={dims.sleeve} />
    </div>
  );
}
