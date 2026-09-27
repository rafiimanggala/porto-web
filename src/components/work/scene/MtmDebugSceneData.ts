import { DEBUG, DEBUG_TABS, STACK, THEME_FOLDERS } from "./MtmKitData";
import type { Win } from "./MtmDebugSceneMath";

/* Debug scene: copy and timeline. Numbers and names come from MtmKitData, the rest is invented sample data. */

/* Present tense, and every title reads alone. The eyebrow noun is the tab label, from the one shared DEBUG_TABS. */
const eyebrow = (k: 0 | 1 | 2 | 3) => `0${k + 1} / ${DEBUG_TABS[k]}` as const;

export const CAPTIONS = [
  {
    eyebrow: eyebrow(0),
    title: "One login redirect, not three.",
    body: "The layout carries the same function three times, each fighting the others.",
  },
  {
    eyebrow: eyebrow(1),
    title: "Blank store menu, then a fallback.",
    body: "The store menu reads a metafield only, so it goes blank whenever that is empty.",
  },
  {
    eyebrow: eyebrow(2),
    title: "Trust the deployed bytes.",
    body: "A font size looks stuck, so the live theme and CDN bytes are read directly.",
  },
  {
    eyebrow: eyebrow(3),
    title: "Backup and tag before every push.",
    body: "Every push goes out behind a full backup and a git tag.",
  },
] as const;

export const CHAPTERS = [0, 0.26, 0.5, 0.76, 1] as const;

/* Page changes of the stage, each centred on a chapter boundary. They are as short as the caption swap of the scroll scene
   (0.024 wide) so the caption dip and the wipe are one event, and every case ends at least 0.03 before its wipe starts. */
export const WIPES = [
  [0.245, 0.275],
  [0.485, 0.515],
  [0.745, 0.775],
] as const;

/* Tab labels are the caption eyebrow nouns (Login, Menu, Bytes, Ship). */
export const TABS = DEBUG_TABS;

/* When each case counts as closed, for the pips and the counter in the footer. */
export const CLOSED_AT = [0.212, 0.455, 0.714, 0.976] as const;

export const FOOTER = { label: "closed", stack: STACK.short } as const;

/* ---------- 01 Login: three copies of one helper ---------- */

export const HELPER = DEBUG.redirect.name;
export const LAYOUT_FILE = "layout/theme.liquid";
export const REDIRECT_CLASH = DEBUG.redirect.clash.split(" ")[0];

export const COPIES = [
  { line: 14, dest: "/account/login" },
  { line: 96, dest: "/" },
  { line: 231, dest: "/account" },
] as const;

export const PAGES = { from: "/account/login", to: "/account" } as const;

export const LOGIN = {
  bounce: { xs: [0, 0.028, 0.056, 0.084, 0.112, 0.19], ys: [0, 1, 0, 1, 0, 1] },
  jitterOff: [0.056, 0.084],
  spread: [0.056, 0.098],
  reveal: [0.098, 0.122],
  mark: [0.122, 0.142],
  bracketOff: [0.128, 0.148],
  merge: [0.142, 0.205],
  roll: [0.166, 0.19],
  keep: [0.19, 0.212],
} as const satisfies Record<string, Win | { xs: readonly number[]; ys: readonly number[] }>;

/* ---------- 02 Menu: a lookup with no fallback ---------- */

/* The client stays anonymous: the preferred-store options are placeholders, never real street or suburb names. */
export const STORES = ["Store A", "Store B", "Store C"] as const;

export const MENU = {
  metafield: DEBUG.menu.metafield,
  storageKey: DEBUG.menu.storageKey,
  writtenBy: `written by ${DEBUG.menu.writtenBy}`,
  head: "pref = metafield",
  tail: ` || localStorage.${DEBUG.menu.storageKey}`,
  stored: STORES[0],
  copy: { field: "Preferred store", warn: "no fallback", unread: "not read", onlyLookup: "the only lookup", empty: "0 options", blank: "blank", filled: "filled" },
} as const;

