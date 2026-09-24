/* Invented values, consistent with HealthSceneData. */

import type { SceneIconName } from "./SceneIcon";

export type Span = readonly [number, number];
export type MarkerKey = "hrv" | "vitd" | "ldl";
export type Tok = { kind: "w"; text: string } | { kind: "c"; marker: MarkerKey };
export type Slot = { a: number; b: number };

export const CHAPTERS = [0, 0.25, 0.55, 0.8, 1] as const;
export const STILL_AT = 0.985;

export const CAPTIONS = [
  { eyebrow: "01 / Ask", title: "Ask about your own numbers.", body: "The chat sees your biomarkers, not just your question." },
  { eyebrow: "02 / Ground", title: "Every claim cites a marker.", body: "Statements link back to the lab values that justify them." },
  { eyebrow: "03 / Follow up", title: "Keep pulling the thread.", body: "Suggested follow-ups stay focused on the marker in question." },
  { eyebrow: "04 / Act", title: "From answer to action.", body: "One tap turns the advice into a plan." },
] as const;

export const T = {
  hint: [0.005, 0.02],
  hint2: [0.145, 0.16],
  type: [0.025, 0.115],
  send: [0.12, 0.14],
  bubble: [0.135, 0.16],
  attach0: 0.165,
  dots: [0.235, 0.295],
  swap: [0.255, 0.305],
  stream: [0.295, 0.5],
  cited: [0.5, 0.535],
  chips: [0.54, 0.6],
  tap: [0.615, 0.645],
  push: [0.645, 0.7],
  pill: [0.65, 0.69],
  focus: [0.66, 0.7],
  chart: [0.68, 0.73],
  ask2: [0.685, 0.705],
  dots2: [0.7, 0.72],
  stream2: [0.72, 0.775],
  chips2: [0.775, 0.8],
  swapBar: [0.8, 0.83],
  press: [0.84, 0.865],
  sheet: [0.86, 0.89],
  fill: [0.875, 0.965],
  ready: [0.965, 0.98],
  settle: [0.96, 0.985],
} as const satisfies Record<string, Span | number>;

export const PLAN_ROWS_AT: readonly Span[] = [
  [0.885, 0.92],
  [0.91, 0.945],
  [0.935, 0.965],
];

export const ATTACH_STEP = 0.02;
export const ATTACH_LEN = 0.02;
export const WORD_FADE = 0.012;
export const WORD_GLOW = 0.016;
export const WORD_GLOW_PEAK = 0.006;
export const FADE_QUICK = 0.012;
export const FOLLOW_POP = 0.02;
export const LIGHT_LEN = 0.03;
export const DRAW_LEN = 0.06;
export const CHIP_POP = 0.02;
export const CHIP_WEIGHT = 2.2;

export const QUESTION = "Why am I tired with a score of 82?";
export const FOCUS_QUESTION = "Dig into vitamin D";

/* One colour system per source: each token is the dominant hue of that source's own icon, so
   the dot, the bar and the marker chips never contradict the art beside them. */
const BLOOD = "var(--color-rose)";
const DEXA = "var(--color-mint)";
const DNA = "var(--color-mint)";
const WEARABLE = "var(--color-sky)";

/* zoom: the DNA art is a thin diagonal helix, so it is enlarged to fill its canvas. */
export type Source = { key: string; name: string; note: string; detail: string; color: string; icon: SceneIconName; zoom?: number };

const DNA_ZOOM = 1.34;

export const SOURCES: readonly Source[] = [
  { key: "blood", name: "Blood", note: "lab pdf", detail: "LDL-C, HDL-C, hsCRP, HbA1c, vitamin D", color: BLOOD, icon: "lab-blood" },
  { key: "dexa", name: "DEXA", note: "body scan", detail: "body fat, A/G ratio, visceral fat, ALMI", color: DEXA, icon: "body-scan" },
  { key: "dna", name: "DNA", note: "variants", detail: "APOE, MTHFR, MCM6, APOA5, TCF7L2", color: DNA, icon: "dna", zoom: DNA_ZOOM },
  { key: "wearable", name: "Wearable", note: "30 days", detail: "HRV, sleep, resting HR, SpO2, VO2 max", color: WEARABLE, icon: "device-watch" },
];

export const ATTACH_AT: readonly number[] = SOURCES.map((_, i) => T.attach0 + i * ATTACH_STEP);

export type Marker = {
  key: MarkerKey;
  index: number;
  label: string;
  value: string;
  unit: string;
  status: string;
  source: string;
  color: string;
  icon: SceneIconName;
  series: readonly number[];
};

