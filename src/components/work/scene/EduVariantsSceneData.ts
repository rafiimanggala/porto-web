/* One curriculum, a dozen course variants: content and timeline. All values are
   invented (NDA illustrative). The stage is a 360 x 430 viewBox that scales with
   its box, so every coordinate below is in those units. */

export const CAPTIONS = [
  {
    eyebrow: "01 / One subject",
    title: "Biology is not one course.",
    body: "Schools teach it as IB, AP, senior, stage 1 or 2, or\u00a0units\u00a01\u00a0to\u00a04.",
  },
  {
    eyebrow: "02 / Variants",
    title: "Seven syllabuses, seven trees.",
    body: "Each variant has its own topic hierarchy, so content cannot simply be copied between them.",
  },
  {
    eyebrow: "03 / Shared core",
    title: "One engine underneath.",
    body: "Every variant plugs into the same quiz engine and the same results pipeline.",
  },
  {
    eyebrow: "04 / One school",
    title: "Each school sees only its own.",
    body: "A school licence decides which variants appear in its subject picker.",
  },
] as const;

export const CHAPTERS = [0, 0.225, 0.525, 0.775, 1] as const;

export const VIEW_W = 360;
export const VIEW_H = 430;
export const MID_X = VIEW_W / 2;

/* A tree node is [parent index, x offset from the column centre, depth]. */
export type TreeNode = readonly [parent: number, dx: number, lv: number];

export type Variant = {
  lines: readonly string[];
  color: string;
  topics: number;
  licensed: boolean;
  tree: readonly TreeNode[];
};

const SKY = "var(--color-sky)";
const ROSE = "var(--color-rose)";
const SUN = "var(--color-sun)";
const MINT = "var(--color-mint)";

export const VARIANTS: readonly Variant[] = [
  {
    lines: ["IB"],
    color: SKY,
    topics: 58,
    licensed: false,
    tree: [
      [-1, 0, 0],
      [0, -10, 1], [0, 10, 1],
      [1, -15, 2], [1, -5, 2], [2, 5, 2], [2, 15, 2],
      [3, -18, 3], [3, -12, 3], [4, -8, 3], [4, -2, 3], [5, 2, 3], [5, 8, 3], [6, 12, 3], [6, 18, 3],
    ],
  },
  {
    lines: ["AP"],
    color: ROSE,
    topics: 41,
    licensed: false,
    tree: [
      [-1, 0, 0],
      [0, -16, 1], [0, -8, 1], [0, 0, 1], [0, 8, 1], [0, 16, 1],
      [1, -16, 2], [2, -8, 2], [3, 0, 2], [4, 8, 2], [5, 16, 2],
      [6, -16, 3], [10, 16, 3],
    ],
  },
  {
    lines: ["Senior"],
    color: SUN,
    topics: 47,
    licensed: true,
    tree: [
      [-1, 0, 0],
      [0, 0, 1], [1, 0, 2], [2, 0, 3], [3, 0, 4],
      [1, -13, 1.8], [2, 13, 2.5], [3, -13, 3.2], [3, 13, 3.8],
    ],
  },
  {
    lines: ["Stage 1"],
    color: MINT,
    topics: 32,
    licensed: true,
    tree: [
      [-1, 0, 0],
      [0, -14, 1], [0, 0, 1], [0, 14, 1],
      [1, -14, 2],
      [2, 0, 2], [5, 0, 3], [6, 0, 4],
      [3, 14, 2], [8, 14, 3],
    ],
  },
  {
    lines: ["Stage 2"],
    color: SKY,
    topics: 44,
    licensed: true,
    tree: [
      [-1, 0, 0],
      [0, -10, 1], [0, 10, 1],
      [1, -17, 2], [1, -10, 2], [1, -3, 2],
      [4, -13, 3], [4, -7, 3],
      [2, 10, 2], [8, 10, 3], [9, 10, 4],
    ],
  },
  {
    lines: ["Units", "1 and 2"],
    color: ROSE,
    topics: 36,
    licensed: false,
    tree: [
      [-1, 0, 0],
      [0, -9, 1], [0, 9, 1],
      [1, -9, 2], [3, -9, 3], [4, -9, 4],
      [2, 9, 2], [6, 9, 3], [7, 9, 4],
    ],
  },
  {
    lines: ["Units", "3 and 4"],
    color: SUN,
    topics: 39,
    licensed: false,
    tree: [
      [-1, 0, 0],
      [0, 0, 1], [1, 0, 2],
      [2, -18, 3], [2, -9, 3], [2, 0, 3], [2, 9, 3], [2, 18, 3],
      [3, -18, 4], [7, 18, 4],
    ],
  },
];

export const LICENSED = VARIANTS.flatMap((v, i) => (v.licensed ? [i] : []));

/* Stage geometry that never stretches: columns, sizes and every x position.
   Vertical positions live in EduVariantsSceneGeo, where they can stretch to
   fill a tall phone stage. */
export const colX = (i: number) => 33 + 49 * i;
export const CHIP = { w: 46, h: 34 } as const;
export const BIG_TILE = { w: 170, h: 118 } as const;
export const ROOT_TILE = { w: 104, h: 54 } as const;
export const LAYER = { x: 40, w: 280, h: 36 } as const;
export const PORT_SPREAD = 0.78;
export const portX = (i: number) => MID_X + (colX(i) - MID_X) * PORT_SPREAD;
export const PIPE_XS = [110, MID_X, 250] as const;
export const BAR_HEIGHTS = [8, 14, 10, 18, 22, 16, 12, 20, 14] as const;

/* Subject picker card. */
export const CARD = { x: 22, w: 316 } as const;
export const SLOT = { x: 36, w: 288, h: 38 } as const;
export const OTHER_SUBJECTS = [
  { name: "Chemistry", note: "Year 10" },
  { name: "Physics", note: "Year 10" },
] as const;

/* Timeline. Every beat is a [start, end] window of scroll progress. */
export const TL = {
  intro: [0, 0.03],
  lift: [0.03, 0.115],
  chip: { start: 0.04, step: 0.01, dur: 0.08, labelLag: 0.05, labelDur: 0.035, linkLag: 0.035, linkDur: 0.05 },
  holders: [0.1, 0.16],
  tree: { start: 0.13, step: 0.028, dur: 0.075 },
  counts: [0.225, 0.255],
  ghost: [0.39, 0.47],
  sweep: { start: 0.45, step: 0.006, dur: 0.02 },
  solid: [0.49, 0.535],
  conn: { start: 0.515, step: 0.01, dur: 0.045, spawnLag: 0.045, period: 0.05 },
  converge: [0.62, 0.7],
  pipes: [0.665, 0.695],
  bars: { start: 0.68, step: 0.005, dur: 0.03 },
  wipe: [0.745, 0.815],
  badge: [0.76, 0.795],
  scan: [0.815, 0.857],
  fly: { start: 0.848, step: 0.011, dur: 0.04 },
  detail: [0.9, 0.925],
  pick: [0.915, 0.94],
} as const;

export const READOUT_CUTS = [CHAPTERS[1], CHAPTERS[2], CHAPTERS[3]] as const;
