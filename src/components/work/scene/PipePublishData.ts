import type { Pt } from "./PipeKitPath";
import { BLOCKS, NODE, READY_STATUS, RENDER, SHEET_RENDERED, SHEET_ROWS, SHEET_SKIPPED, SHEET_TOTAL, TAGS, WRITEBACK, fmtClock } from "./PipeKitData";
import type { SceneCaption } from "./ScrollScene";

/* Publishing scene: copy, stage geometry and progress windows. Numbers and strings come from PipeKitData. */

export const CAPTIONS: readonly SceneCaption[] = [
  { eyebrow: "01 / Ready", title: "Only finished rows post.", body: "The publisher reads rows marked ready and ignores everything else." },
  { eyebrow: "02 / Upload", title: "Media goes up once.", body: "The video is uploaded a single time and reused by both platforms." },
  { eyebrow: "03 / Post", title: "TikTok and Instagram, together.", body: "Two posting nodes run in parallel from the same upload." },
  { eyebrow: "04 / Log", title: "The row records the result.", body: "Status, post ids and time are written back, so every post is traceable." },
];
export const CHAPTERS = [0, 0.22, 0.48, 0.76, 1] as const;

/* Stage geometry. One unit is 1/358 of the stage width, and the stage keeps a fixed aspect so the svg wires and the html
   positions agree at every size. There are two stage heights: WIDE (358 by 385) for boxes close to square, TALL (358 by
   500) for phones, where a wide stage would leave dead bands above and below. Every y, and every vertical size, is
   scaled by H / 385; x is not, so the columns keep their places. */
export const W = 358;
const BASE_H = 385;
export const TALL_FROM = 1.36;
export const ROWS = SHEET_ROWS.length;
export const READY_INDEX = SHEET_ROWS.findIndex((r) => r.status === READY_STATUS);

export function makeGeo(H: number) {
  const k = H / BASE_H;
  const y = (v: number) => v * k;
  const cqhN = (units: number) => (units / H) * 100;
  const cqh = (units: number) => `${cqhN(units).toFixed(3)}cqh`;
  const SIZE = { head: y(22), row: y(24), body: y(64), sub: y(22), pad: y(5), gutter: 8 } as const;
  const thumbH = SIZE.body - 2 * SIZE.pad;
  const post = (x: number, top: number) => [x, y(top)] as Pt;
  return {
    H,
    tall: H > BASE_H,
    cqh,
    cqhN,
    SIZE,
    GUTTER: cqh(SIZE.gutter),
    SHEET_H: SIZE.head + ROWS * SIZE.row + SIZE.sub,
    THUMB: { left: SIZE.gutter, h: thumbH, w: (thumbH * 9) / 16 },
    PT: {
      thumb: [SIZE.gutter + (thumbH * 9) / 32, SIZE.head + SIZE.row + SIZE.body / 2] as Pt,
      up: post(W / 2, 146),
      posts: [post(W * 0.25, 218), post(W * 0.75, 218)],
      write: post(W / 2, 254),
      low: [post(W * 0.25, 342), post(W * 0.75, 342)],
    },
    POST_CARD: { w: 168, top: y(258) },
    CAPTION_ROW: y(56),
    pctOf: ([x, top]: Pt): [number, number] => [(x / W) * 100, (top / H) * 100],
    xPct: (x: number) => `${((x / W) * 100).toFixed(3)}%`,
  } as const;
}
export type Geo = ReturnType<typeof makeGeo>;
export const WIDE = makeGeo(BASE_H);
export const TALL = makeGeo(500);

/* The stage sizes its node tiles with one css var. */
export const TILE = "clamp(32px, 9.6cqw, 54px)";

/* Media and posts. */
export const FILE_NAME = RENDER.file;
export const META = [FILE_NAME, `${RENDER.width} x ${RENDER.height}, ${RENDER.ratio}`, `${RENDER.fps} fps, ${fmtClock(RENDER.seconds)}`] as const;
/** The same facts on two lines, for a stage too narrow for the card to hold three lines and the block strip. */
export const META_NARROW = [META[0], `${META[1]}, ${META[2]}`] as const;

