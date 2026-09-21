import { cellIndex, type Cell } from "../snake/engine";
import { COLS, ROWS, cellAt, type CellEls } from "./cells";

const DISTINCT_TO_INVITE = 10; // "about ten" distinct cells before the game is offered
const LIT_MS = 70; // the attribute is held this long, CSS transitions carry the fade

const ARROWS: Readonly<Record<string, Cell>> = {
  ArrowLeft: { col: -1, row: 0 },
  ArrowRight: { col: 1, row: 0 },
  ArrowUp: { col: 0, row: -1 },
  ArrowDown: { col: 0, row: 1 },
};

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

// The keyboard cursor: starts mid-grid, moves one cell per arrow, stops at edges.
export function moveCursor(from: Cell | null, key: string): Cell | null {
  if (!Object.hasOwn(ARROWS, key)) return null;
  const start = from ?? { col: Math.floor(COLS / 2), row: Math.floor(ROWS / 2) };
  return {
    col: clamp(start.col + ARROWS[key].col, 0, COLS - 1),
    row: clamp(start.row + ARROWS[key].row, 0, ROWS - 1),
  };
}

// Sets data-lit on a cell for a moment; a CSS transition does the fade.
function createFlasher(cells: CellEls) {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  return {
    flash(index: number) {
      const el = cells[index];
      if (!el) return;
      el.setAttribute("data-lit", "true");
      const timer = setTimeout(() => {
        el.removeAttribute("data-lit");
        timers.delete(timer);
      }, LIT_MS);
      timers.add(timer);
    },
    dispose: () => timers.forEach(clearTimeout),
  };
}

// Counts distinct cells and fires once when there are enough. Immutable set.
function createCounter(onInvite: () => void) {
  let visited: ReadonlySet<number> = new Set();
  let done = false;
  return (index: number) => {
    if (done || visited.has(index)) return;
    visited = new Set([...visited, index]);
    if (visited.size < DISTINCT_TO_INVITE) return;
    done = true;
    onInvite();
  };
}

export type Trail = {
  onMove: (e: PointerEvent) => void;
  onKey: (e: KeyboardEvent) => void;
  dispose: () => void;
};

export function createTrail(grid: HTMLElement, cells: CellEls, onInvite: () => void): Trail {
  const flasher = createFlasher(cells);
  const count = createCounter(onInvite);
  let last = -1;
  let cursor: Cell | null = null;

  const visit = (cell: Cell) => {
    const index = cellIndex(COLS, cell);
    if (index === last) return;
    last = index;
    flasher.flash(index);
    count(index);
  };

  return {
    onMove: (e) => {
      if (e.pointerType === "touch") return;
      const cell = cellAt(grid.getBoundingClientRect(), e.clientX, e.clientY);
      if (cell) visit(cell);
    },
    onKey: (e) => {
      const next = moveCursor(cursor, e.key);
      if (!next) return;
      e.preventDefault();
      cursor = next;
      visit(next);
    },
    dispose: flasher.dispose,
  };
}
