import { BAD_ENTRY, COLLARS, CUFFS, FABRICS, GATE, GATE_STATES, MEASURES, ORDER, PATTERNS, PRODUCT, filterByGender, formatMeasure, genderNounCap, measureById, type Measure } from "./MtmKitData";
import type { MtmGlyphName } from "./MtmKitGlyphs";

/* Add to cart gate scene: content and timeline. Numbers and strings come from MtmKitData. */

export type Win = readonly [number, number];

export const CAPTIONS = [
  {
    eyebrow: "01 / Locked",
    title: "No fit, no cart.",
    body: "Add to cart stays locked until valid fit data stands behind the choice.",
  },
  {
    eyebrow: "02 / Pick",
    title: "Choose a saved pattern.",
    body: "Selecting a saved pattern unlocks the button.",
  },
  {
    eyebrow: "03 / Switch",
    title: "Or start a fresh fitting.",
    body: `Switching clears the old choice, so the two never mix. A sleeve of ${BAD_ENTRY.typed} is refused until it reads ${BAD_ENTRY.fixed}.`,
  },
  {
    eyebrow: "04 / Safe",
    title: "Never a broken state.",
    body: GATE.bailOut,
  },
] as const;

export const CHAPTERS = [0, 0.22, 0.52, 0.78, 1] as const;

/* The demo pick is the first line of the demo order (Oxford white, Cutaway, Double), so the gate, the phone and the email all show one shirt. */
const [FIRST_ITEM] = ORDER.items;
export const PICK = {
  fabric: FABRICS.findIndex((f) => f.name === FIRST_ITEM.fabric),
  collar: COLLARS.indexOf(FIRST_ITEM.collar),
  cuff: CUFFS.indexOf(FIRST_ITEM.cuff),
  pattern: 0,
} as const;
export const MEN_PATTERNS = filterByGender(PATTERNS, PRODUCT.gender);
export const SLEEVE = measureById(BAD_ENTRY.id);
/* The first three of MEASURES in order (Height, Collar, Sleeve): the fresh pane has room for three, and the third is the sleeve of the demo mistake. */
export const FRESH_FIELDS: readonly Measure[] = MEASURES.slice(0, 3);

export const HINT = {
  locked: "Choose or create a fit",
  sleeve: `Sleeve ${BAD_ENTRY.typed} is out of range, ${SLEEVE.min} to ${SLEEVE.max}`,
  empty: { label: "fit data", value: "none yet" },
  settled: "Locked, nothing half saved",
  choose: "Choose a saved pattern",
  filtered: `${genderNounCap(PRODUCT.gender)} patterns, ${MEN_PATTERNS.length} of ${PATTERNS.length}`,
  cancel: "Cancel",
  unit: "all values in cm",
} as const;

export type PinChip = { readonly label: string; readonly value: string };
/* Every scene names and orders the six measures the same way: the label is the MEASURES label as is (Band, never Chest). */
export const labelOf = (m: Measure) => m.label;
const chipOf = (m: Measure): PinChip => ({ label: labelOf(m), value: formatMeasure(m, m.sample).replace(` ${m.unit}`, "") });
export const PIN_SAVED: readonly PinChip[] = MEASURES.map(chipOf);
export const PIN_FRESH: readonly PinChip[] = FRESH_FIELDS.map(chipOf);

export const LAYOUT = { panePad: 10, tabsH: 28, gap: 8, rowH: 54, menuGap: 6, paneH: 170 } as const;
export const CHIP = { len: 0.006, stagger: 0.001, draw: 0.012 } as const;
/* A wipe has three beats: the old content is gone by `out`, the accent edge sweeps until `sweep`, the new content fades in after. */
export const WIPE = { out: 0.3, sweep: 0.65 } as const;
/** When the new content of a wipe window starts to show, so chips and lines can start with it. */
export const inkStart = (w: Win) => w[0] + (w[1] - w[0]) * WIPE.sweep;
export const MENU_TOP = LAYOUT.panePad + LAYOUT.tabsH + LAYOUT.gap;

export const NODES = GATE_STATES.map((s) => ({ id: s.id, label: s.label, name: s.label.split(" ")[0] }));
export const NODE_GLYPHS: readonly MtmGlyphName[] = ["lock", "save", "pencil", "check"];
export const RAIL_LABELS = ["pick", "switch", "fix"] as const;
export const BAIL_LABEL = "bail out";

export const T = {
  fabric: [0.025, 0.05],
  collar: [0.06, 0.085],
  cuff: [0.095, 0.12],
  click: [
    { press: [0.125, 0.15], shake: [0.15, 0.2], slot: [0.128, 0.148] },
    { press: [0.92, 0.94], shake: [0.94, 0.975], slot: [0.92, 0.94] },
  ],
  paneFit: [0.225, 0.247],
  open: [0.26, 0.29],
  hoverKeys: [0.275, 0.3, 0.31, 0.33],
  hoverVals: [0, 1, 1, 0],
  choose: [0.335, 0.36],
  selWipe: [0.355, 0.37],
  close: [0.37, 0.395],
  slotPending: [0.362, 0.38],
  slotSaved: [0.4, 0.42],
  unlock1: [0.43, 0.475],
  dimsClear: [0.512, 0.526],
  slotClear: [0.52, 0.538],
  relock: [0.52, 0.55],
  paneFresh: [0.535, 0.557],
  deselect: [0.565, 0.58],
  selBack: [0.57, 0.585],
  typeH: [0.563, 0.574],
  typeC: [0.577, 0.586],
  typeS: [0.589, 0.601],
  okH: [0.574, 0.584],
  okC: [0.586, 0.596],
  bad: [0.601, 0.611],
  slotWarn: [0.6, 0.618],
  back: [0.668, 0.68],
  slotBack: [0.668, 0.686],
  retype: [0.688, 0.698],
  ok: [0.698, 0.71],
  slotFresh: [0.706, 0.724],
  unlock2: [0.71, 0.75],
  edit: [0.79, 0.81],
  armOff: [0.79, 0.805],
  slotEdit: [0.79, 0.808],
  relock2: [0.79, 0.83],
  cancel: [0.83, 0.85],
  linesOff: [0.842, 0.85],
  clear: [0.85, 0.858],
  paneBack: [0.86, 0.882],
  move: [
    [0.385, 0.425],
    [0.53, 0.56],
    [0.7, 0.735],
    [0.795, 0.825],
  ],
  bail: { up: [0.855, 0.87], run: [0.87, 0.895], down: [0.895, 0.915] },
  land: [0.9, 0.935],
  trail: [0.93, 0.965],
  slotEnd: [0.96, 0.98],
  settle: [0.965, 0.99],
} as const;

export const CHIPS_SAVED = inkStart(T.slotSaved);
export const CHIPS_FRESH = inkStart(T.slotFresh);
