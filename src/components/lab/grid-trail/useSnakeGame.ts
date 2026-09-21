import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { CellEls } from "./cells";
import { runGame, type GameCallbacks } from "./runGame";

export type { GameResult } from "./runGame";

type Args = GameCallbacks & {
  active: boolean;
  runId: number; // bump to start a fresh game while active stays true
  gridRef: RefObject<HTMLDivElement | null>;
  cellRefs: RefObject<CellEls>;
};

// Starts a game when `active` turns on and stops it when it turns off. The
// callbacks live in a ref so a parent re-render never restarts a running game.
export function useSnakeGame({ active, runId, gridRef, cellRefs, ...callbacks }: Args) {
  const latest = useRef<GameCallbacks>(callbacks);
  useEffect(() => {
    latest.current = callbacks;
  });

  useEffect(() => {
    const grid = gridRef.current;
    if (!active || !grid) return;
    const seed = (Date.now() ^ Math.imul(runId + 1, 2654435761)) >>> 0;
    return runGame(grid, cellRefs.current, seed, () => latest.current);
  }, [active, runId, gridRef, cellRefs]);
}
