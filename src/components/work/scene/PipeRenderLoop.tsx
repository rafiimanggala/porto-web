"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useSeg, type MV } from "./HealthSceneParts";
import { IMAGE_JOBS, NODE, RENDER, jobLabel } from "./PipeKitData";
import { PipeNode } from "./PipeKitNode";
import type { WirePath } from "./PipeKitPath";
import { Wire } from "./PipeKitWire";
import { FH, FW, INTERIOR, NODE_X, ROW_Y, TILE, TL, WAIT_LABEL_Y } from "./PipeRenderData";
import { FIRE, PROMPT, promptWin } from "./PipeRenderFlight";
import {
  ASKS,
  BUS,
  DECIDES,
  LOOP,
  PASSES,
  RENDER_OUT,
  SEND,
  W_AB,
  W_BC,
  W_IN,
  WAITS,
  busDrawAt,
  drained,
  flowAt,
  imagePolls,
  imagePose,
  insideMax,
  promptPose,
  readyCount,
  renderOutAt,
  renderPolls,
  renderPose,
  renderReadyAt,
  sawAt,
  secondsLeft,
  tentMax,
  type Pass,
  type Pose,
} from "./PipeRenderMath";
import { BIG_TEXT, pctX, pctY, pointPct, unit } from "./PipeRenderKit";

/* The poll row. Job ids ride the wires as dots and vanish under the tiles they pass through. A wire glows while the head
   of the train is on it. Chapter 2 runs the row for the five images, chapter 3 runs it again for the render job. */

const REST = "var(--color-line-strong)";
/* The bus is drawn by several wires laid over one trunk, so it uses the same grey as an opaque colour: translucent strokes would stack brighter. */
const BUS_REST = "color-mix(in oklab, var(--color-fg) 22%, var(--color-bg))";
const TONES = ["var(--color-accent)", "var(--color-sun)", "var(--color-mint)", "var(--color-sky)"] as const;
const DOT_R = 4;
const WAIT_RING = TILE + 12;
/* The caption under a tile sits below the halo rings (the accent ring and the wait ring reach about 27 units out). */
const LABEL_GAP = "[&>span]:mt-[calc(var(--u)*12)]";

function Rest({ path, dashed = false }: { path: WirePath; dashed?: boolean }) {
  return <path d={path.d} fill="none" stroke={REST} strokeWidth={2} strokeLinecap="round" strokeDasharray={dashed ? "3 5" : undefined} />;
}

function Lit({ p, path, passes, tone }: { p: MV; path: WirePath; passes: readonly Pass[]; tone: 0 | 1 | 3 }) {
  const draw = useTransform(p, (v) => flowAt(v, passes).draw);
  const glow = useTransform(p, (v) => flowAt(v, passes).glow);
  const opacity = useTransform([draw, glow], ([d, g]: number[]) => (d > 0.001 ? g : 0));
  return <motion.path d={path.d} fill="none" stroke={TONES[tone]} strokeWidth={2} strokeLinecap="round" style={{ pathLength: draw, opacity }} />;
}

/** Bus wire i: not there until the result of job i travels back along it, then it stays as a quiet wire until the slots leave. */
function BusWire({ p, path, i }: { p: MV; path: WirePath; i: number }) {
  const pathLength = useTransform(p, (v) => busDrawAt(v, i));
  const opacity = useTransform(pathLength, (d) => (d > 0.001 ? 1 : 0));
  return <motion.path d={path.d} fill="none" stroke={BUS_REST} strokeWidth={2} strokeLinecap="round" style={{ pathLength, opacity }} />;
}

function Dot({ pose }: { pose: MotionValue<Pose> }) {
  const cx = useTransform(pose, (q) => q.x);
  const cy = useTransform(pose, (q) => q.y);
  const opacity = useTransform(pose, (q) => q.o);
  const fill = useTransform(pose, (q) => TONES[q.tone]);
  return <motion.circle cx={cx} cy={cy} r={DOT_R} style={{ opacity, fill }} stroke="var(--color-bg)" strokeWidth={1.4} />;
}

function ImageDot({ p, i }: { p: MV; i: number }) {
  return <Dot pose={useTransform(p, (v) => imagePose(v, i))} />;
}

function PromptDot({ p, i }: { p: MV; i: number }) {
  return <Dot pose={useTransform(p, (v) => promptPose(v, i))} />;
}

function RenderDot({ p }: { p: MV }) {
  return <Dot pose={useTransform(p, renderPose)} />;
}

