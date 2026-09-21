"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { profile } from "@/data/portfolio";
import HalftoneControls from "./HalftoneControls";
import WordmarkFallback from "./WordmarkFallback";
import type { HalftoneParams } from "./types";
import { useHalftoneEngine, type Status } from "./useHalftoneEngine";
import { usePushInput } from "./usePushInput";

// Until the visitor touches the pitch slider, the dot pitch follows the panel:
// on a phone the panel is a third of the desktop width, so the same dots would
// swallow the letters.
type PanelParams = Omit<HalftoneParams, "pitch"> & { pitch: number | null };

const NARROW = "(max-width: 639px)";
const PITCH = { wide: 10, narrow: 4 };

const subscribeNarrow = (notify: () => void) => {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const isNarrow = () => window.matchMedia(NARROW).matches;

const DEFAULT_PARAMS: PanelParams = {
  pitch: null,
  angleDeg: 15,
  separation: 14,
  inkA: true,
  inkB: true,
};

const MESSAGES: Record<Status, string> = {
  loading: "Loading three.js and drawing the wordmark texture...",
  ready:
    "Rendering on demand. Press and drag on the panel, or focus it and hold an arrow key, to push the plates apart.",
  fallback:
    "WebGL is not available here, so this is the static wordmark. The controls need the shader and are switched off.",
  error: "The shader did not compile, so nothing is drawn.",
};

const CANVAS_LABEL = `Halftone print of the name ${profile.name}. Press and drag, or focus and hold an arrow key, to push the two ink plates apart.`;

export default function HalftonePanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chosen, setChosen] = useState<PanelParams>(DEFAULT_PARAMS);
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  const params = useMemo<HalftoneParams>(
    () => ({ ...chosen, pitch: chosen.pitch ?? (narrow ? PITCH.narrow : PITCH.wide) }),
    [chosen, narrow],
  );
  const { engineRef, status, detail } = useHalftoneEngine(canvasRef, params);
  const input = usePushInput(engineRef);

  return (
    <div data-testid="halftone" data-state={status}>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-1 sm:aspect-[16/10]">
        <canvas
          ref={canvasRef}
          data-testid="halftone-canvas"
          role="img"
          tabIndex={status === "ready" ? 0 : -1}
          aria-label={CANVAS_LABEL}
          className="absolute inset-0 block h-full w-full cursor-grab select-none active:cursor-grabbing"
          style={{ touchAction: "none" }}
          {...input}
        />
        {status === "ready" ? null : <WordmarkFallback />}
      </div>

      <p role="status" className="mono mt-4 max-w-[80ch] text-xs leading-relaxed text-dim">
        {MESSAGES[status]}
      </p>
      {status === "error" && detail ? (
        <pre
          role="alert"
          className="mono mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-surface-2 p-4 text-xs text-accent"
        >
          {detail}
        </pre>
      ) : null}

      <HalftoneControls params={params} disabled={status !== "ready"} onChange={setChosen} />
    </div>
  );
}
