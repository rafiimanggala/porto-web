"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { segAt, useSpan } from "./PipeKitMath";
import { PipeNode } from "./PipeKitNode";
import { Pulse, Wire, linePath } from "./PipeKitWire";
import {
  CHAIN,
  CHAIN_X,
  GHOST,
  GHOST_IN,
  SEEN_TOTAL,
  TILE,
  TILE_Y,
  TL,
} from "./PipeSourcesSceneData";
import { MERGE_PER_COL, ROW_COUNT, SW, type Layout } from "./PipeSourcesSceneLayout";
import { FS, LH, TAG_FS, TILE_SIZE, U, X, Y, pctOf, useLy } from "./PipeSourcesSceneKit";
import { rowsUnderScan, sweepY } from "./PipeSourcesSceneRows";

/* Chapters 3 and 4: the six tiles that work on the list, the sweep that prints the merged list, the scan line that
   checks every row against what was used before, and the SEEN stamp. */

const WIRES = CHAIN.map((_, i) => (i === 0 ? null : linePath([CHAIN_X[i - 1], TILE_Y], [CHAIN_X[i], TILE_Y])));
const EDGE = 12;

const ghostAt = (v: number) => GHOST * segAt(v, GHOST_IN[0], GHOST_IN[1]);

function ChainWire({ p, i }: { p: MV; i: number }) {
  const def = CHAIN[i];
  const path = WIRES[i];
  const wire = def.wire ?? [0, 1];
  const draw = useSeg(p, wire[0], wire[1], easeInOutCubic);
  const opacity = useTransform(p, (v) => Math.max(ghostAt(v), segAt(v, wire[0] - 0.02, wire[0])));
  if (!path) return null;
  return (
    <motion.g style={{ opacity }}>
      <Wire path={path} draw={draw} />
      <Pulse path={path} progress={draw} trail={1} />
    </motion.g>
  );
}

export function ChainWires({ p }: { p: MV }) {
  return (
    <>
      {CHAIN.map((_, i) => (
        <ChainWire key={i} p={p} i={i} />
      ))}
    </>
  );
}

/* The tile label is drawn here rather than by the node, so it can be larger than the node's own 10px and stay readable. */
function TileLabel({ text, x, active }: { text: string; x: number; active: MV }) {
  return (
    <span
      style={{ left: X(x), top: `calc(${Y(TILE_Y + TILE / 2)} + 5px)`, fontSize: TAG_FS }}
      className={`${MONO} pointer-events-none absolute -translate-x-1/2 whitespace-nowrap leading-none`}
    >
      <span className="text-dim">{text}</span>
      <motion.span style={{ opacity: active }} className="absolute inset-0 text-fg">
        {text}
      </motion.span>
    </span>
  );
}

function ChainTile({ p, i }: { p: MV; i: number }) {
  const ly = useLy();
  const def = CHAIN[i];
  const [a, b] = def.act;
  const active = useSpan(p, a, b, 0.01);
  const done = useSeg(p, b, b + 0.014);
  const pulse = useSeg(p, a - 0.012, a + 0.02);
  const opacity = useTransform(p, (v) => (i === 0 ? segAt(v, TL.mergeTile[0], TL.mergeTile[1]) : Math.max(ghostAt(v), segAt(v, a - 0.03, a))));
  return (
    <motion.div aria-hidden style={{ opacity }} className="absolute inset-0 z-20">
      <PipeNode glyph={def.glyph} size={TILE_SIZE(TILE)} at={pctOf(ly, CHAIN_X[i], TILE_Y)} active={active} done={done} pulse={pulse} />
      <TileLabel text={def.label} x={CHAIN_X[i]} active={active} />
    </motion.div>
  );
}

export function ChainTiles({ p }: { p: MV }) {
  return (
    <>
      {CHAIN.map((_, i) => (
        <ChainTile key={i} p={p} i={i} />
      ))}
    </>
  );
}

/* The line that prints the merged list: rows above it are already in the new order, rows below it are still in their
   feeds. */
