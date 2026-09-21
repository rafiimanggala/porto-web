export type HalftoneParams = {
  pitch: number; // CSS px
  angleDeg: number;
  separation: number; // CSS px
  inkA: boolean;
  inkB: boolean;
};

export type Push = { x: number; y: number }; // CSS px offset from the panel centre

export type EngineEvent =
  | { kind: "error"; message: string }
  | { kind: "lost" }
  | { kind: "restored" };

export type HalftoneEngine = {
  setParams: (params: HalftoneParams) => void;
  setPush: (push: Push | null) => void;
  dispose: () => void;
};

export class WebGLUnavailableError extends Error {
  constructor() {
    super("WebGL is not available in this browser");
    this.name = "WebGLUnavailableError";
  }
}
