"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { lerp } from "./PipeKitMath";
import { Wire, cubicPath, usePathPoint, type WirePath } from "./PipeKitWire";
import { PACKETS, forkVisAt, packetAt, slideAt, upVisAt } from "./PipePublishMath";
import { TL, W, type Geo } from "./PipePublishData";
import { useGeo } from "./PipePublishGeo";
import { pathsOf } from "./PipePublishPaths";
import { THUMB_H, THUMB_W, ThumbArt } from "./PipePublishThumb";

/* Two svg layers on the stage. WiresLayer sits under the sheet, so wires that start on the card vanish under it.
   RidersLayer sits above it and carries the video copies that travel along the wires. */

const RIDER_SMALL = 0.8;
const PACKET_SCALE = 0.22;
const LAYER = "pointer-events-none absolute inset-0 h-full w-full overflow-visible";
const TRAIL_STEP = 0.03;
const TRAIL_FADE = 0.28;
const TRAIL_SHRINK = 0.18;
const EDGE_FADE = 24;
const WIRE_WIDTH = 2;
const DASH = "3 5";

/* Dots that follow the head along a path. They are all driven by the head's own progress, so they meet at the end and
   are gone together when it arrives, and never stay behind on the wire. */
function TrailDot({ path, t, k, r }: { path: WirePath; t: MV; k: number; r: number }) {
  const shifted = useTransform(t, (v) => Math.max(0, v - k * TRAIL_STEP));
  const { x, y } = usePathPoint(path, shifted);
  const opacity = useTransform(t, (v) => Math.max(0, Math.min(1, v * EDGE_FADE, (1 - v) * EDGE_FADE)) * (1 - TRAIL_FADE * k));
  return <motion.circle cx={x} cy={y} r={r * (1 - TRAIL_SHRINK * k)} style={{ opacity }} fill="var(--color-accent)" stroke="var(--color-bg)" strokeWidth={1.3} />;
}

function Trail({ path, t, r = 3.2, dots = 3 }: { path: WirePath; t: MV; r?: number; dots?: number }) {
  return (
    <g>
      {Array.from({ length: dots }, (_, i) => dots - 1 - i).map((k) => (
        <TrailDot key={k} path={path} t={t} k={k} r={r} />
      ))}
    </g>
  );
}

/* Video chunks streaming down the feed wire while the bar fills: small copies of the frame, so the upload carries the picture. */
function Packet({ k, p }: { k: number; p: MV }) {
  const { FEED } = pathsOf(useGeo());
  const t = useTransform(p, (v) => packetAt(v, k));
  const { x, y } = usePathPoint(FEED, t);
  const opacity = useTransform(t, (v) => Math.max(0, Math.min(1, v * EDGE_FADE, (1 - v) * EDGE_FADE)));
  return (
    <motion.g style={{ x, y, opacity }}>
      <g transform={`translate(${-(THUMB_W * PACKET_SCALE) / 2} ${-(THUMB_H * PACKET_SCALE) / 2}) scale(${PACKET_SCALE})`}>
        <ThumbArt />
      </g>
    </motion.g>
  );
}

/* A wire whose end follows a moving node: `d` is rebuilt from the node's position, the overlay draws along it. */
function LiveWire({ d, draw, tone = "accent", dashed = false }: { d: MotionValue<string>; draw: MV; tone?: "accent" | "mint"; dashed?: boolean }) {
  const shown = useTransform(draw, (v) => (v > 0.001 ? 1 : 0));
  return (
    <g>
      {dashed ? <motion.path d={d} fill="none" stroke="var(--color-line-strong)" strokeWidth={WIRE_WIDTH} strokeLinecap="round" strokeDasharray={DASH} /> : null}
      <motion.path d={d} fill="none" stroke={`var(--color-${tone})`} strokeWidth={WIRE_WIDTH} strokeLinecap="round" style={{ pathLength: draw, opacity: shown }} />
    </g>
  );
}

const forkTo = ({ PT }: Geo, i: number, s: number) => cubicPath(PT.up, [PT.posts[i][0], lerp(PT.posts[i][1], PT.low[i][1], s)], { axis: "y" }).d;

function ForkWire({ i, p }: { i: number; p: MV }) {
  const geo = useGeo();
  const draw = useSeg(p, TL.fork[0] + i * 0.004, TL.fork[1] + i * 0.004);
  const ok = useSeg(p, TL.tick[i], TL.tick[i] + 0.02);
  const d = useTransform(p, (v) => forkTo(geo, i, slideAt(v)));
  return (
    <g>
      <LiveWire d={d} draw={draw} dashed />
      <LiveWire d={d} draw={ok} tone="mint" />
    </g>
  );
}

