"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { TONE_VAR, mixColor } from "./MtmKitMath";
import { BRIDGE_LABEL, NEGATIONS, NO_LINK, T } from "./MtmFitSceneData";
import { Edge, useWipe } from "./MtmFitSceneKit";
import { BREAK, Impact, Packets, WIRE_X } from "./MtmFitScenePackets";

const LABEL_RIGHT = "calc(100% - var(--wire) + 8px)";

const PORT = "absolute h-2 w-2 -translate-x-1/2 rounded-full border-2 border-line-strong";
const WIRE_CLASS = "absolute w-0 -translate-x-px border-l-2 border-dashed border-line-strong";

/* A bright spark rides the front of the wire while it is drawn. */
function DrawSpark({ draw }: { draw: MV }) {
  const top = useTransform(draw, (d) => `${(d * 100).toFixed(2)}%`);
  const opacity = useTransform(draw, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left: WIRE_X, top, opacity }}
      className="absolute z-[5] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_2px_var(--color-accent)]"
    />
  );
}

function Wire({ p }: { p: MV }) {
  const draw = useSeg(p, T.wire[0], T.wire[1]);
  const port = useTransform(draw, (d) => mixColor(TONE_VAR.accent, d, "var(--color-surface-1)"));
  return (
    <>
      <i aria-hidden style={{ left: WIRE_X, top: 0, height: `${BREAK[0]}%` }} className={WIRE_CLASS} />
      <i aria-hidden style={{ left: WIRE_X, bottom: 0, height: `${100 - BREAK[1]}%` }} className={WIRE_CLASS} />
      <motion.i aria-hidden style={{ left: WIRE_X, scaleY: draw }} className="absolute inset-y-0 w-[2px] -translate-x-px origin-top bg-accent" />
      <DrawSpark draw={draw} />
      <motion.i aria-hidden style={{ left: WIRE_X, top: 0, backgroundColor: port }} className={`${PORT} -translate-y-1/2`} />
      <motion.i aria-hidden style={{ left: WIRE_X, bottom: 0, backgroundColor: port }} className={`${PORT} translate-y-1/2`} />
    </>
  );
}

function BreakMark({ p }: { p: MV }) {
  const pop = useSeg(p, T.probeHit[0], T.probeHit[1], easeOutBack);
  const gone = useSeg(p, T.wire[0] + 0.01, T.wire[0] + 0.03);
  const scale = useTransform([pop, gone], ([a, g]: number[]) => a * (1 - g));
  return (
    <motion.span aria-hidden style={{ left: WIRE_X, scale }} className="absolute top-1/2 -ml-3 -mt-3 block h-6 w-6">
      <MtmGlyph name="cross" size="100%" />
    </motion.span>
  );
}

/* The old label fades out while the pill wipes over it, so no piece of it ever sits beside the pill. */
const OLD_FADE = [0, 0.4] as const;

function LinkLabel({ p }: { p: MV }) {
  const t = useSeg(p, T.pill[0], T.pill[1]);
  const w = useWipe(t);
  const oldOpacity = useTransform(t, [OLD_FADE[0], OLD_FADE[1]], [1, 0]);
  return (
    <div style={{ right: LABEL_RIGHT }} className="absolute top-1/2 h-6 w-max -translate-y-1/2 @[520px]:h-7">
      <motion.span
        style={{ clipPath: w.oldClip, opacity: oldOpacity }}
        className={`${MONO} absolute inset-0 flex items-center justify-end whitespace-nowrap pr-3 text-[10px] uppercase tracking-[0.1em] text-mute @[520px]:text-[12px]`}
      >
        {NO_LINK}
      </motion.span>
      <motion.span
        style={{ clipPath: w.newClip }}
        className="relative flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border border-accent bg-surface-1 px-2.5 @[520px]:h-7 @[520px]:px-3"
      >
        <MtmGlyph name="code" size={16} />
        <span className={`${MONO} text-[10px] text-fg @[520px]:text-[12px]`}>{BRIDGE_LABEL}</span>
      </motion.span>
      <Edge left={w.edgeLeft} opacity={w.edgeOpacity} />
    </div>
  );
}

function NegChip({ p, i, label }: { p: MV; i: number; label: string }) {
  const a = T.negations[0] + i * 0.012;
  const t = useSeg(p, a, a + 0.02, easeOutBack);
  const opacity = useSeg(p, a, a + 0.01);
  const x = useTransform(t, (v) => (1 - v) * 18);
  return (
    <motion.span
      style={{ scale: t, opacity, x }}
      className="inline-flex h-5 origin-right items-center gap-1 rounded-full border border-line-strong bg-surface-1 px-2 @[520px]:h-6 @[520px]:gap-1.5 @[520px]:px-2.5"
    >
      <MtmGlyph name="cross" size={12} />
      <span className={`${MONO} text-[10px] leading-none text-dim @[520px]:text-[12px]`}>{label}</span>
    </motion.span>
  );
}

/* They belong to the first pass only: gone with the first fade of the bridge and not brought back. */
function Negations({ p }: { p: MV }) {
  const opacity = useTransform(p, [T.bridgeOut[0], T.bridgeOut[1]], [1, 0]);
  return (
    <motion.div style={{ right: LABEL_RIGHT, opacity }} className="absolute top-[calc(50%+18px)] flex gap-1.5 @[520px]:top-[calc(50%+22px)]">
      {NEGATIONS.map((label, i) => (
        <NegChip key={label} p={p} i={i} label={label} />
      ))}
    </motion.div>
  );
}

export function Bridge({ p }: { p: MV }) {
  const visible = useTransform(p, [T.bridgeOut[0], T.bridgeOut[1], T.bridgeIn[0], T.bridgeIn[1]], [1, 0, 0, 1]);
  return (
    <motion.div aria-hidden style={{ opacity: visible }} className="absolute inset-0 [--wire:56%] @[520px]:[--wire:50%]">
      <Wire p={p} />
      <BreakMark p={p} />
      <Impact p={p} />
      <LinkLabel p={p} />
      <Negations p={p} />
      <Packets p={p} />
    </motion.div>
  );
}
