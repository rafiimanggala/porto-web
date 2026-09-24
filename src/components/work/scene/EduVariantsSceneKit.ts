import { easeInOutCubic, easeOutCubic } from "./HealthSceneParts";
import { LAYER, LICENSED, TL, VARIANTS, VIEW_W, colX, portX } from "./EduVariantsSceneData";
import type { Geo } from "./EduVariantsSceneGeo";

/* Plain functions of scroll progress. Components wrap them in useTransform, and
   the header readout calls them directly, so both always agree. */

export type Ease = (t: number) => number;
export type Pt = readonly [number, number];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const fract = (v: number) => v - Math.floor(v);
export const tint = (color: string, pct = 55) => `color-mix(in oklab, ${color} ${pct}%, transparent)`;

export function seg(v: number, a: number, b: number, ease?: Ease) {
  const t = clamp01((v - a) / (b - a));
  return ease ? ease(t) : t;
}

/* Piecewise value of v over increasing xs, eased inside each segment. */
export function keys(v: number, xs: readonly number[], ys: readonly number[], ease: Ease = easeInOutCubic) {
  const last = xs.length - 1;
  if (v <= xs[0]) return ys[0];
  if (v >= xs[last]) return ys[last];
  const i = xs.findIndex((x, j) => v >= x && v < xs[j + 1]);
  return lerp(ys[i], ys[i + 1], ease((v - xs[i]) / (xs[i + 1] - xs[i])));
}

/* A cubic with vertical tangents at both ends: the shape of every wire. */
export function dropPoint(from: Pt, to: Pt, u: number): Pt {
  const m = (to[1] - from[1]) * 0.55;
  const k = 1 - u;
  const w = [k * k * k, 3 * k * k * u, 3 * k * u * u, u * u * u];
  const x = w[0] * from[0] + w[1] * from[0] + w[2] * to[0] + w[3] * to[0];
  const y = w[0] * from[1] + w[1] * (from[1] + m) + w[2] * (to[1] - m) + w[3] * to[1];
  return [x, y];
}

export function dropPath(from: Pt, to: Pt) {
  const m = (to[1] - from[1]) * 0.55;
  return `M${from[0]} ${from[1]}C${from[0]} ${from[1] + m} ${to[0]} ${to[1] - m} ${to[0]} ${to[1]}`;
}

export const wireFrom = (G: Geo, i: number): Pt => [colX(i), G.connY];
export const wireTo = (G: Geo, i: number): Pt => [portX(i), G.engineY];

/* Chip i leaves the subject tile at its own step. */
export const chipStart = (i: number) => TL.chip.start + i * TL.chip.step;
export const treeStart = (i: number) => TL.tree.start + i * TL.tree.step;
/* The lowest picker row is filled first, so no chip crosses one that has landed. */
export const flyStart = (k: number) => TL.fly.start + (LICENSED.length - 1 - k) * TL.fly.step;

/* The licence scan crosses chip i when the edge reaches its column. */
export const resolveAt = (i: number) => TL.scan[0] + (colX(i) / VIEW_W) * (TL.scan[1] - TL.scan[0]);

export const treeGrow = (v: number, i: number) => seg(v, treeStart(i), treeStart(i) + TL.tree.dur);
export const topicCount = (v: number, i: number) =>
  Math.round(VARIANTS[i].topics * seg(treeGrow(v, i), 0.2, 1, easeOutCubic));

/* Wire pulses. `pulseRaw` counts periods travelled; each wire starts on its own
   stagger, and the stagger melts away across `converge`, so all seven pulses
   end up arriving at the engine together. */
const PULSE_START = TL.conn.start + TL.conn.spawnLag;
const STAGGER = TL.conn.step / TL.conn.period;

export const converge = (v: number) => seg(v, TL.converge[0], TL.converge[1], easeInOutCubic);
export const pulseRaw = (v: number, i: number) =>
  (v - PULSE_START) / TL.conn.period - i * STAGGER * (1 - converge(v));

export type PulseState = { x: number; y: number; o: number };

export function pulseState(G: Geo, v: number, i: number, k: number): PulseState {
  const raw = pulseRaw(v, i) - k * 0.5;
  const u = fract(Math.max(0, raw));
  const [x, y] = dropPoint(wireFrom(G, i), wireTo(G, i), u);
  return { x, y, o: raw < 0 ? 0 : Math.min(1, raw * 12) * (1 - seg(u, 0.9, 1)) };
}

/* One flash per arrival at the engine, strongest once the pulses are in step. */
export function engineGlow(v: number) {
  const f = fract(pulseRaw(v, 0) * 2);
  const d = Math.min(f, 1 - f);
  return converge(v) * Math.exp(-Math.pow(d / 0.09, 2));
}

export function pipeState(G: Geo, v: number): PulseState {
  const u = fract(pulseRaw(v, 0) * 2);
  return { x: 0, y: lerp(G.engineY + LAYER.h, G.resultsY, u), o: seg(v, TL.pipes[0], TL.pipes[0] + 0.01) * (1 - seg(u, 0.85, 1)) };
}

export const pluggedAt = (v: number) => VARIANTS.filter((_, i) => pulseRaw(v, i) >= 1).length;
export const licensedAt = (v: number) => VARIANTS.filter((c, i) => c.licensed && v >= resolveAt(i)).length;
export const launchedAt = (v: number) => VARIANTS.filter((_, i) => v >= chipStart(i) + TL.chip.labelLag).length;

/* A one-off bump for a beat window: 0 before, up to 1 in the middle, 0 after. */
export const bump = (v: number, a: number, dur: number) => Math.sin(Math.PI * seg(v, a, a + dur));

export const topicsAt = (v: number) => VARIANTS.reduce((sum, _, i) => sum + topicCount(v, i), 0);
