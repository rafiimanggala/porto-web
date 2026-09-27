import { POLL_SECONDS, RENDER, SCRIPT, SHORTS, SHORTS_PLATFORMS, type NodeId } from "./PipeKitData";
import type { SceneCaption } from "./ScrollScene";
import type { Span } from "./PipeShortsMath";

/* Shorts scene: copy, geometry in design units (a 358 by 430 frame, scaled up as one piece) and the progress score.
   Every number and string that is content comes from PipeKitData. */

export const CAPTIONS: readonly SceneCaption[] = [
  { eyebrow: "01 / Same backbone", title: "A new format, not a new pipeline.", body: "Schedule, wait, render and upload are reused. Script becomes an agent, plus vision and clip." },
  { eyebrow: "02 / Agent", title: "An agent writes the carousel.", body: "A model with memory and a sheet tool drafts five slides that avoid repeats." },
  { eyebrow: "03 / Motion", title: "Stills become clips.", body: "A vision step reads each image, then it is animated into a short clip." },
  { eyebrow: "04 / Ship", title: "Three platforms, one render.", body: "TikTok, Instagram and YouTube Shorts are posted from the same finished video." },
];
export const CHAPTERS = [0, 0.25, 0.5, 0.76, 1] as const;

export const FW = 358;
export const FH = 430;

/* ---------- Lanes: the backbone above, the shorts lane below, seven shared columns ---------- */

export const COLS = [24, 86, 138, 186, 234, 284, 334] as const;
export const NS = 34;
export const LANE_Y = { a: { full: 104, dock: 18 }, b: { full: 262, dock: 72 } } as const;
export type LaneId = keyof typeof LANE_Y;

export type LaneNode = { readonly id: NodeId; readonly col: number; readonly fresh?: boolean };
export const LANES: Readonly<Record<LaneId, readonly LaneNode[]>> = {
  a: [
    { id: "schedule", col: 0 },
    { id: "script", col: 1 },
    { id: "wait", col: 2 },
    { id: "render", col: 5 },
    { id: "media", col: 6 },
  ],
  b: [
    { id: "schedule", col: 0 },
    { id: "agent", col: 1, fresh: true },
    { id: "wait", col: 2 },
    { id: "vision", col: 3, fresh: true },
    { id: "clip", col: 4, fresh: true },
    { id: "render", col: 5 },
    { id: "media", col: 6 },
  ],
};
/** Columns where both lanes run the very same node. */
export const SHARED = LANES.b.filter((n) => !n.fresh).map((n) => n.col);
export const REUSED = SHARED.length;
export const FRESH_COUNT = LANES.b.length - REUSED;

export const HEADERS = {
  a: { title: "Long-form video", tag: "Long-form", data: `${SCRIPT.seconds} s, ${SCRIPT.words} words` },
  b: { title: "Shorts", tag: "Shorts", data: `${SHORTS.slides.length} slides, ${SHORTS.clipSeconds} s clips` },
} as const;

/* ---------- Stage geometry ---------- */

export const BAND = { top: 108, bottom: 260 } as const;

export const CARD = { w: 52, h: 92, pitch: 63, x0: 27, y: 266 } as const;
export const cardX = (i: number) => CARD.x0 + i * CARD.pitch;
export const cardCx = (i: number) => cardX(i) + CARD.w / 2;
export const CARDS_END = cardX(SHORTS.slides.length - 1) + CARD.w;

export const AGENT_AT = [170, 152] as const;
export const SUB = { model: [90, 214], memory: [170, 214], tool: [250, 214] } as const;
export const IDEA = { x: 8, y: 127, w: 112, h: 50 } as const;
export const MEMORY = { x: 210, y: 118, w: 140, h: 68 } as const;
export const MEMORY_TOPICS: readonly string[] = SHORTS.memory.map((r) => r.topic);
export const REPEATS = MEMORY_TOPICS.filter((t) => t === SHORTS.topic).length;
/** The memory card verdict: "no exact repeats", never "0 repeats". */
export const MEMORY_VERDICT = REPEATS === 0 ? "no exact repeats" : `${REPEATS} exact ${REPEATS === 1 ? "repeat" : "repeats"}`;

export const HERO = { x: 14, y: 112, w: 79, h: 140 } as const;
export const JOBS = { x: 106, w: 244, rowH: 21, gap: 4, y: 112 } as const;
export const STRIP = { x: 106, y: 190, frameW: 30, frameH: 54, gap: 3, perf: 6 } as const;
/** The panel under the three log rows, where the image queue, the vision result and the clip strip take turns. */
export const PANEL = { x: 106, y: 190, w: 244, h: 66 } as const;

/** The sheet under the docked lanes, until the card row takes its place. Same width as the card row. */
export const SHEET = { x: 27, y: 266, w: 304, head: 18, row: 17 } as const;
/** The Shorts sheet: its own three posted rows (S-028 to S-030), then the new row S-031. Never the long-form ids. */
export const SHEET_VIEW = [
  ...SHORTS.memory.map((r) => ({ id: r.id, topic: r.topic, status: r.status })),
  { id: SHORTS.rowId, topic: SHORTS.topic, status: "idea" },
] as const;
/** The sheet header line, read off the sheet itself: "3 posted, 1 new". No scan counts, those belong to the long-form run. */
export const SHEET_TEXT = `${SHORTS.memory.length} posted, ${SHEET_VIEW.length - SHORTS.memory.length} new`;

