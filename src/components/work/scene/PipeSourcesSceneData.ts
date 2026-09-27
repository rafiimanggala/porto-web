import { NODE, SCAN } from "./PipeKitData";
import type { GlyphName } from "./PipeKitGlyphs";
import { ROW_COUNT } from "./PipeSourcesSceneLayout";

/* Copy and timeline of the sources scene, plus the positions both layouts share. Stage units: the stage is 360 wide
   (see PipeSourcesSceneLayout for the rest). Numbers and strings about the run come from PipeKitData. */

export const CAPTIONS = [
  { eyebrow: "01 / Trigger", title: "06:00, no human.", body: "A schedule fires the publish pipeline every morning." },
  { eyebrow: "02 / Sources", title: "Three feeds, read together.", body: "Research news, psychology digests and clinical summaries are pulled in parallel." },
  { eyebrow: "03 / Merge", title: "One clean stream.", body: "Items are merged, normalised and de-duplicated, so yesterday's story never runs twice." },
  { eyebrow: "04 / Pick", title: "One story goes forward.", body: "Seven new items are packed into one payload, and one story is picked." },
] as const;

/* The boundaries sit off round numbers so a caption is never at zero opacity on a frame a person is likely to inspect.
   Each one falls where the picture is at its strongest: the feeds are printing, the merge has begun, the pack starts. */
export const CHAPTERS = [0, 0.227, 0.437, 0.765, 1] as const;

/* The fields the language model needs, what the edit step keeps. */
export const KEPT_FIELDS = ["title", "summary"] as const;

type Span = readonly [number, number];

/* Progress windows. Every beat of the scene reads from here. */
export const TL = {
  sweep: [0.02, 0.115],
  fire: [0.115, 0.155],
  extrasOut: [0.146, 0.168],
  morph: [0.15, 0.18],
  tileIn: [0.176, 0.19],
  rail: [0.176, 0.206],
  feedIn: [0.186, 0.204],
  labelOut: [0.414, 0.432],
  printStart: [0.21, 0.222, 0.234],
  printStep: 0.013,
  printDur: 0.014,
  mergeTile: [0.438, 0.454],
  merge: [0.446, 0.5],
  mergeDur: 0.0025,
  listLabel: [0.512, 0.528, 0.556, 0.572],
  scan: [0.572, 0.645],
  scanTag: [0.566, 0.648],
  stamp: [0.642, 0.648],
  stampOut: [0.672, 0.682],
  dropStart: 0.652,
  dropSpan: 0.01,
  dropDur: 0.014,
  spreadStart: 0.668,
  spreadLag: 0.0012,
  tableStart: 0.682,
  tableLag: 0.0028,
  header: [0.68, 0.694],
  cells: [0.694, 0.708],
  strike: [0.71, 0.72],
  fade: [0.734, 0.744],
  trim: [0.744, 0.758],
  packStart: 0.758,
  packLag: 0.002,
  packDur: 0.03,
  headerOut: [0.752, 0.762],
  chip: [0.766, 0.782],
  braces: [0.778, 0.806],
  json: [0.782, 0.816],
  cardSwap: [0.808, 0.812],
  others: [0.818, 0.84],
  cardGrow: [0.822, 0.874],
  oldTitleOut: [0.822, 0.832],
  cardText: [0.834, 0.868],
  summary: [0.85, 0.89],
  chipOut: [0.885, 0.897],
  sheetIn: [0.888, 0.908],
  rowDrop: [0.905, 0.94],
  stripIn: [0.918, 0.94],
  statusAt: 0.938,
} as const satisfies Record<string, Span | number | readonly number[]>;

/* Positions both layouts share: the schedule tile, the row of tiles, the rail that fans out to the feed tiles. */
export const TILE = 34;
export const TILE_Y = 118;
export const SCHED = [30, 46] as const;
export const RAIL_Y = 90;

/* The chain of nodes that works on the list, left to right. */
export const CHAIN_X = [30, 90, 150, 210, 270, 330] as const;

/* The six tiles, their label and the window in which each one works. `wire` is when the wire from the previous tile
   draws. Merge, Pick and Sheet come from the shared node catalog; the rest are named for what they do here. */
export const CHAIN: readonly { glyph: GlyphName; label: string; act: Span; wire: Span | null }[] = [
  { glyph: NODE.merge.glyph, label: NODE.merge.label, act: [0.446, 0.51], wire: null },
  { glyph: "filter", label: "Normalise", act: [0.568, 0.655], wire: [0.545, 0.568] },
  { glyph: "edit", label: "Fields", act: [0.692, 0.758], wire: [0.662, 0.692] },
  { glyph: "aggregate", label: "Pack", act: [0.763, 0.81], wire: [0.748, 0.763] },
  { glyph: NODE.pick.glyph, label: NODE.pick.label, act: [0.815, 0.88], wire: [0.795, 0.812] },
  { glyph: NODE.row.glyph, label: NODE.row.label, act: [0.892, 0.978], wire: [0.876, 0.89] },
];
/* Idle tiles stay readable: they wait at this opacity from GHOST_IN on. */
export const GHOST = 0.6;
export const GHOST_IN = [0.49, 0.515] as const;

export const FEED_COLOR = ["var(--color-sky)", "var(--color-sun)", "var(--color-mint)"] as const;

/* One entry per node this scene lights up, in the order it happens. */
export const LIT_AT = [0.125, TL.printStart[0], TL.printStart[0], TL.printStart[0], 0.446, 0.568, 0.692, 0.763, 0.822, 0.892] as const;

export type FeedIdx = 0 | 1 | 2;

export const SEEN_TOTAL = ROW_COUNT - SCAN.fresh;