const KEPT = TAGS.filter((t) => t.kept).map((t) => t.tag);
/** Both platforms post the same caption and the same tags, in the same order. Only the node and the returned post id differ. */
export const POST_CAPTION = BLOCKS[0].line;
export const POST_TAGS = [KEPT[0], KEPT[1], KEPT[2], KEPT[3]] as const;
export const POSTS = [
  { node: NODE.tiktok, caption: POST_CAPTION, tags: POST_TAGS, id: WRITEBACK.tiktokId },
  { node: NODE.instagram, caption: POST_CAPTION, tags: POST_TAGS, id: WRITEBACK.instagramId },
] as const;
export const INFO = [FILE_NAME, "uploaded once", `reused by ${POSTS.length} posts`] as const;
export const FIELDS = [
  { key: "tiktok", value: WRITEBACK.tiktokId },
  { key: "instagram", value: WRITEBACK.instagramId },
  { key: "at", value: WRITEBACK.at },
] as const;
export const FILTER_TEXT = `status = ${READY_STATUS}`;
/** Header readout while the sheet is filtered: "1 of 6 rows rendered, 5 skipped", counted from the sheet rows. */
export const READY_TEXT = `${SHEET_RENDERED} of ${SHEET_TOTAL} rows ${READY_STATUS}, ${SHEET_SKIPPED} skipped`;
export const RATIO = RENDER.ratio;

/* Progress windows, [from, to] unless noted. */
export const TL = {
  sweep: [0.025, 0.115],
  collapse: { from: 0.122, step: 0.0055, len: 0.02 },
  expand: [0.158, 0.218],
  feed: [0.226, 0.262],
  ride: [0.234, 0.292],
  upload: [0.292, 0.428],
  done: [0.428, 0.448],
  roll1: [0.44, 0.456],
  wake: 0.472,
  fork: [0.474, 0.528],
  roll2: [0.5, 0.516],
  twin: [
    [0.5, 0.585],
    [0.504, 0.59],
  ],
  slot: [
    [0.578, 0.604],
    [0.582, 0.608],
  ],
  words: [
    [0.592, 0.65],
    [0.598, 0.656],
  ],
  tags: [
    [0.628, 0.658],
    [0.634, 0.664],
  ],
  post: [
    [0.664, 0.714],
    [0.668, 0.728],
  ],
  tick: [0.714, 0.728],
  fold: [0.762, 0.784],
  slide: [0.778, 0.808],
  fade: [0.772, 0.797],
  forkFade: [0.792, 0.808],
  skel: [0.14, 0.19],
  chips: [
    [0.812, 0.83],
    [0.818, 0.836],
  ],
  reopen: { from: 0.776, step: 0.005, len: 0.02 },
  retract: [0.772, 0.812],
  showWrite: [0.804, 0.822],
  write: [0.826, 0.862],
  up: [0.862, 0.888],
  sub: [0.822, 0.85],
  fields: [
    [0.89, 0.908],
    [0.898, 0.916],
    [0.906, 0.924],
  ],
  flip: [0.925, 0.947],
  final: [0.95, 0.985],
} as const;

export const STATUS_AT = [-1, -1, -1, -1, (TL.flip[0] + TL.flip[1]) / 2] as const;
export const PARALLEL_TEXT = "parallel";

/* The five script blocks as a strip on the card: width by seconds, one tone for the hook, the points and the call to action. */
const BLOCK_TONE = { hook: "var(--color-sun)", p1: "var(--color-sky)", p2: "var(--color-sky)", p3: "var(--color-sky)", cta: "var(--color-rose)" } as const;
export const BLOCK_STRIP = BLOCKS.map((b) => ({ id: b.id, seconds: b.end - b.start, tone: BLOCK_TONE[b.id] }));

/* The upload bar is the same five blocks: each fills over its share of the run, so the bar shows which part is up. */
const CUTS = BLOCK_STRIP.reduce<readonly number[]>((acc, b) => [...acc, acc[acc.length - 1] + b.seconds], [0]);
export const BLOCK_SEGS = BLOCK_STRIP.map((b, i) => ({ ...b, from: CUTS[i] / CUTS[CUTS.length - 1], to: CUTS[i + 1] / CUTS[CUTS.length - 1] }));
