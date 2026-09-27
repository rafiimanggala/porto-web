"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { BLOCKS } from "./PipeKitData";
import { pct, useSpan } from "./PipeKitMath";
import { BLOCK_COLOR, ROW_AT, RULER_LABEL, TL } from "./PipeScriptData";
import { BLOCK_SEG, CHAR_W, PAD_X, ROW_PITCH, ROW_TEXT, ROW_Y0, RULER, SEC, TICKS, secX } from "./PipeScriptLayout";
import { SMALL, TXT, X, Y, fs, u } from "./PipeScriptKit";

/* Chapter two: the ruler ticks, the outline that follows the block being written, and one row per block. A row is a
   header (its bar on the 42 second timeline, and right under it the label, timing and word count) followed by an
   excerpt of the block's text, with a wide gap to the next row. Everything sits inside the card with the same inset as
   the ruler. All five rows are outlined as skeleton before the first is written, so the sheet never reads as empty. */

const TEXT_X = PAD_X;
const BAR_H = 6;
const META_TOP = 9;
const META_H = 11;
const LINE_TOP = META_TOP + META_H;
const LINE_HEIGHT = 13;
const DOT_GAP = 6;

function Tick({ t }: { t: number }) {
  const bottom = RULER.y + RULER.h;
  return (
    <>
      <i aria-hidden style={{ left: X(secX(t)), top: Y(bottom), height: u(3) }} className="absolute w-px bg-line-strong" />
      <span
        style={{ left: X(secX(t)), top: Y(bottom + 5), fontSize: fs(SMALL) }}
        className={`${MONO} absolute -translate-x-1/2 whitespace-nowrap leading-none text-mute`}
      >
        {t}
      </span>
    </>
  );
}

/** What the ruler is: the label on the top row of its card. It is the same text in every chapter, so the sheet (chapter
    two) and the lone ruler card (chapters three and four) show it at the same place. */
export function RulerLabel() {
  return (
    <span
      aria-hidden
      style={{ left: X(TEXT_X), top: Y(RULER.labelY), fontSize: fs(SMALL) }}
      className={`${MONO} absolute whitespace-nowrap leading-none text-mute`}
    >
      {RULER_LABEL}
    </span>
  );
}

export function RulerTicks({ p }: { p: MV }) {
  const shown = useSeg(p, TL.ticks[0], TL.ticks[1]);
  return (
    <motion.div aria-hidden style={{ opacity: shown }} className="absolute inset-0">
      <RulerLabel />
      {TICKS.map((t) => (
        <Tick key={t} t={t} />
      ))}
    </motion.div>
  );
}

/** The outline sits on the block whose row is being written, and moves on together with the writing. */
function SegMark({ p, i }: { p: MV; i: number }) {
  const opacity = useSpan(p, ROW_AT[i], ROW_AT[i] + TL.rows.step, 0.005);
  const seg = BLOCK_SEG[i];
  return (
    <motion.i
      aria-hidden
      style={{ opacity, left: X(seg.x - 2), top: Y(RULER.y - 2), width: X(seg.w + 4), height: Y(RULER.h + 4) }}
      className="absolute rounded-[4px] border-2 border-fg"
    />
  );
}

const metaChars = (i: number) => {
  const b = BLOCKS[i];
  return b.label.length + `${b.start} to ${b.end} s`.length + `${b.words} words`.length;
};

/* Length in units of the header line of a row, a little generous. */
const metaWidth = (i: number) => metaChars(i) * CHAR_W + DOT_GAP * 4;
const lineWidth = (i: number) => ROW_TEXT[i].length * CHAR_W;

/** Placeholder of a row: its track, a header line and a text line. Each is uncovered from the edge of the typing, so
    a placeholder only ever shows ahead of the text and never as a stub behind it. */
function RowSkeleton({ p, i, y, t }: { p: MV; i: number; y: number; t: MV }) {
  const shown = useSeg(p, TL.skeleton[0], TL.skeleton[1]);
  const metaClip = useTransform(t, (v) => `inset(0 0 0 ${pct(Math.min(1, (v * lineWidth(i)) / metaWidth(i)) * 100)})`);
  const lineClip = useTransform(t, (v) => `inset(0 0 0 ${pct(v * 100)})`);
  const b = BLOCKS[i];
  const bar = { left: X(secX(b.start)), width: X((b.end - b.start) * SEC), top: Y(y), height: u(BAR_H) };
  const meta = { left: X(TEXT_X), width: X(metaWidth(i)), top: Y(y + META_TOP + 3), height: u(5) };
  const line = { left: X(TEXT_X), width: X(lineWidth(i)), top: Y(y + LINE_TOP + 4), height: u(6) };
  return (
    <motion.div aria-hidden style={{ opacity: shown }} className="absolute inset-0">
      <i style={bar} className="absolute rounded-[2px] bg-line-strong" />
      <motion.i style={{ ...meta, clipPath: metaClip }} className="absolute rounded-[2px] bg-line-strong" />
      <motion.i style={{ ...line, clipPath: lineClip }} className="absolute rounded-[2px] bg-line-strong" />
    </motion.div>
  );
}

function RowView({ p, i }: { p: MV; i: number }) {
  const b = BLOCKS[i];
  const t = useSeg(p, ROW_AT[i], ROW_AT[i] + TL.rows.dur);
  const grow = useTransform(t, (v) => easeOutCubic(v));
  const clip = useTransform(t, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  const edgeLeft = useTransform(t, (v) => pct(v * 100));
  const edgeOpacity = useTransform(t, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const y = ROW_Y0 + i * ROW_PITCH;
  return (
    <>
      <RowSkeleton p={p} i={i} y={y} t={t} />
      <motion.i
        aria-hidden
        style={{ scaleX: grow, left: X(secX(b.start)), top: Y(y), width: X((b.end - b.start) * SEC), height: u(BAR_H), background: BLOCK_COLOR[i] }}
        className="absolute origin-left rounded-[2px]"
      />
      <div style={{ left: X(TEXT_X), top: Y(y + META_TOP) }} className={`${MONO} absolute w-fit`}>
        <motion.div style={{ clipPath: clip }}>
          <span style={{ gap: u(DOT_GAP), height: u(META_H), fontSize: fs(SMALL) }} className="flex items-center whitespace-nowrap">
            <i aria-hidden style={{ width: u(6), height: u(6), background: BLOCK_COLOR[i] }} className="rounded-[1px]" />
            <span className="text-fg">{b.label}</span>
            <span className="text-mute">{`${b.start} to ${b.end} s`}</span>
            <span className="text-mute">{`${b.words} words`}</span>
          </span>
          <span style={{ fontSize: fs(TXT), lineHeight: u(LINE_HEIGHT) }} className={`block whitespace-nowrap ${i === 0 ? "text-fg" : "text-dim"}`}>
            {ROW_TEXT[i]}
          </span>
        </motion.div>
        <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOpacity }} className="absolute inset-y-0 w-[2px] -translate-x-1/2 rounded-full bg-accent" />
      </div>
    </>
  );
}

export function ScriptRows({ p }: { p: MV }) {
  return (
    <>
      {BLOCKS.map((b, i) => (
        <SegMark key={`m-${b.id}`} p={p} i={i} />
      ))}
      {BLOCKS.map((b, i) => (
        <RowView key={b.id} p={p} i={i} />
      ))}
    </>
  );
}
