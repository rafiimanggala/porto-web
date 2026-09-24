import { DOMAINS, SCORE } from "./HealthSceneData";

export { DOMAINS, SCORE };

/* Geometry lives in a 360 x 400 unit stage that scales with its container. Values are invented. */

export const STAGE_W = 360;
export const STAGE_H = 400;

export type Rect = { x: number; y: number; w: number; h: number };
export type Span = readonly [number, number];
export type CardKey = "score" | "domains" | "insights" | "bio" | "blood" | "wearable";

export const CAPTIONS = [
  { eyebrow: "01 / Desktop", title: "Built wide first.", body: "Six cards across a three-column dashboard." },
  { eyebrow: "02 / Reflow", title: "Restacked, not shrunk.", body: "Cards reorder by priority and tables become card grids." },
  { eyebrow: "03 / Phone", title: "The score stays on top.", body: "Score, domains and insights, all within thumb reach." },
] as const;

export const CHAPTERS = [0, 0.3, 0.62, 1] as const;

export const T = {
  buildStep: 0.013,
  cols: [0.1, 0.27] as Span,
  colStep: 0.045,
  tags: [0.2, 0.29] as Span,
  tagStep: 0.012,
  tagDur: 0.035,
  legend: [0.2, 0.235] as Span,
  frame: [0.32, 0.6] as Span,
  dim: [0.3, 0.33] as Span,
  flightStart: 0.33,
  flightStep: 0.04,
  flightDur: 0.09,
  swapIn: -0.014,
  swapOut: 0.022,
  swapCap: 0.45,
  title: [0.53, 0.6] as Span,
  tagsOut: [0.9, 0.95] as Span,
  wave: [0.6, 0.67] as Span,
  waveStep: 0.008,
  waveDur: 0.03,
  thumbIn: [0.63, 0.67] as Span,
  swipe1: [0.685, 0.77] as Span,
  lift: 0.78,
  swipe2: [0.79, 0.9] as Span,
  zone: [0.9, 1] as Span,
} as const;

export const FRAME_WIDE: Rect = { x: 4, y: 84, w: 352, h: 232 };
export const FRAME_PHONE: Rect = { x: 88, y: 30, w: 184, h: 364 };
export const SCREEN_WIDE: Rect = { x: 5, y: 102, w: 350, h: 213 };
export const SCREEN_PHONE: Rect = { x: 92, y: 34, w: 176, h: 356 };

export const RADIUS = { frame: [8, 23], screenTop: [0, 19], screenBottom: [6, 19] } as const;
export const STATUS_H = 26;
export const TITLE_H = 17;
export const TITLE_SHIFT = TITLE_H - 1.5;
export const STATUS_COVER = STATUS_H + TITLE_H - TITLE_SHIFT;
export const TAB_H = 25;
export const TAB_ZONE = 33;
export const PT = SCREEN_PHONE.w / 390;
export const ISLAND: Rect = { x: 151.5, y: 38.6, w: 57, h: 16.7 };
export const RULER_GAP = 14;
export const BROWSER_PX = 1280;
export const PHONE_PX = 390;
export const COLS_SWITCH = 0.5;

const GRID = { x: 11, y: 108, w: 108.67, h: 97.5, gap: 6 };
const wideCell = (col: number, row: number): Rect => ({
  x: GRID.x + col * (GRID.w + GRID.gap),
  y: GRID.y + row * (GRID.h + GRID.gap),
  w: GRID.w,
  h: GRID.h,
});

export const COL_CENTERS = [0, 1, 2].map((c) => wideCell(c, 0).x + GRID.w / 2);
export const COL_BAND = { top: SCREEN_WIDE.y + 2, height: SCREEN_WIDE.h - 4, w: GRID.w + 6 };

/* The stack ends 3 units above the tab bar, so its top line falls in the gap between Bio age and Blood, never on a card. */
const PHONE = { x: 98, w: 164, top: SCREEN_PHONE.y + STATUS_H + TITLE_H, gap: 3.5 };
export const PHONE_X = PHONE.x - SCREEN_PHONE.x;
const HEIGHTS_ROOMY: Record<CardKey, number> = { score: 56, domains: 89.5, insights: 82, bio: 39, blood: 73, wearable: 46 };
const HEIGHTS_TIGHT: Record<CardKey, number> = { score: 56, domains: 87.3, insights: 79, bio: 41, blood: 66, wearable: 56 };
export const COMPACT_H = 34;
export const HERO_H = HEIGHTS_ROOMY.score;

export const SCORE_GEO = {
  pad: 6,
  gap: 8,
  head: 17,
  wideD: 60,
  wideFont: 22,
  heroFont: 20,
  compactFont: 12,
  numTop: [12.5, 6],
  labelGap: 1.5,
  labelFont: [14 * PT, 12 * PT],
  labelFloor: [10, 9.5],
  digitW: 1.25,
} as const;
export const HERO_D = HERO_H - 2 * SCORE_GEO.pad;
export const COMPACT_D = COMPACT_H - 2 * SCORE_GEO.pad;

