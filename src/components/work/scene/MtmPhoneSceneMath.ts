import { easeInOutCubic, easeOutCubic } from "./HealthSceneParts";
import { SCREEN_PHONE } from "./MobileSceneData";
import { clamp01, frameAt, frameEase, lerp, segAt } from "./MobileSceneMath";
import { keyframes } from "./MtmKitMath";
import {
  BAR_H,
  CARD,
  CART,
  COL_GAP,
  FIELD,
  FIELDS,
  FLOW_TOP,
  FORM_GAP,
  GRID_SHARE,
  HEAD,
  HEAD_TEXT_H,
  M,
  NAV_H,
  NAV_PLATE_PAD,
  NAV_TOP,
  PAGE_FADE,
  PICKED,
  RULER_PX,
  RULER_SWITCH_PX,
  SHIRTS,
  T,
  TILE,
  type Rect,
  type Span,
} from "./MtmPhoneSceneData";

/* Pure geometry of the reflow, a function of scroll progress v. Blocks are laid out like a document flow at the live screen
   width. A block that changes column moves along an L, first down (y) and then sideways (x), one eased clock for both
   halves, and the cards leave in reverse order, so nothing ever crosses another block. */

const ease = easeInOutCubic;
const win = (v: number, s: Span) => ease(segAt(v, s));
const wrapOf = (t: number, split = 0.5) => ({ y: clamp01(t / split), x: clamp01((t - split) / (1 - split)) });
type Wrap = ReturnType<typeof wrapOf>;

const WRAP_SPLIT = 0.3;
const PICK_GAP = 3;
const HEAD_FADE = [14, 8] as const;
const COUNT = SHIRTS.length;
const FIELD_COUNT = FIELDS.length;
const COLS = 3;

export type CardGeo = { rect: Rect; tile: Rect; wideText: number; rowLeft: number; chevron: number };
export type Flow = {
  W: number;
  H: number;
  nav: number;
  navTop: number;
  head: number;
  rise: number;
  scroll: number;
  grid: { rect: Rect; top: number; bottom: number; cards: CardGeo[] };
  form: { rect: Rect; fields: FieldGeo[] };
  cart: Rect;
};

export const cardSpan = (i: number): Span => {
  const a = T.cols.start + (COUNT - 1 - i) * T.cols.step;
  return [a, a + T.cols.dur];
};

type Base = { inner: number; gw: number; top: number; wrap: Wrap };

function cardAt(v: number, i: number, g: Base): CardGeo {
  const cw0 = (g.gw - 2 * CARD.gap) / COLS;
  const cw1 = (g.inner - 2 * CARD.gap) / COLS;
  const w1 = lerp(cw0, cw1, g.wrap.x);
  const span = cardSpan(i);
  const k = wrapOf(win(v, span));
  const yWide = g.top + HEAD + Math.floor(i / COLS) * (CARD.wideH + CARD.gap);
  const yRow = g.top + HEAD + i * (CARD.rowH + CARD.rowGap);
  const tileW = lerp(w1 - 2 * TILE.pad, TILE.row, easeOutCubic(k.y));
  return {
    rect: {
      x: lerp(M + (i % COLS) * (w1 + CARD.gap), M, k.x),
      y: lerp(yWide, yRow, k.y),
      w: lerp(w1, g.inner, k.x),
      h: lerp(CARD.wideH, CARD.rowH, k.y),
    },
    tile: { x: TILE.pad, y: TILE.pad, w: tileW, h: lerp(TILE.wideH, TILE.row, k.y) },
    wideText: 1 - segAt(v, [span[0] + 0.009, span[0] + 0.019]),
    /* The row caption rides right of the tile, so the card only shows it as far as it has widened. */
    rowLeft: TILE.pad + tileW + TILE.rowText,
    chevron: segAt(v, [span[1] - 0.012, span[1]]),
  };
}

/* Two fields to a row while the form is wide, one per row once it has dropped under the grid. Like the cards they move
   along an L, last field first, so the labels of two fields never share a place. */
export const fieldSpan = (k: number): Span => {
  const a = T.fields[0] + (FIELD_COUNT - 1 - k) * T.fieldStep;
  return [a, a + T.fieldDur];
};

export type FieldGeo = { rect: Rect; wide: number; show: number };

function fieldAt(v: number, k: number, fw: number): FieldGeo {
  const two = (fw - FIELD.gapX) / 2;
  const m = wrapOf(win(v, fieldSpan(k)));
  const y2 = Math.floor(k / 2) * (FIELD.h + FIELD.gapY);
  const y1 = k * (FIELD.h + FIELD.gapY1);
  return {
    rect: { x: lerp((k % 2) * (two + FIELD.gapX), 0, m.x), y: HEAD + lerp(y2, y1, m.y), w: lerp(two, fw, m.x), h: FIELD.h },
    wide: m.x,
    show: 1,
  };
}

