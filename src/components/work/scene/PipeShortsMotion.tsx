"use client";

import type { ReactNode } from "react";
import { motion, motionValue, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { NODE, SHORTS, fmtClock } from "./PipeKitData";
import { PipeGlyph, type GlyphName } from "./PipeKitGlyphs";
import { SlideArt } from "./PipeShortsArt";
import { COUNTDOWN, FW, HERO, JOBS, PANEL, SLIDES, STRIP, TL, imgAt, scanAt } from "./PipeShortsData";
import { SMALL_SANS, TickBadge, boxStyle, pctX, pctY, unit } from "./PipeShortsKit";
import { countdown, insetLeft, seg, trap } from "./PipeShortsMath";
import Slide, { useSlideMove } from "./PipeShortsSlide";

/* Chapter 3 stage: slide 1 under the lens, and its own log. All three log rows are on screen from the start, waiting their
   turn. The panel under them shows what the current step returns: the five image jobs, then the vision text, then the still
   drifting into a five frame clip strip. The three take the panel over with complementary wipes, so it is never empty. */

const ROW_AT = [0.516, 0.522, 0.528] as const;
const rowY = (k: number) => JOBS.y + k * (JOBS.rowH + JOBS.gap);
const STRIP_FRAMES = SHORTS.slides.length;
const STRIP_W = STRIP_FRAMES * STRIP.frameW + (STRIP_FRAMES - 1) * STRIP.gap;
const STRIP_H = STRIP.frameH + STRIP.perf * 2;
const FRAME_MOVES = Array.from({ length: STRIP_FRAMES }, (_, k) => motionValue(k / (STRIP_FRAMES - 1)));
const PERF_ROW = "absolute inset-x-0 bg-surface-2 [background-image:repeating-linear-gradient(to_right,transparent_0_2px,color-mix(in_oklab,var(--color-fg)_55%,transparent)_2px_5px,transparent_5px_8px)]";
const VISION_END = scanAt(0) + TL.scan.dur;
const ZERO = motionValue(0);
const ONE = motionValue(1);

/* ---------- The three log rows ---------- */

type RowProps = { p: MV; k: number; glyph: GlyphName; label: string; fill?: MV; children: ReactNode };

function JobRow({ p, k, glyph, label, fill, children }: RowProps) {
  const on = useSeg(p, ROW_AT[k], ROW_AT[k] + 0.014, easeOutCubic);
  const y = useTransform(on, (v) => `${((1 - v) * 40).toFixed(2)}%`);
  return (
    <motion.div style={{ ...boxStyle(JOBS.x, rowY(k), JOBS.w, JOBS.rowH), opacity: on, y }} className="absolute flex items-center gap-[6px] overflow-hidden rounded-md border border-line-strong bg-surface-2 px-[6px]">
      {fill ? <motion.i aria-hidden style={{ scaleX: fill }} className="absolute inset-y-0 left-0 w-full origin-left bg-accent/20" /> : null}
      <PipeGlyph name={glyph} size={unit(15)} className="relative shrink-0" />
      <span className="relative text-dim">{label}</span>
      <span className="relative ml-auto flex items-center gap-[5px] text-fg">{children}</span>
    </motion.div>
  );
}

/** "queued" until the job starts, then the poll countdown, then "ready" with its check. */
function WaitStatus({ p, from, to }: { p: MV; from: number; to: number }) {
  const text = useTransform(p, (v) => (v < from ? "queued" : v >= to ? "ready" : `wait ${countdown(COUNTDOWN, seg(v, from, to))} s`));
  const pop = useSeg(p, to, to + 0.012);
  return (
    <>
      <motion.span className="tabular-nums">{text}</motion.span>
      <TickBadge pop={pop} size={13} />
    </>
  );
}

function ImageRow({ p }: { p: MV }) {
  const fill = useSeg(p, TL.imgStart, imgAt(0));
  return (
    <JobRow p={p} k={0} glyph={NODE.imagine.glyph} label={NODE.imagine.label} fill={fill}>
      <WaitStatus p={p} from={TL.imgStart} to={imgAt(0)} />
    </JobRow>
  );
}

function VisionRow({ p }: { p: MV }) {
  const text = useTransform(p, (v): string => (v < scanAt(0) ? "queued" : v < VISION_END ? "scanning" : SLIDES[0].read));
  const clip = useTransform(p, (v) => (v < VISION_END ? "none" : insetLeft(seg(v, VISION_END, VISION_END + TL.readDur))));
  return (
    <JobRow p={p} k={1} glyph={NODE.vision.glyph} label={NODE.vision.label}>
      <motion.span style={{ clipPath: clip }}>{text}</motion.span>
    </JobRow>
  );
}

function ClipRow({ p }: { p: MV }) {
  const fill = useSeg(p, TL.clipJob[0], TL.clipJob[1]);
  return (
    <JobRow p={p} k={2} glyph={NODE.clip.glyph} label={NODE.clip.label} fill={fill}>
      <WaitStatus p={p} from={TL.clipJob[0]} to={TL.clipJob[1]} />
    </JobRow>
  );
}

/* ---------- The panel: three pages that take turns ---------- */

/** Clip a full frame layer to the slice [from, to] (0..1) of the panel width. */
const panelClip = (from: number, to: number) => {
  const left = ((PANEL.x + from * PANEL.w) / FW) * 100;
  const right = 100 - ((PANEL.x + to * PANEL.w) / FW) * 100;
  return `inset(0 ${right.toFixed(3)}% 0 ${left.toFixed(3)}%)`;
};

function PanelPage({ from, to, children }: { from: MV; to: MV; children: ReactNode }) {
  const clip = useTransform([from, to], ([a, b]: number[]) => panelClip(a, b));
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

function SwapEdge({ t }: { t: MV }) {
  const left = useTransform(t, (v) => pctX(PANEL.x + v * PANEL.w));
  const opacity = useTransform(t, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);
  return <motion.i aria-hidden style={{ left, opacity, top: pctY(PANEL.y), height: pctY(PANEL.h) }} className="absolute w-[2px] -translate-x-1/2 rounded-full bg-accent" />;
}

/* Page 1: one small job per slide, each with its own wait and its own check. */

const QUEUE_GAP = 4;
const CELL_W = (PANEL.w - QUEUE_GAP * (SLIDES.length - 1)) / SLIDES.length;
const CELL_H = 40;

function QueueCell({ p, i }: { p: MV; i: number }) {
  const at = imgAt(i);
  const fill = useSeg(p, TL.imgStart, at);
  const text = useTransform(p, (v) => (v >= at ? "ready" : `${countdown(COUNTDOWN, seg(v, TL.imgStart, at))} s`));
  const pop = useSeg(p, at, at + 0.012);
  return (
    <div style={boxStyle(PANEL.x + i * (CELL_W + QUEUE_GAP), PANEL.y, CELL_W, CELL_H)} className="absolute overflow-hidden rounded-md border border-line-strong bg-surface-2 px-[5px] py-[4px]">
      <motion.i aria-hidden style={{ scaleX: fill }} className="absolute inset-y-0 left-0 w-full origin-left bg-accent/20" />
      <span className="relative flex items-center justify-between text-mute">
        {String(i + 1).padStart(2, "0")}
        <TickBadge pop={pop} size={11} />
      </span>
      <motion.span className="relative mt-[3px] block tabular-nums text-fg">{text}</motion.span>
    </div>
  );
}

function Queue({ p }: { p: MV }) {
  const on = useSeg(p, ROW_AT[0] + 0.004, ROW_AT[0] + 0.02);
  return (
    <motion.div style={{ opacity: on }} className="absolute inset-0">
      {SLIDES.map((s, i) => (
        <QueueCell key={s.title} p={p} i={i} />
      ))}
      <span style={{ left: pctX(PANEL.x), top: pctY(PANEL.y + CELL_H + 6) }} className="absolute whitespace-nowrap text-mute">
        {`${SLIDES.length} image jobs, ${COUNTDOWN} s wait each`}
      </span>
    </motion.div>
  );
}

/* Page 2: what the vision step handed back for slide 1, split into fields. */

const READ_PARTS = SLIDES[0].read.split(", ");
const FIELDS = [
  ["subject", READ_PARTS[0]],
  ["light", READ_PARTS.slice(1).join(", ")],
] as const;
const FIELD_AT = VISION_END + 0.004;

function Field({ p, k, name, value }: { p: MV; k: number; name: string; value: string }) {
  const t = useSeg(p, FIELD_AT + k * 0.008, FIELD_AT + k * 0.008 + 0.014);
  const clip = useTransform(t, insetLeft);
  return (
    <motion.p style={{ clipPath: clip }} className="mt-[3px] flex gap-[8px]">
      <span className="w-[4.6em] shrink-0 text-mute">{name}</span>
      <span className="text-fg">{value}</span>
    </motion.p>
  );
}

function VisionResult({ p }: { p: MV }) {
  return (
    <div style={boxStyle(PANEL.x, PANEL.y, PANEL.w, 54)} className="absolute overflow-hidden rounded-md border border-line-strong bg-surface-2 px-[6px] py-[4px]">
      <p className="flex items-center gap-[4px] text-mute">
        <PipeGlyph name={NODE.vision.glyph} size={unit(12)} />
        vision result
      </p>
      {FIELDS.map(([name, value], k) => (
        <Field key={name} p={p} k={k} name={name} value={value} />
      ))}
    </div>
  );
}

/* Page 3: the still drifting into five frames of its clip. */

function StripFrame({ k, move }: { k: number; move: MV }) {
  const shown = useTransform(move, (m) => insetLeft(seg(m, k / STRIP_FRAMES, (k + 1) / STRIP_FRAMES)));
  const ring = useTransform(move, (m) => trap(m, k / STRIP_FRAMES, (k + 1) / STRIP_FRAMES, 0.03));
  return (
    <div style={{ left: unit(k * (STRIP.frameW + STRIP.gap)), width: unit(STRIP.frameW), height: unit(STRIP.frameH), top: unit(STRIP.perf) }} className="absolute overflow-hidden rounded-[3px] border border-dashed border-line-strong bg-surface-1">
      <motion.div style={{ clipPath: shown }} className="absolute inset-0">
        <SlideArt kind={0} move={FRAME_MOVES[k]} />
      </motion.div>
      <motion.i aria-hidden style={{ opacity: ring }} className="absolute inset-0 rounded-[3px] border-2 border-accent" />
    </div>
  );
}

function Timecode({ move }: { move: MV }) {
  const text = useTransform(move, (m) => fmtClock(Math.min(SHORTS.clipSeconds, Math.floor(m * SHORTS.clipSeconds + 1e-6))));
  return (
    <div style={{ left: pctX(STRIP.x + STRIP_W + 10), top: pctY(STRIP.y + 4), right: pctX(8) }} className="absolute">
      <motion.span className="t-h3 block text-[length:clamp(20px,calc(var(--u)*22),28px)] leading-none tabular-nums">{text}</motion.span>
      <span className="mt-[4px] block text-mute">of {fmtClock(SHORTS.clipSeconds)}</span>
      <span className="mt-[6px] block text-dim">clip 01</span>
    </div>
  );
}

function Strip({ p }: { p: MV }) {
  const move = useSlideMove(p, 0);
  const head = useTransform(move, (m) => `${(m * 100).toFixed(2)}%`);
  const headOn = useTransform(move, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  return (
    <>
      <div style={{ ...boxStyle(STRIP.x, STRIP.y, STRIP_W, STRIP_H) }} className="absolute">
        <i aria-hidden style={{ height: unit(STRIP.perf) }} className={`${PERF_ROW} top-0`} />
        <i aria-hidden style={{ height: unit(STRIP.perf) }} className={`${PERF_ROW} bottom-0`} />
        {FRAME_MOVES.map((_, k) => (
          <StripFrame key={k} k={k} move={move} />
        ))}
        <motion.i aria-hidden style={{ left: head, opacity: headOn }} className="absolute inset-y-0 z-10 w-[2px] rounded-full bg-accent" />
      </div>
      <Timecode move={move} />
    </>
  );
}

function Panel({ p }: { p: MV }) {
  const a = useSeg(p, TL.panelA[0], TL.panelA[1], easeOutCubic);
  const b = useSeg(p, TL.panelB[0], TL.panelB[1], easeOutCubic);
  return (
    <>
      <PanelPage from={a} to={ONE}>
        <Queue p={p} />
      </PanelPage>
      <PanelPage from={b} to={a}>
        <VisionResult p={p} />
      </PanelPage>
      <PanelPage from={ZERO} to={b}>
        <Strip p={p} />
      </PanelPage>
      <SwapEdge t={a} />
      <SwapEdge t={b} />
    </>
  );
}

/* ---------- The lens on slide 1 ---------- */

function Lens({ p }: { p: MV }) {
  return (
    <div style={boxStyle(HERO.x, HERO.y, HERO.w, HERO.h)} className="absolute overflow-hidden rounded-lg border border-line-strong bg-surface-1">
      <Slide p={p} i={0} hero />
      <span className={`absolute left-[4px] top-[4px] rounded-[3px] bg-surface-1/85 px-[3px] py-[1px] text-fg`}>01</span>
      <span className={`absolute inset-x-0 bottom-0 bg-surface-1/90 px-[5px] py-[4px] font-medium text-fg ${SMALL_SANS}`}>{SLIDES[0].title}</span>
    </div>
  );
}

export default function MotionView({ p }: { p: MV }) {
  return (
    <>
      <Lens p={p} />
      <ImageRow p={p} />
      <VisionRow p={p} />
      <ClipRow p={p} />
      <Panel p={p} />
    </>
  );
}
