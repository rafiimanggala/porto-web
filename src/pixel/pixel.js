// Pixel toolkit for the skill map: packed colours, hash noise, 4x4 ordered
// dithering, string sprites baked to canvases, and a 3x5 font for the
// in-world banners. Everything here is pure or bakes once.
(function (P) {
  "use strict";

  // Deterministic hash in [0, 1) for integer lattice points.
  function hash(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s);
    const c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  // Three octaves, roughly 0..1 with most values near the middle.
  function fbm(x, y, s) {
    return vnoise(x, y, s) * 0.57 + vnoise(x * 2.03, y * 2.03, s + 7) * 0.29 + vnoise(x * 4.1, y * 4.1, s + 13) * 0.14;
  }

  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bayer = (x, y) => BAYER[((y & 3) << 2) | (x & 3)];

  // 0xAABBGGRR, so a Uint32Array over ImageData takes the value as is.
  function pack(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (0xff000000 | ((n & 0xff) << 16) | (n & 0xff00) | ((n >> 16) & 0xff)) >>> 0;
  }

  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, w | 0);
    c.height = Math.max(1, h | 0);
    return c;
  }

  // rows: strings where "." is empty and every other character is a key in pal.
  // outline: optional colour drawn around every filled pixel, so a sprite
  // stays readable on any ground.
  function bake(rows, pal, opts) {
    const o = opts || {};
    const pad = o.outline ? 1 : 0;
    const h = rows.length, w = rows[0].length;
    const c = canvas(w + pad * 2, h + pad * 2);
    const g = c.getContext("2d");
    const at = (x, y) => {
      const ch = rows[y][o.flip ? w - 1 - x : x];
      return ch && ch !== "." ? ch : null;
    };
    if (o.outline) {
      g.fillStyle = o.outline;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!at(x, y)) continue;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || !at(nx, ny)) g.fillRect(nx + pad, ny + pad, 1, 1);
        }
      }
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = at(x, y);
      if (!ch) continue;
      g.fillStyle = pal[ch];
      g.fillRect(x + pad, y + pad, 1, 1);
    }
    return c;
  }

  // 3x5 glyphs, one string of 15 bits per character, row by row.
  const GLYPHS = {
    A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
    E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
    I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
    M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
    Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
    U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
    Y: "101101010010010", Z: "111001010100111", 0: "111101101101111", 1: "010110010010111",
    2: "110001010100111", 3: "110001010001110", 4: "101101111001001", 5: "111100110001110",
    6: "011100110101010", 7: "111001010010010", 8: "010101010101010", 9: "010101011001110",
    "!": "010010010000010", ".": "000000000000010", "+": "000010111010000", " ": "000000000000000",
    "/": "001001010100100", "-": "000000111000000", ":": "000010000010000", "'": "010010000000000",
  };

  // Text baked at k art pixels per font pixel, with a dark outline so it reads
  // over sea, sand and grass alike.
  function text(str, color, outline, k) {
    const s = String(str).toUpperCase();
    const kk = k || 1;
    const w = s.length * 4 * kk - kk + 2, h = 5 * kk + 2;
    const c = canvas(w, h);
    const g = c.getContext("2d");
    const lit = [];
    for (let i = 0; i < s.length; i++) {
      const bits = GLYPHS[s[i]] || GLYPHS[" "];
      for (let b = 0; b < 15; b++) {
        if (bits[b] !== "1") continue;
        lit.push([1 + i * 4 * kk + (b % 3) * kk, 1 + Math.floor(b / 3) * kk]);
      }
    }
    g.fillStyle = outline;
    for (const [x, y] of lit) g.fillRect(x - 1, y - 1, kk + 2, kk + 2);
    g.fillStyle = color;
    for (const [x, y] of lit) g.fillRect(x, y, kk, kk);
    return c;
  }

  // Paint a sprite with integer rects: fn(R, px, g) where R(x, y, w, h, col)
  // and px(x, y, col). Optional 1px outline around everything painted.
  function paint(w, h, fn, outlineColor) {
    const c = canvas(w, h);
    const g = c.getContext("2d");
    const R = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, ww | 0, hh | 0); };
    const px = (x, y, col) => R(x, y, 1, 1, col);
    fn(R, px, g);
    return outlineColor ? outline(c, outlineColor) : c;
  }

  function outline(src, col) {
    const w = src.width + 2, h = src.height + 2;
    const c = canvas(w, h);
    const g = c.getContext("2d");
    g.drawImage(src, 1, 1);
    const d = g.getImageData(0, 0, w, h).data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(x + y * w) * 4 + 3] > 0;
    g.fillStyle = col;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) g.fillRect(x, y, 1, 1);
    }
    return c;
  }

  function flip(src) {
    const c = canvas(src.width, src.height);
    const g = c.getContext("2d");
    g.translate(src.width, 0);
    g.scale(-1, 1);
    g.drawImage(src, 0, 0);
    return c;
  }

  // Shared illustration palette. UI chrome stays on the porto tokens in CSS.
  const PAL = {
    ink: "#152012", white: "#f3f1e6", white2: "#d8dccd", grey1: "#b7bfb2", grey2: "#8d968a", grey3: "#5e645d",
    orange: "#c94e12", orange2: "#8e3510", orange1: "#e8743a", sun: "#ffe375", sun2: "#e0b43a",
    sky: "#a6e8fa", blue: "#4a9fc0", blue2: "#2b6f8f", rose: "#ffa9a9", red: "#d9543f",
    mint: "#9cf0cb", leaf: "#6aa84f", leaf2: "#4e8a3c", leaf3: "#37692d", leaf4: "#24502a",
    wood1: "#c08a55", wood: "#9a6a3d", wood2: "#6d4527", stone: "#c9c0a8", stone2: "#9a917f", stone3: "#6b6456",
    brick: "#b0654a", brick2: "#8a4a36", skin: "#c68a5a", skin2: "#a0683f", hair: "#2a1a12",
    denim: "#2c3e57", bamboo: "#d6bc80", bamboo2: "#a88a4f", foam: "#e6f5e8",
  };

  const ease = {
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    outBack: (t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2,
  };

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  Object.assign(P, { hash, vnoise, fbm, bayer, pack, canvas, bake, text, paint, outline, flip, PAL, ease, clamp });
})((window.PETA = window.PETA || {}));
