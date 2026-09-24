/* Invented values (NDA), consistent with HealthSceneData. Stage space is 360 x 430. */

export const VB_W = 360;
export const VB_H = 430;

/* On a stage box taller than the artwork (phones) the viewBox grows by `extra` units and
   each zone of the drawing slides down by a share of it, so the composition spreads over
   the box instead of floating in a letterboxed band. The list rows also open up. */
export const MAX_EXTRA = 220;
export const ZONE = { top: 0.2, stream: 0.5, strip: 0.9, hero: 0.35 } as const;
export type ZoneKey = keyof typeof ZONE;
export const ROW_GROW = 0.25;

/* Icon badges grow on a stage narrower than this (px), where a 256px PNG shrinks to the
   recognition floor. */
export const NARROW_STAGE_PX = 500;
export const NARROW_ICON_SCALE = 1.25;

export type Box = readonly [x: number, y: number, w: number, h: number];
export type Pose = { dx: number; dy: number; rot: number };

export const CAPTIONS = [
  {
    eyebrow: "01 / Vendor PDFs",
    title: "Twelve scanners, twelve layouts.",
    body: "Each vendor prints the body-composition chart in a different place, size and unit.",
  },
  {
    eyebrow: "02 / Locate",
    title: "Read the PDF, not a template.",
    body: "The crop finds the chart from the PDF drawing operators, so a new vendor still works.",
  },
  {
    eyebrow: "03 / Extract",
    title: "The chart becomes numbers.",
    body: "Arms, legs, trunk and visceral fat come out as values, not a picture.",
  },
  {
    eyebrow: "04 / Score",
    title: "Ranked against people your age.",
    body: "Each region lands on an age-matched percentile instead of a fixed cutoff.",
  },
] as const;

export const CHAPTERS = [0, 0.22, 0.5, 0.75, 1] as const;

export const TL = {
  fanOut: [0, 0.09],
  label: [0.04, 0.09],
  flashStart: 0.1,
  flashStep: 0.03,
  flashLen: [0.01, 0.04, 0.08],
  stripStart: 0.1,
  stripStep: 0.008,
  squareUp: [0.18, 0.24],
  streamIn: [0.235, 0.285],
  scrollA: [0.26, 0.305],
  cropIn: [0.27, 0.285],
  snapA: 0.315,
  toC: [0.345, 0.385],
  toB: [0.41, 0.45],
  dim: [0.44, 0.49],
  lock: [0.455, 0.5],
  cardIn: [0.465, 0.49],
  exit: [0.5, 0.53],
  lift: [0.535, 0.585],
  scan: [0.585, 0.665],
  flight: 0.05,
  count: 0.04,
  hero: [0.665, 0.72],
  facts: [0.69, 0.74],
  header: [0.75, 0.78],
  tracks: [0.755, 0.79],
  trackStep: 0.008,
  slotStart: 0.565,
  slotStep: 0.012,
  markersStart: 0.795,
  markerStep: 0.03,
  markerDur: 0.05,
  vatScale: [0.88, 0.92],
  vatPill: [0.915, 0.96],
} as const;

export const EXIT_DROP = 26;

/* The crop bracket never rests over the wrong page mid-hop: it fades out on the source
   chart, crosses unseen, and fades back in on the target. All three are shares of the hop
   span; the readout swaps at `swap`, while the bracket is hidden. */
export const HOP = { leave: 0.3, swap: 0.5, back: 0.55 } as const;
export const hopAt = (hop: readonly [number, number], share: number) => hop[0] + (hop[1] - hop[0]) * share;

export const PAGE_W = 110;
export const PAGE_H = 150;
export const PDF_W = 595;
export const PDF_H = 842;

export const BODY_W = 100;
export const BODY_H = 136;

export const PAGE_HEAD = {
  labelX: 8,
  labelY: 18.4,
  chip: { x: 76, y: 8, w: 26, h: 14 },
  shadow: { dx: 1.5, dy: 2.5 },
} as const;

export type DashBlock = { x: number; y: number; w: number; rows: number };
export type PageKind = "bars" | "columns" | "figure";

