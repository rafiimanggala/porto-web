import { easeInOutCubic } from "./HealthSceneParts";
import { lerp, segAt } from "./PipeKitMath";
import { TL } from "./PipeSourcesSceneData";
import type { Box, Layout } from "./PipeSourcesSceneLayout";
import type { RowSpec } from "./PipeSourcesSceneRows";

/* Pure geometry of the list. A row prints into a feed, is retracted and printed again in the merged list, then glides
   to a table of records and a payload stack. Numbers are stage units. */

export type Pose = {
  /** Centre x, top y, width and height. */
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  /** Visible part of the row from left to right, 0..1 each. Outside it the row is clipped away. */
  clipL: number;
  clipR: number;
  /** Where the print head sits inside the row, 0..1. */
  edge: number;
  /** Opacity of the headline text. */
  text: number;
  /** Lines the headline may use. */
  lines: 1 | 2;
  /** Opacity of the link, date and summary cells. */
  cells: number;
  /** 0..1 verdict tint: rose for an already used row, mint for a new one. */
  seen: number;
  /** 1 once the row stands in the table, 0 before. */
  spread: number;
  /** 0..1 while the row packs into the payload stack. */
  pack: number;
};

/* Which part of the row is on screen. It is printed from the left; every move retracts it toward the left, where the
   merge tile sits, and prints it again from the left in its next place. Whole letters stay at the head of the row, so
   no tail of a headline is ever left behind. The row is never on screen in two places at once. */
function wipeAt(r: RowSpec, v: number) {
  if (v < r.moves[0].out) {
    const print = segAt(v, r.printAt, r.printAt + TL.printDur);
    return { clipL: 0, clipR: print, edge: print };
  }
  const m = r.moves.filter((mv) => v >= mv.out).pop() ?? r.moves[0];
  if (v < m.back) {
    const keep = 1 - segAt(v, m.out, m.out + TL.mergeDur);
    return { clipL: 0, clipR: keep, edge: keep };
  }
  const back = segAt(v, m.back, m.back + TL.mergeDur);
  return { clipL: 0, clipR: back, edge: back };
}

/* How many places the row has already left: 0 = feed, 1 = merged list, 2 = table. */
const stageAt = (r: RowSpec, v: number) => r.moves.filter((m) => v >= m.out + TL.mergeDur).length;

function boxAt(ly: Layout, r: RowSpec, stage: number, trim: number): Box {
  if (stage >= 2) {
    const t = ly.table;
    return { x: t.x, y: t.top + r.rank * lerp(t.pitch[0], t.pitch[1], trim), w: t.w, h: lerp(t.h[0], t.h[1], trim) };
  }
  if (stage === 1) return { x: ly.merge.x[r.col], y: r.mergeY, w: ly.merge.w, h: ly.merge.h };
  return r.feedBox;
}

/* A new row keeps two lines in a feed column and in the wide table, one line everywhere else. */
function linesAt(ly: Layout, r: RowSpec, stage: number, pack: number): 1 | 2 {
  return !ly.tall && r.fresh && stage !== 1 && pack < 0.3 ? 2 : 1;
}

export function rowPose(ly: Layout, r: RowSpec, v: number): Pose {
  const stage = stageAt(r, v);
  const trim = segAt(v, TL.trim[0], TL.trim[1], easeInOutCubic);
  const base = boxAt(ly, r, stage, trim);
  const scan = segAt(v, r.scanAt, r.scanAt + 0.006);
  const drop = r.fresh ? 0 : segAt(v, r.dropAt, r.dropAt + TL.dropDur, easeInOutCubic);
  const pack = r.fresh ? segAt(v, r.packAt, r.packAt + TL.packDur, easeInOutCubic) : 0;
  const others = r.rank > 0 ? 1 - segAt(v, TL.others[0], TL.others[1]) : 1;
  const swapped = r.picked ? 1 - segAt(v, TL.cardSwap[0], TL.cardSwap[1]) : 1;

  return {
    x: base.x,
    y: lerp(base.y, r.stackY, pack),
    w: lerp(base.w, ly.stack.w, pack),
    h: lerp(base.h, ly.stack.h, pack) * (1 - segAt(drop, 0.4, 1)),
    opacity: (1 - segAt(drop, 0.6, 1)) * others * swapped,
    ...wipeAt(r, v),
    text: r.fresh ? 1 : 1 - segAt(drop, 0, 0.4),
    lines: linesAt(ly, r, stage, pack),
    cells: r.fresh ? segAt(v, TL.cells[0], TL.cells[1]) * (1 - segAt(pack, 0, 0.2)) : 0,
    seen: stage >= 2 ? 0 : scan,
    spread: stage >= 2 ? 1 : 0,
    pack,
  };
}

/* One cell of a record of the table, relative to the row: left edge, width, and the centre and height of its line. */
export type Cell = { left: number; w: number; cy: number; h: number };
export type Cols = { title: Cell; link: Cell; date: Cell; sum: Cell };

const COL_LEFT = 8;
const COL_GAP = 5;
const TITLE_W = [104, 150] as const;
const LINK_W = 92;
const DATE_W = 24;
const SUM_W = [93, 170] as const;
const CELL_H = 14;

/* Wide: four columns. `tr` runs 0..1 while the link and date columns are gone and the others take their room. */
function wideCols(ly: Layout, tr: number): Cols {
  const h = ly.table.h[0];
  const cy = h / 2;
  const title = lerp(TITLE_W[0], TITLE_W[1], tr);
  const link = lerp(LINK_W, 0, tr);
  const date = lerp(DATE_W, 0, tr);
  const gap = COL_GAP * (1 - tr);
  const xLink = COL_LEFT + title + gap;
  const xDate = xLink + link + gap;
  return {
    title: { left: COL_LEFT, w: title, cy, h },
    link: { left: xLink, w: link, cy, h: CELL_H },
    date: { left: xDate, w: date, cy, h: CELL_H },
    sum: { left: xDate + date + COL_GAP, w: lerp(SUM_W[0], SUM_W[1], tr), cy, h },
  };
}

/* Tall: a record is three lines (headline, summary, then link and date), and the third line is what gets trimmed. */
const TALL_COLS: Cols = {
  title: { left: COL_LEFT, w: 320, cy: 7.5, h: 13 },
  sum: { left: COL_LEFT, w: 320, cy: 23, h: CELL_H },
  link: { left: COL_LEFT, w: 150, cy: 37, h: CELL_H },
  date: { left: COL_LEFT + 160, w: 60, cy: 37, h: CELL_H },
};

export const colsAt = (ly: Layout, tr: number): Cols => (ly.tall ? TALL_COLS : wideCols(ly, tr));

export const CELL_LEFT = COL_LEFT;
export const tableLeft = (ly: Layout) => ly.table.x - ly.table.w / 2;
