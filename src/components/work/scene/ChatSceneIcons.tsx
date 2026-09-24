"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import type { Marker, PlanRow, Source, Span } from "./ChatSceneData";
import { SceneIcon } from "./SceneIcon";

/* A source icon waits at this strength until its own attach step, then comes up to full. */
const PENDING_ICON = 0.44;

/* Source card icon: sits inline in the name row in a narrow stage, in the card corner when
   there is room. It stays faint until this source attaches, so it joins the colour dot and the
   underline in the "attaching" beat instead of arriving already finished. */
export function SourceIcon({ src, t }: { src: Source; t: MV }) {
  const zoom = src.zoom ?? 1;
  const scale = useTransform(t, (v) => (0.82 + 0.18 * v) * zoom);
  const opacity = useTransform(t, (v) => PENDING_ICON + (1 - PENDING_ICON) * v);
  return (
    <motion.span
      style={{ scale, opacity }}
      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center @[30rem]:absolute @[30rem]:right-2 @[30rem]:top-2 @[30rem]:h-9 @[30rem]:w-9 @[40rem]:h-11 @[40rem]:w-11"
    >
      <SceneIcon name={src.icon} size={44} className="h-full w-full" />
    </motion.span>
  );
}

/* The source of a cited marker, at the right of its value. It brightens with the card's own
   label, so the icons that introduced the four sources keep going once the tray swaps. */
export function EvidenceSourceIcon({ m, lit }: { m: Marker; lit: MV }) {
  const opacity = useTransform(lit, (v) => 0.4 + 0.6 * v);
  return (
    <motion.span
      style={{ opacity }}
      className="pointer-events-none absolute right-0 top-1/2 hidden h-[22px] w-[22px] -translate-y-1/2 @[30rem]:flex @[40rem]:h-[26px] @[40rem]:w-[26px]"
    >
      <SceneIcon name={m.icon} size={32} className="h-full w-full" />
    </motion.span>
  );
}

const ICON_LAND = 0.28;

/* Plan row icon: a faint dashed slot holds the place while the row is still being written, then
   the icon lands as the first words of that row come in. Inline in the tag row below 40rem,
   a left column at 40rem and up. The narrow 26px icon sits on a negative margin so it does not
   make the row taller than the 22px it replaced. */
export function PlanIcon({ row, p, span }: { row: PlanRow; p: MV; span: Span }) {
  const raw = useSeg(p, span[0], span[0] + (span[1] - span[0]) * ICON_LAND);
  const land = useTransform(raw, easeOutCubic);
  const scale = useTransform(land, (v) => 0.85 + 0.15 * v);
  const y = useTransform(land, (v) => (1 - v) * 4);
  const slot = useTransform(land, (v) => 0.45 * (1 - v));
  return (
    <span className="relative -my-0.5 h-[26px] w-[26px] shrink-0 @[30rem]:my-0 @[30rem]:h-7 @[30rem]:w-7 @[40rem]:absolute @[40rem]:left-3.5 @[40rem]:top-1/2 @[40rem]:h-11 @[40rem]:w-11 @[40rem]:-translate-y-1/2">
      <motion.i aria-hidden style={{ opacity: slot }} className="absolute inset-[4px] rounded-full border border-dashed border-fg @[40rem]:inset-[6px]" />
      <motion.span style={{ opacity: land, scale, y }} className="absolute inset-0">
        <SceneIcon name={row.icon} size={44} className="h-full w-full" />
      </motion.span>
    </span>
  );
}

/* Marks a row of suggested follow-ups. It lands with the first chip, on the chips' own timing.
   The bulb art is small in its canvas, so it is enlarged in the narrow stage. */
export function FollowIcon({ p, a, pop }: { p: MV; a: number; pop: number }) {
  const t = useSeg(p, a, a + pop, easeOutCubic);
  const y = useTransform(t, (v) => (1 - v) * 8);
  const scale = useTransform(t, (v) => 0.85 + 0.15 * v);
  return (
    <motion.span style={{ opacity: t, y, scale }} className="flex h-[26px] w-[26px] shrink-0 items-center justify-center @[30rem]:h-8 @[30rem]:w-8">
      <SceneIcon name="insight" size={32} className="h-full w-full scale-[1.18] @[30rem]:scale-100" />
    </motion.span>
  );
}
