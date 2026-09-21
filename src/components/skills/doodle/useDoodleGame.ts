"use client";

import { useReducer, useRef, useState } from "react";
import type { RefObject } from "react";
import { initialRound, ROUND_SECONDS, roundReducer } from "@/lib/doodle/round";
import { SAMPLE_SKETCHES } from "@/lib/doodle/sample";
import type { Match, Stroke } from "@/lib/doodle/types";
import { freshDeck } from "@/lib/doodle/words";
import { strokeMessage, timeUpMessage } from "./messages";
import { useDoodleCanvas } from "./useDoodleCanvas";
import type { InkKind } from "./useDoodleCanvas";
import { matchStrokes, useLiveMatches } from "./useLiveMatches";
import { useMatcher } from "./useMatcher";
import { useRoundTimer } from "./useRoundTimer";

// All the wiring for the draw-and-match card: lazy matcher, round state,
// throttled live matches, timer, and the three buttons.
export function useDoodleGame(
  hostRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  canvasOk: boolean,
  reduce: boolean
) {
  const [round, dispatch] = useReducer(roundReducer, initialRound);
  const [matches, setMatches] = useState<readonly Match[] | null>(null);
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [hasInk, setHasInk] = useState(false);
  const settle = useRef(false);

  const { status, model } = useMatcher(hostRef, canvasOk, () => {
    dispatch({ type: "loaded", deck: freshDeck(Math.random, null) });
  });

  const live = useLiveMatches(model, (next) => {
    setMatches(next);
    if (!settle.current) return;
    settle.current = false;
    setMessage(strokeMessage(next));
  });

  const onInk = (strokes: readonly Stroke[], kind: InkKind) => {
    if (round.phase === "over") return;
    if (kind === "down") {
      setHasInk(true);
      if (round.phase === "ready") setSecondsLeft(ROUND_SECONDS);
      dispatch({ type: "start" });
      return;
    }
    if (kind === "end") settle.current = true;
    live.schedule(strokes);
  };

  const locked = round.phase === "loading" || round.phase === "over";
  const pad = useDoodleCanvas({ canvasRef, locked, reduce, onInk });

  useRoundTimer(round.phase === "running", round.round, setSecondsLeft, () => {
    pad.freeze();
    live.cancel();
    settle.current = false;
    const final = matchStrokes(model, pad.getStrokes());
    setMatches(final);
    setMessage(timeUpMessage(final, round.word));
    dispatch({ type: "timeUp" });
  });

  const resetPad = () => {
    pad.clear();
    live.cancel();
    settle.current = false;
    setMatches(null);
    setHasInk(false);
  };

  return {
    status,
    round,
    matches,
    message,
    secondsLeft,
    hasInk,
    locked,
    handlers: pad.handlers,
    onClear: () => {
      resetPad();
      setMessage("Canvas cleared.");
    },
    onNext: () => {
      resetPad();
      setSecondsLeft(ROUND_SECONDS);
      setMessage("");
      dispatch({ type: "next", refill: freshDeck(Math.random, round.word) });
    },
    onSample: () => {
      if (round.word) pad.playSample(SAMPLE_SKETCHES[round.word]);
    },
  };
}
