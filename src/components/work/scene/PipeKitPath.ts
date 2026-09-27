/* Wire geometry for the pipeline scenes. Every path is built from plain arithmetic (lines, cubic and quadratic
   segments sampled into a polyline), so a point at any arc-length fraction is deterministic and SSR safe. */

export type Pt = readonly [number, number];

export type WirePath = {
  /** SVG path data. */
  readonly d: string;
  /** Approximate arc length in user units. */
  readonly length: number;
  /** Point at arc-length fraction t (0..1, clamped). */
  readonly at: (t: number) => Pt;
  /** Direction of travel at t, in degrees (0 = right, 90 = down). */
  readonly angleAt: (t: number) => number;
};

const CUBIC_STEPS = 36;
const QUAD_STEPS = 8;
const MIN_REACH = 12;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const fmt = (p: Pt) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
const mix = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const towards = (from: Pt, to: Pt, r: number): Pt => mix(from, to, r / dist(from, to));

function cubicAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [
    w[0] * p0[0] + w[1] * p1[0] + w[2] * p2[0] + w[3] * p3[0],
    w[0] * p0[1] + w[1] * p1[1] + w[2] * p2[1] + w[3] * p3[1],
  ];
}

const sampleCubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt): readonly Pt[] =>
  Array.from({ length: CUBIC_STEPS + 1 }, (_, i) => cubicAt(p0, p1, p2, p3, i / CUBIC_STEPS));

function sampleQuad(a: Pt, c: Pt, b: Pt): readonly Pt[] {
  return Array.from({ length: QUAD_STEPS + 1 }, (_, i) => {
    const t = i / QUAD_STEPS;
    return mix(mix(a, c, t), mix(c, b, t), t);
  });
}

function build(d: string, pts: readonly Pt[]): WirePath {
  const cum = pts.reduce<readonly number[]>((acc, p, i) => (i === 0 ? [0] : [...acc, acc[i - 1] + dist(pts[i - 1], p)]), []);
  const length = cum[cum.length - 1];
  const segment = (t: number) => {
    const target = clamp01(t) * length;
    const i = Math.max(1, cum.findIndex((c) => c >= target));
    return { i, k: (target - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]) };
  };
  return {
    d,
    length,
    at: (t) => {
      const { i, k } = segment(t);
      return mix(pts[i - 1], pts[i], k);
    },
    angleAt: (t) => {
      const { i } = segment(t);
      return (Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180) / Math.PI;
    },
  };
}

export function linePath(from: Pt, to: Pt): WirePath {
  return build(`M${fmt(from)}L${fmt(to)}`, [from, to]);
}

type CubicOpts = {
  /** Handle length as a share of the distance along the main axis. Default 0.5. */
  bend?: number;
  /** "x" leaves and enters horizontally (n8n style), "y" vertically. Default "x". */
  axis?: "x" | "y";
};

/** Smooth S curve between two ports. */
export function cubicPath(from: Pt, to: Pt, { bend = 0.5, axis = "x" }: CubicOpts = {}): WirePath {
  const i = axis === "x" ? 0 : 1;
  const k = Math.max(MIN_REACH, Math.abs(to[i] - from[i]) * bend);
  const c1: Pt = axis === "x" ? [from[0] + k, from[1]] : [from[0], from[1] + k];
  const c2: Pt = axis === "x" ? [to[0] - k, to[1]] : [to[0], to[1] - k];
  return build(`M${fmt(from)}C${fmt(c1)} ${fmt(c2)} ${fmt(to)}`, sampleCubic(from, c1, c2, to));
}

type LoopOpts = {
  /** How far the loop dips past the ports; the curve sags about 0.75 of this. Default 56. */
  drop?: number;
  /** "below" (default) or "above" the nodes. */
  side?: "below" | "above";
  /** How far it runs out of `from` and into `to` before turning. Default 40. */
  reach?: number;
};

/** Polling loop-back: leaves `from` to the right, swings under (or over) the nodes, enters `to` from the left. */
export function loopBackPath(from: Pt, to: Pt, { drop = 56, side = "below", reach = 40 }: LoopOpts = {}): WirePath {
  const sag = side === "below" ? drop : -drop;
  const c1: Pt = [from[0] + reach, from[1] + sag];
  const c2: Pt = [to[0] - reach, to[1] + sag];
  return build(`M${fmt(from)}C${fmt(c1)} ${fmt(c2)} ${fmt(to)}`, sampleCubic(from, c1, c2, to));
}

/** Orthogonal polyline with rounded corners. Zero length legs are dropped. */
export function polyPath(points: readonly Pt[], radius = 8): WirePath {
  const pts = points.filter((p, i) => i === 0 || dist(p, points[i - 1]) > 1e-6);
  if (pts.length < 3) return linePath(pts[0], pts[pts.length - 1]);
  const corners = pts.slice(1, -1).map((c, i) => {
    const r = Math.min(radius, dist(pts[i], c) / 2, dist(c, pts[i + 2]) / 2);
    return { a: towards(c, pts[i], r), c, b: towards(c, pts[i + 2], r) };
  });
  const d = corners.reduce((acc, { a, c, b }) => `${acc}L${fmt(a)}Q${fmt(c)} ${fmt(b)}`, `M${fmt(pts[0])}`);
  const samples = [pts[0], ...corners.flatMap(({ a, c, b }) => sampleQuad(a, c, b)), pts[pts.length - 1]];
  return build(`${d}L${fmt(pts[pts.length - 1])}`, samples);
}

type ElbowOpts = {
  /** "x" runs horizontally first (default), "y" vertically first. */
  axis?: "x" | "y";
  /** Where the middle leg sits between the ports, 0..1. Default 0.5. */
  mid?: number;
  /** Corner radius. Default 8. */
  radius?: number;
};

/** Z shaped orthogonal wire with rounded corners. */
export function elbowPath(from: Pt, to: Pt, { axis = "x", mid = 0.5, radius = 8 }: ElbowOpts = {}): WirePath {
  const m = axis === "x" ? from[0] + (to[0] - from[0]) * mid : from[1] + (to[1] - from[1]) * mid;
  const knee: readonly Pt[] = axis === "x" ? [[m, from[1]], [m, to[1]]] : [[from[0], m], [to[0], m]];
  return polyPath([from, ...knee, to], radius);
}
