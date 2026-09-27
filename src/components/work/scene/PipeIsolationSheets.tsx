"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { ACCOUNTS, METRIC_SAMPLE, SCRAPER } from "./PipeKitData";
import { Pulse, Wire, linePath, polyPath, type WirePath } from "./PipeKitWire";
import { HISTORY_KEPT, PREVIOUS, SAMPLE_ROWS, SHEET_NAMES } from "./PipeIsolationData";
import { A_X, rectStyle, unit, type Box } from "./PipeIsolationLayout";
import { Counter, useLayout, useWin } from "./PipeIsolationKit";
import { ACCOUNT_COUNT, STORE, appendedCount, dropWin, metricWin, updatedCount } from "./PipeIsolationTime";

/* Page two of the middle band: the two sheets. The live sheet has its rows updated in place (old value wiped by the
   new one), the historic sheet keeps the last run and drops this run's rows beneath it. Both sheets carry column
   headers. Wide: the sheets sit side by side. Tall (phone): they stack at full width, with rows sized in stage units
   so the feed wires can meet the panels exactly. Coordinates are band units. */

const SHEET_X = A_X[4];
const FEED_TOP = -6;
const FEED_BAR = 14;
const COLUMNS = SCRAPER.columns;
const [, HEAD_FOLLOWERS, HEAD_POSTS, HEAD_VIEWS] = COLUMNS;

/** `gap` and `pad` are classes; `min` is the width each numeric column keeps, so header and rows line up. */
type Cols = { readonly gap: string; readonly min: readonly [string, string, string]; readonly pad: string };
const WIDE_COLS: Cols = { gap: "gap-x-[0.7em] @max-[340px]:gap-x-[0.4em]", min: ["5ch", "3ch", "4ch"], pad: "px-[0.5em]" };
const TALL_COLS: Cols = { gap: "gap-x-[0.9em]", min: ["9ch", "5ch", "5ch"], pad: "px-[0.6em]" };
const GRID_COLS = "grid-cols-[minmax(0,1fr)_auto_auto_auto]";

type Spec = {
  readonly bubble: Box;
  /** Wide: one box for both sheets. Tall: one box per sheet. */
  readonly panels: readonly Box[];
  readonly feeds: readonly [WirePath, WirePath];
  readonly cols: Cols;
  readonly row: string;
  readonly title: string;
  readonly headRow: string;
  /** Font and spacing of the chat bubble: the summary is 63 characters, so it wraps to two balanced lines and the box holds both. */
  readonly bubbleCls: string;
};

const WIDE_PANELS: Box = { x: 8, y: 34, w: 342, h: 0 };
const WIDE_FEED_LEFT = WIDE_PANELS.x + 84;
const WIDE: Spec = {
  bubble: { x: 24, y: 0, w: 326, h: 30 },
  panels: [WIDE_PANELS],
  feeds: [
    polyPath([[SHEET_X, FEED_TOP], [SHEET_X, FEED_BAR], [WIDE_FEED_LEFT, FEED_BAR], [WIDE_FEED_LEFT, WIDE_PANELS.y]], 6),
    linePath([SHEET_X, FEED_TOP], [SHEET_X, WIDE_PANELS.y]),
  ],
  cols: WIDE_COLS,
  row: "1.5em",
  title: "1.7em",
  headRow: "1.4em",
  bubbleCls: "gap-[0.7em] px-[0.8em] text-[clamp(10px,2.8cqw,14px)]",
};

