import type { Match, ShapeId, Stroke } from "./types";
import { SHAPE_IDS } from "./types";
import { mulberry32 } from "./rng";
import { prototypeStrokes } from "./shapes";
import { inkGrid } from "./raster";
import { extractFeatures, l2Normalise } from "./features";

// A tiny nearest-prototype matcher. It is not a trained network: at start-up
// it draws a handful of jittered variants of each known shape, turns them into
// feature vectors, and later compares what you draw to those by cosine
// similarity. Nothing is fetched and nothing leaves the page.

export type Prototype = { readonly id: ShapeId; readonly vec: Float32Array };

export type Model = {
  readonly mean: Float32Array;
  readonly prototypes: readonly Prototype[];
  readonly topK: number;
  readonly temperature: number;
};

export type ModelOptions = {
  readonly seed?: number;
  readonly perClass?: number;
  readonly topK?: number;
  readonly temperature?: number;
};

export type ClassifyOptions = {
  // Ignore drawings whose longest side is not larger than this (input units).
  readonly minExtent?: number;
};

const DEFAULTS = { seed: 20260922, perClass: 12, topK: 3, temperature: 0.14 };

function meanVector(vectors: readonly Float32Array[]): Float32Array {
  const out = new Float32Array(vectors[0].length);
  for (const v of vectors) for (let i = 0; i < out.length; i++) out[i] += v[i];
  for (let i = 0; i < out.length; i++) out[i] /= vectors.length;
  return out;
}

function centre(v: Float32Array, mean: Float32Array): Float32Array {
  return l2Normalise(v.map((x, i) => x - mean[i]));
}

export function buildModel(options: ModelOptions = {}): Model {
  const { seed, perClass, topK, temperature } = { ...DEFAULTS, ...options };
  const raw = SHAPE_IDS.flatMap((id, c) =>
    Array.from({ length: perClass }, (_, i) => {
      const rng = mulberry32(seed + c * 7919 + i * 104729);
      const grid = inkGrid(prototypeStrokes(id, rng));
      if (!grid) throw new Error(`doodle: empty prototype for ${id}`);
      return { id, feat: extractFeatures(grid) };
    })
  );
  const mean = meanVector(raw.map((r) => r.feat));
  const prototypes = raw.map((r) => ({ id: r.id, vec: centre(r.feat, mean) }));
  return { mean, prototypes, topK, temperature };
}

export function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

// Softmax with a temperature. Subtracts the max first so it cannot overflow.
export function softmax(scores: readonly number[], temperature: number): number[] {
  const top = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - top) / temperature));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
}

// Mean of the k best similarities, so one odd prototype cannot decide alone.
export function topKMean(sims: readonly number[], k: number): number {
  const best = sims.slice().sort((a, b) => b - a).slice(0, Math.max(1, k));
  return best.reduce((a, b) => a + b, 0) / best.length;
}

export function classify(
  model: Model,
  strokes: readonly Stroke[],
  options: ClassifyOptions = {}
): Match[] | null {
  const grid = inkGrid(strokes, options.minExtent ?? 0);
  if (!grid) return null;
  const query = centre(extractFeatures(grid), model.mean);
  const scores = SHAPE_IDS.map((id) =>
    topKMean(
      model.prototypes.filter((p) => p.id === id).map((p) => cosine(query, p.vec)),
      model.topK
    )
  );
  const shares = softmax(scores, model.temperature);
  return SHAPE_IDS.map((id, i) => ({ id, score: scores[i], share: shares[i] })).sort(
    (a, b) => b.share - a.share
  );
}
