// Constants for the service orbit. No three import here, so the React side can
// read them without pulling the renderer into the first-load bundle.

// Light-theme palette (Porsche green). Hex numbers for three.js, the same values
// as CSS below.
export const GREEN = 0x5fa82d;
// Lighter green for the soft glow ring around the core.
export const GREEN_SOFT = 0x8fd15e;
export const INK = 0x152012;

// One pastel per service, in skill order. Defined once: the scene reads `hex`,
// the DOM (labels, card, accordion) reads `css` through the --node variable.
export type ServiceColor = { name: string; hex: number; css: string };

const color = (name: string, hex: number): ServiceColor => ({
  name,
  hex,
  css: `#${hex.toString(16).padStart(6, "0")}`,
});

export const SERVICE_COLORS: readonly ServiceColor[] = [
  color("sun", 0xffe375),
  color("sky", 0xa6e8fa),
  color("rose", 0xffa9a9),
  color("mint", 0x9cf0cb),
  color("lilac", 0xcdbfff),
  color("peach", 0xffcf9e),
  color("lime", 0xdcf59a),
];

export const serviceColor = (index: number): ServiceColor =>
  SERVICE_COLORS[((index % SERVICE_COLORS.length) + SERVICE_COLORS.length) % SERVICE_COLORS.length];

// Node sphere radius and the width of its ink outline, in world units.
export const NODE_RADIUS = 0.09;
export const NODE_OUTLINE = 0.014;

// Size of a node relative to rest: grows a little on hover or focus, more when
// selected. Shared by the scene (mesh scale) and the labels (chip offset).
export const nodeScale = (hover: number, selected: number) => 1 + hover * 0.35 + selected * 0.4;

// Solid core sphere, inside the wireframe (CORE_RADIUS) and its inner twin.
export const CORE_SOLID_RADIUS = 0.4;

export const FOV = 32;

// Radius of the wireframe core in world units. Labels keep clear of its
// projected circle, so orbitBuild and orbitLabels read the same number.
export const CORE_RADIUS = 0.95;

// Camera fit: how many world units of the outer ring must stay on screen.
// Width is the outer radius plus a little perspective growth; height is
// smaller because every ring is tilted toward edge-on.
export const EXTENT_X = 3.3;
export const EXTENT_Y = 2.25;

export type RingSpec = {
  radius: number;
  tiltX: number;
  tiltZ: number;
  spin: number;
  faint: number;
};

export const RINGS: RingSpec[] = [
  { radius: 1.7, tiltX: 0.8, tiltZ: 0.3, spin: 0.1, faint: 0.28 },
  { radius: 2.4, tiltX: 1.1, tiltZ: -0.45, spin: -0.07, faint: 0.25 },
  { radius: 3.05, tiltX: 1.28, tiltZ: 0.6, spin: 0.05, faint: 0.22 },
];

// Which ring a node sits on and its starting angle, in skill order. The angles
// are spread so no two nodes start near each other on screen.
export type NodeSlot = { ring: number; angle: number };

export function nodeSlots(count: number): NodeSlot[] {
  const perRing = distribute(count, RINGS.length);
  const slots: NodeSlot[] = [];
  perRing.forEach((n, ring) => {
    for (let k = 0; k < n; k += 1) {
      slots.push({ ring, angle: ring * 2.4 + (k * Math.PI * 2) / n + 0.35 });
    }
  });
  return slots;
}

// 7 over 3 rings -> 2, 2, 3 (outer ring takes the remainder).
function distribute(count: number, rings: number): number[] {
  const base = Math.floor(count / rings);
  const extra = count - base * rings;
  return Array.from({ length: rings }, (_, i) => base + (i >= rings - extra ? 1 : 0));
}

// Card widths in CSS px. OrbitStage uses the same numbers for its Tailwind
// classes (w-[280px] lg:w-[340px]) and to size the inset the scene reserves.
export const CARD_W_MD = 280;
export const CARD_W_LG = 340;
export const CARD_GAP = 20;

export function cardInset(viewportWidth: number): number {
  return (viewportWidth >= 1024 ? CARD_W_LG : CARD_W_MD) + CARD_GAP;
}
