import { BLOCKS, CAPTION_LINES, IMAGE_JOBS, RENDER, SCRIPT, VOICE, WORDS } from "./PipeKitData";
import type { SceneCaption } from "./ScrollScene";

/* Render scene: copy, geometry in design units (a 358 by 430 frame, scaled up as one piece) and progress windows. */

export const CAPTIONS: readonly SceneCaption[] = [
  { eyebrow: "01 / Visuals", title: "One image per beat.", body: "Each script block becomes a generated image, requested as a background job." },
  { eyebrow: "02 / Wait", title: "Not ready? Wait and ask again.", body: "The workflow pauses, checks the job, and loops until the image is done." },
  { eyebrow: "03 / Render", title: "Assemble the video.", body: "Audio, images and timed captions go to a template renderer in one request." },
  { eyebrow: "04 / Done", title: `A ${RENDER.ratio} video, saved.`, body: "The finished MP4 link is written back to the sheet row." },
];
export const CHAPTERS = [0, 0.23, 0.47, 0.79, 1] as const;

export const FW = 358;
export const FH = 430;
export const EDGE = 10;

/* ---------- Image slots and their job chips ---------- */

export const SLOT = { w: 60, h: (60 * 16) / 9, pitch: 69.75, y: 22, tagY: 8 } as const;
export const slotX = (i: number) => EDGE + i * SLOT.pitch;
export const slotCx = (i: number) => slotX(i) + SLOT.w / 2;
export const CHIP = { gap: 4, h: 36 } as const;
export const STUB_Y = SLOT.y + SLOT.h + CHIP.gap + CHIP.h + 3;
/** Results come back up the bus along this rail. Prompts go to the Image node along the rail above it, clear of the chips. */
export const RAIL_Y = 198;
export const PROMPT_RAIL_Y = 186;

/* ---------- The poll row: Image (later Render), Wait, Result, Ready? ---------- */

export const ROW_Y = 276;
export const TILE = 40;
export const NODE_X = [39, 132.33, 225.67, 319] as const;
export const LOOP_BOX = { left: 98, right: 349, bottom: 368, radius: 16 } as const;
export const INTERIOR = { x: NODE_X[2], y: ROW_Y + 52 } as const;
export const WAIT_LABEL_Y = ROW_Y - 42;

/* ---------- Timeline lanes ---------- */

export const LANE = { x: 70, w: 278, ruleY: 8, videoY: 24, videoH: 44, audioY: 73, audioH: 22, textY: 100, textH: 18 } as const;
export const LANE_BOTTOM = LANE.textY + LANE.textH;

const CLIP_GAP = 1;
const blockOf = (i: number) => BLOCKS.find((b) => b.id === IMAGE_JOBS[i].block) ?? BLOCKS[i];
export const clipRect = (i: number) => {
  const b = blockOf(i);
  const per = LANE.w / SCRIPT.seconds;
  return { x: LANE.x + b.start * per + CLIP_GAP / 2, y: LANE.videoY, w: (b.end - b.start) * per - CLIP_GAP, h: LANE.videoH };
};
export const slotRect = (i: number) => ({ x: slotX(i), y: SLOT.y, w: SLOT.w, h: SLOT.h });
export const laneX = (seconds: number) => LANE.x + (LANE.w * seconds) / SCRIPT.seconds;
export const blockTag = (i: number) => blockOf(i).id.toUpperCase();

export type CapLine = { readonly text: string; readonly start: number; readonly end: number };

/* Whisper timed the first 24 words. The rest of the script is split into lines of two or three words (evenly, so no line is a
   lone word), spread over what is left of each block. */
