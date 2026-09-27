"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { cubicPath } from "./PipeKitWire";
import { lerp, pct, segAt, useSpan } from "./PipeKitMath";
import { AH, AW, BLOCK_COLOR, CAP_FS, SAVED_TAB, TL } from "./PipeScriptData";
import {
  BLOCK_SEG,
  CAPTION_LINES,
  CAPTION_PITCH,
  CAPTION_Y0,
  CAP_CHAR_W,
  CARD_BOTTOM,
  CARD_HEAD_Y,
  CARD_RULE_Y,
  CARD_TOP,
  CHIPS,
  PAD_X,
  RULER,
  TAG_Y,
  TYPE_AT,
} from "./PipeScriptLayout";
import { SMALL, TXT, X, Y, boxAt, fs, fsChip, u } from "./PipeScriptKit";

/* Chapter four: the caption card. It waits as a short dashed slot under the tag cloud (skeleton lines, four tag slots),
   grows upward until it sits right under the ruler, a small copy of the script lifts off the ruler and docks in its top
   row, the second pass types the caption (large, it is the payoff) over the skeleton, and the card turns mint with a
   "saved" tab in that same top row once the row is written back. */

const SLOT_H = 20;
const TAB_H = 16;
const HEAD_H = 16;
const PILL_W = 104;
const PILL_FROM = [AW / 2, RULER.y + RULER.h / 2] as const;
const PILL_TO = [PAD_X + PILL_W / 2, CARD_HEAD_Y + HEAD_H / 2] as const;
const PILL_PATH = cubicPath(PILL_FROM, PILL_TO, { axis: "y", bend: 0.5 });
/* Two placeholder bars while the card is short, the four caption lines once it has grown. */
const COMPACT_BARS = [
  { y: CARD_TOP.compact + 14, w: 250 },
  { y: CARD_TOP.compact + 28, w: 168 },
] as const;

function TagSlot({ chip }: { chip: (typeof CHIPS)[number] }) {
  if (!chip.dest) return null;
  return (
    <i
      aria-hidden
      style={{ left: X(chip.dest[0] - chip.w / 2), top: Y(TAG_Y - SLOT_H / 2), width: X(chip.w), height: Y(SLOT_H) }}
      className="absolute rounded-[4px] border border-dashed border-line-strong"
    />
  );
}

function TypedLine({ p, grow, i }: { p: MV; grow: MV; i: number }) {
  const text = CAPTION_LINES[i];
  const t = useSeg(p, TYPE_AT[i], TYPE_AT[i + 1]);
  const clip = useTransform(t, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  const edgeLeft = useTransform(t, (v) => pct(v * 100));
  const edgeOpacity = useTransform(t, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const skeleton = useTransform(t, (v) => `inset(0 0 0 ${pct(v * 100)})`);
  const shown = useTransform(grow, (g) => segAt(g, 0.7, 1));
  const y = CAPTION_Y0 + i * CAPTION_PITCH;
  return (
    <>
      <motion.div aria-hidden style={{ opacity: shown }} className="absolute inset-0">
        <motion.i
          style={{ clipPath: skeleton, left: X(PAD_X), top: Y(y + 7), width: X(text.length * CAP_CHAR_W), height: u(11) }}
          className="absolute rounded-[2px] bg-line-strong"
        />
      </motion.div>
      <div style={{ left: X(PAD_X), top: Y(y) }} className={`${MONO} absolute w-fit`}>
        <motion.p style={{ clipPath: clip, fontSize: fs(CAP_FS), lineHeight: u(CAPTION_PITCH) }} className="m-0 whitespace-nowrap text-fg">
          {text}
        </motion.p>
        <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOpacity }} className="absolute inset-y-0 w-[2px] -translate-x-1/2 rounded-full bg-accent" />
      </div>
    </>
  );
}

/** The two short placeholder bars of the card while it is still a slot. They are gone before the caption bars show. */
function CompactBars({ grow }: { grow: MV }) {
  const opacity = useTransform(grow, (g) => 1 - segAt(g, 0, 0.3));
  return (
    <motion.div aria-hidden style={{ opacity }} className="absolute inset-0">
      {COMPACT_BARS.map((b) => (
        <i key={b.y} style={{ left: X(PAD_X), top: Y(b.y), width: X(b.w), height: u(8) }} className="absolute rounded-[2px] bg-line-strong" />
      ))}
    </motion.div>
  );
}

function CardFrame({ p, grow }: { p: MV; grow: MV }) {
  const solid = useSeg(p, TL.solid[0], TL.solid[1]);
  const dashed = useTransform(solid, (v) => 1 - v);
  const saved = useSeg(p, TL.saved[0], TL.saved[1]);
  const top = useTransform(grow, (g) => lerp(CARD_TOP.compact, CARD_TOP.full, g));
  const topPct = useTransform(top, (t) => Y(t));
  const heightPct = useTransform(top, (t) => Y(CARD_BOTTOM - t));
  return (
    <motion.div style={{ left: 0, width: "100%", top: topPct, height: heightPct }} className="absolute">
      <motion.i aria-hidden style={{ opacity: dashed }} className="absolute inset-0 rounded-lg border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: solid }} className="absolute inset-0 rounded-lg border border-line-strong bg-surface-1" />
      <motion.i aria-hidden style={{ opacity: saved }} className="absolute inset-0 rounded-lg border-2 border-mint" />
    </motion.div>
  );
}

