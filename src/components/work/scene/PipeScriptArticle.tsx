"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { ARTICLE, FEEDS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { clamp01, lerp, pct, segAt } from "./PipeKitMath";
import { AW, BLOCK_COLOR, TL } from "./PipeScriptData";
import { ART, BARS, BLOCK_SEG, BODY, BODY_GONE, LINE_H, PAD_X, RULER, SHEET_H, TITLE_GONE, type BarSpec, type BodyLine } from "./PipeScriptLayout";
import { Edge, SMALL, TXT, X, Y, blend, boxAt, fs, u } from "./PipeScriptKit";

/* The picked article. Chapter one reads it: phrases are highlighted and lift off. Chapter two marks its text with bars
   in a sweep (the words stay readable under them), and the bars fold one after another into the five blocks of the
   ruler while the card becomes the script sheet that the rows are written into. Each line's text is gone only once its
   own bar has left it, so the card is never a bare box. */

/* Lightly see-through, so the words show under a bar that has not left yet. */
const BAR_INK = "color-mix(in oklab, var(--color-mute) 42%, transparent)";
/* How much of its block colour a bar already carries as the sweep marks it. */
const TINT = 0.32;
const REST_OPACITY = 0.8;
const FEED_LABEL = FEEDS.find((f) => f.id === ARTICLE.feed)?.label ?? "";

/** The card: the article in chapter one, the script sheet in chapter two. It leaves with the rows, the ruler frame stays. */
export function ArticleFrame({ p }: { p: MV }) {
  const t = useSeg(p, TL.frame[0], TL.frame[1], easeInOutCubic);
  const height = useTransform(t, (v) => Y(lerp(ART.h, SHEET_H, v)));
  return <motion.div aria-hidden style={{ left: 0, top: 0, width: "100%", height }} className="absolute rounded-lg border border-line-strong bg-surface-1" />;
}

/** The frame of the ruler alone, under the card, so it is what remains once the sheet has been wiped away. */
export function RulerFrame() {
  return <i aria-hidden style={{ left: 0, top: 0, width: "100%", height: Y(RULER.frame) }} className="absolute rounded-lg border border-line-strong bg-surface-1" />;
}

function Phrase({ idx, text, p }: { idx: number; text: string; p: MV }) {
  const a = TL.mark.from + idx * TL.mark.step;
  const l = TL.lift.from + idx * TL.lift.step;
  const mark = useSeg(p, a, a + TL.mark.dur, easeInOutCubic);
  const lift = useSeg(p, l, l + 0.02);
  const clip = useTransform(mark, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  const edgeLeft = useTransform(mark, (v) => pct(v * 100));
  const edgeOpacity = useTransform(mark, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const fill = useTransform(lift, (v) => 1 - v);
  /* The source words step back as their chip leaves, so the chip never sits on a second copy of the same text. */
  const opacity = useTransform(lift, (v) => 1 - 0.45 * v);
  const color = useTransform([mark, lift], ([m, k]: number[]) => blend(blend("var(--color-dim)", "var(--color-fg)", m), "var(--color-mute)", k));
  return (
    <motion.span style={{ color, opacity }} className="relative">
      <motion.i aria-hidden style={{ clipPath: clip, opacity: fill }} className="absolute -inset-x-[2px] -inset-y-px z-[-1] rounded-[3px] bg-accent/35" />
      <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOpacity }} className="absolute -inset-y-[2px] w-[2px] -translate-x-1/2 rounded-full bg-accent" />
      {text}
    </motion.span>
  );
}

/** 1 until `win` starts, 0 once it has ended: how much of a line's text is still there. */
function useStays(p: MV, win: readonly [number, number]): MV {
  const gone = useSeg(p, win[0], win[1]);
  return useTransform(gone, (g) => 1 - g);
}

function BodyRow({ line, p, rest, win }: { line: BodyLine; p: MV; rest: MV; win: readonly [number, number] }) {
  const opacity = useStays(p, win);
  return (
    <motion.p
      style={{ left: X(PAD_X), top: Y(line.y), height: u(LINE_H), lineHeight: u(LINE_H), fontSize: fs(TXT), opacity }}
      className={`${MONO} absolute m-0 whitespace-nowrap`}
    >
      {line.segs.map((s) =>
        s.phrase < 0 ? (
          <motion.span key={s.text} style={{ opacity: rest }}>
            {s.text}
          </motion.span>
        ) : (
          <Phrase key={s.text} idx={s.phrase} text={s.text} p={p} />
        ),
      )}
    </motion.p>
  );
}

