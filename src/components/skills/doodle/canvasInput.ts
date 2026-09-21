import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { firstPoints, pointCount } from "@/lib/doodle/geometry";
import { CANVAS_H, CANVAS_W } from "@/lib/doodle/sample";
import type { Point, Stroke } from "@/lib/doodle/types";
import { paintSegment } from "./paint";

export type InkKind = "down" | "draw" | "end";
export type PointerEv = ReactPointerEvent<HTMLCanvasElement>;

const MIN_STEP = 1.5; // canvas units between recorded points
const SAMPLE_MS = 1100;

// Everything the input code needs from the hook. Refs hold the latest values;
// strokes are replaced with new arrays, never edited in place.
export type PadContext = {
  readonly strokes: MutableRefObject<readonly Stroke[]>;
  readonly pointer: MutableRefObject<number | null>;
  readonly frame: MutableRefObject<number | null>;
  readonly repaint: () => void;
  readonly emit: (strokes: readonly Stroke[], kind: InkKind) => void;
};

function toPoint(e: PointerEv): Point | null {
  const rect = e.currentTarget.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

export function begin(pad: PadContext, e: PointerEv): void {
  if (pad.pointer.current !== null || pad.frame.current !== null) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;
  const p = toPoint(e);
  if (!p) return;
  e.currentTarget.setPointerCapture(e.pointerId);
  pad.pointer.current = e.pointerId;
  pad.strokes.current = [...pad.strokes.current, [p]];
  pad.repaint();
  pad.emit(pad.strokes.current, "down");
}

export function extend(pad: PadContext, e: PointerEv): void {
  if (e.pointerId !== pad.pointer.current) return;
  const p = toPoint(e);
  const current = pad.strokes.current;
  const last = current[current.length - 1];
  const prev = last?.[last.length - 1];
  if (!p || !last || !prev) return;
  if (Math.hypot(p.x - prev.x, p.y - prev.y) < MIN_STEP) return;
  pad.strokes.current = [...current.slice(0, -1), [...last, p]];
  const ctx = e.currentTarget.getContext("2d");
  if (ctx) paintSegment(ctx, prev, p);
  pad.emit(pad.strokes.current, "draw");
}

export function finish(pad: PadContext, e: PointerEv): void {
  if (e.pointerId !== pad.pointer.current) return;
  pad.pointer.current = null;
  if (e.currentTarget.hasPointerCapture(e.pointerId)) {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }
  pad.emit(pad.strokes.current, "end");
}

// Replays a stored sketch. Reduced motion gets the finished drawing at once.
export function playSketch(pad: PadContext, sample: readonly Stroke[], reduce: boolean): void {
  pad.pointer.current = null;
  pad.strokes.current = [];
  pad.repaint();
  pad.emit(pad.strokes.current, "down");
  if (reduce) {
    pad.strokes.current = sample;
    pad.repaint();
    pad.emit(sample, "end");
    return;
  }
  const total = pointCount(sample);
  const t0 = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - t0) / SAMPLE_MS);
    pad.strokes.current = firstPoints(sample, Math.ceil(total * progress));
    pad.repaint();
    const done = progress >= 1;
    pad.frame.current = done ? null : requestAnimationFrame(step);
    pad.emit(pad.strokes.current, done ? "end" : "draw");
  };
  pad.frame.current = requestAnimationFrame(step);
}
