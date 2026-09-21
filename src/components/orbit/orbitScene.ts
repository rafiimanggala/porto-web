// Imperative three.js scene for the service orbit. React never touches the
// scene graph: OrbitStage calls init once, then setSelected / setHovered, and
// dispose on unmount. Node labels stay DOM: every frame each node is projected
// to screen space and its <button> is moved with a transform (no React state).
//
// Motion budget: one canvas, no wheel or touch capture, loop paused when the
// canvas is offscreen, the tab is hidden, or the GL context is lost.

import type * as ThreeNS from "three";
import { buildOrbit, type OrbitParts, type Three } from "./orbitBuild";
import { ACCENT, EXTENT_X, EXTENT_Y, FOV, INK, RINGS } from "./orbitConfig";

export type OrbitSceneOptions = {
  // One element per node, in skill order. Positioned by transform each frame.
  buttons: HTMLElement[];
  // Element that receives pointer parallax (usually the stage root).
  pointerTarget: HTMLElement;
  reducedMotion: boolean;
  // Pixels on the right the scene keeps clear (the evidence card). Read per frame.
  getInsetRight: () => number;
  onContextLost: () => void;
};

export type OrbitScene = {
  setSelected: (index: number) => void;
  setHovered: (index: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  dispose: () => void;
};

const MAX_TILT = 0.25;

type Ctx = {
  renderer: ThreeNS.WebGLRenderer;
  scene: ThreeNS.Scene;
  camera: ThreeNS.PerspectiveCamera;
  parts: OrbitParts;
  opts: OrbitSceneOptions;
  host: HTMLElement;
  w: number;
  h: number;
  half: number[];
  labelW: number[];
  side: string[];
  inset: number;
  time: number;
  reduced: boolean;
  visible: boolean;
  lost: boolean;
  disposed: boolean;
  resetPointer: () => void;
  selected: number;
  hovered: number;
  pointer: { tx: number; ty: number; x: number; y: number };
  sel: number[];
  hov: number[];
  dim: number[];
  ink: ThreeNS.Color;
  accent: ThreeNS.Color;
  tmp: { v: ThreeNS.Vector3; f: ThreeNS.Vector3; q: ThreeNS.Quaternion };
};

const approach = (cur: number, target: number, k: number) => cur + (target - cur) * k;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function fitCamera(c: Ctx): void {
  const labelPad = c.w < 900 ? 70 : 90;
  const halfW = (c.w - c.inset) / 2 - labelPad;
  const halfH = c.h / 2 - 36;
  const ppu = Math.max(28, Math.min(halfW / EXTENT_X, halfH / EXTENT_Y));
  const dist = c.h / ppu / 2 / Math.tan((FOV * Math.PI) / 360);
  c.camera.position.set(0, 0, dist);
  c.camera.aspect = c.w / c.h;
  // Shift the frame right by half the inset so the orbit centres in the
  // space left of the card. Projection (and so label positions) follows.
  c.camera.setViewOffset(c.w, c.h, c.inset / 2, 0, c.w, c.h);
  c.camera.updateMatrixWorld();
}

// Re-measure only when the host size changed. False means it has no size yet.
function resize(c: Ctx): boolean {
  const w = c.host.clientWidth;
  const h = c.host.clientHeight;
  if (!w || !h) return false;
  if (w === c.w && h === c.h) return true;
  c.w = w;
  c.h = h;
  c.renderer.setSize(w, h, false);
  c.half = c.opts.buttons.map((b) => b.offsetWidth / 2);
  c.labelW = c.opts.buttons.map(
    (b) => b.querySelector<HTMLElement>("[data-label]")?.offsetWidth ?? 140,
  );
  fitCamera(c);
  return true;
}

function stepMotion(c: Ctx, dt: number): void {
  const { parts, pointer } = c;
  if (c.reduced) {
    pointer.x = 0;
    pointer.y = 0;
    parts.root.rotation.set(0, 0, 0);
    return;
  }
  c.time += dt;
  parts.core.rotation.y += 0.14 * dt;
  parts.core.rotation.x += 0.05 * dt;
  parts.coreInner.rotation.y -= 0.32 * dt;
  parts.glow.material.opacity = 0.44 + 0.08 * Math.sin(c.time * 1.4);
  parts.spins.forEach((spin, i) => {
    spin.rotation.z += RINGS[i].spin * dt;
  });
  const k = 1 - Math.exp(-dt * 4);
  pointer.x = approach(pointer.x, pointer.tx, k);
  pointer.y = approach(pointer.y, pointer.ty, k);
  parts.root.rotation.set(pointer.y * MAX_TILT, pointer.x * MAX_TILT, 0);
}

function stepNodes(c: Ctx, dt: number): void {
  const k = c.reduced ? 1 : 1 - Math.exp(-dt * 9);
  const { tmp } = c;
  c.parts.root.updateMatrixWorld(true);
  c.parts.nodes.forEach((node, i) => {
    c.sel[i] = approach(c.sel[i], c.selected === i ? 1 : 0, k);
    c.hov[i] = approach(c.hov[i], c.hovered === i ? 1 : 0, k);
    c.dim[i] = approach(c.dim[i], c.selected >= 0 && c.selected !== i ? 1 : 0, k);
    const scale = 1 + c.hov[i] * 0.5 + c.sel[i] * 0.7;
    node.mesh.scale.setScalar(scale);
    node.mesh.material.color.copy(c.ink).lerp(c.accent, c.sel[i]);
    node.mesh.material.opacity = 1 - c.dim[i] * 0.7;
    node.halo.material.color.copy(node.mesh.material.color);
    node.halo.material.opacity = 0.2 + c.hov[i] * 0.25 + c.sel[i] * 0.45 - c.dim[i] * 0.12;
    // Pull the selected node toward the camera: world +z, expressed in the
    // ring's local frame because the ring is tilted and spinning.
    node.mesh.position.copy(node.base);
    if (c.sel[i] > 0.001) {
      node.mesh.parent?.getWorldQuaternion(tmp.q).invert();
      tmp.f.set(0, 0, 1).applyQuaternion(tmp.q).multiplyScalar(c.sel[i] * 0.55);
      node.mesh.position.add(tmp.f);
    }
    node.mesh.getWorldPosition(tmp.v);
    node.halo.position.copy(tmp.v);
    node.halo.scale.setScalar(scale * (1 + c.sel[i] * 0.2));
  });
}

type Spot = { x: number; y: number; depth: number; pri: number; side: "left" | "right" };

// Screen position of every node. Reads world position back from the halo
// (already synced in stepNodes) and projects with the live camera, view
// offset included. `pri` ranks who keeps its label when labels collide.
function projectSpots(c: Ctx): Spot[] {
  const cx = (c.w - c.inset) / 2;
  return c.parts.nodes.map((node, i) => {
    const v = c.tmp.v.copy(node.halo.position);
    const depth = clamp((v.z + 3.2) / 6.4, 0, 1);
    v.project(c.camera);
    const x = (v.x * 0.5 + 0.5) * c.w;
    return {
      x,
      y: (-v.y * 0.5 + 0.5) * c.h,
      depth,
      pri: depth + c.sel[i] * 10 + c.hov[i] * 10,
      side: x > cx ? "right" : "left",
    };
  });
}

const LABEL_GAP = 18;
const LABEL_H = 18;
const DOT = 13;

type Box = { x0: number; x1: number; y0: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

function labelBox(s: Spot, width: number): Box {
  const x0 = s.side === "right" ? s.x + LABEL_GAP : s.x - LABEL_GAP - width;
  return { x0, x1: x0 + width, y0: s.y - LABEL_H / 2, y1: s.y + LABEL_H / 2 };
}

const dotBox = (s: Spot): Box => ({ x0: s.x - DOT, x1: s.x + DOT, y0: s.y - DOT, y1: s.y + DOT });

type Placement = { side: "left" | "right"; hidden: boolean };

// Labels claim space in priority order (selected, hovered, then nearest to the
// camera). Each takes its outward side if free, else the opposite side, else
// it fades out. The node dot and its button always stay. Higher-priority dots
// count as obstacles too, so text never sits on top of another node.
function placeLabels(c: Ctx, spots: Spot[]): Placement[] {
  const order = spots.map((_, i) => i).sort((a, b) => spots[b].pri - spots[a].pri);
  // The evidence card is an obstacle too: labels never run under it.
  const taken: Box[] = c.inset > 0 ? [{ x0: c.w - c.inset + 12, x1: c.w, y0: 0, y1: c.h }] : [];
  const out: Placement[] = spots.map((s) => ({ side: s.side, hidden: true }));
  order.forEach((i) => {
    const spot = spots[i];
    const width = c.labelW[i] ?? 140;
    const flipped = spot.side === "right" ? "left" : "right";
    const side = ([spot.side, flipped] as const).find(
      (candidate) => !taken.some((box) => overlaps(labelBox({ ...spot, side: candidate }, width), box)),
    );
    if (side) {
      out[i] = { side, hidden: false };
      taken.push(labelBox({ ...spot, side }, width));
    }
    taken.push(dotBox(spot));
  });
  return out;
}

// Move each button to its node with a transform, and write the label opacity
// as a CSS variable. Nothing here goes through React.
function writeButtons(c: Ctx, spots: Spot[]): void {
  const placed = placeLabels(c, spots);
  spots.forEach((spot, i) => {
    const btn = c.opts.buttons[i];
    if (!btn) return;
    const half = c.half[i] ?? 22;
    btn.style.transform = `translate3d(${(spot.x - half).toFixed(1)}px, ${(spot.y - half).toFixed(1)}px, 0)`;
    btn.style.zIndex = String(Math.round(spot.depth * 10));
    const base = (0.42 + 0.58 * spot.depth) * (1 - c.dim[i] * 0.55);
    const lo = Math.max(base, c.hov[i], c.sel[i]);
    btn.style.setProperty("--lo", placed[i].hidden ? "0" : lo.toFixed(2));
    if (c.side[i] !== placed[i].side) {
      c.side[i] = placed[i].side;
      btn.dataset.side = placed[i].side;
    }
  });
}

function renderFrame(c: Ctx, dt: number): void {
  const target = Math.max(0, c.opts.getInsetRight());
  if (c.inset !== target) {
    const next = c.reduced ? target : approach(c.inset, target, 1 - Math.exp(-dt * 7));
    c.inset = Math.abs(next - target) < 0.5 ? target : next;
    fitCamera(c);
  }
  stepMotion(c, dt);
  stepNodes(c, dt);
  c.renderer.render(c.scene, c.camera);
  writeButtons(c, projectSpots(c));
}

function createRenderer(THREE: Three, host: HTMLElement): ThreeNS.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);
    return renderer;
  } catch (err) {
    console.warn("orbit: WebGL unavailable, using the accordion", err);
    return null;
  }
}

