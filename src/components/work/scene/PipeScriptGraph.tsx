"use client";

import { motion, useTransform } from "framer-motion";
import { useSeg, useWindow, type MV } from "./HealthSceneParts";
import { PipeNode } from "./PipeKitNode";
import { Pulse, Wire, linePath, loopBackPath, type Pt, type WirePath } from "./PipeKitWire";
import { AH, AW, GRAPH, LAND, NODE_TILE, NODE_Y, RIPPLE_DUR, TL, WIPES, type NodeSpec } from "./PipeScriptData";
import { BULB, PANEL } from "./PipeScriptLayout";
import { segAt } from "./PipeKitMath";
import { ripples, u } from "./PipeScriptKit";

/* The graph row at the foot of the stage: script model, the trends branch (endpoint, keep four), join, caption pass and
   write back. Nodes light up as the story reaches them, wires draw and carry a dot. Coordinates are stage units. */

const at = (x: number): Pt => [x, NODE_Y];
const [SCRIPT_X, TRENDS_X, KEEP_X, JOIN_X, CAPTION_X, WRITE_X] = GRAPH.map((n) => n.x);

const WIRES = {
  link: linePath([BULB[0], PANEL.y + PANEL.h], at(SCRIPT_X)),
  second: linePath([CAPTION_X, PANEL.y + PANEL.h], at(CAPTION_X)),
  trends: linePath(at(TRENDS_X), at(KEEP_X)),
  keep: linePath(at(KEEP_X), at(JOIN_X)),
  arc: loopBackPath(at(SCRIPT_X), at(JOIN_X), { drop: 44, side: "above", reach: 44 }),
  join: linePath(at(JOIN_X), at(CAPTION_X)),
  write: linePath(at(CAPTION_X), at(WRITE_X)),
} as const;

const DRAW = {
  trends: [0.48, 0.53],
  keep: [0.7, 0.755],
  join: [0.8, 0.84],
  write: [0.9, 0.935],
  merge: [0.762, 0.8],
  second: [0.79, 0.82],
  coolArc: [0.815, 0.85],
  coolSecond: [0.91, 0.94],
} as const;

/** A mint overlay that draws over a finished accent wire: once its step is over, the wire no longer looks in progress. */
function Cooled({ path, draw }: { path: WirePath; draw: MV }) {
  const shown = useTransform(draw, (v) => (v > 0.001 ? 1 : 0));
  return (
    <motion.path
      d={path.d}
      fill="none"
      stroke="var(--color-mint)"
      strokeWidth={2}
      strokeLinecap="round"
      style={{ pathLength: draw, opacity: shown }}
    />
  );
}

function GraphNode({ p, n }: { p: MV; n: NodeSpec }) {
  const active = useWindow(p, n.on[0], n.on[1], { last: n.last });
  const done = useSeg(p, n.done[0], n.done[1]);
  const pulse = useTransform(p, (v) => ripples(v, n.ripples, RIPPLE_DUR));
  return (
    <PipeNode
      glyph={n.glyph}
      label={n.label}
      size={u(NODE_TILE)}
      at={[(n.x / AW) * 100, (NODE_Y / AH) * 100]}
      active={active}
      done={done}
      pulse={pulse}
    />
  );
}

export function GraphWires({ p }: { p: MV }) {
  const link = useTransform(p, (v) => segAt(v, TL.link[0], TL.link[1]) * (1 - segAt(v, WIPES[1][0], WIPES[1][1])));
  const second = useSeg(p, DRAW.second[0], DRAW.second[1]);
  const writing = useTransform(p, (v) => ripples(v, GRAPH[4].ripples, RIPPLE_DUR));
  const landing = useTransform(p, (v) => ripples(v, LAND, RIPPLE_DUR));
  const trends = useSeg(p, DRAW.trends[0], DRAW.trends[1]);
  const keep = useSeg(p, DRAW.keep[0], DRAW.keep[1]);
  const arc = useSeg(p, TL.arc[0], TL.arc[1]);
  const merge = useSeg(p, DRAW.merge[0], DRAW.merge[1]);
  const join = useSeg(p, DRAW.join[0], DRAW.join[1]);
  const write = useSeg(p, DRAW.write[0], DRAW.write[1]);
  const coolArc = useSeg(p, DRAW.coolArc[0], DRAW.coolArc[1]);
  const coolSecond = useSeg(p, DRAW.coolSecond[0], DRAW.coolSecond[1]);
  return (
    <svg viewBox={`0 0 ${AW} ${AH}`} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      <Wire path={WIRES.link} draw={link} />
      <Wire path={WIRES.second} draw={second} />
      <Wire path={WIRES.trends} draw={trends} tone="sky" />
      <Wire path={WIRES.keep} draw={keep} tone="sky" />
      <Wire path={WIRES.arc} draw={arc} />
      <Wire path={WIRES.join} draw={join} tone="mint" />
      <Wire path={WIRES.write} draw={write} tone="mint" />
      <Cooled path={WIRES.arc} draw={coolArc} />
      <Cooled path={WIRES.second} draw={coolSecond} />
      <Pulse path={WIRES.link} progress={landing} />
      <Pulse path={WIRES.second} progress={writing} />
      <Pulse path={WIRES.trends} progress={trends} tone="sky" />
      <Pulse path={WIRES.keep} progress={keep} tone="sky" trail={1} />
      <Pulse path={WIRES.arc} progress={arc} trail={2} />
      <Pulse path={WIRES.arc} progress={merge} trail={1} />
      <Pulse path={WIRES.join} progress={join} tone="mint" />
      <Pulse path={WIRES.write} progress={write} tone="mint" />
    </svg>
  );
}

export function GraphNodes({ p }: { p: MV }) {
  return (
    <>
      {GRAPH.map((n) => (
        <GraphNode key={n.label} p={p} n={n} />
      ))}
    </>
  );
}
