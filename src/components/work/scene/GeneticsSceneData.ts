import type { SceneIconName } from "./SceneIcon";

/* Genetics scene content, geometry and timeline. All values are invented (NDA illustrative). */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/* Round without trailing zeros so server and client style strings match. */
export const num = (v: number, digits = 2) => Number(v.toFixed(digits));
export const pct = (v: number) => `${num(v)}%`;
export const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export const TOTAL_VARIANTS = 312;

export const LANES = [
  { name: "Lipid", color: "var(--color-sun)", count: 96 },
  { name: "Methylation", color: "var(--color-mint)", count: 71 },
  { name: "Glucose", color: "var(--color-sky)", count: 88 },
  { name: "Lactose", color: "var(--color-rose)", count: 57 },
] as const;


export const BIN_X = 3;
export const BIN_W = 43;
export const BIN_H = 17.8;
const BIN_TOP0 = 10;
const BIN_PITCH = 22;
export const ROW_X = 4.5;
export const ROW_W = 40;
export const ROW_H = 8.6;
export const ROW_PAD_PX = 8;
const ROW_DY = 4.6;
const STRIP_DY = 15.6;
export const STRIP_X = 5.5;

export const binTop = (i: number) => BIN_TOP0 + BIN_PITCH * i;
export const rowTop = (i: number) => binTop(i) + ROW_DY;
export const rowMid = (i: number) => rowTop(i) + ROW_H / 2;
export const rsidY = (i: number) => rowTop(i) + ROW_H * 0.72;
export const stripY = (i: number) => binTop(i) + STRIP_DY;


export const CHIP_X = 64;
export const CHIP_W = 31.5;
export const ARC_X0 = ROW_X + ROW_W;
export const ARC_X1 = CHIP_X;
export const ARC_XM = (ARC_X0 + ARC_X1) / 2;

export type Variant = {
  rsid: string;
  lane: number;
  gene: string;
  value: string;
  /** Deliberate short form for narrow containers. */
  short?: string;
  flag: boolean;
  col: number;
  at: number;
  t0: number;
};

export const VARIANTS: readonly Variant[] = [
  { rsid: "rs429358", lane: 0, gene: "APOE", value: "e4 carrier", flag: true, col: 1, at: 30, t0: 0.25 },
  { rsid: "rs1801133", lane: 1, gene: "MTHFR", value: "C677T het", flag: false, col: 3, at: 44, t0: 0.27 },
  { rsid: "rs7903146", lane: 2, gene: "TCF7L2", value: "C/T", flag: true, col: 0, at: 58, t0: 0.29 },
  { rsid: "rs4988235", lane: 3, gene: "Lactase", value: "non-persistent", short: "non-pers.", flag: false, col: 2, at: 84, t0: 0.31 },
];

export type Chip = { label: string; value: string; tag: "high" | "low" | null; y: number };

export const CHIPS: readonly Chip[] = [
  { label: "HDL-C", value: "1.3 mmol/L", tag: null, y: 15 },
  { label: "LDL-C", value: "3.4 mmol/L", tag: "high", y: 32.5 },
  { label: "Homocysteine", value: "8.6 umol/L", tag: null, y: 50 },
  { label: "HbA1c", value: "5.4 %", tag: null, y: 67.5 },
  { label: "Vitamin D", value: "62 nmol/L", tag: "low", y: 85 },
];

export type Pair = {
  lane: number;
  chip: number;
  a: number;
  b: number;
  flags: number;
  color: string;
  strong: boolean;
};

export const PAIRS: readonly Pair[] = [
  { lane: 1, chip: 2, a: 0.55, b: 0.61, flags: 0, color: LANES[1].color, strong: false },
  { lane: 2, chip: 3, a: 0.585, b: 0.65, flags: 1, color: LANES[2].color, strong: false },
  { lane: 0, chip: 1, a: 0.64, b: 0.72, flags: 2, color: "var(--color-accent)", strong: true },
];
export const STUB = { lane: 3, a: 0.62, b: 0.67, end: 52 } as const;
export const CHECKED_AT = [PAIRS[0].b, PAIRS[1].b, STUB.b, PAIRS[2].b] as const;

