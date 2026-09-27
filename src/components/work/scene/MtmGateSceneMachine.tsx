"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { clamp01, mixColor, toneTint } from "./MtmKitMath";
import { BAIL_LABEL, NODES, NODE_GLYPHS, RAIL_LABELS, T } from "./MtmGateSceneData";
import { at, movesAt, refuseAt, shakeAt, snap, tokenX, tokenY } from "./MtmGateSceneMath";

/* The gate as a small state machine: four states on a rail, a token that rides the transitions and the bail out loop that
   snaps it back to locked. The token position is the only state, everything else is derived from it. */

const CELL = 25;
const CENTER0 = 12.5;
const NODE = 28;
const ROW_TOP = 18;
const RAIL_Y = ROW_TOP + NODE / 2;
const ARC_Y = 2;
const LEG = ROW_TOP - ARC_Y;
const INNER_H = 66;
const TOKEN = 10;
/* The token melts into a node before it reaches the ring, so it never sits on the icon. Distances are in cells (x) and rail heights (y). */
const MELT_X = 0.2;
const MELT_Y = 0.55;
const MELT_RAMP = 0.1;
const SEAM = 3;
const LOOP_LEFT = `${CENTER0}%`;
const LOOP_RIGHT = `${CENTER0 + CELL * 2}%`;
const FG = "var(--color-fg)";
const MUTE = "var(--color-mute)";
const LINE = "var(--color-line-strong)";
const ACCENT = "var(--color-accent)";

const centerOf = (i: number) => `${CENTER0 + CELL * i}%`;

function LockedFx({ p }: { p: MV }) {
  const refuse = useTransform(p, refuseAt);
  const land = useSeg(p, T.land[0], T.land[1], easeOutCubic);
  const landOn = useTransform(land, (t) => (t > 0 && t < 1 ? (1 - t) * 0.7 : 0));
  const landScale = useTransform(land, (t) => 1 + 0.9 * t);
  return (
    <>
      <motion.i style={{ opacity: refuse }} className="absolute -inset-[5px] rounded-full border-2 border-rose" />
      <motion.i style={{ opacity: landOn, scale: landScale }} className="absolute -inset-[1.5px] rounded-full border-2 border-accent" />
    </>
  );
}

function NodeView({ i, p, tx, ty }: { i: number; p: MV; tx: MV; ty: MV }) {
  const lit = useTransform([tx, ty], ([x, y]: number[]) => clamp01(1 - Math.abs(x - i) * 2.5) * clamp01(1 + y * 4));
  const color = useTransform(lit, (l) => mixColor(FG, l, MUTE));
  const x = useTransform(p, (v) => (i === 0 ? shakeAt(v) * 0.5 : 0));
  return (
    <motion.div style={{ x, left: `${CELL * i}%`, paddingTop: ROW_TOP }} className="absolute top-0 flex w-1/4 flex-col items-center">
      <span className="relative grid place-items-center rounded-full border-[1.5px] border-line-strong bg-surface-2" style={{ width: NODE, height: NODE }}>
        <motion.i style={{ opacity: lit }} className="absolute -inset-[1.5px] rounded-full border-2 border-accent bg-accent/15" />
        <span className="relative">
          <MtmGlyph name={NODE_GLYPHS[i]} size={16} />
        </span>
        {i === 0 ? <LockedFx p={p} /> : null}
      </span>
      <motion.span style={{ color }} className={`${MONO} mt-1 text-[10px] leading-3`}>
        {NODES[i].name}
      </motion.span>
    </motion.div>
  );
}

function RailSeg({ i, tx }: { i: number; tx: MV }) {
  const fill = useTransform(tx, (x) => clamp01(x - i));
  const arrow = useTransform(fill, (f) => mixColor(ACCENT, f, LINE));
  const label = useTransform(fill, (f) => mixColor(FG, f, MUTE));
  return (
    <div
      className="absolute"
      style={{ left: `calc(${centerOf(i)} + ${NODE / 2 + SEAM}px)`, width: `calc(${CELL}% - ${NODE + 2 * SEAM}px)`, top: RAIL_Y - 1, height: 2 }}
    >
      <i className="absolute inset-0 rounded-full bg-line-strong" />
      <motion.i style={{ scaleX: fill }} className="absolute inset-0 origin-left rounded-full bg-accent" />
      <motion.i style={{ background: arrow }} className="absolute right-0 top-1/2 h-2 w-[6px] -translate-y-1/2 [clip-path:polygon(0_0,100%_50%,0_100%)]" />
      <motion.span style={{ color: label }} className={`${MONO} absolute bottom-[5px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] leading-3`}>
        {RAIL_LABELS[i]}
      </motion.span>
    </div>
  );
}

const DASH = "border-dashed border-line-strong";

const LOOP_RIGHT_INSET = `${100 - CENTER0 - CELL * 2}%`;
const ARROW_ON = 0.001;
const TRAIL_LEFT_LIT = 0.35;
const LABEL_LEFT_LIT = 0.45;
const fadeAt = (v: number) => 1 - (1 - TRAIL_LEFT_LIT) * at(v, T.trail);

