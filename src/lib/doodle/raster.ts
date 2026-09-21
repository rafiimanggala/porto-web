import type { Point, Stroke } from "./types";

// Turns polylines into the 28x28 ink grid the matcher works on. The same
// pipeline handles prototypes and live drawings, so both live in one space.

export const GRID = 28;
const PAD = 2.5;
const HALF_WIDTH = 1;

export type Grid = Float32Array;

// Fit strokes into the grid keeping aspect ratio, centred. Returns null when
// there is nothing usable to draw (no finite points or a dot below minExtent).
export function fitToGrid(strokes: readonly Stroke[], minExtent = 0): Stroke[] | null {
  const clean = strokes
    .map((s) => s.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
    .filter((s) => s.length > 0);
  if (clean.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of clean) {
    for (const p of s) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }
  const size = Math.max(maxX - minX, maxY - minY);
  if (size < 1e-9 || size <= minExtent) return null;

  const scale = (GRID - 2 * PAD) / size;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return clean.map((s) =>
    s.map((p) => ({ x: (p.x - cx) * scale + GRID / 2, y: (p.y - cy) * scale + GRID / 2 }))
  );
}

function distToSegment(px: number, py: number, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len2));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

function stamp(grid: Grid, a: Point, b: Point): void {
  const reach = HALF_WIDTH + 1;
  const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - reach));
  const x1 = Math.min(GRID - 1, Math.ceil(Math.max(a.x, b.x) + reach));
  const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - reach));
  const y1 = Math.min(GRID - 1, Math.ceil(Math.max(a.y, b.y) + reach));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = distToSegment(x + 0.5, y + 0.5, a, b);
      const v = Math.max(0, Math.min(1, HALF_WIDTH + 0.5 - d));
      const i = y * GRID + x;
      if (v > grid[i]) grid[i] = v;
    }
  }
}

// Max (not sum) so crossing strokes do not saturate into a blob.
export function rasterise(fitted: readonly Stroke[]): Grid {
  const grid = new Float32Array(GRID * GRID);
  for (const s of fitted) {
    if (s.length === 1) stamp(grid, s[0], s[0]);
    for (let i = 1; i < s.length; i++) stamp(grid, s[i - 1], s[i]);
  }
  return grid;
}

// 3x3 binomial blur, zero outside the grid, then scale peak to 1.
export function blur(src: Grid): Grid {
  const k = [1, 2, 1];
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      let acc = 0;
      for (let d = -1; d <= 1; d++) {
        const xx = x + d;
        if (xx >= 0 && xx < GRID) acc += k[d + 1] * src[y * GRID + xx];
      }
      tmp[y * GRID + x] = acc / 4;
    }
  }
  let peak = 0;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      let acc = 0;
      for (let d = -1; d <= 1; d++) {
        const yy = y + d;
        if (yy >= 0 && yy < GRID) acc += k[d + 1] * tmp[yy * GRID + x];
      }
      const v = acc / 4;
      out[y * GRID + x] = v;
      if (v > peak) peak = v;
    }
  }
  if (peak > 0) for (let i = 0; i < out.length; i++) out[i] /= peak;
  return out;
}

// Full pipeline: strokes -> fitted -> raster -> blurred, normalised grid.
export function inkGrid(strokes: readonly Stroke[], minExtent = 0): Grid | null {
  const fitted = fitToGrid(strokes, minExtent);
  return fitted ? blur(rasterise(fitted)) : null;
}
