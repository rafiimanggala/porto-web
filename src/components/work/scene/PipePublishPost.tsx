"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutBack, useSeg, useWindow, type MV } from "./HealthSceneParts";
import { PipeNode } from "./PipeKitNode";
import { clamp01, lerp } from "./PipeKitMath";
import { POSTS, TL } from "./PipePublishData";
import { useGeo } from "./PipePublishGeo";
import { CHIP_TXT, NodeLabel } from "./PipePublishKit";
import { slideAt } from "./PipePublishMath";
import PostBody from "./PipePublishPostBody";

/* A posting node with its mini post. After the tick the post folds away and the node slides down, keeping only its post id.
   Both nodes drop together, so they stay level while the wires follow them. */

const TICK_SPAN = 0.02;
const RIPPLE_SPAN = 0.045;
/* Space between a node tile and its id chip: 3px on a phone stage, up to 8px on a wide one, so the two chips keep a gap. */
const CHIP_GAP = "calc(var(--t) / 2 + clamp(3px, calc(1.83cqw - 3.1px), 8px))";

function Tile({ i, p }: { i: number; p: MV }) {
  const { H, PT, xPct } = useGeo();
  const post = POSTS[i];
  const top = useTransform(p, (v) => `${((lerp(PT.posts[i][1], PT.low[i][1], slideAt(v)) / H) * 100).toFixed(3)}%`);
  const active = useWindow(p, TL.fork[0], TL.tick[i] + 0.012);
  const done = useSeg(p, TL.tick[i], TL.tick[i] + TICK_SPAN);
  const pulse = useSeg(p, TL.tick[i], TL.tick[i] + RIPPLE_SPAN);
  return (
    <motion.div style={{ left: xPct(PT.posts[i][0]), top, x: "-50%", y: "-50%" }} className="absolute z-50">
      <PipeNode glyph={post.node.glyph} size="var(--t)" active={active} done={done} pulse={pulse} />
      <NodeLabel text={post.node.label} active={active} />
    </motion.div>
  );
}

function IdChip({ i, p }: { i: number; p: MV }) {
  const { H, PT, xPct } = useGeo();
  const t = useSeg(p, TL.chips[i][0], TL.chips[i][1], easeOutBack);
  const opacity = useTransform(t, (v) => clamp01(v * 2));
  const scale = useTransform(t, (v) => Math.min(1, v));
  const inward = i === 0 ? { left: `calc(${xPct(PT.low[i][0])} + ${CHIP_GAP})` } : { right: `calc(100% - ${xPct(PT.low[i][0])} + ${CHIP_GAP})` };
  return (
    <motion.span
      style={{ ...inward, top: `${(PT.low[i][1] / H) * 100}%`, y: "-50%", scale, opacity }}
      className={`${CHIP_TXT} absolute z-50 whitespace-nowrap rounded-[5px] border border-line-strong bg-surface-2 px-1 py-[3px] leading-none text-fg ${i === 0 ? "origin-left" : "origin-right"}`}
    >
      {POSTS[i].id}
    </motion.span>
  );
}

export default function PostColumn({ i, p }: { i: number; p: MV }) {
  return (
    <>
      <PostBody i={i} p={p} />
      <Tile i={i} p={p} />
      <IdChip i={i} p={p} />
    </>
  );
}
