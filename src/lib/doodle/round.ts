import type { ShapeId } from "./types";

// Round state machine for the draw-and-match game. Pure: randomness arrives
// inside the action as a ready shuffled deck.

export const ROUND_SECONDS = 20;

export type Phase = "loading" | "ready" | "running" | "over";

export type RoundState = {
  readonly phase: Phase;
  readonly word: ShapeId | null;
  readonly queue: readonly ShapeId[];
  readonly round: number;
};

export type RoundAction =
  | { readonly type: "loaded"; readonly deck: readonly ShapeId[] }
  | { readonly type: "start" }
  | { readonly type: "timeUp" }
  | { readonly type: "next"; readonly refill: readonly ShapeId[] };

export const initialRound: RoundState = { phase: "loading", word: null, queue: [], round: 0 };

export function roundReducer(state: RoundState, action: RoundAction): RoundState {
  switch (action.type) {
    case "loaded": {
      if (state.phase !== "loading" || action.deck.length === 0) return state;
      const [word, ...queue] = action.deck;
      return { phase: "ready", word, queue, round: 1 };
    }
    case "start":
      return state.phase === "ready" ? { ...state, phase: "running" } : state;
    case "timeUp":
      return state.phase === "running" ? { ...state, phase: "over" } : state;
    case "next": {
      if (state.phase === "loading") return state;
      const pool = state.queue.length > 0 ? state.queue : action.refill;
      const [word, ...queue] = pool;
      if (word === undefined) return state;
      return { phase: "ready", word, queue, round: state.round + 1 };
    }
  }
}