/** The rule above the tag row, and the dashed place where the script chip will dock: both appear as the card grows. */
function CardFurniture({ grow }: { grow: MV }) {
  const opacity = useTransform(grow, (g) => segAt(g, 0.7, 1));
  return (
    <motion.div aria-hidden style={{ opacity }} className="absolute inset-0">
      <i style={{ left: X(PAD_X), top: Y(CARD_RULE_Y), width: X(AW - PAD_X * 2) }} className="absolute h-px bg-line-strong" />
      <i
        style={{ left: X(PAD_X), top: Y(CARD_HEAD_Y), width: X(PILL_W), height: u(HEAD_H) }}
        className="absolute rounded-[4px] border border-dashed border-line-strong"
      />
    </motion.div>
  );
}

/** The "saved" tab sits in the top row of the card, on the right, and comes in together with the mint border. */
function SavedTab({ p }: { p: MV }) {
  const t = useSeg(p, TL.tab[0], TL.tab[1], easeOutBack);
  const opacity = useSeg(p, TL.tab[0], TL.tab[0] + 0.012);
  const scale = useTransform(t, (v) => 0.92 + 0.08 * v);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, scale, right: X(PAD_X), top: Y(CARD_HEAD_Y), height: u(TAB_H), gap: u(4), fontSize: fsChip(SMALL), padding: `0 ${u(6)}` }}
      className={`${MONO} absolute flex origin-right items-center whitespace-nowrap rounded-[4px] bg-mint text-pastel-ink`}
    >
      <PipeGlyph name="check" size={u(11)} />
      {`saved to ${SAVED_TAB}`}
    </motion.span>
  );
}

/** Connector from the ruler to the caption card, drawn as the script copy travels and gone once the copy has landed. */
function Trail({ p }: { p: MV }) {
  const t = useSeg(p, TL.pill[0], TL.pill[1], easeInOutCubic);
  const opacity = useTransform(p, (v) => (v > TL.pill[0] ? 0.75 * (1 - segAt(v, TL.pill[1], TL.pill[1] + 0.03)) : 0));
  return (
    <svg viewBox={`0 0 ${AW} ${AH}`} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      <motion.path d={PILL_PATH.d} fill="none" strokeWidth={1.6} strokeLinecap="round" style={{ pathLength: t, opacity, stroke: "var(--color-accent)" }} />
    </svg>
  );
}

/** The whole ruler strip is outlined for a moment just before its copy lifts off. */
function RulerSelect({ p }: { p: MV }) {
  const opacity = useSpan(p, TL.pill[0] - 0.014, TL.pill[0] + 0.024, 0.008);
  return (
    <motion.i
      aria-hidden
      style={{ ...boxAt(RULER.x - 3, RULER.y - 3, RULER.w + 6, RULER.h + 6), opacity }}
      className="pointer-events-none absolute rounded-[6px] border-2 border-fg"
    />
  );
}

export function CaptionCard({ p }: { p: MV }) {
  const grow = useSeg(p, TL.grow[0], TL.grow[1], easeInOutCubic);
  return (
    <>
      <Trail p={p} />
      <RulerSelect p={p} />
      <CardFrame p={p} grow={grow} />
      <CardFurniture grow={grow} />
      <CompactBars grow={grow} />
      {CHIPS.map((c) => (
        <TagSlot key={c.tag} chip={c} />
      ))}
      {CAPTION_LINES.map((line, i) => (
        <TypedLine key={line} p={p} grow={grow} i={i} />
      ))}
      <SavedTab p={p} />
    </>
  );
}

/** A small copy of the script strip lifts off the ruler and docks in the top row of the caption card, where it stays. */
export function ScriptPill({ p }: { p: MV }) {
  const t = useSeg(p, TL.pill[0], TL.pill[1], easeInOutCubic);
  const left = useTransform(t, (v) => X(PILL_PATH.at(v)[0]));
  const top = useTransform(t, (v) => Y(PILL_PATH.at(v)[1]));
  const opacity = useTransform(t, [0, 0.08, 1], [0, 1, 1]);
  const scale = useTransform(t, [0, 0.15, 1], [0.9, 1, 1]);
  return (
    <motion.div aria-hidden style={{ left, top, opacity, scale }} className="absolute z-30 h-0 w-0">
      <span
        style={{ gap: u(5), height: u(HEAD_H), width: u(PILL_W), fontSize: fsChip(TXT) }}
        className={`${MONO} absolute left-0 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap rounded-[4px] border border-line-strong bg-surface-2 text-fg`}
      >
        <span className="flex" style={{ gap: u(1) }}>
          {BLOCK_SEG.map((seg, i) => (
            <i key={seg.x} style={{ width: u(Math.max(4, seg.w / 8)), height: u(8), background: BLOCK_COLOR[i] }} className="rounded-[1px]" />
          ))}
        </span>
        script
      </span>
    </motion.div>
  );
}
