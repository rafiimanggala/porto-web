"use client";

import { useEffect, useRef } from "react";
import type { GameResult } from "./runGame";
import styles from "./grid.module.css";

export type Phase = "hidden" | "invite" | "playing" | "over";

const button = "mono min-h-11 rounded-xl border px-5 text-sm transition-colors";
const primary = `${button} border-transparent bg-accent font-medium text-bg hover:brightness-110`;
const secondary = `${button} border-line-strong bg-surface-3 text-fg hover:bg-surface-2`;

function Invite({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <p className="t-h3">Wanna play a game?</p>
      <p className="mt-2 text-sm leading-relaxed text-dim">
        Snake, on this grid. Steer with the mouse or the arrow keys. Escape stops it.
      </p>
      <button type="button" onClick={onStart} className={`${primary} mt-5`}>
        Start
      </button>
    </div>
  );
}

function Over({
  score,
  result,
  onStart,
  onClose,
}: {
  score: number;
  result: GameResult | null;
  onStart: () => void;
  onClose: () => void;
}) {
  const againRef = useRef<HTMLButtonElement>(null);
  // The ending is announced by role="status"; focus goes to the first action.
  useEffect(() => againRef.current?.focus(), []);

  return (
    <div role="status">
      <p className="t-h3" data-testid="snake-result">
        {result?.status === "won" ? "You filled the grid." : "You died."} Score {score}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button ref={againRef} type="button" onClick={onStart} className={primary}>
          Play again
        </button>
        <button type="button" onClick={onClose} className={secondary}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function GamePanel({
  phase,
  score,
  result,
  onStart,
  onClose,
}: {
  phase: Phase;
  score: number;
  result: GameResult | null;
  onStart: () => void;
  onClose: () => void;
}) {
  const visible = phase === "invite" || phase === "over";
  return (
    <div
      className={styles.panel}
      data-phase={phase}
      data-testid="snake-panel"
      role="region"
      aria-label="Snake"
      inert={!visible}
    >
      {phase === "over" ? (
        <Over score={score} result={result} onStart={onStart} onClose={onClose} />
      ) : (
        <Invite onStart={onStart} />
      )}
    </div>
  );
}
