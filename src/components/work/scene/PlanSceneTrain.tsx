"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import {
  DELTAS,
  LIFT_TOTAL,
  SESSIONS,
  SWAP_TO,
  TL,
  WEEK_SETS_AFTER,
  WEEK_SETS_BEFORE,
  WEEK_TOTAL,
  type Delta,
  type Lift,
} from "./PlanSceneData";
import { CHANGED, Frame, MonoLabel, Roll, Swap, clamp01, lerp, pct, segAt } from "./PlanSceneKit";
import { SwapMark } from "./PlanSceneIcons";

const LIFTS_PER_SESSION = 3;
const MAX_PIPS = 4;
const cellStart = (i: number) => TL.train.start + i * TL.train.step;
const CELLS = Array.from({ length: LIFT_TOTAL }, (_, i) => i);
export const builtCount = (v: number) => CELLS.filter((i) => v >= cellStart(i) + TL.train.dur).length;
const useFill = (p: MV, i: number) => useSeg(p, cellStart(i), cellStart(i) + TL.train.dur);
const deltaFor = (s: number, l: number) => DELTAS.find((d) => d.session === s && d.lift === l);
const waveIndex = (d: Delta) => DELTAS.indexOf(d);
const deltaText = (lift: Lift, d: Delta) => {
  const diff = d.to - lift[d.field];
  return `${diff > 0 ? "+" : "-"}${Math.abs(diff)}`;
};

function ColHead({ p, day, focus, swap }: { p: MV; day: string; focus: string; swap?: MV }) {
  return (
    <div className="px-0.5">
      <div className="flex items-center gap-2">
        <span className={`block ${MONO} text-[10px] uppercase tracking-[0.1em] text-fg @lg:text-[12px]`}>{day}</span>
        {swap ? <SwapMark p={p} swap={swap} /> : null}
      </div>
      <p className="truncate text-[10px] text-mute @lg:text-[12px]">{focus}</p>
    </div>
  );
}

type PipKind = "on" | "add" | "drop" | "off";

function pipKind(i: number, base: number, to: number): PipKind {
  if (i < Math.min(base, to)) return "on";
  if (i >= base && i < to) return "add";
  return i >= to && i < base ? "drop" : "off";
}

function Pip({ kind, t }: { kind: PipKind; t: MV }) {
  const fill = useTransform(t, (v) => (kind === "add" ? v : kind === "drop" ? 1 - v : 1));
  const ring = useTransform(t, (v) => (kind === "drop" ? v : 0));
  if (kind === "off") return <i className="h-2 w-1.5 @lg:h-3 @lg:w-2" />;
  const tone = kind === "add" ? "bg-accent" : "bg-fg/70";
  return (
    <span className="relative h-2 w-1.5 @lg:h-3 @lg:w-2">
      <motion.i style={{ opacity: fill }} className={`absolute inset-0 rounded-[2px] ${tone}`} />
      <motion.i style={{ opacity: ring }} className="absolute inset-0 rounded-[2px] border border-accent" />
    </span>
  );
}

function Pips({ base, to, t }: { base: number; to: number; t: MV }) {
  return (
    <span className="flex items-center gap-[2px] @lg:gap-[3px]">
      {Array.from({ length: MAX_PIPS }, (_, i) => (
        <Pip key={i} kind={pipKind(i, base, to)} t={t} />
      ))}
    </span>
  );
}

type LinesProps = { name: string; sets: ReactNode; reps: number; kg: ReactNode; pips: ReactNode; badge?: ReactNode };

function DeltaBadge({ text, t }: { text: string; t: MV }) {
  const scale = useTransform(t, (v) => easeOutBack(segAt(v, 0.25, 0.75)));
  const opacity = useTransform(scale, (v) => clamp01(v * 1.5));
  return (
    <motion.span
      style={{ scale, opacity }}
      className={`${CHANGED} ${MONO} origin-right px-1 text-[10px] font-semibold leading-[15px] @lg:text-[12px]`}
    >
      {text}
    </motion.span>
  );
}

