"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { iconSrc } from "./SceneIcon";
import { BAR_HEIGHTS, LAYER, PIPE_XS, TL, VARIANTS, portX } from "./EduVariantsSceneData";
import { useGeo } from "./EduVariantsSceneGeo";
import { SheetIcon } from "./EduVariantsSceneIcons";
import { clamp01, dropPath, engineGlow, lerp, pipeState, pluggedAt, pulseRaw, pulseState, seg, wireFrom, wireTo } from "./EduVariantsSceneKit";

/* The shared core under all seven trees: one quiz engine and one results
   pipeline. Both first show up as dashed empty slots while the trees grow, turn
   solid in the third chapter, and take seven wires whose pulses fall in step. */

const PAD = 14;
const ICON_CX = LAYER.x + 30;
const LABEL_X = LAYER.x + 52;
const RESULTS_ICON = 30;
const PULSES_PER_WIRE = 2;
const PULSE_R = 3;
const BAR_W = 6;
const BAR_GAP = 3.5;
const BAR_X = LAYER.x + LAYER.w - PAD - (BAR_HEIGHTS.length * BAR_W + (BAR_HEIGHTS.length - 1) * BAR_GAP);
const BAR_FOOT = LAYER.h - 7;

type ShellProps = { y: number; label: string; ph: MV; solid: MV; glow?: MV; icon: ReactNode; children?: ReactNode };

function LayerShell({ y, label, ph, solid, glow, icon, children }: ShellProps) {
  const G = useGeo();
  const dashed = useTransform(solid, (s) => 1 - s);
  const labelOpacity = useTransform(solid, (s) => 0.5 + 0.5 * s);
  const props = { x: LAYER.x, y, width: LAYER.w, height: LAYER.h, rx: 8 };
  return (
    <motion.g style={{ opacity: ph }}>
      <motion.rect {...props} fill="none" strokeWidth={1.2} strokeDasharray="4 4" style={{ opacity: dashed }} className="stroke-line-strong" />
      <motion.rect {...props} strokeWidth={1.2} style={{ opacity: solid }} className="fill-surface-2 stroke-line-strong" />
      {glow ? <motion.rect {...props} fill="none" strokeWidth={2} style={{ opacity: glow }} className="stroke-accent" /> : null}
      <motion.g style={{ opacity: solid }}>{icon}</motion.g>
      <motion.text x={LABEL_X} y={y + LAYER.h / 2 + G.fs.l * 0.35} fontSize={G.fs.l} style={{ opacity: labelOpacity }} className="fill-fg font-semibold">
        {label}
      </motion.text>
      {children}
    </motion.g>
  );
}

function Port({ p, i }: { p: MV; i: number }) {
  const { engineY } = useGeo();
  const lit = useTransform(p, (v) => clamp01((pulseRaw(v, i) - 0.95) * 12));
  return (
    <>
      <circle cx={portX(i)} cy={engineY} r={3.4} strokeWidth={1.2} className="fill-bg stroke-fg/70" />
      <motion.circle cx={portX(i)} cy={engineY} r={2.2} style={{ opacity: lit }} className="fill-accent" />
    </>
  );
}

function EngineLayer({ p, ph, solid }: { p: MV; ph: MV; solid: MV }) {
  const G = useGeo();
  const glow = useTransform(p, engineGlow);
  const plugged = useTransform(p, (v) => `plugged ${pluggedAt(v)}/${VARIANTS.length}`);
  const icon = (
    <g transform={`translate(${ICON_CX} ${G.engineY + LAYER.h / 2}) scale(1.05)`}>
      <SheetIcon />
    </g>
  );
  return (
    <LayerShell y={G.engineY} label="Quiz engine" ph={ph} solid={solid} glow={glow} icon={icon}>
      <motion.text
        x={LAYER.x + LAYER.w - PAD}
        y={G.engineY + LAYER.h / 2 + G.fs.s * 0.35}
        textAnchor="end"
        fontSize={G.fs.s}
        style={{ opacity: solid }}
        className={`${MONO} fill-mute tabular-nums`}
      >
        {plugged}
      </motion.text>
      {VARIANTS.map((_, i) => (
        <Port key={i} p={p} i={i} />
      ))}
    </LayerShell>
  );
}

