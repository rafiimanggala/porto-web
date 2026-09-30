// Hujan Neon, bundled for the gallery by tools/build.mjs from ~/projects/pixel-neon-rain.
// Its modules get the private scope S instead of the page's global object. Do not edit by hand.
(globalThis.GALERI = globalThis.GALERI || {}).neon = (function () {
  var S = {};
// pixel-neon-rain/src/pixel.js
// Tiny indexed-colour pixel engine for Hujan Neon: a 480x270 framebuffer of
// palette indices, ordered dithering, hash noise, baked layers and colour
// tables. Everything is a pure function, so a frame depends only on time.
(function (G) {
  var W = 480, H = 270, NONE = 255;
  var PALETTE = [
    // Smog sky: blue-black overhead down to the magenta glow of the city.
    ["sky0", "#06051a"], ["sky1", "#0a0822"], ["sky2", "#0f0b2b"], ["sky3", "#150e35"],
    ["sky4", "#1c113f"], ["sky5", "#241449"], ["sky6", "#2e1852"], ["sky7", "#3a1b59"],
    ["sky10", "#682462"], ["sky11", "#7b2862"],
    ["sky12", "#902d62"],
    // Low cloud, dark on top and lit from below by the city.
    ["cl0", "#140f30"], ["cl1", "#211640"], ["cl2", "#321c4e"], ["cl3", "#4a2459"],
    ["cl4", "#6a2e64"], ["cl5", "#93406f"],
    // Far towers, darkest high up and hazier toward the ground, and their windows.
    ["ft0", "#0b0a1d"], ["ft1", "#110e26"], ["ft2", "#18122f"], ["ft3", "#211639"],
    ["ft4", "#2c1a43"], ["ft5", "#3a1f4d"],
    ["fw0", "#26405a"], ["fw1", "#4a3530"], ["fw2", "#452a55"], ["fw3", "#6aa8c8"], ["fw4", "#c89a5a"],
    // The arcology, and the hologram that swims around it.
    ["ar0", "#0f0d22"], ["ar1", "#17142f"], ["ar2", "#221d3f"], ["ar3", "#302a55"],
    ["ho0", "#123f52"], ["ho1", "#1f7890"], ["ho2", "#4fc8dc"], ["ho3", "#b8f6ff"],
    // Mid buildings, and windows: warm rooms, cool screens, coloured rooms.
    ["mb0", "#0c0a1a"], ["mb1", "#120f23"], ["mb2", "#19142d"], ["mb3", "#221a38"],
    ["mb4", "#2e2245"], ["mb5", "#3e2c56"],
    ["wa0", "#33241f"], ["wa1", "#7a4f2a"], ["wa2", "#d8984a"], ["wa3", "#ffd08a"],
    ["wc0", "#1b2c40"], ["wc1", "#33689a"], ["wc2", "#7fc4ee"], ["wm1", "#6a3a7e"], ["wg1", "#2f6a52"],
    // Maglev guideway concrete.
    ["tr0", "#17172a"], ["tr1", "#23233a"], ["tr2", "#33334d"], ["tr3", "#4c4b6c"],
    // Near buildings, almost black, lit at the edges by neon.
    ["nb0", "#06050d"], ["nb1", "#0a0915"], ["nb2", "#100d1e"], ["nb3", "#171327"],
    ["nb4", "#211a33"], ["nb5", "#2e2442"], ["nb6", "#423356"],
    // Metal (pipes, AC units, shutters), rust and old brick, stall wood.
    ["mt0", "#181b29"], ["mt1", "#262a3d"], ["mt2", "#3a4058"], ["mt3", "#5c6682"],
    ["ru0", "#2e1b1d"], ["ru1", "#4a2626"], ["ru2", "#6a3530"],
    ["wd0", "#2a1810"], ["wd1", "#4a2a18"], ["wd2", "#7a4624"],
    // Wet pavement and asphalt.
    ["sw0", "#121019"], ["sw1", "#1a1724"], ["sw2", "#25202f"],
    ["rd0", "#09080f"], ["rd1", "#0e0d17"], ["rd2", "#15131f"], ["rdl", "#55546a"], ["rdy", "#7a6a2a"],
    // Neon, each from the glow it throws to the white-hot tube.
    ["np0", "#3e1034"], ["np1", "#7a1856"], ["np2", "#d6267f"], ["np3", "#ff6ab8"], ["np4", "#ffd2ea"],
    ["nc0", "#0d3140"], ["nc1", "#145c72"], ["nc2", "#1cbcd6"], ["nc3", "#78ecff"], ["nc4", "#dafcff"],
    ["na0", "#3e1f0e"], ["na1", "#7e3e12"], ["na2", "#ff8420"], ["na3", "#ffc062"], ["na4", "#fff0c6"],
    ["nr0", "#3e0d16"], ["nr1", "#7e1422"], ["nr2", "#ff2a3c"], ["nr3", "#ff9090"],
    ["ng0", "#0d3320"], ["ng1", "#186434"], ["ng2", "#38f07a"], ["ng3", "#b4ffcc"],
    ["nv0", "#221047"], ["nv1", "#3a2088"], ["nv2", "#7c5cff"], ["nv3", "#c6b8ff"],
    ["ny1", "#5e4e12"], ["ny2", "#ffde38"], ["ny3", "#fff6b0"],
    ["pb1", "#1a2e7e"], ["pb2", "#3a78ff"],
    // People: skin, hair, coats, a red coat, a yellow raincoat, clear umbrellas.
    ["skn0", "#3a2422"], ["skn1", "#7a4c3c"], ["skn2", "#c28c6c"], ["hr0", "#0e0a12"],
    ["ct0", "#13101c"], ["ct1", "#251f33"], ["ct2", "#3c3350"], ["cr1", "#8c2234"],
    ["cy0", "#5e4a12"], ["cy1", "#b89422"],
    ["um0", "#2c3a56"], ["um1", "#647ea6"], ["um2", "#b8cce8"],
    // Vehicles: dark bodies, a taxi, headlights, the maglev train.
    ["cb0", "#0f111c"], ["cb1", "#1f2336"], ["cb2", "#353b58"], ["cb3", "#626b8e"],
    ["tx0", "#7e5e10"], ["tx1", "#d4a41e"], ["hl0", "#fffbe8"],
    ["tn0", "#181b2c"], ["tn1", "#2a3050"], ["tn2", "#5e6e98"],
    // Steam and rain.
    ["st0", "#231d31"], ["st1", "#3f3552"], ["st2", "#6c5e80"], ["st3", "#a898bc"],
    ["rn0", "#232b48"], ["rn1", "#3e4c74"], ["rn2", "#7c92bc"]
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
  function toRGBA(f, out) { for (var i = 0; i < f.length; i++) out[i] = RGBA[f[i]]; }

  G.PIX = {
    W: W, H: H, NONE: NONE, PALETTE: PALETTE, C: C, RGB: RGB, RGBA: RGBA,
    fb: fb, pset: pset, rect: rect, dith: dith, hash: hash, rng: rng, mod: mod,
    noise: noise, noise2: noise2, names: names, pick: pick, lum: lum, nearest: nearest, toward: toward,
    layer: layer, lset: lset, lget: lget, blit: blit, toRGBA: toRGBA
  };
})(S);
// pixel-neon-rain/src/world.js
// Shared geometry and colour tables for Hujan Neon. The scene is a rainy
// street seen from across the road: two tall buildings frame a gap over a
// low one, and through the gap the city climbs into the smog.
(function (G) {
  var PIX = G.PIX;
  var GEO = {
    gapL: 110, gapR: 374,          // inner edges of the two tall near buildings
    roof: 166,                     // parapet of the low building between them
    shop: 200,                     // top of the shopfronts
    floor: 226,                    // foot of the facades, and the mirror line of the wet street
    walkBack: 232, walkFront: 237, // feet of the two pedestrian lanes
    curb: 240, road: 243,          // top of the curb, first row of asphalt
    laneFar: 254, laneNear: 266,   // wheel lines of the two traffic lanes
    track: 134,                    // top of the maglev guideway
    horizon: 190                   // where the smog is brightest, hidden behind the street
  };
  function glow(hex) { return PIX.toward(hex, 0.4); }
  G.NEON = {
    GEO: GEO,
    // Wet ground: what it mirrors, darkened toward the asphalt.
    WET: PIX.toward("#0e0d17", 0.5, 0.92),
    // Rain streaks catch whatever light is behind them.
    RAIN: PIX.toward("#a8bce0", 0.38),
    RAINF: PIX.toward("#6a7aa8", 0.24),
    // Searchlights and headlight beams.
    LIGHT: PIX.toward("#e2e8ff", 0.24),
    // The halo a neon tube throws on whatever is around it, one table per colour.
    GLOW: {
      p: glow("#d6267f"), c: glow("#1cbcd6"), a: glow("#ff8420"), r: glow("#ff2a3c"),
      g: glow("#38f07a"), v: glow("#7c5cff"), y: glow("#ffde38"), b: glow("#3a78ff")
    }
  };
})(S);
// pixel-neon-rain/src/font.js
// Bitmap fonts for the signs: a 3x5 Latin face for tickers and small print,
// a 5x7 Latin face for the neon, 7x7 katakana, and one 9x9 kanji.
(function (G) {
  function face(w, h, glyphs) { return { w: w, h: h, glyphs: glyphs }; }

  var TINY = face(3, 5, {
    "A": "010101111101101", "B": "110101110101110", "C": "011100100100011", "D": "110101101101110",
    "E": "111100110100111", "F": "111100110100100", "G": "011100101101011", "H": "101101111101101",
    "I": "111010010010111", "J": "001001001101010", "K": "101101110101101", "L": "100100100100111",
    "M": "101111111101101", "N": "110101101101101", "O": "010101101101010", "P": "110101110100100",
    "Q": "010101101110011", "R": "110101110101101", "S": "011100010001110", "T": "111010010010010",
    "U": "101101101101111", "V": "101101101101010", "W": "101101111111101", "X": "101101010101101",
    "Y": "101101010010010", "Z": "111001010100111",
    "0": "111101101101111", "1": "010110010010111", "2": "110001010100111", "3": "110001010001110",
    "4": "101101111001001", "5": "111100110001110", "6": "011100111101111", "7": "111001010010010",
    "8": "111101111101111", "9": "111101111001110",
    " ": "000000000000000", ".": "000000000000010", ":": "000010000010000", "-": "000000111000000",
    "%": "101001010100101", "+": "000010111010000", "!": "010010010000010", "/": "001001010100100",
    "'": "010010000000000"
  });

  var BIG = face(5, 7, {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"]
  });

  var KANA = face(7, 7, {
    "ラ": [".#####.", ".......", "#######", "......#", ".....#.", "...##..", ".##...."],
    "ー": [".......", ".......", ".......", "#######", ".......", ".......", "......."],
    "|": ["...#...", "...#...", "...#...", "...#...", "...#...", "...#...", "...#..."],
    "メ": [".....#.", ".....#.", ".#..#..", "..##...", "...##..", "..#..#.", "##....."],
    "ン": ["#......", ".#....#", ".....#.", "....#..", "...#...", ".##....", "#......"],
    "ホ": ["...#...", "#######", "...#...", "...#...", ".#.#.#.", "#..#..#", "..##..."],
    "テ": [".#####.", ".......", "#######", "...#...", "...#...", "..#....", ".#....."],
    "ル": ["..#.#..", "..#.#..", "..#.#..", "..#.#..", "..#.#.#", ".#..##.", "#...#.."],
    "カ": ["..#....", "#######", "..#...#", "..#...#", ".#....#", ".#...#.", "#..##.."],
    "オ": ["....#..", "#######", "....#..", "...##..", "..#.#..", ".#..#..", "#..##.."],
    "ケ": [".#.....", ".######", "#...#..", "....#..", "....#..", "...#...", "..#...."],
    "ネ": ["...#...", "#######", ".....#.", "....#..", "..####.", ".#.#..#", "#..#..."]
  });

  var KANJI = face(9, 9, {
    "酒": ["#..######", ".#...#.#.", "...######", "#..#.#.##", ".#.#.#.##", "...######",
      "..##....#", ".#.#....#", "#..######"]
  });

  function rows(font, ch) {
    var g = font.glyphs[ch];
    if (g === undefined) throw new Error("font.js: no glyph for " + ch);
    if (typeof g !== "string") return g;
    var out = [];
    for (var r = 0; r < font.h; r++) out.push(g.slice(r * font.w, (r + 1) * font.w));
    return out;
  }
  function glyph(put, font, ch, x, y) {
    var g = rows(font, ch);
    for (var r = 0; r < g.length; r++) {
      for (var c = 0; c < g[r].length; c++) {
        var b = g[r][c];
        if (b === "1" || b === "#") put(x + c, y + r);
      }
    }
  }
  function width(str, font, gap) {
    var n = Array.from(str).length;
    return n ? n * font.w + (n - 1) * (gap === undefined ? 1 : gap) : 0;
  }
  // Horizontal text from its top-left corner; `put(x, y, index)` gets the glyph index too.
  function text(put, str, x, y, font, gap) {
    var step = font.w + (gap === undefined ? 1 : gap);
    Array.from(str).forEach(function (ch, k) {
      glyph(function (px, py) { put(px, py, k); }, font, ch, x + k * step, y);
    });
    return width(str, font, gap);
  }
  // Vertical text reading top to bottom, as on the blade signs; the long
  // vowel mark turns upright.
  function vtext(put, str, x, y, font, gap) {
    var step = font.h + (gap === undefined ? 1 : gap);
    Array.from(str).forEach(function (ch, k) {
      glyph(function (px, py) { put(px, py, k); }, font, ch === "ー" ? "|" : ch, x, y + k * step);
    });
  }

  G.FONT = { TINY: TINY, BIG: BIG, KANA: KANA, KANJI: KANJI, text: text, vtext: vtext, width: width, rows: rows };
})(S);
// pixel-neon-rain/src/neon.js
// Neon tubes. A sign is a set of tube pixels grouped by glyph, with the two
// rings of glow around them worked out once; drawing it tints whatever lies
// under the rings and then lays the tubes on top, lit or dead per glyph.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H, C = PIX.C, GLOW = NEON.GLOW;
  var HUES = {
    p: { dead: C.np1, tube: C.np2, hot: C.np3, core: C.np4, glow: GLOW.p },
    c: { dead: C.nc1, tube: C.nc2, hot: C.nc3, core: C.nc4, glow: GLOW.c },
    a: { dead: C.na1, tube: C.na2, hot: C.na3, core: C.na4, glow: GLOW.a },
    r: { dead: C.nr1, tube: C.nr2, hot: C.nr3, core: C.nr3, glow: GLOW.r },
    g: { dead: C.ng1, tube: C.ng2, hot: C.ng3, core: C.ng3, glow: GLOW.g },
    v: { dead: C.nv1, tube: C.nv2, hot: C.nv3, core: C.nv3, glow: GLOW.v },
    y: { dead: C.ny1, tube: C.ny2, hot: C.ny3, core: C.ny3, glow: GLOW.y }
  };
  var STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // `draw(put)` calls put(x, y, group) for every tube pixel.
  function make(hue, draw) {
    var set = new Map();
    draw(function (x, y, g) {
      x = Math.round(x); y = Math.round(y);
      if (x >= 0 && x < W && y >= 0 && y < H) set.set(y * W + x, g || 0);
    });
    var tubes = [], groups = [], shade = [], near = new Map(), ring1 = [], ring2 = [];
    set.forEach(function (g, i) {
      var x = i % W, y = (i - x) / W, n = 0;
      STEPS.forEach(function (d) { if (set.has(i + d[1] * W + d[0])) n++; });
      tubes.push(i); groups.push(g); shade.push(n <= 1 ? 0 : 1);
      for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) {
          var d = Math.abs(dx) + Math.abs(dy), xx = x + dx, yy = y + dy;
          if (d === 0 || d > 2 || xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
          var j = yy * W + xx, prev = near.get(j);
          if (!set.has(j) && (prev === undefined || d < prev.d)) near.set(j, { d: d, g: g });
        }
      }
    });
    near.forEach(function (v, j) { (v.d === 1 ? ring1 : ring2).push(j, v.g); });
    return { hue: HUES[hue], tubes: tubes, groups: groups, shade: shade, ring1: ring1, ring2: ring2 };
  }

  var ALWAYS = function () { return true; };
  // `lit(group)` says whether a glyph's tube is burning this frame.
  function draw(f, S, lit) {
    var h = S.hue, glow = h.glow, k, j;
    lit = lit || ALWAYS;
    for (k = 0; k < S.ring1.length; k += 2) if (lit(S.ring1[k + 1])) { j = S.ring1[k]; f[j] = glow[f[j]]; }
    for (k = 0; k < S.ring2.length; k += 2) {
      j = S.ring2[k];
      if (lit(S.ring2[k + 1]) && PIX.dith(j % W, (j / W) | 0, 0.5)) f[j] = glow[f[j]];
    }
    for (k = 0; k < S.tubes.length; k++) f[S.tubes[k]] = lit(S.groups[k]) ? (S.shade[k] ? h.hot : h.tube) : h.dead;
  }

  // A soft wash of light baked into a layer around a steady sign, fading out
  // to `radius` pixels.
  function wash(L, S, radius) {
    var best = new Map(), glow = S.hue.glow;
    S.tubes.forEach(function (i) {
      var x = i % W, y = (i - x) / W;
      for (var dy = -radius; dy <= radius; dy++) {
        for (var dx = -radius; dx <= radius; dx++) {
          var d = Math.sqrt(dx * dx + dy * dy), xx = x + dx, yy = y + dy;
          if (d > radius || xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
          var j = yy * W + xx, prev = best.get(j);
          if (prev === undefined || d < prev) best.set(j, d);
        }
      }
    });
    best.forEach(function (d, j) {
      var c = L.px[j];
      if (c === PIX.NONE || d < 2.5) return;
      if (PIX.dith(j % W, (j / W) | 0, 0.55 * (1 - (d - 2.5) / (radius - 2))) ) L.px[j] = glow[c];
    });
  }

  // Flicker: mostly on, with the odd burst of rapid stutter.
  function stutter(t, seed, every, chance) {
    var ep = Math.floor(t / every), s = t - ep * every;
    if (s > 0.8 || PIX.hash(ep, seed, 5) > chance) return true;
    return PIX.hash(Math.floor(t * 22), seed, 6) > 0.5;
  }

  NEON.HUES = HUES;
  NEON.sign = make;
  NEON.drawSign = draw;
  NEON.washSign = wash;
  NEON.stutter = stutter;
})(S);
// pixel-neon-rain/src/sky.js
// The sky: a smog gradient from blue-black overhead to the magenta glow of the
// city, a low cloud deck lit from below that drifts east, and two searchlights
// sweeping it from somewhere behind the towers.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H, NONE = PIX.NONE;
  var GEO = NEON.GEO;
  // The band between sky7 and sky10 always sits behind the city, so it needs
  // no colours of its own.
  var RAMP = PIX.names(["sky0", "sky1", "sky2", "sky3", "sky4", "sky5", "sky6", "sky7", "sky7",
    "sky10", "sky10", "sky11", "sky12"]);
  var CLOUD_RAMP = PIX.names(["cl0", "cl1", "cl2", "cl3", "cl4", "cl5"]);

  // The glow is strongest low down and over the arcology in the middle of the gap.
  function bakeSky() {
    var f = PIX.fb();
    for (var y = 0; y < H; y++) {
      var v = Math.min(1, y / GEO.horizon);
      for (var x = 0; x < W; x++) {
        var bloom = 0.1 * Math.exp(-Math.pow((x - 250) / 120, 2)) * v;
        f[y * W + x] = PIX.pick(RAMP, Math.pow(v, 1.25) + bloom, x, y);
      }
    }
    return f;
  }

  // The cloud deck is baked once as a strip that wraps every PER pixels, thick
  // overhead and breaking up lower down, brightest on its undersides.
  var PER = 960, CH = 92;
  var CLOUD = new Uint8Array(PER * CH).fill(NONE);
  function density(x, y) {
    var d = 0.55 * PIX.noise2(x / 48, y / 12, 11, PER / 48) +
      0.3 * PIX.noise2(x / 20, y / 6, 12, PER / 20) +
      0.15 * PIX.noise2(x / 8, y / 3, 13, PER / 8);
    return d - (0.36 + 0.34 * Math.pow(y / CH, 1.1));
  }
  function bakeClouds() {
    var d = new Float32Array(PER * (CH + 8));
    for (var y = 0; y < CH + 8; y++) for (var x = 0; x < PER; x++) d[y * PER + x] = density(x, y);
    for (x = 0; x < PER; x++) {
      var under = 0;  // cloud rows below this one, counted from the bottom up
      for (y = CH + 7; y >= 0; y--) {
        var k = d[y * PER + x];
        under = k > 0 ? under + 1 : 0;
        if (y >= CH) continue;
        var lit = Math.max(0, 1 - (under - 1) / 7), v = 0.12 + 0.58 * lit + 0.3 * (y / CH);
        if (k > 0) CLOUD[y * PER + x] = PIX.pick(CLOUD_RAMP, v, x, y);
        else if (k > -0.035 && PIX.dith(x, y, (k + 0.035) / 0.05)) {
          CLOUD[y * PER + x] = PIX.pick(CLOUD_RAMP, v * 0.7, x, y);
        }
      }
    }
  }

  function drawClouds(f, t) {
    var off = Math.floor(t * 2.2), mask = NEON.skyMask;
    for (var y = 0; y < CH; y++) {
      var row = y * PER;
      for (var x = 0; x < W; x++) {
        var i = y * W + x;
        if (!mask[i]) continue;
        var c = CLOUD[row + PIX.mod(x - off, PER)];
        if (c !== NONE) f[i] = c;
      }
    }
  }

  // Searchlights: angle from the vertical, swinging slowly around a base angle.
  var BEAMS = [
    { x0: 172, y0: 196, base: -0.26, amp: 0.3, period: 11, phase: 0 },
    { x0: 326, y0: 196, base: 0.24, amp: 0.32, period: 14.5, phase: 2.1 }
  ];
  function beams(t) {
    return BEAMS.map(function (b) {
      return { x0: b.x0, y0: b.y0, angle: b.base + b.amp * Math.sin((t / b.period) * 2 * Math.PI + b.phase) };
    });
  }
  function drawBeams(f, t, mask) {
    var LIGHT = NEON.LIGHT;
    mask = mask || NEON.skyMask;
    beams(t).forEach(function (b) {
      var tan = Math.tan(b.angle);
      for (var y = 0; y < 180; y++) {
        var r = b.y0 - y, cx = b.x0 + r * tan, hw = 1.2 + r * 0.045;
        var fade = Math.min(1, 0.35 + y / 40);
        for (var x = Math.max(0, Math.floor(cx - hw)); x <= Math.min(W - 1, Math.ceil(cx + hw)); x++) {
          var i = y * W + x, a = 1 - Math.abs(x - cx) / hw;
          if (a > 0 && mask[i] && PIX.dith(x, y, a * a * 0.9 * fade + 0.08)) f[i] = LIGHT[f[i]];
        }
      }
    });
  }

  NEON.SKY = bakeSky();
  bakeClouds();
  NEON.skyMask = new Uint8Array(W * H).fill(1);
  NEON.CLOUD = { strip: CLOUD, period: PER, rows: CH };
  NEON.drawClouds = drawClouds;
  NEON.beams = beams;
  NEON.drawBeams = drawBeams;
})(S);
// pixel-neon-rain/src/towers.js
// The far city seen through the gap: a hazy skyline of megatowers, the
// terraced arcology in the middle with its advert screen, blinking aviation
// lights, light pulses climbing the arcology's ribs, and two hologram koi
// swimming around it.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, FONT = G.FONT, W = PIX.W, H = PIX.H, NONE = PIX.NONE;
  var C = PIX.C, GLOW = NEON.GLOW;
  var FAR = PIX.layer();
  var ARC = new Uint8Array(W * H);
  var BODY = PIX.names(["ft0", "ft1", "ft2", "ft3", "ft4", "ft5"]);
  var ABODY = PIX.names(["ar0", "ar1", "ar2", "ar3"]);
  var WIN = PIX.names(["fw0", "fw1", "fw2", "fw3", "fw4"]);
  var BLINKERS = [];

  function put(x, y, c) { PIX.lset(FAR, x, y, c); }
  // The lower a pixel, the more the glowing smog washes it out.
  function tone(x, y, base) { return PIX.pick(BODY, base + Math.max(0, (y - 50) / 190), x, y); }
  function windowColour(r, dim) {
    if (dim) return r < 0.6 ? WIN[2] : WIN[0];
    return r < 0.45 ? WIN[0] : r < 0.75 ? WIN[1] : r < 0.93 ? WIN[2] : r < 0.97 ? WIN[3] : WIN[4];
  }

  // A tower from its left edge x0 to x1 (exclusive) standing on the ground,
  // its roof at `top`, lit at the edges, with a grid of windows.
  function tower(x0, x1, top, base, seed, lit, dim) {
    for (var y = Math.max(0, top); y < 200; y++) {
      for (var x = x0; x < x1; x++) {
        var edge = x === x0 || x === x1 - 1 || y === top;
        put(x, y, tone(x, y, base + (edge ? 0.2 : 0)));
      }
    }
    for (y = top + 3; y < 200; y += 3) {
      for (x = x0 + 2; x < x1 - 2; x += dim ? 3 : 2) {
        if (PIX.hash(x, y, seed) < lit) put(x, y, windowColour(PIX.hash(x, y, seed + 1), dim));
      }
    }
  }
  function mast(x, y0, y1, c) { for (var y = y0; y <= y1; y++) put(x, y, c); }
  function blinker(x, y, period, phase) { BLINKERS.push({ x: x, y: y, period: period, phase: phase }); }
  function neonLine(pts, c) { pts.forEach(function (p) { put(p[0], p[1], c); }); }

  function haze() {
    var r = PIX.rng(7), x = 100;
    while (x < 384) {
      var w = 8 + Math.floor(r() * 16), top = 70 + Math.floor(r() * 48);
      tower(x, x + w, top, 0.42, 20 + x, 0.14, true);
      x += w + (r() < 0.3 ? 3 : 0);
    }
  }

  function skyline() {
    var ft3 = C.ft3, x;
    // A: a slab with a lattice mast.
    tower(112, 142, 50, 0.16, 31, 0.36);
    mast(127, 32, 49, ft3);
    for (x = 125; x <= 129; x++) put(x, 38, ft3);
    for (x = 124; x <= 130; x++) put(x, 44, ft3);
    blinker(127, 31, 1.6, 0);
    // B: the tallest, stepping back twice to a spire, its setbacks outlined in violet.
    tower(140, 174, 36, 0.06, 32, 0.42);
    tower(145, 169, 28, 0.06, 33, 0.42);
    tower(150, 164, 22, 0.06, 34, 0.42);
    mast(157, 6, 21, ft3);
    for (x = 156; x <= 158; x++) put(x, 19, ft3), put(x, 20, ft3), put(x, 21, ft3);
    for (x = 140; x < 174; x++) if (x < 145 || x > 168) put(x, 36, C.nv1);
    for (x = 145; x < 169; x++) if (x < 150 || x > 163) put(x, 28, C.nv1);
    for (x = 150; x < 164; x++) put(x, 22, C.nv1);
    blinker(157, 5, 2.1, 0.7);
    // C: a low block with a rooftop hut.
    tower(174, 200, 72, 0.2, 35, 0.4);
    tower(180, 190, 66, 0.2, 36, 0);
    // D: twin spires.
    tower(300, 332, 40, 0.1, 37, 0.4);
    mast(305, 20, 39, ft3); mast(306, 30, 39, ft3);
    mast(327, 24, 39, ft3); mast(326, 32, 39, ft3);
    blinker(305, 19, 1.3, 0.3);
    blinker(327, 23, 1.3, 0.95);
    // E: a slanted crown edged in cyan, with a dim billboard.
    for (x = 332; x < 378; x++) {
      var top = Math.round(58 + (x - 332) * 0.36);
      for (var y = top; y < 200; y++) put(x, y, tone(x, y, 0.14 + (y === top ? 0.2 : 0)));
      put(x, top, C.nc1);
      for (y = top + 4; y < 200; y += 3) {
        if ((x & 1) === 0 && PIX.hash(x, y, 38) < 0.38) put(x, y, windowColour(PIX.hash(x, y, 39)));
      }
    }
    for (y = 78; y < 100; y++) for (x = 342; x < 366; x++) {
      var edge = y === 78 || y === 99 || x === 342 || x === 365;
      put(x, y, edge ? C.ft4 : PIX.pick(PIX.names(["nv0", "np0", "np1"]), (y - 78) / 22 + 0.3 * PIX.noise2(x / 5, y / 5, 40), x, y));
    }
    blinker(333, 56, 1.8, 1.2);
  }

  // The arcology: five terraces narrowing upward, banded with lit floors.
  var TERRACES = [[-1, 28, 228, 272], [28, 66, 220, 280], [66, 108, 212, 288], [108, 150, 204, 296], [150, 200, 196, 304]];
  var SCREEN = { x0: 229, y0: 34, x1: 272, y1: 59 };
  var RIBS = [{ x: 250, y0: 0, y1: 31 }, { x: 238, y0: 62, y1: 199 }, { x: 262, y0: 62, y1: 199 }];
  function arcology() {
    TERRACES.forEach(function (T, k) {
      var y0 = Math.max(0, T[0]), x0 = T[2], x1 = T[3];
      for (var y = y0; y < T[1]; y++) {
        for (var x = x0; x < x1; x++) {
          var v = 0.28 + Math.max(0, (y - 100) / 260);
          if (x === x0 || x === x1 - 1) v += 0.35;
          if (y === T[0]) v = 1;
          if (y === T[0] + 1) v = 0;
          put(x, y, PIX.pick(ABODY, v, x, y));
          ARC[y * W + x] = 1;
        }
        var floor = y - T[0] - 3;
        if (floor < 0 || floor % 4) continue;
        for (x = x0 + 2; x < x1 - 2; x++) {
          var n = PIX.noise(x / 5, y * 13 + k, 0);
          if (n > 0.8) put(x, y, WIN[3]);
          else if (n > 0.42) put(x, y, PIX.hash(x, y, 41) < 0.12 ? WIN[1] : WIN[0]);
        }
      }
      if (T[0] > 0) for (var lx = x0 + 3; lx < x1 - 3; lx += 6) put(lx, T[0] + 1, WIN[4]);
    });
    RIBS.forEach(function (r) { mast(r.x, r.y0, r.y1, C.nc0); });
    // The screen's steel frame.
    for (var y = SCREEN.y0 - 2; y < SCREEN.y1 + 2; y++) {
      for (var x = SCREEN.x0 - 2; x < SCREEN.x1 + 2; x++) {
        var outer = y === SCREEN.y0 - 2 || y === SCREEN.y1 + 1 || x === SCREEN.x0 - 2 || x === SCREEN.x1 + 1;
        put(x, y, outer ? C.mt1 : C.mt2);
      }
    }
  }

  haze();
  skyline();
  arcology();

  // A few far windows switch on and off as people come and go.
  var TWINKLES = [];
  (function () {
    var r = PIX.rng(51);
    while (TWINKLES.length < 26) {
      var x = 112 + Math.floor(r() * 262), y = 10 + Math.floor(r() * 130);
      var c = PIX.lget(FAR, x, y);
      if (WIN.indexOf(c) < 0 || ARC[y * W + x]) continue;
      TWINKLES.push({ i: y * W + x, lit: c, dark: PIX.lget(FAR, x - 1, y), period: 5 + r() * 14, phase: r() * 20 });
    }
  })();

  function halo(f, x, y, table, ring2) {
    for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
      var d = Math.abs(dx) + Math.abs(dy);
      if (d === 0 || d > 2 || (d === 2 && !ring2)) continue;
      var xx = x + dx, yy = y + dy;
      if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
      if (d === 1 || PIX.dith(xx, yy, 0.5)) f[yy * W + xx] = table[f[yy * W + xx]];
    }
  }

  // An aviation light: on for half a second in every `period`.
  function blink(f, x, y, t, period, phase) {
    var on = PIX.mod(t + phase, period) < 0.5;
    if (on) halo(f, x, y, GLOW.r, true);
    f[y * W + x] = on ? C.nr2 : C.nr0;
  }
  function drawBlinkers(f, t) {
    BLINKERS.forEach(function (b) { blink(f, b.x, b.y, t, b.period, b.phase); });
  }
  function drawRibs(f, t) {
    RIBS.forEach(function (r, k) {
      var span = r.y1 - r.y0;
      for (var p = 0; p < 3; p++) {
        var y = r.y1 - Math.floor(PIX.mod(t * 26 + (p * span) / 3 + k * 17, span));
        [C.nc3, C.nc2, C.nc2, C.nc1].forEach(function (c, d) {
          if (y + d <= r.y1) f[(y + d) * W + r.x] = c;
        });
      }
    });
  }
  function drawTwinkles(f, t) {
    TWINKLES.forEach(function (w, k) {
      var cycle = Math.floor((t + w.phase) / w.period);
      f[w.i] = PIX.hash(k, cycle, 52) < 0.7 ? w.lit : w.dark;
    });
  }

  // The advert screen: a koi, the word NEON, a bowl of ramen, with static between.
  var SLIDE = 8, STATIC = 0.35, SX = SCREEN.x0, SY = SCREEN.y0, SW = SCREEN.x1 - SCREEN.x0, SH = SCREEN.y1 - SCREEN.y0;
  function sput(f, x, y, c) { if (x >= 0 && x < SW && y >= 0 && y < SH) f[(SY + y) * W + SX + x] = c; }
  function fill(f, top, bottom) {
    for (var y = 0; y < SH; y++) for (var x = 0; x < SW; x++) sput(f, x, y, PIX.pick([top, bottom], y / SH, x, y));
  }
  var SCREEN_KOI = [
    "....######.......##",
    "..##########....###",
    ".#############.####",
    "##################.",
    ".#############.####",
    "..##########....###",
    "....##..#.......##."
  ];
  function adKoi(f, s) {
    fill(f, C.nc0, C.nc1);
    var x0 = Math.round(-20 + s * 8.6), bob = Math.round(Math.sin(s * 2.2));
    SCREEN_KOI.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) {
        if (row[c] !== "#") continue;
        var wig = c > 12 ? Math.round(Math.sin(s * 9 - c * 0.6)) : 0;
        var patch = PIX.noise2((c + 3) / 4, r / 3, 60) > 0.55;
        var shade = r === 0 || row[c - 1] !== "#" && r < 3 ? C.np4 : patch ? C.nr2 : r > 4 ? C.st3 : C.hl0;
        sput(f, x0 + 18 - c, 9 + r + bob + wig, shade);
      }
    });
    sput(f, x0 + 16, 11 + bob, C.nb0);
    for (var b = 0; b < 5; b++) {
      var by = SH - 1 - Math.floor(PIX.mod(s * 6 + b * 5, SH)), bx = 4 + b * 8 + Math.round(Math.sin(s * 3 + b));
      sput(f, bx, by, C.nc3);
    }
  }
  function adNeon(f, s) {
    fill(f, C.nv0, C.np0);
    var sweep = [C.np3, C.na3, C.nc3, C.ng3];
    FONT.text(function (x, y) {
      sput(f, x, y, sweep[PIX.mod(Math.floor((x + y + s * 18) / 4), 4)]);
    }, "NEON", 10, 3, FONT.BIG);
    var blink = PIX.mod(s, 1.2) < 0.9;
    FONT.text(function (x, y) { sput(f, x, y, blink ? C.np3 : C.np1); }, "ネオン", 9, 13, FONT.KANA, 2);
  }
  function adRamen(f, s) {
    fill(f, C.na0, C.nr0);
    for (var x = 3; x < 22; x++) {
      var half = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((x - 12.5) / 9.5, 2))) * 6);
      for (var y = 13; y < 13 + half; y++) sput(f, x, y, y === 13 ? C.na3 : x < 9 ? C.na1 : C.na2);
      if ((x + Math.round(s * 4)) % 3) sput(f, x, 12, C.wa3);
    }
    for (var k = 0; k < 7; k++) sput(f, 15 + k, 11 - k, C.wd2);
    for (var p = 0; p < 3; p++) {
      for (var sy = 2; sy < 11; sy++) {
        var wave = Math.round(Math.sin(sy * 0.8 - s * 5 + p * 2));
        if (PIX.dith(sy, p, 0.8 - sy * 0.05)) sput(f, 7 + p * 4 + wave, sy, sy < 5 ? C.st2 : C.st3);
      }
    }
    var blink = PIX.mod(s, 1) < 0.7;
    FONT.text(function (x, y) { sput(f, x, y, blink ? C.ny2 : C.ny1); }, "24H", 24, 9, FONT.BIG);
  }
  function screenStatic(f, t) {
    var frame = Math.floor(t * 30), pal = [C.nc1, C.np1, C.mt2, C.nb2, C.nc3, C.wc2];
    for (var y = 0; y < SH; y++) for (var x = 0; x < SW; x++) sput(f, x, y, pal[Math.floor(PIX.hash(x, y, frame) * 6)]);
  }
  var SCREEN_GLOW = [GLOW.c, GLOW.p, GLOW.a];
  function drawScreen(f, t) {
    var k = Math.floor(t / SLIDE), s = t - k * SLIDE, slide = PIX.mod(k, 3);
    if (s < STATIC) screenStatic(f, t);
    else [adKoi, adNeon, adRamen][slide](f, s);
    // A refresh band rolls down the screen.
    var band = Math.floor(PIX.mod(t * 14, SH));
    for (var x = 0; x < SW; x++) f[(SY + band) * W + SX + x] = NEON.LIGHT[f[(SY + band) * W + SX + x]];
    // The screen lights up the arcology around its frame.
    var table = SCREEN_GLOW[slide];
    for (var y = SY - 5; y < SCREEN.y1 + 5; y++) {
      for (x = SX - 5; x < SCREEN.x1 + 5; x++) {
        var inside = y >= SY - 2 && y < SCREEN.y1 + 2 && x >= SX - 2 && x < SCREEN.x1 + 2;
        if (inside || !ARC[y * W + x]) continue;
        var d = Math.max(SY - 2 - y, y - SCREEN.y1 - 1, SX - 2 - x, x - SCREEN.x1 - 1);
        if (PIX.dith(x, y, 0.75 - d * 0.18)) f[y * W + x] = table[f[y * W + x]];
      }
    }
  }

  function drawFar(f, t) {
    drawTwinkles(f, t);
    drawRibs(f, t);
    drawScreen(f, t);
    drawBlinkers(f, t);
  }

  // Hologram koi, drawn nose-left; the tail sways and scanlines crawl.
  var KOI_SHAPE = [
    "......##.........#",
    "...#######......##",
    ".###########...###",
    "#################.",
    ".###########...###",
    "...#####.#......##",
    "....#............#"
  ];
  var KOIS = [{ ramp: PIX.names(["ho0", "ho1", "ho2", "ho3"]), phase: 0 },
    { ramp: PIX.names(["np0", "np1", "np2", "np3"]), phase: Math.PI }];
  var ORBIT = { cx: 250, cy: 84, rx: 64, ry: 9, period: 18 };
  function koi(t) {
    return KOIS.map(function (k) {
      var a = (t / ORBIT.period) * 2 * Math.PI + k.phase, s = Math.sin(a);
      return { x: ORBIT.cx + ORBIT.rx * Math.cos(a), y: ORBIT.cy + ORBIT.ry * s, front: s > 0, dir: s > 0 ? -1 : 1 };
    });
  }
  function drawOne(f, t, k, ramp) {
    var len = KOI_SHAPE[0].length, x0 = Math.round(k.x - len / 2), y0 = Math.round(k.y - 3);
    var glitch = PIX.mod(t, 3.7) < 0.12 ? 2 : 0, crawl = Math.floor(t * 8);
    var lift = k.front ? 1 : 0;
    for (var c = 0; c < len; c++) {
      var sway = Math.round(1.3 * Math.sin(c * 0.55 - t * 6) * (c / len));
      var x = k.dir < 0 ? x0 + c : x0 + len - 1 - c;
      for (var r = 0; r < KOI_SHAPE.length; r++) {
        if (KOI_SHAPE[r][c] !== "#") continue;
        var y = y0 + r + sway, xx = x + (r >= 2 && r <= 4 ? glitch : 0);
        if (xx < 0 || xx >= W || y < 0 || y >= H) continue;
        var i = y * W + xx;
        if (!k.front && ARC[i]) continue;
        var top = r === 0 || KOI_SHAPE[r - 1][c] !== "#";
        var shade = top ? 2 + lift : PIX.mod(y + crawl, 3) === 0 ? lift : 1 + lift;
        if (c === 2 && r === 2) shade = 0;
        if (PIX.dith(xx, y, k.front ? 0.85 : 0.6)) f[i] = ramp[shade];
      }
    }
  }
  function drawKoi(f, t, which) {
    koi(t).forEach(function (k, n) {
      if (which === undefined || which === n) drawOne(f, t, k, KOIS[n].ramp);
    });
  }

  NEON.FAR = FAR;
  NEON.ARC = ARC;
  NEON.BLINKERS = BLINKERS;
  NEON.SCREEN = SCREEN;
  NEON.drawFar = drawFar;
  NEON.blink = blink;
  NEON.koi = koi;
  NEON.drawKoi = drawKoi;
})(S);
// pixel-neon-rain/src/city.js
// The middle distance: a row of apartment blocks and a hotel with a rooftop
// sign, the maglev guideway on its pylons, and the shuttle train that runs
// along it, one way and then the other.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, FONT = G.FONT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = NEON.GEO;
  var MID = PIX.layer();
  var BODY = PIX.names(["mb0", "mb1", "mb2", "mb3", "mb4", "mb5"]);
  // Room colours, [upper row, lower row] of a 2x2 window.
  var ROOMS = [[C.wa2, C.wa1], [C.wa2, C.wa1], [C.wa1, C.wa0], [C.wc2, C.wc1], [C.wc1, C.wc0],
    [C.wm1, C.wm1], [C.wg1, C.wg1], [C.wa3, C.wa2]];
  var TV = [], TV_WINDOWS = [];

  function put(x, y, c) { PIX.lset(MID, x, y, c); }
  function fillRect(x0, y0, x1, y1, c) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) put(x, y, c); }

  // A block from x0 to x1 (exclusive), its roof at `top`, the side facing the
  // arcology lit (rim +1 lights the right edge, -1 the left).
  function block(x0, x1, top, rim, seed, lit) {
    for (var y = top; y < 210; y++) {
      for (var x = x0; x < x1; x++) {
        var v = 0.2 + Math.max(0, (y - 110) / 320);
        if (y === top) v += 0.55;
        if ((rim > 0 && x === x1 - 1) || (rim < 0 && x === x0)) v += 0.4;
        put(x, y, PIX.pick(BODY, v, x, y));
      }
    }
    for (y = top + 4; y < 200; y += 6) {
      for (x = x0 + 3; x < x1 - 4; x += 5) {
        var r = PIX.hash(x, y, seed);
        if (r > lit) { put(x, y, C.mb0); put(x + 1, y, C.mb0); continue; }
        var room = ROOMS[Math.floor(PIX.hash(x, y, seed + 1) * ROOMS.length)];
        put(x, y, room[0]); put(x + 1, y, room[0]);
        put(x, y + 1, room[1]); put(x + 1, y + 1, room[1]);
        if (PIX.hash(x, y, seed + 2) < 0.25) put(x + (PIX.hash(x, y, seed + 3) < 0.5 ? 0 : 1), y + 1, C.mb0);
        if (room[0] === C.wc2 && TV_WINDOWS.length < 12 && PIX.hash(x, y, seed + 4) < 0.6) {
          TV_WINDOWS.push([x, y]);
        }
      }
    }
  }

  function tank(x0, y0) {
    for (var y = y0; y < y0 + 9; y++) {
      for (var x = x0; x < x0 + 12; x++) {
        var v = 0.3 + (x - x0 === 1 ? 0.5 : 0) + ((y - y0) % 3 === 0 ? 0.15 : 0);
        put(x, y, PIX.pick(PIX.names(["mt0", "mt1", "mt2"]), v, x, y));
      }
    }
    for (var k = 0; k < 3; k++) fillRect(x0 + 2 + k, y0 - 3 + k, x0 + 9 - k, y0 - 3 + k, k === 0 ? C.mt2 : C.mt1);
    [x0 + 1, x0 + 5, x0 + 10].forEach(function (lx) { fillRect(lx, y0 + 9, lx, y0 + 11, C.mt0); });
  }
  function aircon(x0, y0) {
    fillRect(x0, y0, x0 + 5, y0 + 3, C.mt1);
    fillRect(x0, y0, x0 + 5, y0, C.mt2);
    put(x0 + 3, y0 + 2, C.mt0); put(x0 + 4, y0 + 1, C.mt0);
  }
  function mast(x, y0, y1) { for (var y = y0; y <= y1; y++) put(x, y, C.mt1); }

  function blocks() {
    block(100, 150, 114, 1, 61, 0.5);
    tank(114, 102);
    mast(143, 96, 113);
    aircon(131, 110);
    block(150, 198, 130, 1, 62, 0.45);
    block(198, 224, 146, 1, 63, 0.5);
    fillRect(204, 140, 212, 145, C.mb2);
    fillRect(204, 140, 212, 140, C.mb4);
    block(224, 278, 150, 0, 64, 0.55);
    [230, 244, 262].forEach(function (x) { aircon(x, 146); });
    block(278, 306, 138, -1, 65, 0.45);
    for (var dx = -4; dx <= 4; dx++) put(292 + dx, 134 + Math.round(dx * dx / 5), C.mt2);
    mast(292, 130, 137);
    block(306, 338, 106, -1, 66, 0.5);
    block(312, 332, 96, -1, 68, 0.3);
    mast(322, 84, 95);
    fillRect(312, 99, 331, 99, C.nv1);
    block(338, 384, 124, -1, 67, 0.4);
    // Balconies on the last block: railings, pot plants and washing.
    for (var y = 129; y < 200; y += 6) {
      for (var x = 340; x < 382; x++) {
        put(x, y + 2, C.mt2);
        var r = PIX.hash(x, y, 69);
        if (r < 0.12) put(x, y + 1, r < 0.06 ? C.ng1 : C.ng0);
        else if (r > 0.9) put(x, y, [C.cr1, C.um2, C.cy1, C.wm1][Math.floor(PIX.hash(x, y, 70) * 4)]);
      }
    }
  }

  // The rooftop hotel sign on its lattice.
  var ROOF_SIGN = { box: [154, 102, 195, 118] };
  function roofSign() {
    fillRect(154, 102, 194, 117, C.nb1);
    for (var x = 154; x <= 194; x++) { put(x, 102, C.mt1); put(x, 117, C.mt1); }
    for (var y = 102; y <= 117; y++) { put(154, y, C.mt1); put(194, y, C.mt1); }
    [158, 174, 190].forEach(function (lx) { mast(lx, 118, 129); });
    for (var k = 0; k < 12; k++) { put(158 + k * 1.33, 118 + k * 0.95, C.mt0); put(190 - k * 1.33, 118 + k * 0.95, C.mt0); }
    ROOF_SIGN.sign = NEON.sign("v", function (p) { FONT.text(p, "ホテル", 162, 106, FONT.KANA, 2); });
    NEON.washSign(MID, ROOF_SIGN.sign, 5);
  }

  // The guideway: a concrete beam with a light strip, on T-shaped pylons.
  var TRACK = GEO.track;
  function guideway() {
    for (var x = 0; x < W; x++) {
      put(x, TRACK, C.tr3);
      put(x, TRACK + 1, C.tr2);
      put(x, TRACK + 2, x % 20 === 0 ? C.tr0 : C.tr1);
      put(x, TRACK + 3, C.nc1);
      put(x, TRACK + 4, x % 20 === 0 ? C.tr0 : C.tr1);
      put(x, TRACK + 5, x % 40 === 13 ? C.nr1 : C.tr0);
    }
    [132, 252, 356].forEach(function (px) {
      fillRect(px - 3, TRACK + 6, px + 8, TRACK + 7, C.tr2);
      for (var y = TRACK + 8; y < 205; y++) {
        for (var x = px; x < px + 6; x++) put(x, y, x === px ? C.tr2 : x === px + 5 ? C.tr0 : C.tr1);
      }
    });
  }

  blocks();
  roofSign();
  guideway();
  TV_WINDOWS.forEach(function (w) { TV.push(w[1] * W + w[0], w[1] * W + w[0] + 1, (w[1] + 1) * W + w[0], (w[1] + 1) * W + w[0] + 1); });

  function drawMid(f, t) {
    TV_WINDOWS.forEach(function (w, k) {
      var c = [C.wc0, C.wc1, C.wc2, C.wc1][Math.floor(PIX.hash(k, Math.floor(t * 5 + k * 0.37), 71) * 4)];
      var i = w[1] * W + w[0];
      f[i] = f[i + 1] = c;
      f[i + W] = f[i + W + 1] = c === C.wc2 ? C.wc1 : C.wc0;
    });
    // A light chases around the crown of the slender tower.
    var head = Math.floor(PIX.mod(t * 12, 20));
    for (var k = 0; k < 4; k++) f[99 * W + 312 + PIX.mod(head - k, 20)] = k ? C.nv2 : C.nv3;
    NEON.blink(f, 322, 83, t, 1.7, 0.4);
    NEON.blink(f, 143, 95, t, 2.3, 1.1);
    NEON.drawSign(f, ROOF_SIGN.sign);
  }

  // The shuttle: three cars, rightward on even passes and leftward on odd ones.
  var PASS = 24, SPEED = 150, CAR = 46, GAP = 2, LEN = 3 * CAR + 2 * GAP;
  function train(t) {
    var k = Math.floor(t / PASS), s = t - k * PASS, dir = PIX.mod(k, 2) ? -1 : 1;
    var front = dir > 0 ? -10 + SPEED * s : W + 10 - SPEED * s;
    var rear = front - dir * (LEN - 1);
    var x0 = Math.min(front, rear), x1 = Math.max(front, rear);
    if (x1 < 0 || x0 >= W) return null;
    return { x0: x0, x1: x1, front: front, rear: rear, dir: dir, speed: SPEED, pass: k };
  }
  function drawTrain(f, t) {
    var tr = train(t);
    if (!tr) return;
    var top = TRACK - 11, rear = Math.round(tr.rear), dir = tr.dir;
    function tp(u, r, c) {
      var x = rear + dir * u, y = top + r;
      if (x >= 0 && x < W) f[y * W + x] = c;
    }
    for (var u = 0; u < LEN; u++) {
      var car = Math.floor(u / (CAR + GAP)), cu = u - car * (CAR + GAP);
      if (cu >= CAR) { for (var r = 3; r < 9; r++) tp(u, r, C.tn0); continue; }
      var nose = car === 2 ? CAR - 1 - cu : -1, tail = car === 0 ? cu : -1;
      for (r = 0; r < 11; r++) {
        if (nose >= 0 && nose < 7 - r) continue;
        if (tail >= 0 && tail < 3 - r) continue;
        var c = C.tn1;
        if (r === 0) c = C.tn2;
        else if (r >= 2 && r <= 5) {
          var w = cu - 4, pane = w >= 0 && w % 6 < 4 && cu < CAR - 5;
          if (nose >= 0 && nose < 9) c = r < 4 ? C.ho1 : C.tn0;
          else if (pane) {
            var seat = Math.floor(w / 6), col = w % 6;
            var room = PIX.hash(car, seat, tr.pass) < 0.7 ? [C.wa3, C.wa2] : [C.wc2, C.wc1];
            var rider = PIX.hash(car, seat, 81 + tr.pass) < 0.45;
            c = r === 2 ? room[0] : room[1];
            if (rider && ((r === 3 && col === 1) || (r >= 4 && col <= 2))) c = C.ct0;
          }
        } else if (r === 6) c = C.np2;
        else if (r === 9) c = C.tn0;
        else if (r === 10) c = PIX.dith(u, 0, 0.6) ? C.nc3 : C.nc2;
        if (cu === 0 || cu === CAR - 1) c = r === 6 ? C.np1 : r < 10 ? C.tn0 : c;
        tp(u, r, c);
      }
    }
    tp(LEN - 2, 7, C.hl0);
    tp(1, 7, C.nr2);
    // The headlight throws a cone along the guideway, and the rail lights up underneath.
    for (var d = 1; d < 26; d++) {
      var spread = Math.floor(d / 8);
      for (r = 7 - spread; r <= 7 + spread; r++) {
        if (r > 10 || !PIX.dith(d, r, 0.7 - d * 0.025)) continue;
        var x = rear + dir * (LEN - 1 + d), y = top + r;
        if (x >= 0 && x < W) f[y * W + x] = NEON.LIGHT[f[y * W + x]];
      }
    }
    for (u = -12; u < LEN + 12; u++) {
      var xx = rear + dir * u;
      if (xx >= 0 && xx < W && (u >= 0 && u < LEN || PIX.dith(u, 3, 0.5))) f[(TRACK + 3) * W + xx] = C.nc2;
    }
  }

  NEON.MID = MID;
  NEON.MID_TV = TV;
  NEON.ROOF_SIGN = ROOF_SIGN;
  NEON.drawMid = drawMid;
  NEON.train = train;
  NEON.drawTrain = drawTrain;
})(S);
// pixel-neon-rain/src/street.js
// The near buildings across the road: two tall ones framing the gap (tiles,
// concrete, old brick), a low one between them with a cluttered roof, all
// hung with windows, air conditioners, drainpipes and balconies, and cables
// strung across the gap.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = NEON.GEO;
  var NEAR = PIX.layer();
  var RAMP = PIX.names(["nb0", "nb1", "nb2", "nb3", "nb4", "nb5", "nb6"]);
  var BRICK = PIX.names(["ru0", "ru1", "ru2"]);
  var WINDOWS = [];   // lit windows, for the ones that switch on and off
  var KEEP_OUT = [];  // rectangles where signs hang, left free of windows

  function put(x, y, c) { PIX.lset(NEAR, x, y, c); }
  function fill(x0, y0, x1, y1, c) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) put(x, y, c); }
  function free(x0, y0, x1, y1) {
    return !KEEP_OUT.some(function (r) { return x1 >= r[0] && x0 <= r[2] && y1 >= r[1] && y0 <= r[3]; });
  }
  // Light from the shops creeps up the lowest floors.
  function lift(y) { return Math.max(0, (y - 150) / 80) * 0.22; }

  var MATERIAL = {
    concrete: function (x, y, s) {
      var n = 0.6 * PIX.noise2(x / 6, y / 21, s) + 0.4 * PIX.hash(x, y, s);
      return PIX.pick(RAMP, 0.26 + 0.2 * n + lift(y), x, y);
    },
    tiles: function (x, y, s) {
      var grout = x % 3 === 0 || y % 3 === 0;
      return PIX.pick(RAMP, (grout ? 0.22 : 0.36) + 0.08 * PIX.noise2(x / 9, y / 9, s) + lift(y), x, y);
    },
    brick: function (x, y, s) {
      var course = Math.floor(y / 3), joint = y % 3 === 2 || (x + (course % 2) * 3) % 6 === 0;
      if (joint) return PIX.pick(RAMP, 0.2 + lift(y), x, y);
      return PIX.pick(BRICK, 0.15 + 0.5 * PIX.hash(Math.floor((x + (course % 2) * 3) / 6), course, s) * (0.5 + lift(y) * 2), x, y);
    },
    ribbed: function (x, y, s) {
      var rib = x % 8 === 0 ? 0.16 : x % 8 === 1 ? -0.06 : 0;
      return PIX.pick(RAMP, 0.28 + rib + 0.12 * PIX.noise2(x / 5, y / 30, s) + lift(y), x, y);
    }
  };

  function wall(x0, x1, top, bottom, material, seed) {
    for (var y = Math.max(0, top); y <= bottom; y++) for (var x = x0; x <= x1; x++) put(x, y, MATERIAL[material](x, y, seed));
  }
  // The slab at the foot of each floor: a lit lip over a shadow.
  function slabs(x0, x1, tops) {
    tops.forEach(function (y) { fill(x0, y, x1, y, C.nb4); fill(x0, y + 1, x1, y + 1, C.nb1); });
  }

  // Windows: dark glass, warm rooms with curtains, cool rooms behind blinds,
  // violet rooms with a plant, or a television's blue.
  var KINDS = ["dark", "dark", "warm", "warm", "warm", "cool", "cool", "violet", "tv"];
  function windowAt(x0, y0, w, h, seed) {
    var kind = KINDS[Math.floor(PIX.hash(x0, y0, seed) * KINDS.length)];
    fill(x0 - 1, y0 - 1, x0 + w, y0 + h, C.nb4);
    fill(x0 - 1, y0 - 1, x0 + w, y0 - 1, C.nb5);
    for (var y = y0; y < y0 + h; y++) {
      for (var x = x0; x < x0 + w; x++) {
        var u = x - x0, v = y - y0, c;
        if (kind === "dark") c = (u + v) % 7 === 0 && v < h - 2 ? C.nb3 : C.nb1;
        else if (kind === "warm") c = u < 2 || u >= w - 2 ? (u % 2 ? C.wa0 : C.wa1) : v < h / 2 ? C.wa2 : C.wa1;
        else if (kind === "cool") c = v % 2 ? C.wc0 : C.wc1;
        else if (kind === "violet") c = C.wm1;
        else c = C.wc0;
        put(x, y, c);
      }
    }
    if (kind === "violet") {
      // A pot plant on the sill.
      fill(x0 + 2, y0 + h - 3, x0 + 4, y0 + h - 1, C.wd1);
      [[1, -4], [2, -5], [3, -6], [4, -5], [5, -4], [3, -4], [2, -3], [4, -3]].forEach(function (p) {
        put(x0 + 2 + p[0] - 1, y0 + h + p[1], C.ng0);
      });
    }
    if (kind === "warm" && PIX.hash(x0, y0, seed + 1) < 0.4) {
      // Someone at the window.
      var px = x0 + 3 + Math.floor(PIX.hash(x0, y0, seed + 2) * (w - 6));
      put(px, y0 + h - 6, C.wa0); put(px + 1, y0 + h - 6, C.wa0);
      fill(px - 1, y0 + h - 4, px + 2, y0 + h - 1, C.wa0);
    }
    fill(x0 - 1, y0 + h + 1, x0 + w, y0 + h + 1, C.nb5);
    if (kind !== "dark") WINDOWS.push({ x0: x0, y0: y0, w: w, h: h, kind: kind });
  }

  function aircon(x0, y0) {
    fill(x0, y0, x0 + 7, y0 + 4, C.mt1);
    fill(x0, y0, x0 + 7, y0, C.mt2);
    [[5, 1], [4, 2], [6, 2], [5, 3]].forEach(function (p) { put(x0 + p[0], y0 + p[1], C.mt0); });
    for (var y = y0 + 1; y < y0 + 4; y++) put(x0 + 1, y, C.mt0), put(x0 + 2, y, C.mt0);
    put(x0 + 1, y0 + 5, C.mt0); put(x0 + 6, y0 + 5, C.mt0);
  }
  function pipe(x, y0, y1) {
    for (var y = y0; y <= y1; y++) {
      var joint = (y - y0) % 14 === 0;
      put(x, y, joint ? C.mt3 : C.mt2);
      put(x + 1, y, joint ? C.mt2 : C.mt1);
    }
  }
  function balcony(x0, x1, y) {
    for (var x = x0; x <= x1; x++) {
      put(x, y, C.mt2);
      if (x % 2 === 0) for (var yy = y + 1; yy <= y + 4; yy++) put(x, yy, C.mt1);
      put(x, y + 5, C.mt0);
      var r = PIX.hash(x, y, 91);
      if (r < 0.1) put(x, y - 1, C.ng1);
      else if (r > 0.86) for (var k = 1; k <= 3; k++) put(x, y - 3 - k + 3, [C.cr1, C.um1, C.cy1, C.ct2][Math.floor(PIX.hash(x, y, 92) * 4)]);
    }
    for (x = x0; x <= x1; x++) put(x, y - 5, C.nb0);
  }
  function floors(x0, x1, tops, cols, w, seed) {
    tops.forEach(function (top) {
      cols.forEach(function (cx) {
        var y0 = top + 6;
        if (!free(cx - 1, y0 - 1, cx + w, y0 + 12)) return;
        windowAt(cx, y0, w, 11, seed);
        if (PIX.hash(cx, top, seed + 5) < 0.45 && free(cx, y0 + 13, cx + 7, y0 + 18)) aircon(cx + 1, y0 + 13);
      });
    });
  }

  // Keep the sign spots clear before the windows go in.
  KEEP_OUT.push([3, 6, 54, 46], [37, 148, 53, 166], [92, 55, 109, 102], [376, 32, 393, 79],
    [427, 120, 479, 133], [434, 144, 470, 162], [456, 182, 472, 198]);

  function tallLeft() {
    // A: grey concrete, its top floors behind a giant screen.
    wall(0, 55, 0, 199, "concrete", 101);
    slabs(0, 55, [50, 74, 98, 122, 146, 170, 194]);
    floors(0, 55, [50, 74, 98, 122, 146, 170], [5, 21], 9, 102);
    pipe(33, 0, 199);
    // B: tiled, a storey lower, with a rooftop tank and mast.
    wall(56, 109, 30, 199, "tiles", 103);
    fill(56, 30, 109, 30, C.nb5);
    fill(56, 31, 109, 32, C.nb3);
    slabs(56, 109, [54, 78, 102, 126, 150, 174, 194]);
    floors(56, 109, [54, 78, 102, 126, 150, 174], [60, 76], 10, 104);
    balcony(58, 90, 126);
    for (var y = 0; y < 200; y++) { put(109, y, y > 30 ? C.nb6 : PIX.lget(NEAR, 109, y)); put(108, y, y > 30 ? C.nb5 : PIX.lget(NEAR, 108, y)); }
    for (y = 18; y < 30; y++) for (var x = 60; x < 72; x++) put(x, y, x === 61 ? C.mt2 : (y - 18) % 4 === 0 ? C.mt2 : C.mt1);
    fill(62, 15, 69, 17, C.mt1);
    for (y = 8; y < 30; y++) put(88, y, C.mt1);
    fill(85, 12, 91, 12, C.mt1);
    for (var dx = -3; dx <= 3; dx++) put(78 + dx, 25 + Math.round(dx * dx / 3), C.mt2);
  }

  function tallRight() {
    // C: old brick, a mast on the roof.
    wall(374, 425, 14, 199, "brick", 105);
    fill(374, 14, 425, 14, C.nb5);
    slabs(374, 425, [38, 62, 86, 110, 134, 158, 182, 194]);
    floors(374, 425, [38, 62, 86, 110, 134, 158, 176], [397, 412], 9, 106);
    for (var y = 0; y < 14; y++) put(410, y, C.mt1);
    fill(407, 5, 413, 5, C.mt1);
    for (y = 3; y < 14; y++) for (var x = 382; x < 393; x++) put(x, y, x === 383 ? C.mt2 : (y - 3) % 4 === 0 ? C.mt2 : C.mt1);
    for (y = 15; y < 200; y++) { put(374, y, C.nb6); put(375, y, C.nb5); }
    // D: ribbed concrete to the top of the frame.
    wall(426, 479, 0, 199, "ribbed", 107);
    slabs(426, 479, [14, 38, 62, 86, 110, 134, 158, 182, 194]);
    floors(426, 479, [14, 38, 62, 86, 110, 134, 158], [432, 449, 466], 9, 108);
    pipe(446, 0, 199);
    balcony(430, 476, 86);
  }

  function lowMiddle() {
    var top = GEO.roof;
    wall(110, 373, top, 199, "concrete", 109);
    fill(110, top, 373, top, C.nb6);
    fill(110, top + 1, 373, top + 1, C.nb5);
    fill(110, top + 2, 373, top + 2, C.nb2);
    fill(110, 196, 373, 196, C.nb4);
    fill(110, 197, 373, 199, C.nb1);
    [116, 134, 152, 214, 232, 280, 298, 318, 336, 354].forEach(function (x) {
      windowAt(x, 174, 11, 13, 110);
      if (PIX.hash(x, 5, 111) < 0.35) aircon(x + 2, 189);
    });
    balcony(170, 208, 184);
    // A bicycle leaning on the balcony rail.
    [[0, 0], [1, -1], [2, -1], [3, 0], [2, 1], [1, 1], [6, 0], [7, -1], [8, -1], [9, 0], [8, 1], [7, 1],
      [2, -2], [3, -3], [4, -3], [5, -2], [6, -3], [7, -3]].forEach(function (p) { put(190 + p[0], 192 + p[1], C.mt3); });
    fill(250, 176, 271, 190, C.nb2);
    aircon(251, 177); aircon(262, 177); aircon(251, 184); aircon(262, 184);
    pipe(246, top + 3, 199);
    pipe(312, top + 3, 199);
    // The roof: a tank on legs, air conditioners, a dish, a mast, washing on a line.
    for (var y = 152; y < 162; y++) for (var x = 124; x < 136; x++) put(x, y, x === 125 ? C.mt2 : (y - 152) % 3 === 0 ? C.mt2 : C.mt1);
    fill(126, 149, 133, 151, C.mt1);
    [125, 130, 135].forEach(function (lx) { fill(lx, 162, lx, top - 1, C.mt0); });
    aircon(146, 160); aircon(156, 160);
    for (var dx = -4; dx <= 4; dx++) put(218 + dx, 157 + Math.round(dx * dx / 4), C.mt2);
    fill(218, 158, 218, top - 1, C.mt1);
    fill(232, 138, 232, top - 1, C.mt1);
    fill(229, 144, 235, 144, C.mt1);
    fill(229, 150, 235, 150, C.mt1);
    for (x = 252; x <= 292; x++) put(x, 156 + Math.round(3 * Math.sin(((x - 252) / 40) * Math.PI)), C.nb1);
    fill(252, 156, 252, top - 1, C.mt1);
    fill(292, 156, 292, top - 1, C.mt1);
    [[258, C.cr1], [266, C.um2], [274, C.cy1], [283, C.wm1]].forEach(function (s) {
      var sy = 157 + Math.round(3 * Math.sin(((s[0] - 252) / 40) * Math.PI));
      fill(s[0], sy + 1, s[0] + 4, sy + 4, s[1]);
      put(s[0], sy + 5, s[1]); put(s[0] + 4, sy + 5, s[1]);
    });
    // A pigeon loft.
    fill(334, 154, 352, top - 1, C.wd0);
    fill(333, 152, 353, 153, C.wd1);
    for (x = 336; x < 351; x += 2) for (y = 156; y < top - 1; y++) if (y % 2) put(x, y, C.wd1);
  }

  // Cables slung across the gap; y at each end and how far they sag.
  var CABLES = [[46, 40, 12], [58, 64, 16], [90, 84, 10], [104, 112, 8], [124, 130, 9]];
  function cableY(k, x) {
    var c = CABLES[k], u = (x - 110) / 264;
    return c[0] + (c[1] - c[0]) * u + c[2] * 4 * u * (1 - u);
  }
  function cables() {
    CABLES.forEach(function (c, k) {
      for (var x = 110; x < 374; x++) put(x, Math.round(cableY(k, x)), k % 2 ? C.nb0 : C.nb1);
    });
  }

  // Televisions flicker blue; now and then someone switches a light off.
  function drawNear(f, t) {
    WINDOWS.forEach(function (w, k) {
      var glass;
      if (w.kind === "tv") glass = [C.wc0, C.wc1, C.wc2, C.wc1][Math.floor(PIX.hash(k, Math.floor(t * 6), 95) * 4)];
      else if (PIX.hash(k, 0, 93) < 0.3 && PIX.hash(k, Math.floor((t + k * 3.1) / 7), 94) > 0.7) glass = C.nb1;
      else return;
      for (var y = w.y0; y < w.y0 + w.h; y++) f.fill(glass, y * W + w.x0, y * W + w.x0 + w.w);
    });
  }

  tallLeft();
  tallRight();
  lowMiddle();
  cables();

  NEON.NEAR = NEAR;
  NEON.NEAR_WINDOWS = WINDOWS;
  NEON.drawNear = drawNear;
  NEON.cableY = cableY;
  NEON.nearPut = put;
  NEON.nearFill = fill;
  NEON.nearWall = wall;
})(S);
// pixel-neon-rain/src/cables.js
// What hangs from the cables strung across the gap: a row of red paper
// lanterns that sway in the wind, and a string of bulbs that twinkle.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H, C = PIX.C;

  var LANTERN_XS = [138, 152, 166, 180, 318, 332, 346];
  function lanterns(t) {
    return LANTERN_XS.map(function (x0, k) {
      var sway = Math.sin(t * 1.4 + k * 0.9) + 0.5 * Math.sin(t * 3.1 + k * 2.3);
      var x = x0 + Math.round(sway * 0.8);
      return { x: x, y: Math.round(NEON.cableY(2, x0)) + 3, lean: Math.round(sway * 0.5) };
    });
  }

  // A lantern: a dark cap, a red belly lit from inside with a bright band
  // round the middle, and a dark foot with a tassel.
  var SHAPE = [
    ".kkk.",
    "rRRRr",
    "RLLLR",
    "rRRRr",
    ".kkk.",
    "..t.."
  ];
  var INK = { k: C.nb0, r: C.nr1, R: C.nr2, L: C.nr3, t: C.nr1 };

  function plot(f, x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c; }

  function drawLantern(f, l) {
    // The string from the cable, bending with the lantern.
    plot(f, l.x - l.lean, l.y - 2, C.nb0);
    plot(f, l.x, l.y - 1, C.nb0);
    for (var y = l.y - 2; y <= l.y + 6; y++) {
      for (var x = l.x - 4; x <= l.x + 4; x++) {
        var d = Math.hypot(x - l.x, (y - l.y - 2) * 1.2);
        if (d > 2.4 && d < 4.6 && x >= 0 && x < W && PIX.dith(x, y, 0.55 - (d - 2.4) * 0.2)) f[y * W + x] = NEON.GLOW.r[f[y * W + x]];
      }
    }
    SHAPE.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) if (row[c] !== ".") plot(f, l.x - 2 + c, l.y + r, INK[row[c]]);
    });
  }

  // Bulbs every few pixels along cable 3, each in its own colour, each
  // blinking on its own slow rhythm.
  var BULB_COLOURS = PIX.names(["wa3", "ny2", "np3", "nc3", "ng2"]);
  var BULBS = [];
  for (var bx = 114; bx < 372; bx += 6) BULBS.push(bx);
  function bulbs(t) {
    return BULBS.map(function (x, k) {
      var rate = 0.6 + 1.2 * PIX.hash(k, 1, 360), phase = PIX.hash(k, 2, 360);
      var on = PIX.hash(k, Math.floor(t * rate + phase), 361) > 0.3;
      return { x: x, y: Math.round(NEON.cableY(3, x)) + 1, on: on, c: BULB_COLOURS[k % BULB_COLOURS.length] };
    });
  }
  function drawBulbs(f, t) {
    bulbs(t).forEach(function (q) {
      if (!q.on) { plot(f, q.x, q.y, C.nb3); return; }
      plot(f, q.x, q.y, q.c);
      [[-1, 0], [1, 0], [0, 1]].forEach(function (d) {
        var x = q.x + d[0], y = q.y + d[1];
        if (x >= 0 && x < W && PIX.dith(x, y, 0.5)) f[y * W + x] = NEON.LIGHT[f[y * W + x]];
      });
    });
  }

  function drawCables(f, t) {
    lanterns(t).forEach(function (l) { drawLantern(f, l); });
    drawBulbs(f, t);
  }

  NEON.lanterns = lanterns;
  NEON.bulbs = bulbs;
  NEON.drawCables = drawCables;
})(S);
// pixel-neon-rain/src/signs.js
// The signs on the near buildings: blade signs for ramen and karaoke, a sake
// box, a bar sign with a failing letter, a pharmacy cross, an LED ticker with
// the news of the night, and a giant screen eye that watches the street.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, FONT = G.FONT, W = PIX.W, H = PIX.H, C = PIX.C;
  var put = NEON.nearPut, fill = NEON.nearFill, NEAR = NEON.NEAR;
  var SIGNS = [];

  // A dark board in a thin steel frame, bolted to the wall with brackets.
  function board(x0, y0, x1, y1, bracket) {
    fill(x0, y0, x1, y1, C.nb0);
    for (var x = x0; x <= x1; x++) { put(x, y0, C.mt1); put(x, y1, C.mt1); }
    for (var y = y0; y <= y1; y++) { put(x0, y, C.mt1); put(x1, y, C.mt1); }
    [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(function (p) { put(p[0], p[1], C.mt2); });
    if (bracket) [y0 + 3, y1 - 3].forEach(function (by) { put(bracket, by, C.mt2); put(bracket + (bracket < x0 ? 1 : -1), by, C.mt1); });
  }
  function add(name, hue, draw, lit, wash) {
    var s = NEON.sign(hue, draw);
    s.name = name;
    s.lit = lit || function () { return function () { return true; }; };
    if (wash) NEON.washSign(NEAR, s, wash);
    SIGNS.push(s);
    return s;
  }

  board(94, 57, 107, 100, 92);
  add("ramen", "p", function (p) { FONT.vtext(p, "ラーメン", 97, 60, FONT.KANA, 3); }, null, 6);

  board(377, 33, 390, 78, 392);
  add("karaoke", "c", function (p) { FONT.vtext(p, "カラオケ", 380, 36, FONT.KANA, 3); }, function (t) {
    var on = NEON.stutter(t, 1, 5.3, 0.75);
    return function () { return on; };
  }, 5);

  board(38, 149, 52, 165, 36);
  add("sake", "a", function (p) { FONT.text(p, "酒", 41, 153, FONT.KANJI); }, null, 5);

  // BAR, with a cocktail glass; the A is on its way out.
  board(435, 145, 469, 161);
  add("bar", "r", function (p) {
    // A martini glass: a wide rim, the bowl's two walls closing to a point,
    // the stem and the foot, and a cocktail pick leaning out of it.
    var glass = [
      "      #",
      "     # ",
      "#######",
      " #   # ",
      "  # #  ",
      "   #   ",
      "   #   ",
      "   #   ",
      " ##### "
    ];
    glass.forEach(function (row, dy) {
      for (var dx = 0; dx < row.length; dx++) if (row[dx] !== " ") p(437 + dx, 148 + dy, 3);
    });
    FONT.text(p, "BAR", 447, 150, FONT.BIG, 2);
  }, function (t) {
    var a = NEON.stutter(t, 2, 3.1, 0.95) && PIX.hash(Math.floor(t / 1.6), 3, 4) > 0.15;
    return function (g) { return g !== 1 || a; };
  }, 5);

  // The pharmacy cross breathes: whole, then just its outline.
  board(457, 183, 471, 197);
  add("pharmacy", "g", function (p) {
    for (var dy = -4; dy <= 4; dy++) {
      for (var dx = -4; dx <= 4; dx++) {
        var arm = (Math.abs(dx) <= 1 && Math.abs(dy) <= 4) || (Math.abs(dy) <= 1 && Math.abs(dx) <= 4);
        if (!arm) continue;
        var inner = (Math.abs(dx) < 1 && Math.abs(dy) < 4) || (Math.abs(dy) < 1 && Math.abs(dx) < 4);
        p(464 + dx, 190 + dy, inner ? 1 : 0);
      }
    }
  }, function (t) {
    var full = PIX.mod(t, 2) < 1.3;
    return function (g) { return g === 0 || full; };
  }, 4);

  // The ticker: amber LEDs on a dark matrix, scrolling right to left.
  var TICKER = { x0: 429, x1: 478, y0: 123, text: "SELAMAT MALAM DISTRIK 9 + HUJAN ASAM 80% + MAGLEV JALUR 3 TEPAT WAKTU + RAMEN 24 JAM + " };
  board(427, 121, 479, 131);
  for (var ty = 122; ty <= 130; ty++) for (var tx = 428; tx <= 478; tx++) put(tx, ty, (tx + ty) % 2 ? C.nb0 : C.na0);
  var TICKER_W = FONT.width(TICKER.text, FONT.TINY, 1) + 1;
  function drawTicker(f, t) {
    var off = Math.floor(t * 16);
    FONT.text(function (x, y) {
      var sx = x - PIX.mod(off, TICKER_W);
      for (var k = 0; k < 2; k++) {
        var xx = sx + k * TICKER_W;
        if (xx >= TICKER.x0 && xx <= TICKER.x1) f[y * W + xx] = xx > TICKER.x1 - 3 ? C.na4 : C.na3;
      }
    }, TICKER.text, TICKER.x0, TICKER.y0 + 1, FONT.TINY, 1);
  }

  // The eye: a screen high on the left building, looking about and blinking.
  var EYE = { x0: 5, y0: 8, x1: 52, y1: 44 };
  board(3, 6, 54, 46);
  for (var sy = 47; sy < 50; sy++) { put(10, sy, C.mt1); put(47, sy, C.mt1); }
  var GAZES = [-7, 2, 7, -3, 0, 5, -6];
  function gaze(t) {
    var k = Math.floor(t / 1.7), s = Math.min(1, (t - k * 1.7) / 0.15);
    var a = GAZES[PIX.mod(k - 1, GAZES.length)], b = GAZES[PIX.mod(k, GAZES.length)];
    return a + (b - a) * s;
  }
  function lid(t) {
    var s = PIX.mod(t, 6.5);
    return s < 0.08 ? s / 0.08 : s < 0.2 ? 1 - (s - 0.08) / 0.12 : 0;
  }
  function drawEye(f, t) {
    var cx = 28, cy = 25, rx = 21, gx = cx + gaze(t), close = lid(t);
    var skin = PIX.names(["skn0", "skn1", "skn2"]);
    for (var y = EYE.y0; y <= EYE.y1; y++) {
      for (var x = EYE.x0; x <= EYE.x1; x++) {
        var u = (x - cx) / rx, open = 1 - u * u, c;
        var upper = cy - 11 * open, lower = cy + 8 * open;
        upper += (lower - upper) * close;
        var brow = Math.abs(y - (cy - 15 + 6 * u * u)) < 1.5 && Math.abs(u) < 0.9;
        if (open > 0 && y > upper && y < lower) {
          var d = Math.hypot(x - gx, (y - cy - 1) * 1.1);
          if (d < 3.5) c = C.nb0;
          else if (d < 8) c = d > 7 ? C.nc1 : PIX.hash(Math.round(Math.atan2(y - cy, x - gx) * 6), 0, 9) < 0.35 ? C.nc3 : C.nc2;
          else c = open < 0.35 || y > lower - 2 ? C.st3 : C.np4;
          if (Math.abs(x - gx + 2) < 1 && Math.abs(y - cy + 2) < 1) c = C.hl0;
        } else if (open > 0 && Math.abs(y - upper) < 1.2) c = C.hr0;
        else if (brow) c = C.hr0;
        else c = PIX.pick(skin, 0.75 - Math.abs(u) * 0.4 - (y < cy ? 0 : 0.2), x, y);
        f[y * W + x] = c;
      }
    }
    FONT.text(function (x, y) { f[y * W + x] = C.np3; }, "MATA KOTA", 11, 38, FONT.TINY, 1);
    var band = EYE.y0 + Math.floor(PIX.mod(t * 9, EYE.y1 - EYE.y0 + 1));
    for (var bx = EYE.x0; bx <= EYE.x1; bx++) f[band * W + bx] = NEON.WET[f[band * W + bx]];
  }

  function drawSigns(f, t) {
    SIGNS.forEach(function (s) { NEON.drawSign(f, s, s.lit(t)); });
    drawTicker(f, t);
    drawEye(f, t);
  }

  NEON.SIGNS = SIGNS;
  NEON.TICKER = TICKER;
  NEON.EYE = EYE;
  NEON.gaze = gaze;
  NEON.lid = lid;
  NEON.drawSigns = drawSigns;
})(S);
// pixel-neon-rain/src/shops.js
// The shopfronts along the street: a ramen counter with its cook, pot and red
// lantern, a bright 24-hour konbini, a stairwell, a shuttered shop with
// graffiti, a KOPI cafe with a lucky cat, a TV repair shop, two vending
// machines, an arcade and a pharmacy. Also the street lamp in front, and the
// steam that drifts off the ramen pot and out of a manhole in the road.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, FONT = G.FONT, W = PIX.W, H = PIX.H, C = PIX.C;
  var put = NEON.nearPut, fill = NEON.nearFill, NEAR = NEON.NEAR;
  var FRONT = PIX.layer();
  var SIGNS = [];
  var SHOPS = { cook: [36, 204, 50, 218], cat: [241, 214, 249, 224], tvs: [308, 210, 370, 224], arcade: [407, 209, 441, 225] };

  // Paints a sprite of characters through a colour map; '.' is transparent.
  function stamp(set, rows, map, x0, y0, flip) {
    rows.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) {
        var ch = row[c];
        if (ch === ".") continue;
        set(flip ? x0 + row.length - 1 - c : x0 + c, y0 + r, map[ch]);
      }
    });
  }
  function band(x0, x1) {
    fill(x0, 198, x1, 207, C.nb0);
    for (var x = x0; x <= x1; x++) { put(x, 198, C.mt1); put(x, 207, C.mt1); }
    for (var y = 198; y <= 207; y++) { put(x0, y, C.mt1); put(x1, y, C.mt1); }
  }
  function glass(x0, x1, y0, y1) {
    for (var x = x0; x <= x1; x++) { put(x, y0, C.mt1); put(x, y1, C.mt2); }
    for (var y = y0; y <= y1; y++) { put(x0, y, C.mt1); put(x1, y, C.mt1); }
  }
  function sign(hue, draw, lit, wash) {
    var s = NEON.sign(hue, draw);
    s.lit = lit || function () { return function () { return true; }; };
    if (wash) NEON.washSign(NEAR, s, wash);
    SIGNS.push(s);
  }

  // The foot of every building, before the shops go in.
  function walls() {
    NEON.nearWall(0, 55, 200, 225, "concrete", 101);
    NEON.nearWall(56, 109, 200, 225, "tiles", 103);
    NEON.nearWall(110, 373, 200, 225, "concrete", 109);
    NEON.nearWall(374, 425, 200, 225, "brick", 105);
    NEON.nearWall(426, 479, 200, 225, "ribbed", 107);
    fill(0, 225, 479, 225, C.nb0);
  }

  function ramen() {
    for (var x = 0; x <= 109; x++) {
      put(x, 196, C.ru2);
      put(x, 197, x % 4 === 0 ? C.ru0 : C.ru1);
      put(x, 198, x % 4 === 0 ? C.ru0 : C.ru1);
      put(x, 199, C.wd0);
    }
    for (var y = 200; y <= 217; y++) for (x = 6; x <= 58; x++) put(x, y, y < 206 ? C.wa2 : y === 206 && PIX.dith(x, y, 0.5) ? C.wa2 : C.wa1);
    fill(8, 205, 56, 205, C.wd1);
    for (x = 26; x <= 54; x += 5) { put(x, 204, C.st3); put(x + 1, 204, C.st3); put(x + 2, 204, C.st2); put(x, 203, C.um2); put(x + 1, 203, C.um2); }
    // The stockpot on its burner.
    fill(10, 211, 18, 217, C.mt2);
    fill(10, 211, 18, 211, C.mt3);
    fill(9, 212, 9, 213, C.mt1); fill(19, 212, 19, 213, C.mt1);
    for (x = 11; x <= 17; x++) put(x, 214, C.mt1);
    // The counter, stools, and a customer bent over a bowl.
    fill(6, 218, 60, 218, C.wd2);
    fill(6, 219, 60, 219, C.wd1);
    for (y = 220; y <= 224; y++) for (x = 6; x <= 60; x++) put(x, y, x % 7 === 0 ? C.wd1 : C.wd0);
    [20, 34, 48].forEach(function (sx) { fill(sx - 1, 221, sx + 1, 221, C.mt2); fill(sx, 222, sx, 224, C.mt1); });
    stamp(put, [
      "..hh..",
      ".hhhh.",
      ".hhhhc",
      "cccccc",
      "cccccc",
      "cccccc",
      ".cccc.",
      ".cccc.",
      ".cccc.",
      "..cc..",
      "..cc.."
    ], { h: C.hr0, c: C.ct1 }, 31, 210);
    // Three red noren panels hanging over the opening.
    for (x = 6; x <= 58; x++) {
      if ((x - 6) % 18 === 17) continue;
      for (y = 200; y <= 207; y++) put(x, y, y === 200 ? C.nr2 : y === 207 ? C.nr0 : C.nr1);
    }
    [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { put(32 + p[0], 203 + p[1], C.np4); });
    // A menu board and a ticket machine.
    fill(66, 203, 88, 215, C.wd0);
    for (x = 66; x <= 88; x++) { put(x, 203, C.wd1); put(x, 215, C.wd1); }
    FONT.text(function (px, py) { put(px, py, C.wa3); }, "MENU", 70, 205, FONT.TINY, 1);
    for (y = 211; y <= 213; y += 2) for (x = 68; x <= 86; x++) if (PIX.hash(x, y, 120) < 0.6) put(x, y, x > 81 ? C.wa2 : C.st2);
    fill(94, 204, 103, 225, C.mt1);
    fill(94, 204, 103, 204, C.mt2);
    fill(96, 206, 101, 212, C.um2);
    fill(96, 221, 101, 224, C.nb0);
    fill(100, 215, 101, 218, C.mt2);
  }

  function konbini() {
    band(112, 176);
    sign("c", function (p) { FONT.text(p, "24H", 117, 200, FONT.BIG, 2); }, null, 4);
    FONT.text(function (px, py) { put(px, py, C.um2); }, "MART", 150, 201, FONT.TINY, 1);
    for (var y = 208; y <= 225; y++) {
      for (var x = 112; x <= 176; x++) put(x, y, y <= 209 ? C.hl0 : PIX.pick([C.um2, C.um1], (y - 210) / 16, x, y));
    }
    [213, 218].forEach(function (sy) {
      for (var x = 114; x <= 158; x++) {
        put(x, sy, C.mt2);
        var r = PIX.hash(x, sy, 121);
        if (r < 0.8) put(x, sy - 1, [C.nr2, C.ny2, C.ng2, C.nc2, C.np2, C.na2, C.pb2][Math.floor(PIX.hash(x, sy, 122) * 7)]);
        if (r < 0.5) put(x, sy - 2, [C.nr1, C.ny1, C.ng1, C.nc1, C.np1][Math.floor(PIX.hash(x, sy, 123) * 5)]);
      }
    });
    fill(160, 217, 166, 219, C.mt2);
    fill(161, 216, 163, 216, C.nc2);
    stamp(put, [".nn.", ".ss.", ".ss.", "gggg", "gggg", "gggg", "gggg", ".gg."], { n: C.nc1, s: C.skn2, g: C.ng1 }, 168, 211);
    stamp(put, [".h.", "hhh", "sss", "ccc", "ccc", "ccc", "ccc", "c.c", "c.c", "c.c"], { h: C.hr0, s: C.skn1, c: C.ct2 }, 124, 214);
    glass(112, 176, 208, 225);
    [132, 156].forEach(function (mx) { fill(mx, 208, mx, 225, C.mt1); });
  }

  function stairs() {
    fill(178, 203, 196, 203, C.nb5);
    fill(178, 203, 178, 225, C.nb5);
    fill(196, 203, 196, 225, C.nb5);
    for (var y = 204; y <= 225; y++) for (var x = 179; x <= 195; x++) {
      var step = (x - 179) - Math.floor((225 - y) * 0.8);
      put(x, y, step >= 0 && step % 3 === 0 ? C.nb3 : PIX.dith(x, y, (225 - y) / 30) ? C.wa0 : C.nb1);
    }
    put(187, 205, C.wa3);
    put(186, 205, C.wa1); put(188, 205, C.wa1); put(187, 206, C.wa1);
    fill(172, 212, 173, 216, C.mt2);
    put(172, 213, C.ng2);
  }

  function shutter() {
    fill(198, 199, 234, 203, C.mt1);
    fill(198, 199, 234, 199, C.mt2);
    for (var y = 204; y <= 225; y++) for (var x = 198; x <= 234; x++) put(x, y, (y - 204) % 3 === 2 ? C.mt0 : y % 3 === 0 ? C.mt2 : C.mt1);
    fill(198, 225, 234, 225, C.mt2);
    // A pink tag with drips, a cyan star, and a torn poster.
    for (x = 204; x <= 228; x++) {
      var ty = Math.round(215 + 4 * Math.sin((x - 204) / 3.2));
      put(x, ty, C.np2);
      if (PIX.dith(x, ty, 0.6)) put(x, ty + 1, C.np1);
      if (PIX.hash(x, 1, 124) < 0.12) for (var d = 2; d < 2 + Math.floor(PIX.hash(x, 2, 124) * 5); d++) put(x, ty + d, C.np1);
    }
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 2], [-2, -2], [2, -2], [-2, 2]].forEach(function (p) { put(226 + p[0], 209 + p[1], C.nc2); });
    fill(200, 206, 205, 213, C.wa1);
    for (y = 207; y <= 212; y += 2) fill(201, y, 204, y, C.wa0);
  }

  function cafe() {
    band(238, 304);
    sign("y", function (p) {
      [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [1, 4], [6, 4], [7, 4], [8, 5], [1, 5], [6, 5], [7, 6],
        [1, 6], [6, 6], [2, 7], [3, 7], [4, 7], [5, 7], [2, 1], [3, 2], [4, 1], [5, 2]].forEach(function (q) {
        p(243 + q[0], 199 + q[1], 1);
      });
      FONT.text(p, "KOPI", 257, 200, FONT.BIG, 2);
    }, null, 5);
    for (var y = 208; y <= 225; y++) for (var x = 240; x <= 286; x++) put(x, y, y < 214 ? C.wa2 : y === 214 && PIX.dith(x, y, 0.5) ? C.wa2 : C.wa1);
    fill(262, 211, 270, 216, C.mt2);
    fill(262, 211, 270, 211, C.mt3);
    put(268, 213, C.nr2);
    fill(264, 217, 265, 217, C.st3);
    [248, 256, 280].forEach(function (lx) { fill(lx, 208, lx, 210, C.wd0); put(lx, 211, C.wa3); });
    stamp(put, ["..hhh.", ".hhhhh", ".hssss", "..ssss", "..sss.", ".cccc.", "cccccm", "cccccm"], { h: C.hr0, s: C.skn2, c: C.cr1, m: C.st3 }, 250, 211);
    stamp(put, [".hhh..", "hhhhh.", "hssssh", "ssss..", ".sss..", ".cccc.", "cccccc", "cccccc"], { h: C.wd0, s: C.skn1, c: C.ct2 }, 273, 211);
    fill(240, 219, 286, 219, C.wd2);
    fill(240, 220, 286, 224, C.wd0);
    glass(238, 287, 208, 225);
    fill(288, 208, 304, 225, C.mt1);
    for (y = 210; y <= 225; y++) for (x = 290; x <= 302; x++) put(x, y, PIX.pick([C.wa1, C.wa0], (y - 210) / 16, x, y));
    fill(290, 211, 302, 217, C.nb0);
    FONT.text(function (px, py) { put(px, py, C.ng2); }, "BUKA", 289, 212, FONT.TINY, 0);
    put(292, 219, C.mt3); put(292, 220, C.mt3);
  }

  function repair() {
    band(306, 372);
    FONT.text(function (px, py) { put(px, py, C.ng2); }, "SERVIS TV + HP", 312, 201, FONT.TINY, 1);
    fill(306, 208, 372, 225, C.nb1);
    glass(306, 372, 208, 225);
    for (var k = 0; k < 14; k++) {
      var tx = 309 + (k % 7) * 9, ty = 211 + Math.floor(k / 7) * 7;
      fill(tx - 1, ty - 1, tx + 5, ty + 3, C.mt1);
      fill(tx - 1, ty + 4, tx + 5, ty + 4, C.mt0);
    }
    fill(310, 224, 368, 224, C.wd1);
    fill(340, 208, 340, 209, C.mt0);
  }

  function vending() {
    [[378, C.nr1, C.nr2], [391, C.pb1, C.pb2]].forEach(function (m, k) {
      var x0 = m[0];
      fill(x0, 201, x0 + 11, 225, m[1]);
      fill(x0, 201, x0, 225, m[2]);
      fill(x0, 201, x0 + 11, 201, C.mt2);
      fill(x0 + 2, 203, x0 + 9, 214, C.um2);
      [205, 209, 213].forEach(function (ry) {
        for (var x = x0 + 3; x <= x0 + 8; x += 2) {
          var c = [C.nr2, C.ng2, C.ny2, C.nc2, C.na2, C.np2][Math.floor(PIX.hash(x, ry, 130 + k) * 6)];
          put(x, ry - 1, c); put(x, ry, c);
        }
      });
      fill(x0 + 8, 216, x0 + 9, 219, C.mt2);
      fill(x0 + 2, 221, x0 + 8, 224, C.nb0);
    });
  }

  function arcade() {
    band(406, 442);
    FONT.text(function (px, py) { put(px, py, C.ny2); }, "ARCADE", 413, 201, FONT.TINY, 1);
    fill(406, 208, 442, 225, C.nb0);
    for (var x = 407; x <= 441; x += 2) for (var y = 209; y <= 225; y++) put(x, y, C.nb2);
    glass(406, 442, 208, 225);
  }

  function pharmacy() {
    fill(444, 198, 479, 207, C.um2);
    fill(444, 198, 479, 198, C.mt2);
    FONT.text(function (px, py) { put(px, py, C.ng1); }, "APOTEK", 450, 201, FONT.TINY, 1);
    for (var y = 208; y <= 225; y++) for (var x = 444; x <= 479; x++) put(x, y, PIX.pick([C.hl0, C.um2, C.um1], (y - 208) / 18, x, y));
    [213, 218].forEach(function (sy) {
      for (var x = 446; x <= 466; x++) {
        put(x, sy, C.mt2);
        if (PIX.hash(x, sy, 140) < 0.7) put(x, sy - 1, [C.ng1, C.um1, C.nr1, C.wc1, C.st3][Math.floor(PIX.hash(x, sy, 141) * 5)]);
      }
    });
    stamp(put, [".hh.", ".ss.", "wwww", "wwww", "wwww", "wwww"], { h: C.hr0, s: C.skn1, w: C.st3 }, 471, 212);
    fill(468, 218, 479, 218, C.mt2);
    glass(444, 479, 208, 225);
  }

  // The street lamp stands at the front of the pavement, in front of everyone.
  var LAMP = { x: 236, head: 162, base: 239 };
  function lamp() {
    for (var y = LAMP.head; y <= LAMP.base; y++) { PIX.lset(FRONT, LAMP.x, y, C.mt1); PIX.lset(FRONT, LAMP.x + 1, y, C.mt0); }
    for (var x = LAMP.x - 1; x <= LAMP.x + 2; x++) { PIX.lset(FRONT, x, LAMP.base, C.mt2); PIX.lset(FRONT, x, LAMP.base - 1, C.mt1); }
    for (x = LAMP.x; x <= LAMP.x + 9; x++) PIX.lset(FRONT, x, LAMP.head - (x < LAMP.x + 3 ? x - LAMP.x : 3), C.mt1);
    for (x = LAMP.x + 7; x <= LAMP.x + 13; x++) PIX.lset(FRONT, x, LAMP.head - 3, C.mt2);
    for (x = LAMP.x + 8; x <= LAMP.x + 12; x++) PIX.lset(FRONT, x, LAMP.head - 2, x === LAMP.x + 10 ? C.hl0 : C.nc4);
  }

  walls();
  ramen();
  konbini();
  stairs();
  shutter();
  cafe();
  repair();
  vending();
  arcade();
  pharmacy();
  lamp();

  // Steam: puffs that rise, spread and fade, each a pure function of time.
  var SOURCES = {
    pot: { x: 14, y: 209, n: 10, life: 2.6, rise: 7, drift: 6, spread: 2 },
    manhole: { x: 330, y: 257, n: 14, life: 3.4, rise: 10, drift: 9, spread: 5 }
  };
  function steam(t) {
    var out = [];
    Object.keys(SOURCES).forEach(function (name, si) {
      var s = SOURCES[name];
      for (var k = 0; k < s.n; k++) {
        var shift = (k / s.n) * s.life, age = PIX.mod(t + shift, s.life), gen = Math.floor((t + shift) / s.life);
        var seed = PIX.hash(k, gen, 150 + si);
        out.push({
          id: name + k, source: name, age: age, life: s.life,
          x: s.x + (seed - 0.5) * 2 * s.spread + s.drift * (age / s.life) * (0.5 + seed) + Math.sin(age * 2 + k) * 1.2,
          y: s.y - s.rise * age - 0.6 * age * age,
          r: 1 + 3 * (age / s.life)
        });
      }
    });
    return out;
  }
  function drawSteam(f, t, source) {
    steam(t).forEach(function (p) {
      if (p.source !== source) return;
      var fade = 1 - p.age / p.life, r = p.r;
      for (var y = Math.floor(p.y - r); y <= Math.ceil(p.y + r); y++) {
        for (var x = Math.floor(p.x - r); x <= Math.ceil(p.x + r); x++) {
          if (x < 0 || x >= W || y < 0 || y >= H) continue;
          var d = Math.hypot(x - p.x, y - p.y) / r;
          if (d > 1) continue;
          var a = fade * (1 - d);
          if (!PIX.dith(x, y, a * 1.3)) continue;
          var i = y * W + x;
          f[i] = a > 0.55 ? C.st3 : a > 0.35 ? C.st2 : NEON.LIGHT[f[i]];
        }
      }
    });
  }

  function drawCook(f, t) {
    var ladle = PIX.mod(t, 1.2) < 0.6, bob = PIX.mod(t, 2.4) < 1.2 ? 0 : 1;
    stamp(function (x, y, c) { f[y * W + x] = c; }, [
      "..ww..",
      ".wwww.",
      ".hssh.",
      "..ss..",
      ".jjjj.",
      "jjjjjj",
      "jjjjjj",
      ".jjjj.",
      ".jjjj.",
      ".jjjj.",
      ".jjjj.",
      ".jjjj.",
      ".jjjj."
    ], { w: C.hl0, h: C.hr0, s: C.skn2, j: C.st3 }, 40, 205 + bob);
    // His arm swings the ladle between the pot and a bowl.
    var hand = ladle ? [37, 210] : [38, 214];
    [[39, 210 + bob], [38, 211 + bob], hand].forEach(function (p) { f[p[1] * W + p[0]] = C.st3; });
    f[(hand[1] - 1) * W + hand[0] - 1] = C.mt3;
    f[(hand[1] - 2) * W + hand[0] - 2] = C.mt3;
  }

  function drawLantern(f, t) {
    var sway = Math.round(Math.sin(t * 1.3) * 0.9), x0 = 61 + sway;
    for (var y = 200; y < 202; y++) f[y * W + 64] = C.nb0;
    for (var dy = -2; dy <= 11; dy++) {
      for (var dx = -2; dx <= 7; dx++) {
        var x = x0 + dx, yy = 202 + dy, inBody = dx >= 0 && dx < 6 && dy >= 0 && dy < 9;
        if (!inBody && Math.abs(dx - 2.5) + Math.abs(dy - 4) < 7 && PIX.dith(x, yy, 0.5)) f[yy * W + x] = NEON.GLOW.r[f[yy * W + x]];
      }
    }
    stamp(function (x, y, c) { f[y * W + x] = c; }, [
      ".dddd.",
      "rRHRRr",
      "rRHRRr",
      "rrrrrr",
      "rRHRRr",
      "rRHRRr",
      "rrrrrr",
      ".rRRr.",
      ".dddd."
    ], { d: C.wd0, r: C.nr1, R: C.nr2, H: C.nr3 }, x0, 202);
  }

  function drawTicketMachine(f, t) {
    for (var k = 0; k < 6; k++) {
      var x = 96 + (k % 3) * 2, y = 207 + Math.floor(k / 3) * 3;
      var on = PIX.hash(k, Math.floor(t * 2), 160) < 0.7;
      f[y * W + x] = on ? [C.nr2, C.ng2, C.ny2, C.nc2, C.np2, C.na2][k] : C.mt2;
    }
  }

  // One tube in the konbini ceiling is going.
  function drawKonbini(f, t) {
    var dying = NEON.stutter(t, 9, 4.1, 0.9);
    for (var x = 138; x <= 150; x++) f[208 * W + x] = f[209 * W + x] = dying ? C.hl0 : C.um1;
  }

  // Most televisions show the same channel; a couple are all static.
  function drawTVs(f, t) {
    for (var k = 0; k < 14; k++) {
      var tx = 309 + (k % 7) * 9, ty = 211 + Math.floor(k / 7) * 7;
      for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 5; x++) {
          var c;
          if (k === 4 || k === 9) c = PIX.hash(x + tx, y, Math.floor(t * 20)) < 0.5 ? C.st3 : C.st1;
          else if (k === 12) c = C.nb0;
          else {
            var hue = PIX.mod(Math.floor(t * 1.5) + (y === 1 ? 1 : 0), 5);
            c = [C.nc2, C.np2, C.ny2, C.ng2, C.nv2][PIX.mod(hue + (x > 2 ? 1 : 0), 5)];
            if (PIX.mod(Math.floor(t * 8) + k, 11) === 0) c = C.um2;
          }
          f[(ty + y) * W + tx + x] = c;
        }
      }
    }
  }

  function drawArcade(f, t) {
    var frame = Math.floor(t * 8), cols = [C.np2, C.nc2, C.ny2, C.ng2, C.nv2];
    for (var x = 407; x <= 441; x += 2) {
      for (var y = 209; y <= 224; y++) {
        if (PIX.hash(x, y, frame) < 0.22) f[y * W + x] = cols[Math.floor(PIX.hash(x, y, frame + 1) * 5)];
      }
    }
    // Bulbs chase around the arcade's sign board.
    var n = 0, head = Math.floor(t * 10);
    for (var bx = 406; bx <= 442; bx += 2) {
      [198, 207].forEach(function (by, side) {
        var k = side ? 1000 - bx : bx;
        f[by * W + bx] = PIX.mod(Math.floor(k / 2) + head, 3) === 0 ? C.ny3 : C.ny1;
      });
      n++;
    }
  }

  function drawCat(f, t) {
    var up = PIX.mod(t, 0.8) < 0.4;
    stamp(function (x, y, c) { f[y * W + x] = c; }, [
      ".y...y.",
      ".yyyyy.",
      ".ykyky.",
      ".yyryy.",
      "..rbr..",
      ".Yyyyy.",
      ".Yyyyy.",
      ".Yyyyo."
    ], { y: C.cy1, Y: C.ny2, k: C.nb0, r: C.nr2, b: C.ny3, o: C.cy0 }, 241, 216);
    var paw = up ? [[248, 216], [248, 217], [247, 218]] : [[248, 219], [248, 220], [247, 221]];
    paw.forEach(function (p) { f[p[1] * W + p[0]] = C.hl0; });
  }

  function drawVending(f, t) {
    if (!NEON.stutter(t, 11, 6.7, 0.6)) for (var y = 203; y <= 214; y++) for (var x = 393; x <= 400; x++) {
      if (f[y * W + x] === C.um2) f[y * W + x] = C.um1;
    }
  }

  function drawShops(f, t) {
    SIGNS.forEach(function (s) { NEON.drawSign(f, s, s.lit(t)); });
    drawKonbini(f, t);
    drawTicketMachine(f, t);
    drawCook(f, t);
    drawSteam(f, t, "pot");
    drawLantern(f, t);
    drawCat(f, t);
    drawTVs(f, t);
    drawArcade(f, t);
    drawVending(f, t);
  }

  NEON.SHOPS = SHOPS;
  NEON.FRONT = FRONT;
  NEON.LAMP = LAMP;
  NEON.steam = steam;
  NEON.drawSteam = drawSteam;
  NEON.drawShops = drawShops;
})(S);
// pixel-neon-rain/src/wet.js
// The wet street: pavement slabs, the curb, asphalt with lane marks, a
// manhole and puddles. Each frame the street mirrors the shopfronts above it,
// darkened, the bright things more than the dark, and broken up by ripples.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = NEON.GEO, FLOOR = GEO.floor, CURB = GEO.curb, ROAD = GEO.road;
  var GROUND = PIX.fb();
  var PAVE = PIX.names(["sw0", "sw1", "sw2"]), TAR = PIX.names(["rd0", "rd1", "rd2"]);
  var PUDDLES = [[70, 234, 14, 2], [300, 236, 10, 1.6], [190, 251, 22, 3], [420, 263, 26, 3], [96, 266, 16, 2.5]];
  var MANHOLE = { x: 330, y: 262, rx: 8, ry: 2.4 };
  var PUDDLE = new Uint8Array(W * H);

  function bake() {
    for (var y = FLOOR; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var c;
        if (y < CURB) {
          var joint = (y - FLOOR) % 5 === 4 || (x + (Math.floor((y - FLOOR) / 5) % 2) * 6) % 12 === 0;
          c = joint ? C.sw0 : PIX.pick(PAVE, 0.35 + 0.3 * PIX.noise2(x / 4, y / 2, 170), x, y);
        } else if (y === CURB) c = C.sw2;
        else if (y < ROAD) c = C.sw0;
        else c = PIX.pick(TAR, 0.3 + 0.45 * PIX.noise2(x / 3, y / 1.5, 171) + 0.2 * PIX.hash(x, y, 172) - 0.1, x, y);
        GROUND[y * W + x] = c;
      }
    }
    // Lane marks: a dashed white line down the middle, a yellow one by the curb.
    for (x = 0; x < W; x++) {
      if (PIX.mod(x, 28) < 16) GROUND[259 * W + x] = C.rdl;
      GROUND[245 * W + x] = PIX.hash(x, 245, 173) < 0.85 ? C.rdy : C.rd1;
    }
    // A drain grate in the curb and the manhole in the road.
    for (x = 150; x <= 158; x++) if (x % 2 === 0) GROUND[241 * W + x] = GROUND[242 * W + x] = C.mt0;
    for (y = MANHOLE.y - 3; y <= MANHOLE.y + 3; y++) {
      for (x = MANHOLE.x - 9; x <= MANHOLE.x + 9; x++) {
        var d = Math.hypot((x - MANHOLE.x) / MANHOLE.rx, (y - MANHOLE.y) / MANHOLE.ry);
        if (d <= 1) GROUND[y * W + x] = d > 0.8 ? C.mt2 : (x + y) % 3 === 0 ? C.mt0 : C.mt1;
      }
    }
    PUDDLES.forEach(function (p) {
      for (var y = Math.floor(p[1] - p[3]); y <= Math.ceil(p[1] + p[3]); y++) {
        for (var x = p[0] - p[2]; x <= p[0] + p[2]; x++) {
          var e = Math.pow((x - p[0]) / p[2], 2) + Math.pow((y - p[1]) / p[3], 2);
          if (e <= 1 + 0.25 * PIX.noise(x / 3, y, 174)) { PUDDLE[y * W + x] = 1; GROUND[y * W + x] = C.rd0; }
        }
      }
    });
    // Pools of light on the pavement in front of the brightest shops.
    [[112, 176], [378, 402], [444, 479], [238, 287]].forEach(function (s) {
      for (var y = FLOOR; y < CURB; y++) {
        for (var x = s[0]; x <= s[1]; x++) {
          if (PIX.dith(x, y, 0.55 - (y - FLOOR) * 0.04)) GROUND[y * W + x] = NEON.LIGHT[GROUND[y * W + x]];
        }
      }
    });
  }
  bake();

  // How strongly each colour shows in the wet: dark things hardly at all.
  var SHINE = new Float32Array(256);
  PIX.PALETTE.forEach(function (p, i) { SHINE[i] = Math.max(0, Math.min(1, (PIX.lum(i) - 0.06) / 0.28)); });

  // A slowly moving field of wet and less wet patches, so reflections break
  // up into streaks instead of a checkerboard.
  var SHEEN = new Float32Array(W * 64);
  for (var sy = 0; sy < 64; sy++) {
    for (var sx = 0; sx < W; sx++) {
      SHEEN[sy * W + sx] = 0.14 + 0.56 * (0.7 * PIX.noise2(sx / 7, sy / 1.2, 176, W / 7) + 0.3 * PIX.hash(sx, sy, 177));
    }
  }

  // Which row of the facades each row of the street mirrors: the pavement is a
  // straight mirror of the shop windows, the road a stretched one.
  var SRC = new Int16Array(H);
  for (var y = FLOOR; y < H; y++) {
    var d = y - FLOOR;
    SRC[y] = y < CURB ? FLOOR - 1 - d : FLOOR - 15 - Math.floor((y - ROAD) * 0.6);
  }

  function drawGround(f, t) {
    f.set(GROUND.subarray(FLOOR * W), FLOOR * W);
    var WET = NEON.WET, jitter = Math.floor(t * 7), drift = Math.floor(t * 5);
    for (var y = FLOOR + 1; y < H; y++) {
      if (y >= CURB && y < ROAD) continue;
      var d = y - FLOOR, fade = 1 - d / 110, row = SRC[y] * W, out = y * W;
      var amp = y < CURB ? 0.5 + d * 0.06 : 1 + (y - ROAD) * 0.05;
      var wave = Math.sin(y * 0.9 + t * 3.1) * amp + (PIX.hash(y, jitter, 175) - 0.5) * (y < CURB ? 0.8 : 2);
      var dx = Math.round(wave), sheen = PIX.mod(y + drift, 64) * W, dim = (y & 1) ? 0.72 : 1;
      for (var x = 0; x < W; x++) {
        var sx = x + dx;
        if (sx < 0) sx = 0; else if (sx >= W) sx = W - 1;
        var src = f[row + sx], a = SHINE[src] * fade * dim;
        if (PUDDLE[out + x]) a = Math.max(a, 0.9);
        if (a > SHEEN[sheen + PIX.mod(x + dx * 3, W)]) f[out + x] = WET[src];
      }
    }
  }

  NEON.GROUND = GROUND;
  NEON.PUDDLE = PUDDLE;
  NEON.PUDDLES = PUDDLES;
  NEON.MANHOLE = MANHOLE;
  NEON.drawGround = drawGround;
})(S);
// pixel-neon-rain/src/traffic.js
// Traffic: streams of far lights between the towers, flying cars in three
// lanes (and now and then a police spinner), taxis, sedans and delivery bikes
// on the wet road, and an advertising blimp drifting over the gap.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, FONT = G.FONT, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = NEON.GEO, LIGHT = NEON.LIGHT, WET = NEON.WET;

  function plot(f, x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = c; }
  function tint(f, x, y, table) { if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = table[f[y * W + x]]; }
  // Paints a sprite drawn facing right; dir -1 mirrors it. Returns nothing.
  function sprite(f, rows, map, x0, y0, dir) {
    var w = rows[0].length;
    rows.forEach(function (row, r) {
      for (var c = 0; c < w; c++) {
        var ch = row[c];
        if (ch === "." || map[ch] === undefined) continue;
        plot(f, dir > 0 ? x0 + c : x0 + w - 1 - c, y0 + r, map[ch]);
      }
    });
  }

  // Lanes of flying traffic. Each is a conveyor of evenly spaced slots, some
  // of them empty, so cars come by irregularly but always the same way.
  var LANES = [
    { y: 92, dir: -1, speed: 30, gap: 60, size: "far", seed: 1 },
    { y: 100, dir: 1, speed: 38, gap: 75, size: "far", seed: 2 },
    { y: 118, dir: 1, speed: 48, gap: 150, size: "small", seed: 3 },
    { y: 150, dir: -1, speed: 60, gap: 200, size: "med", seed: 4 },
    { y: 158, dir: 1, speed: 72, gap: 250, size: "med", seed: 5, police: true }
  ];
  var SPAN = W + 60;
  function cars(t) {
    var out = [];
    LANES.forEach(function (L, li) {
      var n = Math.ceil(SPAN / L.gap);
      for (var k = 0; k < n; k++) {
        var raw = k * (SPAN / n) + PIX.hash(k, 0, L.seed) * L.gap * 0.4 + L.speed * t;
        var cycle = Math.floor(raw / SPAN), u = raw - cycle * SPAN;
        if (PIX.hash(k, cycle, L.seed) > 0.78) continue;
        out.push({
          id: li + ":" + k + ":" + cycle, lane: li, y: L.y, dir: L.dir,
          x: L.dir > 0 ? u - 30 : W + 30 - u,
          police: !!L.police && PIX.hash(k, cycle, 99) < 0.2,
          paint: Math.floor(PIX.hash(k, cycle, L.seed + 7) * 5)
        });
      }
    });
    return out;
  }

  var PAINTS = [[C.cb0, C.cb1, C.cb3], [C.cb1, C.cb2, C.cb3], [C.tx0, C.tx1, C.ny3], [C.ru1, C.cr1, C.nr3], [C.um0, C.um1, C.um2]];
  var MED = [
    "...rrrrr....",
    "..rgggggrr..",
    "LbbbbbbbbbbF",
    "Tbhhhhhhhhbb",
    ".uu.....uu.."
  ];
  var SMALL = [".rrr..", "Tbbbbf"];
  function beam(f, x, y, dir, len) {
    for (var d = 1; d < len; d++) {
      var spread = Math.floor(d / 6);
      for (var dy = -spread; dy <= spread; dy++) {
        if (PIX.dith(x + dir * d, y + dy, 0.75 - d / len)) tint(f, x + dir * d, y + dy, LIGHT);
      }
    }
  }
  function drawCar(f, car, t) {
    var L = LANES[car.lane], x = Math.round(car.x), y = car.y, dir = car.dir;
    if (L.size === "far") {
      plot(f, x, y, dir > 0 ? C.nr2 : C.hl0);
      plot(f, x - dir, y, C.cb2);
      plot(f, x - 2 * dir, y, dir > 0 ? C.na3 : C.nr1);
      return;
    }
    var paint = car.police ? [C.cb0, C.cb1, C.um2] : PAINTS[car.paint];
    var map = { r: paint[0], g: C.ho1, b: paint[1], h: paint[2], L: C.nr2, T: C.nr2, F: C.hl0, f: C.hl0, u: car.police ? C.pb2 : C.nc2 };
    var rows = L.size === "med" ? MED : SMALL, w = rows[0].length, x0 = x - Math.floor(w / 2), y0 = y - rows.length + 1;
    var front = dir > 0 ? x0 + w - 1 : x0;
    var lamp = y0 + rows.findIndex(function (row) { return row.indexOf("F") >= 0; });
    if (L.size === "med") {
      beam(f, front, y0 + 2, dir, 16);
      for (var k = 1; k <= 4; k++) if (PIX.dith(k, y0 + 3, 0.7 - k * 0.15)) plot(f, front - dir * (w - 1 + k), y0 + 3, C.nr1);
      for (var gx = 0; gx < w; gx++) if (PIX.dith(x0 + gx, y0 + 5, 0.5)) tint(f, x0 + gx, y0 + 5, car.police ? NEON.GLOW.b : NEON.GLOW.c);
    }
    map.L = dir > 0 ? C.nr2 : C.hl0;
    map.F = dir > 0 ? C.hl0 : C.nr2;
    sprite(f, rows, map, x0, y0, 1);
    if (car.police) {
      var red = PIX.mod(Math.floor(t / 0.15), 2) === 0, bx = x0 + 4;
      for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
        var dist = Math.abs(dx) + Math.abs(dy);
        if (dist > 0 && dist <= 3 && PIX.dith(bx + dx, y0 - 1 + dy, 0.8 - dist * 0.2)) {
          tint(f, (red ? bx : bx + 3) + dx, y0 - 1 + dy, red ? NEON.GLOW.r : NEON.GLOW.b);
        }
      }
      plot(f, bx, y0 - 1, red ? C.nr2 : C.nr1);
      plot(f, bx + 1, y0 - 1, C.mt2);
      plot(f, bx + 2, y0 - 1, C.mt2);
      plot(f, bx + 3, y0 - 1, red ? C.pb1 : C.pb2);
    }
  }
  function drawCars(f, t, lanes) {
    cars(t).forEach(function (c) { if (lanes.indexOf(c.lane) >= 0) drawCar(f, c, t); });
  }

  // Road traffic, one vehicle per lane per pass.
  var ROADS = [
    { wheels: GEO.laneFar, dir: 1, speed: 70, period: 23, seed: 11 },
    { wheels: GEO.laneNear, dir: -1, speed: 92, period: 17, seed: 12 }
  ];
  function taxis(t) {
    var out = [];
    ROADS.forEach(function (R, li) {
      var k = Math.floor(t / R.period), s = t - k * R.period;
      var x = R.dir > 0 ? -30 + R.speed * s : W + 30 - R.speed * s;
      if (x < -40 || x > W + 40) return;
      out.push({ id: li + ":" + k, x: x, wheels: R.wheels, dir: R.dir, kind: ["taxi", "sedan", "bike"][Math.floor(PIX.hash(k, li, R.seed) * 3)] });
    });
    return out;
  }
  var BODIES = {
    taxi: [
      "...............SnSnSS...................",
      "............rrrrrrrrrrrrrrrr............",
      "...........rgGggggggrgggGggggr..........",
      "..........rgGgggppggrggGggddggr.........",
      ".........rgGggggppggrgGgggddgggr........",
      "..bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..",
      ".Lbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "LTkbkbkbkbkbkbkbkbkbkbkbkbkbkbkbkbkbkbFF",
      "Tbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbc",
      "chhhhhhwwwwwhhhhhhhhhhhhhhhhwwwwwhhhhhhc",
      ".hhhhhwwmmmwwhhhhhhhhhhhhhhwwmmmwwhhhhh.",
      "......wmmMmmw..............wmmMmmw......",
      "......wwmmmww..............wwmmmww......",
      ".......wwwww................wwwww......."
    ],
    sedan: [
      "........................................",
      "..............rrrrrrrrrrrrrr............",
      "...........rrgGggggggrgggGggggrr........",
      ".........rrggGgggppggrggGggdddggrr......",
      "...bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..",
      "..bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.",
      ".Lbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "LTnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnFF",
      "Tbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbc",
      "chhhhhhwwwwwhhhhhhhhhhhhhhhhwwwwwhhhhhhc",
      ".hhhhhwwmmmwwhhhhhhhhhhhhhhwwmmmwwhhhhh.",
      "......wmmMmmw..............wmmMmmw......",
      "..uuuuwwmmmwwuuuuuuuuuuuuuuwwmmmwwuuuu..",
      ".......wwwww................wwwww......."
    ],
    bike: [
      "..............hhh.............",
      ".............hhvvh............",
      "..........kkkkhhh.............",
      ".........kppkkkcc.............",
      "........kkkkkkccccc...........",
      "..........ccccccccccc.........",
      "...LbbbbbbbccccbbbbbbbbbF.....",
      "..Tbbbbnnnnnnnnnnnnbbbbbbbc...",
      "...bbbb.....ccc.....bbbbb.....",
      "...wwwww.............wwwww....",
      "..wwmmmww...........wwmmmww...",
      "..wmmMmmw...........wmmMmmw...",
      "..wwmmmww...........wwmmmww...",
      "...wwwww.............wwwww...."
    ]
  };
  function vehicleMap(kind) {
    var wheel = { w: C.nb0, m: C.mt2, M: C.mt3, L: C.nr2, T: C.nr1, F: C.hl0, c: C.mt3, p: C.skn0, d: C.hr0 };
    if (kind === "taxi") return Object.assign({}, wheel, { S: C.ny2, n: C.ny1, r: C.tx0, g: C.cb0, G: C.cb3, b: C.tx1, h: C.tx0, k: C.nb0 });
    if (kind === "sedan") return Object.assign({}, wheel, { r: C.cb1, g: C.cb0, G: C.cb3, b: C.cb1, h: C.cb2, n: C.np2, u: C.np1 });
    return Object.assign({}, wheel, { k: C.np1, p: C.np3, h: C.ct1, v: C.nc3, c: C.ct2, b: C.cb2, n: C.nc2, m: C.nc1, M: C.nc2 });
  }
  function drawVehicle(f, v, t) {
    var rows = BODIES[v.kind], map = vehicleMap(v.kind), w = rows[0].length;
    var x0 = Math.round(v.x) - Math.floor(w / 2), y0 = v.wheels - rows.length + 1, dir = v.dir;
    var front = dir > 0 ? x0 + w - 1 : x0;
    var lamp = y0 + rows.findIndex(function (row) { return row.indexOf("F") >= 0; });
    // The reflection first: the vehicle upside down in the wet, rippled.
    rows.forEach(function (row, r) {
      var my = v.wheels + (rows.length - r);
      if (my >= H) return;
      var dx = Math.round(Math.sin(my * 0.9 + t * 3.1));
      for (var c = 0; c < w; c++) {
        var col = map[row[c]];
        if (col === undefined || !PIX.dith(c, my, 0.75)) continue;
        plot(f, (dir > 0 ? x0 + c : x0 + w - 1 - c) + dx, my, WET[col]);
      }
    });
    // Headlights reach along the road ahead, and streak down in the wet.
    for (var d = 1; d < 34; d++) {
      for (var dy = -3; dy <= 2; dy++) {
        var yy = lamp + dy + Math.floor(d / 10);
        if (Math.abs(dy) <= 1 + d / 10 && PIX.dith(front + dir * d, yy, 0.7 - d / 40)) tint(f, front + dir * d, yy, LIGHT);
      }
    }
    for (var s = 1; s < 9; s++) {
      if (PIX.dith(front, v.wheels + s, 0.8 - s * 0.09)) plot(f, front + Math.round(Math.sin(s + t * 4)), v.wheels + s, s < 3 ? C.um2 : C.rdl);
      if (v.kind !== "bike" && PIX.dith(front - dir * (w - 1), v.wheels + s, 0.7 - s * 0.1)) plot(f, front - dir * (w - 1), v.wheels + s, C.nr1);
    }
    if (v.kind === "sedan") for (var gx = x0 + 2; gx < x0 + w - 2; gx++) if (PIX.dith(gx, v.wheels + 1, 0.6)) tint(f, gx, v.wheels + 1, NEON.GLOW.p);
    sprite(f, rows, map, x0, y0, dir);
  }
  function drawTaxis(f, t) { taxis(t).forEach(function (v) { drawVehicle(f, v, t); }); }

  // The blimp: a hull lit pink from below, fins, a gondola, a scrolling LED
  // banner, and a searchlight that swings under it.
  var BLIMP = { period: 120, speed: 5.2, y: 30, rx: 26, ry: 8 };
  var BANNER = "HUJAN NEON + KOPI 24 JAM + ";
  var BANNER_W = FONT.width(BANNER, FONT.TINY, 1) + 1;
  function blimp(t) {
    return { x: W + 60 - BLIMP.speed * PIX.mod(t, BLIMP.period), y: BLIMP.y };
  }
  function drawBlimp(f, t) {
    var b = blimp(t), bx = Math.round(b.x), by = b.y, hull = PIX.names(["cb0", "cb1", "cb2", "cb3"]);
    if (bx < -40 || bx > W + 40) return;
    var ang = 0.35 * Math.sin(t * 0.45);
    for (var d = 12; d < 70; d++) {
      var cx = bx + Math.round(d * Math.sin(ang)), cy = by + d;
      var hw = 1 + d * 0.06;
      for (var x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
        if (PIX.dith(x, cy, 0.5 * (1 - Math.abs(x - cx) / hw) * (1 - d / 80))) tint(f, x, cy, LIGHT);
      }
    }
    for (var y = by - BLIMP.ry; y <= by + BLIMP.ry; y++) {
      for (x = bx - BLIMP.rx; x <= bx + BLIMP.rx + 6; x++) {
        var u = (x - bx) / BLIMP.rx, v = (y - by) / BLIMP.ry;
        var inHull = u * u + v * v <= 1;
        var fin = x > bx + BLIMP.rx - 8 && Math.abs(y - by) <= (x - (bx + BLIMP.rx - 8)) * 0.9 && Math.abs(y - by) > 1;
        if (!inHull && !fin) continue;
        var shade = inHull ? 0.35 + 0.45 * v - (Math.abs(v + 0.55) < 0.12 ? -0.3 : 0) : 0.2;
        var c = PIX.pick(hull, shade, x, y);
        if (inHull && v > 0.55 && PIX.dith(x, y, 0.5)) c = NEON.GLOW.p[c];
        plot(f, x, y, c);
      }
    }
    for (x = bx - 8; x <= bx + 6; x++) { plot(f, x, by + 8, C.cb1); plot(f, x, by + 9, (x - bx) % 3 === 0 ? C.wa2 : C.cb1); plot(f, x, by + 10, C.cb0); }
    // The banner.
    for (y = by - 3; y <= by + 3; y++) for (x = bx - 16; x <= bx + 14; x++) plot(f, x, y, C.nb0);
    var off = Math.floor(t * 10);
    FONT.text(function (px, py, k) {
      var sx = px - PIX.mod(off, BANNER_W);
      for (var rep = 0; rep < 3; rep++) {
        var xx = sx + rep * BANNER_W;
        if (xx >= bx - 15 && xx <= bx + 13) plot(f, xx, py, BANNER.lastIndexOf("+", k) % 2 ? C.np3 : C.nc3);
      }
    }, BANNER, bx - 15, by - 2, FONT.TINY, 1);
    plot(f, bx - BLIMP.rx + 1, by + 2, PIX.mod(t, 1.4) < 0.3 ? C.nr2 : C.nr0);
    plot(f, bx + BLIMP.rx + 5, by, PIX.mod(t + 0.5, 2) < 0.1 ? C.hl0 : C.cb2);
  }

  NEON.LANES = LANES;
  NEON.cars = cars;
  NEON.drawCars = drawCars;
  NEON.taxis = taxis;
  NEON.drawTaxis = drawTaxis;
  NEON.blimp = blimp;
  NEON.drawBlimp = drawBlimp;
})(S);
// pixel-neon-rain/src/people.js
// People on the pavement: an office worker, a woman in a red coat, a kid in
// a raincoat, a couple under one umbrella, a cyborg who doesn't bother with
// one, and someone whose umbrella shaft is a tube of light. Each walks at
// their own pace, one way or the other, and is mirrored in the wet.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H, C = PIX.C;
  var GEO = NEON.GEO;

  var WALKERS = [
    { name: "suit", lane: "back", dir: 1, speed: 15, x0: 30, coat: [C.ct0, C.ct1], legs: C.ct0, umbrella: "black", height: 15 },
    { name: "hood", lane: "back", dir: -1, speed: 11, x0: 420, coat: [C.ct1, C.ct2], legs: C.ct0, umbrella: "led", height: 15 },
    { name: "cyborg", lane: "back", dir: 1, speed: 18, x0: 250, coat: [C.cb1, C.cb2], legs: C.cb0, umbrella: null, height: 16, visor: true },
    { name: "red coat", lane: "front", dir: -1, speed: 13, x0: 300, coat: [C.ru1, C.cr1], legs: C.ct0, umbrella: "clear", height: 15 },
    { name: "kid", lane: "front", dir: 1, speed: 19, x0: 120, coat: [C.cy0, C.cy1], legs: C.ct1, umbrella: "red", height: 11 },
    { name: "couple", lane: "front", dir: -1, speed: 12, x0: 60, coat: [C.ct1, C.wm1], legs: C.ct0, umbrella: "clear", height: 15, pair: true }
  ];

  function walkers(t) {
    return WALKERS.map(function (s) {
      var dist = s.speed * t;
      return {
        name: s.name, spec: s, dir: s.dir, umbrella: s.umbrella, height: s.height, dist: dist,
        x: PIX.mod(s.x0 + s.dir * dist + 24, W + 48) - 24,
        feet: s.lane === "back" ? GEO.walkBack : GEO.walkFront
      };
    });
  }
  // How far the front foot is ahead of the hips, in pixels.
  function stride(w) { return Math.round(Math.sin(w.dist / 2.2) * 2); }

  // The light a bright colour behind a figure throws on its outline: the
  // nearest neon hue, or plain white light for the pale shop interiors.
  var RIM_HUES = [["#d6267f", "p"], ["#1cbcd6", "c"], ["#ff8420", "a"], ["#ff2a3c", "r"],
    ["#38f07a", "g"], ["#7c5cff", "v"], ["#ffde38", "y"], ["#e2e8ff", null]];
  function unit(c) { var top = Math.max(c[0], c[1], c[2], 1); return [c[0] * 255 / top, c[1] * 255 / top, c[2] * 255 / top]; }
  var RIM = PIX.RGB.map(function (c) {
    if (Math.max(c[0], c[1], c[2]) < 178) return null;
    var u = unit(c), best = null, bd = Infinity;
    RIM_HUES.forEach(function (h) {
      var v = unit([1, 3, 5].map(function (i) { return parseInt(h[0].slice(i, i + 2), 16); }));
      var rm = (u[0] + v[0]) / 2, dr = u[0] - v[0], dg = u[1] - v[1], db = u[2] - v[2];
      var d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
      if (d < bd) { bd = d; best = h[1] ? NEON.GLOW[h[1]] : NEON.LIGHT; }
    });
    return best;
  });

  var CANOPY = {
    black: { fill: C.nb2, edge: C.nb5, rib: C.nb3, clear: false },
    red: { fill: C.nr1, edge: C.nr2, rib: C.nr0, clear: false },
    clear: { fill: C.um0, edge: C.um2, rib: C.um1, clear: true },
    led: { fill: C.um0, edge: C.um2, rib: C.um1, clear: true }
  };

  // One figure, as a list of pixels: legs, coat, arms and head.
  function body(put, s, cx, feet, dir, foot, bob) {
    var kid = s.height < 13, L = kid ? 4 : 5, T = kid ? 4 : 6;
    for (var r = 0; r < L; r++) {
      var y = feet - L + 1 + r, reach = Math.round((foot * r) / (L - 1));
      var shoe = r === L - 1;
      put(cx + reach, y, shoe ? C.nb0 : s.legs);
      put(cx - reach, y, shoe ? C.nb0 : s.legs);
      if (shoe) put(cx + reach + dir, y, C.nb0);
    }
    var top = feet - L - T + 1 + bob;
    for (r = 0; r < T; r++) {
      var y2 = top + r, flare = !kid && r === T - 1 ? 1 : 0;
      for (var dx = -1 - flare; dx <= 1 + flare; dx++) put(cx + dx, y2, r === 0 || dx === dir ? s.coat[1] : s.coat[0]);
    }
    put(cx - dir, top + 2, s.coat[0]);
    put(cx - dir + (foot > 0 ? -dir : dir), top + 3, s.coat[0]);
    var head = top - 3;
    put(cx - 1, head, C.hr0); put(cx, head, C.hr0); put(cx + 1, head, C.hr0);
    put(cx - dir, head + 1, C.hr0); put(cx, head + 1, C.skn1); put(cx + dir, head + 1, C.skn2);
    put(cx - dir, head + 2, C.hr0); put(cx, head + 2, C.skn1);
    if (s.visor) {
      put(cx, head + 1, C.nr2); put(cx + dir, head + 1, C.nr3);
      put(cx - 1, head - 1, C.cb1); put(cx, head - 1, C.cb1); put(cx + 1, head - 1, C.cb2);
    }
    return head;
  }

  function figure(w, t) {
    var s = w.spec, out = [], dir = w.dir, foot = stride(w);
    var bob = Math.abs(Math.sin(w.dist / 2.2)) < 0.5 ? -1 : 0;
    function put(x, y, c) { out.push(Math.round(x), y, c); }
    var cx = Math.round(w.x), head = body(put, s, cx, w.feet, dir, foot, bob);
    if (s.pair) body(put, { height: 15, legs: C.ct0, coat: [C.nb3, C.ct2] }, cx - dir * 4, w.feet, dir, -foot, bob ? 0 : -1);
    out.body = out.length;
    if (!s.umbrella) return out;
    var kind = CANOPY[s.umbrella], kid = s.height < 13;
    var widths = kid ? [3, 5, 7] : s.pair ? [5, 9, 13, 15] : [3, 7, 9, 11];
    var ux = s.pair ? cx - dir * 2 : cx + dir, uy = head - widths.length - 1;
    for (var y = uy + widths.length; y < head + 3; y++) put(s.pair ? cx : ux, y, C.mt1);
    widths.forEach(function (wd, r) {
      var half = (wd - 1) / 2;
      for (var dx = -half; dx <= half; dx++) {
        var x = ux + dx, y = uy + r, rim = r === widths.length - 1;
        if (rim && PIX.mod(dx + half, 2) === 1) continue;
        var c = r === 0 || Math.abs(dx) === half ? kind.edge : Math.abs(dx) === Math.round(half / 2) ? kind.rib : kind.fill;
        if (kind.clear && c === kind.fill && !PIX.dith(x, y, 0.55)) continue;
        put(x, y, c);
      }
    });
    if (s.umbrella === "led") {
      var hue = [C.np2, C.nc2, C.nv2][PIX.mod(Math.floor(t * 1.5), 3)];
      widths.forEach(function (wd, r) { var half = (wd - 1) / 2; put(ux - half, uy + r, hue); put(ux + half, uy + r, hue); });
      for (y = uy + 1; y < head + 3; y++) put(ux, y, y % 2 ? C.nc4 : C.nc3);
    }
    // Rain bouncing off the canopy.
    var tick = Math.floor(t * 9);
    if (PIX.hash(tick, s.x0, 180) < 0.6) put(ux + Math.round((PIX.hash(tick, s.x0, 181) - 0.5) * widths[0] * 2), uy - 1, C.rn2);
    return out;
  }

  // A body pixel on the outline takes on the light of whatever bright thing
  // is right behind it, so figures stand out from the shop windows.
  function rimmed(f, mine, x, y, c) {
    for (var n = 0; n < 3; n++) {
      var nx = n === 0 ? x - 1 : n === 1 ? x + 1 : x, ny = n === 2 ? y - 1 : y;
      if (nx < 0 || nx >= W || ny < 0 || mine.has(ny * W + nx)) continue;
      var table = RIM[f[ny * W + nx]];
      if (table) return table[c];
    }
    return c;
  }

  function drawWalker(f, w, t, reflect) {
    var px = figure(w, t), k, x, y, mine = new Set();
    if (reflect) {
      for (k = 0; k < px.length; k += 3) {
        y = 2 * w.feet + 1 - px[k + 1];
        if (y <= w.feet || y >= GEO.curb) continue;
        x = px[k] + Math.round(Math.sin(y * 0.9 + t * 3.1) * 0.6);
        if (x >= 0 && x < W && PIX.dith(x, y, 0.7)) f[y * W + x] = NEON.WET[px[k + 2]];
      }
    }
    for (k = 0; k < px.length; k += 3) if (px[k] >= 0 && px[k] < W) mine.add(px[k + 1] * W + px[k]);
    for (k = 0; k < px.length; k += 3) {
      x = px[k]; y = px[k + 1];
      if (x >= 0 && x < W && y >= 0 && y < H) f[y * W + x] = k < px.body ? rimmed(f, mine, x, y, px[k + 2]) : px[k + 2];
    }
    if (w.spec.umbrella === "led") {
      // The shaft lights up the canopy and the face beside it.
      var ux = Math.round(w.x) + w.dir;
      for (k = 0; k < px.length; k += 3) {
        if (px[k + 2] !== C.nc3 && px[k + 2] !== C.nc4) continue;
        [-1, 1].forEach(function (d) {
          var xx = px[k] + d, yy = px[k + 1];
          if (xx >= 0 && xx < W && xx !== ux && PIX.dith(xx, yy, 0.6)) f[yy * W + xx] = NEON.GLOW.c[f[yy * W + xx]];
        });
      }
    }
    if (w.spec.visor) {
      var hx = Math.round(w.x) + w.dir * 2, hy = w.feet - 15;
      if (hx >= 0 && hx < W && PIX.dith(hx, hy, 0.6)) f[hy * W + hx] = NEON.GLOW.r[f[hy * W + hx]];
    }
  }

  function drawPeople(f, t) {
    walkers(t).forEach(function (w) { if (w.feet === GEO.walkBack) drawWalker(f, w, t, true); });
    walkers(t).forEach(function (w) { if (w.feet === GEO.walkFront) drawWalker(f, w, t, true); });
  }

  NEON.walkers = walkers;
  NEON.stride = stride;
  NEON.drawWalker = drawWalker;
  NEON.drawPeople = drawPeople;
})(S);
// pixel-neon-rain/src/rain.js
// The rain. Three layers of streaks lean with the wind: fine faint ones over
// the far city, longer ones in front of the middle blocks, and long bright
// ones right in front of us that end in a crown on the pavement or the road.
// Water drips from the shop eaves, rings spread on the puddles, and the
// street lamp throws a cone of light that makes the rain inside it shine.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H;
  var GEO = NEON.GEO, FLOOR = GEO.floor;

  // How many drops each layer has, how long and fast they are, how far they
  // lean, and where they stop: the far and middle ones fall behind buildings,
  // the near ones hit the ground somewhere between the shopfronts and us.
  var LAYERS = {
    far: { n: 320, len: [2, 3], speed: [210, 260], lean: 0.08, top: -4, bottom: 200, seed: 300 },
    mid: { n: 220, len: [3, 5], speed: [280, 340], lean: 0.1, top: -6, bottom: 232, seed: 310 },
    near: { n: 230, len: [6, 8], speed: [380, 460], lean: 0.14, top: -30, seed: 320 }
  };
  // A handful of drops pass so close to us that they are long and bright.
  var CLOSE = 20;
  var SPLASH = 0.18;

  function between(range, h) { return range[0] + (range[1] - range[0]) * h; }

  // Drops that fall behind the buildings wrap from the top to the bottom and
  // come back in a new column each time round.
  function wrapping(name, t) {
    var L = LAYERS[name], span = L.bottom - L.top, out = [];
    for (var i = 0; i < L.n; i++) {
      var speed = between(L.speed, PIX.hash(i, 1, L.seed));
      var len = Math.round(between(L.len, PIX.hash(i, 2, L.seed)));
      var u = PIX.hash(i, 3, L.seed) * span + speed * t, round = Math.floor(u / span);
      var y = L.top + (u - round * span), x0 = PIX.hash(i, round, L.seed + 1) * (W + 40) - 20;
      out.push({ id: i, x: x0 + L.lean * (y - L.top), y: y, len: len, lean: L.lean });
    }
    return out;
  }

  // Each near drop has its own rhythm: it falls, hits the ground at a new
  // spot every time, splashes, and waits a moment before the next one.
  function near(i, t) {
    var L = LAYERS.near, close = i < CLOSE;
    var speed = close ? between([620, 700], PIX.hash(i, 1, L.seed)) : between(L.speed, PIX.hash(i, 1, L.seed));
    var len = close ? 11 + Math.floor(PIX.hash(i, 2, L.seed) * 4) : Math.round(between(L.len, PIX.hash(i, 2, L.seed)));
    var lean = close ? 0.16 : L.lean;
    var cycle = (H - L.top) / speed + SPLASH + 0.05 + 0.25 * PIX.hash(i, 3, L.seed);
    var v = t + PIX.hash(i, 4, L.seed) * cycle, round = Math.floor(v / cycle), u = v - round * cycle;
    var land = close ? H - 8 + Math.floor(PIX.hash(i, round, L.seed + 1) * 7)
      : FLOOR + 2 + Math.floor(PIX.hash(i, round, L.seed + 1) * (H - FLOOR - 4));
    var x0 = PIX.hash(i, round, L.seed + 2) * (W + 60) - 50, fall = (land - L.top) / speed;
    return { id: i, x0: x0, land: land, lean: lean, len: len, close: close, speed: speed, u: u, fall: fall };
  }

  function drops(t) {
    var out = [];
    for (var i = 0; i < LAYERS.near.n; i++) {
      var d = near(i, t);
      if (d.u >= d.fall) continue;
      var y = LAYERS.near.top + d.speed * d.u;
      out.push({ id: i, x: d.x0 + d.lean * (y - LAYERS.near.top), y: y, len: d.len, lean: d.lean, close: d.close });
    }
    return out;
  }

  function splashes(t) {
    var out = [];
    for (var i = 0; i < LAYERS.near.n; i++) {
      var d = near(i, t), age = d.u - d.fall;
      if (age < 0 || age >= SPLASH) continue;
      out.push({ id: i, x: Math.round(d.x0 + d.lean * (d.land - LAYERS.near.top)), y: d.land, age: age, close: d.close });
    }
    return out;
  }

  // The lamp's cone: from the lamp head down to the pavement, strongest near
  // the top and in the middle. The lamp buzzes off now and then.
  var LAMP = NEON.LAMP, CONE = { x: LAMP.x + 10, y: LAMP.head - 1, foot: GEO.walkFront + 1 };
  function lampOn(t) { return NEON.stutter(t, 41, 9.5, 0.45); }
  function cone(x, y) {
    var d = y - CONE.y;
    if (d < 1 || y > CONE.foot) return 0;
    var half = 3 + d * 0.42, off = Math.abs(x - CONE.x) / half;
    if (off >= 1) return 0;
    return (0.34 - 0.24 * (d / (CONE.foot - CONE.y))) * Math.pow(1 - off, 0.7);
  }

  function tint(f, x, y, table, twice) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    var i = y * W + x;
    f[i] = table[f[i]];
    if (twice) f[i] = table[f[i]];
  }

  function streak(f, d, table, lit) {
    for (var k = 0; k < d.len; k++) {
      var py = Math.round(d.y) - k, px = Math.round(d.x - d.lean * k);
      if (k === d.len - 1 && PIX.dith(px, py, 0.5)) continue;
      tint(f, px, py, table, (d.close && k < d.len - 3) || (lit && cone(px, py) > 0));
    }
  }

  function drawRain(f, t, name) {
    if (name === "near") {
      var on = lampOn(t);
      drops(t).forEach(function (d) { streak(f, d, NEON.RAIN, on); });
      return;
    }
    wrapping(name, t).forEach(function (d) { streak(f, d, NEON.RAINF, false); });
  }

  // A crown: a bright dot where the drop lands, then two droplets thrown out
  // to either side that fall back.
  var CROWN = [[[0, 0], [0, -1]], [[-1, -1], [1, -1], [0, -2]], [[-2, -2], [2, -2]], [[-3, -1], [3, -1]]];
  function drawSplashes(f, t) {
    splashes(t).forEach(function (s) {
      var step = Math.min(CROWN.length - 1, Math.floor((s.age / SPLASH) * CROWN.length));
      var spread = s.close ? 2 : 1;
      CROWN[step].forEach(function (p) { tint(f, s.x + p[0] * spread, s.y + p[1], NEON.RAIN, step < 2); });
    });
  }

  // Drips: a bead swells under the eave, lets go, falls to the pavement and
  // splashes. The eaves are the ramen stall's, the shutter box and the
  // bottom edges of the shop signs.
  var DRIPS = [
    [4, 200], [17, 200], [33, 200], [61, 200], [80, 200], [101, 200],
    [118, 208], [141, 208], [169, 208], [205, 204], [227, 204],
    [246, 208], [281, 208], [299, 208], [313, 208], [350, 208],
    [414, 208], [437, 208], [452, 208], [471, 208]
  ];
  var GRAVITY = 900, DRIP_SPLASH = 0.16;
  function drips(t) {
    return DRIPS.map(function (d, k) {
      var period = 1.3 + 1.4 * PIX.hash(k, 1, 330), u = PIX.mod(t + PIX.hash(k, 2, 330) * period, period);
      var ground = FLOOR + 2 + (k % 3), fall = Math.sqrt((2 * (ground - d[1])) / GRAVITY);
      var hang = period - fall - DRIP_SPLASH;
      if (u < hang) return { x: d[0], y: d[1], state: "hang", age: u / hang };
      var s = u - hang;
      if (s < fall) return { x: d[0], y: d[1] + 0.5 * GRAVITY * s * s, state: "fall", age: s };
      return { x: d[0], y: ground, state: "splash", age: s - fall };
    });
  }

  function drawDrips(f, t) {
    drips(t).forEach(function (d) {
      var y = Math.round(d.y);
      if (d.state === "hang") {
        tint(f, d.x, y, NEON.RAIN, d.age > 0.5);
        if (d.age > 0.75) tint(f, d.x, y + 1, NEON.RAIN, false);
      } else if (d.state === "fall") {
        tint(f, d.x, y, NEON.RAIN, true);
        tint(f, d.x, y - 1, NEON.RAIN, false);
      } else {
        var step = Math.min(2, Math.floor((d.age / DRIP_SPLASH) * 3));
        CROWN[step + 1].forEach(function (p) { tint(f, d.x + p[0], y + p[1], NEON.RAIN, false); });
      }
    });
  }

  // Rings on the puddles: each puddle has a few spots where a drop lands,
  // and from each a ring widens and fades.
  function drawRings(f, t) {
    NEON.PUDDLES.forEach(function (p, j) {
      var slots = 2 + Math.floor(p[2] / 8);
      for (var k = 0; k < slots; k++) {
        var seed = 340 + j, period = 0.7 + 0.5 * PIX.hash(k, 1, seed);
        var v = t + PIX.hash(k, 2, seed) * period, round = Math.floor(v / period), age = (v - round * period) / period;
        var a = PIX.hash(k, round, seed + 20) * Math.PI * 2, m = Math.sqrt(PIX.hash(k, round, seed + 40)) * 0.6;
        var cx = p[0] + Math.cos(a) * m * p[2], cy = p[1] + Math.sin(a) * m * p[3];
        var r = 0.5 + age * 4.5, seen = new Set();
        for (var s = 0; s < Math.PI * 2; s += 0.5 / r) {
          var x = Math.round(cx + Math.cos(s) * r), y = Math.round(cy + Math.sin(s) * r * 0.4), i = y * W + x;
          if (x < 0 || x >= W || y < 0 || y >= H || seen.has(i) || !NEON.PUDDLE[i]) continue;
          seen.add(i);
          if (PIX.dith(x, y, 1.1 - age)) f[i] = NEON.RAIN[f[i]];
        }
      }
    });
  }

  // The cone itself: a fine haze of light, a bright halo round the lamp head
  // and a pool on the pavement.
  function drawLamp(f, t) {
    if (!lampOn(t)) return;
    for (var y = CONE.y + 1; y <= CONE.foot; y++) {
      var half = Math.ceil(3 + (y - CONE.y) * 0.42);
      for (var x = CONE.x - half; x <= CONE.x + half; x++) {
        var a = cone(x, y);
        if (x >= 0 && x < W && a > 0 && PIX.dith(x, y, a)) f[y * W + x] = NEON.LIGHT[f[y * W + x]];
      }
    }
    for (y = CONE.y - 4; y <= CONE.y + 3; y++) {
      for (x = CONE.x - 6; x <= CONE.x + 6; x++) {
        var d = Math.hypot(x - CONE.x, (y - CONE.y) * 1.4);
        if (d > 2 && d < 6.5 && PIX.dith(x, y, 0.7 - d * 0.09)) f[y * W + x] = NEON.GLOW.c[f[y * W + x]];
      }
    }
    for (y = CONE.foot - 5; y <= CONE.foot; y++) {
      for (x = CONE.x - 30; x <= CONE.x + 30; x++) {
        var e = Math.pow((x - CONE.x) / 30, 2) + Math.pow((y - CONE.foot + 2) / 3.5, 2);
        if (e < 1 && PIX.dith(x, y, 0.45 * (1 - e))) f[y * W + x] = NEON.LIGHT[f[y * W + x]];
      }
    }
  }

  NEON.drops = drops;
  NEON.splashes = splashes;
  NEON.drips = drips;
  NEON.drawRain = drawRain;
  NEON.drawSplashes = drawSplashes;
  NEON.drawDrips = drawDrips;
  NEON.drawRings = drawRings;
  NEON.drawLamp = drawLamp;
})(S);
// pixel-neon-rain/src/scene.js
// Hujan Neon: composes the layers back to front. Every pixel of a frame is a
// pure function of the time t in seconds.
(function (G) {
  var PIX = G.PIX, NEON = G.NEON, W = PIX.W, H = PIX.H, NONE = PIX.NONE;

  // The sky and the far city never change, so they are baked into one frame,
  // and the clouds and searchlights only touch the sky left showing.
  var BG = PIX.fb();
  BG.set(NEON.SKY);
  PIX.blit(BG, NEON.FAR);
  for (var i = 0; i < W * H; i++) NEON.skyMask[i] = NEON.FAR.px[i] === NONE ? 1 : 0;

  var STEPS = [
    ["sky", function (f, t) { f.set(BG); NEON.drawClouds(f, t); NEON.drawBeams(f, t); }],
    ["far", function (f, t) { NEON.drawFar(f, t); NEON.drawKoi(f, t); NEON.drawCars(f, t, [0, 1]); NEON.drawBlimp(f, t); NEON.drawRain(f, t, "far"); }],
    ["mid", function (f, t) {
      PIX.blit(f, NEON.MID);
      NEON.drawMid(f, t);
      NEON.drawTrain(f, t);
      NEON.drawCars(f, t, [2, 3, 4]);
      NEON.drawRain(f, t, "mid");
    }],
    ["near", function (f, t) {
      PIX.blit(f, NEON.NEAR);
      NEON.drawNear(f, t);
      NEON.drawCables(f, t);
      NEON.drawSigns(f, t);
      NEON.drawShops(f, t);
    }],
    ["ground", function (f, t) { NEON.drawGround(f, t); NEON.drawRings(f, t); NEON.drawDrips(f, t); }],
    ["road", function (f, t) { NEON.drawTaxis(f, t); }],
    ["people", function (f, t) { NEON.drawPeople(f, t); }],
    ["steam", function (f, t) { NEON.drawSteam(f, t, "manhole"); }],
    ["lamp", function (f, t) { NEON.drawLamp(f, t); }],
    ["front", function (f) { PIX.blit(f, NEON.FRONT); }],
    ["rain", function (f, t) { NEON.drawRain(f, t, "near"); NEON.drawSplashes(f, t); }]
  ];

  // Renders frame t; `until` stops after the named step, for tests.
  function render(f, t, until) {
    for (var k = 0; k < STEPS.length; k++) {
      STEPS[k][1](f, t);
      if (STEPS[k][0] === until) return;
    }
  }

  NEON.BG = BG;
  NEON.render = render;
})(S);
  var fb = S.PIX.fb();
  return { w: S.PIX.W, h: S.PIX.H, draw: function (out, t) { S.NEON.render(fb, t); S.PIX.toRGBA(fb, out); } };
})();
