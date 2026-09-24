"use client";

import type { CSSProperties } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { LIMIT_PER_HOUR, OK_TAG_AT, PIPE_TL, QUEUE_TOTAL, fmt } from "./EduDebugSceneData";
import { CheckMark, EnvelopeIcon, ServerIcon, ValveGlyph } from "./EduDebugSceneIcons";
import { LABEL, PAD, pct, useKeys } from "./EduDebugSceneKit";
import { VALVE_Y, packetAt } from "./EduDebugScenePipeMath";
import { SceneIcon, type SceneIconName } from "./SceneIcon";

/* Pipeline page. Rects are [left, top, width, height] in percent of the stage. */

type Rect = readonly [number, number, number, number];
const APP: Rect = [33, 0, 34, 10.5];
const JOB: Rect = [27, 19, 46, 11];
const BOX: Rect = [10, 63.5, 80, 36.5];
const APP_FRAME: Rect = [30.5, -1.5, 39, 13.5];
const JOB_FRAME: Rect = [24.5, 17.5, 51, 14];
const BOX_FRAME: Rect = [8, 62, 84, 39];

const FRAME_KEYS = [0.578, 0.595, 0.608, 0.618, 0.632] as const;
const FRAME_RECTS: readonly Rect[] = [APP_FRAME, APP_FRAME, JOB_FRAME, JOB_FRAME, BOX_FRAME];
const FRAME_SHOWN = [0.572, 0.58, 0.72, 0.732] as const;
const TAG_LEFT = 71;
const CHIP_LAG = 0.007;

