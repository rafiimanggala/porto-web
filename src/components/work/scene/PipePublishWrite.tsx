"use client";

import { motion, useTransform } from "framer-motion";
import { useSeg, useWindow, type MV } from "./HealthSceneParts";
import { NODE } from "./PipeKitData";
import { PipeNode } from "./PipeKitNode";
import { TL } from "./PipePublishData";
import { useGeo } from "./PipePublishGeo";
import { MONO_TXT } from "./PipePublishKit";

/* Write-back: both post ids meet in one node, which writes them into the row. The port marks where the wire enters the sheet. */

const SIDE_GAP = "calc(var(--t) * 0.95 + 6px)";
const PORT_PX = 9;
const PORT_OVERLAP = 0;
const PULSE_SPAN = 0.03;

export function WriteNode({ p }: { p: MV }) {
  const { PT, pctOf } = useGeo();
  const at = pctOf(PT.write);
  const show = useSeg(p, TL.showWrite[0], TL.showWrite[1]);
  const active = useWindow(p, TL.write[1] - 0.01, TL.fields[2][1] + 0.01);
  const done = useSeg(p, TL.fields[2][1], TL.fields[2][1] + 0.02);
  const pulse = useSeg(p, TL.write[1] - 0.004, TL.write[1] + PULSE_SPAN);
  return (
    <motion.div style={{ opacity: show }} className="pointer-events-none absolute inset-0 z-50">
      <PipeNode glyph={NODE.writeback.glyph} size="var(--t)" at={at} active={active} done={done} pulse={pulse} />
      <span
        style={{ left: `calc(50% + ${SIDE_GAP})`, top: `${at[1]}%` }}
        className={`${MONO_TXT} absolute -translate-y-1/2 leading-none text-fg`}
      >
        {NODE.writeback.label}
      </span>
    </motion.div>
  );
}

/** Sits just outside the bottom edge of the sheet card (its parent), centred, with the top of the dot on the border line. */
export function Port({ p }: { p: MV }) {
  const show = useSeg(p, TL.up[0], TL.up[1]);
  const ok = useSeg(p, TL.flip[0], TL.flip[1]);
  const ripple = useSeg(p, TL.up[1] - 0.004, TL.up[1] + PULSE_SPAN);
  const scale = useTransform(ripple, (v) => 1 + 2.2 * v);
  const rippleOpacity = useTransform(ripple, (v) => Math.min(1, v * 14) * (1 - v) * 0.7);
  const place = { left: "50%", top: "100%", marginTop: PORT_PX / 2 - PORT_OVERLAP, width: PORT_PX, height: PORT_PX };
  return (
    <>
      <motion.i aria-hidden style={{ ...place, opacity: show }} className="absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-bg" />
      <motion.i aria-hidden style={{ ...place, opacity: ok }} className="absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-mint bg-mint" />
      <motion.i aria-hidden style={{ ...place, scale, opacity: rippleOpacity }} className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent" />
    </>
  );
}