const ROW_U = 16;
const TALL_METRICS: Box = { x: 8, y: 38, w: 334, h: 17 + ROW_U + (SAMPLE_ROWS + 1) * ROW_U + 4 };
const TALL_HISTORY: Box = { x: 8, y: TALL_METRICS.y + TALL_METRICS.h + 5, w: 334, h: 17 + ROW_U + HISTORY_KEPT * 2 * ROW_U + 4 };
const CHANNEL_X = 350;
const HISTORY_MID = TALL_HISTORY.y + TALL_HISTORY.h / 2;
const TALL: Spec = {
  bubble: { x: 8, y: 0, w: 342, h: 34 },
  panels: [TALL_METRICS, TALL_HISTORY],
  feeds: [
    linePath([SHEET_X, FEED_TOP], [SHEET_X, TALL_METRICS.y]),
    polyPath([[SHEET_X, FEED_TOP], [SHEET_X, FEED_BAR], [CHANNEL_X, FEED_BAR], [CHANNEL_X, HISTORY_MID], [TALL_HISTORY.x + TALL_HISTORY.w, HISTORY_MID]], 6),
  ],
  cols: TALL_COLS,
  row: unit(ROW_U),
  title: unit(17),
  headRow: unit(ROW_U),
  bubbleCls: "gap-[0.5em] px-[0.6em] text-[clamp(10px,3.1cqw,13px)]",
};

function useSpec(): Spec {
  return useLayout().compact ? TALL : WIDE;
}

type Values = { readonly followers: string; readonly posts: number; readonly views: string };

function Cells({ account, values, tone }: { account: string; values: Values; tone: string }) {
  const { compact, monoTxt } = useLayout();
  const { cols } = useSpec();
  return (
    <span className={`${monoTxt} ${GRID_COLS} ${cols.gap} ${cols.pad} grid h-full items-center leading-none`}>
      <span className="text-fg">{account}</span>
      <span className={`text-right ${tone}`} style={{ minWidth: cols.min[0] }}>{values.followers}</span>
      <span className={`text-right ${compact ? "" : "@max-[420px]:hidden"} ${tone}`} style={{ minWidth: cols.min[1] }}>{values.posts}</span>
      <span className={`text-right ${tone}`} style={{ minWidth: cols.min[2] }}>{values.views}</span>
    </span>
  );
}

/* A header cell takes the width of its column and lets its word run out to the left, so it never widens the column.
   The grid keeps the data's font size so the columns line up with the rows; only the word is set smaller on wide. */
function HeadCell({ word, min, small, className = "" }: { word: string; min: string; small: boolean; className?: string }) {
  return (
    <span className={`relative block h-full ${className}`} style={{ minWidth: min }}>
      <span className={`absolute right-0 top-1/2 -translate-y-1/2 whitespace-nowrap ${small ? "text-[10px]" : ""}`}>{word}</span>
    </span>
  );
}

function ColumnHead() {
  const { compact, monoTxt } = useLayout();
  const { cols, headRow } = useSpec();
  return (
    <div className={`${compact ? "" : "hidden @min-[540px]:block"} border-b border-line`} style={{ height: headRow }}>
      <span className={`${monoTxt} ${GRID_COLS} ${cols.gap} ${cols.pad} grid h-full items-center leading-none text-mute`}>
        <span className={`truncate ${compact ? "" : "text-[10px]"}`}>{COLUMNS[0]}</span>
        <HeadCell word={HEAD_FOLLOWERS} min={cols.min[0]} small={!compact} />
        <HeadCell word={HEAD_POSTS} min={cols.min[1]} small={!compact} className={compact ? "" : "@max-[420px]:hidden"} />
        <HeadCell word={HEAD_VIEWS} min={cols.min[2]} small={!compact} />
      </span>
    </div>
  );
}

function Title({ name, right }: { name: string; right: ReactNode }) {
  const { monoTxt } = useLayout();
  const { title } = useSpec();
  return (
    <div className={`${monoTxt} flex items-center justify-between border-b border-line px-[0.6em] leading-none`} style={{ height: title }}>
      <span className="flex items-center gap-[0.5em] text-dim">
        <PipeGlyph name="sheet" size="1.4em" />
        {name}
      </span>
      <span className="text-mute">{right}</span>
    </div>
  );
}

