import type { Push } from "./types";

// Where the two plates sit relative to each other. Plate A is displaced by
// +offset/2 and plate B by -offset/2. All pure: the engine owns the clock.

const BASE_DIR = { x: 0.92, y: -0.39 }; // resting direction of the offset
const PUSH_GAIN = 0.35; // how far the plates travel per px of pointer offset
const PUSH_LIMIT = 150; // CSS px cap on the pushed part of the offset
const EASE_SECONDS = 0.11; // time constant of the ease out and back
const SETTLE_PX = 0.08; // closer than this counts as arrived

const clampLength = (v: Push, limit: number): Push => {
  const len = Math.hypot(v.x, v.y);
  if (len <= limit || len === 0) return v;
  return { x: (v.x / len) * limit, y: (v.y / len) * limit };
};

export const restingOffset = (separation: number): Push => ({
  x: BASE_DIR.x * separation,
  y: BASE_DIR.y * separation,
});

export function targetOffset(separation: number, push: Push | null): Push {
  const rest = restingOffset(separation);
  if (!push) return rest;
  const pushed = clampLength({ x: push.x * PUSH_GAIN, y: push.y * PUSH_GAIN }, PUSH_LIMIT);
  return { x: rest.x + pushed.x, y: rest.y + pushed.y };
}

export const isSettled = (current: Push, target: Push): boolean =>
  Math.hypot(target.x - current.x, target.y - current.y) < SETTLE_PX;

// Exponential ease toward the target. `instant` is the reduced-motion path.
export function easeToward(current: Push, target: Push, dt: number, instant: boolean): Push {
  if (instant || isSettled(current, target)) return target;
  const k = 1 - Math.exp(-dt / EASE_SECONDS);
  return {
    x: current.x + (target.x - current.x) * k,
    y: current.y + (target.y - current.y) * k,
  };
}