export const MARKERS: readonly Marker[] = [
  { key: "hrv", index: 1, label: "HRV", value: "58", unit: "ms", status: "near your average", source: "wearable, 30 days", color: WEARABLE, icon: "device-watch", series: [52, 56, 54, 60, 57, 58] },
  { key: "vitd", index: 2, label: "Vitamin D", value: "62", unit: "nmol/L", status: "low end of normal", source: "blood, lab pdf", color: BLOOD, icon: "lab-blood", series: [71, 68, 66, 65, 63, 62] },
  { key: "ldl", index: 3, label: "LDL-C", value: "3.4", unit: "mmol/L", status: "above target", source: "blood, lab pdf", color: BLOOD, icon: "lab-blood", series: [3.7, 3.6, 3.5, 3.5, 3.4, 3.4] },
];

export const MARKER_BY_KEY: Record<MarkerKey, Marker> = {
  hrv: MARKERS[0],
  vitd: MARKERS[1],
  ldl: MARKERS[2],
};

const words = (s: string): Tok[] => s.split(" ").map((text) => ({ kind: "w", text }));
const cite = (marker: MarkerKey): Tok => ({ kind: "c", marker });

export const ANSWER: readonly Tok[] = [
  ...words("An 82 is a solid score, so look at recovery first. Your"),
  cite("hrv"),
  ...words("is near your average, while"),
  cite("vitd"),
  ...words("sits at the low end of normal."),
  cite("ldl"),
  ...words("is worth watching but rarely explains tiredness. Worth raising with your clinician."),
];

export const FOCUS_ANSWER: readonly Tok[] = [
  cite("vitd"),
  ...words("is down 9 from its six month high of 71, still in range. Seasonal dips are common, so watch the trend."),
];

export function schedule(toks: readonly Tok[], span: Span): readonly Slot[] {
  const weights = toks.map((t) => (t.kind === "c" ? CHIP_WEIGHT : 1));
  const cum = weights.reduce<number[]>((out, w) => [...out, (out[out.length - 1] ?? 0) + w], [0]);
  const total = cum[cum.length - 1];
  const at = (u: number) => span[0] + (u / total) * (span[1] - span[0]);
  return toks.map((_, i) => ({ a: at(cum[i]), b: at(cum[i + 1]) }));
}

export const ANSWER_SLOTS = schedule(ANSWER, T.stream);
export const FOCUS_SLOTS = schedule(FOCUS_ANSWER, T.stream2);

export const CITE_AT: Record<MarkerKey, number> = ANSWER.reduce(
  (acc, tok, i) => (tok.kind === "c" ? { ...acc, [tok.marker]: ANSWER_SLOTS[i].a } : acc),
  { hrv: 0, vitd: 0, ldl: 0 } as Record<MarkerKey, number>,
);

export type Followup = { label: string; wideOnly?: boolean };
export const FOLLOWUPS: readonly Followup[] = [
  { label: "Dig into vitamin D" },
  { label: "What moves my HRV?" },
  { label: "Is LDL-C 3.4 a concern?", wideOnly: true },
];
export const FOCUS_FOLLOWUPS: readonly Followup[] = [{ label: "What moves it?" }, { label: "When to retest?" }];
export const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"] as const;
/* Labelled points on the six month chart: the six month high and today's reading. */
export const CHART_MARKS: readonly { idx: number; label: string }[] = [
  { idx: 0, label: "71" },
  { idx: 5, label: "62" },
];

export type PlanRow = { key: string; tag: string; text: string; why: readonly MarkerKey[]; icon: SceneIconName };

export const PLAN: readonly PlanRow[] = [
  { key: "meal", tag: "Meal", text: "7 days: oily fish twice a week, eggs for vitamin D, oats to help bring LDL-C down.", why: ["vitd", "ldl"], icon: "meal" },
  { key: "train", tag: "Training", text: "4 sessions: two easy zone 2 rides, two strength days. Ease off if HRV drops below 50 ms.", why: ["hrv"], icon: "training" },
  { key: "supp", tag: "Supplement", text: "Vitamin D3, dose set with your clinician. Retest in eight weeks to see the direction.", why: ["vitd"], icon: "supplement" },
];

export const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export const WEEK_ROWS = [
  { key: "meal", label: "Meal", days: [1, 1, 1, 1, 1, 1, 1] },
  { key: "train", label: "Train", days: [1, 0, 1, 0, 1, 1, 0] },
  { key: "supp", label: "Supp", days: [1, 1, 1, 1, 1, 1, 1] },
] as const;

export const USE_RISE = 0.01;
export const USE_FALL = 0.015;

export const USE_SPANS: Record<MarkerKey, readonly Span[]> = PLAN.reduce(
  (acc, row, i) =>
    row.why.reduce((inner, k) => ({ ...inner, [k]: [...inner[k], PLAN_ROWS_AT[i]] }), acc),
  { hrv: [], vitd: [], ldl: [] } as Record<MarkerKey, readonly Span[]>,
);
