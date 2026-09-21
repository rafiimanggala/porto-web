// Run: node --experimental-strip-types src/components/lab/snake/engine.selfcheck.mts
// Exercises the pure Snake engine. The module is loaded through a URL so the
// explicit .ts extension Node needs never appears in a TypeScript import path.

import assert from "node:assert/strict";

type Engine = typeof import("./engine");
const engine = (await import(new URL("./engine.ts", import.meta.url).href)) as Engine;
const { createGame, step, turn, steer, steerToward, spawnTarget, mulberry32, sameCell } =
  engine;
type State = ReturnType<Engine["createGame"]>;
type Cell = State["target"];

const COLS = 16;
const ROWS = 9;
let checks = 0;
const check = (name: string, fn: () => void) => {
  fn();
  checks += 1;
  console.log(`ok  ${name}`);
};

const deepFreeze = <T,>(value: T): T => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const withState = (state: State, patch: Partial<State>): State => ({ ...state, ...patch });
const unique = (cells: readonly Cell[]) =>
  new Set(cells.map((c) => `${c.col},${c.row}`)).size === cells.length;

check("same seed gives the same game, different seed can differ", () => {
  const a = createGame(COLS, ROWS, mulberry32(7));
  const b = createGame(COLS, ROWS, mulberry32(7));
  assert.deepEqual(a, b);
  const targets = new Set(
    Array.from({ length: 30 }, (_, i) => {
      const t = createGame(COLS, ROWS, mulberry32(i)).target;
      return `${t.col},${t.row}`;
    }),
  );
  assert.ok(targets.size > 5, "seeds should spread targets around");
});

check("rejects tiny or fractional grids", () => {
  assert.throws(() => createGame(3, 9, mulberry32(1)), RangeError);
  assert.throws(() => createGame(16, 4.5, mulberry32(1)), RangeError);
});

check("a step moves the head one cell and keeps the length", () => {
  const rng = mulberry32(1);
  const s0 = createGame(COLS, ROWS, rng);
  const s1 = step(s0, rng);
  assert.equal(s1.snake.length, s0.snake.length);
  assert.deepEqual(s1.snake[0], { col: s0.snake[0].col + 1, row: s0.snake[0].row });
  assert.equal(s1.score, 0);
  assert.notEqual(s1, s0);
  assert.equal(s0.snake[0].col, Math.floor(COLS / 2), "input state is untouched");
});

check("the grid wraps at the right edge", () => {
  const rng = mulberry32(2);
  const s0 = createGame(COLS, ROWS, rng);
  const edge = withState(s0, {
    snake: [{ col: COLS - 1, row: 4 }, { col: COLS - 2, row: 4 }, { col: COLS - 3, row: 4 }],
    target: { col: 0, row: 0 },
  });
  assert.deepEqual(step(edge, rng).snake[0], { col: 0, row: 4 });
});

check("eating grows the snake, scores, and respawns off the body", () => {
  const rng = mulberry32(3);
  const s0 = createGame(COLS, ROWS, rng);
  const head = s0.snake[0];
  const fed = withState(s0, { target: { col: head.col + 1, row: head.row } });
  const s1 = step(fed, rng);
  assert.equal(s1.snake.length, s0.snake.length + 1);
  assert.equal(s1.score, 1);
  assert.ok(!s1.snake.some((c) => sameCell(c, s1.target)));
});

check("running into the body kills, running into the vacating tail does not", () => {
  const rng = mulberry32(4);
  const base = createGame(COLS, ROWS, rng);
  // Head at (5,5) heading up into (5,4), which the body occupies mid-snake.
  const curled = withState(base, {
    snake: [
      { col: 5, row: 5 },
      { col: 6, row: 5 },
      { col: 6, row: 4 },
      { col: 5, row: 4 },
      { col: 4, row: 4 },
    ],
    dir: "left",
    next: "up",
    target: { col: 0, row: 0 },
  });
  assert.equal(step(curled, rng).status, "dead");

  // Four-cell loop: the head chases its own tail, which moves away this tick.
  const chase = withState(base, {
    snake: [
      { col: 5, row: 5 },
      { col: 6, row: 5 },
      { col: 6, row: 4 },
      { col: 5, row: 4 },
    ],
    dir: "left",
    next: "up",
    target: { col: 0, row: 0 },
  });
  const moved = step(chase, rng);
  assert.equal(moved.status, "running");
  assert.deepEqual(moved.snake[0], { col: 5, row: 4 });
});

