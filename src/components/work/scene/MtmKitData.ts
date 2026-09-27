import type { MtmGlyphName } from "./MtmKitGlyphs";

/* Single source of truth for the made-to-measure scenes. All content is invented and the client stays anonymous. */

/* ---------- The system ---------- */

export const STACK = {
  theme: "Shopify theme",
  languages: "Liquid and vanilla JavaScript",
  /** The short form for a pill or a footer. */
  short: "Liquid + vanilla JS",
  react: false,
  bundler: false,
} as const;

/** Fit data lives in an external service reached through a REST API that the theme does not control. */
export const SERVICE = { label: "Pattern service", kind: "REST API", external: true } as const;

export const PRODUCT = { name: "Tailored shirt", gender: "Men", path: "/products/tailored-shirt" } as const;

/** The collection grid the product sits in. Its address is the one to show on the grid view, PRODUCT.path on the form and product views. */
export const COLLECTION_PATH = "/collections/shirts";

export const DEMO_DATE = "2026-09-27";

/* ---------- Measurements ---------- */

export type MeasureId = "height" | "collar" | "sleeve" | "band" | "waist" | "cup";

export type Measure = {
  readonly id: MeasureId;
  readonly label: string;
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly sample: number;
  /** Set for the cup: the value is a 1 based index into these letters. */
  readonly letters?: string;
};

export const MEASURES = [
  { id: "height", label: "Height", unit: "cm", min: 150, max: 210, sample: 178 },
  { id: "collar", label: "Collar", unit: "cm", min: 34, max: 48, sample: 40 },
  { id: "sleeve", label: "Sleeve", unit: "cm", min: 55, max: 72, sample: 64 },
  { id: "band", label: "Band", unit: "cm", min: 70, max: 120, sample: 92 },
  { id: "waist", label: "Waist", unit: "cm", min: 60, max: 130, sample: 84 },
  { id: "cup", label: "Cup", unit: "", min: 1, max: 8, sample: 4, letters: "ABCDEFGH" },
] as const satisfies readonly Measure[];

export const measureById = (id: MeasureId): Measure => MEASURES.find((m) => m.id === id) ?? MEASURES[0];

export const inRange = (m: Measure, v: number) => v >= m.min && v <= m.max;

/** 4 becomes "D". Out of range indexes give "". */
export const cupLetter = (index: number) => MEASURES[5].letters.charAt(Math.round(index) - 1);

/** "64 cm" or "D". */
export const formatMeasure = (m: Measure, v: number) =>
  m.letters ? m.letters.charAt(Math.round(v) - 1) : `${Math.round(v)} ${m.unit}`.trim();

/** The demo mistake: sleeve typed as 112 (out of range 55 to 72), corrected to 64. */
export const BAD_ENTRY = { id: "sleeve", typed: 112, fixed: 64 } as const;

/* ---------- Saved patterns ---------- */

export type Gender = "Men" | "Women";

/** The enum as it reads in a sentence: Men becomes "men's". Never print the raw enum in running text. */
export const genderNoun = (g: Gender) => (g === "Men" ? "men's" : "women's");

/** The same at the start of a sentence: "Men's". */
export const genderNounCap = (g: Gender) => {
  const noun = genderNoun(g);
  return `${noun.charAt(0).toUpperCase()}${noun.slice(1)}`;
};

export type Garment = "shirt" | "suit" | "dress";
export type Pattern = { readonly id: string; readonly name: string; readonly gender: Gender; readonly garment: Garment };

export const PATTERNS = [
  { id: "everyday", name: "Everyday fit", gender: "Men", garment: "shirt" },
  { id: "work", name: "Work shirt fit", gender: "Men", garment: "shirt" },
  { id: "wedding", name: "Wedding suit fit", gender: "Men", garment: "suit" },
  { id: "summer", name: "Summer dress fit", gender: "Women", garment: "dress" },
  { id: "evening", name: "Evening fit", gender: "Women", garment: "dress" },
] as const satisfies readonly Pattern[];

/** An account that only has women's patterns, looking at the men's product: no match, so everything is shown. */
export const WOMEN_ONLY_ACCOUNT: readonly Pattern[] = PATTERNS.filter((p) => p.gender === "Women");

