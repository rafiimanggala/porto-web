"use client";

import { motion, useTransform } from "framer-motion";
import { SceneIcon, type SceneIconName } from "./SceneIcon";
import { easeInCubic, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { HUB_STOPS, PANEL, PLOT_X, T } from "./WearableSceneData";
import { clamp01, cq, lerp, panelBox, sx, sy } from "./WearableSceneKit";

/* Icon placements for the wearable scene: device chips, the sync glyph beside the hub, track label icons. */

export const CHIP_ICON = { full: 32, strip: 28, leftFull: 6, leftStrip: 3, nameFull: 46, nameStrip: 32 } as const;
const BUMP = 1.12;
const CHIP_DIM = 0.35;
const TRACK_DIM = 0.55;

/* Icons dim with the chart through the Notice chapter so the circled dip stays the focus. Chips restore afterwards. */
function useNoticeDim(p: MV, drop: number, restore: boolean): MV {
  const on = useSeg(p, T.dim[0], T.dim[1]);
  const off = useSeg(p, T.labelsOff[0], T.labelsOff[1]);
  return useTransform([on, off], ([a, b]: number[]) => 1 - drop * a * (restore ? 1 - b : 1));
}

export function ChipIcon({ name, move, pulse, p }: { name: SceneIconName; move: MV; pulse: MV; p: MV }) {
  const box = useTransform(move, (k) => cq(lerp(CHIP_ICON.full, CHIP_ICON.strip, k)));
  const left = useTransform(move, (k) => cq(lerp(CHIP_ICON.leftFull, CHIP_ICON.leftStrip, k)));
  const scale = useTransform(pulse, [0, 0.3, 1], [1, BUMP, 1]);
  const opacity = useNoticeDim(p, CHIP_DIM, true);
  return (
    <motion.div style={{ left, width: box, height: box, scale, opacity, y: "-50%" }} className="absolute top-1/2">
      <SceneIcon name={name} size={64} className="h-full w-full" />
    </motion.div>
  );
}

/* The sync glyph sits just outside the hub ring, clear of the progress arcs, and fades in with the first link. */
const SYNC = { angle: 38, gap: 3, icon: 22, fadeIn: 0.05 } as const;
const SYNC_HUB = HUB_STOPS.start;
const SYNC_RAD = (SYNC.angle * Math.PI) / 180;
const SYNC_R = SYNC_HUB.d / 2 + SYNC.gap + SYNC.icon / 2;
const SYNC_C = {
  x: SYNC_HUB.x + SYNC_R * Math.cos(SYNC_RAD),
  y: SYNC_HUB.y + SYNC_R * Math.sin(SYNC_RAD),
};

export function HubSync({ p }: { p: MV }) {
  const turn = useSeg(p, T.linkStart, T.retract[0], easeInOutCubic);
  const enter = useSeg(p, T.linkStart, T.linkStart + SYNC.fadeIn, easeOutCubic);
  const out = useSeg(p, T.retract[0], T.retract[1], easeInCubic);
  const rotate = useTransform(turn, (k) => k * 360);
  const opacity = useTransform([enter, out], ([e, o]: number[]) => e * (1 - o));
  const scale = useTransform([enter, out], ([e, o]: number[]) => lerp(0.8, 1, e) * (1 - 0.15 * o));
  const y = useTransform(out, (k) => `${-8 * k}%`);
  return (
    <motion.div
      aria-hidden
      style={{
        left: sx(SYNC_C.x - SYNC.icon / 2),
        top: sy(SYNC_C.y - SYNC.icon / 2),
        width: sx(SYNC.icon),
        height: sy(SYNC.icon),
        opacity,
        scale,
        y,
      }}
      className="pointer-events-none absolute z-30"
    >
      <motion.div style={{ rotate }} className="h-full w-full">
        <SceneIcon name="sync" size={64} className="h-full w-full" />
      </motion.div>
    </motion.div>
  );
}

export const TRACK_ICON = 20;
export const TRACK_INSET = 28;
const TRACK_LIFT = 3;
const TRACK_REVEAL = 0.1;

const TRACKS = [
  { name: "hrv", rowY: 80 },
  { name: "heart-rate", rowY: 164 },
  { name: "sleep", rowY: 222 },
] as const satisfies readonly { name: SceneIconName; rowY: number }[];

/* hrv.png ships with its own mint tile (25 to 230 of 256). The other two get the same tile so the column reads as one set. */
const TILE_INSET = "9.8%";
const TILE_FILL = "color-mix(in oklab, var(--color-mint) 90%, var(--color-surface-1))";

function TrackGlyph({ name }: { name: SceneIconName }) {
  if (name === "hrv") return <SceneIcon name={name} size={64} className="h-full w-full" />;
  return (
    <span
      className="absolute border"
      style={{ inset: TILE_INSET, borderRadius: "16%", background: TILE_FILL, borderColor: "var(--color-fg)" }}
    >
      <SceneIcon name={name} size={64} className="absolute inset-0 h-full w-full" />
    </span>
  );
}

function TrackIcon({ p, name, rowY }: { p: MV; name: SceneIconName; rowY: number }) {
  const top = rowY - TRACK_LIFT;
  const rev = useSeg(p, T.panel[0], T.panel[1], easeOutCubic);
  const dim = useNoticeDim(p, TRACK_DIM, false);
  const k = useTransform(rev, (r) => clamp01((r - (top - PANEL.y) / PANEL.h) / TRACK_REVEAL));
  const opacity = useTransform([k, dim], ([v, d]: number[]) => v * d);
  const scale = useTransform(k, (v) => lerp(0.85, 1, v));
  const y = useTransform(k, (v) => `${(1 - v) * 12}%`);
  return (
    <motion.div
      aria-hidden
      style={{ ...panelBox({ x: PLOT_X, y: top, w: TRACK_ICON, h: TRACK_ICON }), opacity, scale, y }}
      className="pointer-events-none absolute"
    >
      <TrackGlyph name={name} />
    </motion.div>
  );
}

export function TrackIcons({ p }: { p: MV }) {
  return (
    <>
      {TRACKS.map((t) => (
        <TrackIcon key={t.name} p={p} name={t.name} rowY={t.rowY} />
      ))}
    </>
  );
}
