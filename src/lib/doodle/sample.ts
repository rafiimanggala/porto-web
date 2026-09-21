import type { ShapeId, Stroke } from "./types";
import { arc, densify, ellipse, line, poly } from "./geometry";

// Stored sample sketches for the "Try a sample sketch" button. Fixed data in
// canvas units (400 x 300), no randomness. They are what a keyboard or
// no-pointer visitor gets in place of drawing, and selfcheck.mts asserts the
// matcher reads each one as the shape it was drawn as.

export const CANVAS_W = 400;
export const CANVAS_H = 300;

const RAW: Readonly<Record<ShapeId, readonly Stroke[]>> = {
  sun: [
    ellipse(200, 150, 48, 48),
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 10 + 0.15;
      return line(200 + 68 * Math.cos(a), 150 + 68 * Math.sin(a), 200 + 108 * Math.cos(a), 150 + 108 * Math.sin(a));
    }),
  ],
  house: [
    poly([[132, 165], [132, 238], [268, 238], [268, 165]]),
    poly([[112, 168], [200, 88], [288, 168]], true),
    poly([[184, 238], [184, 192], [216, 192], [216, 238]]),
  ],
  tree: [
    ellipse(200, 112, 78, 66),
    poly([[188, 172], [187, 242]]),
    poly([[212, 172], [213, 242]]),
  ],
  fish: [
    ellipse(180, 150, 88, 52),
    poly([[258, 150], [318, 102], [318, 198]], true),
    ellipse(132, 138, 6, 6, 12),
  ],
  star: [
    poly(
      Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (Math.PI * i) / 5;
        const r = i % 2 === 0 ? 104 : 44;
        return [200 + r * Math.cos(a), 158 + r * Math.sin(a)] as const;
      }),
      true
    ),
  ],
  key: [
    ellipse(105, 150, 36, 36),
    line(141, 150, 310, 150),
    line(286, 150, 286, 190),
    line(256, 150, 256, 178),
  ],
  cup: [
    poly([[128, 102], [144, 226], [236, 226], [252, 102]], true),
    arc(250, 158, 44, 40, -Math.PI / 2, Math.PI / 2, 18),
    line(108, 238, 272, 238),
  ],
  cat: [
    ellipse(200, 168, 86, 70),
    poly([[124, 140], [122, 68], [172, 108]]),
    poly([[276, 140], [278, 68], [228, 108]]),
    ellipse(170, 158, 7, 8, 10),
    ellipse(230, 158, 7, 8, 10),
    poly([[192, 182], [208, 182], [200, 194]], true),
    line(120, 178, 60, 166),
    line(120, 192, 60, 204),
    line(280, 178, 340, 166),
    line(280, 192, 340, 204),
  ],
};

// A fixed, gentle hand-shake so the replay does not look like a ruler.
function shake(strokes: readonly Stroke[]): Stroke[] {
  return strokes.map((s, k) =>
    densify(s, 5).map((p, i) => ({
      x: p.x + 1.4 * Math.sin(i * 0.6 + k),
      y: p.y + 1.4 * Math.cos(i * 0.5 + k * 2),
    }))
  );
}

export const SAMPLE_SKETCHES: Readonly<Record<ShapeId, readonly Stroke[]>> = {
  sun: shake(RAW.sun),
  house: shake(RAW.house),
  tree: shake(RAW.tree),
  fish: shake(RAW.fish),
  star: shake(RAW.star),
  key: shake(RAW.key),
  cup: shake(RAW.cup),
  cat: shake(RAW.cat),
};
