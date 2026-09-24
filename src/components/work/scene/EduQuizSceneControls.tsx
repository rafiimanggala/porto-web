"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CARD_QS, RULES, T, TYPED } from "./EduQuizSceneData";
import { WipePages, clamp01, keyframes, lerp, segAt } from "./EduQuizSceneKit";

/* The answer control of the question card. Radio dots and checkboxes are one
   persistent layer whose shape morphs with the question type, the labels swap
   under it with a wipe, and the short answer page replaces both with a field. */

type Marks = { xs: readonly number[]; ys: readonly number[] };
const MARKS: readonly Marks[] = [
  { xs: [T.pickA[0], T.pickA[1], T.pickC[0], T.pickC[1], T.checks[0][0], T.checks[0][1]], ys: [0, 1, 1, 0, 0, 1] },
  { xs: [T.checks[1][0], T.checks[1][1]], ys: [0, 1] },
  { xs: [T.pickC[0], T.pickC[1], T.typeT[0] + 0.005, T.typeT[0] + 0.025], ys: [0, 1, 1, 0] },
  { xs: [0, 1], ys: [0, 0] },
];
/* Rising edges of each marker, where its press ring fires. */
const PRESSES: readonly (readonly (readonly number[])[])[] = [[T.pickA, T.checks[0]], [T.checks[1]], [T.pickC], []];

const markOn = (v: number, i: number) => keyframes(v, MARKS[i].xs, MARKS[i].ys);
const pressAt = (v: number, i: number) => PRESSES[i].reduce((m, w) => Math.max(m, segAt(v, w[0], w[1])), 0);
const pressRing = (t: number) => (t <= 0 || t >= 1 ? 0 : 0.8 * (1 - t));

function Marker({ p, pos, i }: { p: MV; pos: MV; i: number }) {
  const on = useTransform(p, (v) => markOn(v, i));
  const shape = useTransform(pos, (v) => clamp01(v));
  const radius = useTransform(shape, (s) => `${lerp(50, 24, s)}%`);
  const dot = useTransform([on, shape], ([o, s]: number[]) => o * (1 - s));
  const fill = useTransform([on, shape], ([o, s]: number[]) => o * s);
  const tick = useTransform(fill, (f) => (f > 0.01 ? 1 : 0));
  const press = useTransform(p, (v) => pressAt(v, i));
  const ringScale = useTransform(press, (t) => 0.9 + 1.1 * t);
  const ringOp = useTransform(press, pressRing);
  return (
    <span className="relative block h-[14px] w-[14px] shrink-0 @[34rem]:h-4 @[34rem]:w-4">
      <motion.i style={{ borderRadius: radius }} className="absolute inset-0 border-[1.5px] border-mute" />
      <motion.i style={{ borderRadius: radius, opacity: on }} className="absolute inset-0 border-[1.5px] border-accent" />
      <motion.i style={{ opacity: fill, borderRadius: radius }} className="absolute inset-0 bg-accent" />
      <motion.i style={{ scale: dot }} className="absolute inset-[3.5px] rounded-full bg-accent" />
      <svg aria-hidden viewBox="0 0 16 16" className="absolute inset-0 h-full w-full">
        <motion.path
          d="M4 8.4l2.6 2.6L12 5.2"
          fill="none"
          stroke="var(--color-fg)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: fill, opacity: tick }}
        />
      </svg>
      <motion.i style={{ scale: ringScale, opacity: ringOp, borderRadius: radius }} className="absolute -inset-1 border-2 border-fg" />
    </span>
  );
}

function OptionRow({ p, pos, i }: { p: MV; pos: MV; i: number }) {
  const on = useTransform(p, (v) => markOn(v, i));
  return (
    <div className="absolute inset-x-0 flex items-center pl-2" style={{ top: `calc(var(--pitch) * ${i})`, height: "var(--row)" }}>
      <i aria-hidden className="absolute inset-0 rounded-md border border-line bg-surface-2/50" />
      <motion.i aria-hidden style={{ opacity: on }} className="absolute inset-0 rounded-md border border-accent/60 bg-accent/15" />
      <Marker p={p} pos={pos} i={i} />
    </div>
  );
}

