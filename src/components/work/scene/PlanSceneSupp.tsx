"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SUPPS, TL, type Gauge, type Supp } from "./PlanSceneData";
import { Dot, MonoLabel, Swap, clamp01, lerp, pct, segAt } from "./PlanSceneKit";

const ROW_GRID = "grid min-h-0 grid-cols-[minmax(0,0.9fr)_36px_minmax(0,1.15fr)] items-stretch @lg:grid-cols-[minmax(0,0.9fr)_84px_minmax(0,1.1fr)]";
const GENO = ["CC", "CT", "TT"] as const;
const rowStart = (i: number) => TL.supp.start + i * TL.supp.step;
const rowEnd = (i: number) => rowStart(i) + TL.supp.dur;

export const keptCount = (v: number) => SUPPS.filter((s, i) => s.kept && v >= rowEnd(i)).length;
const OPEN_COUNT = SUPPS.filter((s) => !s.kept).length;
export const skippedCount = (v: number) => (v >= TL.supp.skip[1] ? OPEN_COUNT : 0);
const startedCount = (v: number) => SUPPS.filter((_, i) => v >= rowStart(i)).length;

/* Kept and skipped only count once decided. A candidate that is drawn but not
   yet settled reads as "evaluating", so the tally never announces the verdict
   before the strike-through lands. */
export function verdict(v: number) {
  const kept = keptCount(v);
  const skipped = skippedCount(v);
  const open = startedCount(v) - kept - skipped;
  if (skipped) return `${kept} kept, ${skipped} skipped`;
  return open > 0 ? `${kept} kept, ${open} evaluating` : `${kept} kept`;
}

