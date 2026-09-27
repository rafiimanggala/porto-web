"use client";

import { motion, useTransform } from "framer-motion";
import { useSeg, useWindow, type MV } from "./HealthSceneParts";
import { PipeNode } from "./PipeKitNode";
import { STRIP, NODE_WINDOWS, TL } from "./PipeVoiceData";

/* Node row: each hop draws its wire and sends a dot. */

const TILE = "clamp(30px, 8.6cqw, 44px)";
const HOPS = STRIP.length - 1;
const DOT = 7;

const fade = (v: number) => Math.max(0, Math.min(1, v * 24, (1 - v) * 24));

function Dot({ draw, axis }: { draw: MV; axis: "x" | "y" }) {
  const pos = useTransform(draw, (v) => `${(v * 100).toFixed(2)}%`);
  const opacity = useTransform(draw, fade);
  const place = axis === "x" ? { left: pos, top: "50%" } : { top: pos, left: "50%" };
  return <motion.i aria-hidden style={{ ...place, opacity, width: DOT, height: DOT }} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bg bg-accent" />;
}

function Hop({ i, p }: { i: number; p: MV }) {
  const draw = useSeg(p, TL.hop[i][0], TL.hop[i][1]);
  return (
    <span className="absolute inset-y-0" style={{ left: `${(i / HOPS) * 100}%`, width: `${100 / HOPS}%` }}>
      <motion.i style={{ scaleX: draw }} className="absolute inset-0 origin-left rounded-full bg-accent" />
      <Dot draw={draw} axis="x" />
    </span>
  );
}

function StripNode({ i, p }: { i: number; p: MV }) {
  const w = NODE_WINDOWS[i];
  const active = useWindow(p, w.on[0], w.on[1], { first: w.first, last: w.last });
  const done = useSeg(p, w.done, w.done + 0.02);
  const pulse = useSeg(p, w.on[0] + 0.005, w.on[0] + 0.05);
  const def = STRIP[i];
  return <PipeNode glyph={def.glyph} label={def.label} size={TILE} active={active} done={done} pulse={pulse} />;
}

function Inlet({ p }: { p: MV }) {
  const draw = useSeg(p, TL.inlet[0], TL.inlet[1]);
  return (
    <span aria-hidden className="absolute w-0.5 -translate-x-1/2 bg-line-strong" style={{ left: `calc(${TILE} / 2)`, top: "calc(var(--gap) * -1)", height: "var(--gap)" }}>
      <motion.i style={{ scaleY: draw }} className="absolute inset-0 origin-top rounded-full bg-accent" />
      <Dot draw={draw} axis="y" />
    </span>
  );
}

export default function Strip({ p }: { p: MV }) {
  return (
    <div className="relative shrink-0 pb-[18px]">
      <div aria-hidden className="absolute h-0.5 bg-line-strong" style={{ left: `calc(${TILE} / 2)`, right: `calc(${TILE} / 2)`, top: `calc(${TILE} / 2 - 1px)` }}>
        {Array.from({ length: HOPS }, (_, i) => (
          <Hop key={i} i={i} p={p} />
        ))}
      </div>
      <Inlet p={p} />
      <div className="relative flex justify-between">
        {STRIP.map((n, i) => (
          <StripNode key={`${n.label}-${i}`} i={i} p={p} />
        ))}
      </div>
    </div>
  );
}
