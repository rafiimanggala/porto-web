"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CHIP, TL, colX, type TreeNode, type Variant } from "./EduVariantsSceneData";
import { useGeo, type Geo } from "./EduVariantsSceneGeo";
import { CrossMark } from "./EduVariantsSceneIcons";
import { bump, keys, lerp, seg, tint, topicCount, treeStart, type Pt } from "./EduVariantsSceneKit";

/* Seven topic trees. Each variant grows its own shape, node by node, from the
   chip it hangs under. Every branch is a child component driven by the tree's
   own growth value, so nothing is timed by hand. */

const LEAF_R = 2.2;
const NODE_R = 3;
const ROOT_R = 3.6;
const STEM_WIN = [0, 0.28] as const;

const nodePoint = (G: Geo, cx: number, [, dx, lv]: TreeNode): Pt => [cx + dx, G.treeTop + lv * G.treeGap];

/* A branch grows in a window set by its depth, so shallow trees finish first. */
const edgeWindow = (lv: number, maxLv: number): readonly [number, number] => {
  const start = 0.18 + ((lv - 1) / maxLv) * 0.5;
  return [start, start + 0.32];
};

type BranchProps = { g: MV; from: Pt; to: Pt; win: readonly [number, number]; r: number; color: string };

function Branch({ g, from, to, win, r, color }: BranchProps) {
  const t = useTransform(g, (v) => seg(v, win[0], win[1], easeOutCubic));
  const x2 = useTransform(t, (v) => lerp(from[0], to[0], v));
  const y2 = useTransform(t, (v) => lerp(from[1], to[1], v));
  const rr = useTransform(t, (v) => r * seg(v, 0.65, 1, easeOutBack));
  const shown = useTransform(t, (v) => (v > 0 ? 1 : 0));
  return (
    <>
      <motion.line x1={from[0]} y1={from[1]} x2={x2} y2={y2} strokeWidth={1.4} strokeLinecap="round" style={{ opacity: shown }} className="stroke-fg/60" />
      <motion.circle cx={to[0]} cy={to[1]} r={rr} strokeWidth={1.2} className="stroke-fg" style={{ fill: tint(color, 70) }} />
    </>
  );
}

/* The counters wait until three trees exist, so none floats alone, then each
   one lifts and warms in turn as a sweep runs left to right over the trees. */
function TreeCount({ p, i, g }: { p: MV; i: number; g: MV }) {
  const G = useGeo();
  const a = TL.sweep.start + i * TL.sweep.step;
  const opacity = useTransform([g, p], ([gv, v]: number[]) => seg(gv, 0.15, 0.4) * seg(v, TL.counts[0], TL.counts[1]));
  const count = useTransform(p, (v) => String(topicCount(v, i)));
  const lift = useTransform(p, (v) => -3.2 * bump(v, a, TL.sweep.dur));
  const warm = useTransform(p, (v) => `color-mix(in oklab, var(--color-accent) ${Math.round(bump(v, a, TL.sweep.dur) * 100)}%, var(--color-fg))`);
  return (
    <motion.g style={{ opacity }} textAnchor="middle">
      <motion.text x={colX(i)} y={G.countY} fontSize={G.fs.m} style={{ y: lift, fill: warm }} className={`${MONO} tabular-nums`}>
        {count}
      </motion.text>
      <text x={colX(i)} y={G.countY + G.fs.s * 1.15} fontSize={G.fs.s} className={`${MONO} fill-mute`}>
        topics
      </text>
    </motion.g>
  );
}

export function Tree({ p, v, i }: { p: MV; v: Variant; i: number }) {
  const G = useGeo();
  const g = useSeg(p, treeStart(i), treeStart(i) + TL.tree.dur);
  const cx = colX(i);
  const pts = v.tree.map((n) => nodePoint(G, cx, n));
  const maxLv = Math.max(...v.tree.map((n) => n[2]));
  const parents = new Set(v.tree.map((n) => n[0]));
  return (
    <g>
      <Branch g={g} from={[cx, G.chipY + CHIP.h / 2]} to={pts[0]} win={STEM_WIN} r={ROOT_R} color={v.color} />
      {v.tree.slice(1).map(([parent, , lv], j) => (
        <Branch
          key={j}
          g={g}
          from={pts[parent]}
          to={pts[j + 1]}
          win={edgeWindow(lv, maxLv)}
          r={parents.has(j + 1) ? NODE_R : LEAF_R}
          color={v.color}
        />
      ))}
      <TreeCount p={p} i={i} g={g} />
    </g>
  );
}

/* The "no fit" beat. A copy of a Stage 1 topic is dragged along the empty lane
   between two rows of nodes into the gutter beside the Stage 2 tree, reaches for
   a Stage 2 parent with a rose dashed link, is refused with a rose cross, and
   slides home into the node it came from. Every key below is a fraction of the
   beat window, so the whole thing scales with `TL.ghost`. */
const GHOST_R = 5;
const MOVE_XS = [0, 0.1, 0.4, 0.66, 0.92];
const MOVE_YS = [0, 0, 1, 1, 0];
const LINK_IN = [0.4, 0.52] as const;
const LINK_OUT = [0.66, 0.78] as const;
const MARK_IN = [0.44, 0.55] as const;
const MARK_OUT = [0.66, 0.72] as const;
const SHAKE = [0.44, 0.66] as const;
const ABSORB = [0.92, 1] as const;
const MARK_R = 9;

