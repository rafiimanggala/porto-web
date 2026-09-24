"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SceneIcon } from "./SceneIcon";
import { AVG_COMPLETE, D_CLASS, REPORTING, T, TONE, TOPICS, WEAKEST, WEAK_DETAIL } from "./EduInsightsSceneData";
import { BellIcon, TickBadge } from "./EduInsightsSceneIcons";
import { Typed, clamp01, pct } from "./EduInsightsSceneKit";

/* The AI summary card. It writes three stat rows line by line, then in the
   send chapter its header chip turns into the preview toggle and each row is
   ticked off by the teacher. */

/* The note on the nudge row changes with the focus card, while the card is out of view. */
const NOTE_SWITCH = (T.swap[0] + T.swap[1]) / 2;
const REVIEW_STEP = (T.review[1] - T.review[0]) / 3;

function DraftChip({ p }: { p: MV }) {
  const t = useSeg(p, T.done[0], T.done[1], easeOutBack);
  const opacity = useTransform(t, (v) => clamp01(v * 1.6));
  const scale = useTransform(t, (v) => 0.7 + 0.3 * v);
  return (
    <motion.span
      style={{ opacity, scale }}
      className={`${MONO} inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface-2 px-[0.8em] py-[0.25em] text-fg`}
    >
      <i aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      AI draft
    </motion.span>
  );
}

function Toggle({ p }: { p: MV }) {
  const flip = useSeg(p, T.flip[0], T.flip[1], easeInOutCubic);
  const knob = useTransform(flip, (v) => pct(v * 100));
  const appOp = useTransform(flip, [0, 1], [1, 0.6]);
  const mailOp = useTransform(flip, [0, 1], [0.6, 1]);
  const seg = "relative flex items-center justify-center gap-0.5 whitespace-nowrap px-[0.7em] text-fg";
  return (
    <div className="relative grid grid-cols-2 rounded-full border border-line-strong bg-surface-2 p-[2px]">
      <motion.i style={{ x: knob }} className="absolute inset-y-[2px] left-[2px] w-[calc(50%-2px)] rounded-full bg-accent" />
      <motion.span style={{ opacity: appOp }} className={seg}>
        <SceneIcon name="browser" size={32} className="-my-1 h-[1.7em] w-[1.7em]" />
        In app
      </motion.span>
      <motion.span style={{ opacity: mailOp }} className={seg}>
        <SceneIcon name="send" size={32} className="-my-1 h-[1.7em] w-[1.7em]" />
        Email
      </motion.span>
    </div>
  );
}

/* Chip and toggle share one slot: the chip rolls up, the toggle rolls in. */
function Header({ p }: { p: MV }) {
  const head = useSeg(p, T.head[0], T.head[1]);
  const roll = useSeg(p, T.tog[0], T.tog[1], easeInOutCubic);
  const y = useTransform(roll, (v) => pct(-v * 50));
  const slot = "flex h-[2.4em] items-center justify-end";
  return (
    <div className="flex items-center justify-between gap-2">
      <Typed t={head} className="w-fit">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <SceneIcon name="insight" size={32} className="-my-1 h-[2.2em] w-[2.2em]" />
          <span className="text-[1.15em] font-medium text-fg">Fortnightly summary</span>
        </span>
      </Typed>
      <span className="block h-[2.4em] overflow-hidden">
        <motion.span style={{ y }} className="flex flex-col">
          <span className={slot}>
            <DraftChip p={p} />
          </span>
          <span className={slot}>
            <Toggle p={p} />
          </span>
        </motion.span>
      </span>
    </div>
  );
}

function CardRow({
  p,
  w,
  label,
  index,
  children,
}: {
  p: MV;
  w: readonly [number, number];
  label: string;
  index: number;
  children: (t: MV) => ReactNode;
}) {
  const t = useSeg(p, w[0], w[1]);
  const at = T.review[0] + index * REVIEW_STEP;
  const review = useSeg(p, at, at + T.reviewDur);
  return (
    <div className="flex items-center justify-between gap-1.5">
      <Typed t={t} className="w-fit min-w-0">
        <div className="flex items-center gap-[0.6em] whitespace-nowrap">
          <span className={`${MONO} w-[6em] shrink-0 text-mute`}>{label}</span>
          {children(t)}
        </div>
      </Typed>
      <TickBadge t={review} />
    </div>
  );
}

