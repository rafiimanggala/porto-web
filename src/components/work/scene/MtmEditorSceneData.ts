import {
  ACCOUNT_LABELS,
  CLONE_DEMO,
  FLOW_STEPS,
  GATE_STATES,
  MEASURES,
  PATTERNS,
  PRODUCT,
  WOMEN_ONLY_ACCOUNT,
  filterByGender,
  genderNoun,
  measureById,
  type Measure,
} from "./MtmKitData";

/* Content and timeline of the inline pattern editor scene. Names, numbers and rules come from MtmKitData. */

export const CAPTIONS = [
  { eyebrow: "01 / Library", title: "Saved patterns, one tap away.", body: "A returning customer reopens a pattern instead of measuring again." },
  { eyebrow: "02 / Edit", title: "Tweak it on the product page.", body: "The editor opens inline, so nothing sends the customer away." },
  { eyebrow: `03 / ${FLOW_STEPS[2].label}`, title: "Clone, never overwrite.", body: "The copy is date-stamped and numbered, and the original stays exactly as it was." },
  { eyebrow: "04 / Filter", title: "Filtered, but never blocked.", body: "The list narrows to the product gender and falls back to everything when nothing matches." },
] as const;

export const CHAPTERS = [0, 0.22, 0.48, 0.76, 1] as const;

type Win = readonly [number, number];

/* Progress windows. Every beat is a [from, to] range of the scroll progress. */
export const T = {
  load: [0.012, 0.09] as Win,
  firstCard: [-0.04, 0] as Win,
  cards: { from: 0.006, step: 0.018, dur: 0.04 },
  fitDone: [0.1, 0.13] as Win,
  tapCard: { travel: [0.104, 0.162] as Win, press: [0.162, 0.184] as Win, gone: [0.187, 0.2] as Win },
  select: [0.169, 0.193] as Win,
  others: { from: 0.22, step: 0.014, dur: 0.03 },
  rowOpen: { from: 0.223, step: 0.018, dur: 0.038 },
  rowClose: { from: 0.492, step: 0.005, dur: 0.016 },
  bar: [0.27, 0.31] as Win,
  fields: { from: 0.232, step: 0.014, dur: 0.042 },
  focus: [0.3, 0.43] as Win,
  nudge: [0.316, 0.396] as Win,
  ok: [0.386, 0.412] as Win,
  diff: [0.372, 0.425] as Win,
  tapSave: { travel: [0.418, 0.462] as Win, press: [0.466, 0.49] as Win, gone: [0.494, 0.51] as Win },
  saveLoad: [0.496, 0.552] as Win,
  collapse: [0.492, 0.514] as Win,
  existing: [0.5, 0.518] as Win,
  slot2: [0.5, 0.522] as Win,
  lift2: [0.518, 0.586] as Win,
  deselect: [0.522, 0.544] as Win,
  unchanged: [0.556, 0.582] as Win,
  type2: [0.578, 0.62] as Win,
  tapSave2: { travel: [0.6, 0.62] as Win, press: [0.622, 0.642] as Win, gone: [0.646, 0.66] as Win },
  saveLoad2: [0.644, 0.664] as Win,
  slot3: [0.648, 0.672] as Win,
  lift3: [0.66, 0.716] as Win,
  type3: [0.688, 0.73] as Win,
  move2: [0.708, 0.734] as Win,
  wipe: [0.755, 0.795] as Win,
  menu: [0.775, 0.8] as Win,
  filter: [0.812, 0.858] as Win,
  acct: [0.868, 0.897] as Win,
  ship: [0.925, 0.952] as Win,
  tapRow: { travel: [0.942, 0.962] as Win, press: [0.964, 0.976] as Win },
  pick: [0.968, 0.984] as Win,
  unlock: [0.974, 0.997] as Win,
  stepX: [0.2, 0.245, 0.452, 0.488, 0.745, 0.785, 0.955, 0.985] as readonly number[],
  stepY: [0, 1, 1, 2, 2, 3, 3, 4] as readonly number[],
} as const;

export const CARD_H = 54;
export const CARD_GAP = 8;
export const CARD_PITCH = CARD_H + CARD_GAP;
export const ACTION_H = 44;
export const FIELD_H = 84;
export const FIELD_GAP = 10;
export const ROW_H = 32;
export const TRIGGER_H = 36;

export const BASE = PATTERNS[0];
export const OTHERS = PATTERNS.slice(1);
/* The editor has room for four fields: the first four of MEASURES in order (Height, Collar, Sleeve, Band). */
export const EDIT_FIELD_COUNT = 4;
export const EDIT_FIELDS: readonly Measure[] = MEASURES.slice(0, EDIT_FIELD_COUNT);

const COLLAR = measureById("collar");
/* The tweak is two units up from the sample, still inside the valid range. */
export const EDIT = { id: COLLAR.id, label: COLLAR.label, unit: COLLAR.unit, from: COLLAR.sample, to: COLLAR.sample + 2 } as const;
export const DIFF_TEXT = `${EDIT.label} ${EDIT.from} to ${EDIT.to} ${EDIT.unit}`;

export const EXISTING_CLONE = CLONE_DEMO.existing[0];
export const COPY_FULL = { two: CLONE_DEMO.next[0], three: CLONE_DEMO.next[1] } as const;
export const suffixOf = (full: string) => full.slice(BASE.name.length);

export const SAVE_LABEL = FLOW_STEPS[2].label;
export const UNCHANGED = "Unchanged";
export const TITLES = [`Saved patterns`, `Editing ${BASE.name}`, `Saved patterns`] as const;

export const SHOWN_MEN = filterByGender(PATTERNS, PRODUCT.gender);
export const SHOWN_FALLBACK = filterByGender(WOMEN_ONLY_ACCOUNT, PRODUCT.gender);
/* Two example accounts of the filter, not the account the clones were saved to. */
export const ACCOUNTS = [
  `${ACCOUNT_LABELS.a}, ${PATTERNS.length} patterns`,
  `${ACCOUNT_LABELS.b}, ${WOMEN_ONLY_ACCOUNT.length} ${genderNoun(WOMEN_ONLY_ACCOUNT[0].gender)} patterns`,
] as const;
/* The filter pill reads "Product: Men". On a narrow stage the key drops out so the account line beside it is never cut. */
export const FILTER = { key: "Product", value: PRODUCT.gender } as const;
export const PLACEHOLDER = "Choose a pattern";
export const PICKED = SHOWN_FALLBACK[0];
export const V1 = { eyebrow: "Before", title: "Dropdown hidden", tag: "v1, rolled back", ghost: `No ${genderNoun(PRODUCT.gender)} patterns` } as const;
export const RECEIPT = GATE_STATES[1].label;
export const SHIPPED_NOTE = `No ${genderNoun(PRODUCT.gender)} patterns, so all are shown`;
