"use client";

import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SCHEDULE } from "./PipeKitData";
import AgentView from "./PipeShortsAgent";
import Cards from "./PipeShortsCards";
import {
  BAND, CAPTIONS, CHAPTERS, CLIP_TOTAL, FH, LANES, MEMORY_TOPICS, PLATFORM_LIST, SHARED, SHEET_TEXT, SLIDES, TL,
  cardAt, imgAt, memoryRowAt, perfAt, scanAt, sweepAt, tickAt,
} from "./PipeShortsData";
import { Frame, Layer, pctX, pctY } from "./PipeShortsKit";
import LaneMap from "./PipeShortsMap";
import { seg } from "./PipeShortsMath";
import MotionView from "./PipeShortsMotion";
import ShipView from "./PipeShortsShip";
import ShortsStatus from "./PipeShortsStatus";

/* A second format on the same backbone. Four pages share one frame: the lane map on top, a stage band that wipes between the
   agent, the motion lens and the ship panel, and the card row that carries the five slides through every step. */

const BAND_TOP = (BAND.top / FH) * 100;
const BAND_BOTTOM = ((FH - BAND.bottom) / FH) * 100;
const EDGE_W = 358;

const band = (right: number, left: number) => `inset(${BAND_TOP.toFixed(3)}% ${right.toFixed(2)}% ${BAND_BOTTOM.toFixed(3)}% ${left.toFixed(2)}%)`;

function WipeEdge({ t }: { t: MV }) {
  const left = useTransform(t, (v) => pctX(v * EDGE_W));
  const opacity = useTransform(t, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity, top: pctY(BAND.top), height: pctY(BAND.bottom - BAND.top) }}
      className="absolute z-30 w-[2px] -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

function Stage({ p }: { p: MV }) {
  const w1 = useSeg(p, TL.wipe1[0], TL.wipe1[1], easeInOutCubic);
  const w2 = useSeg(p, TL.wipe2[0], TL.wipe2[1], easeInOutCubic);
  const agentClip = useTransform(w1, (t) => band(0, t * 100));
  const motionClip = useTransform([w1, w2], ([a, b]: number[]) => band((1 - a) * 100, b * 100));
  const shipClip = useTransform(w2, (t) => band((1 - t) * 100, 0));
  return (
    <>
      <Layer style={{ clipPath: agentClip }}>
        <AgentView p={p} />
      </Layer>
      <Layer style={{ clipPath: motionClip }}>
        <MotionView p={p} />
      </Layer>
      <Layer style={{ clipPath: shipClip }}>
        <ShipView p={p} />
      </Layer>
      <WipeEdge t={w1} />
      <WipeEdge t={w2} />
    </>
  );
}

export function PipeShortsVisual({ p }: { p: MV }) {
  return (
    <Frame>
      <LaneMap p={p} />
      <Stage p={p} />
      <Layer>
        <Cards p={p} />
      </Layer>
      <div className="absolute inset-x-0 bottom-0">
        <ShortsStatus p={p} />
      </div>
    </Frame>
  );
}

const countWhere = (n: number, hit: (i: number) => boolean) => Array.from({ length: n }, (_, i) => i).filter(hit).length;

/* Every count below is read off the same window that draws the thing it counts, at the moment that thing starts to show. */
const WRITTEN_FRAC = 0.3;

function readoutAt(v: number) {
  const n = SLIDES.length;
  const seen = (at: (i: number) => number, lag = 0) => countWhere(n, (i) => v >= at(i) + lag);
  if (v < TL.laneB.at) return "long-form lane";
  if (v < TL.sweep.at) return "shorts lane";
  if (v < TL.sheet[0] + 0.008) return `${countWhere(SHARED.length, (k) => v >= sweepAt(k))} of ${LANES.b.length} nodes reused`;
  if (v < TL.idea[0] + 0.008) return SHEET_TEXT;
  if (v < TL.toAgent[0]) return `idea row read at ${SCHEDULE.time}`;
  if (v < TL.memory[0]) return "agent: model warms up";
  if (v < TL.tool[0]) return `memory: ${countWhere(MEMORY_TOPICS.length, (k) => v >= memoryRowAt(k) + TL.memoryRow.tick)}/${MEMORY_TOPICS.length} topics`;
  if (v < TL.wipe1[0]) return `${seen(cardAt, TL.card.dur * WRITTEN_FRAC)}/${n} slides written`;
  if (v < TL.scan.at) return `${seen(imgAt, TL.img.dur * WRITTEN_FRAC)}/${n} images`;
  if (v < TL.clipJob[0]) return `${seen(scanAt, TL.scan.dur)}/${n} read`;
  if (v < TL.wipe2[0]) return `${seen(perfAt, TL.perf.dur)}/${n} clips`;
  if (v < TL.render[0]) return `${CLIP_TOTAL} s of clips`;
  if (v < TL.upload[0]) return `render ${Math.round(seg(v, TL.render[0], TL.render[1]) * 100)}%`;
  if (v < TL.tick.at) return "one upload";
  return `${countWhere(PLATFORM_LIST.length, (k) => v >= tickAt(k) + 0.004)}/${PLATFORM_LIST.length} posted`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutAt);
  return <motion.span>{text}</motion.span>;
}

export default function PipeShortsScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <PipeShortsVisual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
