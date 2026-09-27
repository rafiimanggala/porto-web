"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { useSeg, type MV } from "./HealthSceneParts";
import { IMAGE_JOBS, RENDER, SCRIPT, jobLabel } from "./PipeKitData";
import { AUDIO_TEXT, FILE_NAME, FH, FW, PANEL, SIZE_TEXT, TL, rowWin } from "./PipeRenderData";
import { RENDER_START, renderPct, renderPolls, renderReadyAt } from "./PipeRenderMath";
import { BIG_TEXT, boxStyle, pctX, pctY, unit } from "./PipeRenderKit";
import { Typed } from "./PipeRenderType";

/* The render panel: first the one request, then the job it started. Both are five rows, so the card never changes height.
   The request types itself letter by letter, the two sets of rows swap with a wipe and an accent edge, and the ring counts
   the poll answers up to 100 percent. */

const REQUEST_ROWS = [
  ["audio", AUDIO_TEXT],
  ["images", String(IMAGE_JOBS.length)],
  ["captions", `${SCRIPT.words} words`],
  ["size", `${SIZE_TEXT}, ${RENDER.fps} fps`],
] as const;
const STATUS = [
  ["queued", "var(--color-mute)"],
  ["rendering", "var(--color-sun)"],
  ["ready", "var(--color-mint)"],
] as const;
const RING_STROKE = 5;
const ROWS = REQUEST_ROWS.length + 1;
const INNER_X = PANEL.x + PANEL.pad;
const INNER_W = PANEL.w - 2 * PANEL.pad;

const statusOf = (v: number) => (v >= renderReadyAt ? STATUS[2] : v >= RENDER_START ? STATUS[1] : STATUS[0]);

/** One row of the card: an optional key column, then the value. `keyOn` fades the key in. */
function Row({ k, label, keyOn, children }: { k: number; label?: string; keyOn?: MV; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: pctX(INNER_X), top: pctY(PANEL.y + PANEL.padY + k * PANEL.step), width: pctX(INNER_W) }}>
      <div className="flex w-max whitespace-nowrap">
        {label ? (
          <motion.span className="shrink-0 text-dim" style={{ width: unit(PANEL.key), opacity: keyOn }}>
            {label}
          </motion.span>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function TypedRow({ p, k, label, text }: { p: MV; k: number; label?: string; text: string }) {
  const t = useSeg(p, rowWin(k)[0], rowWin(k)[1]);
  const keyOn = useTransform(t, (v): number => (v > 0 ? 1 : 0));
  return (
    <Row k={k} label={label} keyOn={keyOn}>
      <Typed text={text} t={t} className="text-fg" />
    </Row>
  );
}

function RequestRows({ p }: { p: MV }) {
  return (
    <>
      <TypedRow p={p} k={0} text="one request to the renderer" />
      {REQUEST_ROWS.map(([key, value], i) => (
        <TypedRow key={key} p={p} k={i + 1} label={key} text={value} />
      ))}
    </>
  );
}

function FileValue({ p }: { p: MV }) {
  const t = useSeg(p, TL.fileRow[0], TL.fileRow[1]);
  const pending = useTransform(t, (v) => (v > 0 ? 0 : 1));
  return (
    <span className="relative">
      <motion.span style={{ opacity: pending }} className="text-mute">
        pending
      </motion.span>
      <Typed text={FILE_NAME} t={t} className="absolute left-0 top-0 text-mint" />
    </span>
  );
}

function JobRows({ p }: { p: MV }) {
  const status = useTransform(p, (v): string => statusOf(v)[0]);
  const color = useTransform(p, (v) => statusOf(v)[1]);
  const polls = useTransform(p, (v) => String(renderPolls(v)));
  return (
    <>
      <Row k={0}>
        <span className="text-fg">{jobLabel(RENDER.jobId)}, a background job</span>
      </Row>
      <Row k={1} label="status">
        <motion.span style={{ color }}>{status}</motion.span>
      </Row>
      <Row k={2} label="poll">
        <motion.span className="text-fg">{polls}</motion.span>
      </Row>
      <Row k={3} label="size">
        <span className="text-fg">{SIZE_TEXT}</span>
      </Row>
      <Row k={4} label="file">
        <FileValue p={p} />
      </Row>
    </>
  );
}

function Ring({ p }: { p: MV }) {
  const on = useSeg(p, TL.panelIn[0], TL.panelIn[1]);
  const arc = useTransform(p, (v) => renderPct(v) / 100);
  const arcOn = useTransform(arc, (a) => (a > 0 ? 1 : 0));
  const done = useSeg(p, renderReadyAt, renderReadyAt + 0.01);
  const text = useTransform(p, (v) => `${renderPct(v)}%`);
  const { ringX: cx, ringY: cy, ringR: r } = PANEL;
  return (
    <motion.div aria-hidden style={{ opacity: on }} className="absolute inset-0">
      <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full">
        <circle cx={cx} cy={cy} r={r} fill="var(--color-surface-1)" stroke="var(--color-line-strong)" strokeWidth={RING_STROKE} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-accent)" strokeWidth={RING_STROKE} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ pathLength: arc, opacity: arcOn }} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-mint)" strokeWidth={RING_STROKE} style={{ opacity: done }} />
      </svg>
      <motion.span style={{ left: pctX(cx), top: pctY(cy) }} className={`absolute -translate-x-1/2 -translate-y-1/2 ${BIG_TEXT} tabular-nums text-fg`}>
        {text}
      </motion.span>
    </motion.div>
  );
}

export default function Job({ p }: { p: MV }) {
  const on = useSeg(p, TL.panelIn[0], TL.panelIn[1]);
  const swap = useSeg(p, TL.swapPanel[0], TL.swapPanel[1]);
  const edgeX = useTransform(swap, (t) => INNER_X + t * INNER_W);
  const requestClip = useTransform([swap, edgeX], ([t, x]: number[]) => (t <= 0 ? "none" : `inset(0 0 0 ${((x / FW) * 100).toFixed(2)}%)`));
  const jobClip = useTransform([swap, edgeX], ([t, x]: number[]) => (t >= 1 ? "none" : `inset(0 ${(100 - (x / FW) * 100).toFixed(2)}% 0 0)`));
  const edge = useTransform(edgeX, (x) => pctX(x));
  const edgeOn = useTransform(swap, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);
  return (
    <>
      <Ring p={p} />
      <motion.div aria-hidden style={{ ...boxStyle(PANEL.x, PANEL.y, PANEL.w, PANEL.h), opacity: on }} className="absolute rounded-lg border border-line-strong bg-surface-1" />
      <motion.div style={{ opacity: on, clipPath: requestClip }} className="absolute inset-0">
        <RequestRows p={p} />
      </motion.div>
      <motion.div style={{ clipPath: jobClip, opacity: swap }} className="absolute inset-0">
        <JobRows p={p} />
      </motion.div>
      <motion.i
        aria-hidden
        style={{ left: edge, opacity: edgeOn, top: pctY(PANEL.y + PANEL.padY - 2), height: pctY(ROWS * PANEL.step) }}
        className="absolute z-10 w-[2px] -translate-x-1/2 rounded-full bg-accent"
      />
    </>
  );
}
