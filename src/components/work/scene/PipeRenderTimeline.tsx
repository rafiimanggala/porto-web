"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { useSeg, type MV } from "./HealthSceneParts";
import { BLOCKS, IMAGE_JOBS, SCRIPT, fmtClock } from "./PipeKitData";
import { AUDIO_END_X, AUDIO_SECONDS, AUDIO_TEXT, CAPTION_TIMELINE, EDGE, LANE, LANE_BOTTOM, TL, VIDEO_TEXT, laneX } from "./PipeRenderData";
import { playSeconds } from "./PipeRenderMath";
import { boxStyle, pctX, pctY, unit } from "./PipeRenderKit";

/* The video timeline the images fly into. Three lanes on one time axis: the five clips (sized by each block's seconds), the
   voiceover waveform (dipping where one block ends and the next begins) and the caption lines. The voiceover is 0:41 and the
   video 0:42, so the audio lane, its waveform and its label stop AUDIO_END_X, one second before the video axis. Lanes fill from the left
   with an accent edge, as the clips land. The clips themselves are the slots, drawn by PipeRenderSlots. The lane frames appear
   while the slots fly in, but every label waits until the last slot has landed, so no text peeks out around a moving card.
   In chapter 4 the waveform and the caption blocks light up to the playhead: what is lit is what has played. */

const LABELS_IN = [0.524, 0.544] as const;
const UNPLAYED = 0.5;

const BAR_PITCH = 5;
/** The audio lane is only as wide as the voiceover: it ends at AUDIO_END_X, not at the end of the video axis. */
const AUDIO_W = AUDIO_END_X - LANE.x;
const BAR_COUNT = Math.round(AUDIO_W / BAR_PITCH);
const BOUNDARIES = BLOCKS.slice(0, -1).map((b) => b.end);
const DIP_WIDTH = 0.7;
const wave = (k: number) => {
  const t = ((k + 0.5) * BAR_PITCH * SCRIPT.seconds) / LANE.w;
  const dip = BOUNDARIES.reduce((m, b) => Math.max(m, Math.exp(-(((t - b) / DIP_WIDTH) ** 2))), 0);
  const base = 0.3 + 0.7 * Math.abs(Math.sin(k * 1.7) * Math.cos(k * 0.53 + 0.4));
  return base * (1 - 0.85 * dip);
};
const BARS = Array.from({ length: BAR_COUNT }, (_, k) => Math.round(wave(k) * 1000) / 1000);

const inset = (v: number) => `inset(0 ${(100 - v * 100).toFixed(2)}% 0 0)`;

function Lane({ y, h, on, w = LANE.w }: { y: number; h: number; on: MV; w?: number }) {
  return (
    <motion.div style={{ ...boxStyle(LANE.x, y, w, h), opacity: on }} className="absolute rounded-[4px] border border-line bg-surface-1" />
  );
}

function LaneLabel({ y, h, on, lines }: { y: number; h: number; on: MV; lines: readonly string[] }) {
  return (
    <motion.div
      aria-hidden
      style={{ ...boxStyle(EDGE, y, LANE.x - EDGE - 2, h), opacity: on }}
      className="absolute flex flex-col justify-center whitespace-nowrap"
    >
      <span className="text-dim">{lines[0]}</span>
      {lines[1] ? <span className="text-mute">{lines[1]}</span> : null}
    </motion.div>
  );
}

function Ruler({ on, text }: { on: MV; text: MV }) {
  return (
    <>
      <motion.div aria-hidden style={{ opacity: text }} className="absolute inset-0">
        <span className="absolute -translate-y-1/2 whitespace-nowrap text-mute" style={{ left: pctX(LANE.x), top: pctY(LANE.ruleY + 5) }}>
          {fmtClock(0)}
        </span>
        <span className="absolute -translate-x-full -translate-y-1/2 whitespace-nowrap text-mute" style={{ left: pctX(LANE.x + LANE.w), top: pctY(LANE.ruleY + 5) }}>
          {VIDEO_TEXT}
        </span>
      </motion.div>
      <motion.div aria-hidden style={{ opacity: on }} className="absolute inset-0">
        {BOUNDARIES.map((b) => (
          <i key={b} className="absolute w-px bg-line-strong" style={{ left: pctX(laneX(b)), top: pctY(LANE.videoY - 5), height: pctY(4) }} />
        ))}
      </motion.div>
    </>
  );
}

