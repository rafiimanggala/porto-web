import type { Point, Rng, ShapeId, Stroke } from "./types";
import { between, chance, gauss } from "./rng";

// Synthetic "hand drawn" test sketches for selfcheck.mts. Deliberately built
// differently from shapes.ts: pixel-sized canvas coordinates, shapes drawn as
// single continuous paths with overshoot, different proportions, uneven
// sample spacing like real pointer events, and stronger shakiness.

const TAU = Math.PI * 2;
type Vec = readonly [number, number];

const P = (x: number, y: number): Point => ({ x, y });

// Sample a smooth parametric curve at t in [0, 1].
function curve(f: (t: number) => Vec, n = 40): Stroke {
  return Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = f(i / n);
    return P(x, y);
  });
}

function through(points: readonly Vec[]): Stroke {
  return points.map(([x, y]) => P(x, y));
}

function loop(cx: number, cy: number, rx: number, ry: number, from: number, sweep: number): Stroke {
  return curve((t) => [cx + rx * Math.cos(from + sweep * t), cy + ry * Math.sin(from + sweep * t)]);
}

function sunSketch(rng: Rng): Stroke[] {
  const r = between(rng, 0.9, 1.1);
  const rays = 6 + Math.floor(rng() * 5);
  const offset = between(rng, 0, TAU);
  const strokes: Stroke[] = [loop(0, 0, r, r * between(rng, 0.9, 1.1), between(rng, 0, TAU), between(rng, 6.4, 7))];
  for (let i = 0; i < rays; i++) {
    const a = offset + (TAU * i) / rays + between(rng, -0.12, 0.12);
    const a0 = r * between(rng, 1.2, 1.4);
    const a1 = r * between(rng, 1.8, 2.4);
    strokes.push(through([[a0 * Math.cos(a), a0 * Math.sin(a)], [a1 * Math.cos(a), a1 * Math.sin(a)]]));
  }
  return strokes;
}

function houseSketch(rng: Rng): Stroke[] {
  const w = between(rng, 1.1, 1.6);
  const wall = between(rng, 1, 1.5);
  const roof = between(rng, 0.7, 1.2);
  const over = between(rng, 0, 0.25);
  const lean = between(rng, -0.15, 0.15);
  const body = through([
    [-w, wall * 0.1 + 0.05], [-w, wall], [w, wall + lean * 0.2], [w + 0.03, -wall * 0.05],
    [0, -roof + lean], [-w - over, 0],
  ]);
  const doorW = between(rng, 0.25, 0.4);
  const doorX = between(rng, -0.4, 0.4);
  return [body, through([[doorX - doorW, wall], [doorX - doorW, wall * 0.35], [doorX + doorW, wall * 0.35], [doorX + doorW, wall]])];
}

// Fir silhouette drawn as one zig-zag outline.
function firSketch(rng: Rng): Stroke[] {
  const step = between(rng, 0.25, 0.45);
  const wide = between(rng, 0.85, 1.05);
  return [through([
    [0, -1.2], [-wide * 0.6, -0.3], [-wide * 0.6 + step, -0.3], [-wide, 0.5], [-0.15, 0.5],
    [-0.15, 1.1], [0.15, 1.1], [0.15, 0.5], [wide, 0.5], [wide * 0.6 - step, -0.3], [wide * 0.6, -0.3], [0.02, -1.2],
  ])];
}

function treeSketch(rng: Rng): Stroke[] {
  if (chance(rng, 0.25)) return firSketch(rng);
  const lumps = 4 + Math.floor(rng() * 3);
  const amp = between(rng, 0.08, 0.16);
  const rx = between(rng, 0.9, 1.15);
  const ry = between(rng, 0.8, 1.05);
  const cloud = curve((t) => {
    const a = TAU * t * 1.03;
    const k = 1 + amp * Math.sin(lumps * a);
    return [rx * k * Math.cos(a), -0.4 + ry * k * Math.sin(a)];
  }, 60);
  const tw = between(rng, 0.12, 0.25);
  const bottom = ry - 0.3 + between(rng, 0.9, 1.3);
  return [
    cloud,
    through([[-tw, ry - 0.4], [-tw * 1.1, bottom]]),
    through([[tw, ry - 0.4], [tw * 1.1, bottom]]),
  ];
}

