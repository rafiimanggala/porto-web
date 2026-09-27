import { ARTICLE, BLOCKS, SCRIPT, TAGS } from "./PipeKitData";
import { AH, AW, CAPTION_TEXT, CAPTION_WRAP, CAP_FS, PHRASES, ROW_AT, TL } from "./PipeScriptData";
import { segAt } from "./PipeKitMath";
import { easeInOutCubic } from "./HealthSceneParts";

/* Pure geometry of the script scene, in stage units (see AW and AH). Nothing here touches React. */

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export type Pt = readonly [number, number];

export const CHAR_W = 6.3;
export const LINE_H = 16;
export const PAD_X = 12;

export const ART = { h: 258, headY: 12, titleY: 32, bodyY: 82, ghostY: 210 } as const;
/** The script ruler: a label row on top, then the strip of blocks, all inset from the card border. `frame` is the height
    of the card that holds them once the sheet has gone. */
export const RULER = { x: PAD_X, y: 24, w: AW - PAD_X * 2, h: 18, pad: 1, gap: 1.5, frame: 50, labelY: 9 } as const;
export const SEC = RULER.w / SCRIPT.seconds;
/** Stage x of a second on the ruler. */
export const secX = (s: number) => RULER.x + s * SEC;
export const PANEL = { y: AH - 152, h: 50 } as const;
/** The article card grows into the script sheet: the ruler on top, one row per block beneath it. */
export const SHEET_H = PANEL.y - 9;
export const BULB: Pt = [24, PANEL.y + PANEL.h / 2];

function wrap(text: string, max: number): readonly string[] {
  return text.split(" ").reduce<readonly string[]>((lines, word) => {
    const last = lines[lines.length - 1];
    if (last === undefined) return [word];
    return last.length + 1 + word.length > max ? [...lines, word] : [...lines.slice(0, -1), `${last} ${word}`];
  }, []);
}

/* ---------- Article body: sentences wrapped into mono lines, at most one phrase per line ---------- */

export type BodySeg = { readonly text: string; readonly phrase: number };
export type BodyLine = { readonly y: number; readonly text: string; readonly segs: readonly BodySeg[] };

function splitLine(line: string): readonly BodySeg[] {
  const hit = PHRASES.map((ph, i) => ({ i, at: line.indexOf(ph) })).find((h) => h.at >= 0);
  if (!hit) return [{ text: line, phrase: -1 }];
  const ph = PHRASES[hit.i];
  const end = hit.at + ph.length;
  return [
    ...(hit.at > 0 ? [{ text: line.slice(0, hit.at), phrase: -1 }] : []),
    { text: ph, phrase: hit.i },
    ...(end < line.length ? [{ text: line.slice(end), phrase: -1 }] : []),
  ];
}

export const BODY: readonly BodyLine[] = ARTICLE.summary
  .flatMap((sentence) => wrap(sentence, 46))
  .map((text, i) => ({ y: ART.bodyY + i * LINE_H, text, segs: splitLine(text) }));

/* Centre of each phrase in the article, where its chip lifts off. */
export const PHRASE_AT: readonly Pt[] = PHRASES.map((ph) => {
  const line = BODY.find((l) => l.text.includes(ph));
  const at = line ? line.text.indexOf(ph) : 0;
  return [PAD_X + (at + ph.length / 2) * CHAR_W, (line ? line.y : ART.bodyY) + LINE_H / 2];
});

/* ---------- Bars: the article as structure, then folded into the five blocks of the ruler ---------- */

export type BarSpec = { readonly from: Rect; readonly to: Rect; readonly block: number; readonly ghost: boolean; readonly at: number };

const TITLE_BARS: readonly Rect[] = [
  { x: PAD_X, y: ART.titleY + 3, w: 300, h: 8 },
  { x: PAD_X, y: ART.titleY + 22, w: 176, h: 8 },
];
const TITLE_COUNT = TITLE_BARS.length;
const BODY_BARS: readonly Rect[] = BODY.map((l) => ({ x: PAD_X, y: l.y + 4, w: l.text.length * CHAR_W, h: 7 }));
const GHOST_BARS: readonly Rect[] = [
  { x: PAD_X, y: ART.ghostY, w: 310, h: 7 },
  { x: PAD_X, y: ART.ghostY + 15, w: 204, h: 7 },
];
const BAR_BLOCK = [0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4] as const;

export const BLOCK_SEG: readonly { x: number; w: number }[] = BLOCKS.map((b, i) => {
  const left = secX(b.start) + (i > 0 ? RULER.gap : 0);
  const right = secX(b.end) - (i < BLOCKS.length - 1 ? RULER.gap : 0);
  return { x: left, w: right - left };
});

