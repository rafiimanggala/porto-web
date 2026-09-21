// Node labels are DOM. Every frame each node is projected to screen space,
// labels claim non-overlapping room, and each <button> is moved by transform.

import { CARD_GAP, CORE_RADIUS } from "./orbitConfig";
import type { Ctx } from "./orbitCtx";

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// 0 at the far side of the orbit, 1 at the near side, from world z.
export const depthOf = (z: number) => clamp((z + 3.2) / 6.4, 0, 1);
// Resting label opacity. Floored so 13px text keeps about 4.5:1 on the page
// background even for a far-side, dimmed label. Depth and dim are carried by
// the node dot and halo, not by the text.
const labelOpacity = (depth: number, dim: number) => (0.6 + 0.4 * depth) * (1 - dim * 0.15);

type Side = "left" | "right";

// `keep` marks the node whose label must always show: selected, hovered or
// focused (focus is forwarded as hover).
export type Spot = { x: number; y: number; depth: number; pri: number; side: Side; keep: boolean };

// Screen position of every node. Reads world position back from the halo
// (already synced in stepNodes) and projects with the live camera, view
// offset included. `pri` ranks who keeps its label when labels collide.
export function projectSpots(c: Ctx): Spot[] {
  const cx = (c.w - c.inset) / 2;
  return c.parts.nodes.map((node, i) => {
    const v = c.tmp.v.copy(node.halo.position);
    const depth = depthOf(v.z);
    v.project(c.camera);
    const x = (v.x * 0.5 + 0.5) * c.w;
    return {
      x,
      y: (-v.y * 0.5 + 0.5) * c.h,
      depth,
      pri: depth + c.sel[i] * 10 + c.hov[i] * 10,
      side: x > cx ? "right" : "left",
      keep: c.selected === i || c.hovered === i,
    };
  });
}

const LABEL_GAP = 18;
const LABEL_H = 16;
const DOT = 13;
// Keep-out margins, in px: from the stage's own left and right edge, from the
// evidence card, and from the wireframe core's outline.
const EDGE_PAD = 8;
const CARD_CLEAR = 12;
const CORE_MARGIN = 6;

type Box = { x0: number; x1: number; y0: number; y1: number };
type Circle = { x: number; y: number; r: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

function hitsCircle(b: Box, k: Circle): boolean {
  const nx = clamp(k.x, b.x0, b.x1);
  const ny = clamp(k.y, b.y0, b.y1);
  return (nx - k.x) ** 2 + (ny - k.y) ** 2 < k.r * k.r;
}

function labelBox(s: Spot, side: Side, width: number): Box {
  const x0 = side === "right" ? s.x + LABEL_GAP : s.x - LABEL_GAP - width;
  return { x0, x1: x0 + width, y0: s.y - LABEL_H / 2, y1: s.y + LABEL_H / 2 };
}

const dotBox = (s: Spot): Box => ({ x0: s.x - DOT, x1: s.x + DOT, y0: s.y - DOT, y1: s.y + DOT });

// Screen circle of the wireframe core: the origin and a point one core radius
// to its right, both through the live camera. The margin also absorbs the
// small growth the near side gets from perspective.
function coreCircle(c: Ctx): Circle {
  const { v, f } = c.tmp;
  v.set(0, 0, 0).project(c.camera);
  f.set(CORE_RADIUS, 0, 0).project(c.camera);
  return {
    x: (v.x * 0.5 + 0.5) * c.w,
    y: (-v.y * 0.5 + 0.5) * c.h,
    r: Math.abs(f.x - v.x) * 0.5 * c.w + CORE_MARGIN,
  };
}

// The evidence card's column, from the width it is heading to (or the still
// shrinking animated one while it closes). Null when no card is open.
function cardBox(c: Ctx): Box | null {
  const inset = Math.max(c.inset, c.insetTarget);
  if (inset <= 0) return null;
  const cardLeft = c.w - Math.max(0, inset - CARD_GAP);
  return { x0: cardLeft - CARD_CLEAR, x1: c.w, y0: 0, y1: c.h };
}

type Field = { w: number; card: Box | null; core: Circle };
type Placement = { side: Side; hidden: boolean };

// Hard limits nothing overrides: the stage's left and right edge, the card.
const outOfBounds = (b: Box, f: Field) =>
  b.x0 < EDGE_PAD || b.x1 > f.w - EDGE_PAD || (f.card !== null && overlaps(b, f.card));
// Soft limits: other dots and labels already placed, and the core.
const crowded = (b: Box, f: Field, taken: Box[]) =>
  hitsCircle(b, f.core) || taken.some((t) => overlaps(b, t));

// One label's side. Outward first, then the other side, on the first that is
// clear of everything. Nothing clear: a hover, focus or selection still shows,
// on a side that at least stays inside the hard limits; every other label
// fades out and keeps its last side so it does not jump while fading.
function chooseSide(s: Spot, width: number, prev: string | undefined, f: Field, taken: Box[]): Placement {
  const sides: Side[] = s.side === "right" ? ["right", "left"] : ["left", "right"];
  const box = (side: Side) => labelBox(s, side, width);
  const clear = sides.find((side) => !outOfBounds(box(side), f) && !crowded(box(side), f, taken));
  if (clear) return { side: clear, hidden: false };
  if (!s.keep) return { side: prev === "left" || prev === "right" ? prev : s.side, hidden: true };
  return { side: sides.find((side) => !outOfBounds(box(side), f)) ?? s.side, hidden: false };
}

// Labels claim space in priority order (selected, hovered, then nearest to the
// camera). Every node's dot is an obstacle from the start, so text never sits
// on top of a node, whichever of the two ranks first.
function placeLabels(c: Ctx, spots: Spot[]): Placement[] {
  const field: Field = { w: c.w, card: cardBox(c), core: coreCircle(c) };
  const order = spots.map((_, i) => i).sort((a, b) => spots[b].pri - spots[a].pri);
  const taken: Box[] = spots.map(dotBox);
  const out: Placement[] = spots.map((s) => ({ side: s.side, hidden: true }));
  order.forEach((i) => {
    const width = c.labelW[i] ?? 140;
    out[i] = chooseSide(spots[i], width, c.side[i], field, taken);
    if (!out[i].hidden) taken.push(labelBox(spots[i], out[i].side, width));
  });
  return out;
}

// Move each button to its node with a transform, and write the label opacity
// as a CSS variable. Nothing here goes through React.
export function writeButtons(c: Ctx, spots: Spot[]): void {
  const placed = placeLabels(c, spots);
  spots.forEach((spot, i) => {
    const btn = c.opts.buttons[i];
    if (!btn) return;
    const half = c.half[i] ?? 22;
    btn.style.transform = `translate3d(${(spot.x - half).toFixed(1)}px, ${(spot.y - half).toFixed(1)}px, 0)`;
    btn.style.zIndex = String(Math.round(spot.depth * 10));
    const lo = Math.max(labelOpacity(spot.depth, c.dim[i]), c.hov[i], c.sel[i]);
    btn.style.setProperty("--lo", placed[i].hidden ? "0" : lo.toFixed(2));
    if (c.side[i] !== placed[i].side) {
      c.side[i] = placed[i].side;
      btn.dataset.side = placed[i].side;
    }
  });
}
