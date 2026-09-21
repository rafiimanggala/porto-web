// Procedural geometry for the service orbit. Everything is built from
// primitives, no external assets. `three` is passed in (loaded with a dynamic
// import in orbitScene.ts) so this file never pulls the renderer into a
// server or first-load bundle.

import type * as ThreeNS from "three";
import {
  CORE_RADIUS,
  CORE_SOLID_RADIUS,
  INK,
  NODE_OUTLINE,
  NODE_RADIUS,
  RINGS,
  VIOLET,
  VIOLET_SOFT,
  nodeSlots,
} from "./orbitConfig";

export type Three = typeof ThreeNS;

export type NodePart = {
  mesh: ThreeNS.Mesh<ThreeNS.SphereGeometry, ThreeNS.MeshBasicMaterial>;
  // Thin ink outline hugging the sphere (`halo` keeps its old name: the label
  // code reads the node's world position from it).
  halo: ThreeNS.Mesh<ThreeNS.RingGeometry, ThreeNS.MeshBasicMaterial>;
  // White dot that fades in on the selected node, just in front of the sphere.
  dot: ThreeNS.Mesh<ThreeNS.CircleGeometry, ThreeNS.MeshBasicMaterial>;
  base: ThreeNS.Vector3;
};

export type OrbitParts = {
  root: ThreeNS.Group;
  // Outlines and dots live outside `root` so they can be billboarded: each
  // frame the scene copies the node's world position onto them.
  overlay: ThreeNS.Group;
  core: ThreeNS.Group;
  coreInner: ThreeNS.LineSegments;
  glow: ThreeNS.Sprite;
  spins: ThreeNS.Group[];
  nodes: NodePart[];
  dispose: () => void;
};

// Small deterministic PRNG so the dust field is identical on every load.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circlePoints(radius: number, segments: number): Float32Array {
  const out = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    out[i * 3] = Math.cos(a) * radius;
    out[i * 3 + 1] = Math.sin(a) * radius;
  }
  return out;
}

// Soft ring: clear in the middle (the solid sphere covers it), brightest just
// outside the sphere's edge, fading to nothing at the sprite's rim.
function glowTexture(THREE: Three): ThreeNS.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("orbit: 2d canvas unavailable for glow texture");
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.32, "rgba(255,255,255,0.7)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.28)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Every geometry, material and texture goes through `track` so one dispose()
// releases all of it on unmount.
type Kit = {
  THREE: Three;
  track: <T extends ThreeNS.BufferGeometry | ThreeNS.Material | ThreeNS.Texture>(x: T) => T;
};

function makeKit(THREE: Three): { kit: Kit; dispose: () => void } {
  const owned: { dispose: () => void }[] = [];
  const track: Kit["track"] = (x) => {
    owned.push(x);
    return x;
  };
  return { kit: { THREE, track }, dispose: () => owned.forEach((x) => x.dispose()) };
}

// Core: a solid violet sphere, wrapped by an ink wireframe icosahedron and a
// smaller counter-rotating violet one, over a soft lighter-violet glow ring.
// Flat basic materials only, no lighting.
function buildCore({ THREE, track }: Kit) {
  const core = new THREE.Group();
  const outer = new THREE.LineSegments(
    track(new THREE.EdgesGeometry(track(new THREE.IcosahedronGeometry(CORE_RADIUS, 1)))),
    track(new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.35 })),
  );
  const coreInner = new THREE.LineSegments(
    track(new THREE.EdgesGeometry(track(new THREE.IcosahedronGeometry(0.62, 0)))),
    track(new THREE.LineBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.35 })),
  );
  const sphere = new THREE.Mesh(
    track(new THREE.SphereGeometry(CORE_SOLID_RADIUS, 32, 20)),
    track(new THREE.MeshBasicMaterial({ color: VIOLET })),
  );
  const glow = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: track(glowTexture(THREE)),
        color: VIOLET_SOFT,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    ),
  );
  glow.scale.setScalar(2.5);
  core.add(outer, coreInner, sphere, glow);
  return { core, coreInner, glow };
}

// Rings: a tilt group holds the faint loop, a spin group (child) carries the
// nodes around it. Euler order ZYX = tilt about X first, then turn in-plane.
function buildRings({ THREE, track }: Kit, root: ThreeNS.Group): ThreeNS.Group[] {
  return RINGS.map((spec) => {
    const tilt = new THREE.Group();
    tilt.rotation.set(spec.tiltX, 0, spec.tiltZ, "ZYX");
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(circlePoints(spec.radius, 160), 3));
    const material = track(
      new THREE.LineBasicMaterial({ color: VIOLET, transparent: true, opacity: spec.faint, depthWrite: false }),
    );
    const spin = new THREE.Group();
    tilt.add(new THREE.LineLoop(geo, material), spin);
    root.add(tilt);
    return spin;
  });
}

// Nodes: flat spheres (colour set per frame from the pastel palette) with an
// ink outline ring and a white selection dot, both in `overlay`.
function buildNodes(
  { THREE, track }: Kit,
  spins: ThreeNS.Group[],
  overlay: ThreeNS.Group,
  count: number,
): NodePart[] {
  const nodeGeo = track(new THREE.SphereGeometry(NODE_RADIUS, 24, 16));
  const haloGeo = track(new THREE.RingGeometry(NODE_RADIUS, NODE_RADIUS + NODE_OUTLINE, 48));
  const dotGeo = track(new THREE.CircleGeometry(NODE_RADIUS * 0.4, 24));
  return nodeSlots(count).map((slot) => {
    const r = RINGS[slot.ring].radius;
    const mesh = new THREE.Mesh(nodeGeo, track(new THREE.MeshBasicMaterial({ color: INK, transparent: true })));
    const base = new THREE.Vector3(Math.cos(slot.angle) * r, Math.sin(slot.angle) * r, 0);
    mesh.position.copy(base);
    spins[slot.ring].add(mesh);
    const halo = new THREE.Mesh(
      haloGeo,
      track(
        new THREE.MeshBasicMaterial({
          color: INK,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      ),
    );
    const dot = new THREE.Mesh(
      dotGeo,
      track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })),
    );
    overlay.add(halo, dot);
    return { mesh, halo, dot, base };
  });
}

// Dust: a sparse shell behind and around the rings for depth.
function buildDust({ THREE, track }: Kit): ThreeNS.Points {
  const rand = mulberry32(186);
  const pos = new Float32Array(110 * 3);
  for (let i = 0; i < 110; i += 1) {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const rr = 3.9 + rand() * 1.8;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = rr * s * Math.cos(phi);
    pos[i * 3 + 1] = rr * s * Math.sin(phi) * 0.7;
    pos[i * 3 + 2] = rr * u;
  }
  const geo = track(new THREE.BufferGeometry());
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const material = track(
    new THREE.PointsMaterial({
      color: VIOLET,
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    }),
  );
  return new THREE.Points(geo, material);
}

export function buildOrbit(THREE: Three, nodeCount: number): OrbitParts {
  const { kit, dispose } = makeKit(THREE);
  const root = new THREE.Group();
  const overlay = new THREE.Group();
  const { core, coreInner, glow } = buildCore(kit);
  const spins = buildRings(kit, root);
  const nodes = buildNodes(kit, spins, overlay, nodeCount);
  root.add(core, buildDust(kit));
  return { root, overlay, core, coreInner, glow, spins, nodes, dispose };
}