function LoopTrail({ p }: { p: MV }) {
  const up = useSeg(p, T.bail.up[0], T.bail.up[1], easeOutCubic);
  const run = useTransform(p, (v) => Math.min(1, snap(at(v, T.bail.run))));
  const down = useTransform(p, (v) => Math.min(1, snap(at(v, T.bail.down))));
  const arrow = useTransform(down, (d) => (d > ARROW_ON ? 1 : 0));
  const fade = useTransform(p, fadeAt);
  return (
    <motion.div style={{ opacity: fade }} className="absolute inset-0">
      <motion.i style={{ scaleY: up, left: LOOP_RIGHT, top: ARC_Y, height: LEG, marginLeft: -1 }} className="absolute w-0.5 origin-bottom bg-accent" />
      <motion.i style={{ scaleX: run, left: LOOP_LEFT, right: LOOP_RIGHT_INSET, top: ARC_Y - 1 }} className="absolute h-0.5 origin-right bg-accent" />
      <motion.i style={{ scaleY: down, left: LOOP_LEFT, top: ARC_Y, height: LEG, marginLeft: -1 }} className="absolute w-0.5 origin-top bg-accent" />
      <motion.i
        style={{ opacity: arrow, left: LOOP_LEFT, top: ROW_TOP - 7, marginLeft: -3 }}
        className="absolute h-[6px] w-2 bg-accent [clip-path:polygon(0_0,100%_0,50%_100%)]"
      />
    </motion.div>
  );
}

function Loop({ p }: { p: MV }) {
  const run = useTransform(p, (v) => Math.min(1, snap(at(v, T.bail.run))) * (1 - (1 - LABEL_LEFT_LIT) * at(v, T.trail)));
  const label = useTransform(run, (t) => mixColor(ACCENT, t, MUTE));
  return (
    <>
      <i className={`absolute border-l-2 ${DASH}`} style={{ left: LOOP_RIGHT, top: ARC_Y, height: LEG, marginLeft: -1 }} />
      <i className={`absolute border-t-2 ${DASH}`} style={{ left: LOOP_LEFT, right: LOOP_RIGHT_INSET, top: ARC_Y - 1 }} />
      <i className={`absolute border-l-2 ${DASH}`} style={{ left: LOOP_LEFT, top: ARC_Y, height: LEG, marginLeft: -1 }} />
      <LoopTrail p={p} />
      <motion.span
        style={{ color: label, left: `${CENTER0 + CELL}%`, top: ARC_Y }}
        className={`${MONO} absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-surface-1 px-1.5 text-[10px] leading-3`}
      >
        {BAIL_LABEL}
      </motion.span>
    </>
  );
}

function Token({ tx, ty }: { tx: MV; ty: MV }) {
  const left = useTransform(tx, (x) => `${CENTER0 + CELL * x}%`);
  const top = useTransform(ty, (y) => RAIL_Y + y * (RAIL_Y - ARC_Y) - TOKEN / 2);
  const opacity = useTransform([tx, ty], ([x, y]: number[]) =>
    Math.max(clamp01((Math.abs(x - Math.round(x)) - MELT_X) / MELT_RAMP), clamp01((Math.abs(y) - MELT_Y) / MELT_RAMP)),
  );
  return (
    <motion.i
      aria-hidden
      style={{ left, top, opacity, width: TOKEN, height: TOKEN, marginLeft: -TOKEN / 2 }}
      className="absolute z-10 rounded-full bg-accent shadow-[0_0_0_2px_var(--color-surface-1)]"
    />
  );
}

/* The bail out left nothing broken: the "broken 0" readout gets a mint pill and a single pulse once the loop has landed. */
function Counter({ p }: { p: MV }) {
  const moves = useTransform(p, (v) => String(movesAt(v)));
  const settle = useSeg(p, T.settle[0], T.settle[1], easeOutCubic);
  const fill = useTransform(settle, (t) => toneTint("mint", 0.2 * t));
  const edge = useTransform(settle, (t) => toneTint("mint", 0.75 * t));
  const pulse = useTransform(settle, (t) => (t > 0 && t < 1 ? (1 - t) * 0.8 : 0));
  const grow = useTransform(settle, (t) => 1 + 0.16 * t);
  return (
    <span className={`${MONO} absolute right-0 flex items-center gap-1.5 whitespace-nowrap text-[10px] leading-3 text-mute`} style={{ top: ARC_Y - 7 }}>
      <span>
        moves <motion.span className="tabular-nums text-fg">{moves}</motion.span>
      </span>
      <span className="relative px-1 py-[2px] text-mint">
        <motion.i style={{ background: fill, borderColor: edge }} className="absolute inset-0 rounded-full border" />
        <motion.i style={{ scale: grow, opacity: pulse }} className="absolute inset-0 rounded-full border-2 border-mint" />
        <span className="relative">broken 0</span>
      </span>
    </span>
  );
}

export function Machine({ p }: { p: MV }) {
  const tx = useTransform(p, tokenX);
  const ty = useTransform(p, tokenY);
  return (
    <div className="shrink-0 rounded-xl border border-line-strong bg-surface-1 px-2.5 py-1.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
      <div className="relative" style={{ height: INNER_H }}>
        <Loop p={p} />
        {RAIL_LABELS.map((label, i) => (
          <RailSeg key={label} i={i} tx={tx} />
        ))}
        {NODES.map((node, i) => (
          <NodeView key={node.id} i={i} p={p} tx={tx} ty={ty} />
        ))}
        <Token tx={tx} ty={ty} />
        <Counter p={p} />
      </div>
    </div>
  );
}
