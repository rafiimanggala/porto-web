import { easeInOutCubic, easeOutBack, easeOutCubic } from "./HealthSceneParts";
import { ACCOUNTS, FAILED_RUN, OK_RUN, SCHEDULE } from "./PipeKitData";
import { clamp01, lerp } from "./PipeKitMath";
import { SAMPLE_ROWS, hm, pad2, toMinutes } from "./PipeIsolationData";

/* Every progress window of the isolation scene, and the pure functions of p that the components read.
   A window is [from, to] in scene progress. Run 1 is the healthy night (chapters 1 and 2), run 2 is the night
   that failed (chapter 3), then the 06:00 publishing run (chapter 4). */

export type Win = readonly [number, number];
type Ease = (t: number) => number;

export const seg = (v: number, w: Win, ease?: Ease) => {
  const t = clamp01((v - w[0]) / (w[1] - w[0]));
  return ease ? ease(t) : t;
};
/** Fades in over the start of the window, holds, fades out over its end. Use an end past 1 to keep it open. */
export const span = (v: number, w: Win, edge = 0.01) => Math.min(seg(v, [w[0], w[0] + edge]), 1 - seg(v, [w[1] - edge, w[1]]));
/** Sum of eased steps: 0 before the first mark, 1 after it, and so on. Rolls a stack of lines by position. */
export const stepIndex = (v: number, marks: readonly number[], width = 0.012) =>
  marks.reduce((sum, m) => sum + seg(v, [m, m + width], easeInOutCubic), 0);

export const OPEN = 9;

/* ---------- Chapter pages of the middle band ---------- */

export const WIPE = {
  sheets: [0.236, 0.262],
  run2: [0.5, 0.53],
  log: [0.656, 0.684],
  gap: [0.752, 0.78],
} as const satisfies Record<string, Win>;
export const RESET: Win = [0.5, 0.515];
/** Run 1 starts here: the schedule fires, the pill reads running and the footer moves on from waiting. */
export const LEAD_AT = 0.016;

/* ---------- The account loop ---------- */

export type Run = 1 | 2;
export const ACCOUNT_COUNT = ACCOUNTS.length;
/** Item 7 of 18 is the one that stalls in the failed run. */
export const STALL = FAILED_RUN.item - 1;
export const RUN = {
  1: { first: 0.08, step: 0.008, pop: 0.045, popStep: 0.0016 },
  2: { first: 0.532, step: 0.0072, pop: 0.506, popStep: 0.0012 },
} as const;
export const TIMEOUT: Win = [0.58, 0.632];
export const FAIL: Win = [0.634, 0.65];
export const SKIP: Win = [0.642, 0.658];
export const RETRY: Win = [0.636, 0.656];

const DOT_TRAVEL = 0.6;
const CURSOR_EDGE = 0.35;

export type ChipState = { show: number; cursor: number; done: number; fail: number };

export function chipState(v: number, i: number, run: Run): ChipState {
  const r = RUN[run];
  const start = r.first + i * r.step;
  const edge = r.step * CURSOR_EDGE;
  const stalled = run === 2 && i === STALL;
  const reached = run === 1 || i <= STALL;
  const leaving = stalled ? 0 : seg(v, [start + r.step, start + r.step + edge]);
  const on = reached ? seg(v, [start, start + edge]) * (1 - leaving) : 0;
  const fail = stalled ? seg(v, FAIL) : 0;
  const pop = r.pop + i * r.popStep;
  return {
    show: seg(v, [pop, pop + 0.006], easeOutCubic),
    cursor: on * (1 - fail),
    done: reached && !stalled ? seg(v, [start + r.step * 0.7, start + r.step * 1.1]) : 0,
    fail,
  };
}

const started = (v: number, run: Run, cap: number) => (v < RUN[run].first ? 0 : Math.min(cap, Math.floor((v - RUN[run].first) / RUN[run].step) + 1));
export const startedRun1 = (v: number) => started(v, 1, ACCOUNT_COUNT);
export const startedRun2 = (v: number) => started(v, 2, STALL + 1);
export const doneRun1 = (v: number) => Math.max(0, startedRun1(v) - (v < RUN[1].first + ACCOUNT_COUNT * RUN[1].step ? 1 : 0));
export const doneRun2 = (v: number) => Math.max(0, startedRun2(v) - 1);
export const timeoutSeconds = (v: number) => Math.round(seg(v, TIMEOUT) * FAILED_RUN.timeoutSeconds);

