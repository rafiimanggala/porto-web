"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CAPTION_LINES, VOICE, WORDS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { segAt } from "./PipeKitMath";
import { FILE_NAME, TL, TONES } from "./PipeVoiceData";
import { LINE_WORDS, groupAt, lineIdxAt, parseAt, parseFlashAt, rowInAt, rowsShownAt, wordCur, wordReach } from "./PipeVoiceMath";

/* Card pages: the transcript log and the caption lines. */

const ROW_TEXT = `${MONO} text-[10px] leading-none @[30rem]:text-[13px]`;
const PAD = "p-[clamp(6px,1.8cqw,10px)]";

const LOG_COLS = "grid-cols-[minmax(0,1fr)_auto_auto] gap-x-2 @[30rem]:gap-x-4";
const LOG_BOTTOM_PX = 8;
const LOG_LAST = WORDS.length - 1;

function LogRow({ i, reached }: { i: number; reached: MV }) {
  const w = WORDS[i];
  /* The last row keeps its highlight until the hand-off to the next page. */
  const cur = useTransform(reached, (t) => (i === LOG_LAST ? wordReach(t, i) : wordCur(t, i)));
  const appear = useTransform(reached, (t) => rowInAt(t, i));
  const y = useTransform(appear, (a) => `${((1 - a) * 6).toFixed(2)}px`);
  return (
    <motion.div style={{ opacity: appear, y }} className={`${ROW_TEXT} relative grid h-[var(--rh)] ${LOG_COLS} items-center px-2`}>
      <motion.i aria-hidden style={{ opacity: cur }} className="absolute inset-y-px left-0 right-0 rounded border border-accent bg-accent/15" />
      <span className="relative truncate text-fg">{w.w}</span>
      <span className="relative tabular-nums text-dim">{w.start.toFixed(2)}</span>
      <span className="relative tabular-nums text-mute">{w.end.toFixed(2)}</span>
    </motion.div>
  );
}

/* Rows scroll up under a top fade that only grows once the list overflows, so the newest row is never cut. */
const scrolledPx = (rows: number) => `max(0px, var(--rh) * ${rows.toFixed(3)} - (100% - ${LOG_BOTTOM_PX}px))`;
const topFade = (rows: number) => `linear-gradient(to bottom, transparent, #000 min(calc(var(--rh) * 1.2), ${scrolledPx(rows)}))`;

