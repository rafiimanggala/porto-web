"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { WORDS } from "./PipeKitData";
import { clamp01, pct, segAt, useKeys } from "./PipeKitMath";
import { DURATION, TL } from "./PipeVoiceData";
import { edgePx, groupAt, toneMix, wordCur } from "./PipeVoiceMath";

/* Lane rows: time ruler and word chips. */

export type View = { win: MV; t0: MV };

const at = (t: number) => pct((t / DURATION) * 100);

const range = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step + 1e-6) + 1 }, (_, i) => from + i * step);

/* A tick level fades in once its spacing is wide enough: lo to hi, in fractions of the window. */
const LEVELS = [
  { step: 10, times: range(0, 40, 10), tick: 7, lo: 0.05, hi: 0.09 },
  { step: 5, times: range(5, 35, 10), tick: 6, lo: 0.07, hi: 0.11 },
  { step: 1, times: range(1, 39, 1).filter((t) => t % 5 !== 0), tick: 5, lo: 0.05, hi: 0.09 },
  { step: 0.5, times: range(0.5, 9.5, 1), tick: 4, lo: 0.09, hi: 0.13 },
] as const;

function RulerLevel({ level, win }: { level: (typeof LEVELS)[number]; win: MV }) {
  const opacity = useTransform(win, (w) => clamp01((level.step / w - level.lo) / (level.hi - level.lo)));
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      {level.times.map((t) => (
        <span key={t} className="absolute inset-y-0" style={{ left: at(t) }}>
          <i className="absolute left-0 top-0 w-px bg-line-strong" style={{ height: level.tick }} />
          <span className={`${MONO} absolute top-[6px] text-[10px] leading-none text-mute ${t === 0 ? "left-0.5" : "-translate-x-1/2"}`}>{`${t}s`}</span>
        </span>
      ))}
    </motion.div>
  );
}

export function RulerRow({ win }: { win: MV }) {
  return (
    <div className="relative h-4 shrink-0 border-t border-line-strong">
      {LEVELS.map((level) => (
        <RulerLevel key={level.step} level={level} win={win} />
      ))}
    </div>
  );
}

const CHIP_ROWS = 3;
const TICK_ROWS = 1;
const STEM_FLOOR_PX = 4;
const STEM_DROP_PX = 14;
const PILL_INSET_PX = 4;
const FALL_PCT = 125;

type ChipProps = { i: number; p: MV; reached: MV; head: MV; drop: MV; view: View; laneW: MV };

const CHIP_RAMP_PX = 14;

/* A chip is gone for good once its left end enters the left fade zone and fades in over a short ramp beyond it, so no
   half faded ghost is ever left inside the fade. */
function edgeFade(start: number, t0: number, win: number, laneW: number) {
  const fade = edgePx(t0, win).left;
  return fade <= 0 ? 1 : clamp01(((start - t0) * (laneW / win) - fade) / CHIP_RAMP_PX);
}

function Chip({ i, p, reached, head, drop, view, laneW }: ChipProps) {
  const w = WORDS[i];
  const r = i % CHIP_ROWS;
  const edge = useTransform([view.t0, view.win, laneW], ([t0, win, lw]: number[]) => edgeFade(w.start, t0, win, lw));
  const stamp = useTransform(reached, (t) => segAt(t, w.start, w.start + 0.22, easeOutCubic));
  const cur = useTransform(head, (t) => wordCur(t, i));
  const group = useTransform(p, (v) => groupAt(v, w.line));
  const pillOpacity = useTransform([stamp, drop, edge], ([s, d, e]: number[]) => s * (1 - segAt(d, 0, 0.6)) * e);
  const pillY = useTransform([stamp, drop], ([s, d]: number[]) => `${(1 - s) * -60 + d * (CHIP_ROWS - 1 - r) * FALL_PCT}%`);
  const pillScale = useTransform(stamp, (s) => 0.9 + 0.1 * s);
  const stemHeight = useTransform([drop, cur], ([d, c]: number[]) => `calc(var(--row) * ${((CHIP_ROWS - 1 - r) * (1 - d)).toFixed(3)} + ${(STEM_FLOOR_PX * (1 - d) + STEM_DROP_PX * d + 5 * c).toFixed(2)}px)`);
  const stemWidth = useTransform([group, cur], ([g, c]: number[]) => `${1 + 3 * g + c}px`);
  const stemColor = useTransform([group, cur], ([g, c]: number[]) => toneMix(w.line, g, c));
  return (
    <span className="absolute inset-y-0 w-0" style={{ left: at(w.start) }}>
      <motion.i aria-hidden style={{ opacity: stamp, height: stemHeight, width: stemWidth, background: stemColor }} className="absolute bottom-0 left-0 z-0 -translate-x-1/2 rounded-full" />
      <motion.span
        style={{ opacity: pillOpacity, y: pillY, scale: pillScale, top: `calc(var(--row) * ${r})`, height: `calc(var(--row) - ${PILL_INSET_PX}px)` }}
        className={`${MONO} absolute left-0 z-10 flex origin-left items-center gap-1 whitespace-nowrap rounded-[5px] border border-line-strong bg-surface-2 px-1.5 text-[10px] leading-none`}
      >
        <span className="text-fg">{w.w}</span>
        <span className="text-mute">{w.start.toFixed(2)}</span>
        <motion.i aria-hidden style={{ opacity: cur }} className="pointer-events-none absolute -inset-px rounded-[5px] border-2 border-accent" />
      </motion.span>
    </span>
  );
}

type ChipZoneProps = { p: MV; head: MV; reached: MV; view: View; laneW: MV };

export function ChipZone({ p, head, reached, view, laneW }: ChipZoneProps) {
  const rows = useKeys(p, [TL.zoomIn[0], TL.zoomIn[1], TL.drop[0], TL.drop[1]], [0, CHIP_ROWS, CHIP_ROWS, TICK_ROWS], easeInOutCubic);
  const height: MotionValue<string> = useTransform(rows, (v) => `calc(var(--row) * ${v.toFixed(3)})`);
  const drop = useSeg(p, TL.drop[0], TL.drop[1], easeInOutCubic);
  return (
    <motion.div style={{ height }} className="relative z-[2] shrink-0 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 isolate" style={{ height: `calc(var(--row) * ${CHIP_ROWS})` }}>
        {WORDS.map((w, i) => (
          <Chip key={w.start} i={i} p={p} reached={reached} head={head} drop={drop} view={view} laneW={laneW} />
        ))}
      </div>
    </motion.div>
  );
}
