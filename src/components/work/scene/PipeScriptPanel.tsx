"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { BLOCKS, SCRIPT, TAGS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { segAt } from "./PipeKitMath";
import { SceneIcon } from "./SceneIcon";
import { BRIEF, BRIEF_SIZE, CAPTION_TEXT, KEPT_TAGS, LAND, PHRASES, ROW_AT, TL, WIPES } from "./PipeScriptData";
import { CAPTION_LINES, FOLD_END, PANEL, TYPE_AT, fetchedAt, markedAt, wordsAt, writtenAt } from "./PipeScriptLayout";
import { Roll, TXT, boxAt, fs, tri, u } from "./PipeScriptKit";

/* The lower panel is the model's side of the story. Its icon slot keeps the bulb (the AI mark) except in chapter three,
   and its text pages swap a little before each chapter boundary: the brief, the word counter, the tag counts, the second
   pass. A swap is a fade out then a fade in with a small slide, so two pages are never on screen at once. */

const ICON = 30;
const ICON_X = 9;
const PAGES_X = 50;
const BUMP = 0.14;
const BUMP_WIDTH = 0.012;
const BUMPS = [...LAND, ...ROW_AT];
const SLIDE = 5;
const NUMERAL = "font-[ui-monospace,SFMono-Regular,Menlo,monospace] font-semibold leading-none tabular-nums text-fg";

/* A swap window [from, to]: the old page is gone by OUT_BY of it, the new one starts at IN_FROM, so only one page is ever visible. */
type Swap = readonly [number, number];
const OUT_BY = 0.5;
const IN_FROM = 0.5;
const outOf = (v: number, w: Swap) => segAt(v, w[0], w[0] + (w[1] - w[0]) * OUT_BY);
const intoOf = (v: number, w: Swap) => segAt(v, w[0] + (w[1] - w[0]) * IN_FROM, w[1]);

/** Visibility of a page that is shown after swap `prev` and before swap `next` (none at either end of the story). */
function pageOpacity(v: number, prev?: Swap, next?: Swap) {
  return Math.min(prev ? intoOf(v, prev) : 1, next ? 1 - outOf(v, next) : 1);
}

/** Slide in units: a page arrives from below and leaves upwards. */
function pageShift(v: number, prev?: Swap, next?: Swap) {
  return ((prev ? 1 - intoOf(v, prev) : 0) - (next ? outOf(v, next) : 0)) * SLIDE;
}

function Page({ p, prev, next, row = false, children }: { p: MV; prev?: Swap; next?: Swap; row?: boolean; children: ReactNode }) {
  const opacity = useTransform(p, (v) => pageOpacity(v, prev, next));
  const top = useTransform(p, (v) => `calc(var(--u) * ${pageShift(v, prev, next).toFixed(2)})`);
  return (
    <motion.div
      style={{ opacity, top, gap: u(3), fontSize: fs(TXT), lineHeight: 1.3 }}
      className={`${MONO} absolute inset-x-0 bottom-0 flex justify-center ${row ? "flex-row items-center" : "flex-col"}`}
    >
      {children}
    </motion.div>
  );
}

function BriefPage({ p }: { p: MV }) {
  const marked = useTransform(p, (v) => `${markedAt(v)}/${PHRASES.length}`);
  return (
    <Page p={p} next={WIPES[0]}>
      <span className="whitespace-nowrap text-fg">{BRIEF}</span>
      <span className="flex items-center justify-between whitespace-nowrap text-dim">
        <span>{BRIEF_SIZE}</span>
        <span>
          {"phrases "}
          <motion.span className="tabular-nums text-fg">{marked}</motion.span>
        </span>
      </span>
    </Page>
  );
}