type FillProps = { p: MV; win: readonly [number, number]; top: number; height: number; width?: number; children: ReactNode };

function Fill({ p, win, top, height, width = LANE.w, children }: FillProps) {
  const t = useSeg(p, win[0], win[1]);
  const clip = useTransform(t, inset);
  const edge = useTransform(t, (v) => `${(v * 100).toFixed(2)}%`);
  const edgeOn = useTransform(t, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <div className="absolute" style={boxStyle(LANE.x, top, width, height)}>
      <motion.div style={{ clipPath: clip }} className="absolute inset-0">
        {children}
      </motion.div>
      <motion.i aria-hidden style={{ left: edge, opacity: edgeOn }} className="absolute inset-y-[-2px] z-10 w-[2px] -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

/** The children twice: dim everywhere, and full strength up to the playhead. `span` is the seconds the children's box covers. */
function Played({ p, span = SCRIPT.seconds, children }: { p: MV; span?: number; children: ReactNode }) {
  const clip = useTransform(p, (v) => inset(Math.min(1, playSeconds(v) / span)));
  return (
    <>
      <div style={{ opacity: UNPLAYED }} className="absolute inset-0">
        {children}
      </div>
      <motion.div style={{ clipPath: clip }} className="absolute inset-0">
        {children}
      </motion.div>
    </>
  );
}

function Waveform() {
  const h = LANE.audioH;
  return (
    <svg viewBox={`0 0 ${AUDIO_W} ${h}`} className="absolute inset-0 h-full w-full" aria-hidden>
      {BARS.map((a, k) => {
        if (a <= 0) return null;
        const bar = Math.round((3 + a * (h - 9)) * 100) / 100;
        return <rect key={k} x={k * BAR_PITCH + 1} y={Math.round(((h - bar) / 2) * 100) / 100} width={BAR_PITCH - 2} height={bar} rx={1.2} fill="var(--color-mint)" fillOpacity={0.85} />;
      })}
    </svg>
  );
}

function CaptionBlocks() {
  const h = LANE.textH;
  return (
    <svg viewBox={`0 0 ${LANE.w} ${h}`} className="absolute inset-0 h-full w-full" aria-hidden>
      {CAPTION_TIMELINE.map((l) => (
        <rect
          key={l.start}
          x={(l.start / SCRIPT.seconds) * LANE.w}
          y={4}
          width={Math.max(2.4, ((l.end - l.start) / SCRIPT.seconds) * LANE.w - 0.8)}
          height={h - 8}
          rx={2}
          fill="var(--color-sun)"
          fillOpacity={0.9}
        />
      ))}
    </svg>
  );
}

export default function Timeline({ p }: { p: MV }) {
  const on = useTransform(p, [TL.lanesIn[0], TL.lanesIn[1]], [0, 1]);
  const text = useTransform(p, [LABELS_IN[0], LABELS_IN[1]], [0, 1]);
  return (
    <>
      <Ruler on={on} text={text} />
      <Lane y={LANE.videoY} h={LANE.videoH} on={on} />
      <Lane y={LANE.audioY} h={LANE.audioH} on={on} w={AUDIO_W} />
      <Lane y={LANE.textY} h={LANE.textH} on={on} />
      <LaneLabel y={LANE.videoY} h={LANE.videoH} on={text} lines={["video", `${IMAGE_JOBS.length} clips`]} />
      <LaneLabel y={LANE.audioY} h={LANE.audioH} on={text} lines={["audio", AUDIO_TEXT]} />
      <LaneLabel y={LANE.textY} h={LANE.textH} on={text} lines={["captions"]} />
      <Fill p={p} win={TL.audio} top={LANE.audioY} height={LANE.audioH} width={AUDIO_W}>
        <Played p={p} span={AUDIO_SECONDS}>
          <Waveform />
        </Played>
      </Fill>
      <Fill p={p} win={TL.caps} top={LANE.textY} height={LANE.textH}>
        <Played p={p}>
          <CaptionBlocks />
        </Played>
      </Fill>
    </>
  );
}

export function Playhead({ p }: { p: MV }) {
  const left = useTransform(p, (v) => pctX(laneX(playSeconds(v))));
  const opacity = useTransform(p, [TL.play[0] - 0.006, TL.play[0]], [0, 1]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity, top: pctY(LANE.videoY - 6), height: pctY(LANE_BOTTOM - LANE.videoY + 8), width: unit(1.6) }}
      className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-full bg-accent"
    />
  );
}