export type PageCfg = {
  vendor: number;
  unit: string;
  color: string;
  x: number;
  y: number;
  chart: Box;
  kind: PageKind;
  stack: Pose;
  fan: Pose;
  focus: boolean;
  filler: string;
  dashes: readonly DashBlock[];
};

const CHART_B_W = 54;
const STACK_DROP = 62;
const FAN_DROP = 40;

export const PAGES: readonly PageCfg[] = [
  {
    vendor: 3,
    unit: "lb",
    color: "var(--color-sky)",
    x: 9,
    y: 58,
    chart: [8, 28, 94, 48],
    kind: "bars",
    stack: { dx: 116, dy: -14 + STACK_DROP, rot: -3 },
    fan: { dx: 18, dy: 8 + FAN_DROP, rot: -8 },
    focus: false,
    filler: "0.4 w 43 415 m 552 415 l S",
    dashes: [{ x: 8, y: 84, w: 94, rows: 8 }],
  },
  {
    vendor: 7,
    unit: "kg",
    color: "var(--color-sun)",
    x: 125,
    y: 44,
    chart: [8, 68, CHART_B_W, (CHART_B_W * BODY_H) / BODY_W],
    kind: "figure",
    stack: { dx: 0, dy: STACK_DROP, rot: 0 },
    fan: { dx: 0, dy: FAN_DROP, rot: 0 },
    focus: true,
    filler: "/GS1 gs 1 0 0 1 0 0 cm",
    dashes: [
      { x: 8, y: 30, w: 60, rows: 4 },
      { x: 68, y: 70, w: 34, rows: 9 },
    ],
  },
  {
    vendor: 11,
    unit: "g",
    color: "var(--color-mint)",
    x: 241,
    y: 64,
    chart: [58, 30, 44, 60],
    kind: "columns",
    stack: { dx: -116, dy: -20 + STACK_DROP, rot: 3 },
    fan: { dx: -18, dy: 6 + FAN_DROP, rot: 8 },
    focus: false,
    filler: "0.5 g 30 300 240 4 re f",
    dashes: [
      { x: 8, y: 32, w: 44, rows: 13 },
      { x: 58, y: 100, w: 44, rows: 5 },
    ],
  },
];

const PT_X = PDF_W / PAGE_W;
const PT_Y = PDF_H / PAGE_H;

export function chartPt({ chart }: PageCfg) {
  const [x, y, w, h] = chart;
  return {
    w: Math.round(w * PT_X),
    h: Math.round(h * PT_Y),
    x: Math.round(x * PT_X),
    y: Math.round(PDF_H - (y + h) * PT_Y),
  };
}

export const chartOp = (page: PageCfg) => {
  const { w, h, x, y } = chartPt(page);
  return `q ${w} 0 0 ${h} ${x} ${y} cm /Im0 Do Q`;
};

const CROP_PAD = 2;

export const cropBox = (page: PageCfg): Box => {
  const [x, y, w, h] = page.chart;
  return [page.x + x - CROP_PAD, page.y + y - CROP_PAD, w + CROP_PAD * 2, h + CROP_PAD * 2];
};

export const frameBox = (page: PageCfg): Box => [page.x, page.y, PAGE_W, PAGE_H];

export const STRIP = { x: 12, y: 354, pitch: 26, w: 22, h: 28, labelY: 346 } as const;

export const STRIP_CHARTS: readonly Box[] = [
  [2, 15, 18, 9],
  [10, 3, 10, 14],
  [2, 3, 18, 9],
  [2, 3, 10, 12],
  [2, 17, 18, 8],
  [8, 9, 12, 12],
  [2, 15, 10, 10],
  [10, 15, 10, 10],
  [2, 10, 18, 8],
  [2, 3, 8, 17],
  [11, 3, 9, 13],
  [4, 14, 14, 10],
];

export const STRIP_MARKS: Readonly<Record<number, number>> = { 2: 0, 6: 1, 10: 2 };
export const NEW_SLOT = 12;
export const NEW_CHART: Box = [3, 4, 16, 11];

export const STREAM = { x: 12, y: 226, w: 336, lineH: 16, rows: 6, pad: 4, hitRow: 3, numX: 9, textX: 30, base: 11.5 } as const;

export type OpLine = { text: string; hit: boolean };