const RANKED: readonly CardKey[] = ["score", "domains", "insights", "bio", "blood", "wearable"];
/* Flight order: cards that land on another card's cell leave after it, so a card only travels once its destination is clear. */
const FLIGHT: readonly CardKey[] = ["wearable", "blood", "bio", "score", "domains", "insights"];
const CELL: Record<CardKey, readonly [number, number]> = {
  blood: [0, 0],
  score: [1, 0],
  bio: [2, 0],
  wearable: [0, 1],
  domains: [1, 1],
  insights: [2, 1],
};

const phoneRect = (heights: Record<CardKey, number>, key: CardKey): Rect => {
  const above = RANKED.slice(0, RANKED.indexOf(key));
  return {
    x: PHONE.x,
    y: PHONE.top + above.reduce((sum, k) => sum + heights[k] + PHONE.gap, 0),
    w: PHONE.w,
    h: heights[key],
  };
};

export type Scroll = { first: number; total: number };

export type CardDef = {
  key: CardKey;
  rank: number;
  read: number;
  order: number;
  z: number;
  wide: Rect;
  phone: Rect;
  move: Span;
  swap: Span;
  build: number;
  tag: Span;
  wave: Span;
  scroll: Scroll;
};

const scrollFor = (heights: Record<CardKey, number>): Scroll => ({
  first: HEIGHTS_ROOMY.score - COMPACT_H + TITLE_SHIFT,
  total: phoneRect(heights, "insights").y - (PHONE.top - TITLE_SHIFT + COMPACT_H + PHONE.gap),
});

const buildCards = (heights: Record<CardKey, number>): readonly CardDef[] =>
  RANKED.map((key, i) => {
    const [col, row] = CELL[key];
    const read = row * 3 + col;
    const order = FLIGHT.indexOf(key);
    const m0 = T.flightStart + order * T.flightStep;
    const t0 = T.tags[0] + read * T.tagStep;
    const w0 = T.wave[0] + i * T.waveStep;
    /* Cards that fly last change to their phone body no later than swapCap, before the shrinking screen has cut them in half. */
    const s0 = Math.min(m0 + T.swapIn, T.swapCap);
    return {
      key,
      rank: i + 1,
      read,
      order,
      z: key === "score" ? 40 : 30 - i,
      wide: wideCell(col, row),
      phone: phoneRect(heights, key),
      move: [m0, m0 + T.flightDur],
      swap: [s0, s0 + T.swapOut - T.swapIn],
      build: read * T.buildStep,
      tag: [t0, t0 + T.tagDur],
      wave: [w0, w0 + T.waveDur],
      scroll: scrollFor(heights),
    };
  });

/* Two phone layouts. Roomy follows the iPhone type scale to the pixel; tight is for a small stage, where the 9.5 px text floor
   makes every line taller, so cards carry fewer rows instead of shrinking the type. */
export type Layout = { tight: boolean; cards: readonly CardDef[] };
export const LAYOUT_ROOMY: Layout = { tight: false, cards: buildCards(HEIGHTS_ROOMY) };
export const LAYOUT_TIGHT: Layout = { tight: true, cards: buildCards(HEIGHTS_TIGHT) };

/* Thumb sits left of the data icons and rank tags (which hug the card corner) so it never covers a digit or an icon. */
export const THUMB = { x: 226, y0: 336, d: 20, drag1: 40, drag2: 92, tail: 20 };
export const ZONE = { cx: SCREEN_PHONE.x + SCREEN_PHONE.w, cy: SCREEN_PHONE.y + SCREEN_PHONE.h, r: 270 };

export type BloodRow = { k: string; v: string; flag?: "high" | "low" };
export const BLOOD: readonly BloodRow[] = [
  { k: "LDL-C", v: "3.4", flag: "high" },
  { k: "HDL-C", v: "1.3" },
  { k: "hsCRP", v: "2.1" },
  { k: "HbA1c", v: "5.4" },
  { k: "Vit D", v: "62", flag: "low" },
];

export type Insight = { t: string; d: string; tone: string };
export const INSIGHTS: readonly Insight[] = [
  { t: "LDL-C is high", d: "3.4 mmol/L, above target", tone: "var(--color-rose)" },
  { t: "Vitamin D low", d: "62 nmol/L, review dose", tone: "var(--color-sun)" },
  { t: "HRV steady", d: "58 ms, recovery on track", tone: "var(--color-mint)" },
];
export const INSIGHT_EXTRA: readonly Pick<Insight, "t" | "tone">[] = [
  { t: "Sleep on track", tone: "var(--color-mint)" },
  { t: "Body fat 23.4 %", tone: "var(--color-sky)" },
];

export const WEARABLE = [
  { k: "HRV", long: "HRV", v: "58", u: "ms" },
  { k: "Sleep", long: "Sleep", v: "91", u: "%" },
  { k: "RHR", long: "Rest HR", v: "52", u: "bpm" },
  { k: "VO2", long: "VO2 max", v: "46.1", u: "" },
] as const;
export const SPARK = [55, 57, 54, 58, 60, 56, 59, 61, 57, 58, 62, 58] as const;

export const BIO = { age: 34, speed: "0.91x", needle: -20 };
