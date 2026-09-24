import { easeInOutCubic } from "./HealthSceneParts";
import {
  BROWSER_PX,
  COLS_SWITCH,
  FRAME_PHONE,
  FRAME_WIDE,
  COMPACT_D,
  COMPACT_H,
  HERO_D,
  HERO_H,
  PHONE_PX,
  PHONE_X,
  SCORE_GEO,
  SCREEN_PHONE,
  SCREEN_WIDE,
  T,
  THUMB,
  TITLE_SHIFT,
  type CardDef,
  type Rect,
  type Scroll,
  type Span,
} from "./MobileSceneData";

/* Pure functions of scroll progress v. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const segAt = (v: number, s: Span) => clamp01((v - s[0]) / (s[1] - s[0]));

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeLaunch = (t: number) => 0.5 * easeOutCubic(t) + 0.5 * easeInOutCubic(t);

export const frameEase = (v: number) => easeLaunch(segAt(v, T.frame));

export function frameAt(v: number) {
  const f = frameEase(v);
  return {
    f,
    frame: lerpRect(FRAME_WIDE, FRAME_PHONE, f),
    screen: lerpRect(SCREEN_WIDE, SCREEN_PHONE, f),
  };
}

export function scrollAt(v: number, scroll: Scroll) {
  const s1 = easeInOutCubic(segAt(v, T.swipe1));
  const s2 = easeInOutCubic(segAt(v, T.swipe2));
  return scroll.first * s1 + (scroll.total - scroll.first) * s2;
}

/* How far the status bar's cover has grown (0 to 1); the card layer is cut at its lower edge, so a sub-pixel seam never shows a card behind it. */
export const coverAt = (v: number) => segAt(frameEase(v), [0.55, 1]);

/* The large title waits until the score card has landed under it. */
export const titleInAt = (v: number) => easeInOutCubic(segAt(v, T.title));

export const collapseAt = (v: number, scroll: Scroll) => clamp01(scrollAt(v, scroll) / scroll.first);

/* A card in the air stays inside the phone screen: its edges lean onto the screen margin as it takes off, so it slides in
   along the edge instead of being cut by it. The lean is 0 while the card waits and 1 a fifth of the way through its flight. */
const LEAN_SHARE = 0.2;

function keepInside(rect: Rect, card: CardDef, v: number): Rect {
  const s = frameAt(v).screen;
  const lo = s.x + PHONE_X;
  const hi = s.x + s.w - PHONE_X - rect.w;
  const inside = Math.max(lo, Math.min(hi, rect.x));
  const lean = easeInOutCubic(segAt(v, [card.move[0], lerp(card.move[0], card.move[1], LEAN_SHARE)]));
  return { ...rect, x: lerp(rect.x, inside, lean) };
}

function cardRectAt(card: CardDef, v: number): Rect {
  const m = easeLaunch(segAt(v, card.move));
  const rect = keepInside(lerpRect(card.wide, card.phone, m), card, v);
  if (card.key !== "score") return { ...rect, y: rect.y - scrollAt(v, card.scroll) };
  const c = collapseAt(v, card.scroll);
  return { ...rect, y: rect.y - c * TITLE_SHIFT, h: rect.h - c * (HERO_H - COMPACT_H) };
}

/* Units of a card's top edge that lie under the pinned score bar once the list scrolls. Cutting them away keeps a card that is
   fully hidden by the bar from leaking past its rounded corners or a sub-pixel seam. */
export function underBarAt(card: CardDef, bar: CardDef, v: number) {
  if (card.key === "score" || v < T.swipe1[0]) return 0;
  const b = cardBoxAt(bar, v);
  const c = cardBoxAt(card, v);
  return clamp01((b.y + b.h - c.y) / c.h) * c.h;
}

/* Waiting cards are veiled so the card in flight is the only bright thing; the veil lifts as a card takes off. */
export const VEIL_MAX = 0.6;

export function veilAt(card: CardDef, v: number) {
  if (card.order === 0) return 0;
  const takeOff = segAt(v, [card.move[0], card.move[0] + (card.move[1] - card.move[0]) * 0.4]);
  return VEIL_MAX * segAt(v, T.dim) * (1 - takeOff);
}

export const flightAt = (card: CardDef, v: number) => segAt(v, card.move);
export const inFlight = (card: CardDef, v: number) => v > card.move[0] && v < card.move[1];
export const liftAt = (card: CardDef, v: number) => Math.sin(Math.PI * flightAt(card, v));

export function cardBoxAt(card: CardDef, v: number): Rect {
  const r = cardRectAt(card, v);
  const s = frameAt(v).screen;
  return { x: r.x - s.x, y: r.y - s.y, w: r.w, h: r.h };
}

export const breakpointAt = (v: number) => {
  const f = frameEase(v);
  return { px: Math.round(lerp(BROWSER_PX, PHONE_PX, f)), cols: f < COLS_SWITCH ? 3 : 1 };
};

export function thumbY(v: number) {
  const first = v < T.lift;
  const e = easeInOutCubic(segAt(v, first ? T.swipe1 : T.swipe2));
  const drag = (first ? THUMB.drag1 : THUMB.drag2) * e;
  const settle = 8 * (1 - segAt(v, T.thumbIn));
  return THUMB.y0 - drag + settle;
}

export type ScoreGeo = {
  ring: { x: number; y: number; d: number };
  numIn: { x: number; y: number; font: number };
  numOut: { x: number; y: number; font: number };
  label: { x: number; y: number; font: number; floor: number };
};

/* The ring finishes its flight at this share of the card's move; the numeral rides inside it until then. */
export const RING_DONE = 0.62;
const handoffAt = (m: number) => segAt(m, [RING_DONE, RING_DONE + 0.16]);
export const numInAt = (m: number) => 1 - handoffAt(m);
export const numOutAt = (m: number) => handoffAt(m);

export function scoreGeo(box: Rect, m: number, c: number): ScoreGeo {
  const g = SCORE_GEO;
  const mr = easeOutCubic(clamp01(m / RING_DONE));
  const wideY = g.head + (box.h - g.head - g.wideD) / 2;
  const wideX = (box.w - g.wideD) / 2;
  const d = lerp(HERO_D, COMPACT_D, c);
  const ring = { x: lerp(wideX, g.pad, mr), y: lerp(wideY, g.pad, mr), d: lerp(g.wideD, d, mr) };
  const fontIn = (g.wideFont * ring.d) / g.wideD;
  const textX = g.pad + d + g.gap;
  const numFont = lerp(g.heroFont, g.compactFont, c);
  const numY = lerp(g.numTop[0], g.numTop[1], c);
  return {
    ring,
    numIn: { x: ring.x + (ring.d - g.digitW * fontIn) / 2, y: ring.y + (ring.d - fontIn) / 2, font: fontIn },
    numOut: { x: textX - 6 * (1 - numOutAt(m)), y: numY, font: numFont },
    label: {
      x: textX,
      y: numY + numFont + g.labelGap,
      font: lerp(g.labelFont[0], g.labelFont[1], c),
      floor: lerp(g.labelFloor[0], g.labelFloor[1], c),
    },
  };
}