function WaitRing({ p }: { p: MV }) {
  const pathLength = useTransform(p, drained);
  const opacity = useTransform(p, (v) => insideMax(v, WAITS, 0.003));
  const half = WAIT_RING / 2;
  return (
    <motion.rect
      x={NODE_X[1] - half}
      y={ROW_Y - half}
      width={WAIT_RING}
      height={WAIT_RING}
      rx={14}
      fill="none"
      stroke="var(--color-sun)"
      strokeWidth={2}
      strokeLinecap="round"
      style={{ pathLength, opacity }}
    />
  );
}

function Wires({ p }: { p: MV }) {
  const bus = useTransform(p, [TL.morph.from - 0.004, TL.morph.from + 0.02], [1, 0]);
  const panel = useSeg(p, TL.panelIn[0], TL.panelIn[1]);
  const out = useSeg(p, renderOutAt - 0.004, renderOutAt + 0.006);
  const outOn = useTransform(out, [0, 0.15], [0, 1]);
  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <motion.g style={{ opacity: bus }}>
        {BUS.map((b, i) => (
          <BusWire key={IMAGE_JOBS[i].id} p={p} path={b} i={i} />
        ))}
      </motion.g>
      <motion.g style={{ opacity: panel }}>
        <Rest path={SEND} />
      </motion.g>
      <motion.g style={{ opacity: outOn }}>
        <Wire path={RENDER_OUT} draw={out} tone="mint" arrow />
      </motion.g>
      {[W_IN, W_AB, W_BC].map((w, i) => (
        <Rest key={i} path={w} />
      ))}
      <Rest path={LOOP} dashed />
      {PROMPT.map((w, i) => (
        <Lit key={IMAGE_JOBS[i].id} p={p} path={w} passes={PASSES.prompt[i]} tone={3} />
      ))}
      <Lit p={p} path={W_IN} passes={PASSES.in} tone={0} />
      <Lit p={p} path={SEND} passes={PASSES.send} tone={0} />
      <Lit p={p} path={W_AB} passes={PASSES.ab} tone={0} />
      <Lit p={p} path={W_BC} passes={PASSES.bc} tone={0} />
      <Lit p={p} path={LOOP} passes={PASSES.loop} tone={1} />
      <WaitRing p={p} />
      {IMAGE_JOBS.map((j, i) => (
        <PromptDot key={j.id} p={p} i={i} />
      ))}
      {IMAGE_JOBS.map((j, i) => (
        <ImageDot key={j.id} p={p} i={i} />
      ))}
      <RenderDot p={p} />
    </svg>
  );
}

/* ---------- Nodes ---------- */

const size = unit(TILE);
const pos = (i: number) => pointPct(NODE_X[i], ROW_Y);

/* The tile sits in the middle of a wider box (room for the label and badge). The swap wipe runs across the tile only, so its
   edge never shows in the empty margin. */
const WRAP = 30;
const TILE_FROM = ((WRAP - TILE / 2) / (WRAP * 2)) * 100;
const TILE_TO = ((WRAP + TILE / 2) / (WRAP * 2)) * 100;
const ARRIVALS = IMAGE_JOBS.map((_, i) => promptWin(i)[1]);

function FirstNode({ p }: { p: MV }) {
  const swap = useSeg(p, TL.swapNode[0], TL.swapNode[1]);
  const edge = useTransform(swap, (t) => TILE_FROM + (TILE_TO - TILE_FROM) * t);
  const oldClip = useTransform([swap, edge], ([t, e]: number[]) => (t <= 0.001 ? "none" : `inset(-60% -60% -60% ${e.toFixed(2)}%)`));
  const newClip = useTransform([swap, edge], ([t, e]: number[]) => (t >= 0.999 ? "none" : `inset(-60% ${(100 - e).toFixed(2)}% -60% -60%)`));
  const edgeLeft = useTransform(edge, (e) => `${e.toFixed(2)}%`);
  const edgeOn = useTransform(swap, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);
  const fire = useTransform(p, [FIRE[0], FIRE[0] + 0.012, FIRE[1] - 0.006, FIRE[1] + 0.02], [0, 1, 1, 0]);
  const imgPulse = useTransform(p, (v) => sawAt(v, ARRIVALS, 0.032));
  const imgChecked = useSeg(p, FIRE[1] + 0.04, FIRE[1] + 0.06);
  const imgDone = useTransform([imgChecked, swap], ([d, t]: number[]) => d * (1 - t));
  const job = useTransform(p, [TL.send[0] - 0.006, TL.send[0] + 0.004, TL.send[1] + 0.02, TL.send[1] + 0.032], [0, 1, 1, 0]);
  const renPulse = useTransform(p, (v) => sawAt(v, [TL.send[0] + 0.008], 0.03));
  const renDone = useSeg(p, renderReadyAt, renderReadyAt + 0.012);
  const [cx, cy] = [(WRAP / (WRAP * 2)) * 100, (WRAP / (WRAP * 2 + 10)) * 100];
  return (
    <div style={{ left: pctX(NODE_X[0] - WRAP), top: pctY(ROW_Y - WRAP), width: pctX(WRAP * 2), height: pctY(WRAP * 2 + 10) }} className="absolute">
      <motion.div style={{ clipPath: oldClip }} className="absolute inset-0">
        <PipeNode glyph={NODE.imagine.glyph} label={NODE.imagine.label} size={size} at={[cx, cy]} active={fire} pulse={imgPulse} done={imgDone} className={LABEL_GAP} />
      </motion.div>
      <motion.div style={{ clipPath: newClip }} className="absolute inset-0">
        <PipeNode glyph={NODE.render.glyph} label={NODE.render.label} size={size} at={[cx, cy]} active={job} pulse={renPulse} done={renDone} className={LABEL_GAP} />
      </motion.div>
      <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOn, top: "18%", height: "50%" }} className="absolute z-20 w-[2px] -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

