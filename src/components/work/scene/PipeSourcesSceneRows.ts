import { FEEDS, NEW_ITEMS } from "./PipeKitData";
import { clamp01 } from "./PipeKitMath";
import { TL, type FeedIdx } from "./PipeSourcesSceneData";
import { MERGE_PER_COL, ROW_COUNT, TALL, WIDE, type Box, type Layout } from "./PipeSourcesSceneLayout";
import { FALLBACK_TITLE, OLD_TITLES, recordFor } from "./PipeSourcesSceneTitles";

/* The 38 rows of the list: their headline, their timing and, for each layout, where they stand in the feed, in the
   merged list, in the table and in the payload stack. */

export type Move = { out: number; back: number };

export type RowSpec = {
  order: number;
  feed: FeedIdx;
  k: number;
  fresh: boolean;
  title: string;
  age: string | null;
  slug: string | null;
  lead: string | null;
  picked: boolean;
  /** 0 for the freshest survivor, 6 for the oldest; -1 for a row that was already used. */
  rank: number;
  /** Column of the merged list, 0 or 1, and the row inside that column. */
  col: 0 | 1;
  j: number;
  /** Where the row stands in its feed, its y in the merged list and its y in the payload stack. */
  feedBox: Box;
  mergeY: number;
  stackY: number;
  printAt: number;
  /** Each move: the row is retracted from where it is at `out`, and printed again in its next place at `back`. */
  moves: readonly Move[];
  scanAt: number;
  dropAt: number;
  packAt: number;
};

const hours = (age: string) => Number.parseInt(age, 10);
const BY_AGE = [...NEW_ITEMS].sort((a, b) => hours(a.age) - hours(b.age));
const OFFSETS = FEEDS.map((_, f) => FEEDS.slice(0, f).reduce((sum, feed) => sum + feed.items, 0));

/* The merge sweeps down the stage. A row is retracted where the sweep reaches its old top, and printed again where
   the sweep has passed its new bottom, so an old row and a new row are never on screen at the same height. */
const SWEEP_GAP = 0.001;
const sweeper = (ly: Layout) => (y: number) => TL.merge[0] + clamp01((y - ly.feedTop) / (ly.sweepEnd - ly.feedTop)) * (TL.merge[1] - TL.merge[0]);

export const sweepY = (ly: Layout, v: number) => ly.feedTop + ((v - TL.merge[0]) / (TL.merge[1] - TL.merge[0])) * (ly.sweepEnd - ly.feedTop);

function buildRow(ly: Layout, f: FeedIdx, k: number): RowSpec {
  const feed = FEEDS[f];
  const items = NEW_ITEMS.filter((n) => n.feed === feed.id);
  const item = k < feed.fresh ? items[k] : null;
  const order = OFFSETS[f] + k;
  const rank = item ? BY_AGE.indexOf(item) : -1;
  const record = item ? recordFor(NEW_ITEMS.indexOf(item)) : null;
  const j = order % MERGE_PER_COL;
  const feedBox = ly.feed(f, k);
  const mergeY = ly.merge.top + j * ly.merge.pitch;
  const sweepAt = sweeper(ly);
  const outAt = sweepAt(feedBox.y) - TL.mergeDur;
  const inAt = Math.max(outAt + TL.mergeDur + SWEEP_GAP, sweepAt(mergeY + ly.merge.h));
  const toTable: Move[] = item ? [{ out: TL.spreadStart + rank * TL.spreadLag, back: TL.tableStart + rank * TL.tableLag }] : [];
  return {
    order,
    feed: f,
    k,
    fresh: item !== null,
    title: item ? item.title : (OLD_TITLES[f]?.[k - feed.fresh] ?? FALLBACK_TITLE),
    age: item ? item.age : null,
    slug: record ? record.slug : null,
    lead: record ? record.lead : null,
    picked: item ? item.picked : false,
    rank,
    col: order < MERGE_PER_COL ? 0 : 1,
    j,
    feedBox,
    mergeY,
    stackY: ly.table.top + Math.max(0, rank) * ly.stack.step,
    printAt: TL.printStart[f] + k * TL.printStep,
    moves: [{ out: outAt, back: inAt }, ...toTable],
    scanAt: TL.scan[0] + (j / MERGE_PER_COL) * (TL.scan[1] - TL.scan[0]),
    dropAt: TL.dropStart + (j / MERGE_PER_COL) * TL.dropSpan,
    packAt: TL.packStart + Math.max(0, rank) * TL.packLag,
  };
}

const build = (ly: Layout): readonly RowSpec[] => FEEDS.flatMap((feed, f) => Array.from({ length: feed.items }, (_, k) => buildRow(ly, f as FeedIdx, k)));

const WIDE_ROWS = build(WIDE);
const TALL_ROWS = build(TALL);

/** The rows placed for a layout. Only geometry differs; the identity and the timing of a row are the same. */
export const rowsFor = (ly: Layout): readonly RowSpec[] => (ly.tall ? TALL_ROWS : WIDE_ROWS);

/* The counters below read only what does not depend on the layout, so either list will do. */
const ROWS = WIDE_ROWS;

/* Rows printed so far in one feed, or in all feeds when `feed` is omitted. */
export function printedAt(v: number, feed?: FeedIdx) {
  return ROWS.filter((r) => (feed === undefined || r.feed === feed) && v >= r.printAt + TL.printDur * 0.5).length;
}

/* Rows the scan line has passed, split into already-used and new. */
export function verdictAt(v: number) {
  const passed = ROWS.filter((r) => v >= r.scanAt + 0.003);
  return { seen: passed.filter((r) => !r.fresh).length, fresh: passed.filter((r) => r.fresh).length };
}

/* The two rows under the scan line at progress v (left column, right column), or null when the line is not on the list. */
export function rowsUnderScan(v: number): readonly [RowSpec, RowSpec] | null {
  const t = (v - TL.scan[0]) / (TL.scan[1] - TL.scan[0]);
  if (t < 0 || t > 1) return null;
  const j = Math.min(MERGE_PER_COL - 1, Math.floor(t * MERGE_PER_COL));
  return [ROWS[j], ROWS[Math.min(ROW_COUNT - 1, j + MERGE_PER_COL)]];
}