/** Gender filter: patterns of the product gender when at least one matches, otherwise all of them. */
export function filterByGender(patterns: readonly Pattern[], gender: Gender): readonly Pattern[] {
  const match = patterns.filter((p) => p.gender === gender);
  return match.length > 0 ? match : patterns;
}

/** The two example accounts of the gender filter demo. */
export const ACCOUNT_LABELS = { a: "Example account A", b: "Example account B" } as const;

export const GENDER_FILTER = {
  rule: "Filter to the product gender when a match exists, otherwise show everything.",
  rolledBack: "A stricter first version hid the dropdown when the account had no match. It was rolled back.",
} as const;

/** Clone naming: "Everyday fit 2026-09-27" for n = 1, then "Everyday fit 2026-09-27 (2)", "(3)". */
export const cloneName = (base: string, date: string, n: number) => (n <= 1 ? `${base} ${date}` : `${base} ${date} (${n})`);

/** Smallest free clone name for a base, given the names already taken. */
export function nextCloneName(base: string, date: string, taken: readonly string[]): string {
  const free = (n: number): string => (taken.includes(cloneName(base, date, n)) ? free(n + 1) : cloneName(base, date, n));
  return free(1);
}

/** The demo: the first clone of the day already exists, so the next two saves are "(2)" and "(3)". */
export const CLONE_DEMO = {
  base: "Everyday fit",
  date: DEMO_DATE,
  existing: [cloneName("Everyday fit", DEMO_DATE, 1)],
  next: [cloneName("Everyday fit", DEMO_DATE, 2), cloneName("Everyday fit", DEMO_DATE, 3)],
} as const;

/* ---------- Product options and fabrics ---------- */

export const COLLARS = ["Cutaway", "Classic", "Button-down"] as const;
export const CUFFS = ["Single", "Double", "French"] as const;

export type Weave = "basket" | "plain" | "twill" | "slub";
export type FabricTone = "fg" | "sky" | "sun";
export type Fabric = { readonly id: string; readonly name: string; readonly tone: FabricTone; readonly amount: number; readonly weave: Weave };

export const FABRICS = [
  { id: "oxford", name: "Oxford white", tone: "fg", amount: 88, weave: "basket" },
  { id: "poplin", name: "Poplin sky", tone: "sky", amount: 82, weave: "plain" },
  { id: "twill", name: "Twill navy", tone: "sky", amount: 30, weave: "twill" },
  { id: "linen", name: "Linen sand", tone: "sun", amount: 52, weave: "slub" },
] as const satisfies readonly Fabric[];

/** Theme-token colour of a fabric, as a CSS colour. */
export const fabricColor = (f: Fabric) => `color-mix(in oklab, var(--color-${f.tone}) ${f.amount}%, var(--color-surface-1))`;

/* ---------- The five step flow and the cart gate ---------- */

export type FlowStep = { readonly id: string; readonly label: string; readonly glyph: MtmGlyphName };

export const FLOW_STEPS = [
  { id: "fit", label: "Get Fitted", glyph: "tape" },
  { id: "edit", label: "Edit Pattern", glyph: "pencil" },
  { id: "save", label: "Save As New", glyph: "save" },
  { id: "select", label: "Select Other", glyph: "shirt" },
  { id: "cart", label: "Add to cart", glyph: "cart" },
] as const satisfies readonly FlowStep[];

export type GateState = { readonly id: string; readonly label: string; readonly unlocked: boolean; readonly note: string };

/** Add to cart is locked until valid fit data stands behind the choice. */
export const GATE_STATES = [
  { id: "locked", label: "Locked", unlocked: false, note: "No fit data behind the choice yet" },
  { id: "saved", label: "Saved pattern selected", unlocked: true, note: "A stored pattern stands behind the choice" },
  { id: "fresh", label: "Fresh fitting", unlocked: false, note: "Typed in, not valid yet: still locked" },
  { id: "valid", label: "Valid", unlocked: true, note: "Every field is in range" },
] as const satisfies readonly GateState[];

export const GATE = {
  rule: "Add to cart unlocks only when valid fit data stands behind the choice.",
  bailOut: "Cancel an edit half way and the button goes back to locked.",
} as const;

