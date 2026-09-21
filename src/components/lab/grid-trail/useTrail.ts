import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { CellEls } from "./cells";
import { createTrail } from "./trail";

type Args = {
  enabled: boolean;
  gridRef: RefObject<HTMLDivElement | null>;
  cellRefs: RefObject<CellEls>;
  onInvite: () => void;
};

// Lights cells under the pointer (or a keyboard cursor) by toggling a data
// attribute. No React state per cell: the DOM attribute is the state, the
// fade is a CSS transition. After enough distinct cells it calls onInvite once.
export function useTrail({ enabled, gridRef, cellRefs, onInvite }: Args) {
  const invite = useRef(onInvite);
  useEffect(() => {
    invite.current = onInvite;
  });

  useEffect(() => {
    const grid = gridRef.current;
    if (!enabled || !grid) return;
    const trail = createTrail(grid, cellRefs.current, () => invite.current());
    grid.addEventListener("pointermove", trail.onMove, { passive: true });
    grid.addEventListener("keydown", trail.onKey);
    return () => {
      grid.removeEventListener("pointermove", trail.onMove);
      grid.removeEventListener("keydown", trail.onKey);
      trail.dispose();
    };
  }, [enabled, gridRef, cellRefs]);
}
