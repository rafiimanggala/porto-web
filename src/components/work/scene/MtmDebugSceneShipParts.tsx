"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, type MV } from "./HealthSceneParts";
import { PUSH_GATE, PUSH_LABEL, SHIP } from "./MtmDebugSceneData";
import { ChecklistGlyph, PushGlyph } from "./MtmDebugSceneGlyphs";
import { Roll, VWire } from "./MtmDebugSceneKit";
import { at, clamp01, keepRight, pct, revealLeft, useWin } from "./MtmDebugSceneMath";
import { MtmGlyph } from "./MtmKitGlyphs";
import { mixColor } from "./MtmKitMath";

/* Building blocks of the deploy ribbon: stations with a slot on the left, the gate button, the wires between them
   and the dashed way back. */

export const MINT = "var(--color-mint)";
export const ACCENT = "var(--color-accent)";
export const LINE = "var(--color-line-strong)";

export const ROW_H = { backup: 92, tag: 76, gate: 54, live: 72 } as const;
export const GAP = 18;
const SLOT_W = 44;
const HALF = 0.5;

export const rowCenter = (row: keyof typeof ROW_H) => {
  const order = ["backup", "tag", "gate", "live"] as const;
  const above = order.slice(0, order.indexOf(row)).reduce((sum, r) => sum + ROW_H[r] + GAP, 0);
  return above + ROW_H[row] * HALF;
};
export const STACK_H = ROW_H.backup + ROW_H.tag + ROW_H.gate + ROW_H.live + 3 * GAP;

export function Station({ h, glyph, done, children }: { h: number; glyph: ReactNode; done: MV; children: ReactNode }) {
  const border = useTransform(done, (t) => mixColor(MINT, t, LINE));
  return (
    <motion.div style={{ height: h, borderColor: border }} className="relative flex overflow-hidden rounded-lg border bg-surface-2">
      <div style={{ width: SLOT_W }} className="relative grid shrink-0 place-items-center border-r border-line bg-surface-1">
        {glyph}
        <motion.span aria-hidden style={{ scale: done, opacity: done }} className="absolute bottom-0.5 right-0.5">
          <MtmGlyph name="check" size={14} />
        </motion.span>
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col justify-center px-2.5 py-2">{children}</div>
    </motion.div>
  );
}

/** The progress bar of a station: mint while it runs, the accent once the station is done. */
export function Bar({ t, done }: { t: MV; done: MV }) {
  const color = useTransform(done, (d) => mixColor(MINT, d, ACCENT));
  return (
    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-line-strong">
      <motion.i style={{ scaleX: t, background: color }} className="block h-full origin-left" />
    </span>
  );
}

export function Link({ t, color }: { t: MV; color?: MotionValue<string> }) {
  return (
    <div style={{ height: GAP }} className="relative">
      <div style={{ left: SLOT_W / 2 }} className="absolute inset-y-0 -ml-px">
        <VWire t={t} color={color} className="h-full" />
      </div>
    </div>
  );
}

const FACE = "absolute inset-0 flex items-center gap-2.5 px-3.5";
const ICON = 20;
/* The sweep edge reaches the icon at 4 to 5 percent of the sweep and has fully passed it by 12 percent, on any panel width.
   The checklist icon is gone before the orange face reaches it and the arrow only arrives once the face has passed, so
   neither icon is ever seen through the other colour. */
const ICON_OUT = [0.005, 0.03] as const;
const ICON_IN = [0.14, 0.2] as const;

/* The two icons are not part of the wiping faces: they swap by opacity, one at a time, around the sweep edge. */
function ButtonIcon({ open }: { open: MV }) {
  const list = useTransform(open, (f) => 1 - at(f, ICON_OUT));
  const push = useTransform(open, (f) => at(f, ICON_IN));
  return (
    <span aria-hidden style={{ width: ICON, height: ICON }} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2">
      <motion.span style={{ opacity: list }} className="absolute inset-0">
        <ChecklistGlyph size={ICON} />
      </motion.span>
      <motion.span style={{ opacity: push }} className="absolute inset-0">
        <PushGlyph size={ICON} />
      </motion.span>
    </span>
  );
}

const SPACER = <span aria-hidden style={{ width: ICON, height: ICON }} className="shrink-0" />;
const TAG = `${MONO} ml-auto text-[10px] uppercase tracking-[0.12em]`;

/* Each check ticks off when its station closes: the backup, then the tag (the same moments the stations turn mint). */
const CHECK_AT = [SHIP.backup[1], SHIP.tag[1]] as const;
const CHECK_SPAN = 0.008;

function GateCheck({ p, label, at: end }: { p: MV; label: string; at: number }) {
  const done = useWin(p, [end - CHECK_SPAN, end]);
  const color = useTransform(done, (t) => mixColor(MINT, t, "var(--color-mute)"));
  return (
    <motion.span style={{ color }} className="flex items-center gap-1.5">
      <span className="relative grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border border-current">
        <motion.span style={{ scale: done, opacity: done }} className="absolute -inset-px grid place-items-center">
          <MtmGlyph name="check" size={14} />
        </motion.span>
      </span>
      {label}
    </motion.span>
  );
}