export async function initOrbitScene(
  host: HTMLElement,
  opts: OrbitSceneOptions,
): Promise<OrbitScene | null> {
  const THREE = await import("three");
  const renderer = createRenderer(THREE, host);
  if (!renderer) return null;

  const count = opts.buttons.length;
  const parts = buildOrbit(THREE, count);
  parts.core.rotation.set(0.4, 0.6, 0.1);
  const scene = new THREE.Scene();
  scene.add(parts.root, parts.overlay);
  const zeros = () => Array.from({ length: count }, () => 0);
  const c: Ctx = {
    renderer, scene, parts, opts, host,
    camera: new THREE.PerspectiveCamera(FOV, 1, 0.1, 80),
    w: 0, h: 0, half: [], labelW: [], side: [], inset: 0, time: 0,
    reduced: opts.reducedMotion, visible: false, lost: false, disposed: false,
    resetPointer: () => {},
    selected: -1, hovered: -1,
    pointer: { tx: 0, ty: 0, x: 0, y: 0 },
    sel: zeros(), hov: zeros(), dim: zeros(),
    ink: new THREE.Color(INK), accent: new THREE.Color(ACCENT),
    tmp: { v: new THREE.Vector3(), f: new THREE.Vector3(), q: new THREE.Quaternion() },
  };
  return wireLifecycle(c);
}

