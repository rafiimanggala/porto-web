import { easeOutCubic } from "./HealthSceneParts";

/* Class-performance insights scene: copy, invented data and timeline. Every
   value is invented (NDA illustrative) and consistent with the case study set. */

export const CAPTIONS = [
  {
    eyebrow: "01 / Results",
    title: "Quiz results, every class.",
    body: "Submissions and scores from six classes feed one fortnightly window.",
  },
  {
    eyebrow: "02 / Summarise",
    title: "The AI reads the numbers.",
    body: "It drafts completion, topic accuracy and which class needs a nudge.",
  },
  {
    eyebrow: "03 / Honest zero",
    title: "No data says so.",
    body: "A class with no submissions reads no data yet, never a misleading 0 percent.",
  },
  {
    eyebrow: "04 / Send",
    title: "Preview, then email.",
    body: "Teachers preview the summary in the app before it goes out on schedule.",
  },
] as const;

export const CHAPTERS = [0, 0.24, 0.5, 0.75, 1] as const;

export type Tone = "sun" | "mint" | "sky" | "rose";
export const TONE: Record<Tone, string> = {
  sun: "var(--color-sun)",
  mint: "var(--color-mint)",
  sky: "var(--color-sky)",
  rose: "var(--color-rose)",
};

export type ClassRow = {
  id: string;
  course: string;
  tone: Tone;
  students: number;
  complete: number | null;
  avg: number | null;
};

export const CLASSES: readonly ClassRow[] = [
  { id: "A", course: "Science 10", tone: "sun", students: 28, complete: 86, avg: 74 },
  { id: "B", course: "Science 10", tone: "sun", students: 26, complete: 71, avg: 68 },
  { id: "C", course: "Biology 11", tone: "mint", students: 24, complete: 92, avg: 81 },
  { id: "D", course: "Biology 11", tone: "mint", students: 22, complete: null, avg: null },
  { id: "E", course: "Chemistry 10", tone: "sky", students: 27, complete: 78, avg: 70 },
  { id: "F", course: "Physics 10", tone: "rose", students: 25, complete: 64, avg: 66 },
];

type Scored = ClassRow & { complete: number; avg: number };
const isScored = (c: ClassRow): c is Scored => c.complete !== null && c.avg !== null;
const SCORED = CLASSES.filter(isScored);
const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export const D_INDEX = CLASSES.findIndex((c) => !isScored(c));
export const D_CLASS = CLASSES[D_INDEX];
export const REPORTING = SCORED.length;
export const AVG_COMPLETE = mean(SCORED.map((c) => c.complete));
export const AVG_SCORE = mean(SCORED.map((c) => c.avg));
/* What a plain division would print if the empty class were counted as 0. */
export const NAIVE_COMPLETE = SCORED.reduce((a, c) => a + c.complete, 0) / CLASSES.length;

export const TOPICS = [
  { key: "Bio", acc: 76 },
  { key: "Chem", acc: 69 },
  { key: "Phys", acc: 66 },
] as const;
export const WEAKEST = TOPICS.reduce((w, t, i) => (t.acc < TOPICS[w].acc ? i : w), 0);
export const WEAK_DETAIL = "Forces and motion, Level 2";

/* Mini calendar: 4 weeks from a Monday, quiz activity per day (weekends are quiet).
   The 14-day window sweeps from the previous fortnight onto the current one. */
export const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"] as const;
export const ACTIVITY = [
  0.55, 0.7, 0.4, 0.62, 0.35, 0.06, 0.04, 0.6, 0.45, 0.75, 0.5, 0.3, 0.05, 0.05, 0.72, 0.85, 0.6, 0.9, 0.55, 0.08, 0.05,
  0.8, 0.65, 0.95, 0.7, 0.5, 0.06, 0.04,
] as const;
export const DAY_COUNT = ACTIVITY.length;
export const WINDOW_LEN = 14;
export const LAST_START = DAY_COUNT - WINDOW_LEN;

