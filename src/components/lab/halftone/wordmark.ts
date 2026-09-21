// Paints the wordmark into a 2D canvas that the shader reads as two tone fields.
//   R: soft field. Letters plus a stroked halo and a faint radial glow.
//   G: sharp letters with a gentle vertical fade, so dot size varies inside them.
// Channels are added with "lighter", so R and G never overwrite each other.
// Blur comes from stacked strokes, not ctx.filter, which Safari does not have.

const FALLBACK_FAMILY = "ui-sans-serif, system-ui, sans-serif";
const WEIGHT = 700; // the heaviest weight the display face ships with

// next/font publishes the loaded family under a CSS variable on <html>.
export function displayFamily(): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-space")
    .trim();
  return raw ? `${raw}, ${FALLBACK_FAMILY}` : FALLBACK_FAMILY;
}

// Resolve once the face is decodable, so the first paint is not a fallback font.
// A failure is not fatal: the caller still draws with the fallback stack.
export async function loadWordmarkFont(family: string, text: string): Promise<boolean> {
  try {
    const loaded = await document.fonts.load(`${WEIGHT} 100px ${family}`, text);
    return loaded.length > 0;
  } catch (err) {
    console.warn("Wordmark font did not load, using fallback", err);
    return false;
  }
}

type Layout = { fontPx: number; lineHeight: number };

function fitLayout(
  ctx: CanvasRenderingContext2D,
  lines: readonly string[],
  family: string,
  w: number,
  h: number,
): Layout {
  ctx.font = `${WEIGHT} 100px ${family}`;
  const widest100 = Math.max(...lines.map((line) => ctx.measureText(line).width), 1);
  const byWidth = (w * 0.88 * 100) / widest100;
  const byHeight = (h * 0.8) / (lines.length * 0.9);
  const fontPx = Math.max(8, Math.min(byWidth, byHeight));
  return { fontPx, lineHeight: fontPx * 0.9 };
}

function lineBaselines(count: number, h: number, lineHeight: number): number[] {
  const top = (h - lineHeight * count) / 2;
  return Array.from({ length: count }, (_, i) => top + lineHeight * (i + 0.5));
}

function paintGlow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) * 0.34);
  glow.addColorStop(0, "rgb(46,0,0)");
  glow.addColorStop(1, "rgb(0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function paintSoftPlate(
  ctx: CanvasRenderingContext2D,
  lines: readonly string[],
  ys: readonly number[],
  layout: Layout,
  w: number,
): void {
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,0,0,0.028)";
  for (let ring = 1; ring <= 9; ring += 1) {
    ctx.lineWidth = layout.fontPx * 0.028 * ring;
    lines.forEach((line, i) => ctx.strokeText(line, w / 2, ys[i]));
  }
  ctx.fillStyle = "rgb(96,0,0)";
  lines.forEach((line, i) => ctx.fillText(line, w / 2, ys[i]));
}

function paintSharpPlate(
  ctx: CanvasRenderingContext2D,
  lines: readonly string[],
  ys: readonly number[],
  layout: Layout,
  w: number,
  h: number,
): void {
  const fade = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.9);
  fade.addColorStop(0, "rgb(0,168,0)");
  fade.addColorStop(1, "rgb(0,88,0)");
  ctx.fillStyle = fade;
  lines.forEach((line, i) => ctx.fillText(line, w / 2, ys[i]));
  // Half a pixel of feathering so the plate edge is not a hard stair-step.
  ctx.strokeStyle = "rgba(0,120,0,0.5)";
  ctx.lineWidth = Math.max(1, layout.fontPx * 0.006);
  lines.forEach((line, i) => ctx.strokeText(line, w / 2, ys[i]));
}

export function drawWordmark(
  w: number,
  h: number,
  lines: readonly string[],
  family: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is not available for the wordmark texture");

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const layout = fitLayout(ctx, lines, family, w, h);
  ctx.font = `${WEIGHT} ${layout.fontPx}px ${family}`;
  const ys = lineBaselines(lines.length, h, layout.lineHeight);

  paintGlow(ctx, w, h);
  paintSoftPlate(ctx, lines, ys, layout, w);
  paintSharpPlate(ctx, lines, ys, layout, w, h);
  return canvas;
}
