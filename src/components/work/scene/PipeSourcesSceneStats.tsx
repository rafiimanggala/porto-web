"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { GRAPH_NODES, SCAN } from "./PipeKitData";
import { LIT_AT, TL } from "./PipeSourcesSceneData";
import { printedAt, verdictAt } from "./PipeSourcesSceneRows";
import { FS, U, X, Y } from "./PipeSourcesSceneKit";

/* Two small instruments that stay on screen: the node minimap along the top (how many of the graph's 34 nodes this
   scene has lit) and the row of counters under it (scanned, seen, new, picked). The picked counter appears at the
   moment the story is picked, already at its final value, so it never reads 0 while the caption says one is picked. */

const MAP_LEFT = 104;
const MAP_RIGHT = 350;
const MAP_PITCH = (MAP_RIGHT - MAP_LEFT) / (GRAPH_NODES - 1);
const MAP_TICK_W = 3;

function Tick({ p, i }: { p: MV; i: number }) {
  const at = LIT_AT[i] ?? 2;
  const lit = useSeg(p, at, at + 0.012);
  const height = useTransform(lit, (v) => U(9 + 4 * Math.sin(v * Math.PI)));
  return (
    <motion.span
      aria-hidden
      style={{ left: X(MAP_LEFT + i * MAP_PITCH), top: Y(7), width: X(MAP_TICK_W), height }}
      className="absolute bg-line-strong"
    >
      <motion.i style={{ opacity: lit }} className="absolute inset-0 bg-accent" />
    </motion.span>
  );
}

export function Minimap({ p }: { p: MV }) {
  const text = useTransform(p, (v) => `${LIT_AT.filter((a) => v >= a).length} / ${GRAPH_NODES} nodes`);
  return (
    <div aria-hidden className="absolute inset-0 z-10">
      <motion.span style={{ left: X(10), top: Y(6), fontSize: FS }} className={`${MONO} absolute whitespace-nowrap leading-none text-dim`}>
        {text}
      </motion.span>
      {Array.from({ length: GRAPH_NODES }, (_, i) => (
        <Tick key={i} p={p} i={i} />
      ))}
    </div>
  );
}

const SLOT_W = 64;
const SLOT_LEFT = 90;
const SLOT_TOP = 30;

type SlotProps = { p: MV; index: number; label: string; value: MV; at: number; tone: string };

function Slot({ p, index, label, value, at, tone }: SlotProps) {
  const opacity = useSeg(p, at, at + 0.02);
  const text = useTransform(value, (v) => String(Math.round(v)));
  return (
    <motion.div
      style={{ opacity, left: X(SLOT_LEFT + index * SLOT_W), top: Y(SLOT_TOP), width: X(SLOT_W - 4), paddingLeft: U(6) }}
      className="absolute border-l border-line-strong"
    >
      <motion.span style={{ fontSize: U(22) }} className="t-hero block leading-none">
        {text}
      </motion.span>
      <span style={{ fontSize: FS }} className={`${MONO} mt-[3px] block whitespace-nowrap leading-none ${tone}`}>
        {label}
      </span>
    </motion.div>
  );
}

export function Counters({ p }: { p: MV }) {
  const scanned = useTransform(p, (v) => printedAt(v));
  const seen = useTransform(p, (v) => verdictAt(v).seen);
  const fresh = useTransform(p, (v) => verdictAt(v).fresh);
  const picked = useTransform(p, (v): number => (v >= TL.cardSwap[0] ? SCAN.picked : 0));
  return (
    <div aria-hidden className="absolute inset-0 z-10">
      <Slot p={p} index={0} label="scanned" value={scanned} at={TL.printStart[0] - 0.008} tone="text-dim" />
      <Slot p={p} index={1} label="seen" value={seen} at={TL.scanTag[0]} tone="text-rose" />
      <Slot p={p} index={2} label="new" value={fresh} at={TL.scanTag[0]} tone="text-mint" />
      <Slot p={p} index={3} label="picked" value={picked} at={TL.cardSwap[0]} tone="text-fg" />
    </div>
  );
}
