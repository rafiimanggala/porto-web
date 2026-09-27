import { BLOCKS, NODE, ROW_ID, SCRIPT, STATUS, TAGS } from "./PipeKitData";
import type { GlyphName } from "./PipeKitGlyphs";

/* Content and timeline of the script scene. Numbers and strings come from PipeKitData; only what the kit does not
   hold lives here (the caption text, the second pass node label, the progress windows). */

export const CAPTIONS = [
  { eyebrow: "01 / Read", title: "The article goes in.", body: "The picked story is handed to the language model with a strict script brief." },
  {
    eyebrow: "02 / Write",
    title: "Hook, three points, call to action.",
    body: `The model writes a ${SCRIPT.seconds} second script of about ${SCRIPT.words} words.`,
  },
  { eyebrow: "03 / Trends", title: "Tags come from what is trending.", body: "A parallel branch pulls trending hashtags and keeps only the relevant few." },
  { eyebrow: "04 / Caption", title: "Caption and tags, saved.", body: `A second pass writes the caption, and the row moves to ${STATUS[1]}.` },
] as const;

export const CHAPTERS = [0, 0.22, 0.5, 0.76, 1] as const;

/* Chapter changes of the lower panel and the middle layer. Each one is finished a little before its chapter boundary,
   so the frame a chapter jump lands on is the fully resolved layout of the new chapter, never a half done swap. */
export const WIPES = [
  [0.19, 0.216],
  [0.465, 0.496],
  [0.71, 0.738],
] as const;

/* The stage is 358 units wide and 450 tall. One unit is about one pixel on a phone. */
export const AW = 358;
export const AH = 450;

export const CAPTION_TEXT = "Morning light and sleep: what 12 studies found. Try ten minutes outside within an hour of waking.";
/** The caption is the payoff, so it is set large: this many characters per line at CAP_FS. */
export const CAPTION_WRAP = 30;
export const CAP_FS = 16;

export const PHRASES = ["Twelve studies", "bright light", "fall asleep earlier", "effects were small", "larger trials"] as const;

export const BLOCK_COLOR = ["var(--color-sun)", "var(--color-sky)", "var(--color-mint)", "var(--color-rose)", "var(--color-accent)"] as const;

export const KEPT_TAGS = TAGS.filter((t) => t.kept);
export const BRIEF = `brief: ${BLOCKS[0].label.toLowerCase()}, ${BLOCKS.length - 2} points, ${BLOCKS[4].label.toLowerCase()}`;
export const BRIEF_SIZE = `${SCRIPT.seconds} s, about ${SCRIPT.words} words`;
export const SAVED_TAB = `row ${ROW_ID}`;
export const RULER_LABEL = `script, ${SCRIPT.seconds} s, ${SCRIPT.words} words`;

/* Progress windows [from, to] unless a step is given. */
export const TL = {
  mark: { from: 0.015, step: 0.013, dur: 0.024 },
  lift: { from: 0.06, step: 0.018, dur: 0.038 },
  link: [0.04, 0.09],
  read: [0.03, 0.06],
  sweep: [0.222, 0.246],
  fold: { from: 0.246, step: 0.004, dur: 0.026 },
  frame: [0.246, 0.274],
  ticks: [0.31, 0.328],
  skeleton: [0.306, 0.326],
  rows: { from: 0.325, step: 0.026, dur: 0.024 },
  arc: [0.43, 0.49],
  spawn: { from: 0.482, step: 0.0065, dur: 0.028 },
  scan: [0.605, 0.657],
  away: { lag: 0.005, dur: 0.024 },
  gather: { from: 0.694, step: 0.007, dur: 0.028 },
  origin: [0.468, 0.755],
  grow: [0.66, 0.72],
  pill: [0.765, 0.8],
  solid: [0.8, 0.812],
  type: [0.8, 0.895],
  saved: [0.915, 0.935],
  tab: [0.918, 0.94],
  strip: 0.935,
} as const;

/* Moments a ripple leaves the trends node, one per batch of tags fanning out. */
export const SPAWN_RIPPLES = [0.485, 0.52, 0.555] as const;

/* One node of the graph row: its window of activity, when it counts as done, and when a ripple leaves it. */
export type NodeSpec = {
  readonly glyph: GlyphName;
  readonly label: string;
  readonly x: number;
  readonly on: readonly [number, number];
  readonly done: readonly [number, number];
  readonly ripples: readonly number[];
  readonly last?: boolean;
};

/** When each phrase chip lands in the model, and when each script row starts to be written. */
export const LAND: readonly number[] = PHRASES.map((_, i) => TL.lift.from + i * TL.lift.step + TL.lift.dur);
export const ROW_AT: readonly number[] = BLOCKS.map((_, i) => TL.rows.from + i * TL.rows.step);

export const RIPPLE_DUR = 0.032;

export const GRAPH: readonly NodeSpec[] = [
  { ...NODE.script, x: 24, on: [0.03, 0.5], done: [0.46, 0.49], ripples: [...LAND, ...ROW_AT] },
  { ...NODE.trends, x: 86, on: [0.48, 0.6], done: [0.585, 0.607], ripples: SPAWN_RIPPLES },
  { ...NODE.keep, x: 148, on: [0.6, 0.71], done: [0.68, 0.71], ripples: [0.605, 0.63, 0.655] },
  { ...NODE.join, x: 210, on: [0.76, 0.83], done: [0.79, 0.815], ripples: [0.762] },
  { glyph: "message", label: "Caption", x: 272, on: [0.8, 0.905], done: [0.885, 0.91], ripples: [0.8, 0.84, 0.88] },
  { ...NODE.writeback, x: 334, on: [0.9, 1], done: [0.955, 0.975], ripples: [0.905, 0.935], last: true },
];

export const NODE_Y = AH - 66;
export const NODE_TILE = 38;
