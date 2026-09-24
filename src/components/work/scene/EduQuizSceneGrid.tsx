"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, easeOutExpo, useSeg, type MV } from "./HealthSceneParts";
import {
  CELL_POINTS,
  GRID_H,
  GRID_W,
  N,
  Q43,
  RING_POINTS,
  STATUS,
  STATUSES,
  STATUS_COLOR,
  STATUS_FILL,
  T,
  cellX,
  cellY,
  type Status,
} from "./EduQuizSceneData";
import { bell, clamp01, flightAt, keyframes, lerp, segAt, snapKeys } from "./EduQuizSceneKit";

/* The honeycomb: about 120 hexagon cells that wave in behind the scan line, a
   pulse per status group, a spotlight on the flagged ones, and a cursor ring
   that jumps between cells. All of it is read from the progress `p`. */

const POP_LEN = 0.014;
const SPOT_XS = [T.spotOn[0], T.spotOn[1], T.spotOff[0], T.spotOff[1]];
const SPOT_YS = [0, 1, 1, 0];
const CELL_STROKE = 0.6;

export const spotAt = (v: number) => keyframes(v, SPOT_XS, SPOT_YS);
const groupStart = (s: Status) => T.group.start + STATUSES.indexOf(s) * T.group.step;
export const groupHit = (v: number, s: Status) => bell((v - groupStart(s)) / T.group.len);

const popStart = (i: number) =>
  T.scan[0] + (T.scan[1] - T.scan[0]) * ((cellY(i) - 6) / GRID_H) + (cellX(i) / GRID_W) * 0.004;

function cellScale(v: number, i: number) {
  const enter = segAt(v, popStart(i), popStart(i) + POP_LEN, easeOutBack);
  const lift = 0.14 * groupHit(v, STATUS[i]) + (STATUS[i] === "flagged" ? 0.1 * spotAt(v) : 0);
  return lerp(0.25, 1, enter) * (1 + lift);
}

function cellOpacity(v: number, i: number) {
  const seen = clamp01(segAt(v, popStart(i), popStart(i) + POP_LEN * 0.7));
  return seen * (STATUS[i] === "flagged" ? 1 : 1 - 0.7 * spotAt(v));
}

const CELL_ORIGIN = { transformBox: "fill-box", transformOrigin: "center" } as const;

function StatusHex({ s, opacity }: { s: Status; opacity?: MV }) {
  return (
    <motion.polygon
      points={CELL_POINTS}
      style={opacity ? { opacity } : undefined}
      fill={STATUS_COLOR[s]}
      fillOpacity={STATUS_FILL[s]}
      stroke={STATUS_COLOR[s]}
      strokeOpacity={0.85}
      strokeWidth={CELL_STROKE + 0.15}
      strokeLinejoin="round"
    />
  );
}

/* The one question that turns from draft to reviewed at the end of the scene. */
function ReviewedHex({ p }: { p: MV }) {
  const flip = useSeg(p, T.flip[0], T.flip[1]);
  const draft = useTransform(flip, (f) => 1 - f);
  return (
    <>
      <StatusHex s="draft" opacity={draft} />
      <StatusHex s="reviewed" opacity={flip} />
    </>
  );
}

function Cell({ p, i }: { p: MV; i: number }) {
  const scale = useTransform(p, (v) => cellScale(v, i));
  const opacity = useTransform(p, (v) => cellOpacity(v, i));
  return (
    <g transform={`translate(${cellX(i).toFixed(3)} ${cellY(i).toFixed(3)})`}>
      <motion.g style={{ scale, opacity, ...CELL_ORIGIN }}>
        <polygon points={CELL_POINTS} fill="var(--color-surface-2)" stroke="var(--color-line-strong)" strokeWidth={CELL_STROKE} strokeLinejoin="round" />
        {i === Q43 ? <ReviewedHex p={p} /> : <StatusHex s={STATUS[i]} />}
      </motion.g>
    </g>
  );
}

const JUMP_X = T.jumpIdx.map(cellX);
const JUMP_Y = T.jumpIdx.map(cellY);
const TRAILS = [0, 1, 2, 3];

