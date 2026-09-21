"use client";

import { useCallback, useEffect, useRef } from "react";
import { classify } from "@/lib/doodle/classifier";
import type { Model } from "@/lib/doodle/classifier";
import { createThrottle } from "@/lib/doodle/throttle";
import type { Throttle } from "@/lib/doodle/throttle";
import type { Match, Stroke } from "@/lib/doodle/types";

// Rate limit for the live panel: one classification per 200ms at most.
export const LIVE_INTERVAL_MS = 200;
// Shorter than this (in the 400 x 300 canvas space) is a tap, not a drawing.
export const MIN_EXTENT = 24;

export function matchStrokes(model: Model | null, strokes: readonly Stroke[]): Match[] | null {
  if (!model) return null;
  return classify(model, strokes, { minExtent: MIN_EXTENT });
}

// Throttled classification of the strokes on the pad. `schedule` may be called
// on every pointer move; `cancel` drops a pending trailing update.
export function useLiveMatches(
  model: Model | null,
  onResult: (matches: Match[] | null) => void
): { schedule: (strokes: readonly Stroke[]) => void; cancel: () => void } {
  const modelRef = useRef(model);
  const resultRef = useRef(onResult);
  const throttleRef = useRef<Throttle<readonly Stroke[]> | null>(null);

  useEffect(() => {
    modelRef.current = model;
    resultRef.current = onResult;
  });

  useEffect(() => {
    const throttle = createThrottle((strokes: readonly Stroke[]) => {
      resultRef.current(matchStrokes(modelRef.current, strokes));
    }, LIVE_INTERVAL_MS);
    throttleRef.current = throttle;
    return () => {
      throttle.cancel();
      throttleRef.current = null;
    };
  }, []);

  const schedule = useCallback((strokes: readonly Stroke[]) => {
    throttleRef.current?.call(strokes);
  }, []);
  const cancel = useCallback(() => {
    throttleRef.current?.cancel();
  }, []);

  return { schedule, cancel };
}
