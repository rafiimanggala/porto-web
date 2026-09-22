// Shared types for the orbit scene: the options the caller passes in and the
// mutable per-scene context the frame functions read and write.

import type * as ThreeNS from "three";
import type { OrbitParts } from "./orbitBuild";

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

export type Ctx = {
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
  // Where `inset` is heading (the card's final width). Labels clear the card
  // at this value at once, not at the lagging animated one.
  insetTarget: number;
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
  green: ThreeNS.Color;
  // One flat pastel per node, in skill order.
  pastel: ThreeNS.Color[];
  tmp: { v: ThreeNS.Vector3; f: ThreeNS.Vector3; q: ThreeNS.Quaternion };
};
