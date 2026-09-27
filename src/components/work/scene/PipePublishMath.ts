import { easeInOutCubic } from "./HealthSceneParts";
import { WRITEBACK, ROW_ID } from "./PipeKitData";
import { clamp01, keyframes, lerp, segAt } from "./PipeKitMath";
import { POSTS, READY_INDEX, READY_TEXT, ROWS, TL } from "./PipePublishData";

/* Pure functions of scene progress: sheet rows, upload, posts, write-back and the header readout. */

const MAX_DIST = Math.max(READY_INDEX, ROWS - 1 - READY_INDEX);
const DIM = 0.6;
/* A row's text is gone before its box is clipped through the glyphs: opacity runs 0 to 1 over the last fifth of the height. */
const FADE_FLOOR = 0.78;
const FADE_SPAN = 0.2;
/* Card text appears once the box is open past the last line, so no line is ever cut at the edge. */
const TEXT_FROM = 0.8;
const TEXT_SPAN = 0.18;
/* The card's thumbnail is fully drawn once the box is open past its bottom edge, and gone before the box closes through it. */
const THUMB_FROM = 0.72;
const THUMB_SPAN = 0.2;
/* While its copy rides down the wire the original keeps only this much of its art: it reads as a slot the copy left. */
const HOLLOW = 0.65;
const HOLLOW_IN = 0.012;
const HOLLOW_OUT = 0.02;
/* Waiting posts: the light crosses a post SHEEN_LAPS times over the whole scroll, the second post half a lap behind. */
const SHEEN_LAPS = 5;
const SHEEN_LAG = 0.5;
export const PACKETS = 3;
export const PACKET_LAPS = 5;
const fract = (v: number) => v - Math.floor(v);

const distance = (i: number) => Math.abs(i - READY_INDEX);
export const checkAt = (i: number) => lerp(TL.sweep[0], TL.sweep[1], (i + 0.5) / ROWS);
export const sweepAt = (v: number) => segAt(v, TL.sweep[0], TL.sweep[1]);

function reopenWindow(i: number) {
  const from = TL.reopen.from + (distance(i) - 1) * TL.reopen.step;
  return [from, from + TL.reopen.len] as const;
}

/** Height share of a row that is not ready: 1 open, 0 collapsed. It closes after the sweep and opens again at the end. */
export function rowOpen(v: number, i: number) {
  const from = TL.collapse.from + (MAX_DIST - distance(i)) * TL.collapse.step;
  const [r0, r1] = reopenWindow(i);
  return 1 - segAt(v, from, from + TL.collapse.len, easeInOutCubic) + segAt(v, r0, r1, easeInOutCubic);
}

function rowDim(v: number, i: number) {
  const t = checkAt(i);
  const [r0, r1] = reopenWindow(i);
  return segAt(v, t - 0.006, t + 0.012) * (1 - segAt(v, r0, r1));
}

export function rowOpacity(v: number, i: number) {
  return (1 - DIM * rowDim(v, i)) * clamp01((rowOpen(v, i) - FADE_FLOOR) / FADE_SPAN);
}

/** 0 to 1 opacity for text inside a box that is `open` (0 to 1) tall. */
export const revealAt = (open: number) => clamp01((open - TEXT_FROM) / TEXT_SPAN);

/** Opacity of the thumbnail in a card that is `open` (0 to 1) tall. */
export const thumbShowAt = (open: number) => clamp01((open - THUMB_FROM) / THUMB_SPAN);
/** Opacity of the original thumbnail art: it goes hollow as its copy leaves and fills again once the copy has landed. */
export const artAt = (v: number) => 1 - HOLLOW * segAt(v, TL.ride[0], TL.ride[0] + HOLLOW_IN) * (1 - segAt(v, TL.ride[1], TL.ride[1] + HOLLOW_OUT));

/** 0 to 1 position of the light that scans waiting post `i`. */
export const sheenAt = (v: number, i: number) => fract(v * SHEEN_LAPS + i * SHEEN_LAG);
/** Opacity of the "waiting for media" label: it breathes between 0.55 and 1 with the same lap. */
export const waitPulseAt = (v: number, i: number) => 0.775 - 0.225 * Math.cos(2 * Math.PI * sheenAt(v, i));

/** The ready row unfolds into a card after the others collapse, and folds back into a row at the end. */
export const bodyOpenAt = (v: number) => keyframes(v, [TL.expand[0], TL.expand[1], TL.retract[0], TL.retract[1]], [0, 1, 1, 0]);

export const uploadAt = (v: number) => segAt(v, TL.upload[0], TL.upload[1]);
/** Video chunk k on the feed wire, 0 to 1 along it, or 0 (hidden) outside the upload. */
export function packetAt(v: number, k: number) {
  const level = uploadAt(v);
  return level <= 0 || level >= 1 ? 0 : fract(level * PACKET_LAPS + k / PACKETS);
}
/** Ripple leaving the upload node: one per chunk lap while the bar fills, then one when the posts wake. */
export function uploadPulseAt(v: number) {
  if (v < TL.upload[0]) return 0;
  return v < TL.done[0] ? fract(uploadAt(v) * PACKET_LAPS) : clamp01((v - TL.wake) / 0.05);
}
/** The pipeline below the sheet wakes as the sheet closes, and the upload part leaves before the sheet reopens. */
export const skelAt = (v: number) => segAt(v, TL.skel[0], TL.skel[1]);
export const upVisAt = (v: number) => skelAt(v) * (1 - segAt(v, TL.fade[0], TL.fade[1]));
export const forkVisAt = (v: number) => skelAt(v) * (1 - segAt(v, TL.forkFade[0], TL.forkFade[1]));
/** Both posting nodes drop together, so the wires that follow them stay level. */
export const slideAt = (v: number) => segAt(v, TL.slide[0], TL.slide[1], easeInOutCubic);
export const postedCount = (v: number) => POSTS.filter((_, i) => v >= TL.tick[i]).length;
const postingAt = (v: number, i: number) => segAt(v, TL.post[i][0], TL.post[i][1]);
export const writtenCount = (v: number) => TL.fields.filter(([a]) => v >= a).length;

/** Header readout, one line per beat of the story. */
export function readoutAt(v: number) {
  if (v < TL.collapse.from) return `${Math.floor(sweepAt(v) * ROWS + 0.001)}/${ROWS} rows checked`;
  if (v < TL.feed[0]) return READY_TEXT;
  if (v < TL.done[0]) return `upload ${Math.round(uploadAt(v) * 100)}%`;
  if (v < TL.wake) return "uploaded, 1 time";
  if (v < TL.slot[0][0]) return `${POSTS.length} posts in parallel`;
  if (v < TL.fold[0]) {
    const posted = postedCount(v);
    if (posted > 0) return `posted ${posted}/${POSTS.length}`;
    return `posting ${Math.round(((postingAt(v, 0) + postingAt(v, 1)) / 2) * 100)}%`;
  }
  if (v < TL.write[0]) return `${WRITEBACK.tiktokId}, ${WRITEBACK.instagramId}`;
  if (v < TL.flip[0]) return `write back ${writtenCount(v)}/${TL.fields.length}`;
  return `row ${ROW_ID} ${WRITEBACK.status}`;
}
