"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { IMAGE_JOBS, READY_STATUS, RENDER, ROW_ID, SCRIPT } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { PipePhone } from "./PipeKitPhone";
import { Pulse, Wire, linePath } from "./PipeKitWire";
import { ArtView } from "./PipeRenderArt";
import { CARD, FH, FILE_NAME, FW, LINK_TEXT, PHONE, RECORD, SIZE_TEXT, SPEC_TEXT, STRIP, TL, WRITE_X } from "./PipeRenderData";
import { blockIndexAt, captionAt, playSeconds } from "./PipeRenderMath";
import { BIG_TEXT, pctX, pctY, unit } from "./PipeRenderKit";
import { Typed } from "./PipeRenderType";

/* The finished video: a phone that plays the render (hard cuts between the five images, real caption lines), the file card
   with the MP4 name, and the wire that writes the link back to the sheet row. */

const WRITE_TO_ROW = linePath([WRITE_X, CARD.y + CARD.h], [WRITE_X, RECORD.y]);
const WRITE_TO_STRIP = linePath([WRITE_X, RECORD.y + RECORD.h], [WRITE_X, STRIP.y]);
const CARD_LINES = [FILE_NAME, SIZE_TEXT, SPEC_TEXT] as const;

function ScreenArt({ i, block }: { i: number; block: MV }) {
  const opacity = useTransform(block, (b) => (b === i ? 1 : 0));
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <ArtView i={i} />
    </motion.div>
  );
}

function Screen({ p }: { p: MV }) {
  const t = useTransform(p, playSeconds);
  const block = useTransform(t, blockIndexAt);
  const caption = useTransform(t, captionAt);
  const capOn = useTransform(caption, (c) => (c ? 1 : 0));
  const bar = useTransform(t, (s) => s / SCRIPT.seconds);
  const playOn = useTransform(p, [TL.playOn[0], TL.playOn[1], TL.play[0] - 0.008, TL.play[0]], [0, 1, 1, 0]);
  return (
    <>
      {IMAGE_JOBS.map((j, i) => (
        <ScreenArt key={j.id} i={i} block={block} />
      ))}
      <span className="absolute left-[8%] top-[6%] text-[10px] leading-none text-mute">{RENDER.ratio}</span>
      <motion.div style={{ opacity: capOn }} className="absolute inset-x-[4%] bottom-[9%] flex justify-center">
        <motion.span className="text-balance rounded-[0.5em] bg-bg px-[0.5em] py-[0.25em] text-center text-[max(10px,7.4cqw)] font-semibold leading-[1.25] text-fg">
          {caption}
        </motion.span>
      </motion.div>
      <motion.i
        aria-hidden
        style={{ opacity: playOn }}
        className="absolute left-1/2 top-[44%] grid h-[27cqw] w-[27cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-bg"
      >
        <PipeGlyph name="play" size="58%" />
      </motion.i>
      <i aria-hidden className="absolute inset-x-[6%] bottom-[5%] h-[3px] rounded-full bg-line-strong" />
      <motion.i aria-hidden style={{ scaleX: bar }} className="absolute inset-x-[6%] bottom-[5%] h-[3px] origin-left rounded-full bg-accent" />
    </>
  );
}

/** A card line types itself letter by letter, so no glyph is ever cut in half. */
function CardLine({ p, k, className, children }: { p: MV; k: number; className: string; children: string }) {
  const a = TL.card[0] + k * 0.007;
  const t = useSeg(p, a, a + 0.016);
  return <Typed text={children} t={t} className={`block whitespace-nowrap ${className}`} />;
}

