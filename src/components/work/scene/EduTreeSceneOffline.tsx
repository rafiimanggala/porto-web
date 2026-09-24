"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { LESSONS, OPEN_LESSON, TL, VARIANTS } from "./EduTreeSceneData";
import { BookIcon, CheckMark, PlayMark, WifiGlyph } from "./EduTreeSceneIcons";
import { MONO_LABEL, Roller, useKeys } from "./EduTreeSceneKit";
import { clamp01, segAt } from "./EduTreeSceneMath";
import { SceneIcon } from "./SceneIcon";

/* Chapter 4 page: a licensed subject caches to the device (a ring fills, variant by variant), the
   wifi drops, and the lessons stay exactly as bright as before. */

const ringOf = (v: number) => segAt(v, TL.ring[0], TL.ring[1], easeInOutCubic);
const TICK_AT = [0.5, 0.76, 0.97] as const;
const RING_R = 42;
const BAR_MAX = 0.62;

function Ring({ p }: { p: MV }) {
  const fill = useTransform(p, ringOf);
  const filling = useTransform(p, (v) => (ringOf(v) > 0.002 ? 1 - segAt(v, TL.ring[1] - 0.004, TL.ring[1] + 0.014) : 0));
  const done = useSeg(p, TL.ring[1] - 0.004, TL.ring[1] + 0.014, easeOutCubic);
  const badge = useSeg(p, TL.device[0], TL.device[1], easeOutBack);
  const badgeOp = useSeg(p, TL.device[0], TL.device[0] + 0.01);
  const badgeScale = useTransform(badge, (v) => 0.5 + 0.5 * v);
  return (
    <div className="relative aspect-square h-[clamp(84px,21cqh,156px)] shrink-0">
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="8" style={{ stroke: "var(--color-line-strong)" }} />
        <motion.circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="8" strokeLinecap="round" style={{ pathLength: fill, opacity: filling, stroke: "var(--color-accent)" }} />
        <motion.circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="8" style={{ opacity: done, stroke: "var(--color-mint)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <BookIcon className="h-[40%] w-[40%]" />
      </div>
      <motion.div
        aria-hidden
        style={{ opacity: badgeOp, scale: badgeScale }}
        className="absolute -bottom-2 -right-3 grid h-[38%] w-[38%] place-items-center rounded-full border border-line-strong bg-surface-2"
      >
        <SceneIcon name="device-phone" size={64} className="h-[92%] w-[92%]" />
      </motion.div>
    </div>
  );
}

function Status({ p }: { p: MV }) {
  const drop = useSeg(p, TL.drop[0], TL.drop[1]);
  const swap = useSeg(p, TL.swap[0], TL.swap[1], easeInOutCubic);
  return (
    <div className="flex items-center gap-2 @min-[500px]:gap-3">
      <WifiGlyph drop={drop} className="h-[26px] w-[30px] shrink-0 @min-[500px]:h-[42px] @min-[500px]:w-[48px]" />
      <Roller
        pos={swap}
        cellClass="h-5"
        className={`h-5 ${MONO} text-[11px] leading-5 @min-[500px]:text-[13px]`}
        items={[
          <span key="on" className="whitespace-nowrap text-mint">online</span>,
          <span key="off" className="whitespace-nowrap text-sun">no connection</span>,
        ]}
      />
    </div>
  );
}

function Hero({ p }: { p: MV }) {
  return (
    <div className="flex items-center gap-[clamp(14px,4cqw,28px)]">
      <Ring p={p} />
      <div className="min-w-0 flex-1">
        <p className="t-h3 truncate text-[1.25rem] @min-[500px]:text-[1.9rem]">Biology</p>
        <p className={`${MONO_LABEL} mt-1`}>7 licensed variants</p>
        <div className="mt-2 @min-[500px]:mt-3">
          <Status p={p} />
        </div>
      </div>
    </div>
  );
}

function VariantChip({ p, label, i }: { p: MV; label: string; i: number }) {
  const fill = useTransform(p, (v) => clamp01(ringOf(v) * VARIANTS.length - i));
  const check = useTransform(fill, (v) => (v >= 0.999 ? 1 : 0));
  return (
    <span className={`relative inline-flex h-[clamp(22px,4.2cqh,32px)] items-center gap-1 overflow-hidden rounded-md border border-line-strong px-2 ${MONO} text-[11px] text-fg @min-[500px]:text-[12px]`}>
      <motion.i
        aria-hidden
        style={{ scaleX: fill, background: "color-mix(in oklab, var(--color-mint) 34%, transparent)" }}
        className="absolute inset-0 origin-left"
      />
      <span className="relative">{label}</span>
      <motion.span style={{ opacity: check }} className="relative grid h-3 w-3 place-items-center text-mint">
        <CheckMark className="h-full w-full" />
      </motion.span>
    </span>
  );
}

function Variants({ p }: { p: MV }) {
  return (
    <div className="flex flex-wrap gap-1.5 @min-[500px]:gap-2">
      {VARIANTS.map((v, i) => (
        <VariantChip key={v} p={p} label={v} i={i} />
      ))}
    </div>
  );
}

/* When a lesson opens the other two step back and the opened one says where it comes from. */
function Lesson({ p, i, title, min }: { p: MV; i: number; title: string; min: number }) {
  const tick = useTransform(p, (v) => segAt(ringOf(v), TICK_AT[i] - 0.03, TICK_AT[i] + 0.02, easeOutCubic));
  const opening = useTransform(p, (v) => segAt(v, TL.open[0], TL.open[1]));
  const open = useTransform(opening, (v) => (i === OPEN_LESSON ? v : 0));
  const play = useTransform(open, (v) => segAt(v, 0, 0.25));
  const rowOp = useTransform(opening, (v) => (i === OPEN_LESSON ? 1 : 1 - 0.55 * segAt(v, 0, 0.25)));
  const barOp = useTransform(open, (v) => (v > 0 ? 1 : 0));
  const bar = useTransform(open, (v) => v * BAR_MAX);
  const tickScale = useTransform(tick, (v) => 0.6 + 0.4 * v);
  return (
    <motion.div
      style={{ opacity: rowOp }}
      className="relative flex h-[clamp(28px,6.4cqh,48px)] items-center gap-2 overflow-hidden rounded-md border border-line bg-surface-2 px-2 @min-[500px]:gap-3 @min-[500px]:px-3"
    >
      <motion.i aria-hidden style={{ opacity: play }} className="absolute inset-0 bg-accent/25" />
      <motion.i aria-hidden style={{ opacity: play }} className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-accent" />
      <Roller
        pos={play}
        cellClass="h-4 w-4 justify-center @min-[500px]:h-5 @min-[500px]:w-5"
        className={`relative h-4 w-4 shrink-0 ${MONO} text-[11px] text-mute @min-[500px]:h-5 @min-[500px]:w-5 @min-[500px]:text-[12px]`}
        items={[<span key="n">{i + 1}</span>, <PlayMark key="p" className="h-3 w-3 text-fg" />]}
      />
      <span className="relative min-w-0 flex-1 truncate text-[12px] text-fg @min-[500px]:text-[14px]">{title}</span>
      <Roller
        pos={play}
        cellClass="h-4 justify-end"
        className={`relative h-4 shrink-0 ${MONO} text-[11px] leading-4 text-mute @min-[500px]:text-[12px]`}
        items={i === OPEN_LESSON ? [`${min} min`, <span key="c" className="text-fg">from cache</span>] : [`${min} min`]}
      />
      <motion.span
        aria-hidden
        style={{ opacity: tick, scale: tickScale }}
        className="relative grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint text-[var(--color-pastel-ink)] @min-[500px]:h-5 @min-[500px]:w-5"
      >
        <CheckMark className="h-2.5 w-2.5 @min-[500px]:h-3 @min-[500px]:w-3" />
      </motion.span>
      <motion.i
        aria-hidden
        style={{ scaleX: bar, opacity: barOp }}
        className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
      />
    </motion.div>
  );
}

function Lessons({ p }: { p: MV }) {
  const state = useKeys(p, [TL.ring[1] - 0.004, TL.ring[1] + 0.004, TL.swap[0], TL.swap[1]], [0, 1, 1, 2]);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 @min-[500px]:mb-2">
        <p className={`${MONO_LABEL} truncate`}>
          Punnett squares<span className="hidden @min-[500px]:inline">, 3 lessons</span>
        </p>
        <Roller
          pos={state}
          cellClass="h-4 justify-end"
          className={`h-4 shrink-0 ${MONO} text-[11px] leading-4`}
          items={[
            <span key="a" className="whitespace-nowrap text-dim">caching</span>,
            <span key="b" className="whitespace-nowrap text-mint">on device</span>,
            <span key="c" className="whitespace-nowrap text-fg">offline, still open</span>,
          ]}
        />
      </div>
      <div className="flex flex-col gap-1 @min-[500px]:gap-1.5">
        {LESSONS.map((l, i) => (
          <Lesson key={l.title} p={p} i={i} title={l.title} min={l.min} />
        ))}
      </div>
    </div>
  );
}

export default function OfflinePage({ p }: { p: MV }) {
  return (
    <div className="flex h-full flex-col justify-center gap-[clamp(10px,3cqh,26px)] px-[clamp(10px,3cqw,26px)] py-2">
      <Hero p={p} />
      <Variants p={p} />
      <Lessons p={p} />
    </div>
  );
}
