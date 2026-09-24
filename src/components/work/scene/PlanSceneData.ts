/* Plan generator scene content and timeline. All values are invented (NDA
   illustrative) and consistent with HealthSceneData. */

export const CAPTIONS = [
  {
    eyebrow: "01 / Goal",
    title: "One goal, three plans.",
    body: "Pick a target and the app builds meals, training and supplements around your data.",
  },
  {
    eyebrow: "02 / Meals",
    title: "A week of meals that fit.",
    body: "Each meal is scored against macro targets and tagged with the marker it helps.",
  },
  {
    eyebrow: "03 / Training",
    title: "Training that adapts.",
    body: "Swap an exercise and the progression rebalances around it.",
  },
  {
    eyebrow: "04 / Supplements",
    title: "Only what the labs justify.",
    body: "Each supplement points to the marker that asks for it.",
  },
] as const;

export const CHAPTERS = [0, 0.2, 0.5, 0.77, 1] as const;

/* Where each chapter tick scrolls to: just past the page wipe and the caption
   fade-in, so a click never parks the scene mid-wipe. */
export const JUMPS = [0, 0.24, 0.535, 0.805] as const;

export type Src = "blood" | "dexa" | "dna" | "wearable";
export const SRC_COLOR: Record<Src, string> = {
  blood: "var(--color-rose)",
  dexa: "var(--color-sun)",
  dna: "var(--color-sky)",
  wearable: "var(--color-mint)",
};

/* Timeline. Every beat is a [start, end] window of scroll progress. */
export const WIPES = [
  [0.18, 0.235],
  [0.47, 0.53],
  [0.74, 0.8],
] as const;

export const TL = {
  pickKeys: [0.01, 0.03, 0.04, 0.058, 0.066, 0.085],
  pickVals: [0, 1, 1, 3, 3, 2],
  click: [0.085, 0.108],
  weigh: [0.092, 0.118],
  kcal: [0.1, 0.15],
  macro: [0.115, 0.165],
  fan: [0.105, 0.17],
  plans: { start: 0.118, step: 0.01, dur: 0.03 },
  meals: { start: 0.24, step: 0.0055, dur: 0.02 },
  peekKeys: [0.372, 0.388, 0.41, 0.426, 0.44, 0.456],
  peekVals: [0, 1, 1, 2, 2, 3],
  done: [
    [0.458, 0.472],
    [0.722, 0.734],
    [0.958, 0.974],
  ],
  train: { start: 0.535, step: 0.0035, dur: 0.014, lift: [0.585, 0.597], swap: [0.597, 0.677], bar: [0.69, 0.725], status: [0.715, 0.73] },
  waves: [
    [0.665, 0.69],
    [0.676, 0.701],
    [0.686, 0.711],
  ],
  supp: { start: 0.805, step: 0.0145, dur: 0.035, skip: [0.925, 0.947] },
  ready: [0.974, 0.996],
} as const;

/* Goal page */
export const GOALS = ["Fat loss", "Muscle", "Heart", "Longevity"] as const;
export const GOAL_PICK = 2;

export type DataChip = { label: string; value: string; src: Src; flag?: "high" | "low"; weighted?: boolean };
export const DATA_CHIPS: readonly DataChip[] = [
  { label: "LDL-C", value: "3.4", src: "blood", flag: "high", weighted: true },
  { label: "HDL-C", value: "1.3", src: "blood", weighted: true },
  { label: "hsCRP", value: "2.1", src: "blood", weighted: true },
  { label: "HbA1c", value: "5.4", src: "blood" },
  { label: "Vit D", value: "62", src: "blood", flag: "low" },
  { label: "APOE", value: "e4", src: "dna", flag: "high", weighted: true },
  { label: "Body fat", value: "23.4%", src: "dexa" },
  { label: "HRV", value: "58 ms", src: "wearable" },
];

export const TARGET = {
  kcal: 2150,
  split: [30, 40, 30],
  grams: [161, 215, 72],
  letters: ["P", "C", "F"],
} as const;
export const MACRO_BG = ["bg-fg", "bg-fg/55", "bg-fg/25"] as const;

