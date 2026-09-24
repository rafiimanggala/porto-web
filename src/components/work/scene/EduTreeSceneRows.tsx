"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { FRAME_PAD, LEVELS, TL, TOTAL, WINDOW } from "./EduTreeSceneData";
import { Chevron, CursorMark } from "./EduTreeSceneIcons";
import { centerOffset, furnitureAt, ghostState, pct, pointerAt, raceAt, rowState, scrollAt, segAt, type RowState } from "./EduTreeSceneMath";
import { Stamps } from "./EduTreeSceneStamps";

/* The tree panel body: a fixed window of rows over a virtual list. Slot k of the window shows list
   position floor(scroll) + k, so only WINDOW rows exist however long the list is. */

const SLOTS = Array.from({ length: WINDOW }, (_, k) => k);
const GHOST_ABOVE = [-4, -3, -2, -1, 0] as const;
const GHOST_BELOW = [12, 13, 14, 15, 16, 17] as const;
const GHOST_TINT = "color-mix(in oklab, var(--color-fg) 17%, transparent)";

const GUIDE_LEVELS = [0, 1, 2] as const;

/* Tree connector: a row draws one vertical guide per ancestor level, so the lines join up row after row. */
function Guide({ st, level }: { st: MotionValue<RowState>; level: number }) {
  const opacity = useTransform(st, (s) => (s.depth > level ? 1 : 0));
  return (
    <motion.i
      aria-hidden
      style={{ opacity, left: `calc(12px + var(--ind) * ${level})` }}
      className="absolute inset-y-0 w-px bg-fg/15"
    />
  );
}