function Lines({ name, sets, reps, kg, pips, badge }: LinesProps) {
  return (
    <>
      <p className="truncate text-[10px] font-medium leading-[1.35] text-fg @lg:text-[13px]">{name}</p>
      <div className="flex items-center justify-between gap-1">
        <p className={`${MONO} whitespace-nowrap text-[11px] leading-[1.35] text-dim @lg:text-[12.5px]`}>
          {sets}&times;{reps}
        </p>
        {pips}
      </div>
      <div className="flex items-center justify-between gap-1">
        <p className={`${MONO} text-[11px] leading-[1.35] text-dim @lg:text-[12.5px]`}>{kg} kg</p>
        {badge}
      </div>
    </>
  );
}

function DeltaLines({ lift, delta, wave }: { lift: Lift; delta?: Delta; wave: MV }) {
  const sets = delta?.field === "sets" ? <Roll t={wave} from={String(lift.sets)} to={String(delta.to)} toClass={CHANGED} /> : String(lift.sets);
  const kg = delta?.field === "kg" ? <Roll t={wave} from={String(lift.kg)} to={String(delta.to)} toClass={CHANGED} /> : String(lift.kg);
  const to = delta?.field === "sets" ? delta.to : lift.sets;
  const badge = delta ? <DeltaBadge text={deltaText(lift, delta)} t={wave} /> : null;
  return <Lines name={lift.name} sets={sets} reps={lift.reps} kg={kg} pips={<Pips base={lift.sets} to={to} t={wave} />} badge={badge} />;
}

function LiftCell({ p, i, lift, delta }: { p: MV; i: number; lift: Lift; delta?: Delta }) {
  const t = useFill(p, i);
  const [wa, wb] = TL.waves[delta ? waveIndex(delta) : 0];
  const wave = useSeg(p, wa, wb, easeInOutCubic);
  const flash = useTransform(wave, [0, 0.35, 1], [0, delta ? 1 : 0, 0]);
  const y = useTransform(t, (v) => (1 - v) * 8);
  return (
    <Frame t={t} flash={flash} className="h-full">
      <motion.div style={{ opacity: t, y }} className="relative flex h-full flex-col justify-center px-1.5 @lg:px-2.5">
        <DeltaLines lift={lift} delta={delta} wave={wave} />
      </motion.div>
    </Frame>
  );
}

