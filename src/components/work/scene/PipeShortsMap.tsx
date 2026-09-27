"use client";

import { motion, motionValue, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { NODE } from "./PipeKitData";
import { clamp01 } from "./PipeKitMath";
import { PipeNode } from "./PipeKitNode";
import { Pulse, Wire, linePath, type WirePath } from "./PipeKitWire";
import {
  COLS, DONE_AT, FH, FRESH_COUNT, FW, HEADERS, HOPS, LANES, LANE_Y, NS, REST_AT, REUSED, SHARED, SPANS, TL, laneY, sweepAt,
  type LaneId, type LaneNode,
} from "./PipeShortsData";
import { Gate, Pill, boxStyle, pctX, pctY, pointPct, unit } from "./PipeShortsKit";
import { seg, useSpans } from "./PipeShortsMath";

/* The map: the long-form backbone above, the shorts lane below, tethers between the nodes both lanes share. It opens tall
   (full labels, headers, legend) and docks to a compact strip at the top while the stage below tells each step. */

const OFF = motionValue(0);
const NO_SPANS: readonly [number, number][] = [];
const RAIL_TONE = { a: "sky", b: "mint" } as const;
const HOP_TONE = { a: "sky", b: "mint" } as const;
const LABEL_FADE = 4;
const PILL_SHIFT = 11;
const RING_PAD = 10;
const CHIP_SNAP = 8;
const LABEL_GAP = 8;

const railsOf = (lane: LaneId): readonly WirePath[] =>
  LANES[lane].slice(1).map((node, i) => linePath([COLS[LANES[lane][i].col], LANE_Y[lane].full], [COLS[node.col], LANE_Y[lane].full]));
const RAILS: Readonly<Record<LaneId, readonly WirePath[]>> = { a: railsOf("a"), b: railsOf("b") };
const BUILD = { a: TL.laneA, b: TL.laneB } as const;
const nodeAt = (lane: LaneId, index: number) => BUILD[lane].at + index * BUILD[lane].step;
const HEADER_ON = { a: [REST_AT, REST_AT + 0.02], b: [TL.laneB.at, TL.laneB.at + 0.016] } as const;

/* ---------- Rails between the nodes of one lane ---------- */

function Rail({ p, lane, index, path }: { p: MV; lane: LaneId; index: number; path: WirePath }) {
  const t = BUILD[lane];
  const at = t.at + index * t.step + 0.005;
  const draw = useSeg(p, at, at + t.step * 1.6);
  const hop = HOPS[index];
  const ride = useSeg(p, hop ? hop[0] : 2, hop ? hop[1] : 2.01);
  return (
    <Gate p={p} at={at}>
      <Wire path={path} draw={draw} tone={RAIL_TONE[lane]} />
      <Pulse path={path} progress={draw} tone={HOP_TONE[lane]} />
      {lane === "b" ? <Pulse path={path} progress={ride} tone="accent" trail={1} /> : null}
    </Gate>
  );
}

/* ---------- One node, with its label, its shorts-only mark and its check ---------- */

function NodeLabel({ text, x, y, above, active, fade }: { text: string; x: number; y: number; above: boolean; active: MV; fade: MV }) {
  const top = above ? y - NS / 2 - LABEL_GAP : y + NS / 2 + LABEL_GAP;
  return (
    <motion.span style={{ opacity: fade, left: pctX(x), top: pctY(top) }} className={`absolute -translate-x-1/2 whitespace-nowrap leading-none ${above ? "-translate-y-full" : ""}`}>
      <span className="text-mute">{text}</span>
      <motion.span style={{ opacity: active }} className="absolute inset-0 text-fg">
        {text}
      </motion.span>
    </motion.span>
  );
}

function FreshMark({ p, dock, x, y }: { p: MV; dock: MV; x: number; y: number }) {
  const on = useSeg(p, TL.fresh[0], TL.fresh[1], easeOutCubic);
  const tag = useTransform([on, dock], ([o, d]: number[]) => o * (1 - clamp01(d * LABEL_FADE)));
  return (
    <>
      <motion.i
        aria-hidden
        style={{ opacity: on, left: pctX(x), top: pctY(y), width: unit(NS + RING_PAD), height: unit(NS + RING_PAD), borderRadius: unit(NS * 0.24 + RING_PAD / 2) }}
        className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-accent"
      />
      <motion.span style={{ opacity: tag, left: pctX(x), top: pctY(y + NS / 2 + LABEL_GAP + 15) }} className="absolute -translate-x-1/2">
        <Pill tone="accent">new</Pill>
      </motion.span>
    </>
  );
}

type MapNodeProps = { p: MV; dock: MV; lane: LaneId; node: LaneNode; index: number };

function MapNode({ p, dock, lane, node, index }: MapNodeProps) {
  const def = NODE[node.id];
  const popAt = nodeAt(lane, index);
  const pop = useSeg(p, popAt, popAt + 0.02, easeOutCubic);
  const rise = useTransform(pop, (v) => `${((1 - v) * 1.6).toFixed(2)}%`);
  const active = useSpans(p, SPANS[lane][node.id] ?? NO_SPANS);
  const doneAt = DONE_AT[node.id] ?? 2;
  const doneRaw = useSeg(p, doneAt, doneAt + 0.012);
  const showDone = lane === "b" || SHARED.includes(node.col);
  const labelFade = useTransform(dock, (d) => (lane === "a" ? 1 - clamp01(d * LABEL_FADE) : 1));
  const x = COLS[node.col];
  const y = LANE_Y[lane].full;
  return (
    <motion.div style={{ opacity: pop, y: rise }} className="pointer-events-none absolute inset-0">
      {node.fresh ? <FreshMark p={p} dock={dock} x={x} y={y} /> : null}
      <PipeNode glyph={def.glyph} size={unit(NS)} at={pointPct(x, y)} active={active} done={showDone ? doneRaw : OFF} />
      <NodeLabel text={def.label} x={x} y={y} above={lane === "a"} active={active} fade={labelFade} />
    </motion.div>
  );
}

/* ---------- Lane headers: title on the left, the lane's own numbers on the right, both above their lane. The shorts one sits in
   the gap the tethers cross, so its two texts carry the page colour and the tethers pass behind them. ---------- */

const HEADER_Y = { a: { text: -56, rule: -40 }, b: { text: -50, rule: -34 } } as const;
const EDGE_X = 8;

function Header({ lane, hdr }: { lane: LaneId; hdr: MV }) {
  const h = HEADERS[lane];
  const at = HEADER_Y[lane];
  const full = LANE_Y[lane].full;
  return (
    <motion.div style={{ opacity: hdr }} className="absolute inset-0">
      <i aria-hidden style={boxStyle(EDGE_X, full + at.rule, FW - EDGE_X * 2, 1)} className="absolute bg-line-strong" />
      <div style={{ left: pctX(EDGE_X), right: pctX(EDGE_X), top: pctY(full + at.text) }} className="absolute flex items-baseline justify-between whitespace-nowrap">
        <span className="bg-bg pr-[0.6em] uppercase tracking-[0.12em] text-fg">{h.title}</span>
        <span className="bg-bg pl-[0.6em] text-mute">{h.data}</span>
      </div>
    </motion.div>
  );
}

function Lane({ p, dock, lane }: { p: MV; dock: MV; lane: LaneId }) {
  const y = LANE_Y[lane];
  const shift = useTransform(dock, (d) => pctY((y.dock - y.full) * d));
  const hdr = useTransform(p, (v) => seg(v, HEADER_ON[lane][0], HEADER_ON[lane][1]) * (1 - seg(v, TL.headersOff[0], TL.headersOff[1])));
  return (
    <motion.div style={{ y: shift }} className="pointer-events-none absolute inset-0">
      <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {RAILS[lane].map((path, i) => (
          <Rail key={path.d} p={p} lane={lane} index={i} path={path} />
        ))}
      </svg>
      <Header lane={lane} hdr={hdr} />
      {LANES[lane].map((node, i) => (
        <MapNode key={`${node.id}-${node.col}`} p={p} dock={dock} lane={lane} node={node} index={i} />
      ))}
    </motion.div>
  );
}

/* ---------- Tethers: the same node in both lanes ---------- */

function Tether({ p, dock, k }: { p: MV; dock: MV; k: number }) {
  const col = SHARED[k];
  const x = COLS[col];
  const node = LANES.b.find((n) => n.col === col);
  const draw = useSeg(p, sweepAt(k), sweepAt(k) + TL.sweep.dur);
  const lit = useSpans(p, (node && SPANS.b[node.id]) || NO_SPANS);
  const top = useTransform(dock, (d) => laneY("a", d) + NS / 2);
  const bottom = useTransform(dock, (d) => laneY("b", d) - NS / 2);
  const end = useTransform([top, bottom, draw], ([a, b, t]: number[]) => a + (b - a) * t);
  const glow = useTransform([draw, lit], ([d, l]: number[]) => (d > 0.001 ? 0.45 + 0.55 * l : 0));
  const at = TL.laneB.at + LANES.b.findIndex((n) => n.col === col) * TL.laneB.step + 0.01;
  return (
    <Gate p={p} at={at}>
      <motion.line x1={x} x2={x} y1={top} y2={bottom} stroke="var(--color-line-strong)" strokeWidth={2} strokeDasharray="3 5" strokeLinecap="round" />
      <motion.line x1={x} x2={x} y1={top} y2={end} stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" style={{ opacity: glow }} />
    </Gate>
  );
}

function ReusedTag({ p, dock, k }: { p: MV; dock: MV; k: number }) {
  const on = useSeg(p, sweepAt(k) + 0.006, sweepAt(k) + TL.sweep.dur + 0.004, easeOutCubic);
  const vis = useTransform([on, dock], ([o, d]: number[]) => o * (1 - clamp01(d * LABEL_FADE)));
  const opacity = useTransform(vis, (v) => clamp01(v * CHIP_SNAP));
  const y = useTransform(vis, (v) => `${((1 - v) * 40).toFixed(1)}%`);
  const top = useTransform(dock, (d) => pctY((laneY("a", d) + laneY("b", d)) / 2 + (k % 2 === 0 ? -PILL_SHIFT : PILL_SHIFT)));
  return (
    <motion.span style={{ opacity, y, left: pctX(COLS[SHARED[k]]), top }} className="absolute -translate-x-1/2 -translate-y-1/2">
      <Pill>reused</Pill>
    </motion.span>
  );
}

/* Once the headers are gone, a tag says which lane is which. The long-form tag sits on its row, in the gap the lane has where
   the shorts nodes are. The shorts tag straddles the top of the dashed shorts only nodes, right on its own lane, and both
   take the colour of their lane's wire. Chips never scale, so their text is never below its size. */
const TAG_X = (COLS[3] + COLS[4]) / 2;
const TAG_UP = NS / 2 + 8;

function LaneTags({ p, dock }: { p: MV; dock: MV }) {
  const raw = useSeg(p, TL.laneTag[0], TL.laneTag[1]);
  const on = useTransform(raw, (v) => clamp01(v * CHIP_SNAP));
  const y = useTransform(raw, (v) => `${((1 - v) * 40).toFixed(1)}%`);
  const topA = useTransform(dock, (d) => pctY(laneY("a", d)));
  const topB = useTransform(dock, (d) => pctY(laneY("b", d) - TAG_UP));
  const cls = "absolute -translate-x-1/2 -translate-y-1/2";
  return (
    <>
      <motion.span style={{ opacity: on, y, left: pctX(TAG_X), top: topA }} className={cls}>
        <Pill tone="sky">{HEADERS.a.tag}</Pill>
      </motion.span>
      <motion.span style={{ opacity: on, y, left: pctX(TAG_X), top: topB }} className={cls}>
        <Pill tone="mint">{HEADERS.b.tag}</Pill>
      </motion.span>
    </>
  );
}

const LEGEND_Y = 340;

function LegendItem({ dashed, text, x, on }: { dashed: boolean; text: string; x: number; on: MV }) {
  const tile = dashed ? "border-2 border-dashed border-accent bg-surface-2" : "border border-line-strong bg-surface-2";
  return (
    <motion.div style={{ opacity: on, left: pctX(x), top: pctY(LEGEND_Y) }} className="absolute flex items-center gap-[0.6em] whitespace-nowrap text-dim">
      <i aria-hidden style={{ width: unit(16), height: unit(16), borderRadius: unit(4) }} className={`block ${tile}`} />
      {text}
    </motion.div>
  );
}

function Legend({ p, dock }: { p: MV; dock: MV }) {
  const on = useTransform([p, dock], ([v, d]: number[]) => seg(v, TL.legend[0], TL.legend[1]) * (1 - clamp01(d * LABEL_FADE)));
  return (
    <>
      <LegendItem dashed={false} text={`${REUSED} nodes reused`} x={EDGE_X} on={on} />
      <LegendItem dashed text={`${FRESH_COUNT} shorts only`} x={FW / 2 + 12} on={on} />
    </>
  );
}

export default function LaneMap({ p }: { p: MV }) {
  const dock = useSeg(p, TL.dock[0], TL.dock[1], easeInOutCubic);
  return (
    <>
      <svg viewBox={`0 0 ${FW} ${FH}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {SHARED.map((col, k) => (
          <Tether key={col} p={p} dock={dock} k={k} />
        ))}
      </svg>
      <Lane p={p} dock={dock} lane="a" />
      <Lane p={p} dock={dock} lane="b" />
      {SHARED.map((col, k) => (
        <ReusedTag key={col} p={p} dock={dock} k={k} />
      ))}
      <LaneTags p={p} dock={dock} />
      <Legend p={p} dock={dock} />
    </>
  );
}
