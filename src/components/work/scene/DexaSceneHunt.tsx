"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutBack, easeOutCubic, type MV } from "./HealthSceneParts";
import {
  BLOCK_LINES,
  FIRST_HIT_SCROLL,
  HOP,
  HUNT_ORDER,
  OP_LINES,
  PAGES,
  STREAM,
  TL,
  cropBox,
  frameBox,
  hopAt,
  type Box,
  type OpLine,
} from "./DexaSceneData";
import { TXT, easeSnap, linear, px, useExit, useKeys, usePing, useSpan, useUid } from "./DexaSceneKit";
import { StreamBadge } from "./DexaSceneIcons";

const SNAPS = [TL.snapA, TL.toC[1], TL.toB[1]] as const;
const LINE_PX = STREAM.lineH;
const HIT_BASE = FIRST_HIT_SCROLL;
const SCROLL_KEYS = [TL.scrollA[0], TL.scrollA[1], TL.toC[0], TL.toC[1], TL.toB[0], TL.toB[1], TL.exit[0]] as const;
const SCROLL_LINES = [0, HIT_BASE, HIT_BASE, HIT_BASE + BLOCK_LINES, HIT_BASE + BLOCK_LINES, HIT_BASE + BLOCK_LINES * 2, HIT_BASE + BLOCK_LINES * 2];
const SCROLL_VALS = SCROLL_LINES.map((n) => n * LINE_PX);
const SCROLL_EASE = [easeInOutCubic, linear, easeInOutCubic, linear, easeInOutCubic, linear];
const GLOW_BASE = 0.14;
const GLOW_PEAK = 0.36;
const PANEL_R = 6;
const TICK_W = 2.5;
const EDGE_FADE = 9;

function OpRow({ line, i }: { line: OpLine; i: number }) {
  const y = STREAM.y + STREAM.pad + i * LINE_PX + STREAM.base;
  return (
    <g>
      <text x={STREAM.x + STREAM.numX} y={y} className={`${TXT} fill-mute/60`}>
        {String(i + 1).padStart(2, "0")}
      </text>
      <text x={STREAM.x + STREAM.textX} y={y} className={`${TXT} ${line.hit ? "fill-fg" : "fill-mute"}`}>
        {line.text}
      </text>
    </g>
  );
}

/* Alpha mask that fades the scrolling lines out at the top and bottom edge of the panel,
   so a line sliding past the border never shows as a hard-cut sliver of glyph. */
function EdgeFade({ id, x, y, width, height }: { id: string; x: number; y: number; width: number; height: number }) {
  const edge = EDGE_FADE / height;
  const stops = [[0, 0], [edge, 1], [1 - edge, 1], [1, 0]] as const;
  return (
    <>
      <linearGradient id={`${id}f`} gradientUnits="userSpaceOnUse" x1={0} y1={y} x2={0} y2={y + height}>
        {stops.map(([offset, alpha]) => (
          <stop key={offset} offset={offset} stopOpacity={alpha} style={{ stopColor: "var(--color-fg)" }} />
        ))}
      </linearGradient>
      <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x} y={y} width={width} height={height} style={{ maskType: "alpha" }}>
        <rect x={x} y={y} width={width} height={height} fill={`url(#${id}f)`} />
      </mask>
    </>
  );
}

export function OpStream({ p }: { p: MV }) {
  const id = useUid();
  const enter = useSpan(p, TL.streamIn, easeOutCubic);
  const { drop: y, fade: opacity } = useExit(p);
  const scroll = useKeys(p, SCROLL_KEYS, SCROLL_VALS, SCROLL_EASE);
  const shift = useTransform(scroll, (v) => -v);
  const ping = usePing(p, SNAPS);
  const glow = useTransform(ping, (v) => GLOW_BASE + (v > 0 ? GLOW_PEAK * (1 - v) : 0));
  const h = STREAM.rows * LINE_PX + STREAM.pad * 2;
  const reveal = useTransform(enter, (v) => v * (h + 2));
  const reticleY = STREAM.y + STREAM.pad + STREAM.hitRow * LINE_PX;
  const panel = { x: STREAM.x, y: STREAM.y, width: STREAM.w, height: h, rx: PANEL_R };
  return (
    <motion.g style={{ y, opacity }}>
      <clipPath id={`${id}r`}>
        <motion.rect x={STREAM.x - 2} y={STREAM.y - 1} width={STREAM.w + 4} height={reveal} />
      </clipPath>
      <g clipPath={`url(#${id}r)`}>
        <rect {...panel} className="fill-surface-1 stroke-line-strong" />
        <clipPath id={id}>
          <rect {...panel} />
        </clipPath>
        <EdgeFade id={id} {...panel} />
        <g clipPath={`url(#${id})`}>
          <g mask={`url(#${id}m)`}>
            <motion.g style={{ y: shift }}>
              {OP_LINES.map((line, i) => (
                <OpRow key={i} line={line} i={i} />
              ))}
            </motion.g>
          </g>
          <motion.rect x={STREAM.x} y={reticleY} width={STREAM.w} height={LINE_PX} style={{ opacity: glow }} className="fill-accent" />
          <rect x={STREAM.x} y={reticleY} width={TICK_W} height={LINE_PX} className="fill-accent" />
        </g>
      </g>
      <StreamBadge p={p} />
    </motion.g>
  );
}

