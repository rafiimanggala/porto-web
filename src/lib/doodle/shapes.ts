import type { Rng, ShapeId, Stroke } from "./types";
import { between, chance } from "./rng";
import {
  arc,
  ellipse,
  line,
  multiply,
  perturb,
  poly,
  rotation,
  transform,
} from "./geometry";
import type { Affine } from "./geometry";

// Procedural prototype drawings. Each builder returns strokes in unit space
// with a few random choices (proportions, optional details) so the twelve or
// so variants per class are not copies of each other.

const TAU = Math.PI * 2;

function sun(rng: Rng): Stroke[] {
  const r = between(rng, 0.36, 0.46);
  const rays = 8 + Math.floor(rng() * 5);
  const inner = r + between(rng, 0.1, 0.18);
  const outer = between(rng, 0.9, 1);
  const spokes = Array.from({ length: rays }, (_, i) => {
    const a = (TAU * i) / rays + between(rng, -0.05, 0.05);
    return line(inner * Math.cos(a), inner * Math.sin(a), outer * Math.cos(a), outer * Math.sin(a));
  });
  return [ellipse(0, 0, r, r), ...spokes];
}

function house(rng: Rng): Stroke[] {
  const w = between(rng, 0.5, 0.65);
  const eave = between(rng, 0.05, 0.15);
  const roofX = w + between(rng, 0.05, 0.2);
  const top = -between(rng, 0.7, 0.95);
  const floor = between(rng, 0.7, 0.85);
  const parts: Stroke[] = [
    poly([[-w, -eave], [-w, floor], [w, floor], [w, -eave]]),
    poly([[-roofX, -eave], [between(rng, -0.08, 0.08), top], [roofX, -eave]], true),
    poly([[-0.15, floor], [-0.15, floor - 0.42], [0.15, floor - 0.42], [0.15, floor]]),
  ];
  if (chance(rng, 0.5)) parts.push(poly([[0.3, 0.1], [0.5, 0.1], [0.5, 0.3], [0.3, 0.3]], true));
  return parts;
}

function pine(rng: Rng): Stroke[] {
  const w = between(rng, 0.5, 0.65);
  const base = between(rng, 0.25, 0.4);
  const tw = between(rng, 0.08, 0.14);
  return [
    poly([[-w, base], [between(rng, -0.05, 0.05), -0.9], [w, base]], true),
    poly([[-tw, base], [-tw, 0.9]]),
    poly([[tw, base], [tw, 0.9]]),
  ];
}

function tree(rng: Rng): Stroke[] {
  if (chance(rng, 0.3)) return pine(rng);
  const rx = between(rng, 0.5, 0.65);
  const ry = between(rng, 0.42, 0.55);
  const cy = -between(rng, 0.25, 0.4);
  const tw = between(rng, 0.09, 0.15);
  const base = 0.9;
  const trunkTop = cy + ry * 0.9;
  return [
    ellipse(0, cy, rx, ry, 30),
    poly([[-tw, trunkTop], [-tw, base]]),
    poly([[tw, trunkTop], [tw, base]]),
  ];
}

function fish(rng: Rng): Stroke[] {
  const ry = between(rng, 0.3, 0.42);
  const rx = between(rng, 0.55, 0.7);
  const tailStart = rx - 0.1;
  const tailX = tailStart + between(rng, 0.3, 0.42);
  const tailH = between(rng, 0.28, 0.4);
  return [
    ellipse(-0.15, 0, rx, ry),
    poly([[tailStart, 0], [tailX, -tailH], [tailX, tailH]], true),
    ellipse(-0.15 - rx * 0.55, -ry * 0.25, 0.05, 0.05, 10),
  ];
}

function star(rng: Rng): Stroke[] {
  const outer = between(rng, 0.85, 0.95);
  if (chance(rng, 0.3)) {
    // Pentagram drawn as one crossing stroke.
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = -Math.PI / 2 + (TAU * 2 * i) / 5;
      return [outer * Math.cos(a), outer * Math.sin(a)] as const;
    });
    return [poly(pts)];
  }
  const inner = outer * between(rng, 0.36, 0.5);
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * i) / 5;
    const r = i % 2 === 0 ? outer : inner;
    return [r * Math.cos(a), r * Math.sin(a)] as const;
  });
  return [poly(pts, true)];
}

