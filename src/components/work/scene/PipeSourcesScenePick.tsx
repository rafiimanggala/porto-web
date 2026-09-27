"use client";

import { motion, motionValue, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { ARTICLE, PREV_ROW, ROW_ID, RUN_ROW, SCAN, STATUS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { StatusStrip } from "./PipeKitStatus";
import { KEPT_FIELDS, TL } from "./PipeSourcesSceneData";
import { SW, type Layout } from "./PipeSourcesSceneLayout";
import { LH, U, X, Y, useLy } from "./PipeSourcesSceneKit";

/* Chapter 4: the seven records pack into one payload, the freshest lifts out as the story that goes forward (the
   card is in PipeSourcesSceneCard), and a new row appears in the sheet with the first status of the ladder. */

const PAD = 10;
const BRACE_W = 8;
const STACK_ROWS = SCAN.fresh;

/* A curly brace opening to the right, centred on (x, y), `half` tall on each side. */
const brace = (x: number, y: number, half: number, dir: 1 | -1) => {
  const k = BRACE_W * dir;
  return `M${x} ${y - half}Q${x - k} ${y - half} ${x - k} ${y - half + 8}V${y - 8}Q${x - k} ${y} ${x - 2 * k} ${y}Q${x - k} ${y} ${x - k} ${y + 8}V${y + half - 8}Q${x - k} ${y + half} ${x} ${y + half}`;
};

/* Braces that wrap the packed stack: one on each side, as tall as the stack. */
function bracesFor(ly: Layout) {
  const half = (ly.stack.h + (STACK_ROWS - 1) * ly.stack.step) / 2;
  const mid = ly.table.top + half;
  const left = ly.card.x - ly.card.w / 2 - 4;
  const right = ly.card.x + ly.card.w / 2 + 4;
  return [brace(left, mid, half, 1), brace(right, mid, half, -1)];
}

export function Braces({ p }: { p: MV }) {
  const ly = useLy();
  const draw = useSeg(p, TL.braces[0], TL.braces[1], easeInOutCubic);
  const opacity = useTransform(p, [TL.braces[0], TL.braces[0] + 0.006, TL.cardGrow[0] - 0.004, TL.cardGrow[0] + 0.012], [0, 1, 1, 0]);
  return (
    <motion.g style={{ opacity }}>
      {bracesFor(ly).map((d) => (
        <motion.path key={d} d={d} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw, stroke: "var(--color-accent)" }} />
      ))}
    </motion.g>
  );
}

export function PayloadChip({ p }: { p: MV }) {
  const { labelFs } = useLy();
  const opacity = useTransform(p, [TL.chip[0], TL.chip[1], TL.chipOut[0], TL.chipOut[1]], [0, 1, 1, 0]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, top: Y(156), fontSize: labelFs, lineHeight: LH }}
      className={`${MONO} absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-[6px] whitespace-nowrap text-fg`}
    >
      <PipeGlyph name="aggregate" size={U(14)} />1 payload, {SCAN.fresh} items
    </motion.span>
  );
}

/* The payload as data: the count, then the first record with the two fields the model needs, cut to a few words. */
const words = (text: string, n: number) => `${text.split(" ").slice(0, n).join(" ")}…`;

type JsonLine = { indent: number; head?: string; key?: string; text: string };

const JSON_LINES: readonly JsonLine[] = [
  { indent: 0, text: "{" },
  { indent: 1, key: "count", text: `${SCAN.fresh},` },
  { indent: 1, key: "items", text: "[" },
  { indent: 2, head: "{ ", key: KEPT_FIELDS[0], text: `"${words(ARTICLE.title, 4)}",` },
  { indent: 3, key: KEPT_FIELDS[1], text: `"${words(ARTICLE.summary[0], 3)}" },` },
  { indent: 2, text: `… ${SCAN.fresh - 1} more` },
  { indent: 1, text: "]" },
  { indent: 0, text: "}" },
];

const JSON_STEP = 0.0028;
const INDENT = 6;