function fishSketch(rng: Rng): Stroke[] {
  const len = between(rng, 1.7, 2.1);
  const belly = between(rng, 0.45, 0.7);
  const half = len / 2;
  const top = curve((t) => [-half + len * t, -belly * Math.sin(Math.PI * t) ** 0.9]);
  const bottom = curve((t) => [half - len * t, belly * Math.sin(Math.PI * t) ** 0.9]);
  const tail = through([[half - 0.05, 0.02], [half + between(rng, 0.45, 0.7), -between(rng, 0.4, 0.6)],
    [half + between(rng, 0.3, 0.5), 0], [half + between(rng, 0.45, 0.7), between(rng, 0.4, 0.6)], [half - 0.05, -0.02]]);
  const eye = loop(-half * 0.6, -belly * 0.25, 0.07, 0.07, 0, TAU);
  return [[...top, ...bottom], tail, eye];
}

function starSketch(rng: Rng): Stroke[] {
  const r = between(rng, 1, 1.2);
  if (chance(rng, 0.4)) {
    const start = between(rng, -1.8, -1.35);
    return [curve((t) => {
      const a = start + ((TAU * 2) / 5) * Math.round(t * 5);
      return [r * Math.cos(a), r * Math.sin(a)];
    }, 5)];
  }
  const ratio = between(rng, 0.42, 0.55);
  const spin = between(rng, -0.35, 0.35);
  const pts: Vec[] = Array.from({ length: 11 }, (_, i) => {
    const a = spin - Math.PI / 2 + (Math.PI * i) / 5;
    const rad = i % 2 === 0 ? r : r * ratio;
    return [rad * Math.cos(a), rad * Math.sin(a)];
  });
  return [through(pts)];
}

function keySketch(rng: Rng): Stroke[] {
  const len = between(rng, 2, 2.4);
  const bow = between(rng, 0.28, 0.4);
  const x0 = -len / 2;
  const shaftEnd = len / 2;
  const teeth = 2 + Math.floor(rng() * 2);
  const strokes: Stroke[] = [
    loop(x0 + bow, 0, bow, bow, 0, TAU * 1.05),
    through([[x0 + 2 * bow, 0], [shaftEnd, between(rng, -0.03, 0.03)]]),
  ];
  for (let i = 0; i < teeth; i++) {
    const x = shaftEnd - 0.12 - i * between(rng, 0.2, 0.28);
    strokes.push(through([[x, 0], [x, between(rng, 0.2, 0.4)]]));
  }
  return strokes;
}

function cupSketch(rng: Rng): Stroke[] {
  const w = between(rng, 0.85, 1.1);
  const h = between(rng, 0.9, 1.2);
  const taper = between(rng, 0.05, 0.25);
  const body: Stroke = [
    ...through([[-w, -h], [-w + taper, h * 0.75]]),
    ...curve((t) => [-w + taper + (2 * (w - taper)) * t, h * 0.75 + 0.22 * Math.sin(Math.PI * t)], 12),
    ...through([[w, -h]]),
  ];
  const hx = w + between(rng, 0.35, 0.55);
  const handle = through([[w, -h * 0.55], [hx, -h * 0.5], [hx, h * 0.25], [w - taper * 0.6, h * 0.35]]);
  const rim = chance(rng, 0.6) ? [through([[-w - 0.05, -h], [w + 0.05, -h]])] : [];
  return [body, handle, ...rim];
}

