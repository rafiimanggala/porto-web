"use client";

import { byId, loadHome, loadLab, prefersReducedMotion, usePixelMount, type Peta } from "./runtime";

// Render-nothing hooks that bring a server-rendered pixel section to life.
// Each one finds its section by id, so the markup and every word in it stay
// in the server component.

const heroRoot = byId<HTMLElement>("hero-art");
const hqRoot = byId<HTMLElement>("agents");
const journeyRoot = byId<HTMLElement>("journey");
const scenesRoot = byId<HTMLElement>("pixel-scenes");

const mountHero = (P: Peta) => P.hero.mount();
const mountHQ = (P: Peta) => P.hqUI.mount({ reduce: prefersReducedMotion() });
const mountJourney = (P: Peta) => P.journey.mount({ reduce: prefersReducedMotion() });
const mountScenes = (P: Peta, root: HTMLElement) => P.lab.mount(root);

export function HeroMount() {
  usePixelMount("hero", heroRoot, loadHome, mountHero);
  return null;
}

export function AgentHQMount() {
  usePixelMount("hq", hqRoot, loadHome, mountHQ, { lazy: true });
  return null;
}

export function JourneyMount() {
  usePixelMount("journey", journeyRoot, loadHome, mountJourney, { lazy: true });
  return null;
}

export function PixelScenesMount() {
  usePixelMount("scenes", scenesRoot, loadLab, mountScenes);
  return null;
}
