"use client";

import { useEffect, useRef, type RefObject } from "react";
import { skills } from "@/data/skills";
import { cardInset } from "./orbitConfig";
import { initOrbitScene, type OrbitScene } from "./orbitScene";

export const indexOfSlug = (slug: string | null) =>
  slug ? skills.findIndex((s) => s.slug === slug) : -1;

type Args = {
  hostRef: RefObject<HTMLDivElement | null>;
  rootRef: RefObject<HTMLDivElement | null>;
  buttons: RefObject<(HTMLButtonElement | null)[]>;
  selected: string | null;
  reduce: boolean;
  onReadyChange: (ready: boolean) => void;
  onFail: () => void;
};

// Owns the scene's lifetime: init once, dispose on unmount, and forward
// selection and reduced-motion changes. StrictMode runs the effect twice in
// dev, so a scene that resolves after its cleanup disposes itself. Returns the
// live scene ref so the caller can forward hover.
export function useOrbitScene(args: Args): RefObject<OrbitScene | null> {
  const { hostRef, rootRef, buttons, selected, reduce, onReadyChange, onFail } = args;
  const sceneRef = useRef<OrbitScene | null>(null);
  const selectedRef = useRef<string | null>(selected);

  useEffect(() => {
    const host = hostRef.current;
    const root = rootRef.current;
    const nodes = (buttons.current ?? []).filter((b): b is HTMLButtonElement => b !== null);
    if (!host || !root || nodes.length !== skills.length) {
      onFail();
      return;
    }
    let cancelled = false;
    initOrbitScene(host, {
      buttons: nodes,
      pointerTarget: root,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      // Room the scene keeps clear on the right while the evidence card is open.
      getInsetRight: () => (selectedRef.current ? cardInset(window.innerWidth) : 0),
      onContextLost: onFail,
    })
      .then((scene) => {
        if (cancelled || !scene) {
          scene?.dispose();
          if (!scene && !cancelled) onFail();
          return;
        }
        sceneRef.current = scene;
        scene.setSelected(indexOfSlug(selectedRef.current));
        onReadyChange(true);
      })
      .catch((err: unknown) => {
        console.error("orbit: scene failed to start", err);
        if (!cancelled) onFail();
      });
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      onReadyChange(false);
    };
  }, [hostRef, rootRef, buttons, onFail, onReadyChange]);

  useEffect(() => {
    selectedRef.current = selected;
    sceneRef.current?.setSelected(indexOfSlug(selected));
  }, [selected]);

  useEffect(() => {
    sceneRef.current?.setReducedMotion(reduce);
  }, [reduce]);

  return sceneRef;
}
