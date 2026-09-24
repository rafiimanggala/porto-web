"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  DAYS,
  MACRO_BG,
  MEALS,
  PEEKS,
  RUNNING,
  SLOTS,
  TAGS,
  TARGET,
  TL,
  type Meal,
} from "./PlanSceneData";
import { Frame, MonoLabel, TagChip, clamp01, keyframes, pct, segAt, useKeys } from "./PlanSceneKit";

const GAP = 3;
const COLS = DAYS.length;
const ROWS = SLOTS.length;
const CELL_W = `((100% - ${(COLS - 1) * GAP}px) / ${COLS})`;
const CELL_H = `((100% - ${(ROWS - 1) * GAP}px) / ${ROWS})`;
const STACK_H = "h-[148px] @lg:h-[132px]";
const PEEK_CELLS = PEEKS.map((m) => [m.day, m.slot] as const);
const RING_PATH = [PEEK_CELLS[0], ...PEEK_CELLS];
const RING_KEYS = RING_PATH.map((_, i) => i);

const SCORED_AT = 0.7;
const cellStart = (i: number) => TL.meals.start + i * TL.meals.step;
export const scoredCount = (v: number) =>
  Math.min(MEALS.length, Math.max(0, Math.floor((v - TL.meals.start - SCORED_AT * TL.meals.dur) / TL.meals.step) + 1));

function SplitBar({ split, className = "" }: { split: readonly number[]; className?: string }) {
  return (
    <div className={`flex gap-px overflow-hidden rounded-full ${className}`}>
      {split.map((s, i) => (
        <i key={i} className={MACRO_BG[i]} style={{ flexGrow: s, flexBasis: 0 }} />
      ))}
    </div>
  );
}

function MealCell({ p, meal, index }: { p: MV; meal: Meal; index: number }) {
  const t = useSeg(p, cellStart(index), cellStart(index) + TL.meals.dur);
  const flash = useTransform(t, [0.05, 0.25, 0.7], [0, 1, 0], { clamp: true });
  const barClip = useTransform(t, (v) => `inset(0 ${pct(100 - easeOutCubic(segAt(v, 0.05, 0.6)) * 100)} 0 0)`);
  const score = useTransform(t, (v) => (v < 0.25 ? "·" : String(Math.round(meal.fit * easeOutCubic(segAt(v, 0.25, 0.75))))));
  const tagT = useTransform(t, (v) => easeOutBack(segAt(v, 0.6, 1)));
  const tagOp = useTransform(tagT, (v) => clamp01(v * 1.6));
  const tagScale = useTransform(tagT, (v) => 0.6 + 0.4 * v);
  return (
    <Frame t={t} flash={flash}>
      <div className="relative flex h-full flex-col justify-between gap-0.5 p-[2px] @lg:p-2">
        <motion.div style={{ opacity: tagOp, scale: tagScale }} className="origin-left">
          <TagChip label={meal.tag} src={TAGS[meal.tag].src} />
        </motion.div>
        <p className="hidden text-[11px] leading-[1.25] text-dim @lg:[display:-webkit-box] @lg:[-webkit-box-orient:vertical] @lg:[-webkit-line-clamp:2] @lg:overflow-hidden">{meal.name}</p>
        <div className="flex items-end justify-between gap-1">
          <motion.span className={`${MONO} text-[13px] leading-none tabular-nums text-fg @lg:text-[15px]`}>{score}</motion.span>
        </div>
        <motion.div style={{ clipPath: barClip }}>
          <SplitBar split={meal.split} className="h-1 @lg:h-1.5" />
        </motion.div>
      </div>
    </Frame>
  );
}

function Ring({ k }: { k: MV }) {
  const col = useTransform(k, (v) => keyframes(v, RING_KEYS, RING_PATH.map((c) => c[0]), (t) => t));
  const row = useTransform(k, (v) => keyframes(v, RING_KEYS, RING_PATH.map((c) => c[1]), (t) => t));
  const left = useTransform(col, (c) => `calc(${CELL_W} * ${c.toFixed(3)} + ${(c * GAP).toFixed(2)}px)`);
  const top = useTransform(row, (r) => `calc(${CELL_H} * ${r.toFixed(3)} + ${(r * GAP).toFixed(2)}px)`);
  const opacity = useTransform(k, [0, 0.6], [0, 1], { clamp: true });
  return (
    <motion.i
      aria-hidden
      style={{ left, top, opacity, width: `calc${CELL_W}`, height: `calc${CELL_H}` }}
      className="pointer-events-none absolute z-10 rounded-md border-2 border-accent"
    />
  );
}

function DayHeader() {
  return (
    <div className={`grid grid-cols-[14px_repeat(7,minmax(0,1fr))] gap-[3px] ${MONO} text-[10px] text-mute @lg:text-[11px]`}>
      <span />
      {DAYS.map((d) => (
        <span key={d} className="text-center">
          {d}
        </span>
      ))}
    </div>
  );
}

