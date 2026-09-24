"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { LABEL, MarkerDot, clamp01 } from "./ChatSceneParts";
import { FADE_QUICK, MARKER_BY_KEY, PLAN, PLAN_ROWS_AT, QUESTION, T, WEEK_DAYS, WEEK_ROWS, type PlanRow, type Span } from "./ChatSceneData";
import { PlanIcon } from "./ChatSceneIcons";
import { SceneIcon } from "./SceneIcon";

function ScopePill({ p }: { p: MV }) {
  const t = useSeg(p, T.pill[0], T.pill[1], easeInOutCubic);
  const first = useTransform(t, (v) => `${-100 * v}%`);
  const second = useTransform(t, (v) => `${100 * (1 - v)}%`);
  const cls = "absolute inset-0 flex items-center justify-center whitespace-nowrap";
  return (
    <span className="relative h-5 w-[100px] overflow-hidden rounded-full border border-line-strong text-[11px] text-dim @[30rem]:h-6 @[30rem]:w-[120px] @[30rem]:text-[12px]">
      <motion.span style={{ y: first }} className={cls}>
        all markers
      </motion.span>
      <motion.span style={{ y: second }} className={`${cls} text-fg`}>
        vitamin D
      </motion.span>
    </span>
  );
}

export function ChatHeader({ p }: { p: MV }) {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between border-b border-line px-3 @[30rem]:h-9 @[30rem]:px-4">
      <span className="flex items-center gap-2 text-[12px] font-medium text-fg @[30rem]:text-[13px]">
        <SceneIcon name="chat-bubble" size={28} className="h-[22px] w-[22px] @[30rem]:h-7 @[30rem]:w-7" />
        Health chat
      </span>
      <ScopePill p={p} />
    </div>
  );
}

function InputLayer({ p }: { p: MV }) {
  const [ta, tb] = T.type;
  const typed = useTransform(p, (v) => QUESTION.slice(0, Math.floor(clamp01((v - ta) / (tb - ta)) * QUESTION.length)));
  const hint = useTransform(p, [T.hint[0], T.hint[1]], [1, 0]);
  const typedOp = useTransform(p, [T.send[0], T.send[0] + FADE_QUICK], [1, 0]);
  const caret = useTransform(p, [ta - 0.005, ta, tb, tb + 0.005], [0, 1, 1, 0]);
  const hint2 = useTransform(p, [T.hint2[0], T.hint2[1]], [0, 1]);
  const press = useTransform(p, [T.send[0], (T.send[0] + T.send[1]) / 2, T.send[1]], [0, 1, 0]);
  const scale = useTransform(press, (v) => 1 - 0.12 * v);
  const nudgeX = useTransform(press, (v) => v * 2);
  const nudgeY = useTransform(press, (v) => v * -2);
  const slot = "absolute inset-0 flex items-center";
  return (
    <div className="flex h-full items-center rounded-lg border border-line-strong bg-surface-2 pl-3 pr-1.5 text-[12.5px] @[30rem]:text-[14px]">
      <div className="relative h-full min-w-0 flex-1 overflow-hidden">
        <motion.span style={{ opacity: hint }} className={`${slot} text-dim`}>
          Ask about your numbers
        </motion.span>
        <motion.span style={{ opacity: typedOp }} className={`${slot} text-fg`}>
          <motion.span className="truncate">{typed}</motion.span>
          <motion.i style={{ opacity: caret }} className="ml-px h-[1.1em] w-[1.5px] shrink-0 bg-accent" />
        </motion.span>
        <motion.span style={{ opacity: hint2 }} className={`${slot} text-dim`}>
          Ask a follow-up
        </motion.span>
      </div>
      <motion.span
        style={{ scale }}
        className="relative grid h-[26px] w-[26px] shrink-0 place-items-center rounded-md border border-line-strong bg-surface-1 @[30rem]:h-8 @[30rem]:w-8"
      >
        <motion.i aria-hidden style={{ opacity: press }} className="absolute -inset-px rounded-md border border-accent" />
        <motion.span style={{ x: nudgeX, y: nudgeY }} className="grid place-items-center">
          <SceneIcon name="send" size={28} className="h-[22px] w-[22px] @[30rem]:h-7 @[30rem]:w-7" />
        </motion.span>
      </motion.span>
    </div>
  );
}

/* Accent toned toward the fixed dark ink, so the cream label holds 4.5:1 or better on both
   the resting button and the progress fill (the fill deepens, it never lightens). */
const CTA_BASE = "bg-[color-mix(in_srgb,var(--color-accent)_88%,var(--color-pastel-ink))]";
const CTA_FILL = "bg-[color-mix(in_srgb,var(--color-accent)_74%,var(--color-pastel-ink))]";

