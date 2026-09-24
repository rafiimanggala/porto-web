"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { DATA_CHIPS, GOALS, GOAL_PICK, MACRO_BG, PLAN_PREVIEW, TARGET, TL, type DataChip } from "./PlanSceneData";
import { Dot, Frame, MonoLabel, clamp01, pct } from "./PlanSceneKit";
import { GoalIcon, TabIcon } from "./PlanSceneIcons";
import type { SceneIconName } from "./SceneIcon";

const GOAL_N = GOALS.length;
const PILL_PAD = 3;

function Pointer({ p, pos }: { p: MV; pos: MV }) {
  const left = useTransform(pos, (v) => `${(((v + 0.5) / GOAL_N) * 100).toFixed(3)}%`);
  const gone = useSeg(p, TL.click[1], TL.click[1] + 0.03);
  const opacity = useTransform(gone, (v) => 1 - v);
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 14 18"
      style={{ left, opacity }}
      className="pointer-events-none absolute top-[74%] z-20 -ml-[3px] h-[18px] w-[14px]"
    >
      <path d="M1.5 1.5v13l3.6-3.2 2.4 5.2 2.2-1-2.4-5.1h4.9z" className="fill-fg stroke-bg" strokeWidth="1.3" strokeLinejoin="round" />
    </motion.svg>
  );
}

function ClickRing({ p, pos }: { p: MV; pos: MV }) {
  const t = useSeg(p, TL.click[0], TL.click[1], easeOutCubic);
  const left = useTransform(pos, (v) => `${(((v + 0.5) / GOAL_N) * 100).toFixed(3)}%`);
  const scale = useTransform(t, (v) => 0.4 + 1.6 * v);
  const opacity = useTransform(t, [0, 0.1, 1], [0, 0.9, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, scale, opacity }}
      className="pointer-events-none absolute top-1/2 z-10 -ml-[14px] -mt-[14px] h-7 w-7 rounded-full border-2 border-fg"
    />
  );
}

function SegControl({ p, pos }: { p: MV; pos: MV }) {
  const left = useTransform(pos, (v) => pct((v / GOAL_N) * 100));
  const clip = useTransform(
    pos,
    (v) => `inset(0 ${pct(100 - ((v + 1) / GOAL_N) * 100)} 0 ${pct((v / GOAL_N) * 100)} round 6px)`,
  );
  const grid = { gridTemplateColumns: `repeat(${GOAL_N}, minmax(0, 1fr))` };
  const cell = "grid place-items-center truncate px-1 text-[11px] font-medium @lg:text-[13px]";
  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-line-strong bg-surface-1" style={{ padding: PILL_PAD }}>
      <GoalIcon p={p} />
      <div className="relative h-8 min-w-0 flex-1 @lg:h-10">
        <div className="absolute inset-0 grid text-dim" style={grid}>
          {GOALS.map((g) => (
            <span key={g} className={cell}>
              {g}
            </span>
          ))}
        </div>
        <motion.i aria-hidden style={{ left }} className="absolute inset-y-0 w-1/4 rounded-md bg-accent" />
        <motion.div style={{ ...grid, clipPath: clip }} className="absolute inset-0 grid text-fg">
          {GOALS.map((g) => (
            <span key={g} className={cell}>
              {g}
            </span>
          ))}
        </motion.div>
        <ClickRing p={p} pos={pos} />
        <Pointer p={p} pos={pos} />
      </div>
    </div>
  );
}

/* The closing beat: once the last plan is done the goal row confirms it. */
function ReadyLabel({ p }: { p: MV }) {
  const t = useSeg(p, TL.ready[0], TL.ready[1], easeOutCubic);
  const y = useTransform(t, (v) => (1 - v) * 4);
  return (
    <motion.span style={{ opacity: t, y }} className={`flex items-center gap-1.5 ${MONO} text-[10px] uppercase tracking-[0.12em] text-fg @lg:text-[11px]`}>
      <i aria-hidden className="h-1.5 w-1.5 rounded-full bg-mint" />
      {GOALS[GOAL_PICK]} plan ready
    </motion.span>
  );
}

export function GoalBar({ p, pick }: { p: MV; pick: MV }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <MonoLabel>goal</MonoLabel>
        <ReadyLabel p={p} />
      </div>
      <SegControl p={p} pos={pick} />
    </div>
  );
}

const TAB_LABELS = ["Meals", "Training", "Supplements"] as const;
const TAB_ICONS: readonly SceneIconName[] = ["meal", "training", "supplement"];
const TAB_GAP = 6;
const TAB_FAN_DEG = 7;

type TabProps = { i: number; p: MV; fan: MV; tabPos: MV };