/* Meals */
export type Tag = "LDL-C" | "hsCRP" | "HbA1c" | "Vit D" | "ALMI" | "APOE" | "HRV";
export const TAGS: Record<Tag, { src: Src; value: string }> = {
  "LDL-C": { src: "blood", value: "3.4 mmol/L" },
  hsCRP: { src: "blood", value: "2.1 mg/L" },
  HbA1c: { src: "blood", value: "5.4 %" },
  "Vit D": { src: "blood", value: "62 nmol/L" },
  ALMI: { src: "dexa", value: "8.1 kg/m2" },
  APOE: { src: "dna", value: "e4 carrier" },
  HRV: { src: "wearable", value: "58 ms" },
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;

type MealSeed = { name: string; kcal: number; split: readonly [number, number, number]; tag: Tag; note?: string };
const SEEDS: readonly MealSeed[] = [
  { name: "Oats + walnuts", kcal: 510, split: [24, 46, 30], tag: "LDL-C" },
  { name: "Lentil stew + greens", kcal: 720, split: [28, 44, 28], tag: "LDL-C", note: "soluble fibre, low saturated fat" },
  { name: "Baked salmon, farro", kcal: 780, split: [32, 36, 32], tag: "hsCRP" },
  { name: "Egg + spinach wrap", kcal: 520, split: [33, 37, 30], tag: "Vit D" },
  { name: "Chickpea grain bowl", kcal: 700, split: [26, 48, 26], tag: "HbA1c" },
  { name: "Chicken + barley", kcal: 760, split: [34, 38, 28], tag: "APOE" },
  { name: "Yoghurt + berries", kcal: 480, split: [31, 44, 25], tag: "HbA1c" },
  { name: "Sardine rye toast", kcal: 640, split: [30, 34, 36], tag: "Vit D" },
  { name: "Miso cod + greens", kcal: 740, split: [31, 41, 28], tag: "hsCRP", note: "omega-3 fish, anti-inflammatory" },
  { name: "Chia oat bowl", kcal: 500, split: [22, 46, 32], tag: "LDL-C" },
  { name: "Bean + kale soup", kcal: 690, split: [27, 47, 26], tag: "APOE" },
  { name: "Turkey, sweet potato", kcal: 770, split: [35, 42, 23], tag: "ALMI" },
  { name: "Mushroom omelette", kcal: 530, split: [31, 33, 36], tag: "Vit D", note: "egg yolk and UV mushrooms" },
  { name: "Tofu + brown rice", kcal: 710, split: [28, 44, 28], tag: "HbA1c" },
  { name: "Grilled trout, greens", kcal: 750, split: [33, 34, 33], tag: "hsCRP" },
  { name: "Kefir, flax, oats", kcal: 490, split: [24, 49, 27], tag: "HRV" },
  { name: "Beef + bean chilli", kcal: 730, split: [33, 40, 27], tag: "ALMI" },
  { name: "Herbed tofu bake", kcal: 760, split: [29, 43, 28], tag: "LDL-C" },
  { name: "Ricotta, rye, pear", kcal: 500, split: [26, 45, 29], tag: "HbA1c" },
  { name: "Lamb + lentils", kcal: 740, split: [34, 38, 28], tag: "APOE" },
  { name: "Prawn + quinoa", kcal: 720, split: [35, 40, 25], tag: "ALMI" },
];

export type Meal = MealSeed & {
  day: number;
  slot: number;
  fit: number;
  grams: readonly [number, number, number];
};

const FIT_PENALTY = 0.85;
const fitOf = (split: readonly number[]) =>
  Math.round(100 - FIT_PENALTY * split.reduce((s, v, i) => s + Math.abs(v - TARGET.split[i]), 0));

export const MEALS: readonly Meal[] = SEEDS.map((m, i) => ({
  ...m,
  day: Math.floor(i / 3),
  slot: i % 3,
  fit: fitOf(m.split),
  grams: [
    Math.round((m.split[0] * m.kcal) / 400),
    Math.round((m.split[1] * m.kcal) / 400),
    Math.round((m.split[2] * m.kcal) / 900),
  ],
}));

/* Running week summary, index = meals scored so far. */
export const RUNNING = Array.from({ length: MEALS.length + 1 }, (_, n) => {
  if (n === 0) return { fit: 0, split: [...TARGET.split] as number[] };
  const seen = MEALS.slice(0, n);
  const avg = (i: number) => seen.reduce((s, m) => s + m.split[i], 0) / n;
  return { fit: Math.round(seen.reduce((s, m) => s + m.fit, 0) / n), split: [avg(0), avg(1), avg(2)] };
});

export const PEEKS = [MEALS[1], MEALS[8], MEALS[12]] as const;

/* Training */
export type Lift = { name: string; sets: number; reps: number; kg: number };
export type Session = { day: string; focus: string; lifts: readonly Lift[] };

export const SESSIONS: readonly Session[] = [
  {
    day: "Mon",
    focus: "Lower A",
    lifts: [
      { name: "Back squat", sets: 4, reps: 5, kg: 80 },
      { name: "Romanian DL", sets: 3, reps: 8, kg: 60 },
      { name: "Calf raise", sets: 3, reps: 12, kg: 40 },
    ],
  },
  {
    day: "Tue",
    focus: "Upper A",
    lifts: [
      { name: "Bench press", sets: 4, reps: 6, kg: 60 },
      { name: "Cable row", sets: 4, reps: 8, kg: 50 },
      { name: "OH press", sets: 3, reps: 8, kg: 30 },
    ],
  },
  {
    day: "Thu",
    focus: "Lower B",
    lifts: [
      { name: "Hip thrust", sets: 3, reps: 8, kg: 70 },
      { name: "Split squat", sets: 3, reps: 10, kg: 20 },
      { name: "Leg curl", sets: 3, reps: 12, kg: 35 },
    ],
  },
  {
    day: "Sat",
    focus: "Upper B",
    lifts: [
      { name: "Lat pulldown", sets: 3, reps: 10, kg: 45 },
      { name: "Incline press", sets: 3, reps: 8, kg: 22 },
      { name: "Face pull", sets: 3, reps: 15, kg: 20 },
    ],
  },
];

export const SWAP_TO: Lift = { name: "Leg press", sets: 4, reps: 8, kg: 140 };

export type Delta = { session: number; lift: number; field: "sets" | "kg"; to: number };
export const DELTAS: readonly Delta[] = [
  { session: 0, lift: 1, field: "sets", to: 4 },
  { session: 2, lift: 0, field: "kg", to: 75 },
  { session: 2, lift: 2, field: "sets", to: 2 },
];

export const LIFT_TOTAL = SESSIONS.reduce((n, s) => n + s.lifts.length, 0);

export const WEEK_SETS_BEFORE = SESSIONS.map((s) => s.lifts.reduce((n, l) => n + l.sets, 0));
export const WEEK_SETS_AFTER = WEEK_SETS_BEFORE.map((n, i) => {
  const swapped = i === 0 ? SWAP_TO.sets - SESSIONS[0].lifts[0].sets : 0;
  const shifted = DELTAS.filter((d) => d.session === i && d.field === "sets").reduce(
    (s, d) => s + d.to - SESSIONS[i].lifts[d.lift].sets,
    0,
  );
  return n + swapped + shifted;
});
export const WEEK_TOTAL = WEEK_SETS_BEFORE.reduce((a, b) => a + b, 0);

/* Supplements */
export type Gauge =
  | { kind: "range"; min: number; max: number; lo: number; hi: number; v: number }
  | { kind: "geno"; at: 0 | 1 | 2 };

export type Supp = {
  name: string;
  dose: string;
  marker: string;
  value: string;
  src: Src;
  flag?: "high" | "low";
  gauge: Gauge;
  kept: boolean;
};

export const SUPPS: readonly Supp[] = [
  { name: "Vitamin D3 + K2", dose: "2,000 IU daily", marker: "Vit D", value: "62 nmol/L", src: "blood", flag: "low", gauge: { kind: "range", min: 0, max: 150, lo: 75, hi: 150, v: 62 }, kept: true },
  { name: "Omega-3", dose: "2 g EPA + DHA", marker: "hsCRP", value: "2.1 mg/L", src: "blood", flag: "high", gauge: { kind: "range", min: 0, max: 5, lo: 0, hi: 1, v: 2.1 }, kept: true },
  { name: "Psyllium fibre", dose: "10 g daily", marker: "LDL-C", value: "3.4 mmol/L", src: "blood", flag: "high", gauge: { kind: "range", min: 0, max: 5, lo: 0, hi: 3, v: 3.4 }, kept: true },
  { name: "Methylfolate", dose: "400 mcg daily", marker: "MTHFR", value: "C677T het", src: "dna", gauge: { kind: "geno", at: 1 }, kept: true },
  { name: "Magnesium glycinate", dose: "300 mg evening", marker: "HRV", value: "58 ms", src: "wearable", flag: "low", gauge: { kind: "range", min: 20, max: 120, lo: 65, hi: 120, v: 58 }, kept: true },
  { name: "Berberine", dose: "500 mg daily", marker: "HbA1c", value: "5.4 %", src: "blood", gauge: { kind: "range", min: 3, max: 8, lo: 4, hi: 5.6, v: 5.4 }, kept: false },
];

/* Goal page: what the picked goal generated, one card per plan tab. */
export const PLAN_PREVIEW = [
  { label: "Meals", n: MEALS.length, unit: "meals", note: "scored to macros" },
  { label: "Training", n: SESSIONS.length, unit: "sessions", note: `${LIFT_TOTAL} lifts, rebalanced` },
  { label: "Supplements", n: SUPPS.length, unit: "candidates", note: "checked against markers" },
] as const;