check("a dead game stays dead and unchanged", () => {
  const rng = mulberry32(5);
  const dead = withState(createGame(COLS, ROWS, rng), { status: "dead" });
  assert.equal(step(dead, rng), dead);
  assert.equal(turn(dead, "up"), dead);
});

check("a reversal is ignored, a sideways turn is queued", () => {
  const s0 = createGame(COLS, ROWS, mulberry32(6));
  assert.equal(turn(s0, "left"), s0);
  assert.equal(turn(s0, "up").next, "up");
  // Two presses inside one tick: up then left must not fold onto the neck.
  // Left is judged against the last move made (right), so it is refused and
  // the queued up survives.
  const queued = turn(turn(s0, "up"), "left");
  assert.equal(queued.next, "up");
});

check("steerToward closes the larger gap, never reverses, sidesteps when needed", () => {
  const s0 = createGame(COLS, ROWS, mulberry32(8)); // heading right
  const head = s0.snake[0];
  assert.equal(steerToward(s0, { col: head.col + 5, row: head.row + 1 }), "right");
  assert.equal(steerToward(s0, { col: head.col + 1, row: head.row + 4 }), "down");
  assert.equal(steerToward(s0, { col: head.col - 5, row: head.row }), "up");
  assert.equal(steerToward(s0, { col: head.col - 5, row: head.row + 3 }), "down");
  assert.equal(steerToward(s0, head), "right", "on the goal: keep going");
  assert.equal(steer(s0, { col: head.col, row: head.row - 3 }).next, "up");
});

check("spawnTarget avoids the snake and reports a full board", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const s = createGame(COLS, ROWS, mulberry32(seed));
    const t = spawnTarget(COLS, ROWS, s.snake, mulberry32(seed + 1000));
    assert.ok(t && !s.snake.some((c) => sameCell(c, t)));
  }
  const full: Cell[] = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) full.push({ col, row });
  }
  assert.equal(spawnTarget(5, 5, full, mulberry32(1)), null);
});

check("filling the board wins", () => {
  const rng = mulberry32(9);
  const base = createGame(5, 5, rng);
  // 24 cells in a serpentine, head about to eat the last free cell.
  const path: Cell[] = [];
  for (let row = 0; row < 5; row += 1) {
    const cols = row % 2 === 0 ? [0, 1, 2, 3, 4] : [4, 3, 2, 1, 0];
    cols.forEach((col) => path.push({ col, row }));
  }
  const body = path.slice(0, 24).reverse(); // head first, ends at (0,0)
  const almost = withState(base, {
    snake: body,
    dir: "right",
    next: "right",
    target: path[24],
  });
  assert.ok(unique(almost.snake));
  const won = step(almost, rng);
  assert.equal(won.status, "won");
  assert.equal(won.snake.length, 25);
});

check("seeded chases keep every invariant on frozen state and do eat", () => {
  let eatenTotal = 0;
  let deaths = 0;
  for (let seed = 1; seed <= 25; seed += 1) {
    const rng = mulberry32(seed);
    const goals = mulberry32(seed + 500);
    let state = deepFreeze(createGame(COLS, ROWS, rng));
    for (let tick = 0; tick < 500 && state.status === "running"; tick += 1) {
      const wander = { col: Math.floor(goals() * COLS), row: Math.floor(goals() * ROWS) };
      const goal = tick % 4 === 0 ? wander : state.target; // mostly chase, sometimes drift
      state = deepFreeze(step(steer(state, goal), rng));
      assert.ok(unique(state.snake), "snake cells are distinct");
      assert.equal(state.snake.length, 3 + state.score);
      if (state.status === "running") {
        assert.ok(!state.snake.some((c) => sameCell(c, state.target)), "target is off the body");
      }
    }
    eatenTotal += state.score;
    deaths += state.status === "dead" ? 1 : 0;
  }
  // Greedy steering does not dodge its own body, so most runs end in a death.
  assert.ok(eatenTotal > 25, "chasing the target should eat");
  assert.ok(deaths > 0, "a body-blind steer must be able to die");
  console.log(`    25 seeds: ${eatenTotal} targets eaten, ${deaths} deaths`);
});

console.log(`\n${checks} checks passed`);
