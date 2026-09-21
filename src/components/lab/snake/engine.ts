// Pure Snake rules. No DOM, no timers, no Math.random: the RNG is injected, so
// every transition is a function of (state, input) and can be replayed from a
// seed. The grid wraps at the edges; the only way to die is to run into
// yourself, and the only way to win is to fill every cell.

export type Dir = "up" | "down" | "left" | "right";
export type Cell = { readonly col: number; readonly row: number };
export type Status = "running" | "dead" | "won";
export type Rng = () => number;

export type SnakeState = {
  readonly cols: number;
  readonly rows: number;
  readonly snake: readonly Cell[]; // head first
  readonly dir: Dir; // direction of the last move
  readonly next: Dir; // direction queued for the next move
  readonly target: Cell;
  readonly score: number;
  readonly status: Status;
};

const DELTA: Readonly<Record<Dir, Cell>> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

const OPPOSITE: Readonly<Record<Dir, Dir>> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const START_LENGTH = 3;
const MIN_SIDE = 5;

export const opposite = (dir: Dir): Dir => OPPOSITE[dir];

export const sameCell = (a: Cell, b: Cell): boolean =>
  a.col === b.col && a.row === b.row;

export const cellIndex = (cols: number, cell: Cell): number =>
  cell.row * cols + cell.col;

const mod = (n: number, m: number): number => ((n % m) + m) % m;

// mulberry32: tiny seeded generator. The closure counter is the one place
// that mutates, and it never escapes; callers only ever see numbers in [0, 1).
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Uniform pick among free cells. Returns null when the snake fills the board.
export function spawnTarget(
  cols: number,
  rows: number,
  snake: readonly Cell[],
  rng: Rng,
): Cell | null {
  const taken = new Set(snake.map((c) => cellIndex(cols, c)));
  const free: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!taken.has(row * cols + col)) free.push({ col, row });
    }
  }
  if (free.length === 0) return null;
  const pick = Math.floor(rng() * free.length);
  return free[Math.min(Math.max(pick, 0), free.length - 1)];
}

export function createGame(cols: number, rows: number, rng: Rng): SnakeState {
  if (!Number.isInteger(cols) || !Number.isInteger(rows)) {
    throw new RangeError("Grid size must be whole numbers");
  }
  if (cols < MIN_SIDE || rows < MIN_SIDE) {
    throw new RangeError(`Grid must be at least ${MIN_SIDE} by ${MIN_SIDE}`);
  }
  const row = Math.floor(rows / 2);
  const headCol = Math.floor(cols / 2);
  const snake = Array.from({ length: START_LENGTH }, (_, i) => ({
    col: headCol - i,
    row,
  }));
  const target = spawnTarget(cols, rows, snake, rng);
  if (!target) throw new RangeError("No room for a target");
  return {
    cols,
    rows,
    snake,
    dir: "right",
    next: "right",
    target,
    score: 0,
    status: "running",
  };
}

// Queue a direction. A 180 degree turn is ignored, judged against the last
// move actually made, so two quick key presses cannot fold the snake in half.
export function turn(state: SnakeState, dir: Dir): SnakeState {
  if (state.status !== "running") return state;
  if (dir === OPPOSITE[state.dir] || dir === state.next) return state;
  return { ...state, next: dir };
}

// Pick the direction that closes the larger gap to the goal first. If that
// would be a reversal, slide sideways instead of ignoring the goal.
export function steerToward(state: SnakeState, goal: Cell): Dir {
  const head = state.snake[0];
  const dx = goal.col - head.col;
  const dy = goal.row - head.row;
  if (dx === 0 && dy === 0) return state.next;

  const horizontal: Dir | null = dx > 0 ? "right" : dx < 0 ? "left" : null;
  const vertical: Dir | null = dy > 0 ? "down" : dy < 0 ? "up" : null;
  const order =
    Math.abs(dx) >= Math.abs(dy) ? [horizontal, vertical] : [vertical, horizontal];

  for (const dir of order) {
    if (dir && dir !== OPPOSITE[state.dir]) return dir;
  }
  // Only the reverse direction closes the gap: sidestep on the other axis.
  const movingHorizontally = state.dir === "left" || state.dir === "right";
  if (movingHorizontally) return dy > 0 ? "down" : "up";
  return dx > 0 ? "right" : "left";
}

export const steer = (state: SnakeState, goal: Cell): SnakeState =>
  turn(state, steerToward(state, goal));

export function step(state: SnakeState, rng: Rng): SnakeState {
  if (state.status !== "running") return state;

  const head = state.snake[0];
  const delta = DELTA[state.next];
  const nextHead: Cell = {
    col: mod(head.col + delta.col, state.cols),
    row: mod(head.row + delta.row, state.rows),
  };
  const eating = sameCell(nextHead, state.target);
  // Unless it grows, the tail cell is vacated this tick, so moving into it is legal.
  const body = eating ? state.snake : state.snake.slice(0, -1);

  if (body.some((cell) => sameCell(cell, nextHead))) {
    return { ...state, dir: state.next, status: "dead" };
  }

  const snake = [nextHead, ...body];
  if (!eating) return { ...state, snake, dir: state.next };

  const target = spawnTarget(state.cols, state.rows, snake, rng);
  return {
    ...state,
    snake,
    dir: state.next,
    target: target ?? state.target,
    score: state.score + 1,
    status: target ? "running" : "won",
  };
}
