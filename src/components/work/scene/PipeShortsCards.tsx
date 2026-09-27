"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SHORTS, fmtClock } from "./PipeKitData";
import {
  CARD, CARDS_END, CLIP_TOTAL, FW, PLATFORM_LIST, SLIDES, TL, cardAt, cardCx, cardX, scanAt,
} from "./PipeShortsData";
import { SMALL_SANS, TickBadge, boxStyle, pctX, pctY, unit } from "./PipeShortsKit";
import { insetTop, seg, trap } from "./PipeShortsMath";
import SheetPeek from "./PipeShortsSheet";
import Slide from "./PipeShortsSlide";

/* The carousel: five slide cards that the agent appends one by one, then that turn into images, read text, clips, and
   finally the timeline the render walks across. */

const READ_TEXT = "text-[length:clamp(10px,calc(var(--u)*10),12.5px)] leading-[1.2]";
const CLIP_SECONDS = (i: number) => `${fmtClock(i * SHORTS.clipSeconds)}\nto ${fmtClock((i + 1) * SHORTS.clipSeconds)}`;
const PLAYHEAD_PAD = 5;
/** Share of the card height the playhead crosses: it stops above the title band so it never cuts through text. */
const PLAYHEAD_DEPTH = 0.62;
const LABEL_TOP = `calc(100% + ${unit(4)})`;
const COLUMN = CARD.pitch - 6;
const READ_FADE = 0.012;
/** Below this frame width the per card vision text would run together, so one line follows the active card instead. */
const NARROW = "@max-[500px]:hidden";
const WIDE = "@min-[500px]:hidden";

const readStart = (i: number) => scanAt(i) + TL.scan.dur;

function ReadText({ p, i }: { p: MV; i: number }) {
  const t = useSeg(p, readStart(i), readStart(i) + READ_FADE, easeOutCubic);
  const gone = useTransform(p, (v) => 1 - seg(v, TL.readGone[0], TL.readGone[1]));
  const opacity = useTransform([t, gone], ([a, b]: number[]) => a * b);
  const y = useTransform(t, (v) => unit((1 - v) * 4));
  return (
    <motion.p style={{ opacity, y, left: unit(-(COLUMN - CARD.w) / 2), width: unit(COLUMN), top: LABEL_TOP }} className={`absolute text-center text-fg ${READ_TEXT} ${NARROW}`}>
      {SLIDES[i].read}
    </motion.p>
  );
}

/** Narrow frames: the vision text of the card being read, on one line under the row, with a marker on its card. */
function ActiveRead({ p, i }: { p: MV; i: number }) {
  const end = i < SLIDES.length - 1 ? readStart(i + 1) : TL.readGone[1];
  const opacity = useTransform(p, (v) => trap(v, readStart(i), end, READ_FADE));
  return (
    <motion.div aria-hidden style={{ opacity, top: pctY(CARD.y + CARD.h + 6) }} className={`absolute inset-x-0 ${WIDE}`}>
      <i style={{ left: pctX(cardCx(i)), width: unit(CARD.w * 0.5) }} className="absolute top-0 h-[2px] -translate-x-1/2 rounded-full bg-accent" />
      <p className={`mt-[6px] text-center text-fg ${READ_TEXT}`}>{SLIDES[i].read}</p>
    </motion.div>
  );
}

function TimeText({ p, i }: { p: MV; i: number }) {
  const opacity = useTransform(p, (v) => seg(v, TL.timeText[0] + 0.006, TL.timeText[1]) * (1 - seg(v, TL.payoff[0] - 0.006, TL.payoff[0] + 0.004)));
  return (
    <motion.p style={{ opacity, left: unit(-(CARD.pitch - CARD.w) / 2), width: unit(CARD.pitch), top: LABEL_TOP }} className={`absolute whitespace-pre-line text-center text-dim ${READ_TEXT}`}>
      {CLIP_SECONDS(i)}
    </motion.p>
  );
}

function Caption({ i }: { i: number }) {
  return (
    <div className={`absolute inset-x-0 bottom-0 bg-surface-1/90 px-[4px] py-[3px] font-medium text-fg ${SMALL_SANS}`}>{SLIDES[i].title}</div>
  );
}

function Index({ i }: { i: number }) {
  return (
    <span className="absolute left-[3px] top-[3px] rounded-[3px] bg-surface-1/85 px-[3px] py-[1px] text-fg">{String(i + 1).padStart(2, "0")}</span>
  );
}

function Card({ p, i, r }: { p: MV; i: number; r: MV }) {
  const rev = useSeg(p, cardAt(i), cardAt(i) + TL.card.dur, easeOutCubic);
  const clip = useTransform(rev, insetTop);
  const edgeTop = useTransform(rev, (t) => `${(t * 100).toFixed(2)}%`);
  const edgeOn = useTransform(rev, [0, 0.14, 0.3, 0.72, 0.88], [0, 0, 1, 1, 0]);
  const pass = useTransform(r, (v) => Math.min(1, Math.max(0, v * SLIDES.length - i) * 4));
  return (
    <div style={boxStyle(cardX(i), CARD.y, CARD.w, CARD.h)} className="absolute">
      <motion.div style={{ clipPath: clip, borderRadius: unit(6) }} className="absolute inset-0 overflow-hidden border border-line-strong bg-surface-1">
        <Slide p={p} i={i} />
        <Index i={i} />
        <Caption i={i} />
      </motion.div>
      <motion.i aria-hidden style={{ top: edgeTop, opacity: edgeOn }} className="absolute -inset-x-[2px] h-[2px] -translate-y-1/2 bg-accent" />
      <motion.i aria-hidden style={{ opacity: pass, borderRadius: unit(6) }} className="absolute -inset-[2px] border-2 border-mint" />
      <ReadText p={p} i={i} />
      <TimeText p={p} i={i} />
    </div>
  );
}

function Playhead({ r }: { r: MV }) {
  const left = useTransform(r, (v) => `${(((CARD.x0 - PLAYHEAD_PAD + v * (CARDS_END - CARD.x0 + PLAYHEAD_PAD * 2)) / FW) * 100).toFixed(3)}%`);
  const opacity = useTransform(r, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity, top: pctY(CARD.y - 6), height: pctY(CARD.h * PLAYHEAD_DEPTH + 6) }}
      className="absolute z-20 w-[2px] -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

/** The payoff line that takes the place of the clip times once every platform has the video. */
function Posted({ p }: { p: MV }) {
  const on = useSeg(p, TL.payoff[0] + 0.004, TL.payoff[0] + 0.03, easeOutCubic);
  const y = useTransform(on, (v) => unit((1 - v) * 5));
  const pop = useSeg(p, TL.payoff[0] + 0.014, TL.payoff[0] + 0.034);
  return (
    <motion.div style={{ opacity: on, y, top: pctY(CARD.y + CARD.h + 8) }} className={`absolute inset-x-0 flex items-center justify-center gap-[6px] text-fg ${READ_TEXT}`}>
      <TickBadge pop={pop} size={13} />
      {`${fmtClock(CLIP_TOTAL)} posted to ${PLATFORM_LIST.length} platforms`}
    </motion.div>
  );
}

export default function Cards({ p }: { p: MV }) {
  const r = useSeg(p, TL.render[0], TL.render[1]);
  return (
    <>
      <SheetPeek p={p} />
      {SLIDES.map((s, i) => (
        <Card key={s.title} p={p} i={i} r={r} />
      ))}
      {SLIDES.map((s, i) => (
        <ActiveRead key={s.title} p={p} i={i} />
      ))}
      <Playhead r={r} />
      <Posted p={p} />
    </>
  );
}