function JsonLineView({ p, i, line }: { p: MV; i: number; line: JsonLine }) {
  const t = useSeg(p, TL.json[0] + i * JSON_STEP, TL.json[0] + i * JSON_STEP + 0.012);
  const y = useTransform(t, (v) => U((1 - v) * 4));
  return (
    <motion.span style={{ opacity: t, y, paddingLeft: U(line.indent * INDENT) }} className="block truncate text-fg">
      {line.head}
      {line.key ? <span className="text-dim">&quot;{line.key}&quot;: </span> : null}
      {line.text}
    </motion.span>
  );
}

/* What the aggregate step hands on: the payload as data. It stays until the card grows over it. */
export function PayloadJson({ p }: { p: MV }) {
  const { card, jsonY, rowFs } = useLy();
  const opacity = useTransform(p, [TL.json[0], TL.json[0] + 0.004, TL.json[1], TL.json[1] + 0.008], [0, 1, 1, 0]);
  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        left: X(card.x - card.w / 2),
        top: Y(jsonY),
        width: X(card.w),
        fontSize: rowFs,
        lineHeight: 1.3,
        padding: `${U(6)} ${U(6)}`,
        borderRadius: U(4),
      }}
      className={`${MONO} absolute z-[40] border border-line bg-surface-1`}
    >
      {JSON_LINES.map((line, i) => (
        <JsonLineView key={i} p={p} i={i} line={line} />
      ))}
    </motion.div>
  );
}

/* The sheet: the previous row, and the new one that drops in from the card. */
const SETTLED = motionValue(1);
const OLD_ROW = PREV_ROW;
const NEW_ROW = RUN_ROW;
/* The daily run creates the row at the first status of the ladder; later scenes carry it on to posted. */
const NEW_STATUS = STATUS[0];

type SheetRowProps = { id: string; topic: string; status: string; fresh?: boolean; drop?: MV };

function SheetRow({ id, topic, status, fresh, drop }: SheetRowProps) {
  const { sheetRow, labelFs } = useLy();
  const y = useTransform(drop ?? SETTLED, (t) => U(-(1 - t) * 26));
  const opacity = useTransform(drop ?? SETTLED, (t) => Math.min(1, t * 5));
  return (
    <motion.div
      style={{ y, opacity, height: U(sheetRow), fontSize: labelFs }}
      className={`${MONO} relative flex items-center gap-[8px] overflow-hidden rounded-[4px] border px-[8px] leading-none ${fresh ? "border-accent bg-surface-3" : "border-line bg-surface-2"}`}
    >
      <span className="text-dim">{id}</span>
      <span className="min-w-0 flex-1 truncate text-fg">{topic}</span>
      <span className={fresh ? "text-fg" : "text-mint"}>{status}</span>
    </motion.div>
  );
}

export function MiniSheet({ p }: { p: MV }) {
  const { card, sheetY, sheetGap } = useLy();
  const show = useSeg(p, TL.sheetIn[0], TL.sheetIn[1], easeOutCubic);
  const drop = useSeg(p, TL.rowDrop[0], TL.rowDrop[1], easeOutBack);
  const y = useTransform(show, (t) => U((1 - t) * 10));
  return (
    <motion.div
      aria-hidden
      style={{ opacity: show, y, left: X(card.x - card.w / 2), top: Y(sheetY), width: X(card.w), gap: U(sheetGap) }}
      className="absolute z-40 flex flex-col"
    >
      <SheetRow id={OLD_ROW.id} topic={OLD_ROW.topic} status={OLD_ROW.status} />
      <SheetRow id={NEW_ROW.id} topic={NEW_ROW.topic} status={NEW_STATUS} fresh drop={drop} />
    </motion.div>
  );
}

export function StatusLayer({ p }: { p: MV }) {
  const ly = useLy();
  const t = useSeg(p, TL.stripIn[0], TL.stripIn[1], easeOutCubic);
  const y = useTransform(t, (v) => U((1 - v) * 18));
  return (
    <motion.div aria-hidden style={{ opacity: t, y, left: X(PAD), width: X(SW - 2 * PAD), bottom: ly.stripBottom }} className="absolute z-[60]">
      <StatusStrip p={p} statusAt={[TL.statusAt, 2, 2, 2, 2]} blend={0.02} rowId={ROW_ID} className={ly.tall ? "!text-[12px]" : "!text-[11px]"} />
    </motion.div>
  );
}
