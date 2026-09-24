import type { Rect, Span } from "./MobileSceneData";

export type { Rect, Span };

/* Content and timeline of the reflow scene. All values are invented (NDA
   illustrative) and consistent with the shared data set. Geometry is in stage
   units, relative to the device screen; the stage itself is 360 x 400. */

export const CAPTIONS = [
  { eyebrow: "01 / Laptop", title: "Built wide first.", body: "The subject grid, lesson list and quiz sit side by side." },
  { eyebrow: "02 / Reflow", title: "One column, not shrunk.", body: "Tiles go two to a row and answer controls stack." },
  { eyebrow: "03 / Phone", title: "Same content, in reach.", body: "One tap per step: pick a subject, open a lesson, start the quiz." },
  { eyebrow: "04 / Answer", title: "Marked as you tap.", body: "Answer A turns mint and the bb cell in the Punnett square lights up." },
] as const;

/* Scroll chapters. The laptop chapter is short, the reflow gets the room. */
export const CHAPTERS = [0, 0.22, 0.58, 0.84, 1] as const;

/* Scroll progress p to scene time q: the laptop chapter plays a little faster and the reflow a little slower. Every beat in T is in scene time. */
export const WARP: { p: readonly number[]; q: readonly number[] } = { p: [0, 0.22, 0.58, 1], q: [0, 0.31, 0.6, 1] };

export type GlyphKey = "leaf" | "flask" | "atom" | "lens";
export type Subject = { name: string; sub: string; count: number; glyph: GlyphKey; tint: string; acc: number | null };

export const SUBJECTS: readonly Subject[] = [
  { name: "Biology", count: 5, sub: "Units 3 and 4", glyph: "leaf", tint: "var(--color-mint)", acc: 76 },
  { name: "Chemistry", count: 6, sub: "Units 1 and 2", glyph: "flask", tint: "var(--color-sky)", acc: 69 },
  { name: "Physics", count: 7, sub: "Year 10", glyph: "atom", tint: "var(--color-sun)", acc: 66 },
  { name: "Forensics", count: 4, sub: "Year 10", glyph: "lens", tint: "var(--color-rose)", acc: null },
];

export type LessonState = "done" | "open" | "todo";
export type Lesson = { title: string; level: 1 | 2; state: LessonState };

export const LESSONS: readonly Lesson[] = [
  { title: "Cells and DNA", level: 1, state: "done" },
  { title: "Punnett squares", level: 1, state: "done" },
  { title: "Natural selection", level: 2, state: "open" },
  { title: "Inheritance patterns", level: 2, state: "todo" },
  { title: "Mutations", level: 1, state: "todo" },
];
export const HOME_LESSONS = 3;

export const QUIZ = {
  head: "Quiz · Level 1",
  chip: "Level 1 · Punnett squares",
  question: "Bb x Bb: share of bb offspring?",
  answers: ["25%", "50%", "75%", "100%"],
  correct: 0,
  cells: ["BB", "Bb", "Bb", "bb"],
  hotCell: 3,
  feedback: "Correct: 1 of 4 cells is bb.",
} as const;

export const NAV = ["Home", "Subjects", "Lessons", "Quiz"] as const;

/* Layout numbers. */
export const M = 8;
export const COL_GAP = 6;
export const HEAD = 12;
export const HEAD_TEXT_H = 10;
export const FLOW_TOP = { wide: 24, home: 30 } as const;
export const GAP_Y = { wide: 7, home: 6 } as const;
export const TILE = { wideH: 56, homeH: 34, gap: 5, glyph: 16 } as const;
export const LROW = { wide: 28, home: 17, gapWide: 3, gapHome: 1.5, share: 0.6 } as const;
export const QCARD = { pad: 4, qWide: 44, qHome: 28, qGap: 4, chipH: 15, chipGap: 2 } as const;

/* Timeline in scene time q. Every beat is a [start, end] window. The frame
   morph itself (0.32 to 0.6) is the one of the Mobile device pieces, so the
   reflow is tied to it and happens around the 900 px breakpoint of the ruler
   (q 0.42): the quiz card wraps under the list first (its column is the first to
   get too narrow), then the tiles wrap, then the answers stack. */
export const T = {
  ruler: [0.02, 0.1] as Span,
  tileBeat: { start: 0.03, step: 0.02, dur: 0.05 },
  listBeat: { start: 0.11, step: 0.022, dur: 0.05 },
  quizBeat: { start: 0.2, step: 0.014, dur: 0.045 },
  guideIn: [0.05, 0.13, 0.21] as readonly number[],
  guideOut: 0.315,
  nav: [0.33, 0.41] as Span,
  subFade: [0.325, 0.365] as Span,
  lessonsA: [0.34, 0.39] as Span,
  quiz: [0.375, 0.445] as Span,
  tiles: [0.405, 0.465] as Span,
  chips: [0.455, 0.515] as Span,
  tags: [0.5, 0.525, 0.55] as readonly number[],
  tagsOut: [0.625, 0.645] as Span,
  pageKeys: [0.64, 0.685, 0.735, 0.775, 0.82, 0.86] as readonly number[],
  pageVals: [0, 1, 1, 2, 2, 3] as readonly number[],
  tapTab: [[0.61, 0.64], [0.71, 0.735], [0.795, 0.82]] as readonly Span[],
  bars: [0.685, 0.72] as Span,
  tapTile: [0.685, 0.715] as Span,
  rowsIn: [0.775, 0.81] as Span,
  tapAnswer: [0.885, 0.915] as Span,
  feedback: [0.905, 0.93] as Span,
  index: [0.62, 0.65] as Span,
  /* Camera on a narrow stage: it pans across the zoomed laptop (left edge 1, right edge -1), then pulls back to centre while the frame narrows. */
  panKeys: [0, 0.14, 0.22, 0.31, 0.37, 1] as readonly number[],
  panVals: [1, 1, -1, -1, 0, 0] as readonly number[],
  camPull: [0.32, 0.37] as Span,
} as const;

export const PAGE_H = 356;
export const RULER_GAP = 14;
export const RULER_PX = [1280, 390] as const;
export const RULER_SWITCH_PX = 900;