/* Timeline (progress 0..1), chapters at 0, 0.22, 0.5, 0.78, 1. */
export const RAIN_END = 0.3;
export const COUNT_UP_END = 0.2;
export const READ_END = 0.2;
export const BIN_START = 0.23;
export const BIN_STAGGER = 0.01;
export const BIN_LEN = 0.05;
export const COUNT_START = 0.25;
export const COUNT_END = 0.44;
export const SORT_START = 0.225;
export const SORT_SPAN = 0.085;
export const FLIGHT_LEN = 0.08;
export const NAMED_FLIGHT = 0.1;
export const REVEAL_START = 0.385;
export const REVEAL_STEP = 0.025;
export const REVEAL_LEN = 0.035;
export const CHIP_START = 0.5;
export const CHIP_STAGGER = 0.012;
export const CHIP_LEN = 0.045;
export const SLOT_START = 0.32;
export const HALO = [0.73, 0.775] as const;
export const SWAP_AT = 0.9;
export const REST_FADE = [0.735, 0.78, 0.825] as const;
export const FLATTEN = [0.815, 0.885] as const;
export const CARD_OPEN = [0.875, 0.925] as const;
export const PULSE = [0.87, 0.905] as const;
export const TYPE = [0.915, 0.97] as const;
export const BUTTON = [0.955, 0.985] as const;
export const TAP = [0.975, 1] as const;


export const CARD_TOP = 30;
export const PAIR_Y = 42;
export const PAIR_REL = PAIR_Y - CARD_TOP;

export const EVIDENCE = [
  { key: "APOE", value: "e4 carrier", icon: "dna" },
  { key: "LDL-C", value: "3.4 mmol/L", icon: "lab-blood" },
] as const satisfies readonly { key: string; value: string; icon: SceneIconName }[];

export const INSIGHT =
  "Your e4 variant slows LDL clearance and your LDL-C is already 3.4. Together they raise heart risk more than either alone.";


export type RainTok = {
  id: string;
  text: string;
  geno: string | null;
  x: number;
  y0: number;
  drift: number;
  lane: number;
  slot: number;
  tone: number;
  t0: number;
  sorted: boolean;
};
export type NamedTok = Variant & { x: number; y0: number; drift: number; reveal: number };

const COLS = [4, 23, 42, 61, 80] as const;
const DRIFTS = [16, 24, 12, 26, 19] as const;
const PHASES = [0, 3.2, 6.1, 1.8, 4.5] as const;
const PITCH = 9.6;
const ROWS = 14;
const LANE_CYCLE = [0, 2, 1, 0, 2, 3, 1, 2, 0, 3] as const;
const NEVER = 9;

const hash = (n: number) => Math.imul(n ^ 0x9e3779b9, 2654435761) >>> 0;
const unit = (n: number) => (hash(n) % 1000) / 1000;

type Slot = { col: number; y0: number; yEnd: number };

const allSlots = (): Slot[] =>
  COLS.flatMap((_, col) =>
    Array.from({ length: ROWS }, (__, r) => {
      const y0 = PHASES[col] - 20 + r * PITCH;
      return { col, y0, yEnd: y0 + DRIFTS[col] };
    }),
  );

const isSorted = (s: Slot) => s.yEnd >= 8 && s.yEnd <= 92;
const isExiter = (s: Slot) => s.yEnd >= 104 && s.y0 < 100;

/* Keeps the rain out of the corner where the Raw DNA header sits. */
const BADGE_CLEAR_Y = 8;
const underBadge = (s: Slot) => s.col === 0 && s.y0 < BADGE_CLEAR_Y;

/* Header row centre, shared by the Raw DNA and Blood panel headers so the two mirror. */
export const HEAD_TOP = 4.2;

/* A token whose box would sit on the Raw DNA header fades out. On the narrow stage the header
   reaches about 30% of the width and 7% of the height, and its label ends near 28%. */
const HEADER_X = 30;
const HEADER_Y = [7, 9] as const;
export const headerClear = (x: number, y: number) =>
  x >= HEADER_X ? 1 : clamp01((y - HEADER_Y[0]) / (HEADER_Y[1] - HEADER_Y[0]));

const pickSlot = (slots: Slot[], v: Variant): Slot =>
  slots
    .filter((s) => s.col === v.col && isSorted(s))
    .reduce((best, s) => (Math.abs(s.yEnd - v.at) < Math.abs(best.yEnd - v.at) ? s : best));

const slotInLane = (j: number, lane: number) => {
  const per = LANE_CYCLE.filter((l) => l === lane).length;
  const before = LANE_CYCLE.slice(0, j % LANE_CYCLE.length).filter((l) => l === lane).length;
  return Math.floor(j / LANE_CYCLE.length) * per + before;
};

/* Tokens under the bins leave first so the bin headers open on clear ground. */
const sortTime = (col: number, i: number) =>
  col <= 2 ? SORT_START + 0.05 * unit(i + 41) : SORT_START + 0.03 + 0.055 * unit(i + 41);

const rsidText = (i: number) => `rs${1000000 + (hash(i * 7 + 3) % 9000000)}`;

/* A few raw genotype calls sit beside their rsID, so "a list of letters" is literal. */
const GENOTYPES = ["C/T", "A/A", "G/G", "T/T", "A/G", "C/C", "G/T", "A/C"] as const;
const genoText = (i: number) => (unit(i + 99) < 0.42 ? GENOTYPES[hash(i + 5) % GENOTYPES.length] : null);

