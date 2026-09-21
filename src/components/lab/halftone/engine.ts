import type * as ThreeTypes from "three";
import { createGpu, type Gpu } from "./gpu";
import { canDraw, initialState, runFrame, type LoopState } from "./loop";
import type { EngineEvent, HalftoneEngine, HalftoneParams } from "./types";
import { watchEnvironment, type Signals } from "./watch";

// The on-demand render loop. A frame is drawn when something changed (a
// slider, the pointer, a resize) and the loop keeps going only while the
// plates are still easing. Idle means zero frames, not 60 a second.

export type { EngineEvent, HalftoneEngine, HalftoneParams, Push } from "./types";
export { WebGLUnavailableError } from "./types";

type Options = {
  three: typeof ThreeTypes;
  canvas: HTMLCanvasElement;
  lines: readonly string[];
  family: string;
  params: HalftoneParams;
  onEvent: (event: EngineEvent) => void;
};

type Hooks = {
  patch: (next: Partial<LoopState>) => void;
  schedule: () => void;
  resizeAndDraw: () => void;
  onEvent: (event: EngineEvent) => void;
};

function buildSignals({ patch, schedule, resizeAndDraw, onEvent }: Hooks): Signals {
  return {
    onResize: resizeAndDraw,
    onVisible: (visible) => {
      patch({ visible });
      if (visible) schedule();
    },
    onWake: schedule,
    onLost: () => {
      patch({ lost: true });
      onEvent({ kind: "lost" });
    },
    onRestored: () => {
      patch({ lost: false });
      onEvent({ kind: "restored" });
      schedule();
    },
  };
}

// Owns the clock, the rAF handle and the loop state. Returns the pieces the
// engine wires to the outside world.
function createLoop(
  gpu: Gpu,
  canvas: HTMLCanvasElement,
  params: HalftoneParams,
  onEvent: (event: EngineEvent) => void,
) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let state = initialState(params);
  let raf = 0;
  let lastTs = 0;

  const patch = (next: Partial<LoopState>) => {
    state = { ...state, ...next };
  };
  const schedule = () => {
    if (raf || state.disposed) return;
    raf = requestAnimationFrame(frame);
  };
  const frame = (ts: number) => {
    raf = 0;
    if (!canDraw(state)) return;
    const dt = lastTs ? Math.min(Math.max((ts - lastTs) / 1000, 0), 0.05) : 1 / 60;
    lastTs = ts;
    const result = runFrame(gpu, state, dt, reduceMotion.matches);
    state = result.state;
    if (result.error) return onEvent(result.error);
    canvas.dataset.frames = String(state.frames);
    if (!result.settled) return schedule();
    lastTs = 0;
  };
  // gpu.resize() clears the drawing buffer, so the redraw must happen in the
  // same task, before the browser paints. Scheduling it for the next rAF would
  // show one blank frame per resize tick. The pending rAF is folded into this
  // draw so a tick never costs two frames.
  const resizeAndDraw = () => {
    if (state.disposed || !gpu.resize()) return;
    cancelAnimationFrame(raf);
    raf = 0;
    frame(performance.now());
  };
  const stop = () => {
    patch({ disposed: true });
    cancelAnimationFrame(raf);
  };

  return { patch, schedule, resizeAndDraw, stop };
}

export function createHalftoneEngine(opts: Options): HalftoneEngine {
  const { canvas, onEvent } = opts;
  const gpu = createGpu(opts.three, canvas, onEvent, opts.lines, opts.family);
  const loop = createLoop(gpu, canvas, opts.params, onEvent);
  const stopWatching = watchEnvironment(canvas, buildSignals({ ...loop, onEvent }));
  loop.schedule();

  return {
    setParams: (params) => {
      loop.patch({ params });
      loop.schedule();
    },
    setPush: (push) => {
      loop.patch({ push });
      loop.schedule();
    },
    dispose: () => {
      loop.stop();
      stopWatching();
      gpu.dispose();
    },
  };
}