function Head() {
  return (
    <div style={{ left: X(PAD_X), top: Y(ART.headY), gap: u(6), fontSize: fs(SMALL) }} className={`${MONO} absolute flex items-center text-mute`}>
      <PipeGlyph name="article" size={u(14)} />
      <span>{`${FEED_LABEL}, ${ARTICLE.age} ago`}</span>
    </div>
  );
}

function Title() {
  return (
    <h3
      className="t-h3 absolute m-0 text-fg"
      style={{ left: X(PAD_X), top: Y(ART.titleY), width: X(AW - PAD_X * 2), fontSize: u(15), lineHeight: u(19) }}
    >
      {ARTICLE.title}
    </h3>
  );
}

/** Text layer. The accent edge sweeps across it and the bars appear behind the edge, over the words, which stay. */
export function ArticleText({ p }: { p: MV }) {
  const sweep = useSeg(p, TL.sweep[0], TL.sweep[1], easeInOutCubic);
  const read = useSeg(p, TL.read[0], TL.read[1]);
  const rest = useTransform(read, (r) => 1 - (1 - REST_OPACITY) * r);
  const head = useStays(p, TITLE_GONE);
  return (
    <>
      <div className="absolute inset-0 text-dim">
        <motion.div style={{ opacity: head }} className="absolute inset-0">
          <Head />
          <Title />
        </motion.div>
        {BODY.map((line, i) => (
          <BodyRow key={line.y} line={line} p={p} rest={rest} win={BODY_GONE[i]} />
        ))}
      </div>
      <Edge front={sweep} style={{ top: 0, height: Y(ART.h) }} />
    </>
  );
}

/* A bar first slides and shrinks along its own line, then rises into its slot, so it never crosses the slots that
   bars before it have already filled. */
const SLIDE = 0.55;
const RISE_FROM = 0.42;

function foldRect({ from, to }: BarSpec, t: number) {
  const ex = segAt(t, 0, SLIDE, easeInOutCubic);
  const ey = segAt(t, RISE_FROM, 1, easeInOutCubic);
  return { x: lerp(from.x, to.x, ex), y: lerp(from.y, to.y, ey), w: lerp(from.w, to.w, ex), h: lerp(from.h, to.h, ey) };
}

function Bar({ p, bar }: { p: MV; bar: BarSpec }) {
  const sweep = useSeg(p, TL.sweep[0], TL.sweep[1], easeInOutCubic);
  const fold = useSeg(p, bar.at, bar.at + TL.fold.dur);
  const rect = useTransform(fold, (t) => foldRect(bar, t));
  const left = useTransform(rect, (r) => X(r.x));
  const top = useTransform(rect, (r) => Y(r.y));
  const width = useTransform(rect, (r) => X(r.w));
  const height = useTransform(rect, (r) => Y(r.h));
  const background = useTransform([fold, sweep], ([t, s]: number[]) => blend(BAR_INK, BLOCK_COLOR[bar.block], t + (1 - t) * TINT * s));
  const clip = useTransform(sweep, (s) => {
    const shown = bar.ghost ? 1 : clamp01((s * AW - bar.from.x) / bar.from.w);
    return `inset(0 ${pct(100 - shown * 100)} 0 0)`;
  });
  return <motion.i aria-hidden style={{ left, top, width, height, background, clipPath: clip }} className="absolute rounded-[1px]" />;
}

export function ArticleBars({ p }: { p: MV }) {
  return (
    <>
      {BARS.map((bar) => (
        <Bar key={bar.at} p={p} bar={bar} />
      ))}
    </>
  );
}

/** Solid colour behind each block once its bars have landed, so stacked bars leave no hairline seams. */
function Backing({ p, block }: { p: MV; block: number }) {
  const landed = BARS.filter((b) => b.block === block).reduce((max, b) => Math.max(max, b.at), 0) + TL.fold.dur;
  const opacity = useSeg(p, landed - 0.006, landed);
  const seg = BLOCK_SEG[block];
  return <motion.i aria-hidden style={{ ...boxAt(seg.x, RULER.y + RULER.pad, seg.w, RULER.h - RULER.pad * 2), opacity, background: BLOCK_COLOR[block] }} className="absolute" />;
}

export function RulerBacking({ p }: { p: MV }) {
  return (
    <>
      {BLOCK_SEG.map((seg, i) => (
        <Backing key={seg.x} p={p} block={i} />
      ))}
    </>
  );
}
