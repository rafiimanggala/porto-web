"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { CANVAS_H, CANVAS_W } from "@/lib/doodle/sample";
import type { Stroke } from "@/lib/doodle/types";
import { begin, extend, finish, playSketch } from "./canvasInput";
import type { InkKind, PadContext, PointerEv } from "./canvasInput";
import { paintAll } from "./paint";

export type { InkKind } from "./canvasInput";

const MAX_DPR = 2;

type Options = {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
  readonly locked: boolean;
  readonly reduce: boolean;
  readonly onInk: (strokes: readonly Stroke[], kind: InkKind) => void;
};

// Pointer drawing on a DPR-aware canvas. Strokes are kept as immutable arrays
// in a ref (replaced, never edited) in a fixed 400 x 300 space, so a resize
// only changes the scale.
export function useDoodleCanvas({ canvasRef, locked, reduce, onInk }: Options) {
  const strokes = useRef<readonly Stroke[]>([]);
  const pointer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const color = useRef("#ededef");
  const onInkRef = useRef(onInk);

  useEffect(() => {
    onInkRef.current = onInk;
  });

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    paintAll(ctx, canvas.width / CANVAS_W, strokes.current, color.current);
  }, [canvasRef]);

  const stopPlayback = useCallback(() => {
    if (frame.current === null) return;
    cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext("2d")) return;
    const fit = () => {
      const width = canvas.getBoundingClientRect().width;
      if (width === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round((width * CANVAS_H * dpr) / CANVAS_W);
      color.current = getComputedStyle(canvas).color;
      repaint();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [canvasRef, repaint]);

  useEffect(() => stopPlayback, [stopPlayback]);

  const emit = useCallback((s: readonly Stroke[], kind: InkKind) => onInkRef.current(s, kind), []);
  const pad: PadContext = { strokes, pointer, frame, repaint, emit };

  return {
    getStrokes: () => strokes.current,
    handlers: {
      onPointerDown: (e: PointerEv) => {
        if (!locked) begin(pad, e);
      },
      onPointerMove: (e: PointerEv) => {
        if (!locked) extend(pad, e);
      },
      onPointerUp: (e: PointerEv) => finish(pad, e),
      onPointerCancel: (e: PointerEv) => finish(pad, e),
    },
    // Time is up: stop any sample playback and drop the held stroke so the
    // canvas stays exactly what the final matches were computed from.
    freeze: () => {
      stopPlayback();
      const canvas = canvasRef.current;
      const held = pointer.current;
      pointer.current = null;
      if (canvas && held !== null && canvas.hasPointerCapture(held)) {
        canvas.releasePointerCapture(held);
      }
    },
    clear: () => {
      stopPlayback();
      pointer.current = null;
      strokes.current = [];
      repaint();
    },
    playSample: (sample: readonly Stroke[]) => {
      stopPlayback();
      playSketch(pad, sample, reduce);
    },
  };
}