const PREFACE: readonly OpLine[] = [
  { text: "%PDF-1.7", hit: false },
  { text: "12 0 obj <</Type /Page>>", hit: false },
  { text: "stream", hit: false },
];

function block(page: PageCfg): readonly OpLine[] {
  return [
    { text: "q", hit: false },
    { text: `BT /F1 9 Tf 43 806 Td (VENDOR ${page.vendor}) Tj ET`, hit: false },
    { text: page.filler, hit: false },
    { text: chartOp(page), hit: true },
    { text: `BT /F2 8 Tf 300 60 Td (${page.unit}) Tj ET`, hit: false },
    { text: "Q", hit: false },
  ];
}

const HIT_INDEX = 3;
export const FIRST_HIT_SCROLL = PREFACE.length + HIT_INDEX - STREAM.hitRow;

const [PAGE_A, PAGE_B, PAGE_C] = PAGES;
export const HUNT_ORDER = [PAGE_A, PAGE_C, PAGE_B] as const;
export const DRAW_ORDER = [0, 2, 1] as const;
export const OP_LINES: readonly OpLine[] = [...PREFACE, ...HUNT_ORDER.flatMap(block)];
export const BLOCK_LINES = 6;

export const BODY_BOX: Box = [14, 74, 128, (128 * BODY_H) / BODY_W];

export const BODY = { vat: { cx: 50, cy: 53, rx: 6.5, ry: 5 } };

const CARD_PAGE = PAGES[1];
export const CARD_BOX: Box = [
  CARD_PAGE.x + CARD_PAGE.chart[0],
  CARD_PAGE.y + CARD_PAGE.chart[1],
  CARD_PAGE.chart[2],
  CARD_PAGE.chart[3],
];

export const LIFT = {
  dx: BODY_BOX[0] + BODY_BOX[2] / 2 - (CARD_BOX[0] + CARD_BOX[2] / 2),
  dy: BODY_BOX[1] + BODY_BOX[3] / 2 - (CARD_BOX[1] + CARD_BOX[3] / 2),
  scale: BODY_BOX[2] / CARD_BOX[2],
  arc: 16,
  tilt: -3,
} as const;

export type RegionKey = "arms" | "trunk" | "legs" | "vat";

export type Region = {
  key: RegionKey;
  label: string;
  color: string;
  value: number;
  decimals: number;
  unit: string;
  pct: number | null;
  anchor: readonly [number, number];
};

export const REGIONS: readonly Region[] = [
  { key: "arms", label: "Arms", color: "var(--color-sky)", value: 22.3, decimals: 1, unit: "%", pct: 44, anchor: [65, 42] },
  { key: "trunk", label: "Trunk", color: "var(--color-sun)", value: 24.2, decimals: 1, unit: "%", pct: 71, anchor: [56, 36] },
  { key: "legs", label: "Legs", color: "var(--color-mint)", value: 25.1, decimals: 1, unit: "%", pct: 58, anchor: [57, 104] },
  { key: "vat", label: "Visceral fat", color: "var(--color-rose)", value: 412, decimals: 0, unit: "g", pct: null, anchor: [50, 53] },
];

export const ROW = { x: 158, w: 190, y0: 74, pitch: 76, label: 10, swatch: 6.5, track: 44, scale: 26, indent: 14 } as const;
export const VAT_CLASSES = [
  { label: "Low", w: 30 },
  { label: "Normal", w: 50 },
  { label: "Elevated", w: 64 },
  { label: "High", w: 36 },
] as const;
export const VAT_CLASS_IDX = 1;
export const SEG_GAP = 3;

export const HERO = { value: 23.4, x: 14, y: 296 } as const;
export const FACTS = [
  { label: "A/G ratio", value: "1.08" },
  { label: "ALMI", value: "8.1 kg/m2" },
] as const;

export const slotAt = (i: number) => TL.slotStart + i * TL.slotStep;
export const trackAt = (i: number) => TL.tracks[0] + i * TL.trackStep;

export const passAt = (r: Region) => TL.scan[0] + (r.anchor[1] / BODY_H) * (TL.scan[1] - TL.scan[0]);
export const arriveAt = (r: Region) => passAt(r) + TL.flight;
export const landAt = (i: number) => TL.markersStart + i * TL.markerStep + TL.markerDur;
