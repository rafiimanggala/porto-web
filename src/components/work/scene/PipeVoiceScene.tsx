"use client";

import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { StatusStrip } from "./PipeKitStatus";
import { CAPTION_LINES, SCRIPT, VOICE, fmtClock, wordsStartedAt } from "./PipeKitData";
import { segAt } from "./PipeKitMath";
import Card from "./PipeVoiceCard";
import { CAPTIONS, CHAPTERS, SAMPLE_SECONDS, TL } from "./PipeVoiceData";
import Lane, { useView } from "./PipeVoiceLane";
import { groupedCount, headAt, hotHeadAt, phoneHeadAt, reachedAt } from "./PipeVoiceMath";
import Phone from "./PipeVoicePhone";
import Strip from "./PipeVoiceStrip";

/* Voice and captions: script to audio, Whisper word times, caption lines, sync. */

const STATUS_AT = [-1, -1, TL.flip, 2, 2] as const;

export function PipeVoiceVisual({ p }: { p: MV }) {
  const head = useTransform(p, headAt);
  const hot = useTransform(p, hotHeadAt);
  const reached = useTransform(p, reachedAt);
  const phoneHead = useTransform(p, phoneHeadAt);
  const view = useView(p);
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="flex h-full flex-col gap-[var(--gap)] p-[var(--pad)] [--gap:clamp(8px,2.4cqw,14px)] [--pad:clamp(8px,2.6cqw,20px)]">
        <div className="flex h-[38cqh] shrink-0 items-start gap-[var(--gap)]">
          <Card p={p} reached={reached} phoneHead={phoneHead} />
          <Phone p={p} head={head} phoneHead={phoneHead} />
        </div>
        <Strip p={p} />
        <Lane p={p} head={head} hot={hot} reached={reached} view={view} />
        <StatusStrip p={p} statusAt={STATUS_AT} />
      </div>
    </div>
  );
}

/* One denominator per frame: words count against the whole script (as the card does), lines say they cover the first seconds. */
function readoutAt(v: number) {
  if (v < TL.pageLog[0]) return `voiceover ${fmtClock(Math.round(VOICE.seconds * segAt(v, TL.file[0], TL.file[1])))}`;
  if (v < TL.drop[0]) return `word ${wordsStartedAt(reachedAt(v))}/${SCRIPT.words}, ${reachedAt(v).toFixed(2)} s`;
  if (v < TL.pageMerge[0]) return `lines ${groupedCount(v)}/${CAPTION_LINES.length}, first ${SAMPLE_SECONDS} s`;
  return `sync ${phoneHeadAt(v).toFixed(2)} s`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutAt);
  return <motion.span>{text}</motion.span>;
}

export default function PipeVoiceScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <PipeVoiceVisual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
