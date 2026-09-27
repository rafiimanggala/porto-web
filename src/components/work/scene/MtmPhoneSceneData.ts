import type { Span } from "./MobileSceneData";
import { BAD_ENTRY, COLLARS, COLLECTION_PATH, CUFFS, FABRICS, FLOW_STEPS, MEASURES, ORDER, PATTERNS, PRODUCT, type Fabric, type Measure } from "./MtmKitData";

export type { Rect, Span } from "./MobileSceneData";

/* Responsive reflow scene of the made-to-measure storefront. Content comes from MtmKitData, geometry is in stage units
   relative to the device screen (350 x 213 wide, 176 x 356 phone), and every beat is a window of scroll progress. */

export const CAPTIONS = [
  { eyebrow: "01 / Desk", title: "Built at a desk first.", body: "The collection grid and the fitting form sit side by side." },
  { eyebrow: "02 / Reflow", title: "One column, same logic.", body: "The grid and the configurator stack, and the gating stays underneath." },
  { eyebrow: "03 / Phone", title: "Fitted from a phone.", body: "Most customers start the fitting flow on mobile." },
] as const;

export const CHAPTERS = [0, 0.3, 0.65, 1] as const;

export type Collar = (typeof COLLARS)[number];
export type Cuff = (typeof CUFFS)[number];
export type Shirt = { readonly fabric: Fabric; readonly collar: Collar; readonly cuff: Cuff };

/* The last row is the shirt of the demo order (Oxford white, Cutaway, Double), the one the phone visitor picks and the gate and the email
   show too. Every other row is a different fabric and collar pair, so no two cards are the same shirt. */
const [ORDERED] = ORDER.items;
const fabricNamed = (name: string): Fabric => FABRICS.find((f) => f.name === name) ?? FABRICS[0];

export const SHIRTS: readonly Shirt[] = [
  { fabric: FABRICS[1], collar: COLLARS[2], cuff: CUFFS[0] },
  { fabric: FABRICS[2], collar: COLLARS[1], cuff: CUFFS[2] },
  { fabric: FABRICS[3], collar: COLLARS[0], cuff: CUFFS[0] },
  { fabric: FABRICS[1], collar: COLLARS[1], cuff: CUFFS[1] },
  { fabric: FABRICS[2], collar: COLLARS[2], cuff: CUFFS[2] },
  { fabric: fabricNamed(ORDERED.fabric), collar: ORDERED.collar, cuff: ORDERED.cuff },
];

/* The shirt the phone visitor taps: the last row, so it is the one left just above the form when the page scrolls to it. */
export const PICKED = SHIRTS.length - 1;
/* Cards the desk pointer passes over, in order, and the window of each hover. */
export const HOVERS: readonly (readonly [number, Span])[] = [
  [1, [0.105, 0.13]],
  [2, [0.13, 0.155]],
  [4, [0.155, 0.18]],
];
export const FOCUSED = 0;

export const FIELDS: readonly Measure[] = MEASURES;
export const SLEEVE_AT = MEASURES.findIndex((m) => m.id === BAD_ENTRY.id);

export const TEXT = {
  nav: PATTERNS.map((p) => p.gender).filter((g, i, all) => all.indexOf(g) === i),
  activeNav: PRODUCT.gender,
  gridHead: PRODUCT.name,
  gridTag: PRODUCT.gender,
  formHead: FLOW_STEPS[0].label,
  cart: FLOW_STEPS[4].label,
  note: "needs valid fit data",
  inCart: "in cart",
} as const;

export const VIEWS = ["Collection", FLOW_STEPS[0].label, FLOW_STEPS[4].label] as const;
/** The address bar follows the view, same order as VIEWS: the collection grid lives at COLLECTION_PATH, the fitting form and the cart at PRODUCT.path. */
export const VIEW_PATHS = [COLLECTION_PATH, PRODUCT.path, PRODUCT.path] as const;

/* Scroll windows. The frame itself narrows over [0.32, 0.6] (Mobile device math); the reflow beats sit inside that. The
   desk chapter is a small story: the collection is drawn, the pointer passes over three shirts, two measurements are
   typed, and the padlocked button is pressed and refuses. */
