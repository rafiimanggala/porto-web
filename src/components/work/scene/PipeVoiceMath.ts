import { easeInOutCubic, easeOutCubic } from "./HealthSceneParts";
import { CAPTION_LINES, WORDS } from "./PipeKitData";
import { clamp01, lerp, segAt } from "./PipeKitMath";
import { DURATION, EDGE_PX, EDGE_SECONDS, SAMPLE_END, TL, TONES, VIEW } from "./PipeVoiceData";

/* Pure maths: speech envelope, waveform path, lane view, playheads, word and line phases. */

export const hash01 = (n: number) => (Math.imul(n + 0x9e37, 2246822519) >>> 0) % 1000 / 1000;

type Span = { start: number; end: number; level: number };

const TAIL_FROM = 9.1;
const TAIL_COUNT = 96;
const tailDur = (k: number) => 0.16 + ((k * 37) % 7) * 0.045;
const tailGap = (k: number) => (k % 9 === 8 ? 0.34 : 0.05 + ((k * 13) % 4) * 0.025);

const TAIL: readonly Span[] = Array.from({ length: TAIL_COUNT }).reduce<Span[]>((spans, _, k) => {
  const start = spans.length ? spans[spans.length - 1].end + tailGap(k - 1) : TAIL_FROM;
  return [...spans, { start, end: start + tailDur(k), level: 0.5 + 0.5 * hash01(k * 11 + 5) }];
}, []);

const SPEECH: readonly Span[] = [
  ...WORDS.map((w, i) => ({ start: w.start, end: w.end, level: 0.62 + 0.38 * hash01(i * 7 + 3) })),
  ...TAIL.filter((s) => s.start < DURATION),
];

export const BAR_DT = 0.05;
export const BAR_COUNT = Math.round(DURATION / BAR_DT);
export const UNITS = 100;
export const VB_W = DURATION * UNITS;

function ampAt(i: number) {
  const t = (i + 0.5) * BAR_DT;
  const span = SPEECH.find((s) => t >= s.start && t < s.end);
  if (!span) return 0.05 + 0.05 * hash01(i * 3 + 1);
  const u = (t - span.start) / (span.end - span.start);
  return 0.1 + 0.9 * Math.pow(Math.sin(Math.PI * u), 0.6) * span.level * (0.7 + 0.3 * hash01(i * 5 + 2));
}

export const AMP: readonly number[] = Array.from({ length: BAR_COUNT }, (_, i) => ampAt(i));

export const loudAt = (t: number) => AMP[Math.min(BAR_COUNT - 1, Math.max(0, Math.round(t / BAR_DT)))];

const HALF_MIN = 2;
const HALF_MAX = 46;
const BAR_W = BAR_DT * UNITS * 0.64;
const FRONT = 0.16;

const bar = (i: number, half: number) => `M${(i * BAR_DT * UNITS).toFixed(1)} ${(50 - half).toFixed(1)}h${BAR_W.toFixed(1)}v${(half * 2).toFixed(1)}h-${BAR_W.toFixed(1)}z`;

const FULL_PATH = AMP.map((a, i) => bar(i, HALF_MIN + a * (HALF_MAX - HALF_MIN))).join("");

/** A faint, flattened copy of the waveform, shown in the empty lane before any audio exists. */
export const GHOST_PATH = AMP.map((a, i) => bar(i, HALF_MIN + a * (HALF_MAX - HALF_MIN) * 0.22)).join("");

export function barsPath(grow: number): string {
  if (grow <= 0) return "";
  if (grow >= 1) return FULL_PATH;
  const front = grow * (1 + FRONT);
  return AMP.map((a, i) => bar(i, HALF_MIN + a * (HALF_MAX - HALF_MIN) * easeOutCubic(clamp01((front - i / BAR_COUNT) / FRONT)))).join("");
}

export const reachedAt = (v: number) => SAMPLE_END * segAt(v, TL.sweepA[0], TL.sweepA[1]);