function target(block: number, slot: number, count: number): Rect {
  const inner = RULER.h - RULER.pad * 2;
  return { x: BLOCK_SEG[block].x, w: BLOCK_SEG[block].w, y: RULER.y + RULER.pad + (slot * inner) / count, h: inner / count };
}

export const BARS: readonly BarSpec[] = [...TITLE_BARS, ...BODY_BARS, ...GHOST_BARS].map((from, i) => {
  const block = BAR_BLOCK[i] ?? 4;
  const peers = BAR_BLOCK.filter((b) => b === block).length;
  const slot = BAR_BLOCK.slice(0, i).filter((b) => b === block).length;
  return {
    from,
    to: target(block, slot, peers),
    block,
    ghost: i >= TITLE_BARS.length + BODY_BARS.length,
    at: TL.fold.from + i * TL.fold.step,
  };
});

/* The text of each article line stays under its bar, and fades slowly once that bar has left the line. All the text is
   gone at the same moment, when the last bar has landed and the rows of the sheet start to come in. */
const GONE_FROM = 0.5;
const TEXT_GONE_AT = Math.max(...BARS.map((b) => b.at)) + TL.fold.dur;
const goneWindow = (bar: BarSpec): readonly [number, number] => [bar.at + GONE_FROM * TL.fold.dur, TEXT_GONE_AT];
export const TITLE_GONE = goneWindow(BARS[TITLE_COUNT - 1]);
export const BODY_GONE: readonly (readonly [number, number])[] = BODY.map((_, i) => goneWindow(BARS[TITLE_COUNT + i]));

/* ---------- Script rows (chapter two) and ticks ---------- */

export const ROW_Y0 = 68;
export const ROW_PITCH = 44;
const ROW_MAX = 53;

/* A row shows its block's own text on one line. Text that does not fit is cut at a sentence or a word and ends in
   "...", so a header that says 30 words sits on a line that reads as an excerpt, never as the whole block. */
function excerpt(text: string): string {
  if (text.length <= ROW_MAX) return text;
  const sentence = text.match(/^.*?[.?!](?=\s)/)?.[0];
  const head = sentence && sentence.length <= ROW_MAX - 4 ? sentence : text.slice(0, ROW_MAX - 6).replace(/\s+\S*$/, "").replace(/[,;:]$/, "");
  return `${head} ...`;
}
export const ROW_TEXT: readonly string[] = BLOCKS.map((b) => excerpt(b.text));

/* Each block's words count in while its bars land on the ruler, so the total reaches 108 as the last bar settles. */
const BLOCK_LAND: readonly (readonly [number, number])[] = BLOCKS.map((_, i) => {
  const at = BARS.filter((b) => b.block === i).map((b) => b.at);
  return [Math.min(...at), Math.max(...at) + TL.fold.dur];
});
export const FOLD_END = Math.max(...BLOCK_LAND.map((l) => l[1]));
export const wordsAt = (v: number) =>
  Math.round(BLOCKS.reduce((sum, b, i) => sum + b.words * segAt(v, BLOCK_LAND[i][0], BLOCK_LAND[i][1], easeInOutCubic), 0));
export const TICKS: readonly number[] = [...BLOCKS.map((b) => b.start), SCRIPT.seconds];

/* ---------- Tag cloud (chapter three) ---------- */

export const chipW = (tag: string) => Math.ceil(tag.length * 6.4 + 14);

/* Cloud slot centres in TAGS order: the four kept tags sit close to where they will finally land. */
const CLOUD_DY = 36;
const SLOT: readonly Pt[] = (
  [
    [58, 72], [152, 98], [236, 124], [300, 150],
    [146, 72], [260, 72], [40, 98], [128, 124], [262, 98], [46, 124], [44, 150], [190, 150],
  ] as const
).map(([x, y]) => [x, y + CLOUD_DY] as const);

/** The caption card keeps its foot fixed. It waits as a short slot under the tag cloud (`compact`) and grows upward to
    sit right under the ruler (`full`) once the tags have gone in. */
export const CARD_TOP = { compact: 214, full: 80 } as const;
export const CARD_BOTTOM = SHEET_H - 1;
export const TAG_Y = CARD_BOTTOM - 22;
export const TAG_GAP = 6;
export const ORIGIN: Pt = [AW / 2, 76];
/** Where the tags come out: just under the endpoint tile. */
export const SPAWN: Pt = [AW / 2, 88];
export const CHIP_H = 20;
/** How far a discarded tag drifts while it fades. */
export const DRIFT = 16;
export const GLOBE: Rect = { x: ORIGIN[0] - 14, y: ORIGIN[1] - 18, w: 28, h: 28 };

