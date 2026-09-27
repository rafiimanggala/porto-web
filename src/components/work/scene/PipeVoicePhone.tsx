"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { CAPTION_LINES, RENDER, WORDS } from "./PipeKitData";
import { PipePhone } from "./PipeKitPhone";
import { segAt } from "./PipeKitMath";
import { SAMPLE_END, TL } from "./PipeVoiceData";
import { LINE_WORDS, loudAt, lineIdxAt, wordCur, wordReach } from "./PipeVoiceMath";

/* 9:16 preview with a rising sun, an equalizer and the karaoke caption. */

/* One line per caption: at this size the longest one still fits the pill, so a word is never left alone on a second row. */
const LINE_EM = 2.1;
const EQ_BARS = 7;
const SUN_FROM = 108;
const SUN_TO = 86;
const TINT = (c: string, n: number) => `color-mix(in oklab, var(--color-${c}) ${n}%, transparent)`;

function Frame({ p }: { p: MV }) {
  const sunY = useTransform(p, [0, 0.4, 1], [SUN_FROM, SUN_TO + 6, SUN_TO]);
  return (
    <svg viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden className="absolute inset-0 h-full w-full">
      <motion.circle cx="45" cy={sunY} r="19" fill={TINT("sun", 55)} />
      <rect y="98" width="90" height="62" fill="var(--color-surface-2)" />
      <path d="M0 98H90" stroke="var(--color-line-strong)" strokeWidth="1" />
      <g stroke="var(--color-fg)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="17" y="121" width="6" height="24" rx="1.5" fill={TINT("sky", 40)} />
        <rect x="21" y="132" width="52" height="10" rx="2" fill={TINT("sky", 50)} />
        <rect x="25" y="127" width="14" height="5.4" rx="2.7" fill={TINT("sun", 55)} />
        <path d="M27 142V146M67 142V146" />
      </g>
    </svg>
  );
}

/* At rest from the first frame, dancing once audio plays, gone when the captions take over: the phone is never an empty panel. */
const WOBBLE = 0.05;

function EqBar({ k, p, head, on }: { k: number; p: MV; head: MV; on: MV }) {
  const scale = useTransform([head, p], ([t, v]: number[]) => 0.12 + 0.88 * loudAt(t + (k - EQ_BARS / 2) * 0.06) + WOBBLE * Math.sin(v * 90 + k * 1.7));
  return <motion.i style={{ scaleY: scale, opacity: on }} className="h-full w-[9%] rounded-full bg-fg" />;
}

function Equalizer({ p, head }: { p: MV; head: MV }) {
  const on = useTransform(p, (v) => segAt(v, 0, TL.inlet[1]) * (1 - segAt(v, TL.phoneOn[0], TL.phoneOn[1])));
  return (
    <div aria-hidden className="absolute inset-x-[10%] top-[14%] flex h-[12%] items-center justify-center gap-[4%]">
      {Array.from({ length: EQ_BARS }, (_, k) => (
        <EqBar key={k} k={k} p={p} head={head} on={on} />
      ))}
    </div>
  );
}

function PhoneWord({ i, head }: { i: number; head: MV }) {
  const reach = useTransform(head, (t) => wordReach(t, i));
  const cur = useTransform(head, (t) => wordCur(t, i));
  const color = useTransform(reach, (r) => `color-mix(in oklab, var(--color-fg) ${(r * 100).toFixed(1)}%, var(--color-dim))`);
  const scale = useTransform(cur, (c) => 1 + 0.08 * c);
  return (
    <motion.span style={{ color, scale }} className="relative rounded-[0.25em] px-[0.14em]">
      <motion.i aria-hidden style={{ opacity: cur }} className="absolute inset-0 rounded-[0.25em] bg-accent" />
      <span className="relative text-inherit">{WORDS[i].w}</span>
    </motion.span>
  );
}

function PhoneLine({ k, head }: { k: number; head: MV }) {
  return (
    <div className="flex flex-nowrap items-center justify-center gap-x-[0.16em] whitespace-nowrap" style={{ height: `${LINE_EM}em` }}>
      {LINE_WORDS[k].map((w, j) => (
        <PhoneWord key={w.start} i={CAPTION_LINES[k].from + j} head={head} />
      ))}
    </div>
  );
}

/* The caption pill is opaque and wipes open from its centre over the first part of the window. Its text is not shown
   until the wipe has finished, then fades in, so no glyph is ever caught half cut or half faded at the reveal edge. */
const WIPE_END = 0.6;

function Captions({ p, head }: { p: MV; head: MV }) {
  const on = useSeg(p, TL.phoneOn[0], TL.phoneOn[1]);
  const y = useTransform(head, (t) => `${(-lineIdxAt(t) / CAPTION_LINES.length) * 100}%`);
  const open = useTransform(on, (v) => segAt(v, 0, WIPE_END));
  const clip = useTransform(open, (o) => `inset(0 ${((1 - o) * 50).toFixed(2)}% 0 ${((1 - o) * 50).toFixed(2)}% round 0.5em)`);
  const text = useTransform(on, (v) => segAt(v, WIPE_END, 1));
  return (
    <div className="absolute inset-x-[4%] bottom-[30%]">
      <motion.div style={{ clipPath: clip, height: `${LINE_EM}em` }} className="overflow-hidden rounded-[0.5em] bg-bg text-[max(10px,8.6cqw)] font-semibold leading-[1.3]">
        <motion.div style={{ y, opacity: text }} className="flex flex-col">
          {CAPTION_LINES.map((l, k) => (
            <PhoneLine key={l.start} k={k} head={head} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function Scrub({ p, head }: { p: MV; head: MV }) {
  const scale = useTransform(head, (t) => t / SAMPLE_END);
  const on = useSeg(p, TL.phoneOn[0], TL.phoneOn[1]);
  return (
    <motion.div aria-hidden style={{ opacity: on }} className="absolute inset-x-[6%] bottom-[5%] h-[3px] rounded-full bg-line-strong">
      <motion.i style={{ scaleX: scale }} className="absolute inset-0 origin-left rounded-full bg-accent" />
    </motion.div>
  );
}

export default function Phone({ p, head, phoneHead }: { p: MV; head: MV; phoneHead: MV }) {
  return (
    <PipePhone width="calc(22.1cqh)">
      <Frame p={p} />
      <span className={`${MONO} absolute left-[8%] top-[6%] text-[10px] leading-none text-mute`}>{RENDER.ratio}</span>
      <Equalizer p={p} head={head} />
      <Captions p={p} head={phoneHead} />
      <Scrub p={p} head={phoneHead} />
    </PipePhone>
  );
}
