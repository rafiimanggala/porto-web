"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import type { Status } from "./PipeKitData";
import { clamp01 } from "./PipeKitMath";

/* Small shared pieces of the publishing scene. Text is 11px on a phone stage and grows with the stage up to 14px. */

export const TXT = "text-[clamp(11px,2.75cqw,14px)]";
export const MONO_TXT = `${MONO} ${TXT}`;
/* Tag chips: 11px on the tall (phone) stage, which has the height to wrap them, 10px at the least on the wide one, where a
   small phone would otherwise wrap four tags onto three lines and squeeze the caption. */
export const tagText = (tall: boolean) => (tall ? TXT : "text-[clamp(10px,2.75cqw,14px)]");
/* Post id chips stay at 10px on a phone stage: two of them share the row between the posting nodes. */
export const CHIP_TXT = `${MONO} text-[clamp(10px,2.75cqw,14px)]`;

/* Node captions: PipeNode's own label is 10px, so the nodes here draw their captions with this one, 11px on a phone stage and
   12px once the stage is wide. It lights up with the node, like the built-in label does. */
export function NodeLabel({ text, active }: { text: string; active: MV }) {
  return (
    <span className={`${MONO} pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[11px] leading-none @min-[520px]:text-xs`}>
      <span className="text-mute">{text}</span>
      <motion.span style={{ opacity: active }} className="absolute inset-0 text-fg">
        {text}
      </motion.span>
    </span>
  );
}

const PILL_TINT: Record<Status, string | null> = {
  idea: null,
  scripted: "var(--color-sky)",
  voiced: "var(--color-rose)",
  rendered: "var(--color-sun)",
  posted: "var(--color-mint)",
};
const PILL = `${MONO_TXT} inline-grid h-[1.6em] w-[6.4em] shrink-0 place-items-center rounded-[4px] leading-none`;

export function Pill({ status }: { status: Status }) {
  const tint = PILL_TINT[status];
  return (
    <span
      className={`${PILL} ${tint ? "text-fg" : "border border-line-strong text-mute"}`}
      style={tint ? { background: `color-mix(in oklab, ${tint} 46%, transparent)` } : undefined}
    >
      {status}
    </span>
  );
}

/** Two pills stacked in a clipped box: `t` slides the first out and the second in, by position, never both visible in place. */
export function PillRoll({ t, from, to }: { t: MV; from: Status; to: Status }) {
  const y = useTransform(t, (v) => `${(-clamp01(v) * 50).toFixed(2)}%`);
  return (
    <span className={`${MONO_TXT} inline-block h-[1.6em] shrink-0 overflow-hidden rounded-[4px]`}>
      <motion.span style={{ y }} className="flex flex-col">
        <Pill status={from} />
        <Pill status={to} />
      </motion.span>
    </span>
  );
}

/* Each line fades by its own distance from the window, so the outgoing line is gone once it has moved half a line and the
   incoming one starts after that: no slivers of two lines share the window. */
const LINE_FADE = 2;

function RollLine({ idx, k, text }: { idx: MV; k: number; text: string }) {
  const opacity = useTransform(idx, (v) => clamp01(1 - LINE_FADE * Math.abs(v - k)));
  return (
    <motion.span style={{ opacity }} className="block truncate">
      {text}
    </motion.span>
  );
}

/** A stack of one-line strings in a clipped box. `idx` runs 0 to lines.length - 1 and the stack rolls up by position. */
export function RollStack({ idx, lines, className = "" }: { idx: MV; lines: readonly string[]; className?: string }) {
  const last = lines.length - 1;
  const y = useTransform(idx, (v) => `${((-Math.min(last, Math.max(0, v)) * 100) / lines.length).toFixed(3)}%`);
  return (
    <span className={`block h-[1.5em] overflow-hidden leading-[1.5em] ${className}`}>
      <motion.span style={{ y }} className="flex flex-col">
        {lines.map((line, k) => (
          <RollLine key={line} idx={idx} k={k} text={line} />
        ))}
      </motion.span>
    </span>
  );
}

export function Counter({ p, of, className = "" }: { p: MV; of: (v: number) => string; className?: string }) {
  const text = useTransform(p, of);
  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>;
}
