"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { CAPTION_LINES, SCRIPT, VOICE, fmtClock, wordsStartedAt } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { clamp01, pct, useKeys } from "./PipeKitMath";
import { CARD_TITLES, CARD_TITLES_NARROW, FILE_NAME, MORE_WORDS, SAMPLE_SECONDS, SCRIPT_LINES, SCRIPT_META, SCRIPT_META_NARROW, TL } from "./PipeVoiceData";
import { groupedCount, hash01, reachedAt } from "./PipeVoiceMath";
import { LinesPage, LogPage } from "./PipeVoiceCardPages";

/* Data card: rolling header, wipe pages, script to sound then the audio file. */

const PAGE_KEYS = [TL.pageLog[0], TL.pageLog[1], TL.pageLines[0], TL.pageLines[1]];
const PAGE_VALS = [0, 1, 1, 2];
const ROLL_KEYS = [...PAGE_KEYS, TL.pageMerge[0], TL.pageMerge[1]];
const ROLL_VALS = [0, 1, 1, 2, 2, 3];

function Page({ pos, k, children }: { pos: MV; k: number; children: ReactNode }) {
  const shown = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const cover = useTransform(pos, (v) => clamp01(v - k));
  const clip = useTransform([shown, cover], ([s, c]: number[]) => `inset(0 ${pct(100 - s * 100)} 0 ${pct(c * 100)})`);
  /* The page being wiped away clears in the first moments of the wipe, so no cut columns or half words are left beside the edge. */
  const dim = useTransform(cover, (c) => 1 - clamp01(c / 0.18));
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      <motion.div style={{ opacity: dim }} className="h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

function ScanEdge({ pos, k }: { pos: MV; k: number }) {
  const front = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return <motion.i aria-hidden style={{ left, opacity }} className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent" />;
}

function Counter({ p, of }: { p: MV; of: (v: number) => string }) {
  const text = useTransform(p, of);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

const startedText = (v: number) => wordsStartedAt(reachedAt(v));
const wordsText = (v: number) => `${startedText(v)} of ${SCRIPT.words} words`;
const wordsNarrow = (v: number) => `${startedText(v)}/${SCRIPT.words}`;
/* The card lists the first seconds only: every count that could read as the whole voiceover says so. */
const linesText = (v: number) => `${groupedCount(v)} lines, first ${SAMPLE_SECONDS} s`;
const linesNarrow = (v: number) => `${groupedCount(v)} lines, ${SAMPLE_SECONDS} s`;
const packText = `${VOICE.label} + first ${CAPTION_LINES.length} lines`;

/* Wide and phone variants of one piece of text, switched by the scene's container width. */
function Both({ wide, narrow }: { wide: ReactNode; narrow: ReactNode }) {
  return (
    <>
      <span className="hidden @[30rem]:inline">{wide}</span>
      <span className="@[30rem]:hidden">{narrow}</span>
    </>
  );
}

/* One header per page. Each is fully visible only within a sixth of its slot and gone by a third, so the old one has
   left before the next appears and they are never seen as a double exposure. */
function HeaderRow({ k, idx, right }: { k: number; idx: MV; right: ReactNode }) {
  const opacity = useTransform(idx, (v) => clamp01(2 - 6 * Math.abs(v - k)));
  const y = useTransform(idx, (v) => `${((k - v) * 60).toFixed(2)}%`);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-fg">
        <Both wide={CARD_TITLES[k]} narrow={CARD_TITLES_NARROW[k]} />
      </span>
      <span className="shrink-0 text-right text-dim">{right}</span>
    </motion.div>
  );
}

function Header({ p }: { p: MV }) {
  const idx = useKeys(p, ROLL_KEYS, ROLL_VALS);
  const rights: ReactNode[] = [
    <Both key="s" wide={SCRIPT_META} narrow={SCRIPT_META_NARROW} />,
    <Both key="w" wide={<Counter p={p} of={wordsText} />} narrow={<Counter p={p} of={wordsNarrow} />} />,
    <Both key="l" wide={<Counter p={p} of={linesText} />} narrow={<Counter p={p} of={linesNarrow} />} />,
    <Both key="a" wide={packText} narrow={VOICE.label} />,
  ];
  return (
    <div className={`${MONO} border-b border-line-strong bg-surface-2 px-[clamp(8px,2.4cqw,14px)] py-1 text-[10px] @[30rem]:text-[11.5px]`}>
      <div className="relative h-[1.5em] overflow-hidden leading-[1.5em]">
        {rights.map((right, k) => (
          <HeaderRow key={k} k={k} idx={idx} right={right} />
        ))}
      </div>
    </div>
  );
}

const bars = (line: string) => Array.from(line, (ch, i) => (ch === " " ? 12 : 28 + Math.round(72 * hash01(ch.charCodeAt(0) * 31 + i * 7))));

function ScriptLine({ text, p, a }: { text: string; p: MV; a: number }) {
  const t = useSeg(p, a, a + TL.morph.len);
  const front = useTransform(t, [0.05, 0.95], [0, 100], { clamp: true });
  const rawClip = useTransform(front, (f) => `inset(0 0 0 ${f.toFixed(2)}%)`);
  const barClip = useTransform(front, (f) => `inset(0 ${(100 - f).toFixed(2)}% 0 0)`);
  const edge = useTransform(front, (f) => `${f.toFixed(2)}%`);
  const edgeOp = useTransform(t, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return (
    <div className="relative w-fit">
      <motion.p style={{ clipPath: rawClip }} className={`${MONO} whitespace-pre text-[clamp(10px,2.8cqw,19px)] leading-[1.45] text-fg`}>
        {text}
      </motion.p>
      <motion.div aria-hidden style={{ clipPath: barClip }} className={`${MONO} absolute inset-0 flex items-center text-[clamp(10px,2.8cqw,19px)]`}>
        {bars(text).map((h, i) => (
          <span key={i} className="flex h-full w-[1ch] items-center justify-center">
            <i className="block w-[0.5ch] rounded-full bg-dim" style={{ height: `${h}%` }} />
          </span>
        ))}
      </motion.div>
      <motion.i aria-hidden style={{ left: edge, opacity: edgeOp }} className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

function FileRow({ p }: { p: MV }) {
  const t = useSeg(p, TL.file[0], TL.file[1]);
  const slot = useTransform(t, (v) => 1 - Math.min(1, v * 4));
  const content = useTransform(t, (v) => 0.45 + 0.55 * v);
  const clock = useTransform(t, (v) => fmtClock(Math.round(VOICE.seconds * v)));
  return (
    <div className={`${MONO} relative flex items-center gap-2 rounded-md px-2 py-0.5 text-[10px] @[30rem]:text-[12px]`}>
      <motion.i aria-hidden style={{ opacity: slot }} className="absolute inset-0 rounded-md border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: t }} className="absolute inset-0 rounded-md border border-line-strong bg-surface-2" />
      <motion.span style={{ opacity: content }} className="relative flex min-w-0 flex-1 items-center gap-2">
        <PipeGlyph name="speaker" size={16} />
        <span className="min-w-0 flex-1 truncate text-fg">{FILE_NAME}</span>
        <motion.span className="tabular-nums text-dim">{clock}</motion.span>
      </motion.span>
    </div>
  );
}

function ScriptPage({ p }: { p: MV }) {
  return (
    <div className="flex h-full flex-col justify-between gap-1 p-[clamp(8px,2.4cqw,14px)]">
      <div className="flex min-h-0 flex-col overflow-hidden">
        {SCRIPT_LINES.map((line, k) => (
          <ScriptLine key={line} text={line} p={p} a={TL.morph.from + k * TL.morph.lag} />
        ))}
        <span className={`${MONO} mt-1.5 w-fit rounded-full border border-line-strong bg-surface-2 px-2 py-0.5 text-[10px] leading-none text-dim @[30rem]:text-[11.5px]`}>{`… ${MORE_WORDS} more words`}</span>
      </div>
      <FileRow p={p} />
    </div>
  );
}

export default function Card({ p, reached, phoneHead }: { p: MV; reached: MV; phoneHead: MV }) {
  const pos = useKeys(p, PAGE_KEYS, PAGE_VALS);
  return (
    <div className="relative flex min-w-0 flex-1 flex-col self-stretch overflow-hidden rounded-xl border border-line-strong bg-surface-1 [--rh:15px] @[30rem]:[--rh:24px]">
      <Header p={p} />
      <div className="relative min-h-0 flex-1">
        <Page pos={pos} k={0}>
          <ScriptPage p={p} />
        </Page>
        <Page pos={pos} k={1}>
          <LogPage reached={reached} />
        </Page>
        <Page pos={pos} k={2}>
          <LinesPage p={p} phoneHead={phoneHead} />
        </Page>
        <ScanEdge pos={pos} k={1} />
        <ScanEdge pos={pos} k={2} />
      </div>
    </div>
  );
}
