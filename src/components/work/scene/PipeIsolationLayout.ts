import { MONO } from "./HealthSceneParts";
import { cubicPath, linePath, type Pt, type WirePath } from "./PipeKitPath";

/* Stage geometry. One unit is 1/358 of the stage width. The stage keeps a fixed aspect so the svg wires and the html
   positions agree at every size. There are two stages of the same width: the wide one (358 by 416) that fills a
   landscape column, and a tall one for a portrait phone, which keeps the lanes as they are and gives the middle band
   the extra height. Frames are the coordinate systems: the stage, and the middle band. */

export const W = 358;
export const TILE = 38;
export const TILE_CSS = `${((TILE / W) * 100).toFixed(2)}cqw`;

export type Box = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export type Frame = { readonly w: number; readonly h: number };

const pctOf = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;
export const rectStyle = (b: Box, f: Frame) => ({ left: pctOf(b.x, f.w), top: pctOf(b.y, f.h), width: pctOf(b.w, f.w), height: pctOf(b.h, f.h) });
export const xPct = (x: number, f: Frame) => pctOf(x, f.w);
export const yPct = (y: number, f: Frame) => pctOf(y, f.h);
/** A length of n stage units as a CSS length, valid anywhere inside the stage container. */
export const unit = (n: number) => `calc(${n} * 100cqw / ${W})`;
export const centre = (pt: Pt, f: Frame): readonly [number, number] => [(pt[0] / f.w) * 100, (pt[1] / f.h) * 100];

/* Lane A: one row of six tiles. The end labels sit about 10 units clear of the card edge, and 57 apart the 10px
   labels of neighbours (at most 8 characters, never two long ones side by side) keep a gap at the smallest stage. */
export const A_X = [36, 93, 150, 207, 264, 321] as const;
/** The stub axis: the centre of the stage, between the two lanes. */
export const STUB_X = W / 2;
const LANE_GAP = 6;
const STUB_GAP = 96;
const FORK_X = 228;
/** "Write back" is the longest label of the scene, so its tile sits a little further in than lane A's last one. */
const WRITE_X = 315;

type Spec = { readonly compact: boolean; readonly aH: number; readonly aY: number; readonly bandH: number; readonly bH: number; readonly bY: number; readonly fork: number };
const WIDE_SPEC: Spec = { compact: false, aH: 88, aY: 47, bandH: 154, bH: 162, bY: 87, fork: 34 };
const TALL_SPEC: Spec = { compact: true, aH: 94, aY: 53, bandH: 296, bH: 186, bY: 99, fork: 40 };

export type Layout = {
  readonly compact: boolean;
  readonly H: number;
  readonly stage: Frame;
  readonly aBox: Box;
  readonly bBox: Box;
  readonly band: Box;
  readonly bandFrame: Frame;
  readonly aPts: readonly Pt[];
  readonly aWires: readonly WirePath[];
  readonly bPts: readonly Pt[];
  readonly bWires: readonly WirePath[];
  readonly leader: WirePath;
  /** The two stubs stop short of each other around `gapMid`. */
  readonly stubs: { readonly top: WirePath; readonly topEnd: Pt; readonly bottom: WirePath; readonly bottomEnd: Pt };
  readonly gapMid: number;
  /** Font size class of the middle band's text: 10 to 14px wide, 11 to 14px tall. */
  readonly txt: string;
  readonly monoTxt: string;
};

/** Each B wire, the tile it leaves, the tile it enters, and the publishing step it belongs to. */
export const B_WIRE_DEFS = [
  { from: 0, to: 1, group: 1 },
  { from: 1, to: 2, group: 2 },
  { from: 2, to: 3, group: 3 },
  { from: 2, to: 4, group: 3 },
  { from: 3, to: 5, group: 4 },
  { from: 4, to: 5, group: 4 },
] as const;

function laneB(bY: number, fork: number): readonly Pt[] {
  return [[A_X[0], bY], [A_X[1], bY], [A_X[2], bY], [FORK_X, bY - fork], [FORK_X, bY + fork], [WRITE_X, bY]];
}

function build(s: Spec): Layout {
  const bandY = s.aH + LANE_GAP;
  const bY = bandY + s.bandH + LANE_GAP;
  const H = bY + s.bH;
  const stage: Frame = { w: W, h: H };
  const band: Box = { x: 0, y: bandY, w: W, h: s.bandH };
  const aBox: Box = { x: 0, y: 0, w: W, h: s.aH };
  const bBox: Box = { x: 0, y: bY, w: W, h: s.bH };
  const aPts = A_X.map((x) => [x, s.aY] as Pt);
  const bPts = laneB(bY + s.bY, s.fork);
  const mid = bandY + s.bandH / 2;
  const topEnd: Pt = [STUB_X, mid - STUB_GAP / 2];
  const bottomEnd: Pt = [STUB_X, mid + STUB_GAP / 2];
  return {
    compact: s.compact,
    H,
    stage,
    aBox,
    bBox,
    band,
    bandFrame: { w: band.w, h: band.h },
    aPts,
    aWires: aPts.slice(0, -1).map((pt, k) => linePath(pt, aPts[k + 1])),
    bPts,
    bWires: B_WIRE_DEFS.map(({ from, to }) => (bPts[from][1] === bPts[to][1] ? linePath(bPts[from], bPts[to]) : cubicPath(bPts[from], bPts[to]))),
    leader: linePath([A_X[3], s.aH], [A_X[3], bandY + 22]),
    stubs: { top: linePath([STUB_X, s.aH], topEnd), topEnd, bottom: linePath([STUB_X, bY], bottomEnd), bottomEnd },
    gapMid: mid,
    txt: s.compact ? "text-[clamp(11px,3.4cqw,14px)]" : "text-[clamp(10px,2.8cqw,14px)]",
    monoTxt: `${MONO} ${s.compact ? "text-[clamp(11px,3.4cqw,14px)]" : "text-[clamp(10px,2.8cqw,14px)]"}`,
  };
}

export const WIDE: Layout = build(WIDE_SPEC);
export const TALL: Layout = build(TALL_SPEC);

/* Which stage fits a container of this size best: the tall one when it still comes out nearly as wide as the wide one. */
const PAD_MIN = 4;
const PAD_MAX = 12;
const STRIP = 26;
const KEEP = 0.85;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const stageWidth = (cw: number, ch: number, h: number) => {
  const pad = clamp(0.012 * cw, PAD_MIN, PAD_MAX);
  const gap = clamp(0.02 * cw, 6, 12);
  return Math.min(cw - 2 * pad, ((ch - 2 * pad - gap - STRIP) * W) / h);
};

export function pickLayout(cw: number, ch: number): Layout {
  if (cw <= 0 || ch <= 0) return WIDE;
  return stageWidth(cw, ch, TALL.H) >= KEEP * stageWidth(cw, ch, WIDE.H) ? TALL : WIDE;
}
