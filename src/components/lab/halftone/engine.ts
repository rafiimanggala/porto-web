import type * as ThreeTypes from "three";
import { createGpu } from "./gpu";
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
  resize: () => boolean;
  onEvent: (event: EngineEvent) => void;
};

function buildSignals({ patch, schedule, resize, onEvent }: Hooks): Signals {
  return {
    onResize: () => {
      if (resize()) schedule();
    },
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

export function createHalftoneEngine(opts: Options): HalftoneEngine {
  const { canvas, onEvent } = opts;
  const gpu = createGpu(opts.three, canvas, onEvent, opts.lines, opts.family);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let state = initialState(opts.params);
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
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 1 / 60;
    lastTs = ts;
    const result = runFrame(gpu, state, dt, reduceMotion.matches);
    state = result.state;
    if (result.error) return onEvent(result.error);
    canvas.dataset.frames = String(state.frames);
    if (!result.settled) return schedule();
    lastTs = 0;
  };

  const resize = () => !state.disposed && gpu.resize();
  const stopWatching = watchEnvironment(canvas, buildSignals({ patch, schedule, resize, onEvent }));
  schedule();

  return {
    setParams: (params) => {
      patch({ params });
      schedule();
    },
    setPush: (push) => {
      patch({ push });
      schedule();
    },
    dispose: () => {
      patch({ disposed: true });
      cancelAnimationFrame(raf);
      stopWatching();
      gpu.dispose();
    },
  };
}
