import type { Point, Stroke } from "@/lib/doodle/types";

// Canvas 2D painting for the doodle pad. Strokes live in a fixed 400 x 300
// logical space (see sample.ts), so a resize only changes the scale.

export const LINE_WIDTH = 7;

export function paintAll(
  ctx: CanvasRenderingContext2D,
  scale: number,
  strokes: readonly Stroke[],
  color: string
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) paintStroke(ctx, s);
}

function paintStroke(ctx: CanvasRenderingContext2D, s: Stroke): void {
  if (s.length === 0) return;
  if (s.length === 1) {
    ctx.beginPath();
    ctx.arc(s[0].x, s[0].y, LINE_WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(s[0].x, s[0].y);
  for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
  ctx.stroke();
}

// Fast path while drawing: only the newest segment.
export function paintSegment(ctx: CanvasRenderingContext2D, a: Point, b: Point): void {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}
