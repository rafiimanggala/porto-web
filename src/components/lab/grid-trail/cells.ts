import { cellIndex, type Cell, type SnakeState } from "../snake/engine";

export const COLS = 16;
export const ROWS = 9;

export type CellEls = readonly (HTMLElement | null)[];

// Which cell is under a viewport point, or null when it is outside the grid.
export function cellAt(rect: DOMRect, clientX: number, clientY: number): Cell | null {
  if (rect.width === 0 || rect.height === 0) return null;
  const col = Math.floor(((clientX - rect.left) / rect.width) * COLS);
  const row = Math.floor(((clientY - rect.top) / rect.height) * ROWS);
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return null;
  return { col, row };
}

const unmark = (el: HTMLElement | null | undefined) => {
  el?.removeAttribute("data-snake");
  el?.removeAttribute("data-target");
};

// Swap the snake and target marks from one state to the next. The cells are
// plain divs; attributes are the whole rendering protocol, CSS does the rest.
export function paintGame(cells: CellEls, prev: SnakeState | null, next: SnakeState): void {
  if (prev) {
    prev.snake.forEach((c) => unmark(cells[cellIndex(COLS, c)]));
    unmark(cells[cellIndex(COLS, prev.target)]);
  }
  next.snake.forEach((c, i) =>
    cells[cellIndex(COLS, c)]?.setAttribute("data-snake", i === 0 ? "head" : "body"),
  );
  cells[cellIndex(COLS, next.target)]?.setAttribute("data-target", "true");
}

export function clearBoard(cells: CellEls, grid: HTMLElement | null): void {
  cells.forEach((el) => {
    unmark(el);
    el?.removeAttribute("data-lit");
  });
  grid?.removeAttribute("data-over");
}
