"use client";

import { useEffect } from "react";

// One animation loop for every pixel canvas on a page. A module draws only
// while its part of the page is near the screen, the dock's Pause button (or a
// reduced-motion setting, or ?freeze in the URL) stops them all, and a module
// that fails to start leaves its text readable.

export type PixelModule = {
  tick(dt: number, playing: boolean): void;
  setTime?(t: number): void;
  setPlaying?(on: boolean): void;
  stopAll?(): void;
  destroy?(): void;
  S?: { dirty?: boolean };
};

type DockParts = { pill: HTMLElement; sea: HTMLCanvasElement; boat: HTMLCanvasElement };

// The window.PETA surface the React side calls into (see src/pixel/*.js).
export type Peta = {
  hero: { mount(): PixelModule };
  hqUI: { mount(opts: { reduce: boolean }): PixelModule };
  journey: { mount(opts: { reduce: boolean }): PixelModule };
  dock: { mount(opts: DockParts): PixelModule };
  lab: { mount(root: HTMLElement): PixelModule };
};

type Entry = { name: string; mod: PixelModule; always: boolean; visible: boolean };

let entries: readonly Entry[] = [];
let paused: boolean | null = null;
let frame = 0;
let last = 0;
const listeners = new Set<() => void>();

const query = () => new URLSearchParams(window.location.search);

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isPaused(): boolean {
  if (paused === null) paused = prefersReducedMotion() || query().has("freeze");
  return paused;
}

function applyPause(mod: PixelModule, on: boolean) {
  mod.setPlaying?.(!on);
  if (on) mod.stopAll?.();
  if (mod.S) mod.S.dirty = true;
}

export function setPaused(on: boolean) {
  paused = on;
  entries.forEach((e) => applyPause(e.mod, on));
  listeners.forEach((l) => l());
}

export function subscribePaused(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function drop(entry: Entry) {
  entries = entries.filter((e) => e !== entry);
}

function loop(now: number) {
  // The first timestamp can precede the last one read, so clamp at zero.
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  const playing = !isPaused();
  entries.forEach((e) => {
    if (!e.visible && !e.always) return;
    try {
      e.mod.tick(dt, playing);
    } catch (err) {
      console.error(`[pixel] ${e.name} stopped`, err);
      drop(e);
    }
  });
  frame = entries.length ? requestAnimationFrame(loop) : 0;
}

// Adds a mounted module to the loop; the returned function takes it out again
// and lets the module release its observers and listeners.
function register(name: string, mod: PixelModule, root: Element, always: boolean): () => void {
  const entry: Entry = { name, mod, always, visible: true };
  entries = [...entries, entry];
  const io = new IntersectionObserver(
    (es) => {
      entry.visible = es.some((e) => e.isIntersecting);
    },
    { rootMargin: "120px 0px" },
  );
  io.observe(root);
  const freeze = query().get("freeze");
  if (freeze !== null) mod.setTime?.(Number(freeze) || 0);
  applyPause(mod, isPaused());
  if (!frame) {
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }
  return () => {
    io.disconnect();
    drop(entry);
    mod.destroy?.();
  };
}

const peta = () => (window as unknown as { PETA: Peta }).PETA;

let homeLoad: Promise<Peta> | null = null;
let labLoad: Promise<Peta> | null = null;

// The canvas code ships in its own chunks, fetched after the page is up.
export function loadHome(): Promise<Peta> {
  homeLoad ??= import("@/pixel/home").then(peta, (err) => {
    homeLoad = null;
    throw err;
  });
  return homeLoad;
}

export function loadLab(): Promise<Peta> {
  labLoad ??= import("@/pixel/lab").then(peta, (err) => {
    labLoad = null;
    throw err;
  });
  return labLoad;
}

type MountOptions = {
  /** Wait until the element is within a screen of the viewport. */
  lazy?: boolean;
  /** Keep ticking while off screen (the dock's boat). */
  always?: boolean;
};

// Loads the canvas code, mounts one module on the element `getRoot` returns,
// and keeps it in the shared loop until the component unmounts. `getRoot` and
// `mount` must be stable (module scope or a ref reader), since they are effect
// dependencies. The root's data-art attribute tracks the start: "starting"
// while the module measures and builds (so CSS can show what it measures),
// "ready" once it runs, "failed" if anything throws, so CSS can fall back to
// the plain text.
export function usePixelMount<T extends HTMLElement>(
  name: string,
  getRoot: () => T | null,
  load: () => Promise<Peta>,
  mount: (P: Peta, root: T) => PixelModule,
  { lazy = false, always = false }: MountOptions = {},
) {
  useEffect(() => {
    const root = getRoot();
    if (!root) return;
    let cancelled = false;
    let unregister: (() => void) | null = null;
    const fail = (what: string, err: unknown) => {
      console.error(`[pixel] ${name} ${what}`, err);
      root.dataset.art = "failed";
    };
    const start = () =>
      load().then(
        (P) => {
          if (cancelled) return;
          try {
            root.dataset.art = "starting";
            unregister = register(name, mount(P, root), root, always);
            root.dataset.art = "ready";
          } catch (err) {
            fail("failed to start", err);
          }
        },
        (err) => fail("could not load", err),
      );

    let near: IntersectionObserver | null = null;
    if (lazy) {
      near = new IntersectionObserver(
        (es) => {
          if (!es.some((e) => e.isIntersecting)) return;
          near?.disconnect();
          start();
        },
        { rootMargin: "100% 0px" },
      );
      near.observe(root);
    } else {
      start();
    }
    return () => {
      cancelled = true;
      near?.disconnect();
      unregister?.();
    };
  }, [name, getRoot, load, mount, lazy, always]);
}

// Reads an element by id at mount time; for markup a server component renders.
export const byId =
  <T extends HTMLElement>(id: string) =>
  () =>
    document.getElementById(id) as T | null;
