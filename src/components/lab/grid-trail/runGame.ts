import {
  createGame,
  mulberry32,
  steer,
  step,
  turn,
  type Cell,
  type Dir,
  type Rng,
  type SnakeState,
} from "../snake/engine";
import { COLS, ROWS, cellAt, clearBoard, paintGame, type CellEls } from "./cells";

const START_DELAY_MS = 130;
const FASTEST_MS = 70;
const SPEEDUP_MS = 3; // per point scored

const KEY_DIRS: Readonly<Record<string, Dir>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export type GameResult = { score: number; status: "dead" | "won" };
export type GameCallbacks = {
  onScore: (score: number) => void;
  onOver: (result: GameResult) => void;
  onQuit: () => void;
};
type Control = "pointer" | "keys";

export const delayFor = (score: number) => Math.max(FASTEST_MS, START_DELAY_MS - score * SPEEDUP_MS);

// One tick: steer toward the pointer cell when the mouse is in charge, then move.
export function advance(state: SnakeState, control: Control, goal: Cell | null, rng: Rng) {
  const steered = control === "pointer" && goal ? steer(state, goal) : state;
  return step(steered, rng);
}

// Runs one Snake game against the grid's cells. Game state lives in this
// closure and moves only through the pure engine; the caller hears about the
// score and the ending, never about individual ticks. Returns a stop function.
export function runGame(
  grid: HTMLElement,
  cells: CellEls,
  seed: number,
  callbacks: () => GameCallbacks,
): () => void {
  clearBoard(cells, grid);
  const rng = mulberry32(seed);
  let state = createGame(COLS, ROWS, rng);
  let control: Control = "pointer";
  let goal: Cell | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  paintGame(cells, null, state);

  const tick = () => {
    const before = state;
    state = advance(state, control, goal, rng);
    paintGame(cells, before, state);
    if (state.score !== before.score) callbacks().onScore(state.score);
    if (state.status === "running") {
      timer = setTimeout(tick, delayFor(state.score));
      return;
    }
    grid.setAttribute("data-over", "true");
    callbacks().onOver({ score: state.score, status: state.status });
  };

  const onMove = (e: PointerEvent) => {
    const cell = cellAt(grid.getBoundingClientRect(), e.clientX, e.clientY);
    if (!cell) return;
    goal = cell;
    control = "pointer";
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") return callbacks().onQuit();
    if (!Object.hasOwn(KEY_DIRS, e.key)) return;
    e.preventDefault();
    control = "keys";
    state = turn(state, KEY_DIRS[e.key]);
  };

  timer = setTimeout(tick, START_DELAY_MS);
  grid.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("keydown", onKey);
  return () => {
    clearTimeout(timer);
    grid.removeEventListener("pointermove", onMove);
    window.removeEventListener("keydown", onKey);
  };
}