/* Day 0 is Monday 24 August. */
const dayLabel = (n: number) => (n <= 7 ? `Aug ${24 + n}` : `Sep ${n - 7}`);
export const rangeLabel = (start: number) => `${dayLabel(start)} to ${dayLabel(start + WINDOW_LEN - 1)}`;

/* Two adjacent fortnights, never a sliding label: Aug 24 to Sep 6, then Sep 7 to Sep 20. */
export const windowLabel = (start: number) => rangeLabel(start < LAST_START / 2 ? 0 : LAST_START);

export const NEXT_SEND = "Mon 21 Sep";

/* Timeline. Every beat is a [start, end] window of scroll progress. */
export const T = {
  grow: { start: 0, step: 0.0016, dur: 0.022 },
  appear: [0.02, 0.042],
  sweep: [0.05, 0.102],
  lock: [0.102, 0.13],
  rowStart: 0.108,
  rowStep: 0.0165,
  rowDur: 0.045,
  scan: [0.108, 0.212],

  wait: [0.232, 0.252],
  head: [0.25, 0.277],
  readStart: 0.26,
  readStep: 0.0215,
  readDur: 0.03,
  lines: [
    [0.277, 0.327],
    [0.337, 0.387],
    [0.397, 0.442],
  ],
  hi: [0.377, 0.392],
  done: [0.447, 0.482],

  roll: [0.49, 0.535],
  ring: [0.49, 0.525],
  naive: [0.535, 0.572],
  tag: [0.566, 0.586],
  foot: [0.574, 0.59],
  strike: [0.596, 0.62],
  swap: [0.63, 0.71],
  settle: [0.71, 0.745],

  /* Chapters open on a beat that is already moving, because the caption column
     is empty for a moment at every chapter boundary. */
  back: [0.735, 0.78],
  tog: [0.762, 0.786],
  review: [0.784, 0.824],
  reviewDur: 0.016,
  flip: [0.818, 0.846],
  expand: [0.828, 0.862],
  wipe: [0.848, 0.876],
  pack: [0.872, 0.908],
  panel: [0.888, 0.916],
  tick1: [0.9, 0.914],
  flap: [0.906, 0.924],
  tick2: [0.918, 0.934],
  plane: [0.92, 0.962],
} as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const rowStart = (i: number) => T.rowStart + i * T.rowStep;
export const readStart = (i: number) => T.readStart + i * T.readStep;

/* Completion bar of row i as it fills, 0 to 1. */
export const fillAt = (v: number, i: number) =>
  easeOutCubic(clamp01((v - rowStart(i) - 0.1 * T.rowDur) / (0.7 * T.rowDur)));
export const avgAt = (v: number, i: number) =>
  easeOutCubic(clamp01((v - rowStart(i) - 0.4 * T.rowDur) / (0.55 * T.rowDur)));

/* How present row i's figures are: they fade in over the 12 to 30 percent of its beat. */
const presenceAt = (v: number, i: number) => clamp01((v - rowStart(i) - 0.12 * T.rowDur) / (0.18 * T.rowDur));

/* The footer averages the figures the rows currently show (count-up included),
   so it can never contradict the rows above it. Null until a row has numbers. */
export function runningAvg(v: number, pick: "complete" | "avg") {
  const live = CLASSES.flatMap((c, i) => {
    const x = c[pick];
    if (x === null) return [];
    const count = pick === "complete" ? fillAt(v, i) : avgAt(v, i);
    return [{ w: presenceAt(v, i), shown: count * x }];
  });
  const den = live.reduce((a, q) => a + q.w, 0);
  return den > 0 ? live.reduce((a, q) => a + q.w * q.shown, 0) / den : null;
}

export const reportingAt = (v: number) =>
  CLASSES.filter((c, i) => c.complete !== null && presenceAt(v, i) >= 0.5).length;
