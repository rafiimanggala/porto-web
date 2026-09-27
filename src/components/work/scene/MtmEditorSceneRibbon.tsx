"use client";

import { Fragment } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, type MV } from "./HealthSceneParts";
import { FLOW_STEPS } from "./MtmKitData";
import { MtmGlyph } from "./MtmKitGlyphs";
import { clamp01, mixColor, segAt, useKeys } from "./MtmKitMath";
import { T } from "./MtmEditorSceneData";

/* The five step flow as a ribbon. The active step opens up to show its name exactly as FLOW_STEPS spells it (no CSS upper casing),
   so "Save As New" and "Add to cart" read the same here as on the button faces. Finished steps carry a tick. */

const TILE_W = 34;
const LABEL_W = 108;
/* Handoff is sequential: the step being left narrows to a bare tile in the first half, the next one opens in the second half,
   so two open pills never share a frame. Frame colour, tint and name all wait until the pill is nearly open, so a half open
   pill is a plain neutral tile, never an orange empty one. */
const LABEL_SHOW = [0.6, 0.9] as const;

const openness = (pos: number, i: number) => clamp01(1 - 2 * Math.abs(pos - i));

/* Get Fitted glyph: a tape measure. The kit's own tape glyph reads as a coin at this size, so this one is a blue case with a hub
   and a yellow ribbon pulled out below it, tick marks hanging from the ribbon edge and a hook at the end. */
const INK = "var(--color-fg)";
const TAPE = { fill: "none", stroke: INK, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const tint = (tone: string, amount: number) => `color-mix(in oklab, var(--color-${tone}) ${amount}%, transparent)`;

function TapeGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden style={{ width: size, height: size }}>
      <g {...TAPE}>
        <rect x="-5" y="3.4" width="16.4" height="6.4" rx="1.2" fill={tint("sun", 90)} />
        <path d="M0.4 3.4V6.8M3.6 3.4V8M6.8 3.4V6.8" strokeWidth="1.5" />
        <path d="M11.4 2.6V10.6" strokeWidth="2.6" />
        <rect x="-10.8" y="-10.6" width="15.8" height="15.8" rx="4.6" fill={tint("sky", 80)} />
        <circle cx="-2.9" cy="-2.7" r="3.4" />
        <circle cx="-2.9" cy="-2.7" r="0.9" fill={INK} stroke="none" />
      </g>
    </svg>
  );
}

const stepDone = (i: number, v: number, pos: number) => {
  if (i === 0) return segAt(v, T.fitDone[0], T.fitDone[1]);
  if (i === FLOW_STEPS.length - 1) return segAt(v, T.unlock[0], T.unlock[1]);
  return clamp01((pos - i - 0.5) * 3);
};

function Tick({ done }: { done: MV }) {
  const pop = useTransform(done, (d) => easeOutBack(clamp01(d)));
  return (
    <motion.span aria-hidden style={{ scale: pop, opacity: done }} className="absolute bottom-[2px] right-[2px] block h-3 w-3">
      <MtmGlyph name="check" size="100%" />
    </motion.span>
  );
}

function StepTile({ i, p, pos }: { i: number; p: MV; pos: MV }) {
  const step = FLOW_STEPS[i];
  const g = useTransform(pos, (v) => openness(v, i));
  const width = useTransform(g, (v) => TILE_W + LABEL_W * v);
  const border = useTransform(g, (v) => mixColor("var(--color-accent)", segAt(v, 0.55, 0.9), "var(--color-line-strong)"));
  const dim = useTransform(g, (v) => 0.62 + 0.38 * v);
  const wash = useTransform(g, (v) => segAt(v, 0.4, 0.9));
  const name = useTransform(g, (v) => segAt(v, LABEL_SHOW[0], LABEL_SHOW[1]));
  const done = useTransform([p, pos], ([v, q]: number[]) => stepDone(i, v, q));
  return (
    <motion.div style={{ width, borderColor: border }} className="relative flex h-9 shrink-0 items-center overflow-hidden rounded-lg border bg-surface-1">
      <motion.i aria-hidden style={{ opacity: wash }} className="absolute inset-0 bg-accent/15" />
      <motion.span style={{ opacity: dim }} className="relative grid h-[34px] w-[32px] shrink-0 place-items-center">
        {step.id === "fit" ? <TapeGlyph size={20} /> : <MtmGlyph name={step.glyph} size={20} />}
      </motion.span>
      <motion.span style={{ opacity: name }} className={`${MONO} relative whitespace-nowrap pr-2.5 text-[11px] leading-none tracking-[0.02em] text-fg`}>
        {step.label}
      </motion.span>
      <Tick done={done} />
    </motion.div>
  );
}

function Link({ i, pos }: { i: number; pos: MV }) {
  const fill = useTransform(pos, (v) => clamp01(v - i));
  return (
    <span aria-hidden className="relative mx-1 h-[2px] min-w-[4px] flex-1 rounded-full bg-line-strong">
      <motion.i style={{ scaleX: fill }} className="absolute inset-0 origin-left rounded-full bg-accent" />
    </span>
  );
}

export default function Ribbon({ p }: { p: MV }) {
  const pos = useKeys(p, T.stepX, T.stepY);
  return (
    <div className="flex h-9 shrink-0 items-center">
      {FLOW_STEPS.map((step, i) => (
        <Fragment key={step.id}>
          <StepTile i={i} p={p} pos={pos} />
          {i < FLOW_STEPS.length - 1 ? <Link i={i} pos={pos} /> : null}
        </Fragment>
      ))}
    </div>
  );
}
