import { EMAIL_FLOWS, FABRICS, ORDER, ORDER_TAGS, type EmailGroup, type Fabric } from "./MtmKitData";
import { TONE_VAR, mixColor, toneTint } from "./MtmKitMath";

/* Copy, layout and timeline. Content comes from MtmKitData. */

export const CAPTIONS = [
  { eyebrow: "01 / Defaults", title: "Ten stock emails, replaced.", body: "Every default Shopify email is swapped for an on-brand flow." },
  { eyebrow: "02 / Trigger", title: "An event starts each flow.", body: "Orders, shipping, pickup, sign-ups and appointments each fire their own flow." },
  { eyebrow: "03 / Merge", title: "Templates fill from real data.", body: "Line items, addresses, payment method and options like collar and cuff are mapped in." },
  { eyebrow: "04 / Live", title: "All ten are live.", body: "Confirmation, shipping, delivery, pickup, welcome, account and appointment emails." },
] as const;

/* Chapter 3 opens as the template finishes growing, chapter 4 as the grid has settled. */
export const CHAPTERS = [0, 0.2, 0.408, 0.836, 1] as const;

export const FLOW_COUNT = EMAIL_FLOWS.length;
/* Same lightness and chroma per group. Rose alone goes grey on the green theme, so the account tint leans into the accent to read as coral. */
export const GROUP_TINT: Readonly<Record<EmailGroup, string>> = {
  order: toneTint("sky", 0.3),
  account: mixColor(mixColor(TONE_VAR.rose, 0.4, TONE_VAR.accent), 0.6, "transparent"),
  appointment: toneTint("sun", 0.3),
};
export const HERO = EMAIL_FLOWS[0];

/* Two columns, filled top to bottom. */
const ROWS = FLOW_COUNT / 2;
export const cellOf = (i: number) => ({ col: Math.floor(i / ROWS), row: i % ROWS });
const restyleRank = (i: number) => cellOf(i).row * 2 + cellOf(i).col;

export type Win = readonly [number, number];
const staged = (from: number, step: number, dur: number, k: number): Win => [from + k * step, from + k * step + dur];

export const restyleWin = (i: number) => staged(0.012, 0.0165, 0.034, restyleRank(i));
export const trigWin = (i: number) => staged(0.206, 0.01, 0.024, i);
/* Live cascade runs row by row so the mint sweep reads across the grid. It starts after the settled grid has held for a beat. */
export const liveWin = (i: number) => staged(0.86, 0.0058, 0.02, restyleRank(i));

/* The badge is fully on after LIVE_ON of a card's window. A card counts as live, and its pip is mint, once the badge is half on. */
export const LIVE_ON = 0.3;
export const liveOnWin = (i: number): Win => {
  const [a, b] = liveWin(i);
  return [a, a + 0.5 * LIVE_ON * (b - a)];
};

/* Windows of the beats that are not per card. */
const FLOW_X = [0, 0.316, 0.348, 0.804, 0.832, 1] as const;

export const T = {
  labelX: [0, 0.196, 0.212, 0.806, 0.82, 1] as readonly number[],
  labelY: [0, 0, 1, 1, 2, 2] as readonly number[],
  /* The old header label leaves before the sweep and returns after it, so no glyph tail is ever cut by the edge. The sweep is done before the card grows. */
  labelFadeX: [0, FLOW_X[1] - 0.016, FLOW_X[1], FLOW_X[4] + 0.004, FLOW_X[4] + 0.016, 1] as readonly number[],
  labelFadeY: [1, 1, 0, 0, 1, 1] as readonly number[],
  flowX: FLOW_X as readonly number[],
  /* The nine cards fade only as the hero is nearly full size, so the stage is never bare. They return after the hero has almost landed. */
  recedeX: [0, 0.362, 0.414, 0.814, 0.838, 1] as readonly number[],
  expandX: [0, 0.352, 0.4, 0.806, 0.832, 1] as readonly number[],
  wireX: [0, 0.41, 0.434, 0.796, 0.814, 1] as readonly number[],
  /* The template body is gone before the frame starts to shrink. */
  bodyOut: [0.798, 0.812] as Win,
  ramp: [0, 0, 1, 1, 0, 0] as readonly number[],
  fire: [0.404, 0.43] as Win,
  packet: [0.416, 0.446] as Win,
  arrive: [0.44, 0.462] as Win,
  plane: [0.726, 0.774] as Win,
  sent: [0.764, 0.782] as Win,
} as const;

/* Template rows: typed as raw tags, then resolved. */
export const TYPE = { from: 0.418, step: 0.0028, dur: 0.016 } as const;
export const typeWin = (k: number): Win => staged(TYPE.from, TYPE.step, TYPE.dur, k);

export const RES = {
  hi: [0.48, 0.504] as Win,
  order: [0.5, 0.524] as Win,
  items: [
    { l1: [0.528, 0.544] as Win, l2: [0.542, 0.566] as Win, l3: [0.564, 0.58] as Win },
    { l1: [0.594, 0.61] as Win, l2: [0.608, 0.632] as Win, l3: [0.63, 0.646] as Win },
  ],
  ship: [0.658, 0.682] as Win,
  pay: [0.678, 0.702] as Win,
  cta: [0.708, 0.73] as Win,
} as const;

export const ROW_K = { hi: 0, order: 1, item: [2, 5], ship: 8, pay: 9, cta: 10 } as const;

export const RES_WINS: readonly Win[] = [RES.hi, RES.order, ...RES.items.flatMap((it) => [it.l1, it.l2, it.l3]), RES.ship, RES.pay];
export const MERGE_FIELDS = RES_WINS.length;

/* Store chips light up while their part resolves. */
export const SOURCES = [
  { label: "customer", win: [0.478, 0.526] as Win },
  { label: "items", win: [0.526, 0.648] as Win },
  { label: "address", win: [0.656, 0.686] as Win },
  { label: "payment", win: [0.676, 0.706] as Win },
] as const;

export const TAG = {
  first: ORDER_TAGS[0].tag,
  number: ORDER_TAGS[1].tag,
  product: ORDER_TAGS[2].tag,
  collar: ORDER_TAGS[3].tag,
  cuff: ORDER_TAGS[4].tag,
  fabric: ORDER_TAGS[5].tag,
  address: ORDER_TAGS[6].tag,
  payment: ORDER_TAGS[7].tag,
  cta: "{{ order.status_url }}",
} as const;

export const fabricOf = (name: string): Fabric => FABRICS.find((f) => f.name === name) ?? FABRICS[0];

export const COPY = {
  stock: "Stock to branded",
  trigger: "Event triggers",
  live: "Live flows",
  store: "Store",
  triggerLabel: "trigger",
  template: "template",
  sent: "sent",
  sending: "sending",
  liveWord: "live",
  hi: "Hi",
  confirmed: "is confirmed.",
  orderWord: "Order",
  fabricWord: "fabric",
  collarWord: "Collar",
  cuffWord: "Cuff",
  items: "Items",
  shipTo: "Ship to",
  paidWith: "Paid with",
  cta: "View order",
  qty: "x1",
  sourceLine: `order ${ORDER.number}`,
} as const;

export const HEADER_LABELS = [COPY.stock, COPY.trigger, COPY.live] as const;
