// Shared types for the in-browser doodle matcher. No DOM, no React.

export type Point = { readonly x: number; readonly y: number };
export type Stroke = readonly Point[];

export const SHAPE_IDS = [
  "sun",
  "house",
  "tree",
  "fish",
  "star",
  "key",
  "cup",
  "cat",
] as const;

export type ShapeId = (typeof SHAPE_IDS)[number];

// One row of the "matcher sees" panel. `score` is a centred cosine
// similarity, `share` is that score turned into a share of 1 across shapes.
export type Match = {
  readonly id: ShapeId;
  readonly score: number;
  readonly share: number;
};

// Deterministic random source: returns a float in [0, 1).
export type Rng = () => number;
