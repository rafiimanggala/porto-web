"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { EMAIL_FLOWS } from "./MtmKitData";
import { MtmGlyph } from "./MtmKitGlyphs";
import { SceneIcon } from "./SceneIcon";
import { TONE_VAR, mixColor, useKeys } from "./MtmKitMath";
import { COPY, HEADER_LABELS, HERO, SOURCES, T, liveOnWin, restyleWin, trigWin, type Win } from "./MtmEmailSceneData";
import { hump } from "./MtmEmailSceneMath";
import { Bolt, WipeSwap } from "./MtmEmailSceneKit";

/* Header strip that wipes to the store row. */

const LINE_H = 14;
const easeLinear = (t: number) => t;

function LabelIcon({ k }: { k: number }) {
  if (k === 0) return <MtmGlyph name="mail" size={14} />;
  if (k === 1) return <Bolt className="h-3.5 w-3.5" />;
  return <SceneIcon name="send" size={16} className="h-3.5 w-3.5" />;
}

function HeaderLabel({ p }: { p: MV }) {
  const idx = useKeys(p, T.labelX, T.labelY);
  const y = useTransform(idx, (v) => -v * LINE_H);
  const opacity = useKeys(p, T.labelFadeX, T.labelFadeY, easeLinear);
  return (
    <motion.div style={{ opacity }} className={`${MONO} h-[14px] min-w-0 overflow-hidden text-[10px] uppercase tracking-[0.12em] text-fg`}>
      <motion.div style={{ y }} className="flex flex-col">
        {HEADER_LABELS.map((label, k) => (
          <span key={label} className="flex h-[14px] items-center gap-1.5 whitespace-nowrap">
            <LabelIcon k={k} />
            {label}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* One pip per email: branded, armed, live. */
function Pip({ p, i }: { p: MV; i: number }) {
  const branded = useSeg(p, restyleWin(i)[0], restyleWin(i)[1]);
  const armed = useSeg(p, trigWin(i)[0], trigWin(i)[1]);
  const live = useSeg(p, liveOnWin(i)[0], liveOnWin(i)[1]);
  const background = useTransform([branded, armed, live], ([b, a, l]: number[]) =>
    mixColor(TONE_VAR.mint, l, mixColor(TONE_VAR.sun, a, mixColor(TONE_VAR.accent, b, "var(--color-line-strong)"))),
  );
  return <motion.i style={{ background }} className="h-2 w-2 rounded-[2px]" />;
}

/* The pip row shows only once the store row is fully wiped away, so it never sits against a source chip. */
const PIPS_GONE_AT = 0.2;

function GridHeader({ p, flow }: { p: MV; flow: MV }) {
  const opacity = useTransform(flow, [0, PIPS_GONE_AT], [1, 0]);
  return (
    <div className="absolute inset-y-0 flex items-center justify-between gap-3" style={{ left: "var(--pad)", right: "var(--pad)" }}>
      <HeaderLabel p={p} />
      <motion.span aria-hidden style={{ opacity }} className="flex shrink-0 gap-[3px]">
        {EMAIL_FLOWS.map((f, i) => (
          <Pip key={f.id} p={p} i={i} />
        ))}
      </motion.span>
    </div>
  );
}

function StoreTile({ p }: { p: MV }) {
  const t = useSeg(p, T.fire[0], T.fire[1]);
  const opacity = useTransform(t, (v) => hump(v));
  return (
    <span className="relative flex h-full max-h-[28px] shrink-0 items-center gap-1.5 rounded-md border border-dashed border-line-strong bg-surface-1/70 px-1.5">
      <motion.i aria-hidden style={{ opacity }} className="pointer-events-none absolute inset-0 rounded-md border-2 border-accent" />
      <MtmGlyph name="store" size={16} />
      <span className={`${MONO} text-[10px] leading-none text-fg`}>{COPY.store}</span>
    </span>
  );
}

function SourceChip({ p, label, win }: { p: MV; label: string; win: Win }) {
  const [a, b] = win;
  const read = useTransform(p, [a, a + 0.008, b, b + 0.01], [0, 1, 1, 0]);
  const done = useSeg(p, b - 0.004, b + 0.01);
  const color = useTransform([read, done], ([r, d]: number[]) => mixColor("var(--color-fg)", Math.max(r, d), "var(--color-mute)"));
  return (
    <span className="relative flex h-[22px] items-center rounded-md border border-line-strong px-1.5">
      <motion.i aria-hidden style={{ opacity: read }} className="absolute -inset-px rounded-md border border-accent bg-accent/25" />
      <motion.i aria-hidden style={{ opacity: done }} className="absolute -inset-px rounded-md border border-mint bg-mint/25" />
      <motion.span style={{ color }} className={`${MONO} relative text-[10px] leading-none`}>
        {label}
      </motion.span>
    </span>
  );
}

function StoreRow({ p }: { p: MV }) {
  return (
    <div className="absolute inset-y-0 flex items-center gap-1.5" style={{ left: "var(--tl)", width: "var(--tw)" }}>
      <StoreTile p={p} />
      <i aria-hidden className="h-px min-w-1 flex-1 border-t border-dashed border-line-strong" />
      <span className="flex shrink-0 gap-1">
        {SOURCES.map((s) => (
          <SourceChip key={s.label} p={p} label={s.label} win={s.win} />
        ))}
      </span>
    </div>
  );
}

export function TopRow({ p, flow }: { p: MV; flow: MV }) {
  return <WipeSwap t={flow} className="absolute inset-x-0 top-[var(--pad)] h-[var(--hdr)]" a={<GridHeader p={p} flow={flow} />} b={<StoreRow p={p} />} />;
}

const WIRE_X = "calc(var(--tl) + 31px)";
const WIRE_TOP = "calc(var(--pad) + var(--hdr))";

function Packet({ p }: { p: MV }) {
  const t = useSeg(p, T.packet[0], T.packet[1]);
  const top = useTransform(t, (v) => `calc(${WIRE_TOP} + ${v.toFixed(4)} * var(--wire))`);
  const opacity = useTransform(t, [0, 0.1, 0.88, 1], [0, 1, 1, 0]);
  return (
    <>
      <motion.i aria-hidden style={{ left: WIRE_X, top, opacity }} className="pointer-events-none absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bg bg-accent" />
      <motion.span
        aria-hidden
        style={{ left: "calc(var(--tl) + 42px)", top, opacity }}
        className={`${MONO} pointer-events-none absolute z-10 -translate-y-1/2 whitespace-nowrap rounded-[4px] bg-accent px-1.5 py-px text-[10px] leading-[14px] text-fg`}
      >
        {HERO.trigger}
      </motion.span>
    </>
  );
}

/* Wire from the store to the template, with the event packet. */
export function EventWire({ p, flow }: { p: MV; flow: MV }) {
  const draw = useKeys(p, T.wireX, T.ramp);
  const arrive = useSeg(p, T.arrive[0], T.arrive[1]);
  const knob = useTransform(arrive, (v) => Math.min(1, v * 3));
  return (
    <>
      <motion.i aria-hidden style={{ left: WIRE_X, top: WIRE_TOP, opacity: flow }} className="pointer-events-none absolute h-[var(--wire)] w-0.5 rounded-full bg-line-strong" />
      <motion.i aria-hidden style={{ left: WIRE_X, top: WIRE_TOP, scaleY: draw }} className="pointer-events-none absolute h-[var(--wire)] w-0.5 origin-top rounded-full bg-accent" />
      <motion.i aria-hidden style={{ left: WIRE_X, top: "var(--tt)", scale: knob, opacity: draw }} className="pointer-events-none absolute z-30 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg" />
      <Packet p={p} />
    </>
  );
}