function SwapCell({ p, i, from, swap }: { p: MV; i: number; from: Lift; swap: MV }) {
  const t = useFill(p, i);
  const outline = useTransform(p, [TL.train.lift[0], TL.train.lift[0] + 0.012, TL.train.swap[1] + 0.02, TL.train.swap[1] + 0.04], [0, 1, 1, 0]);
  const y = useTransform(t, (v) => (1 - v) * 8);
  const oldX = useTransform(swap, (v) => pct(-v * 100));
  const newX = useTransform(swap, (v) => pct((1 - v) * 100));
  const edgeOp = useTransform(swap, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const paneClass = "absolute inset-0 flex flex-col justify-center px-1.5 @lg:px-2.5";
  return (
    <Frame t={t} className="h-full">
      <motion.div style={{ opacity: t, y }} className="absolute inset-0 overflow-hidden">
        <motion.div style={{ x: oldX }} className={paneClass}>
          <Lines name={from.name} sets={String(from.sets)} reps={from.reps} kg={String(from.kg)} pips={<Pips base={from.sets} to={from.sets} t={swap} />} />
        </motion.div>
        <motion.div style={{ x: newX }} className={paneClass}>
          <Lines name={SWAP_TO.name} sets={String(SWAP_TO.sets)} reps={SWAP_TO.reps} kg={String(SWAP_TO.kg)} pips={<Pips base={SWAP_TO.sets} to={SWAP_TO.sets} t={swap} />} />
          <motion.i aria-hidden style={{ opacity: edgeOp }} className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
        </motion.div>
      </motion.div>
      <motion.i aria-hidden style={{ opacity: outline }} className="pointer-events-none absolute inset-0 z-10 rounded-md border-2 border-accent" />
    </Frame>
  );
}

function Column({ p, s, swap }: { p: MV; s: number; swap: MV }) {
  const session = SESSIONS[s];
  return (
    <div className="grid min-h-0 grid-rows-[auto_repeat(3,minmax(0,1fr))] gap-[3px] @lg:grid-rows-[auto_repeat(3,minmax(0,108px))] @lg:gap-1.5">
      <ColHead p={p} day={session.day} focus={session.focus} swap={s === 0 ? swap : undefined} />
      {session.lifts.map((lift, l) => {
        const i = s * LIFTS_PER_SESSION + l;
        return s === 0 && l === 0 ? (
          <SwapCell key={lift.name} p={p} i={i} from={lift} swap={swap} />
        ) : (
          <LiftCell key={lift.name} p={p} i={i} lift={lift} delta={deltaFor(s, l)} />
        );
      })}
    </div>
  );
}

function Segment({ s, t, show }: { s: number; t: MV; show: MV }) {
  const grow = useTransform(t, (v) => lerp(WEEK_SETS_BEFORE[s], WEEK_SETS_AFTER[s], v));
  const changed = WEEK_SETS_BEFORE[s] !== WEEK_SETS_AFTER[s];
  const hi = useTransform(t, [0, 0.4, 1], [0, changed ? 1 : 0, changed ? 0.5 : 0]);
  const dashed = useTransform(show, (v) => 1 - v);
  return (
    <motion.div style={{ flexGrow: grow, flexBasis: 0 }} className="relative h-6 min-w-0 overflow-hidden rounded-[5px] text-[10px] @lg:h-8 @lg:text-[12px]">
      <motion.i aria-hidden style={{ opacity: dashed }} className="absolute inset-0 rounded-[5px] border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: show }} className="absolute inset-0 rounded-[5px] border border-line bg-surface-1" />
      <motion.i aria-hidden style={{ opacity: hi }} className="absolute inset-0 bg-accent/30" />
      <motion.span style={{ opacity: show }} className="relative flex h-full items-center justify-between px-1.5 @lg:px-2.5">
        <span className={`${MONO} text-dim`}>{SESSIONS[s].day}</span>
        <span className={`${MONO} tabular-nums text-fg`}>
          {changed ? <Roll t={t} from={String(WEEK_SETS_BEFORE[s])} to={String(WEEK_SETS_AFTER[s])} /> : WEEK_SETS_BEFORE[s]}
        </span>
      </motion.span>
    </motion.div>
  );
}

/* The strip is reserved as a dashed skeleton from the start and fills in once
   the last lift card lands. */
function Balance({ p }: { p: MV }) {
  const t = useSeg(p, TL.train.bar[0], TL.train.bar[1], easeInOutCubic);
  const status = useSeg(p, TL.train.status[0], TL.train.status[1]);
  const show = useSeg(p, cellStart(LIFT_TOTAL - 3), cellStart(LIFT_TOTAL - 1) + TL.train.dur);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <MonoLabel>sets per session</MonoLabel>
        <motion.span style={{ opacity: show }} className={`${MONO} text-[10px] tabular-nums text-dim @lg:text-[12px]`}>
          {WEEK_TOTAL} / week
        </motion.span>
      </div>
      <div className="flex gap-[3px]">
        {SESSIONS.map((s, i) => (
          <Segment key={s.day} s={i} t={t} show={show} />
        ))}
      </div>
      <motion.div style={{ opacity: show }}>
        <Swap
          t={status}
          className={`${MONO} text-[10px] text-dim @lg:text-[12px]`}
          a="4 sessions, balanced"
          b="no barbell: 3 cells rebalanced"
        />
      </motion.div>
    </div>
  );
}

export default function TrainPage({ p }: { p: MV }) {
  const swap = useSeg(p, TL.train.swap[0], TL.train.swap[1], easeInOutCubic);
  return (
    <div className="flex h-full flex-col gap-2 @lg:justify-center @lg:gap-5">
      <div className="flex items-center justify-between">
        <MonoLabel>week 3 of 8</MonoLabel>
        <MonoLabel>load +2.5% / week</MonoLabel>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-[6px] @lg:flex-none @lg:gap-2">
        {SESSIONS.map((s, i) => (
          <Column key={s.day} p={p} s={i} swap={swap} />
        ))}
      </div>
      <Balance p={p} />
    </div>
  );
}