type GhostPts = { src: Pt; gut: Pt; tgt: Pt; lane: number };

function ghostPoints(G: Geo): GhostPts {
  const gx = (colX(4) + 10 + colX(5) - 9) / 2;
  const lane = G.treeTop + 2.5 * G.treeGap;
  return { src: nodePoint(G, colX(3), [3, 14, 2]), gut: [gx, lane], tgt: nodePoint(G, colX(4), [0, 10, 1]), lane };
}

const shakeAt = (f: number) => Math.sin(seg(f, SHAKE[0], SHAKE[1]) * Math.PI * 5) * 2.4 * (1 - seg(f, SHAKE[0], SHAKE[1]));
const moveAt = (f: number) => keys(f, MOVE_XS, MOVE_YS, easeInOutCubic);

function GhostDot({ f, pts }: { f: MV; pts: GhostPts }) {
  const x = useTransform(f, (v) => lerp(pts.src[0], pts.gut[0], moveAt(v)) + shakeAt(v));
  const y = useTransform(f, (v) => lerp(pts.src[1], pts.lane, easeOutCubic(seg(moveAt(v), 0, 0.35))));
  const opacity = useTransform(f, (v) => seg(v, 0, 0.1) * (1 - seg(v, 0.96, 1)));
  const scale = useTransform(f, (v) => lerp(0.4, 1, seg(v, 0, 0.1)) * lerp(1, 0.44, seg(v, ABSORB[0], ABSORB[1], easeInOutCubic)));
  return (
    <motion.g style={{ x, y, opacity, scale }}>
      <circle r={GHOST_R} strokeWidth={1.4} className="fill-accent stroke-fg" />
    </motion.g>
  );
}

function GhostLink({ f, pts }: { f: MV; pts: GhostPts }) {
  const draw = useTransform(f, (v) => seg(v, LINK_IN[0], LINK_IN[1], easeOutCubic) * (1 - seg(v, LINK_OUT[0], LINK_OUT[1])));
  const x2 = useTransform(draw, (d) => lerp(pts.gut[0], pts.tgt[0], d));
  const y2 = useTransform(draw, (d) => lerp(pts.gut[1], pts.tgt[1], d));
  const ring = useTransform(f, (v) => seg(v, MARK_IN[0], 0.6, easeOutCubic));
  const ringR = useTransform(ring, (r) => 3.5 + 5.5 * r);
  const ringO = useTransform(f, (v) => seg(v, MARK_IN[0], 0.52) * (1 - seg(v, LINK_OUT[0], 0.74)));
  return (
    <>
      <motion.line x1={pts.gut[0]} y1={pts.gut[1]} x2={x2} y2={y2} strokeWidth={2} strokeLinecap="round" strokeDasharray="4 3.5" style={{ opacity: draw }} className="stroke-rose" />
      <motion.circle cx={pts.tgt[0]} cy={pts.tgt[1]} r={ringR} fill="none" strokeWidth={1.8} style={{ opacity: ringO }} className="stroke-rose" />
    </>
  );
}

function GhostMark({ f, pts }: { f: MV; pts: GhostPts }) {
  const pop = useTransform(f, (v) => seg(v, MARK_IN[0], MARK_IN[1]));
  const opacity = useTransform(f, (v) => seg(v, MARK_IN[0], MARK_IN[0] + 0.03) * (1 - seg(v, MARK_OUT[0], MARK_OUT[1])));
  const scale = useTransform(pop, (r) => 0.4 + 0.6 * easeOutBack(r));
  const x = useTransform(f, (v) => pts.gut[0] + shakeAt(v));
  return (
    <motion.g style={{ x, y: pts.gut[1], opacity, scale }}>
      <circle r={MARK_R} strokeWidth={1.6} style={{ fill: "var(--color-surface-1)", stroke: "var(--color-rose)" }} />
      <g transform="scale(1.35)">
        <CrossMark color="var(--color-rose)" />
      </g>
    </motion.g>
  );
}

/* A soft ring where the copy lifts off, so the origin reads as the source. */
function SourceRing({ f, pts }: { f: MV; pts: GhostPts }) {
  const t = useTransform(f, (v) => seg(v, 0, 0.14, easeOutCubic));
  const r = useTransform(t, (v) => 3 + 7 * v);
  const opacity = useTransform(f, (v) => 0.8 * seg(v, 0, 0.02) * (1 - seg(v, 0, 0.14, easeOutCubic)));
  return <motion.circle cx={pts.src[0]} cy={pts.src[1]} r={r} fill="none" strokeWidth={1.6} style={{ opacity }} className="stroke-accent" />;
}

export function GhostCopy({ p }: { p: MV }) {
  const G = useGeo();
  const pts = ghostPoints(G);
  const f = useTransform(p, (v) => seg(v, TL.ghost[0], TL.ghost[1]));
  return (
    <>
      <SourceRing f={f} pts={pts} />
      <GhostLink f={f} pts={pts} />
      <GhostDot f={f} pts={pts} />
      <GhostMark f={f} pts={pts} />
    </>
  );
}