export const SLIDES = SHORTS.slides;
/** One short line of slide copy per slide, typed into the card while the agent writes it. */
export const TIPS = ["Soft lamp light", "Out of reach", "Decaf, slow sips", "Plan the next day", "Every night"] as const;
export const CLIP_TOTAL = SHORTS.slides.length * SHORTS.clipSeconds;
export const FACTS = [`${RENDER.width} x ${RENDER.height}`, `${RENDER.ratio}, ${RENDER.fps} fps`, `${CLIP_TOTAL} s, ${SLIDES.length} clips`] as const;
export const PLATFORM_LIST = SHORTS_PLATFORMS;

/* ---------- The score: every window of progress in one place ---------- */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The long-form lane is already built when the scene opens, so the first frame shows the backbone the shorts lane hangs from. */
export const REST_AT = -0.03;

export const TL = {
  laneA: { at: REST_AT, step: 0.002 },
  laneB: { at: 0.004, step: 0.012 },
  fresh: [0.128, 0.15],
  legend: [0.15, 0.172],
  sweep: { at: 0.15, step: 0.014, dur: 0.016, release: 0.222 },
  headersOff: [0.208, 0.228],
  dock: [0.222, 0.262],
  laneTag: [0.232, 0.248],

  sheet: [0.236, 0.256],
  sheetRow: [0.256, 0.27],
  sheetOut: [0.424, 0.44],
  idea: [0.238, 0.258],
  toAgent: [0.292, 0.318],
  subWires: [0.318, 0.34],
  model: [0.342, 0.372],
  memory: [0.372, 0.436],
  memoryRow: { at: 0.392, step: 0.0105, tick: 0.006 },
  tool: [0.436, 0.494],
  card: { at: 0.44, step: 0.01, dur: 0.022 },
  agentOn: [0.292, 0.494],

  wipe1: [0.494, 0.526],
  imgStart: 0.52,
  img: { at: 0.548, step: 0.009, dur: 0.016 },
  scan: { at: 0.58, step: 0.012, dur: 0.026 },
  readDur: 0.016,
  clipJob: [0.656, 0.684],
  move: { at: 0.684, step: 0.005, dur: 0.05 },
  /** The film border and badge land with the clip they belong to, the moment its job is ready. */
  perf: { at: 0.684, step: 0.005, dur: 0.014 },
  /** The lower right panel of chapter 3 hands over from the image queue to the vision result, then to the clip strip. */
  panelA: [0.604, 0.622],
  panelB: [0.676, 0.692],
  visionOn: [0.58, 0.658],
  clipOn: [0.656, 0.758],
  readGone: [0.758, 0.768],
  waitImg: [0.518, 0.588],
  waitClip: [0.656, 0.758],

  wipe2: [0.754, 0.786],
  render: [0.79, 0.856],
  play: [0.86, 0.93],
  upload: [0.856, 0.88],
  tick: { at: 0.884, step: 0.016, dur: 0.016 },
  payoff: [0.94, 0.985],
  timeText: [0.766, 0.786],
} as const;

export const sweepAt = (k: number) => TL.sweep.at + k * TL.sweep.step;
export const imgAt = (i: number) => TL.img.at + i * TL.img.step;
export const scanAt = (i: number) => TL.scan.at + i * TL.scan.step;
export const moveAt = (i: number) => TL.move.at + i * TL.move.step;
export const perfAt = (i: number) => TL.perf.at + i * TL.perf.step;
export const cardAt = (i: number) => TL.card.at + i * TL.card.step;
export const memoryRowAt = (k: number) => TL.memoryRow.at + k * TL.memoryRow.step;
export const tickAt = (k: number) => TL.tick.at + k * TL.tick.step;

/** Progress where the status ladder reaches scripted, rendered and posted. A shorts run has no voice step, so the strip leaves voiced out. */
export const STATUS_AT = [-1, 0.5, 0.858, 0.925] as const;
export const STATUS_BLEND = 0.02;

/* ---------- When each node is lit, in each lane ---------- */

const rest = TL.sweep.release;
const sweepSpan = (k: number): Span => [sweepAt(k), rest];

const SHARED_SPANS: Readonly<Partial<Record<NodeId, readonly Span[]>>> = {
  schedule: [sweepSpan(0), [0.232, 0.294]],
  wait: [sweepSpan(1), TL.waitImg, TL.waitClip],
  render: [sweepSpan(2), [0.786, 0.864]],
  media: [sweepSpan(3), [0.856, 0.94]],
};
export const SPANS: Readonly<Record<LaneId, Readonly<Partial<Record<NodeId, readonly Span[]>>>>> = {
  a: SHARED_SPANS,
  b: { ...SHARED_SPANS, agent: [TL.agentOn], vision: [TL.visionOn], clip: [TL.clipOn] },
};

/** Where the check badge lands on each shorts node. */
export const DONE_AT: Readonly<Partial<Record<NodeId, number>>> = {
  schedule: 0.294,
  agent: 0.494,
  wait: 0.758,
  vision: 0.658,
  clip: 0.758,
  render: 0.864,
  media: 0.934,
};

/** One pulse hops along a shorts wire when the run moves on. Index = wire between column k and the next node. */
export const HOPS: readonly (readonly [number, number])[] = [
  [0.292, 0.308],
  [0.49, 0.508],
  [0.574, 0.59],
  [0.652, 0.668],
  [0.76, 0.782],
  [0.85, 0.868],
];

export const laneY = (lane: LaneId, dock: number) => lerp(LANE_Y[lane].full, LANE_Y[lane].dock, dock);
export const COUNTDOWN = POLL_SECONDS;
