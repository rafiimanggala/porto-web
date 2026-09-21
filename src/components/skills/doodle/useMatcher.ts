"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { buildModel } from "@/lib/doodle/classifier";
import type { Model } from "@/lib/doodle/classifier";

export type MatcherStatus = "idle" | "warming" | "ready" | "failed";

const NEAR_VIEWPORT = "320px 0px";
const IDLE_TIMEOUT_MS = 1500;
const FALLBACK_DELAY_MS = 80;

// Lazy start-up. Nothing is computed until the host element is near the
// viewport, then the prototypes are built in idle time (setTimeout when the
// browser has no requestIdleCallback).
export function useMatcher(
  hostRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onReady: () => void
): { status: MatcherStatus; model: Model | null } {
  const [near, setNear] = useState(false);
  const [model, setModel] = useState<Model | null>(null);
  const [failed, setFailed] = useState(false);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const el = hostRef.current;
    if (!el || !enabled) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setNear(true), 0);
      return () => window.clearTimeout(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: NEAR_VIEWPORT }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hostRef, enabled]);

  useEffect(() => {
    if (!near || !enabled) return;
    let cancelled = false;
    const build = () => {
      if (cancelled) return;
      try {
        const built = buildModel();
        setModel(built);
        onReadyRef.current();
      } catch (error) {
        console.error("doodle: could not build the matcher", error);
        setFailed(true);
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(build, { timeout: IDLE_TIMEOUT_MS });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(build, FALLBACK_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [near, enabled]);

  const status: MatcherStatus = failed ? "failed" : model ? "ready" : near ? "warming" : "idle";
  return { status, model };
}