const rectStyle = ([l, t, w, h]: Rect) => ({ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` });
const NODE_BASE = "absolute z-[25] flex items-center justify-center gap-[clamp(6px,1.6cqw,10px)] rounded-lg border border-line-strong bg-surface-2";
const ICON = "h-[clamp(18px,4.8cqw,28px)] w-auto flex-none";

function Node({ rect, icon, label }: { rect: Rect; icon: SceneIconName; label: string }) {
  return (
    <div style={rectStyle(rect)} className={NODE_BASE}>
      <SceneIcon name={icon} size={32} className={ICON} />
      <span className={`${MONO} text-[10.5px] text-fg @[30rem]:text-[12.5px]`}>{label}</span>
    </div>
  );
}

function OkTag({ p, at, rect }: { p: MV; at: number; rect: Rect }) {
  const t = useSeg(p, at, at + 0.014, easeOutBack);
  const opacity = useSeg(p, at, at + 0.008);
  const scale = useTransform(t, (v) => 0.5 + 0.5 * v);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, scale, left: `${TAG_LEFT}%`, top: `${rect[1] + rect[3] / 2}%` }}
      className={`${MONO} absolute z-[40] flex -translate-y-1/2 items-center gap-1 text-[10.5px] text-mint @[30rem]:text-[12.5px]`}
    >
      <span className="grid h-[clamp(14px,3.6cqw,18px)] w-[clamp(14px,3.6cqw,18px)] place-items-center rounded-full bg-mint text-pastel-ink">
        <CheckMark className="h-[70%] w-[70%]" />
      </span>
      ok
    </motion.span>
  );
}

function TraceFrame({ p }: { p: MV }) {
  const left = useKeys(p, FRAME_KEYS, FRAME_RECTS.map((r) => r[0]));
  const top = useKeys(p, FRAME_KEYS, FRAME_RECTS.map((r) => r[1]));
  const width = useKeys(p, FRAME_KEYS, FRAME_RECTS.map((r) => r[2]));
  const height = useKeys(p, FRAME_KEYS, FRAME_RECTS.map((r) => r[3]));
  const opacity = useTransform(p, [...FRAME_SHOWN], [0, 1, 1, 0]);
  const style = {
    left: useTransform(left, pct),
    top: useTransform(top, pct),
    width: useTransform(width, pct),
    height: useTransform(height, pct),
    opacity,
  };
  return <motion.i aria-hidden style={style} className="pointer-events-none absolute z-[38] rounded-xl border-2 border-dashed border-accent" />;
}

function Plumbing() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
      <path d="M16 33.5H84L54.5 62H45.5Z" fill="color-mix(in oklab, var(--color-sun) 9%, transparent)" />
      <g fill="none" strokeWidth="1.6" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--color-line-strong)" }}>
        <path d="M16 33.5L45.5 62V64M84 33.5L54.5 62V64" vectorEffect="non-scaling-stroke" />
        <path d="M46 10.5V19M54 10.5V19" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

function Packet({ p, i }: { p: MV; i: number }) {
  const pos = useTransform(p, (v) => packetAt(v, i));
  const left = useTransform(pos, (q) => pct(q.x * 100));
  const top = useTransform(pos, (q) => pct(q.y * 100));
  const opacity = useTransform(pos, (q) => q.o);
  return (
    <motion.i aria-hidden style={{ left, top, opacity }} className="absolute z-20 w-[clamp(18px,min(6.2cqw,4.7cqh),34px)] -translate-x-1/2 -translate-y-1/2">
      <EnvelopeIcon className="block h-auto w-full" />
    </motion.i>
  );
}

function Doors({ p }: { p: MV }) {
  const open = useSeg(p, PIPE_TL.doors[0], PIPE_TL.doors[1], easeInOutCubic);
  const left = useTransform(open, (v) => pct(-v * 100));
  const right = useTransform(open, (v) => pct(v * 100));
  const seam = useTransform(open, [0, 0.25], [1, 0], { clamp: true });
  const door = "absolute inset-y-0 w-1/2 bg-surface-2 [background-image:repeating-linear-gradient(135deg,transparent_0_7px,var(--color-line)_7px_8px)]";
  return (
    <div style={rectStyle(BOX)} className="pointer-events-none absolute z-30 overflow-hidden rounded-xl">
      <motion.i aria-hidden style={{ x: left }} className={`${door} left-0 border-r-2 border-accent`} />
      <motion.i aria-hidden style={{ x: right }} className={`${door} right-0 border-l-2 border-accent`} />
      <motion.span style={{ opacity: seam }} className="t-h3 absolute left-1/2 top-1/2 grid h-[clamp(24px,6cqw,34px)] w-[clamp(24px,6cqw,34px)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-surface-1 text-[clamp(13px,3.4cqw,18px)]">
        ?
      </motion.span>
    </div>
  );
}

function ProviderTab({ p }: { p: MV }) {
  const on = useSeg(p, PIPE_TL.callout[0], PIPE_TL.callout[1]);
  return (
    <span style={{ left: `${BOX[0] + 3}%`, top: `${BOX[1]}%` }} className="absolute z-[42] flex -translate-y-1/2 items-center gap-1.5 overflow-hidden rounded-md border border-line-strong bg-surface-1 px-1.5 py-0.5">
      <motion.i aria-hidden style={{ opacity: on }} className="absolute inset-0 bg-accent" />
      <ServerIcon className="relative h-[clamp(13px,3.4cqw,18px)] w-auto" />
      <span className={`${MONO} relative text-[10px] text-fg @[30rem]:text-[12px]`}>smtp provider</span>
    </span>
  );
}

const inBox = (yFrac: number) => ((yFrac * 100 - BOX[1]) / BOX[3]) * 100;

/* The valve sits above the packets, so a packet is hidden behind the plates as it squeezes through. */
function ValveLayer({ p }: { p: MV }) {
  const squeeze = useSeg(p, PIPE_TL.squeeze[0], PIPE_TL.squeeze[1], easeOutCubic);
  return (
    <span style={{ left: "50%", top: `${VALVE_Y * 100}%` }} className="absolute z-[22] h-[var(--valve)] -translate-x-1/2 -translate-y-1/2">
      <ValveGlyph squeeze={squeeze} turn={squeeze} className="h-full w-auto" />
    </span>
  );
}

function Interior({ p }: { p: MV }) {
  const call = useSeg(p, PIPE_TL.callout[0], PIPE_TL.callout[1], easeOutCubic);
  const callX = useTransform(call, (v) => pct(-(1 - v) * 14));
  const leader = useTransform(call, [0, 0.5], [0, 1], { clamp: true });
  const chip = useSeg(p, PIPE_TL.callout[0] + CHIP_LAG, PIPE_TL.callout[1] + CHIP_LAG);
  const wall = "absolute w-[9%] border-x border-line-strong";
  return (
    <div style={rectStyle(BOX)} className="absolute z-10 overflow-hidden rounded-xl border border-line-strong bg-bg/55">
      <i aria-hidden style={{ top: 0, height: `calc(${inBox(VALVE_Y)}% - var(--valve) / 2)` }} className={`${wall} left-[45.5%]`} />
      <i aria-hidden style={{ top: `calc(${inBox(VALVE_Y)}% + var(--valve) / 2)`, bottom: "22%" }} className={`${wall} left-[45.5%]`} />
      <motion.i aria-hidden style={{ scaleX: leader, top: `${inBox(VALVE_Y)}%` }} className="absolute left-[60%] h-0.5 w-[6%] origin-left bg-accent" />
      <motion.span
        style={{ opacity: call, x: callX, top: `${inBox(VALVE_Y)}%` }}
        className={`${MONO} absolute left-[66%] w-[31%] -translate-y-1/2 rounded-md border-2 border-accent bg-surface-1 px-[clamp(4px,1.2cqw,8px)] py-[clamp(3px,0.8cqh,6px)] text-[10.5px] leading-tight text-fg @[30rem]:text-[12.5px]`}
      >
        rate limit,
        <br />
        no error
      </motion.span>
      <motion.span style={{ opacity: chip, top: `${inBox(VALVE_Y)}%` }} className={`${MONO} absolute left-[6%] w-[32%] -translate-y-1/2 text-[10.5px] leading-tight text-fg @[30rem]:text-[12.5px]`}>
        <span className="t-h3 block text-[clamp(0.95rem,3.4cqw,1.35rem)] leading-none">{LIMIT_PER_HOUR} / hr</span>
        <span className="mt-0.5 block text-mute">sends allowed</span>
      </motion.span>
      <SceneIcon name="send" size={32} className="absolute bottom-[3%] left-1/2 h-[clamp(20px,5.2cqw,30px)] w-auto -translate-x-1/2" />
    </div>
  );
}

function Pulse({ p }: { p: MV }) {
  const t = useSeg(p, PIPE_TL.pulse[0], PIPE_TL.pulse[1], easeOutCubic);
  const scale = useTransform(t, (v) => 0.3 + 2.7 * v);
  const opacity = useTransform(t, [0, 0.06, 1], [0, 0.85, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ scale, opacity, left: "50%", top: `${VALVE_Y * 100}%` }}
      className="pointer-events-none absolute z-[36] -ml-[var(--valve)] -mt-[var(--valve)] h-[calc(var(--valve)*2)] w-[calc(var(--valve)*2)] rounded-full border-2 border-accent"
    />
  );
}

function Outbox() {
  return (
    <span className={`${LABEL} absolute left-0 top-[31.5%] z-[5] leading-snug`}>
      outbox
      <span className={`${MONO} block text-[11px] normal-case tracking-normal text-fg @[30rem]:text-[13px]`}>{fmt(QUEUE_TOTAL)}</span>
    </span>
  );
}

export default function PipePage({ p }: { p: MV }) {
  return (
    <div className="h-full">
      <div style={{ inset: PAD, "--valve": "clamp(36px, 9cqh, 72px)" } as CSSProperties} className="absolute">
        <Plumbing />
        <Outbox />
        <Interior p={p} />
        <ValveLayer p={p} />
        {Array.from({ length: PIPE_TL.packets }, (_, i) => (
          <Packet key={i} p={p} i={i} />
        ))}
        <Node rect={APP} icon="browser" label="app" />
        <Node rect={JOB} icon="sync" label="sending job" />
        <OkTag p={p} at={OK_TAG_AT.app} rect={APP} />
        <OkTag p={p} at={OK_TAG_AT.job} rect={JOB} />
        <Doors p={p} />
        <Pulse p={p} />
        <TraceFrame p={p} />
        <ProviderTab p={p} />
      </div>
    </div>
  );
}