function RowNodes({ p }: { p: MV }) {
  const wait = useTransform(p, (v) => insideMax(v, WAITS, 0.004));
  const ask = useTransform(p, (v) => tentMax(v, ASKS, 0.007));
  const decide = useTransform(p, (v) => tentMax(v, DECIDES, 0.007));
  return (
    <>
      <FirstNode p={p} />
      <PipeNode glyph={NODE.wait.glyph} label={NODE.wait.label} size={size} at={pos(1)} active={wait} className={LABEL_GAP} />
      <PipeNode glyph={NODE.result.glyph} label={NODE.result.label} size={size} at={pos(2)} active={ask} className={LABEL_GAP} />
      <PipeNode glyph={NODE.ready.glyph} label={NODE.ready.label} size={size} at={pos(3)} active={decide} className={LABEL_GAP} />
    </>
  );
}

/* ---------- Text that belongs to the loop ---------- */

const CH2 = [0.198, 0.212, TL.morph.from - 0.012, TL.morph.from + 0.006] as const;

function Countdown({ p }: { p: MV }) {
  const chapter = useTransform(p, [...CH2], [0, 1, 1, 0]);
  const waiting = useTransform(p, (v) => insideMax(v, WAITS, 0.004));
  const opacity = useTransform([chapter, waiting], ([c, w]: number[]) => c * w);
  const text = useTransform(p, (v) => `${secondsLeft(v)} s`);
  return (
    <motion.span aria-hidden style={{ opacity, left: pctX(NODE_X[1]), top: pctY(WAIT_LABEL_Y) }} className="absolute -translate-x-1/2 whitespace-nowrap text-sun">
      {text}
    </motion.span>
  );
}

function Interior({ p }: { p: MV }) {
  const imgOn = useTransform(p, [...CH2], [0, 1, 1, 0]);
  const renOn = useTransform(p, [TL.send[1] - 0.004, TL.send[1] + 0.01], [0, 1]);
  const imgTop = useTransform(p, (v) => `poll ${imagePolls(v)}`);
  const imgSub = useTransform(p, (v) => `${readyCount(v)} ready, ${IMAGE_JOBS.length - readyCount(v)} waiting`);
  const renTop = useTransform(p, (v) => `poll ${renderPolls(v)}`);
  const renSub = useTransform(p, (v) => `${jobLabel(RENDER.jobId)}: ${v >= renderReadyAt ? "ready" : "not ready"}`);
  const at = { left: pctX(INTERIOR.x), top: pctY(INTERIOR.y) };
  return (
    <>
      <motion.div aria-hidden style={{ opacity: imgOn, ...at }} className="absolute -translate-x-1/2 whitespace-nowrap text-center">
        <motion.p className={`${BIG_TEXT} text-fg`}>{imgTop}</motion.p>
        <motion.p className="text-dim">{imgSub}</motion.p>
      </motion.div>
      <motion.div aria-hidden style={{ opacity: renOn, ...at }} className="absolute -translate-x-1/2 whitespace-nowrap text-center">
        <motion.p className={`${BIG_TEXT} text-fg`}>{renTop}</motion.p>
        <motion.p className="text-dim">{renSub}</motion.p>
      </motion.div>
    </>
  );
}

export default function Loop({ p }: { p: MV }) {
  return (
    <>
      <Wires p={p} />
      <RowNodes p={p} />
      <Countdown p={p} />
      <Interior p={p} />
    </>
  );
}