export const MENU_TL = {
  wireLeft: [0.28, 0.291],
  glow: [0.289, 0.295, 0.302],
  wireDown: [0.297, 0.308],
  blank: [0.308, 0.323],
  warn: [0.325, 0.347],
  write: [0.351, 0.379],
  wireRight: [0.381, 0.392],
  pktRight: [0.39, 0.401],
  code: [0.401, 0.423],
  down2: [0.423, 0.436],
  fill: [0.427, 0.444],
  rows: [0.436, 0.455],
} as const;

/* ---------- 03 Bytes: the browser against the deployed file ---------- */

export const FONT = { seen: DEBUG.font.seen, live: DEBUG.font.live, seenPx: parseInt(DEBUG.font.seen, 10), livePx: parseInt(DEBUG.font.live, 10) } as const;
export const CSS_TEXT = `${DEBUG.font.property}:${DEBUG.font.live}`;
export const HEX = Array.from(CSS_TEXT, (c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));
export const FOUND_FROM = CSS_TEXT.indexOf(DEBUG.font.live);
export const RULER_PX = 6;

export const PROBES = [
  { id: "browser", label: "Browser", sub: "local render" },
  { id: "live", label: "Live theme", sub: "raw pull" },
  { id: "cdn", label: "CDN asset", sub: "bytes" },
] as const;

/* One plain sentence, no vote count: the browser reported 12px, the deployed bytes say 15px, so the browser is the outlier. */
export const VERDICT = {
  seen: `browser reported ${DEBUG.font.seen}`,
  live: `deployed bytes say ${DEBUG.font.live}`,
  outlier: "the browser is the outlier",
} as const;

export const BYTES_TL = {
  /* The browser card types out what the browser computed; the two proof rows start once it is read. */
  read: [0.52, 0.556],
  browserOn: [0.518, 0.528],
  live: [0.558, 0.618],
  cdn: [0.622, 0.682],
  verdict: [0.684, 0.714],
} as const satisfies Record<string, Win>;

/* ---------- 04 Ship: a backup and a tag before the push ---------- */

export const PUSH = DEBUG.push;
/* The theme folders the backup zips, in archive order: layout, sections, snippets, templates, assets, config, locales. */
export const FOLDERS = THEME_FOLDERS;
export const TAG_STEM = PUSH.tag.slice(0, PUSH.tag.lastIndexOf("-") + 1);
export const TAG_NUMBER = Number(PUSH.tag.slice(PUSH.tag.lastIndexOf("-") + 1));
export const TAG_BEFORE = `${TAG_STEM}${TAG_NUMBER - 1}`;
export const TAG_COMMAND = `git tag ${PUSH.tag}`;
export const PUSH_LABEL = "Push theme";
/* The push gate is a checklist, not a lock: it is ready once both checks are done. */
export const PUSH_GATE = { checks: ["backup done", "tag done"], waiting: "waiting", ready: "ready", pushed: "pushed" } as const;

export const SHIP = {
  backup: [0.786, 0.85],
  chips: [0.798, 0.844],
  linkTag: [0.846, 0.858],
  tag: [0.852, 0.892],
  linkGate: [0.888, 0.898],
  gate: [0.894, 0.916],
  linkLive: [0.92, 0.932],
  press: [0.918, 0.93],
  push: [0.924, 0.958],
  done: [0.958, 0.976],
  slide: [0.956, 0.976],
  rollback: [0.972, 0.996],
} as const satisfies Record<string, Win>;

/* ---------- Header readout ---------- */

export const READOUT = {
  copies: (v: number) => (v < LOGIN.roll[0] + 0.009 ? COPIES.length : 1),
  options: (v: number) => STORES.filter((_, i) => v >= MENU_TL.rows[0] + (i * (MENU_TL.rows[1] - MENU_TL.rows[0])) / STORES.length).length,
} as const;
