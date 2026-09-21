import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { profile } from "@/data/portfolio";
import { WebGLUnavailableError, createHalftoneEngine } from "./engine";
import type { EngineEvent, HalftoneEngine, HalftoneParams } from "./engine";
import { displayFamily, loadWordmarkFont } from "./wordmark";

export type Status = "loading" | "ready" | "fallback" | "error";

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err));

// Boots the engine once the canvas exists, keeps the uniforms in step with the
// params, and reports a status the panel can render. three.js is imported here
// and nowhere else, so it stays out of the first-load bundle.
type BootArgs = {
  canvas: HTMLCanvasElement;
  params: HalftoneParams;
  onEvent: (event: EngineEvent) => void;
  isCancelled: () => boolean;
};

// Resolves to null when the component unmounted while three.js was loading.
async function bootEngine({ canvas, params, onEvent, isCancelled }: BootArgs) {
  const three = await import("three");
  const family = displayFamily();
  const lines = profile.name.toUpperCase().split(" ");
  await loadWordmarkFont(family, lines.join(" "));
  // Checked after the last await and before the renderer exists, so a
  // strict-mode remount never builds a renderer it must then tear down.
  if (isCancelled()) return null;
  return createHalftoneEngine({ three, canvas, lines, family, params, onEvent });
}

export function useHalftoneEngine(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  params: HalftoneParams,
) {
  const engineRef = useRef<HalftoneEngine | null>(null);
  const paramsRef = useRef(params);
  const [status, setStatus] = useState<Status>("loading");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    paramsRef.current = params;
    engineRef.current?.setParams(params);
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const onEvent = (event: EngineEvent) => {
      if (event.kind === "error") {
        setDetail(event.message);
        setStatus("error");
      } else {
        setStatus(event.kind === "lost" ? "fallback" : "ready");
      }
    };

    bootEngine({ canvas, params: paramsRef.current, onEvent, isCancelled: () => cancelled })
      .then((engine) => {
        if (!engine) return;
        if (cancelled) return engine.dispose();
        engineRef.current = engine;
        setStatus((current) => (current === "error" ? current : "ready"));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof WebGLUnavailableError) return setStatus("fallback");
        console.error("Halftone panel failed to start", err);
        setDetail(errorText(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [canvasRef]);

  return { engineRef, status, detail };
}