function catSketch(rng: Rng): Stroke[] {
  const rx = between(rng, 1, 1.25);
  const ry = between(rng, 0.85, 1.05);
  const ear = between(rng, 0.5, 0.8);
  // One closed head outline with the ears as peaks on the top edge.
  const head = curve((t) => {
    const a = TAU * t;
    const wrapped = ((a + Math.PI) % TAU) - Math.PI;
    const bump = [-1, 1].reduce((sum, k) => sum + Math.max(0, 1 - Math.abs(wrapped - (k * 0.8 - Math.PI / 2)) / 0.3), 0);
    return [rx * Math.cos(a), ry * Math.sin(a) - bump * ear];
  }, 90);
  const eyes = [-1, 1].map((s) => loop(s * rx * 0.4, -ry * 0.1, 0.07, 0.09, 0, TAU));
  const nose = through([[-0.08, ry * 0.2], [0.08, ry * 0.2], [0, ry * 0.3], [-0.08, ry * 0.2]]);
  const whiskers = [-1, 1].flatMap((s) =>
    [0.15, 0.32].map((dy) =>
      through([[s * rx * 0.35, ry * dy], [s * (rx + between(rng, 0.5, 0.8)), ry * (dy - 0.1 + between(rng, -0.1, 0.25))]])
    )
  );
  return [head, ...eyes, nose, ...whiskers];
}

const SKETCHES: Readonly<Record<ShapeId, (rng: Rng) => Stroke[]>> = {
  sun: sunSketch, house: houseSketch, tree: treeSketch, fish: fishSketch,
  star: starSketch, key: keySketch, cup: cupSketch, cat: catSketch,
};

// Resample with random spacing (pointer events are unevenly spaced), shake it,
// then place at a random spot, size and slight angle on a 400x300 canvas.
function handDrawn(strokes: readonly Stroke[], rng: Rng, angle: number, shaky: number): Stroke[] {
  const size = between(rng, 90, 230);
  const cx = between(rng, 130, 270);
  const cy = between(rng, 110, 190);
  const sx = between(rng, 0.85, 1.2);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return strokes.map((s) => {
    const f1 = between(rng, 1.2, 3);
    const ph = between(rng, 0, TAU);
    const keep = s.filter((_, i) => i === 0 || i === s.length - 1 || rng() > 0.35);
    return keep.map((p, i) => {
      const t = i / Math.max(1, keep.length - 1);
      const wob = 0.045 * shaky * Math.sin(f1 * TAU * t + ph);
      const x = (p.x + wob + 0.014 * shaky * gauss(rng)) * sx;
      const y = p.y - wob * 0.6 + 0.014 * shaky * gauss(rng);
      return P(cx + size * 0.5 * (x * cos - y * sin), cy + size * 0.5 * (x * sin + y * cos));
    });
  });
}

// `shaky` scales the hand tremor: 1 is a steady hand, 2 or 3 is a rushed finger.
export function drawUserSketch(id: ShapeId, rng: Rng, shaky = 1): Stroke[] {
  const quarter = id === "key" && chance(rng, 0.3) ? Math.PI / 2 : 0;
  const angle = quarter + between(rng, -0.2, 0.2);
  const dense = SKETCHES[id](rng).map((s) => densifyLoose(s, rng));
  return handDrawn(dense, rng, angle, shaky);
}

// Straight two-point strokes need intermediate points before wobble applies.
function densifyLoose(s: Stroke, rng: Rng): Stroke {
  const out: Point[] = [];
  s.forEach((p, i) => {
    if (i === 0) {
      out.push(p);
      return;
    }
    const q = s[i - 1];
    const n = Math.max(1, Math.round(Math.hypot(p.x - q.x, p.y - q.y) / between(rng, 0.08, 0.2)));
    for (let k = 1; k <= n; k++) out.push(P(q.x + ((p.x - q.x) * k) / n, q.y + ((p.y - q.y) * k) / n));
  });
  return out;
}