function VRow({ k, p }: { k: number; p: MV }) {
  const st = useTransform(p, (v) => rowState(k, v));
  const height = useTransform(st, (s) => `calc(var(--row) * ${s.reveal.toFixed(4)})`);
  const opacity = useTransform(st, (s) => s.reveal);
  const padLeft = useTransform(st, (s) => `calc(var(--ind) * ${s.depth})`);
  const label = useTransform(st, (s) => s.label);
  const weight = useTransform(st, (s) => (s.depth === 0 ? 600 : 400));
  const rotate = useTransform(st, (s) => s.open * 90);
  const chevOp = useTransform(st, (s) => (s.leaf ? 0 : 1));
  const dot = useTransform(st, (s) => LEVELS[s.depth].color);
  const kids = useTransform(st, (s) => (s.kids > 0 ? `+${s.kids}` : ""));
  const kidsOp = useTransform(st, (s) => s.kidsOp);
  const sel = useTransform(st, (s) => s.sel);
  return (
    <motion.div style={{ height, opacity }} className="relative shrink-0 overflow-hidden">
      {GUIDE_LEVELS.map((l) => (
        <Guide key={l} st={st} level={l} />
      ))}
      <motion.i aria-hidden style={{ opacity: sel }} className="absolute inset-x-0.5 inset-y-px rounded-md bg-accent/25" />
      <motion.i aria-hidden style={{ opacity: sel }} className="absolute inset-y-[3px] left-0 w-[2px] rounded-full bg-accent" />
      <motion.div style={{ paddingLeft: padLeft }} className="relative h-[var(--row)] pr-2">
        <div className="flex h-full items-center gap-1.5 pl-1.5 text-[12px] leading-none @min-[500px]:text-[13px]">
          <motion.span style={{ rotate, opacity: chevOp }} className="grid h-3 w-3 shrink-0 place-items-center text-dim">
            <Chevron className="h-full w-full" />
          </motion.span>
          <motion.i aria-hidden style={{ background: dot }} className="h-1.5 w-1.5 shrink-0 rounded-full" />
          <motion.span style={{ fontWeight: weight }} className="min-w-0 truncate text-fg">
            {label}
          </motion.span>
          <motion.span style={{ opacity: kidsOp }} className={`ml-auto shrink-0 ${MONO} text-[11px] tabular-nums text-mute`}>
            {kids}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GhostRow({ k, p, order }: { k: number; p: MV; order: number }) {
  const st = useTransform(p, (v) => ghostState(k, v));
  const a = TL.ghost.start + order * TL.ghost.step;
  const fade = useSeg(p, a, a + TL.ghost.len, easeOutCubic);
  const on = useTransform(st, (s) => s.on);
  const opacity = useTransform([fade, on], ([f, o]: number[]) => f * o);
  const left = useTransform(st, (s) => `calc(var(--ind) * ${s.depth} + 6px)`);
  const width = useTransform(st, (s) => `${s.w}%`);
  const dot = useTransform(st, (s) => LEVELS[s.depth].color);
  return (
    <motion.div
      aria-hidden
      style={{ opacity, top: `calc(var(--row) * ${k})`, paddingLeft: left }}
      className="absolute inset-x-0 flex h-[var(--row)] items-center gap-2 pr-2"
    >
      <motion.i style={{ background: dot }} className="h-1.5 w-1.5 shrink-0 rounded-full opacity-55" />
      <motion.i style={{ width, background: GHOST_TINT }} className="h-[6px] rounded-full @min-[500px]:h-[7px]" />
    </motion.div>
  );
}

function Ghosts({ p }: { p: MV }) {
  const opacity = useTransform(p, furnitureAt);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-y-0 left-2 right-[var(--rside)] [mask-image:linear-gradient(to_bottom,transparent,#000_var(--gtop),#000_calc(var(--gtop)+var(--row)*12),transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_var(--gtop),#000_calc(var(--gtop)+var(--row)*12),transparent)]"
    >
      <div className="absolute inset-x-0 top-[var(--gtop)]">
        {GHOST_ABOVE.map((k) => (
          <GhostRow key={k} k={k} p={p} order={-k} />
        ))}
        {GHOST_BELOW.map((k) => (
          <GhostRow key={k} k={k} p={p} order={k - WINDOW} />
        ))}
      </div>
    </motion.div>
  );
}

function ClickRing({ p, i, a, b }: { p: MV; i: number; a: number; b: number }) {
  const t = useSeg(p, a, b, easeOutCubic);
  const scale = useTransform(t, (v) => 0.4 + 1.6 * v);
  const opacity = useTransform(t, [0, 0.1, 1], [0, 0.9, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ scale, opacity, left: `calc(12px + var(--ind) * ${i})`, top: `calc(var(--row) * ${i + 0.5})` }}
      className="pointer-events-none absolute z-10 -ml-[11px] -mt-[11px] h-[22px] w-[22px] rounded-full border-2 border-fg"
    />
  );
}

function Pointer({ p }: { p: MV }) {
  const at = useTransform(p, pointerAt);
  const left = useTransform(at, (s) => s.left);
  const top = useTransform(at, (s) => s.top);
  const opacity = useTransform(at, (s) => s.op);
  return (
    <motion.i aria-hidden style={{ left, top, opacity }} className="pointer-events-none absolute z-20 -ml-[2px] -mt-[2px] block h-[18px] w-[14px]">
      <CursorMark className="h-full w-full" />
    </motion.i>
  );
}

const CLICKS = [
  [0.02, 0.04],
  [0.09, 0.11],
  [0.16, 0.18],
] as const;

/* The frame that outlines the drawn rows: it comes in with chapter 2 and leaves before chapter 3. */
const useFrame = (p: MV) => useTransform(p, (v) => segAt(v, TL.frame[0], TL.frame[1], easeOutCubic) * furnitureAt(v));

function Window({ p }: { p: MV }) {
  const frame = useFrame(p);
  const right = useTransform(frame, (v) => `calc(${FRAME_PAD}px + (var(--rside) - ${FRAME_PAD}px) * ${v.toFixed(4)})`);
  const transform = useTransform(p, (v) => `translateY(calc(var(--row) * ${centerOffset(v).toFixed(4)}))`);
  return (
    <motion.div style={{ right }} className="absolute left-2 top-[var(--gtop)] h-[calc(var(--row)*12)]">
      <div className="absolute inset-0 overflow-hidden rounded-lg border border-transparent bg-surface-1">
        <motion.div style={{ transform }} className="absolute inset-0">
          <div className="flex flex-col">
            {SLOTS.map((k) => (
              <VRow key={k} k={k} p={p} />
            ))}
          </div>
          {CLICKS.map(([a, b], i) => (
            <ClickRing key={a} p={p} i={i} a={a} b={b} />
          ))}
          <Pointer p={p} />
        </motion.div>
        <Stamps p={p} />
      </div>
      <motion.i aria-hidden style={{ opacity: frame }} className="pointer-events-none absolute inset-0 rounded-lg border border-accent" />
      <DrawnTab frame={frame} />
    </motion.div>
  );
}

function DrawnTab({ frame }: { frame: MV }) {
  return (
    <motion.span
      aria-hidden
      style={{ opacity: frame }}
      className={`absolute -top-[9px] right-3 rounded-[4px] bg-accent px-1.5 py-[2px] ${MONO} text-[11px] leading-none text-fg`}
    >
      {WINDOW} drawn
    </motion.span>
  );
}

const TICKS = "[background-image:repeating-linear-gradient(to_bottom,currentColor_0_1px,transparent_1px_5px)]";

function Minimap({ p }: { p: MV }) {
  const appear = useTransform(p, (v) => segAt(v, TL.mini[0], TL.mini[1], easeOutCubic) * furnitureAt(v));
  const lit = useTransform(p, (v) => `inset(0 0 ${pct(100 - raceAt(v) * 100)} 0)`);
  const top = useTransform(p, (v) => pct((scrollAt(v) / TOTAL) * 100));
  return (
    <motion.div aria-hidden style={{ opacity: appear }} className="absolute bottom-2 right-2 top-2 w-[var(--mini)]">
      <div className={`absolute inset-0 text-line-strong ${TICKS}`} />
      <motion.div style={{ clipPath: lit }} className={`absolute inset-0 text-mute ${TICKS}`} />
      <motion.i
        style={{ top, height: `${(WINDOW / TOTAL) * 100}%`, minHeight: 8 }}
        className="absolute -inset-x-[2px] rounded-[2px] border border-accent bg-accent/30"
      />
    </motion.div>
  );
}

export default function TreeWindow({ p }: { p: MV }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Ghosts p={p} />
      <Window p={p} />
      <Minimap p={p} />
    </div>
  );
}
