"use client";

import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { IMAGE_JOBS, RENDER, ROW_ID, SCRIPT, fmtClock, jobLabel } from "./PipeKitData";
import { StatusStrip } from "./PipeKitStatus";
import { AUDIO_TEXT, CAPTIONS, CHAPTERS, EDGE, FILE_NAME, STRIP, TL } from "./PipeRenderData";
import Done from "./PipeRenderDone";
import { chipSeenAt } from "./PipeRenderFlight";
import Job from "./PipeRenderJob";
import { Frame, Layer, boxStyle, pctY } from "./PipeRenderKit";
import Loop from "./PipeRenderLoop";
import { IMG, imagePolls, playSeconds, readyCount, renderPct, renderReadyAt } from "./PipeRenderMath";
import Slots from "./PipeRenderSlots";
import Timeline, { Playhead } from "./PipeRenderTimeline";

/* Images as background jobs, the poll loop, the render, the saved video. The loop, the job panel and the phone share one
   frame: the loop and panel are wiped away by the phone and file card with an accent edge, the timeline stays as the source. */

const STATUS_AT = [-1, -1, -1, TL.status, 2] as const;
const STATUS_BLEND = 0.016;
const WIPE_TOP = 128;
const WIPE_HEIGHT = STRIP.y - WIPE_TOP - 4;

function Stage({ p }: { p: MV }) {
  const wipe = useSeg(p, TL.wipe[0], TL.wipe[1], easeInOutCubic);
  const oldClip = useTransform(wipe, (t) => (t <= 0.001 ? "none" : `inset(0 0 0 ${(t * 100).toFixed(2)}%)`));
  const newClip = useTransform(wipe, (t) => `inset(0 ${(100 - t * 100).toFixed(2)}% 0 0)`);
  const edge = useTransform(wipe, (t) => `${(t * 100).toFixed(2)}%`);
  const edgeOn = useTransform(wipe, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const dim = useTransform(p, [TL.dim[0], TL.dim[1]], [1, 0.55]);
  return (
    <>
      <Layer style={{ opacity: dim }}>
        <Timeline p={p} />
      </Layer>
      <Layer style={{ clipPath: oldClip }}>
        <Loop p={p} />
        <Job p={p} />
      </Layer>
      <Layer style={{ opacity: dim }}>
        <Slots p={p} />
      </Layer>
      <Playhead p={p} />
      <Layer style={{ clipPath: newClip }}>
        <Done p={p} />
      </Layer>
      <motion.i
        aria-hidden
        style={{ left: edge, opacity: edgeOn, top: pctY(WIPE_TOP), height: pctY(WIPE_HEIGHT) }}
        className="absolute z-30 w-[2px] -translate-x-1/2 rounded-full bg-accent"
      />
    </>
  );
}

export function PipeRenderVisual({ p }: { p: MV }) {
  return (
    <Frame>
      <Stage p={p} />
      <div className="absolute" style={boxStyle(EDGE, STRIP.y, STRIP.w, STRIP.h)}>
        <StatusStrip p={p} statusAt={STATUS_AT} blend={STATUS_BLEND} />
      </div>
    </Frame>
  );
}

function readoutAt(v: number) {
  if (v < IMG.r0) return `${IMAGE_JOBS.filter((_, i) => v >= chipSeenAt(i)).length}/${IMAGE_JOBS.length} jobs started`;
  if (v < TL.morph.from) return `poll ${imagePolls(v)}, ${readyCount(v)}/${IMAGE_JOBS.length} ready`;
  if (v < TL.send[0]) return `${IMAGE_JOBS.length} clips, ${AUDIO_TEXT} audio`;
  if (v < renderReadyAt) return `${jobLabel(RENDER.jobId)}, ${renderPct(v)}%`;
  if (v < TL.play[0]) return `${FILE_NAME} ready`;
  if (v < TL.play[1]) return `${fmtClock(playSeconds(v))} / ${fmtClock(SCRIPT.seconds)}`;
  if (v < TL.status) return `writing ${ROW_ID}`;
  return `saved to ${ROW_ID}`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutAt);
  return <motion.span>{text}</motion.span>;
}

export default function PipeRenderScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <PipeRenderVisual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
