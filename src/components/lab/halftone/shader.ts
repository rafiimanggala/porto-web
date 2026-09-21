// Raw GLSL for the halftone panel. One full-screen quad, one pass.
//
// The wordmark texture carries two tone fields, painted by wordmark.ts:
//   R: soft field (blurred letters plus a faint radial glow), drives plate A
//   G: sharp letters, drives plate B
// Each plate is a rotated dot screen. Dot area follows the tone sampled at the
// cell centre, so a dot is always a clean circle, never a chopped one. Plate A
// is displaced by +uSep/2 and plate B by -uSep/2, the way a badly registered
// print looks.
//
// Output is written in sRGB straight to the framebuffer (no colorspace chunk),
// premultiplied, so the page background shows through the gaps.

export const VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const FRAGMENT = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uRes;    // drawing buffer size in device pixels
uniform float uPitch; // dot pitch in device pixels
uniform float uAngle; // screen angle of plate A, radians
uniform vec2 uSep;    // plate separation in device pixels (y already flipped)
uniform vec2 uInk;    // x: plate A on (0 or 1), y: plate B on (0 or 1)

const vec3 INK_A = vec3(1.0, 0.4157, 0.0706);   // site accent #ff6a12
const vec3 INK_B = vec3(0.9294, 0.9294, 0.9373); // site foreground #ededef
const float PLATE_GAP = 0.5236;                  // 30 degrees between screens

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

// The canvas texture is sRGB, so the sampler hands back linear values.
// Undo that: the painted grey levels are the tone we want.
float sampleTone(vec2 p, vec2 pick) {
  vec2 uv = p / uRes;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
  vec3 t = pow(texture2D(uTex, uv).rgb, vec3(0.4545));
  return dot(t.rg, pick);
}

float cellTone(vec2 centre, vec2 pick) {
  float k = uPitch * 0.35;
  float sum = sampleTone(centre, pick)
    + sampleTone(centre + vec2(k, 0.0), pick)
    + sampleTone(centre - vec2(k, 0.0), pick)
    + sampleTone(centre + vec2(0.0, k), pick)
    + sampleTone(centre - vec2(0.0, k), pick);
  return sum * 0.2;
}

// Coverage (0..1) of one plate at pixel p.
float plate(vec2 p, float angle, vec2 pick) {
  mat2 r = rot(angle);
  vec2 q = (r * p) / uPitch;
  vec2 local = fract(q) - 0.5;
  vec2 centre = (rot(-angle) * ((floor(q) + 0.5) * uPitch));
  float tone = clamp(cellTone(centre, pick), 0.0, 1.0);
  float radius = 0.7071 * sqrt(tone);
  float aa = 0.75 / uPitch;
  float dotCover = 1.0 - smoothstep(radius - aa, radius + aa, length(local));
  // A zero-radius dot would still leave a half-covered speck at its centre.
  return dotCover * smoothstep(0.0, 0.05, tone);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float a = plate(p - 0.5 * uSep, uAngle, vec2(1.0, 0.0)) * uInk.x;
  float b = plate(p + 0.5 * uSep, uAngle + PLATE_GAP, vec2(0.0, 1.0)) * uInk.y;
  // Plate B is printed over plate A. Premultiplied "over" compositing.
  vec3 rgb = INK_B * b + INK_A * a * (1.0 - b);
  float alpha = b + a * (1.0 - b);
  gl_FragColor = vec4(rgb, alpha);
}
`;
