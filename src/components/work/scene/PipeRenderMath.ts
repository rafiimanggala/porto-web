import { BLOCKS, IMAGE_JOBS, POLL_SECONDS, RENDER, SCRIPT } from "./PipeKitData";
import { clamp01, segAt } from "./PipeKitMath";
import { linePath, polyPath, type Pt, type WirePath } from "./PipeKitPath";
import {
  CAPTION_TIMELINE,
  LOOP_BOX,
  NODE_X,
  PANEL,
  RAIL_Y,
  ROW_Y,
  STUB_Y,
  TL,
  slotCx,
} from "./PipeRenderData";
import { PROMPT, chipOnAt, departWin, promptWin } from "./PipeRenderFlight";

/* Pure geometry and timing for the poll loop. Nothing here reads a clock: every answer is a function of progress. */

const node = (i: number): Pt => [NODE_X[i], ROW_Y];
export const W_IN = linePath(node(0), node(1));
export const W_AB = linePath(node(1), node(2));
export const W_BC = linePath(node(2), node(3));
export const LOOP = polyPath(
  [node(3), [LOOP_BOX.right, ROW_Y], [LOOP_BOX.right, LOOP_BOX.bottom], [LOOP_BOX.left, LOOP_BOX.bottom], [LOOP_BOX.left, ROW_Y], node(1)],
  LOOP_BOX.radius,
);
export const BUS = IMAGE_JOBS.map((_, i) => polyPath([node(3), [NODE_X[3], RAIL_Y], [slotCx(i), RAIL_Y], [slotCx(i), STUB_Y]], 9));
export const SEND = linePath([NODE_X[0], PANEL.ringY + PANEL.ringR + 3], node(0));
export const RENDER_OUT = linePath(node(3), [NODE_X[3], PANEL.y + PANEL.h]);

/* ---------- Chains: several wires walked as one ---------- */

type Chain = { readonly segs: readonly WirePath[]; readonly cum: readonly number[]; readonly total: number };

function chain(segs: readonly WirePath[]): Chain {
  const cum = segs.reduce<readonly number[]>((acc, s) => [...acc, acc[acc.length - 1] + s.length], [0]);
  return { segs, cum, total: cum[cum.length - 1] };
}

const LOOP_CHAIN = chain([W_AB, W_BC, LOOP]);
const BUS_CHAINS = BUS.map((b) => chain([W_AB, W_BC, b]));
const RENDER_CHAIN = chain([W_AB, W_BC, RENDER_OUT]);
const IN_CHAIN = chain([W_IN]);
const SEND_CHAIN = chain([SEND, W_IN]);
const PROMPT_CHAINS = PROMPT.map((w) => chain([w]));

/** 0 accent (on the row), 1 sun (looping back), 2 mint (leaving with a result), 3 sky (a prompt going to the Image node). */
export type Tone = 0 | 1 | 2 | 3;
export type Pose = { readonly x: number; readonly y: number; readonly o: number; readonly tone: Tone };
const HIDDEN: Pose = { x: 0, y: 0, o: 0, tone: 0 };
const EDGE_FADE = 8;

function poseOn(c: Chain, d: number, tone: (seg: number) => Tone): Pose {
  if (d <= 0 || d >= c.total) return HIDDEN;
  const seg = Math.max(0, c.cum.findIndex((x) => d <= x) - 1);
  const s = c.segs[seg];
  const [x, y] = s.at((d - c.cum[seg]) / s.length);
  return { x, y, o: Math.min(1, d / EDGE_FADE, (c.total - d) / (EDGE_FADE * 1.5)), tone: tone(seg) };
}

/* ---------- Rounds: wait, ask, decide, then loop back or leave ---------- */

export type Cfg = { readonly r0: number; readonly round: number; readonly wait: number; readonly gap: number; readonly speed: number };
const LAP = W_AB.length + W_BC.length + LOOP.length;
const makeCfg = (r0: number, round: number, wait: number, gap: number): Cfg => ({ r0, round, wait, gap, speed: LAP / (round - wait) });

export const IMG = makeCfg(0.205, 0.078, 0.022, 11);
export const REN = makeCfg(0.66, 0.03, 0.006, 0);
export const startAt = (c: Cfg, r: number) => c.r0 + r * c.round;
export const goAt = (c: Cfg, r: number) => startAt(c, r) + c.wait;
export const headAt = (c: Cfg, r: number, dist: number) => goAt(c, r) + dist / c.speed;