function Panel({ name, right, box, children }: { name: string; right: ReactNode; box?: Box; children: ReactNode }) {
  const { bandFrame, monoTxt, compact } = useLayout();
  const placed = box ? { ...rectStyle(box, bandFrame) } : undefined;
  return (
    <div style={placed} className={`${monoTxt} overflow-hidden rounded-lg border border-line-strong bg-surface-2 ${box ? "absolute" : "min-w-0 flex-1 pb-[0.5em]"}`}>
      <Title name={name} right={right} />
      <ColumnHead />
      <div className={compact ? "" : "px-[0.2em] pt-[0.3em]"}>{children}</div>
    </div>
  );
}

/* A row that exists in the sheet but is not shown: the account name and grey bars where the numbers would be. */
function SkeletonRow({ account }: { account: string }) {
  const { monoTxt } = useLayout();
  const { cols, row } = useSpec();
  return (
    <span className={`${monoTxt} ${GRID_COLS} ${cols.gap} ${cols.pad} grid items-center leading-none text-mute`} style={{ height: row }}>
      <span>{account}</span>
      <i className="h-[0.5em] w-[5ch] rounded-full bg-line-strong" />
      <i className="h-[0.5em] w-[3ch] rounded-full bg-line-strong @max-[420px]:hidden" />
      <i className="h-[0.5em] w-[4ch] rounded-full bg-line-strong" />
    </span>
  );
}