const fieldsHeight = (kf: number) => lerp(3 * FIELD.h + 2 * FIELD.gapY, FIELD_COUNT * FIELD.h + (FIELD_COUNT - 1) * FIELD.gapY1, kf);

const PHONE_GRID_BOTTOM = FLOW_TOP.phone + HEAD + COUNT * CARD.rowH + (COUNT - 1) * CARD.rowGap;
const PHONE_CART_Y = PHONE_GRID_BOTTOM + FORM_GAP + HEAD + fieldsHeight(1) + CART.gap;
const stickyAt = (H: number) => H - BAR_H + CART.barPad;
export const SCROLL_MAX = PHONE_CART_Y - stickyAt(SCREEN_PHONE.h);

/* The page stops with the tapped row just under the header, so no half row peeks out at rest. */
const PICK_TOP = FLOW_TOP.phone + HEAD + PICKED * (CARD.rowH + CARD.rowGap);
export const HEADER_EDGE = NAV_TOP.phone + NAV_H + NAV_PLATE_PAD;
export const SCROLL_END = Math.min(SCROLL_MAX, PICK_TOP - HEADER_EDGE - PICK_GAP);

/* A field is shown whole or not at all: it is dropped once its bottom would reach the soft edge of the page, so no row is
   ever half faded by the screen edge. Once the bar is up the settled phone keeps all six, so the band moves past the edge. */
const FIELD_GATE = 3;
const FIELD_REST_SLACK = 1;
const fieldShown = (bottom: number, limit: number, bar: number) => {
  const edge = limit - lerp(PAGE_FADE.open, -FIELD_REST_SLACK, bar);
  return 1 - segAt(bottom, [edge, edge + FIELD_GATE]);
};

export const barRiseAt = (v: number) => segAt(frameEase(v), [0.8, 1]);

export function flowAt(v: number): Flow {
  const { screen } = frameAt(v);
  const { w: W, h: H } = screen;
  const inner = W - 2 * M;
  const fe = frameEase(v);
  const nav = win(v, T.nav);
  const wrap = wrapOf(win(v, T.wrap), WRAP_SPLIT);
  const top = lerp(FLOW_TOP.wide, FLOW_TOP.phone, fe);
  const gw = (inner - COL_GAP) * GRID_SHARE;
  const cards = SHIRTS.map((_, i) => cardAt(v, i, { inner, gw, top, wrap }));
  const bottom = Math.max(...cards.map((c) => c.rect.y + c.rect.h));
  const right = Math.max(...cards.map((c) => c.rect.x + c.rect.w));
  const kf = win(v, [T.fields[0], fieldSpan(0)[1]]);
  const fx = lerp(M + gw + COL_GAP, M, wrap.x);
  const fw = lerp(inner - gw - COL_GAP, inner, wrap.x);
  const fy = lerp(top, bottom + FORM_GAP, wrap.y);
  const scroll = SCROLL_END * win(v, T.swipe);
  const rise = ease(barRiseAt(v));
  const cartY = Math.min(fy + HEAD + fieldsHeight(kf) + CART.gap - scroll, stickyAt(H) + (1 - rise) * CART.lift);
  const bar = barRiseAt(v);
  const limit = H - BAR_H * bar;
  const fields = FIELDS.map((_, k) => fieldAt(v, k, fw)).map((f) => ({ ...f, show: fieldShown(fy - scroll + f.rect.y + f.rect.h, limit, bar) }));
  return {
    W,
    H,
    nav,
    navTop: lerp(NAV_TOP.wide, NAV_TOP.phone, fe),
    /* The form header is dropped while it would straddle the bottom edge or the bar, never sliced by them. */
    head: 1 - segAt(fy - scroll + HEAD_TEXT_H, [limit - HEAD_FADE[0], limit - HEAD_FADE[1]]),
    rise,
    scroll,
    grid: { rect: { x: M, y: top, w: right - M, h: bottom - top }, top, bottom, cards },
    form: { rect: { x: fx, y: fy, w: fw, h: HEAD + fieldsHeight(kf) }, fields },
    cart: { x: fx, y: cartY, w: fw, h: CART.h },
  };
}

export const WIDE = flowAt(0);

/* The ruler lands on the final 390 as soon as the frame has all but stopped narrowing, so a settled phone never reads an
   in between width. */
const RULER_SETTLE = 0.985;

export const rulerAt = (v: number) => {
  const px = Math.round(lerp(RULER_PX[0], RULER_PX[1], clamp01(frameEase(v) / RULER_SETTLE)));
  return { px, cols: px > RULER_SWITCH_PX ? COLS : 1 };
};

/* Which of the three phone views is current: 0 collection, 1 fitting form, 2 cart. */
export const viewAt = (v: number) => keyframes(v, T.viewKeys, [0, 1, 1, 2]);

export { clamp01, lerp, segAt };