function Grid({ p, k }: { p: MV; k: MV }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[14px_minmax(0,1fr)] gap-[3px]">
      <div className={`grid grid-rows-3 gap-[3px] ${MONO} text-[10px] text-mute @lg:text-[11px]`}>
        {SLOTS.map((s) => (
          <span key={s} className="grid place-items-center">
            {s[0]}
          </span>
        ))}
      </div>
      <div className="relative grid min-h-0 grid-cols-7 grid-rows-3 gap-[3px]">
        {MEALS.map((m, i) => (
          <div key={m.name} className="min-h-0 min-w-0 [&>div]:h-full" style={{ gridColumn: m.day + 1, gridRow: m.slot + 1 }}>
            <MealCell p={p} meal={m} index={i} />
          </div>
        ))}
        <Ring k={k} />
      </div>
    </div>
  );
}

function Summary({ p }: { p: MV }) {
  const fit = useTransform(p, (v) => (scoredCount(v) === 0 ? "--" : String(RUNNING[scoredCount(v)].fit)));
  const fitOp = useTransform(p, (v) => (scoredCount(v) === 0 ? 0.25 : 1));
  const count = useTransform(p, (v) => `${scoredCount(v)}/${MEALS.length} scored`);
  const g0 = useTransform(p, (v) => RUNNING[scoredCount(v)].split[0]);
  const g1 = useTransform(p, (v) => RUNNING[scoredCount(v)].split[1]);
  const g2 = useTransform(p, (v) => RUNNING[scoredCount(v)].split[2]);
  const grows = [g0, g1, g2];
  return (
    <div className="flex h-full items-center gap-3 rounded-xl border border-line-strong bg-surface-1 px-3 @lg:gap-5 @lg:px-5">
      <div className="shrink-0">
        <MonoLabel>week fit</MonoLabel>
        <motion.p style={{ opacity: fitOp }} className="t-hero mt-1 text-[2.2rem] leading-none tabular-nums @lg:text-[3.4rem]">{fit}</motion.p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <MonoLabel>macro split</MonoLabel>
          <motion.span className={`${MONO} text-[10px] tabular-nums text-dim @lg:text-[12px]`}>{count}</motion.span>
        </div>
        <div className="relative">
          <div className="flex h-2.5 gap-px overflow-hidden rounded-full @lg:h-3">
            {grows.map((g, i) => (
              <motion.i key={i} className={MACRO_BG[i]} style={{ flexGrow: g, flexBasis: 0 }} />
            ))}
          </div>
          {[TARGET.split[0], TARGET.split[0] + TARGET.split[1]].map((at) => (
            <i key={at} aria-hidden className="absolute -inset-y-1 w-px bg-fg" style={{ left: `${at}%` }} />
          ))}
        </div>
        <p className={`${MONO} mt-1.5 text-[10px] text-mute @lg:text-[11px]`}>target {TARGET.split.join(" / ")}</p>
      </div>
    </div>
  );
}

function Detail({ meal }: { meal: Meal }) {
  const tag = TAGS[meal.tag];
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-line-strong bg-surface-1 px-3 py-2 @lg:px-5 @lg:py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <MonoLabel>
            {DAYS[meal.day]} {SLOTS[meal.slot].toLowerCase()}
          </MonoLabel>
          <p className="truncate text-[13px] font-medium leading-tight text-fg @lg:text-[17px]">{meal.name}</p>
        </div>
        <div className="shrink-0 text-right">
          <MonoLabel>fit</MonoLabel>
          <p className="t-h3 text-[1.25rem] leading-none tabular-nums @lg:text-[1.9rem]">{meal.fit}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-dim @lg:text-[12px]">
        <TagChip label={meal.tag} src={tag.src} />
        <span className="truncate">
          {tag.value}
          {meal.note ? `, ${meal.note}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <SplitBar split={meal.split} className="h-1.5 w-[42%] shrink-0 @lg:h-2" />
        <span className={`${MONO} truncate text-[11px] text-dim @lg:text-[12px]`}>
          P {meal.grams[0]} C {meal.grams[1]} F {meal.grams[2]} g, {meal.kcal} kcal
        </span>
      </div>
    </div>
  );
}

function StackItem({ index, k, children }: { index: number; k: MV; children: ReactNode }) {
  const y = useTransform(k, (v) => pct((index - v) * 100));
  return (
    <motion.div style={{ y }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

function Stack({ p, k }: { p: MV; k: MV }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${STACK_H}`}>
      <StackItem index={0} k={k}>
        <Summary p={p} />
      </StackItem>
      {PEEKS.map((m, i) => (
        <StackItem key={m.name} index={i + 1} k={k}>
          <Detail meal={m} />
        </StackItem>
      ))}
    </div>
  );
}

export default function MealsPage({ p }: { p: MV }) {
  const k = useKeys(p, TL.peekKeys, TL.peekVals);
  return (
    <div className="flex h-full flex-col gap-1.5">
      <DayHeader />
      <Grid p={p} k={k} />
      <div className="h-1" />
      <Stack p={p} k={k} />
    </div>
  );
}
