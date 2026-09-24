"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { ACTIVITY, DAY_COUNT, DAY_INITIALS, LAST_START, T, WINDOW_LEN, windowLabel } from "./EduInsightsSceneData";
import { CalendarIcon } from "./EduInsightsSceneIcons";
import { MonoLabel, Panel, clamp01, pct } from "./EduInsightsSceneKit";

/* Mini calendar of four weeks. The 14-day window bracket sweeps from the
   previous fortnight onto the current one and lights the days it covers. */

const COL_GAP = 2;
const STUB = 0.14;

function DayCol({ p, i, v, start }: { p: MV; i: number; v: number; start: MV }) {
  const from = T.grow.start + i * T.grow.step;
  const rise = useSeg(p, from, from + T.grow.dur, easeOutCubic);
  const height = useTransform(rise, (r) => pct(v * (STUB + (1 - STUB) * r) * 100));
  const inside = useTransform(start, (s) => clamp01(Math.min(i + 1, s + WINDOW_LEN) - Math.max(i, s)));
  return (
    <div className="flex min-w-0 flex-col">
      <div className="relative min-h-0 flex-1">
        <motion.i style={{ height }} className="absolute inset-x-0 bottom-0 rounded-[2px] bg-fg/25" />
        <motion.i style={{ height, opacity: inside }} className="absolute inset-x-0 bottom-0 rounded-[2px] bg-fg/85" />
      </div>
      <span className={`${MONO} mt-[3px] text-center text-[10px] leading-none text-mute`}>{DAY_INITIALS[i % 7]}</span>
    </div>
  );
}

function Bracket({ p, start }: { p: MV; start: MV }) {
  const left = useTransform(start, (s) => pct((s / DAY_COUNT) * 100));
  const lock = useSeg(p, T.lock[0], T.lock[1], easeOutCubic);
  const ringOp = useTransform(lock, [0, 0.15, 1], [0, 0.8, 0]);
  const ringScale = useTransform(lock, (v) => 1 + 0.07 * v);
  const appear = useSeg(p, T.appear[0], T.appear[1]);
  return (
    <motion.div aria-hidden style={{ left, opacity: appear }} className="pointer-events-none absolute -bottom-[3px] -top-[3px] w-1/2">
      <i className="absolute inset-0 rounded-md border-2 border-accent bg-accent/10" />
      <motion.i style={{ opacity: ringOp, scale: ringScale }} className="absolute inset-0 rounded-md border border-accent" />
    </motion.div>
  );
}

export function WindowPanel({ p }: { p: MV }) {
  const start = useTransform(useSeg(p, T.sweep[0], T.sweep[1], easeInOutCubic), (v) => v * LAST_START);
  const range = useTransform(start, windowLabel);
  return (
    <Panel className="flex flex-col px-[clamp(8px,2.4cqw,16px)] py-[clamp(6px,1.6cqw,12px)]">
      <div className="mb-[clamp(3px,1cqw,8px)] flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="h-[1.5em] w-[1.5em]" />
          <MonoLabel>14-day window</MonoLabel>
        </span>
        <motion.span className={`${MONO} whitespace-nowrap text-[11px] tabular-nums text-fg @lg:text-[12px]`}>{range}</motion.span>
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          className="grid h-full"
          style={{ gridTemplateColumns: `repeat(${DAY_COUNT}, minmax(0, 1fr))`, columnGap: COL_GAP }}
        >
          {ACTIVITY.map((v, i) => (
            <DayCol key={i} p={p} i={i} v={v} start={start} />
          ))}
        </div>
        <Bracket p={p} start={start} />
      </div>
    </Panel>
  );
}