export const headAt = (v: number) =>
  SAMPLE_END * (segAt(v, TL.sweepA[0], TL.sweepA[1]) - segAt(v, TL.rewind[0], TL.rewind[1], easeInOutCubic) + segAt(v, TL.sweepB[0], TL.sweepB[1]));

/** The lane playhead as seen by the word highlights: parked far left during the rewind so nothing flashes. */
export const hotHeadAt = (v: number) => (v > TL.rewind[0] && v < TL.voiced ? -1 : headAt(v));

export const phoneHeadAt = (v: number) => SAMPLE_END * segAt(v, TL.sweepB[0], TL.sweepB[1]);

/** Visible window of the lane: `win` seconds wide starting at `t0`. */
export function viewAt(v: number) {
  const zin = segAt(v, TL.zoomIn[0], TL.zoomIn[1], easeInOutCubic);
  const zout = segAt(v, TL.zoomOut[0], TL.zoomOut[1], easeInOutCubic);
  const win = Math.exp(lerp(lerp(Math.log(VIEW.full), Math.log(VIEW.zoom), zin), Math.log(VIEW.words), zout));
  const follow = Math.max(0, reachedAt(v) - VIEW.lead * win);
  return { win, t0: lerp(follow, 0, zout) };
}

/** Width in px of the fade at each edge of the lane window: only where more lane lies beyond that edge. */
export function edgePx(t0: number, win: number) {
  return { left: EDGE_PX * clamp01(t0 / EDGE_SECONDS), right: EDGE_PX * clamp01((DURATION - (t0 + win)) / EDGE_SECONDS) };
}

export const wordReach = (t: number, i: number) => segAt(t, WORDS[i].start - 0.03, WORDS[i].start + 0.05);

export const wordCur = (t: number, i: number) => wordReach(t, i) * (1 - segAt(t, WORDS[i].end - 0.03, WORDS[i].end + 0.06));

export const lineIdxAt = (t: number) =>
  CAPTION_LINES.reduce((sum, l, k) => (k === 0 ? 0 : sum + easeInOutCubic(segAt(t, l.start - 0.03, l.start + 0.06))), 0);

export const lineCur = (idx: number, k: number) => clamp01(1 - Math.abs(idx - k));

export const LINE_WORDS = CAPTION_LINES.map((l) => WORDS.slice(l.from, l.from + l.count));

export const groupAt = (v: number, k: number) => segAt(v, TL.group.from + k * TL.group.step, TL.group.from + k * TL.group.step + TL.group.len, easeOutCubic);
const parseFrom = (k: number) => TL.parse.from + k * TL.parse.step;
export const parseAt = (v: number, k: number) => segAt(v, parseFrom(k), parseFrom(k) + TL.parse.len, easeOutCubic);
/** 0 to 1 to 0 while line k is being read: a scan flash that runs down the card rows and the caption track together. */
export const parseFlashAt = (v: number, k: number) => Math.sin(Math.PI * segAt(v, parseFrom(k), parseFrom(k) + TL.parse.len));

export const groupedCount = (v: number) => CAPTION_LINES.filter((_, k) => v >= TL.group.from + k * TL.group.step + TL.group.len * 0.5).length;

/** A log row scrolls in just before its word starts, so the active row is always fully on screen. */
export const rowInAt = (t: number, i: number) => segAt(t, Math.max(0, WORDS[i].start - 0.2), Math.max(0.06, WORDS[i].start - 0.02), easeOutCubic);

export const rowsShownAt = (t: number) => WORDS.reduce((n, _, i) => n + rowInAt(t, i), 0);

export const toneOf = (line: number) => TONES[line % TONES.length];

export const toneMix = (line: number, amount: number, hot = 0) =>
  `color-mix(in oklab, var(--color-accent) ${(hot * 100).toFixed(1)}%, color-mix(in oklab, ${toneOf(line)} ${(amount * 100).toFixed(1)}%, var(--color-line-strong)))`;
