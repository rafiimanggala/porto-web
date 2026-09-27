"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { motion, motionValue, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CAPTION_LINES } from "./PipeKitData";
import { clamp01, pct, useKeys } from "./PipeKitMath";
import { ChipZone, RulerRow, type View } from "./PipeVoiceLaneParts";
import { BLOCK_LABELS, DURATION, LABEL_GLYPH_PX, LABEL_PAD_PX, TL, TONES } from "./PipeVoiceData";
import { GHOST_PATH, VB_W, barsPath, edgePx, lineCur, lineIdxAt, parseAt, parseFlashAt, viewAt } from "./PipeVoiceMath";

/* Lane: one time layer stretched and shifted by the view, so children sit at their real time. */

export type { View };

export function useView(p: MV): View {
  return { win: useTransform(p, (v) => viewAt(v).win), t0: useTransform(p, (v) => viewAt(v).t0) };
}

const at = (t: number) => pct((t / DURATION) * 100);

function TimeLayer({ view, children }: { view: View; children: ReactNode }) {
  const left = useTransform([view.t0, view.win], ([t, w]: number[]) => pct((-t / w) * 100));
  const width = useTransform(view.win, (w) => pct((DURATION / w) * 100));
  return (
    <motion.div style={{ left, width }} className="absolute inset-y-0 flex flex-col">
      {children}
    </motion.div>
  );
}

/* Where a block sits in the window: `left` is the label offset inside the block, `room` the width the label may use. */
type Geo = { left: number; room: number };

const need = (text: string) => text.length * LABEL_GLYPH_PX + LABEL_PAD_PX;
const fits = (room: number, text: string) => clamp01((room - need(text)) / 8);

function blockGeo(start: number, end: number, t0: number, win: number, w: number): Geo {
  const pps = w / win;
  const edge = edgePx(t0, win);
  const blockLeft = (start - t0) * pps;
  const left = Math.max(0, edge.left - blockLeft);
  const reach = Math.min((end - t0) * pps, w - edge.right);
  return { left, room: Math.max(0, reach - blockLeft - left) };
}

/* The label sticks just inside the left fade, and fades out whole when it no longer fits, so it is never cut. */
function BlockLabel({ text, longer, geo }: { text: string; longer?: string; geo: MotionValue<Geo> }) {
  const left = useTransform(geo, (g) => g.left);
  const opacity = useTransform(geo, (g) => fits(g.room, text) * (longer ? 1 - fits(g.room, longer) : 1));
  return (
    <motion.span style={{ left, opacity }} className={`${MONO} absolute top-0 whitespace-nowrap pl-1 text-[10px] leading-[calc(var(--row)*0.8)] text-dim`}>
      {text}
    </motion.span>
  );
}

function BlockSeg({ i, view, laneW }: { i: number; view: View; laneW: MV }) {
  const b = BLOCK_LABELS[i];
  const geo = useTransform([view.t0, view.win, laneW], ([t0, win, w]: number[]) => blockGeo(b.start, b.end, t0, win, w));
  return (
    <span
      className={`absolute inset-y-0 overflow-hidden border-r border-bg ${i % 2 ? "bg-surface-3" : "bg-surface-2"}`}
      style={{ left: at(b.start), width: at(b.end - b.start) }}
    >
      {b.labels.map((text, k) => (
        <BlockLabel key={text} text={text} longer={b.labels[k - 1]} geo={geo} />
      ))}
    </span>
  );
}

function Ribbon({ view, laneW }: { view: View; laneW: MV }) {
  return (
    <div className="relative z-[2] shrink-0 overflow-hidden rounded-[3px]" style={{ height: "calc(var(--row) * 0.8)" }}>
      {BLOCK_LABELS.map((b, i) => (
        <BlockSeg key={b.id} i={i} view={view} laneW={laneW} />
      ))}
    </div>
  );
}

function Bars({ d, className }: { d: MotionValue<string>; className: string }) {
  return (
    <svg viewBox={`0 0 ${VB_W} 100`} preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
      <motion.path d={d} className={className} />
    </svg>
  );
}

const GHOST = motionValue(GHOST_PATH);