function Tab({ i, p, fan, tabPos }: TabProps) {
  const off = i - 1;
  const done = useSeg(p, TL.done[i][0], TL.done[i][1], easeOutCubic);
  const transform = useTransform(
    fan,
    (v) =>
      `translateX(calc(${(-off * (1 - v) * 100).toFixed(3)}% - ${(off * (1 - v) * TAB_GAP).toFixed(3)}px)) rotate(${(off * TAB_FAN_DEG * (1 - v)).toFixed(3)}deg)`,
  );
  const active = useTransform(tabPos, (v) => clamp01(1 - Math.abs(v - i)));
  const ready = useSeg(p, TL.ready[0], TL.ready[1], easeOutCubic);
  const lit = useTransform([active, ready], ([a, r]: number[]) => Math.max(a, r));
  const reveal = useTransform(fan, (f) => clamp01((f - 0.45) / 0.35));
  const labelOp = useTransform([reveal, active], ([r, a]: number[]) => r * (0.6 + 0.4 * a));
  return (
    <motion.div
      style={{ transform, zIndex: i === 1 ? 2 : 1 }}
      className="relative flex h-full flex-col items-center justify-center gap-0.5 rounded-md border border-line bg-surface-1 [transform-origin:50%_100%] @lg:flex-row @lg:gap-2"
    >
      <motion.i aria-hidden style={{ opacity: active }} className="absolute -inset-px rounded-md border border-line-strong bg-surface-2" />
      <motion.i
        aria-hidden
        style={{ scaleX: lit }}
        className="absolute inset-x-2 bottom-0 h-0.5 origin-left rounded-full bg-accent"
      />
      <TabIcon name={TAB_ICONS[i]} t={reveal} active={active} />
      <span className="relative flex items-center gap-1.5">
        <motion.span style={{ opacity: labelOp }} className={`${MONO} text-[10px] uppercase tracking-[0.08em] text-fg @lg:text-[11px]`}>
          {TAB_LABELS[i]}
        </motion.span>
        <motion.span style={{ opacity: labelOp }} className="relative grid h-2 w-2 place-items-center rounded-full border border-line-strong">
          <motion.i style={{ scale: done }} className="h-full w-full rounded-full bg-mint" />
        </motion.span>
      </span>
    </motion.div>
  );
}

export function TabBar({ p, fan, tabPos }: { p: MV; fan: MV; tabPos: MV }) {
  const hint = useTransform(fan, (v) => 1 - clamp01(v / 0.3));
  return (
    <div className="relative h-[52px] @lg:h-11">
      <div className="grid h-full grid-cols-3" style={{ gap: TAB_GAP }}>
        {TAB_LABELS.map((l, i) => (
          <Tab key={l} i={i} p={p} fan={fan} tabPos={tabPos} />
        ))}
      </div>
      <motion.span
        style={{ opacity: hint }}
        className={`pointer-events-none absolute inset-0 z-10 grid place-items-center ${MONO} text-[10px] uppercase tracking-[0.12em] text-fg @lg:text-[11px]`}
      >
        3 plans
      </motion.span>
    </div>
  );
}

function DataChipView({ chip, weigh }: { chip: DataChip; weigh: MV }) {
  const opacity = useTransform(weigh, (v) => (chip.weighted ? 1 : 1 - 0.5 * v));
  return (
    <motion.div
      style={{ opacity }}
      className="relative flex items-center gap-1.5 rounded-md border border-line bg-surface-1 px-2 py-1 text-[10px] @lg:px-3 @lg:py-1.5 @lg:text-[13px]"
    >
      {chip.weighted ? (
        <motion.i aria-hidden style={{ opacity: weigh }} className="absolute -inset-px rounded-md border border-accent" />
      ) : null}
      <Dot src={chip.src} />
      <span className="text-fg">{chip.label}</span>
      <span className="tabular-nums text-dim">
        {chip.value}
        {chip.flag ? (chip.flag === "high" ? " ↑" : " ↓") : ""}
      </span>
    </motion.div>
  );
}

function MacroBar({ p }: { p: MV }) {
  const m = useSeg(p, TL.macro[0], TL.macro[1], easeOutCubic);
  const clip = useTransform(m, (v) => `inset(0 ${pct(100 - v * 100)} 0 0 round 999px)`);
  const starts = [0, TARGET.split[0], TARGET.split[0] + TARGET.split[1]];
  return (
    <div>
      <div className="relative h-2.5 rounded-full bg-line-strong @lg:h-3">
        <motion.div style={{ clipPath: clip }} className="flex h-full gap-px overflow-hidden rounded-full">
          {TARGET.split.map((s, i) => (
            <i key={TARGET.letters[i]} className={MACRO_BG[i]} style={{ flexGrow: s, flexBasis: 0 }} />
          ))}
        </motion.div>
      </div>
      <div className="mt-1.5 grid grid-cols-[30fr_40fr_30fr]">
        {TARGET.letters.map((l, i) => (
          <MacroLabel key={l} m={m} at={starts[i]} letter={l} grams={TARGET.grams[i]} idx={i} />
        ))}
      </div>
    </div>
  );
}