/** Marks that roll a stack of lines whose first line is a lead-in: one mark per account line, the first at the run start. */
export const stepMarks = (run: Run, count: number) => Array.from({ length: count }, (_, s) => RUN[run].first + s * RUN[run].step);

/** 0 at each step start, then 0..1 across the step, over `count` steps. */
export function saw(v: number, first: number, step: number, count: number): number {
  const u = (v - first) / step;
  if (u < 0 || u >= count) return 0;
  return u - Math.floor(u);
}
const dot = (v: number, run: Run, count: number, lag = 0) => clamp01(saw(v, RUN[run].first + lag, RUN[run].step, count) / DOT_TRAVEL);
const ripple = (v: number, run: Run, count: number) =>
  clamp01((saw(v, RUN[run].first, RUN[run].step, count) - DOT_TRAVEL) / (1 - DOT_TRAVEL));

/* ---------- Sheets and summary ---------- */

export const STORE = {
  feed: [0.262, 0.288],
  fade: [0.435, 0.45],
  chatWire: [0.378, 0.402],
  bubble: [0.392, 0.43],
} as const satisfies Record<string, Win>;

/* The four sample rows flip one after another and finish first; the counters count those rows, then keep climbing
   through the rows the sheets hold but do not draw, so a counter never runs ahead of a row that is on screen. */
const ROW_START = 0.292;
const ROW_STAGGER = 0.01;
const ROW_LEN = 0.022;
export const metricWin = (j: number): Win => [ROW_START + j * ROW_STAGGER, ROW_START + j * ROW_STAGGER + ROW_LEN];
/** History rows land a little before the matching metric row settles, so the shared counter never leads them. */
export const dropWin = (j: number): Win => [ROW_START - 0.002 + j * ROW_STAGGER, ROW_START - 0.002 + j * ROW_STAGGER + ROW_LEN];
const REST_ROWS: Win = [metricWin(SAMPLE_ROWS - 1)[1], 0.38];

export function updatedCount(v: number): number {
  const settled = Array.from({ length: SAMPLE_ROWS }, (_, j) => seg(v, metricWin(j))).reduce((sum, t) => sum + t, 0);
  return Math.floor(settled + 1e-9) + Math.round(seg(v, REST_ROWS) * (ACCOUNT_COUNT - SAMPLE_ROWS));
}
export const appendedCount = updatedCount;

/* ---------- Execution log ---------- */

export const LOG_T = {
  first: 0.686,
  step: 0.0055,
  input: [0.706, 0.726],
  error: [0.724, 0.74],
  leader: [0.694, 0.708],
} as const;
export const rowAt = (k: number) => LOG_T.first + k * LOG_T.step;

/* ---------- Lane A tiles and wires ---------- */

const ACTOR = 3;
export type TileState = { active: number; done: number; error: number; skip: number; pulse: number };

const A_ACT1: readonly Win[] = [[0.01, 0.04], [0.03, 0.08], [0.07, 0.235], [0.078, 0.235], [0.245, 0.4], [STORE.chatWire[0], 0.46]];
const A_DONE1 = [LEAD_AT + 0.004, 0.07, 0.226, 0.226, REST_ROWS[1], STORE.bubble[1]];
const A_ACT2: readonly Win[] = [[0.505, 0.53], [0.516, 0.535], [0.526, 0.65], [0.53, OPEN + 1], [OPEN, OPEN + 1], [OPEN, OPEN + 1]];
const A_DONE2 = [0.518, 0.53, OPEN, OPEN, OPEN, OPEN];
const A_WIRE1: readonly Win[] = [[LEAD_AT + 0.004, 0.036], [0.055, 0.075], [0.07, 0.085], [0.085, 0.1], STORE.chatWire];
const A_WIRE2: readonly (Win | null)[] = [[0.51, 0.522], [0.518, 0.528], [0.524, 0.534], null, null];

function pulseA(v: number, i: number): number {
  const second = v >= RESET[0];
  if (i === 0) return second ? seg(v, [0.505, 0.53]) : seg(v, [0.012, 0.045]);
  if (i === ACTOR) return second ? ripple(v, 2, STALL + 1) : ripple(v, 1, ACCOUNT_COUNT);
  if (i === 4) return seg(v, [0.262, 0.295]);
  if (i === 5) return seg(v, STORE.bubble);
  return 0;
}

