"use client";

import { motion, useTransform } from "framer-motion";
import { SceneIcon, type SceneIconName } from "./SceneIcon";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { BIN_X, HEAD_TOP, easeOutCubic, pct } from "./GeneticsSceneData";

/* Icon sizes follow the stage container: header 32px narrow and 40px wide, card 28px and 40px, pill 22px and 28px.
   The helix is drawn with thinner strokes than the other icons, so it renders a size up and bleeds into its own
   transparent padding through a negative margin, which keeps its layout box equal to the other icons.
   max-w-none stops the img max-width from squeezing a bled icon. The card icon pulls left by the PNG padding
   so the bulb edge sits on the card content edge. */
export const HEAD_ICON = "size-8 @min-[500px]:size-10";
export const DNA_HEAD_ICON = "max-w-none size-10 -m-1 @min-[500px]:size-[50px] @min-[500px]:-m-[5px]";
export const CARD_ICON = "max-w-none size-7 -ml-[6px] @min-[500px]:size-10 @min-[500px]:-ml-[9px]";
export const PILL_ICON = "size-[22px] @min-[500px]:size-7";
export const DNA_PILL_ICON = "max-w-none size-7 -m-[3px] @min-[500px]:size-9 @min-[500px]:-m-1";

export const pillIcon = (name: SceneIconName) => (name === "dna" ? DNA_PILL_ICON : PILL_ICON);

const RISE_PX = 4;
const FROM_SCALE = 0.85;

type PopProps = { p: MV; name: SceneIconName; from: number; len?: number; className?: string; fade?: boolean };

/* Icon that comes in with the object it names: opacity, scale from 0.85 and a small rise, all read from p.
   With fade off the icon rides the opacity of a faded parent instead of squaring it. */
export function IconPop({ p, name, from, len = 0.03, className = HEAD_ICON, fade = true }: PopProps) {
  const t = useSeg(p, from, from + len);
  const scale = useTransform(t, (v) => FROM_SCALE + (1 - FROM_SCALE) * easeOutCubic(v));
  const y = useTransform(t, (v) => RISE_PX * (1 - easeOutCubic(v)));
  return (
    <motion.span aria-hidden style={fade ? { opacity: t, scale, y } : { scale, y }} className="inline-flex shrink-0">
      <SceneIcon name={name} size={40} className={className} />
    </motion.span>
  );
}

const HEAD_LABEL = `${MONO} text-[10px] uppercase tracking-[0.14em] text-mute @min-[500px]:text-[11px]`;

/* Column header for the DNA side, the mirror of the Blood panel header. Comes in as the read head passes. */
export function DnaBadge({ p }: { p: MV }) {
  const o = useSeg(p, 0.005, 0.045);
  return (
    <div
      aria-hidden
      style={{ left: pct(BIN_X), top: pct(HEAD_TOP) }}
      className="absolute flex -translate-y-1/2 items-center gap-1"
    >
      <IconPop p={p} name="dna" from={0.005} len={0.04} className={DNA_HEAD_ICON} />
      <motion.span style={{ opacity: o }} className={HEAD_LABEL}>
        Raw DNA
      </motion.span>
    </div>
  );
}