export function LogPage({ reached }: { reached: MV }) {
  const rows = useTransform(reached, rowsShownAt);
  const y = useTransform(rows, (n) => `calc(-1 * ${scrolledPx(n)})`);
  const mask = useTransform(rows, topFade);
  const waiting = useTransform(rows, (n) => 1 - Math.min(1, n * 2));
  return (
    <div className={`flex h-full flex-col ${PAD}`}>
      <div className={`${ROW_TEXT} grid h-[var(--rh)] shrink-0 ${LOG_COLS} items-center whitespace-nowrap border-b border-line px-2 text-mute`}>
        <span>word (0-9 s)</span>
        <span>start</span>
        <span>end</span>
      </div>
      <motion.div style={{ maskImage: mask, WebkitMaskImage: mask }} className="relative min-h-0 flex-1 overflow-hidden">
        <motion.span style={{ opacity: waiting }} className={`${ROW_TEXT} absolute left-2 top-[calc(var(--rh)*1.3)] text-mute`}>
          {VOICE.transcriber} is listening
        </motion.span>
        <motion.div style={{ y }} className="absolute inset-x-0 top-0 h-full">
          {WORDS.map((w, i) => (
            <LogRow key={w.start} i={i} reached={reached} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function LineRow({ k, p }: { k: number; p: MV }) {
  const line = CAPTION_LINES[k];
  const t = useTransform(p, (v) => groupAt(v, k));
  const parse = useTransform(p, (v) => parseAt(v, k));
  const wordsOpacity = useTransform(t, (v) => segAt(v, 0, 0.2));
  const slotOpacity = useTransform(wordsOpacity, (v) => 1 - v);
  const gap = useTransform(t, (v) => `calc(1ch + ${((1 - v) * 9).toFixed(2)}px)`);
  const pad = useTransform(t, (v) => `${((1 - v) * 4).toFixed(2)}px`);
  const pill = useTransform(t, (v) => 1 - v);
  const range = useTransform(parse, (r) => `inset(0 ${(100 - r * 100).toFixed(2)}% 0 0)`);
  const flash = useTransform(p, (v) => parseFlashAt(v, k));
  return (
    <div className={`${ROW_TEXT} relative flex min-h-0 flex-1 items-center gap-1.5 px-2 @[30rem]:gap-2`}>
      <motion.i aria-hidden style={{ opacity: slotOpacity }} className="absolute inset-x-0 inset-y-px rounded border border-dashed border-line" />
      <motion.i aria-hidden style={{ opacity: flash }} className="absolute inset-x-0 inset-y-px rounded border border-accent bg-accent/10" />
      <motion.i aria-hidden style={{ scale: t, opacity: t, background: TONES[k % TONES.length] }} className="relative h-1.5 w-1.5 shrink-0 rounded-full" />
      <motion.span style={{ opacity: wordsOpacity, columnGap: gap }} className="relative flex min-w-0 items-center overflow-hidden whitespace-nowrap py-0.5">
        {LINE_WORDS[k].map((w) => (
          <motion.span key={w.start} style={{ paddingInline: pad }} className="relative">
            <motion.i aria-hidden style={{ opacity: pill }} className="absolute -inset-y-px inset-x-0 rounded-[4px] border border-line-strong bg-surface-2" />
            <span className="relative text-fg">{w.w}</span>
          </motion.span>
        ))}
      </motion.span>
      <motion.span style={{ clipPath: range }} className="relative ml-auto shrink-0 text-right tabular-nums text-mute">
        <span className="@[30rem]:hidden">{line.start.toFixed(2)}</span>
        <span className="hidden @[30rem]:inline">{`${line.start.toFixed(2)}→${line.end.toFixed(2)}`}</span>
      </motion.span>
    </div>
  );
}

/* The slot opens first and stays empty, then the row fades in: its text is never cut by the growing box. */
function AudioRow({ p }: { p: MV }) {
  const [from, to] = TL.audioRow;
  const mid = (from + to) / 2;
  const open = useSeg(p, from, mid, easeOutCubic);
  const show = useSeg(p, mid, to);
  const height = useTransform(open, (v) => `calc(var(--rh) * ${v.toFixed(3)})`);
  return (
    <motion.div style={{ height }} className="shrink-0 overflow-hidden">
      <motion.div style={{ opacity: show }} className={`${ROW_TEXT} flex h-[var(--rh)] items-center gap-1.5 rounded border border-mint/70 bg-surface-2 px-1.5 @[30rem]:gap-2 @[30rem]:px-2`}>
        <PipeGlyph name="speaker" size={14} />
        <span className="text-mute">audio_url</span>
        <span className="min-w-0 flex-1 truncate text-fg">{FILE_NAME}</span>
        <span className="hidden tabular-nums text-dim @[30rem]:inline">{VOICE.label}</span>
      </motion.div>
    </motion.div>
  );
}

function Cursor({ p, phoneHead }: { p: MV; phoneHead: MV }) {
  const on = useSeg(p, TL.voiced, TL.sweepB[0]);
  const top = useTransform(phoneHead, (t) => `${((lineIdxAt(t) / CAPTION_LINES.length) * 100).toFixed(3)}%`);
  return (
    <motion.i
      aria-hidden
      style={{ top, opacity: on, height: `${100 / CAPTION_LINES.length}%` }}
      className="pointer-events-none absolute inset-x-0 z-10 rounded-md border-2 border-accent bg-accent/15"
    />
  );
}

export function LinesPage({ p, phoneHead }: { p: MV; phoneHead: MV }) {
  return (
    <div className={`flex h-full flex-col gap-[3px] ${PAD}`}>
      <AudioRow p={p} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Cursor p={p} phoneHead={phoneHead} />
        {CAPTION_LINES.map((l, k) => (
          <LineRow key={l.start} k={k} p={p} />
        ))}
      </div>
    </div>
  );
}