function PlanButton({ p }: { p: MV }) {
  const press = useTransform(p, [T.press[0], T.press[0] + 0.01, T.press[1]], [1, 0.965, 1]);
  const fill = useSeg(p, T.fill[0], T.fill[1]);
  const roll = useSeg(p, T.ready[0], T.ready[1], easeInOutCubic);
  const edgeLeft = useTransform(fill, (v) => `${(v * 100).toFixed(2)}%`);
  const edgeOp = useTransform(fill, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const up = useTransform(roll, (v) => `${-100 * v}%`);
  const arrive = useTransform(roll, (v) => `${100 * (1 - v)}%`);
  const cls = "absolute inset-0 flex items-center justify-center gap-2";
  return (
    <motion.div style={{ scale: press }} className={`relative h-full overflow-hidden rounded-lg ${CTA_BASE} text-[13px] font-medium text-fg @[30rem]:text-[14px]`}>
      <motion.i aria-hidden style={{ scaleX: fill }} className={`absolute inset-0 origin-left ${CTA_FILL}`} />
      <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOp }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-fg/60" />
      <motion.span style={{ y: up }} className={cls}>
        Build my plan <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </motion.span>
      <motion.span style={{ y: arrive }} className={cls}>
        Plan ready <Check className="h-4 w-4" strokeWidth={2.4} />
      </motion.span>
    </motion.div>
  );
}

export function ActionBar({ p }: { p: MV }) {
  const sw = useSeg(p, T.swapBar[0], T.swapBar[1], easeInOutCubic);
  const aClip = useTransform(sw, (v) => (v <= 0 ? "none" : `inset(0 0 0 ${(v * 100).toFixed(2)}%)`));
  const bClip = useTransform(sw, (v) => `inset(0 ${((1 - v) * 100).toFixed(2)}% 0 0)`);
  const edgeLeft = useTransform(sw, (v) => `${(v * 100).toFixed(2)}%`);
  const edgeOp = useTransform(sw, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const ring = useSeg(p, T.press[0] + 0.005, T.press[1] + 0.02, easeOutCubic);
  const ringScale = useTransform(ring, (v) => 1 + 0.06 * v);
  const ringOp = useTransform(ring, [0, 0.15, 1], [0, 0.8, 0]);
  return (
    <div className="relative h-[42px] shrink-0 border-t border-line p-1.5 @[30rem]:h-[58px] @[30rem]:p-2.5">
      <div className="relative h-full">
        <motion.div style={{ clipPath: aClip }} className="absolute inset-0">
          <InputLayer p={p} />
        </motion.div>
        <motion.div style={{ clipPath: bClip }} className="absolute inset-0">
          <PlanButton p={p} />
        </motion.div>
        <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOp }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
        <motion.i
          aria-hidden
          style={{ scale: ringScale, opacity: ringOp }}
          className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent"
        />
      </div>
    </div>
  );
}

function PlanItem({ row, p, span }: { row: PlanRow; p: MV; span: Span }) {
  const t = useSeg(p, span[0], span[1]);
  const front = useTransform(t, [0.08, 0.92], [0, 100], { clamp: true });
  const bodyClip = useTransform(front, (f) => `inset(0 ${(100 - f).toFixed(2)}% 0 0)`);
  const skelClip = useTransform(front, (f) => `inset(0 0 0 ${f.toFixed(2)}%)`);
  const edgeLeft = useTransform(front, (f) => `${f.toFixed(2)}%`);
  const edgeOp = useTransform(t, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const tick = useTransform(t, [0.9, 1], [0, 1]);
  return (
    <div className="relative rounded-lg border border-line bg-surface-2 px-2.5 py-1 @[30rem]:px-3.5 @[30rem]:py-2.5 @[40rem]:py-3 @[40rem]:pl-[68px]">
      <div className="mb-0.5 flex items-center justify-between gap-2 @[30rem]:mb-1">
        <span className={`${MONO} flex items-center gap-1.5 ${LABEL} uppercase tracking-[0.1em] text-fg`}>
          <PlanIcon row={row} p={p} span={span} />
          {row.tag}
        </span>
        <span className="flex items-center gap-2">
          <span className={`${MONO} flex items-center gap-2 ${LABEL} text-dim`}>
            {row.why.map((k) => {
              const m = MARKER_BY_KEY[k];
              return (
                <span key={k} className="flex items-center gap-1">
                  <MarkerDot color={m.color} />
                  {m.label === "Vitamin D" ? "Vit D" : m.label} {m.value}
                </span>
              );
            })}
          </span>
          <motion.span style={{ opacity: tick }} className="text-mint">
            <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
          </motion.span>
        </span>
      </div>
      <div className="relative">
        <motion.p style={{ clipPath: bodyClip }} className="text-[12px] leading-[17px] text-fg @[30rem]:text-[13.5px] @[30rem]:leading-[20px]">
          {row.text}
        </motion.p>
        <motion.div style={{ clipPath: skelClip }} aria-hidden className="absolute inset-0 flex flex-col gap-[9px] pt-[4.5px] @[30rem]:gap-3 @[30rem]:pt-1.5">
          <i className="h-2 w-full rounded bg-line-strong" />
          <i className="h-2 w-3/5 rounded bg-line-strong" />
        </motion.div>
        <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOp }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
      </div>
    </div>
  );
}