/** The waiting face: the two checks the push needs, each ticked when it is done. */
function GateChecks({ p }: { p: MV }) {
  return (
    <span className={`${TAG} flex flex-col gap-0.5 leading-[13px]`}>
      {PUSH_GATE.checks.map((label, i) => (
        <GateCheck key={label} p={p} label={label} at={CHECK_AT[i]} />
      ))}
    </span>
  );
}

/** The push button: a checklist until backup and tag are done, then the ready face wipes in over it. */
export function PushButton({ p }: { p: MV }) {
  const open = useWin(p, SHIP.gate, easeInOutCubic);
  const press = useWin(p, SHIP.press);
  const done = useWin(p, SHIP.done);
  const waiting = useTransform(open, keepRight);
  const ready = useTransform(open, revealLeft);
  const left = useTransform(open, (f) => pct(f * 100));
  const edge = useTransform(open, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  const border = useTransform(open, (f) => mixColor(ACCENT, f, LINE));
  const dip = useTransform(press, (t) => 1 - 0.04 * Math.sin(Math.PI * clamp01(t)));
  const ring = useTransform(press, (t) => (t > 0 && t < 1 ? (1 - t) * 0.7 : 0));
  const grow = useTransform(press, (t) => 1 + 0.1 * clamp01(t));
  return (
    <div style={{ height: ROW_H.gate }} className="relative">
      <motion.i aria-hidden style={{ scale: grow, opacity: ring }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent" />
      <motion.div style={{ scale: dip, borderColor: border }} className="absolute inset-0 overflow-hidden rounded-lg border">
        <motion.div style={{ clipPath: waiting }} className={`${FACE} bg-surface-2 text-mute`}>
          {SPACER}
          <span className="text-[14px] font-semibold leading-none">{PUSH_LABEL}</span>
          <GateChecks p={p} />
        </motion.div>
        <motion.div style={{ clipPath: ready }} className={`${FACE} bg-accent text-fg`}>
          {SPACER}
          <span className="text-[14px] font-semibold leading-none">{PUSH_LABEL}</span>
          <span className={`${TAG} block`}>
            <Roll t={done} h={14} align="end" a={PUSH_GATE.ready} b={PUSH_GATE.pushed} />
          </span>
        </motion.div>
        <ButtonIcon open={open} />
        <motion.i aria-hidden style={{ left, opacity: edge }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-fg" />
      </motion.div>
    </div>
  );
}

const WAY = { live: [0, 0.14], up: [0.12, 0.9], tag: [0.6, 0.72], backup: [0.88, 1] } as const;
const WAY_LEFT = 14;
const WAY_LABEL = "restore";
const DASH = "absolute border-dashed border-accent";
const HEAD_LEFT = "absolute -left-px h-2 w-1.5 bg-accent [clip-path:polygon(100%_0,0_50%,100%_100%)]";

const win = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));
const fromLeft = (t: number) => `inset(0 ${pct(100 - t * 100)} 0 0)`;
const fromRight = (t: number) => `inset(0 0 0 ${pct(100 - t * 100)})`;
const fromBottom = (t: number) => `inset(${pct(100 - t * 100)} 0 0 0)`;

/** The way back: from the live theme up to the backup and to the tag, dashed, drawn last. */
export function Rollback({ p }: { p: MV }) {
  const t = useWin(p, SHIP.rollback, easeOutCubic);
  const live = useTransform(t, (v) => fromLeft(win(v, WAY.live)));
  const up = useTransform(t, (v) => fromBottom(win(v, WAY.up)));
  const tag = useTransform(t, (v) => fromRight(win(v, WAY.tag)));
  const backup = useTransform(t, (v) => fromRight(win(v, WAY.backup)));
  const tagOn = useTransform(t, (v) => (win(v, WAY.tag) > 0.5 ? 1 : 0));
  const backupOn = useTransform(t, (v) => (win(v, WAY.backup) > 0.5 ? 1 : 0));
  const label = useTransform(t, [0.5, 0.8], [0, 1]);
  const yLive = rowCenter("live");
  const yTag = rowCenter("tag");
  const yBackup = rowCenter("backup");
  return (
    <div aria-hidden style={{ height: STACK_H }} className="pointer-events-none absolute -right-8 top-0 w-8">
      <motion.i style={{ clipPath: live, top: yLive - 1, width: WAY_LEFT + 1 }} className={`${DASH} left-0 h-0 border-t-2`} />
      <motion.i style={{ clipPath: up, top: yBackup, height: yLive - yBackup, left: WAY_LEFT - 1 }} className={`${DASH} w-0 border-l-2`} />
      <motion.i style={{ clipPath: tag, top: yTag - 1, width: WAY_LEFT }} className={`${DASH} left-0 h-0 border-t-2`} />
      <motion.i style={{ clipPath: backup, top: yBackup - 1, width: WAY_LEFT }} className={`${DASH} left-0 h-0 border-t-2`} />
      <motion.i style={{ opacity: tagOn, top: yTag - 4 }} className={HEAD_LEFT} />
      <motion.i style={{ opacity: backupOn, top: yBackup - 4 }} className={HEAD_LEFT} />
      <motion.span
        style={{ opacity: label, top: yTag + 10 }}
        className={`${MONO} absolute left-[20px] text-[11px] text-fg [writing-mode:vertical-rl]`}
      >
        {WAY_LABEL}
      </motion.span>
    </div>
  );
}
