/* Quiz engine scene content, hex geometry and timeline. Every value is invented
   (NDA illustrative). The map shows one scope: Biology, Units 3 and 4, Level 2. */

export const CAPTIONS = [
  {
    eyebrow: "01 / Bank",
    title: "Hundreds of questions.",
    body: "A long linear list stops working past a few dozen items.",
  },
  {
    eyebrow: "02 / Map",
    title: "A hex grid you can jump around.",
    body: "Every question is one cell, coloured by status, so a teacher goes straight to it.",
  },
  {
    eyebrow: "03 / Types",
    title: "The question sets the control.",
    body: "Single choice, multi select and short answer each get their own answer control.",
  },
  {
    eyebrow: "04 / Review",
    title: "Key and feedback in place.",
    body: "Each question carries its answer key and the feedback students see.",
  },
] as const;

export const CHAPTERS = [0, 0.2, 0.44, 0.76, 1] as const;

/* Status of a question. Colours are theme tokens only. */
export type Status = "reviewed" | "draft" | "flagged" | "untouched";
export const STATUSES: readonly Status[] = ["reviewed", "draft", "flagged", "untouched"];
export const STATUS_COLOR: Record<Status, string> = {
  reviewed: "var(--color-mint)",
  draft: "var(--color-sun)",
  flagged: "var(--color-rose)",
  untouched: "var(--color-mute)",
};
export const STATUS_FILL: Record<Status, number> = { reviewed: 0.5, draft: 0.5, flagged: 0.58, untouched: 0.2 };

/* Hex geometry, pointy-top, in SVG units. R is centre to vertex. */
export const COLS = 12;
export const ROWS = 10;
export const N = COLS * ROWS;
const R = 10;
const HEX_W = Math.sqrt(3) * R;
export const GRID_W = HEX_W * (COLS + 0.5);
export const GRID_H = (ROWS - 1) * 1.5 * R + 2 * R;
export const GRID_ASPECT = GRID_H / GRID_W;
export const RING_R = 11.6;

export const hexPoints = (r: number) =>
  [30, 90, 150, 210, 270, 330]
    .map((deg) => `${(r * Math.cos((deg * Math.PI) / 180)).toFixed(3)},${(r * Math.sin((deg * Math.PI) / 180)).toFixed(3)}`)
    .join(" ");
export const CELL_POINTS = hexPoints(R * 0.9);
export const RING_POINTS = hexPoints(RING_R);

export const cellCol = (i: number) => i % COLS;
export const cellRow = (i: number) => Math.floor(i / COLS);
export const cellX = (i: number) => HEX_W * (cellCol(i) + 0.5 + (cellRow(i) % 2) * 0.5);
export const cellY = (i: number) => R + cellRow(i) * 1.5 * R;

/* Deterministic statuses: reviewed early, untouched late, a few flagged, the rest draft. */
const noise = (i: number, seed: number) => {
  let h = Math.imul(i + 1, 2654435761) ^ Math.imul(seed + 7, 1597334677);
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
};

const FLAG_RATE = 0.1;

function roll(i: number): Status {
  const u = i / N;
  if (noise(i, 3) < FLAG_RATE) return "flagged";
  if (noise(i, 11) < 0.02 + 0.4 * u * u) return "untouched";
  return noise(i, 19) < 0.82 - 0.5 * u ? "reviewed" : "draft";
}

export const Q1 = 0;
export const Q31 = 30;
export const Q41 = 40;
export const Q42 = 41;
export const Q43 = 42;
export const Q88 = 87;
export const Q104 = 103;

const PINNED: Partial<Record<number, Status>> = {
  [Q1]: "reviewed",
  [Q31]: "flagged",
  [Q41]: "draft",
  [Q42]: "draft",
  [Q43]: "draft",
  [Q88]: "flagged",
  [Q104]: "flagged",
};

export const STATUS: readonly Status[] = Array.from({ length: N }, (_, i) => PINNED[i] ?? roll(i));

export const COUNTS: Record<Status, number> = STATUS.reduce(
  (acc, s) => ({ ...acc, [s]: acc[s] + 1 }),
  { reviewed: 0, draft: 0, flagged: 0, untouched: 0 },
);

/* The bank list shows every question of the subject, of which this level is a part. */
export const BANK_TOTAL = 486;
export const BANK_START = 24;

