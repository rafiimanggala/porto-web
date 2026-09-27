"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { IMAGE_JOBS, jobLabel } from "./PipeKitData";
import { lerp } from "./PipeKitMath";
import { FilmView } from "./PipeRenderArt";
import { CHIP, LANE, SLOT, TL, blockTag, clipRect, morphWin, slotRect, slotX, typeWin } from "./PipeRenderData";
import { CHIP_FADE, chipOnAt } from "./PipeRenderFlight";
import { Typed } from "./PipeRenderType";
import { arriveAt, phaseAt, pollsAt, tickAt } from "./PipeRenderMath";
import { pctX, pctY, unit } from "./PipeRenderKit";

/* One generated image per script block: the prompt is typed into a skeleton, the job chip counts its polls, and when the
   result arrives the picture wipes in from the left while the skeleton is clipped away from the right. In chapter 3 the
   slot itself flies into its clip on the video track. */

const SHIMMER_RATE = 9;
const STATUS_TEXT = ["", "queued", "rendering", "done"] as const;
const STATUS_COLOR = ["var(--color-mute)", "var(--color-mute)", "var(--color-sun)", "var(--color-mint)"] as const;
const RADIUS = [6, 4] as const;
/* Whole frames of a 9:16 picture on the video track: a frame is as wide as the clip is tall. Only whole frames fit, and they
   share out what is left over, so a clip never ends in a cut off frame. */
const FRAME_W = ((LANE.videoH - 2) * 9) / 16;
const framesFor = (i: number) => Math.max(1, Math.floor((clipRect(i).w - 2) / FRAME_W));

const inset = (v: number) => `inset(0 ${(100 - v * 100).toFixed(2)}% 0 0)`;
const insetFrom = (v: number) => `inset(0 0 0 ${(v * 100).toFixed(2)}%)`;

function Skeleton({ i, p, reveal }: { i: number; p: MV; reveal: MV }) {
  const typed = useSeg(p, typeWin(i)[0], typeWin(i)[1]);
  const clip = useTransform(reveal, insetFrom);
  const shineOn = useSeg(p, chipOnAt(i), chipOnAt(i) + 0.02);
  const shine = useTransform(p, (v) => `${((((v * SHIMMER_RATE + i * 0.23) % 1) * 260) - 80).toFixed(1)}%`);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0 bg-surface-2">
      <motion.i aria-hidden style={{ opacity: shineOn }} className="absolute inset-0 overflow-hidden">
        <motion.i
          style={{ x: shine }}
          className="absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-fg)_11%,transparent),transparent)]"
        />
      </motion.i>
      <p style={{ left: unit(2), right: unit(2), top: unit(6) }} className="absolute break-words tracking-[-0.02em] text-dim">
        <Typed text={IMAGE_JOBS[i].subject} t={typed} />
      </p>
      <PipeGlyph name="image" size={unit(20)} className="absolute bottom-[9%] left-1/2 -translate-x-1/2 opacity-60" />
    </motion.div>
  );
}

function ArtLayer({ i, reveal }: { i: number; reveal: MV }) {
  const clip = useTransform(reveal, inset);
  const edge = useTransform(reveal, (t) => `${(t * 100).toFixed(2)}%`);
  const edgeOn = useTransform(reveal, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);
  return (
    <>
      <motion.div style={{ clipPath: clip }} className="absolute inset-0">
        <FilmView i={i} frames={framesFor(i)} />
      </motion.div>
      <motion.i aria-hidden style={{ left: edge, opacity: edgeOn }} className="absolute inset-y-0 z-10 w-[2px] -translate-x-1/2 rounded-full bg-accent" />
    </>
  );
}

function JobChip({ i, p }: { i: number; p: MV }) {
  const on = useSeg(p, chipOnAt(i), chipOnAt(i) + CHIP_FADE);
  const gone = useSeg(p, TL.morph.from - 0.004, TL.morph.from + 0.012);
  const opacity = useTransform([on, gone], ([a, g]: number[]) => a * (1 - g));
  const y = useTransform(on, (v) => (1 - v) * 6);
  const phase = useTransform(p, (v) => phaseAt(v, i));
  const status = useTransform(phase, (ph): string => STATUS_TEXT[ph]);
  const statusColor = useTransform(phase, (ph) => STATUS_COLOR[ph]);
  const polls = useTransform(p, (v) => `poll ${pollsAt(v, i)}`);
  const pollColor = useTransform(p, (v) => `color-mix(in oklab, var(--color-accent) ${(tickAt(v, i) * 100).toFixed(1)}%, var(--color-dim))`);
  return (
    <motion.div aria-hidden style={{ opacity, y, top: `calc(100% + ${unit(CHIP.gap)})` }} className="absolute inset-x-0 whitespace-nowrap">
      <p className="text-fg">{jobLabel(IMAGE_JOBS[i].id)}</p>
      <motion.p style={{ color: statusColor }}>{status}</motion.p>
      <motion.p style={{ color: pollColor }}>{polls}</motion.p>
    </motion.div>
  );
}

function Slot({ i, p }: { i: number; p: MV }) {
  const a = slotRect(i);
  const b = clipRect(i);
  const reveal = useSeg(p, arriveAt(i), arriveAt(i) + TL.reveal, easeInOutCubic);
  const morph = useSeg(p, morphWin(i)[0], morphWin(i)[1], easeInOutCubic);
  const box = {
    left: useTransform(morph, (t) => pctX(lerp(a.x, b.x, t))),
    top: useTransform(morph, (t) => pctY(lerp(a.y, b.y, t))),
    width: useTransform(morph, (t) => pctX(lerp(a.w, b.w, t))),
    height: useTransform(morph, (t) => pctY(lerp(a.h, b.h, t))),
  };
  const radius = useTransform(morph, (t) => unit(lerp(RADIUS[0], RADIUS[1], t)));
  return (
    <motion.div style={box} className="absolute">
      <motion.div style={{ borderRadius: radius }} className="absolute inset-0 overflow-hidden border border-line-strong bg-surface-1">
        <Skeleton i={i} p={p} reveal={reveal} />
        <ArtLayer i={i} reveal={reveal} />
      </motion.div>
      <JobChip i={i} p={p} />
    </motion.div>
  );
}

function Tag({ i, p }: { i: number; p: MV }) {
  const lit = useSeg(p, typeWin(i)[0], typeWin(i)[0] + 0.012);
  const gone = useSeg(p, TL.morph.from - 0.008, TL.morph.from + 0.004);
  const opacity = useTransform(gone, (g) => 1 - g);
  return (
    <motion.span aria-hidden style={{ opacity, left: pctX(slotX(i)), top: pctY(SLOT.tagY), width: pctX(SLOT.w) }} className="absolute whitespace-nowrap tracking-[0.06em]">
      <span className="text-mute">{blockTag(i)}</span>
      <motion.span style={{ opacity: lit }} className="absolute inset-0 text-fg">
        {blockTag(i)}
      </motion.span>
    </motion.span>
  );
}

export default function Slots({ p }: { p: MV }) {
  return (
    <>
      {IMAGE_JOBS.map((j, i) => (
        <Tag key={j.id} i={i} p={p} />
      ))}
      {IMAGE_JOBS.map((j, i) => (
        <Slot key={j.id} i={i} p={p} />
      ))}
    </>
  );
}