export const T = {
  ruler: [0.005, 0.07] as Span,
  cardBeat: { start: 0.015, step: 0.011, dur: 0.035 },
  fieldBeat: { start: 0.05, step: 0.009, dur: 0.03 },
  guideIn: [0.08, 0.13] as readonly number[],
  guideDraw: 0.05,
  guideOut: 0.31,
  grip: [0.23, 0.29] as Span,
  noteOut: [0.33, 0.35] as Span,
  nav: [0.318, 0.352] as Span,
  wrap: [0.33, 0.4] as Span,
  cols: { start: 0.405, step: 0.011, dur: 0.06 },
  fields: [0.47, 0.55] as Span,
  fieldStep: 0.007,
  fieldDur: 0.04,
  tagsIn: [0.55, 0.58] as readonly number[],
  tagsOut: [0.643, 0.663] as Span,
  tap: [0.586, 0.61] as Span,
  select: [0.592, 0.628] as Span,
  swipe: [0.648, 0.703] as Span,
  thumb: [0.62, 0.708] as Span,
  thumbRest: [0.62, 0.65] as Span,
  focus: [0.172, 0.19] as Span,
  poke: [0.262, 0.3] as Span,
  unlock: [0.86, 0.9] as Span,
  press: [0.91, 0.934] as Span,
  added: [0.92, 0.938] as Span,
  viewIn: [0.6, 0.64] as Span,
  viewKeys: [0.648, 0.703, 0.855, 0.915] as readonly number[],
} as const;

/* Layout numbers. */
export const M = 8;
export const COL_GAP = 8;
export const GRID_SHARE = 0.58;
export const NAV_TOP = { wide: 5, phone: 29 } as const;
export const NAV_H = 14;
export const NAV_PLATE_PAD = 3;
export const FLOW_TOP = { wide: 24, phone: 47 } as const;
export const HEAD = 14;
export const HEAD_TEXT_H = 11;
export const FORM_GAP = 6;

export const CARD = { gap: 5, wideH: 80, rowH: 38, rowGap: 3 } as const;
export const TILE = { pad: 4, wideH: 46, row: 30, textGap: 3.4, rowText: 6 } as const;
export const FIELD = { h: 33, gapX: 5, gapY: 5, gapY1: 2.5, label: 10, box: 16, bar: 3 } as const;
export const CART = { h: 22, gap: 6, barPad: 4, lift: 44 } as const;
export const BAR_H = 38;
/* Depth of the soft edge at the bottom of the page: with the screen edge alone, and above the sticky bar once it is up. */
export const PAGE_FADE = { open: 7, bar: 3 } as const;

export const RULER_PX = [1280, 390] as const;
export const RULER_SWITCH_PX = 720;
export const RULER_GAP = 14;

/* Typing plan: one entry per measurement, in field order. Height and collar are typed on the desk, the rest on the phone,
   and the sleeve is typed wrong, refused, erased and typed again. */
export type Keys = readonly [readonly number[], readonly number[]];
export type FieldPlan = { reveal: Keys; status: Keys; flip: number; first: number; value: number; validAt: number };

const plain = (m: Measure, a: number, b: number): FieldPlan => ({
  reveal: [[a, b], [0, 1]],
  status: [[b, b + 0.008], [0, 1]],
  flip: 0,
  first: m.sample,
  value: m.sample,
  validAt: b + 0.008,
});

const sleeve = (m: Measure): FieldPlan => ({
  reveal: [[0.723, 0.741, 0.762, 0.776, 0.778, 0.794], [0, 1, 1, 0, 0, 1]],
  status: [[0.741, 0.75, 0.762, 0.776, 0.794, 0.802], [0, -1, -1, 0, 0, 1]],
  flip: 0.777,
  first: BAD_ENTRY.typed,
  value: m.sample,
  validAt: 0.802,
});

const WINDOWS: readonly Span[] = [[0.19, 0.218], [0.222, 0.25], [0, 0], [0.798, 0.814], [0.814, 0.83], [0.83, 0.844]];

export const PLANS: readonly FieldPlan[] = MEASURES.map((m, i) => (i === SLEEVE_AT ? sleeve(m) : plain(m, WINDOWS[i][0], WINDOWS[i][1])));

export const validCount = (v: number) => PLANS.filter((p) => v >= p.validAt).length;