function key(rng: Rng): Stroke[] {
  const br = between(rng, 0.22, 0.3);
  const bx = -0.9 + br;
  const end = between(rng, 0.85, 0.95);
  const tooth = between(rng, 0.2, 0.32);
  return [
    ellipse(bx, 0, br, br, 24),
    line(bx + br, 0, end, 0),
    line(end - 0.12, 0, end - 0.12, tooth),
    line(end - 0.36, 0, end - 0.36, tooth * 0.75),
  ];
}

function cup(rng: Rng): Stroke[] {
  const top = between(rng, 0.45, 0.55);
  const bottom = top - between(rng, 0.08, 0.16);
  const h = between(rng, 0.4, 0.55);
  const hr = between(rng, 0.25, 0.35);
  const parts: Stroke[] = [
    poly([[-top, -h], [-bottom, h], [bottom, h], [top, -h]], true),
    arc(top - 0.02, 0, hr, hr * 0.9, -Math.PI / 2, Math.PI / 2, 16),
  ];
  if (chance(rng, 0.5)) parts.push(line(-top - 0.2, h + 0.08, top + 0.2, h + 0.08));
  return parts;
}

function cat(rng: Rng): Stroke[] {
  const rx = between(rng, 0.6, 0.72);
  const ry = between(rng, 0.5, 0.6);
  const ear = between(rng, 0.7, 0.9);
  const ears = [-1, 1].map((s) =>
    poly([[s * (rx - 0.05), -ry * 0.5], [s * (rx - 0.1), -ear], [s * 0.15, -ry * 0.92]])
  );
  const eyes = [-1, 1].map((s) => ellipse(s * 0.27, -0.05, 0.06, 0.07, 10));
  const whiskerLen = rx + between(rng, 0.2, 0.32);
  const whiskers = [-1, 1].flatMap((s) => [
    line(s * 0.3, 0.18, s * whiskerLen, 0.08),
    line(s * 0.3, 0.26, s * whiskerLen, 0.32),
  ]);
  return [ellipse(0, 0.05, rx, ry, 32), ...ears, ...eyes, ...whiskers];
}

const BUILDERS: Readonly<Record<ShapeId, (rng: Rng) => Stroke[]>> = {
  sun, house, tree, fish, star, key, cup, cat,
};

// How each class may be turned or flipped when someone draws it. Keys and
// fish are the ones people draw at any angle, mugs and fish face either way.
const POSE: Readonly<Record<ShapeId, { tilt: number; flip: boolean; quarter: boolean }>> = {
  sun: { tilt: 0.15, flip: false, quarter: false },
  house: { tilt: 0.1, flip: true, quarter: false },
  tree: { tilt: 0.12, flip: true, quarter: false },
  fish: { tilt: 0.25, flip: true, quarter: false },
  star: { tilt: 0.25, flip: false, quarter: false },
  key: { tilt: 0.3, flip: true, quarter: true },
  cup: { tilt: 0.1, flip: true, quarter: false },
  cat: { tilt: 0.12, flip: false, quarter: false },
};

export function prototypeStrokes(id: ShapeId, rng: Rng): Stroke[] {
  const pose = POSE[id];
  const base = BUILDERS[id](rng);
  const turn = pose.quarter && chance(rng, 0.4) ? (chance(rng, 0.5) ? 1 : -1) * Math.PI / 2 : 0;
  const angle = turn + between(rng, -pose.tilt, pose.tilt);
  const flip: Affine = pose.flip && chance(rng, 0.5) ? [-1, 0, 0, 1] : [1, 0, 0, 1];
  const squash: Affine = [between(rng, 0.88, 1.12), 0, between(rng, -0.08, 0.08), between(rng, 0.88, 1.12)];
  const placed = transform(base, multiply(rotation(angle), multiply(squash, flip)));
  return perturb(placed, rng, 0.02, 0.008);
}
