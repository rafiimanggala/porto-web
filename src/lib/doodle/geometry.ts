import type { Point, Rng, Stroke } from "./types";
import { between, gauss } from "./rng";

// Small polyline toolkit shared by the prototype generator and the stored
// sample sketches. Unit space is roughly [-1, 1] on both axes, y pointing down.

export type Affine = readonly [number, number, number, number];

const pt = (x: number, y: number): Point => ({ x, y });

export function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a0: number,
  a1: number,
  steps = 28
): Stroke {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return pt(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
  });
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, steps = 36): Stroke {
  return arc(cx, cy, rx, ry, 0, Math.PI * 2, steps);
}

export function poly(coords: readonly (readonly [number, number])[], closed = false): Stroke {
  const pts = coords.map(([x, y]) => pt(x, y));
  return closed && pts.length > 0 ? [...pts, pts[0]] : pts;
}

export function line(x0: number, y0: number, x1: number, y1: number): Stroke {
  return [pt(x0, y0), pt(x1, y1)];
}

// Insert points so no segment is longer than `step`.
export function densify(stroke: Stroke, step: number): Stroke {
  const out: Point[] = [];
  stroke.forEach((p, i) => {
    if (i === 0) {
      out.push(p);
      return;
    }
    const q = stroke[i - 1];
    const n = Math.max(1, Math.ceil(Math.hypot(p.x - q.x, p.y - q.y) / step));
    for (let k = 1; k <= n; k++) {
      out.push(pt(q.x + ((p.x - q.x) * k) / n, q.y + ((p.y - q.y) * k) / n));
    }
  });
  return out;
}

export function transform(strokes: readonly Stroke[], m: Affine): Stroke[] {
  const [a, b, c, d] = m;
  return strokes.map((s) => s.map((p) => pt(a * p.x + c * p.y, b * p.x + d * p.y)));
}

export function rotation(angle: number): Affine {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c, s, -s, c];
}

export function multiply(m: Affine, n: Affine): Affine {
  // m applied after n.
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
  ];
}

// Low-frequency wobble along each stroke (a shaky hand) plus a little white
// jitter, applied after densifying so long straight edges can bend.
export function perturb(
  strokes: readonly Stroke[],
  rng: Rng,
  wobble: number,
  jitter: number,
  step = 0.07
): Stroke[] {
  return strokes.map((raw) => {
    const s = densify(raw, step);
    const f1 = between(rng, 1.5, 3.5);
    const f2 = between(rng, 4, 8);
    const ph = [0, 1, 2, 3].map(() => between(rng, 0, Math.PI * 2));
    return s.map((p, i) => {
      const t = i / Math.max(1, s.length - 1);
      const dx = wobble * (Math.sin(f1 * t * 6.28 + ph[0]) + 0.5 * Math.sin(f2 * t * 6.28 + ph[1]));
      const dy = wobble * (Math.sin(f1 * t * 6.28 + ph[2]) + 0.5 * Math.sin(f2 * t * 6.28 + ph[3]));
      return pt(p.x + dx + jitter * gauss(rng), p.y + dy + jitter * gauss(rng));
    });
  });
}

// Keep at most `count` points overall, in drawing order. Used to replay a
// sketch progressively without mutating the stored strokes.
export function firstPoints(strokes: readonly Stroke[], count: number): Stroke[] {
  const out: Stroke[] = [];
  let left = Math.max(0, Math.floor(count));
  for (const s of strokes) {
    if (left <= 0) break;
    out.push(s.slice(0, left));
    left -= s.length;
  }
  return out;
}

export function pointCount(strokes: readonly Stroke[]): number {
  return strokes.reduce((n, s) => n + s.length, 0);
}