const STEMS = [
  "Name the enzyme that unwinds the DNA helix.",
  "Which base pairs with adenine in RNA?",
  "Why does a test cross use a recessive parent?",
  "State the ratio of a dihybrid cross.",
  "Describe what a ribosome does in translation.",
  "Which stage of meiosis shuffles alleles?",
  "What does a Punnett square predict?",
  "Identify the carrier in this pedigree.",
  "Explain how a mutation can be silent.",
  "Which organelle makes most of the cell's ATP?",
  "Define codominance with one example.",
  "Why is the F2 ratio 3 to 1 for one trait?",
  "What causes a frameshift in a gene?",
  "Name the pattern of a sex-linked trait.",
  "How does selection change allele frequency?",
  "Which method copies a short DNA segment?",
  "State one job of a promoter region.",
  "What is the phenotype of a heterozygote?",
  "Why do identical twins share a genotype?",
  "What does a lower case letter denote?",
  "Compare mitosis with meiosis in one line.",
  "Which molecule carries amino acids to the ribosome?",
  "Explain incomplete dominance in snapdragons.",
  "What is a gene pool?",
];

export type QType = "single" | "multi" | "short";
export const listStem = (i: number) => STEMS[(i * 7 + (i >> 2)) % STEMS.length];
export const listType = (i: number): QType => (["single", "multi", "short"] as const)[(i * 5 + (i >> 3)) % 3];
export const listStatus = (i: number): Status => STATUS[i % N];
export const qLabel = (i: number) => `Q${i + 1}`;

/* Preview stops of the map: the cell the teacher lands on and what it says. */
export type Stop = { idx: number; stem: string };
export const STOPS: readonly Stop[] = [
  { idx: Q1, stem: "Which enzyme unwinds the DNA helix?" },
  { idx: Q31, stem: "Why does a test cross need tt?" },
  { idx: Q88, stem: "State the dihybrid cross ratio." },
  { idx: Q104, stem: "Which meiosis stage shuffles alleles?" },
  { idx: Q41, stem: "Tt x tt: what fraction is tall?" },
];

/* Card content: one question at a time, three types. */
export const CARD_QS = [
  {
    idx: Q41,
    type: "Single choice",
    stem: "Tt x tt cross: what fraction of offspring are tall?",
    options: ["None", "One quarter", "One half", "Three quarters"],
  },
  {
    idx: Q42,
    type: "Multi select",
    stem: "Select every X-linked recessive condition.",
    options: ["Red-green colour blindness", "Haemophilia A", "Cystic fibrosis", "Huntington disease"],
  },
  {
    idx: Q43,
    type: "Short answer",
    stem: "Name the pattern where both alleles are fully expressed.",
    options: [],
  },
] as const;

export const TYPED = "codominance";
export const KEY_MAIN = "codominance";
export const KEY_ALT = "co-dominance";
export const RULES = ["Ignore case", "Trim spaces", "Accept spelling variants"] as const;
export const FEEDBACK = "Both alleles show in full, as in the AB blood group.";

/* Timeline. Every beat is a [start, end] window of scroll progress. */
export const T = {
  count: [0, 0.1],
  scroll: [0, 0.2],
  hdr: [0.125, 0.15],
  scan: [0.125, 0.19],
  tail: [0.19, 0.2],
  ring: [0.198, 0.212],
  strip: [0.2, 0.216],
  group: { start: 0.205, step: 0.009, len: 0.014 },
  jumpT: [0.248, 0.266, 0.3, 0.316, 0.335, 0.35, 0.385, 0.4, 0.574, 0.584, 0.666, 0.676],
  jumpIdx: [Q1, Q31, Q31, Q88, Q88, Q104, Q104, Q41, Q41, Q42, Q42, Q43],
  stripPos: { t: [0.252, 0.27, 0.304, 0.32, 0.339, 0.354, 0.389, 0.404], v: [0, 1, 1, 2, 2, 3, 3, 4] },
  spotOn: [0.266, 0.29],
  spotOff: [0.36, 0.38],
  open: [0.402, 0.424],
  shrink: [0.416, 0.448],
  leader: [0.446, 0.464],
  card: [0.45, 0.494],
  typeT: [0.572, 0.608, 0.664, 0.7],
  typeV: [0, 1, 1, 2],
  typing: [0.708, 0.748],
  rules: [0.75, 0.758, 0.766],
  ok: [0.774, 0.797],
  key: [0.778, 0.812],
  feedback: [0.816, 0.846],
  flip: [0.865, 0.9],
  pickA: [0.515, 0.525],
  pickC: [0.538, 0.552],
  checks: [
    [0.62, 0.63],
    [0.638, 0.648],
  ],
} as const;