/* ---------- Debug story ---------- */

export const DEBUG = {
  redirect: { name: "redirectAfterLogin", copies: 3, where: "theme layout", clash: "!important overrides", after: 1 },
  menu: { metafield: "custom.preferred_store", storageKey: "preferredStore", writtenBy: "profile page", fallback: "localStorage" },
  font: { property: "font-size", seen: "12px", live: "15px", proofs: ["raw pull of the live theme", "CDN asset bytes"] },
  push: { backup: "backup-2026-09-27.zip", tag: "v2026.09.27-3", date: DEMO_DATE },
} as const;

/** Tab labels of the debug scene. They are also the noun of each caption eyebrow ("01 / Login"), so a tab and its caption always agree. */
export const DEBUG_TABS = ["Login", "Menu", "Bytes", "Ship"] as const;

/** The theme folders the backup zips, in the order they go into the archive. */
export const THEME_FOLDERS = ["layout", "sections", "snippets", "templates", "assets", "config", "locales"] as const;

/* ---------- Ten email flows ---------- */

export type EmailGroup = "order" | "account" | "appointment";
export type EmailFlow = { readonly id: string; readonly name: string; readonly group: EmailGroup; readonly glyph: MtmGlyphName; readonly trigger: string };

export const EMAIL_FLOWS = [
  { id: "order-confirmation", name: "Order Confirmation", group: "order", glyph: "receipt", trigger: "order placed" },
  { id: "shipping-notification", name: "Shipping Notification", group: "order", glyph: "truck", trigger: "order shipped" },
  { id: "delivery-confirmation", name: "Delivery Confirmation", group: "order", glyph: "box", trigger: "order delivered" },
  { id: "order-collected", name: "Order Collected", group: "order", glyph: "bag", trigger: "picked up" },
  { id: "store-collection-ready", name: "Store Collection Ready", group: "order", glyph: "store", trigger: "ready in store" },
  { id: "welcome-email", name: "Welcome Email", group: "account", glyph: "star", trigger: "account created" },
  { id: "account-activation", name: "Account Activation", group: "account", glyph: "user", trigger: "invite sent" },
  { id: "password-reset", name: "Password Reset", group: "account", glyph: "key", trigger: "reset asked" },
  { id: "appointment-confirmation", name: "Appointment Confirmation", group: "appointment", glyph: "calendar", trigger: "booked" },
  { id: "appointment-reminder", name: "Appointment Reminder", group: "appointment", glyph: "bell", trigger: "day before" },
] as const satisfies readonly EmailFlow[];

export type EmailFlowId = (typeof EMAIL_FLOWS)[number]["id"];

/* ---------- Demo order ---------- */

export type OrderItem = { readonly product: string; readonly collar: string; readonly cuff: string; readonly fabric: string };

export const ORDER = {
  number: "#10482",
  firstName: "Alex",
  items: [
    { product: "Tailored shirt", collar: "Cutaway", cuff: "Double", fabric: "Oxford white" },
    { product: "Tailored shirt", collar: "Classic", cuff: "Single", fabric: "Twill navy" },
  ],
  address: "12 Example Street, Sampletown",
  payment: "Card ending 0000",
} as const satisfies { number: string; firstName: string; items: readonly OrderItem[]; address: string; payment: string };

/** Merge tags of the order confirmation template, and what each resolves to for the demo order. */
export const ORDER_TAGS = [
  { tag: "{{ customer.first_name }}", value: ORDER.firstName },
  { tag: "{{ order.number }}", value: ORDER.number },
  { tag: "{{ item.product }}", value: ORDER.items[0].product },
  { tag: "{{ item.collar }}", value: ORDER.items[0].collar },
  { tag: "{{ item.cuff }}", value: ORDER.items[0].cuff },
  { tag: "{{ item.fabric }}", value: ORDER.items[0].fabric },
  { tag: "{{ shipping.address }}", value: ORDER.address },
  { tag: "{{ payment.method }}", value: ORDER.payment },
] as const;

export const EMAIL_CLAIM = { flows: EMAIL_FLOWS.length, replaced: "every default Shopify transactional email" } as const;
