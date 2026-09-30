// Siang di Raja Ampat, bundled for the gallery by tools/build.mjs from ~/projects/pixel-raja-ampat.
// Its modules get the private scope S instead of the page's global object. Do not edit by hand.
(globalThis.GALERI = globalThis.GALERI || {}).raja = (function () {
  var S = {};
// pixel-raja-ampat/src/pixel.js
// Tiny indexed-colour pixel engine for Siang di Raja Ampat: a 480x270
// framebuffer of palette indices, ordered dithering, hash noise, baked layers
// and colour tables. Everything is a pure function, so a frame depends only on time.
(function (G) {
  var W = 480, H = 270, NONE = 255;
  var PALETTE = [
    // Daytime sky, deep azure overhead to a pale haze at the horizon, and the sun.
    ["sk0", "#1450c0"], ["sk1", "#1b5fcb"], ["sk2", "#236ed5"], ["sk3", "#2e7fdf"], ["sk4", "#3d90e7"],
    ["sk5", "#52a3ee"], ["sk6", "#6bb6f3"], ["sk7", "#88c8f7"], ["sk8", "#a8d9fa"], ["sk9", "#c8e9fc"],
    ["su0", "#fff6c8"], ["su1", "#fffbe6"], ["wh", "#ffffff"],
    // Fair-weather cumulus, sunlit on top and blue-grey underneath.
    ["cl1", "#eef6fd"], ["cl2", "#dbe9f6"], ["cl3", "#c3d8ef"], ["cl4", "#a7c2e4"], ["cl5", "#8aa9d6"],
    // The sea seen from the surface, deep blue at the horizon to turquoise over the reef.
    ["fs0", "#0f4a96"], ["fs1", "#155aa6"], ["fs2", "#1b6db5"], ["fs3", "#2283c2"], ["fs4", "#2c9ccc"],
    ["fs5", "#3ab5d2"], ["fs6", "#52cbd6"], ["fs7", "#7fdfe0"], ["fo0", "#e8fbfb"],
    // Distant islands, blued by the air in between.
    ["fi0", "#3c7d8c"], ["fi1", "#5a9699"], ["fi2", "#7cb0ad"], ["fi3", "#9ec8c2"],
    // The near karst island: jungle and limestone.
    ["jg0", "#0f3320"], ["jg1", "#174a2a"], ["jg2", "#226233"], ["jg3", "#327c38"], ["jg4", "#4c973b"],
    ["jg5", "#74b544"], ["jg6", "#a6d45a"],
    ["ls0", "#2f2e2e"], ["ls1", "#4c4a45"], ["ls2", "#6f6a60"], ["ls3", "#958e7e"], ["ls4", "#bdb5a0"], ["ls5", "#ddd6c0"],
    // Wood, thatch and beach sand.
    ["wd0", "#3b2616"], ["wd1", "#62401f"], ["wd2", "#8e6232"], ["wd3", "#b98c52"],
    ["th0", "#7a6532"], ["th1", "#b0934c"], ["th2", "#dcc27a"],
    ["bs0", "#d9c690"], ["bs1", "#efe2b6"], ["bs2", "#fbf5dc"],
    // The longboat, its motor and its tarp.
    ["bt0", "#1a4c9c"], ["bt1", "#d33b2c"], ["bt2", "#f0f2ec"], ["bt3", "#b9c0c0"], ["mo0", "#22262e"], ["mo1", "#4a515e"],
    ["ta0", "#b8541c"], ["ta1", "#e87a2e"], ["ta2", "#ffa45a"],
    // People: skin, hair, a boatman's shirt, a snorkeler's rash guard, a diver's wetsuit.
    ["pk0", "#5e3a26"], ["pk1", "#8c5a3a"], ["pk2", "#b98058"], ["hk", "#17110e"],
    ["ps0", "#2a6e4a"], ["ps1", "#3f9a66"], ["rg0", "#9c1f2a"], ["rg1", "#d93a3a"], ["dv0", "#151923"], ["dv1", "#2a3140"],
    // Water, bright aqua under the surface to deep blue at the bottom, and the surface seen from below.
    ["uw0", "#62e2ee"], ["uw1", "#4dd3ea"], ["uw2", "#3cc3e5"], ["uw3", "#2fb2df"], ["uw4", "#25a1d8"], ["uw5", "#1d8fd0"],
    ["uw6", "#177ec7"], ["uw7", "#126ebd"], ["uw8", "#0f60b2"], ["uw9", "#0c53a6"], ["uw10", "#0a4799"], ["uw11", "#083c8b"],
    ["sf0", "#9df3f5"], ["sf1", "#cdfcfb"], ["sf2", "#f2fffe"],
    // Reef rock and sand, cooled by the water.
    ["rk0", "#1e3050"], ["rk1", "#33475f"], ["rk2", "#4f6072"], ["rk3", "#707c86"], ["rk4", "#969c98"], ["rk5", "#b9b8a6"],
    ["sd0", "#6f9ca6"], ["sd1", "#95b9b3"], ["sd2", "#b8d1bd"], ["sd3", "#d6e2c6"], ["sd4", "#eef2d6"],
    // Corals: pink, orange, purple, yellow, green, table-coral tan, blue tips, red sea fans, giant clams.
    ["cp0", "#6e1f4c"], ["cp1", "#a63468"], ["cp2", "#d9538c"], ["cp3", "#ff86b6"], ["cp4", "#ffc1da"],
    ["co0", "#7e3417"], ["co1", "#c65728"], ["co2", "#f7843b"], ["co3", "#ffb46e"],
    ["cv0", "#37286a"], ["cv1", "#5d40a0"], ["cv2", "#8d68d0"], ["cv3", "#bf9ff0"],
    ["cy0", "#6e5a14"], ["cy1", "#b8962a"], ["cy2", "#e8cc48"], ["cy3", "#fbeb96"],
    ["cg0", "#184f45"], ["cg1", "#267d63"], ["cg2", "#45ab84"], ["cg3", "#86d8ab"],
    ["ct0", "#54432f"], ["ct1", "#86704c"], ["ct2", "#b59c6e"], ["ct3", "#dbc796"],
    ["cb0", "#1b4595"], ["cb1", "#3572d3"], ["cb2", "#74acf7"],
    ["fr0", "#5e1428"], ["fr1", "#a0243a"], ["fr2", "#d8424e"],
    ["gc0", "#173582"], ["gc1", "#2c62d8"], ["gc2", "#63c8fa"],
    // Big animals: a hawksbill turtle, a blacktip reef shark.
    ["tt0", "#33240f"], ["tt1", "#5f421c"], ["tt2", "#8f6630"], ["tt3", "#c3924c"], ["tt4", "#e3bd7a"],
    ["tk0", "#3f4a2c"], ["tk1", "#6f7a4a"], ["tk2", "#a2ad74"],
    ["sh0", "#2a3a4c"], ["sh1", "#4f6377"], ["sh2", "#8497a8"], ["sh3", "#c6d2dc"],
    // Reef fish.
    ["fy0", "#b88a0e"], ["fy1", "#ffd23a"], ["fy2", "#fff08a"],
    ["fb0", "#183596"], ["fb1", "#2c5ee6"], ["fb2", "#6c9cff"],
    ["fn0", "#a8400e"], ["fn1", "#ff741e"], ["fn2", "#ffae6a"],
    ["fk", "#0e1118"], ["fw", "#f7fbff"],
    ["fp0", "#127a6c"], ["fp1", "#2cc6a8"], ["fp2", "#86ecd2"],
    ["sv0", "#7f9cb6"], ["sv1", "#b9cfdf"], ["sv2", "#e6f0f7"],
    // Moon jellies, and the frigatebirds overhead.
    ["jl0", "#cde8ff"], ["jl1", "#b692e0"],
    ["bd0", "#15171f"], ["bd1", "#3a3d48"],
    // The mosasaur: slate skin above and a pale belly, ivory teeth, a red mouth, a golden eye.
    ["ms0", "#0b1216"], ["ms1", "#16222a"], ["ms2", "#243540"], ["ms3", "#364b55"], ["ms4", "#4f666c"], ["ms5", "#71888a"],
    ["mv0", "#6d7a74"], ["mv1", "#97a298"], ["mv2", "#c2c7b4"], ["mv3", "#e3e3cf"],
    ["mt0", "#b3a07c"], ["mt1", "#ded2b0"], ["mt2", "#fbf6e4"],
    ["mm0", "#3b0d16"], ["mm1", "#6e1c28"], ["mm2", "#a8363f"], ["mm3", "#d6675f"],
    ["me0", "#6b5812"], ["me1", "#c4a02a"], ["me2", "#eed25e"], ["me3", "#fff4b8"],
    // The deep, darker than any water in the lagoon, where the light gives out.
    ["ab0", "#02102e"], ["ab1", "#041840"], ["ab2", "#062252"], ["ab3", "#082c66"]
  ];
  var C = {};
  PALETTE.forEach(function (p, i) { C[p[0]] = i; });
  // The colours the scene was first painted in. Colour tables map only into these,
  // so the monster's colours never turn up in the water, reef or sky by accident.
  var BASE = C.ms0;
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
  // The palette colour closest to an RGB value, by the "redmean" distance, among the
  // first n colours (all of them if n is left out).
  function nearest(r, g, b, n) {
    var best = 0, bd = Infinity;
    for (var i = 0, end = n || RGB.length; i < end; i++) {
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
      out[i] = nearest((c[0] + (tr - c[0]) * a) * k, (c[1] + (tg - c[1]) * a) * k, (c[2] + (tb - c[2]) * a) * k, BASE);
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
  function toRGBA(f, out) { for (var i = 0; i < f.length; i++) out[i] = RGBA[f[i]]; }

  G.PIX = {
    W: W, H: H, NONE: NONE, PALETTE: PALETTE, BASE: BASE, C: C, RGB: RGB, RGBA: RGBA,
    fb: fb, pset: pset, rect: rect, dith: dith, hash: hash, rng: rng, mod: mod,
    noise: noise, noise2: noise2, names: names, pick: pick, lum: lum, nearest: nearest, toward: toward,
    layer: layer, lset: lset, lget: lget, blit: blit, toRGBA: toRGBA
  };
})(S);
// pixel-raja-ampat/src/world.js
// Shared geometry, the waterline and colour tables for Siang di Raja Ampat.
// The picture is a split view at the surface of a lagoon: above the waterline
// the sky, the sea out to the horizon and the islands; below it the water
// column and the reef.
(function (G) {
  var PIX = G.PIX, W = PIX.W, H = PIX.H;
  var GEO = {
    horizon: 84,   // where the sea meets the sky
    surface: 104,  // rest height of the waterline across the front of the picture
    cay: 94        // waterline of the sand cay halfway to the horizon
  };

  // The waterline: two travelling swells and a ripple, never more than 2 px from rest,
  // and whatever swell the monster raises when it breaks the surface.
  function surfaceY(x, t) {
    var stir = G.LAUT && G.LAUT.swell ? G.LAUT.swell(x, t) : 0;
    return GEO.surface + Math.round(
      1.15 * Math.sin(x / 19 + t * 1.25) + 0.55 * Math.sin(x / 7.3 - t * 2.3) + 0.3 * Math.sin(x / 3.1 + t * 3.7) + stir);
  }
  function surfaceRow(t) {
    var row = new Int16Array(W);
    for (var x = 0; x < W; x++) row[x] = surfaceY(x, t);
    return row;
  }

  // Water colour at six depth bands, from just under the surface to the reef floor.
  var BANDS = ["#3cc3e5", "#25a1d8", "#1d8fd0", "#126ebd", "#0c53a6", "#0a4799"];
  function band(y) { return Math.max(0, Math.min(BANDS.length - 1, Math.floor((y - GEO.surface) / 28))); }

  // The table from a set of per-band tables for a pixel at (x, y), dithered between bands.
  function tinted(tables, c, x, y) {
    var l = (y - GEO.surface) / 28, i = Math.floor(l);
    if (PIX.dith(x, y, l - i)) i++;
    return tables[Math.max(0, Math.min(tables.length - 1, i))][c];
  }

  G.LAUT = {
    tinted: tinted,
    GEO: GEO,
    surfaceY: surfaceY,
    surfaceRow: surfaceRow,
    // The waterline for the frame being drawn, set by the scene before anything reads it.
    SURF: surfaceRow(0),
    band: band,
    // Sunbeams and the glints of caustics brighten what they fall on; shade darkens it.
    LIGHT: PIX.toward("#e9ffff", 0.3),
    GLINT: PIX.toward("#ffffff", 0.5),
    SHADE: PIX.toward("#07306a", 0.35),
    // The air between us and the far islands.
    HAZE: PIX.toward("#bfe3f6", 0.45),
    // Things underwater lose their reds a little more with every metre: a light
    // touch for the reef up close, more for things out in the water column.
    TINT: ["#86e4f2", "#6ad6ee", "#55c8e8", "#44b8e1", "#38a8da", "#2e98d2"].map(function (hex, i) {
      return PIX.toward(hex, 0.03 + 0.02 * i);
    }),
    DEPTH: BANDS.map(function (hex, i) { return PIX.toward(hex, 0.1 + 0.07 * i); }),
    // Far things fade into the blue of their depth.
    FOG: BANDS.map(function (hex, i) { return PIX.toward(hex, 0.55 + 0.05 * i); })
  };
})(S);
// pixel-raja-ampat/src/sky.js
// The sky over the lagoon: a deep azure overhead paling to haze at the horizon,
// a high white sun with a bloom around it, and fair-weather cumulus that drift
// slowly west, lit from the sun's side and blue-grey on their flat undersides.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, NONE = PIX.NONE;
  var GEO = LAUT.GEO;
  var RAMP = PIX.names(["sk0", "sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8", "sk9"]);
  var SUN = { x: 408, y: 22, r: 5 };

  // The sky is baked with the water below it; the sea band in between is drawn every frame.
  function bakeSky(f) {
    for (var y = 0; y < GEO.horizon; y++) {
      var v = Math.pow(y / (GEO.horizon - 1), 1.35) * 0.97;
      for (var x = 0; x < W; x++) {
        var d = Math.hypot(x - SUN.x, (y - SUN.y) * 1.15);
        var bloom = 0.34 * Math.exp(-Math.pow(d / 58, 2)) + 0.12 * Math.exp(-Math.pow(d / 130, 2));
        f[y * W + x] = PIX.pick(RAMP, v + bloom, x, y);
      }
    }
  }

  function drawSun(f) {
    for (var y = SUN.y - 16; y <= SUN.y + 16; y++) {
      for (var x = SUN.x - 16; x <= SUN.x + 16; x++) {
        var d = Math.hypot(x - SUN.x, y - SUN.y), i = y * W + x;
        if (d <= SUN.r) f[i] = PIX.C.wh;
        else if (d <= SUN.r + 1.6) f[i] = PIX.C.su1;
        else if (d <= SUN.r + 4) f[i] = PIX.dith(x, y, 1.25 - (d - SUN.r - 1.6) / 2.4) ? PIX.C.su1 : PIX.C.su0;
        else if (d <= SUN.r + 10 && PIX.dith(x, y, 0.85 - (d - SUN.r - 4) / 7)) f[i] = PIX.C.su0;
      }
    }
  }

  // Cumulus are baked into two strips that wrap every PER pixels: the big low clouds,
  // far off near the horizon, and the small high ones overhead, each strip drifting
  // as a whole at its own pace so no cloud is ever torn in two. A cloud is a heap of
  // round puffs: a row of low, wide ones along its flat base, then fewer and bigger
  // lobes crowning it, each a little in front of the one behind. The heap is merged
  // into one smooth surface and lit from the upper right in a few clean tones, whiter
  // on top and blue-grey toward its flat underside.
  var PER = 1200, CH = GEO.horizon, FAR = 64;
  var TONES = PIX.names(["cl5", "cl4", "cl3", "cl2", "cl1", "wh"]);
  var LIGHT = (function () {
    var l = [0.62, -0.62, 0.48], n = Math.hypot(l[0], l[1], l[2]);
    return [l[0] / n, l[1] / n, l[2] / n];
  })();
  // [centre x, base y, width, height] of each cloud: big ones low down, small ones higher up.
  var CLOUDS = [
    [70, 78, 150, 34], [300, 80, 120, 26], [520, 76, 190, 42], [760, 79, 110, 22], [960, 77, 160, 36],
    [1130, 80, 90, 18],
    [180, 50, 60, 12], [420, 44, 46, 10], [640, 38, 70, 14], [860, 52, 54, 11], [1060, 46, 40, 9]
  ];
  // The low clouds are farther away, so they drift more slowly than the high ones.
  var LAYERS = [0.35, 0.6].map(function (speed) {
    return { speed: speed, strip: new Uint8Array(PER * CH).fill(NONE), y0: CH, y1: -1 };
  });
  // Rows of puffs, bottom up: [share of the width, radius as a share of the height, rise above the base].
  var ROWS = {
    big: [[0.9, 0.42, 0], [0.648, 0.5, 0.36], [0.36, 0.5, 0.66]],
    small: [[0.9, 0.5, 0], [0.495, 0.62, 0.45]]
  };
  function puffs() {
    var r = PIX.rng(2604), list = [];
    CLOUDS.forEach(function (c) {
      var base = c[1], w = c[2], h = c[3], rows = h < 16 ? ROWS.small : ROWS.big;
      rows.forEach(function (row, tier) {
        var rad = h * row[1], n = Math.max(2, Math.round(w * row[0] / (rad * 1.25)) + 1), chain = [], x = 0;
        for (var k = 0; k < n; k++) {
          var dome = Math.sin(Math.PI * k / (n - 1));
          // Smaller toward the ends, the base row most of all, so a cloud tapers instead of
          // resting on a plate.
          chain.push({ dome: dome, r: rad * (0.78 + 0.3 * r()) * (tier ? 0.8 + 0.25 * dome : 0.6 + 0.45 * dome) });
        }
        // Each puff overlaps the one before it, so a row holds together however its sizes fall.
        chain.forEach(function (q, k) { x = q.x = k ? x + 0.7 * (chain[k - 1].r + q.r) : 0; });
        chain.forEach(function (q) {
          list.push({
            x: c[0] + q.x - x / 2 + (r() - 0.5) * rad * 0.2,
            y: base - q.r * 0.5 - h * row[2] - q.dome * h * 0.06 + (r() - 0.5) * 1.5,
            r: q.r, sq: h < 16 ? 0.72 : 0.9, front: (rows.length - tier) * 6 + r() * 8,
            base: base, top: base - h * 1.05, band: h > 20 ? 2 : 1
          });
        });
      });
    });
    return list;
  }
  // Lit from the upper right and whiter the higher up the cloud, in four clean tones,
  // with a blue-grey band along the flat underside that the far clouds show paler.
  function tone(p, x, y, at) {
    var nx = -0.4 * (at(x + 1, y) - at(x - 1, y)), ny = -0.4 * (at(x, y + 1) - at(x, y - 1)), n = Math.hypot(nx, ny, 1);
    var v = Math.min(1, Math.max(0, (y - p.top) / (p.base - p.top)));
    var s = (nx * LIGHT[0] + ny * LIGHT[1] + LIGHT[2]) / n + 0.6 * (0.4 - v);
    var k = s > 0.8 ? 5 : s > 0.52 ? 4 : s > 0.22 ? 3 : 2, under = p.base - y;
    if (under < p.band) k = Math.min(k, 1);
    else if (under < 2 * p.band) k = Math.min(k, 2);
    return p.base > FAR && k < 2 ? k + 1 : k;
  }
  // A pixel unlike all four of its neighbours is noise where two tones meet: it takes
  // their commonest tone instead.
  function despeckle(strip) {
    var out = strip.slice();
    for (var y = 1; y < CH - 1; y++) {
      for (var x = 0; x < PER; x++) {
        var i = y * PER + x, c = strip[i];
        if (c === NONE) continue;
        var near = [strip[y * PER + PIX.mod(x - 1, PER)], strip[y * PER + PIX.mod(x + 1, PER)], strip[i - PER], strip[i + PER]];
        if (near.indexOf(NONE) >= 0 || near.indexOf(c) >= 0) continue;
        out[i] = near.reduce(function (a, b) {
          return near.filter(function (d) { return d === b; }).length > near.filter(function (d) { return d === a; }).length ? b : a;
        });
      }
    }
    strip.set(out);
  }
  function bakeClouds() {
    var list = puffs(), N = PER * CH, SOFT = 0.2;
    // Each puff is a dome standing out of the sky. Where puffs overlap, their heights
    // merge in a soft maximum, so the lobes run into one another without seams.
    var sum = new Float64Array(N), own = new Int16Array(N).fill(-1), best = new Float32Array(N).fill(-Infinity);
    list.forEach(function (p, k) {
      var ry = p.r * p.sq;
      for (var y = Math.max(0, Math.floor(p.y - ry)); y <= Math.min(p.base, Math.ceil(p.y + ry), CH - 1); y++) {
        for (var x = Math.floor(p.x - p.r); x <= Math.ceil(p.x + p.r); x++) {
          var dx = (x - p.x) / p.r, dy = (y - p.y) / ry, q = 1 - dx * dx - dy * dy;
          if (q <= 0) continue;
          var i = y * PER + PIX.mod(x, PER), z = Math.sqrt(q) * p.r + p.front;
          sum[i] += Math.exp(SOFT * z);
          if (z > best[i]) { best[i] = z; own[i] = k; }
        }
      }
    });
    var hgt = new Float32Array(N);
    for (var i = 0; i < N; i++) if (own[i] >= 0) hgt[i] = Math.log(sum[i]) / SOFT;
    function at(x, y) { return y < 0 || y >= CH ? 0 : hgt[y * PER + PIX.mod(x, PER)]; }
    for (var y = 0; y < CH; y++) {
      for (var x = 0; x < PER; x++) {
        i = y * PER + x;
        if (own[i] < 0) continue;
        var p = list[own[i]], layer = LAYERS[p.base > FAR ? 0 : 1];
        layer.strip[i] = TONES[tone(p, x, y, at)];
        layer.y0 = Math.min(layer.y0, y);
        layer.y1 = Math.max(layer.y1, y);
      }
    }
    LAYERS.forEach(function (layer) { despeckle(layer.strip); });
  }

  // The far strip first, then the high clouds, which pass in front of it.
  function drawClouds(f, t) {
    LAYERS.forEach(function (layer) {
      var start = PIX.mod(Math.floor(t * layer.speed), PER);
      for (var y = layer.y0; y <= layer.y1; y++) {
        var row = y * PER, j = start;
        for (var x = 0; x < W; x++) {
          var c = layer.strip[row + j];
          if (c !== NONE) f[y * W + x] = c;
          if (++j === PER) j = 0;
        }
      }
    });
  }

  LAUT.SUN = SUN;
  LAUT.bakeSky = bakeSky;
  bakeClouds();
  LAUT.CLOUD = { layers: LAYERS, period: PER, rows: CH };
  LAUT.drawSun = drawSun;
  LAUT.drawClouds = drawClouds;
})(S);
// pixel-raja-ampat/src/sea.js
// The sea itself: the band of surface we look across to the horizon, dark blue
// far out and turquoise over the shallows, with wavelets and the sun's glitter;
// the waterline where the picture is cut; and below it the water column, bright
// aqua under the surface deepening to blue, with the underside of the waves
// shimmering overhead.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = LAUT.GEO, SUN = LAUT.SUN;
  var SEA = PIX.names(["fs0", "fs1", "fs2", "fs3", "fs4", "fs5", "fs6", "fs7"]);
  var DEEP = PIX.names(["uw0", "uw1", "uw2", "uw3", "uw4", "uw5", "uw6", "uw7", "uw8", "uw9", "uw10", "uw11"]);

  // The water column never changes, so it is baked once below the sky.
  function bakeWater(f) {
    for (var y = GEO.surface - 3; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var v = Math.pow(Math.max(0, y - GEO.surface + 2) / (H - GEO.surface), 0.8) * 1.02 + 0.07 * (x / W - 0.45);
        f[y * W + x] = PIX.pick(DEEP, v, x, y);
      }
    }
  }

  // How far a surface row is from us, 0 at the horizon and 1 at the waterline.
  function near(y) { return (y - GEO.horizon) / (GEO.surface - GEO.horizon); }

  // The shallows show turquoise over the reef on the left, fading out to the right.
  function shallow(x, v) { return v * v * Math.max(0, Math.min(1, (300 - x) / 180)); }

  function drawSea(f, t) {
    var row = LAUT.SURF;
    for (var y = GEO.horizon; y < GEO.surface + 3; y++) {
      var v = near(y), k = 0.9 - v * 0.72, speed = 0.5 + v * 1.6;
      var spread = 5 + v * 26, bright = 0.12 + 0.1 * v;
      for (var x = 0; x < W; x++) {
        if (y >= row[x]) continue;
        var i = y * W + x;
        // Base colour darkest at the horizon, turquoise in the shallows.
        var tone = 0.08 + v * 0.62 + shallow(x, v) * 0.3;
        // Wavelets: crests brighten and troughs darken, finer toward the horizon.
        var w = Math.sin(x * k + t * speed + y * 2.7) + 0.8 * Math.sin(x * k * 0.53 - t * speed * 0.7 + y * 1.3);
        tone += w * 0.045;
        var c = PIX.pick(SEA, tone, x, y);
        // Glitter under the sun: short sparks that come and go.
        var off = Math.abs(x - SUN.x);
        if (off < spread) {
          var h = PIX.hash(x, y, Math.floor(t * 7 + PIX.hash(x, y, 3) * 7));
          var edge = 1 - off / spread;
          if (h < bright * edge * (w > 0 ? 1.8 : 0.6)) c = h < bright * edge * 0.5 ? C.wh : (PIX.hash(x, y, 5) < 0.5 ? C.fo0 : C.su1);
        }
        f[i] = c;
      }
    }
    // The horizon itself is a crisp line of deep blue.
    for (x = 0; x < W; x++) f[GEO.horizon * W + x] = PIX.dith(x, GEO.horizon, 0.4) ? C.fs1 : C.fs0;
  }

  // The cut: a bright meniscus at the waterline, the lit edge of the wave just
  // above it, and the underside of the surface glinting just below it.
  function drawWaterline(f, t) {
    var row = LAUT.SURF;
    for (var x = 0; x < W; x++) {
      var y = row[x];
      f[y * W + x] = PIX.hash(x, 1, Math.floor(t * 4)) < 0.25 ? C.wh : C.sf2;
      f[(y - 1) * W + x] = PIX.dith(x, y, 0.5 + 0.4 * Math.sin(x / 6 + t * 2)) ? C.fs7 : C.fs6;
      for (var d = 1; d <= 7; d++) {
        var yy = y + d, i = yy * W + x;
        var s = Math.sin(x / 4.6 + t * 2.1 + d * 0.9) + Math.sin(x / 11.3 - t * 1.4) + 0.6 * Math.sin(x / 2.3 + t * 3.3 - d);
        var a = (s - 0.4) / 2.2 - d * 0.1;
        if (d === 1) f[i] = a > 0.2 ? C.sf2 : a > -0.2 ? C.sf1 : C.sf0;
        else if (a > 0.25 && PIX.dith(x, yy, a * 1.6)) f[i] = a > 0.55 ? C.sf1 : C.sf0;
        else if (a > 0) f[i] = LAUT.LIGHT[f[i]];
      }
    }
  }

  // The cut line alone, drawn last so it crosses everything standing in the water.
  function drawCut(f, t) {
    var row = LAUT.SURF;
    for (var x = 0; x < W; x++) f[row[x] * W + x] = PIX.hash(x, 1, Math.floor(t * 4)) < 0.25 ? C.wh : C.sf2;
  }

  LAUT.bakeWater = bakeWater;
  LAUT.drawCut = drawCut;
  LAUT.drawSea = drawSea;
  LAUT.drawWaterline = drawWaterline;
})(S);
// pixel-raja-ampat/src/islands.js
// The islands. In front on the left, a karst island like those of Wayag and
// Piaynemo: a steep dome of jungle over grey limestone, undercut by the sea
// into a dark notch at the waterline so it stands on the water like a
// mushroom. On the horizon, a cluster of smaller karst islets blued by the air.
// Halfway out, a sand cay with coconut palms, a village and its white church,
// a jetty, all mirrored and broken up by ripples in the water in front of it.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C, NONE = PIX.NONE;
  var GEO = LAUT.GEO;
  var JUNGLE = PIX.names(["jg0", "jg1", "jg2", "jg3", "jg4", "jg5", "jg6"]);
  var LIME = PIX.names(["ls0", "ls1", "ls2", "ls3", "ls4", "ls5"]);
  var FAR = PIX.names(["fi0", "fi1", "fi2", "fi3"]);
  var LX = 0.62, LY = -0.58, LZ = 0.53;

  function lambert(nx, ny, nz) {
    var len = Math.hypot(nx, ny, nz);
    return Math.max(0, (nx * LX + ny * LY + nz * LZ) / len);
  }

  // ---- The near island -------------------------------------------------------

  var ISLE = { cx: 58, half: 88, top: 18, notch: 96, notchDepth: 10 };
  // East of this column the flank is too steep for trees and the limestone shows.
  var FLANK = 106;
  // The top of the island over each column: a steep-sided dome.
  function crownY(x) {
    var u = (x - ISLE.cx) / ISLE.half;
    if (Math.abs(u) >= 1) return GEO.surface + 10;
    return GEO.surface - (GEO.surface - ISLE.top) * Math.pow(1 - u * u, 0.6);
  }
  // How far the sea has cut into the rock at each height of the notch.
  function undercut(y) {
    if (y < ISLE.notch) return 0;
    return ISLE.notchDepth * Math.sin(Math.min(1, (y - ISLE.notch) / 6) * Math.PI / 2);
  }
  // The rightmost column of rock at height y.
  function rightEdge(y) {
    var lo = ISLE.cx, hi = ISLE.cx + ISLE.half;
    while (hi - lo > 0.5) { var mid = (lo + hi) / 2; if (crownY(mid) < y) lo = mid; else hi = mid; }
    return lo - undercut(y);
  }

  // Tree crowns cover the dome: a dense row along its top and more lower down,
  // thinning out on the steep right flank where the limestone shows.
  function crowns() {
    var r = PIX.rng(77), list = [];
    for (var x = -28; x < 142; x += 2 + r() * 3) {
      var steep = x > 108 ? (x - 108) / 34 : 0;
      if (r() < steep * 0.75) continue;
      var rad = 3.5 + r() * 4.5 - steep * 1.5;
      list.push({ x: x, y: crownY(x) + rad * 0.55 + r() * 2, r: rad });
    }
    for (var k = 0; k < 330; k++) {
      var cx = -28 + r() * 150, cy = crownY(cx) + 5 + r() * (ISLE.notch - crownY(cx) - 3);
      if (cx > FLANK - 6 && r() < 0.85) continue;
      list.push({ x: cx, y: cy, r: 3 + r() * 4.5 });
    }
    return list;
  }

  var NEAR = PIX.layer();
  function bakeNear() {
    var list = crowns(), zb = new Float32Array(W * H).fill(-1), lit = new Float32Array(W * H);
    list.forEach(function (p) {
      for (var y = Math.floor(p.y - p.r); y <= Math.ceil(p.y + p.r); y++) {
        for (var x = Math.floor(p.x - p.r); x <= Math.ceil(p.x + p.r); x++) {
          if (x < 0 || x >= W || y < 0 || y >= ISLE.notch + 1) continue;
          var dx = x - p.x, dy = y - p.y, q = p.r * p.r - dx * dx - dy * dy;
          if (q <= 0) continue;
          var z = Math.sqrt(q) - p.y * 0.02, i = y * W + x;
          if (z <= zb[i]) continue;
          zb[i] = z;
          lit[i] = lambert(dx / p.r, dy / p.r, Math.sqrt(q) / p.r);
        }
      }
    });
    for (var y = 0; y <= GEO.surface + 3; y++) {
      for (var x = 0; x < 160; x++) {
        var i = y * W + x, edge = rightEdge(y);
        if (x > edge) continue;
        var inDome = y >= crownY(x) - 1;
        if (y < ISLE.notch && zb[i] >= 0) {
          // Leaves: lit by the sun, darker deep inside the canopy, with clumps of texture.
          var depth = Math.max(0, y - crownY(x)) / 70;
          var l = 0.12 + lit[i] * 0.82 - depth * 0.35 + (PIX.noise2(x / 2.5, y / 2.5, 5) - 0.5) * 0.22;
          PIX.lset(NEAR, x, y, PIX.pick(JUNGLE, l, x, y));
        } else if (y < ISLE.notch && inDome && x < FLANK + 6 * PIX.noise(y / 6, 9)) {
          // Deep shade between the crowns.
          PIX.lset(NEAR, x, y, PIX.dith(x, y, 0.3 + 0.2 * PIX.noise2(x / 3, y / 3, 8)) ? C.jg1 : C.jg0);
        } else if (y < ISLE.notch && inDome) {
          // Bare limestone, fluted by rain into vertical grooves, bright where it faces the sun.
          var face = 0.45 + 0.4 * Math.min(1, Math.max(0, (x - 100) / 40));
          var groove = PIX.noise(x / 1.7, 3) * 0.55 + PIX.noise2(x / 3, y / 14, 4) * 0.45;
          var tone = face - 0.25 + groove * 0.55 - (y > ISLE.notch - 6 ? (y - ISLE.notch + 6) * 0.06 : 0);
          PIX.lset(NEAR, x, y, PIX.pick(LIME, tone, x, y));
        } else if (y >= ISLE.notch && inDome) {
          // The notch: deep shade under the overhang, a wet dark band at the water,
          // roots and drips hanging from the lip.
          var roots = PIX.hash(x, 0, 41) < 0.22 && y < ISLE.notch + 2 + PIX.hash(x, 1, 41) * 5;
          var c = roots ? C.jg0 : PIX.dith(x, y, 0.25 + 0.1 * Math.sin(x * 0.7)) ? C.ls1 : C.ls0;
          if (x > edge - 1.5 && !roots) c = C.ls2;
          PIX.lset(NEAR, x, y, c);
        }
      }
    }
  }

  // Two coconut palms lean out over the water from the right flank.
  var LEANERS = [
    { x: 118, y: 44, len: 26, lean: 0.9, phase: 0 },
    { x: 104, y: 36, len: 20, lean: 0.55, phase: 1.9 }
  ];

  // ---- Far islets -------------------------------------------------------------

  // [centre x, half width, height] of each islet, standing on the horizon.
  var ISLETS = [
    [150, 9, 13], [163, 7, 17], [176, 10, 11], [191, 8, 14], [204, 6, 9], [216, 11, 8],
    [436, 6, 7], [449, 9, 11], [463, 7, 8], [476, 6, 12]
  ];
  var FARL = PIX.layer();
  function bakeFar() {
    ISLETS.forEach(function (s, k) {
      for (var x = Math.floor(s[0] - s[1]); x <= Math.ceil(s[0] + s[1]); x++) {
        var u = (x - s[0]) / s[1];
        if (Math.abs(u) >= 1) continue;
        var top = GEO.horizon - s[2] * Math.pow(1 - Math.pow(Math.abs(u), 2.4), 0.5);
        for (var y = Math.floor(top); y < GEO.horizon; y++) {
          // Lit on the sun side, the undercut a dark line at the waterline.
          var tone = 0.35 + u * 0.35 + (PIX.noise2(x / 2, y / 2, 60 + k) - 0.5) * 0.3 + (y < top + 2 ? 0.15 : 0);
          var c = y >= GEO.horizon - 1 ? C.fi0 : PIX.pick(FAR, tone, x, y);
          PIX.lset(FARL, x, y, c);
        }
      }
    });
  }

  // ---- The sand cay -----------------------------------------------------------

  var CAY = { x0: 200, x1: 300, y: GEO.cay, cx: 250 };
  // The cay is far enough for a little haze, but its sand stays white.
  var MID = PIX.toward("#bfe3f6", 0.12);
  PIX.names(["bs0", "bs1", "bs2"]).forEach(function (c) { MID[c] = c; });
  var MIRROR = PIX.toward("#1a6fb4", 0.5, 0.95);
  var CAYL = PIX.layer();
  function cset(x, y, c) { PIX.lset(CAYL, x, y, MID[c]); }

  // Coconut palms on the cay: foot x, height, lean, sway phase.
  var PALMS = [
    [207, 13, -3, 0.3], [215, 18, 1, 2.1], [229, 16, 3, 4.2], [247, 20, -2, 1.1], [263, 15, 2, 5.3],
    [279, 19, -3, 3.2], [291, 12, 3, 0.8]
  ];
  // Village houses: left x, width, wall height, walls, roof, and the church's steeple.
  var HOUSES = [
    { x: 219, w: 8, h: 4, wall: "wd3", roof: "th1" },
    { x: 236, w: 9, h: 5, wall: "bt2", roof: "bt1", steeple: true },
    { x: 255, w: 8, h: 4, wall: "bt0", roof: "th2" },
    { x: 270, w: 7, h: 4, wall: "wd2", roof: "th1" }
  ];

  function beachTop(x) {
    var u = (x - CAY.cx) / 48;
    return Math.abs(u) >= 1 ? CAY.y : CAY.y - 3.4 * Math.sqrt(1 - u * u);
  }

  function bakeCay() {
    var x, y;
    // Low bush behind the beach.
    for (x = 206; x < 296; x++) {
      var bush = beachTop(x) - 3 - 2.2 * PIX.noise(x / 3, 70) - 1.5 * Math.sin((x - 206) / 90 * Math.PI);
      for (y = Math.floor(bush); y < beachTop(x); y++) {
        var l = 0.35 + (PIX.noise2(x / 2, y / 2, 71) - 0.5) * 0.5 + (y < bush + 1.5 ? 0.25 : 0);
        cset(x, y, PIX.pick(JUNGLE, l, x, y));
      }
    }
    // Houses behind the bush: plank walls, a steep roof, a dark door.
    HOUSES.forEach(function (h) {
      var base = Math.round(beachTop(h.x + h.w / 2)) - 2, wall = C[h.wall], roof = C[h.roof];
      for (y = base - h.h; y < base; y++) for (x = h.x; x < h.x + h.w; x++) cset(x, y, x === h.x ? C.wd1 : wall);
      cset(h.x + Math.floor(h.w / 2), base - 1, C.wd0);
      cset(h.x + Math.floor(h.w / 2), base - 2, C.wd0);
      var peak = base - h.h - Math.ceil(h.w / 2);
      for (y = peak; y < base - h.h; y++) {
        var half = (y - peak) + 1;
        for (x = h.x + h.w / 2 - half; x < h.x + h.w / 2 + half; x++) cset(Math.floor(x), y, x < h.x + h.w / 2 ? roof : C.th0);
      }
      if (h.steeple) {
        var sx = h.x + Math.floor(h.w / 2);
        for (y = peak - 6; y < peak + 1; y++) { cset(sx - 1, y, C.bt2); cset(sx, y, C.bt3); }
        cset(sx - 1, peak - 7, C.bt1); cset(sx, peak - 7, C.bt1);
        cset(sx - 1, peak - 9, C.wh); cset(sx - 1, peak - 8, C.wh); cset(sx - 2, peak - 8, C.wh);
      }
    });
    // Palm trunks: a slight curve toward the lean, ringed light and dark.
    PALMS.forEach(function (p) {
      for (var k = 0; k < p[1]; k++) {
        var u = k / p[1], tx = p[0] + p[2] * u * u, ty = beachTop(p[0]) - 1 - k;
        cset(Math.round(tx), ty, k % 3 === 0 ? C.wd1 : C.wd2);
      }
    });
    // The beach: white sand, sunlit on top and wet at the water's edge.
    for (x = 196; x < 304; x++) {
      var top = beachTop(x);
      if (top >= CAY.y) continue;
      for (y = Math.floor(top); y < CAY.y; y++) {
        var c = y >= CAY.y - 1 ? C.bs0 : y < top + 1 ? C.bs2 : PIX.dith(x, y, 0.5) ? C.bs1 : C.bs2;
        cset(x, y, c);
      }
    }
    // The jetty: a plank deck on posts, reaching out to the right.
    for (x = 292; x < 322; x++) {
      cset(x, CAY.y - 3, C.wd3);
      cset(x, CAY.y - 2, x % 2 ? C.wd2 : C.wd1);
      if (x % 5 === 0) { cset(x, CAY.y - 1, C.wd1); cset(x, CAY.y, C.wd0); }
    }
    // A little boat tied at the end of the jetty.
    for (x = 316; x < 324; x++) { cset(x, CAY.y, x === 316 || x === 323 ? C.bt1 : C.bt2); cset(x, CAY.y + 1, C.bt0); }
  }

  // Fronds: seven arcs from the crown, drooping at the tips, stirring in the wind.
  function palmCrown(p, t) {
    var foot = beachTop(p[0]) - 1, top = { x: p[0] + p[2], y: foot - p[1] };
    var gust = Math.sin(t * 1.6 + p[3]) * 0.6 + Math.sin(t * 3.7 + p[3] * 2) * 0.3;
    var out = [];
    [-2.6, -2.0, -1.2, -0.5, 0.35, 0.95, 1.6].forEach(function (a, k) {
      var len = 5 + (k % 3), dir = Math.sign(Math.cos(a)) || 1;
      for (var s = 1; s <= len; s++) {
        var u = s / len;
        var x = top.x + Math.cos(a) * s * 1.05 + gust * u * dir * 0.8;
        var y = top.y - Math.sin(Math.abs(a) < 1.6 ? 0.9 : 0.5) * s * (1 - u) + u * u * 3 + (a > 0 ? 0 : 0);
        out.push([Math.round(x), Math.round(y), u < 0.5 ? C.jg4 : k % 2 ? C.jg3 : C.jg5]);
      }
    });
    out.push([top.x, top.y + 1, C.wd1], [top.x - 1, top.y + 1, C.wd0], [top.x + 1, top.y + 1, C.wd1]);
    return out;
  }

  function drawCay(f, t) {
    PIX.blit(f, CAYL);
    PALMS.forEach(function (p) {
      palmCrown(p, t).forEach(function (q) { PIX.pset(f, q[0], q[1], MID[q[2]]); });
    });
  }

  // The reflection: each row below the cay's waterline mirrors the row as far
  // above it, darkened toward the sea, shifted by ripples and thinning out.
  function drawMirror(f, t) {
    var row = LAUT.SURF;
    for (var y = CAY.y + 1; y < GEO.surface - 1; y++) {
      var d = y - CAY.y, src = CAY.y - d + 1, fade = 1 - d / 11;
      var shift = Math.round(Math.sin(y * 1.9 + t * 3.1) * (0.6 + d * 0.12));
      for (var x = CAY.x0 - 4; x < CAY.x1 + 26; x++) {
        if (y >= row[x] - 1) continue;
        var sx = x + shift, c = PIX.lget(CAYL, sx, src);
        if (c === NONE) c = palmPixel(sx, src, t);
        if (c !== NONE && PIX.dith(x, y, fade)) f[y * W + x] = MIRROR[c];
      }
    }
  }
  // Palm crowns are drawn fresh each frame, so the mirror asks for them here.
  var crownCache = { t: NaN, map: null };
  function palmPixel(x, y, t) {
    if (crownCache.t !== t) {
      var map = new Map();
      PALMS.forEach(function (p) { palmCrown(p, t).forEach(function (q) { map.set(q[1] * W + q[0], MID[q[2]]); }); });
      crownCache = { t: t, map: map };
    }
    var c = crownCache.map.get(y * W + x);
    return c === undefined ? NONE : c;
  }

  // ---- Drawing ------------------------------------------------------------------

  function drawFar(f) { PIX.blit(f, FARL); }

  function drawNear(f, t) {
    var row = LAUT.SURF;
    for (var y = NEAR.y0; y <= NEAR.y1; y++) {
      for (var x = NEAR.x0; x <= NEAR.x1; x++) {
        var c = NEAR.px[y * W + x];
        if (c !== NONE && y < row[x]) f[y * W + x] = c;
      }
    }
    // Foam where the swell slaps the rock under the notch.
    for (x = 0; x < 140; x++) {
      var fy = row[x] - 1;
      if (x < rightEdge(fy) && PIX.hash(x, fy, Math.floor(t * 5)) < 0.18) f[fy * W + x] = C.fo0;
    }
    LEANERS.forEach(function (p) { drawLeaner(f, p, t); });
  }

  // A leaning palm on the island: a long curved trunk and a big crown.
  function drawLeaner(f, p, t) {
    var tip = { x: p.x, y: p.y };
    for (var k = 0; k < p.len; k++) {
      var u = k / p.len;
      tip = { x: p.x + k * p.lean, y: p.y - k * (0.75 - u * 0.45) };
      PIX.pset(f, tip.x, tip.y, k % 3 === 0 ? C.wd1 : C.wd2);
      PIX.pset(f, tip.x, tip.y + 1, C.wd0);
    }
    var gust = Math.sin(t * 1.4 + p.phase) * 0.7 + Math.sin(t * 3.3 + p.phase) * 0.3;
    [-2.8, -2.2, -1.5, -0.8, -0.2, 0.4, 1.0, 1.7, 2.4].forEach(function (a, k) {
      var len = 7 + (k % 3) * 2;
      for (var s = 1; s <= len; s++) {
        var u = s / len;
        var x = tip.x + Math.cos(a) * s * 1.1 + gust * u * 1.2;
        var y = tip.y - Math.sin(a) * s * 0.45 + u * u * 5;
        PIX.pset(f, x, y, u < 0.3 ? C.jg2 : u < 0.7 ? (k % 2 ? C.jg4 : C.jg3) : C.jg5);
        if (s > 2 && s < len - 1) PIX.pset(f, x, y + 1, C.jg2);
      }
    });
    PIX.pset(f, tip.x - 1, tip.y + 1, C.wd1);
    PIX.pset(f, tip.x + 1, tip.y + 2, C.wd1);
  }

  bakeNear();
  bakeFar();
  bakeCay();
  LAUT.ISLE = ISLE;
  LAUT.crownY = crownY;
  LAUT.rightEdge = rightEdge;
  LAUT.CAY = CAY;
  LAUT.drawFar = drawFar;
  LAUT.drawCay = drawCay;
  LAUT.drawMirror = drawMirror;
  LAUT.drawNear = drawNear;
})(S);
// pixel-raja-ampat/src/reef.js
// The reef. The island's limestone goes on down under the water as a wall
// crusted with soft corals, sea fans, sponges and feather stars. Out from it
// the floor is white sand between coral heads: a bommie of brain, finger and
// staghorn corals with a giant clam set in it, a sand channel, an anemone on
// its rock, a table coral on its stalk throwing shade, a thicket of staghorn.
// Behind them the reef goes on into the blue; in front of us, a row of big
// corals frames the bottom of the picture.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C, NONE = PIX.NONE;
  var GEO = LAUT.GEO;
  var R = function (list) { return PIX.names(list); };
  var ROCK = R(["rk0", "rk1", "rk2", "rk3", "rk4", "rk5"]);
  var SAND = R(["sd0", "sd1", "sd2", "sd3", "sd4"]);
  var PINK = R(["cp0", "cp1", "cp2", "cp3", "cp4"]);
  var ORANGE = R(["co0", "co1", "co2", "co3"]);
  var PURPLE = R(["cv0", "cv1", "cv2", "cv3"]);
  var YELLOW = R(["cy0", "cy1", "cy2", "cy3"]);
  var GREEN = R(["cg0", "cg1", "cg2", "cg3"]);
  var TAN = R(["ct0", "ct1", "ct2", "ct3"]);
  var BLUE = R(["cb0", "cb1", "cb2"]);
  var RED = R(["fr0", "fr1", "fr2"]);
  var LX = 0.3, LY = -0.85, LZ = 0.43;

  function lambert(nx, ny, nz) {
    var len = Math.hypot(nx, ny, nz) || 1;
    return Math.max(0, (nx * LX + ny * LY + nz * LZ) / len);
  }
  function smooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }

  // ---- Where things are ---------------------------------------------------------

  var REEF = {
    bommie: { x0: 164, x1: 250, top: 204 },
    channel: { x0: 252, x1: 292, y: 247 },
    anemone: { x: 308, y: 231 },
    table: { x0: 330, x1: 414, y: 212, floor: 238, stalk: 372 },
    stag: { x0: 418, x1: 480, y: 222 },
    clam: { x: 212, y: 214 }
  };
  // The island's underwater face: a steep wall under the notch, then a slope
  // of coral running down and out to the floor.
  REEF.wallX = function (y) {
    var n = 3 * PIX.noise(y / 7, 101) - 1.5;
    if (y < 150) return 133 + 4 * smooth((y - GEO.surface) / 46) + n;
    return 137 + (y - 150) * 0.62 + n;
  };
  // The top of the reef across the floor, column by column.
  function topY(x) {
    if (x > REEF.channel.x0 && x < REEF.channel.x1) return H + 10;
    var y = 244 + 3 * Math.sin(x / 29) + 2 * PIX.noise(x / 9, 102);
    var b = (x - 207) / 44;
    if (Math.abs(b) < 1) y = Math.min(y, REEF.bommie.top + 38 * b * b + 3 * PIX.noise(x / 5, 103));
    var a = (x - REEF.anemone.x) / 15;
    if (Math.abs(a) < 1) y = Math.min(y, REEF.anemone.y + 2 + 12 * a * a);
    var m = (x - REEF.table.stalk) / 26;
    if (Math.abs(m) < 1) y = Math.min(y, REEF.table.floor - 2 + 10 * m * m);
    if (x > 414) y = Math.min(y, 236 + 2 * PIX.noise(x / 6, 104));
    return y;
  }
  function inside(x, y) { return y > GEO.surface && (y >= topY(x) || x <= REEF.wallX(y)); }
  // Height of the sand in each column.
  function sandY(x) {
    if (x >= REEF.channel.x0 - 6 && x <= REEF.channel.x1 + 6) {
      var u = Math.min(x - REEF.channel.x0 + 6, REEF.channel.x1 + 6 - x) / 10;
      return Math.round(REEF.channel.y - smooth(1 - u) * 5);
    }
    return Math.round(241 + 4 * Math.sin(x / 37) + 2.5 * PIX.noise(x / 13, 102));
  }
  REEF.sandY = sandY;
  REEF.topY = topY;
  REEF.inside = inside;

  // ---- Pens: each layer tints what it draws for its distance and depth -----------

  function pen(L, tables) {
    return function (x, y, c) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || x >= W || y < GEO.surface - 2 || y >= H) return;
      PIX.lset(L, x, y, LAUT.tinted(tables, c, x, y));
    };
  }
  // Darkens what is already in a layer, for shade under overhangs.
  function shadeIn(L, x, y, table) {
    var c = PIX.lget(L, x, y);
    if (c !== NONE) L.px[y * W + x] = table[c];
  }

  // ---- Shapes ---------------------------------------------------------------------

  // A dome sitting on the line cy, shaded from above, with an optional surface pattern.
  function dome(put, cx, cy, rx, ry, ramp, pattern, lift) {
    for (var y = Math.floor(cy - ry); y <= cy; y++) {
      for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        var u = (x - cx) / rx, v = (y - cy) / ry, q = 1 - u * u - v * v;
        if (q < 0) continue;
        var tone = (lift || 0.12) + 0.85 * lambert(u, v, Math.sqrt(q)) + (pattern ? pattern(x, y) : 0);
        put(x, y, PIX.pick(ramp, tone, x, y));
      }
    }
  }
  // Brain coral grooves: meandering lines over the dome.
  function grooves(seed) {
    return function (x, y) {
      var g = Math.sin(x * 1.3 + 4 * PIX.noise2(x / 5, y / 4, seed)) * Math.sin(y * 1.5 + 4 * PIX.noise2(x / 4, y / 6, seed + 1));
      return Math.abs(g) < 0.22 ? -0.42 : 0.05;
    };
  }
  // Rock texture with pink coralline crust and green turf.
  function rockPattern(seed) {
    return function (x, y) { return (PIX.noise2(x / 3, y / 3, seed) - 0.5) * 0.45; };
  }
  function crust(put, x, y, seed) {
    var n = PIX.noise2(x / 4, y / 4, seed), m = PIX.noise2(x / 6, y / 5, seed + 7);
    if (n > 0.72) put(x, y, n > 0.8 ? C.cp2 : C.cp1);
    else if (m > 0.74) put(x, y, m > 0.82 ? C.cg2 : C.cg1);
    else if (m < 0.2 && n < 0.3) put(x, y, C.cy1);
  }

  // A branch that walks from (x, y) at angle a, forking now and then.
  function grow(put, x, y, a, len, rng, lit, dark, tip, depth, thick) {
    for (var s = 0; s < len; s++) {
      x += Math.cos(a); y += Math.sin(a);
      a += (rng() - 0.5) * 0.18 + (-Math.PI / 2 - a) * 0.03;
      var end = s >= len - 2;
      put(x, y, end ? tip : lit);
      if (thick && !end) put(x - 1, y, dark);
      if (depth < 3 && s > 3 && rng() < 0.1) {
        grow(put, x, y, a + (rng() < 0.5 ? -1 : 1) * (0.45 + rng() * 0.45), len * (0.45 + rng() * 0.2), rng, lit, dark, tip, depth + 1, false);
      }
    }
  }
  function staghorn(put, x0, x1, rng, lit, dark, tip, height) {
    var n = Math.round((x1 - x0) / 3.2);
    for (var k = 0; k < n; k++) {
      var x = x0 + (k + rng()) * (x1 - x0) / n;
      grow(put, x, sandY(x) - 1, -Math.PI / 2 + (rng() - 0.5) * 1.1, height * (0.55 + rng() * 0.5), rng, lit, dark, tip, 0, true);
    }
  }

  // A soft coral: a pale trunk splitting into branches, each ending in a
  // cluster of polyps, so the whole reads as a bushy crown.
  function softCoral(put, x, y, h, ramp, rng, lean) {
    var ends = [], big = h > 10;
    (function stem(px, py, a, len, depth) {
      for (var s = 0; s < len; s++) {
        px += Math.cos(a); py += Math.sin(a);
        a += (rng() - 0.5) * 0.25;
        put(px, py, depth && !big ? ramp[1] : s % 2 ? C.sv2 : C.sv1);
        if (depth < 3 && s > 1 && rng() < 0.2) stem(px, py, a + (rng() - 0.5) * 1.6, len * 0.55, depth + 1);
      }
      if (depth < 2 && len > 2) {
        stem(px, py, a - 0.7, len * 0.5, depth + 1);
        stem(px, py, a + 0.7, len * 0.5, depth + 1);
      }
      ends.push([px, py]);
    })(x, y, -Math.PI / 2 + (lean || 0), big ? h : h * 0.6, 0);
    ends.forEach(function (e, k) {
      var r = big ? 1.6 + rng() * 1.8 : 1.1 + rng() * 1.2;
      for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
        var d = Math.hypot(dx, dy * 1.1);
        if (d > r) continue;
        var tone = 0.45 + 0.35 * (-dx * 0.2 - dy * 0.35) / r + (PIX.hash(e[0] + dx, e[1] + dy, k) - 0.5) * 0.4;
        put(e[0] + dx, e[1] + dy, PIX.pick(ramp, tone, e[0] + dx, e[1] + dy));
      }
    });
  }

  // A sea fan seen face on: a lace of radial veins and cross-links on a short trunk.
  function seaFan(put, x, y, w, h, ramp, seed) {
    for (var yy = Math.floor(y - h); yy <= y; yy++) {
      for (var xx = Math.floor(x - w); xx <= Math.ceil(x + w); xx++) {
        var dx = (xx - x) / w, dy = (y - 3 - yy) / h, r = Math.hypot(dx, dy);
        if (dy < 0 || r > 1) continue;
        var a = Math.atan2(dx, dy), warp = PIX.noise2(xx / 5, yy / 5, seed) * 2.2;
        var radial = Math.abs(Math.sin(a * 11 + warp)) < 0.2 + 0.1 * (1 - r);
        var ring = Math.abs(Math.sin(r * 16 + warp * 1.5)) < 0.13;
        var rim = r > 0.9;
        if (radial || ring || (rim && PIX.hash(xx, yy, seed) < 0.6)) {
          put(xx, yy, PIX.pick(ramp, 0.35 + dy * 0.35 + (radial && ring ? 0.3 : 0), xx, yy));
        }
      }
    }
    for (var k = 0; k < 5; k++) put(x, y - k, ramp[0]);
  }

  // A barrel sponge: a vase with vertical ridges and a dark mouth.
  function barrel(put, cx, base, h, w0, w1, ramp) {
    for (var y = base - h; y <= base; y++) {
      var u = (base - y) / h, half = (w0 + (w1 - w0) * u) / 2;
      for (var x = Math.floor(cx - half); x <= Math.ceil(cx + half); x++) {
        var nx = (x - cx) / half;
        if (Math.abs(nx) > 1) continue;
        var ridge = Math.cos(nx * 5.5) * 0.14 + (PIX.hash(x, y, 71) - 0.5) * 0.12;
        var tone = 0.25 + 0.6 * lambert(nx, -0.2, Math.sqrt(1 - nx * nx)) + ridge;
        if (y < base - h + 3 && Math.abs(nx) < 0.75) tone = 0.02;
        put(x, y, PIX.pick(ramp, tone, x, y));
      }
    }
  }

  // A feather star: arms curling out and up from a rock, banded yellow and black.
  function crinoid(put, x, y, rng) {
    for (var k = 0; k < 14; k++) {
      var a = -Math.PI + (k / 13) * Math.PI + (rng() - 0.5) * 0.3, len = 5 + rng() * 5, curl = (rng() - 0.5) * 0.25;
      var px = x, py = y;
      for (var s = 0; s < len; s++) {
        px += Math.cos(a) * 1.05; py += Math.sin(a) * 0.9;
        a += curl;
        put(px, py, (s + k) % 3 === 0 ? C.fk : s > len - 2 ? C.cy3 : C.cy2);
      }
    }
    put(x, y, C.cy1);
  }

  // Tube sponges: a few upright tubes with dark open tops.
  function tubes(put, x, base, ramp, rng) {
    for (var k = 0; k < 4; k++) {
      var tx = x + k * 3 + Math.round(rng() * 2), h = 6 + Math.round(rng() * 8);
      for (var y = base - h; y <= base; y++) {
        put(tx, y, y === base - h ? ramp[0] : ramp[2]);
        put(tx + 1, y, y === base - h ? ramp[0] : ramp[1]);
      }
    }
  }

  // A giant clam set into the coral: a zigzag shell lip round a bright blue mantle.
  function clam(put, cx, cy) {
    for (var y = cy - 3; y <= cy + 3; y++) {
      for (var x = cx - 9; x <= cx + 9; x++) {
        var u = (x - cx) / 9, v = (y - cy) / 3.2, d = u * u + v * v;
        if (d > 1) continue;
        var edge = d > 0.62, zig = (x + (y < cy ? 0 : 1)) % 3 === 0;
        var c = edge ? (zig ? C.rk5 : C.rk4) : PIX.hash(x, y, 55) < 0.18 ? C.gc0 : (Math.abs(v) < 0.35 ? C.gc2 : C.gc1);
        if (!edge && Math.abs(u) < 0.08) c = C.fk;
        put(x, y, c);
      }
    }
  }

  function seaStar(put, cx, cy) {
    for (var k = 0; k < 5; k++) {
      var a = -Math.PI / 2 + k * 2 * Math.PI / 5;
      for (var s = 0; s <= 5; s++) {
        var x = cx + Math.cos(a) * s, y = cy + Math.sin(a) * s * 0.55;
        put(x, y, s < 2 ? C.cb1 : k === 1 || k === 2 ? C.cb1 : C.cb2);
      }
    }
    put(cx, cy, C.cb0);
  }

  function urchin(put, cx, cy) {
    for (var k = 0; k < 9; k++) {
      var a = -Math.PI + k * Math.PI / 8;
      for (var s = 1; s <= 5; s++) put(cx + Math.cos(a) * s, cy + Math.sin(a) * s * 0.8, s > 3 ? C.rk1 : C.fk);
    }
    put(cx, cy, C.fk); put(cx + 1, cy, C.fk); put(cx, cy + 1, C.dv1);
  }

  // Sand, lit on top, rippled, with a scatter of shells.
  function sandColumn(put, x, top, seed) {
    for (var y = top; y < H; y++) {
      var d = y - top;
      var tone = 0.8 - d * 0.018 + 0.14 * Math.sin(x / 4.3 + PIX.noise(y / 2.5, seed) * 5 + y * 0.6) + (PIX.hash(x, y, seed) - 0.5) * 0.18;
      var c = PIX.pick(SAND, tone, x, y);
      if (PIX.hash(x, y, seed + 1) < 0.004) c = C.fw;
      put(x, y, c);
    }
  }

  // ---- Colonies: the small corals and sponges that carpet the reef -----------------

  // Plate corals: curved shelves overlapping like a stack of saucers, a lit rim
  // on top and a dark underside.
  function plates(put, x, y, s, ramp, tip, rng) {
    var n = s > 5 ? 3 : 2;
    for (var k = 0; k < n; k++) {
      var half = s * (1.3 - k * 0.28), cx = x + (rng() - 0.5) * s * 0.8, py = y - k * 2.6;
      for (var px = Math.round(cx - half); px <= Math.round(cx + half); px++) {
        var u = (px - cx) / half, arc = Math.round(py - 1.8 * (1 - u * u));
        var thick = Math.abs(u) < 0.7 ? 2 : 1;
        put(px, arc - 1, PIX.hash(px, arc, 7) < 0.3 ? tip : ramp[3]);
        put(px, arc, ramp[2]);
        if (thick > 1) put(px, arc + 1, ramp[1]);
        put(px, arc + thick, ramp[0]);
      }
    }
  }
  function bush(put, x, y, s, rng, ramp, tip) {
    var n = 3 + Math.round(s / 2);
    for (var k = 0; k < n; k++) {
      var a = -Math.PI / 2 + (k / (n - 1) - 0.5) * 1.6 + (rng() - 0.5) * 0.3;
      grow(put, x + (rng() - 0.5) * s, y, a, s * (0.9 + rng() * 0.8), rng, ramp[2], ramp[1], tip, 2, true);
    }
  }
  function encrust(put, x, y, s, ramp, seed) {
    for (var dy = -s; dy <= s * 0.6; dy++) {
      for (var dx = -s * 1.4; dx <= s * 1.4; dx++) {
        var a = Math.atan2(dy, dx), rim = s * (0.75 + 0.35 * PIX.noise(a * 2 + 9, seed));
        var d = Math.hypot(dx / 1.4, dy);
        if (d > rim) continue;
        var tone = 0.3 + (-dy / s) * 0.35 + (d > rim - 1 ? 0.25 : 0) + (PIX.hash(x + dx, y + dy, seed) - 0.5) * 0.3;
        put(x + dx, y + dy, PIX.pick(ramp, tone, Math.round(x + dx), Math.round(y + dy)));
      }
    }
  }
  function smallAnemone(put, x, y, s) {
    for (var k = 0; k < 2 * s + 3; k++) {
      var bx = x - s + k, len = 2 + (k * 5 % 3);
      for (var q = 0; q < len; q++) put(bx + (q > 1 ? (k % 2 ? 1 : -1) : 0), y - q, q === len - 1 ? C.cp3 : C.cg2);
    }
  }

  var WALL_KINDS = ["soft", "soft", "soft", "fan", "fan", "sponge", "encrust", "encrust", "encrust", "encrust", "crinoid", "plates"];
  var FLOOR_KINDS = ["brain", "brain", "brain", "plates", "plates", "bush", "bush", "bush", "bush", "soft", "soft",
    "encrust", "encrust", "encrust", "sponge", "fan", "anemone"];
  // Encrusting sponges and algae in quiet colours make the ground the bright colonies stand on.
  var MUTED = [R(["rk1", "ct0", "ct1", "ct2"]), R(["cg0", "cg1", "rk3", "cg2"]), R(["rk1", "cp0", "cp1", "rk4"]), R(["rk2", "cv0", "cv1", "rk4"])];
  var SOFTS = [PINK, PURPLE, ORANGE, RED, PINK];
  var FANS = [RED, PURPLE, ORANGE, YELLOW];
  var BRAINS = [YELLOW, GREEN, TAN, PINK, GREEN];
  var PLATES = [[TAN, C.cb2], [GREEN, C.cb2], [TAN, C.cp4], [PURPLE, C.cv3], [GREEN, C.cy3]];
  var BUSHES = [[TAN, C.cb2], [PURPLE, C.cv3], [BLUE.concat(BLUE[2]), C.cb2], [PINK, C.cp4], [YELLOW, C.cy3]];
  var CRUSTS = [PINK, ORANGE, PURPLE, YELLOW, GREEN, RED];

  function colony(put, c, rng) {
    var pickOne = function (list) { return list[Math.floor(rng() * list.length)]; };
    switch (c.kind) {
      case "brain": dome(put, c.x, c.y + c.s * 0.35, c.s * 1.1, c.s * 0.85, pickOne(BRAINS), grooves(Math.floor(rng() * 900)), 0.12); break;
      case "plates": var p = pickOne(PLATES); plates(put, c.x, c.y, c.s, p[0], p[1], rng); break;
      case "bush": var b = pickOne(BUSHES); bush(put, c.x, c.y, c.s, rng, b[0], b[1]); break;
      case "soft": softCoral(put, c.x, c.y, c.s * 1.6, pickOne(SOFTS), rng, (rng() - 0.5) * 0.6); break;
      case "fan": seaFan(put, c.x, c.y, c.s * 1.2, c.s * 2, pickOne(FANS), Math.floor(rng() * 900)); break;
      case "sponge": barrel(put, c.x, c.y + 1, c.s * 2, c.s * 0.9, c.s * 1.5, pickOne([ORANGE, PURPLE, PINK, YELLOW])); break;
      case "tubes": tubes(put, c.x - 4, c.y + 1, pickOne([PURPLE, YELLOW, ORANGE]), rng); break;
      case "encrust": encrust(put, c.x, c.y, c.s * 0.8, rng() < 0.65 ? pickOne(MUTED) : pickOne(CRUSTS), Math.floor(rng() * 900)); break;
      case "crinoid": crinoid(put, c.x, c.y, rng); break;
      case "anemone": smallAnemone(put, c.x, c.y, Math.max(2, Math.round(c.s / 2))); break;
    }
  }

  // Scatter colonies over the reef's face on a jittered grid, bigger ones along
  // its top edge, and draw them from the top down so the lower, nearer ones overlap.
  function carpet(put, rng, x0, x1, y0, y1, step, test, kinds, size) {
    var list = [];
    for (var gy = y0; gy < y1; gy += step) {
      for (var gx = x0; gx < x1; gx += step) {
        var x = gx + rng() * step, y = gy + rng() * step;
        var edge = test(x, y);
        if (edge < 0) continue;
        list.push({ x: x, y: y, s: size(edge, rng), kind: kinds[Math.floor(rng() * kinds.length)] });
      }
    }
    list.sort(function (a, b) { return a.y - b.y; });
    list.forEach(function (c) { colony(put, c, rng); });
  }

  // ---- The layers -----------------------------------------------------------------

  var FARR = PIX.layer(), MIDR = PIX.layer(), FRONT = PIX.layer();

  function bakeFar() {
    var put = pen(FARR, LAUT.FOG), r = PIX.rng(310);
    for (var x = 138; x < W; x++) {
      var top = 186 + 11 * PIX.noise(x / 26, 311) + 6 * PIX.noise(x / 8, 312) + (x > 420 ? (x - 420) * 0.3 : 0);
      for (var y = Math.floor(top); y < 250; y++) {
        put(x, y, PIX.pick(ROCK, 0.12 + (PIX.noise2(x / 4, y / 3, 313) - 0.5) * 0.4 + (y < top + 2 ? 0.35 : 0), x, y));
      }
    }
    // Coral heads and fans on the far reef, just shapes in the blue.
    carpet(put, r, 140, W, 176, 214, 9, function (x, y) {
      var top = 186 + 11 * PIX.noise(x / 26, 311) + 6 * PIX.noise(x / 8, 312) + (x > 420 ? (x - 420) * 0.3 : 0);
      return y > top - 2 && y < top + 6 ? 1 : -1;
    }, ["brain", "fan", "bush", "plates", "soft"], function (e, rng) { return 3 + rng() * 4; });
  }

  // The wall is built of limestone slabs, broad and flat, stacked and
  // overlapping like broken ledges. Each is lit along its top and dark
  // beneath, and throws shade on the slab below where it juts out further.
  var SLABS = (function () {
    var r = PIX.rng(430), list = [], row = 0;
    for (var y = GEO.surface + 3; y < 262; y += 9 + r() * 5, row++) {
      for (var x = (row % 2 ? -12 : -2) + r() * 8; x < 210; x += 18 + r() * 16) {
        var rx = 13 + r() * 15, cy = y + (r() - 0.5) * 4;
        if (x + rx * 0.4 > REEF.wallX(cy) + 2) continue;
        list.push({ x: x, y: cy, rx: rx, ry: 5 + r() * 4, z: r() * 4 });
      }
    }
    return list;
  })();
  REEF.SLABS = SLABS;

  // Which slab shows at each pixel of the wall, and how it is lit there.
  function slabField() {
    var zb = new Float32Array(W * H).fill(-1), id = new Int16Array(W * H).fill(-1), lit = new Float32Array(W * H);
    SLABS.forEach(function (s, i) {
      for (var y = Math.max(GEO.surface + 1, Math.floor(s.y - s.ry)); y <= Math.min(H - 1, Math.ceil(s.y + s.ry)); y++) {
        for (var x = Math.max(0, Math.floor(s.x - s.rx)); x <= Math.min(W - 1, Math.ceil(s.x + s.rx)); x++) {
          var u = (x - s.x) / s.rx, v = (y - s.y) / s.ry, q = 1 - Math.pow(Math.abs(u), 3) - v * v;
          if (q <= 0) continue;
          var z = s.z + s.ry * Math.sqrt(q), p = y * W + x;
          if (z <= zb[p]) continue;
          var root = Math.sqrt(Math.max(q, 0.04));
          zb[p] = z; id[p] = i;
          lit[p] = lambert(1.5 * s.ry * u * Math.abs(u) / (s.rx * root), v / root, 1);
        }
      }
    });
    return { zb: zb, id: id, lit: lit };
  }

  function wallRock(F, x, y) {
    var p = y * W + x, n = PIX.noise2(x / 3, y / 3, 421) - 0.5;
    // Between the slabs, dark crevices.
    if (F.id[p] < 0) return PIX.dith(x, y, 0.3 + n) ? C.rk1 : C.rk0;
    // Shade from a slab above that juts out further.
    var shade = 0;
    for (var k = 1; k <= 4 && y - k > GEO.surface; k++) {
      var a = (y - k) * W + x;
      if (F.id[a] >= 0 && F.id[a] !== F.id[p] && F.zb[a] > F.zb[p] + 1) { shade = 0.3 - k * 0.05; break; }
    }
    var tone = 0.08 + 0.8 * F.lit[p] + n * 0.3 - shade - (y - GEO.surface) * 0.0014;
    // The faces are mottled with encrusting sponge and algae.
    var m = PIX.noise2(x / 5, y / 4, 422);
    if (m > 0.64) return PIX.pick(MUTED[Math.floor(PIX.noise2(x / 9, y / 9, 423) * 4) % 4], tone, x, y);
    return PIX.pick(ROCK, tone, x, y);
  }

  // Colonies along the top of each slab where it shows, soft corals hanging
  // under some, and something bigger on the ends that stand out into the water.
  function growOnSlabs(put, F, r) {
    SLABS.forEach(function (s, i) {
      for (var x = s.x - s.rx * 0.85 + r() * 4; x < s.x + s.rx * 0.85; x += 5 + r() * 6) {
        var u = (x - s.x) / s.rx, h = s.ry * Math.sqrt(1 - Math.pow(Math.abs(u), 3));
        var xi = Math.round(x), top = Math.round(s.y - h) + 1, bot = Math.round(s.y + h) - 1;
        if (xi < 0 || top <= GEO.surface + 1) continue;
        if (F.id[top * W + xi] === i) colony(put, { x: x, y: top, s: 2.5 + r() * 3, kind: WALL_KINDS[Math.floor(r() * WALL_KINDS.length)] }, r);
        if (bot < H && F.id[bot * W + xi] === i && r() < 0.18) {
          softCoral(put, x, bot, 3 + r() * 4, SOFTS[Math.floor(r() * SOFTS.length)], r, Math.PI + (r() - 0.5) * 0.6);
        }
      }
      var end = s.x + s.rx * 0.8;
      if (end > REEF.wallX(s.y) + 2 && s.y > GEO.surface + 14) {
        var tip = Math.round(s.y - s.ry * Math.sqrt(1 - 0.512)) + 1;
        if (r() < 0.5) seaFan(put, end, tip, 7 + r() * 6, 12 + r() * 10, FANS[Math.floor(r() * FANS.length)], 700 + i);
        else softCoral(put, end, tip, 7 + r() * 5, SOFTS[Math.floor(r() * SOFTS.length)], r, 0.3 + r() * 0.4);
      }
    });
  }

  function bakeReef() {
    var put = pen(MIDR, LAUT.TINT), r = PIX.rng(420), F = slabField(), x, y;
    // Sand first, then the reef's rock over it.
    for (x = 120; x < W; x++) sandColumn(put, x, sandY(x), 521);
    for (y = GEO.surface - 2; y < H; y++) {
      for (x = 0; x < W; x++) {
        if (y > GEO.surface && (x <= REEF.wallX(y) || F.id[y * W + x] >= 0)) { put(x, y, wallRock(F, x, y)); continue; }
        if (!inside(x, y)) continue;
        var tone = 0.14 + (PIX.noise2(x / 4, y / 3, 421) - 0.5) * 0.4 + (y - topY(x) < 3 ? 0.25 : 0) - Math.max(0, y - 200) * 0.002;
        put(x, y, PIX.pick(ROCK, tone, x, y));
      }
    }
    // Oysters and weed in the band just under the surface.
    for (x = 0; x < REEF.wallX(GEO.surface + 4); x++) {
      for (y = GEO.surface - 2; y < GEO.surface + 6; y++) {
        var h = PIX.hash(x, y, 440);
        if (h < 0.35) put(x, y, h < 0.12 ? C.rk5 : h < 0.25 ? C.cg1 : C.cg2);
      }
    }
    growOnSlabs(put, F, r);
    // The floor: a dense carpet of every kind of coral.
    carpet(put, r, 120, W, 196, H, 8, function (x, y) {
      if (!inside(x, y) || x < REEF.wallX(y) + 2) return -1;
      return y - topY(x) < 6 ? 1 : 0;
    }, FLOOR_KINDS, function (e, rng) { return e ? 4 + rng() * 5 : 3 + rng() * 3; });
    crinoid(put, 140, 132, r);
    // The bommie's giant clam.
    clam(put, REEF.clam.x, REEF.clam.y);
    // The channel: a blue sea star, a sea cucumber, urchins at its edges.
    seaStar(put, 263, 252);
    for (x = 280; x < 289; x++) { put(x, 256, C.fk); put(x, 255, x % 2 ? C.dv1 : C.fk); }
    urchin(put, 255, 244);
    urchin(put, 290, 242);
    // The anemone's column on its rock.
    var A = REEF.anemone;
    for (x = A.x - 7; x <= A.x + 7; x++) for (y = A.y; y < A.y + 5; y++) put(x, y, y === A.y ? C.cv2 : x < A.x ? C.cv0 : C.cv1);
    bakeTable(put, r);
    // The staghorn thicket, blue at the tips.
    var S = REEF.stag;
    staghorn(put, S.x0, S.x1, r, C.ct2, C.ct1, C.cb2, 20);
    staghorn(put, S.x0 + 6, S.x1, r, C.cb1, C.cb0, C.cb2, 13);
    REEF.TOPS = topsOf(F);
  }

  // The table coral: shade under the plate, a short stalk, and the plate itself,
  // domed a little, its top a fuzz of upturned branch tips, blue at the ends.
  function bakeTable(put, r) {
    var T = REEF.table, x, y, cx = (T.x0 + T.x1) / 2, half = (T.x1 - T.x0) / 2;
    for (y = T.y + 3; y < T.floor + 8; y++) {
      for (x = T.x0 + 2; x < T.x1 - 2; x++) {
        var inset = Math.min(x - T.x0, T.x1 - x), soft = Math.min(1, inset / 12) * (1 - Math.max(0, y - T.floor) / 8);
        if (PIX.dith(x, y, soft * 0.95)) shadeIn(MIDR, x, y, LAUT.SHADE);
      }
    }
    for (y = T.y + 2; y < T.floor - 5; y++) {
      var w = 2 + (y > T.floor - 12 ? 2 : 0);
      for (x = T.stalk - w; x <= T.stalk + w; x++) put(x, y, x < T.stalk - 1 ? C.ct0 : x > T.stalk + 1 ? C.ct2 : C.ct1);
    }
    for (x = T.x0; x <= T.x1; x++) {
      var u = (x - cx) / half, crown = Math.round(T.y - 2.5 * (1 - u * u) + (Math.abs(u) > 0.9 ? 1 : 0));
      // Underside in shadow, a lit edge, then the bristling top.
      put(x, crown + 3, C.ct0);
      put(x, crown + 2, PIX.dith(x, crown, 0.5) ? C.ct0 : C.ct1);
      put(x, crown + 1, C.ct2);
      put(x, crown, PIX.hash(x, 0, 563) < 0.5 ? C.cg2 : C.ct3);
      var tipH = PIX.hash(x, 1, 564) < 0.6 ? 1 + Math.floor(PIX.hash(x, 2, 565) * 2) : 0;
      for (var k = 1; k <= tipH; k++) put(x, crown - k, k === tipH ? (PIX.hash(x, 3, 566) < 0.55 ? C.cb2 : C.cg3) : C.cg2);
    }
  }

  // Where light from above falls on the reef: the sand, the upper faces of the
  // slabs, and the top two pixels of anything with open water above it.
  function topsOf(F) {
    var tops = new Uint8Array(W * H), sand = new Set(), T = REEF.table;
    LAUT.TINT.forEach(function (t) { SAND.forEach(function (c) { sand.add(t[c]); }); });
    for (var x = 0; x < W; x++) {
      for (var y = GEO.surface + 1, open = 3; y < H; y++) {
        var p = y * W + x, c = MIDR.px[p];
        if (c === NONE) { open = 0; continue; }
        open++;
        if (x > T.x0 + 3 && x < T.x1 - 3 && y > T.y + 3 && y < T.floor + 8) continue;
        if (open <= 2 || sand.has(c) || (F.id[p] >= 0 && F.lit[p] > 0.6)) tops[p] = 1;
      }
    }
    return tops;
  }

  function bakeFront() {
    var tables = LAUT.TINT.map(function (t, i) { return LAUT.TINT[Math.max(0, i - 2)]; });
    var put = pen(FRONT, tables), r = PIX.rng(610), x, y;
    // Dark rocks along the bottom edge, with bright life on them.
    for (x = 0; x < W; x++) {
      var top = 259 + 5 * PIX.noise(x / 11, 611) + 4 * PIX.noise(x / 31, 612);
      for (y = Math.floor(top); y < H; y++) put(x, y, PIX.pick(ROCK, 0.1 + (PIX.noise2(x / 3, y / 3, 613) - 0.5) * 0.4 + (y < top + 2 ? 0.3 : 0), x, y));
    }
    carpet(put, r, 0, W, 256, H, 9, function (x, y) {
      var top = 259 + 5 * PIX.noise(x / 11, 611) + 4 * PIX.noise(x / 31, 612);
      return y > top - 1 && y < top + 5 ? 1 : -1;
    }, ["encrust", "brain", "plates", "bush", "anemone"], function (e, rng) { return 3 + rng() * 3; });
    softCoral(put, 34, 262, 20, PURPLE, r, -0.1);
    dome(put, 172, 274, 24, 18, GREEN, grooves(620), 0.1);
    barrel(put, 246, 270, 26, 11, 17, ORANGE);
    softCoral(put, 306, 266, 14, PINK, r, 0.15);
    crinoid(put, 344, 260, r);
    dome(put, 394, 274, 17, 12, PURPLE, grooves(621), 0.12);
    seaFan(put, 458, 268, 24, 54, RED, 622);
    tubes(put, 110, 264, YELLOW, r);
  }

  // ---- Moving parts -----------------------------------------------------------------

  // The anemone's tentacles stream in the surge.
  function drawAnemone(f, t) {
    var A = REEF.anemone;
    for (var k = 0; k < 24; k++) {
      var bx = A.x - 8 + k * 16 / 23, len = 6 + (k * 7 % 4), phase = k * 0.55;
      for (var s = 0; s < len; s++) {
        var u = s / len, sway = Math.sin(t * 1.9 + phase - s * 0.35) * u * 2.4 + (bx - A.x) * u * 0.25;
        var x = Math.round(bx + sway), y = A.y - s;
        var c = s >= len - 1 ? C.cp3 : u > 0.5 ? C.cg3 : C.cg2;
        f[y * W + x] = LAUT.tinted(LAUT.TINT, c, x, y);
      }
    }
  }

  function drawFarReef(f) { PIX.blit(f, FARR); }
  // The wall reaches up to the waterline, so the reef is clipped to the water.
  function drawReef(f) {
    var row = LAUT.SURF;
    for (var y = MIDR.y0; y <= MIDR.y1; y++) {
      for (var x = MIDR.x0; x <= MIDR.x1; x++) {
        var c = MIDR.px[y * W + x];
        if (c !== NONE && y >= row[x]) f[y * W + x] = c;
      }
    }
  }
  function drawFront(f) { PIX.blit(f, FRONT); }

  bakeFar();
  bakeReef();
  bakeFront();
  LAUT.REEF = REEF;
  LAUT.FARR = FARR;
  LAUT.MIDR = MIDR;
  LAUT.FRONT = FRONT;
  LAUT.drawFarReef = drawFarReef;
  LAUT.drawReef = drawReef;
  LAUT.drawAnemone = drawAnemone;
  LAUT.drawFront = drawFront;
})(S);
// pixel-raja-ampat/src/light.js
// Light in the water: sunbeams slanting down from the surface, caustics
// dancing over the sand and the tops of the reef, and specks of marine snow.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H;
  var GEO = LAUT.GEO, LIGHT = LAUT.LIGHT, GLINT = LAUT.GLINT;

  // Each beam: where it meets the surface, its half width, and a phase.
  var BEAMS = [[176, 7, 0], [214, 12, 1.7], [262, 9, 3.1], [300, 16, 0.9], [352, 8, 2.4],
    [396, 13, 4], [440, 10, 5.2], [492, 14, 2], [540, 9, 3.6]];
  // The sun is up to the right, so the light runs down to the left.
  var SLANT = 0.38, REACH = 146;
  // A beam lifts the water one step up its ramp, and anything else a touch.
  var SOFT = PIX.toward("#e9ffff", 0.14);
  var BEAM = (function () {
    var table = new Uint8Array(256), up = {};
    for (var k = 1; k < 12; k++) up[PIX.C["uw" + k]] = PIX.C["uw" + (k - 1)];
    for (var c = 0; c < 256; c++) table[c] = c in up ? up[c] : c < PIX.PALETTE.length ? SOFT[c] : c;
    return table;
  })();

  // While the monster is about, the light goes out of the water.
  function lit(t) { return LAUT.SWIM ? 1 - 0.7 * LAUT.SWIM.dread(t) : 1; }
  function drawBeams(f, t) {
    var row = LAUT.SURF, dim = lit(t);
    for (var y = GEO.surface + 2; y < GEO.surface + REACH; y++) {
      var depth = (y - GEO.surface) / REACH, fade = Math.pow(1 - depth, 1.3);
      for (var k = 0; k < BEAMS.length; k++) {
        var b = BEAMS[k], sway = 5 * Math.sin(t * 0.35 + b[2]) + 2 * Math.sin(t * 0.9 + b[2] * 2);
        var cx = b[0] + sway - (y - GEO.surface) * SLANT, w = b[1] * (1 + depth * 0.6);
        var glow = dim * fade * (0.75 + 0.25 * Math.sin(t * 0.6 + b[2] * 1.7));
        for (var x = Math.max(0, Math.floor(cx - w)); x <= Math.min(W - 1, Math.ceil(cx + w)); x++) {
          if (y <= row[x] + 1) continue;
          // One step up the ramp across the beam, two in its bright core.
          var a = (1 - Math.abs(x - cx) / w) * glow, p = y * W + x;
          if (PIX.dith(x, y, a * 0.9)) f[p] = BEAM[f[p]];
          if (a > 0.45 && PIX.dith(x, y, (a - 0.45) * 1.6)) f[p] = BEAM[f[p]];
        }
      }
    }
  }

  // Two sets of wavy lines crossing make the net of a caustic.
  function caustic(x, y, t) {
    var u = x * 0.21 + y * 0.05, v = y * 0.33;
    var a = Math.sin(u + t * 1.3 + 1.6 * Math.sin(v * 0.8 - t * 0.9));
    var b = Math.sin(v * 1.1 - t * 1.1 + 1.6 * Math.sin(u * 0.9 + t * 0.7));
    return Math.min(Math.abs(a), Math.abs(b));
  }
  function drawCaustics(f, t) {
    var tops = LAUT.REEF.TOPS, row = LAUT.SURF, dim = lit(t);
    for (var y = GEO.surface + 3; y < H; y++) {
      var width = (0.16 - (y - GEO.surface) / 160 * 0.05) * dim;
      for (var x = 0; x < W; x++) {
        var p = y * W + x;
        if (tops[p] && y > row[x] + 1 && caustic(x, y, t) < width) f[p] = GLINT[f[p]];
      }
    }
  }

  // Marine snow: specks sinking slowly and drifting with the current.
  var SNOW = (function () {
    var r = PIX.rng(905), list = [];
    for (var k = 0; k < 70; k++) {
      list.push({ x: r() * W, y: r() * 140, vx: -0.8 - r() * 1.6, vy: 0.4 + r() * 0.6, ph: r() * 6.28, big: r() < 0.2 });
    }
    return list;
  })();
  function drawSnow(f, t) {
    SNOW.forEach(function (s) {
      var x = Math.floor((((s.x + s.vx * t + 3 * Math.sin(t * 0.4 + s.ph)) % W) + W) % W);
      var y = Math.floor(GEO.surface + 8 + (s.y + s.vy * t) % 140 + 2 * Math.sin(t * 0.3 + s.ph));
      if (y <= LAUT.SURF[x] + 2 || y >= H) return;
      var p = y * W + x;
      f[p] = LIGHT[LIGHT[f[p]]];
      if (s.big && x + 1 < W) f[p + 1] = LIGHT[f[p + 1]];
    });
  }

  LAUT.drawBeams = drawBeams;
  LAUT.caustic = caustic;
  LAUT.drawCaustics = drawCaustics;
  LAUT.drawSnow = drawSnow;
})(S);
// pixel-raja-ampat/src/splat.js
// A small depth-buffered renderer for what swims in the lagoon. A pinhole camera
// sits right at the surface looking out to sea: straight ahead on the surface is
// the middle of the waterline, a metre at distance z spans F / z pixels, and
// everything under water is below it. Spheres, capsules, lines and triangles are
// splatted into a buffer where the nearest surface wins each pixel, shaded as
// they are drawn. The buffer is then laid over the scene one slice of depth at a
// time, so what swims there can pass behind the far reef while it is far off and
// in front of everything once it is near.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H;
  var CAM = { cx: W / 2, cy: LAUT.GEO.surface, f: 300, near: 0.3 };

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

  // A sphere that only takes the pixels it wins and notes in own the id of what won
  // each, to be shaded once all are in, so no pixel is shaded twice. Returns where its
  // centre lands on the screen, and null behind the eye.
  function ball(b, p, r, part, own, id) {
    var q = project(p);
    if (!q) return null;
    var sr = r * q[2], i;
    if (sr < 0.5) {
      var px = Math.round(q[0]), py = Math.round(q[1]);
      i = py * W + px;
      if (px >= 0 && px < W && py >= 0 && py < H && claim(b, i, p[2] - r)) { own[i] = id; b.part[i] = part; }
      return q;
    }
    var y0 = Math.max(0, Math.ceil(q[1] - sr)), y1 = Math.min(H - 1, Math.floor(q[1] + sr));
    for (var y = y0; y <= y1; y++) {
      var dy = (y - q[1]) / sr, half = sr * Math.sqrt(Math.max(0, 1 - dy * dy));
      var x0 = Math.max(0, Math.ceil(q[0] - half)), x1 = Math.min(W - 1, Math.floor(q[0] + half));
      for (var x = x0; x <= x1; x++) {
        var dx = (x - q[0]) / sr, d = p[2] - r * Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
        i = y * W + x;
        if (d >= b.depth[i]) continue;
        if (b.depth[i] === Infinity) b.list[b.n++] = i;
        b.depth[i] = d;
        own[i] = id;
        b.part[i] = part;
      }
    }
    return q;
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

  LAUT.CAM = CAM;
  LAUT.SPLAT = {
    project: project, buffer: buffer, clear: clear, claim: claim,
    sphere: sphere, ball: ball, capsule: capsule, line: line, triangle: triangle, lay: lay
  };
})(S);
// pixel-raja-ampat/src/swim.js
// The mosasaur's route: one loop through the lagoon every 90 seconds. First a vast
// shadow far off in the blue, gliding left and out of sight behind the island's
// wall; then a slow pass right in front of us, too big for the picture; then out
// of sight again, down into the deep, and up in a rush to burst out of the sea;
// then a long sink back into the dark. The loop is set as keys, where the middle of
// the animal is at given moments, joined by a smooth curve that the whole body
// follows, rising and dipping a little as it cruises. It swims as a carangiform
// swimmer does: its head and chest hold steady while a wave runs down its back
// half and its tail beats from side to side. When it bursts out of the sea its
// body is thrown up and falls back, turning about its middle, rearing as it
// rises and curling the other way as it falls. Metres throughout: x to the
// right, y up from the surface, z away from us.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, TAU = Math.PI * 2, DEG = Math.PI / 180;
  var PERIOD = 90, OFFSET = 12, L = 15, SC = 5.5, STEP = 0.05;
  var T = { show: 4, hide: 20, pass: [25, 35], breach: 42.3, sink: 52, gone: 58 };

  function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unit(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerp(a, b, u) { return add(a, sub(b, a), u); }
  function smooth(u) { u = u < 0 ? 0 : u > 1 ? 1 : u; return u * u * (3 - 2 * u); }
  var UP = [0, 1, 0];

  // ---- The lunge --------------------------------------------------------------------
  // It comes up at 50 degrees, heading left and a little toward us, and its snout
  // breaks the surface at SNOUT; then it rears to 62 degrees and falls forward.
  var HEADING = unit([-0.94, 0, -0.34]), RISE = 50 * DEG;
  function axis(pitch) { return [HEADING[0] * Math.cos(pitch), Math.sin(pitch), HEADING[2] * Math.cos(pitch)]; }
  var SNOUT = [4.2, 0, 18], MID = add(SNOUT, axis(RISE), -SC);
  function lunge(ahead, up) { return add(add(MID, HEADING, ahead), UP, up); }

  // ---- The keys -------------------------------------------------------------------------
  var B = T.breach;
  var KEYS = [
    // Out of sight far off to the right, then the long glide left, far off in the blue,
    // dipping and rising a little as it goes.
    [0, [52, -9, 44]], [T.show, [38, -7, 38]], [8, [25, -7.6, 37]], [12, [12, -5.9, 36]], [16, [-1, -7, 34.6]],
    [T.hide, [-14, -5.8, 33]],
    // Round behind the wall and out past the left edge, coming close.
    [23, [-24, -4.2, 20]], [T.pass[0], [-15, -1.7, 7.4]],
    // Right past us, slowly, just under the surface.
    [30, [0, -1.5, 6.6]], [T.pass[1], [15, -1.7, 7.4]],
    // Away to the right, down deep, and round for the rush.
    [38.5, [22, -8, 17]], [B - 1.3, add(MID, axis(RISE), -12)],
    // The lunge: its middle rises toward the surface and sinks back as it drops forward.
    [B, MID], [B + 0.9, lunge(4.5, 2.9)], [B + 2.2, lunge(7.5, 2)], [B + 3.6, lunge(10, 1.6)],
    // Down and away into the deep, fading as it goes.
    [47, [-3.5, -4.5, 17]], [T.sink, [0, -13, 31]], [T.gone, [4, -19, 42]], [74, [30, -20, 55]]
  ];

  // Centripetal Catmull-Rom between p1 and p2: no loops or cusps however the points lie.
  function catmull(p0, p1, p2, p3, u) {
    function knot(a, b) { return Math.max(1e-6, Math.pow(Math.hypot.apply(null, sub(b, a)), 0.5)); }
    var t1 = knot(p0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, p3), t = t1 + (t2 - t1) * u;
    var a1 = lerp(p0, p1, t / t1), a2 = lerp(p1, p2, (t - t1) / (t2 - t1)), a3 = lerp(p2, p3, (t - t2) / (t3 - t2));
    return lerp(lerp(a1, a2, t / t2), lerp(a2, a3, (t - t1) / (t3 - t1)), (t - t1) / (t2 - t1));
  }
  // The track: points every STEP metres round the closed curve, and the distance
  // along it at which each key lies.
  var TRACK = (function () {
    var n = KEYS.length, pts = [], at = [], len = 0, prev = null;
    for (var k = 0; k < n; k++) {
      at.push(len);
      for (var i = 0; i < 60; i++) {
        var p = catmull(KEYS[PIX.mod(k - 1, n)][1], KEYS[k][1], KEYS[(k + 1) % n][1], KEYS[(k + 2) % n][1], i / 60);
        if (prev) len += Math.hypot.apply(null, sub(p, prev));
        pts.push({ p: p, s: len });
        prev = p;
      }
    }
    len += Math.hypot.apply(null, sub(KEYS[0][1], prev));
    var out = [], j = 0;
    for (var s = 0; s < len; s += STEP) {
      while (j + 1 < pts.length && pts[j + 1].s < s) j++;
      var a = pts[j], b = pts[j + 1] || { p: KEYS[0][1], s: len };
      out.push(lerp(a.p, b.p, (s - a.s) / Math.max(1e-9, b.s - a.s)));
    }
    return { pts: out, keys: at, length: out.length * STEP };
  })();
  var N = TRACK.pts.length, LOOP = TRACK.length;

  // The way it faces at each point of the track, and its back: up, but banked a
  // little into its turns, as a shark banks.
  var FRAMES = (function () {
    var d = TRACK.pts.map(function (p, k) { return unit(sub(TRACK.pts[(k + 1) % N], TRACK.pts[PIX.mod(k - 1, N)])); });
    return d.map(function (dk, k) {
      var c = sub(d[(k + 4) % N], d[PIX.mod(k - 4, N)]), u = add(UP, [c[0], 0, c[2]], 0.35 / (8 * STEP));
      u = unit(add(u, dk, -dot(u, dk)));
      return { d: dk, u: u, w: cross(dk, u) };
    });
  })();

  // ---- Its clock --------------------------------------------------------------------------
  // How far along the track its middle is at time tau, through each key at its own
  // moment, speeding and slowing smoothly in between (a monotone cubic through the keys).
  var CLOCK = (function () {
    var s = TRACK.keys.concat([LOOP]), t = KEYS.map(function (k) { return k[0]; }).concat([PERIOD]), n = s.length;
    var m = [], slope = [];
    for (var k = 0; k < n - 1; k++) slope.push((t[k + 1] - t[k]) / (s[k + 1] - s[k]));
    for (k = 0; k < n; k++) {
      var a = slope[PIX.mod(k - 1, n - 1)], b = slope[k % (n - 1)];
      m.push(a * b <= 0 ? 0 : 2 / (1 / a + 1 / b));
    }
    var table = new Float64Array(Math.ceil(PERIOD / STEP) + 1), j = 0;
    function timeAt(x) {
      while (j < n - 2 && x > s[j + 1]) j++;
      var h = s[j + 1] - s[j], u = (x - s[j]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * t[j] + (u3 - 2 * u2 + u) * h * m[j] + (-2 * u3 + 3 * u2) * t[j + 1] + (u3 - u2) * h * m[j + 1];
    }
    // Invert time against distance by stepping along the track.
    var x = 0, dx = STEP / 8, now = 0;
    for (var i = 0; i < table.length; i++) {
      var want = i * STEP;
      while (x < LOOP && now < want) { x += dx; now = timeAt(Math.min(x, LOOP)); }
      table[i] = Math.min(x, LOOP);
    }
    return table;
  })();
  function clock(t) { return PIX.mod(t - OFFSET, PERIOD); }
  function travelled(tau) {
    var k = tau / STEP, i = Math.floor(k), u = k - i;
    return CLOCK[i] + (CLOCK[Math.min(i + 1, CLOCK.length - 1)] - CLOCK[i]) * u;
  }
  function onTrack(s) {
    var k = PIX.mod(s, LOOP) / STEP, i = Math.floor(k), u = k - i, a = FRAMES[i % N], b = FRAMES[(i + 1) % N];
    var d = unit(lerp(a.d, b.d, u)), up = lerp(a.u, b.u, u);
    up = unit(add(up, d, -dot(up, d)));
    return { p: lerp(TRACK.pts[i % N], TRACK.pts[(i + 1) % N], u), d: d, u: up, w: cross(d, up) };
  }

  // ---- Swimming ------------------------------------------------------------------------------
  // Its tail beats from side to side, slowly while it glides, fast in the rush up.
  // The beat's phase is the running sum of its rate, rounded to whole beats a loop.
  var RATE = [[0, 0.36], [20, 0.36], [26, 0.42], [36, 0.45], [B - 3, 0.7], [B - 1.4, 1.5], [B + 0.4, 1.3], [B + 2, 0.5],
    [T.gone, 0.36], [PERIOD, 0.36]];
  var PHASE = (function () {
    var out = new Float64Array(Math.ceil(PERIOD / STEP) + 1), sum = 0, j = 0;
    for (var i = 0; i < out.length; i++) {
      var tau = i * STEP;
      while (RATE[j + 1][0] < tau) j++;
      var a = RATE[j], b = RATE[j + 1];
      out[i] = sum;
      sum += (a[1] + (b[1] - a[1]) * smooth((tau - a[0]) / (b[0] - a[0]))) * STEP;
    }
    var k = Math.round(sum) / sum;
    return out.map(function (v) { return v * k * TAU; });
  })();
  function phase(tau) {
    var k = tau / STEP, i = Math.floor(k);
    return PHASE[i] + (PHASE[Math.min(i + 1, PHASE.length - 1)] - PHASE[i]) * (k - i);
  }
  // The wave runs back along the body a wavelength of WAVE metres at a time. How much
  // of it each point takes, s metres behind the snout: hardly any at the head and chest,
  // growing through the back half to all of it at the tail.
  var WAVE = 12, K = TAU / WAVE, STILL = 4;
  function reach(s) { var e = s > STILL ? (s - STILL) / (L - STILL) : 0; return 0.03 + 0.95 * e * e; }
  function reachSlope(s) { return s > STILL ? 1.9 * (s - STILL) / ((L - STILL) * (L - STILL)) : 0; }
  // How far the tail swings, in metres: wider in the rush up and the thrash out of the sea.
  function strength(tau) {
    var fast = smooth((tau - (B - 3)) / 1.5) * (1 - smooth((tau - (B + 1.5)) / 2));
    return 1.25 + 0.5 * fast;
  }
  // How far each point is thrown to the side, and how steeply that changes along the
  // body, so that the body faces along its own curve.
  function sway(s, tau) { return strength(tau) * reach(s) * Math.sin(phase(tau) - K * (s - SC)); }
  function swaySlope(s, tau) {
    var a = phase(tau) - K * (s - SC);
    return strength(tau) * (reachSlope(s) * Math.sin(a) - reach(s) * K * Math.cos(a));
  }
  // Each beat of the tail also lifts and drops the back half a little.
  var HEAVE = 0.16;
  function heave(s, tau) { return HEAVE * reach(s) * Math.sin(phase(tau) - K * (s - SC) + 1.2); }
  function heaveSlope(s, tau) {
    var a = phase(tau) - K * (s - SC) + 1.2;
    return HEAVE * (reachSlope(s) * Math.sin(a) - reach(s) * K * Math.cos(a));
  }

  // ---- The breach ------------------------------------------------------------------------
  // Pitch and roll of its middle through the lunge, in degrees, against seconds from the
  // moment its snout breaks the surface; and how far its front half and its back half
  // bend, + toward its back: it rears as it rises, the tail still driving below, then
  // curls the other way as it falls, the tail whipping up behind.
  var PITCH = [[-1.3, 50], [0, 50], [0.9, 62], [1.5, 40], [2.2, -4], [2.9, -9], [3.8, -4], [4.6, -2]];
  var ROLL = [[-1.3, 0], [0, 0], [0.9, 12], [2.2, 50], [3.2, 30], [4.6, 0]];
  var ARCH_FRONT = [[-1.3, 0], [-0.3, 8], [0.4, 22], [0.9, 26], [1.5, 4], [2.1, -22], [2.7, -10], [3.6, 0]];
  var ARCH_BACK = [[-1.3, 0], [-0.3, 6], [0.4, 10], [0.9, 8], [1.5, -4], [2.1, -12], [2.7, -6], [3.6, 0]];
  function curve(keys, u) {
    if (u <= keys[0][0]) return keys[0][1];
    for (var k = 1; k < keys.length; k++) {
      if (u <= keys[k][0]) return keys[k - 1][1] + (keys[k][1] - keys[k - 1][1]) * smooth((u - keys[k - 1][0]) / (keys[k][0] - keys[k - 1][0]));
    }
    return keys[keys.length - 1][1];
  }
  // How much of the pose is the thrown body rather than the track: all of it from
  // just before the snout breaks the surface until it is back under.
  function stiff(tau) { return smooth((tau - (B - 0.9)) / 0.7) * (1 - smooth((tau - (B + 3.3)) / 1)); }
  function thrown(tau, s, mid) {
    var u = tau - B, d = axis(curve(PITCH, u) * DEG), roll = curve(ROLL, u) * DEG;
    var up = unit(add(UP, d, -dot(UP, d))), side = cross(d, up);
    up = add(add([0, 0, 0], up, Math.cos(roll)), side, Math.sin(roll));
    // Along an arc from the middle, a metres toward the head (behind it, a < 0).
    var a = SC - s, k = (a >= 0 ? curve(ARCH_FRONT, u) / SC : curve(ARCH_BACK, u) / (L - SC)) * DEG;
    var along = Math.abs(k) < 1e-6 ? a : Math.sin(k * a) / k, off = Math.abs(k) < 1e-6 ? 0 : (1 - Math.cos(k * a)) / k;
    var c = Math.cos(k * a), n = Math.sin(k * a), dd = add(add([0, 0, 0], d, c), up, n), uu = add(add([0, 0, 0], up, c), d, -n);
    return { p: add(add(mid, d, along), up, off), d: dd, u: uu, w: cross(dd, uu) };
  }

  // ---- The spine ------------------------------------------------------------------------------
  // Where each point s metres behind the snout is at time t, which way it faces along
  // its own curve, and its back and side.
  function spine(t, list) {
    var tau = clock(t), mid = travelled(tau), k = stiff(tau), at = onTrack(mid).p;
    return list.map(function (s) {
      var q = onTrack(mid + SC - s);
      if (k > 0) {
        var r = thrown(tau, s, at);
        q = { p: lerp(q.p, r.p, k), d: unit(lerp(q.d, r.d, k)), u: lerp(q.u, r.u, k) };
        q.u = unit(add(q.u, q.d, -dot(q.u, q.d)));
        q.w = cross(q.d, q.u);
      }
      var d = unit(add(add(q.d, q.w, -swaySlope(s, tau)), q.u, -heaveSlope(s, tau)));
      var u = unit(add(q.u, d, -dot(q.u, d)));
      return { s: s, p: add(add(q.p, q.w, sway(s, tau)), q.u, heave(s, tau)), d: d, u: u, w: cross(d, u) };
    });
  }

  function shown(t) { var tau = clock(t); return tau >= T.show && tau < T.gone; }
  // How much the lagoon fears it, 0 to 1: rising a little before its shadow shows,
  // held while it is near, ebbing slowly once it has sunk away.
  function dread(t) { var tau = clock(t); return smooth((tau - 1) / 6) * (1 - smooth((tau - 52) / 12)); }

  LAUT.V3 = { add: add, sub: sub, dot: dot, cross: cross, unit: unit, lerp: lerp };
  // Where the wave is at s at time t, as an angle: the fin and paddles keep time by it.
  function wave(s, t) { return phase(clock(t)) - K * (s - SC); }

  LAUT.SWIM = {
    PERIOD: PERIOD, OFFSET: OFFSET, L: L, SC: SC, T: T,
    clock: clock, spine: spine, shown: shown, phase: phase, wave: wave, dread: dread
  };
})(S);
// pixel-raja-ampat/src/mosahead.js
// The mosasaur's head, and the light it is painted in. A long heavy skull with a
// blunt snout, a lower jaw hinged far back that drops wide open, conical teeth
// along both jaws and a second row on the roof of the mouth, slit nostrils set
// back on the snout, and a large golden eye under a heavy brow. As it passes it
// turns its head on its neck to look at us, and blinks. It is built of spheres
// and capsules in the head's own frame, measured in head lengths: f forward from
// the back of the skull, u up, w aside.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, C = PIX.C, W = PIX.W, H = PIX.H;
  var S = LAUT.SPLAT, V = LAUT.V3, SWIM = LAUT.SWIM;
  var HL = 1.75;
  var PART = { body: 1, fin: 2, fluke: 3, head: 4, jaw: 5, mouth: 6, tooth: 7, eye: 8, brow: 9 };

  // ---- Light --------------------------------------------------------------------
  // Under water the light comes down from the surface, a little from the right where
  // the sun is and a little from our side, and the water scatters some of it all round;
  // whatever faces the deep is darkest.
  var SUN = V.unit([0.3, 0.9, -0.25]);
  function light(nx, ny, nz) {
    var key = nx * SUN[0] + ny * SUN[1] + nz * SUN[2];
    return 0.22 + 0.45 * Math.max(0, key) + 0.3 * (0.5 + 0.5 * ny);
  }
  function band(ramp, v) {
    var i = Math.floor(v * ramp.length);
    return ramp[i < 0 ? 0 : i >= ramp.length ? ramp.length - 1 : i];
  }
  var INK = {
    skin: PIX.names(["ms0", "ms1", "ms2", "ms3", "ms4", "ms5"]), belly: PIX.names(["ms2", "mv0", "mv1", "mv2", "mv3"]),
    tooth: PIX.names(["mt0", "mt1", "mt2"]), mouth: PIX.names(["mm0", "mm1", "mm2", "mm3"]), sun: SUN, light: light, band: band
  };

  // ---- Where the head is and which way it faces ---------------------------------------
  function smooth(v) { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); }
  function keyed(keys, tau) {
    for (var k = 1; k < keys.length; k++) {
      if (tau <= keys[k][0]) return keys[k - 1][1] + (keys[k][1] - keys[k - 1][1]) * smooth((tau - keys[k - 1][0]) / (keys[k][0] - keys[k - 1][0]));
    }
    return keys[keys.length - 1][1];
  }
  // How hard it turns its head toward us when it is close: a little always, and as it
  // passes, round on its neck to look straight at us for a long moment.
  var LOOK = [[0, 0.25], [26.4, 0.25], [27.6, 1.1], [29.4, 1.1], [30.6, 0.25], [SWIM.PERIOD, 0.25]];
  // Hinged at the back of the skull, from the spine at the snout, mid-skull and back of
  // the skull at time t.
  function frame(snout, mid, back, t) {
    var f = V.unit(V.sub(snout.p, back.p)), near = keyed(LOOK, SWIM.clock(t)) * smooth((12 - mid.p[2]) / 5);
    f = V.unit(V.add(f, V.unit(V.sub([0, 0, 0], back.p)), near));
    var u = V.unit(V.add(mid.u, f, -V.dot(mid.u, f)));
    return { p: back.p, f: f, u: u, s: V.cross(f, u) };
  }
  // It blinks once while it looks at us: the lids meet at BLINK and part again.
  var BLINK = 28.9;
  function lid(tau) { return 1 - smooth((Math.abs(tau - BLINK) - 0.07) / 0.16); }
  function place(h, f, u, w) {
    return [h.p[0] + HL * (f * h.f[0] + u * h.u[0] + w * h.s[0]), h.p[1] + HL * (f * h.f[1] + u * h.u[1] + w * h.s[1]),
      h.p[2] + HL * (f * h.f[2] + u * h.u[2] + w * h.s[2])];
  }
  // The lower jaw swings down about its hinge at the back of the skull.
  var HINGE = [0.05, -0.1];
  function hinge(v, open) {
    var df = v[0] - HINGE[0], du = v[1] - HINGE[1], c = Math.cos(open), s = Math.sin(open);
    return [HINGE[0] + df * c + du * s, HINGE[1] - df * s + du * c, v[2]];
  }
  function mirror(v, sd) { return [v[0], v[1], v[2] * sd]; }

  // A tooth or a slit from a to c. Wide enough, it is a capsule; finer, a line dithered
  // by how much of each pixel it would cover, so it fades in as it comes near.
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
  // Shapes placed in the head's frame h, in head lengths; jaw shapes swing with it.
  function pen(b, h, open) {
    function at(v) { return place(h, v[0], v[1], v[2]); }
    function jaw(v) { return at(hinge(v, open)); }
    return {
      ball: function (v, r, shade, part) { S.sphere(b, at(v), r * HL, shade, part); },
      rod: function (a, c, ra, rc, shade, part) { S.capsule(b, at(a), at(c), ra * HL, rc * HL, shade, part); },
      jawRod: function (a, c, ra, rc, shade, part) { S.capsule(b, jaw(a), jaw(c), ra * HL, rc * HL, shade, part); },
      jawBall: function (v, r, shade, part) { S.sphere(b, jaw(v), r * HL, shade, part); },
      hair: function (a, c, ra, rc, shade, part, swing) {
        strand(b, swing ? jaw(a) : at(a), swing ? jaw(c) : at(c), ra * HL, rc * HL, shade, part);
      },
      tri: function (a, c, e, shade, part, swing) {
        S.triangle(b, (swing[0] ? jaw : at)(a), (swing[1] ? jaw : at)(c), (swing[2] ? jaw : at)(e), shade, part);
      }
    };
  }

  // ---- Inks ---------------------------------------------------------------------------
  // Slate above and pale beneath; fine plates of scale where the head is big enough.
  function skinInk(h, fine) {
    return function (nx, ny, nz, x, y, u) {
      var v = light(nx, ny, nz), up = nx * h.u[0] + ny * h.u[1] + nz * h.u[2];
      if (up < -0.5) return band(INK.belly, v + 0.1);
      if (fine) {
        var side = nx * h.s[0] + ny * h.s[1] + nz * h.s[2], a = u * 9 + side * 2.2, c = u * 9 - side * 2.2;
        if (Math.min(PIX.mod(a, 1), PIX.mod(c, 1)) < 0.12) v -= 0.12;
      }
      return band(INK.skin, v);
    };
  }
  function browInk(nx, ny, nz) { return band(INK.skin, light(nx, ny, nz) - 0.06); }
  function mouthInk(nx, ny, nz) { return band(INK.mouth, light(nx, ny, nz) * 0.9 + 0.05); }
  function toothInk(nx, ny, nz) { return band(INK.tooth, light(nx, ny, nz) + 0.25); }
  function throatInk(nx, ny, nz) { return band(INK.mouth, 0.05 + 0.35 * light(nx, ny, nz)); }
  function slitInk() { return C.ms0; }

  // ---- The head ----------------------------------------------------------------------
  // A heavy skull behind, bulging jaw muscles, a long snout to a blunt tip, the edge
  // of the upper jaw, and a heavy brow over each eye.
  function skull(P, skin, fine) {
    P.rod([0.0, 0.03, 0], [0.32, 0.05, 0], 0.2, 0.165, skin, PART.head);
    P.rod([0.32, 0.04, 0], [0.64, 0.025, 0], 0.15, 0.115, skin, PART.head);
    P.rod([0.64, 0.025, 0], [0.9, 0.005, 0], 0.115, 0.085, skin, PART.head);
    P.ball([0.95, -0.005, 0], 0.072, skin, PART.head);
    [-1, 1].forEach(function (sd) {
      P.ball([0.1, -0.03, 0.1 * sd], 0.15, skin, PART.head);
      P.rod([0.18, -0.05, 0.1 * sd], [0.9, -0.06, 0.045 * sd], 0.07, 0.048, skin, PART.head);
      P.rod([0.19, 0.13, 0.115 * sd], [0.4, 0.105, 0.1 * sd], 0.05, 0.034, browInk, PART.brow);
      if (fine) P.hair([0.63, 0.1, 0.038 * sd], [0.79, 0.085, 0.03 * sd], 0.012, 0.009, slitInk, PART.head);
    });
  }
  // The mouth: a dark red palate and tongue that show when the jaw drops, the pale
  // throat stretching behind, and the lower jaw itself.
  function jaws(P, skin, belly, open) {
    P.rod([0.12, -0.055, 0], [0.86, -0.065, 0], 0.085, 0.05, mouthInk, PART.mouth);
    P.jawRod([0.12, -0.105, 0], [0.74, -0.105, 0], 0.075, 0.045, mouthInk, PART.mouth);
    P.rod([0.0, -0.1, 0], [0.26, -0.13 - 0.25 * Math.sin(open * 0.5), 0], 0.13, 0.11, belly, PART.jaw);
    [-1, 1].forEach(function (sd) { P.jawRod([0.04, -0.11, 0.13 * sd], [0.9, -0.125, 0.036 * sd], 0.085, 0.052, skin, PART.jaw); });
    P.jawBall([0.915, -0.125, 0], 0.055, skin, PART.jaw);
    // Deep in the mouth, a dark red wedge between the jaws that shows as they part.
    if (open < 0.08) return;
    for (var k = 0; k < 4; k++) {
      var f0 = 0.1 + 0.2 * k, f1 = f0 + 0.2;
      P.tri([f0, -0.075, 0], [f1, -0.075, 0], [f1, -0.11, 0], throatInk, PART.mouth, [false, false, true]);
      P.tri([f0, -0.075, 0], [f1, -0.11, 0], [f0, -0.11, 0], throatInk, PART.mouth, [false, true, true]);
    }
  }
  // Conical teeth, curved a little back: thirteen along each side of the upper jaw,
  // fourteen in the lower, and on the roof of the mouth a second row of eight small ones
  // a side, as in Mosasaurus hoffmannii, for holding what it bites.
  function teeth(P) {
    [-1, 1].forEach(function (sd) {
      for (var k = 0; k < 13; k++) {
        var f = 0.25 + 0.66 * k / 12, w = (0.14 - 0.095 * (f - 0.25) / 0.66) * sd, len = 0.05 + 0.03 * Math.sin(Math.PI * (k + 2) / 16);
        P.hair([f, -0.085, w], [f - 0.014, -0.085 - len, w * 0.96], 0.018, 0.004, toothInk, PART.tooth, false);
      }
      for (k = 0; k < 14; k++) {
        f = 0.2 + 0.7 * k / 13;
        w = (0.125 - 0.085 * (f - 0.2) / 0.7) * sd;
        len = 0.045 + 0.028 * Math.sin(Math.PI * (k + 2) / 17);
        P.hair([f, -0.115, w], [f + 0.012, -0.115 + len, w * 0.97], 0.017, 0.004, toothInk, PART.tooth, true);
      }
      for (k = 0; k < 8; k++) {
        f = 0.27 + 0.04 * k;
        P.hair([f, -0.04, 0.045 * sd], [f - 0.008, -0.08, 0.043 * sd], 0.012, 0.003, toothInk, PART.tooth, false);
      }
    });
  }
  // The eye: a golden iris with a round black pupil, ringed by bony plates, with a
  // glint of light from the surface. Its lids close from above and below to blink.
  function eyes(P, h, fine, shut) {
    [-1, 1].forEach(function (sd) {
      P.ball([0.28, 0.075, 0.17 * sd], 0.065, function (nx, ny, nz) {
        var out = sd * (nx * h.s[0] + ny * h.s[1] + nz * h.s[2]), up = nx * h.u[0] + ny * h.u[1] + nz * h.u[2];
        if (Math.abs(up) > 1.05 - 1.1 * shut) return band(INK.skin, light(nx, ny, nz) - 0.02);
        if (nx * SUN[0] + ny * SUN[1] + nz * SUN[2] > 0.93) return C.me3;
        if (out < 0.55) return fine ? C.ms1 : C.me0;
        if (fine && out > 0.9) return C.ms0;
        return ny > 0 ? C.me2 : C.me1;
      }, PART.eye);
    });
  }

  // How wide the jaw hangs open over the loop: a little always, a slow gape as it
  // passes us, and at the breach wide open, a snap shut at the top, open again as it falls.
  var GAPE = [[0, 0.04], [26, 0.05], [27.4, 0.3], [28.9, 0.3], [30.2, 0.06], [SWIM.T.breach - 0.9, 0.06],
    [SWIM.T.breach, 0.72], [SWIM.T.breach + 0.78, 0.8], [SWIM.T.breach + 0.95, 0.05], [SWIM.T.breach + 1.5, 0.42],
    [SWIM.T.breach + 2.6, 0.1], [SWIM.PERIOD, 0.04]];
  function gape(tau) {
    for (var k = 1; k < GAPE.length; k++) {
      if (tau <= GAPE[k][0]) return GAPE[k - 1][1] + (GAPE[k][1] - GAPE[k - 1][1]) * smooth((tau - GAPE[k - 1][0]) / (GAPE[k][0] - GAPE[k - 1][0]));
    }
    return GAPE[0][1];
  }

  // The head from its spine at time t, with as much detail as its size can show.
  function draw(b, snout, mid, back, t) {
    var h = frame(snout, mid, back, t), q = S.project(place(h, 0.5, 0, 0));
    if (!q) return h;
    var px = HL * q[2], fine = px >= 20;
    var open = gape(SWIM.clock(t)), P = pen(b, h, open), skin = skinInk(h, fine);
    function belly(nx, ny, nz) { return band(INK.belly, light(nx, ny, nz) + 0.15); }
    skull(P, skin, fine);
    jaws(P, skin, belly, open);
    if (px >= 9) eyes(P, h, fine, lid(SWIM.clock(t)));
    if (fine) teeth(P);
    return h;
  }

  LAUT.MOSA_HEAD = {
    length: HL, part: PART, ink: INK, BLINK: BLINK, frame: frame, place: place, strand: strand, gape: gape, draw: draw
  };
})(S);
// pixel-raja-ampat/src/mosa.js
// The mosasaur, a great sea lizard of the Late Cretaceous, fifteen metres long.
// Its body follows its head along the route: a thick neck, a deep chest and belly,
// and a long tail flattened from side to side whose end bends down into the lower
// lobe of a crescent fin. Four long paddles row and steer. Fine keeled scales cover
// it, slate above with darker blotches and pale beneath, the two meeting in a ragged
// line, with old scars on its flank. It is drawn in 3D into a depth buffer, then
// laid over the scene in three slices: what is beyond the far reef before the reef
// is drawn, what is behind the near reef before that, and what is close after
// everything. Far off, the water between us veils it in the blue behind and
// flattens it into one dark shadow.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C;
  var S = LAUT.SPLAT, V = LAUT.V3, SWIM = LAUT.SWIM, HEAD = LAUT.MOSA_HEAD;
  var INK = HEAD.ink, PART = HEAD.part, L = SWIM.L;
  var FAR = 30, BEHIND = 20;
  function smooth(v) { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); }
  function comb(p, a, ka, b, kb, c, kc) {
    return [p[0] + a[0] * ka + b[0] * kb + c[0] * kc, p[1] + a[1] * ka + b[1] * kb + c[1] * kc, p[2] + a[2] * ka + b[2] * kb + c[2] * kc];
  }

  // ---- Its build ------------------------------------------------------------------------
  // Half its height and half its width s metres behind the snout, and how far the middle
  // of its girth sits above the spine (below, where negative): a thick neck, a deep chest
  // and belly hanging a little below the line of the back, then a tail flattened from side
  // to side whose end bends down into the fin. A smooth curve runs through the rows.
  var BUILD = [
    [1.6, 0.4, 0.36, 0], [2.4, 0.58, 0.5, -0.03], [3.2, 0.74, 0.6, -0.06], [4.5, 0.86, 0.66, -0.1],
    [5.8, 0.88, 0.64, -0.12], [7.2, 0.76, 0.54, -0.08], [8.5, 0.62, 0.4, -0.03], [10.5, 0.46, 0.25, 0],
    [12.5, 0.32, 0.15, 0], [13.6, 0.24, 0.1, -0.04], [14.6, 0.12, 0.06, -0.38]
  ];
  function slope(col, i) {
    var a = BUILD[Math.max(0, i - 1)], c = BUILD[Math.min(BUILD.length - 1, i + 1)];
    return (c[col] - a[col]) / (c[0] - a[0]);
  }
  function through(col, s) {
    var n = BUILD.length, k = 1;
    if (s <= BUILD[0][0]) return BUILD[0][col];
    if (s >= BUILD[n - 1][0]) return BUILD[n - 1][col];
    while (s > BUILD[k][0]) k++;
    var a = BUILD[k - 1], c = BUILD[k], h = c[0] - a[0], u = (s - a[0]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a[col] + (u3 - 2 * u2 + u) * h * slope(col, k - 1) +
      (3 * u2 - 2 * u3) * c[col] + (u3 - u2) * h * slope(col, k);
  }
  function section(s) { return { h: through(1, s), w: through(2, s), c: through(3, s) }; }
  // Its girth as a single radius, for where it breaks the surface.
  function radius(s) { var q = section(s); return Math.sqrt(q.h * q.w); }

  // The head's own frame points, then points along the body from the back of the skull,
  // closer together where it is thin.
  var HL = HEAD.length, SAMPLES = (function () {
    var out = [0, HL / 2, HL];
    for (var s = 1.6; s < 14.6; s += Math.max(0.03, 0.45 * section(s).w)) out.push(s);
    return out;
  })();
  // Where it is deeper than it is wide, a stack of balls one above another makes the
  // flattened flank; each ball is kept as its height above the middle and its radius.
  var STACKS = SAMPLES.slice(3).map(function (s) {
    var q = section(s), extra = q.h - q.w, out = [];
    if (extra < 0.15 * q.w) return { q: q, g: Math.sqrt(q.h * q.w), balls: [[0, 0.5 * (q.h + q.w)]] };
    var n = Math.ceil(extra / (0.7 * q.w)) + 1;
    for (var k = 0; k < n; k++) out.push([extra * (2 * k / (n - 1) - 1), q.w]);
    return { q: q, g: Math.sqrt(q.h * q.w), balls: out };
  });

  // ---- Skin -------------------------------------------------------------------------------
  // Fine keeled scales, darker mottling over the back like a monitor lizard's, a dark
  // line down the spine, and two old pale scars raked across the flank. Each is a whole
  // step up or down the ramp, so it shows alike on every tone of the flank.
  var SCARS = [[3.55, 4.7, 0], [3.8, 4.35, 0.3]];
  function marks(s, phi, R, fine, up) {
    var v = up > -0.25 && blotch(s, phi) ? -1 : 0;
    if (fine) {
      // A keel on some of the scales, where the lines of the diamond lattice cross.
      var a = (s + phi * R) / 0.11, c = (s - phi * R) / 0.11, ia = Math.floor(a), ic = Math.floor(c);
      if (a - ia < 0.3 && c - ic < 0.3 && PIX.hash(ia, ic, 29) > 0.45) v -= 1;
    }
    if (Math.abs(phi) < 0.06) v -= 1;
    for (var k = 0; k < SCARS.length; k++) {
      var sc = SCARS[k], line = (s - sc[0]) * 0.8 - (-phi - 0.75) - sc[2];
      if (s > sc[0] && s < sc[1] && Math.abs(line) < 0.03 && PIX.noise(s * 9, 5 + k) > 0.3) v += 1;
    }
    return v;
  }
  // Where the pale belly begins, as the upness of the skin there: a line that wanders
  // gently along the flank, the dark and the pale dithered into each other where they
  // meet. The line and the mottling are worked out once into tables, every 2 cm along
  // the body for the line, every 4 cm and 0.04 radians round it for the mottling.
  var EDGES = new Float32Array(801).map(function (v, k) {
    var s = k / 50;
    return -0.42 + 0.14 * (PIX.noise(s * 0.8, 13) - 0.5) + 0.06 * (PIX.noise(s * 3.3, 17) - 0.5);
  });
  var ROUND = 158, BLOTCH = new Uint8Array(401 * ROUND).map(function (v, k) {
    var s = (k / ROUND | 0) / 25, phi = (k % ROUND) / 25 - Math.PI;
    return 0.65 * PIX.noise2(s * 2.1, phi * 1.7 + 9, 41) + 0.35 * PIX.noise2(s * 5.3, phi * 4.4 + 2, 43) > 0.62 ? 1 : 0;
  });
  function edge(s) { var i = Math.round(s * 50); return EDGES[i < 0 ? 0 : i > 800 ? 800 : i]; }
  function blotch(s, phi) { var i = Math.round(s * 25); return BLOTCH[(i < 0 ? 0 : i > 400 ? 400 : i) * ROUND + Math.round((phi + Math.PI) * 25)]; }
  function pale(s, up, x, y) {
    var e = edge(s);
    return up < e - 0.05 || (up < e + 0.05 && PIX.dith(x, y, (e + 0.05 - up) / 0.1));
  }
  // Each pixel is shaded as the skin of an oval girth of the height and width there, at
  // the height on it where the pixel's ball puts it, so the stacked balls read as one
  // smooth flank with no seams between them.
  function skin(o, nx, ny, nz, x, y, t) {
    var q = o.q, sec = o.sec, R = o.r, dn = nx * q.d[0] + ny * q.d[1] + nz * q.d[2];
    var k = (o.o + R * (nx * q.u[0] + ny * q.u[1] + nz * q.u[2])) / sec.h;
    k = k < -1 ? -1 : k > 1 ? 1 : k;
    var eu = k / sec.h, ew = Math.sqrt(1 - k * k) / sec.w * (nx * q.w[0] + ny * q.w[1] + nz * q.w[2] < 0 ? -1 : 1);
    var l = Math.sqrt(eu * eu + ew * ew) || 1, up = eu / l, out = ew / l, s = q.s - dn * R, phi = Math.atan2(out, up);
    var v = INK.light(up * q.u[0] + out * q.w[0], up * q.u[1] + out * q.w[1], up * q.u[2] + out * q.w[2]);
    // Caustics from the waves overhead play over its back when it is near the surface.
    if (q.shallow && up > 0.5 && LAUT.caustic(x, y, t) < 0.09) v += 0.18;
    // The pale belly is in its own shadow, darkest where it faces the deep.
    if (pale(s, up, x, y)) return PIX.pick(INK.belly, 0.1 + 0.3 * v + 0.5 * (1 + up), x, y);
    var i = Math.floor(4.8 * v) + marks(s, phi, o.g, q.fine, up);
    return INK.skin[i < 0 ? 0 : i > 5 ? 5 : i];
  }
  var OWNER = new Uint16Array(W * H);
  function drawBody(b, pts, t) {
    var balls = [];
    pts.slice(3).forEach(function (p, k) {
      var st = STACKS[k];
      st.balls.forEach(function (o) {
        balls.push({ q: p, sec: st.q, g: st.g, o: o[0], r: o[1], c: V.add(p.p, p.u, st.q.c + o[0]), at: null });
      });
    });
    // Nearest first, so what is hidden behind fails the depth test early. Each pixel only
    // notes which ball won it; once all are in, each is shaded once, from its ball.
    balls.sort(function (a, c) { return a.c[2] - c.c[2]; });
    for (var k = 0; k < balls.length; k++) balls[k].at = S.ball(b, balls[k].c, balls[k].r, PART.body, OWNER, k);
    for (k = 0; k < b.n; k++) {
      var i = b.list[k];
      if (b.part[i] !== PART.body) continue;
      var o = balls[OWNER[i]], p = o.at, x = i % W, y = (i / W) | 0, sr = o.r * p[2];
      var dx = sr < 0.5 ? 0 : (x - p[0]) / sr, dy = sr < 0.5 ? 0 : (y - p[1]) / sr, dz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
      b.col[i] = skin(o, dx, -dy, -dz, x, y, t);
    }
  }

  // ---- Paddles --------------------------------------------------------------------------
  // Slate above and pale beneath in the same tones as the body; where mark is set, a
  // bone inside shows through as a faint darker line.
  function finInk(q) {
    return function (nx, ny, nz, mark) {
      var v = 0.8 * INK.light(nx, ny, nz) - (mark ? 0.09 : 0), up = nx * q.u[0] + ny * q.u[1] + nz * q.u[2];
      return up < -0.2 ? INK.band(INK.belly, v + 0.1) : INK.band(INK.skin, v);
    };
  }
  // Four paddles low on the flanks, long blades curving back to a point. They row slowly:
  // each swings back and forth, lifts and drops, and turns its blade as it goes, the near
  // and the far one in turn.
  var PADDLES = [{ s: 3.0, len: 1.9, fore: true, beat: 0 }, { s: 7.3, len: 1.35, fore: false, beat: 1.9 }];
  function pose(q, sd, len, beat) {
    var sec = section(q.s), back = V.sub([0, 0, 0], q.d);
    var root = comb(q.p, q.u, sec.c - 0.55 * sec.h, q.w, 0.72 * sd * sec.w, q.d, 0);
    var swing = 0.45 * Math.sin(beat), lift = 0.3 * Math.sin(beat - 1.3);
    var dir = V.unit(comb([0, 0, 0], q.d, -0.75 - swing, q.w, 0.5 * sd, q.u, -0.45 + lift));
    var chord = V.unit(V.add(q.d, dir, -V.dot(q.d, dir))), flat = V.cross(dir, chord), turn = 0.6 * Math.cos(beat);
    chord = V.unit(V.add(V.add([0, 0, 0], chord, Math.cos(turn)), flat, Math.sin(turn)));
    return { root: root, dir: dir, chord: chord, back: back, tip: V.add(V.add(root, dir, len), back, 0.2 * len) };
  }
  function stroke(p, sd, t) { return 0.5 * SWIM.wave(SWIM.SC, t) + p.beat + (sd > 0 ? Math.PI : 0); }
  // Where each paddle's root and tip are at time t, the frame of the body there, and the
  // pose to draw it in.
  function paddles(t) {
    var out = [], at = SWIM.spine(t, PADDLES.map(function (p) { return p.s; }));
    PADDLES.forEach(function (p, k) {
      [-1, 1].forEach(function (sd) {
        var P = pose(at[k], sd, p.len, stroke(p, sd, t));
        out.push({ s: p.s, fore: p.fore, side: sd, len: p.len, root: P.root, tip: P.tip, q: at[k], pose: P });
      });
    });
    return out;
  }
  function bone(across) { return Math.abs(across - 0.36) < 0.04 || Math.abs(across - 0.66) < 0.04; }
  function paddle(b, o) {
    var P = o.pose, len = o.len, n = 7, lead = [], trail = [];
    for (var k = 0; k <= n; k++) {
      var a = k / n, width = 0.34 * len * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * a)), 0.7) * (1 - 0.45 * a);
      var mid = V.add(V.add(P.root, P.dir, a * len), P.back, 0.2 * len * a * a);
      lead.push(V.add(mid, P.chord, width * 0.42));
      trail.push(V.add(mid, P.chord, -width * 0.58));
    }
    var ink = finInk(o.q);
    // How far across the paddle a pixel is, 0 at the trailing edge and 1 at the leading one.
    function fore(nx, ny, nz, x, y, w0, w1) { return ink(nx, ny, nz, bone(1 - w1)); }
    function aft(nx, ny, nz, x, y, w0) { return ink(nx, ny, nz, bone(w0)); }
    for (k = 0; k < n; k++) {
      S.triangle(b, lead[k], trail[k], lead[k + 1], fore, PART.fin);
      S.triangle(b, lead[k + 1], trail[k], trail[k + 1], aft, PART.fin);
    }
  }

  // ---- The tail fin ----------------------------------------------------------------------
  // A crescent in the frame of the end of the tail, in metres forward and up: the lower
  // lobe on the bent-down end of the spine, a soft upper lobe nearly as big, and a notch
  // between them. Each lobe runs out along a curved leading edge to its tip and back
  // along a hollow trailing edge to the notch; the lobes trail behind each beat and flex.
  var LOBES = [
    { root: [0.2, 0.18], lead: [-0.25, 0.95], tip: [-1.2, 1.22], trail: [-0.75, 0.42] },
    { root: [0.2, -0.24], lead: [-0.3, -1.08], tip: [-1.3, -1.38], trail: [-0.8, -0.5] }
  ], NOTCH = [-0.7, -0.03], FIN = 13.7;
  function bez(a, c, e, u) {
    var v = 1 - u;
    return [v * v * a[0] + 2 * v * u * c[0] + u * u * e[0], v * v * a[1] + 2 * v * u * c[1] + u * u * e[1]];
  }
  var OUTLINES = LOBES.map(function (o) {
    var out = [], k;
    for (k = 0; k <= 5; k++) out.push(bez(o.root, o.lead, o.tip, k / 5));
    for (k = 1; k <= 4; k++) out.push(bez(o.tip, o.trail, NOTCH, k / 4));
    return out;
  });
  function fluke(t) {
    return { q: SWIM.spine(t, [FIN])[0], upper: LOBES[0].tip, lower: LOBES[1].tip, notch: NOTCH };
  }
  function drawFluke(b, t) {
    var q = fluke(t).q, fin = finInk(q), c = section(FIN).c, flex = -0.32 * Math.cos(SWIM.wave(FIN, t));
    function ink(nx, ny, nz) { return fin(nx, ny, nz, false); }
    function at(v) { var back = Math.max(0, -v[0]) / 1.3; return comb(q.p, q.d, v[0], q.u, c + v[1], q.w, flex * back * back); }
    var base = at([0.1, -0.03]);
    OUTLINES.forEach(function (o) {
      for (var k = 0; k < o.length - 1; k++) S.triangle(b, base, at(o[k]), at(o[k + 1]), ink, PART.fluke);
    });
  }

  // ---- Outline ---------------------------------------------------------------------------
  // Close by, a dark line round its silhouette and wherever one part passes in front of
  // another, as a pixel artist would draw it.
  var EDGE = new Uint8Array(16);
  [PART.body, PART.head, PART.jaw, PART.fin, PART.fluke, PART.brow].forEach(function (p) { EDGE[p] = C.ms0; });
  function behind(b, i, j, z) { return b.depth[j] > z + (b.part[j] === b.part[i] ? 0.35 : 0.08); }
  function outline(b) {
    for (var k = 0; k < b.n; k++) {
      var i = b.list[k], z = b.depth[i], ink = EDGE[b.part[i]], x = i % W;
      if (!ink || z > BEHIND) continue;
      if ((x > 0 && behind(b, i, i - 1, z)) || (x < W - 1 && behind(b, i, i + 1, z)) ||
        (i >= W && behind(b, i, i - W, z)) || (i < W * (H - 1) && behind(b, i, i + W, z))) b.col[i] = ink;
    }
  }

  // ---- Haze ----------------------------------------------------------------------------------
  // Far off, the water between us veils it in the blue behind, and its light and shade
  // flatten into one dark shadow. Both come in sixteen steps, each mix taken to the
  // nearest colour in the palette, worked out once and kept.
  var SIL = C.ab1, DEEP = PIX.names(["uw0", "uw1", "uw2", "uw3", "uw4", "uw5", "uw6", "uw7", "uw8", "uw9", "uw10", "uw11"]);
  var SLOT = new Int16Array(256).fill(-1);
  DEEP.forEach(function (c, k) { SLOT[c] = k; });
  var MIX = new Uint8Array(PIX.PALETTE.length * DEEP.length * 17 * 17).fill(255);
  function fogAt(d) { return d <= 5 ? 0 : Math.min(0.55, 1 - Math.exp((5 - d) / 40)); }
  function flatAt(d) { return smooth((d - 12) / 16); }
  function blend(c, water, f, g) {
    var a = PIX.RGB[c], s = PIX.RGB[SIL], k = PIX.RGB[water], out = [0, 0, 0];
    for (var i = 0; i < 3; i++) { var m = a[i] + (s[i] - a[i]) * f; out[i] = m + (k[i] - m) * g; }
    return PIX.nearest(out[0], out[1], out[2]);
  }
  function haze(c, d, x, y) {
    if (y <= LAUT.SURF[x]) return c;
    var water = SLOT[LAUT.WATER[y * W + x]], lf = Math.round(16 * flatAt(d)), lg = Math.round(16 * fogAt(d));
    if (water < 0 || (!lf && !lg)) return c;
    var key = ((c * DEEP.length + water) * 17 + lf) * 17 + lg;
    if (MIX[key] === 255) MIX[key] = blend(c, DEEP[water], lf / 16, lg / 16);
    return MIX[key];
  }

  // ---- The frame -------------------------------------------------------------------------------
  function body(t) {
    return SWIM.spine(t, SAMPLES).map(function (q) {
      var p = S.project(q.p);
      return { s: q.s, p: q.p, d: q.d, u: q.u, w: q.w, R: radius(q.s), fine: !!p && p[2] >= 24, shallow: q.p[1] > -5 };
    });
  }
  // The whole animal at time t, drawn once and kept for all three slices.
  var BUF = S.buffer(), SHOWN = NaN;
  function cover(t) {
    if (t === SHOWN) return BUF;
    S.clear(BUF);
    SHOWN = t;
    if (!SWIM.shown(t)) return BUF;
    var pts = body(t);
    HEAD.draw(BUF, pts[0], pts[1], pts[2], t);
    drawBody(BUF, pts, t);
    paddles(t).forEach(function (o) { paddle(BUF, o); });
    drawFluke(BUF, t);
    outline(BUF);
    return BUF;
  }
  function drawDeep(f, t) { S.lay(cover(t), f, FAR, Infinity, haze); }
  function drawBehind(f, t) { S.lay(cover(t), f, BEHIND, FAR, haze); }
  function drawNear(f, t) { S.lay(cover(t), f, 0, BEHIND, haze); }

  LAUT.MOSA = {
    length: L, radius: radius, section: section, body: body, cover: cover, paddles: paddles, fluke: fluke,
    far: FAR, behind: BEHIND
  };
  LAUT.drawMosaDeep = drawDeep;
  LAUT.drawMosaBehind = drawBehind;
  LAUT.drawMosaNear = drawNear;
})(S);
// pixel-raja-ampat/src/wake.js
// The water the monster throws about. Just before it breaks through, the sea heaves
// up over its snout; as it bursts out, spray is flung up all round it and water
// streams off its head; as it slams back down, a second splash; foam lies along the
// waterline where it went in, a cloud of bubbles swirls up from below, and rings of
// swell spread out and rock the longboat. Every drop is a pure function of time:
// where and when it left the water, how fast, and gravity since.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C;
  var S = LAUT.SPLAT, V = LAUT.V3, SWIM = LAUT.SWIM, MOSA = LAUT.MOSA;
  var B = SWIM.T.breach, GRAV = 9.8, TAU = Math.PI * 2, HEAD = LAUT.MOSA_HEAD.length;
  function smooth(v) { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); }
  function sq(v) { return v * v; }
  function spineAt(tau, list) { return SWIM.spine(SWIM.OFFSET + tau, list); }

  // Where the body goes down through the surface at tau, and how thick it is there;
  // null while it is all under water.
  var ALONG = [];
  for (var s = 0; s <= SWIM.L; s += 0.25) ALONG.push(s);
  function crossing(tau) {
    var q = spineAt(tau, ALONG);
    for (var k = 1; k < q.length; k++) {
      var a = q[k - 1].p, b = q[k].p;
      if (a[1] > 0 && b[1] <= 0) {
        var u = a[1] / (a[1] - b[1]);
        return { p: [a[0] + (b[0] - a[0]) * u, 0, a[2] + (b[2] - a[2]) * u], R: MOSA.radius(Math.max(q[k].s, 1.6)) };
      }
    }
    return null;
  }

  // ---- Spray ------------------------------------------------------------------------------
  // Drops flung from the ring where the body pierces the surface: a thick white crown
  // of slow heavy water close round it and a spray of fast drops flying wide; and
  // drops running off its head and neck from wherever they were as it rose.
  var DROPS = (function () {
    var r = PIX.rng(4242), out = [];
    function fling(n, from, to, speed, lift, crown) {
      for (var k = 0; k < n; k++) {
        var tau = from + (to - from) * r(), c = crossing(tau);
        if (!c) continue;
        var th = r() * TAU, ring = c.R * (0.9 + 0.5 * r()), side = speed[0] + speed[1] * r(), up = lift[0] + lift[1] * r();
        out.push({ t0: tau, p: [c.p[0] + Math.cos(th) * ring, 0.05, c.p[2] + Math.sin(th) * ring],
          v: [Math.cos(th) * side, up, Math.sin(th) * side], shade: crown ? 0.45 * r() : r(), big: crown || r() < 0.3 });
      }
    }
    fling(300, B + 0.05, B + 0.8, [0.8, 2.6], [3, 6.5], false);
    fling(420, B, B + 0.7, [0.2, 1], [1.5, 1.8], true);
    fling(300, B + 1.2, B + 1.95, [1.5, 4], [3.5, 6], false);
    fling(380, B + 1.3, B + 1.95, [0.3, 1.2], [1.5, 2], true);
    for (var k = 0; k < 170; k++) {
      var tau = B + 0.25 + 1.3 * r(), s = 0.3 + 3.5 * r(), a = spineAt(tau, [s])[0], b = spineAt(tau + 0.02, [s])[0];
      if (a.p[1] < 0.3) continue;
      var th = r() * TAU, n = V.add(V.add([0, 0, 0], a.u, Math.cos(th)), a.w, Math.sin(th));
      var R = s < HEAD ? 0.25 : MOSA.radius(s), vel = V.sub(b.p, a.p).map(function (d) { return d * 40; });
      out.push({ t0: tau, p: V.add(a.p, n, R), v: [vel[0] + r() - 0.5, vel[1] + 0.5 * r(), vel[2] + r() - 0.5], shade: r(), big: r() < 0.15 });
    }
    return out;
  })();
  // Lit white by the sun, a touch of gold, and greyer where a drop is in shadow.
  var SPRAY = PIX.names(["wh", "su1", "sf2", "fo0", "cl1", "cl2", "cl3", "cl4"]);
  function sprayInk(shade) { return SPRAY[Math.min(SPRAY.length - 1, Math.floor(Math.pow(shade, 1.6) * SPRAY.length))]; }

  function dropAt(d, dt) {
    return [d.p[0] + d.v[0] * dt, d.p[1] + d.v[1] * dt - 0.5 * GRAV * dt * dt, d.p[2] + d.v[2] * dt];
  }
  // A pixel of spray at screen x, y and depth z: only in the air, and only where the
  // monster is not in front of it.
  function wet(f, buf, x, y, z, c) {
    if (x < 0 || x >= W || y < 0 || y >= LAUT.SURF[x]) return;
    var i = y * W + x;
    if (buf.depth[i] > z) f[i] = c;
  }
  // A drop in flight, with a short streak back along its path.
  function drawDrop(f, buf, d, tau) {
    var dt = tau - d.t0;
    if (dt < 0 || dt > 3) return;
    var p = dropAt(d, dt);
    if (p[1] < 0) return;
    var a = S.project(p), b = S.project(dropAt(d, Math.max(0, dt - 0.035)));
    if (!a || !b) return;
    var c = sprayInk(d.shade), n = Math.max(1, Math.round(Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]))));
    for (var k = 0; k <= n; k++) wet(f, buf, Math.round(b[0] + (a[0] - b[0]) * k / n), Math.round(b[1] + (a[1] - b[1]) * k / n), p[2], c);
    if (d.big && a[2] > 14) { wet(f, buf, Math.round(a[0]) + 1, Math.round(a[1]), p[2], c); wet(f, buf, Math.round(a[0]), Math.round(a[1]) - 1, p[2], c); }
  }

  // ---- Bubbles -------------------------------------------------------------------------
  // Air dragged down round the body where it pierces the surface, and later shed from
  // its back as it dives, wobbling up again until each one reaches the surface.
  var BUBBLES = (function () {
    var r = PIX.rng(777), out = [];
    for (var k = 0; k < 520; k++) {
      var tau = B + 0.1 + 4.5 * Math.pow(r(), 1.6), c = crossing(tau), p;
      if (c) {
        var th = r() * TAU, ring = c.R * (0.5 + 0.9 * r());
        p = [c.p[0] + Math.cos(th) * ring, -0.2 - 1.6 * r(), c.p[2] + Math.sin(th) * ring];
      } else {
        var q = spineAt(tau, [0.5 + 6 * r()])[0];
        if (q.p[1] < -4) continue;
        p = V.add(V.add(q.p, q.u, 0.4 + 0.3 * r()), q.w, r() - 0.5);
      }
      out.push({ t0: tau, p: p, rise: 0.6 + 1.1 * r(), drift: [r() - 0.5, r() - 0.5], ph: r() * TAU, big: r() < 0.22 });
    }
    return out;
  })();
  var FROTH = PIX.names(["sf2", "sf1", "sf0", "uw0"]);
  function drawBubble(f, buf, b, tau) {
    var dt = tau - b.t0;
    if (dt < 0) return;
    var y = b.p[1] + b.rise * dt;
    if (y > -0.05) return;
    var p = [b.p[0] + 0.4 * b.drift[0] * dt + 0.08 * Math.sin(dt * 5 + b.ph), y, b.p[2] + 0.4 * b.drift[1] * dt], q = S.project(p);
    if (!q) return;
    var x = Math.round(q[0]), sy = Math.round(q[1]);
    if (x < 0 || x >= W - 1 || sy >= H || sy <= LAUT.SURF[x] + 1) return;
    var i = sy * W + x;
    if (buf.depth[i] < p[2]) return;
    f[i] = FROTH[Math.floor(b.ph) % FROTH.length];
    if (b.big && q[2] > 16) f[i + 1] = FROTH[(Math.floor(b.ph) + 1) % FROTH.length];
  }

  // ---- Foam ------------------------------------------------------------------------------
  // Where along the waterline it went in, and when: a white froth that spreads and
  // thins, breaking up as it goes.
  var WENT = (function () {
    var out = [];
    for (var tau = B; tau < B + 2.1; tau += 0.02) {
      var c = crossing(tau);
      if (!c) continue;
      var q = S.project(c.p);
      out.push({ t: tau, x: q[0], w: c.R * q[2] });
    }
    return out;
  })();
  var FOAM = { x0: Math.min.apply(null, WENT.map(function (e) { return e.x - e.w; })) - 80,
    x1: Math.max.apply(null, WENT.map(function (e) { return e.x + e.w; })) + 80 };
  function froth(x, tau) {
    var best = 0;
    for (var k = 0; k < WENT.length; k++) {
      var e = WENT[k], age = tau - e.t;
      if (age < 0) continue;
      var spread = e.w + 6 + 7 * age, d = Math.abs(x - e.x);
      if (d < spread) best = Math.max(best, Math.exp(-age / 3.2) * (1 - d / spread));
    }
    return best;
  }
  function drawFoam(f, tau) {
    var row = LAUT.SURF;
    for (var x = Math.max(0, Math.floor(FOAM.x0)); x <= Math.min(W - 1, Math.ceil(FOAM.x1)); x++) {
      var a = froth(x, tau);
      if (a < 0.02) continue;
      for (var y = row[x] - 2; y <= row[x] + 3; y++) {
        var k = a * (1.15 - 0.25 * Math.abs(y - row[x])) * (0.45 + PIX.noise2(x * 0.45, y * 0.9 + tau * 1.5, 88));
        if (PIX.dith(x, y, k)) f[y * W + x] = y < row[x] ? C.wh : y === row[x] ? C.sf2 : C.sf1;
      }
    }
  }

  // ---- Swell ------------------------------------------------------------------------------
  // The hump of water pushed up over its snout just before it breaks through, then a
  // ring of swell from where it burst out and another from where it slammed back down.
  var BURST = WENT[0].x, SLAM = WENT[WENT.length - 1].x;
  var RINGS = [{ x: BURST, t: B + 0.1, a: 4.6 }, { x: SLAM, t: B + 1.8, a: 4.4 }];
  function swell(x, t) {
    var tau = SWIM.clock(t);
    if (tau < B - 0.6 || tau > B + 13) return 0;
    var v = -3 * smooth((tau - (B - 0.6)) / 0.6) * (1 - smooth((tau - B) / 0.3)) * Math.exp(-sq((x - BURST) / 14));
    for (var k = 0; k < RINGS.length; k++) {
      var e = RINGS[k], age = tau - e.t;
      if (age <= 0) continue;
      // A train of waves behind the spreading front, dying away with time and distance.
      var d = Math.abs(x - e.x), r = 35 * age;
      v += e.a * Math.exp(-age / 4) * smooth((r - d) / 20) * Math.cos(TAU * (d - r) / 70) / (1 + d / 120);
    }
    return v;
  }

  // ---- The frame -----------------------------------------------------------------------------
  function drawWake(f, t) {
    var tau = SWIM.clock(t);
    if (tau < B || tau > B + 15) return;
    var buf = MOSA.cover(t);
    drawFoam(f, tau);
    for (var k = 0; k < BUBBLES.length; k++) drawBubble(f, buf, BUBBLES[k], tau);
    for (k = 0; k < DROPS.length; k++) drawDrop(f, buf, DROPS[k], tau);
  }

  LAUT.swell = swell;
  LAUT.WAKE = { burst: BURST, slam: SLAM, drops: DROPS.length, bubbles: BUBBLES.length };
  LAUT.drawWake = drawWake;
})(S);
// pixel-raja-ampat/src/dread.js
// The dread the monster brings. While it is about, the light goes out of the water:
// everything under the surface darkens toward the blues of the abyss, most in the
// deep and toward the edges of the picture, as though a cloud had come over the sun
// and something vast were rising from below. It comes before the monster is drawn,
// so that when it is close it looms out of the gloom in full detail.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, GEO = LAUT.GEO, SWIM = LAUT.SWIM;
  var ABYSS = [1, 7, 28], LEVELS = 5, STEP = 0.12;

  // The palette colour nearest an RGB value among the scene's own colours and the
  // blues of the abyss, by the same "redmean" distance the palette uses.
  var DEEP = PIX.names(["ab0", "ab1", "ab2", "ab3"]);
  function far(i, r, g, b) {
    var c = PIX.RGB[i], rm = (c[0] + r) / 2, dr = c[0] - r, dg = c[1] - g, db = c[2] - b;
    return (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
  }
  function darker(c, a) {
    var rgb = PIX.RGB[c], r = rgb[0] + (ABYSS[0] - rgb[0]) * a, g = rgb[1] + (ABYSS[1] - rgb[1]) * a, b = rgb[2] + (ABYSS[2] - rgb[2]) * a;
    var best = PIX.nearest(r, g, b, PIX.BASE);
    DEEP.forEach(function (k) { if (far(k, r, g, b) < far(best, r, g, b)) best = k; });
    return PIX.lum(best) < PIX.lum(c) ? best : c;
  }
  // One table per step of gloom, each a little further toward the abyss.
  var TABLES = [];
  for (var k = 1; k <= LEVELS; k++) {
    var table = new Uint8Array(256);
    for (var c = 0; c < 256; c++) table[c] = c < PIX.PALETTE.length ? darker(c, STEP * k) : c;
    TABLES.push(table);
  }
  // How deep the gloom goes at each pixel under water: some near the surface, most on
  // the bottom, and more toward the sides.
  var TOP = GEO.surface - 3, WEIGHT = new Float32Array(W * (H - TOP));
  for (var y = TOP; y < H; y++) {
    for (var x = 0; x < W; x++) {
      var depth = Math.max(0, y - GEO.surface) / (H - GEO.surface), side = Math.pow(Math.abs(x - W / 2) / (W / 2), 3);
      WEIGHT[(y - TOP) * W + x] = Math.min(1, 0.25 + 0.75 * Math.pow(depth, 0.8) + 0.25 * side);
    }
  }

  function drawGloom(f, t) {
    var dread = SWIM.dread(t), row = LAUT.SURF;
    if (dread <= 0) return;
    for (var y = TOP; y < H; y++) {
      for (var x = 0; x < W; x++) {
        if (y <= row[x]) continue;
        var l = dread * WEIGHT[(y - TOP) * W + x] * LEVELS, n = Math.floor(l);
        if (PIX.dith(x, y, l - n)) n++;
        if (n > 0) { var i = y * W + x; f[i] = TABLES[Math.min(n, LEVELS) - 1][f[i]]; }
      }
    }
  }

  LAUT.drawGloom = drawGloom;
})(S);
// pixel-raja-ampat/src/fish.js
// Fish: little pixel sprites for the reef fish that swim about the coral, a
// pair of clownfish at home in the anemone, and a school of fusiliers
// wheeling through the blue. Every position is a pure function of t.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = LAUT.GEO, REEF = LAUT.REEF, SWIM = LAUT.SWIM;
  var TAU = Math.PI * 2;

  // ---- Sprites ------------------------------------------------------------------
  // Rows facing right, one character per pixel through the key, "." clear.
  // The tail is the first `tail` columns; the second frame flicks it up a pixel.
  function sprite(rows, key, tail) {
    var px = [];
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) if (row[x] !== ".") px.push([x, y, C[key[row[x]]]]);
    });
    return { px: px, w: rows[0].length, h: rows.length, tail: tail };
  }
  // Draws a sprite centred on (x, y), facing dir (1 right, -1 left), under the waterline only.
  function draw(f, s, x, y, dir, frame, tables) {
    var ox = Math.round(x) - (s.w >> 1), oy = Math.round(y) - (s.h >> 1), row = LAUT.SURF;
    for (var i = 0; i < s.px.length; i++) {
      var p = s.px[i], sx = dir > 0 ? p[0] : s.w - 1 - p[0];
      var X = ox + sx, Y = oy + p[1] - (frame && p[0] < s.tail ? 1 : 0);
      if (X < 0 || X >= W || Y >= H || Y <= row[X]) continue;
      f[Y * W + X] = tables ? LAUT.tinted(tables, p[2], X, Y) : p[2];
    }
  }

  var KEY = {
    k: "fk", w: "fw", o: "fn1", O: "fn2", d: "fn0", y: "fy1", Y: "fy2", u: "fy0",
    b: "fb1", B: "fb2", n: "fb0", t: "fp1", T: "fp2", e: "fp0", p: "cp3", P: "cp2", s: "sv1", S: "sv2", v: "sv0"
  };
  var SPR = {
    clown: sprite([
      "...dod..",
      "d.wowowk",
      "ddwowoww",
      "d.wowow.",
      "...dd..."], KEY, 2),
    idol: sprite([
      "SSS........",
      "...SS......",
      ".....Sw....",
      "....wwkk...",
      "...kwwkkw..",
      "k.ykwykkwo.",
      "kkykwykkkwk",
      "k.ykwykkww.",
      "...kwwkkw..",
      "....wwkk...",
      ".....wk...."], KEY, 2),
    butterfly: sprite([
      "...yyy..",
      "..yyyyk.",
      "y.yyyykw",
      "yyyyyykk",
      "y.yyyyk.",
      "..uyyy.."], KEY, 2),
    tang: sprite([
      "...nnnn..",
      "y.bkkbbb.",
      "yybbbkkbw",
      "y.bkkkbb.",
      "...nnn..."], KEY, 2),
    parrot: sprite([
      "....eeee....",
      "e..etttTte..",
      "eeettpttTTTw",
      "eeettttptTTk",
      "e..etttttTT.",
      "....eeee...."], KEY, 3),
    chromis: sprite([
      ".TT.",
      "tTTt"], KEY, 1),
    anthias: sprite([
      "..OO.",
      "ppOOk",
      "..pp."], KEY, 2),
    fusilier: sprite([
      "y..yyy..",
      "yyybbbbk",
      "y..nbb.."], KEY, 2)
  };

  // ---- How they move ----------------------------------------------------------------

  // Back and forth between x0 and x1, easing at the ends, over period T.
  function patrol(x0, x1, T, ph, t) {
    var a = TAU * (t / T + ph);
    return { x: x0 + (x1 - x0) * (1 - Math.cos(a)) / 2, dir: Math.sin(a) >= 0 ? 1 : -1 };
  }
  function tailFrame(t, rate, ph) { return Math.floor(t * rate + ph * 7) & 1; }

  // Where the patrolling reef fish go: kind, x0, x1, y, period, phase.
  var PATROLS = [
    ["idol", 172, 238, 190, 22, 0.1], ["idol", 180, 246, 197, 26, 0.55],
    ["butterfly", 338, 404, 202, 19, 0.3], ["butterfly", 344, 410, 205, 19, 0.33],
    ["tang", 150, 204, 156, 17, 0.2], ["tang", 146, 196, 171, 21, 0.7], ["tang", 158, 214, 184, 15, 0.45],
    ["parrot", 190, 300, 229, 30, 0.15], ["parrot", 332, 460, 236, 36, 0.6]
  ];
  // Fish that hover near a home spot: kind, how many, centre, spread.
  function hoverers(kind, n, seed, home) {
    var r = PIX.rng(seed), list = [];
    for (var k = 0; k < n; k++) list.push({ kind: kind, hp: home(r), ph: r() * TAU, sp: 0.5 + r() * 0.6 });
    return list;
  }
  var CHROMIS = hoverers("chromis", 18, 811, function (r) { return [428 + r() * 48, 203 + r() * 14]; });
  var ANTHIAS = hoverers("anthias", 22, 812, function (r) {
    var y = 118 + r() * 84;
    return [REEF.wallX(y) + 4 + r() * 20, y];
  });

  // While the monster is about, the reef fish hide: the patrolling fish drop down among
  // the coral, the anthias press in against the wall and the chromis sink into the
  // staghorn, all of them keeping stiller.
  function reef(t) {
    var fear = SWIM.dread(t), still = 1 - 0.6 * fear;
    var out = PATROLS.map(function (p) {
      var at = patrol(p[1], p[2], p[4], p[5], t);
      return { kind: p[0], x: at.x, y: p[3] + 8 * fear + 1.5 * still * Math.sin(t * 0.9 + p[5] * 9), dir: at.dir, frame: tailFrame(t, 5, p[5]) };
    });
    CHROMIS.concat(ANTHIAS).forEach(function (h) {
      var dir = h.kind === "anthias" ? (Math.sin(t * 0.21 + h.ph) > -0.6 ? 1 : -1) : Math.cos(t * 0.3 * h.sp + h.ph) >= 0 ? 1 : -1;
      var x = h.hp[0] + 2.5 * still * Math.sin(t * 0.8 * h.sp + h.ph), y = h.hp[1] + 1.5 * still * Math.sin(t * 1.1 * h.sp + h.ph * 2);
      if (h.kind === "anthias") x = REEF.wallX(y) + 1 + (x - REEF.wallX(y) - 1) * (1 - 0.8 * fear);
      else y += 7 * fear;
      out.push({ kind: h.kind, dir: dir, frame: tailFrame(t, 6, h.ph), x: x, y: y });
    });
    return out;
  }

  // The clownfish dart about just above the anemone and duck into its tentacles.
  // While the monster is about they keep down in the tentacles.
  function clowns(t) {
    var A = REEF.anemone, fear = SWIM.dread(t), out = 1 - 0.8 * fear;
    return [0, 1].map(function (k) {
      var a = t * (0.9 + k * 0.23) + k * 2.1;
      return { kind: "clown", x: A.x - 2 + 7 * out * Math.sin(a) + k * 3, y: A.y - 7 * out + 3 * out * Math.sin(a * 1.7 + k), dir: Math.cos(a) >= 0 ? 1 : -1, frame: tailFrame(t, 7, k) };
    });
  }

  // The school: each fish follows the leader's path a little behind, spread
  // about it, so a turn runs back through the school like a wave.
  var SCHOOL = (function () {
    var r = PIX.rng(813), list = [];
    for (var k = 0; k < 70; k++) {
      var a = r() * TAU, d = Math.sqrt(r());
      list.push({ ox: Math.cos(a) * d * 46, oy: Math.sin(a) * d * 14, lag: r() * 1.6, ph: r() * TAU });
    }
    return list;
  })();
  function leader(t) { return { x: 350 + 85 * Math.sin(t * TAU / 40), y: 148 + 14 * Math.sin(t * TAU / 23), vx: Math.cos(t * TAU / 40) }; }
  // While the monster is about, the school draws into a tight ball and rises toward
  // the light, as far above it as the surface allows, tails beating fast.
  function school(t) {
    var fear = SWIM.dread(t), tight = 1 - 0.6 * fear, top = GEO.surface + 14;
    return SCHOOL.map(function (s) {
      var L = leader(t - s.lag), breathe = (1 + 0.12 * Math.sin(t * 0.7 + s.ph)) * tight;
      var y = L.y - 0.95 * fear * (L.y - top);
      return { kind: "fusilier", x: L.x + s.ox * breathe, y: y + s.oy * breathe, dir: L.vx >= 0 ? 1 : -1, frame: tailFrame(t, 8 + 6 * fear, s.ph) };
    });
  }

  function drawList(f, list, tables) {
    list.forEach(function (o) { draw(f, SPR[o.kind], o.x, o.y, o.dir, o.frame, tables); });
  }
  function drawReefFish(f, t) { drawList(f, reef(t).concat(clowns(t)), LAUT.TINT); }
  function drawSchool(f, t) { drawList(f, school(t), LAUT.DEPTH); }

  LAUT.FISH = { SPR: SPR, sprite: sprite, draw: draw, reef: reef, clowns: clowns, school: school };
  LAUT.drawReefFish = drawReefFish;
  LAUT.drawSchool = drawSchool;
})(S);
// pixel-raja-ampat/src/turtle.js
// A hawksbill turtle: an amber and brown tortoiseshell with a hooked beak,
// flying through the water on its long front flippers. Once a cycle it swims
// in from the left, rises to the surface, lifts its head into the air for a
// breath, and dives away to the right.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = LAUT.GEO, TAU = Math.PI * 2;
  var PERIOD = 64, ENTER = 12, BREATH = ENTER + 25, L = 15;
  var SHELL = PIX.names(["tt0", "tt1", "tt2", "tt3", "tt4"]);
  var SKIN = PIX.names(["tt0", "tt1", "tk1", "tk2", "tt4"]);

  function smooth(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  function since(t) { return (((t - ENTER) % PERIOD) + PERIOD) % PERIOD; }
  // Its path: in and up for 21 s, 8 s at the surface, then down and away.
  function path(s) {
    if (s < 21) return [-30 + 352 * (s / 21), 196 - 81 * smooth(s / 21)];
    if (s < 29) return [322 + 20 * (s - 21) / 8, 115 - 2 * Math.sin((s - 21) / 8 * Math.PI)];
    return [342 + 178 * (s - 29) / 15, 115 + 50 * smooth((s - 29) / 15)];
  }
  function at(t) {
    var s = since(t), p = path(s), q = path(s + 0.05);
    var breathing = s >= 21 && s < 29;
    // Nose up along its path, and up high to breathe.
    var pitch = Math.atan2(p[1] - q[1], q[0] - p[0]);
    if (breathing) pitch += 0.66 * smooth((s - 21) / 1.5) * smooth((29 - s) / 1.5);
    return { on: s < 44, x: p[0], y: p[1], pitch: pitch, breathing: breathing };
  }

  // A flipper: a blade from its root along angle th, widest near the root.
  function blade(u, w, ru, rw, th, len, width) {
    var du = u - ru, dw = w - rw, a = (du * Math.cos(th) + dw * Math.sin(th)) / len;
    if (a < 0 || a > 1) return -1;
    var across = -du * Math.sin(th) + dw * Math.cos(th), half = width * (a < 0.2 ? 0.6 + 2 * a : 1.2 - a);
    return Math.abs(across) < half ? (across > half * 0.45 ? 2 : 1) : -1;
  }
  // Polygonal scales: a pale edge round darker plates.
  function scales(u, w) {
    var gu = u * L / 2.2, gw = w * L / 1.8 + (Math.floor(gu) & 1) * 0.5;
    return Math.min(gu - Math.floor(gu), gw - Math.floor(gw)) < 0.28;
  }

  // What the turtle shows at (u, w) in its own frame, nearest part first.
  function look(u, w, stroke, x, y) {
    var th = Math.PI + 0.75 * stroke, e;
    if ((e = blade(u, w, 0.42, -0.04, th, 1.1, 0.19)) > 0) return PIX.pick(SKIN, e === 2 ? 0.95 : scales(u, w) ? 0.8 : 0.3, x, y);
    // The head, its hooked beak and eye, on a thick neck.
    var hu = (u - 0.98) / 0.26, hw = (w - 0.07) / 0.19;
    if (u > 1.12 && u < 1.34 && w > -0.02 && w < 0.1 - (u - 1.12) * 0.3) return C.tt3;
    if (hu * hu + hw * hw < 1) return Math.abs(u - 1.06) < 0.05 && Math.abs(w - 0.12) < 0.05 ? C.fk : PIX.pick(SKIN, scales(u, w) ? 0.85 : 0.35 + 0.3 * hw, x, y);
    if (u > 0.55 && u < 0.95 && Math.abs(w - 0.02) < 0.13) return PIX.pick(SKIN, 0.45, x, y);
    if ((e = blade(u, w, -0.74, -0.03, Math.PI + 0.3 + 0.2 * stroke, 0.38, 0.1)) > 0) return PIX.pick(SKIN, e === 2 ? 0.9 : 0.35, x, y);
    // The shell: a dome of overlapping plates, tortoiseshell streaked, lit on top.
    var cu = (u + 0.05) / 0.8, top = cu * cu < 1 ? 0.52 * Math.sqrt(1 - cu * cu) : -1;
    if (w >= -0.02 && w <= top) {
      if (u < -0.5 && w < 0.07 && (Math.floor(u * L) & 1)) return -1;
      // Each plate is amber in the middle, darkening to its seams.
      var su = u * L / 5.5, sw = (top - w) * L / 4.2 + (Math.floor(su) & 1) * 0.5;
      var fu = su - Math.floor(su) - 0.5, fw = sw - Math.floor(sw) - 0.5;
      var plate = 1 - 2 * Math.max(Math.abs(fu), Math.abs(fw));
      if (plate < 0.14) return C.tt1;
      var streak = PIX.noise2(u * L / 1.5, w * L / 3, 731) - 0.5;
      return PIX.pick(SHELL, 0.28 + 0.35 * w / 0.52 + 0.35 * plate + streak * 0.25 - (w < 0.07 ? 0.2 : 0), x, y);
    }
    // The pale plastron underneath.
    if (w < -0.02 && w > -0.14 && Math.abs(u + 0.02) < 0.58 - (-0.02 - w) * 1.5) return PIX.pick(SKIN, 0.9, x, y);
    // The far flippers, behind everything and in shadow.
    if ((e = blade(u, w, 0.4, 0, th + 0.35, 0.95, 0.15)) > 0) return PIX.pick(SKIN, 0.12, x, y);
    return -1;
  }

  function drawTurtle(f, t) {
    var p = at(t);
    if (!p.on) return;
    var ca = Math.cos(p.pitch), sa = Math.sin(p.pitch), row = LAUT.SURF;
    var stroke = p.breathing ? 0.4 * Math.sin(TAU * t / 4) : Math.sin(TAU * t / 2.6);
    for (var Y = Math.floor(p.y - 22); Y <= p.y + 22; Y++) {
      for (var X = Math.floor(p.x - 22); X <= p.x + 22; X++) {
        if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
        var dx = X - p.x, dy = Y - p.y;
        var c = look((dx * ca - dy * sa) / L, (-dx * sa - dy * ca) / L, stroke, X, Y);
        if (c < 0) continue;
        f[Y * W + X] = Y > row[X] ? LAUT.tinted(LAUT.DEPTH, c, X, Y) : c;
      }
    }
    // Rings of foam round its head while it breathes.
    if (p.breathing) {
      var hx = Math.round(p.x + L * ca);
      for (var k = -7; k <= 7; k++) {
        var x = hx + k;
        if (x >= 0 && x < W && Math.abs(k) > 2 && PIX.hash(x, 7, Math.floor(t * 5)) < 0.6) f[row[x] * W + x] = Math.abs(k) > 5 ? C.sf2 : C.wh;
      }
    }
  }

  LAUT.TURTLE = { PERIOD: PERIOD, ENTER: ENTER, BREATH: BREATH, at: at };
  LAUT.drawTurtle = drawTurtle;
})(S);
// pixel-raja-ampat/src/visitors.js
// Visitors to the reef: a blacktip reef shark cruising far off in the blue,
// the garden eels in the sand channel that duck when it passes, two moon
// jellyfish pulsing under the surface, and a flying fish that leaps out of
// the sea and glides.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = LAUT.GEO, REEF = LAUT.REEF, TAU = Math.PI * 2;
  function smooth(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  function cycle(t, period) { return ((t % period) + period) % period; }

  // ---- The shark ------------------------------------------------------------------
  // Across to the right, a pause out of sight, back to the left a little
  // lower, another pause.
  var SHARK_PERIOD = 56, SL = 17;
  function sharkAt(t) {
    var s = cycle(t, SHARK_PERIOD);
    if (s < 26) return { on: true, x: -50 + 580 * s / 26, y: 172 + 3 * Math.sin(s * 0.5), dir: 1 };
    if (s >= 28 && s < 54) return { on: true, x: 530 - 580 * (s - 28) / 26, y: 180 + 3 * Math.sin(s * 0.5), dir: -1 };
    return { on: false, x: -999, y: 0, dir: 1 };
  }
  // Its shape side on, u along the body (snout +1), w up: a torpedo that
  // bends as the tail sweeps, fins black at the tips.
  function sharkLook(u, w, t) {
    var mid = 0.05 * Math.sin(t * 5 - u * 2.5) * Math.pow(Math.max(0, (1 - u) / 2), 1.5);
    var y = w - mid, g = (u - 0.1) / 1.1;
    var half = g * g < 1 ? 0.2 * Math.pow(1 - g * g, 0.7) : -1;
    if (half > 0 && Math.abs(y) < half) {
      if (Math.abs(u - 0.8) < 0.05 && Math.abs(y - 0.05) < 0.05) return C.fk;
      return y > 0.02 ? C.sh1 : y > -0.03 ? C.sh2 : C.sh3;
    }
    // The dorsal fin, swept back, and the pectoral fin below.
    var back = half > 0 ? half : 0;
    if (u > -0.08 && u < 0.3 && y > 0 && y < back + (u > 0.02 ? 0.3 * (0.3 - u) / 0.28 : 0.3 * (u + 0.08) / 0.1)) return y > back + 0.2 ? C.fk : C.sh1;
    if (u > 0.08 && u < 0.45 && y < 0 && y > -back - 0.22 * (0.45 - u) / 0.37) return C.sh2;
    // The tail: a tall upper lobe and a shorter lower one.
    if (u < -0.95 && u > -1.45) {
      var k = (-0.95 - u) / 0.5;
      if (y > 0 && y < 0.05 + 0.38 * k && y > 0.3 * k - 0.05) return k > 0.8 ? C.fk : C.sh1;
      if (y < 0 && k < 0.7 && y > -0.05 - 0.3 * k && y < -0.25 * k + 0.05) return k > 0.5 ? C.fk : C.sh2;
    }
    return -1;
  }
  function drawShark(f, t) {
    var p = sharkAt(t);
    if (!p.on) return;
    for (var Y = Math.floor(p.y - 11); Y <= p.y + 9; Y++) {
      for (var X = Math.floor(p.x - 26); X <= p.x + 26; X++) {
        if (X < 0 || X >= W || Y <= LAUT.SURF[X]) continue;
        var c = sharkLook((X - p.x) / (p.dir * SL), (p.y - Y) / SL, t);
        if (c >= 0) f[Y * W + X] = LAUT.tinted(LAUT.FOG, c, X, Y);
      }
    }
  }

  // ---- Garden eels ----------------------------------------------------------------
  var EELS = [[258, 0], [262, 1.3], [267, 2.2], [271, 0.7], [277, 3.1], [283, 1.9], [287, 2.6]];
  // How close the shark is to the channel, remembered for a few seconds so
  // the eels drop at once and only slowly rise again.
  function scare(t) {
    var mid = (REEF.channel.x0 + REEF.channel.x1) / 2, worst = 0;
    for (var k = 0; k <= 12; k++) {
      var p = sharkAt(t - k * 0.5);
      if (p.on) worst = Math.max(worst, smooth((80 - Math.abs(p.x - mid)) / 50) * (1 - k / 13));
    }
    return worst;
  }
  // They drop into the sand for the shark, and stay down all the while the monster is about.
  function eelHeight(t) { return 1 - Math.max(scare(t), 0.95 * LAUT.SWIM.dread(t)); }
  function drawEels(f, t) {
    var h = eelHeight(t);
    EELS.forEach(function (e) {
      var x0 = e[0], base = REEF.sandY(x0), len = Math.round((8 + (e[1] * 3) % 4) * h);
      for (var k = 0; k < len; k++) {
        // The top of each eel curls over into the current.
        var x = x0 - Math.round(2 * Math.pow(k / 10, 2) * (1 + 0.4 * Math.sin(t * 1.3 + e[1]))), y = base - k;
        var c = k === len - 1 ? C.fw : (k + Math.round(e[1] * 3)) % 3 === 0 ? C.fk : C.fw;
        f[y * W + x] = LAUT.tinted(LAUT.TINT, c, x, y);
        if (k === len - 1 && len > 2) f[y * W + x - 1] = LAUT.tinted(LAUT.TINT, C.fk, x - 1, y);
      }
    });
  }

  // ---- Moon jellyfish -------------------------------------------------------------
  var GLASS = PIX.toward("#e8f6ff", 0.35);
  var JELLIES = [[196, 22, 0], [418, 36, 2.1]];
  function jellies(t) {
    return JELLIES.map(function (j) {
      var pulse = Math.sin(t * TAU / 1.4 + j[2]);
      return { x: j[0] + 14 * Math.sin(t * 0.05 + j[2]), y: GEO.surface + j[1] + 5 * Math.sin(t * 0.13 + j[2]) - 1.5 * pulse, bell: 5 + 1.3 * pulse };
    });
  }
  function drawJellies(f, t) {
    jellies(t).forEach(function (j, n) {
      var w = j.bell, h = 9 - w * 0.6, cx = j.x, cy = j.y;
      for (var y = Math.floor(cy - h); y <= cy; y++) {
        for (var x = Math.floor(cx - w); x <= Math.ceil(cx + w); x++) {
          var u = (x - cx) / w, v = (y - cy) / h, d = u * u + v * v;
          if (d > 1 || x < 0 || x >= W || y <= LAUT.SURF[x]) continue;
          var p = y * W + x, gon = Math.abs(Math.abs(u) - 0.4) < 0.18 && v > -0.6 && v < -0.2;
          f[p] = d > 0.7 ? C.jl0 : gon ? C.jl1 : GLASS[f[p]];
        }
      }
      // A fringe of fine tentacles and four frilly arms, trailing as it pulses.
      for (var k = -Math.floor(w); k <= w; k += 2) {
        for (var s = 1; s < 4 + (k & 3); s++) {
          var tx = Math.round(cx + k + Math.sin(t * 2 + s * 0.8 + k) * 0.8), ty = Math.round(cy + s);
          if (tx >= 0 && tx < W && PIX.dith(tx, ty, 0.7)) f[ty * W + tx] = GLASS[GLASS[f[ty * W + tx]]];
        }
      }
      for (k = -1; k <= 1; k += 2) {
        for (s = 1; s < 7; s++) {
          tx = Math.round(cx + k * 1.5 + Math.sin(t * 1.6 + s * 0.9 + n) * 1.2);
          ty = Math.round(cy + s);
          if (tx >= 0 && tx < W) f[ty * W + tx] = s % 2 ? C.jl0 : GLASS[f[ty * W + tx]];
        }
      }
    });
  }

  // ---- The flying fish --------------------------------------------------------------
  var FLY_PERIOD = 26, LEAP = 9, FLIGHT = 2.4;
  var FLYER = LAUT.FISH.sprite([
    "...SSSS..",
    "..SSSSS..",
    "n.nbbbbbk",
    "nnvvvvvv.",
    "n........"], { S: "sv2", n: "fb0", b: "fb1", v: "sv1", k: "fk" }, 2);
  // Out of the water, up in an arc and back in, a second after LEAP each cycle.
  function flyerAt(t) {
    var s = cycle(t - LEAP + 1, FLY_PERIOD), k = s / FLIGHT;
    if (k > 1) return { on: false };
    return { on: true, k: k, x: 490 - 120 * k, y: GEO.surface + 3 - 20 * Math.sin(Math.PI * k) };
  }
  function drawFlyer(f, t) {
    var p = flyerAt(t);
    if (!p.on) return;
    var ox = Math.round(p.x) - 4, oy = Math.round(p.y) - 2, row = LAUT.SURF;
    FLYER.px.forEach(function (q) {
      var X = ox + FLYER.w - 1 - q[0], Y = oy + q[1];
      if (X < 0 || X >= W || Y < 0) return;
      f[Y * W + X] = Y > row[X] ? LAUT.tinted(LAUT.TINT, q[2], X, Y) : q[2];
    });
    // Splashes where it breaks the surface and where it goes back in.
    [[0, 0.12], [0.88, 1]].forEach(function (w, n) {
      if (p.k < w[0] || p.k > w[1]) return;
      var sx = Math.round(490 - 120 * (n ? 0.97 : 0.03));
      for (var d = -3; d <= 3; d++) {
        var x = sx + d;
        if (x >= 0 && x < W) f[(row[x] - (Math.abs(d) < 2 ? 1 : 0)) * W + x] = PIX.hash(x, n, Math.floor(t * 12)) < 0.5 ? C.wh : C.sf2;
      }
    });
  }

  LAUT.SHARK = { PERIOD: SHARK_PERIOD, at: sharkAt };
  LAUT.EELS = { height: eelHeight };
  LAUT.JELLY = { at: jellies };
  LAUT.FLYER = { PERIOD: FLY_PERIOD, LEAP: LEAP, at: flyerAt };
  LAUT.drawShark = drawShark;
  LAUT.drawEels = drawEels;
  LAUT.drawJellies = drawJellies;
  LAUT.drawFlyer = drawFlyer;
})(S);
// pixel-raja-ampat/src/people.js
// People and birds: a painted longboat at anchor with its boatman under an
// orange tarp, its rope running down to the sand and its shadow on the
// bottom; a snorkeler floating face down; a diver far below breathing out
// a stream of bubbles; and frigatebirds wheeling high over the sea.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = LAUT.GEO, REEF = LAUT.REEF, TAU = Math.PI * 2;

  // Paints a pixel in the air as it is, or under water tinted for its depth.
  function paint(f, x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    f[y * W + x] = y > LAUT.SURF[x] ? LAUT.tinted(LAUT.TINT, c, x, y) : c;
  }

  // ---- The longboat -----------------------------------------------------------------
  var BOAT = { x0: 306, x1: 366 };
  var MID = (BOAT.x0 + BOAT.x1) / 2, LEN = BOAT.x1 - BOAT.x0;
  // It rides the swell: its waterline follows the sea under bow and stern.
  function boatAt(t) {
    var bow = LAUT.surfaceY(BOAT.x0 + 8, t), stern = LAUT.surfaceY(BOAT.x1 - 8, t);
    return { y: Math.round((bow + stern) / 2), tilt: (stern - bow) / (LEN - 16) };
  }
  function drawBoat(f, t) {
    var b = boatAt(t), x, y;
    for (x = BOAT.x0; x <= BOAT.x1; x++) {
      var u = (x - BOAT.x0) / LEN, wl = b.y + Math.round(b.tilt * (x - MID));
      // The sheer rises to a high prow at the bow; the keel is deepest amidships.
      var top = wl - 5 - Math.round(4 * Math.pow(Math.max(0, 1 - u * 5), 2)), keel = wl + Math.round(4 * Math.pow(Math.sin(Math.PI * u), 0.6));
      for (y = top; y <= keel; y++) paint(f, x, y, y === top ? C.bt2 : y === top + 1 ? C.bt1 : y > wl ? C.bt0 : x % 9 === 0 ? C.bt3 : C.bt0);
    }
    var deck = b.y - 5;
    // The tarp on its poles, sagging a little between them.
    for (x = BOAT.x0 + 18; x <= BOAT.x1 - 12; x++) {
      var roof = deck - 9 + Math.round(Math.sin((x - BOAT.x0 - 18) / (LEN - 30) * Math.PI)) + Math.round(b.tilt * (x - MID));
      paint(f, x, roof - 1, C.ta2);
      paint(f, x, roof, C.ta1);
      paint(f, x, roof + 1, (x & 1) ? C.ta0 : C.ta1);
    }
    [BOAT.x0 + 19, BOAT.x0 + 34, BOAT.x1 - 13].forEach(function (px) {
      var lean = Math.round(b.tilt * (px - MID));
      for (y = deck - 8; y < deck; y++) paint(f, px, y + lean, C.wd1);
    });
    // The boatman at the stern, in a woven hat, a hand on the tiller.
    var bx = BOAT.x1 - 8, by = deck + Math.round(b.tilt * (bx - MID));
    [[0, -8, C.th2], [-1, -7, C.th1], [0, -7, C.th1], [1, -7, C.th1], [-2, -7, C.th0], [2, -7, C.th0],
      [0, -6, C.pk1], [-1, -6, C.hk], [0, -5, C.pk0], [0, -4, C.ps1], [-1, -4, C.ps1], [1, -4, C.ps0],
      [0, -3, C.ps1], [-1, -3, C.ps0], [1, -3, C.ps1], [2, -3, C.pk1], [3, -3, C.pk1], [0, -2, C.ps0], [0, -1, C.ps0]
    ].forEach(function (p) { paint(f, bx + p[0], by + p[1], p[2]); });
    // The outboard: a cowling above the stern, its leg down into the water.
    var mx = BOAT.x1 + 1, my = b.y + Math.round(b.tilt * (mx - MID));
    for (x = mx; x < mx + 4; x++) for (y = my - 8; y < my - 4; y++) paint(f, x, y, y === my - 8 ? C.mo1 : x === mx + 3 ? C.mo0 : C.mo1);
    for (y = my - 4; y < my + 5; y++) paint(f, mx + 1, y, C.mo0);
    paint(f, mx, my + 4, C.mo0); paint(f, mx + 2, my + 4, C.mo0);
    // The rope leaves the bow for the water.
    for (y = deck - 1; y <= b.y; y++) paint(f, BOAT.x0 + 2 - (y - deck) * 0.2, y, C.wd2);
  }

  // The rope down to the anchor in the sand, and the boat's shadow on the
  // bottom, cast down and to the left, away from the sun.
  var SHADE = LAUT.SHADE;
  function drawAnchor(f, t) {
    var b = boatAt(t), top = b.y + 1, ax = BOAT.x0 - 30, ay = REEF.sandY(ax) - 1;
    for (var s = 0; s <= 1; s += 1 / 300) {
      var x = BOAT.x0 + 2 - 30 * Math.pow(s, 1.3) + Math.sin(t * 0.8 + s * 3) * s * (1 - s) * 3, y = top + s * (ay - top);
      paint(f, x, y, PIX.dith(Math.round(x), Math.round(y), 0.5) ? C.wd2 : C.wd1);
    }
    [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-2, -1], [2, -1], [0, -1], [0, -2], [0, -3]].forEach(function (p) {
      paint(f, ax + p[0], ay + p[1], C.mo1);
    });
    var sx = MID - 52 + Math.round(2 * Math.sin(t * 0.5)), sy = REEF.sandY(Math.round(sx)) + 1;
    for (var yy = sy - 2; yy <= sy + 2; yy++) {
      for (var xx = Math.floor(sx - 30); xx <= sx + 30; xx++) {
        var u = (xx - sx) / 30, v = (yy - sy) / 2.5;
        if (u * u + v * v < 1 && xx >= 0 && xx < W && PIX.dith(xx, yy, 0.55)) f[yy * W + xx] = SHADE[f[yy * W + xx]];
      }
    }
  }

  // ---- The snorkeler and the diver ------------------------------------------------------
  function snorkeler(t) { return { x: 448 + 6 * Math.sin(t * 0.07), kick: Math.sin(t * 6) }; }
  function drawSnorkeler(f, t) {
    var s = snorkeler(t), x = Math.round(s.x), wl = LAUT.surfaceY(x, t), k;
    // Body face down just under the surface: red rash guard, arms along it.
    for (k = 3; k <= 13; k++) {
      paint(f, x + k, wl + 1, C.rg1);
      paint(f, x + k, wl + 2, k & 1 ? C.rg1 : C.rg0);
      paint(f, x + k, wl + 3, C.rg0);
    }
    for (k = -3; k <= 4; k++) paint(f, x + k, wl + 4, C.pk1);
    // Legs and fins, kicking in turn.
    [-1, 1].forEach(function (side, n) {
      var kick = Math.round(1.6 * s.kick * side);
      for (k = 14; k <= 21; k++) paint(f, x + k, wl + 2 + n + Math.round(kick * (k - 14) / 7), n ? C.dv1 : C.dv0);
      for (k = 22; k <= 26; k++) paint(f, x + k, wl + 2 + n + kick + Math.round(kick * (k - 22) / 4), n ? C.fb2 : C.fb1);
    });
    // The head: hair breaking the surface, a mask below, the snorkel up in the air.
    [[0, -1, C.hk], [1, -1, C.hk], [-1, 0, C.hk], [0, 0, C.hk], [1, 0, C.hk], [2, 0, C.hk],
      [-1, 1, C.sv2], [0, 1, C.sv2], [1, 1, C.fk], [2, 1, C.pk1], [-1, 2, C.pk1], [0, 2, C.pk1], [1, 2, C.pk1], [2, 2, C.pk0]
    ].forEach(function (p) { paint(f, x + p[0], wl + p[1], p[2]); });
    for (k = 1; k <= 7; k++) paint(f, x + 2, wl - k, k > 5 ? C.cy2 : C.fk);
  }

  function diver(t) { return { x: 436 + 6 * Math.sin(t * 0.1), y: 196 + 2 * Math.sin(t * 0.3) }; }
  // A bubble leaves the regulator every EVERY seconds and rises, wobbling.
  var EVERY = 0.35, RISE = 14;
  function bubbles(t) {
    var d, out = [], last = Math.floor(t / EVERY);
    for (var id = last; id > last - 40; id--) {
      var age = t - id * EVERY;
      d = diver(id * EVERY);
      var y = d.y - 2 - age * RISE;
      if (y <= GEO.surface + 1) break;
      out.push({ id: id, x: d.x - 6 + 1.5 * Math.sin(age * 4 + id), y: y, big: age > 3.5 });
    }
    return out;
  }
  function drawDiver(f, t) {
    var d = diver(t), x = Math.round(d.x), y = Math.round(d.y), kick = Math.round(Math.sin(t * 2.2));
    function put(px, py, c) { if (px >= 0 && px < W) f[py * W + px] = LAUT.tinted(LAUT.DEPTH, c, px, py); }
    for (var k = -4; k <= 5; k++) { put(x + k, y, C.dv1); put(x + k, y + 1, C.dv0); }
    for (k = -2; k <= 3; k++) put(x + k, y - 1, C.sv0);
    put(x - 5, y, C.dv0); put(x - 6, y, C.sv2); put(x - 5, y - 1, C.dv0);
    for (k = 6; k <= 9; k++) put(x + k, y + (k > 7 ? kick : 0), C.dv0);
    put(x + 10, y + kick, C.fb0); put(x + 11, y + kick, C.fb0);
    bubbles(t).forEach(function (b) {
      var bx = Math.round(b.x), by = Math.round(b.y);
      if (bx < 0 || bx >= W) return;
      f[by * W + bx] = LAUT.LIGHT[LAUT.LIGHT[f[by * W + bx]]];
      if (b.big && bx + 1 < W) { f[by * W + bx + 1] = LAUT.LIGHT[f[by * W + bx + 1]]; f[(by + 1) * W + bx] = LAUT.LIGHT[f[(by + 1) * W + bx]]; }
    });
  }
  function drawSwimmers(f, t) { drawDiver(f, t); drawSnorkeler(f, t); }

  // ---- Frigatebirds ---------------------------------------------------------------
  var BIRD = [
    ["kk.........kk", "..kk.....kk..", "....kkkkk....", "......k......", ".....k.k....."],
    [".............", "kkkk.....kkkk", "....kkkkk....", "......k......", ".....k.k....."]
  ];
  // Each wheels on its own tilted circle: centre, radius, speed, phase, colour.
  var BIRDS = [[250, 40, 34, 0.21, 0, "bd0"], [300, 30, 22, -0.26, 2, "bd1"], [380, 52, 18, 0.3, 4, "bd1"]];
  function drawBirds(f, t) {
    BIRDS.forEach(function (b) {
      var a = t * b[3] + b[4], x = Math.round(b[0] + b[2] * Math.cos(a)), y = Math.round(b[1] + 0.35 * b[2] * Math.sin(a));
      var rows = BIRD[Math.floor(t / 1.3 + b[4]) & 1], c = C[b[5]];
      rows.forEach(function (row, ry) {
        for (var rx = 0; rx < row.length; rx++) {
          var X = x - 6 + rx, Y = y - 2 + ry;
          if (row[rx] === "k" && X >= 0 && X < W && Y >= 0 && Y < GEO.horizon) f[Y * W + X] = c;
        }
      });
    });
  }

  LAUT.BOAT = { x0: BOAT.x0, x1: BOAT.x1, at: boatAt };
  LAUT.SWIMMERS = { snorkeler: snorkeler, diver: diver, bubbles: bubbles };
  LAUT.drawBoat = drawBoat;
  LAUT.drawAnchor = drawAnchor;
  LAUT.drawSwimmers = drawSwimmers;
  LAUT.drawBirds = drawBirds;
})(S);
// pixel-raja-ampat/src/scene.js
// Siang di Raja Ampat: composes the layers back to front. Every pixel of a
// frame is a pure function of the time t in seconds.
(function (G) {
  var PIX = G.PIX, LAUT = G.LAUT;

  // The sky and the water column never change, so they are baked into one frame.
  var BG = PIX.fb();
  LAUT.bakeSky(BG);
  LAUT.bakeWater(BG);
  var WATER = PIX.fb();
  LAUT.bakeWater(WATER);

  var STEPS = [
    ["sky", function (f, t) { f.set(BG); LAUT.drawSun(f); LAUT.drawClouds(f, t); LAUT.drawFar(f); }],
    ["birds", function (f, t) { LAUT.drawBirds(f, t); }],
    ["sea", function (f, t) { LAUT.drawSea(f, t); }],
    ["cay", function (f, t) { LAUT.drawMirror(f, t); LAUT.drawCay(f, t); }],
    ["island", function (f, t) { LAUT.drawNear(f, t); }],
    ["waterline", function (f, t) { LAUT.drawWaterline(f, t); }],
    ["boat", function (f, t) { LAUT.drawBoat(f, t); }],
    ["deep monster", function (f, t) { LAUT.drawMosaDeep(f, t); }],
    ["far reef", function (f) { LAUT.drawFarReef(f); }],
    ["beams", function (f, t) { LAUT.drawBeams(f, t); }],
    ["shark", function (f, t) { LAUT.drawShark(f, t); }],
    ["monster behind", function (f, t) { LAUT.drawMosaBehind(f, t); }],
    ["reef", function (f, t) { LAUT.drawReef(f); LAUT.drawAnemone(f, t); }],
    ["eels", function (f, t) { LAUT.drawEels(f, t); }],
    ["anchor", function (f, t) { LAUT.drawAnchor(f, t); }],
    ["caustics", function (f, t) { LAUT.drawCaustics(f, t); }],
    ["reef fish", function (f, t) { LAUT.drawReefFish(f, t); }],
    ["school", function (f, t) { LAUT.drawSchool(f, t); }],
    ["turtle", function (f, t) { LAUT.drawTurtle(f, t); }],
    ["jellies", function (f, t) { LAUT.drawJellies(f, t); }],
    ["swimmers", function (f, t) { LAUT.drawSwimmers(f, t); }],
    ["snow", function (f, t) { LAUT.drawSnow(f, t); }],
    ["front", function (f) { LAUT.drawFront(f); }],
    ["gloom", function (f, t) { LAUT.drawGloom(f, t); }],
    ["monster", function (f, t) { LAUT.drawMosaNear(f, t); }],
    ["wake", function (f, t) { LAUT.drawWake(f, t); }],
    ["cut", function (f, t) { LAUT.drawCut(f, t); }],
    ["flying fish", function (f, t) { LAUT.drawFlyer(f, t); }]
  ];

  // Renders frame t; `until` stops after the named step, for tests.
  function render(f, t, until) {
    LAUT.SURF = LAUT.surfaceRow(t);
    for (var k = 0; k < STEPS.length; k++) {
      STEPS[k][1](f, t);
      if (STEPS[k][0] === until) return;
    }
  }

  LAUT.STEPS = STEPS;
  LAUT.BG = BG;
  LAUT.WATER = WATER;
  LAUT.render = render;
})(S);
  var fb = S.PIX.fb();
  return { w: S.PIX.W, h: S.PIX.H, draw: function (out, t) { S.LAUT.render(fb, t); S.PIX.toRGBA(fb, out); } };
})();