const HOPS = [TL.toC, TL.toB] as const;
const HUNT: readonly { at: number; box: Box }[] = [
  { at: TL.cropIn[0], box: frameBox(PAGES[0]) },
  { at: TL.cropIn[1], box: frameBox(PAGES[0]) },
  { at: TL.snapA, box: cropBox(HUNT_ORDER[0]) },
  { at: TL.toC[0], box: cropBox(HUNT_ORDER[0]) },
  { at: hopAt(TL.toC, HOP.leave), box: cropBox(HUNT_ORDER[0]) },
  { at: TL.toC[1], box: cropBox(HUNT_ORDER[1]) },
  { at: TL.toB[0], box: cropBox(HUNT_ORDER[1]) },
  { at: hopAt(TL.toB, HOP.leave), box: cropBox(HUNT_ORDER[1]) },
  { at: TL.toB[1], box: cropBox(HUNT_ORDER[2]) },
];
const HUNT_KEYS = HUNT.map((k) => k.at);
const HUNT_EASE = [linear, easeSnap, linear, linear, easeSnap, linear, linear, easeSnap];
/* Bracket opacity: 1, then dark for the middle of each hop, then 1 again on the target. */
const HOP_KEYS = HOPS.flatMap((h) => [h[0], hopAt(h, HOP.leave), hopAt(h, HOP.back), h[1]]);
const HOP_VALS = HOPS.flatMap(() => [1, 0, 0, 1]);
const BRACKET = 9;
const PING_GROW = 10;
const STROKE_BASE = 1.5;
const STROKE_LOCK = 1.1;
const PILL = { w: 50, h: 14, lift: 17, text: 6.6 } as const;

function brackets([x, y, w, h]: readonly number[], l: number) {
  const a = Math.min(l, w / 2);
  const b = Math.min(l, h / 2);
  const r = x + w;
  const t = y + h;
  return [
    `M${px(x)} ${px(y + b)}V${px(y)}H${px(x + a)}`,
    `M${px(r - a)} ${px(y)}H${px(r)}V${px(y + b)}`,
    `M${px(r)} ${px(t - b)}V${px(t)}H${px(r - a)}`,
    `M${px(x + a)} ${px(t)}H${px(x)}V${px(t - b)}`,
  ].join(" ");
}

function useHuntBox(p: MV) {
  const x = useKeys(p, HUNT_KEYS, HUNT.map((k) => k.box[0]), HUNT_EASE);
  const y = useKeys(p, HUNT_KEYS, HUNT.map((k) => k.box[1]), HUNT_EASE);
  const w = useKeys(p, HUNT_KEYS, HUNT.map((k) => k.box[2]), HUNT_EASE);
  const h = useKeys(p, HUNT_KEYS, HUNT.map((k) => k.box[3]), HUNT_EASE);
  return { x, y, w, h };
}

function LockPill({ p, y }: { p: MV; y: MV }) {
  const lock = useSpan(p, TL.lock, easeOutBack);
  const solid = useSpan(p, TL.lock);
  const pillY = useTransform(y, (v) => v - PILL.lift);
  const textY = useTransform(y, (v) => v - PILL.text);
  const [bx] = cropBox(HUNT_ORDER[2]);
  return (
    <motion.g style={{ scale: lock, opacity: solid }}>
      <motion.rect x={bx} y={pillY} width={PILL.w} height={PILL.h} rx={3} className="fill-accent" />
      <motion.text x={bx + PILL.w / 2} y={textY} textAnchor="middle" className={`${TXT} fill-fg`}>
        locked
      </motion.text>
    </motion.g>
  );
}

export function CropRect({ p }: { p: MV }) {
  const { x, y, w, h } = useHuntBox(p);
  const lock = useSpan(p, TL.lock, easeOutBack);
  const solid = useSpan(p, TL.lock);
  const appear = useKeys(p, [TL.cropIn[0], TL.cropIn[0] + 0.015, TL.exit[0] + 0.005, TL.exit[1]], [0, 1, 1, 0]);
  const hop = useKeys(p, HOP_KEYS, HOP_VALS);
  const shown = useTransform([appear, hop], ([a, h]: number[]) => a * h);
  const ping = usePing(p, SNAPS);
  const d = useTransform([x, y, w, h], (v: number[]) => brackets(v, BRACKET));
  const fillOp = useTransform(ping, (v) => 0.1 + (v > 0 ? 0.3 * (1 - v) : 0));
  const pingOp = useTransform(ping, (v) => (v > 0 ? 0.7 * (1 - v) : 0));
  const ringX = useTransform([x, ping], ([a, t]: number[]) => a - t * PING_GROW);
  const ringY = useTransform([y, ping], ([a, t]: number[]) => a - t * PING_GROW);
  const ringW = useTransform([w, ping], ([a, t]: number[]) => a + t * PING_GROW * 2);
  const ringH = useTransform([h, ping], ([a, t]: number[]) => a + t * PING_GROW * 2);
  const stroke = useTransform(lock, (v) => STROKE_BASE + v * STROKE_LOCK);

  return (
    <motion.g style={{ opacity: shown }}>
      <motion.rect x={x} y={y} width={w} height={h} style={{ fillOpacity: fillOp }} className="fill-accent" />
      <motion.rect x={x} y={y} width={w} height={h} strokeDasharray="3 3" strokeWidth={0.9} className="fill-none stroke-accent" />
      <motion.rect x={x} y={y} width={w} height={h} style={{ opacity: solid }} strokeWidth={1.4} className="fill-none stroke-accent" />
      <motion.rect x={ringX} y={ringY} width={ringW} height={ringH} rx={3} style={{ opacity: pingOp }} strokeWidth={1} className="fill-none stroke-accent" />
      <motion.path d={d} style={{ strokeWidth: stroke }} strokeLinecap="square" className="fill-none stroke-accent" />
      <LockPill p={p} y={y} />
    </motion.g>
  );
}