export function buildRain(): { anon: RainTok[]; named: NamedTok[] } {
  const slots = allSlots();
  const picked = VARIANTS.map((v) => pickSlot(slots, v));
  const named = VARIANTS.map((v, i) => ({
    ...v,
    x: COLS[picked[i].col],
    y0: picked[i].y0,
    drift: DRIFTS[picked[i].col],
    reveal: REVEAL_START + REVEAL_STEP * i,
  }));
  const rest = slots.filter((s) => !picked.includes(s) && !underBadge(s) && (isSorted(s) || isExiter(s)));
  const sortedIdx = rest.map((s, i) => (isSorted(s) ? rest.slice(0, i).filter(isSorted).length : -1));
  const anon = rest.map((s, i) => {
    const j = sortedIdx[i];
    const lane = j >= 0 ? LANE_CYCLE[j % LANE_CYCLE.length] : 0;
    return {
      id: `t${i}`,
      text: rsidText(i),
      geno: genoText(i),
      x: COLS[s.col] + unit(i) * 1.5,
      y0: s.y0,
      drift: DRIFTS[s.col],
      lane,
      slot: j >= 0 ? slotInLane(j, lane) : 0,
      tone: 0.65 + 0.35 * unit(i + 17),
      t0: j >= 0 ? sortTime(s.col, i) : NEVER,
      sorted: j >= 0,
    };
  });
  return { anon, named };
}

/* Read head: a bright scan line sweeps the rain top to bottom while the variant counter runs up. */
export const readY = (v: number) => lerp(0, 100, clamp01(v / READ_END));

/* Rain brightness: edge fade, dim when unread, brightest under the read head, half lit once read. */
const edge = (y: number) => clamp01((y + 2) / 10) * clamp01((102 - y) / 10);
const bell = (y: number, head: number) => Math.exp(-(((y - head) / 8) ** 2));
export const rainOpacity = (y: number, tone: number, head: number) => {
  const read = clamp01((head - y) / 6);
  return num(edge(y) * (0.2 + 0.2 * read + 0.6 * bell(y, head)) * tone, 3);
};

/* Bin counters: the header total is the sum of what the four bins show, so they never disagree. */
const binFrom = (i: number) => COUNT_START + 0.01 * i;
export const binCount = (i: number, v: number) =>
  Math.round(LANES[i].count * clamp01((v - binFrom(i)) / (COUNT_END - binFrom(i))));
export const sortedTotal = (v: number) => LANES.reduce((sum, _, i) => sum + binCount(i, v), 0);

/* Rain token position while it flies to its strip. */
export const flightX = (tok: { x: number }, t: number) => lerp(tok.x, STRIP_X, t);

const TEXT_W = 12;
const GUTTER_PAD = 1.2;
const laneTop = (j: number) => binTop(j) - GUTTER_PAD;
const laneBottom = (j: number) => binTop(j) + BIN_H + GUTTER_PAD;
const inBinColumn = (x: number, textWidth: number) => x > BIN_X - textWidth && x < BIN_X + BIN_W;
const revealed = (p: number, j: number) => easeOutCubic(clamp01((p - (BIN_START + BIN_STAGGER * j)) / BIN_LEN));

/* How much of a rsID a bin panel has wiped over. Uses the bin's own top-down reveal, so the two are complementary. */
export function binCover(p: number, x: number, y: number): number {
  if (!inBinColumn(x, TEXT_W)) return 0;
  let cover = 0;
  for (let j = 0; j < LANES.length; j++) {
    if (y < laneTop(j) || y > laneBottom(j)) continue;
    const frac = clamp01((y - binTop(j)) / BIN_H);
    cover = Math.max(cover, clamp01((revealed(p, j) - frac) / 0.12));
  }
  return cover;
}

/* A flying dot is dimmed while it crosses a bin that is not its own, so it never reads as mis-sorted. */
export function dotClarity(x: number, y: number, lane: number): number {
  if (!inBinColumn(x, 0)) return 1;
  let inside = 0;
  for (let j = 0; j < LANES.length; j++) {
    if (j === lane) continue;
    const depth = Math.min(y - laneTop(j), laneBottom(j) - y);
    inside = Math.max(inside, clamp01(depth / 2));
  }
  return 1 - 0.96 * inside;
}

/* S curve, monotone in x, so a clip reveals it as a drawing. */
const bez = (a: number, b: number, c: number, d: number, t: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
export const arcPath = (ya: number, yb: number) =>
  `M ${ARC_X0} ${ya} C ${ARC_XM} ${ya}, ${ARC_XM} ${yb}, ${ARC_X1} ${yb}`;
export const headX = (s: number) => bez(ARC_X0, ARC_XM, ARC_XM, ARC_X1, s);
export const headY = (ya: number, yb: number, s: number) => bez(ya, ya, yb, yb, s);
