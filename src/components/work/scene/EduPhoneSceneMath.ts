import { easeInOutCubic } from "./HealthSceneParts";
import { clamp01, frameAt, lerp, segAt } from "./MobileSceneMath";
import {
  COL_GAP,
  FLOW_TOP,
  GAP_Y,
  HEAD,
  HOME_LESSONS,
  LROW,
  M,
  QCARD,
  QUIZ,
  SUBJECTS,
  T,
  TILE,
  type Rect,
  type Span,
} from "./EduPhoneSceneData";

/* Pure geometry of the reflow, a function of scene time v. Every block is
   placed like a normal document flow: tiles first, the list under them, the
   quiz under the list. Blocks that leave a row first drop (y phase) and only
   then slide sideways (x phase), so no two of them ever cross. The phases are
   short and follow one another, and every width follows the live frame width. */

const ease = easeInOutCubic;
const win = (v: number, s: Span, delay = 0) => ease(segAt(v, [s[0] + delay, s[1] + delay]));

/* A block that wraps moves along an L: first down (y), then sideways (x). One eased clock runs both halves, so it turns the corner at full speed instead of pausing there. */
const wrapOf = (t: number) => ({ y: clamp01(2 * t), x: clamp01(2 * t - 1) });
const wrapAt = (v: number, s: Span) => wrapOf(win(v, s));

export type TileGeo = Rect & { a: number };
export type ChipGeo = Rect & { k: number };
export type Flow = {
  W: number;
  H: number;
  nav: number;
  tiles: { rect: Rect; items: TileGeo[] };
  lessons: { rect: Rect; rowH: number; rowGap: number };
  quiz: { rect: Rect; cardH: number; qH: number; inner: number; chips: ChipGeo[] };
};

function tilesAt(v: number, W: number) {
  const wg = W - 2 * M;
  const nav = win(v, T.nav);
  const y = lerp(FLOW_TOP.wide, FLOW_TOP.home, nav);
  const tw4 = (wg - 3 * TILE.gap) / 4;
  const tw2 = (wg - TILE.gap) / 2;
  const { y: a, x: bx } = wrapAt(v, T.tiles);
  const h = lerp(TILE.wideH, TILE.homeH, a);
  const items: TileGeo[] = SUBJECTS.map((_, i) => {
    const drop = i >= 2 ? a * (h + TILE.gap) : 0;
    return { x: lerp(i * (tw4 + TILE.gap), (i % 2) * (tw2 + TILE.gap), bx), y: HEAD + drop, w: lerp(tw4, tw2, bx), h, a };
  });
  const bottom = Math.max(...items.map((t) => t.y + t.h));
  return { nav, rect: { x: M, y, w: wg, h: bottom }, items, bottom: y + bottom };
}

function lessonsAt(v: number, W: number, top: number) {
  const wg = W - 2 * M;
  const a = win(v, T.lessonsA);
  const b = wrapAt(v, T.quiz).x;
  const wide = (wg - COL_GAP) * LROW.share;
  const rowH = lerp(LROW.wide, LROW.home, a);
  const rowGap = lerp(LROW.gapWide, LROW.gapHome, a);
  const h = HEAD + HOME_LESSONS * rowH + (HOME_LESSONS - 1) * rowGap;
  const y = top + lerp(GAP_Y.wide, GAP_Y.home, a);
  return { rect: { x: M, y, w: lerp(wide, wg, b), h }, rowH, rowGap, wide };
}

/* Answers: the chips of the lower rows drop to their own row first (y phase), then every chip widens to the full width (x phase). */
function chipsAt(t: { x: number; y: number }, inner: number): ChipGeo[] {
  const cw = (inner - QCARD.chipGap) / 2;
  const pitch = QCARD.chipH + QCARD.chipGap;
  const { y: yk, x: xk } = t;
  return QUIZ.answers.map((_, i) => ({
    x: lerp((i % 2) * (cw + QCARD.chipGap), 0, xk),
    y: lerp(Math.floor(i / 2) * pitch, i * pitch, yk),
    w: lerp(cw, inner, xk),
    h: QCARD.chipH,
    k: xk,
  }));
}

function quizAt(v: number, W: number, list: ReturnType<typeof lessonsAt>) {
  const wg = W - 2 * M;
  const { y: d, x: wd } = wrapAt(v, T.quiz);
  const wideW = wg - COL_GAP - list.wide;
  const w = lerp(wideW, wg, wd);
  const qH = lerp(QCARD.qWide, QCARD.qHome, wd);
  const inner = w - 2 * QCARD.pad;
  const chips = chipsAt(wrapAt(v, T.chips), inner);
  const area = Math.max(...chips.map((c) => c.y + c.h));
  const cardH = 2 * QCARD.pad + qH + QCARD.qGap + area;
  const yWide = list.rect.y;
  const yHome = list.rect.y + list.rect.h + GAP_Y.home;
  const rect = { x: lerp(M + list.wide + COL_GAP, M, wd), y: lerp(yWide, yHome, d), w, h: HEAD + cardH };
  return { rect, cardH, qH, inner, chips };
}

export function flowAt(v: number): Flow {
  const { screen } = frameAt(v);
  const t = tilesAt(v, screen.w);
  const l = lessonsAt(v, screen.w, t.bottom);
  const q = quizAt(v, screen.w, l);
  return {
    W: screen.w,
    H: screen.h,
    nav: t.nav,
    tiles: { rect: t.rect, items: t.items },
    lessons: { rect: l.rect, rowH: l.rowH, rowGap: l.rowGap },
    quiz: q,
  };
}

export const WIDE = flowAt(0);
export const HOME = flowAt(0.62);

/* Piecewise value of v over increasing keys, eased inside each segment. */
export function keysAt(v: number, xs: readonly number[], ys: readonly number[]) {
  const last = xs.length - 1;
  if (v <= xs[0]) return ys[0];
  if (v >= xs[last]) return ys[last];
  const i = xs.findIndex((x, j) => v >= x && v < xs[j + 1]);
  return lerp(ys[i], ys[i + 1], ease((v - xs[i]) / (xs[i + 1] - xs[i])));
}

/* Which page of the phone the camera looks at: 0 home, 1 subjects, 2 lessons, 3 quiz. */
export const pageAt = (v: number) => keysAt(v, T.pageKeys, T.pageVals);

/* Sideways camera position while the laptop is on screen, -1 (left edge in view) to 1 (right edge). It only applies on a narrow stage. */
export const panAt = (v: number) => keysAt(v, T.panKeys, T.panVals);

export const pulse = (v: number, s: Span) => Math.sin(Math.PI * segAt(v, s));
export { clamp01, lerp, segAt };
