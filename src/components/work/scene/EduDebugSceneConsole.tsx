"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { LOG, SMTP_LED_AT, type LogLine, type Tone } from "./EduDebugSceneData";
import { clamp01, useSpan } from "./EduDebugSceneKit";

/* Status bar on top, log console at the bottom. */

const VISIBLE = 4;
const ENTER = 0.012;
/* Share of ENTER spent rolling the log up before the new line fades in. */
const ROLL_SHARE = 0.45;
const LINE_EM = 1.5;
/* The top line dissolves fully before it reaches the box edge, so a scrolling line never shows cut mid-glyph. */
const TOP_FADE =
  "[mask-image:linear-gradient(to_bottom,transparent_0,transparent_12%,#000_58%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,transparent_12%,#000_58%)]";

const TONE: Record<Tone, string> = {
  mute: "text-mute",
  fg: "text-fg",
  ok: "text-mint",
  warn: "text-sun",
  acc: "rounded-[3px] bg-accent px-1 text-fg",
};

function LogRow({ p, line }: { p: MV; line: LogLine }) {
  const t = useTransform(p, (v) => clamp01((v - line.t - ENTER * ROLL_SHARE) / (ENTER * (1 - ROLL_SHARE))));
  return (
    <motion.p style={{ opacity: t }} className="h-[1.5em] truncate leading-[1.5em]">
      {line.parts.map(([text, tone], i) => (
        <span key={i} className={`whitespace-pre ${TONE[tone]}`}>
          {text}
        </span>
      ))}
    </motion.p>
  );
}

export function Console({ p }: { p: MV }) {
  const shift = useTransform(p, (v) => {
    const printed = LOG.reduce((n, l) => n + clamp01((v - l.t) / (ENTER * ROLL_SHARE)), 0);
    return `${((VISIBLE - printed) * LINE_EM).toFixed(3)}em`;
  });
  return (
    <div className={`${MONO} relative shrink-0 border-t border-line bg-bg/45 px-[clamp(10px,3cqw,22px)] py-[0.55em] text-[10.5px] @[30rem]:text-[12px]`}>
      <div className={`relative h-[6em] overflow-hidden ${TOP_FADE}`}>
        <motion.div style={{ y: shift }} className="absolute inset-x-0 top-0">
          {LOG.map((line) => (
            <LogRow key={line.t} p={p} line={line} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* Stacked dots, one per colour, each on for its own stretch of progress. */
type LedState = readonly [from: number, to: number, className: string];

function LedDot({ p, state }: { p: MV; state: LedState }) {
  const [from, to, className] = state;
  const opacity = useSpan(p, from, to, 0.012);
  return <motion.i style={{ opacity }} className={`absolute inset-0 rounded-full ${className}`} />;
}

function Led({ p, label, states }: { p: MV; label: string; states: readonly LedState[] }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative h-2 w-2">
        {states.map((s) => (
          <LedDot key={s[2]} p={p} state={s} />
        ))}
      </span>
      <span className="text-mute">{label}</span>
    </span>
  );
}

const OPEN_END = 2;
const JOB_STATES: readonly LedState[] = [[-1, OPEN_END, "bg-mint"]];
const SMTP_STATES: readonly LedState[] = [
  [-1, SMTP_LED_AT.stall, "bg-mute"],
  [SMTP_LED_AT.stall, SMTP_LED_AT.open, "bg-sun"],
  [SMTP_LED_AT.open, OPEN_END, "bg-mint"],
];

export function StatusBar({ p }: { p: MV }) {
  return (
    <div className={`${MONO} flex h-[clamp(28px,4.6cqh,36px)] shrink-0 items-center justify-between border-b border-line bg-bg/45 px-[clamp(10px,3cqw,22px)] text-[10px] uppercase tracking-[0.12em] @[30rem]:text-[11px]`}>
      <span className="text-dim">mail queue / monitor</span>
      <span className="flex items-center gap-3">
        <Led p={p} label="job" states={JOB_STATES} />
        <Led p={p} label="smtp" states={SMTP_STATES} />
      </span>
    </div>
  );
}
