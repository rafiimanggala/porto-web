"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { MENU, MENU_TL, STORES } from "./MtmDebugSceneData";
import { HATCH, LABEL, Tag } from "./MtmDebugSceneKit";
import { at, keepRight, pct, revealLeft, useWin } from "./MtmDebugSceneMath";
import { MtmGlyph } from "./MtmKitGlyphs";
import { mixColor } from "./MtmKitMath";

/* The store menu: blank while the lookup finds nothing, then the select value and the options arrive. */

const ROSE = "var(--color-rose)";
const MINT = "var(--color-mint)";
const LINE = "var(--color-line-strong)";
const ROW_H = 22;
const ROW_STAGGER = 0.006;
const ROW_SPAN = 0.008;

function OptionRow({ p, i }: { p: MV; i: number }) {
  const start = MENU_TL.rows[0] + i * ROW_STAGGER;
  const t = useWin(p, [start, start + ROW_SPAN]);
  const clip = useTransform(t, (v) => `inset(0 0 ${pct(100 - v * 100)} 0)`);
  const preferred = i === 0;
  return (
    <motion.div
      style={{ clipPath: clip, height: ROW_H, top: i * ROW_H }}
      className={`absolute inset-x-0 flex items-center gap-2 border-b border-line px-2.5 text-[12px] ${preferred ? "bg-surface-2 text-fg" : "bg-surface-2 text-dim"}`}
    >
      <span className="w-4 shrink-0">{preferred ? <MtmGlyph name="check" size={14} /> : null}</span>
      <span className="truncate">{STORES[i]}</span>
    </motion.div>
  );
}

function OptionList({ p }: { p: MV }) {
  const emptyOp = useTransform(p, (v) => 1 - at(v, [MENU_TL.rows[0] - 0.008, MENU_TL.rows[0]]));
  const border = useTransform(p, (v) => mixColor(MINT, at(v, MENU_TL.rows), LINE));
  return (
    <motion.div style={{ height: ROW_H * STORES.length, borderColor: border }} className={`relative mt-1.5 overflow-hidden rounded-lg border ${HATCH}`}>
      <motion.span style={{ opacity: emptyOp }} className={`${MONO} absolute inset-0 grid place-items-center text-[10px] text-mute`}>
        <span className="rounded-sm bg-surface-1 px-1.5">{MENU.copy.empty}</span>
      </motion.span>
      {STORES.map((s, i) => (
        <OptionRow key={s} p={p} i={i} />
      ))}
    </motion.div>
  );
}

function SelectBox({ p }: { p: MV }) {
  const blank = useWin(p, MENU_TL.blank);
  const fill = useWin(p, MENU_TL.fill);
  const border = useTransform([blank, fill], ([b, f]: number[]) => mixColor(MINT, f, mixColor(ROSE, b, LINE)));
  const hatch = useTransform(fill, keepRight);
  const value = useTransform(fill, revealLeft);
  const edge = useTransform(fill, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  const left = useTransform(fill, (f) => pct(f * 100));
  return (
    <motion.div style={{ borderColor: border }} className="relative h-9 overflow-hidden rounded-lg border bg-surface-2">
      <motion.i aria-hidden style={{ clipPath: hatch }} className={`absolute inset-0 ${HATCH}`} />
      <motion.span style={{ clipPath: value }} className="absolute inset-0 flex items-center px-3 text-[12px] text-fg">
        {MENU.stored}
      </motion.span>
      <motion.i aria-hidden style={{ left, opacity: edge }} className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-accent" />
      <i aria-hidden className="absolute right-3 top-1/2 h-1.5 w-2.5 -translate-y-1/2 bg-dim [clip-path:polygon(0_0,100%_0,50%_100%)]" />
    </motion.div>
  );
}

/* The status pill swaps in place, one pill at a time: the blank one fades out, then the filled one fades in. */
const SWAP_OUT = [0.15, 0.45] as const;
const SWAP_IN = [0.55, 0.85] as const;

function StatusPill({ p }: { p: MV }) {
  const blank = useWin(p, MENU_TL.blank);
  const fill = useWin(p, MENU_TL.fill);
  const rose = useTransform([blank, fill], ([b, f]: number[]) => b * (1 - at(f, SWAP_OUT)));
  const mint = useTransform(fill, (f) => at(f, SWAP_IN));
  return (
    <span className="relative block h-[14px]">
      <motion.span style={{ opacity: rose }} className="absolute right-0 top-0 flex">
        <Tag tone="rose">{MENU.copy.blank}</Tag>
      </motion.span>
      <motion.span style={{ opacity: mint }} className="absolute right-0 top-0 flex">
        <Tag tone="mint">{MENU.copy.filled}</Tag>
      </motion.span>
    </span>
  );
}

export default function MenuDrop({ p }: { p: MV }) {
  return (
    <div>
      <div className="mb-1 flex h-[14px] items-center justify-between">
        <span className={LABEL}>{MENU.copy.field}</span>
        <StatusPill p={p} />
      </div>
      <SelectBox p={p} />
      <OptionList p={p} />
    </div>
  );
}
