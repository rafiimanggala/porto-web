"use client";

import { memo, useRef } from "react";
import type { RefObject } from "react";
import GamePanel, { type Phase } from "./GamePanel";
import { COLS, ROWS } from "./cells";
import { useGamePhase } from "./useGamePhase";
import { useSnakeGame } from "./useSnakeGame";
import { useTrail } from "./useTrail";
import styles from "./grid.module.css";

// Rendered once. Cells never re-render: the hooks flip data attributes on them.
const Cells = memo(function Cells({ refs }: { refs: RefObject<(HTMLDivElement | null)[]> }) {
  return Array.from({ length: COLS * ROWS }, (_, i) => (
    <div
      key={i}
      className={styles.cell}
      ref={(el) => {
        refs.current[i] = el;
      }}
    />
  ));
});

const TRAIL_HINT = "Move across the grid. Keyboard: focus it and use the arrow keys.";
// Reduced motion turns the trail off, so the idle captions must not promise it.
const STILL_HINT = "Motion is reduced, so the grid stays still. Use the Start button to play.";
const GRID_LABEL =
  "Interactive grid. Move the pointer across it to light cells, or focus it and use the arrow keys.";
const STILL_GRID_LABEL = "Game grid. Use the Start button to play.";
const CAPTIONS: Record<Phase, string> = {
  hidden: TRAIL_HINT,
  invite: TRAIL_HINT,
  playing: "Steer with the mouse or the arrow keys. Escape stops the game.",
  over: "Game over.",
};

function Caption({ phase, score, still }: { phase: Phase; score: number; still: boolean }) {
  const idle = phase === "hidden" || phase === "invite";
  return (
    <p className={`${styles.caption} mono mt-4 max-w-[80ch] text-xs leading-relaxed text-dim`}>
      {still && idle ? STILL_HINT : CAPTIONS[phase]}
      {phase === "playing" ? (
        <>
          {" "}
          Score <span data-testid="snake-score">{score}</span>.
        </>
      ) : null}
    </p>
  );
}

export default function GridTrail() {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const g = useGamePhase(gridRef, cellRefs);
  const inGame = g.shown === "playing" || g.shown === "over";

  useTrail({ enabled: !g.reduce && !inGame, gridRef, cellRefs, onInvite: g.invite });
  useSnakeGame({
    active: g.phase === "playing",
    runId: g.runId,
    gridRef,
    cellRefs,
    onScore: g.setScore,
    onOver: g.over,
    onQuit: g.close,
  });

  return (
    <div data-testid="grid-trail-root" data-phase={g.shown}>
      <div className={styles.stage}>
        <div
          ref={gridRef}
          tabIndex={g.reduce ? -1 : 0}
          role="group"
          aria-label={g.reduce ? STILL_GRID_LABEL : GRID_LABEL}
          data-testid="grid-trail"
          data-mode={inGame ? "game" : "trail"}
          className={styles.grid}
        >
          <Cells refs={cellRefs} />
        </div>
        <GamePanel
          phase={g.shown}
          score={g.score}
          result={g.result}
          onStart={g.start}
          onClose={g.close}
        />
      </div>

      <Caption phase={g.shown} score={g.score} still={g.reduce} />

      <p className={`${styles.note} t-body max-w-[58ch] text-dim`} data-testid="grid-trail-note">
        This one is desktop only. It needs a mouse or a keyboard and a wide screen, so on this device
        there is nothing to play.
      </p>
    </div>
  );
}