function RangeGauge({ g, sweep }: { g: Extract<Gauge, { kind: "range" }>; sweep: MV }) {
  const ok = g.v >= g.lo && g.v <= g.hi;
  const at = (x: number) => ((x - g.min) / (g.max - g.min)) * 100;
  const left = useTransform(sweep, (s) => pct(lerp(0, at(g.v), s)));
  return (
    <div className="relative h-[5px] rounded-full bg-line-strong">
      <i aria-hidden className="absolute inset-y-0 rounded-full bg-mint/45" style={{ left: pct(at(g.lo)), width: pct(at(g.hi) - at(g.lo)) }} />
      <motion.i
        aria-hidden
        style={{ left }}
        className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg ${ok ? "bg-mint" : "bg-accent"}`}
      />
    </div>
  );
}

function GenoGauge({ at, sweep }: { at: number; sweep: MV }) {
  const opacity = useTransform(sweep, (s) => clamp01((s - 0.4) / 0.6));
  return (
    <div className={`grid grid-cols-3 gap-[2px] ${MONO} text-[10px] leading-[13px]`}>
      {GENO.map((label, i) => (
        <span key={label} className="relative rounded-[3px] bg-line-strong text-center text-dim">
          {i === at ? <motion.i aria-hidden style={{ opacity }} className="absolute inset-0 rounded-[3px] bg-sky/70" /> : null}
          <span className={i === at ? "relative text-fg" : "relative"}>{label}</span>
        </span>
      ))}
    </div>
  );
}

function MarkerChip({ s, sweep, reveal }: { s: Supp; sweep: MV; reveal: MV }) {
  const clip = useTransform(reveal, (v) => `inset(0 ${pct(100 - v * 100)} 0 0 round 8px)`);
  const slot = useTransform(reveal, (v) => (v >= 1 ? 0 : 1));
  const arrow = s.flag ? (s.flag === "high" ? " ↑" : " ↓") : "";
  return (
    <div className="relative">
      <motion.i aria-hidden style={{ opacity: slot }} className="absolute inset-0 rounded-lg border border-dashed border-line-strong" />
      <motion.div
        style={{ clipPath: clip }}
        className="relative flex h-full flex-col justify-center gap-1 rounded-lg border border-line-strong bg-surface-2 px-2 @lg:gap-1.5 @lg:px-3"
      >
        <div className="flex items-center justify-between gap-1 text-[11px] @lg:text-[12px]">
          <span className="flex min-w-0 items-center gap-1.5 text-fg">
            <Dot src={s.src} />
            <span className="truncate">{s.marker}</span>
          </span>
          <span className="shrink-0 tabular-nums text-dim">
            {s.value}
            {arrow}
          </span>
        </div>
        {s.gauge.kind === "range" ? <RangeGauge g={s.gauge} sweep={sweep} /> : <GenoGauge at={s.gauge.at} sweep={sweep} />}
      </motion.div>
    </div>
  );
}

function Connector({ line, kept, skip }: { line: MV; kept: boolean; skip: MV }) {
  const cap = useTransform(line, (v) => clamp01((v - 0.9) / 0.1));
  const capOp = useTransform([cap, skip], ([c, k]: number[]) => c * (1 - k));
  return (
    <div className="relative">
      <i aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
      <motion.i
        aria-hidden
        style={{ scaleX: line }}
        className={`absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 origin-left rounded-full ${kept ? "bg-accent" : "bg-mute"}`}
      />
      <motion.i
        aria-hidden
        style={{ opacity: capOp }}
        className={`absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${kept ? "bg-accent" : "bg-mute"}`}
      />
      {kept ? null : <Cross skip={skip} />}
    </div>
  );
}

function Cross({ skip }: { skip: MV }) {
  return (
    <motion.svg aria-hidden viewBox="0 0 10 10" style={{ opacity: skip, scale: skip }} className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2">
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" className="stroke-fg" strokeWidth="1.6" strokeLinecap="round" />
    </motion.svg>
  );
}

function SuppCard({ s, skip }: { s: Supp; skip: MV }) {
  const strike = useTransform(skip, (v) => easeOutCubic(v));
  const opacity = useTransform(skip, (v) => 1 - 0.45 * v);
  return (
    <motion.div style={{ opacity }} className="flex flex-col justify-center rounded-lg border border-line bg-surface-1 px-2 @lg:px-3">
      <span className="relative inline-block max-w-full self-start">
        <span className="block truncate text-[11px] font-medium leading-tight text-fg @lg:text-[13px]">{s.name}</span>
        {s.kept ? null : (
          <motion.i aria-hidden style={{ scaleX: strike }} className="absolute inset-x-0 top-1/2 h-[1.5px] origin-left bg-fg" />
        )}
      </span>
      {s.kept ? (
        <span className="truncate text-[10px] leading-tight text-dim @lg:text-[12px]">{s.dose}</span>
      ) : (
        <Swap t={skip} className="text-[10px] text-dim @lg:text-[12px]" a={s.dose} b={<span className="text-fg">skipped, in range</span>} />
      )}
    </motion.div>
  );
}

function SuppRow({ p, i, s }: { p: MV; i: number; s: Supp }) {
  const t = useSeg(p, rowStart(i), rowEnd(i));
  const line = useTransform(t, (v) => easeInOutCubic(segAt(v, 0, 0.45)));
  const reveal = useTransform(t, (v) => easeOutCubic(segAt(v, 0.4, 0.75)));
  const sweep = useTransform(t, (v) => easeOutCubic(segAt(v, 0.6, 1)));
  const skipRaw = useSeg(p, TL.supp.skip[0], TL.supp.skip[1], easeInOutCubic);
  const skip = useTransform(skipRaw, (v) => (s.kept ? 0 : v));
  return (
    <div className={ROW_GRID}>
      <SuppCard s={s} skip={skip} />
      <Connector line={line} kept={s.kept} skip={skip} />
      <MarkerChip s={s} sweep={sweep} reveal={reveal} />
    </div>
  );
}

function Tally({ p }: { p: MV }) {
  const text = useTransform(p, verdict);
  const tail = useSeg(p, TL.supp.skip[1] - 0.006, TL.supp.skip[1] + 0.006);
  return (
    <p className={`${MONO} flex text-[11px] tabular-nums text-fg @lg:text-[13px]`}>
      <motion.span>{text}</motion.span>
      <motion.span style={{ opacity: tail }} className="whitespace-pre text-dim">
        {": HbA1c in range"}
      </motion.span>
    </p>
  );
}

export default function SuppPage({ p }: { p: MV }) {
  const count = SUPPS.length;
  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <MonoLabel>{count} candidates</MonoLabel>
        <MonoLabel>marker that asks</MonoLabel>
      </div>
      <div className="grid min-h-0 flex-1 gap-[5px] @lg:gap-2" style={{ gridTemplateRows: `repeat(${count}, minmax(0, 1fr))` }}>
        {SUPPS.map((s, i) => (
          <SuppRow key={s.name} p={p} i={i} s={s} />
        ))}
      </div>
      <div className="flex h-5 items-center">
        <Tally p={p} />
      </div>
    </div>
  );
}