export function MergeSweep({ p }: { p: MV }) {
  const ly = useLy();
  const top = useTransform(p, (v) => Y(Math.min(ly.sweepEnd, sweepY(ly, v + TL.mergeDur / 2))));
  const opacity = useTransform(p, [TL.merge[0] - 0.006, TL.merge[0], TL.merge[1], TL.merge[1] + 0.012], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ top, opacity, left: X(EDGE), width: X(SW - 2 * EDGE) }} className="pointer-events-none absolute z-30">
      <i style={{ height: U(14), top: U(-14) }} className="absolute inset-x-0 bg-accent/10" />
      <i style={{ height: U(2), top: U(-1) }} className="absolute inset-x-0 bg-accent" />
    </motion.div>
  );
}

const lineY = (ly: Layout, v: number) => ly.merge.top + segAt(v, TL.scan[0], TL.scan[1]) * MERGE_PER_COL * ly.merge.pitch;

/* A dot at one end of the scan line: mint over a new row, rose over an already used one. */
function VerdictDot({ p, side }: { p: MV; side: 0 | 1 }) {
  const isNew = useTransform(p, (v) => (rowsUnderScan(v)?.[side]?.fresh ? 1 : 0));
  const isSeen = useTransform(isNew, (n) => 1 - n);
  const at = side === 0 ? { left: U(-9) } : { right: U(-9) };
  return (
    <span style={{ ...at, width: U(7), height: U(7) }} className="absolute top-1/2 -translate-y-1/2">
      <motion.i style={{ opacity: isSeen }} className="absolute inset-0 rounded-full bg-rose" />
      <motion.i style={{ opacity: isNew }} className="absolute inset-0 rounded-full bg-mint" />
    </span>
  );
}

export function ScanLine({ p }: { p: MV }) {
  const ly = useLy();
  const top = useTransform(p, (v) => Y(lineY(ly, v)));
  const opacity = useTransform(p, [TL.scanTag[0], TL.scanTag[0] + 0.008, TL.scan[1] - 0.008, TL.scan[1] + 0.002], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ top, opacity, left: X(EDGE + 2), width: X(SW - 2 * EDGE - 4) }} className="pointer-events-none absolute z-30">
      <i style={{ height: U(14), top: U(-14) }} className="absolute inset-x-0 bg-accent/15" />
      <i style={{ height: U(2), top: U(-1) }} className="absolute inset-x-0 bg-accent" />
      <VerdictDot p={p} side={0} />
      <VerdictDot p={p} side={1} />
    </motion.div>
  );
}

export function ListLabel({ p }: { p: MV }) {
  const opacity = useTransform(p, [...TL.listLabel], [0, 1, 1, 0]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, top: Y(155), fontSize: FS, lineHeight: LH }}
      className={`${MONO} absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-dim`}
    >
      {ROW_COUNT} items, one list
    </motion.span>
  );
}

export function Stamp({ p }: { p: MV }) {
  const ly = useLy();
  const land = useSeg(p, TL.stamp[0], TL.stamp[1], easeOutBack);
  const opacity = useTransform(p, [TL.stamp[0], TL.stamp[0] + 0.005, TL.stampOut[0], TL.stampOut[1]], [0, 1, 1, 0]);
  const scale = useTransform(land, (t) => 1.7 - 0.7 * t);
  return (
    <motion.div
      aria-hidden
      style={{ opacity, scale, rotate: -8, left: "50%", top: Y(ly.stampY) }}
      className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
    >
      <div style={{ padding: `${U(5)} ${U(12)}` }} className="rounded-md border-2 border-rose bg-surface-1 text-center">
        <span style={{ fontSize: U(20) }} className={`${MONO} block font-bold uppercase leading-none tracking-[0.2em] text-rose`}>
          seen
        </span>
        <span style={{ fontSize: FS }} className={`${MONO} mt-[4px] block whitespace-nowrap leading-none text-rose`}>
          {SEEN_TOTAL} already used
        </span>
      </div>
    </motion.div>
  );
}
