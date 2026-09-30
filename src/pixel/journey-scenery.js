// Scenery for the journey level, baked once when the level mounts: one
// biome per month, from a kampung in the February rain to downtown Jakarta
// in September. Each month has a dithered sky, a far and a mid layer, and a
// stretch of the front strip (near things, the walkway and the strata).
// Far and mid are painted in column coordinates: x = 0 is where the month
// starts, placed where the reader sees it while that month is being read;
// journey.js slides them with parallax and dissolves neighbours along a
// dithered seam. Where a reader rests, a month's seams fall at column x 220
// and, seen from the month before, at 88 (mid) or 154 (far); tall things
// stay clear of those so they are not torn. Painting runs on a small
// software raster of packed pixels, so a bake takes milliseconds and looks
// the same in every browser.
(function (P) {
  "use strict";
  const { hash, bayer, vnoise, PAL: C } = P;
  // The level passes its geometry to build().
  let H = 144, G = 118, SEG = 220;
  // Far and mid canvases cover column x in [V0, V0 + VW); seams are 2B wide.
  const V0 = -120, VW = 500, B = 16, SKY_W = 520;

  // ---- light ----------------------------------------------------------------------------
  // Sky stops per month, zenith to horizon. Every month uses the same bands,
  // so a crossfade between two months is itself a clean dithered gradient.
  const SKY = [
    ["#0b0f24", "#11162f", "#181d3a", "#212644", "#2b2e4d", "#393852", "#4b4357"],
    ["#060a1e", "#0a1027", "#0f1733", "#151f40", "#1d294d", "#283559", "#374363"],
    ["#121842", "#1c2152", "#2a2a62", "#3e3570", "#58427d", "#795287", "#9a658c"],
    ["#28397a", "#3f4f8e", "#63669f", "#9178a6", "#c48aa2", "#eca194", "#ffc487"],
    ["#4a80c6", "#5990d1", "#6ca2dc", "#83b5e6", "#9bc7ee", "#b4d6f2", "#cde3f4"],
    ["#4a82cc", "#6693cf", "#88a8cc", "#aebbc4", "#d4c6a8", "#efcf94", "#ffd98a"],
    ["#3585d9", "#4595e2", "#58a6eb", "#6fb6f1", "#8ac6f5", "#a7d4f8", "#c8e4f9"],
    ["#2c7bd8", "#3c8be2", "#4f9cea", "#66aef1", "#80c0f6", "#9ecef8", "#c2dcef"],
  ];
  // Per month: an ambient tint for painted things (night blue, dawn pink,
  // golden hour) and the haze colour for aerial perspective, as amounts for
  // the [far, mid, near] layers.
  const LIGHT = [
    { amb: "#131a3c", ka: [0.62, 0.5, 0.36], fog: "#433f58", kf: [0.62, 0.26, 0.05] },
    { amb: "#0f173c", ka: [0.62, 0.48, 0.34], fog: "#2c375a", kf: [0.55, 0.22, 0.04] },
    { amb: "#2a2358", ka: [0.5, 0.4, 0.28], fog: "#8a5e8a", kf: [0.58, 0.24, 0.04] },
    { amb: "#ff9f86", ka: [0.26, 0.2, 0.14], fog: "#c890a6", kf: [0.6, 0.22, 0.03] },
    { amb: "#ffffff", ka: [0, 0, 0], fog: "#c6dcee", kf: [0.55, 0.2, 0.02] },
    { amb: "#ffae5a", ka: [0.24, 0.18, 0.12], fog: "#f0cc9a", kf: [0.58, 0.22, 0.03] },
    { amb: "#ffffff", ka: [0, 0, 0], fog: "#bcdcf6", kf: [0.5, 0.16, 0.02] },
    { amb: "#d8dde0", ka: [0.08, 0.05, 0], fog: "#b8d4ea", kf: [0.52, 0.18, 0.02] },
  ];

  // ---- materials (light to dark; shadows lean blue or purple) -------------------------
  const GENTENG = ["#e4945e", "#c26b40", "#94472f", "#5e2e2a"];
  const WALLS = [
    ["#e6f1dc", "#bfd8c4", "#8fb0a4", "#5f7d7d"], ["#f6dccf", "#dcaea6", "#ad8088", "#7a5a6c"],
    ["#f4e9c9", "#dcc79c", "#ab977c", "#756860"], ["#dde8f0", "#aec2d6", "#8095b2", "#58668a"],
  ];
  const CONCRETE = ["#d6d3c6", "#aeaca2", "#838480", "#5a5e66"];
  const ASPHALT = ["#7a7f8c", "#5a5f6e", "#434858", "#2d3142"];
  const STEEL = ["#d4dbe2", "#a0aab7", "#6f7988", "#474e5f"];
  const GLASS = ["#cdeef7", "#8ac3da", "#5692b4", "#345f88"];
  const LEAF = ["#a4dc6a", "#6aa84f", "#4e8a3c", "#37692d", "#24502a"];
  const TEA = ["#98d468", "#6cb04c", "#4a8a3c", "#2f6232"];
  const RIDGE = ["#93aaa2", "#718b87", "#57706f", "#40535b"];
  const SOIL = ["#8e5c3a", "#6f4629", "#54341e", "#3a2416"];
  const SAND = ["#f7e5b2", "#ead092", "#d3b074", "#ad8a5c"];
  const STONE = ["#ded4b8", "#b5aa8e", "#8d8373", "#645c56"];
  const WATER = ["#a8def0", "#6ab2d2", "#4088b0", "#285f8a"];
  const BRICK = ["#dc8c6c", "#b9664c", "#8e4a3a", "#62322c"];
  const WOOD = ["#d49e66", "#a8743f", "#7a4f2c", "#52331f"];
  const LIT = { warm: "#ffd98a", warm2: "#f2a24e", cool: "#c4ecff", red: "#ff4d3a", gold: "#ffe375", led: "#7dffc4", screen: "#9fe8ff" };

  // ---- colour ----------------------------------------------------------------------------
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const hex2 = (v) => Math.round(v).toString(16).padStart(2, "0");
  function mix(a, b, f) {
    const A = rgb(a), Bc = rgb(b);
    return "#" + A.map((v, i) => hex2(v + (Bc[i] - v) * f)).join("");
  }
  // The colour of a painted thing in month i on layer k (0 far, 1 mid, 2 near).
  const tone = (i, k) => { const L = LIGHT[i]; return (c) => mix(mix(c, L.amb, L.ka[k]), L.fog, L.kf[k]); };

  // How much of the next month shows at x across a seam w wide, on row y: a
  // short dithered ramp along a line that wanders from row to row, so a join
  // reads as a torn edge and not as a column of mesh. Every layer shares the
  // line, so sky to strata the months part along one edge.
  const ramp = (x, y, w) => Math.min(1, Math.max(0, (x - w / 2 - (vnoise(y / 7, 0, 5) - 0.5) * w * 0.55) / 8 + 0.5));

  // ---- raster ----------------------------------------------------------------------------
  // Packed ABGR pixels painted with whole rects, written to a canvas once.
  // Colours go through the layer's light; E paints light sources that ignore
  // it. On the front strip a month dissolves into the one before it: inside
  // gate a pixel lands only where the Bayer threshold is under the ramp.
  function raster(w, h, tn) {
    const d = new Uint32Array(w * h), raw = new Map();
    let memo = new Map();
    const r = { w, h, d, ox: 0, oy: 0, gate: null, lim: w };
    const pk = (c, lit) => {
      const own = lit || !tn, m = own ? raw : memo;
      let v = m.get(c);
      if (v === undefined) m.set(c, (v = P.pack(own ? c : tn(c))));
      return v;
    };
    const ok = (X, Y) => X >= 0 && X < r.lim && Y >= 0 && Y < h &&
      !(r.gate && X < r.gate[1] && bayer(X, Y) >= ramp(X - r.gate[0], Y, r.gate[1] - r.gate[0]));
    function fill(x, y, ww, hh, v) {
      const xa = Math.round(x) + r.ox, ya = Math.round(y) + r.oy;
      const X0 = Math.max(0, xa), X1 = Math.min(r.lim, xa + Math.round(ww));
      const Y0 = Math.max(0, ya), Y1 = Math.min(h, ya + Math.round(hh));
      if (X1 <= X0) return;
      const g1 = r.gate ? Math.min(X1, Math.max(X0, r.gate[1])) : X0;
      for (let Y = Y0; Y < Y1; Y++) {
        for (let X = X0; X < g1; X++) if (ok(X, Y)) d[Y * w + X] = v;
        if (X1 > g1) d.fill(v, Y * w + g1, Y * w + X1);
      }
    }
    r.tone = (fn) => { tn = fn; memo = new Map(); };
    r.R = (x, y, ww, hh, c) => fill(x, y, ww, hh, pk(c));
    r.E = (x, y, ww, hh, c) => fill(x, y, ww, hh, pk(c, true));
    r.P = (x, y, c) => fill(x, y, 1, 1, pk(c));
    // Pixels of the box whose Bayer threshold is under f (a number or f(x, y)).
    r.D = (x, y, ww, hh, c, f, lit) => {
      const v = pk(c, lit);
      for (let yy = y; yy < y + hh; yy++) for (let xx = x; xx < x + ww; xx++) {
        const X = xx + r.ox, Y = yy + r.oy;
        if (ok(X, Y) && bayer(X, Y) < (typeof f === "function" ? f(xx, yy) : f)) d[Y * w + X] = v;
      }
    };
    // Blend a light over what is there at alpha a (pools, haze, sheen).
    r.A = (x, y, c, a) => {
      const X = x + r.ox, Y = y + r.oy;
      if (!ok(X, Y)) return;
      const i = Y * w + X, v = d[i], da = (v >>> 24) / 255, oa = a + da * (1 - a), s = pk(c, true);
      const ch = (k) => Math.round((((s >>> k) & 255) * a + ((v >>> k) & 255) * da * (1 - a)) / oa);
      d[i] = ((Math.round(oa * 255) << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0;
    };
    // A pool of light: density falls off from the centre in dithered steps.
    r.G = (cx, cy, rx, ry, c, a) => {
      for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) {
        const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (q < 1 && bayer(x + r.ox, y + r.oy) < (1 - Math.sqrt(q)) * 1.5) r.A(x, y, c, a * (q < 0.3 ? 1 : 0.55));
      }
    };
    // Stamp another raster's opaque pixels with its top left at (x, y).
    r.S = (q, x, y) => {
      for (let yy = 0; yy < q.h; yy++) for (let xx = 0; xx < q.w; xx++) {
        const v = q.d[yy * q.w + xx], X = x + xx + r.ox, Y = y + yy + r.oy;
        if (v >>> 24 && ok(X, Y)) d[Y * w + X] = v;
      }
    };
    r.canvas = () => {
      const c = P.canvas(w, h), g = c.getContext("2d"), img = g.createImageData(w, h);
      new Uint32Array(img.data.buffer).set(d);
      g.putImageData(img, 0, 0);
      return c;
    };
    return r;
  }

  // A foreground prop painted in its own raster and ringed with ink.
  function sprite(w, h, tn, fn) {
    const q = raster(w + 2, h + 2, tn);
    q.ox = 1; q.oy = 1;
    fn(q);
    const ink = P.pack(C.ink), d = q.d, W = q.w, add = [];
    const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < q.h && d[y * W + x] >>> 24 === 255;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < W; x++) {
      if (!(d[y * W + x] >>> 24) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) add.push(y * W + x);
    }
    for (const i of add) d[i] = ink;
    q.ox = 0; q.oy = 0;
    return q;
  }

  // ---- shapes ----------------------------------------------------------------------------
  // A block lit from the upper left: light top and left edges, a shaded right
  // side and a dark foot.
  function box(r, x, y, w, h, m) {
    r.R(x, y, w, h, m[1]);
    r.R(x, y, w, 1, m[0]); r.R(x, y, 1, h, m[0]);
    r.R(x + w - 2, y + 1, 2, h - 1, m[2]); r.R(x, y + h - 1, w, 1, m[3]);
  }
  const rows = (rad) => Array.from({ length: rad * 2 + 1 }, (_, k) => Math.round(Math.sqrt(rad * rad - (k - rad) ** 2) - 0.3));
  function disk(r, cx, cy, rad, c) { rows(rad).forEach((hw, k) => r.R(cx - hw, cy + k - rad, hw * 2 + 1, 1, c)); }
  // A shaded blob for foliage and clouds: lit upper left, hash-grained body.
  function blob(r, cx, cy, rad, m, seed) {
    rows(rad).forEach((hw, k) => {
      const dy = k - rad;
      for (let dx = -hw; dx <= hw; dx++) {
        const s = (dx + dy * 1.3) / rad + (hash(cx + dx, cy + dy, seed) - 0.5) * 0.8;
        r.P(cx + dx, cy + dy, s < -0.8 ? m[0] : s < 0.35 ? m[1] : s < 1.05 ? m[2] : m[3]);
      }
    });
  }
  function tree(r, x, base, s, m, seed) {
    r.R(x - 1, base - s, 3, s, WOOD[2]); r.R(x - 1, base - s, 1, s, WOOD[1]); r.R(x + 1, base - s, 1, s, WOOD[3]);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * 6.283 + seed;
      blob(r, x + Math.round(Math.cos(a) * s * 0.36), base - s - 2 + Math.round(Math.sin(a) * s * 0.22), Math.round(s * 0.3 + hash(k, 3, seed) * s * 0.12), m, seed + k);
    }
    blob(r, x - 1, base - s - 4, Math.round(s * 0.38), m, seed + 9);
  }
  // A coconut palm: a leaning ringed trunk, drooping fronds, coconuts.
  const FRONDS = [[-1, -0.35, 10], [1, -0.4, 10], [-1, 0.05, 11], [1, 0.05, 11], [-0.45, -0.7, 6], [0.5, -0.7, 6], [-0.9, 0.45, 8], [0.9, 0.45, 8]];
  function palm(r, x, base, h, lean) {
    for (let j = 0; j < h; j++) {
      const px = x + Math.round(lean * (j / h) ** 2 * h * 0.3);
      r.R(px, base - j, 2, 1, j % 3 ? WOOD[1] : WOOD[2]); r.P(px + 1, base - j, WOOD[2]);
    }
    const tx = x + Math.round(lean * h * 0.3), ty = base - h;
    for (const [dx, dy, len] of FRONDS) for (let k = 1; k <= len; k++) {
      const fx = tx + Math.round(dx * k), fy = ty + Math.round(dy * k + 0.07 * k * k);
      r.R(fx, fy, 2, 1, k < len * 0.45 ? LEAF[1] : LEAF[2]);
      if (k % 2) r.P(fx + (dx > 0 ? 1 : 0), fy + 1, LEAF[3]);
    }
    r.R(tx - 1, ty + 1, 2, 2, WOOD[2]); r.P(tx + 1, ty + 2, WOOD[3]); r.P(tx - 1, ty + 1, WOOD[1]);
  }
  // A sagging cable, filled so steep ends stay unbroken.
  function cable(r, x0, y0, x1, y1, sag, c) {
    let last = null;
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0), y = Math.round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t));
      r.R(x, last == null ? y : Math.min(y, last), 1, last == null ? 1 : Math.abs(y - last) + 1, c);
      last = y;
    }
  }
  // A clay-tile roof: tile courses that step in toward the ridge, staggered
  // joints, a ridge cap and a dark eave; wet tiles catch the sky.
  function roof(r, x, y, w, h, wet) {
    for (let j = 0; j < h; j++) {
      const inset = Math.round(((h - 1 - j) * w) / (h * 3.4)), X = x + inset, W = w - inset * 2;
      r.R(X, y + j, W, 1, j === 0 ? GENTENG[2] : j % 2 ? GENTENG[1] : GENTENG[0]);
      if (j % 2) for (let k = j % 4 === 1 ? 1 : 3; k < W - 1; k += 4) r.P(X + k, y + j, GENTENG[2]);
      r.P(X + W - 1, y + j, GENTENG[3]);
      if (wet && hash(x, j, 9) > 0.35) r.P(X + 2 + Math.floor(hash(x, j, 10) * (W - 4)), y + j, "#a9bede");
    }
    r.R(x + 1, y + h, w - 2, 1, GENTENG[3]);
  }
  // Mountains from [x, height, half width] cones roughened by noise; faces
  // toward the upper left take the light.
  function range(r, peaks, m, seed, base) {
    const hAt = (x) => Math.max(0, ...peaks.map(([px, ph, pw]) => ph * (1 - Math.abs(x - px) / pw))) + (vnoise(x / 7, 0, seed) - 0.5) * 5;
    for (let x = V0; x < V0 + VW; x++) {
      const h = Math.round(hAt(x)), s = hAt(x + 2) - hAt(x - 2);
      if (h <= 0) continue;
      const top = (base || G) - h;
      r.R(x, top, 1, h, m[1]);
      r.R(x, top, 1, 2, s > 0.5 ? m[0] : m[2]);
      if (s < -0.5) r.D(x, top + 2, 1, h - 2, m[2], 0.55);
      else if (s > 1.2) r.D(x, top + 2, 1, Math.min(h - 2, 6), m[0], 0.4);
      if (hash(x, 3, seed) > 0.8) r.P(x, top + 3 + Math.floor(hash(x, 4, seed) * Math.max(1, h - 4)), m[3]);
    }
  }
  // A run of towers between x0 and x1 with crowns, masts and window rows;
  // a share of windows is lit (win.p) when it is night.
  function skyline(r, x0, x1, lo, hi, seed, m, win) {
    for (let x = x0; x < x1;) {
      const w = 7 + Math.floor(hash(x, 1, seed) * 12), h = lo + Math.floor(hash(x, 2, seed) ** 1.4 * (hi - lo)), top = G - h;
      box(r, x, top, w, h, m);
      if (hash(x, 3, seed) > 0.55) r.R(x + 2, top - 3, w - 4, 3, m[2]);
      if (hash(x, 4, seed) > 0.7) r.R(x + (w >> 1), top - 9, 1, 9, m[2]);
      for (let y = top + 3; y < G - 3; y += 3) for (let i = x + 2; i < x + w - 2; i += 2) {
        const q = hash(i, y, seed + 5);
        if (win && q < win.p) r.E(i, y, 1, 1, q < win.p * 0.3 && win.c2 ? win.c2 : win.c);
        else if (q > 0.5) r.P(i, y, m[2]);
      }
      x += w + (hash(x, 5, seed) > 0.7 ? 3 : 0);
    }
  }
  // Haze thickening toward the horizon, as a dithered band in the fog colour.
  const haze = (r, h, c, k) => r.D(V0, G - h, VW, h, c, (x, y) => ((y - G + h) / h) * (k || 0.9), true);

  // ---- far: silhouettes behind haze ------------------------------------------------------
  const FAR = [
    (r, L) => {
      skyline(r, V0, V0 + VW, 10, 34, 11, CONCRETE, { p: 0.05, c: "#c8985a" });
      box(r, 150, G - 52, 9, 52, CONCRETE); r.R(154, G - 60, 1, 8, CONCRETE[2]); r.E(153, G - 61, 3, 1, LIT.red);
      haze(r, 22, L.fog, 1);
    },
    (r, L) => {
      skyline(r, V0, V0 + VW, 18, 56, 23, CONCRETE, { p: 0.2, c: "#ffd98a", c2: "#bfe4ff" });
      r.R(118, G - 76, 3, 76, STEEL[2]); r.R(118, G - 76, 1, 76, STEEL[1]);
      disk(r, 119, G - 60, 4, STEEL[2]); r.R(115, G - 61, 9, 1, STEEL[1]); r.E(116, G - 59, 7, 1, LIT.warm);
      r.R(119, G - 88, 1, 12, STEEL[2]); r.E(119, G - 89, 1, 1, LIT.red);
      haze(r, 12, L.fog);
    },
    (r, L) => {
      range(r, [[30, 66, 112], [150, 40, 70], [262, 54, 96], [370, 36, 60]], RIDGE.map((c) => mix(c, L.fog, 0.35)), 31);
      range(r, [[-60, 28, 70], [92, 32, 84], [204, 24, 60], [312, 30, 70]], RIDGE, 37);
      haze(r, 14, L.fog, 1.1);
      r.D(V0, G - 30, VW, 4, L.fog, (x) => 0.35 + vnoise(x / 16, 5, 3) * 0.4, true);
    },
    (r, L) => {
      range(r, [[60, 52, 120], [240, 60, 110], [360, 42, 80]], RIDGE.map((c) => mix(c, L.fog, 0.4)), 41);
      range(r, [[-20, 32, 70], [140, 36, 90], [300, 28, 70]], RIDGE, 43);
    },
    (r, L) => {
      range(r, [[-40, 26, 120], [120, 34, 140], [320, 28, 120]], TEA.map((c) => mix(c, L.fog, 0.3)), 51);
      skyline(r, V0 + 60, V0 + 440, 12, 38, 53, CONCRETE, null);
      haze(r, 10, L.fog);
    },
    (r, L) => {
      range(r, [[0, 30, 150], [200, 38, 130], [360, 26, 100]], RIDGE.map((c) => mix(c, "#c89a6a", 0.3)), 61);
      skyline(r, V0 + 180, V0 + 330, 10, 30, 63, CONCRETE, null);
      haze(r, 18, L.fog, 1);
    },
    (r, L) => {
      r.R(V0, G - 30, VW, 30, WATER[1]); r.R(V0, G - 30, VW, 1, mix(WATER[0], L.fog, 0.4));
      for (const [x, w, h] of [[20, 44, 9], [190, 70, 14], [330, 30, 6]]) {
        for (let k = -w / 2; k < w / 2; k++) r.R(x + k, G - 30 - Math.round(h * (1 - (2 * k / w) ** 2)), 1, Math.round(h * (1 - (2 * k / w) ** 2)), LEAF[3]);
        for (let k = 0; k < w / 12; k++) {
          const dx = Math.round(-w / 3 + k * 11 + hash(k, x, 5) * 4), ph = 4 + Math.floor(hash(k, x, 6) * 4), lean = hash(k, x, 7) > 0.5 ? 1 : -1;
          const top = G - 30 - Math.round(h * (1 - (2 * dx / w) ** 2)) - ph;
          r.R(x + dx, top + 1, 1, ph, LEAF[3]); r.R(x + dx - 1 + lean, top, 3, 1, LEAF[3]);
          r.P(x + dx - 2 + lean, top + 1, LEAF[3]); r.P(x + dx + 2 + lean, top + 1, LEAF[3]); r.P(x + dx - 3 + lean, top + 2, LEAF[3]); r.P(x + dx + 3 + lean, top + 2, LEAF[3]);
        }
      }
      r.R(112, G - 34, 22, 3, STEEL[3]); r.R(118, G - 38, 9, 4, STEEL[1]); r.R(122, G - 42, 2, 4, STEEL[2]);
    },
    (r, L) => {
      skyline(r, V0, V0 + VW, 22, 62, 71, CONCRETE, null);
      skyline(r, V0 + 30, V0 + VW, 12, 30, 73, GLASS, null);
      haze(r, 12, L.fog);
    },
  ];

  // ---- mid: the month's own place ---------------------------------------------------------
  function house(r, x, w, wh, rh, seed, lit) {
    const top = G - wh, wall = WALLS[Math.floor(hash(seed, 1, 7) * WALLS.length)];
    box(r, x, top, w, wh, wall);
    for (let k = 0; k < w / 3; k++) r.P(x + 1 + Math.floor(hash(seed, k, 3) * (w - 2)), top + 2 + Math.floor(hash(seed, k, 4) * (wh - 3)), wall[2]);
    r.R(x, G - 2, w, 2, wall[3]);
    const dx = x + 3 + Math.floor(hash(seed, 2, 7) * (w - 10));
    r.R(dx, G - 10, 5, 10, WOOD[2]); r.R(dx, G - 10, 5, 1, WOOD[3]); r.P(dx + 3, G - 6, C.sun2);
    for (let wx = x + 3; wx + 6 < x + w - 1; wx += 11) {
      if (wx + 6 > dx - 1 && wx < dx + 6) continue;
      const on = lit && hash(seed, wx, 5) < 0.5;
      r.R(wx - 1, top + 3, 8, 7, WOOD[2]);
      if (on) { r.E(wx, top + 4, 6, 5, LIT.warm); r.E(wx, top + 4, 2, 5, LIT.warm2); r.G(wx + 3, G - 1, 7, 3, "#ffb060", 0.35); }
      else { r.R(wx, top + 4, 6, 5, "#26304a"); r.R(wx, top + 4, 6, 1, "#3c4a68"); }
      for (let b = wx + 1; b < wx + 6; b += 2) r.R(b, top + 4, 1, 5, on ? "#7a4a24" : "#1b2234");
    }
    roof(r, x - 2, top - rh, w + 4, rh, true);
    if (hash(seed, 8, 7) > 0.55) toren(r, x + w - 10, top - rh + 2);
    else if (hash(seed, 9, 7) > 0.5) { r.R(x + 4, top - rh - 2, 1, 3, STEEL[2]); r.R(x + 2, top - rh - 5, 4, 1, STEEL[0]); r.R(x + 3, top - rh - 4, 4, 1, STEEL[1]); }
  }
  function toren(r, x, base) {
    const T = ["#8fc4ea", "#5a96c8", "#35699a", "#214870"];
    r.R(x, base - 5, 1, 5, STEEL[2]); r.R(x + 6, base - 5, 1, 5, STEEL[3]); r.R(x, base - 3, 7, 1, STEEL[2]);
    box(r, x, base - 13, 7, 8, T); r.R(x + 1, base - 14, 5, 1, T[0]); r.R(x, base - 10, 7, 1, T[2]);
  }
  function mosque(r, x, base) {
    const D = ["#8fcaa4", "#5e9e7c", "#3f7a5e", "#2a5646"];
    box(r, x - 13, base - 14, 26, 14, WALLS[2]);
    for (let k = -10; k < 10; k += 5) { r.R(x + k, base - 11, 3, 6, "#2a3048"); r.R(x + k, base - 12, 3, 1, WALLS[2][2]); }
    rows(10).slice(0, 11).forEach((hw, k) => { r.R(x - hw, base - 25 + k, hw * 2 + 1, 1, D[1]); r.P(x - hw, base - 25 + k, D[0]); r.R(x + hw - 2, base - 25 + k, 2, 1, D[2]); });
    r.R(x - 11, base - 15, 22, 1, D[3]); r.R(x, base - 30, 1, 5, C.sun2); r.P(x + 1, base - 31, C.sun);
    r.R(x + 20, base - 44, 5, 44, WALLS[2][1]); r.R(x + 20, base - 44, 1, 44, WALLS[2][0]); r.R(x + 24, base - 44, 1, 44, WALLS[2][2]);
    r.R(x + 18, base - 32, 9, 2, WALLS[2][2]); r.R(x + 19, base - 48, 7, 4, D[1]); r.R(x + 22, base - 52, 1, 4, C.sun2);
    r.E(x + 21, base - 38, 3, 2, LIT.led);
  }
  // Tiers of tea bushes following the hill, a zigzag stone path, a candi on top.
  function teaHill(r, cx, h, w, seed) {
    for (let x = cx - w; x < cx + w; x++) {
      const t = (x - cx) / w, top = G - Math.round(h * (1 - t * t) + (vnoise(x / 9, 1, seed) - 0.5) * 3);
      for (let y = top; y < G; y++) {
        const row = (y - top) % 4;
        r.P(x, y, row === 0 ? (hash(x, y, seed) > 0.35 ? TEA[0] : TEA[1]) : row === 3 ? TEA[3] : hash(x, y, seed) > 0.8 ? TEA[2] : TEA[1]);
      }
      r.P(x, top, t < 0 ? TEA[0] : TEA[2]);
    }
  }
  function candi(r, x, base) {
    box(r, x - 13, base - 4, 26, 4, STONE); box(r, x - 10, base - 16, 20, 12, STONE);
    box(r, x - 8, base - 20, 16, 4, STONE); box(r, x - 6, base - 23, 12, 3, STONE); box(r, x - 4, base - 26, 8, 3, STONE);
    r.R(x - 1, base - 30, 3, 4, STONE[1]); r.P(x, base - 32, STONE[0]); r.P(x, base - 31, STONE[1]);
    for (let k = -9; k < 9; k += 3) r.P(x + k, base - 5, STONE[3]);
    r.R(x - 5, base - 15, 10, 10, "#2a2340");
    r.G(x, base - 10, 14, 12, "#ffcf5a", 0.4);
    wheel(r, x, base - 10, 4);
  }
  // Mahoraga's wheel: eight spokes and a rim, gold, lit from inside.
  function wheel(r, cx, cy, rad) {
    for (let a = 0; a < 8; a++) for (let d = 1; d <= rad; d++) r.E(cx + Math.round(Math.cos(a * 0.785) * d), cy + Math.round(Math.sin(a * 0.785) * d), 1, 1, d === rad ? LIT.gold : "#e0b43a");
    r.E(cx - 1, cy - 1, 3, 3, "#fff2b0"); r.E(cx, cy, 1, 1, C.orange);
  }
  function lake(r, L, seed) {
    const shore = G - 26, sky = SKY[3];
    for (let y = shore; y < G; y++) {
      const t = (y - shore) / 26, c = mix(mix(sky[6], sky[3], t), "#3c4c8c", t * 0.55);
      r.E(V0, y, VW, 1, c);
      for (let x = V0; x < V0 + VW; x++) if (hash(x >> 2, y, seed) > 0.85) r.E(x, y, 2 + Math.floor(hash(x, y, seed + 1) * 4), 1, mix(c, "#fff0d8", 0.5 - t * 0.25));
    }
    r.E(V0, shore, VW, 1, "#ffe6c0");
    for (let x = V0; x < V0 + VW; x++) {
      const h = 4 + Math.round(vnoise(x / 6, 2, seed) * 6 + (hash(x >> 3, 1, seed) > 0.7 ? 4 : 0));
      r.R(x, shore - h, 1, h, LEAF[3]); r.P(x, shore - h, LEAF[2]);
      for (let k = 1; k < h; k++) if (k % 3 !== 2 || hash(x, k, seed) > 0.6) r.A(x, shore + k, "#26304e", 0.55);
    }
    r.D(V0, shore - 7, VW, 8, "#f8d0c8", (x, y) => 0.2 + vnoise(x / 20, y, 4) * 0.35);
  }
  const MID = [
    (r) => {
      mosque(r, 128, G - 22);
      for (let x = V0 + 2, n = 0; x < V0 + VW; n++) {
        const w = 24 + Math.floor(hash(x, 1, 61) * 16);
        house(r, x, w, 14 + Math.floor(hash(x, 2, 61) * 9), 8 + Math.floor(hash(x, 3, 61) * 3), 61 + x, n % 3 === 1);
        x += w + 4;
      }
      for (const x of [-70, 40, 176, 290]) { r.R(x, G - 46, 2, 46, CONCRETE[2]); r.R(x, G - 46, 1, 46, CONCRETE[1]); r.R(x - 4, G - 42, 10, 1, STEEL[3]); }
      for (const [a, b] of [[-70, 40], [40, 176], [176, 290]]) for (let k = 0; k < 4; k++) cable(r, a, G - 42 + (k % 2), b, G - 42 + (k >> 1), 6 + k * 3, "#171a28");
      cable(r, 40, G - 41, 70, G - 24, 3, "#171a28"); cable(r, 176, G - 40, 214, G - 22, 4, "#171a28");
    },
    (r) => {
      for (const [x, w, h] of [[-118, 34, 50], [-84, 26, 38], [-56, 40, 58], [176, 30, 46], [236, 38, 62], [276, 28, 40], [306, 40, 54], [348, 32, 44]]) {
        box(r, x, G - h, w, h, CONCRETE);
        for (let y = G - h + 4; y < G - 4; y += 4) for (let i = x + 3; i < x + w - 3; i += 3) { const q = hash(i, y, 81); if (q < 0.22) r.E(i, y, 2, 2, q < 0.07 ? LIT.cool : LIT.warm); else r.R(i, y, 2, 2, "#2c3650"); }
      }
      box(r, 20, G - 30, 124, 30, STEEL); r.R(20, G - 3, 124, 3, CONCRETE[2]); r.R(20, G - 3, 124, 1, CONCRETE[1]);
      for (const y of [G - 26, G - 18]) for (let x = 24; x < 50; x += 6) { r.R(x, y, 4, 5, "#1b2438"); if (hash(x, y, 85) > 0.45) r.E(x, y + 1, 4, 4, "#6aa8d8"); r.R(x, y + 5, 4, 1, STEEL[0]); }
      r.R(36, G - 11, 9, 8, "#1b2438"); r.E(37, G - 10, 7, 7, "#9fd8f4"); r.R(40, G - 10, 1, 7, "#3c6a88"); r.R(34, G - 13, 13, 2, STEEL[3]); r.G(40, G - 2, 10, 3, "#8fd0ff", 0.3);
      r.R(54, G - 25, 64, 13, "#0f1422"); r.R(54, G - 26, 64, 1, STEEL[3]); r.R(54, G - 12, 64, 1, STEEL[0]);
      for (let x = 55; x < 117; x += 4) { r.R(x, G - 24, 3, 11, "#252c3c"); for (let y = G - 23; y < G - 13; y += 2) if (hash(x, y, 83) > 0.35) r.E(x + (y & 2 ? 0 : 2), y, 1, 1, hash(x, y, 84) > 0.45 ? LIT.led : "#58b4ff"); }
      r.G(86, G - 18, 30, 7, "#5ac8ff", 0.12);
      for (let y = G - 27; y < G - 4; y += 2) r.R(121, y, 21, 1, STEEL[2]);
      for (const cx of [126, 137]) { disk(r, cx, G - 12, 4, STEEL[3]); r.R(cx - 3, G - 12, 7, 1, STEEL[1]); r.R(cx, G - 15, 1, 7, STEEL[1]); r.P(cx, G - 12, STEEL[0]); }
      r.E(20, G - 30, 124, 1, "#3a6a8a"); r.R(58, G - 9, 20, 6, STEEL[2]); r.R(59, G - 8, 18, 1, STEEL[1]); r.R(88, G - 10, 26, 7, WALLS[3][2]);
      for (const x of [30, 58, 100, 122]) { box(r, x, G - 38, 14, 8, STEEL); r.R(x + 3, G - 36, 8, 4, STEEL[3]); r.R(x + 6, G - 36, 2, 4, STEEL[1]); }
      for (const x of [48, 112]) { r.R(x, G - 36, 1, 6, STEEL[2]); r.R(x - 3, G - 41, 7, 1, STEEL[0]); r.R(x - 2, G - 40, 6, 1, STEEL[1]); r.R(x - 1, G - 39, 4, 1, STEEL[2]); }
      for (let y = G - 74; y < G; y++) { const hw = Math.round(2 + ((y - G + 74) / 74) * 6); r.P(160 - hw, y, STEEL[2]); r.P(160 + hw, y, STEEL[3]); if (y % 6 === 0) r.R(160 - hw, y, hw * 2 + 1, 1, STEEL[2]); else r.P(160 + ((y % 6) - 3) * Math.round(hw / 3), y, STEEL[2]); }
      r.R(155, G - 58, 3, 4, STEEL[1]); r.R(163, G - 50, 3, 4, STEEL[1]); r.R(160, G - 84, 1, 10, STEEL[2]); r.E(159, G - 85, 3, 1, LIT.red);
      for (let x = V0; x < V0 + VW; x++) { if ((x & 7) === 0) r.R(x, G - 10, 1, 10, STEEL[2]); if (((x + G) & 1) === 0) { r.P(x, G - 9 + (x & 3), STEEL[3]); r.P(x, G - 5 + ((x >> 1) & 3), STEEL[3]); } }
      r.R(V0, G - 10, VW, 1, STEEL[1]);
    },
    (r, L) => {
      teaHill(r, -60, 20, 90, 71); teaHill(r, 280, 26, 110, 73); teaHill(r, 118, 34, 110, 75);
      for (let k = 0; k < 7; k++) { const x = k % 2 ? 118 : 106, y = G - 4 - k * 4; r.R(x, y, 12, 2, STONE[1]); r.R(x, y, 12, 1, STONE[0]); }
      candi(r, 118, G - 32);
      for (const [x, y] of [[92, G - 12], [104, G - 20], [134, G - 22], [146, G - 14]]) { r.R(x, y, 1, 5, STONE[3]); r.E(x - 1, y - 2, 3, 2, LIT.warm); r.G(x, y - 1, 5, 4, "#ffc060", 0.35); }
      // A candi bentar: a split gate whose inner faces are cut clean.
      for (const d of [-1, 1]) {
        const inner = d < 0 ? 160 : 166, edge = d < 0 ? inner - 1 : inner;
        for (let k = 0; k < 5; k++) { const w = 10 - Math.round(k * 1.6); box(r, d < 0 ? inner - w : inner, G - 4 - k * 4, w, 4, STONE); }
        r.R(d < 0 ? inner - 2 : inner, G - 24, 2, 4, STONE[1]); r.P(edge, G - 25, STONE[0]);
        r.R(edge, G - 20, 1, 18, d < 0 ? STONE[2] : STONE[0]);
      }
      r.D(V0, G - 16, VW, 16, L.fog, (x, y) => (y - G + 16) / 30, true);
    },
    (r, L) => {
      lake(r, L, 91);
      for (let x = 140; x < 200; x++) { r.R(x, G - 19, 1, 2, x % 4 ? WOOD[1] : WOOD[2]); if (x % 12 === 0) { r.R(x, G - 17, 2, 8, WOOD[3]); r.A(x, G - 8, "#3a2a2a", 0.5); } }
      r.R(140, G - 19, 60, 1, WOOD[0]); for (let x = 140; x < 200; x += 2) r.A(x, G - 15, "#3a2a2a", 0.35);
      const bx = 70; r.R(bx, G - 12, 16, 2, WOOD[2]); r.R(bx + 1, G - 10, 14, 1, WOOD[3]); r.R(bx - 1, G - 13, 3, 1, WOOD[1]); r.R(bx + 14, G - 13, 3, 1, WOOD[1]); r.R(bx + 6, G - 20, 1, 7, WOOD[3]);
      for (let x = bx; x < bx + 16; x += 2) r.A(x, G - 8, "#3a2a2a", 0.4);
      for (let x = V0; x < V0 + VW; x += 3) if (hash(x, 2, 93) > 0.55) { const h = 4 + Math.floor(hash(x, 3, 93) * 6); r.R(x, G - h, 1, h, LEAF[2]); r.P(x, G - h, LEAF[1]); }
    },
    (r) => {
      box(r, 60, G - 40, 100, 40, WALLS[2]);
      r.R(56, G - 44, 108, 4, GENTENG[3]); roof(r, 58, G - 52, 104, 8, false); roof(r, 86, G - 58, 48, 6, false);
      for (let k = 0; k < 7; k++) { const x = 64 + k * 14; box(r, x, G - 36, 4, 30, STONE); if (k < 6) { r.R(x + 5, G - 34, 8, 24, "#2d3a52"); for (let y = G - 32; y < G - 11; y += 4) for (let b = x + 5; b < x + 13; b += 1) r.P(b, y + (b % 2), ["#e08a6a", "#7ab8d8", "#f0d070", "#8ad0a0", "#c8a0d8"][Math.floor(hash(b, y, 101) * 5)]); } }
      r.R(56, G - 6, 108, 2, STONE[1]); r.R(52, G - 4, 116, 4, STONE[2]); r.R(52, G - 4, 116, 1, STONE[0]);
      tree(r, 24, G, 22, LEAF, 105); for (let x = 12; x < 38; x += 3) r.R(x, G - 24 + (x % 5), 1, 10 + (x % 7), WOOD[2]);
      tree(r, 196, G, 18, LEAF, 107); tree(r, -70, G, 16, LEAF, 109); tree(r, 280, G, 20, LEAF, 111);
    },
    (r) => {
      const deck = G - 54;
      for (let x = V0 + 36; x < V0 + VW; x += 64) { box(r, x, deck + 6, 7, G - deck - 6, CONCRETE); r.R(x - 3, deck + 6, 13, 3, CONCRETE[1]); r.R(x - 3, deck + 8, 13, 1, CONCRETE[3]); r.R(x + 7, deck + 9, 3, G - deck - 9, "#4a4a58"); }
      r.R(V0, deck, VW, 6, CONCRETE[1]); r.R(V0, deck, VW, 1, CONCRETE[0]); r.R(V0, deck + 4, VW, 2, CONCRETE[3]);
      r.R(V0, deck - 3, VW, 3, STEEL[1]); r.R(V0, deck - 3, VW, 1, STEEL[0]);
      for (let x = V0; x < V0 + VW; x += 6) r.R(x, deck - 3, 1, 3, STEEL[2]);
      for (let x = V0 + 10; x < V0 + VW; x += 40) { r.R(x, deck - 22, 1, 19, STEEL[2]); r.R(x, deck - 22, 5, 1, STEEL[2]); r.R(x + 3, deck - 21, 3, 1, STEEL[1]); r.P(x + 4, deck - 21, "#fff3d0"); }
      for (let x = V0; x < V0 + VW; x += 4) if (hash(x, 5, 121) > 0.5) blob(r, x, G - 2, 3, LEAF, x);
    },
    (r) => {
      const sea = G - 28;
      for (let y = sea; y < G; y++) {
        const k = (y - sea) / 28, c = k < 0.25 ? WATER[0] : k < 0.55 ? WATER[1] : k < 0.85 ? WATER[2] : WATER[1];
        r.R(V0, y, VW, 1, c);
        for (let x = V0; x < V0 + VW; x++) if (hash(x >> 1, y, 131) > 0.9) r.R(x, y, 2 + (y - sea) / 8, 1, k < 0.3 ? "#e8f6fb" : WATER[0]);
      }
      for (let x = V0; x < V0 + VW; x++) { const f = 2 + Math.round(vnoise(x / 5, 1, 133) * 2); r.R(x, G - f, 1, f, C.foam); r.P(x, G - f - 1, hash(x, 2, 133) > 0.5 ? "#ffffff" : WATER[0]); }
      for (const [x, h, l] of [[-80, 36, 1], [40, 42, -1], [176, 38, 1], [300, 44, -1]]) palm(r, x, G - 1, h, l);
    },
    (r) => {
      const gx = 14;
      box(r, gx, G - 74, 36, 74, GLASS); for (let y = G - 70; y < G; y += 4) r.R(gx + 2, y, 32, 1, GLASS[2]);
      for (let x = gx + 4; x < gx + 34; x += 5) r.R(x, G - 72, 1, 72, GLASS[2]); for (let k = 0; k < 40; k++) r.P(gx + 2 + ((k * 7 + (k >> 2)) % 31), G - 70 + k * 2, GLASS[0]);
      r.R(gx + 4, G - 80, 28, 6, GLASS[2]); r.R(gx + 18, G - 90, 1, 10, STEEL[2]);
      for (const [x, n] of [[150, 4], [258, 5]]) for (let k = 0; k < n; k++) {
        const ux = x + k * 14, h = 22 + (k % 2) * 6, wall = WALLS[(k + x) % 4];
        box(r, ux, G - h, 14, h, wall); r.R(ux + 2, G - 9, 10, 9, STEEL[2]); for (let y = G - 8; y < G; y += 2) r.R(ux + 2, y, 10, 1, STEEL[1]);
        r.R(ux + 3, G - h + 4, 8, 5, "#34445e"); r.R(ux + 3, G - h + 4, 8, 1, GLASS[1]); box(r, ux + 9, G - h + 10, 4, 3, CONCRETE);
        r.R(ux + 1, G - h - 3, 12, 3, ["#e07a5a", "#6ab0d0", "#f0c060", "#7cc08a"][(k + x) % 4]); r.R(ux + 1, G - h - 1, 12, 1, wall[3]);
      }
      const mx = 112;
      r.R(mx - 26, G - 4, 52, 4, STONE[1]); r.R(mx - 26, G - 4, 52, 1, STONE[0]);
      r.R(mx - 9, G - 12, 18, 8, STONE[1]); r.R(mx - 9, G - 12, 1, 8, STONE[0]); r.R(mx + 7, G - 12, 2, 8, STONE[2]);
      r.R(mx - 16, G - 16, 32, 4, STONE[0]); r.R(mx - 14, G - 13, 28, 1, STONE[2]); r.R(mx - 12, G - 17, 24, 1, STONE[1]);
      for (let y = G - 72; y < G - 16; y++) { const hw = 1 + Math.round(((y - G + 72) / 56) * 2.5); r.R(mx - hw, y, hw * 2 + 1, 1, "#f0ece0"); r.P(mx - hw, y, "#ffffff"); r.P(mx + hw, y, STONE[2]); }
      r.R(mx - 3, G - 75, 7, 3, STONE[1]); r.E(mx - 2, G - 81, 5, 6, C.sun2); r.E(mx - 1, G - 83, 3, 3, C.sun); r.E(mx, G - 85, 1, 2, "#fff2b0");
      for (const x of [mx - 22, mx + 22]) tree(r, x, G - 2, 9, LEAF, x);
      for (let y = G - 96; y < G; y++) { r.P(222, y, STEEL[1]); r.P(225, y, STEEL[2]); if (y % 4 === 0) r.R(222, y, 4, 1, STEEL[2]); else r.P(222 + (y % 4), y, STEEL[2]); }
      r.R(196, G - 96, 60, 2, "#e0b43a"); for (let x = 196; x < 256; x += 3) r.P(x, G - 94, "#a8842a"); r.R(198, G - 94, 8, 5, CONCRETE[3]); r.R(248, G - 94, 1, 30, STEEL[3]); r.R(246, G - 64, 5, 3, "#e0b43a");
    },
  ];

  // ---- front: near things, walkway and strata ------------------------------------------
  // The walkway is a band seen a little from above (rows G - 3 to G + 3) with
  // a dark lip under it; the cut below shows strata, stones and what is buried.
  function walkway(r, x0, x1, fn) {
    for (let y = 0; y < 7; y++) for (let x = x0; x < x1; x++) r.P(x, G - 3 + y, fn(x, y));
  }
  // A sub-base (gravel under paving, topsoil elsewhere), then soil in wavy
  // bands with clay lenses, rocks lit from the upper left and dark specks.
  function strata(r, x0, x1, m, seed, sub) {
    const top = G + 4;
    for (let x = x0; x < x1; x++) {
      const b = [top + 3 + Math.round(vnoise(x / 9, 1, seed) * 2), top + 10 + Math.round(vnoise(x / 17, 2, seed) * 4), top + 17 + Math.round(vnoise(x / 11, 3, seed) * 3)];
      r.P(x, top, m[3]);
      for (let y = top + 1; y < H; y++) {
        if (y < b[0]) { r.P(x, y, sub ? sub[hash(x, y, seed) > 0.55 ? 0 : 1] : hash(x, y, seed) > 0.8 ? m[1] : m[0]); continue; }
        const k = y < b[1] ? 1 : y < b[2] ? 2 : 3;
        r.P(x, y, (k < 3 && b[k] - y === 1 && bayer(x, y) < 0.5) || hash(x, y, seed + 1) > 0.94 ? m[Math.min(3, k + 1)] : m[k]);
      }
    }
    for (let k = 0; k < (x1 - x0) / 7; k++) {
      const px = x0 + Math.floor(hash(k, 1, seed) * (x1 - x0)), py = top + 5 + Math.floor(hash(k, 2, seed) * (H - top - 8)), q = hash(k, 3, seed);
      if (q > 0.82) { r.R(px, py, 5, 3, STONE[2]); r.R(px + 1, py - 1, 3, 1, STONE[1]); r.P(px + 1, py, STONE[0]); r.R(px + 1, py + 3, 5, 1, m[3]); r.P(px + 4, py + 2, STONE[3]); }
      else if (q > 0.6) { r.R(px, py, 7, 1, m[0]); r.R(px + 2, py + 1, 4, 1, m[0]); r.P(px + 1, py - 1, m[1]); }
      else { r.R(px, py, q > 0.3 ? 2 : 1, 1, STONE[2]); r.P(px, py, STONE[1]); }
    }
  }
  // A buried pipe from xa to xb with collars and a riser up to the walkway.
  function pipe(r, xa, xb, y, m) {
    r.R(xa, y, xb - xa, 1, m[0]); r.R(xa, y + 1, xb - xa, 2, m[1]); r.R(xa, y + 3, xb - xa, 1, m[2]);
    for (let x = xa + 9; x < xb - 3; x += 22) { r.R(x, y - 1, 2, 6, m[2]); r.P(x, y - 1, m[0]); }
    r.R(xa, G + 4, 4, y - G - 4, m[1]); r.R(xa, G + 4, 1, y - G - 4, m[0]); r.R(xa + 3, G + 4, 1, y - G - 3, m[2]);
    r.R(xb - 1, y - 1, 2, 6, m[2]);
  }
  // Grass blades over the walkway's back edge, a few with a flower.
  function tufts(r, x0, x1, seed) {
    for (let x = x0; x < x1; x++) {
      if (hash(x, 1, seed) < 0.62) continue;
      const h = 1 + Math.floor(hash(x, 2, seed) * 3);
      r.R(x, G - 3 - h, 1, h, hash(x, 3, seed) > 0.5 ? LEAF[1] : LEAF[2]); r.P(x, G - 3 - h, LEAF[0]);
      if (hash(x, 4, seed) > 0.9) r.P(x, G - 4 - h, ["#ffa9c8", "#ffe375", "#ffffff", "#c8a0ff"][Math.floor(hash(x, 5, seed) * 4)]);
    }
  }
  function roots(r, x0, x1, seed) {
    for (let k = 0; k < (x1 - x0) / 14; k++) {
      let x = x0 + Math.floor(hash(k, 5, seed) * (x1 - x0));
      for (let y = G + 5; y < G + 10 + hash(k, 6, seed) * 10; y++) { r.P(x, y, SOIL[3]); if (hash(x, y, seed) > 0.6) x += hash(y, k, seed) > 0.5 ? 1 : -1; }
    }
  }
  function lamp(r, x, lit) {
    r.R(x, G - 40, 2, 38, STEEL[2]); r.R(x, G - 40, 1, 38, STEEL[1]); r.R(x - 1, G - 4, 4, 2, STEEL[3]);
    r.R(x - 3, G - 42, 8, 2, STEEL[3]); r.R(x - 2, G - 40, 6, 1, lit ? LIT.warm : STEEL[1]);
    if (lit) { r.G(x + 1, G - 3, 12, 3, "#ffd28a", 0.5); r.G(x + 1, G - 30, 7, 10, "#ffe0a0", 0.18); }
  }
  function hedge(r, x, w, h) {
    for (let k = 0; k < w; k++) for (let j = 0; j < h; j++) r.P(x + k, G - 2 - h + j, j === 0 ? (hash(x + k, j, 5) > 0.4 ? LEAF[0] : LEAF[1]) : hash(x + k, j, 6) > 0.72 ? LEAF[3] : j > h - 3 ? LEAF[2] : LEAF[1]);
    r.R(x + w - 1, G - 2 - h, 1, h, LEAF[3]);
  }
  // A warung: bamboo posts, a thatched roof, a counter with tins of kerupuk.
  function warung(r, x) {
    r.R(x, G - 24, 2, 22, C.bamboo2); r.R(x + 26, G - 24, 2, 22, C.bamboo2); r.P(x, G - 24, C.bamboo);
    for (let j = 0; j < 7; j++) {
      const X = x - 4 + Math.round(j * 0.9), W = 36 - Math.round(j * 1.8);
      for (let k = 0; k < W; k++) r.P(X + k, G - 32 + j, (k + j * 2) % 3 === 0 ? WOOD[2] : j < 2 ? C.bamboo : C.bamboo2);
    }
    for (let k = 0; k < 36; k += 2) r.P(x - 4 + k, G - 25 + (k % 4 === 0 ? 1 : 0), WOOD[2]);
    box(r, x + 2, G - 11, 24, 9, WOOD); r.R(x + 2, G - 11, 24, 1, WOOD[0]);
    for (let k = 0; k < 4; k++) { r.R(x + 4 + k * 5, G - 16, 4, 5, "#cfe8ee"); r.R(x + 4 + k * 5, G - 16, 4, 1, C.red); r.P(x + 5 + k * 5, G - 14, "#f0d070"); }
    r.R(x + 2, G - 23, 24, 3, "#3f78b0"); r.R(x + 2, G - 21, 24, 1, "#2c5a8c");
  }
  const FRONT = [
    (r, x0, x1, spot) => {
      walkway(r, x0, x1, (x, y) => y === 0 ? ASPHALT[1] : y === 6 ? ASPHALT[3] : hash(x, y, 201) > 0.86 ? ASPHALT[1] : hash(x, y, 202) > 0.9 ? ASPHALT[3] : ASPHALT[2]);
      strata(r, x0, x1, SOIL, 203, ["#5c5f6a", "#484b56"]); pipe(r, 68, 176, G + 13, BRICK);
      r.R(66, G - 1, 8, 3, "#1b1e2a"); for (let x = 67; x < 74; x += 2) r.R(x, G - 1, 1, 3, STEEL[2]);
      for (let k = 0; k < 9; k++) {
        const px = x0 + 10 + Math.floor(hash(k, 1, 205) * (x1 - x0 - 30)), w = 8 + Math.floor(hash(k, 2, 205) * 14), y = G - 1 + (k % 3);
        r.R(px + 1, y, w - 2, 1, "#58607a"); r.R(px, y + 1, w, 1, "#4a5270"); r.R(px + 2, y, 3, 1, "#8a94b4");
        spot.puddles.push([px, y, w]);
      }
      terrace(r, -66, 44, spot);
      for (const [x, s] of [[50, 5], [58, 4]]) { r.R(x, G - 6, 5, 4, BRICK[1]); r.R(x, G - 6, 5, 1, BRICK[0]); blob(r, x + 2, G - 7 - s, s, LEAF, x); }
      r.R(98, G - 6, 3, 3, "#1b1e2a"); r.R(116, G - 6, 3, 3, "#1b1e2a");
      rows(7).slice(0, 7).forEach((hw, k) => r.R(108 - hw - 3, G - 14 + k, hw * 2 + 6, 1, k < 2 ? "#6a9ed0" : k < 5 ? "#3f78b0" : "#2c5a8c"));
      r.R(101, G - 8, 3, 2, C.orange2);
      for (let x = 124; x < 150; x += 6) { box(r, x, G - 16, 6, 14, CONCRETE); r.R(x + 2, G - 13, 2, 2, "#262a3a"); r.R(x + 2, G - 8, 2, 2, "#262a3a"); }
      r.R(124, G - 18, 26, 2, CONCRETE[0]);
      r.R(166, G - 60, 2, 58, CONCRETE[2]); r.R(166, G - 60, 1, 58, CONCRETE[1]); r.R(162, G - 56, 10, 1, STEEL[3]);
      box(r, 163, G - 30, 8, 9, STEEL); r.E(165, G - 27, 3, 2, LIT.led); cable(r, 168, G - 56, 214, G - 64, 5, "#171a28");
    },
    (r, x0, x1) => {
      walkway(r, x0, x1, (x, y) => y === 0 ? CONCRETE[0] : y === 3 ? CONCRETE[2] : y === 6 ? CONCRETE[3] : (x + (y > 3 ? 3 : 0)) % 6 === 0 ? CONCRETE[2] : hash(Math.floor((x + (y > 3 ? 3 : 0)) / 6), y > 3 ? 1 : 0, 211) > 0.5 ? CONCRETE[1] : "#bab8ad");
      strata(r, x0, x1, SOIL, 213, ["#8a8a88", "#6e6e70"]);
      for (const [y, m] of [[G + 10, ["#ffb36a", "#e87a2a", "#a8501e"]], [G + 15, ["#8ac8f0", "#3f8ac8", "#255e94"]]]) { r.R(x0, y, x1 - x0, 1, m[0]); r.R(x0, y + 1, x1 - x0, 2, m[1]); r.R(x0, y + 3, x1 - x0, 1, m[2]); }
      box(r, 96, G + 4, 16, 18, CONCRETE); r.R(98, G + 6, 12, 14, "#23262e"); r.R(100, G + 11, 8, 6, STEEL[2]); r.E(106, G + 12, 1, 1, LIT.led); r.R(95, G - 2, 18, 2, STEEL[3]); r.R(96, G - 2, 16, 1, STEEL[1]);
      lamp(r, 46, true); lamp(r, 166, true);
      box(r, 60, G - 18, 10, 16, STEEL); r.R(62, G - 15, 6, 1, STEEL[2]); r.R(62, G - 12, 6, 1, STEEL[2]); r.E(66, G - 16, 1, 1, LIT.led);
      for (let x = 84; x < 150; x += 16) { r.R(x, G - 8, 3, 6, STEEL[2]); r.R(x, G - 8, 3, 1, STEEL[0]); r.P(x, G - 7, "#ffcf3a"); }
      for (let x = 120; x < 158; x++) { if ((x & 3) === 0) r.R(x, G - 14, 1, 12, STEEL[2]); } r.R(120, G - 14, 38, 1, STEEL[1]); r.R(120, G - 9, 38, 1, STEEL[2]);
    },
    (r, x0, x1) => {
      walkway(r, x0, x1, (x, y) => {
        const st = y >= 2 && y <= 5 && x % 11 < 8 && hash(Math.floor(x / 11), 1, 221) > 0.25;
        if (y === 6) return SOIL[2];
        if (st) return y === 2 ? STONE[0] : x % 11 === 7 || y === 5 ? STONE[3] : x % 11 === 0 ? STONE[0] : hash(x, y, 222) > 0.85 ? "#6a8a4a" : STONE[1];
        return hash(x, y, 223) > 0.72 ? LEAF[0] : hash(x, y, 224) > 0.75 ? LEAF[3] : y < 3 ? LEAF[1] : LEAF[2];
      });
      tufts(r, x0, x1, 225); strata(r, x0, x1, SOIL, 223); roots(r, x0, x1, 224);
      for (const x of [46, 166]) { box(r, x - 3, G - 18, 7, 16, STONE); r.R(x - 4, G - 20, 9, 2, STONE[2]); r.R(x - 2, G - 15, 5, 4, "#2a2238"); r.E(x - 1, G - 14, 3, 2, LIT.warm); r.G(x, G - 12, 9, 8, "#ffc060", 0.35); }
      for (let k = 0; k < 7; k++) { const x = 58 + k * 2; r.R(x, G - 34 + (k % 3) * 3, 1, 32 - (k % 3) * 3, k % 2 ? C.bamboo2 : C.bamboo); for (let y = G - 30; y < G; y += 6) r.P(x, y + k, "#7a6a3a"); }
      for (let k = 0; k < 10; k++) { const x = 55 + Math.floor(hash(k, 1, 225) * 20), y = G - 36 + Math.floor(hash(k, 2, 225) * 20); r.R(x, y, 4, 1, LEAF[1]); r.P(x + 3, y + 1, LEAF[2]); }
      for (const x of [88, 150]) for (let k = -5; k <= 5; k++) r.R(x + k, G - 2 - (5 - Math.abs(k)) + (k & 1), 1, 5 - Math.abs(k), Math.abs(k) < 2 ? LEAF[1] : LEAF[2]);
      for (const [x, w] of [[120, 6], [176, 5]]) { r.R(x, G - 4, w, 3, STONE[2]); r.R(x + 1, G - 5, w - 2, 1, STONE[1]); r.P(x + 1, G - 4, STONE[0]); }
    },
    (r, x0, x1) => {
      walkway(r, x0, x1, (x, y) => y === 6 ? WOOD[3] : x % 4 === 3 ? WOOD[3] : y === 0 ? WOOD[0] : (y === 1 || y === 5) && x % 4 === 1 ? "#5a4a3a" : hash(x >> 2, 1, 231) > 0.5 ? WOOD[1] : WOOD[2]);
      for (let y = G + 4; y < H; y++) for (let x = x0; x < x1; x++) r.P(x, y, y > H - 5 ? (hash(x, y, 233) > 0.6 ? STONE[2] : "#3f5a52") : bayer(x, y) < (y - G - 4) / 22 ? WATER[3] : WATER[2]);
      for (let x = x0; x < x1; x++) if (x % 24 === 5) { r.R(x, G + 4, 2, H - G - 6, WOOD[3]); r.P(x, G + 4, WOOD[2]); }
      for (let x = x0 + 4; x < x1; x += 7) if (hash(x, 3, 235) > 0.5) r.R(x, G + 8 + Math.floor(hash(x, 4, 235) * 10), 3, 1, "#8ac8e0");
      for (let x = x0; x < x1; x++) { if (x % 16 === 0) { r.R(x, G - 9, 2, 7, WOOD[2]); r.P(x, G - 9, WOOD[0]); } } r.R(x0, G - 9, x1 - x0, 1, WOOD[1]); r.R(x0, G - 8, x1 - x0, 1, WOOD[3]);
      for (const [a, n] of [[44, 5], [156, 6]]) for (let k = 0; k < n; k++) { const x = a + k * 2 + (k % 2), h = 12 + Math.floor(hash(k, a, 237) * 10); r.R(x, G - 2 - h, 1, h, k % 3 ? LEAF[2] : LEAF[1]); if (k % 3 === 0) { r.R(x, G - 2 - h, 2, 3, WOOD[2]); r.P(x, G - 2 - h, WOOD[1]); } }
    },
    (r, x0, x1) => {
      walkway(r, x0, x1, (x, y) => { if (y === 6) return BRICK[3]; if (y === 0) return BRICK[0]; const hb = ((x >> 2) + (y >> 1)) % 2 === 0; const e = hb ? (x & 3) === 3 : (y & 1) === 1 && ((x + 2) & 3) === 0; return e ? BRICK[3] : hash(x >> 2, y >> 1, 241) > 0.6 ? BRICK[0] : BRICK[1]; });
      strata(r, x0, x1, SOIL, 243, ["#9a9690", "#7a7672"]); pipe(r, 24, 128, G + 15, CONCRETE); tufts(r, 84, 98, 244);
      hedge(r, 52, 30, 9); hedge(r, 150, 26, 8);
      r.R(100, G - 9, 16, 2, WOOD[1]); r.R(100, G - 13, 16, 1, WOOD[1]); r.R(100, G - 12, 16, 1, WOOD[3]); r.R(101, G - 7, 1, 5, STEEL[3]); r.R(114, G - 7, 1, 5, STEEL[3]);
      r.R(46, G - 38, 2, 36, STEEL[3]); r.R(44, G - 42, 6, 4, STEEL[2]); r.R(45, G - 41, 4, 2, "#f0ecd8");
      for (let k = 0; k < 3; k++) { r.R(124 + k * 6, G - 9, 1, 7, STEEL[2]); } r.R(124, G - 9, 13, 1, STEEL[1]);
      rows(3).forEach((hw, k) => { r.P(128 - hw, G - 8 + k, STEEL[3]); r.P(128 + hw, G - 8 + k, STEEL[3]); r.P(138 - hw, G - 8 + k, STEEL[3]); r.P(138 + hw, G - 8 + k, STEEL[3]); });
      r.R(129, G - 9, 9, 1, C.red); r.R(132, G - 11, 1, 3, C.red); r.R(136, G - 11, 2, 1, STEEL[3]);
    },
    (r, x0, x1) => {
      walkway(r, x0, x1, (x, y) => y === 0 ? CONCRETE[1] : y === 1 ? "#f2f0e6" : y === 6 ? ASPHALT[3] : y === 4 && x % 12 < 6 ? "#f2f0e6" : hash(x, y, 251) > 0.85 ? ASPHALT[1] : hash(x, y, 252) > 0.92 ? ASPHALT[3] : ASPHALT[2]);
      strata(r, x0, x1, ["#9a8f80", "#7c7266", "#5e564e", "#433d38"], 253, ["#3a3d48", "#4a4e5a"]);
      for (let x = x0; x < x1; x++) { if (x % 10 === 0) r.R(x, G - 12, 2, 10, STEEL[2]); } r.R(x0, G - 12, x1 - x0, 3, STEEL[1]); r.R(x0, G - 12, x1 - x0, 1, STEEL[0]); r.R(x0, G - 10, x1 - x0, 1, STEEL[2]);
      for (let x = x0 - (x0 % 10); x < x1; x += 10) for (let k = 0; k < 7; k++) r.A(x + 2 + k, G - 1 + (k >> 2), "#2a1a10", 0.35);
      for (const x of [150, 174]) for (let k = 0; k < 16; k++) r.A(x + 2 + k, G - 1 + (k >> 3), "#2a1a10", 0.4);
      box(r, 62, G - 14, 4, 12, WALLS[2]); r.R(62, G - 14, 4, 3, C.red); for (let k = 0; k < 6; k++) r.A(66 + k, G - 1, "#2a1a10", 0.35);
      r.R(150, G - 40, 2, 38, STEEL[2]); r.R(174, G - 40, 2, 38, STEEL[2]);
      box(r, 146, G - 52, 34, 16, ["#3f9a6a", "#1f7a4c", "#155e3a", "#0e4228"]); r.R(148, G - 50, 30, 1, "#e8f0e0"); r.R(148, G - 39, 30, 1, "#e8f0e0");
      r.P(153, G - 48, "#e8f0e0"); r.R(152, G - 47, 3, 1, "#e8f0e0"); r.R(151, G - 46, 5, 1, "#e8f0e0"); r.R(153, G - 45, 1, 4, "#e8f0e0");
      for (const y of [G - 48, G - 43]) for (let x = 159; x < 177; x++) if ((x - 159) % 6 !== 5) for (let j = 0; j < 3; j++) if (hash(x, y + j, 256) > 0.4) r.P(x, y + j, "#e8f0e0");
      for (let x = 60; x < 140; x += 24) r.G(x, G - 1, 10, 2, "#1e1a14", 0.25);
    },
    (r, x0, x1) => {
      walkway(r, x0, x1, (x, y) => y === 6 ? SAND[3] : y === 0 ? SAND[0] : hash(x, y, 261) > 0.93 ? (hash(x, y, 262) > 0.5 ? "#ffffff" : C.rose) : bayer(x, y) < 0.2 + (y / 6) * 0.3 ? SAND[2] : SAND[1]);
      strata(r, x0, x1, SAND.slice(1).concat(["#8a7050"]), 263);
      for (let k = 0; k < 8; k++) { const x = x0 + Math.floor(hash(k, 3, 265) * (x1 - x0)), y = G + 8 + Math.floor(hash(k, 4, 265) * 14); r.R(x, y, 2, 1, "#fff4e0"); r.P(x + 1, y + 1, C.rose); }
      palm(r, 46, G - 2, 44, 1); warung(r, 146);
      r.R(72, G - 26, 1, 24, WOOD[3]); rows(9).slice(0, 5).forEach((hw, k) => { for (let d = -hw; d <= hw; d++) r.P(72 + d, G - 30 + k, ((d + 20) >> 2) % 2 ? C.red : "#f3f1e6"); });
      for (const x of [94, 112]) r.R(x, G - 22, 1, 20, WOOD[2]); for (let y = G - 20; y < G - 6; y++) for (let x = 95; x < 112; x++) if ((x + y) % 3 === 0 || (x - y) % 3 === 0) r.P(x, y + Math.round(Math.sin((x - 95) / 5.4) * 1), "#8a9aa0");
      const jx = 120; r.R(jx, G - 7, 28, 2, C.orange); r.R(jx + 1, G - 5, 26, 2, C.blue2); r.R(jx, G - 8, 28, 1, "#f3f1e6"); r.R(jx + 22, G - 9, 5, 1, C.orange2); r.P(jx + 24, G - 7, C.ink);
      r.R(jx - 2, G - 10, 32, 1, C.bamboo); r.R(jx + 5, G - 10, 1, 7, C.bamboo2); r.R(jx + 22, G - 10, 1, 7, C.bamboo2); r.R(jx - 2, G - 3, 32, 1, C.bamboo);
    },
    (r, x0, x1) => {
      walkway(r, x0, x1, (x, y) => y === 0 ? CONCRETE[0] : y === 2 || y === 3 ? ((x % 3 === 1 && y === 2) ? "#b89020" : "#e6c23a") : (x % 5 === 0 ? CONCRETE[2] : CONCRETE[1]));
      strata(r, x0, x1, SOIL, 273, ["#8a8a88", "#6e6e70"]);
      r.R(x0, G + 4, x1 - x0, 3, "#2a2a30"); for (let x = x0; x < x1; x += 8) r.R(x, G + 4, 4, 3, "#ecebe2"); pipe(r, 30, 214, G + 12, ["#c8ccd0", "#9aa0a6", "#6a7076"]);
      for (const [k, c] of [[0, "#2a2a30"], [1, "#e87a2a"], [2, "#2a2a30"]]) for (let x = x0; x < x1; x++) r.P(x, G + 19 + k + Math.round(vnoise(x / 24, k, 277) * 2), c);
      lamp(r, 46, false); lamp(r, 166, false);
      for (const x of [62, 150]) { box(r, x - 6, G - 7, 12, 5, CONCRETE); tree(r, x, G - 7, 16, LEAF, x); }
      box(r, 88, G - 30, 34, 2, STEEL); r.R(89, G - 28, 1, 26, STEEL[2]); r.R(120, G - 28, 1, 26, STEEL[2]);
      r.R(92, G - 26, 12, 16, "#dfe8ec"); r.R(93, G - 25, 10, 14, "#b8d8e8"); r.R(106, G - 10, 12, 2, WOOD[2]);
      for (let k = 0; k < 6; k++) { r.R(94 + k, G - 14 - k * 2, 1, 2, "#eef7fb"); r.P(97 + k, G - 13 - k * 2, "#d4ebf4"); } r.R(93, G - 12, 10, 1, "#8fb8cc");
      for (let x = 128; x < 146; x += 6) { r.R(x, G - 7, 2, 5, "#2a2a30"); r.R(x, G - 7, 2, 1, "#ecebe2"); }
      for (let x = 236; x < 370; x += 30) { box(r, x, G - 6, 10, 4, CONCRETE); blob(r, x + 5, G - 8, 3, LEAF, x); }
    },
  ];

  // February's terrace: home at 01:50, a lit window, the clock, the eave.
  function terrace(r, x0, x1, spot) {
    const wall = WALLS[1], top = G - 44;
    box(r, x0, top, x1 - x0, 44, wall);
    for (let k = 0; k < 40; k++) r.P(x0 + 1 + Math.floor(hash(k, 1, 301) * (x1 - x0 - 2)), top + 2 + Math.floor(hash(k, 2, 301) * 40), wall[2]);
    // Rain has streaked the plaster under the eave; damp climbs from below.
    for (let x = x0 + 1; x < x1 - 2; x++) {
      const n = hash(x >> 1, 7, 301);
      if (n > 0.5) r.D(x, top + 3, 1, 5 + Math.floor(n * 18), wall[2], (xx, y) => 0.75 - (y - top) / 26);
    }
    r.D(x0, G - 17, x1 - x0, 11, wall[2], (x, y) => (y - G + 17) / 12 + (hash(x >> 2, 2, 302) - 0.5) * 0.3);
    for (const [cx, cy, n] of [[x0 + 43, G - 34, 5], [x0 + 16, G - 30, 4], [x0 + 78, G - 22, 6]]) for (let k = 0; k < n; k++) r.P(cx + ((k + 1) >> 1), cy - k, wall[3]);
    r.R(x0, G - 6, x1 - x0, 4, wall[3]); for (let x = x0; x < x1; x += 3) r.P(x, G - 7, "#5a8a5a");
    // The AC's outdoor unit on its bracket, under the eave.
    const ax = x0 + 86, ay = G - 41;
    box(r, ax, ay, 14, 9, CONCRETE); disk(r, ax + 4, ay + 4, 3, CONCRETE[3]);
    r.R(ax + 1, ay + 4, 7, 1, CONCRETE[2]); r.R(ax + 4, ay + 1, 1, 7, CONCRETE[2]); r.P(ax + 4, ay + 4, CONCRETE[0]);
    for (let y = ay + 2; y < ay + 8; y += 2) r.R(ax + 9, y, 3, 1, CONCRETE[2]);
    r.R(ax + 1, ay + 9, 12, 1, STEEL[3]); r.R(ax + 1, ay + 10, 1, 2, STEEL[3]); r.R(ax + 12, ay + 10, 1, 2, STEEL[3]);
    r.R(ax + 10, ay + 10, 1, 4, "#6a7280"); r.P(ax + 10, ay + 15, "#8ab0d8");
    r.R(x0 + 4, G - 26, 11, 24, WOOD[2]); r.R(x0 + 5, G - 25, 9, 23, WOOD[1]); r.P(x0 + 12, G - 14, C.sun2); r.R(x0 + 5, G - 25, 9, 1, WOOD[0]);
    r.R(x0 + 24, G - 34, 18, 14, WOOD[2]); r.E(x0 + 25, G - 33, 16, 12, LIT.warm); r.E(x0 + 25, G - 33, 4, 12, LIT.warm2); r.E(x0 + 37, G - 33, 4, 12, LIT.warm2);
    for (let x = x0 + 26; x < x0 + 41; x += 3) r.E(x, G - 33, 1, 12, "#8a5a2a");
    r.G(x0 + 33, G - 20, 18, 10, "#ffb860", 0.35); r.G(x0 + 33, G, 20, 3, "#ffc070", 0.5);
    r.R(x0 + 50, G - 36, 24, 11, C.ink); r.R(x0 + 51, G - 35, 22, 9, "#20141a");
    const t = P.text("01:50", "#ff5a3a", "#20141a", 1), q = t.getContext("2d").getImageData(0, 0, t.width, t.height).data;
    for (let y = 0; y < t.height; y++) for (let x = 0; x < t.width; x++) if (q[(y * t.width + x) * 4 + 3] && q[(y * t.width + x) * 4] > 200) r.E(x0 + 51 + x, G - 35 + y + 1, 1, 1, "#ff6a44");
    r.G(x0 + 62, G - 30, 14, 7, "#ff5030", 0.18);
    roof(r, x0 - 4, top - 10, x1 - x0 + 12, 10, true);
    r.R(x0 - 4, top, x1 - x0 + 12, 2, "#3a2a2a"); r.R(x0 - 4, top + 2, x1 - x0 + 12, 1, "#5a4a4a");
    for (let x = x0 - 2; x < x1 + 8; x += 5) spot.drips.push([x, top + 3]);
  }

  // ---- sky, clouds and the seam mask ----------------------------------------------------
  function sky(i) {
    const r = raster(SKY_W, G), st = SKY[i].map(P.pack), n = st.length - 1;
    for (let y = 0; y < G; y++) {
      const p = (y / (G - 1)) ** 1.15 * n, k = Math.min(n - 1, Math.floor(p)), q = Math.min(1, Math.max(0, (p - k - 0.35) / 0.5));
      for (let x = 0; x < SKY_W; x++) r.d[y * SKY_W + x] = bayer(x, y) < q ? st[k + 1] : st[k];
    }
    // February: a low deck of rain cloud lit orange from the city below.
    if (i === 0) r.D(0, 0, SKY_W, 64, "#252a42", (x, y) => (P.fbm(x / 34, y / 9, 7) - 0.36 - y / 150) * 2.4, true);
    if (i === 0) r.D(0, 8, SKY_W, 60, "#3a3450", (x, y) => (P.fbm(x / 26, y / 7, 9) - 0.5 - y / 160) * 2, true);
    // July: long thin streaks of cloud catching the gold.
    if (i === 5) for (let k = 0; k < 16; k++) {
      const x = Math.floor(hash(k, 1, 5) * SKY_W), y = 16 + Math.floor(hash(k, 2, 5) * 40), w = 14 + Math.floor(hash(k, 3, 5) * 44);
      r.E(x, y, w, 1, "#fbe8c0"); r.E(x + 5, y + 1, w - 12, 1, "#eccb98");
      r.D(x - 5, y, 5, 1, "#fbe8c0", 0.5, true); r.D(x + w, y, 6, 1, "#fbe8c0", 0.35, true);
    }
    return r.canvas();
  }
  // Cloud tints per month: lit rim, body, shade.
  const CLOUD = [
    ["#3a3a56", "#2a2d46", "#1e2136"], ["#2a3358", "#1f2746", "#161c36"], ["#9a78a6", "#735a8c", "#4e4070"],
    ["#ffd6b8", "#f2a8a6", "#bb7e9c"], ["#ffffff", "#e8f0f8", "#b6cae0"], ["#fff2cc", "#f6d6a6", "#d2a684"],
    ["#ffffff", "#edf5fb", "#bcd2e6"], ["#ffffff", "#e8eef4", "#b4c4d4"],
  ];
  const CLOUD_SHAPES = [[46, 13], [30, 10], [62, 16], [22, 8]];
  function cloud(w, h, seed, m) {
    const r = raster(w, h), puffs = [];
    for (let k = 0, n = Math.max(2, Math.round(w / 9)); k < n; k++) {
      const rad = Math.max(2, Math.round(h * (0.3 + hash(k, 1, seed) * 0.35)));
      puffs.push([Math.round(rad + ((w - 2 * rad) * (k + 0.5)) / n), h - 1 - rad, rad]);
    }
    // Lower puffs first, so each upper one lays its lit rim over the others.
    puffs.sort((a, b) => b[1] - a[1]).forEach(([cx, cy, rr]) => {
      for (let y = Math.max(0, cy - rr); y <= Math.min(h - 2, cy + rr); y++) for (let x = Math.max(0, cx - rr); x <= Math.min(w - 1, cx + rr); x++) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy > rr * rr + rr * 0.6) continue;
        const s = (dx + dy * 1.2) / rr, low = y >= h - 3;
        r.E(x, y, 1, 1, s < -0.8 && !low ? m[0] : (s > 0.5 && bayer(x, y) < (s - 0.35) * 1.4) || (low && bayer(x, y) < 0.6) ? m[2] : m[1]);
      }
    });
    return r.canvas();
  }
  // Opaque where the next month shows, along the same torn edge.
  function seamMask() {
    const r = raster(B * 2, G), v = P.pack("#ffffff");
    for (let y = 0; y < G; y++) for (let x = 0; x < B * 2; x++) if (bayer(x, y) < ramp(x, y, B * 2)) r.d[y * B * 2 + x] = v;
    return r.canvas();
  }

  // ---- build -------------------------------------------------------------------------------
  // geo: { H, GROUND, SEG, LEN, monthX(i), months }
  function build(geo) {
    H = geo.H; G = geo.GROUND; SEG = geo.SEG;
    const n = geo.months, spot = { puddles: [], drips: [] };
    const layer = (list, k) => list.slice(0, n).map((paint, i) => {
      const r = raster(VW, G, tone(i, k));
      r.ox = -V0;
      paint(r, LIGHT[i]);
      return r.canvas();
    });
    const front = raster(geo.LEN, H, null);
    for (let i = 0; i < n; i++) {
      front.tone(tone(i, 2));
      front.ox = geo.monthX(i);
      front.gate = i ? [geo.monthX(i) - B, geo.monthX(i) + B] : null;
      front.lim = i < n - 1 ? geo.monthX(i + 1) + B : geo.LEN;
      FRONT[i](front, i ? -B : -geo.monthX(0), i < n - 1 ? SEG + B : geo.LEN - geo.monthX(i), spot);
    }
    spot.puddles = spot.puddles.map(([x, y, w]) => [x + geo.monthX(0), y, w]);
    spot.drips = spot.drips.map(([x, y]) => [x + geo.monthX(0), y]);
    return {
      sky: SKY.slice(0, n).map((_, i) => sky(i)),
      clouds: CLOUD.slice(0, n).map((m, i) => CLOUD_SHAPES.map(([w, h], k) => cloud(w, h, 17 + k * 5, m))),
      far: layer(FAR, 0), mid: layer(MID, 1), front: front.canvas(), seam: seamMask(), spot,
    };
  }

  P.jscene = { build, raster, sprite, tone, mix, SKY, V0, B, SKY_W, WOOD, STEEL, STONE, BRICK, CONCRETE, GLASS, WALLS, LIT };
})((window.PETA = window.PETA || {}));