function Bar({ p, j }: { p: MV; j: number }) {
  const base = useGeo().resultsY + BAR_FOOT;
  const a = TL.bars.start + j * TL.bars.step;
  const height = useTransform(p, (v) => BAR_HEIGHTS[j] * seg(v, a, a + TL.bars.dur, easeOutCubic));
  const y = useTransform(height, (hgt) => base - hgt);
  return <motion.rect x={BAR_X + j * (BAR_W + BAR_GAP)} y={y} width={BAR_W} height={height} rx={1.5} className="fill-fg/70" />;
}

function ResultsLayer({ p, ph, solid }: { p: MV; ph: MV; solid: MV }) {
  const { resultsY } = useGeo();
  const icon = (
    <image
      href={iconSrc("pdf-report")}
      x={LAYER.x + 30 - RESULTS_ICON / 2}
      y={resultsY + LAYER.h / 2 - RESULTS_ICON / 2}
      width={RESULTS_ICON}
      height={RESULTS_ICON}
    />
  );
  return (
    <LayerShell y={resultsY} label="Results pipeline" ph={ph} solid={solid} icon={icon}>
      {BAR_HEIGHTS.map((_, j) => (
        <Bar key={j} p={p} j={j} />
      ))}
    </LayerShell>
  );
}

function Wire({ p, i }: { p: MV; i: number }) {
  const G = useGeo();
  const a = TL.conn.start + i * TL.conn.step;
  const draw = useSeg(p, a, a + TL.conn.dur, easeOutCubic);
  const shown = useTransform(draw, (v) => (v > 0 ? 1 : 0));
  const d = dropPath(wireFrom(G, i), wireTo(G, i));
  return <motion.path d={d} fill="none" strokeWidth={1.4} strokeLinecap="round" style={{ pathLength: draw, opacity: shown }} className="stroke-fg/45" />;
}

function WirePulse({ p, i, k }: { p: MV; i: number; k: number }) {
  const G = useGeo();
  const s = useTransform(p, (v) => pulseState(G, v, i, k));
  const cx = useTransform(s, (v) => v.x);
  const cy = useTransform(s, (v) => v.y);
  const opacity = useTransform(s, (v) => v.o);
  return <motion.circle cx={cx} cy={cy} r={PULSE_R} style={{ opacity }} className="fill-accent stroke-bg" strokeWidth={1} />;
}

function Pipe({ p, x }: { p: MV; x: number }) {
  const G = useGeo();
  const draw = useSeg(p, TL.pipes[0], TL.pipes[1], easeOutCubic);
  const y1 = G.engineY + LAYER.h;
  const y2 = useTransform(draw, (v) => lerp(y1, G.resultsY, v));
  const shown = useTransform(draw, (v) => (v > 0 ? 1 : 0));
  const s = useTransform(p, (v) => pipeState(G, v));
  const cy = useTransform(s, (v) => v.y);
  const opacity = useTransform(s, (v) => v.o);
  return (
    <>
      <motion.line x1={x} x2={x} y1={y1} y2={y2} strokeWidth={1.4} strokeLinecap="round" style={{ opacity: shown }} className="stroke-fg/45" />
      <motion.circle cx={x} cy={cy} r={PULSE_R} style={{ opacity }} className="fill-accent stroke-bg" strokeWidth={1} />
    </>
  );
}

export function SharedCore({ p }: { p: MV }) {
  const ph = useSeg(p, TL.holders[0], TL.holders[1]);
  const solid = useSeg(p, TL.solid[0], TL.solid[1], easeOutCubic);
  const pulses = VARIANTS.flatMap((_, i) => Array.from({ length: PULSES_PER_WIRE }, (__, k) => ({ i, k })));
  return (
    <g>
      <EngineLayer p={p} ph={ph} solid={solid} />
      <ResultsLayer p={p} ph={ph} solid={solid} />
      {VARIANTS.map((_, i) => (
        <Wire key={i} p={p} i={i} />
      ))}
      {PIPE_XS.map((x) => (
        <Pipe key={x} p={p} x={x} />
      ))}
      {pulses.map(({ i, k }) => (
        <WirePulse key={`${i}-${k}`} p={p} i={i} k={k} />
      ))}
    </g>
  );
}