/* Accent line from the cell the cursor left to the cell it lands on. */
function Trail({ p, j }: { p: MV; j: number }) {
  const a = T.jumpT[j * 2];
  const b = T.jumpT[j * 2 + 1];
  const from = T.jumpIdx[j * 2];
  const to = T.jumpIdx[j * 2 + 1];
  const pathLength = useSeg(p, a, b, easeOutExpo);
  const opacity = useTransform(p, (v) => 0.85 * segAt(v, a, a + 0.003) * (1 - segAt(v, b, b + 0.03)));
  return (
    <motion.path
      d={`M${cellX(from).toFixed(2)} ${cellY(from).toFixed(2)}L${cellX(to).toFixed(2)} ${cellY(to).toFixed(2)}`}
      style={{ pathLength, opacity }}
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  );
}

function Ring({ p }: { p: MV }) {
  const x = useTransform(p, (v) => keyframes(v, T.jumpT, JUMP_X, easeOutExpo));
  const y = useTransform(p, (v) => keyframes(v, T.jumpT, JUMP_Y, easeOutExpo));
  const enter = useSeg(p, T.ring[0], T.ring[1], easeOutBack);
  const scale = useTransform([enter, p], ([e, v]: number[]) => e * (1 + 0.22 * flightAt(v, T.jumpT, T.jumpIdx)));
  const opacity = useSeg(p, T.ring[0], T.ring[0] + 0.006);
  const label = useTransform(p, (v) => String(snapKeys(v, T.jumpT, T.jumpIdx) + 1));
  const labelOp = useTransform(p, (v) => 1 - segAt(v, T.shrink[0], T.shrink[0] + 0.018));
  const fillOp = labelOp;
  return (
    <motion.g style={{ x, y, scale, opacity, ...CELL_ORIGIN }}>
      <motion.polygon
        points={RING_POINTS}
        style={{ fillOpacity: fillOp }}
        fill="var(--color-bg)"
        stroke="var(--color-accent)"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <motion.text
        style={{ opacity: labelOp, fontSize: 6.6 }}
        textAnchor="middle"
        dominantBaseline="central"
        y={0.4}
        className={`${MONO} fill-fg`}
      >
        {label}
      </motion.text>
    </motion.g>
  );
}

/* Expanding outline: marks the cell that opens, then the cell that gets reviewed. */
function Ping({ p, idx, win, color }: { p: MV; idx: number; win: readonly number[]; color: string }) {
  const t = useSeg(p, win[0], win[1]);
  const scale = useTransform(t, (v) => 1 + 1.1 * v);
  const opacity = useTransform(t, (v) => (v <= 0 || v >= 1 ? 0 : 0.9 * (1 - v)));
  return (
    <g transform={`translate(${cellX(idx).toFixed(3)} ${cellY(idx).toFixed(3)})`}>
      <motion.polygon points={RING_POINTS} style={{ scale, opacity, ...CELL_ORIGIN }} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
    </g>
  );
}

const CELL_INDEXES = Array.from({ length: N }, (_, i) => i);

/* Below the scan line the list is still on stage, so the grid only shows above it. */
const scanClip = (v: number) => {
  const g = segAt(v, T.scan[0], T.scan[1]);
  return g >= 1 ? "none" : `inset(-14px -14px calc(var(--gh) * ${(1 - g).toFixed(4)}) -14px)`;
};

export function HexGrid({ p, k }: { p: MV; k: MV }) {
  const transform = useTransform(k, (v) => `scale(calc(1 - (1 - var(--mini)) * ${v.toFixed(4)}))`);
  const clipPath = useTransform(p, scanClip);
  return (
    <motion.div
      style={{ transform, clipPath }}
      className="absolute left-0 top-[calc(var(--hdr)+var(--gap))] w-[var(--gw)] origin-top-left will-change-transform"
    >
      <div style={{ height: "var(--gh)" }} className="relative w-full">
        <svg aria-hidden viewBox={`0 0 ${GRID_W.toFixed(3)} ${GRID_H}`} className="absolute inset-0 h-full w-full overflow-visible">
          {CELL_INDEXES.map((i) => (
            <Cell key={i} p={p} i={i} />
          ))}
          {TRAILS.map((j) => (
            <Trail key={j} p={p} j={j} />
          ))}
          <Ping p={p} idx={T.jumpIdx[7]} win={T.open} color="var(--color-accent)" />
          <Ping p={p} idx={Q43} win={T.flip} color="var(--color-mint)" />
          <Ring p={p} />
        </svg>
      </div>
    </motion.div>
  );
}