function WaveRow({ p, head }: { p: MV; head: MV }) {
  const grow = useSeg(p, TL.grow[0], TL.grow[1]);
  const d = useTransform(grow, barsPath);
  const played = useTransform(head, (t) => `inset(0 ${pct(100 - (t / DURATION) * 100)} 0 0)`);
  const idle = useTransform(p, [TL.grow[0] - 0.03, TL.grow[0]], [1, 0], { clamp: true });
  return (
    <div className="relative my-1 min-h-0 flex-1">
      <i aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
      <motion.div aria-hidden style={{ opacity: idle }} className="absolute inset-0">
        <Bars d={GHOST} className="fill-line-strong/70" />
      </motion.div>
      <Bars d={d} className="fill-dim/55" />
      <motion.div aria-hidden style={{ clipPath: played }} className="absolute inset-0">
        <Bars d={d} className="fill-fg" />
      </motion.div>
      <motion.span style={{ opacity: idle }} className={`${MONO} absolute left-1 top-0 text-[10px] leading-none text-mute`}>
        no audio yet
      </motion.span>
    </div>
  );
}

function TrackSeg({ k, p, head }: { k: number; p: MV; head: MV }) {
  const line = CAPTION_LINES[k];
  const grow = useTransform(p, (v) => parseAt(v, k));
  const sync = useSeg(p, TL.voiced, TL.sweepB[0]);
  const flash = useTransform(p, (v) => parseFlashAt(v, k));
  const cur = useTransform([head, sync, flash], ([t, s, f]: number[]) => Math.max(lineCur(lineIdxAt(t), k) * s, f));
  return (
    <span className="absolute inset-y-[2px]" style={{ left: at(line.start), width: at(line.end - line.start) }}>
      <motion.i style={{ scaleX: grow, background: TONES[k % TONES.length] }} className="absolute inset-0 origin-left rounded-[3px]" />
      <motion.i style={{ opacity: cur }} className="absolute -inset-px rounded-[4px] border-2 border-accent" />
    </span>
  );
}

function TrackRow({ p, head }: { p: MV; head: MV }) {
  const rows = useKeys(p, [TL.group.from - 0.01, TL.group.from + 0.03], [0, 0.65], easeOutCubic);
  const height = useTransform(rows, (v) => `calc(var(--row) * ${v.toFixed(3)})`);
  return (
    <motion.div style={{ height }} className="relative shrink-0 overflow-hidden border-t border-dashed border-line-strong">
      {CAPTION_LINES.map((l, k) => (
        <TrackSeg key={l.start} k={k} p={p} head={head} />
      ))}
    </motion.div>
  );
}

/* Inside the time layer so it passes behind the chips. */
function Playhead({ p, head }: { p: MV; head: MV }) {
  const left = useTransform(head, (t) => at(t));
  const opacity = useTransform(p, [TL.zoomIn[1] - 0.02, TL.zoomIn[1] + 0.01], [0, 1], { clamp: true });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[1] bottom-4">
      <motion.div style={{ left, opacity }} className="absolute inset-y-0 w-0">
        <i className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
        <i className="absolute -top-px left-0 h-2 w-2 -translate-x-1/2 rounded-full bg-accent" />
      </motion.div>
    </div>
  );
}

/** Live pixel width of an element, as a MotionValue so labels can size themselves to the lane. */
function useWidth(ref: RefObject<HTMLElement | null>): MV {
  const width = useMotionValue(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => width.set(el.clientWidth);
    read();
    const watch = new ResizeObserver(read);
    watch.observe(el);
    return () => watch.disconnect();
  }, [ref, width]);
  return width;
}

/* The window fades at an edge only where more lane lies beyond it, so nothing is ever sliced mid glyph. */
const edgeMask = ([t0, win]: number[]) => {
  const e = edgePx(t0, win);
  const lead = (px: number) => (px * 0.3).toFixed(1);
  return `linear-gradient(to right, transparent ${lead(e.left)}px, #000 ${e.left.toFixed(1)}px, #000 calc(100% - ${e.right.toFixed(1)}px), transparent calc(100% - ${lead(e.right)}px))`;
};

type LaneProps = { p: MV; head: MV; hot: MV; reached: MV; view: View };

export default function Lane({ p, head, hot, reached, view }: LaneProps) {
  const box = useRef<HTMLDivElement>(null);
  const laneW = useWidth(box);
  const mask = useTransform([view.t0, view.win], edgeMask);
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-line-strong bg-surface-1 [--row:17px] @[30rem]:[--row:24px]">
      <motion.div ref={box} style={{ maskImage: mask, WebkitMaskImage: mask }} className="absolute inset-x-[clamp(8px,2.4cqw,14px)] inset-y-2 overflow-hidden">
        <TimeLayer view={view}>
          <ChipZone p={p} head={hot} reached={reached} view={view} laneW={laneW} />
          <Ribbon view={view} laneW={laneW} />
          <WaveRow p={p} head={head} />
          <TrackRow p={p} head={hot} />
          <RulerRow win={view.win} />
          <Playhead p={p} head={head} />
        </TimeLayer>
      </motion.div>
    </div>
  );
}