function FileCard({ p }: { p: MV }) {
  const saved = useSeg(p, TL.saved[0], TL.saved[1], easeOutBack);
  const savedText = useSeg(p, TL.saved[0], TL.saved[1]);
  const frame = useSeg(p, TL.card[0] - 0.004, TL.card[0] + 0.01);
  return (
    <motion.div
      style={{
        opacity: frame,
        left: pctX(CARD.x),
        top: pctY(CARD.y),
        width: pctX(CARD.w),
        height: pctY(CARD.h),
        padding: unit(8),
      }}
      className="absolute flex flex-col justify-between rounded-lg border border-line-strong bg-surface-1"
    >
      <div className="flex items-center gap-[calc(var(--u)*6)]">
        <PipeGlyph name="film" size={unit(24)} />
        <CardLine p={p} k={0} className={`${BIG_TEXT} text-fg`}>
          {CARD_LINES[0]}
        </CardLine>
        <motion.span aria-hidden style={{ opacity: savedText }} className="ml-auto shrink-0 text-mint">
          saved
        </motion.span>
        <motion.i
          aria-hidden
          style={{ scale: saved, width: unit(18), height: unit(18) }}
          className="grid shrink-0 place-items-center rounded-full bg-mint text-pastel-ink"
        >
          <svg viewBox="0 0 16 16" className="h-[64%] w-[64%]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.4 8.6l3 3 6.2-6.6" />
          </svg>
        </motion.i>
      </div>
      <div>
        <CardLine p={p} k={1} className="text-dim">
          {CARD_LINES[1]}
        </CardLine>
        <CardLine p={p} k={2} className="text-dim">
          {CARD_LINES[2]}
        </CardLine>
      </div>
    </motion.div>
  );
}

function RecordCard({ p }: { p: MV }) {
  const on = useSeg(p, TL.record[0], TL.record[0] + 0.008);
  const ghost = useSeg(p, TL.card[0], TL.card[0] + 0.014);
  const mid = (TL.record[0] + 0.004 + TL.record[1]) / 2;
  const linkT = useSeg(p, TL.record[0] + 0.004, mid);
  const statusT = useSeg(p, mid, TL.record[1]);
  const dashed = useTransform(on, (o) => 1 - o);
  const title = useTransform(on, (o) => `color-mix(in oklab, var(--color-fg) ${(o * 100).toFixed(1)}%, var(--color-mute))`);
  const box = { left: pctX(RECORD.x), top: pctY(RECORD.y), width: pctX(RECORD.w), height: pctY(RECORD.h) };
  return (
    <div aria-hidden className="absolute" style={box}>
      <motion.i style={{ opacity: on }} className="absolute inset-0 rounded-lg border border-line-strong bg-surface-1" />
      <motion.i style={{ opacity: dashed }} className="absolute inset-0 rounded-lg border border-dashed border-line-strong" />
      <motion.div style={{ opacity: ghost, padding: unit(8) }} className="absolute inset-0 flex flex-col justify-between">
        <div className="flex items-center gap-[calc(var(--u)*6)]">
          <PipeGlyph name="sheet" size={unit(18)} />
          <motion.span style={{ color: title }} className={BIG_TEXT}>
            row {ROW_ID}
          </motion.span>
        </div>
        <div className="whitespace-nowrap">
          <p className="flex">
            <span className="shrink-0 text-dim" style={{ width: unit(46) }}>
              link
            </span>
            <Typed text={LINK_TEXT} t={linkT} className="text-fg" />
          </p>
          <p className="flex">
            <span className="shrink-0 text-dim" style={{ width: unit(46) }}>
              status
            </span>
            <Typed text={READY_STATUS} t={statusT} className="text-mint" />
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function WriteBack({ p }: { p: MV }) {
  const toRow = useSeg(p, TL.write[0], TL.write[1]);
  const toStrip = useSeg(p, TL.strip[0], TL.strip[1]);
  const label = useSeg(p, TL.write[0] + 0.004, TL.write[0] + 0.014);
  return (
    <>
      <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <Wire path={WRITE_TO_ROW} draw={toRow} tone="mint" arrow />
        <Pulse path={WRITE_TO_ROW} progress={toRow} tone="mint" trail={2} />
        <Wire path={WRITE_TO_STRIP} draw={toStrip} tone="mint" arrow />
        <Pulse path={WRITE_TO_STRIP} progress={toStrip} tone="mint" trail={2} />
      </svg>
      <motion.p
        aria-hidden
        style={{
          opacity: label,
          left: pctX(WRITE_X - 8),
          top: pctY((CARD.y + CARD.h + RECORD.y) / 2),
        }}
        className="absolute -translate-x-full -translate-y-1/2 whitespace-nowrap text-right text-dim"
      >
        link written back
      </motion.p>
      <RecordCard p={p} />
    </>
  );
}

export default function Done({ p }: { p: MV }) {
  return (
    <>
      <div className="absolute" style={{ left: pctX(PHONE.x), top: pctY(PHONE.y) }}>
        <PipePhone width={unit(PHONE.w)}>
          <Screen p={p} />
        </PipePhone>
      </div>
      <FileCard p={p} />
      <WriteBack p={p} />
    </>
  );
}
