"use client";

import { motion, useTransform } from "framer-motion";
import { useSeg, useWindow, type MV } from "./HealthSceneParts";
import { NODE } from "./PipeKitData";
import { PipeNode } from "./PipeKitNode";
import { clamp01, useKeys } from "./PipeKitMath";
import { BLOCK_SEGS, INFO, PARALLEL_TEXT, TL } from "./PipePublishData";
import { useGeo } from "./PipePublishGeo";
import { MONO_TXT, RollStack } from "./PipePublishKit";
import { uploadAt, uploadPulseAt, upVisAt } from "./PipePublishMath";

/* The upload node: the copy of the video goes in once, chunks of it stream down the wire, a bar of the five script blocks
   fills block by block, a check pops, and the status line rolls from the file name to "uploaded once" to "reused by 2
   posts". */

const SIDE_GAP = "calc(var(--t) * 0.95 + 6px)";

function UpNode({ p }: { p: MV }) {
  const { PT, pctOf } = useGeo();
  const active = useWindow(p, TL.feed[0] + 0.006, TL.fork[1]);
  const done = useSeg(p, TL.done[0], TL.done[1]);
  const pulse = useTransform(p, uploadPulseAt);
  return <PipeNode glyph={NODE.media.glyph} size="var(--t)" at={pctOf(PT.up)} active={active} done={done} pulse={pulse} />;
}

type Seg = (typeof BLOCK_SEGS)[number];

function BarSeg({ seg, level, ok }: { seg: Seg; level: MV; ok: MV }) {
  const fill = useTransform(level, (v) => clamp01((v - seg.from) / (seg.to - seg.from)));
  const tone = `color-mix(in oklab, ${seg.tone} 78%, transparent)`;
  return (
    <span className="relative h-full overflow-hidden rounded-full bg-line-strong" style={{ flexGrow: seg.seconds, flexBasis: 0 }}>
      <motion.i style={{ scaleX: fill, background: tone }} className="absolute inset-0 origin-left" />
      <motion.i style={{ opacity: ok }} className="absolute inset-0 bg-mint" />
    </span>
  );
}

function Bar({ p }: { p: MV }) {
  const level = useTransform(p, uploadAt);
  const ok = useSeg(p, TL.done[0], TL.done[1]);
  const text = useTransform(level, (v) => `${Math.round(v * 100)}%`);
  return (
    <span className="mt-1 flex items-center gap-1.5">
      <span className="flex h-[7px] flex-1 gap-[2px]">
        {BLOCK_SEGS.map((seg) => (
          <BarSeg key={seg.id} seg={seg} level={level} ok={ok} />
        ))}
      </span>
      <motion.span className={`${MONO_TXT} w-[4ch] text-right leading-none tabular-nums text-fg`}>{text}</motion.span>
    </span>
  );
}

function Info({ p }: { p: MV }) {
  const { PT, GUTTER, pctOf } = useGeo();
  const idx = useKeys(p, [TL.roll1[0], TL.roll1[1], TL.roll2[0], TL.roll2[1]], [0, 1, 1, 2]);
  return (
    <div style={{ left: `calc(50% + ${SIDE_GAP})`, right: GUTTER, top: `${pctOf(PT.up)[1]}%` }} className={`${MONO_TXT} absolute -translate-y-1/2 text-dim`}>
      <RollStack idx={idx} lines={INFO} />
      <Bar p={p} />
    </div>
  );
}

function ParallelLabel({ p }: { p: MV }) {
  const { H, PT } = useGeo();
  const midY = ((PT.up[1] + PT.posts[0][1]) / 2 / H) * 100;
  const opacity = useSeg(p, TL.fork[1] - 0.01, TL.fork[1] + 0.02);
  return (
    <motion.span style={{ opacity, top: `${midY}%` }} className={`${MONO_TXT} absolute left-1/2 hidden -translate-x-1/2 -translate-y-1/2 leading-none text-mute @min-[380px]:block`}>
      {PARALLEL_TEXT}
    </motion.span>
  );
}

export default function Upload({ p }: { p: MV }) {
  const { PT, pctOf } = useGeo();
  const fade = useTransform(p, upVisAt);
  return (
    <motion.div style={{ opacity: fade }} className="pointer-events-none absolute inset-0 z-20">
      <UpNode p={p} />
      <span
        style={{ right: `calc(50% + ${SIDE_GAP})`, top: `${pctOf(PT.up)[1]}%` }}
        className={`${MONO_TXT} absolute -translate-y-1/2 text-right leading-none text-fg`}
      >
        {NODE.media.label}
      </span>
      <Info p={p} />
      <ParallelLabel p={p} />
    </motion.div>
  );
}
