import type { Gpu } from "./gpu";
import { easeToward, isSettled, restingOffset, targetOffset } from "./motion";
import type { EngineEvent, HalftoneParams, Push } from "./types";

// State and one-frame step for the on-demand render loop. The engine owns the
// clock and the requestAnimationFrame handle; everything here is a plain
// function of (state, dt).

export type LoopState = {
  readonly params: HalftoneParams;
  readonly push: Push | null;
  readonly current: Push; // eased plate offset, CSS px
  readonly visible: boolean;
  readonly lost: boolean;
  readonly disposed: boolean;
  readonly frames: number;
};

export const initialState = (params: HalftoneParams): LoopState => ({
  params,
  push: null,
  current: restingOffset(params.separation),
  visible: true,
  lost: false,
  disposed: false,
  frames: 0,
});

export const canDraw = (state: LoopState): boolean =>
  !state.disposed && !state.lost && state.visible && !document.hidden;

const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

export type FrameResult = { state: LoopState; settled: boolean; error: EngineEvent | null };

export function runFrame(gpu: Gpu, state: LoopState, dt: number, instant: boolean): FrameResult {
  const target = targetOffset(state.params.separation, state.push);
  const current = easeToward(state.current, target, dt, instant);
  const settled = isSettled(current, target);
  try {
    gpu.draw(state.params, current);
  } catch (err) {
    return { state: { ...state, current }, settled, error: { kind: "error", message: message(err) } };
  }
  return { state: { ...state, current, frames: state.frames + 1 }, settled, error: null };
}