export function tileA(v: number, i: number): TileState {
  const gone = 1 - seg(v, RESET);
  return {
    active: clamp01(span(v, A_ACT1[i]) * gone + span(v, A_ACT2[i])),
    done: Math.max(seg(v, [A_DONE1[i], A_DONE1[i] + 0.012]) * gone, seg(v, [A_DONE2[i], A_DONE2[i] + 0.012])),
    error: i === ACTOR ? seg(v, FAIL) : 0,
    skip: i > ACTOR ? seg(v, SKIP) : 0,
    pulse: pulseA(v, i),
  };
}

export function drawA(v: number, k: number): number {
  const gone = 1 - seg(v, RESET);
  const second = A_WIRE2[k];
  return Math.max(seg(v, A_WIRE1[k]) * gone, second ? seg(v, second) : 0);
}

export function rideA(v: number, k: number): number {
  const second = v >= RESET[0];
  if (k === 2) return second ? dot(v, 2, STALL + 1) : dot(v, 1, ACCOUNT_COUNT);
  if (k === 3) return second ? 0 : dot(v, 1, ACCOUNT_COUNT, RUN[1].step / 2);
  const w = second ? A_WIRE2[k] : A_WIRE1[k];
  return w ? seg(v, w) : 0;
}

/* ---------- Lane B: the 06:00 publishing run ---------- */

export const B_FIRST = 0.828;
const B_STEP = 0.018;
const B_LAST = 4;
export const bAt = (group: number) => B_FIRST + group * B_STEP;
export const B_DIM: Win = [0.82, 0.834];
export const B_OK: Win = [0.922, 0.934];

export function tileB(v: number, group: number) {
  const a = bAt(group);
  return { active: span(v, [a, a + 0.034]), done: seg(v, [a + 0.016, a + 0.028]), pulse: seg(v, [a, a + 0.03]) };
}
export const drawB = (v: number, group: number) => seg(v, [bAt(group) - 0.014, bAt(group) + 0.004]);

/* ---------- Header state pills ---------- */

export const PILL_A_MARKS = [0.012, 0.44, 0.505, FAIL[0]] as const;
export const PILL_B_MARKS = [B_FIRST, bAt(B_LAST) + 0.014] as const;

/* ---------- The clock ---------- */

export const CLOCK = {
  pop: [0.5, 0.52],
  morph: [0.754, 0.782],
  tick: [0.786, 0.826],
  lock: [0.822, 0.846],
  from: toMinutes(FAILED_RUN.at),
  to: toMinutes(SCHEDULE.time),
} as const;

export function clockMinutes(v: number): number {
  if (v < CLOCK.tick[0]) return CLOCK.from * seg(v, CLOCK.pop, easeOutCubic);
  return lerp(CLOCK.from, CLOCK.to, seg(v, CLOCK.tick, easeInOutCubic));
}
export const popOf = (v: number) => seg(v, CLOCK.pop, easeOutBack);

/* ---------- Header readout ---------- */

const summarySent = (v: number) => seg(v, STORE.bubble, easeOutCubic) > 0.5;

export function readoutAt(v: number): string {
  if (v < LEAD_AT) return SCHEDULE.cadence;
  if (v < RUN[1].first) return `${ACCOUNT_COUNT} accounts`;
  if (v < WIPE.sheets[1]) return `account ${pad2(startedRun1(v))} of ${ACCOUNT_COUNT}`;
  if (v < RESET[0]) return summarySent(v) ? "summary sent" : `rows ${pad2(updatedCount(v))} of ${ACCOUNT_COUNT}`;
  if (v < TIMEOUT[0]) return `item ${pad2(Math.max(1, startedRun2(v)))} of ${ACCOUNT_COUNT}`;
  if (v < FAIL[0]) return `${timeoutSeconds(v)} s of ${FAILED_RUN.timeoutSeconds} s`;
  if (v < CLOCK.tick[0]) return `${FAILED_RUN.label} failed`;
  if (v < B_FIRST) return hm(clockMinutes(v));
  return v < PILL_B_MARKS[1] ? `${OK_RUN.at} run` : `${OK_RUN.label} ${OK_RUN.status}`;
}
