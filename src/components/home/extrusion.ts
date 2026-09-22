// The 3D sign look for the wordmark: many hard, blur-free text-shadows stepping
// down and right (the steps are CSS custom properties, so the pointer parallax only
// has to update two numbers). Near half is the mid green, far half the dark
// Porsche green, then one soft ink shadow under the whole block.

const LAYERS = 30;
const NEAR = "#3f7a1e";
const FAR = "#23430f";
const GROUND = "rgba(21, 32, 18, 0.08)";

export function buildExtrusion(layers: number = LAYERS): string {
  const steps = Array.from({ length: layers }, (_, i) => {
    const n = i + 1;
    const color = n <= layers / 2 ? NEAR : FAR;
    return `calc(var(--dx) * ${n}) calc(var(--dy) * ${n}) 0 ${color}`;
  });
  const ground = `calc(var(--dx) * ${layers}) calc(var(--dy) * ${layers} + 8px) 24px ${GROUND}`;
  return [...steps, ground].join(", ");
}

export const EXTRUSION_SHADOW = buildExtrusion();

// Resting direction and the range the pointer can push it (all in em, so the depth
// scales with the type size).
export const EXTRUSION_REST = { dx: 0.0022, dy: 0.0032 } as const;
export const EXTRUSION_SWING = { dx: 0.0018, dy: 0.0014 } as const;
