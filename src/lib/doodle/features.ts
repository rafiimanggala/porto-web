import { GRID } from "./raster";
import type { Grid } from "./raster";

// Feature vector = coarse ink layout + coarse edge orientations. Both halves
// are L2-normalised on their own and then weighted, so neither can drown the
// other. All pure: same grid in, same numbers out.

const FINE = 2; // 28 -> 14 average pooling
const COARSE = 4; // 28 -> 7 average pooling
const CELLS = 4; // orientation histogram spatial cells per side
const BINS = 4; // orientation bins over 0..180 degrees

const W_FINE = 0.8;
const W_COARSE = 0.9;
const W_ORIENT = 1.2;

export function pool(grid: Grid, factor: number): Float32Array {
  const side = GRID / factor;
  const out = new Float32Array(side * side);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      out[Math.floor(y / factor) * side + Math.floor(x / factor)] += grid[y * GRID + x];
    }
  }
  const area = factor * factor;
  for (let i = 0; i < out.length; i++) out[i] /= area;
  return out;
}

function at(grid: Grid, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) return 0;
  return grid[y * GRID + x];
}

// Gradient direction folded to 0..180 degrees (an edge has no "front"),
// soft-binned into BINS, summed per spatial cell, square-rooted to calm
// strong edges.
export function orientationHistogram(grid: Grid): Float32Array {
  const out = new Float32Array(CELLS * CELLS * BINS);
  const cellSize = GRID / CELLS;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const gx = (at(grid, x + 1, y) - at(grid, x - 1, y)) / 2;
      const gy = (at(grid, x, y + 1) - at(grid, x, y - 1)) / 2;
      const mag = Math.hypot(gx, gy);
      if (mag < 1e-6) continue;
      let theta = Math.atan2(gy, gx);
      if (theta < 0) theta += Math.PI;
      if (theta >= Math.PI) theta -= Math.PI;
      const pos = (theta / Math.PI) * BINS;
      const b0 = Math.floor(pos) % BINS;
      const b1 = (b0 + 1) % BINS;
      const frac = pos - Math.floor(pos);
      const base = (Math.floor(y / cellSize) * CELLS + Math.floor(x / cellSize)) * BINS;
      out[base + b0] += mag * (1 - frac);
      out[base + b1] += mag * frac;
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.sqrt(out[i]);
  return out;
}

export function l2Normalise(v: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
  const norm = Math.sqrt(sum);
  const out = new Float32Array(v.length);
  if (norm < 1e-9) return out;
  for (let i = 0; i < v.length; i++) out[i] = v[i] / norm;
  return out;
}

function scaled(v: Float32Array, w: number): Float32Array {
  return v.map((x) => x * w);
}

export function extractFeatures(grid: Grid): Float32Array {
  const parts = [
    scaled(l2Normalise(pool(grid, FINE)), W_FINE),
    scaled(l2Normalise(pool(grid, COARSE)), W_COARSE),
    scaled(l2Normalise(orientationHistogram(grid)), W_ORIENT),
  ];
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}
