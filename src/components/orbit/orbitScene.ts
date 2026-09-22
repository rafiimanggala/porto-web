// Imperative three.js scene for the service orbit. React never touches the
// scene graph: OrbitStage calls init once, then setSelected / setHovered, and
// dispose on unmount. Node labels stay DOM: every frame each node is projected
// to screen space and its <button> is moved with a transform (no React state).
//
// Motion budget: one canvas, no wheel or touch capture, loop paused when the
// canvas is offscreen, the tab is hidden, or the GL context is lost.

import type * as ThreeNS from "three";
import { buildOrbit, type Three } from "./orbitBuild";
import { EXTENT_X, EXTENT_Y, FOV, NODE_RADIUS, RINGS, ACCENT, nodeScale, serviceColor } from "./orbitConfig";
import type { Ctx, OrbitSceneOptions } from "./orbitCtx";
import { clamp, depthOf, projectSpots, writeButtons } from "./orbitLabels";

export type { OrbitSceneOptions } from "./orbitCtx";

export type OrbitScene = {
  setSelected: (index: number) => void;
  setHovered: (index: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  dispose: () => void;
};

const MAX_TILT = 0.25;

const approach = (cur: number, target: number, k: number) => cur + (target - cur) * k;
// Device pixel ratio the canvas renders at: sharp on retina, capped for cost.
const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

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
  parts.glow.material.opacity = 0.5 + 0.08 * Math.sin(c.time * 1.4);
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
    const scale = nodeScale(c.hov[i], c.sel[i]);
    node.mesh.scale.setScalar(scale);
    // Flat pastel at rest, orange when selected.
    node.mesh.material.color.copy(c.pastel[i]).lerp(c.accent, c.sel[i]);
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
    node.halo.scale.setScalar(scale);
    // The white dot sits just in front of the sphere's near surface.
    node.dot.position.set(tmp.v.x, tmp.v.y, tmp.v.z + NODE_RADIUS * scale * 1.02);
    node.dot.scale.setScalar(scale);
    // Dimmed nodes stay at 60%: still readable next to the selected one.
    const dimmed = 1 - c.dim[i] * 0.4;
    const depth = depthOf(tmp.v.z);
    node.mesh.material.opacity = dimmed;
    node.halo.material.opacity = (0.6 + 0.4 * depth) * dimmed;
    node.dot.material.opacity = c.sel[i];
  });
}

function renderFrame(c: Ctx, dt: number): void {
  const target = Math.max(0, c.opts.getInsetRight());
  c.insetTarget = target;
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
    renderer.setPixelRatio(pixelRatio());
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

// Release a renderer that never made it into a running scene: free the GL
// context and take the canvas back out of the host.
function releaseRenderer(renderer: ThreeNS.WebGLRenderer): void {
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}

function createContext(
  THREE: Three,
  renderer: ThreeNS.WebGLRenderer,
  host: HTMLElement,
  opts: OrbitSceneOptions,
): Ctx {
  const count = opts.buttons.length;
  const parts = buildOrbit(THREE, count);
  parts.core.rotation.set(0.4, 0.6, 0.1);
  const scene = new THREE.Scene();
  scene.add(parts.root, parts.overlay);
  const zeros = () => Array.from({ length: count }, () => 0);
  return {
    renderer, scene, parts, opts, host,
    camera: new THREE.PerspectiveCamera(FOV, 1, 0.1, 80),
    w: 0, h: 0, half: [], labelW: [], side: [], inset: 0, insetTarget: 0, time: 0,
    reduced: opts.reducedMotion, visible: false, lost: false, disposed: false,
    resetPointer: () => {},
    selected: -1, hovered: -1,
    pointer: { tx: 0, ty: 0, x: 0, y: 0 },
    sel: zeros(), hov: zeros(), dim: zeros(),
    accent: new THREE.Color(ACCENT),
    pastel: Array.from({ length: count }, (_, i) => new THREE.Color(serviceColor(i).hex)),
    tmp: { v: new THREE.Vector3(), f: new THREE.Vector3(), q: new THREE.Quaternion() },
  };
}

// `isCancelled` lets the caller (an effect that may already have cleaned up)
// stop the build right after the chunk load, before any renderer exists.
export async function initOrbitScene(
  host: HTMLElement,
  opts: OrbitSceneOptions,
  isCancelled: () => boolean = () => false,
): Promise<OrbitScene | null> {
  const THREE = await import("three");
  if (isCancelled()) return null;
  const renderer = createRenderer(THREE, host);
  if (!renderer) return null;
  try {
    return wireLifecycle(createContext(THREE, renderer, host, opts));
  } catch (err) {
    releaseRenderer(renderer);
    throw err;
  }
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

// devicePixelRatio has no change event. A `(resolution: Ndppx)` query does: it
// stops matching when the ratio moves (window dragged to another monitor, zoom
// change), then is re-armed for the new value. On change the renderer takes
// the new ratio, the cached size is dropped so the next frame calls setSize,
// and a frame is kicked (reduced motion draws only on demand).
function watchPixelRatio(c: Ctx, kick: () => void): () => void {
  let query: MediaQueryList | null = null;
  function onChange(): void {
    if (c.disposed) return;
    c.renderer.setPixelRatio(pixelRatio());
    c.w = 0;
    c.h = 0;
    arm();
    kick();
  }
  function arm(): void {
    query?.removeEventListener("change", onChange);
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    query.addEventListener("change", onChange);
  }
  arm();
  return () => query?.removeEventListener("change", onChange);
}

// Label widths are measured with whatever font is loaded at that moment. When
// the web font arrives later, drop the cached size so the next frame measures
// again and label placement works from the real widths.
function remeasureWhenFontsLoad(c: Ctx, kick: () => void): void {
  void document.fonts?.ready.then(() => {
    if (c.disposed) return;
    c.w = 0;
    c.h = 0;
    kick();
  });
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
  // Observers are built before any listener is added, so a constructor that
  // throws leaves nothing behind to tear down.
  const ro = new ResizeObserver(kick);
  const io = new IntersectionObserver(([entry]) => {
    c.visible = entry.isIntersecting;
    if (c.visible) kick();
  });
  canvas.addEventListener("webglcontextlost", onLost);
  target.addEventListener("pointermove", onMove);
  target.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  ro.observe(c.host);
  io.observe(c.host);
  const unwatchRatio = watchPixelRatio(c, kick);
  c.resetPointer = onLeave;
  return () => {
    ro.disconnect();
    io.disconnect();
    unwatchRatio();
    canvas.removeEventListener("webglcontextlost", onLost);
    target.removeEventListener("pointermove", onMove);
    target.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

function wireLifecycle(c: Ctx): OrbitScene {
  const loop = createLoop(c);
  const detach = attach(c, loop.kick);
  remeasureWhenFontsLoad(c, loop.kick);

  // First frame is drawn synchronously so labels have positions before the
  // stage is revealed, whether or not the canvas is on screen yet. If it
  // throws, undo what attach() set up before the caller releases the renderer.
  try {
    if (resize(c)) renderFrame(c, 0);
  } catch (err) {
    loop.stop();
    detach();
    c.parts.dispose();
    throw err;
  }

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
