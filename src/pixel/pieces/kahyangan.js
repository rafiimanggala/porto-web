// Senja di Kahyangan, bundled for the gallery by tools/build.mjs from ~/projects/pixel-kahyangan.
// Its modules get the private scope S instead of the page's global object. Do not edit by hand.
(globalThis.GALERI = globalThis.GALERI || {}).kahyangan = (function () {
  var S = {};
// pixel-kahyangan/src/pixel.js
// Tiny indexed-colour pixel engine for Senja di Kahyangan: a 480x270
// framebuffer of palette indices, ordered dithering, hash noise, baked layers
// and colour tables. Everything is a pure function, so a frame depends only on time.
(function (G) {
  var W = 480, H = 270, NONE = 255;
  var PALETTE = [
    // The eastern sky at sunset: deep blue overhead, lavender, the pink band, peach at the horizon.
    ["sk0", "#2b3a78"], ["sk1", "#34458a"], ["sk2", "#3f5299"], ["sk3", "#4d60a6"], ["sk4", "#5e6fb0"],
    ["sk5", "#7280b8"], ["sk6", "#8990c0"], ["sk7", "#a29dc4"], ["sk8", "#bda6c4"], ["sk9", "#d6afbf"],
    ["sk10", "#e8b8b8"], ["sk11", "#f2c4b2"], ["sk12", "#f6d2b6"],
    // The full moon rising, and its halo.
    ["mo0", "#c9a79e"], ["mo1", "#e6c9b8"], ["mo2", "#f8e6d4"], ["mo3", "#fff5ea"],
    // Far volcanoes: alpenglow on the upper slopes, lavender haze below.
    ["mt0", "#5c5b8f"], ["mt1", "#6f6a9e"], ["mt2", "#85729f"], ["mt3", "#a07b9e"], ["mt4", "#c08598"],
    ["mt5", "#db958f"], ["mt6", "#eeac93"], ["mt7", "#f7c7a4"],
    // The sea of clouds, in the shadow of the Earth, with pink on its highest tops.
    ["cs0", "#525a92"], ["cs1", "#636aa0"], ["cs2", "#767cad"], ["cs3", "#8a8eb9"], ["cs4", "#9fa1c4"],
    ["cs5", "#b4b3cd"], ["cs6", "#c8c3d6"], ["ct0", "#d9bccb"], ["ct1", "#ebc6c6"], ["ct2", "#f6d7c9"],
    // Wisps of cloud in the sky, lit pink from below by the setting sun.
    ["wp0", "#9a86b0"], ["wp1", "#c996ae"], ["wp2", "#efaeae"], ["wp3", "#fcd0b8"],
    // Floating rock: violet crevices up to golden sandstone, and an ochre stratum.
    ["rk0", "#2e2440"], ["rk1", "#45314f"], ["rk2", "#5e4057"], ["rk3", "#7a4f58"], ["rk4", "#96605a"],
    ["rk5", "#b3745c"], ["rk6", "#cc8c62"], ["rk7", "#e2a86f"], ["rk8", "#f2c486"],
    ["ro0", "#6b4a50"], ["ro1", "#8e6554"], ["ro2", "#b58658"], ["ro3", "#d8a864"], ["ro4", "#edc57c"],
    // The same rock in the shadow of the Earth, lit from below by the clouds.
    ["rs0", "#3a2d4c"], ["rs1", "#50416a"], ["rs2", "#665784"], ["rs3", "#7e6e9c"], ["rs4", "#9a88b4"],
    // Bamboo and young coconut leaf (janur) for the penjor.
    ["bb0", "#6e5c2c"], ["bb1", "#a88e46"], ["bb2", "#d8bd68"], ["jn0", "#9c9a4c"], ["jn1", "#cdc776"], ["jn2", "#f0e9a8"],
    // Grass and moss, and the banyan's leaves, gilded by the low sun.
    ["gr0", "#1f3a3a"], ["gr1", "#2c4f3e"], ["gr2", "#3d6a3e"], ["gr3", "#5a853c"], ["gr4", "#7f9d3e"],
    ["gr5", "#a9b44a"], ["gr6", "#d2c65c"],
    ["lf0", "#172a33"], ["lf1", "#213d3a"], ["lf2", "#2d553f"], ["lf3", "#3f6e40"], ["lf4", "#5d8a41"],
    ["lf5", "#88a547"], ["lf6", "#b9c05a"],
    // Frangipani flowers and bark.
    ["fl0", "#e8d7c8"], ["fl1", "#fff4e2"], ["fl2", "#ffd66e"], ["fl3", "#f4a9b8"],
    ["bk0", "#3a2c34"], ["bk1", "#5b4749"], ["bk2", "#85706a"], ["bk3", "#b09a88"],
    // Temple materials: red brick, cream paras stone, black andesite, ijuk thatch.
    ["br0", "#4a2230"], ["br1", "#6e2c30"], ["br2", "#9a3c33"], ["br3", "#c2553a"], ["br4", "#e27a4a"], ["br5", "#f39c62"],
    ["pa0", "#5c4c5a"], ["pa1", "#8a7478"], ["pa2", "#b89c90"], ["pa3", "#dcc0a4"], ["pa4", "#f3dcb8"], ["pa5", "#fff0d4"],
    ["an0", "#26222f"], ["an1", "#3c3644"], ["an2", "#58505a"], ["an3", "#7c6e70"],
    ["ij0", "#16121a"], ["ij1", "#241c24"], ["ij2", "#3a2a2c"], ["ij3", "#563c34"], ["ij4", "#7a5440"],
    // Wood, red lacquer and gold leaf.
    ["wd0", "#3a2224"], ["wd1", "#6a3a2c"], ["wd2", "#9a5a36"], ["wd3", "#c88450"],
    ["rd0", "#6a1420"], ["rd1", "#a82428"], ["rd2", "#e0463a"],
    ["go0", "#7a5418"], ["go1", "#b8862a"], ["go2", "#e8bd4a"], ["go3", "#fff08a"],
    // Cloth: white, yellow, pink and a blue sarong; skin and hair.
    ["wh0", "#c9bcc4"], ["wh1", "#f2e8e2"], ["ye1", "#f5c542"], ["ye2", "#ffe07a"], ["pn0", "#c86a8a"], ["pn1", "#f0a0b0"],
    ["bl0", "#3d4f9a"], ["sn0", "#5a3428"], ["sn1", "#8a5438"], ["sn2", "#b87a50"], ["hr", "#1c1418"],
    // Falling water, an egret's shade, fireflies and incense smoke.
    ["wt0", "#6a7cb0"], ["wt1", "#9fb8d8"], ["wt2", "#d8e8f0"], ["wt3", "#fff6e6"], ["wt4", "#ffd9a0"],
    ["eg0", "#a9a3c0"], ["ff0", "#c8f05a"], ["ff1", "#f6ff9a"], ["sm0", "#a79bb6"], ["sm1", "#d2c6d6"],
    ["wh", "#ffffff"], ["nk", "#0d0b12"],
    // The sky dragon's jade scales, from its dark outline to the last gold of the sun on them.
    ["dr0", "#0f1f2a"], ["dr1", "#173b45"], ["dr2", "#1f5b5a"], ["dr3", "#2c7d69"], ["dr4", "#4a9d72"],
    ["dr5", "#86bf7a"], ["dr6", "#cad98a"]
  ];
  var C = {};
  PALETTE.forEach(function (p, i) { C[p[0]] = i; });
  var RGB = PALETTE.map(function (p) {
    var v = parseInt(p[1].slice(1), 16);
    return [v >> 16, (v >> 8) & 255, v & 255];
  });
  var RGBA = new Uint32Array(RGB.map(function (c) {
    return (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;
  }));

  function fb() { return new Uint8Array(W * H); }
  function pset(f, x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c;
  }
  function rect(f, x, y, w, h, c) {
    var x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    var x1 = Math.min(W, Math.round(x + w)), y1 = Math.min(H, Math.round(y + h));
    for (var yy = y0; yy < y1; yy++) f.fill(c, yy * W + x0, yy * W + Math.max(x0, x1));
  }

  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function dith(x, y, a) { return a * 16 > BAYER[(y & 3) * 4 + (x & 3)] + 0.5; }
  function hash(a, b, c) {
    var h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mod(a, n) { return ((a % n) + n) % n; }
  function smooth(u) { return u * u * (3 - 2 * u); }
  function noise(x, seed, period) {
    var i = Math.floor(x), u = smooth(x - i), j = i + 1;
    if (period) { i = mod(i, period); j = mod(j, period); }
    return hash(i, seed, 7) * (1 - u) + hash(j, seed, 7) * u;
  }
  // 2D value noise, optionally periodic in x so a strip can wrap around.
  function noise2(x, y, seed, period) {
    var xi = Math.floor(x), yi = Math.floor(y), u = smooth(x - xi), v = smooth(y - yi);
    var x0 = xi, x1 = xi + 1;
    if (period) { x0 = mod(x0, period); x1 = mod(x1, period); }
    var a = hash(x0, yi, seed), b = hash(x1, yi, seed);
    var c = hash(x0, yi + 1, seed), d = hash(x1, yi + 1, seed);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }

  function names(list) {
    return list.map(function (n) {
      if (!(n in C)) throw new Error("pixel.js: unknown colour " + n);
      return C[n];
    });
  }
  function pick(ramp, v, x, y) {
    var l = (v < 0 ? 0 : v > 1 ? 1 : v) * (ramp.length - 1), i = Math.floor(l);
    return ramp[i < ramp.length - 1 && dith(x, y, l - i) ? i + 1 : i];
  }
  function lum(i) {
    var c = RGB[i];
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  }
  // The palette colour closest to an RGB value, by the "redmean" distance.
  function nearest(r, g, b) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < RGB.length; i++) {
      var c = RGB[i], rm = (c[0] + r) / 2, dr = c[0] - r, dg = c[1] - g, db = c[2] - b;
      var d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  // A colour table: every palette colour mixed part of the way toward `hex`,
  // scaled by `gain`, and snapped back to the palette. NONE maps to NONE.
  function toward(hex, a, gain) {
    var v = parseInt(hex.slice(1), 16), tr = v >> 16, tg = (v >> 8) & 255, tb = v & 255;
    var k = gain === undefined ? 1 : gain;
    var out = new Uint8Array(256).fill(NONE);
    RGB.forEach(function (c, i) {
      out[i] = nearest((c[0] + (tr - c[0]) * a) * k, (c[1] + (tg - c[1]) * a) * k, (c[2] + (tb - c[2]) * a) * k);
    });
    return out;
  }

  function layer() { return { px: new Uint8Array(W * H).fill(NONE), x0: W, y0: H, x1: -1, y1: -1 }; }
  function lset(L, x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    L.px[y * W + x] = c;
    if (x < L.x0) L.x0 = x;
    if (x > L.x1) L.x1 = x;
    if (y < L.y0) L.y0 = y;
    if (y > L.y1) L.y1 = y;
  }
  function lget(L, x, y) { return x < 0 || x >= W || y < 0 || y >= H ? NONE : L.px[y * W + x]; }
  function blit(f, L) {
    for (var y = L.y0; y <= L.y1; y++) {
      for (var i = y * W + L.x0, end = y * W + L.x1; i <= end; i++) if (L.px[i] !== NONE) f[i] = L.px[i];
    }
  }
  // Draws a baked layer shifted by (dx, dy), for things that bob or drift as a whole.
  function blitAt(f, L, dx, dy) {
    dx = Math.round(dx); dy = Math.round(dy);
    var y0 = Math.max(L.y0, -dy), y1 = Math.min(L.y1, H - 1 - dy), x0 = Math.max(L.x0, -dx), x1 = Math.min(L.x1, W - 1 - dx);
    for (var y = y0; y <= y1; y++) {
      var src = y * W, dst = (y + dy) * W + dx;
      for (var x = x0; x <= x1; x++) { var c = L.px[src + x]; if (c !== NONE) f[dst + x] = c; }
    }
  }
  function toRGBA(f, out) { for (var i = 0; i < f.length; i++) out[i] = RGBA[f[i]]; }

  G.PIX = {
    W: W, H: H, NONE: NONE, PALETTE: PALETTE, C: C, RGB: RGB, RGBA: RGBA,
    fb: fb, pset: pset, rect: rect, dith: dith, hash: hash, rng: rng, mod: mod,
    noise: noise, noise2: noise2, names: names, pick: pick, lum: lum, nearest: nearest, toward: toward,
    layer: layer, lset: lset, lget: lget, blit: blit, blitAt: blitAt, toRGBA: toRGBA
  };
})(S);
// pixel-kahyangan/src/world.js
// The world of Senja di Kahyangan: where things are, which way the light and
// the wind come from, and the colour tables that light, shade and haze them.
// We face east at sunset. The sun is low behind us, so everything facing us is
// gilded, shadows fall away from us, and the full moon rises ahead.
(function (G) {
  var PIX = G.PIX, TAU = Math.PI * 2;
  var LANGIT = G.LANGIT = {};

  var GEO = {
    horizon: 118,
    moon: { x: 300, y: 88, r: 10 },
    // The main island: its top is a plane seen from a little above, back edge to front lip.
    main: { x0: 76, x1: 354, back: 140, front: 156, tip: { x: 214, y: 246 } },
    // A small island to the right with the padmasana, and a low one to the left with the steps up.
    right: { x0: 384, x1: 462, back: 158, front: 166, tip: { x: 425, y: 226 } },
    left: { x0: -14, x1: 64, back: 198, front: 206, tip: { x: 22, y: 262 } },
    // The split gate stands on the far edge of the main island, its gap on the moon.
    gate: { x: 300, base: 141, top: 72, gap: 12, half: 23 }
  };

  // Each island floats: it rises and sinks by a pixel or two, on its own slow beat.
  var BOB = { main: [1.5, 11, 0], right: [2, 9, 1.7], left: [2, 8, 3.1] };
  function bob(name, t) {
    var b = BOB[name];
    return Math.round(b[0] * Math.sin(TAU * t / b[1] + b[2]));
  }

  // The wind blows from right to left: clouds, smoke, flags and petals all go that way.
  var WIND = -1;

  // Things that stand on each island, gathered from the modules and baked onto
  // the island's layer back to front, by the row they stand on.
  LANGIT.PROPS = { main: [], right: [], left: [] };

  LANGIT.GEO = GEO;
  LANGIT.WIND = WIND;
  LANGIT.bob = bob;
  // Warm sunlight on an edge, cast shadow, the cool light from the sky and clouds,
  // haze for distant things low and high in the sky, and the glow round the moon.
  LANGIT.LIGHT = PIX.toward("#ffd79a", 0.4);
  LANGIT.SHADE = PIX.toward("#3f4280", 0.45, 0.85);
  LANGIT.COOL = PIX.toward("#7a7fb6", 0.35);
  LANGIT.HAZE_LOW = [0.3, 0.5, 0.7].map(function (a) { return PIX.toward("#d9b9c2", a); });
  LANGIT.HAZE_HIGH = [0.3, 0.5, 0.7].map(function (a) { return PIX.toward("#9c9cc6", a); });
  LANGIT.GLOW = PIX.toward("#fff1e0", 0.4);
  // Mist veils whatever is behind it, thick and thin.
  LANGIT.MIST = PIX.toward("#ece6f2", 0.4);
  LANGIT.MIST_THIN = PIX.toward("#ece6f2", 0.2);
})(S);
// pixel-kahyangan/src/sky.js
// The sky over Kahyangan, facing east as the sun sets behind us: blue overhead,
// lavender, the pink Belt of Venus low down and peach at the horizon; two far
// volcanoes whose upper slopes still catch the sun; the full moon rising; and
// long wisps of cloud lit pink from below, drifting left on the wind.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = LANGIT.GEO;
  var SKY = PIX.names(["sk0", "sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8", "sk9", "sk10", "sk11", "sk12"]);
  var MT = PIX.names(["mt0", "mt1", "mt2", "mt3", "mt4", "mt5", "mt6", "mt7"]);
  var WISP = PIX.names(["wp0", "wp1", "wp2", "wp3"]);

  // Height to position on the sky ramp: slow through the blues, quick through the pink.
  var STOPS = [[0, 0], [22, 1.6], [45, 3.6], [64, 5.4], [80, 7], [90, 8.4], [94, 9], [100, 9.7],
    [106, 10.3], [112, 11], [116, 11.6], [118, 12]];
  function rampAt(y) {
    for (var k = 1; k < STOPS.length; k++) {
      if (y <= STOPS[k][0]) {
        var a = STOPS[k - 1], b = STOPS[k];
        return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0]);
      }
    }
    return 12;
  }
  function bakeGradient(f) {
    for (var y = 0; y < H; y++) {
      var v = Math.min(12, rampAt(y)) / 12;
      for (var x = 0; x < W; x++) f[y * W + x] = y < GEO.horizon ? PIX.pick(SKY, v, x, y) : C.cs4;
    }
  }

  // ---- Far volcanoes ---------------------------------------------------------------
  var VOLCANOES = [{ x: 44, peak: 80, half: 118, seed: 11 }, { x: 458, peak: 100, half: 74, seed: 23 }];
  function ridgeY(v, x) {
    var d = Math.abs(x - v.x) / v.half;
    if (d >= 1) return H;
    var y = GEO.horizon + 4 - (GEO.horizon + 4 - v.peak) * Math.pow(1 - d, 1.6);
    if (Math.abs(x - v.x) < 4) y = v.peak + 1 + (Math.abs(x - v.x) < 2 ? 1 : 0);
    return y + (PIX.noise(x / 6, v.seed) - 0.5) * 2.4;
  }
  function bakeVolcano(f, v) {
    for (var x = Math.max(0, v.x - v.half); x < Math.min(W, v.x + v.half); x++) {
      var top = Math.round(ridgeY(v, x));
      for (var y = top; y < GEO.horizon + 6; y++) {
        var hf = (GEO.horizon - y) / (GEO.horizon - v.peak);
        // Gullies radiate from the summit; their right-hand walls turn from the light.
        // They meander a little on the way down and fade out on the summit cone and the foot.
        var dist = Math.hypot(x - v.x, y - v.peak), ang = Math.atan2(x - v.x, y - v.peak + 6);
        ang += (PIX.noise(dist / 14, v.seed + 3) - 0.5) * 0.07;
        var gully = PIX.noise(ang * 12 + 40, v.seed + 1), carve = hf > 0.2 && hf < 0.93;
        var val = 0.1 + 0.9 * Math.pow(Math.max(0, hf), 0.75);
        val += 0.06 * Math.max(-1, Math.min(1, (v.x - x) / 24));
        if (carve && gully > 0.68) val -= 0.2;
        else if (carve && gully > 0.61) val += 0.07;
        if (y === top) val += 0.1;
        f[y * W + x] = PIX.pick(MT, val, x, y);
      }
    }
  }

  // ---- The moon --------------------------------------------------------------------
  // Its seas as seen rising in the east from the tropics south of the equator:
  // the familiar face turned a quarter, north to the left. [u, v, radius], disk units.
  var MARIA = [[-0.05, 0.45, 0.36], [-0.45, 0.2, 0.28], [-0.45, -0.2, 0.18], [-0.1, -0.35, 0.23],
    [0.4, 0.1, 0.18], [-0.3, -0.68, 0.11], [0.15, -0.55, 0.13]];
  function bakeMoon(f) {
    var m = GEO.moon, r = m.r;
    for (var y = m.y - r - 6; y <= m.y + r + 6; y++) {
      for (var x = m.x - r - 6; x <= m.x + r + 6; x++) {
        var d = Math.hypot(x - m.x, y - m.y), p = y * W + x;
        if (d <= r - 0.5) {
          var u = (x - m.x) / r, v = (y - m.y) / r, sea = 0;
          MARIA.forEach(function (s) {
            var k = 1 - Math.hypot(u - s[0], v - s[1]) / s[2];
            if (k > sea) sea = k;
          });
          sea += (PIX.noise2(x * 0.5, y * 0.5, 91) - 0.5) * 0.25;
          var c = sea > 0.5 ? C.mo1 : sea > 0.12 ? C.mo2 : C.mo3;
          // Tycho's bright crater; a soft rim; the lower limb warmed by the long path through the air.
          if (Math.abs(u - 0.66) < 0.12 && Math.abs(v - 0.08) < 0.12) c = C.mo3;
          else if (d > r - 1.3 && c === C.mo3) c = C.mo2;
          else if (v > 0.6 && c !== C.mo1 && PIX.dith(x, y, 0.5)) c = sea > 0.12 ? C.mo1 : C.mo2;
          if (c === C.mo1 && sea > 0.8) c = C.mo0;
          f[p] = c;
        } else if (d < r + 5) {
          // A faint halo, strongest at the limb.
          if (PIX.dith(x, y, 0.75 * Math.pow(1 - (d - r) / 5, 1.8))) f[p] = LANGIT.GLOW[f[p]];
        }
      }
    }
  }

  // ---- Wisps -----------------------------------------------------------------------
  var WISPS = [[40, 26, 96, 5, 1.1, 5], [210, 52, 64, 3, 1.5, 6], [352, 16, 118, 6, 0.9, 7], [420, 66, 58, 3, 1.3, 8]];
  var MARGIN = 200;
  // Each is baked once at x = 0 and drawn shifted along its own drift.
  var SPRITES = WISPS.map(function (w) {
    var L = PIX.layer(), len = w[2], thick = w[3];
    for (var i = 0; i < len; i++) {
      var prof = Math.pow(Math.sin(Math.PI * i / len), 0.8), h = thick * prof * (0.55 + 0.45 * PIX.noise(i / 9, w[5]));
      for (var y = Math.floor(w[1] - h); y <= w[1] + 1; y++) {
        var r = (y - (w[1] - h)) / (h + 1);
        if (PIX.noise2(i / 7, y / 2, w[5] + 50) < 0.28 && r < 0.8) continue;
        // Ragged at the ends and along the top.
        if (!PIX.dith(i, y, Math.min(1, prof * 2.2) * (0.35 + r))) continue;
        PIX.lset(L, i, y, PIX.pick(WISP, 0.1 + 0.9 * r, i, y));
      }
    }
    return L;
  });
  function wispsAt(t) {
    return WISPS.map(function (w) {
      var x = PIX.mod(w[0] + LANGIT.WIND * w[4] * t + MARGIN, W + 2 * MARGIN) - MARGIN;
      return { x: x, y: w[1], len: w[2] };
    });
  }
  function drawWisps(f, t) {
    wispsAt(t).forEach(function (w, i) { PIX.blitAt(f, SPRITES[i], Math.round(w.x), 0); });
  }

  function bakeSky(f) {
    bakeGradient(f);
    VOLCANOES.forEach(function (v) { bakeVolcano(f, v); });
    bakeMoon(f);
  }

  // The open sky at a point, without the moon or the volcanoes: the colour the air
  // between us and something far off takes on.
  function skyAt(x, y) {
    return y < GEO.horizon ? PIX.pick(SKY, Math.min(12, rampAt(y)) / 12, x, y) : C.cs4;
  }

  LANGIT.VOLCANOES = VOLCANOES;
  LANGIT.skyAt = skyAt;
  LANGIT.WISPS = { at: wispsAt };
  LANGIT.bakeSky = bakeSky;
  LANGIT.drawWisps = drawWisps;
})(S);
// pixel-kahyangan/src/clouds.js
// The sea of clouds below the islands. It lies in the shadow of the Earth, so
// it is lavender and blue; only the tallest billows still catch the last pink
// light on their crowns. Six rows of billows, flat and small at the horizon,
// big and round near us, drift left on the wind, the nearer the faster.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C, NONE = PIX.NONE;
  var GEO = LANGIT.GEO;
  var CS = PIX.names(["cs0", "cs1", "cs2", "cs3", "cs4", "cs5", "cs6"]);
  var P = 960;

  // [base, smallest and largest radius, lowest and highest billow, speed px/s, depth, haze, seed]
  var LAYERS = [
    [125, 5, 12, 1.5, 3, 0.35, 14, 0.8, 1],
    [131, 8, 16, 3, 6, 0.55, 22, 0.6, 2],
    [144, 11, 22, 5, 10, 0.8, 32, 0.45, 3],
    [164, 14, 28, 7, 15, 1.1, 44, 0.3, 4],
    [194, 18, 36, 10, 22, 1.5, 76, 0.15, 5],
    [248, 26, 48, 14, 30, 2, 30, 0, 6]
  ];

  // A row of billows: rounded puffs along a strip that wraps every P pixels,
  // each crowned with a few smaller puffs, like cauliflower.
  function puffsOf(p) {
    var r = PIX.rng(p[8] * 977), out = [];
    for (var x = 0; x < P;) {
      var rx = p[1] + r() * (p[2] - p[1]), ry = p[3] + r() * (p[4] - p[3]);
      var main = { cx: x + rx * 0.5, cy: p[0] + (r() - 0.5) * p[3] * 0.6, rx: rx, ry: ry, z: r() };
      for (var n = 2 + Math.floor(r() * 3), j = 0; j < n; j++) {
        var u = r() * 1.6 - 0.8, rs = Math.min(rx, ry * 1.6) * (0.35 + r() * 0.25);
        out.push({ cx: main.cx + u * rx, cy: main.cy - ry * Math.sqrt(Math.max(0, 1 - u * u)) + rs * 0.45, rx: rs, ry: rs * 0.85, z: main.z - 0.5 });
      }
      out.push(main);
      x += rx * (0.9 + r() * 0.6);
    }
    return out.sort(function (a, b) { return a.z - b.z; });
  }

  // Each puff is shaded like a ball lit by the sky above it; the part of it that
  // rises above the line of the Earth's shadow is lit pink by the sun behind us.
  function bake(p) {
    var bottom = Math.min(H, p[0] + p[6]), minTop = Math.floor(p[0] - p[4] * 2.2), rows = bottom - minTop;
    var px = new Uint8Array(rows * 2 * P).fill(NONE), sunLine = p[0] - p[4] * 0.62;
    function put(x, y, c) { if (y >= minTop && y < bottom) { var i = (y - minTop) * 2 * P + PIX.mod(x, P); px[i] = px[i + P] = c; } }
    puffsOf(p).forEach(function (b) {
      for (var y = Math.floor(b.cy - b.ry); y <= b.cy + b.ry; y++) {
        for (var x = Math.floor(b.cx - b.rx); x <= b.cx + b.rx; x++) {
          var u = (x - b.cx) / b.rx, v = (y - b.cy) / b.ry, d = u * u + v * v;
          if (d > 1) continue;
          var nz = Math.sqrt(1 - d), edge = d > 0.82 && v < 0;
          var val = 0.52 - 0.42 * v + 0.12 * nz - 0.1 * u + (PIX.noise2(x / 5, y / 4, p[8]) - 0.5) * 0.08;
          if (edge) val += 0.16;
          val = p[7] * (0.55 + 0.35 * val) + (1 - p[7]) * val;
          var c = PIX.pick(CS, val, x, y);
          if (y < sunLine && v < 0.2) {
            var lit = (sunLine - y) / (p[4] * 0.5) + 0.3 * nz - 0.3 * u;
            c = lit > 0.9 ? C.ct2 : lit > 0.45 ? C.ct1 : PIX.dith(x, y, 0.6) ? C.ct0 : c;
          }
          put(x, y, c);
        }
      }
    });
    // Below the puffs the row is one shadowed mass, down to where the next row covers it.
    var top = new Int16Array(P);
    for (var x = 0; x < P; x++) {
      var y0 = -1;
      for (var y = minTop; y < bottom; y++) {
        var i = (y - minTop) * 2 * P + x;
        if (px[i] !== NONE) { if (y0 < 0) y0 = y; continue; }
        if (y > p[0]) put(x, y, PIX.pick(CS, 0.32 - 0.25 * Math.min(1, (y - p[0]) / 30), x, y));
      }
      top[x] = y0;
    }
    return { px: px, top: top, minTop: minTop, bottom: bottom, speed: p[5] };
  }
  var BAKED = LAYERS.map(bake);

  function offset(k, t) { return PIX.mod(Math.round(-LANGIT.WIND * BAKED[k].speed * t), P); }
  // The top edge of layer k at screen column x, time t.
  function top(k, x, t) { return BAKED[k].top[PIX.mod(x + offset(k, t), P)]; }
  function drawLayer(f, k, t) {
    var L = BAKED[k], o = offset(k, t);
    for (var y = L.minTop; y < L.bottom; y++) {
      var src = (y - L.minTop) * 2 * P + o, dst = y * W;
      for (var x = 0; x < W; x++) { var c = L.px[src + x]; if (c !== NONE) f[dst + x] = c; }
    }
  }
  function drawFarClouds(f, t) { for (var k = 0; k < 5; k++) drawLayer(f, k, t); }
  function drawNearClouds(f, t) { drawLayer(f, 5, t); }

  LANGIT.CLOUDS = { layers: LAYERS.length, top: top };
  LANGIT.drawFarClouds = drawFarClouds;
  LANGIT.drawNearClouds = drawNearClouds;
})(S);
// pixel-kahyangan/src/isles.js
// The floating islands. Each is a grassy plane seen from a little above, on a
// mass of layered rock that hangs down to a point. The low sun behind us gilds
// the upper rock; below a line the islands sink into the shadow of the Earth,
// like the clouds, and turn lavender. Vines drape over the lip, and roots dangle
// from the underside into the air.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, C = PIX.C;
  var GEO = LANGIT.GEO;
  var RK = PIX.names(["rk1", "rk2", "rk3", "rk4", "rk5", "rk6", "rk7", "rk8"]);
  var RO = PIX.names(["ro0", "ro1", "ro2", "ro3", "ro4"]);
  var GR = PIX.names(["gr0", "gr1", "gr2", "gr3", "gr4", "gr5", "gr6"]);
  var LEAF = PIX.names(["lf2", "lf3", "lf4", "lf5"]);
  var SOIL = PIX.names(["sn0", "sn1", "sn2"]);
  var BLOOM = PIX.names(["fl3", "fl1", "fl2"]);

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // The outline of an island by column: back edge, front lip, bottom of the
  // rock, and the height below which it lies in the Earth's shadow.
  var PAD = 32;
  function shape(spec) {
    var cx = (spec.x0 + spec.x1) / 2, hw = (spec.x1 - spec.x0) / 2, hh = (spec.front - spec.back) / 2, cy = (spec.front + spec.back) / 2;
    var lobes = [[spec.tip.x, spec.tip.y, hw * 0.95]].concat(spec.lobes || []);
    var spikes = [], r = PIX.rng(spec.seed * 31);
    for (var k = 0; k < (spec.spikes || 0); k++) spikes.push([spec.x0 + hw * (0.3 + 1.4 * r()), 4 + r() * spec.spikeLen, 2 + r() * 4]);
    var shadowY = spec.front + (spec.shadowAt || 0.55) * (spec.tip.y - spec.front);
    function half(x) { var u = (x - cx) / hw; return u * u < 1 ? Math.sqrt(1 - u * u) : -1; }
    function back(x) { var h = half(x); return h < 0 ? NaN : cy - hh * h; }
    function lip(x) { var h = half(x); return h < 0 ? NaN : cy + hh * h; }
    function bottom(x) {
      var l = lip(x);
      if (l !== l) return NaN;
      var d = 3 + 4 * half(x);
      lobes.forEach(function (b) {
        var u = Math.abs(x - b[0]) / b[2];
        if (u < 1) d = Math.max(d, (b[1] - lip(b[0])) * Math.pow(1 - u, 1.45));
      });
      spikes.forEach(function (s) { d += s[1] * Math.max(0, 1 - Math.abs(x - s[0]) / s[2]); });
      return l + d + (PIX.noise(x / 5, spec.seed) - 0.5) * 3;
    }
    // Lip and bottom by whole column, a little past the screen edges, for quick lookups.
    var LIP = new Float32Array(W + 2 * PAD), BOT = new Float32Array(W + 2 * PAD);
    for (var x = -PAD; x < W + PAD; x++) { LIP[x + PAD] = lip(x); BOT[x + PAD] = bottom(x); }
    function inside(x, y) { var i = x + PAD; return i >= 0 && i < LIP.length && y > LIP[i] && y <= BOT[i]; }
    function shadow(x) { return shadowY + (PIX.noise(x / 11, spec.seed + 6) - 0.5) * 5; }
    return { cx: cx, hw: hw, back: back, lip: lip, bottom: bottom, inside: inside, shadow: shadow, depth: spec.tip.y - spec.front };
  }

  // Beds of rock a few pixels thick, alternating two stones. They pinch and
  // swell along their length, and slanting joints split them into blocks.
  function makeBeds(spec) {
    var r = PIX.rng(spec.seed * 71), beds = [];
    for (var d = 0; d < 150;) {
      var th = 4 + Math.floor(r() * 7), joint = new Uint8Array(W + 1), block = new Int16Array(W + 1), id = 0;
      for (var x = 0, next = Math.floor(r() * 20); x <= W; x++) {
        if (x === next) { joint[x] = 1; id++; next = x + 8 + Math.floor(r() * 22); }
        block[x] = id;
      }
      beds.push({ d0: d, th: th, ramp: r() < 0.4 ? RO : RK, tone: (r() - 0.5) * 0.14, joint: joint, block: block,
        slant: (r() - 0.5) * 0.8, gap: 0.25 + r() * 0.3, seed: Math.floor(r() * 1e4) });
      d += th;
    }
    return beds;
  }
  function bedTop(bed, x) { return bed.d0 + (PIX.noise(x / 26, bed.seed) - 0.5) * Math.min(4, bed.th * 0.8); }
  // Where a crevice runs under a bed; elsewhere the bed merges into the next.
  function crevice(bed, x) { return PIX.noise(x / 7, bed.seed + 2) > bed.gap; }

  // How bright bed k is at depth d below the lip, `inBed` pixels into a bed `th` thick.
  function rockValue(s, beds, k, x, d, colDepth, inBed, th) {
    var bed = beds[k], frac = 0.5 * d / s.depth + 0.5 * d / Math.max(1, colDepth), side = clamp((s.cx - x) / s.hw, -1, 1);
    var v = 0.9 - 0.55 * Math.pow(clamp(frac, 0, 1), 0.9) + 0.1 * side + bed.tone;
    var jx = clamp(Math.round(x - inBed * bed.slant), 1, W);
    v += (PIX.hash(bed.block[jx], bed.seed, 1) - 0.5) * 0.16;
    // The top of each bed catches the sky, a crevice runs under it, joints split it.
    if (inBed < 1) { if (k === 0 || crevice(beds[k - 1], x)) v += 0.12; }
    else if (inBed >= th - 1) { if (crevice(bed, x)) v -= 0.3; }
    else if (bed.joint[jx]) v -= 0.28;
    else if (bed.joint[jx - 1]) v += 0.06;
    return v;
  }
  // Near its silhouette the rock turns away from us: lit on the left, dark on the right.
  function edgeLight(s, x, y) {
    for (var i = 1; i <= 4; i++) {
      if (!s.inside(x + i, y)) return -0.28 * (1 - (i - 1) / 4);
      if (!s.inside(x - i, y)) return 0.14 * (1 - (i - 1) / 4);
    }
    return 0;
  }
  // Streaks left by rain running down the face, dark and a few pale.
  function weathering(x, y, seed) {
    var n = PIX.noise(x / 2.2, seed + 11), fade = PIX.noise2(x / 9, y / 16, seed + 12);
    return n > 0.7 && fade > 0.45 ? -0.12 : n < 0.2 && fade > 0.55 ? 0.06 : 0;
  }

  var SHADOW = PIX.names(["rs0", "rs1", "rs2", "rs3", "rs4"]);
  // Like PIX.pick, but dithered only near the middle of each step, so the rock keeps flat facets.
  function pickFlat(ramp, v, x, y) {
    var l = clamp(v, 0, 1) * (ramp.length - 1), i = Math.floor(l), f = l - i;
    return ramp[i < ramp.length - 1 && PIX.dith(x, y, clamp((f - 0.35) / 0.3, 0, 1)) ? i + 1 : i];
  }
  function bakeRock(L, s, spec) {
    var beds = makeBeds(spec);
    for (var x = Math.max(0, Math.ceil(spec.x0)); x <= Math.min(W - 1, spec.x1); x++) {
      var lip = s.lip(x), bot = s.bottom(x), sh = s.shadow(x);
      if (lip !== lip) continue;
      var tops = beds.map(function (b) { return bedTop(b, x); }), k = 0;
      for (var y = Math.round(lip) + 1; y <= bot; y++) {
        var d = y - lip, edge = y > bot - 1;
        while (k < beds.length - 1 && d >= tops[k + 1]) k++;
        var th = k < beds.length - 1 ? tops[k + 1] - tops[k] : beds[k].th;
        var v = rockValue(s, beds, k, x, d, bot - lip, d - tops[k], th) + edgeLight(s, x, y) + weathering(x, y, spec.seed);
        if (edge) v -= 0.3;
        var c = pickFlat(beds[k].ramp, v, x, y);
        // In the Earth's shadow the rock turns lavender, with light from the clouds just above its lowest edge.
        if (y > sh + 1 || (y > sh - 1 && PIX.dith(x, y, 0.5))) c = edge ? C.rs0 : y > bot - 2 ? C.rs4 : pickFlat(SHADOW, v, x, y);
        PIX.lset(L, x, y, c);
      }
    }
  }

  // A band of dark soil under the grass, then the grass: patchy, a few flowers,
  // blades against the sky along the back, a sunlit lip with grass hanging over it.
  function bakeTop(L, s, spec) {
    for (var x = Math.max(0, Math.ceil(spec.x0)); x <= Math.min(W - 1, spec.x1); x++) {
      var back = s.back(x), lip = s.lip(x), ly = Math.round(lip);
      if (back !== back) continue;
      for (var k = 1; k <= 2; k++) PIX.lset(L, x, ly + k, PIX.pick(SOIL, 0.75 - 0.35 * k + (PIX.hash(x, k, spec.seed) - 0.5) * 0.3, x, ly + k));
      for (var y = Math.round(back); y < ly; y++) {
        var f = (y - back) / Math.max(1, lip - back);
        var v = 0.42 + 0.22 * f + (PIX.noise2(x / 14, y / 5, spec.seed + 8) - 0.5) * 0.3 + (PIX.noise2(x / 3, y / 2, spec.seed + 7) - 0.5) * 0.25;
        if (y === Math.round(back)) v -= 0.2;
        var c = PIX.pick(GR, v, x, y), h = PIX.hash(x, y, spec.seed + 9);
        if (h < 0.012 && y > back + 1) c = BLOOM[Math.floor(h * 250) % 3];
        PIX.lset(L, x, y, c);
      }
      if (PIX.hash(x, spec.seed, 1) < 0.35) PIX.lset(L, x, Math.round(back) - 1, PIX.hash(x, spec.seed, 2) < 0.5 ? C.gr3 : C.gr2);
      PIX.lset(L, x, ly, PIX.hash(x, spec.seed, 3) < 0.6 ? C.gr6 : C.gr5);
      var hang = PIX.hash(x, spec.seed, 4) < 0.3 ? 1 + Math.floor(PIX.hash(x, spec.seed, 5) * 3) : 0;
      for (var n = 1; n <= hang; n++) PIX.lset(L, x, ly + n, n === hang ? C.gr3 : C.gr4);
    }
  }

  // One root: it wanders a little on the way down and thins to a dark tip.
  function drawRoot(L, s, x, y0, len, ph) {
    for (var k = 0; k < len; k++) {
      var px = x + Math.round(Math.sin(k * 0.25 + ph) * 1.2), py = Math.round(y0) + k;
      var c = k > len - 3 ? C.bk0 : PIX.hash(px, py, 9) < 0.3 ? C.bk2 : C.bk1;
      PIX.lset(L, px, py, py > s.shadow(px) ? LANGIT.COOL[c] : c);
    }
  }
  // Vines over the lip, leaves on both sides, now and then a flower at the end.
  function drawVine(L, x, y0, len, ph, bloom) {
    for (var k = 1; k <= len; k++) {
      var px = x + Math.round(Math.sin(k * 0.4 + ph) * 0.8), py = y0 + k;
      PIX.lset(L, px, py, k % 2 ? C.lf2 : C.lf3);
      if (k % 3 === 1) PIX.lset(L, px - 1, py, C.lf5);
      else if (k % 3 === 2) PIX.lset(L, px + 1, py, C.lf4);
    }
    if (bloom >= 0) PIX.lset(L, x + Math.round(Math.sin((len + 1) * 0.4 + ph) * 0.8), y0 + len + 1, BLOOM[bloom]);
  }

  function bakeHangings(L, s, spec) {
    var r = PIX.rng(spec.seed * 57);
    for (var x0 = spec.x0 + 3; x0 < spec.x1 - 3; x0 += 3 + r() * 7) {
      var x = Math.round(x0), lip = s.lip(x), edge = 1 - Math.abs(x - s.cx) / s.hw;
      if (lip !== lip || x < 0 || x >= W) continue;
      var len = 2 + Math.floor(r() * (edge < 0.3 ? 14 : 8));
      drawVine(L, x, Math.round(lip), len, r() * 6, r() < 0.25 ? Math.floor(r() * 3) : -1);
    }
    for (x0 = spec.x0 + 4; x0 < spec.x1 - 4; x0 += 4 + r() * 8) {
      x = Math.round(x0);
      if (x < 0 || x >= W) continue;
      edge = 1 - Math.abs(x - s.cx) / s.hw;
      // From under the rock, dangling free; the longest near the rims.
      drawRoot(L, s, x, s.bottom(x) - 2 - r() * 5, 4 + r() * (edge < 0.3 ? 30 : 14), r() * 6);
      // Some cling to the face, from a crevice down.
      if (r() < 0.35) drawRoot(L, s, x + 2, s.lip(x) + 3 + r() * 20, 6 + r() * 14, r() * 6);
    }
  }

  function bakeIsland(spec) {
    var L = PIX.layer(), s = shape(spec);
    bakeRock(L, s, spec);
    bakeTop(L, s, spec);
    bakeHangings(L, s, spec);
    return { layer: L, shape: s };
  }

  var SPECS = {
    main: { x0: GEO.main.x0, x1: GEO.main.x1, back: GEO.main.back, front: GEO.main.front, tip: GEO.main.tip, seed: 3,
      lobes: [[140, 214, 44], [300, 200, 40]], spikes: 7, spikeLen: 12, shadowAt: 0.52 },
    right: { x0: GEO.right.x0, x1: GEO.right.x1, back: GEO.right.back, front: GEO.right.front, tip: GEO.right.tip, seed: 8,
      lobes: [[404, 204, 16]], spikes: 3, spikeLen: 8, shadowAt: 0.6 },
    left: { x0: GEO.left.x0, x1: GEO.left.x1, back: GEO.left.back, front: GEO.left.front, tip: GEO.left.tip, seed: 13,
      spikes: 3, spikeLen: 8, shadowAt: 0.45 }
  };
  var BUILT = {};
  Object.keys(SPECS).forEach(function (k) { BUILT[k] = bakeIsland(SPECS[k]); });

  // ---- Far islands, small and hazed, each with a few trees ------------------------
  var FAR = [
    { x: 32, y: 50, hw: 14, hh: 2, depth: 16, haze: 1, bob: [1, 13, 0.4], seed: 21 },
    { x: 404, y: 30, hw: 10, hh: 1.5, depth: 12, haze: 2, bob: [1, 15, 2.2], seed: 22 },
    { x: 128, y: 70, hw: 8, hh: 1.5, depth: 10, haze: 2, bob: [1, 12, 4.1], seed: 23 }
  ];
  function bakeFar(i) {
    var spec = { x0: i.x - i.hw, x1: i.x + i.hw, back: i.y - i.hh, front: i.y + i.hh, tip: { x: i.x + 1, y: i.y + i.depth }, seed: i.seed, spikes: 1, spikeLen: 4 };
    var b = bakeIsland(spec), L = b.layer, r = PIX.rng(i.seed);
    for (var n = 0; n < Math.round(i.hw / 4); n++) {
      var tx = Math.round(i.x - i.hw * 0.7 + r() * i.hw * 1.4), ty = Math.round(b.shape.back(tx)), rad = 1.5 + r() * 2;
      for (var y = ty - rad * 2; y <= ty; y++) for (var x = tx - rad; x <= tx + rad; x++) {
        if (Math.hypot(x - tx, (y - ty + rad) * 0.9) <= rad) PIX.lset(L, x, y, PIX.pick(LEAF, 0.3 + 0.6 * (tx - x + rad) / (2 * rad), x, y));
      }
    }
    // The air between.
    for (var p = 0; p < L.px.length; p++) if (L.px[p] !== PIX.NONE) L.px[p] = LANGIT.HAZE_HIGH[i.haze][L.px[p]];
    return L;
  }
  var FAR_LAYERS = FAR.map(bakeFar);
  function drawFarIsles(f, t) {
    FAR.forEach(function (i, k) {
      PIX.blitAt(f, FAR_LAYERS[k], 0, Math.round(i.bob[0] * Math.sin(2 * Math.PI * t / i.bob[1] + i.bob[2])));
    });
  }

  function drawIsland(name) {
    return function (f, t) { PIX.blitAt(f, BUILT[name].layer, 0, LANGIT.bob(name, t)); };
  }

  LANGIT.ISLES = {
    main: BUILT.main.shape, right: BUILT.right.shape, left: BUILT.left.shape,
    layer: function (name) { return BUILT[name].layer; },
    far: FAR.map(function (i) { return { x: i.x, y: i.y, hw: i.hw, depth: i.depth }; })
  };
  LANGIT.drawFarIsles = drawFarIsles;
  LANGIT.drawMain = drawIsland("main");
  LANGIT.drawRight = drawIsland("right");
  LANGIT.drawLeft = drawIsland("left");
})(S);
// pixel-kahyangan/src/temple.js
// The temple. On the main island: four merus with odd numbers of roofs of
// black palm fibre, a padmasana with its empty throne on the north-east corner,
// a brick wall along the front with a kori gate, and on the far edge a split
// gate, open to the sky, with the full moon rising in its gap. On the small
// island to the right, the tower of the kulkul. Everything is baked onto the
// island layers, so it rises and sinks with them; the sun behind us lights the
// fronts, a little more from the left.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, C = PIX.C;
  var GEO = LANGIT.GEO, ISLES = LANGIT.ISLES;
  var IJ = PIX.names(["ij0", "ij1", "ij2", "ij3", "ij4"]);
  var BR = PIX.names(["br1", "br2", "br3", "br4", "br5"]);
  var PA = PIX.names(["pa0", "pa1", "pa2", "pa3", "pa4", "pa5"]);
  var WD = PIX.names(["wd0", "wd1", "wd2", "wd3"]);
  var GO = PIX.names(["go0", "go1", "go2", "go3"]);
  var AN = PIX.names(["an0", "an1", "an2", "an3"]);
  var put = PIX.lset;

  // ---- Masonry ------------------------------------------------------------------
  // Brick laid in courses with staggered joints, or soft paras stone with a
  // grain of small carved marks. u runs 0..1 across the block, left to right.
  function brick(x, y, u, v) {
    if (y % 3 === 0) return C.br1;
    if ((x + (y % 6 < 3 ? 0 : 2)) % 5 === 0) return C.br2;
    return PIX.pick(BR, v + 0.55 - 0.3 * u + (PIX.hash(x >> 1, y, 5) - 0.5) * 0.18, x, y);
  }
  function paras(x, y, u, v) {
    var c = PIX.pick(PA, v + 0.66 - 0.3 * u + (PIX.hash(x, y, 6) - 0.5) * 0.12, x, y);
    return PIX.hash(x, y, 7) < 0.03 ? PA[Math.max(0, PA.indexOf(c) - 1)] : c;
  }
  // A block from x0 to x1 and rows y0 to y1, all inclusive: its left edge in the
  // sun, its right edge turning away, a lit top and a dark foot.
  function block(L, x0, x1, y0, y1, mat, lift) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var v = lift || 0;
      if (x === x0) v += 0.18; else if (x === x1) v -= 0.22;
      if (y === y0) v += 0.12; else if (y === y1 && y1 - y0 > 1) v -= 0.14;
      put(L, x, y, mat(x, y, (x - x0) / Math.max(1, x1 - x0), v));
    }
  }
  // The shadow each structure casts on the grass, short and to the right.
  function shadowRight(L, x, y, w) {
    for (var dy = -1; dy <= 0; dy++) for (var k = 1; k <= w; k++) {
      var c = PIX.lget(L, x + k, y + dy);
      if (c !== PIX.NONE && /^gr/.test(PIX.PALETTE[c][0])) put(L, x + k, y + dy, LANGIT.SHADE[c]);
    }
  }

  // ---- Merus --------------------------------------------------------------------
  // One roof of palm fibre, its eave at row y: a steep, slightly flared frustum,
  // its fibres streaked, the cut ends at the eave catching the light.
  function roof(L, x, y, w, h, seed) {
    for (var r = 0; r < h; r++) {
      var hw = w / 2 * (1 - 0.5 * Math.pow(r / (h - 1), 0.8)), x0 = Math.round(x - hw), x1 = Math.round(x + hw) - 1;
      for (var px = x0; px <= x1; px++) {
        var u = (px - x0) / Math.max(1, x1 - x0), v = 0.62 - 0.3 * u + 0.08 * r / h;
        if (PIX.hash(px, seed, 3) < 0.3) v -= 0.14;
        if (px === x0) v += 0.2; else if (px === x1) v -= 0.2;
        put(L, px, y - r, r === 0 ? (u < 0.85 ? C.ij4 : C.ij3) : PIX.pick(IJ, v, px, y - r));
      }
    }
  }
  // The wooden core between two roofs, in the shadow of the roof above.
  function core(L, x, y, w, gap) {
    var x0 = Math.round(x - w / 2), x1 = Math.round(x + w / 2) - 1;
    for (var r = 0; r < gap; r++) for (var px = x0; px <= x1; px++) {
      put(L, px, y - r, r === gap - 1 ? C.wd0 : px === x0 ? C.wd3 : px === x1 ? C.wd0 : C.wd1);
    }
  }
  function finial(L, x, y) {
    [[-1, 1, C.go1], [-1, 1, C.go2], [0, 0, C.go3], [0, 0, C.go2]].forEach(function (s, r) {
      for (var k = s[0]; k <= s[1]; k++) put(L, x + k, y - r, k < 0 ? C.go3 : s[2]);
    });
    return y - 3;
  }
  // The stone base with its stair, the wooden shrine with a red door, then the roofs.
  function meru(L, m) {
    var x = m.x, y = m.base, pw = m.plinth[0], ph = m.plinth[1], bw = m.body[0], bh = m.body[1];
    block(L, x - pw / 2, x + pw / 2 - 1, y - ph + 1, y, paras);
    block(L, x - 2, x + 1, y - ph + 2, y + 1, function (px, py, u, v) { return PIX.pick(PA, (py % 2 ? 0.85 : 0.45) + v, px, py); });
    shadowRight(L, Math.round(x + pw / 2 - 1), y, 3);
    y -= ph;
    block(L, x - bw / 2, x + bw / 2 - 1, y - bh + 1, y, function (px, py, u, v) {
      if (Math.abs(px - x + 0.5) < 1.2 && py > y - bh + 2) return py === y - bh + 3 ? C.go2 : C.rd1;
      return PIX.pick(WD, 0.55 + v - 0.2 * u, px, py);
    });
    y -= bh;
    for (var i = 0; i < m.tiers; i++) {
      var w = Math.round(m.w - (m.w - m.w1) * i / Math.max(1, m.tiers - 1));
      roof(L, x, y, w, m.tierH, m.x * 31 + i);
      y -= m.tierH;
      if (i < m.tiers - 1) { core(L, x, y, Math.max(3, Math.round(w * 0.28)), m.gap); y -= m.gap; }
    }
    m.top = finial(L, x, y);
  }

  var MERUS = [
    { x: 138, base: 145, tiers: 5, w: 24, w1: 12, tierH: 5, gap: 3, plinth: [16, 5], body: [9, 6] },
    { x: 180, base: 143, tiers: 11, w: 34, w1: 10, tierH: 5, gap: 3, plinth: [22, 6], body: [12, 7] },
    { x: 226, base: 144, tiers: 7, w: 28, w1: 11, tierH: 5, gap: 3, plinth: [18, 5], body: [10, 6] },
    { x: 256, base: 145, tiers: 3, w: 20, w1: 13, tierH: 5, gap: 3, plinth: [14, 4], body: [8, 5] }
  ];

  // ---- The split gate -----------------------------------------------------------
  // One half, as [rows, width from the cut, material, ledge]; the other is its mirror.
  var HALF = [[7, 23, "p"], [25, 20, "b"], [3, 22, "p"], [6, 18, "b", 1], [6, 15, "b", 1], [6, 12, "b", 1],
    [6, 9, "b", 1], [5, 6, "b", 1], [2, 3, "p"], [2, 2, "p"], [1, 1, "p"]];
  function gateHalf(L, g, side) {
    var y = g.base, edge = side < 0 ? g.x - g.gap - 1 : g.x + g.gap;
    HALF.forEach(function (tier, k) {
      var rows = tier[0], w = tier[1], mat = tier[2] === "p" ? paras : brick;
      var outer = edge + side * (w - 1), x0 = Math.min(edge, outer), x1 = Math.max(edge, outer);
      block(L, x0, x1, y - rows + 1, y, mat);
      if (tier[3]) {
        // A stone ledge at the foot of each tier of the head, and a flame of carved stone on its outer corner.
        block(L, Math.min(edge, outer + side), Math.max(edge, outer + side), y, y, paras, 0.15);
        put(L, outer + side, y - 1, C.pa4); put(L, outer + side, y - 2, C.pa3); put(L, outer + 2 * side, y - 2, C.pa5);
      }
      if (k === 1) panel(L, x0 + 4, x1 - 4, y - rows + 6, y - 5);
      y -= rows;
    });
  }
  // The carved stone panel on the body of each half: sunk into the wall, a
  // flower with a gilded heart in the middle, a stem with leaves above and below.
  function panel(L, x0, x1, y0, y1) {
    var cx = Math.round((x0 + x1) / 2), cy = Math.round((y0 + y1) / 2);
    block(L, x0, x1, y0, y1, function (x, y, u, v) {
      if (y === y0 || x === x0) return C.pa1;
      if (y === y1 || x === x1) return C.pa4;
      var dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
      if (d < 1) return C.go2;
      if (d < 3.2) return Math.cos(4 * Math.atan2(dy, dx)) > 0 ? C.pa5 : C.pa1;
      if (dx === 0) return C.pa1;
      if (Math.abs(dx) <= 2 && (Math.abs(dy) + Math.abs(dx)) % 3 === 0) return C.pa4;
      return PIX.pick(PA, 0.62 + v * 0.5 - 0.15 * u, x, y);
    });
  }
  // Four stone steps up to the threshold, between the halves.
  function stairs(L, g) {
    for (var s = 0; s < 4; s++) {
      block(L, g.x - g.gap + 1 - s, g.x + g.gap - 2 + s, g.base - 1 + 2 * s, g.base + 2 * s, function (x, y, u, v) {
        return y === g.base - 1 + 2 * s ? C.pa4 : C.pa2;
      });
    }
  }
  // A guardian statue of dark stone wearing a black and white poleng cloth.
  function guardian(L, x, base) {
    block(L, x - 3, x + 2, base - 1, base, paras);
    for (var y = base - 5; y <= base - 2; y++) for (var k = -2; k <= 1; k++) put(L, x + k, y, (x + k + y) % 2 ? C.wh1 : C.ij0);
    block(L, x - 2, x + 1, base - 8, base - 6, function (px, py, u, v) { return PIX.pick(AN, 0.6 + v, px, py); });
    block(L, x - 1, x, base - 10, base - 9, function (px, py, u, v) { return PIX.pick(AN, 0.55 + v, px, py); });
    put(L, x - 1, base - 9, C.pa5);
  }
  function gate(L, g) {
    gateHalf(L, g, -1);
    gateHalf(L, g, 1);
    stairs(L, g);
    shadowRight(L, g.x + g.gap + 22, g.base, 3);
    guardian(L, g.x - g.guard, g.base + 6);
    guardian(L, g.x + g.guard, g.base + 6);
  }

  // ---- The front wall and the kori ----------------------------------------------
  function wall(L, w) {
    for (var x = w.x0; x <= w.x1; x++) {
      var base = Math.round(ISLES.main.lip(x)) - 2, pillar = (x - w.x0) % 26 < 2;
      for (var y = base - 4 - (pillar ? 1 : 0); y <= base; y++) {
        var top = y <= base - 3 - (pillar ? 1 : 0), lit = x === w.x0 ? 0.18 : 0;
        put(L, x, y, pillar || top ? paras(x, y, 0.4, lit + (y === base - 4 - (pillar ? 1 : 0) ? 0.15 : 0)) : brick(x, y, 0.5, lit));
      }
    }
  }
  function kori(L, k) {
    var x = k.x, y = k.base;
    block(L, x - 11, x + 10, y - 3, y, paras);
    block(L, x - 10, x + 9, y - 19, y - 4, brick);
    // The doorway: a stone frame, a gold lintel, darkness beyond.
    block(L, x - 4, x + 3, y - 17, y - 1, paras, 0.1);
    for (var py = y - 16; py <= y - 1; py++) for (var px = x - 3; px <= x + 2; px++) put(L, px, py, py < y - 14 ? C.ij1 : C.nk);
    for (var gx = x - 4; gx <= x + 3; gx++) put(L, gx, y - 17, C.go2);
    // Above it the face of Bhoma, glaring, with fangs.
    block(L, x - 5, x + 4, y - 23, y - 19, paras, -0.05);
    [[-3, 22, C.pa5], [-2, 22, C.nk], [1, 22, C.nk], [2, 22, C.pa5], [-1, 20, C.rd1], [0, 20, C.rd1], [-2, 20, C.pa5], [1, 20, C.pa5],
      [-4, 21, C.pa1], [3, 21, C.pa1], [-5, 23, C.pa4], [4, 23, C.pa2]].forEach(function (d) { put(L, x + d[0], y - d[1], d[2]); });
    // A stepped head of brick, each tier on a stone ledge with flames at its corners, and a stone crown.
    var top = y - 24;
    [20, 17, 14, 11, 8, 5].forEach(function (w) {
      var x0 = x - (w >> 1), x1 = x0 + w - 1;
      block(L, x0 - 1, x1 + 1, top, top, paras, 0.2);
      put(L, x0 - 2, top - 1, C.pa5); put(L, x1 + 2, top - 1, C.pa3);
      block(L, x0, x1, top - 2, top - 1, brick);
      top -= 3;
    });
    block(L, x - 1, x, top - 1, top, paras, 0.2);
    put(L, x - 1, top - 2, C.pa4);
    k.top = top - 2;
    shadowRight(L, x + 10, y, 2);
  }

  // ---- The padmasana ------------------------------------------------------------
  // The turtle Bedawang Nala with the serpents Anantaboga and Basuki round it,
  // three tiers of carved stone wrapped in white and yellow cloth, and at the
  // top the empty throne.
  function padmasana(L, p) {
    var x = p.x, y = p.base;
    turtle(L, x, y);
    serpents(L, x, y);
    y -= 8;
    [[24, 10], [20, 10], [16, 8]].forEach(function (s, i) {
      tier(L, x, y, s[0], s[1]);
      if (i === 1) cloth(L, x, y - 6, s[0]);
      y -= s[1];
    });
    block(L, x - 9, x + 8, y - 2, y, paras, 0.15);
    y -= 3;
    p.seat = [x - 6, y - 13, x + 6, y + 1];
    p.top = throne(L, x, y);
    shadowRight(L, x + 12, p.base, 3);
  }
  function turtle(L, x, y) {
    for (var r = 0; r < 8; r++) {
      var hw = Math.round(13 * Math.sqrt(Math.max(0, 1 - Math.pow((r - 0.5) / 7.6, 2))));
      block(L, x - hw, x + hw - 1, y - r, y - r, function (px, py, u, v) {
        var scute = (px - x + 40) % 6 === 0 || r === 3;
        return scute ? C.pa0 : PIX.pick(PA, 0.3 + v - 0.2 * u, px, py);
      });
    }
    // The head, looking out at us, and the front flippers.
    block(L, x - 2, x + 1, y - 1, y + 1, function (px, py, u, v) { return PIX.pick(PA, 0.55 + v, px, py); });
    put(L, x - 2, y, C.nk); put(L, x + 1, y, C.nk); put(L, x - 1, y + 1, C.rd1); put(L, x, y + 1, C.rd1);
    block(L, x - 13, x - 10, y, y + 1, paras, -0.2);
    block(L, x + 9, x + 12, y, y + 1, paras, -0.25);
  }
  function serpents(L, x, y) {
    for (var k = -13; k <= 12; k++) {
      put(L, x + k, y - 2 + Math.round(Math.sin(k * 0.45) * 1.2), k % 3 ? C.go2 : C.go1);
      put(L, x + k, y - 5 + Math.round(Math.cos(k * 0.45) * 1.2), k % 3 ? C.go1 : C.go3);
    }
    // Their crowned heads rise at the front corners, looking outward.
    [-1, 1].forEach(function (side) {
      var hx = x + (side < 0 ? -14 : 13);
      for (var r = 4; r <= 9; r++) put(L, hx, y - r, r % 2 ? C.go2 : C.go1);
      put(L, hx + side, y - 9, C.go2); put(L, hx + side, y - 10, C.go3); put(L, hx, y - 11, C.go3);
      put(L, hx + 2 * side, y - 9, C.rd2);
    });
  }
  // One stepped tier: a band of carved rosettes, a lit ledge, flames of stone at its corners.
  function tier(L, x, y, w, h) {
    var x0 = x - w / 2, x1 = x + w / 2 - 1, top = y - h + 1;
    block(L, x0, x1, top, y, paras, 0.05);
    for (var k = x0 + 2; k < x1 - 1; k += 4) {
      put(L, k, y - 3, C.pa1); put(L, k + 1, y - 3, C.pa5); put(L, k + 2, y - 3, C.pa1);
    }
    for (var g = x0 + 1; g < x1; g++) put(L, g, y - 1, C.pa1);
    block(L, x0 - 1, x1 + 1, top, top, paras, 0.25);
    put(L, x0 - 2, top - 1, C.pa5); put(L, x0 - 2, top - 2, C.pa4);
    put(L, x1 + 2, top - 1, C.pa3); put(L, x1 + 2, top - 2, C.pa2);
  }
  // White and yellow cloth wrapped round the tier, its end hanging in front.
  function cloth(L, x, y, w) {
    for (var k = -w / 2 - 1; k < w / 2 + 1; k++) { put(L, x + k, y - 1, k < w / 2 - 2 ? C.ye2 : C.ye1); put(L, x + k, y, C.wh1); }
    put(L, x - 4, y + 1, C.ye2); put(L, x - 4, y + 2, C.wh1); put(L, x - 3, y + 1, C.wh1);
  }
  function throne(L, x, y) {
    block(L, x - 7, x + 6, y - 1, y, paras, 0.2);
    block(L, x - 7, x - 6, y - 6, y - 2, paras, 0.15);
    block(L, x + 5, x + 6, y - 6, y - 2, paras, -0.1);
    put(L, x - 7, y - 7, C.go3); put(L, x - 6, y - 7, C.go2); put(L, x + 5, y - 7, C.go2); put(L, x + 6, y - 7, C.go1);
    // The tall back, framed in gold round the empty place of the god.
    block(L, x - 5, x + 4, y - 13, y - 2, function (px, py, u, v) {
      if (px === x - 5 || py === y - 13) return C.go2;
      if (px === x + 4) return C.go1;
      return px > x - 4 && px < x + 3 && py > y - 12 ? PIX.pick(PA, 0.42 - 0.2 * u, px, py) : C.pa4;
    });
    put(L, x - 6, y - 10, C.go2); put(L, x - 7, y - 11, C.go3); put(L, x - 6, y - 12, C.go2);
    put(L, x + 5, y - 10, C.go1); put(L, x + 6, y - 11, C.go2); put(L, x + 5, y - 12, C.go1);
    for (var k = -2; k <= 1; k++) put(L, x + k, y - 14, C.go2);
    put(L, x - 1, y - 15, C.go3); put(L, x, y - 15, C.go2); put(L, x - 1, y - 16, C.go3);
    return y - 16;
  }

  // ---- The kulkul tower ---------------------------------------------------------
  function kulkul(L, k) {
    var x = k.x, y = k.base;
    block(L, x - 7, x + 6, y - 3, y, paras);
    block(L, x - 6, x + 5, y - 21, y - 4, brick);
    block(L, x - 7, x + 6, y - 22, y - 22, paras, 0.2);
    y -= 23;
    // Four posts round an open room, the slit drum hanging in it wrapped in poleng.
    for (var r = 0; r < 9; r++) {
      put(L, x - 6, y - r, C.wd3); put(L, x - 5, y - r, C.wd2); put(L, x + 4, y - r, C.wd1); put(L, x + 5, y - r, C.wd0);
      for (var q = x - 4; q <= x + 3; q++) put(L, q, y - r, r === 8 ? C.ij0 : C.ij1);
    }
    for (var d = 1; d <= 7; d++) {
      put(L, x - 1, y - d, C.wd3); put(L, x, y - d, d > 2 && d < 6 ? C.wd0 : C.wd2); put(L, x + 1, y - d, C.wd1);
    }
    for (var b = -1; b <= 1; b++) put(L, x + b, y - 6, (x + b) % 2 ? C.wh1 : C.ij0);
    k.drum = [x - 1, y - 7, x + 2, y];
    y -= 9;
    roof(L, x, y, 18, 6, 77);
    roof(L, x, y - 6, 8, 3, 78);
    k.top = finial(L, x, y - 9);
    shadowRight(L, x + 6, k.base, 3);
  }

  var TEMPLE = {
    merus: MERUS,
    gate: { x: GEO.gate.x, base: GEO.gate.base, top: GEO.gate.top, gap: GEO.gate.gap, half: GEO.gate.half, guard: 17 },
    kori: { x: 158, base: Math.round(ISLES.main.lip(158)) - 2, door: null },
    wall: { x0: 92, x1: 346 },
    padmasana: { x: 100, base: 147 },
    kulkul: { x: 424, base: 162 }
  };
  TEMPLE.kori.door = [TEMPLE.kori.x - 3, TEMPLE.kori.base - 16, TEMPLE.kori.x + 3, TEMPLE.kori.base];

  var P = LANGIT.PROPS;
  P.main.push({ base: TEMPLE.gate.base, draw: function (L) { gate(L, TEMPLE.gate); } });
  P.main.push({ base: TEMPLE.padmasana.base, draw: function (L) { padmasana(L, TEMPLE.padmasana); } });
  MERUS.forEach(function (m) { P.main.push({ base: m.base, draw: function (L) { meru(L, m); } }); });
  P.main.push({ base: 151.5, draw: function (L) { wall(L, TEMPLE.wall); } });
  P.main.push({ base: TEMPLE.kori.base, draw: function (L) { kori(L, TEMPLE.kori); } });
  P.right.push({ base: TEMPLE.kulkul.base, draw: function (L) { kulkul(L, TEMPLE.kulkul); } });

  LANGIT.TEMPLE = TEMPLE;
})(S);
// pixel-kahyangan/src/garden.js
// The living things round the temple. A great banyan on the low island, its
// trunk wrapped in poleng and its aerial roots hanging to the ground; frangipani
// in bloom beside the shrines; ceremonial umbrellas; and, moving in the wind
// from the right, the tall arching penjor and the umbul-umbul flags.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, C = PIX.C, TAU = Math.PI * 2;
  var ISLES = LANGIT.ISLES;
  var LF = PIX.names(["lf0", "lf1", "lf2", "lf3", "lf4", "lf5", "lf6", "gr6"]);
  var BK = PIX.names(["bk0", "bk1", "bk2", "bk3"]);
  var put = PIX.lset;

  // ---- The banyan ---------------------------------------------------------------
  var BANYAN = { x: 22, base: 203, crown: [-24, 106, 76, 182], poleng: [183, 187] };

  function trunk(L, b) {
    for (var y = b.base; y >= 160; y--) {
      var flare = Math.pow(Math.max(0, 1 - (b.base - y) / 9), 2), hw = 3.5 + 5 * flare;
      var x0 = Math.round(b.x - hw), x1 = Math.round(b.x + hw) - 1;
      for (var x = x0; x <= x1; x++) {
        var poleng = y >= b.poleng[0] && y <= b.poleng[1];
        var c = x === x0 ? C.bk3 : x === x1 ? C.bk0 : PIX.hash(x, y >> 2, 3) < 0.25 ? C.bk0 : x - x0 < 3 ? C.bk2 : C.bk1;
        put(L, x, y, poleng ? ((x + y) % 2 ? C.wh1 : C.ij0) : c);
      }
    }
    // The cloth is tied at the front, its ends hanging.
    put(L, b.x - 1, b.poleng[1] + 1, C.wh1); put(L, b.x - 1, b.poleng[1] + 2, C.ij0); put(L, b.x, b.poleng[1] + 1, C.ij0);
    // Four great limbs into the crown.
    [[-10, 146], [6, 136], [38, 138], [58, 150]].forEach(function (e) { limb(L, b.x, 162, b.x + e[0], e[1]); });
  }
  function limb(L, x0, y0, x1, y1) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (var i = 0; i <= n; i++) {
      var x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n + Math.sin(i / n * Math.PI) * -3);
      put(L, x, y, C.bk2); put(L, x + 1, y, C.bk1); if (i < n / 2) put(L, x, y + 1, C.bk1);
    }
  }
  // The crown: clumps of leaves in a broad dome, each shaded like a ball lit from
  // behind us and to the left, ragged at the edges.
  function crown(L, b) {
    var r = PIX.rng(4401), clumps = [], cx0 = (b.crown[0] + b.crown[2]) / 2, hw = (b.crown[2] - b.crown[0]) / 2;
    for (var i = 0; i < 48; i++) {
      var u = r() * 2 - 1, cx = cx0 + u * hw * 0.92, top = b.crown[3] - (b.crown[3] - b.crown[1]) * Math.sqrt(1 - u * u);
      var ry = 5 + r() * 4, cy = top + ry + r() * Math.max(0, b.crown[3] - 8 - top - ry);
      clumps.push({ x: cx, y: cy, rx: 8 + r() * 6, ry: ry, s: i, shade: (cy - b.crown[1]) / (b.crown[3] - b.crown[1]) });
    }
    clumps.sort(function (a, c) { return a.y - c.y; }).forEach(function (k) { clump(L, k); });
  }
  // Glossy dark leaves; the rim that faces the sun behind us and to the left is gilded.
  function clump(L, k) {
    for (var y = Math.floor(k.y - k.ry); y <= k.y + k.ry; y++) for (var x = Math.floor(k.x - k.rx); x <= k.x + k.rx; x++) {
      var u = (x - k.x) / k.rx, v = (y - k.y) / k.ry, d = u * u + v * v;
      if (d > 1 || (d > 0.72 && PIX.hash(x, y, k.s + 9) < 0.4)) continue;
      var val = 0.5 - 0.3 * k.shade - 0.34 * v - 0.2 * u + 0.12 * Math.sqrt(1 - d) + (PIX.noise2(x / 2.5, y / 2, k.s) - 0.5) * 0.35;
      var rim = d > 0.55 && v < -0.25 && u < 0.3;
      put(L, x, y, rim ? (PIX.dith(x, y, 0.5) ? C.gr6 : C.lf6) : PIX.pick(LF, Math.min(val, 0.62), x, y));
    }
  }
  // Aerial roots from the underside of the crown; the oldest reach the ground.
  function aerialRoots(L, b) {
    var r = PIX.rng(4402);
    for (var x = b.crown[0] + 8; x < b.crown[2] - 6; x += 2 + Math.floor(r() * 4)) {
      var y0 = lowestLeaf(L, x, b.crown[1], b.crown[3] + 2);
      // None over the trunk, so its cloth shows.
      if (y0 < 0 || Math.abs(x - b.x) < 7) continue;
      var ground = Math.round(ISLES.left.back(x) || b.base) + 2, reach = r() < 0.3;
      var len = reach ? ground - y0 : 6 + r() * 24, ph = r() * 6;
      for (var k = 1; k < len; k++) {
        var px = x + Math.round(Math.sin(k * 0.18 + ph) * (reach ? 0.6 : 1));
        put(L, px, y0 + k, k > len - 2 && !reach ? C.bk0 : C.bk1);
        if (reach) put(L, px + 1, y0 + k, k % 5 ? C.bk2 : C.bk0);
      }
    }
  }
  function lowestLeaf(L, x, y0, y1) {
    for (var y = y1; y >= y0; y--) {
      var c = PIX.lget(L, x, y);
      if (c !== PIX.NONE && LF.indexOf(c) >= 0) return y;
    }
    return -1;
  }

  // ---- Frangipani and umbrellas ------------------------------------------------
  // A short grey trunk forking into crooked branches, each ending in a rosette of
  // leaves with flowers on top.
  function kamboja(L, k) {
    var r = PIX.rng(k.seed), x = k.x, y = k.base;
    for (var i = 0; i < 7; i++) { put(L, x, y - i, i % 3 ? C.bk3 : C.bk2); put(L, x + 1, y - i, C.bk1); }
    for (var b = 0; b < 4; b++) {
      var ang = -Math.PI / 2 + (b - 1.5) * 0.5 + (r() - 0.5) * 0.2, len = 6 + r() * 3, bx = x + 0.5, by = y - 6;
      for (var s = 0; s < len; s++) {
        bx += Math.cos(ang); by += Math.sin(ang); ang += (r() - 0.5) * 0.3;
        put(L, Math.round(bx), Math.round(by), s < len - 2 ? C.bk2 : C.bk3);
      }
      rosette(L, Math.round(bx), Math.round(by), r, k.bloom);
    }
  }
  function rosette(L, x, y, r, bloom) {
    for (var a = 0; a < 7; a++) {
      var ang = a * TAU / 7 + r();
      for (var s = 1; s <= 3; s++) put(L, x + Math.round(Math.cos(ang) * s), y + Math.round(Math.sin(ang) * s * 0.7), s === 3 ? C.lf5 : Math.cos(ang) < 0 ? C.lf4 : C.lf3);
    }
    for (var n = 0; n < 3; n++) {
      var fx = x + Math.round((r() - 0.5) * 5), fy = y - 1 - Math.round(r() * 2);
      put(L, fx, fy, bloom); put(L, fx + 1, fy, bloom); put(L, fx, fy - 1, bloom); put(L, fx + 1, fy - 1, C.fl2);
    }
  }
  // A tall ceremonial umbrella: a gilded pole, a domed canopy, a fringe below it.
  function tedung(L, u) {
    var x = u.x, y = u.base, cy = y - u.h, cloth = u.white ? [C.wh1, C.wh1, C.wh0] : [C.ye2, C.ye1, C.go1];
    for (var i = 0; i < u.h; i++) put(L, x, y - i, i % 4 === 0 ? C.go1 : C.wd2);
    [2, 4, 5, 6, 6].forEach(function (hw, i) {
      for (var k = -hw; k <= hw; k++) put(L, x + k, cy - 4 + i, i === 4 ? C.go2 : cloth[k < -hw / 3 ? 0 : k < hw / 2 ? 1 : 2]);
    });
    for (var f = -6; f <= 6; f += 2) put(L, x + f, cy + 1, u.white ? C.wh0 : C.ye1);
    put(L, x, cy - 5, C.go3); put(L, x, cy - 6, C.go2);
    u.canopy = cy - 1;
  }

  var KAMBOJA = [
    { x: 115, base: 150, island: "main", bloom: C.fl1, seed: 71 },
    { x: 204, base: 151, island: "main", bloom: C.fl3, seed: 72 },
    { x: 405, base: 163, island: "right", bloom: C.fl1, seed: 73 }
  ];
  var TEDUNG = [
    { x: 84, base: 149, h: 20, island: "main" },
    { x: 243, base: 150, h: 18, island: "main", white: true },
    { x: 437, base: 163, h: 19, island: "right" }
  ];
  var P = LANGIT.PROPS;
  P.left.push({ base: BANYAN.base, draw: function (L) { trunk(L, BANYAN); crown(L, BANYAN); aerialRoots(L, BANYAN); } });
  KAMBOJA.forEach(function (k) { P[k.island].push({ base: k.base, draw: function (L) { kamboja(L, k); } }); });
  TEDUNG.forEach(function (u) { P[u.island].push({ base: u.base, draw: function (L) { tedung(L, u); } }); });

  // ---- Penjor -------------------------------------------------------------------
  // A bamboo pole standing straight, then bowing over to the left under the
  // weight of its decorations, its tip nodding in the wind.
  var PENJOR = [
    { x: 143, base: 154, island: "main", len: 62, ph: 0.3 },
    { x: 174, base: 155, island: "main", len: 66, ph: 2.1 },
    { x: 395, base: 164, island: "right", len: 56, ph: 4.2 }
  ];
  function curve(p, t) {
    var gust = Math.sin(TAU * t / 3.7 + p.ph) + 0.4 * Math.sin(TAU * t / 1.9 + 2 * p.ph);
    var bend = 1.95 + 0.3 * gust, lean = 0.03 * gust;
    var dy = LANGIT.bob(p.island, t), x = p.x, y = p.base + dy, pts = [[x, y]];
    for (var s = 1; s <= p.len; s++) {
      var f = s / p.len, th = -Math.PI / 2 - lean * f - (f < 0.55 ? 0 : bend * Math.pow((f - 0.55) / 0.45, 1.5));
      x += Math.cos(th); y += Math.sin(th);
      pts.push([x, y]);
    }
    return pts;
  }
  function penjorTip(k, t) {
    var pts = curve(PENJOR[k], t), e = pts[pts.length - 1];
    return { x: Math.round(e[0]), y: Math.round(e[1]) };
  }
  function drawPenjor(f, p, t) {
    var pts = curve(p, t), n = pts.length;
    pts.forEach(function (q, s) {
      var x = Math.round(q[0]), y = Math.round(q[1]);
      set(f, x, y, s % 7 === 0 ? C.bb0 : s < n * 0.5 ? C.bb2 : C.bb1);
      if (s < n * 0.3) set(f, x + 1, y, C.bb0);
      // A curtain of young palm leaf hangs from the bowed part, longer toward the tip.
      if (s > n * 0.5 && s % 2 === 0) {
        var drop = 2 + Math.round(4 * (s / n - 0.5) * 2 * (0.6 + 0.4 * Math.sin(s * 1.7)));
        for (var k = 1; k <= drop; k++) set(f, x + (k > 2 ? -1 : 0), y + k, k === drop ? C.jn0 : k % 2 ? C.jn2 : C.jn1);
      }
    });
    // The ornament at the tip, and offerings tied along the pole.
    var e = pts[n - 1], ex = Math.round(e[0]), ey = Math.round(e[1]);
    [[0, 1, C.jn2], [0, 2, C.jn1], [-1, 2, C.jn2], [1, 2, C.jn1], [0, 3, C.go2], [-1, 4, C.jn1], [1, 4, C.jn0], [0, 5, C.jn2], [0, 6, C.jn0]]
      .forEach(function (o) { set(f, ex + o[0], ey + o[1], o[2]); });
    [[0.22, C.rd1], [0.3, C.go2], [0.38, C.lf4]].forEach(function (o) {
      var q = pts[Math.round(o[0] * n)];
      set(f, Math.round(q[0]) - 1, Math.round(q[1]), o[1]); set(f, Math.round(q[0]) - 1, Math.round(q[1]) + 1, o[1]);
    });
    // The small bamboo shrine near its foot.
    var b = pts[Math.round(0.14 * n)], bx = Math.round(b[0]) + 1, by = Math.round(b[1]);
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) set(f, bx + c, by + r, r === 0 ? C.jn2 : c === 0 ? C.bb2 : C.bb1);
  }
  function set(f, x, y, c) { if (x >= 0 && x < PIX.W && y >= 0 && y < PIX.H) f[y * PIX.W + x] = c; }
  function drawPenjors(f, t) { PENJOR.forEach(function (p) { drawPenjor(f, p, t); }); }

  // ---- Umbul-umbul -------------------------------------------------------------
  // Long narrow flags hanging from tall poles, streaming left, rippling as they go.
  var FLAGS = [
    { x: 339, base: 150, island: "main", h: 44, len: 30, bands: [C.rd1, C.wh1, C.nk], ph: 0 },
    { x: 351, base: 149, island: "main", h: 40, len: 27, bands: [C.rd2, C.ye1, C.ye2, C.rd1], ph: 1.3 },
    { x: 447, base: 163, island: "right", h: 40, len: 27, bands: [C.rd1, C.wh1, C.nk], ph: 2.6 },
    { x: 459, base: 163, island: "right", h: 36, len: 24, bands: [C.rd2, C.ye1, C.ye2, C.rd1], ph: 3.9 }
  ];
  FLAGS.forEach(function (g) { g.top = g.base - g.h; });
  function drawFlag(f, g, t) {
    var dy = LANGIT.bob(g.island, t), top = g.top + dy;
    for (var i = 0; i <= g.h; i++) set(f, g.x, top + i, i < 2 ? C.go2 : i % 6 === 0 ? C.bb0 : C.bb1);
    for (var r = 0; r < g.len; r++) {
      var k = r / g.len, off = Math.round(1 + 2.5 * k + 1.5 * k * Math.sin(r * 0.45 - t * 7 + g.ph)), band = g.bands[Math.floor(r / 3) % g.bands.length];
      for (var w = 0; w < 3; w++) set(f, g.x - off - w, top + 2 + r, w === 2 && r % 2 ? g.bands[0] : band);
    }
    set(f, g.x - Math.round(4 + 1.5 * Math.sin(g.len * 0.45 - t * 7 + g.ph)), top + 2 + g.len, g.bands[0]);
  }
  function drawFlags(f, t) { FLAGS.forEach(function (g) { drawFlag(f, g, t); }); }

  LANGIT.GARDEN = { banyan: BANYAN, kamboja: KAMBOJA, tedung: TEDUNG, penjor: PENJOR, flags: FLAGS, penjorTip: penjorTip };
  LANGIT.drawPenjors = drawPenjors;
  LANGIT.drawFlags = drawFlags;
})(S);
// pixel-kahyangan/src/water.js
// The falls. Holy water gushes from a carved stone spout in the face of the
// main island, and a thinner stream spills from under the lip of the right one.
// Both fall gilded by the sun, then into the Earth's shadow, lean a little
// with the wind, break into spray and drift away as mist.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C;
  var ISLES = LANGIT.ISLES;
  var LIT = PIX.names(["wt1", "wt2", "wt4", "wt3"]);
  var DARK = PIX.names(["wt0", "wt1", "wt2"]);
  var TAIL = 22;

  var FALLS = [
    { island: "main", x: 304, y: 167, width: 9, top: 4, len: 62, speed: 46, seed: 1 },
    { island: "right", x: 452, y: 168, width: 4, top: 2, len: 34, speed: 40, seed: 2 }
  ];
  FALLS.forEach(function (q) {
    var bottom = q.y + q.len + TAIL / 2;
    q.mist = [q.x - 44, bottom - 16, q.x + 12, bottom + 10];
  });

  function set(f, x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c; }

  // One fall at time t: rows below the mouth, each a band of streaks that slide
  // down at the fall's speed; the edges throw spray; the tail breaks apart.
  function drawFall(f, q, t) {
    var dy = LANGIT.bob(q.island, t), y0 = q.y + dy, shade = ISLES[q.island].shadow(q.x) + dy;
    for (var k = 0; k < q.len + TAIL; k++) {
      var y = y0 + k, flow = k - q.speed * t, cx = q.x - k * k / 800;
      var hw = q.top / 2 + (q.width - q.top) / 2 * Math.min(1, k / 30), broken = Math.max(0, (k - q.len) / TAIL);
      hw += broken * 6;
      var ramp = y < shade ? LIT : DARK;
      for (var px = Math.floor(cx - hw); px <= Math.ceil(cx + hw); px++) {
        var u = (px - cx) / Math.max(1, hw), col = px - Math.round(cx);
        if (Math.abs(u) > 1) continue;
        var drop = PIX.hash(px, Math.round(flow), q.seed);
        if (broken > 0 && drop > (1 - broken) * 0.75) continue;
        if (Math.abs(u) > 0.7 && drop < 0.4) continue;
        var val = 0.5 + 0.7 * (PIX.noise(flow / 5, q.seed * 31 + col) - 0.5) + 0.2 * (1 - Math.abs(u)) - 0.15 * u;
        set(f, px, y, ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(val * ramp.length)))]);
      }
    }
  }

  // Mist: puffs born at the foot of each fall, each rising and drifting left on
  // the wind at its own pace, veiling what lies behind and thinning as it goes.
  var PUFFS = 9, LIFE = 7;
  function drawMist(f, q, t) {
    var dy = LANGIT.bob(q.island, t), fy = q.y + q.len + TAIL / 2 + dy;
    for (var i = 0; i < PUFFS; i++) {
      var h1 = PIX.hash(i, q.seed, 1), h2 = PIX.hash(i, q.seed, 2), a = PIX.mod(t + i * LIFE / PUFFS, LIFE);
      var px = q.x - 1 + (h1 - 0.5) * 4 - a * (3 + 3 * h1), py = fy - 2 - a * (0.6 + 1.2 * h2);
      var r = 3 + a * 1.2, dens = Math.pow(1 - a / LIFE, 1.1);
      for (var y = Math.floor(py - r); y <= py + r; y++) for (var x = Math.floor(px - r * 1.3); x <= px + r * 1.3; x++) {
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        var d = Math.hypot((x - px) / 1.25, y - py) / r + (PIX.hash(x >> 1, y >> 1, i) - 0.5) * 0.3, p = y * W + x;
        if (d >= 1) continue;
        if (d < 0.6 * dens) f[p] = LANGIT.MIST[f[p]];
        else if (PIX.dith(x, y, dens * (1 - d) * 1.5)) f[p] = LANGIT.MIST_THIN[f[p]];
      }
    }
  }

  // The spout: the head of a sea monster carved in soft stone, a gilded eye, the
  // water gushing from its open mouth.
  function spout(L, q) {
    var x = q.x, y = q.y - 1;
    [[-3, -4, C.pa3], [-2, -4, C.pa4], [-1, -4, C.pa4], [0, -4, C.pa3], [1, -4, C.pa2], [2, -4, C.pa1],
      [-3, -3, C.pa4], [-2, -3, C.go3], [-1, -3, C.pa3], [0, -3, C.pa3], [1, -3, C.pa2], [2, -3, C.pa1], [3, -3, C.pa1],
      [-3, -2, C.pa3], [-2, -2, C.pa2], [-1, -2, C.pa1], [0, -2, C.pa1], [1, -2, C.pa1], [2, -2, C.pa0],
      [-2, -1, C.pa2], [-1, -1, C.nk], [0, -1, C.nk], [1, -1, C.nk], [2, -1, C.pa1], [-2, 0, C.pa1], [2, 0, C.pa0]]
      .forEach(function (d) { PIX.lset(L, x + d[0], y + d[1], d[2]); });
  }
  // The right fall spills through a notch under the grass.
  function notch(L, q) {
    for (var k = -2; k <= 2; k++) for (var r = 0; r < 3; r++) PIX.lset(L, q.x + k, q.y - 3 + r, r === 0 ? C.gr3 : Math.abs(k) === 2 ? C.rk2 : C.rk0);
  }
  LANGIT.PROPS.main.push({ base: 999, draw: function (L) { spout(L, FALLS[0]); } });
  LANGIT.PROPS.right.push({ base: 999, draw: function (L) { notch(L, FALLS[1]); } });

  LANGIT.FALLS = FALLS;
  LANGIT.drawFalls = function (f, t) { FALLS.forEach(function (q) { drawFall(f, q, t); }); };
  LANGIT.drawMist = function (f, t) { FALLS.forEach(function (q) { drawMist(f, q, t); }); };
})(S);
// pixel-kahyangan/src/fliers.js
// What else flies over Kahyangan. A flock of egrets coming home at dusk to roost
// in the banyan. And high up, a janggan kite with its long tail streaming downwind.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C, TAU = Math.PI * 2;

  function set(f, x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c; }

  // ---- The egrets ---------------------------------------------------------------
  // Wing up, level, down, level; beak yellow, legs trailing dark.
  var BIRD = [
    ["...w...", "...ww..", "ywwwwwk"],
    ["ywwwwwk", "..wwv..", "......."],
    ["ywwwwwk", "...ww..", "...v..."],
    ["ywwwwwk", "..wwv..", "......."]
  ];
  var INK = { w: C.wh1, v: C.eg0, y: C.ye1, k: C.an1 };
  var FLOCK = { start: 14, flight: 24, period: 40, from: [W + 10, 70], to: [26, 136] };
  var V = [[0, 0], [7, -3], [7, 4], [14, -6], [14, 7], [21, -9], [21, 10], [27, -11], [28, 13]];
  function egretsAt(t) {
    var s = PIX.mod(t - FLOCK.start, FLOCK.period), u = s / FLOCK.flight;
    if (u >= 1) return [];
    var lx = FLOCK.from[0] + (FLOCK.to[0] - FLOCK.from[0]) * u, ly = FLOCK.from[1] + (FLOCK.to[1] - FLOCK.from[1]) * Math.pow(u, 1.6);
    var spread = Math.min(1, (1 - u) * 3 + 0.2);
    return V.map(function (o, i) {
      var wob = i ? Math.sin(t * 2 + i) * 0.7 : 0;
      return { x: lx + o[0] * spread, y: ly + o[1] * spread + wob, frame: Math.floor(t * 8 + i * 1.7) % 4 };
    });
  }
  function drawEgrets(f, t) {
    egretsAt(t).forEach(function (b) {
      var rows = BIRD[b.frame], bx = Math.round(b.x), by = Math.round(b.y) - 1;
      rows.forEach(function (row, r) {
        for (var k = 0; k < row.length; k++) if (row[k] !== ".") set(f, bx + k - 1, by + r, INK[row[k]]);
      });
    });
  }
  // Those already home, perched on top of the banyan: necks up, beaks yellow.
  var PERCHED = ["yw..", ".w..", ".wwv", "..wv"];
  LANGIT.PROPS.left.push({ base: 999, draw: function (L) {
    [4, 15, 27, 40, 52, 61].forEach(function (x, i) {
      var y = 90;
      while (y < 170 && PIX.lget(L, x + 1, y + 1) === PIX.NONE) y++;
      var flip = i % 2 === 1;
      PERCHED.forEach(function (row, r) {
        for (var c = 0; c < 4; c++) {
          var ch = row[flip ? 3 - c : c];
          if (ch !== ".") PIX.lset(L, x + c, y - 3 + r, INK[ch]);
        }
      });
    });
  } });

  // ---- The janggan kite -----------------------------------------------------------
  // Flown from somewhere beneath the sea of clouds: a crowned dragon's head in
  // gold and red above wide black and white wings, and a tail in the three
  // sacred colours streaming far downwind.
  var KITE = { x: 382, y: 16, tail: 150 };
  var KITE_ART = [
    "........G.G.G........",
    ".......gGgGgGg.......",
    ".......RgRgRgR.......",
    "........RGRGR........",
    ".........RrR.........",
    "kk.......ywy.......kk",
    "kwkk.....kwk.....kkwk",
    ".kwwkkk..kwk..kkkwwk.",
    ".kwwwwwkkkwkkkwwwwwk.",
    "..kRRwwwwkwkwwwwRRk..",
    "...kkkRRwwkwwRRkkk...",
    "......kkkRkRkkk......",
    ".........kRk.........",
    "..........k.........."
  ];
  var KITE_INK = { G: C.go3, g: C.go2, y: C.go1, R: C.rd2, r: C.rd0, k: C.ij1, w: C.wh1 };
  var BANDS = [C.rd1, C.wh1, C.nk];
  function kiteAt(t) {
    return { x: KITE.x + 3 * Math.sin(TAU * t / 5.3), y: KITE.y + 2 * Math.sin(TAU * t / 3.1 + 1) };
  }
  // The tail hangs from the kite's foot, then streams left, rippling more and
  // more toward its end as the waves run down it.
  function kiteTail(t) {
    var k = kiteAt(t), pts = [];
    for (var s = 0; s < KITE.tail; s++) {
      var drop = 4 * (1 - Math.exp(-s / 10)) + 0.03 * s, amp = 0.4 + 0.04 * s;
      pts.push([k.x - 1 - 0.95 * s, k.y + 8 + drop + amp * Math.sin(0.09 * s - 5 * t)]);
    }
    return pts;
  }
  function kiteString(t) {
    var k = kiteAt(t);
    return { x0: k.x + 1, y0: k.y + 2, x1: W - 1, y1: 150 };
  }
  function drawKite(f, t) {
    var s = kiteString(t);
    // The string, a fine thread catching the light, sagging a little.
    for (var i = 0; i <= 180; i++) {
      var u = i / 180, x = s.x0 + (s.x1 - s.x0) * u, y = s.y0 + (s.y1 - s.y0) * u + 8 * Math.sin(Math.PI * u);
      if (i % 2 === 0) set(f, x, y, C.wh0);
    }
    kiteTail(t).forEach(function (q, i) {
      var c = BANDS[Math.floor(i / 6) % 3], w = i < 40 ? 1 : 0;
      for (var d = -w; d <= w + (i < 90 ? 1 : 0) - 1; d++) set(f, q[0], q[1] + d, c);
      set(f, q[0], q[1], c);
    });
    var k = kiteAt(t), x0 = Math.round(k.x) - 10, y0 = Math.round(k.y) - 6;
    KITE_ART.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) if (row[c] !== ".") set(f, x0 + c, y0 + r, KITE_INK[row[c]]);
    });
  }

  LANGIT.FLIERS = {
    egrets: { at: egretsAt, start: FLOCK.start, flight: FLOCK.flight, period: FLOCK.period },
    kite: { at: kiteAt, tail: kiteTail, string: kiteString }
  };
  LANGIT.drawEgrets = drawEgrets;
  LANGIT.drawKite = drawKite;
})(S);
// pixel-kahyangan/src/splat.js
// A small depth-buffered renderer for what flies through the air over
// Kahyangan. A pinhole camera sits at eye level facing east: straight ahead is
// the middle of the horizon, and one unit at distance z spans F / z pixels.
// Spheres, capsules, lines and triangles are splatted into a buffer where the
// nearest surface wins each pixel, shaded as they are drawn. The buffer is then
// laid over the scene one slice of depth at a time, so what flies there can pass
// behind the islands while it is far and in front of them once it is near.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H;
  var CAM = { cx: W / 2, cy: LANGIT.GEO.horizon, f: 300, near: 0.3 };

  // Screen x and y, and pixels per unit at that distance; null behind the eye.
  function project(p) {
    if (p[2] < CAM.near) return null;
    var k = CAM.f / p[2];
    return [CAM.cx + p[0] * k, CAM.cy - p[1] * k, k];
  }

  function buffer() {
    return {
      depth: new Float32Array(W * H).fill(Infinity), col: new Uint8Array(W * H), part: new Uint8Array(W * H),
      list: new Int32Array(W * H), n: 0
    };
  }
  function clear(b) {
    for (var k = 0; k < b.n; k++) b.depth[b.list[k]] = Infinity;
    b.n = 0;
  }
  // Takes pixel i at depth d, unless something nearer already has it.
  function claim(b, i, d) {
    var old = b.depth[i];
    if (d >= old) return false;
    if (old === Infinity) b.list[b.n++] = i;
    b.depth[i] = d;
    return true;
  }
  function paint(b, x, y, d, part, shade, nx, ny, nz, u, v) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    var i = y * W + x;
    if (!claim(b, i, d)) return;
    b.col[i] = shade(nx, ny, nz, x, y, u, v);
    b.part[i] = part;
  }

  // A sphere of radius r at p. shade(nx, ny, nz, x, y, u) colours each pixel it
  // wins from the surface normal there, which faces us (nz <= 0).
  function sphere(b, p, r, shade, part, u) {
    var q = project(p);
    if (!q) return;
    var sr = r * q[2];
    if (sr < 0.5) {
      paint(b, Math.round(q[0]), Math.round(q[1]), p[2] - r, part, shade, 0, 0, -1, u);
      return;
    }
    var x0 = Math.max(0, Math.ceil(q[0] - sr)), x1 = Math.min(W - 1, Math.floor(q[0] + sr));
    var y0 = Math.max(0, Math.ceil(q[1] - sr)), y1 = Math.min(H - 1, Math.floor(q[1] + sr));
    for (var y = y0; y <= y1; y++) {
      var dy = (y - q[1]) / sr;
      for (var x = x0; x <= x1; x++) {
        var dx = (x - q[0]) / sr, d2 = dx * dx + dy * dy;
        if (d2 > 1) continue;
        var dz = Math.sqrt(1 - d2), i = y * W + x;
        if (!claim(b, i, p[2] - r * dz)) continue;
        b.col[i] = shade(dx, -dy, -dz, x, y, u);
        b.part[i] = part;
      }
    }
  }

  // A capsule from a to c, its radius going from ra to rc; u runs 0 to 1 along it.
  function capsule(b, a, c, ra, rc, shade, part) {
    var qa = project(a), qc = project(c);
    if (!qa || !qc) return;
    var len = Math.hypot(qc[0] - qa[0], qc[1] - qa[1]), rmin = Math.min(ra * qa[2], rc * qc[2]);
    var n = Math.max(1, Math.ceil(len / Math.max(0.5, 0.35 * rmin)));
    for (var k = 0; k <= n; k++) {
      var u = k / n;
      sphere(b, [a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u], ra + (rc - ra) * u, shade, part, u);
    }
  }

  // A line one pixel wide, for things too fine to have a width of their own.
  function line(b, a, c, shade, part) {
    var qa = project(a), qc = project(c);
    if (!qa || !qc) return;
    var n = Math.max(1, Math.ceil(Math.max(Math.abs(qc[0] - qa[0]), Math.abs(qc[1] - qa[1]))));
    for (var k = 0; k <= n; k++) {
      var u = k / n;
      paint(b, Math.round(qa[0] + (qc[0] - qa[0]) * u), Math.round(qa[1] + (qc[1] - qa[1]) * u),
        a[2] + (c[2] - a[2]) * u, part, shade, 0, 0, -1, u);
    }
  }

  // A flat triangle, turned to face us. shade gets its normal, then the weights
  // of the first two corners at that pixel.
  function triangle(b, a, c, e, shade, part) {
    var qa = project(a), qc = project(c), qe = project(e);
    if (!qa || !qc || !qe) return;
    var area = (qc[0] - qa[0]) * (qe[1] - qa[1]) - (qe[0] - qa[0]) * (qc[1] - qa[1]);
    if (Math.abs(area) < 0.25) return;
    var n = normal(a, c, e);
    var x0 = Math.max(0, Math.floor(Math.min(qa[0], qc[0], qe[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(qa[0], qc[0], qe[0])));
    var y0 = Math.max(0, Math.floor(Math.min(qa[1], qc[1], qe[1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(qa[1], qc[1], qe[1])));
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var w0 = ((qc[0] - x) * (qe[1] - y) - (qe[0] - x) * (qc[1] - y)) / area;
        var w1 = ((qe[0] - x) * (qa[1] - y) - (qa[0] - x) * (qe[1] - y)) / area, w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        paint(b, x, y, w0 * a[2] + w1 * c[2] + w2 * e[2], part, shade, n[0], n[1], n[2], w0, w1);
      }
    }
  }
  // The unit normal of a triangle, on the side that faces the eye.
  function normal(a, c, e) {
    var ux = c[0] - a[0], uy = c[1] - a[1], uz = c[2] - a[2], vx = e[0] - a[0], vy = e[1] - a[1], vz = e[2] - a[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
    if (nx * a[0] + ny * a[1] + nz * a[2] > 0) l = -l;
    return [nx / l, ny / l, nz / l];
  }

  // Lays the pixels between depths near and far over the frame f; paint(c, d, x, y,
  // part) may change each colour on the way, to haze what is far.
  function lay(b, f, near, far, paint) {
    for (var k = 0; k < b.n; k++) {
      var i = b.list[k], d = b.depth[i];
      if (d >= near && d < far) f[i] = paint(b.col[i], d, i % W, (i / W) | 0, b.part[i]);
    }
  }

  LANGIT.CAM = CAM;
  LANGIT.SPLAT = {
    project: project, buffer: buffer, clear: clear, claim: claim,
    sphere: sphere, capsule: capsule, line: line, triangle: triangle, lay: lay
  };
})(S);
// pixel-kahyangan/src/flight.js
// The dragon's flight: one closed loop through the air, far off behind the
// temple and close in front of us, with long slow waves in it for the body to
// swim through. Its turning points are set as they look from here, a place on
// the screen and how far off it is, joined by a smooth curve. It flies slowly
// when it is near and faster far off, where the same speed would look like a crawl.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, CAM = LANGIT.CAM, TAU = Math.PI * 2;
  var PERIOD = 60, STEP = 0.01;

  // [screen x, screen y, distance], in the order it flies them: along the back
  // behind the temple, round toward us on the right, close past us, and away on the left.
  var KEYS = [[170, 88, 18], [300, 86, 20.5], [385, 79, 16.5], [438, 76, 11], [428, 72, 6], [354, 65, 3.2],
    [240, 56, 2.2], [120, 61, 3.0], [60, 60, 6], [70, 76, 11], [110, 86, 15]];
  var PTS = KEYS.map(function (k) { return [(k[0] - CAM.cx) * k[2] / CAM.f, (CAM.cy - k[1]) * k[2] / CAM.f, k[2]]; });
  // Swimming: waves up and down and from side to side, long enough to show a few along its
  // body, and gentler close by, where the same wave would fling it about the screen.
  var WAVE = { up: [0.16, 1.9], side: [0.1, 3.1, 0.16] };

  function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unit(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerp(a, b, u) { return add(a, sub(b, a), u); }

  // Centripetal Catmull-Rom between p1 and p2: no loops or cusps however the points lie.
  function catmull(p0, p1, p2, p3, u) {
    var t1 = Math.pow(Math.hypot.apply(null, sub(p1, p0)), 0.5), t2 = t1 + Math.pow(Math.hypot.apply(null, sub(p2, p1)), 0.5);
    var t3 = t2 + Math.pow(Math.hypot.apply(null, sub(p3, p2)), 0.5), t = t1 + (t2 - t1) * u;
    var a1 = lerp(p0, p1, t / t1), a2 = lerp(p1, p2, (t - t1) / (t2 - t1)), a3 = lerp(p2, p3, (t - t2) / (t3 - t2));
    return lerp(lerp(a1, a2, t / t2), lerp(a2, a3, (t - t1) / (t3 - t1)), (t - t1) / (t2 - t1));
  }
  // Walks a closed polyline and puts a point every `step` along it.
  function resample(src, step) {
    var out = [src[0]], carry = 0, n = src.length;
    for (var k = 0; k < n; k++) {
      var a = src[k], b = src[(k + 1) % n], d = Math.hypot.apply(null, sub(b, a)), s = step - carry;
      for (; s <= d; s += step) out.push(lerp(a, b, s / d));
      carry = d - (s - step);
    }
    if (carry < step * 0.5) out.pop();
    return out;
  }
  // A few passes of a moving average round the loop, so it bends without corners.
  function smooth(pts, half, passes) {
    var n = pts.length, w = 2 * half + 1;
    for (var p = 0; p < passes; p++) {
      var out = new Array(n), sum = [0, 0, 0];
      for (var j = -half; j <= half; j++) sum = add(sum, pts[PIX.mod(j, n)], 1);
      for (var k = 0; k < n; k++) {
        out[k] = [sum[0] / w, sum[1] / w, sum[2] / w];
        sum = add(sub(sum, pts[PIX.mod(k - half, n)]), pts[PIX.mod(k + half + 1, n)], 1);
      }
      pts = out;
    }
    return pts;
  }

  // The loop without its waves, and then with them.
  function build() {
    var dense = [], n = PTS.length;
    for (var k = 0; k < n; k++) {
      for (var i = 0; i < 40; i++) dense.push(catmull(PTS[PIX.mod(k - 1, n)], PTS[k], PTS[(k + 1) % n], PTS[(k + 2) % n], i / 40));
    }
    var base = smooth(resample(dense, 0.02), 25, 3), len = base.length * 0.02;
    var lu = len / Math.round(len / WAVE.up[1]), ls = len / Math.round(len / WAVE.side[1]);
    var wavy = base.map(function (p, k) {
      var d = unit(sub(base[(k + 1) % base.length], base[PIX.mod(k - 1, base.length)]));
      var side = unit(cross([0, 1, 0], d)), up = cross(d, side), s = k * 0.02, k2 = Math.min(1, Math.max(0.45, (p[2] - 1) / 4));
      // Farther off it weaves wider from side to side, so even coming straight at us it shows its curves.
      var e = Math.min(1, Math.max(0, (p[2] - 4) / 6)), weave = WAVE.side[0] + WAVE.side[2] * e * e * (3 - 2 * e);
      return add(add(p, up, k2 * WAVE.up[0] * Math.sin(TAU * s / lu)), side, k2 * weave * Math.sin(TAU * s / ls + 1.3));
    });
    return resample(wavy, STEP);
  }
  var PATH = build(), N = PATH.length, LOOP = N * STEP;

  // The way it faces along the loop, and the way its back faces: up, but banked
  // into its turns like a bird.
  var FRAMES = (function () {
    var dirs = PATH.map(function (p, k) { return unit(sub(PATH[(k + 1) % N], PATH[PIX.mod(k - 1, N)])); });
    var bend = smooth(dirs.map(function (d, k) {
      var c = sub(dirs[(k + 1) % N], dirs[PIX.mod(k - 1, N)]);
      return [c[0] / (2 * STEP), 0, c[2] / (2 * STEP)];
    }), 20, 2);
    return dirs.map(function (d, k) {
      var up = add([0, 1, 0], bend[k], 0.4);
      up = unit(add(up, d, -dot(up, d)));
      return { d: d, u: up, s: cross(up, d) };
    });
  })();

  function at(sigma) {
    var k = PIX.mod(sigma, LOOP) / STEP, i = Math.floor(k);
    return lerp(PATH[i % N], PATH[(i + 1) % N], k - i);
  }
  function frame(sigma) {
    var k = PIX.mod(sigma, LOOP) / STEP, i = Math.floor(k), u = k - i, a = FRAMES[i % N], b = FRAMES[(i + 1) % N];
    var d = unit(lerp(a.d, b.d, u)), up = lerp(a.u, b.u, u);
    up = unit(add(up, d, -dot(up, d)));
    return { p: at(sigma), d: d, u: up, s: cross(up, d) };
  }

  // Time along the loop: slow when near, quicker far off, once round every PERIOD seconds.
  var CLOCK = (function () {
    var t = [0], raw = 0;
    for (var k = 0; k < N; k++) {
      raw += STEP / Math.pow(Math.max(0.5, (PATH[k][2] + PATH[(k + 1) % N][2]) / 2), 0.65);
      t.push(raw);
    }
    return t.map(function (v) { return v * PERIOD / raw; });
  })();
  // It is nearest us a little after the page opens, at t = 22.
  var NEAREST = PATH.reduce(function (best, p, k) { return p[2] < PATH[best][2] ? k : best; }, 0);
  var OFFSET = 22 - CLOCK[NEAREST];

  function flown(t) {
    var c = PIX.mod(t - OFFSET, PERIOD), lo = 0, hi = N;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (CLOCK[mid] <= c) lo = mid; else hi = mid - 1; }
    return (lo + (c - CLOCK[lo]) / (CLOCK[lo + 1] - CLOCK[lo])) * STEP;
  }
  function when(sigma) {
    var k = PIX.mod(sigma, LOOP) / STEP, i = Math.floor(k);
    return PIX.mod(CLOCK[i] + (CLOCK[i + 1] - CLOCK[i]) * (k - i) + OFFSET, PERIOD);
  }

  LANGIT.FLIGHT = { period: PERIOD, length: LOOP, at: at, frame: frame, flown: flown, when: when };
  LANGIT.V3 = { add: add, sub: sub, dot: dot, cross: cross, unit: unit, lerp: lerp };
})(S);
// pixel-kahyangan/src/dragonhead.js
// The sky dragon's head, and the light the whole dragon is painted in, after the
// great dragons of Zelda: a long jade snout under a heavy brow, glowing eyes, a jaw
// that breathes, golden antlers swept back, frills at the cheeks, and whiskers and a
// beard streaming on the wind. It is built of spheres, capsules and flat fins in the
// head's own frame, measured in head lengths: f forward from the neck, u up, w aside.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, C = PIX.C, W = PIX.W, H = PIX.H;
  var S = LANGIT.SPLAT, V = LANGIT.V3, FLIGHT = LANGIT.FLIGHT;
  var HL = 0.4;
  // One turn of its loop, in radians per second: its nods and breaths fit a whole number into each.
  var BEAT = 2 * Math.PI / FLIGHT.period;
  var PART = { body: 1, fin: 2, leg: 3, claw: 4, head: 5, jaw: 6, mouth: 7, tooth: 8, eye: 9, horn: 10, frill: 11, hair: 12, mote: 13 };

  // ---- Light ---------------------------------------------------------------------
  // The sun has just set behind us, low and a little to the left, so whatever faces us
  // is lit; the sky lights it from above and the sunlit sea of cloud warms it from below.
  var SUN = V.unit([-0.3, 0.35, -1]);
  function light(nx, ny, nz) {
    var key = nx * SUN[0] + ny * SUN[1] + nz * SUN[2];
    return 0.06 + 0.7 * Math.max(0, key) + 0.07 * (1 + ny) + 0.12 * Math.max(0, -ny);
  }
  function band(ramp, v) {
    var i = Math.floor(v * ramp.length);
    return ramp[i < 0 ? 0 : i >= ramp.length ? ramp.length - 1 : i];
  }
  var INK = {
    jade: PIX.names(["dr1", "dr2", "dr3", "dr4", "dr5", "dr6"]), cream: PIX.names(["pa1", "pa2", "pa3", "pa4", "pa5"]),
    gold: PIX.names(["go0", "go1", "go2", "go3"]), hair: PIX.names(["pa2", "pa3", "pa4", "pa5", "fl1"]),
    mouth: PIX.names(["rd0", "rd1"]), sun: SUN, light: light, band: band,
    goldHair: function (nx, ny, nz) { return band(INK.gold, light(nx, ny, nz) + 0.05); },
    paleHair: function (nx, ny, nz) { return band(INK.hair, light(nx, ny, nz)); }
  };

  // ---- Where the head is and which way it faces ----------------------------------------
  function smooth(v) { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); }
  // Along its flight, nodding a little, and turned to look at us as it passes close by.
  function frame(sigma, t) {
    var fr = FLIGHT.frame(sigma), p = fr.p, look = 0.3 * smooth((6 - p[2]) / 3.5);
    var f = V.unit(V.add(V.add(fr.d, V.unit(p), -look), fr.u, 0.06 * Math.sin(9 * BEAT * t)));
    var u = V.unit(V.add(fr.u, f, -V.dot(fr.u, f)));
    return { p: p, f: f, u: u, s: V.cross(u, f) };
  }
  function place(h, f, u, w) {
    return [h.p[0] + HL * (f * h.f[0] + u * h.u[0] + w * h.s[0]), h.p[1] + HL * (f * h.f[1] + u * h.u[1] + w * h.s[1]),
      h.p[2] + HL * (f * h.f[2] + u * h.u[2] + w * h.s[2])];
  }
  function mirror(v, sd) { return [v[0], v[1], v[2] * sd]; }

  // A hair, whisker or claw from a to c. Wide enough, it is a capsule; finer, a line
  // dithered by how much of each pixel it would cover, so it fades in as it comes near.
  function strand(b, a, c, ra, rc, shade, part) {
    var qa = S.project(a), qc = S.project(c);
    if (!qa || !qc) return;
    var wa = ra * qa[2], wc = rc * qc[2];
    if (Math.max(wa, wc) >= 0.6) { S.capsule(b, a, c, ra, rc, shade, part); return; }
    var cover = Math.min(1, wa + wc), n = Math.max(1, Math.ceil(Math.max(Math.abs(qc[0] - qa[0]), Math.abs(qc[1] - qa[1]))));
    for (var k = 0; k <= n; k++) {
      var u = k / n, x = Math.round(qa[0] + (qc[0] - qa[0]) * u), y = Math.round(qa[1] + (qc[1] - qa[1]) * u);
      if (x < 0 || x >= W || y < 0 || y >= H || !PIX.dith(x, y, cover)) continue;
      var i = y * W + x;
      if (S.claim(b, i, a[2] + (c[2] - a[2]) * u)) { b.col[i] = shade(0, 0, -1, x, y, u); b.part[i] = part; }
    }
  }
  // Shapes placed in the head's frame h, in head lengths.
  function pen(b, h) {
    function at(v) { return place(h, v[0], v[1], v[2]); }
    return {
      ball: function (v, r, shade, part) { S.sphere(b, at(v), r * HL, shade, part); },
      rod: function (a, c, ra, rc, shade, part) { S.capsule(b, at(a), at(c), ra * HL, rc * HL, shade, part); },
      fin: function (a, c, e, shade, part) { S.triangle(b, at(a), at(c), at(e), shade, part); },
      hair: function (a, c, ra, rc, shade, part) { strand(b, at(a), at(c), ra * HL, rc * HL, shade, part); }
    };
  }

  // ---- The head ----------------------------------------------------------------------
  var TEETH = [0.5, 0.58, 0.66];
  var BEAM = [[0.24, 0.24, 0.07], [0.12, 0.4, 0.12], [-0.06, 0.55, 0.18], [-0.3, 0.64, 0.23], [-0.52, 0.66, 0.26]];
  var BEAM_R = [0.05, 0.042, 0.034, 0.026, 0.016];
  var TINES = [[1, [0.2, 0.55, 0.13], [0.23, 0.64, 0.14]], [2, [-0.03, 0.72, 0.2], [0, 0.81, 0.21]], [3, [-0.27, 0.8, 0.25], [-0.23, 0.87, 0.26]]];
  var FRILLS = [[[0.26, 0, 0.16], [0.12, 0.04, 0.17], [-0.14, 0.13, 0.27]], [[0.24, -0.08, 0.15], [0.1, -0.06, 0.16], [-0.18, -0.07, 0.26]],
    [[0.22, -0.14, 0.12], [0.08, -0.14, 0.12], [-0.12, -0.24, 0.2]]];

  // Jade above and cream underneath, as on the body.
  function skinInk(h) {
    return function (nx, ny, nz) {
      var v = light(nx, ny, nz);
      return nx * h.u[0] + ny * h.u[1] + nz * h.u[2] < -0.45 ? band(INK.cream, v + 0.1) : band(INK.jade, v);
    };
  }
  function brow(nx, ny, nz) { return band(INK.jade, light(nx, ny, nz) + 0.08); }
  function nostril() { return C.dr0; }
  function mouth(nx, ny, nz) { return band(INK.mouth, light(nx, ny, nz) - 0.2); }
  function tooth(nx, ny, nz) { var v = light(nx, ny, nz); return v > 0.6 ? C.wh : v > 0.3 ? C.wh1 : C.wh0; }
  function horn(nx, ny, nz, x, y, u) { return band(INK.gold, light(nx, ny, nz) - (u < 0.14 ? 0.22 : 0)); }
  function frill(nx, ny, nz, x, y, w0, w1) { return band(INK.gold, 0.45 * light(nx, ny, nz) + 0.6 * (1 - w0 - w1)); }

  // A broad skull and cheeks, the long snout with a bump over the nostrils, and a heavy
  // brow over each eye.
  function skull(P, skin, fine) {
    P.rod([0.06, 0.05, 0], [0.34, 0.07, 0], 0.19, 0.17, skin, PART.head);
    P.rod([0.34, 0.05, 0], [0.66, 0.035, 0], 0.14, 0.105, skin, PART.head);
    P.rod([0.66, 0.035, 0], [0.9, 0.05, 0], 0.105, 0.08, skin, PART.head);
    P.ball([0.93, 0.07, 0], 0.07, skin, PART.head);
    [-1, 1].forEach(function (sd) {
      P.ball([0.24, -0.03, 0.1 * sd], 0.13, skin, PART.head);
      P.rod([0.28, 0.2, 0.1 * sd], [0.52, 0.16, 0.115 * sd], 0.07, 0.05, brow, PART.head);
      if (fine) P.ball([0.96, 0.1, 0.04 * sd], 0.022, nostril, PART.head);
    });
  }
  // The jaw hangs a little open and breathes; inside, a dark red mouth and white fangs.
  function jaws(P, skin, open, fine) {
    var mid = [0.55, -0.13 - 0.05 * open, 0], chin = [0.84, -0.13 - 0.12 * open, 0];
    P.rod([0.28, -0.06, 0], [0.84, -0.08 - 0.06 * open, 0], 0.07, 0.045, mouth, PART.mouth);
    P.rod([0.2, -0.1, 0], mid, 0.1, 0.075, skin, PART.jaw);
    P.rod(mid, chin, 0.075, 0.06, skin, PART.jaw);
    P.ball(chin, 0.062, skin, PART.jaw);
    if (!fine) return;
    [-1, 1].forEach(function (sd) {
      TEETH.forEach(function (f) { P.hair([f, -0.05, 0.085 * sd], [f + 0.015, -0.105, 0.085 * sd], 0.018, 0.008, tooth, PART.tooth); });
      P.hair([0.78, -0.03, 0.07 * sd], [0.8, -0.15, 0.07 * sd], 0.026, 0.01, tooth, PART.tooth);
      P.hair([0.72, -0.1 - 0.1 * open, 0.07 * sd], [0.71, -0.02 - 0.06 * open, 0.07 * sd], 0.022, 0.009, tooth, PART.tooth);
    });
  }
  // Eyes of glowing gold with a slit pupil and a glint of the last light; now and then a blink.
  function eyes(P, h, shut, fine) {
    [-1, 1].forEach(function (sd) {
      P.ball([0.43, 0.1, 0.14 * sd], 0.062, function (nx, ny, nz) {
        if (shut) return band(INK.jade, light(nx, ny, nz) + 0.1);
        if (nx * SUN[0] + ny * SUN[1] + nz * SUN[2] > 0.95) return C.wh;
        var out = sd * (nx * h.s[0] + ny * h.s[1] + nz * h.s[2]), fwd = nx * h.f[0] + ny * h.f[1] + nz * h.f[2];
        if (fine && out > 0.3 && Math.abs(fwd) < 0.2) return C.nk;
        if (out < 0.25) return C.go2;
        return nx * h.u[0] + ny * h.u[1] + nz * h.u[2] > -0.1 ? C.ye2 : C.ye1;
      }, PART.eye);
    });
  }
  // Golden antlers sweeping back from the brow, ringed where they branch, with three tines each.
  function antlers(P) {
    [-1, 1].forEach(function (sd) {
      for (var i = 1; i < BEAM.length; i++) P.rod(mirror(BEAM[i - 1], sd), mirror(BEAM[i], sd), BEAM_R[i - 1], BEAM_R[i], horn, PART.horn);
      TINES.forEach(function (tn) {
        P.rod(mirror(BEAM[tn[0]], sd), mirror(tn[1], sd), 0.024, 0.016, horn, PART.horn);
        P.rod(mirror(tn[1], sd), mirror(tn[2], sd), 0.016, 0.009, horn, PART.horn);
      });
    });
  }
  // Three golden spikes fanning back from each cheek, stirring in the wind.
  function frills(P, t) {
    [-1, 1].forEach(function (sd) {
      FRILLS.forEach(function (fr, j) {
        var tip = [fr[2][0], fr[2][1] + 0.03 * Math.sin(2.6 * t + 1.7 * j + sd), fr[2][2]];
        P.fin(mirror(fr[0], sd), mirror(fr[1], sd), mirror(tip, sd), frill, PART.frill);
      });
    });
  }

  // Whiskers and a beard trail through the air the snout has just flown through: each
  // point of them is where its root was a moment ago, so they stream and sway behind it
  // as it swims, spreading, drooping and waving as they go.
  function drift(q, h, side, up, droop) {
    return [q[0] + h.s[0] * side + h.u[0] * up, q[1] + h.s[1] * side + h.u[1] * up - droop, q[2] + h.s[2] * side + h.u[2] * up];
  }
  function trails(b, sigma, t, open) {
    var prev = [], n = 24, m = 8, j, k, h, q;
    for (j = 0; j <= n; j++) {
      h = frame(sigma - 0.03 * j, t);
      for (k = 0; k < 2; k++) {
        q = drift(place(h, 0.86, -0.02, 0.16 * k - 0.08), h, 0.004 * j * (2 * k - 1),
          (0.006 + 0.0016 * j) * Math.sin(3.2 * t - 0.5 * j + 2 * k), 0.00022 * j * j);
        if (j) strand(b, prev[k], q, 0.006 - 0.0036 * (j - 1) / n, 0.006 - 0.0036 * j / n, j < 0.55 * n ? INK.goldHair : INK.paleHair, PART.hair);
        prev[k] = q;
      }
    }
    for (j = 0; j <= m; j++) {
      h = frame(sigma - 0.025 * j, t);
      for (k = 0; k < 3; k++) {
        q = drift(place(h, 0.72, -0.19 - 0.1 * open, 0.05 * (k - 1)), h, 0.012 * (k - 1) * j, 0.01 * Math.sin(2.5 * t - 0.6 * j + k), 0.0012 * j * j);
        if (j) strand(b, prev[2 + k], q, 0.009 - 0.0006 * j, 0.0084 - 0.0006 * j, j > 5 ? INK.goldHair : INK.paleHair, PART.hair);
        prev[2 + k] = q;
      }
    }
  }

  // The head at flight distance sigma and time t, with as much detail as its size can show.
  function draw(b, sigma, t) {
    var h = frame(sigma, t), P = pen(b, h), q = S.project(place(h, 0.45, 0.05, 0)), px = HL * q[2], fine = px >= 20;
    var skin = skinInk(h), open = 0.45 + 0.35 * Math.sin(8 * BEAT * t + 0.6 * Math.sin(2 * BEAT * t));
    skull(P, skin, fine);
    jaws(P, skin, open, fine);
    if (px >= 10) eyes(P, h, PIX.mod(t + 1.3, 5) < 0.14, fine);
    antlers(P);
    if (px >= 12) frills(P, t);
    if (px >= 8) trails(b, sigma, t, open);
  }

  LANGIT.DRAGON_HEAD = { length: HL, part: PART, ink: INK, frame: frame, place: place, strand: strand, draw: draw };
})(S);
// pixel-kahyangan/src/dragon.js
// The sky dragon, after the great dragons of Zelda: Breath of the Wild and Tears of
// the Kingdom. It swims one long loop through the air, round and round: out of the
// haze far behind the temple as a faint, flat silhouette, clearer and larger as it
// comes round toward us, close past us in full jade and gold, and away into the haze
// again. Its body follows its head through the air, so every wave it swims runs down
// it. It is drawn in 3D into a depth buffer, then laid over the scene in two slices:
// what is beyond the islands before they are drawn, what is nearer after everything.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C;
  var S = LANGIT.SPLAT, FLIGHT = LANGIT.FLIGHT, HEAD = LANGIT.DRAGON_HEAD;
  var INK = HEAD.ink, PART = HEAD.part, TAU = Math.PI * 2;
  var L = 4, ISLANDS = 5;

  // ---- The body ------------------------------------------------------------------------
  // Its girth: a slim neck, a deep chest, and a long taper to the tail.
  function radius(s) {
    if (s < 0.45) { var u = Math.max(0, s) / 0.45; return 0.052 + 0.033 * u * u * (3 - 2 * u); }
    var v = Math.min(1, (s - 0.45) / (L - 0.45));
    return 0.012 + 0.073 * Math.pow(1 - v * v, 1.2);
  }
  // A slow ripple of muscle running down it as it swims.
  function girth(s, t) { return radius(s) * (1 + 0.03 * Math.sin(2.4 * t - 7 * s)); }
  // Where along the body the spheres of its tube go: closer together where it is thin.
  var SAMPLES = (function () {
    var out = [];
    for (var s = 0; s < L; s += Math.max(0.004, 0.45 * radius(s))) out.push(s);
    return out.concat([L]);
  })();

  function comb(p, a, ka, b, kb, c, kc) {
    return [p[0] + a[0] * ka + b[0] * kb + c[0] * kc, p[1] + a[1] * ka + b[1] * kb + c[1] * kc, p[2] + a[2] * ka + b[2] * kb + c[2] * kc];
  }
  // The point s behind the neck: where it is, which way it faces, its back and side, its girth.
  function spot(sigma, s, t) {
    var fr = FLIGHT.frame(sigma - s);
    return { s: s, p: fr.p, d: fr.d, u: fr.u, w: fr.s, R: girth(s, t) };
  }
  function body(t) {
    var sigma = FLIGHT.flown(t);
    return SAMPLES.map(function (s) {
      var fr = FLIGHT.frame(sigma - s), q = S.project(fr.p), R = girth(s, t);
      return { s: s, p: fr.p, d: fr.d, u: fr.u, w: fr.s, R: R, x: q[0], y: q[1], r: R * q[2], fine: q[2] * 0.045 >= 3 };
    });
  }

  // Overlapping scales in offset rows round the body: dark along each one's rounded free
  // edge, bright just behind the edge of the one before.
  function scale(s, phi) {
    var a = phi / 0.42, row = Math.floor(a), fb = a - row, c = s / 0.045 + (row & 1) * 0.5, fa = c - Math.floor(c);
    var arc = 0.5 + 0.42 * Math.sqrt(Math.max(0, 1 - (2 * fb - 1) * (2 * fb - 1)));
    return fa > arc - 0.16 && fa < arc + 0.02 ? -0.17 : fa < arc - 0.62 ? 0.1 : 0;
  }
  // The tube: a sphere at each sample, shaded by the tube's own normal (without the bumps
  // of the spheres), jade scales above and pale plates along the belly.
  function drawBody(b, pts) {
    var q = null;
    function skin(nx, ny, nz) {
      var dn = nx * q.d[0] + ny * q.d[1] + nz * q.d[2], mx = nx - dn * q.d[0], my = ny - dn * q.d[1], mz = nz - dn * q.d[2];
      var l = Math.sqrt(mx * mx + my * my + mz * mz) || 1;
      mx /= l; my /= l; mz /= l;
      var v = INK.light(mx, my, mz), up = mx * q.u[0] + my * q.u[1] + mz * q.u[2], s = q.s - dn * q.R;
      if (up < -0.45) return INK.band(INK.cream, v + 0.08 - (q.fine && PIX.mod(s, 0.055) > 0.043 ? 0.22 : 0));
      if (q.fine) v += scale(s, Math.atan2(mx * q.w[0] + my * q.w[1] + mz * q.w[2], up));
      return INK.band(INK.jade, v);
    }
    for (var k = 0; k < pts.length; k++) { q = pts[k]; S.sphere(b, q.p, q.R, skin, PART.body); }
  }

  // Golden fins along its back, tall at the shoulders and smaller toward the tail,
  // fluttering in a wave that runs down it.
  function fin(nx, ny, nz, x, y, w0, w1) { return INK.band(INK.gold, 0.45 * INK.light(nx, ny, nz) + 0.6 * (1 - w0 - w1)); }
  function drawFins(b, sigma, t) {
    for (var s = 0.25; s < 3.6; s += 0.16) {
      var a = spot(sigma, s, t), c = spot(sigma, s + 0.1, t), e = spot(sigma, s + 0.15, t);
      var h = 0.075 * (1 - 0.6 * s / L) * (1 + 0.2 * Math.sin(3.1 * t - 2.2 * s));
      S.triangle(b, comb(a.p, a.u, 0.85 * a.R, a.d, 0, a.d, 0), comb(c.p, c.u, 0.85 * c.R, c.d, 0, c.d, 0),
        comb(e.p, e.u, e.R + h, e.d, 0, e.d, 0), fin, PART.fin);
    }
  }

  // Four short legs paddling as it swims, each with three pale claws and a tuft of hair
  // streaming back from the elbow.
  var LEGS = [{ s: 0.62, beat: 0 }, { s: 2.55, beat: 1.9 }];
  function limb(nx, ny, nz) { return INK.band(INK.jade, INK.light(nx, ny, nz) - 0.04); }
  function claw(nx, ny, nz) { return INK.light(nx, ny, nz) > 0.5 ? C.pa5 : C.pa3; }
  function drawLeg(b, q, sd, th) {
    var sw = Math.sin(th), lift = Math.cos(th);
    var hip = comb(q.p, q.u, -0.35 * q.R, q.w, 0.75 * sd * q.R, q.d, 0);
    var knee = comb(hip, q.u, -0.075 + 0.02 * lift, q.w, 0.045 * sd, q.d, -0.035 + 0.05 * sw);
    var ankle = comb(knee, q.u, -0.045, q.w, 0.012 * sd, q.d, 0.045 + 0.035 * sw);
    S.capsule(b, hip, knee, 0.032, 0.022, limb, PART.leg);
    S.capsule(b, knee, ankle, 0.021, 0.016, limb, PART.leg);
    S.sphere(b, ankle, 0.021, limb, PART.leg);
    for (var j = -1; j <= 1; j++) {
      HEAD.strand(b, ankle, comb(ankle, q.d, 0.04 - 0.008 * j * j, q.u, -0.03, q.w, 0.02 * j + 0.008 * sd), 0.008, 0.003, claw, PART.claw);
    }
    HEAD.strand(b, knee, comb(knee, q.d, -0.075, q.u, 0.012 + 0.01 * sw, q.w, 0.02 * sd), 0.011, 0.003, INK.paleHair, PART.hair);
  }
  function drawLegs(b, sigma, t) {
    LEGS.forEach(function (leg) {
      var q = spot(sigma, leg.s, t);
      drawLeg(b, q, -1, 1.7 * t + leg.beat);
      drawLeg(b, q, 1, 1.7 * t + leg.beat + Math.PI);
    });
  }

  // A cream mane from the back of the head down the neck, each lock lifting off the back
  // and waving, golden at the tips; and a tuft of the same at the end of the tail.
  function lock(b, pts, r0, r1, gold) {
    for (var i = 1; i < pts.length; i++) {
      var u = i / (pts.length - 1);
      HEAD.strand(b, pts[i - 1], pts[i], r0 + (r1 - r0) * (u - 1 / (pts.length - 1)), r0 + (r1 - r0) * u, u > gold ? INK.goldHair : INK.paleHair, PART.hair);
    }
  }
  function drawMane(b, sigma, t) {
    for (var j = 0; j < 12; j++) {
      var s0 = -0.04 + 0.03 * j, lean = (j & 1 ? 1 : -1) * (0.15 + 0.5 * PIX.hash(j, 4, 1)), len = 0.4 + 0.25 * PIX.hash(j, 6, 2), pts = [];
      for (var i = 0; i <= 8; i++) {
        var l = len * i / 8, q = spot(sigma, s0 + l, t), lift = q.R + 0.01 + 0.06 * i / 8 + 0.018 * Math.sin(3 * t - 10 * l + j);
        pts.push(comb(q.p, q.u, Math.cos(lean) * lift, q.w, Math.sin(lean) * lift + 0.02 * Math.sin(2.3 * t - 8 * l + 2 * j), q.d, 0));
      }
      lock(b, pts, 0.012, 0.005, 0.75);
    }
  }
  function drawTuft(b, sigma, t) {
    for (var j = 0; j < 5; j++) {
      var ang = TAU * j / 5 + 0.4, spread = 0.08 + 0.1 * PIX.hash(j, 9, 3), pts = [];
      for (var i = 0; i <= 8; i++) {
        var l = 0.045 * i, q = spot(sigma, L - 0.04 + l, t), off = l * spread + (0.003 + 0.003 * i) * Math.sin(4 * t - 0.9 * i + j);
        pts.push(comb(q.p, q.u, Math.cos(ang) * off, q.w, Math.sin(ang) * off, q.d, 0));
      }
      lock(b, pts, 0.01, 0.003, 0.6);
    }
  }

  // ---- Motes of light --------------------------------------------------------------------
  // Glittering motes shed from its scales while it is near: each is born somewhere along
  // the body, sinks slowly as it drifts, twinkles, and goes out.
  var MOTES = 30;
  function sparkles(t) {
    var out = [];
    for (var k = 0; k < MOTES; k++) {
      var life = 2.2 + 1.6 * PIX.hash(k, 3, 1), off = life * PIX.hash(k, 5, 2);
      var n = Math.floor((t - off) / life), born = n * life + off, age = t - born;
      var q = spot(FLIGHT.flown(born), 0.3 + 3.2 * PIX.hash(k, n, 7), born);
      if (q.p[2] > 8) continue;
      var a = TAU * PIX.hash(k, n, 8), p0 = comb(q.p, q.u, q.R * Math.cos(a), q.w, q.R * Math.sin(a), q.d, 0);
      var p = [p0[0] + 0.03 * Math.sin(1.3 * age + k), p0[1] - 0.02 * age - 0.035 * age * age, p0[2]], pr = S.project(p);
      out.push({
        id: k + ":" + n, x: pr[0], y: pr[1], z: p[2], age: age / life,
        on: age < 0.9 * life && Math.sin(TAU * (1.7 * age + PIX.hash(k, n, 9))) > -0.35
      });
    }
    return out;
  }
  function dot(b, i, z, c) { if (S.claim(b, i, z)) { b.col[i] = c; b.part[i] = PART.mote; } }
  function drawMotes(b, t) {
    sparkles(t).forEach(function (m) {
      var x = Math.round(m.x), y = Math.round(m.y), i = y * W + x;
      if (!m.on || x < 1 || x >= W - 1 || y < 1 || y >= H - 1) return;
      dot(b, i, m.z, m.age < 0.3 ? C.wh : m.age < 0.6 ? C.ff1 : C.go3);
      if (m.z < 3.4 && m.age < 0.4) [-1, 1, -W, W].forEach(function (o) { dot(b, i + o, m.z + 0.001, C.go2); });
    });
  }

  // ---- Outline ---------------------------------------------------------------------------
  // Near enough, a dark line round its silhouette and wherever one part of it passes in
  // front of another, as a pixel artist would draw it.
  var EDGE = new Uint8Array(32);
  [PART.body, PART.leg, PART.head, PART.jaw].forEach(function (p) { EDGE[p] = C.dr0; });
  [PART.fin, PART.frill].forEach(function (p) { EDGE[p] = C.go0; });
  function behind(b, i, j, z) { return b.depth[j] > z + (b.part[j] === b.part[i] ? 0.15 : 0.04); }
  function outline(b) {
    for (var k = 0; k < b.n; k++) {
      var i = b.list[k], z = b.depth[i], ink = EDGE[b.part[i]], x = i % W;
      if (!ink || z > 6) continue;
      if ((x > 0 && behind(b, i, i - 1, z)) || (x < W - 1 && behind(b, i, i + 1, z)) ||
        (i >= W && behind(b, i, i - W, z)) || (i < W * (H - 1) && behind(b, i, i + W, z))) b.col[i] = ink;
    }
  }

  // ---- Haze --------------------------------------------------------------------------------
  // Far off, the air between us and it veils it in the colour of the sky behind, and its
  // own light and shade flatten into one dark silhouette. Both come in sixteen steps, each
  // mix taken to the nearest colour in the palette, worked out once and kept.
  var SIL = C.dr1, AIR = new Uint8Array(H * 4), SLOT = new Int16Array(256).fill(-1), SKIES = [];
  for (var y = 0; y < H; y++) {
    for (var x = 0; x < 4; x++) {
      var c = LANGIT.skyAt(x, y);
      if (SLOT[c] < 0) { SLOT[c] = SKIES.length; SKIES.push(c); }
      AIR[y * 4 + x] = c;
    }
  }
  var MIX = new Uint8Array(PIX.PALETTE.length * SKIES.length * 17 * 17).fill(255);
  function fogAt(d) { return d <= 2.6 ? 0 : Math.min(0.85, 1 - Math.exp((2.6 - d) / 12)); }
  function flatAt(d) { var u = (d - 4) / 6; return u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u); }
  function blend(c, sky, f, g) {
    var a = PIX.RGB[c], s = PIX.RGB[SIL], k = PIX.RGB[sky], out = [0, 0, 0];
    for (var i = 0; i < 3; i++) { var m = a[i] + (s[i] - a[i]) * f; out[i] = m + (k[i] - m) * g; }
    return PIX.nearest(out[0], out[1], out[2]);
  }
  // Its eyes and the motes glow, so they neither flatten nor fade as much.
  function haze(c, d, x, y, part) {
    var glow = part === PART.eye || part === PART.mote;
    var lf = glow ? 0 : Math.round(16 * flatAt(d)), lg = Math.round(16 * (glow ? 0.5 * fogAt(d) : fogAt(d)));
    if (!lf && !lg) return c;
    var sky = SLOT[AIR[y * 4 + (x & 3)]], key = ((c * SKIES.length + sky) * 17 + lf) * 17 + lg;
    if (MIX[key] === 255) MIX[key] = blend(c, SKIES[sky], lf / 16, lg / 16);
    return MIX[key];
  }

  // ---- The frame -----------------------------------------------------------------------------
  // The whole dragon at time t, drawn once and kept for both slices.
  var BUF = S.buffer(), SHOWN = NaN;
  function cover(t) {
    if (t === SHOWN) return BUF;
    S.clear(BUF);
    SHOWN = t;
    var sigma = FLIGHT.flown(t);
    HEAD.draw(BUF, sigma, t);
    drawBody(BUF, body(t));
    drawLegs(BUF, sigma, t);
    drawFins(BUF, sigma, t);
    drawMane(BUF, sigma, t);
    drawTuft(BUF, sigma, t);
    drawMotes(BUF, t);
    outline(BUF);
    return BUF;
  }
  function drawFar(f, t) { S.lay(cover(t), f, ISLANDS, Infinity, haze); }
  function drawNear(f, t) { S.lay(cover(t), f, 0, ISLANDS, haze); }

  function head(t) {
    var h = HEAD.frame(FLIGHT.flown(t), t), c = HEAD.place(h, 0.45, 0.05, 0), q = S.project(c);
    return { x: q[0], y: q[1], z: c[2], size: HEAD.length * q[2] };
  }
  function neck(t) { return FLIGHT.at(FLIGHT.flown(t)); }

  LANGIT.DRAGON = {
    period: FLIGHT.period, length: L, headLength: HEAD.length, islandDepth: ISLANDS,
    head: head, body: body, neck: neck, flown: FLIGHT.flown, at: FLIGHT.at, when: FLIGHT.when,
    sparkles: sparkles, cover: cover
  };
  LANGIT.drawDragonFar = drawFar;
  LANGIT.drawDragonNear = drawNear;
})(S);
// pixel-kahyangan/src/people.js
// The procession. Women in kebaya and kamen come along the left island under
// the banyan, each with a gebogan, a tower of fruit and flowers, balanced on
// her head. They climb a stair of floating stones to the main island, walk
// along the front of the temple wall, and pass into the kori.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C, TAU = Math.PI * 2;
  var ISLES = LANGIT.ISLES, KORI = LANGIT.TEMPLE.kori;

  // ---- The stair --------------------------------------------------------------------
  var STONES = [];
  for (var k = 0; k < 10; k++) STONES.push({ x: Math.round(56 + 4.4 * k), y: 200 - 5 * k, w: 6 });
  function stoneAt(k, t) {
    var s = STONES[k];
    return { x: s.x, y: s.y + Math.round(Math.sin(TAU * t / (3 + 0.37 * k) + k * 1.3)), w: s.w };
  }
  // A slab of paras: a sunlit top, a carved face, and a little drip of rock
  // beneath it to show that it floats.
  function drawStone(f, q) {
    for (var c = 0; c < q.w; c++) {
      var end = c === 0 || c === q.w - 1;
      set(f, q.x + c, q.y, end ? C.pa3 : C.pa4);
      set(f, q.x + c, q.y + 1, end ? C.pa2 : C.pa3);
      set(f, q.x + c, q.y + 2, end ? C.pa1 : C.pa2);
    }
    set(f, q.x + 1, q.y + 3, C.pa1); set(f, q.x + 2, q.y + 3, C.pa1); set(f, q.x + 3, q.y + 3, C.pa0); set(f, q.x + 4, q.y + 3, C.pa0);
    set(f, q.x + 2, q.y + 4, C.pa0); set(f, q.x + 3, q.y + 4, C.rk1);
    if ((q.x * 7) % 3 === 0) set(f, q.x + q.w - 2, q.y, C.gr4);
  }

  function set(f, x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c; }
  // An island's walking line, clamped to the island's ends.
  function ground(name, x, t) {
    var s = ISLES[name], xx = x;
    while (isNaN(s.lip(xx)) && xx < s.cx) xx++;
    while (isNaN(s.lip(xx)) && xx > s.cx) xx--;
    return s.lip(xx) - 1 + LANGIT.bob(name, t);
  }

  // ---- The path ---------------------------------------------------------------------
  // Waypoints where the feet go, each placed afresh at time t since islands
  // and stones all bob. Stair legs are walked more slowly.
  var WAY = [];
  for (var x = -8; x <= 52; x += 6) WAY.push({ x: x, at: groundAt("left", x) });
  STONES.forEach(function (s, k) { WAY.push({ x: s.x + 3, at: function (t) { return stoneAt(k, t).y - 1; }, stair: true }); });
  for (x = 101; x < KORI.x; x += 6) WAY.push({ x: x, at: groundAt("main", x), stair: x === 101 });
  WAY.push({ x: KORI.x, at: function (t) { return KORI.base + LANGIT.bob("main", t); } });
  function groundAt(name, x) { return function (t) { return ground(name, x, t); }; }

  var FLAT = 6, CLIMB = 4, FADE = 1.6, N = 6, GAP = 7;
  var LEGS = [];
  var total = 0;
  for (var i = 1; i < WAY.length; i++) {
    var a = WAY[i - 1], b = WAY[i], len = Math.hypot(b.x - a.x, b.at(0) - a.at(0));
    LEGS.push({ a: a, b: b, t0: total, dur: len / (b.stair ? CLIMB : FLAT), stair: !!b.stair });
    total += LEGS[LEGS.length - 1].dur;
  }
  var WALK = total, PERIOD = N * GAP;

  function smooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  // Where walker i is at time t, or null while she is between rounds.
  function walker(i, t) {
    var tau = PIX.mod(t - i * GAP, PERIOD);
    if (tau >= WALK + FADE) return null;
    var alpha = tau > WALK ? 1 - (tau - WALK) / FADE : 1, s = Math.min(tau, WALK - 1e-6);
    for (var k = 0; k < LEGS.length && LEGS[k].t0 + LEGS[k].dur <= s; k++);
    var leg = LEGS[Math.min(k, LEGS.length - 1)], u = (s - leg.t0) / leg.dur;
    var ya = leg.a.at(t), yb = leg.b.at(t);
    // On a stair she steps up early, then walks on across the stone.
    var y = ya + (yb - ya) * (leg.stair ? smooth((u - 0.1) / 0.5) : u);
    return { i: i, x: leg.a.x + (leg.b.x - leg.a.x) * u, y: y, alpha: alpha, step: Math.floor(tau * 4) % 2, stair: leg.stair };
  }
  function walkers(t) {
    var out = [];
    for (var i = 0; i < N; i++) { var w = walker(i, t); if (w) out.push(w); }
    return out;
  }

  // ---- The women --------------------------------------------------------------------
  // Drawn from the top of the gebogan down to the feet, facing right.
  var BODY = [
    "..j..",
    "..F..",
    ".rYr.",
    ".GpG.",
    "YrOrY",
    "pGYGp",
    ".DDD.",
    "..d..",
    ".hhh.",
    ".hsS.",
    ".KkK.",
    ".KKKs",
    ".BBB.",
    ".CcC.",
    ".cCc.",
    ".CcC."
  ];
  var FEET = [".s.s.", "..ss."];
  var DRESS = [
    { K: C.wh1, k: C.wh0, B: C.ye1, C: C.go1, c: C.go0 },
    { K: C.ye2, k: C.ye1, B: C.rd2, C: C.br1, c: C.br0 },
    { K: C.pn1, k: C.pn0, B: C.go2, C: C.gr2, c: C.gr1 },
    { K: C.wh1, k: C.wh0, B: C.pn0, C: C.rk2, c: C.rk1 },
    { K: C.fl0, k: C.pa3, B: C.ye1, C: C.wd2, c: C.wd1 },
    { K: C.wh1, k: C.eg0, B: C.rd1, C: C.go2, c: C.go1 }
  ];
  var FRUIT = [
    { r: C.rd2, Y: C.ye1, G: C.gr4, p: C.pn1, O: C.br4, F: C.fl3 },
    { r: C.br4, Y: C.ye2, G: C.gr5, p: C.fl1, O: C.rd2, F: C.fl2 },
    { r: C.rd1, Y: C.go2, G: C.lf5, p: C.pn1, O: C.ye1, F: C.fl1 }
  ];
  var SKIN = { h: C.hr, s: C.sn2, S: C.sn1, j: C.jn1, D: C.go1, d: C.wd2 };
  function drawWoman(f, w) {
    var x0 = Math.round(w.x) - 2, feet = Math.round(w.y), top = feet - BODY.length;
    var dress = DRESS[w.i % DRESS.length], fruit = FRUIT[w.i % FRUIT.length];
    function ink(ch) { return dress[ch] !== undefined ? dress[ch] : fruit[ch] !== undefined ? fruit[ch] : SKIN[ch]; }
    function put(x, y, ch) {
      if (ch === "." || (w.alpha < 1 && !PIX.dith(x, y, w.alpha))) return;
      set(f, x, y, ink(ch));
    }
    BODY.forEach(function (row, r) { for (var c = 0; c < 5; c++) put(x0 + c, top + r, row[c]); });
    var legs = FEET[w.step];
    for (var c = 0; c < 5; c++) put(x0 + c, feet, legs[c] === "s" ? "S" : ".");
  }

  LANGIT.PEOPLE = { stones: STONES, stoneAt: stoneAt, walkers: walkers, period: PERIOD, walk: WALK };
  LANGIT.drawPeople = function (f, t) {
    STONES.forEach(function (s, k) { drawStone(f, stoneAt(k, t)); });
    walkers(t).sort(function (a, b) { return a.x - b.x; }).forEach(function (w) { drawWoman(f, w); });
  };
})(S);
// pixel-kahyangan/src/bridge.js
// A rope bridge slung across the gap from the end of the main island to the
// right island: planks on a sagging curve, a hand rope above them tied to the
// flag pole on one side and a post on the other, little tassels hanging from
// the rope. Both ends ride with their islands, and the bridge breathes.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C, TAU = Math.PI * 2;
  var ISLES = LANGIT.ISLES;
  var A = 352, B = 388, TASSEL = [C.ye1, C.wh1, C.rd2];

  function set(f, x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c; }
  function at(t) {
    var ay = ISLES.main.lip(A) + LANGIT.bob("main", t), by = ISLES.right.lip(B) + LANGIT.bob("right", t);
    var sag = 4.5 + 0.6 * Math.sin(TAU * t / 4.3);
    function u(x) { return (x - A) / (B - A); }
    function deck(x) { return ay + (by - ay) * u(x) + sag * Math.sin(Math.PI * u(x)); }
    function rope(x) { return deck(x) - 5 - 1.5 * Math.sin(Math.PI * u(x)); }
    return { a: [A, ay], b: [B, by], deck: deck, rope: rope };
  }
  function draw(f, t) {
    var b = at(t);
    for (var x = A; x <= B; x++) {
      var y = Math.round(b.deck(x)), r = Math.round(b.rope(x)), k = x - A;
      if (k % 3 === 0) for (var yy = r + 1; yy < y; yy++) set(f, x, yy, C.bb0);
      set(f, x, r, C.bb1);
      set(f, x, y, k % 3 === 2 ? C.wd1 : C.wd2);
      set(f, x, y + 1, C.wd0);
      if (k % 6 === 4) {
        var c = TASSEL[(k / 6 | 0) % 3], sway = Math.round(0.6 * Math.sin(t * 3 + k));
        set(f, x + sway, r + 1, c); set(f, x + sway, r + 2, c);
      }
    }
    // The rope is tied to the flag pole on the main island, and to a post on the right one.
    set(f, A - 1, Math.round(b.rope(A)), C.bb0);
    for (var py = Math.round(b.b[1]) - 7; py <= Math.round(b.b[1]); py++) set(f, B, py, C.wd1);
    set(f, B, Math.round(b.b[1]) - 8, C.go2);
  }

  LANGIT.BRIDGE = { at: at };
  LANGIT.drawBridge = draw;
})(S);
// pixel-kahyangan/src/air.js
// What drifts in the air at dusk: frangipani petals shaken loose and carried
// off to the left, fireflies waking over the banyan and the gardens, and the
// smoke of incense curling up from the offerings and away on the wind.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT, W = PIX.W, H = PIX.H, C = PIX.C, TAU = Math.PI * 2;
  var TREES = LANGIT.GARDEN.kamboja;

  function set(f, x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c; }

  // ---- Petals -------------------------------------------------------------------------
  var PER_TREE = 4, LIFE = 9;
  function petals(t) {
    var out = [];
    TREES.forEach(function (tree, k) {
      for (var i = 0; i < PER_TREE; i++) {
        var h1 = PIX.hash(k, i, 5), h2 = PIX.hash(k, i, 6), clock = t + (i + k * 0.37) * LIFE / PER_TREE;
        var a = PIX.mod(clock, LIFE), born = t - a;
        var x0 = tree.x + (h1 - 0.5) * 14, y0 = tree.base - 10 - 8 * h2 + LANGIT.bob(tree.island, born);
        out.push({
          id: k * 100 + i + ":" + Math.floor(clock / LIFE), tree: k, age: a, colour: tree.bloom,
          x: x0 - 5.5 * a - 0.15 * a * a + 1.5 * Math.sin(a * 2.2 + h1 * 6),
          y: y0 + 3.2 * a + 0.8 * Math.sin(a * 3.1 + h2 * 5),
          flip: Math.floor(t * 6 + h1 * 10) % 2
        });
      }
    });
    return out;
  }
  function drawPetal(f, p) {
    set(f, p.x, p.y, p.colour);
    if (p.flip) set(f, p.x + 1, p.y, C.fl2);
  }

  // ---- Fireflies ----------------------------------------------------------------------
  var HOMES = [[10, 188], [30, 176], [48, 193], [62, 168], [118, 139], [202, 138], [410, 150], [442, 153]];
  function fireflies(t) {
    return HOMES.map(function (h, i) {
      var glow = Math.sin(TAU * t / (2.1 + 0.3 * i) + i * 1.7);
      return {
        id: i, on: glow > 0.2, glow: glow,
        x: h[0] + 6 * Math.sin(t * 0.37 * (1 + 0.1 * i) + i) + 3 * Math.sin(t * 0.9 + 2 * i),
        y: h[1] + 4 * Math.sin(t * 0.29 * (1 + 0.13 * i) + 3 * i) + 2 * Math.sin(t * 1.1 + i)
      };
    });
  }
  function drawFirefly(f, q) {
    if (!q.on) return;
    var x = Math.round(q.x), y = Math.round(q.y);
    if (q.glow > 0.7) { set(f, x - 1, y, C.ff0); set(f, x + 1, y, C.ff0); set(f, x, y - 1, C.ff0); set(f, x, y + 1, C.ff0); }
    set(f, x, y, C.ff1);
  }

  // ---- Incense ------------------------------------------------------------------------
  // A stick standing in the offering on the threshold of the kori, and another
  // at the foot of the kulkul; each lets up a thread of smoke that leans away
  // downwind.
  var INCENSE = [{ x: 160, y: 153, island: "main" }, { x: 419, y: 161, island: "right" }];
  var RISE = 34;
  function drawIncense(f, s, t) {
    var dy = LANGIT.bob(s.island, t), y0 = s.y + dy;
    set(f, s.x, y0, C.wd1); set(f, s.x, y0 - 1, C.wd2); set(f, s.x, y0 - 2, C.rd2);
    for (var k = 1; k <= RISE; k++) {
      var x = s.x - 0.35 * k - 0.012 * k * k + (k / 12) * Math.sin(0.33 * k - 2.2 * t), y = y0 - 2 - k;
      var alpha = 1 - k / RISE, px = Math.round(x), py = Math.round(y);
      for (var w = 0; w < (k < 12 ? 2 : 1); w++) {
        if (px - w < 0 || px - w >= W || py < 0 || py >= H || !PIX.dith(px - w, py, alpha)) continue;
        var p = py * W + px - w;
        f[p] = k < 16 ? C.sm1 : LANGIT.MIST[f[p]];
      }
    }
  }

  LANGIT.AIR = { petals: petals, fireflies: fireflies, incense: INCENSE };
  LANGIT.drawAir = function (f, t) {
    INCENSE.forEach(function (s) { drawIncense(f, s, t); });
    petals(t).forEach(function (p) { drawPetal(f, p); });
    fireflies(t).forEach(function (q) { drawFirefly(f, q); });
  };
})(S);
// pixel-kahyangan/src/scene.js
// Senja di Kahyangan: composes the layers back to front. Every pixel of a
// frame is a pure function of the time t in seconds.
(function (G) {
  var PIX = G.PIX, LANGIT = G.LANGIT;

  // The sky and the far volcanoes never change, so they are baked into one frame.
  var BG = PIX.fb();
  LANGIT.bakeSky(BG);

  // Everything standing on the islands, baked onto them back to front.
  Object.keys(LANGIT.PROPS).forEach(function (name) {
    var L = LANGIT.ISLES.layer(name);
    LANGIT.PROPS[name].slice().sort(function (a, b) { return a.base - b.base; }).forEach(function (p) { p.draw(L); });
  });

  var STEPS = [
    ["sky", function (f, t) { f.set(BG); LANGIT.drawWisps(f, t); }],
    ["far isles", function (f, t) { LANGIT.drawFarIsles(f, t); }],
    // The dragon comes twice: what of it is beyond the islands now, and the rest at the end.
    ["dragon far", function (f, t) { LANGIT.drawDragonFar(f, t); }],
    ["kite", function (f, t) { LANGIT.drawKite(f, t); }],
    ["far clouds", function (f, t) { LANGIT.drawFarClouds(f, t); }],
    ["right island", function (f, t) { LANGIT.drawRight(f, t); }],
    ["main island", function (f, t) { LANGIT.drawMain(f, t); }],
    ["egrets", function (f, t) { LANGIT.drawEgrets(f, t); }],
    ["left island", function (f, t) { LANGIT.drawLeft(f, t); }],
    ["people", function (f, t) { LANGIT.drawPeople(f, t); }],
    ["bridge", function (f, t) { LANGIT.drawBridge(f, t); }],
    ["penjor", function (f, t) { LANGIT.drawPenjors(f, t); }],
    ["flags", function (f, t) { LANGIT.drawFlags(f, t); }],
    ["water", function (f, t) { LANGIT.drawFalls(f, t); }],
    ["air", function (f, t) { LANGIT.drawAir(f, t); }],
    ["near clouds", function (f, t) { LANGIT.drawNearClouds(f, t); }],
    ["mist", function (f, t) { LANGIT.drawMist(f, t); }],
    ["dragon near", function (f, t) { LANGIT.drawDragonNear(f, t); }]
  ];

  // Renders frame t; `until` stops after the named step, for tests.
  function render(f, t, until) {
    for (var k = 0; k < STEPS.length; k++) {
      STEPS[k][1](f, t);
      if (STEPS[k][0] === until) return;
    }
  }

  LANGIT.STEPS = STEPS;
  LANGIT.BG = BG;
  LANGIT.render = render;
})(S);
  var fb = S.PIX.fb();
  return { w: S.PIX.W, h: S.PIX.H, draw: function (out, t) { S.LANGIT.render(fb, t); S.PIX.toRGBA(fb, out); } };
})();