function MacroLabel({ m, at, letter, grams, idx }: { m: MV; at: number; letter: string; grams: number; idx: number }) {
  const opacity = useTransform(m, (v) => clamp01((v * 100 - at - 4) / 12));
  return (
    <span className={`${MONO} flex items-center gap-1.5 text-[10px] text-dim @lg:text-[12px]`}>
      <i className={`h-1.5 w-1.5 rounded-[2px] ${MACRO_BG[idx]}`} />
      {letter}
      <motion.span style={{ opacity }}>{grams} g</motion.span>
    </span>
  );
}

const KCAL_TEXT = "t-hero col-start-1 row-start-1 block text-[2.3rem] leading-none tabular-nums @lg:text-[4.2rem]";
const KCAL_GHOST = TARGET.kcal.toLocaleString("en-US");
const GHOST_OP = 0.14;
const GHOST_GONE = 0.02;
const NUM_IN = [0.012, 0.045] as const;

/* A ghost of the final figure holds the slot until the count starts, so the
   card never shows a bare "0" in the display face. It also fixes the width, so
   the unit does not shift while the digits grow. */
function KcalFigure({ k }: { k: MV }) {
  const text = useTransform(k, (v) => Math.round(v * TARGET.kcal).toLocaleString("en-US"));
  const ghostOp = useTransform(k, (v) => GHOST_OP * (1 - clamp01(v / GHOST_GONE)));
  const numOp = useTransform(k, (v) => clamp01((v - NUM_IN[0]) / (NUM_IN[1] - NUM_IN[0])));
  return (
    <span className="grid">
      <motion.span aria-hidden style={{ opacity: ghostOp }} className={KCAL_TEXT}>{KCAL_GHOST}</motion.span>
      <motion.span style={{ opacity: numOp }} className={KCAL_TEXT}>{text}</motion.span>
    </span>
  );
}

function TargetCard({ p }: { p: MV }) {
  const k = useSeg(p, TL.kcal[0], TL.kcal[1], easeOutCubic);
  const goalOp = useSeg(p, TL.click[0], TL.click[1] + 0.02);
  return (
    <div className="rounded-xl border border-line-strong bg-surface-1 p-3 @lg:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <MonoLabel>daily target</MonoLabel>
          <p className="mt-1 flex items-baseline gap-1.5">
            <KcalFigure k={k} />
            <span className={`${MONO} text-[11px] text-dim @lg:text-[13px]`}>kcal</span>
          </p>
        </div>
        <motion.span style={{ opacity: goalOp }} className="mb-1 rounded-full border border-accent px-2 py-0.5 text-[10px] text-fg @lg:text-[12px]">
          for {GOALS[GOAL_PICK]}
        </motion.span>
      </div>
      <div className="mt-3 @lg:mt-4">
        <MacroBar p={p} />
      </div>
    </div>
  );
}

function PlanCard({ p, i }: { p: MV; i: number }) {
  const plan = PLAN_PREVIEW[i];
  const a = TL.plans.start + i * TL.plans.step;
  const t = useSeg(p, a, a + TL.plans.dur, easeOutCubic);
  const y = useTransform(t, (v) => (1 - v) * 8);
  const n = useTransform(t, (v) => String(Math.round(v * plan.n)));
  return (
    <Frame t={t} className="min-w-0">
      <motion.div style={{ opacity: t, y }} className="relative flex flex-col gap-0.5 px-2.5 py-2 @lg:gap-1 @lg:px-4 @lg:py-3">
        <MonoLabel className="truncate">{plan.label}</MonoLabel>
        <p className="flex items-baseline gap-1.5">
          <motion.span className="t-h3 text-[1.15rem] leading-none tabular-nums @lg:text-[1.9rem]">{n}</motion.span>
          <span className="truncate text-[10px] text-dim @lg:text-[12px]">{plan.unit}</span>
        </p>
        <p className="hidden truncate text-[10px] text-dim @lg:block @lg:text-[12px]">{plan.note}</p>
      </motion.div>
    </Frame>
  );
}

function PlanPreview({ p }: { p: MV }) {
  return (
    <div className="grid grid-cols-3" style={{ gap: TAB_GAP }}>
      {PLAN_PREVIEW.map((c, i) => (
        <PlanCard key={c.label} p={p} i={i} />
      ))}
    </div>
  );
}

export function GoalPage({ p }: { p: MV }) {
  const weigh = useSeg(p, TL.weigh[0], TL.weigh[1], easeOutCubic);
  return (
    <div className="flex h-full flex-col justify-center gap-[clamp(12px,3.6cqw,26px)]">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <MonoLabel>read from your data</MonoLabel>
          <MonoLabel>8 markers</MonoLabel>
        </div>
        <div className="flex flex-wrap gap-1.5 @lg:gap-2.5">
          {DATA_CHIPS.map((c) => (
            <DataChipView key={c.label} chip={c} weigh={weigh} />
          ))}
        </div>
        <motion.p style={{ opacity: weigh }} className={`${MONO} mt-2 text-[10px] text-dim @lg:mt-3 @lg:text-[12px]`}>
          weighted for {GOALS[GOAL_PICK]}: lipids, CRP, APOE
        </motion.p>
      </div>
      <TargetCard p={p} />
      <PlanPreview p={p} />
    </div>
  );
}
