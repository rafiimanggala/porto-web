// Seed data for the Streak prototype. No backend: this is a self-contained
// demo so the whole flow is clickable for the portfolio case study.

export type IconKey =
  | "water"
  | "run"
  | "book"
  | "meditate"
  | "sleep"
  | "stretch"
  | "write"
  | "sun";

export type Habit = {
  id: string;
  name: string;
  icon: IconKey;
  cadence: string;
  streak: number;
  best: number;
  // 0..1 completion per day for the last 119 days (17 weeks), index 0 = oldest.
  history: number[];
  doneToday: boolean;
};

export type Suggestion = { id: string; name: string; icon: IconKey };

export const suggestions: Suggestion[] = [
  { id: "s-water", name: "Drink water", icon: "water" },
  { id: "s-run", name: "Morning run", icon: "run" },
  { id: "s-read", name: "Read 20 pages", icon: "book" },
  { id: "s-meditate", name: "Meditate", icon: "meditate" },
  { id: "s-sleep", name: "Sleep by 11", icon: "sleep" },
  { id: "s-stretch", name: "Stretch", icon: "stretch" },
  { id: "s-write", name: "Journal", icon: "write" },
  { id: "s-sun", name: "Morning light", icon: "sun" },
];

// Deterministic pseudo history so the heatmap looks lived-in but is reproducible.
function makeHistory(seed: number, density: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < 119; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const r = (s % 1000) / 1000;
    // recent days trend more complete (builds toward "today")
    const recencyBoost = i > 95 ? 0.22 : i > 70 ? 0.1 : 0;
    out.push(r < density + recencyBoost ? 1 : 0);
  }
  return out;
}

export const seedHabits: Habit[] = [
  {
    id: "h-meditate",
    name: "Meditate",
    icon: "meditate",
    cadence: "Every day",
    streak: 12,
    best: 28,
    history: makeHistory(7, 0.62),
    doneToday: true,
  },
  {
    id: "h-run",
    name: "Morning run",
    icon: "run",
    cadence: "Mon, Wed, Fri",
    streak: 5,
    best: 19,
    history: makeHistory(31, 0.48),
    doneToday: false,
  },
  {
    id: "h-water",
    name: "Drink water",
    icon: "water",
    cadence: "Every day",
    streak: 23,
    best: 41,
    history: makeHistory(101, 0.78),
    doneToday: true,
  },
  {
    id: "h-read",
    name: "Read 20 pages",
    icon: "book",
    cadence: "Every day",
    streak: 0,
    best: 16,
    history: makeHistory(57, 0.4),
    doneToday: false,
  },
];

export const accentChoices = [
  { id: "ember", label: "Ember", value: "#FF5A3C" },
  { id: "teal", label: "Teal", value: "#1FA97B" },
  { id: "indigo", label: "Indigo", value: "#5B5BD6" },
  { id: "plum", label: "Plum", value: "#B0468B" },
  { id: "amber", label: "Amber", value: "#E8920C" },
];

export const cadenceChoices = [
  "Every day",
  "Weekdays",
  "Mon, Wed, Fri",
  "Weekends",
  "3x / week",
];