function WriteWire({ i, p }: { i: number; p: MV }) {
  const path = pathsOf(useGeo()).TO_WRITE[i];
  const draw = useSeg(p, TL.write[0] + i * 0.004, TL.write[1]);
  return (
    <g>
      <Wire path={path} draw={draw} dashed />
      <Trail path={path} t={draw} dots={3} />
    </g>
  );
}

function Feed({ p }: { p: MV }) {
  const { FEED } = pathsOf(useGeo());
  const draw = useSeg(p, TL.feed[0], TL.feed[1]);
  return (
    <g>
      <Wire path={FEED} draw={draw} dashed />
      {Array.from({ length: PACKETS }, (_, k) => (
        <Packet key={k} k={k} p={p} />
      ))}
    </g>
  );
}

/* The wire up to the sheet only exists once it starts to draw. The sheet has settled by then, so its end is on the sheet's
   real bottom edge and never floats below it while the last row is still opening. */
function Up({ p }: { p: MV }) {
  const { UP } = pathsOf(useGeo());
  const draw = useSeg(p, TL.up[0], TL.up[1]);
  const ok = useSeg(p, TL.flip[0], TL.flip[1]);
  const born = useSeg(p, TL.up[0] - 0.008, TL.up[0]);
  return (
    <motion.g style={{ opacity: born }}>
      <Wire path={UP} draw={draw} dashed />
      <Trail path={UP} t={draw} dots={3} />
      <Wire path={UP} draw={ok} tone="mint" />
    </motion.g>
  );
}

export function WiresLayer({ p }: { p: MV }) {
  const geo = useGeo();
  const { FORK, TO_WRITE } = pathsOf(geo);
  const feedVis = useTransform(p, upVisAt);
  const forkVis = useTransform(p, forkVisAt);
  const late = useSeg(p, TL.showWrite[0], TL.showWrite[1]);
  const okLate = useSeg(p, TL.flip[0], TL.flip[1]);
  return (
    <svg viewBox={`0 0 ${W} ${geo.H}`} aria-hidden className={`${LAYER} z-10`}>
      <motion.g style={{ opacity: feedVis }}>
        <Feed p={p} />
      </motion.g>
      <motion.g style={{ opacity: forkVis }}>
        {FORK.map((_, i) => (
          <ForkWire key={i} i={i} p={p} />
        ))}
      </motion.g>
      <motion.g style={{ opacity: late }}>
        {TO_WRITE.map((_, i) => (
          <WriteWire key={i} i={i} p={p} />
        ))}
        <Up p={p} />
        {TO_WRITE.map((path, i) => (
          <MintOver key={`m${i}`} path={path} t={okLate} />
        ))}
      </motion.g>
    </svg>
  );
}

function MintOver({ path, t }: { path: WirePath; t: MV }) {
  return <Wire path={path} draw={t} tone="mint" />;
}

/* One copy of the video: the art at the thumbnail's size, centred on the path point, scaled and faded by its own progress.
   At t = 0 it lies exactly on the thumbnail (same size, same place), so the copy leaves the card without a jump. */
function Rider({ path, t, big = 1, small = RIDER_SMALL }: { path: WirePath; t: MV; big?: number; small?: number }) {
  const art = useGeo().THUMB.h / THUMB_H;
  const { x, y } = usePathPoint(path, t);
  const scale = useTransform(t, [0, 0.2, 0.86, 1], [big, small, small, 0.3]);
  const opacity = useTransform(t, [0, 0.03, 0.86, 1], [0, 1, 1, 0]);
  return (
    <motion.g style={{ x, y, scale, opacity }}>
      <g transform={`translate(${-(THUMB_W * art) / 2} ${-(THUMB_H * art) / 2}) scale(${art})`}>
        <ThumbArt />
      </g>
    </motion.g>
  );
}

function TwinRider({ i, p }: { i: number; p: MV }) {
  const { FORK } = pathsOf(useGeo());
  const t = useSeg(p, TL.twin[i][0], TL.twin[i][1], easeInOutCubic);
  return (
    <g>
      <Trail path={FORK[i]} t={t} dots={4} r={2.8} />
      <Rider path={FORK[i]} t={t} big={RIDER_SMALL} small={RIDER_SMALL} />
    </g>
  );
}

export function RidersLayer({ p }: { p: MV }) {
  const geo = useGeo();
  const { FEED, FORK } = pathsOf(geo);
  const t = useSeg(p, TL.ride[0], TL.ride[1], easeInOutCubic);
  return (
    <svg viewBox={`0 0 ${W} ${geo.H}`} aria-hidden className={`${LAYER} z-40`}>
      <Rider path={FEED} t={t} />
      {FORK.map((_, i) => (
        <TwinRider key={i} i={i} p={p} />
      ))}
    </svg>
  );
}
