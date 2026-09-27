"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { measureById, type MeasureId } from "./MtmKitData";
import { TONE_VAR, mixColor, statusMix } from "./MtmKitMath";
import { useFieldMotion } from "./MtmFitSceneMotion";

const INK = "var(--color-fg)";
const ACCENT = TONE_VAR.accent;
const FILL = mixColor(TONE_VAR.sky, 0.3, "transparent");
const PAPER = mixColor(INK, 0.7, "transparent");
const MINT = mixColor(TONE_VAR.mint, 0.85, "transparent");

const BODY = "M96 26L60 42L26 148L48 156L74 100L72 198H148L146 100L172 156L194 148L160 42L124 26Q110 36 96 26Z";
const WINGS = "M96 26L83 46L109 58ZM124 26L137 46L111 58Z";
const DETAIL = "M110 58V198M30.4 134.2L51.4 148.7M189.6 134.2L168.6 148.7";
const BUTTONS = [78, 100, 122, 144, 166, 188] as const;
const HEIGHT_TICKS = "M200 26H212M200 204H212";

const LINES = {
  height: "M206 26V204",
  collar: "M93 30Q110 44 127 30",
  band: "M73 111H147",
  waist: "M72.5 155H147.5",
  cup: "M142 90A10 10 0 1 0 122 90A10 10 0 1 0 142 90",
} as const;

const SLEEVE_FROM = [60, 42] as const;
const SLEEVE_DIR = [-23, 110] as const;
const SLEEVE = measureById("sleeve");
const SLEEVE_LEN = Math.hypot(SLEEVE_DIR[0], SLEEVE_DIR[1]);
const ZONE_OFFSET = 18;
const TICK = 5;

const alongSleeve = (t: number) => [SLEEVE_FROM[0] + SLEEVE_DIR[0] * t, SLEEVE_FROM[1] + SLEEVE_DIR[1] * t] as const;

function zonePath() {
  const nx = (-SLEEVE_DIR[1] / SLEEVE_LEN) * ZONE_OFFSET;
  const ny = (SLEEVE_DIR[0] / SLEEVE_LEN) * ZONE_OFFSET;
  const tx = (-nx / ZONE_OFFSET) * TICK;
  const ty = (-ny / ZONE_OFFSET) * TICK;
  const [ax, ay] = alongSleeve(SLEEVE.min / SLEEVE.max);
  const [bx, by] = alongSleeve(1);
  const f = (n: number) => n.toFixed(2);
  const a = `${f(ax + nx)} ${f(ay + ny)}`;
  const b = `${f(bx + nx)} ${f(by + ny)}`;
  return `M${a}L${b}M${a}l${f(tx)} ${f(ty)}M${b}l${f(tx)} ${f(ty)}`;
}
const ZONE = zonePath();

function useLine(p: MV, id: MeasureId) {
  const fm = useFieldMotion(p, id);
  const color = useTransform([fm.status, fm.reveal], ([s, r]: number[]) => (r > 0.001 && r < 0.999 ? ACCENT : statusMix(s, INK)));
  const seen = useTransform(fm.reveal, (r) => (r > 0.001 ? 1 : 0));
  return { ...fm, color, seen };
}

const IDLE = { fill: "none", stroke: INK, strokeOpacity: 0.5, strokeWidth: 1.6, strokeDasharray: "3 4", strokeLinecap: "round" } as const;

function PathLine({ p, id, d }: { p: MV; id: Exclude<MeasureId, "sleeve">; d: string }) {
  const { reveal, color, seen } = useLine(p, id);
  return (
    <g>
      <path d={d} {...IDLE} />
      <motion.path d={d} fill="none" strokeWidth={2.8} strokeLinecap="round" style={{ pathLength: reveal, stroke: color, opacity: seen }} />
    </g>
  );
}

function SleeveLine({ p }: { p: MV }) {
  const { value, reveal, color, seen } = useLine(p, "sleeve");
  const reach = useTransform([value, reveal], ([v, r]: number[]) => (v / SLEEVE.max) * r);
  const x2 = useTransform(reach, (t) => alongSleeve(t)[0]);
  const y2 = useTransform(reach, (t) => alongSleeve(t)[1]);
  const [ex, ey] = alongSleeve(1);
  return (
    <g>
      <path d={`M${SLEEVE_FROM[0]} ${SLEEVE_FROM[1]}L${ex} ${ey}`} {...IDLE} />
      <motion.line x1={SLEEVE_FROM[0]} y1={SLEEVE_FROM[1]} x2={x2} y2={y2} strokeWidth={2.8} strokeLinecap="round" style={{ stroke: color, opacity: seen }} />
      <motion.circle cx={x2} cy={y2} r={3.8} stroke="var(--color-bg)" strokeWidth={1.2} style={{ fill: color, opacity: seen }} />
    </g>
  );
}

function Shirt() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d={BODY} fill={FILL} stroke={INK} strokeWidth={2.2} />
      <path d={WINGS} fill={PAPER} stroke={INK} strokeWidth={2} />
      <path d={DETAIL} fill="none" stroke={INK} strokeWidth={1.8} />
      {BUTTONS.map((y) => (
        <circle key={y} cx={110} cy={y} r={2} fill={INK} />
      ))}
      <path d={ZONE} fill="none" stroke={MINT} strokeWidth={3} />
      <path d={HEIGHT_TICKS} fill="none" stroke={INK} strokeOpacity={0.5} strokeWidth={1.6} />
    </g>
  );
}

export function Garment({ p }: { p: MV }) {
  return (
    <svg viewBox="10 18 206 194" aria-hidden className="absolute inset-0 h-full w-full">
      <Shirt />
      <PathLine p={p} id="height" d={LINES.height} />
      <PathLine p={p} id="collar" d={LINES.collar} />
      <PathLine p={p} id="band" d={LINES.band} />
      <PathLine p={p} id="waist" d={LINES.waist} />
      <PathLine p={p} id="cup" d={LINES.cup} />
      <SleeveLine p={p} />
    </svg>
  );
}
