import { CLONE_DEMO, FLOW_STEPS, PATTERNS, PRODUCT, SERVICE, STACK, filterByGender, type Gender, type MeasureId } from "./MtmKitData";

export type Span = readonly [number, number];

export const CAPTIONS = [
  {
    eyebrow: "01 / Two systems",
    title: "Fit data lives outside the shop.",
    body: "Measurements sit in a separate pattern service, and Shopify knows nothing about them.",
  },
  {
    eyebrow: "02 / Bridge",
    title: "The theme talks to it directly.",
    body: `Plain ${STACK.languages} read and write through a ${SERVICE.kind} the theme does not control.`,
  },
  {
    eyebrow: "03 / Measure",
    title: "Values are checked as you type.",
    body: "Each measurement has a valid range, so a bad value is caught on the spot.",
  },
  {
    eyebrow: `04 / ${FLOW_STEPS[2].label}`,
    title: "Only a valid pattern is stored.",
    body: "A fully valid set becomes a saved pattern, ready for the cart.",
  },
] as const;

/* Each caption swap sits inside a beat of its own (the wire, the list pick, the save wipe), never on a bare frame. */
export const CHAPTERS = [0, 0.21, 0.45, 0.78, 1] as const;

export const BRIDGE_LABEL = STACK.short;
export const NEGATIONS: readonly string[] = [...(STACK.react ? [] : ["no React"]), ...(STACK.bundler ? [] : ["no bundler"])];
export const SERVICE_SUB = `${SERVICE.kind}${SERVICE.external ? ", external" : ""}`;
export const NO_LINK = "no link";
export const NO_FIT = { title: "No fit data here", note: "Shopify has no field for it" } as const;
export const API = { probe: "fit?", list: "GET /patterns", listOk: "200 OK", write: "POST /patterns", writeOk: "201 Created" } as const;
export const CALL_STATUS = ["no calls yet", "GET 200", "POST 201"] as const;
/* The save action has one name on screen: the flow step label. The button face reads it, and its done face says what happened. */
export const SAVE_LABELS = { idle: FLOW_STEPS[2].label, done: "Saved as new", name: "name", head: "New pattern", next: "next free name" } as const;
/* The gate rule is said once, in Gate caption 01. Behind the cart bar the Fit scene only says when it opens, which stays true after it has. */
export const GATE_NOTE = "Opens once the fit is saved";
export const FIT_HEAD = "Your fit";
export const OPTION_LABELS = { collar: "Collar", cuff: "Cuff" } as const;
export const CHECKS_HEAD = "Checks";

export type RecordRow = { readonly id: string; readonly name: string; readonly gender: Gender };

const FIRST_RECORD = 412;
const recordId = (n: number) => `pat_${String(n).padStart(4, "0")}`;

const SAMPLE_RECORDS: readonly RecordRow[] = PATTERNS.map((p, i) => ({ id: recordId(FIRST_RECORD + i), name: p.name, gender: p.gender }));
/* The first clone of the day is already stored as the sixth record (pat_0417), so the save gets the next free name and id: "(2)", pat_0418. */
export const EXISTING_RECORD: RecordRow = { id: recordId(FIRST_RECORD + SAMPLE_RECORDS.length), name: CLONE_DEMO.existing[0], gender: PRODUCT.gender };
/* The service lists its newest record first, so the save lands on top of the clone it is named after, and that clone sits right under it. */
export const RECORDS: readonly RecordRow[] = [...SAMPLE_RECORDS, EXISTING_RECORD].reverse();
export const NEW_RECORD: RecordRow = { id: recordId(FIRST_RECORD + RECORDS.length), name: CLONE_DEMO.next[0], gender: PRODUCT.gender };
/** The list count as the service reports it: 6 before the POST, 7 after. */
export const RECORD_COUNT = { before: RECORDS.length, after: RECORDS.length + 1 } as const;
/* The product page lists the patterns of its gender. Two fit in the short window, the third opens up when the window grows. */
export const FIT_LIST = filterByGender(PATTERNS, PRODUCT.gender).slice(0, 3);
export const FIT_SHORT = 2;

type FieldTime = { readonly type: Span; readonly check: Span };

export const FIELD_T: Readonly<Record<Exclude<MeasureId, "sleeve">, FieldTime>> = {
  height: { type: [0.515, 0.54], check: [0.54, 0.55] },
  collar: { type: [0.545, 0.57], check: [0.57, 0.58] },
  band: { type: [0.705, 0.72], check: [0.72, 0.73] },
  waist: { type: [0.72, 0.735], check: [0.735, 0.745] },
  cup: { type: [0.735, 0.75], check: [0.75, 0.76] },
};

export const SLEEVE_T = {
  type: [0.58, 0.61],
  bad: [0.61, 0.625],
  back: [0.64, 0.66],
  retype: [0.67, 0.69],
  ok: [0.69, 0.705],
} as const;

/* The value flips while the text is fully clipped away. */
export const SLEEVE_FLIP = (SLEEVE_T.back[1] + SLEEVE_T.retype[0]) / 2;

export const T = {
  records: { start: -0.03, step: 0.018, len: 0.03 },
  probeOut: [0.09, 0.15],
  probeHit: [0.15, 0.17],
  probeBack: [0.17, 0.19],
  probeShake: [0.15, 0.185],
  wake: [0.24, 0.3],
  wire: [0.2, 0.25],
  pill: [0.22, 0.265],
  negations: [0.26, 0.3],
  get: [0.3, 0.355],
  busyGet: [0.345, 0.385],
  ok: [0.365, 0.415],
  list: [0.41, 0.44],
  select: [0.435, 0.455],
  bridgeOut: [0.418, 0.433],
  cartIn: [0.452, 0.466],
  formWipe: [0.462, 0.505],
  saveWipe: [0.77, 0.805],
  bridgeIn: [0.834, 0.848],
  name: [0.825, 0.86],
  checks: [0.79, 0.83],
  press: [0.865, 0.885],
  post: [0.875, 0.93],
  busyPost: [0.92, 0.955],
  land: [0.93, 0.95],
  landText: [0.94, 0.965],
  landCheck: [0.955, 0.975],
  created: [0.95, 0.985],
  flip: [0.975, 0.995],
  unlock: [0.982, 1],
} as const satisfies Record<string, Span | { readonly start: number; readonly step: number; readonly len: number }>;

export const LAYOUT = {
  xs: [0, 0.435, 0.475, 0.775, 0.83, 1],
  window: [51, 51, 88, 88, 58, 58],
  gap: [19, 19, 2, 2, 12, 12],
  service: [30, 30, 6, 6, 30, 30],
  /* The collapsed service tile is exactly its header strip: padding, header and the gap above the list. */
  serviceMinPx: 56,
} as const;

/* 0 in the short window, 1 in the stretched one: same keyframes as the layout, so both grow together. */
export const STRETCH = [0, 0, 1, 1, 0, 0] as const;
