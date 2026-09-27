"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { SHEET_ROWS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { BLOCK_STRIP, FIELDS, META, META_NARROW, READY_INDEX, TL } from "./PipePublishData";
import { useGeo } from "./PipePublishGeo";
import { MONO_TXT, PillRoll } from "./PipePublishKit";
import { artAt, bodyOpenAt, checkAt, revealAt, thumbShowAt, uploadAt } from "./PipePublishMath";
import { Thumb } from "./PipePublishThumb";

/* The ready row. It is picked by the sweep, unfolds into a card with the video thumbnail, is read again while the media
   goes up, and folds back into a row that gains the write-back cells. */

type Row = (typeof SHEET_ROWS)[number];

function Wash({ p }: { p: MV }) {
  const level = useTransform(p, uploadAt);
  const clip = useTransform(level, (v) => `inset(${((1 - v) * 100).toFixed(2)}% 0 0 0)`);
  const edge = useTransform(level, (v) => `${((1 - v) * 100).toFixed(2)}%`);
  const edgeOpacity = useTransform(level, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  const fade = useSeg(p, TL.done[0], TL.done[1] + 0.02);
  const opacity = useTransform(fade, (v) => 1 - v);
  return (
    <>
      <motion.i aria-hidden style={{ clipPath: clip, opacity }} className="absolute inset-0 bg-mint/50" />
      <motion.i aria-hidden style={{ top: edge, opacity: edgeOpacity }} className="absolute inset-x-0 h-0.5 -translate-y-1/2 bg-accent" />
    </>
  );
}

/* Sits on the corner of the thumbnail, outside the picture, so the illustration under it stays clean. */
function UploadedMark({ p }: { p: MV }) {
  const t = useSeg(p, TL.done[0], TL.done[1], easeOutBack);
  return (
    <motion.span aria-hidden style={{ scale: t }} className="absolute -bottom-[4px] -right-[6px] z-10 grid size-[15px] place-items-center rounded-full bg-mint text-pastel-ink">
      <PipeGlyph name="check" size={10} />
    </motion.span>
  );
}

function BlockStrip() {
  return (
    <div aria-hidden className="mt-1.5 flex h-[5px] gap-[2px]">
      {BLOCK_STRIP.map((b) => (
        <i key={b.id} className="block h-full rounded-full" style={{ flexGrow: b.seconds, flexBasis: 0, background: `color-mix(in oklab, ${b.tone} 70%, transparent)` }} />
      ))}
    </div>
  );
}

/* Three lines when the stage has room for them and the strip, two lines on a narrow wide-stage (a small phone), so the strip
   never sits on the card's bottom edge. */
const WIDE_ONLY = "truncate text-dim @max-[419px]:hidden";
const NARROW_ONLY = "hidden truncate text-dim @max-[419px]:block";

function Meta({ tall }: { tall: boolean }) {
  return (
    <>
      <p className="truncate text-fg">{META[0]}</p>
      {META.slice(1).map((line) => (
        <p key={line} className={tall ? "truncate text-dim" : WIDE_ONLY}>
          {line}
        </p>
      ))}
      {tall ? null : <p className={NARROW_ONLY}>{META_NARROW[1]}</p>}
    </>
  );
}

function Thumbnail({ p, open }: { p: MV; open: MV }) {
  const { THUMB, cqh } = useGeo();
  const show = useTransform(open, thumbShowAt);
  const art = useTransform(p, artAt);
  return (
    <motion.div className="relative shrink-0" style={{ height: cqh(THUMB.h), aspectRatio: "9 / 16", opacity: show }}>
      <div className="absolute inset-0 overflow-hidden rounded-[5px] border border-line-strong">
        <motion.div style={{ opacity: art }} className="absolute inset-0">
          <Thumb className="h-full w-full" />
        </motion.div>
        <Wash p={p} />
      </div>
      <UploadedMark p={p} />
    </motion.div>
  );
}

function Body({ p, open, text }: { p: MV; open: MV; text: MV }) {
  const { SIZE, GUTTER, cqh, tall } = useGeo();
  return (
    <div className="flex items-center gap-2.5" style={{ height: cqh(SIZE.body), paddingInline: GUTTER }}>
      <Thumbnail p={p} open={open} />
      <motion.div style={{ opacity: text }} className={`${MONO_TXT} min-w-0 flex-1 leading-[1.5]`}>
        <Meta tall={tall} />
        <BlockStrip />
      </motion.div>
    </div>
  );
}

function Field({ k, p }: { k: number; p: MV }) {
  const [a, b] = TL.fields[k];
  const def = FIELDS[k];
  const t = useSeg(p, a, b);
  const clip = useTransform(t, (v) => `inset(0 ${((1 - v) * 100).toFixed(2)}% 0 0)`);
  const flash = useTransform(p, [a, a + 0.006, b + 0.03], [0, 1, 0]);
  return (
    <span className={`${MONO_TXT} flex items-center gap-1 leading-none`}>
      <span className="text-mute">{def.key}</span>
      <span className="relative inline-block border-b border-dashed border-line-strong" style={{ width: `${def.value.length}ch` }}>
        <motion.i aria-hidden style={{ opacity: flash }} className="absolute -inset-x-[3px] -inset-y-[3px] rounded-[3px] bg-accent/45" />
        <motion.span style={{ clipPath: clip }} className="relative block whitespace-nowrap text-fg">
          {def.value}
        </motion.span>
      </span>
    </span>
  );
}

function Sub({ p, text }: { p: MV; text: MV }) {
  const { SIZE, GUTTER, cqh } = useGeo();
  return (
    <motion.div style={{ opacity: text, height: cqh(SIZE.sub), paddingInline: GUTTER }} className="flex items-center justify-between border-t border-dashed border-line">
      {FIELDS.map((f, k) => (
        <Field key={f.key} k={k} p={p} />
      ))}
    </motion.div>
  );
}

function RowHead({ row, done }: { row: Row; done: MV }) {
  const { SIZE, GUTTER, cqh } = useGeo();
  return (
    <div className="flex items-center gap-2" style={{ height: cqh(SIZE.row), paddingInline: GUTTER }}>
      <span className={`${MONO_TXT} w-[5em] shrink-0 text-fg`}>{row.id}</span>
      <span className="min-w-0 flex-1 truncate text-[clamp(11px,3.1cqw,15px)] text-fg">{row.topic}</span>
      <PillRoll t={done} from="rendered" to="posted" />
    </div>
  );
}

export default function ReadyRow({ row, p }: { row: Row; p: MV }) {
  const { SIZE, cqhN } = useGeo();
  const at = checkAt(READY_INDEX);
  const hit = useSeg(p, at - 0.006, at + 0.012);
  const lift = useSeg(p, TL.expand[0], TL.expand[0] + 0.05);
  const done = useSeg(p, TL.flip[0], TL.flip[1], easeInOutCubic);
  const wash = useTransform([hit, done, lift], ([h, d, l]: number[]) => h * (1 - d) * (1 - 0.85 * l));
  const ring = useTransform([lift, done], ([l, d]: number[]) => l * (1 - d));
  const mint = useTransform(p, [TL.flip[0], TL.flip[1], TL.final[1]], [0, 1, 0.3]);
  const body = useTransform(p, bodyOpenAt);
  const sub = useSeg(p, TL.sub[0], TL.sub[1], easeInOutCubic);
  const bodyH = useTransform(body, (o) => `${(cqhN(SIZE.body) * o).toFixed(3)}cqh`);
  const subH = useTransform(sub, (o) => `${(cqhN(SIZE.sub) * o).toFixed(3)}cqh`);
  const bodyText = useTransform(body, revealAt);
  const subText = useTransform(sub, revealAt);
  return (
    <div className="relative border-t border-line">
      <motion.i aria-hidden style={{ opacity: lift }} className="absolute inset-0 bg-surface-2" />
      <motion.i aria-hidden style={{ opacity: wash }} className="absolute inset-0 bg-accent/20" />
      <motion.i aria-hidden style={{ opacity: mint }} className="absolute inset-0 bg-mint/25" />
      <motion.i aria-hidden style={{ opacity: ring }} className="pointer-events-none absolute inset-0 z-10 border-[1.5px] border-accent" />
      <motion.i aria-hidden style={{ opacity: done }} className="pointer-events-none absolute inset-0 z-10 border-[1.5px] border-mint" />
      <motion.i aria-hidden style={{ opacity: wash }} className="absolute inset-y-0 left-0 z-10 w-[3px] bg-accent" />
      <motion.i aria-hidden style={{ opacity: done }} className="absolute inset-y-0 left-0 z-10 w-[3px] bg-mint" />
      <div className="relative">
        <RowHead row={row} done={done} />
        <motion.div style={{ height: bodyH }} className="overflow-hidden">
          <Body p={p} open={body} text={bodyText} />
        </motion.div>
        <motion.div style={{ height: subH }} className="overflow-hidden">
          <Sub p={p} text={subText} />
        </motion.div>
      </div>
    </div>
  );
}