const DAY_LAG = 0.012;
const DAY_STEP = 0.004;

function DayCell({ p, on, a, className = "h-4" }: { p: MV; on: boolean; a: number; className?: string }) {
  const t = useSeg(p, a, a + 0.014, easeOutBack);
  const o = useSeg(p, a, a + 0.008);
  const scale = useTransform(t, (v) => 0.5 + 0.5 * v);
  return (
    <motion.i
      style={{ opacity: o, scale }}
      className={`${className} flex-1 rounded ${on ? "bg-accent" : "border border-line-strong"}`}
    />
  );
}

function WeekLine({ p, label, days, a }: { p: MV; label: string; days: readonly number[]; a: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`${MONO} w-11 shrink-0 ${LABEL} uppercase tracking-[0.1em] text-dim`}>{label}</span>
      {days.map((d, i) => (
        <DayCell key={i} p={p} on={d === 1} a={a + i * DAY_STEP} />
      ))}
    </div>
  );
}

function WeekStrip({ p }: { p: MV }) {
  return (
    <div className="mt-auto hidden flex-col gap-1.5 rounded-lg border border-dashed border-line-strong px-3 py-2.5 [@container(min-width:30rem)_and_(min-height:600px)]:flex">
      <div className="flex items-center gap-1.5">
        <span className={`${MONO} w-11 shrink-0 ${LABEL} uppercase tracking-[0.1em] text-fg`}>Week</span>
        {WEEK_DAYS.map((d, i) => (
          <span key={i} className={`${MONO} flex-1 text-center ${LABEL} text-dim`}>
            {d}
          </span>
        ))}
      </div>
      {WEEK_ROWS.map((r, i) => (
        <WeekLine key={r.key} p={p} label={r.label} days={r.days} a={PLAN_ROWS_AT[i][0] + DAY_LAG} />
      ))}
    </div>
  );
}

/* Narrow layout: the same 7 day pills, one short group per line of the plan. */
function WeekStripCompact({ p }: { p: MV }) {
  return (
    <div className="mt-auto flex gap-2.5 rounded-lg border border-dashed border-line-strong px-2.5 py-1.5 @[30rem]:hidden">
      {WEEK_ROWS.map((r, i) => (
        <div key={r.key} className="min-w-0 flex-1">
          <span className={`${MONO} text-[10px] uppercase tracking-[0.1em] text-dim`}>{r.label}</span>
          <div className="mt-1 flex gap-[3px]">
            {r.days.map((d, j) => (
              <DayCell key={j} p={p} on={d === 1} a={PLAN_ROWS_AT[i][0] + DAY_LAG + j * DAY_STEP} className="h-2.5" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlanSheet({ p }: { p: MV }) {
  const up = useSeg(p, T.sheet[0], T.sheet[1], easeOutCubic);
  const y = useTransform(up, (v) => `${(1 - v) * 104}%`);
  const done = useTransform(p, (v) => `${PLAN_ROWS_AT.filter((r) => v >= r[1]).length} of ${PLAN.length} ready`);
  return (
    <motion.div style={{ y }} className="absolute inset-0 z-10 flex flex-col gap-1.5 border-t-2 border-accent bg-surface-1 px-3 pb-2 pt-2 @[30rem]:gap-3 @[30rem]:px-5 @[30rem]:pb-4 @[30rem]:pt-4">
      <div className={`flex items-center justify-between ${MONO} ${LABEL} uppercase tracking-[0.12em]`}>
        <span className="text-fg">Your plan</span>
        <motion.span className="tabular-nums text-dim">{done}</motion.span>
      </div>
      {PLAN.map((row, i) => (
        <PlanItem key={row.key} row={row} p={p} span={PLAN_ROWS_AT[i]} />
      ))}
      <WeekStrip p={p} />
      <WeekStripCompact p={p} />
    </motion.div>
  );
}