export type ChipSpec = {
  readonly tag: string;
  readonly kept: boolean;
  readonly w: number;
  readonly slot: Pt;
  readonly dest: Pt | null;
  /** Where a discarded tag drifts to while it fades: never over a kept tag. */
  readonly drift: Pt;
  readonly spawn: number;
  readonly decide: number;
  readonly gather: number;
};

const KEPT_INDEX = TAGS.map((t, i) => (t.kept ? i : -1)).filter((i) => i >= 0);
const KEPT_W = KEPT_INDEX.map((i) => chipW(TAGS[i].tag));
const KEPT_LEFT = KEPT_W.map((_, k) => PAD_X + KEPT_W.slice(0, k).reduce((sum, w) => sum + w + TAG_GAP, 0));
export const SCAN_Y = [96, 198] as const;

const chipRect = (i: number): Rect => ({ x: SLOT[i][0] - chipW(TAGS[i].tag) / 2, y: SLOT[i][1] - CHIP_H / 2, w: chipW(TAGS[i].tag), h: CHIP_H });
const touches = (a: Rect, b: Rect, pad: number) => a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

/* A discarded tag drifts sideways (outward first), else down or up, by the first way its path stays clear of the
   kept tags and the endpoint tile and inside the stage. */
function driftFor(i: number): Pt {
  const r = chipRect(i);
  const out = SLOT[i][0] < AW / 2 ? -1 : 1;
  const ways: readonly Pt[] = [[out, 0], [-out, 0], [0, 1], [0, -1]];
  const sweep = (d: Pt): Rect => ({
    x: r.x + Math.min(0, d[0] * DRIFT),
    y: r.y + Math.min(0, d[1] * DRIFT),
    w: r.w + Math.abs(d[0]) * DRIFT,
    h: r.h + Math.abs(d[1]) * DRIFT,
  });
  const clear = (d: Pt) => {
    const s = sweep(d);
    return s.x >= 2 && s.x + s.w <= AW - 2 && !touches(s, GLOBE, 4) && !KEPT_INDEX.some((k) => touches(s, chipRect(k), 4));
  };
  const way = ways.find(clear) ?? ways[2];
  return [way[0] * DRIFT, way[1] * DRIFT];
}

const SPAWN_RANK = TAGS.map((_, i) => i).sort((a, b) => SLOT[b][1] - SLOT[a][1] || SLOT[a][0] - SLOT[b][0]);

export const CHIPS: readonly ChipSpec[] = TAGS.map((t, i) => {
  const k = KEPT_INDEX.indexOf(i);
  const w = chipW(t.tag);
  const rowFrac = (SLOT[i][1] - SCAN_Y[0]) / (SCAN_Y[1] - SCAN_Y[0]);
  return {
    tag: t.tag,
    kept: t.kept,
    w,
    slot: SLOT[i],
    dest: k >= 0 ? [KEPT_LEFT[k] + w / 2, TAG_Y] : null,
    drift: k >= 0 ? [0, 0] : driftFor(i),
    spawn: TL.spawn.from + SPAWN_RANK.indexOf(i) * TL.spawn.step,
    decide: TL.scan[0] + rowFrac * (TL.scan[1] - TL.scan[0]),
    gather: TL.gather.from + Math.max(0, k) * TL.gather.step,
  };
});

/* ---------- Caption (chapter four) ---------- */

export const CAPTION_LINES: readonly string[] = wrap(CAPTION_TEXT, CAPTION_WRAP);
export const CAP_CHAR_W = CAP_FS * 0.6;
export const CAPTION_Y0 = CARD_TOP.full + 40;
export const CAPTION_PITCH = 25;
/** Row of the card that holds the script chip once it has landed, and where a divider sits above the tags. */
export const CARD_HEAD_Y = CARD_TOP.full + 12;
export const CARD_RULE_Y = TAG_Y - 26;

/** Typing time of each caption line: the typing window shared out by character count. */
const LINE_CHARS = CAPTION_LINES.map((l, i) => l.length + (i < CAPTION_LINES.length - 1 ? 1 : 0));
export const TYPE_AT: readonly number[] = LINE_CHARS.reduce<readonly number[]>(
  (at, n) => [...at, at[at.length - 1] + (n / LINE_CHARS.reduce((a, b) => a + b, 0)) * (TL.type[1] - TL.type[0])],
  [TL.type[0]],
);

/* ---------- Counts shown in the panel: what is on the stage at that moment ---------- */

/** Phrases whose highlight has started. */
export const markedAt = (v: number) => PHRASES.filter((_, i) => v > TL.mark.from + i * TL.mark.step).length;
/** Script rows that are fully written. */
export const writtenAt = (v: number) => ROW_AT.filter((t) => v >= t + TL.rows.dur).length;
/** Tags that have come out of the endpoint. */
export const fetchedAt = (v: number) => CHIPS.filter((c) => v > c.spawn).length;
