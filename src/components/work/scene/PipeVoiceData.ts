import { BLOCKS, NODE, SCRIPT, VOICE, WORDS, type NodeDef } from "./PipeKitData";
import type { SceneCaption } from "./ScrollScene";

/* Voice scene copy, node row and progress windows. */

export const CAPTIONS: readonly SceneCaption[] = [
  { eyebrow: "01 / Voice", title: "The script becomes audio.", body: "The script goes to a text to speech service and comes back as a voiceover." },
  { eyebrow: "02 / Listen", title: "Whisper timestamps every word.", body: "The audio is transcribed again to learn exactly when each word starts." },
  { eyebrow: "03 / Group", title: "Words become caption lines.", body: "A model pass groups words into short lines that read well on a phone." },
  { eyebrow: "04 / Sync", title: "Captions land on the beat.", body: "Timed lines are merged with the audio, ready to render." },
];
export const CHAPTERS = [0, 0.22, 0.5, 0.66, 1] as const;

export const FILE_NAME = "voiceover.mp3";
export const DURATION = VOICE.seconds;
export const SAMPLE_END = WORDS[WORDS.length - 1].end + 0.08;
/** Whisper words and caption lines cover the first 9 s only, the rest of the voiceover is not listed. */
export const SAMPLE_SECONDS = Math.ceil(WORDS[WORDS.length - 1].end);

export const VIEW = { full: DURATION, zoom: 3.2, words: 9.6, lead: 0.25 } as const;

export const TONES = ["var(--color-sun)", "var(--color-sky)", "var(--color-mint)", "var(--color-rose)"] as const;

export const STRIP: readonly NodeDef[] = [
  NODE.tts,
  NODE.whisper,
  { glyph: "code", label: "JSON" },
  { glyph: "ai", label: "Group" },
  { glyph: "sheet", label: "Parse" },
  NODE.merge,
];

/* Progress windows, [from, to] unless noted. Chapter 3 ends at 0.66, chapter 4 gets the long sweep. */
export const TL = {
  inlet: [0.008, 0.045],
  morph: { from: 0.05, lag: 0.011, len: 0.045 },
  grow: [0.095, 0.19],
  file: [0.15, 0.19],
  hop: [
    [0.2, 0.245],
    [0.44, 0.48],
    [0.49, 0.535],
    [0.575, 0.61],
    [0.635, 0.68],
  ],
  pageLog: [0.215, 0.255],
  pageLines: [0.5, 0.54],
  pageMerge: [0.66, 0.695],
  zoomIn: [0.235, 0.3],
  sweepA: [0.3, 0.46],
  drop: [0.5, 0.53],
  zoomOut: [0.52, 0.58],
  group: { from: 0.53, step: 0.008, len: 0.016 },
  parse: { from: 0.6, step: 0.0045, len: 0.014 },
  /* Hand-off: header swap and status flip first, then the audio row, the rewind, the pill, and only then the sweep. */
  flip: 0.68,
  audioRow: [0.695, 0.73],
  rewind: [0.64, 0.73],
  phoneOn: [0.715, 0.745],
  voiced: 0.73,
  sweepB: [0.745, 0.985],
} as const;

export type NodeWindow = { on: readonly [number, number]; done: number; first?: boolean; last?: boolean };

export const NODE_WINDOWS: readonly NodeWindow[] = [
  { on: [0, 0.22], done: 0.215, first: true },
  { on: [0.22, 0.455], done: 0.435 },
  { on: [0.455, 0.5], done: 0.48 },
  { on: [0.5, 0.6], done: 0.585 },
  { on: [0.6, 0.66], done: 0.645 },
  { on: [0.66, 1.01], done: 0.73, last: true },
];

export const CARD_TITLES = ["script.txt", "transcript.json", "captions.json", "audio + captions"] as const;
/** Phone width variants: shorter, so a title never truncates. */
export const CARD_TITLES_NARROW = ["script.txt", "transcript.json", "captions.json", "audio + text"] as const;
/** The script is an estimate (42 s), the voiceover is what came back (0:41). */
export const SCRIPT_META = `${SCRIPT.words} words · est. ${SCRIPT.seconds} s`;
export const SCRIPT_META_NARROW = `${SCRIPT.words} words`;
/** The card shows the words Whisper hears in the first 9 s, the rest of the script is summarised as a count. */
export const MORE_WORDS = SCRIPT.words - WORDS.length;

/* Lane: a block too narrow for its label steps down a ladder of shorter ones, and the scrolling window fades at its edges. */
const SHORTER_LABELS: Readonly<Record<string, readonly string[]>> = { hook: ["H"], cta: ["CTA", "C"] };
export const LABEL_GLYPH_PX = 6;
export const LABEL_PAD_PX = 6;
export const EDGE_PX = 28;
export const EDGE_SECONDS = 0.3;
export const BLOCK_LABELS = BLOCKS.map((b) => ({ id: b.id, start: b.start, end: b.end, labels: [b.label, ...(SHORTER_LABELS[b.id] ?? [])] }));

const WRAP = 28;
export const SCRIPT_LINES: readonly string[] = WORDS.map((w) => w.w).reduce<string[]>((lines, word) => {
  const last = lines[lines.length - 1];
  return last !== undefined && last.length + 1 + word.length <= WRAP ? [...lines.slice(0, -1), `${last} ${word}`] : [...lines, word];
}, []);
