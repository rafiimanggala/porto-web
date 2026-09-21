import { useCallback, useState } from "react";
import type { RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import type { Phase } from "./GamePanel";
import { clearBoard, type CellEls } from "./cells";
import type { GameResult } from "./runGame";

// The state machine around the game: hidden, invite, playing, over. Cell-level
// rendering stays in the DOM; this only holds what React has to know.
export function useGamePhase(
  gridRef: RefObject<HTMLDivElement | null>,
  cellRefs: RefObject<CellEls>,
) {
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("hidden");
  const [runId, setRunId] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);

  // With reduced motion there is no trail to discover the game through, so the
  // invitation is simply there, static. It still only starts on Start.
  const shown: Phase = reduce && phase === "hidden" ? "invite" : phase;

  const invite = useCallback(() => setPhase((p) => (p === "hidden" ? "invite" : p)), []);
  const over = useCallback((r: GameResult) => {
    setResult(r);
    setPhase("over");
  }, []);
  const close = useCallback(() => {
    clearBoard(cellRefs.current, gridRef.current);
    setResult(null);
    setPhase("hidden");
  }, [cellRefs, gridRef]);
  const start = useCallback(() => {
    setScore(0);
    setResult(null);
    setRunId((n) => n + 1);
    setPhase("playing");
    gridRef.current?.focus({ preventScroll: true });
  }, [gridRef]);

  return { reduce, phase, shown, runId, score, result, setScore, invite, over, close, start };
}
