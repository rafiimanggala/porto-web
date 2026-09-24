"use client";

import { motion, useTransform } from "framer-motion";
import GeneticsSceneShell from "./GeneticsSceneShell";
import type { SceneCaption } from "./ScrollScene";
import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { Arc, FusePulse, InsightCard, LandFlash, Stub } from "./GeneticsSceneInsight";
import { DnaBadge } from "./GeneticsSceneIcons";
import { BloodChip, BloodLabel, BloodSlot, LaneBin, NamedVariant, RainToken, ReadHead } from "./GeneticsSceneParts";
import {
  CHECKED_AT,
  CHIPS,
  COUNT_UP_END,
  FLATTEN,
  HALO,
  LANES,
  PAIRS,
  PAIR_Y,
  RAIN_END,
  REST_FADE,
  SWAP_AT,
  TOTAL_VARIANTS,
  buildRain,
  clamp01,
  easeOutSine,
  rowMid,
  sortedTotal,
} from "./GeneticsSceneData";

/* Rsid rain sorts into pathways, blood markers arrive, arcs link the pairs, two flags fuse into one card. */

const CAPTIONS: readonly SceneCaption[] = [
  {
    eyebrow: "01 / Variants",
    title: "Raw DNA is a list of letters.",
    body: "Hundreds of variants arrive as bare rsIDs with no context.",
  },
  {
    eyebrow: "02 / Pathways",
    title: "Sorted by what they do.",
    body: "Lipid, methylation, glucose and lactose: variants fall into pathways.",
  },
  {
    eyebrow: "03 / Cross-check",
    title: "Then checked against your blood.",
    body: "APOE e4 and a high LDL-C point at the same mechanism, so they surface together.",
  },
  {
    eyebrow: "04 / One insight",
    title: "Compounding risk, in plain English.",
    body: "Two flags become one finding, with the markers behind it one tap away.",
  },
];

const CHAPTERS = [0, 0.22, 0.5, 0.78, 1] as const;
const LIPID = 0;
const LDL = 1;
const HERO = PAIRS[2];
const RAIN = buildRain();
const SWAP = { at: SWAP_AT, text: "1 finding" } as const;

function readoutText(v: number): string {
  if (v < CHAPTERS[1]) return `${Math.round(TOTAL_VARIANTS * clamp01(v / COUNT_UP_END))} variants`;
  if (v < CHAPTERS[2]) return `${sortedTotal(v)} / ${TOTAL_VARIANTS} sorted`;
  if (v < CHAPTERS[3]) return `${CHECKED_AT.filter((b) => v >= b).length} / ${CHECKED_AT.length} pairs checked`;
  return "1 insight";
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

function DnaLayer({ p, rain }: { p: MV; rain: MV }) {
  const { anon, named } = RAIN;
  return (
    <>
      <ReadHead p={p} />
      <DnaBadge p={p} />
      {LANES.map((lane, i) => (
        <LaneBin key={lane.name} p={p} i={i} />
      ))}
      {anon.map((tok) => (
        <RainToken key={tok.id} p={p} rain={rain} tok={tok} />
      ))}
      {named.slice(1).map((v) => (
        <NamedVariant key={v.rsid} p={p} rain={rain} v={v} />
      ))}
    </>
  );
}

function BloodLayer({ p }: { p: MV }) {
  return (
    <>
      <BloodLabel p={p} />
      {CHIPS.map((chip, i) => (
        <BloodSlot key={chip.label} p={p} i={i} />
      ))}
      {CHIPS.map((chip, i) => (i === LDL ? null : <BloodChip key={chip.label} p={p} i={i} />))}
      <Arc p={p} pair={PAIRS[0]} />
      <Arc p={p} pair={PAIRS[1]} />
      <LandFlash p={p} pair={PAIRS[0]} />
      <LandFlash p={p} pair={PAIRS[1]} />
      <Stub p={p} />
    </>
  );
}

function Visual({ p }: { p: MV }) {
  const rain = useSeg(p, 0, RAIN_END, easeOutSine);
  const restOp = useTransform(p, [...REST_FADE], [1, 0.55, 0]);
  const halo = useSeg(p, HALO[0], HALO[1]);
  const flat = useSeg(p, FLATTEN[0], FLATTEN[1], easeInOutCubic);
  const apoeShift = useTransform(flat, (v) => v * (PAIR_Y - rowMid(LIPID)));
  const ldlShift = useTransform(flat, (v) => v * (PAIR_Y - CHIPS[LDL].y));

  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute inset-0 [--dp:7px] @min-[500px]:[--dp:10px]">
        <motion.div style={{ opacity: restOp }} className="absolute inset-0">
          <DnaLayer p={p} rain={rain} />
          <BloodLayer p={p} />
        </motion.div>
        <InsightCard p={p} />
        <Arc p={p} pair={HERO} flatten={flat} swap={SWAP} />
        <NamedVariant p={p} rain={rain} v={RAIN.named[0]} shift={apoeShift} halo={halo} />
        <BloodChip p={p} i={LDL} shift={ldlShift} halo={halo} />
        <FusePulse p={p} />
      </div>
    </div>
  );
}

export default function GeneticsScene() {
  return (
    <GeneticsSceneShell
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[480svh] sm:h-[520svh]"
    />
  );
}
