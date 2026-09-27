"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { FEEDS, NODE } from "./PipeKitData";
import { useSpan } from "./PipeKitMath";
import { PipeNode } from "./PipeKitNode";
import { Pulse, Wire, polyPath, type Pt } from "./PipeKitWire";
import { FEED_COLOR, RAIL_Y, SCHED, TILE, TILE_Y, TL, type FeedIdx } from "./PipeSourcesSceneData";
import { COL_W, COL_X, SW } from "./PipeSourcesSceneLayout";
import { FS, TILE_SIZE, U, X, Y, pctOf, useLy } from "./PipeSourcesSceneKit";
import { printedAt } from "./PipeSourcesSceneRows";

/* Chapter 2: the schedule tile heads the pipeline, one wire fans out to three feed tiles at the same moment, and each
   feed prints its own counter. Before chapter 3 the tiles, their labels and the wire fade out completely. */

const HALF = TILE / 2;
const LABEL_Y = 140;
const COMB = COL_X.map((x) => {
  const pts: Pt[] = [[SCHED[0], SCHED[1] + HALF], [SCHED[0], RAIL_Y], [x, RAIL_Y], [x, TILE_Y - HALF]];
  return polyPath(pts, 8);
});

const printEnd = (f: FeedIdx) => TL.printStart[f] + (FEEDS[f].items - 1) * TL.printStep + TL.printDur;

export function CombWires({ p }: { p: MV }) {
  const draw = useSeg(p, TL.rail[0], TL.rail[1], easeInOutCubic);
  const fade = useTransform(p, [TL.rail[0] - 0.012, TL.rail[0], TL.labelOut[0], TL.labelOut[1]], [0, 1, 1, 0]);
  return (
    <motion.g style={{ opacity: fade }}>
      {COMB.map((path, c) => (
        <Wire key={c} path={path} draw={draw} />
      ))}
      {COMB.map((path, c) => (
        <Pulse key={c} path={path} progress={draw} trail={2} />
      ))}
    </motion.g>
  );
}

export function ScheduleTile({ p }: { p: MV }) {
  const ly = useLy();
  const opacity = useSeg(p, TL.tileIn[0], TL.tileIn[1]);
  const done = useSeg(p, TL.rail[1], TL.rail[1] + 0.016);
  const pulse = useSeg(p, TL.rail[0] - 0.01, TL.rail[1]);
  return (
    <motion.div aria-hidden style={{ opacity }} className="absolute inset-0 z-20">
      <PipeNode glyph={NODE.schedule.glyph} size={TILE_SIZE(TILE)} at={pctOf(ly, SCHED[0], SCHED[1])} done={done} pulse={pulse} />
      <span style={{ left: X(SCHED[0] + HALF + 6), top: Y(SCHED[1]), fontSize: FS }} className={`${MONO} absolute -translate-y-1/2 whitespace-nowrap text-dim`}>
        06:00
      </span>
    </motion.div>
  );
}

function FeedTile({ p, f }: { p: MV; f: FeedIdx }) {
  const ly = useLy();
  const appear = useSeg(p, TL.feedIn[0], TL.feedIn[0] + 0.012);
  const out = useSeg(p, TL.labelOut[0], TL.labelOut[1]);
  const opacity = useTransform([appear, out], ([a, o]: number[]) => a * (1 - o));
  const scale = useTransform(out, (o) => 1 - 0.12 * o);
  const active = useSpan(p, TL.printStart[f], printEnd(f), 0.01);
  const done = useSeg(p, printEnd(f), printEnd(f) + 0.014);
  const pulse = useSeg(p, TL.rail[1] - 0.012, TL.feedIn[1] + 0.016);
  return (
    <motion.div aria-hidden style={{ opacity, scale, originX: COL_X[f] / SW, originY: TILE_Y / ly.sh }} className="absolute inset-0 z-20">
      <PipeNode glyph={NODE.feed.glyph} size={TILE_SIZE(TILE)} at={pctOf(ly, COL_X[f], TILE_Y)} active={active} done={done} pulse={pulse} />
    </motion.div>
  );
}

function FeedLabel({ p, f }: { p: MV; f: FeedIdx }) {
  const feed = FEEDS[f];
  const opacity = useTransform(p, [TL.feedIn[0] + 0.006, TL.feedIn[1], TL.labelOut[0], TL.labelOut[1]], [0, 1, 1, 0]);
  const count = useTransform(p, (v) => {
    const n = printedAt(v, f);
    return `${n} ${n === 1 ? "item" : "items"}`;
  });
  return (
    <motion.div
      aria-hidden
      style={{ opacity, left: X(COL_X[f] - COL_W / 2 - 4), top: Y(LABEL_Y), width: X(COL_W + 8), fontSize: FS, lineHeight: U(12) }}
      className={`${MONO} absolute z-20 text-center`}
    >
      <span className="block whitespace-nowrap tracking-[-0.03em] text-fg @max-[430px]:tracking-[-0.07em]">{feed.label}</span>
      <span className="flex items-center justify-center gap-[5px] whitespace-nowrap text-dim">
        <i className="inline-block h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: FEED_COLOR[f] }} />
        <motion.span>{count}</motion.span>
      </span>
    </motion.div>
  );
}

export function FeedTiles({ p }: { p: MV }) {
  return (
    <>
      {FEEDS.map((feed, f) => (
        <FeedTile key={feed.id} p={p} f={f as FeedIdx} />
      ))}
      {FEEDS.map((feed, f) => (
        <FeedLabel key={feed.id} p={p} f={f as FeedIdx} />
      ))}
    </>
  );
}
