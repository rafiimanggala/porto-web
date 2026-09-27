"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { NODE, SCHEDULE, SHORTS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { PipeNode } from "./PipeKitNode";
import { Pulse, Wire, elbowPath, linePath, type WirePath } from "./PipeKitWire";
import { AGENT_AT, FH, FW, IDEA, MEMORY, MEMORY_TOPICS, MEMORY_VERDICT, SUB, TL, memoryRowAt } from "./PipeShortsData";
import { Gate, SANS, SMALL_SANS, TickBadge, boxStyle, pctX, pctY, pointPct, unit } from "./PipeShortsKit";
import { insetTop, trap, useSpans } from "./PipeShortsMath";

/* Chapter 2 stage: the idea row goes into the agent node, the agent's three parts (model, memory sheet, append row tool)
   light up in turn, and the memory check reads the past topics. The five slides it writes land in the card row below. */

const AGENT_SIZE = 40;
const SUB_SIZE = 32;
const ELBOW_MID = 0.55;

const W_IDEA = linePath([IDEA.x + IDEA.w, AGENT_AT[1]], AGENT_AT);
const W_MODEL = elbowPath(AGENT_AT, SUB.model, { axis: "y", mid: ELBOW_MID, radius: 8 });
const W_MEMORY = linePath(AGENT_AT, SUB.memory);
const W_TOOL = elbowPath(AGENT_AT, SUB.tool, { axis: "y", mid: ELBOW_MID, radius: 8 });
const W_LEADER = linePath(AGENT_AT, [MEMORY.x, AGENT_AT[1]]);

type SubPart = { key: "model" | "memory" | "tool"; glyph: "ai" | "sheet" | "edit"; label: string; path: WirePath; win: readonly [number, number]; at: number };
const SUBS: readonly SubPart[] = [
  { key: "model", glyph: "ai", label: SHORTS.agent.model, path: W_MODEL, win: TL.model, at: 0 },
  { key: "memory", glyph: "sheet", label: SHORTS.agent.memory, path: W_MEMORY, win: TL.memory, at: 1 },
  { key: "tool", glyph: "edit", label: SHORTS.agent.tool, path: W_TOOL, win: TL.tool, at: 2 },
];
const SUB_STAGGER = 0.004;

/* ---------- The idea row ---------- */

function IdeaRow({ p }: { p: MV }) {
  const t = useSeg(p, TL.idea[0], TL.idea[1], easeOutBack);
  const opacity = useSeg(p, TL.idea[0], TL.idea[0] + 0.012);
  const y = useTransform(t, (v) => `${((1 - v) * -6).toFixed(2)}%`);
  return (
    <motion.div style={{ ...boxStyle(IDEA.x, IDEA.y, IDEA.w, IDEA.h), opacity, y }} className="absolute rounded-md border border-line-strong bg-surface-2 p-[5px]">
      <div className="flex items-center justify-between text-mute">
        <span className="flex items-center gap-[3px]">
          <PipeGlyph name="sheet" size={unit(13)} />
          {SHORTS.rowId}
        </span>
        <span className="text-fg">{SCHEDULE.time}</span>
      </div>
      <p className={`mt-[3px] text-fg ${SANS}`}>{SHORTS.topic}</p>
    </motion.div>
  );
}

/* ---------- The agent node and its three parts ---------- */

function AgentNode({ p }: { p: MV }) {
  const active = useSpans(p, [TL.agentOn]);
  const done = useSeg(p, TL.agentOn[1], TL.agentOn[1] + 0.012);
  const pop = useSeg(p, TL.idea[0] + 0.002, TL.idea[1] + 0.014, easeOutCubic);
  const pulse = useSeg(p, TL.toAgent[1] - 0.004, TL.toAgent[1] + 0.03);
  /** The label waits for the lanes to finish docking, so it never lands on a lane label still on its way up. */
  const name = useSeg(p, TL.dock[1] - 0.004, TL.dock[1] + 0.012);
  const [x, y] = AGENT_AT;
  return (
    <motion.div style={{ opacity: pop }} className="pointer-events-none absolute inset-0">
      <PipeNode glyph={NODE.agent.glyph} size={unit(AGENT_SIZE)} at={pointPct(x, y)} active={active} done={done} pulse={pulse} />
      <motion.span style={{ opacity: name, left: pctX(x), top: pctY(y - AGENT_SIZE / 2 - 3) }} className="absolute -translate-x-1/2 -translate-y-full leading-none">
        <span className="text-mute">{NODE.agent.label}</span>
        <motion.span style={{ opacity: active }} className="absolute inset-0 text-fg">
          {NODE.agent.label}
        </motion.span>
      </motion.span>
    </motion.div>
  );
}

