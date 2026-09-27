"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { SlideArt } from "./PipeShortsArt";
import { COUNTDOWN, TIPS, TL, cardAt, imgAt, moveAt, perfAt, scanAt } from "./PipeShortsData";
import { SMALL_SANS, unit } from "./PipeShortsKit";
import { countdown, insetTop } from "./PipeShortsMath";

/* One 9:16 slide frame and everything that happens inside it, as a function of scroll: the empty slot with its poll
   countdown, the generated image arriving, the vision scan, the film perforations and the clip playing. The card row and the
   large lens use the very same component, so slide 1 is one object shown at two sizes. */

const PERF_HOLES =
  "[background-image:repeating-linear-gradient(to_bottom,transparent_0_3px,color-mix(in_oklab,var(--color-fg)_75%,transparent)_3px_5px,transparent_5px_7px)]";
const SCAN_BAND = 24;

/** 0..1 of the clip playing for slide i. */
export function useSlideMove(p: MV, i: number): MV {
  return useSeg(p, moveAt(i), moveAt(i) + TL.move.dur);
}

/** The written slide before its image exists: one line of copy typed in as the agent writes it, then the poll countdown. */
function Placeholder({ p, i }: { p: MV; i: number }) {
  const wait = useSeg(p, TL.imgStart, imgAt(i));
  const on = useSeg(p, TL.imgStart - 0.008, TL.imgStart);
  const text = useTransform(wait, (t) => `${countdown(COUNTDOWN, t)} s`);
  const typed = useSeg(p, cardAt(i) + 0.008, cardAt(i) + TL.card.dur + 0.012);
  const tip = useTransform(typed, (t) => TIPS[i].slice(0, Math.round(t * TIPS[i].length)));
  return (
    <div className="absolute inset-0 bg-surface-1">
      <span aria-hidden className="absolute inset-[3%] rounded-[5px] border border-dashed border-line-strong opacity-60" />
      <div className="absolute inset-x-[5%] top-[19%]">
        <p className={`relative text-dim ${SMALL_SANS}`}>
          <span className="invisible">{TIPS[i]}</span>
          <motion.span className="absolute inset-0">{tip}</motion.span>
        </p>
        <motion.p style={{ opacity: on }} className="mt-[4px] text-fg">
          <motion.span className="tabular-nums">{text}</motion.span>
        </motion.p>
      </div>
    </div>
  );
}

function Scan({ p, i }: { p: MV; i: number }) {
  const t = useSeg(p, scanAt(i), scanAt(i) + TL.scan.dur);
  const line = useTransform(t, (v) => `${(v * 100).toFixed(2)}%`);
  const band = useTransform(t, (v) => `${(v * 100 - SCAN_BAND).toFixed(2)}%`);
  const opacity = useTransform(t, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ opacity }} className="pointer-events-none absolute inset-0">
      <motion.i style={{ top: band, height: `${SCAN_BAND}%` }} className="absolute inset-x-0 bg-accent/25" />
      <motion.i style={{ top: line }} className="absolute inset-x-0 h-[2px] -translate-y-1/2 bg-accent" />
    </motion.div>
  );
}

function Badges({ p, i, scale }: { p: MV; i: number; scale: number }) {
  const eye = useTransform(p, (v) => {
    const seen = Math.min(1, Math.max(0, (v - scanAt(i)) / 0.01));
    const gone = Math.min(1, Math.max(0, (v - perfAt(i)) / 0.006));
    return seen * (1 - gone);
  });
  const film = useSeg(p, perfAt(i) + 0.006, perfAt(i) + 0.014);
  const shown = useTransform([eye, film], ([a, b]: number[]) => Math.max(a, b));
  const size = unit(13 * scale);
  return (
    <motion.span style={{ opacity: shown }} className="absolute right-[6%] top-[3%] grid place-items-center rounded-full bg-surface-1/85 p-[2px]">
      <motion.span style={{ opacity: eye }} className="col-start-1 row-start-1">
        <PipeGlyph name="eye" size={size} />
      </motion.span>
      <motion.span style={{ opacity: film }} className="col-start-1 row-start-1">
        <PipeGlyph name="film" size={size} />
      </motion.span>
    </motion.span>
  );
}

function Film({ p, i, scale }: { p: MV; i: number; scale: number }) {
  const on = useSeg(p, perfAt(i), perfAt(i) + TL.perf.dur);
  const move = useSlideMove(p, i);
  const strip = `absolute inset-y-0 bg-bg/80 ${PERF_HOLES}`;
  return (
    <motion.div aria-hidden style={{ opacity: on }} className="pointer-events-none absolute inset-0">
      <i style={{ width: unit(5 * scale) }} className={`${strip} left-0`} />
      <i style={{ width: unit(5 * scale) }} className={`${strip} right-0`} />
      <motion.i style={{ scaleX: move }} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent" />
    </motion.div>
  );
}

export default function Slide({ p, i, hero = false }: { p: MV; i: number; hero?: boolean }) {
  const scale = hero ? 1.6 : 1;
  const img = useSeg(p, imgAt(i), imgAt(i) + TL.img.dur, easeOutCubic);
  const move = useSlideMove(p, i);
  const clip = useTransform(img, insetTop);
  const edgeTop = useTransform(img, (t) => `${(t * 100).toFixed(2)}%`);
  const edgeOn = useTransform(img, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Placeholder p={p} i={i} />
      <motion.div style={{ clipPath: clip }} className="absolute inset-0">
        <SlideArt kind={i} move={move} />
      </motion.div>
      <motion.i aria-hidden style={{ top: edgeTop, opacity: edgeOn }} className="absolute inset-x-0 h-[2px] -translate-y-1/2 bg-accent" />
      <Film p={p} i={i} scale={scale} />
      <Scan p={p} i={i} />
      <Badges p={p} i={i} scale={scale} />
    </div>
  );
}
