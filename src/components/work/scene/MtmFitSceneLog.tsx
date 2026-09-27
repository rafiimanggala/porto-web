"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { BAD_ENTRY, MEASURES, formatMeasure, measureById, type Measure, type MeasureId } from "./MtmKitData";
import { pct } from "./MtmKitMath";
import { CHECKS_HEAD, FIELD_T, SLEEVE_T } from "./MtmFitSceneData";
import { validCount } from "./MtmFitSceneMotion";
import { Edge, Reveal } from "./MtmFitSceneKit";

/* The larger log is for a tall window only: on a short one the rows keep the compact size so the column never pushes past the garment. */
const ROW = "h-4 @[520px]:h-6 @[520px]:[@media(min-height:820px)]:h-8";

const edgeLabel = (m: Measure, n: number) => (m.letters ? m.letters.charAt(n - 1) : String(n));

function LogText({ id, bad }: { id: MeasureId; bad: boolean }) {
  const m = measureById(id);
  const value = id === "sleeve" && bad ? BAD_ENTRY.typed : id === "sleeve" ? BAD_ENTRY.fixed : m.sample;
  const range = bad ? `max ${edgeLabel(m, m.max)}` : `${edgeLabel(m, m.min)} to ${edgeLabel(m, m.max)}`;
  /* On a narrow window the passing rows drop the range, so the column stays slim and the garment gets the width. */
  const rangeShow = bad ? "" : "hidden @[520px]:inline";
  return (
    <div className="flex h-full items-center gap-1.5 whitespace-nowrap">
      <MtmGlyph name={bad ? "cross" : "check"} size={16} className="shrink-0" />
      <span className="text-[11px] @[520px]:text-[13px] @[520px]:[@media(min-height:820px)]:text-[15px]" style={{ color: bad ? "var(--color-rose)" : "var(--color-fg)" }}>
        {m.label} {formatMeasure(m, value)}
      </span>
      <span className={`${MONO} ${rangeShow} text-[10px] text-mute @[520px]:text-[11px] @[520px]:[@media(min-height:820px)]:text-[12px]`}>{range}</span>
    </div>
  );
}

function LogRow({ p, id }: { p: MV; id: Exclude<MeasureId, "sleeve"> }) {
  const t = useSeg(p, FIELD_T[id].check[0], FIELD_T[id].check[1]);
  return (
    <Reveal t={t} className={`${ROW} w-fit`}>
      <LogText id={id} bad={false} />
    </Reveal>
  );
}

function SleeveRow({ p }: { p: MV }) {
  const show = useSeg(p, SLEEVE_T.bad[0], SLEEVE_T.bad[1]);
  const swap = useSeg(p, SLEEVE_T.ok[0], SLEEVE_T.ok[1]);
  const badClip = useTransform([show, swap], ([r, s]: number[]) => `inset(0 ${pct(100 - r * 100)} 0 ${pct(s * 100)})`);
  const okClip = useTransform(swap, (s) => `inset(0 ${pct(100 - s * 100)} 0 0)`);
  const left = useTransform([show, swap], ([r, s]: number[]) => pct((s > 0 ? s : r) * 100));
  const opacity = useTransform([show, swap], ([r, s]: number[]): number => (s > 0 ? (s < 1 ? 1 : 0) : r > 0 && r < 1 ? 1 : 0));
  return (
    <div className={`relative grid w-fit ${ROW}`}>
      <motion.div style={{ clipPath: badClip }} className="col-start-1 row-start-1">
        <LogText id="sleeve" bad />
      </motion.div>
      <motion.div style={{ clipPath: okClip }} className="col-start-1 row-start-1">
        <LogText id="sleeve" bad={false} />
      </motion.div>
      <Edge left={left} opacity={opacity} />
    </div>
  );
}

function Counter({ p }: { p: MV }) {
  const text = useTransform(p, (v) => `${validCount(v)}/${MEASURES.length}`);
  return <motion.span className="tabular-nums text-fg">{text}</motion.span>;
}

export function CheckLog({ p }: { p: MV }) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-0.5 @[520px]:gap-1.5 @[520px]:[@media(min-height:820px)]:gap-2">
      <div className={`${MONO} mb-1 flex items-center justify-between border-b border-line pb-1.5 text-[10px] uppercase leading-none tracking-[0.12em] text-mute @[520px]:[@media(min-height:820px)]:mb-2 @[520px]:[@media(min-height:820px)]:text-[11px]`}>
        <span>{CHECKS_HEAD}</span>
        <Counter p={p} />
      </div>
      {MEASURES.map((m) => (m.id === "sleeve" ? <SleeveRow key={m.id} p={p} /> : <LogRow key={m.id} p={p} id={m.id} />))}
    </div>
  );
}