const range = (n: number) => Array.from({ length: n }, (_, r) => r);
/** The round in which each image job finally answers "ready": its number of "not ready" answers. */
export const EXIT: readonly number[] = IMAGE_JOBS.map((j) => j.polls);
export const IMG_ROUNDS = range(Math.max(...EXIT) + 1);
export const REN_ROUNDS = range(RENDER.polls + 1);
const pendingIn = (r: number) => EXIT.flatMap((e, i) => (e >= r ? [i] : []));
const rankOf = (i: number, r: number) => pendingIn(r).indexOf(i);

function roundPose(v: number, cfg: Cfg, e: number, rank: (r: number) => number, exit: Chain): Pose {
  const r = Math.min(e, Math.floor((v - goAt(cfg, 0)) / cfg.round));
  if (r < 0) return HIDDEN;
  const looping = r < e;
  const d = (v - goAt(cfg, r)) * cfg.speed - rank(r) * cfg.gap;
  return poseOn(looping ? LOOP_CHAIN : exit, d, (seg) => (seg < 2 ? 0 : looping ? 1 : 2));
}

const tripPose = (v: number, win: readonly [number, number], c: Chain, tone: Tone = 0): Pose => poseOn(c, segAt(v, win[0], win[1]) * c.total, () => tone);
const seen = (a: Pose, b: Pose) => (a.o > 0 ? a : b);

export const promptPose = (v: number, i: number): Pose => tripPose(v, promptWin(i), PROMPT_CHAINS[i], 3);
export const imagePose = (v: number, i: number): Pose =>
  seen(tripPose(v, departWin(i), IN_CHAIN), roundPose(v, IMG, EXIT[i], (r) => rankOf(i, r), BUS_CHAINS[i]));
export const renderPose = (v: number): Pose => seen(tripPose(v, TL.send, SEND_CHAIN), roundPose(v, REN, RENDER.polls, () => 0, RENDER_CHAIN));

/* ---------- What each job knows at progress v ---------- */

export const askAt = (i: number, r: number) => headAt(IMG, r, W_AB.length + rankOf(i, r) * IMG.gap);
export const arriveAt = (i: number) => headAt(IMG, EXIT[i], BUS_CHAINS[i].total + rankOf(i, EXIT[i]) * IMG.gap);
/** How much of bus wire i its result has travelled: the bus is drawn only by results coming back along it. */
export const busDrawAt = (v: number, i: number) =>
  clamp01(((v - goAt(IMG, EXIT[i])) * IMG.speed - rankOf(i, EXIT[i]) * IMG.gap - W_AB.length - W_BC.length) / BUS[i].length);
export const pollsAt = (v: number, i: number) => range(EXIT[i] + 1).filter((r) => v >= askAt(i, r)).length;
const TICK_LEN = 0.018;
/** 1 right after the job was asked, cooling to 0: makes the poll counter flash when it ticks. */
export function tickAt(v: number, i: number) {
  const last = range(EXIT[i] + 1).reduce((m, r) => (askAt(i, r) <= v ? askAt(i, r) : m), -1);
  return last < 0 ? 0 : 1 - clamp01((v - last) / TICK_LEN);
}
export const readyCount = (v: number) => IMAGE_JOBS.filter((_, i) => v >= arriveAt(i)).length;

/** 0 no chip yet, 1 queued, 2 rendering (asked, not ready), 3 done. */
export type Phase = 0 | 1 | 2 | 3;
export const phaseAt = (v: number, i: number): Phase => (v < chipOnAt(i) ? 0 : v >= arriveAt(i) ? 3 : v >= askAt(i, 0) ? 2 : 1);

export const RENDER_START = TL.send[1];
export const renderReadyAt = headAt(REN, RENDER.polls, RENDER_CHAIN.total);
/** When the final "ready" answer starts up the wire to the panel: that wire exists only from here. */
export const renderOutAt = headAt(REN, RENDER.polls, W_AB.length + W_BC.length);
export const renderPolls = (v: number) => REN_ROUNDS.filter((r) => v >= headAt(REN, r, W_AB.length)).length;
export const renderPct = (v: number) => Math.round(100 * segAt(v, RENDER_START, renderReadyAt));
export const imagePolls = (v: number) => IMG_ROUNDS.filter((r) => v >= headAt(IMG, r, W_AB.length)).length;

/* ---------- Node activity ---------- */

const spans = (c: Cfg, rounds: readonly number[]) => rounds.map((r) => [startAt(c, r), goAt(c, r)] as const);
export const WAITS = [...spans(IMG, IMG_ROUNDS), ...spans(REN, REN_ROUNDS)];
const events = (dist: number) => [...IMG_ROUNDS.map((r) => headAt(IMG, r, dist)), ...REN_ROUNDS.map((r) => headAt(REN, r, dist))];
export const ASKS = events(W_AB.length);
export const DECIDES = events(W_AB.length + W_BC.length);