function OptionLabels({ options }: { options: readonly string[] }) {
  return (
    <>
      {options.map((label, i) => (
        <span
          key={label}
          className="absolute inset-x-0 flex items-center truncate pl-[34px] text-[12px] text-fg @[34rem]:pl-[38px] @[34rem]:text-[13px]"
          style={{ top: `calc(var(--pitch) * ${i})`, height: "var(--row)" }}
        >
          {label}
        </span>
      ))}
    </>
  );
}

const RULE_LEN = 0.008;
const KNOB_TRAVEL = 10;

function Rule({ p, i, label }: { p: MV; i: number; label: string }) {
  const on = useSeg(p, T.rules[i], T.rules[i] + RULE_LEN, easeOutCubic);
  const x = useTransform(on, (v) => v * KNOB_TRAVEL);
  return (
    <div className="flex items-center gap-2 text-[11px] text-dim @[34rem]:text-[12px]" style={{ height: "calc(var(--row) * 0.86)" }}>
      <span aria-hidden className="relative h-3 w-[24px] shrink-0 rounded-full bg-line-strong">
        <motion.i style={{ opacity: on }} className="absolute inset-0 rounded-full bg-mint" />
        <motion.i style={{ x }} className="absolute left-[2px] top-[2px] h-2 w-2 rounded-full bg-fg" />
      </span>
      {label}
    </div>
  );
}

function FieldPage({ p }: { p: MV }) {
  const typed = useTransform(p, (v) => TYPED.slice(0, Math.floor(segAt(v, T.typing[0], T.typing[1]) * (TYPED.length + 0.999))));
  const hint = useTransform(p, (v) => 1 - segAt(v, T.typing[0], T.typing[0] + 0.004));
  const focus = useSeg(p, T.typing[0] - 0.012, T.typing[0]);
  const ok = useSeg(p, T.ok[0], T.ok[1], easeOutCubic);
  const focusOp = useTransform([focus, ok], ([f, o]: number[]) => f * (1 - o));
  const caret = useTransform(p, (v) => (v >= T.typing[0] - 0.012 && v < T.ok[0] ? 1 : 0));
  const badge = useTransform(ok, (o) => 0.6 + 0.4 * o);
  return (
    <div className="mx-[2px] flex flex-col gap-1.5 @[34rem]:gap-2">
      <div className="relative flex items-center rounded-md border border-line-strong bg-surface-2 px-2.5" style={{ height: "calc(var(--row) * 1.55)" }}>
        <motion.i aria-hidden style={{ opacity: focusOp }} className="pointer-events-none absolute -inset-px rounded-md border-2 border-accent" />
        <motion.i aria-hidden style={{ opacity: ok }} className="pointer-events-none absolute -inset-px rounded-md border-2 border-mint" />
        <motion.span style={{ opacity: hint }} className="absolute text-[12px] text-mute @[34rem]:text-[13px]">
          Type the answer
        </motion.span>
        <span className="flex items-center text-[13px] text-fg @[34rem]:text-[14px]">
          <motion.span>{typed}</motion.span>
          <motion.i aria-hidden style={{ opacity: caret }} className="ml-px h-[1.1em] w-[2px] bg-accent" />
        </span>
        <motion.span
          aria-hidden
          style={{ opacity: ok, scale: badge }}
          className="absolute right-2 grid h-[18px] w-[18px] place-items-center rounded-full bg-mint @[34rem]:h-5 @[34rem]:w-5"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3">
            <path d="M3.6 8.4l2.9 2.9 5.9-6.2" fill="none" stroke="var(--color-bg)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </div>
      <div>
        {RULES.map((label, i) => (
          <Rule key={label} p={p} i={i} label={label} />
        ))}
      </div>
    </div>
  );
}

export function Controls({ p, pos }: { p: MV; pos: MV }) {
  const layer = useTransform(pos, [1, 1.12], [1, 0], { clamp: true });
  const pages = [<OptionLabels key="a" options={CARD_QS[0].options} />, <OptionLabels key="b" options={CARD_QS[1].options} />, <FieldPage key="c" p={p} />];
  return (
    <div className="relative shrink-0 overflow-hidden" style={{ height: "calc(var(--pitch) * 4 - 3px)" }}>
      <motion.div style={{ opacity: layer }} className="absolute inset-0">
        {CARD_QS[0].options.map((o, i) => (
          <OptionRow key={o} p={p} pos={pos} i={i} />
        ))}
      </motion.div>
      <div className="absolute inset-0">
        <WipePages pos={pos} pages={pages} className="h-full w-full" />
      </div>
    </div>
  );
}
