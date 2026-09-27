import { FEEDS } from "./PipeKitData";

/* Geometry of the stage, in stage units. Two layouts share one timeline. `wide` is the 360 by 430 stage of a desktop
   or a short phone: three feed columns side by side. `tall` is a 360 by 556 portrait stage for a tall phone, where a
   row can be twelve pixels of type: the feeds stack as lanes with the old headlines in two sub-columns, and a record
   of the table takes three lines instead of four columns. */

export type Box = { x: number; y: number; w: number; h: number };

export const SW = 360;
export const ROW_COUNT = FEEDS.reduce((sum, feed) => sum + feed.items, 0);
/** The merged list is one list read in two columns, so every headline stays a readable line. */
export const MERGE_PER_COL = Math.ceil(ROW_COUNT / 2);

/** Column centres of the three feed tiles. Both layouts use them for the tiles, the wires and the labels. */
export const COL_X = [62, 180, 298] as const;
export const COL_W = 112;

type Pair = readonly [number, number];

export type Layout = {
  id: "wide" | "tall";
  tall: boolean;
  /** Stage height; the width is always SW. */
  sh: number;
  /** Shift of the dial and the lines under it, so they stay centred on a taller stage. */
  dy: number;
  /** CSS font sizes of a list row, of the article body, and of small labels. */
  rowFs: string;
  bodyFs: string;
  labelFs: string;
  /** Where row k of feed f stands while it is still in its feed. */
  feed: (f: number, k: number) => Box;
  feedTop: number;
  feedEnd: number;
  /** Where the merge sweep ends: the lower of the merged list and the feeds. */
  sweepEnd: number;
  merge: { x: Pair; w: number; top: number; pitch: number; h: number; end: number };
  /** Rows of the table of records: pitch and height before and after the link and date are trimmed. */
  table: { x: number; w: number; top: number; pitch: Pair; h: Pair };
  stack: { w: number; step: number; h: number };
  card: Box;
  jsonY: number;
  sheetY: number;
  sheetRow: number;
  sheetGap: number;
  stampY: number;
  stripBottom: string;
};

type Base = Omit<Layout, "feedEnd" | "sweepEnd">;

function make(base: Base): Layout {
  const bottoms = FEEDS.flatMap((feed, f) =>
    Array.from({ length: feed.items }, (_, k) => {
      const b = base.feed(f, k);
      return b.y + b.h;
    }),
  );
  const feedEnd = Math.max(...bottoms);
  return { ...base, feedEnd, sweepEnd: Math.max(feedEnd, base.merge.end) };
}

/* ---------- wide: three feed columns ---------- */

const FEED_TOP = 170;
const FRESH = { h: 24, pitch: 26 } as const;
const OLD = { h: 12, pitch: 13 } as const;
const MERGE_TOP = 172;

function wideFeed(f: number, k: number): Box {
  const fresh = FEEDS[f].fresh;
  const y = FEED_TOP + Math.min(k, fresh) * FRESH.pitch + Math.max(0, k - fresh) * OLD.pitch;
  return { x: COL_X[f], y, w: COL_W, h: k < fresh ? FRESH.h : OLD.h };
}

const WIDE_PITCH = 13;

export const WIDE: Layout = make({
  id: "wide",
  tall: false,
  sh: 430,
  dy: 0,
  rowFs: "max(11px, calc(var(--u) * 7.3))",
  bodyFs: "max(10px, calc(var(--u) * 10))",
  labelFs: "max(11px, calc(var(--u) * 10))",
  feed: wideFeed,
  feedTop: FEED_TOP,
  merge: { x: [98, 262], w: 156, top: MERGE_TOP, pitch: WIDE_PITCH, h: 12, end: MERGE_TOP + MERGE_PER_COL * WIDE_PITCH },
  table: { x: 180, w: 344, top: 176, pitch: [30, 30], h: [26, 26] },
  stack: { w: 300, step: 15, h: 14 },
  card: { x: 180, y: 176, w: 300, h: 184 },
  jsonY: 290,
  sheetY: 366,
  sheetRow: 15,
  sheetGap: 2,
  stampY: 282,
  stripBottom: "max(16px, calc(var(--u) * 9))",
});

/* ---------- tall: three lanes ---------- */

const LANE_GAP = 8;
const LANE_FRESH = { h: 15, pitch: 16 } as const;
const LANE_OLD = { h: 14, pitch: 15 } as const;
const LANE_FULL = 346;
const SUB_X = [93, 267] as const;
const SUB_W = 172;
const TALL_PITCH = 15;

const laneHeight = (f: number) => FEEDS[f].fresh * LANE_FRESH.pitch + Math.ceil((FEEDS[f].items - FEEDS[f].fresh) / 2) * LANE_OLD.pitch;
const laneTop = (f: number): number => (f === 0 ? FEED_TOP : laneTop(f - 1) + laneHeight(f - 1) + LANE_GAP);

/* Fresh rows take a whole lane line; the older rows fill two sub-columns, left then right, row by row. */
function tallFeed(f: number, k: number): Box {
  const fresh = FEEDS[f].fresh;
  const top = laneTop(f);
  if (k < fresh) return { x: 180, y: top + k * LANE_FRESH.pitch, w: LANE_FULL, h: LANE_FRESH.h };
  const o = k - fresh;
  const y = top + fresh * LANE_FRESH.pitch + Math.floor(o / 2) * LANE_OLD.pitch;
  return { x: SUB_X[o % 2], y, w: SUB_W, h: LANE_OLD.h };
}

export const TALL: Layout = make({
  id: "tall",
  tall: true,
  sh: 556,
  dy: 52,
  rowFs: "max(12px, calc(var(--u) * 7.2))",
  bodyFs: "max(12.5px, calc(var(--u) * 7.8))",
  labelFs: "max(12px, calc(var(--u) * 7.4))",
  feed: tallFeed,
  feedTop: FEED_TOP,
  merge: { x: SUB_X, w: SUB_W, top: FEED_TOP, pitch: TALL_PITCH, h: LANE_OLD.h, end: FEED_TOP + MERGE_PER_COL * TALL_PITCH },
  table: { x: 180, w: 336, top: 176, pitch: [48, 35], h: [44, 31] },
  stack: { w: 312, step: 16, h: 14 },
  card: { x: 180, y: 176, w: 312, h: 234 },
  jsonY: 296,
  sheetY: 426,
  sheetRow: 24,
  sheetGap: 4,
  stampY: 300,
  stripBottom: "max(16px, calc(var(--u) * 9))",
});

/** A stage taller than this (height over width) gets the tall layout. */
export const TALL_RATIO = 1.38;
