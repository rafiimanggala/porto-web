"use client";

import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import MatchPanel from "./MatchPanel";
import { Controls, Pad, Prompt, TimerBar } from "./DoodleParts";
import { useCanvasSupport } from "./useCanvasSupport";
import { useDoodleGame } from "./useDoodleGame";

// B1: draw a word, watch a tiny in-browser matcher guess. Opt-in: the round
// only starts on the first stroke (or the sample button), and nothing runs
// until the card is near the viewport.
export default function DoodleGuess() {
  const reduce = useReducedMotion() === true;
  const canvasOk = useCanvasSupport();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useDoodleGame(hostRef, canvasRef, canvasOk, reduce);
  const { round, matches } = game;
  const state = game.status === "failed" || !canvasOk ? "fallback" : game.status;

  return (
    <div
      ref={hostRef}
      data-doodle
      data-state={state}
      data-phase={round.phase}
      data-word={round.word ?? ""}
      data-top={matches?.[0]?.id ?? ""}
      className="rounded-[var(--radius)] border border-line bg-surface-1 p-5 sm:p-6"
    >
      <span className="eyebrow">Try it</span>
      {state === "fallback" ? (
        <p className="t-body mt-4 max-w-xl text-dim">
          This browser cannot run the drawing demo, so it is switched off. Everything else on this
          page reads the same without it.
        </p>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-8">
          <div>
            <Prompt word={round.word} phase={round.phase} secondsLeft={game.secondsLeft} />
            {!reduce && (
              <TimerBar running={round.phase === "running"} over={round.phase === "over"} />
            )}
            <Pad
              canvasRef={canvasRef}
              handlers={game.handlers}
              locked={game.locked}
              hasInk={game.hasInk}
              loading={round.phase === "loading"}
              top={matches?.[0] ?? null}
            />
            <Controls
              phase={round.phase}
              locked={game.locked}
              hasInk={game.hasInk}
              onClear={game.onClear}
              onSample={game.onSample}
              onNext={game.onNext}
            />
            <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-dim">
              {game.message}
            </p>
          </div>
          <MatchPanel matches={matches} />
        </div>
      )}
    </div>
  );
}
