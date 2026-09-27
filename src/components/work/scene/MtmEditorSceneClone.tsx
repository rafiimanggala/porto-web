"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PatternCard } from "./MtmKitCards";
import { pct, segAt } from "./MtmKitMath";
import { BASE, CARD_PITCH, COPY_FULL, EXISTING_CLONE, T, suffixOf } from "./MtmEditorSceneData";
import { FoldBox, bell } from "./MtmEditorSceneKit";

/* Save As New: a copy lifts out of the original, lands in a fresh slot and gets its date stamped, numbered name typed in.
   The original is never touched. The copies are inserted right below it, newest first. */

type Win = readonly [number, number];

/* Sway and scale are relative to the card, so on a narrow column the tilted card stays inside the window's own padding
   (8px at 390 wide): sway plus the scale growth on that side peaks at about 4.5px there. */
const LIFT_SWAY = 0.6;
const LIFT_TILT = 1;
const LIFT_SCALE = 0.012;

const STAMP_FADE = 0.035;

function TypedSuffix({ p, text, win }: { p: MV; text: string; win: Win }) {
  const t = useSeg(p, win[0], win[1]);
  const clip = useTransform(t, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  const caret = useTransform(t, (v) => pct(v * 100));
  const caretOn = useTransform(t, (v) => (v > 0.001 && v < 0.999 ? 1 : 0));
  const stamp = useTransform(p, (v) => segAt(v, win[0], win[0] + 0.01) * (1 - segAt(v, win[1], win[1] + STAMP_FADE)));
  return (
    <span className="relative inline-block whitespace-pre align-bottom">
      <motion.span style={{ clipPath: clip }} className="relative block">
        <motion.i aria-hidden style={{ opacity: stamp }} className="absolute inset-y-[1px] -inset-x-[2px] -z-10 rounded-[3px] bg-accent/30" />
        {text}
      </motion.span>
      <motion.i aria-hidden style={{ left: caret, opacity: caretOn }} className="absolute -inset-y-[1px] w-[2px] -translate-x-1/2 rounded-full bg-accent" />
    </span>
  );
}

type CopyProps = { p: MV; full: string; slot: Win; lift: Win; type: Win; selIn?: Win; selOut?: Win };

function CopySlot({ p, full, slot, lift, type, selIn, selOut }: CopyProps) {
  const grow = useSeg(p, slot[0], slot[1], easeOutCubic);
  const height = useTransform(grow, (v) => v * CARD_PITCH);
  const t = useSeg(p, lift[0], lift[1], easeInOutCubic);
  const y = useTransform(t, (v) => `${(-(1 - v) * 100).toFixed(3)}%`);
  const x = useTransform(t, (v) => `${(bell(v) * LIFT_SWAY).toFixed(3)}%`);
  const rotate = useTransform(t, (v) => bell(v) * LIFT_TILT);
  const scale = useTransform(t, (v) => 1 + bell(v) * LIFT_SCALE);
  const shadow = useTransform(t, (v) => `0 ${(bell(v) * 16).toFixed(1)}px ${(bell(v) * 26).toFixed(1)}px -10px rgba(0,0,0,${(bell(v) * 0.6).toFixed(2)})`);
  const shown = useTransform(t, (v) => (v > 0 ? 1 : 0));
  const hole = useTransform(t, (v) => 1 - segAt(v, 0.85, 1));
  const zIndex = useTransform(t, (v) => (v > 0 && v < 1 ? 20 : 10));
  const sel = useTransform(p, (v) => (selIn ? segAt(v, selIn[0], selIn[1]) : 1) * (1 - (selOut ? segAt(v, selOut[0], selOut[1]) : 0)));
  return (
    <motion.div style={{ height }} className="relative shrink-0">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <motion.i style={{ opacity: hole }} className="absolute inset-x-0 top-0 h-[54px] rounded-lg border border-dashed border-accent/60" />
      </div>
      <motion.div style={{ y, x, rotate, scale, opacity: shown, zIndex }} className="relative h-[62px] origin-center">
        <motion.div style={{ boxShadow: shadow }} className="rounded-lg">
          <PatternCard
            name={
              <>
                {BASE.name}
                <TypedSuffix p={p} text={suffixOf(full)} win={type} />
              </>
            }
            gender={BASE.gender}
            state="new"
            selected={sel}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ExistingClone({ p }: { p: MV }) {
  const grow = useSeg(p, T.existing[0], T.existing[1], easeOutCubic);
  return (
    <FoldBox t={grow} h={CARD_PITCH}>
      <div className="pb-2">
        <PatternCard name={EXISTING_CLONE} gender={BASE.gender} state="saved" garment={BASE.garment} />
      </div>
    </FoldBox>
  );
}

export function Family({ p }: { p: MV }) {
  return (
    <>
      <CopySlot p={p} full={COPY_FULL.three} slot={T.slot3} lift={T.lift3} type={T.type3} selIn={T.move2} />
      <CopySlot p={p} full={COPY_FULL.two} slot={T.slot2} lift={T.lift2} type={T.type2} selOut={T.move2} />
      <ExistingClone p={p} />
    </>
  );
}
