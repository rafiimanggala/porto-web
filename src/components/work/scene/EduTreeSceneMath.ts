import { easeInOutCubic, easeOutCubic } from "./HealthSceneParts";
import { DRILL, REVEAL, SWEEP, TL, TOTAL, UNIT4_AT, WINDOW, nodeAt, type NodeRow } from "./EduTreeSceneData";

/* Pure functions of scroll progress. Every visual reads these, so any frame is reproducible. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pct = (v: number) => `${v.toFixed(3)}%`;

type Ease = (t: number) => number;

export function segAt(v: number, a: number, b: number, ease?: Ease) {
  const t = clamp01((v - a) / (b - a));
  return ease ? ease(t) : t;
}

/* Piecewise value of v over strictly increasing xs, eased inside each segment. */
export function keyframes(v: number, xs: readonly number[], ys: readonly number[], ease: Ease = easeInOutCubic) {
  const last = xs.length - 1;
  if (v <= xs[0]) return ys[0];
  if (v >= xs[last]) return ys[last];
  const i = xs.findIndex((x, j) => v >= x && v < xs[j + 1]);
  return lerp(ys[i], ys[i + 1], ease((v - xs[i]) / (xs[i + 1] - xs[i])));
}

/* Linear mix of two CSS lengths, for positions that mix % and px. */
export const mix = (a: string, b: string, t: number) => `calc((${a}) * ${(1 - t).toFixed(4)} + (${b}) * ${t.toFixed(4)})`;

/* Rows scrolled in chapter 2: down through the subject, then back to the open branch. */
export function scrollAt(v: number) {
  if (v < TL.down[0]) return 0;
  if (v < TL.down[1]) return SWEEP * segAt(v, TL.down[0], TL.down[1], easeInOutCubic);
  if (v < TL.up[0]) return SWEEP;
  return SWEEP * (1 - segAt(v, TL.up[0], TL.up[1], easeInOutCubic));
}

/* Whole rows only: the window steps a row at a time, so a stopped frame always shows twelve complete rows. */
export const rowIndex = (v: number, k: number) => Math.floor(scrollAt(v)) + k;

/* Height factor of a row: only the open branch exists until chapter 2. */
function revealAt(idx: number, v: number) {
  if (idx >= WINDOW) return v < TL.treeOnly ? 0 : 1;
  const w = REVEAL[idx];
  return w ? segAt(v, w[0], w[1], easeOutCubic) : 1;
}

/* Unit 4 is open while the list is scrolled, so the rows that move in below it are its own, and folds
   back with the chapter 2 furniture. */
function openAt(idx: number, n: NodeRow, v: number) {
  if (idx < DRILL.length) return segAt(v, DRILL[idx].open[0], DRILL[idx].open[1], easeInOutCubic);
  if (idx === UNIT4_AT) return segAt(v, TL.race[0], TL.race[0] + 0.03, easeInOutCubic) * furnitureAt(v);
  return n.open ? 1 : 0;
}

/* Rows the open branch occupies while it is drawn, centred in the window until it fills it. */
export function centerOffset(v: number) {
  if (v >= TL.treeOnly) return 0;
  const rows = Array.from({ length: WINDOW }, (_, i) => revealAt(i, v)).reduce((a, b) => a + b, 0);
  return (WINDOW - rows) / 2;
}

export type RowState = {
  label: string;
  depth: number;
  leaf: boolean;
  open: number;
  kids: number;
  kidsOp: number;
  reveal: number;
  sel: number;
};

const EMPTY_ROW: RowState = { label: "", depth: 0, leaf: true, open: 0, kids: 0, kidsOp: 0, reveal: 0, sel: 0 };

export function rowState(k: number, v: number): RowState {
  const idx = rowIndex(v, k);
  const n = nodeAt(idx);
  if (!n) return EMPTY_ROW;
  const open = openAt(idx, n, v);
  return {
    label: n.label,
    depth: n.depth,
    leaf: n.leaf,
    open,
    kids: n.kids,
    kidsOp: n.kids > 0 ? 1 - open : 0,
    reveal: revealAt(idx, v),
    sel: idx === 3 ? segAt(v, TL.select[0], TL.select[1]) : 0,
  };
}

const GHOST_CHAR = 1.9;
const GHOST_MAX = 60;

/* A ghost row past either end of the list does not exist, so it draws nothing. */
export function ghostState(k: number, v: number) {
  const n = nodeAt(rowIndex(v, k));
  if (!n) return { depth: 0, w: 0, on: 0 };
  return { depth: n.depth, w: Math.min(GHOST_MAX, 14 + n.label.length * GHOST_CHAR), on: 1 };
}

/* Node counter of chapter 2: the open branch, then the whole subject. */
export const raceAt = (v: number) => segAt(v, TL.race[0], TL.race[1], easeInOutCubic);
export const nodesAt = (v: number) => Math.round(lerp(WINDOW, TOTAL, raceAt(v)));

export function windowRows(v: number) {
  const from = Math.floor(scrollAt(v)) + 1;
  return `rows ${from} to ${from + WINDOW - 1} of ${nodesAt(v)}`;
}

/* Chapter 2 furniture (frame, minimap, ghost rows) leaves before the assign story starts. */
export const furnitureAt = (v: number) => 1 - segAt(v, TL.furniture[0], TL.furniture[1], easeInOutCubic);

/* Chapter 1 pointer: a path through the three chevrons, then onto the chosen sub-topic. */
const P_T = [0.004, 0.02, 0.06, 0.088, 0.13, 0.158, 0.198, 0.224] as const;
const P_PCT = [64, 0, 0, 0, 0, 0, 0, 0] as const;
const P_PX = [0, 12, 12, 12, 12, 12, 12, 62] as const;
const P_DEP = [0, 0, 0, 1, 1, 2, 2, 3] as const;
const P_ROW = [9, 0.5, 0.5, 1.5, 1.5, 2.5, 2.5, 3.5] as const;

export function pointerAt(v: number) {
  const pc = keyframes(v, P_T, P_PCT);
  const px = keyframes(v, P_T, P_PX);
  const dep = keyframes(v, P_T, P_DEP);
  const row = keyframes(v, P_T, P_ROW);
  const op = keyframes(v, [0.004, 0.014, 0.216, 0.232], [0, 1, 1, 0], (t) => t);
  return {
    left: `calc(${pc.toFixed(3)}% + ${px.toFixed(3)}px + var(--ind) * ${dep.toFixed(4)})`,
    top: `calc(var(--row) * ${row.toFixed(4)})`,
    op,
  };
}

/* The digit rolls during the first part of each stamp, so a stopped frame is rarely mid-roll. */
const ROLL_SHARE = 0.4;

export const quizCount = (v: number, stamps: readonly (readonly [number, number])[]) =>
  stamps.reduce((n, s) => n + segAt(v, s[0], s[0] + (s[1] - s[0]) * ROLL_SHARE, easeOutCubic), 0);