function Completion({ t }: { t: MV }) {
  const e = useTransform(t, (v) => easeOutCubic(clamp01((v - 0.05) / 0.85)));
  const text = useTransform(e, (v) => `${Math.round(AVG_COMPLETE * v)}%`);
  const bar = useTransform(e, (v) => (v * AVG_COMPLETE) / 100);
  return (
    <>
      <motion.span className="t-hero w-[2.3em] text-[1.9em] leading-none tabular-nums">{text}</motion.span>
      <span className="relative h-[0.7em] w-[6em] overflow-hidden rounded-full bg-line-strong">
        <motion.i style={{ scaleX: bar }} className="absolute inset-0 origin-left rounded-full bg-mint" />
      </span>
      <span className="text-dim">avg of {REPORTING} classes</span>
    </>
  );
}

function TopicPill({ p, t, i }: { p: MV; t: MV; i: number }) {
  const topic = TOPICS[i];
  const e = useTransform(t, (v) => easeOutCubic(clamp01((v - 0.1) / 0.8)));
  const fill = useTransform(e, (v) => (v * topic.acc) / 100);
  const ring = useSeg(p, T.hi[0], T.hi[1]);
  const weakest = i === WEAKEST;
  return (
    <span className="relative flex items-baseline gap-[0.4em] overflow-hidden rounded-md border border-line bg-surface-2 px-[0.5em] pb-[0.5em] pt-[0.2em] @lg:px-[0.6em]">
      <span className="text-dim">{topic.key}</span>
      <span className={`${MONO} tabular-nums text-fg`}>{topic.acc}</span>
      <span className="absolute inset-x-0 bottom-0 h-[2px] bg-line-strong">
        <motion.i style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-sky" />
      </span>
      {weakest ? (
        <motion.i aria-hidden style={{ opacity: ring }} className="absolute inset-0 rounded-md border-2 border-accent bg-accent/20" />
      ) : null}
    </span>
  );
}

function Topics({ p, t }: { p: MV; t: MV }) {
  return (
    <>
      <span className="flex gap-[0.4em]">
        {TOPICS.map((tp, i) => (
          <TopicPill key={tp.key} p={p} t={t} i={i} />
        ))}
      </span>
      <span className="text-accent">
        lowest<span className="hidden text-dim @lg:inline">: {WEAK_DETAIL}</span>
      </span>
    </>
  );
}

function Nudge({ p }: { p: MV }) {
  const note = useTransform(p, (v) => (v >= NOTE_SWITCH ? "no data yet" : `${D_CLASS.students} students`));
  return (
    <>
      <BellIcon className="h-[1.7em] w-[1.7em]" />
      <span
        className={`${MONO} rounded-md px-[0.5em] py-[0.15em] text-fg`}
        style={{ background: `color-mix(in oklab, ${TONE[D_CLASS.tone]} 42%, transparent)` }}
      >
        <span className="hidden @lg:inline">Class </span>
        {D_CLASS.id}
      </span>
      <span className="text-fg">needs a nudge</span>
      <motion.span className={`${MONO} text-dim`}>{note}</motion.span>
    </>
  );
}

export function CardBody({ p }: { p: MV }) {
  return (
    <div className="flex h-full flex-col justify-between p-[clamp(8px,2.2cqw,16px)] pb-[clamp(14px,3.6cqw,20px)]">
      <Header p={p} />
      <CardRow p={p} w={T.lines[0]} label="completion" index={0}>
        {(t) => <Completion t={t} />}
      </CardRow>
      <CardRow p={p} w={T.lines[1]} label="topics" index={1}>
        {(t) => <Topics p={p} t={t} />}
      </CardRow>
      <CardRow p={p} w={T.lines[2]} label="nudge" index={2}>
        {() => <Nudge p={p} />}
      </CardRow>
    </div>
  );
}

const SKELETON_LINES = [
  { top: 36, width: 78 },
  { top: 55, width: 92 },
  { top: 74, width: 60 },
] as const;

/* What the card becomes when it folds into the envelope: the same rows as bare lines. */
export function CardSkeleton() {
  return (
    <div aria-hidden className="absolute inset-0">
      <i className="absolute left-[7%] top-[12%] h-[10%] w-[34%] rounded-full bg-fg/45" />
      <i className="absolute right-[7%] top-[12%] h-[10%] w-[18%] rounded-full bg-accent/70" />
      {SKELETON_LINES.map((l) => (
        <i key={l.top} className="absolute left-[7%] h-[9%] rounded-full bg-fg/22" style={{ top: `${l.top}%`, width: `${l.width * 0.86}%` }} />
      ))}
    </div>
  );
}
