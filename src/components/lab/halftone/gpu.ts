import type * as ThreeTypes from "three";
import { FRAGMENT, VERTEX } from "./shader";
import { WebGLUnavailableError } from "./types";
import type { EngineEvent, HalftoneParams, Push } from "./types";
import { drawWordmark } from "./wordmark";

// Everything that touches three.js: renderer, full-screen quad, the wordmark
// texture, uniforms, and the disposal of all of it.

type Three = typeof ThreeTypes;
type Uniforms = ReturnType<typeof makeUniforms>;

const MAX_DPR = 1.5;

export type Gpu = {
  resize: () => boolean; // true when the size changed and the drawing buffer was cleared
  draw: (params: HalftoneParams, offset: Push) => void;
  dispose: () => void;
};

const describe = (err: unknown) => (err instanceof Error ? err.message : String(err));

function shaderLog(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram) {
  const parts = [gl.getProgramInfoLog(program)];
  gl.getAttachedShaders(program)?.forEach((shader) => parts.push(gl.getShaderInfoLog(shader)));
  return parts.filter(Boolean).join("\n").trim().slice(0, 600) || "unknown shader error";
}

function makeRenderer(three: Three, canvas: HTMLCanvasElement, onEvent: (e: EngineEvent) => void) {
  let renderer: ThreeTypes.WebGLRenderer;
  try {
    renderer = new three.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
  } catch {
    throw new WebGLUnavailableError();
  }
  renderer.setClearColor(0x000000, 0);
  // Without this a bad shader fails silently: the quad just never appears.
  renderer.debug.onShaderError = (gl, program) => {
    onEvent({ kind: "error", message: shaderLog(gl, program) });
  };
  return renderer;
}

function makeUniforms(three: Three) {
  return {
    uTex: { value: null as ThreeTypes.Texture | null },
    uRes: { value: new three.Vector2(1, 1) },
    uPitch: { value: 10 },
    uAngle: { value: 0 },
    uSep: { value: new three.Vector2(0, 0) },
    uInk: { value: new three.Vector2(1, 1) },
  };
}

// One quad in clip space. The camera only exists because render() wants one.
function makeQuad(three: Three, uniforms: Uniforms) {
  const scene = new three.Scene();
  const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new three.PlaneGeometry(2, 2);
  const material = new three.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    depthTest: false,
    depthWrite: false,
    transparent: false,
    blending: three.NoBlending, // the shader already outputs premultiplied colour
    side: three.DoubleSide,
  });
  const mesh = new three.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { scene, camera, geometry, material };
}

function writeUniforms(u: Uniforms, params: HalftoneParams, offset: Push, dpr: number) {
  u.uPitch.value = params.pitch * dpr;
  u.uAngle.value = (params.angleDeg * Math.PI) / 180;
  // CSS y points down, gl_FragCoord y points up.
  u.uSep.value.set(offset.x * dpr, -offset.y * dpr);
  u.uInk.value.set(params.inkA ? 1 : 0, params.inkB ? 1 : 0);
}

function makeTexture(three: Three, source: HTMLCanvasElement) {
  const texture = new three.CanvasTexture(source);
  texture.colorSpace = three.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = three.LinearFilter;
  texture.magFilter = three.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createGpu(
  three: Three,
  canvas: HTMLCanvasElement,
  onEvent: (e: EngineEvent) => void,
  lines: readonly string[],
  family: string,
): Gpu {
  const renderer = makeRenderer(three, canvas, onEvent);
  const uniforms = makeUniforms(three);
  const quad = makeQuad(three, uniforms);
  let texture: ThreeTypes.CanvasTexture | null = null;
  let sizeKey = "";
  let textureKey = "";

  const rebuildTexture = () => {
    const size = renderer.getDrawingBufferSize(new three.Vector2());
    // Distinct box or ratio keys can land on the same buffer size; the texture
    // only depends on the buffer, so it is not painted and uploaded twice.
    const key = `${size.x}x${size.y}`;
    if (key === textureKey) return;
    textureKey = key;
    const source = drawWordmark(Math.round(size.x), Math.round(size.y), lines, family);
    texture?.dispose();
    texture = makeTexture(three, source);
    uniforms.uTex.value = texture;
    uniforms.uRes.value.copy(size);
  };

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth));
    const h = Math.max(1, Math.round(canvas.clientHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const key = `${w}x${h}@${dpr}`;
    if (key === sizeKey) return false;
    sizeKey = key;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    rebuildTexture();
    return true;
  };

  const draw = (params: HalftoneParams, offset: Push) => {
    writeUniforms(uniforms, params, offset, renderer.getPixelRatio());
    renderer.render(quad.scene, quad.camera);
  };

  const dispose = () => {
    texture?.dispose();
    quad.geometry.dispose();
    quad.material.dispose();
    renderer.dispose();
  };

  resize();
  try {
    renderer.compile(quad.scene, quad.camera);
  } catch (err) {
    onEvent({ kind: "error", message: describe(err) });
  }
  return { resize, draw, dispose };
}