type Loop = { kick: () => void; stop: () => void };

// rAF loop that runs only while the canvas is on screen, the tab is visible
// and the context is alive. In reduced motion it draws single frames on demand.
function createLoop(c: Ctx): Loop {
  let raf = 0;
  let last = 0;
  const animating = () => !c.reduced && c.visible && !document.hidden && !c.lost;
  const tick = (now: number) => {
    raf = 0;
    if (c.disposed || c.lost) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (resize(c)) renderFrame(c, dt);
    if (animating()) raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (c.disposed || c.lost || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  return { kick, stop: () => raf && cancelAnimationFrame(raf) };
}

// Listeners and observers; returns one teardown. Pointer parallax listens on
// the stage root and never on the wheel or touch, so page scroll is untouched.
function attach(c: Ctx, kick: () => void): () => void {
  const canvas = c.renderer.domElement;
  const target = c.opts.pointerTarget;
  const onLost = (e: Event) => {
    e.preventDefault();
    c.lost = true;
    c.opts.onContextLost();
  };
  const onMove = (e: PointerEvent) => {
    if (c.reduced || e.pointerType === "touch") return;
    const r = c.host.getBoundingClientRect();
    c.pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    c.pointer.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };
  const onLeave = () => {
    c.pointer.tx = 0;
    c.pointer.ty = 0;
  };
  const onVisibility = () => {
    if (!document.hidden) kick();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  target.addEventListener("pointermove", onMove);
  target.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  const ro = new ResizeObserver(kick);
  ro.observe(c.host);
  const io = new IntersectionObserver(([entry]) => {
    c.visible = entry.isIntersecting;
    if (c.visible) kick();
  });
  io.observe(c.host);
  c.resetPointer = onLeave;
  return () => {
    ro.disconnect();
    io.disconnect();
    canvas.removeEventListener("webglcontextlost", onLost);
    target.removeEventListener("pointermove", onMove);
    target.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

function wireLifecycle(c: Ctx): OrbitScene {
  const loop = createLoop(c);
  const detach = attach(c, loop.kick);

  // First frame is drawn synchronously so labels have positions before the
  // stage is revealed, whether or not the canvas is on screen yet.
  if (resize(c)) renderFrame(c, 0);

  return {
    setSelected: (i) => { c.selected = i; loop.kick(); },
    setHovered: (i) => { c.hovered = i; loop.kick(); },
    setReducedMotion: (v) => {
      c.reduced = v;
      if (v) c.resetPointer();
      loop.kick();
    },
    dispose: () => {
      c.disposed = true;
      loop.stop();
      detach();
      c.parts.dispose();
      c.renderer.dispose();
      if (!c.lost) c.renderer.forceContextLoss();
      c.renderer.domElement.remove();
    },
  };
}