/* Metrics: the old numbers are wiped away from the left by the new ones, with a thin accent edge between them. */
function MetricRow({ p, j }: { p: MV; j: number }) {
  const { row: height } = useSpec();
  const t = useWin(p, metricWin(j));
  const front = useTransform(t, (v) => v * 100);
  const fresh = useTransform(front, (f) => `inset(0 ${(100 - f).toFixed(2)}% 0 0)`);
  const stale = useTransform(front, (f) => `inset(0 0 0 ${f.toFixed(2)}%)`);
  const left = useTransform(front, (f) => `${f.toFixed(2)}%`);
  const edge = useTransform(t, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const flash = useTransform(t, [0, 0.25, 0.8], [0, 1, 0], { clamp: true });
  const row = METRIC_SAMPLE[j];
  return (
    <div className="relative" style={{ height }}>
      <motion.i aria-hidden style={{ opacity: flash }} className="absolute inset-0 rounded-[4px] bg-accent/20" />
      <motion.span style={{ clipPath: stale }} className="absolute inset-0">
        <Cells account={row.account} values={PREVIOUS[j]} tone="text-mute" />
      </motion.span>
      <motion.span style={{ clipPath: fresh }} className="absolute inset-0">
        <Cells account={row.account} values={row} tone="text-fg" />
      </motion.span>
      <motion.i aria-hidden style={{ left, opacity: edge }} className="absolute inset-y-[2px] w-0.5 -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

/* Historic: a new row drops into its slot from the top edge of that slot, so it never overlaps a neighbour. */
function DropRow({ p, j }: { p: MV; j: number }) {
  const { row: height } = useSpec();
  const t = useWin(p, dropWin(j), easeOutCubic);
  const y = useTransform(t, (v) => `${(-(1 - v) * 100).toFixed(2)}%`);
  const row = METRIC_SAMPLE[j];
  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <i aria-hidden className="absolute inset-0 rounded-[4px] border border-dashed border-line" />
      <motion.span style={{ y }} className="absolute inset-0 border-l-2 border-accent bg-surface-2">
        <Cells account={row.account} values={row} tone="text-fg" />
      </motion.span>
    </div>
  );
}

function OldRow({ j }: { j: number }) {
  const { row: height } = useSpec();
  return (
    <div className="relative border-l-2 border-transparent" style={{ height }}>
      <Cells account={METRIC_SAMPLE[j].account} values={PREVIOUS[j]} tone="text-mute" />
    </div>
  );
}

function Feed({ p }: { p: MV }) {
  const { bandFrame } = useLayout();
  const { feeds } = useSpec();
  const draw = useWin(p, STORE.feed);
  const opacity = useTransform(p, (v) => 1 - Math.min(1, Math.max(0, (v - STORE.fade[0]) / (STORE.fade[1] - STORE.fade[0]))));
  return (
    <svg viewBox={`0 0 ${bandFrame.w} ${bandFrame.h}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <motion.g style={{ opacity }}>
        {feeds.map((path, k) => (
          <Wire key={`wire-${k}`} path={path} draw={draw} />
        ))}
        {feeds.map((path, k) => (
          <Pulse key={`pulse-${k}`} path={path} progress={draw} trail={2} />
        ))}
      </motion.g>
    </svg>
  );
}

function Bubble({ p }: { p: MV }) {
  const { bandFrame } = useLayout();
  const { bubble, bubbleCls } = useSpec();
  const reveal = useWin(p, STORE.bubble, easeOutCubic);
  const clipPath = useTransform(reveal, (t) => `inset(${(-6 * t).toFixed(2)}px 0 ${((1 - t) * 100).toFixed(2)}% 0)`);
  const tail = `${(((A_X[5] - bubble.x) / bubble.w) * 100).toFixed(2)}%`;
  return (
    <motion.div
      style={{ ...rectStyle(bubble, bandFrame), clipPath }}
      className={`${MONO} ${bubbleCls} absolute flex items-center rounded-lg border border-line-strong bg-surface-2 leading-none text-fg`}
    >
      <i aria-hidden style={{ left: tail }} className="absolute -top-[5px] h-[9px] w-[9px] -translate-x-1/2 rotate-45 border-l border-t border-line-strong bg-surface-2" />
      <PipeGlyph name="message" size="1.6em" />
      <span className="min-w-0 text-balance leading-[1.2]">{SCRAPER.summary}</span>
    </motion.div>
  );
}

function MetricsPanel({ p, box }: { p: MV; box?: Box }) {
  const { compact } = useLayout();
  const { row } = useSpec();
  const hidden = ACCOUNT_COUNT - SAMPLE_ROWS;
  return (
    <Panel name={SHEET_NAMES[0]} right={<Counter p={p} of={(v) => `${updatedCount(v)} updated`} />} box={box}>
      {Array.from({ length: SAMPLE_ROWS }, (_, j) => (
        <MetricRow key={j} p={p} j={j} />
      ))}
      {compact ? null : <SkeletonRow account={ACCOUNTS[SAMPLE_ROWS]} />}
      <p className="px-[0.5em] leading-none text-mute" style={{ height: row, lineHeight: row }}>
        +{compact ? hidden : hidden - 1} more rows
      </p>
    </Panel>
  );
}

function HistoryPanel({ p, box }: { p: MV; box?: Box }) {
  const rows = Array.from({ length: HISTORY_KEPT }, (_, j) => j);
  return (
    <Panel name={SHEET_NAMES[1]} right={<Counter p={p} of={(v) => `+${appendedCount(v)} rows`} />} box={box}>
      {rows.map((j) => (
        <OldRow key={`old-${j}`} j={j} />
      ))}
      {rows.map((j) => (
        <DropRow key={`new-${j}`} p={p} j={j} />
      ))}
    </Panel>
  );
}

export default function SheetsPage({ p }: { p: MV }) {
  const { compact, bandFrame } = useLayout();
  const { panels } = useSpec();
  return (
    <>
      <Feed p={p} />
      {compact ? (
        <>
          <MetricsPanel p={p} box={panels[0]} />
          <HistoryPanel p={p} box={panels[1]} />
        </>
      ) : (
        <div style={{ ...rectStyle(panels[0], bandFrame), height: "auto", gap: `${(6 / panels[0].w) * 100}%` }} className="absolute flex items-stretch">
          <MetricsPanel p={p} />
          <HistoryPanel p={p} />
        </div>
      )}
      <Bubble p={p} />
    </>
  );
}