function WordsPage({ p }: { p: MV }) {
  const words = useTransform(p, (v) => String(wordsAt(v)));
  const pop = useTransform(p, (v) => 1 + 0.1 * tri(v, FOLD_END, 0.012));
  const blocks = useTransform(p, (v) => `${writtenAt(v)}/${BLOCKS.length}`);
  return (
    <Page p={p} prev={WIPES[0]} next={WIPES[1]} row>
      <motion.span style={{ scale: pop, width: u(63), fontSize: u(30) }} className={`${NUMERAL} block origin-left`}>
        <motion.span>{words}</motion.span>
      </motion.span>
      <span className="flex flex-col whitespace-nowrap">
        <span className="text-fg">words</span>
        <span className="text-dim">{`${SCRIPT.seconds} s script`}</span>
      </span>
      <span className="ml-auto whitespace-nowrap text-dim">
        {"blocks "}
        <motion.span className="tabular-nums text-fg">{blocks}</motion.span>
      </span>
    </Page>
  );
}

function TrendsPage({ p }: { p: MV }) {
  const swap = useSeg(p, TL.scan[1] - 0.012, TL.scan[1] + 0.012, easeInOutCubic);
  const fetched = useTransform(p, (v) => String(fetchedAt(v)));
  return (
    <Page p={p} prev={WIPES[1]} next={WIPES[2]} row>
      <span style={{ width: u(36), fontSize: u(28) }} className={`${NUMERAL} block`}>
        <Roll t={swap} a={<motion.span>{fetched}</motion.span>} b={KEPT_TAGS.length} />
      </span>
      <span className="block text-fg" style={{ width: u(52) }}>
        <Roll t={swap} a="fetched" b="kept" />
      </span>
      <span className="ml-auto flex flex-col whitespace-nowrap text-right">
        <span className="text-fg">trending hashtags</span>
        <span className="text-dim">{`keeps ${KEPT_TAGS.length} of ${TAGS.length}`}</span>
      </span>
    </Page>
  );
}

const typedChars = (v: number) =>
  Math.round(CAPTION_LINES.reduce((sum, line, i) => sum + (line.length + (i < CAPTION_LINES.length - 1 ? 1 : 0)) * segAt(v, TYPE_AT[i], TYPE_AT[i + 1]), 0));

function CaptionPage({ p }: { p: MV }) {
  const chars = useTransform(p, (v) => `${typedChars(v)}/${CAPTION_TEXT.length}`);
  return (
    <Page p={p} prev={WIPES[2]}>
      <span className="whitespace-nowrap text-fg">{`second pass: script + ${KEPT_TAGS.length} tags`}</span>
      <span className="flex items-center justify-between whitespace-nowrap text-dim">
        <span>writes the caption</span>
        <span>
          {"chars "}
          <motion.span className="tabular-nums text-fg">{chars}</motion.span>
        </span>
      </span>
    </Page>
  );
}

function Icons({ p }: { p: MV }) {
  const bulb = useTransform(p, (v) => 1 - outOf(v, WIPES[1]) * (1 - intoOf(v, WIPES[2])));
  const globe = useTransform(p, (v) => intoOf(v, WIPES[1]) * (1 - outOf(v, WIPES[2])));
  const scale = useTransform(p, (v) => 1 + BUMP * Math.max(...BUMPS.map((t) => tri(v, t, BUMP_WIDTH))));
  const slot = { left: u(ICON_X), top: `calc(50% - ${u(ICON / 2)})`, width: u(ICON), height: u(ICON) };
  return (
    <>
      <motion.span aria-hidden style={{ ...slot, opacity: bulb, scale }} className="absolute block">
        <SceneIcon name="insight" size={32} className="h-full w-full" />
      </motion.span>
      <motion.span aria-hidden style={{ ...slot, opacity: globe }} className="absolute grid place-items-center">
        <PipeGlyph name="globe" size="88%" />
      </motion.span>
    </>
  );
}

export function Panel({ p }: { p: MV }) {
  return (
    <div style={boxAt(0, PANEL.y, 358, PANEL.h)} className="absolute overflow-hidden rounded-lg border border-line-strong bg-surface-1">
      <Icons p={p} />
      <div style={{ left: u(PAGES_X), right: u(8) }} className="absolute inset-y-0">
        <BriefPage p={p} />
        <WordsPage p={p} />
        <TrendsPage p={p} />
        <CaptionPage p={p} />
      </div>
    </div>
  );
}
