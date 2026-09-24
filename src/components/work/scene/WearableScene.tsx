"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import WearableSceneShell from "./WearableSceneShell";
import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  BASELINE,
  CAPTIONS,
  CHIPS,
  CH,
  CURSOR_SCAN,
  NIGHTS,
  SCORE,
  SLOT,
  STAGE_H,
  STAGE_W,
  T,
  VITALS,
} from "./WearableSceneData";
import { SwapEdge, clamp01, lerp, stageBox } from "./WearableSceneKit";
import { DeviceChip, DeviceLink, HubCaption, HubNode, HubRipple, LogPane, Packet, ReadinessTag } from "./WearableSceneParts";
import { CalloutPane, LeaderLine, StatsPane, TimelinePanel } from "./WearableSceneTimeline";
import { FeedLines, FeedPackets, Legend, LinkLabel, ScoreNumeral, ThumbCaption } from "./WearableSceneFeed";
import { HubSync } from "./WearableSceneIcons";

/* Wearable scene: connect, stream thirty nights, notice the dip, feed the vitals domain. */

const STAGE_FIT = "min(100cqw, 90cqh)";
const linear = (t: number) => t;

const CURSOR_SEGS = [
  { a: T.sweep[0], b: T.sweep[1], from: 0, to: 1, ease: linear },
  { a: T.rewind[0], b: T.rewind[1], from: 1, to: CURSOR_SCAN.from, ease: easeInOutCubic },
  { a: T.scan[0], b: T.scan[1], from: CURSOR_SCAN.from, to: CURSOR_SCAN.to, ease: linear },
  { a: T.cursorEnd[0], b: T.cursorEnd[1], from: CURSOR_SCAN.to, to: 1, ease: easeInOutCubic },
] as const;

const cursorAt = (v: number) =>
  CURSOR_SEGS.reduce((c, s) => (v >= s.a ? lerp(s.from, s.to, s.ease(clamp01((v - s.a) / (s.b - s.a)))) : c), 0);

const nightOf = (c: number) => Math.min(NIGHTS - 1, Math.max(0, Math.floor(c * NIGHTS)));

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ containerType: "size" }}>
      <div className="relative" style={{ width: STAGE_FIT, aspectRatio: `${STAGE_W} / ${STAGE_H}`, containerType: "inline-size" }}>
        {children}
      </div>
    </div>
  );
}

function useSwap(p: MV, range: readonly [number, number]) {
  const front = useSeg(p, range[0], range[1], easeInOutCubic);
  const t = useSeg(p, range[0], range[1]);
  return { front, t };
}

function Slot({ p, night, statNight }: { p: MV; night: MV; statNight: MV }) {
  const log = useSwap(p, T.slotTiles);
  const alert = useSwap(p, T.slotAlert);
  const exit = useSwap(p, T.slotExit);
  return (
    <div style={stageBox(SLOT)} className="absolute">
      <LogPane p={p} outF={log.front} />
      <StatsPane night={statNight} inF={log.front} outF={alert.front} />
      <CalloutPane p={p} night={night} inF={alert.front} outF={exit.front} />
      <SwapEdge front={log.front} t={log.t} />
      <SwapEdge front={alert.front} t={alert.t} />
      <SwapEdge front={exit.front} t={exit.t} />
    </div>
  );
}

function Visual({ p }: { p: MV }) {
  const cur = useTransform(p, cursorAt);
  const night = useTransform(cur, nightOf);
  const sweep = useSeg(p, T.sweep[0], T.sweep[1]);
  const statNight = useTransform(sweep, nightOf);
  const exit = useSeg(p, T.slotExit[0], T.slotExit[1], easeInOutCubic);
  return (
    <Stage>
      <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {Array.from({ length: CHIPS.length }, (_, i) => (
          <DeviceLink key={i} p={p} i={i} />
        ))}
        <FeedLines p={p} />
      </svg>
      <HubCaption p={p} />
      {Array.from({ length: CHIPS.length }, (_, i) => (
        <HubRipple key={i} p={p} i={i} />
      ))}
      {Array.from({ length: CHIPS.length * 2 }, (_, k) => (
        <Packet key={k} p={p} i={k % CHIPS.length} k={Math.floor(k / CHIPS.length)} />
      ))}
      {Array.from({ length: CHIPS.length }, (_, i) => (
        <DeviceChip key={i} p={p} i={i} />
      ))}
      <TimelinePanel p={p} cur={cur} night={night} />
      <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <LeaderLine p={p} exit={exit} />
      </svg>
      <Slot p={p} night={night} statNight={statNight} />
      <FeedPackets p={p} />
      <LinkLabel p={p} />
      <Legend p={p} />
      <ScoreNumeral p={p} />
      <ThumbCaption p={p} />
      <ReadinessTag p={p} />
      <HubNode p={p} night={night} />
      <HubSync p={p} />
    </Stage>
  );
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, (v) => {
    const n = nightOf(cursorAt(v)) + 1;
    if (v < T.chipMove[0]) return "linking devices";
    if (v < T.sweep[0]) return "opening timeline";
    if (v < T.rewind[0]) return `night ${n}/${NIGHTS}`;
    if (v < T.slotExit[0]) return `baseline ${BASELINE} ms`;
    return v < T.land[1] ? "vitals feed" : `vitals ${VITALS}, score ${SCORE}`;
  });
  return <motion.span>{text}</motion.span>;
}

export default function WearableScene() {
  return (
    <WearableSceneShell
      captions={CAPTIONS}
      chapters={CH}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[480svh] sm:h-[520svh]"
      stillAt={1}
    />
  );
}
