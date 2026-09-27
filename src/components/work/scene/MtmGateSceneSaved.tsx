"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { PatternCard } from "./MtmKitCards";
import { clamp01, mixColor, useMv, type MvIn } from "./MtmKitMath";
import { HINT, LAYOUT, MEN_PATTERNS, PICK } from "./MtmGateSceneData";
import type { GateMotion } from "./MtmGateSceneMotion";
import { Ink, WipeStack, revealAt } from "./MtmGateSceneWipe";

/* The saved pattern page: the selector that folds out into the dropdown and the gender filter note. The tab switch above it
   belongs to the pane box, not to a page, so a pane swap never cuts it: it is one row that slides from tab to tab. */

const TAB = "relative grid place-items-center text-[12px] font-medium leading-none";
/* The highlight only has an outline while it rests on a tab. On the way it is a soft fill under the words, so it never cuts a letter. */
const OUTLINE_FADE = 4;

export function TabsSpacer() {
  return <div aria-hidden className="shrink-0" style={{ height: LAYOUT.tabsH }} />;
}

export function TabsRow({ tab }: { tab: MV }) {
  const x = useTransform(tab, (t) => `${(t * 100).toFixed(2)}%`);
  const saved = useTransform(tab, (t) => mixColor("var(--color-fg)", 1 - t, "var(--color-dim)"));
  const fresh = useTransform(tab, (t) => mixColor("var(--color-fg)", t, "var(--color-dim)"));
  const outline = useTransform(tab, (t) => mixColor("var(--color-accent)", clamp01(1 - OUTLINE_FADE * Math.min(t, 1 - t)), "transparent"));
  return (
    <div className="relative grid shrink-0 grid-cols-2 rounded-lg bg-surface-2 p-0.5" style={{ height: LAYOUT.tabsH }}>
      <motion.i style={{ x, borderColor: outline }} className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md border bg-accent/15" />
      <motion.span style={{ color: saved }} className={TAB}>
        Saved pattern
      </motion.span>
      <motion.span style={{ color: fresh }} className={TAB}>
        Fresh fitting
      </motion.span>
    </div>
  );
}

/** The tab row of the pane box. It shows with the first page swap and only its highlight moves after that. */
export function PaneTabs({ m }: { m: GateMotion }) {
  const opacity = useTransform(m.panePos, (v) => revealAt(v, 1));
  const inset = LAYOUT.panePad;
  return (
    <motion.div style={{ opacity, top: inset, left: inset, right: inset }} className="absolute z-[15]">
      <TabsRow tab={m.tab} />
    </motion.div>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 shrink-0">
      <path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="var(--color-dim)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Placeholder() {
  return (
    <div className="flex h-full items-center justify-between gap-2 rounded-lg border border-dashed border-line-strong px-3">
      <span className={`${MONO} text-[10px] uppercase tracking-[0.12em] text-mute`}>pattern</span>
      <span className="flex min-w-0 items-center gap-2 text-[12px] text-dim">
        <span className="truncate">{HINT.choose}</span>
        <Chevron />
      </span>
    </div>
  );
}

export function Selector({ m }: { m: GateMotion }) {
  const chosen = MEN_PATTERNS[PICK.pattern];
  const pages = [<Placeholder key="p" />, <PatternCard key="c" name={chosen.name} gender={chosen.gender} state="saved" selected={m.sel} />];
  return <WipeStack pos={m.selPos} pages={pages} className="h-full" />;
}

function GhostPill({ name, on }: { name: string; on: MvIn }) {
  const t = useMv(on);
  const border = useTransform(t, (v) => mixColor("var(--color-accent)", v, "var(--color-line-strong)"));
  const color = useTransform(t, (v) => mixColor("var(--color-fg)", v, "var(--color-mute)"));
  return (
    <motion.span style={{ borderColor: border, color }} className="min-w-0 truncate rounded-full border px-2 py-[3px] text-[11px] leading-4">
      {name}
    </motion.span>
  );
}

/* The three men's patterns the dropdown lists, as quiet pills that fill the pane under the filter note. */
function GhostRow({ sel }: { sel: MV }) {
  return (
    <div className="flex gap-1.5 overflow-hidden">
      {MEN_PATTERNS.map((pattern, i) => (
        <GhostPill key={pattern.id} name={pattern.name} on={i === PICK.pattern ? sel : 0} />
      ))}
    </div>
  );
}

export function SavedPane({ m }: { m: GateMotion }) {
  return (
    <Ink className="flex h-full flex-col" style={{ padding: LAYOUT.panePad, gap: LAYOUT.gap }}>
      <TabsSpacer />
      <div className="relative shrink-0" style={{ height: LAYOUT.rowH }}>
        <Selector m={m} />
      </div>
      <p className={`${MONO} flex items-center gap-1.5 text-[10px] text-mute`}>
        <MtmGlyph name="filter" size={14} />
        {HINT.filtered}
      </p>
      <GhostRow sel={m.sel} />
    </Ink>
  );
}