export const tentMax = (v: number, centres: readonly number[], half: number) => centres.reduce((m, c) => Math.max(m, clamp01(1 - Math.abs(v - c) / half)), 0);
export const insideMax = (v: number, wins: readonly (readonly [number, number])[], edge: number) =>
  wins.reduce((m, [a, b]) => Math.max(m, clamp01(Math.min(v - a, b - v) / edge + 0.5)), 0);

/** 0..1 since the latest event began: a one shot ripple for PipeNode. */
export function sawAt(v: number, times: readonly number[], len: number) {
  const last = times.reduce((m, t) => (t <= v ? t : m), -1);
  return last < 0 ? 0 : clamp01((v - last) / len);
}

/** Seconds left on the Wait node: counts down through each wait and holds at zero until the next one. */
export function secondsLeft(v: number) {
  const w = WAITS.reduce<readonly [number, number] | undefined>((m, s) => (s[0] <= v ? s : m), undefined);
  return w ? Math.ceil(POLL_SECONDS * (1 - segAt(v, w[0], w[1]))) : POLL_SECONDS;
}
export function drained(v: number) {
  const w = WAITS.reduce<readonly [number, number] | undefined>((m, s) => (s[0] <= v ? s : m), undefined);
  return w ? 1 - segAt(v, w[0], w[1]) : 1;
}

/* ---------- Lit wires: a wire glows while the head of the train is on it, then cools ---------- */

export type Pass = { readonly t0: number; readonly t1: number; readonly hold?: number; readonly fade?: number };
const GLOW_FADE = 0.014;
const PROMPT_FADE = 0.008;
const laps = (c: Cfg, rounds: readonly number[], from: number, len: number): Pass[] => rounds.map((r) => ({ t0: headAt(c, r, from), t1: headAt(c, r, from + len) }));
const loopRounds = (n: number) => range(n);

const SEND_SPLIT = TL.send[0] + ((TL.send[1] - TL.send[0]) * SEND.length) / SEND_CHAIN.total;
export const PASSES = {
  in: [
    { t0: departWin(0)[0], t1: departWin(0)[1], hold: departWin(IMAGE_JOBS.length - 1)[1] - departWin(0)[1] },
    { t0: SEND_SPLIT, t1: TL.send[1] },
  ] as Pass[],
  send: [{ t0: TL.send[0], t1: SEND_SPLIT }] as Pass[],
  prompt: PROMPT.map((_, i): Pass[] => [{ t0: promptWin(i)[0], t1: promptWin(i)[1], fade: PROMPT_FADE }]),
  ab: [...laps(IMG, IMG_ROUNDS, 0, W_AB.length), ...laps(REN, REN_ROUNDS, 0, W_AB.length)],
  bc: [...laps(IMG, IMG_ROUNDS, W_AB.length, W_BC.length), ...laps(REN, REN_ROUNDS, W_AB.length, W_BC.length)],
  loop: [...laps(IMG, loopRounds(Math.max(...EXIT)), W_AB.length + W_BC.length, LOOP.length), ...laps(REN, loopRounds(RENDER.polls), W_AB.length + W_BC.length, LOOP.length)],
};

export function flowAt(v: number, passes: readonly Pass[]) {
  const pass = passes.reduce<Pass | undefined>((m, s) => (s.t0 <= v ? s : m), undefined);
  if (!pass) return { draw: 0, glow: 0 };
  const end = pass.t1 + (pass.hold ?? 0);
  return { draw: clamp01((v - pass.t0) / (pass.t1 - pass.t0)), glow: v <= end ? 1 : 1 - clamp01((v - end) / (pass.fade ?? GLOW_FADE)) };
}

/* ---------- The playback in chapter 4 ---------- */

export const playSeconds = (v: number) => SCRIPT.seconds * segAt(v, TL.play[0], TL.play[1]);

const FIRST_LINE = CAPTION_TIMELINE[0];
const LAST_LINE = CAPTION_TIMELINE[CAPTION_TIMELINE.length - 1];

/** The line on screen at `seconds`. The poster frame shows the first line, lines fade shortly after they end, and the last one stays on the resting end frame. */
export function captionAt(seconds: number) {
  const line = CAPTION_TIMELINE.reduce((m, l) => (l.start <= seconds ? l : m), FIRST_LINE);
  return line === LAST_LINE || seconds <= line.end + 0.3 ? line.text : "";
}

export const blockIndexAt = (seconds: number) => Math.max(0, BLOCKS.findIndex((b) => seconds < b.end) === -1 ? BLOCKS.length - 1 : BLOCKS.findIndex((b) => seconds < b.end));