const CHUNK = 3;
const TAIL_FILL = 0.86;
const TAIL_LINES: readonly CapLine[] = BLOCKS.slice(1).flatMap((b, k) => {
  const rest = b.text.split(" ").slice(k === 0 ? WORDS.length - BLOCKS[0].words : 0);
  const from = k === 0 ? WORDS[WORDS.length - 1].end : b.start;
  const n = Math.ceil(rest.length / CHUNK);
  return Array.from({ length: n }, (_, j) => {
    const start = from + ((b.end - from) * j) / n;
    return { text: rest.slice(Math.floor((j * rest.length) / n), Math.floor(((j + 1) * rest.length) / n)).join(" "), start, end: start + ((b.end - from) / n) * TAIL_FILL };
  });
});
export const CAPTION_TIMELINE: readonly CapLine[] = [...CAPTION_LINES.map((l) => ({ text: l.text, start: l.start, end: l.end })), ...TAIL_LINES];

/* ---------- The render panel, the phone and the file card ---------- */

export const PANEL = { x: 80, y: 128, w: 268, h: 88, pad: 8, padY: 6, key: 58, step: 16, ringX: 39, ringY: 172, ringR: 27 } as const;
export const PHONE = { x: 16, y: 140, w: 124 } as const;
export const CARD = { x: 156, y: 160, w: 192, h: 64 } as const;
export const RECORD = { x: 156, y: 272, w: 192, h: 62 } as const;
export const WRITE_X = 260;
export const STRIP = { y: FH - EDGE - 26, w: FW - 2 * EDGE, h: 26 } as const;

/* ---------- Progress windows, [from, to] ---------- */

export const TL = {
  type: { from: 0.004, step: 0.008, len: 0.024 },
  reveal: 0.03,
  /* Chapter 3: the five slots fly into their clips together, the lanes fill as they land, the request card follows at once. */
  morph: { from: 0.474, step: 0, len: 0.05 },
  swapNode: [0.48, 0.52],
  lanesIn: [0.478, 0.52],
  audio: [0.51, 0.55],
  caps: [0.525, 0.565],
  panelIn: [0.532, 0.552],
  rows: { from: 0.544, step: 0.01, len: 0.026 },
  send: [0.638, 0.656],
  swapPanel: [0.65, 0.664],
  fileRow: [0.772, 0.79],
  /* Chapter 4 */
  wipe: [0.79, 0.835],
  card: [0.822, 0.852],
  playOn: [0.83, 0.85],
  play: [0.86, 0.925],
  write: [0.928, 0.95],
  record: [0.946, 0.96],
  strip: [0.958, 0.978],
  status: 0.978,
  saved: [0.978, 0.992],
  dim: [0.79, 0.84],
} as const;

export const typeWin = (i: number) => [TL.type.from + i * TL.type.step, TL.type.from + i * TL.type.step + TL.type.len] as const;
export const morphWin = (i: number) => [TL.morph.from + i * TL.morph.step, TL.morph.from + i * TL.morph.step + TL.morph.len] as const;
export const rowWin = (k: number) => [TL.rows.from + k * TL.rows.step, TL.rows.from + k * TL.rows.step + TL.rows.len] as const;

/** The finished video has one file name everywhere (RENDER.file). The job id b81d is only ever shown as "job b81d". */
export const FILE_NAME = RENDER.file;
export const LINK_TEXT = `cdn/${FILE_NAME}`;
/** The voiceover is 0:41 and the video is 0:42, so the audio lane ends AUDIO_GAP_SECONDS before the end of the video axis. */
export const AUDIO_SECONDS = VOICE.seconds;
export const AUDIO_TEXT = VOICE.label;
export const VIDEO_TEXT = RENDER.label;
export const AUDIO_GAP_SECONDS = RENDER.seconds - AUDIO_SECONDS;
/** Where the audio lane ends on the timeline, in frame units. The video axis ends at laneX(SCRIPT.seconds), the same 42 s as RENDER.seconds. */
export const AUDIO_END_X = laneX(AUDIO_SECONDS);

export const SIZE_TEXT = `${RENDER.width} x ${RENDER.height}`;
export const SPEC_TEXT = `${RENDER.ratio}, ${RENDER.fps} fps, ${RENDER.label}`;
