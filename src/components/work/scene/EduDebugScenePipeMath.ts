import { PIPE_TL } from "./EduDebugSceneData";
import { clamp01, keyframes, lerp } from "./EduDebugSceneKit";
import { easeInOutCubic } from "./HealthSceneParts";

/* Packet geometry on the pipeline page, as fractions of the stage. */

const ROW_COUNTS = [2, 3, 4, 5] as const;
const ROW_Y = [0.578, 0.514, 0.45, 0.386] as const;
const GAP_X = 0.085;
const CENTER_X = 0.5;

/* Snake order keeps neighbouring slots close, so packets glide between rows. */
export const SLOTS = ROW_COUNTS.flatMap((count, r) => {
  const row = Array.from({ length: count }, (_, k) => ({ x: CENTER_X + (k - (count - 1) / 2) * GAP_X, y: ROW_Y[r] }));
  return r % 2 === 0 ? row : [...row].reverse();
});
export const CAPACITY = SLOTS.length;
const TAIL = SLOTS[CAPACITY - 1];

/* Waiting packets rest hidden behind the sending job, above the last slot, and drop in from there. */
const STAGE_Y = 0.245;

/* The queue advances one slot per drip, in a wave: each packet starts LAG of a drip later than the one
   ahead and steps for STEP of a drip. Neighbours are never mid-step at the same offset, so they never overlap. */
const LAG = 0.25;
const STEP = 0.7;
const PERIOD = 1 - LAG;

/* Depth past the last slot (0, 1, 2, 3) against the packet's height: throat, valve, outlet, inbox. */
const THROUGH_DEPTH = [0, 1, 2, 3] as const;
export const VALVE_Y = 0.735;
const THROUGH_Y = [ROW_Y[0], VALVE_Y, 0.84, 0.93] as const;
const FADE_BAND = 0.6;

/* Down the pipe, sideways behind the job, then a straight drop onto the packet's slot. */
const PATH_S = [0, 0.3, 0.5, 1] as const;
const PIPE_TOP_Y = 0.06;
const linear = (t: number) => t;

export type Packet = { x: number; y: number; o: number };

function slotAt(u: number) {
  if (u > CAPACITY - 1) return { x: TAIL.x, y: lerp(TAIL.y, STAGE_Y, clamp01(u - (CAPACITY - 1))) };
  const j = Math.floor(u);
  const next = Math.min(j + 1, CAPACITY - 1);
  const f = u - j;
  return { x: lerp(SLOTS[j].x, SLOTS[next].x, f), y: lerp(SLOTS[j].y, SLOTS[next].y, f) };
}

/** Packets that have crossed the throat so far. */
export const dripAt = (v: number) => Math.max(0, (v - PIPE_TL.drip.start) / PIPE_TL.drip.per);

/** Slots gained after `x` drips: one eased step per PERIOD. */
function stairs(x: number) {
  if (x <= 0) return 0;
  const n = Math.floor(x / PERIOD);
  return n + easeInOutCubic(clamp01((x - n * PERIOD) / STEP));
}

/** Queue position of packet i: a slot index while queued, negative once it is past the throat. */
function queuePos(v: number, i: number) {
  const drip = dripAt(v);
  return drip >= i ? i - drip : i - stairs(drip - i * LAG);
}

function targetAt(u: number) {
  if (u >= 0) return slotAt(u);
  const depth = -u;
  return { x: lerp(SLOTS[0].x, CENTER_X, clamp01(depth)), y: keyframes(depth, THROUGH_DEPTH, THROUGH_Y, linear) };
}

export function packetAt(v: number, i: number): Packet {
  const { emit } = PIPE_TL;
  const s = clamp01((v - (emit.start + i * emit.step)) / emit.travel);
  const u = queuePos(v, i);
  const target = targetAt(u);
  const x = keyframes(s, PATH_S, [CENTER_X, CENTER_X, target.x, target.x], linear);
  const y = keyframes(s, PATH_S, [PIPE_TOP_Y, STAGE_Y, STAGE_Y, target.y], linear);
  const o = clamp01(s * 12) * clamp01((THROUGH_DEPTH[3] + u) / FADE_BAND);
  return { x, y, o };
}