function SubNode({ p, part }: { p: MV; part: SubPart }) {
  const at = TL.subWires[0] + part.at * SUB_STAGGER;
  const pop = useSeg(p, at, at + 0.014, easeOutCubic);
  const active = useSpans(p, [part.win]);
  const done = useSeg(p, part.win[1], part.win[1] + 0.012);
  const pulse = useSeg(p, part.win[0], part.win[0] + 0.024);
  const [x, y] = SUB[part.key];
  return (
    <motion.div style={{ opacity: pop }} className="pointer-events-none absolute inset-0">
      <PipeNode glyph={part.glyph} label={part.label} size={unit(SUB_SIZE)} at={pointPct(x, y)} active={active} done={done} pulse={pulse} />
    </motion.div>
  );
}

function SubWire({ p, part }: { p: MV; part: SubPart }) {
  const at = TL.subWires[0] + part.at * SUB_STAGGER;
  const draw = useSeg(p, at, at + 0.014);
  const ride = useSeg(p, part.win[0] - 0.016, part.win[0]);
  return (
    <Gate p={p} at={at}>
      <Wire path={part.path} draw={draw} tone="sky" dashed />
      <Pulse path={part.path} progress={ride} tone="sky" />
    </Gate>
  );
}

/* ---------- The memory check ---------- */

const ROW_H = 16;
const MEM_HEAD = 15;
const rowAt = memoryRowAt;

function MemoryRow({ p, k }: { p: MV; k: number }) {
  const hi = useTransform(p, (v) => trap(v, rowAt(k) - 0.002, rowAt(k) + 0.014, 0.004));
  const pop = useSeg(p, rowAt(k) + TL.memoryRow.tick, rowAt(k) + TL.memoryRow.tick + 0.01, easeOutBack);
  return (
    <div style={{ height: unit(ROW_H) }} className="relative flex items-center justify-between gap-[4px] px-[6px]">
      <motion.i aria-hidden style={{ opacity: hi }} className="absolute inset-x-[2px] inset-y-0 rounded bg-accent/30" />
      <span className={`relative min-w-0 truncate text-fg ${SMALL_SANS}`}>{MEMORY_TOPICS[k]}</span>
      <TickBadge pop={pop} size={12} className="relative" />
    </div>
  );
}

function MemoryCard({ p }: { p: MV }) {
  const open = useSeg(p, TL.memory[0] + 0.004, TL.memory[0] + 0.02, easeOutCubic);
  const clip = useTransform(open, insetTop);
  const verdict = useSeg(p, rowAt(MEMORY_TOPICS.length - 1) + 0.014, rowAt(MEMORY_TOPICS.length - 1) + 0.026);
  const title = useTransform(verdict, (v) => 1 - v);
  return (
    <motion.div style={{ ...boxStyle(MEMORY.x, MEMORY.y, MEMORY.w, MEMORY.h), clipPath: clip }} className="absolute overflow-hidden rounded-md border border-line-strong bg-surface-2">
      <div style={{ height: unit(MEM_HEAD) }} className="relative flex items-center px-[6px] text-mute">
        <motion.span style={{ opacity: title }}>memory</motion.span>
        <motion.span style={{ opacity: verdict }} className="absolute inset-x-[6px] whitespace-nowrap text-fg">
          {MEMORY_VERDICT}
        </motion.span>
      </div>
      {MEMORY_TOPICS.map((topic, k) => (
        <MemoryRow key={topic} p={p} k={k} />
      ))}
    </motion.div>
  );
}

/* ---------- Stage ---------- */

export default function AgentView({ p }: { p: MV }) {
  const idea = useSeg(p, TL.toAgent[0], TL.toAgent[1], easeOutCubic);
  const leader = useSeg(p, TL.memory[0], TL.memory[0] + 0.014);
  return (
    <>
      <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <Gate p={p} at={TL.idea[1]}>
          <Wire path={W_IDEA} draw={idea} />
          <Pulse path={W_IDEA} progress={idea} trail={2} />
        </Gate>
        {SUBS.map((part) => (
          <SubWire key={part.key} p={p} part={part} />
        ))}
        <Gate p={p} at={TL.memory[0]}>
          <Wire path={W_LEADER} draw={leader} tone="mint" />
          <Pulse path={W_LEADER} progress={leader} tone="mint" />
        </Gate>
      </svg>
      <IdeaRow p={p} />
      <MemoryCard p={p} />
      <AgentNode p={p} />
      {SUBS.map((part) => (
        <SubNode key={part.key} p={p} part={part} />
      ))}
    </>
  );
}
