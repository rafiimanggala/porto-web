"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PatternCard } from "./MtmKitCards";
import type { Pattern } from "./MtmKitData";
import { keyframes, pct, segAt, toneTint } from "./MtmKitMath";
import { BASE, CARD_PITCH, OTHERS, T, TITLES, UNCHANGED } from "./MtmEditorSceneData";
import { MtmGlyph } from "./MtmKitGlyphs";
import { FoldBox, Pointer, RevealSlot, RollLines, ServicePill, bell, inWindows } from "./MtmEditorSceneKit";

/* Library: the header row, the first card (the one that gets picked, edited and cloned) and the other four. */

const TITLE_KEYS = [T.stepX[0], T.stepX[1], T.collapse[0], T.collapse[1]] as const;

export function storeLoadAt(v: number) {
  return inWindows(v, [T.load, T.saveLoad, T.saveLoad2]);
}

export function RowA({ p }: { p: MV }) {
  const idx = useTransform(p, (v) => keyframes(v, TITLE_KEYS, [0, 1, 1, 2], easeInOutCubic));
  const busy = useTransform(p, (v) => bell(storeLoadAt(v)));
  return (
    <div className="mb-1.5 flex h-5 shrink-0 items-center justify-between gap-2">
      <RollLines idx={idx} lines={TITLES} className={`${MONO} min-w-0 flex-1 text-[10px] uppercase tracking-[0.12em] text-mute`} />
      <ServicePill busy={busy} />
    </div>
  );
}

/* The first card is already loaded when the scene opens, the other four arrive one after the other. */
const cardWindow = (k: number) => {
  if (k === 0) return T.firstCard;
  const a = T.cards.from + T.cards.step * (k - 1);
  return [a, a + T.cards.dur] as const;
};

const ghostOf = (pattern: Pattern, state?: "saved") => (
  <PatternCard name={pattern.name} gender={pattern.gender} state={state} className="border-dashed" />
);

function useCardReveal(p: MV, k: number) {
  const [a, b] = cardWindow(k);
  return useSeg(p, a, b, easeOutCubic);
}

/* Sits on the original once the copy has peeled away: the stored pattern was not touched. */
function UnchangedTag({ p }: { p: MV }) {
  const t = useSeg(p, T.unchanged[0], T.unchanged[1]);
  const clip = useTransform(t, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  const edge = useTransform(t, (v) => pct(v * 100));
  const edgeOn = useTransform(t, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  return (
    <div className="pointer-events-none absolute right-12 top-[15px] z-30">
      <motion.span
        style={{ clipPath: clip, background: toneTint("mint", 0.4) }}
        className={`${MONO} flex h-6 items-center gap-1 rounded-md pl-1.5 pr-2 text-[10px] uppercase leading-none tracking-[0.1em] text-fg`}
      >
        <MtmGlyph name="check" size={12} />
        {UNCHANGED}
      </motion.span>
      <motion.i aria-hidden style={{ left: edge, opacity: edgeOn }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

export function OriginalCard({ p }: { p: MV }) {
  const t = useCardReveal(p, 0);
  const travel = useSeg(p, T.tapCard.travel[0], T.tapCard.travel[1], easeInOutCubic);
  const press = useSeg(p, T.tapCard.press[0], T.tapCard.press[1]);
  const show = useTransform(p, (v) => segAt(v, T.tapCard.travel[0], T.tapCard.travel[0] + 0.02) * (1 - segAt(v, T.tapCard.gone[0], T.tapCard.gone[1])));
  const sel = useTransform(p, (v) => segAt(v, T.select[0], T.select[1]) * (1 - segAt(v, T.deselect[0], T.deselect[1], easeInOutCubic)));
  return (
    <div className="relative shrink-0 pb-2">
      <RevealSlot t={t} ghost={ghostOf(BASE, "saved")}>
        <PatternCard name={BASE.name} gender={BASE.gender} state="saved" selected={sel} />
      </RevealSlot>
      <UnchangedTag p={p} />
      <div className="absolute left-[64%] top-[26px]">
        <Pointer t={travel} press={press} show={show} from={[150, 96]} />
      </div>
    </div>
  );
}

/* Cards fold away one at a time from the bottom while the editor opens: each one fades first, then gives its height back. */
function OtherCard({ p, k, pattern }: { p: MV; k: number; pattern: Pattern }) {
  const t = useCardReveal(p, k);
  const a = T.others.from + (OTHERS.length - k) * T.others.step;
  const folded = useSeg(p, a, a + T.others.dur, easeInOutCubic);
  const open = useTransform(folded, (v) => 1 - v);
  return (
    <FoldBox t={open} h={CARD_PITCH}>
      <div className="pb-2">
        <RevealSlot t={t} ghost={ghostOf(pattern)}>
          <PatternCard name={pattern.name} gender={pattern.gender} />
        </RevealSlot>
      </div>
    </FoldBox>
  );
}

export function OthersList({ p }: { p: MV }) {
  return (
    <>
      {OTHERS.map((pattern, i) => (
        <OtherCard key={pattern.id} p={p} k={i + 1} pattern={pattern} />
      ))}
    </>
  );
}
