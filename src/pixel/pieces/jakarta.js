// Jakarta 02.00, bundled for the gallery by tools/build.mjs from ~/projects/pixel-night-city.
// Its modules get the private scope S instead of the page's global object. Do not edit by hand.
(globalThis.GALERI = globalThis.GALERI || {}).jakarta = (function () {
  var S = {};
// pixel-night-city/src/pixel.js
// Pixel engine: a 320x180 framebuffer of palette indices, drawing helpers, ordered dithering,
// a deterministic hash, and a 3x5 font. Colours never blend: a softer look is a dither pattern.
(function (G) {
  var W = 320, H = 180;

  var PALETTE = [
    ["void", "#06071a"], ["sky0", "#0a0c25"], ["sky1", "#0e1131"], ["sky2", "#14163e"],
    ["sky3", "#1b1b4b"], ["sky4", "#242257"], ["glow0", "#312862"], ["glow1", "#442d6a"],
    ["glow2", "#5b346f"], ["glow3", "#763e72"], ["starDim", "#6f77b8"], ["star", "#cdd3f7"],
    ["white", "#fffaf0"], ["moon0", "#d6c79c"], ["moon1", "#f5ecd2"], ["halo", "#2b2c68"],
    ["cloud0", "#1d1f4f"], ["cloud1", "#3a3070"], ["cloud2", "#6c6ca8"], ["mount0", "#171941"],
    ["mount1", "#23265a"], ["bld0", "#0e0f2f"], ["bld1", "#12143a"], ["bld2", "#181a45"],
    ["bld3", "#252a5d"], ["bld4", "#373e7a"], ["winOff", "#1f1d3a"], ["win1", "#8c5f2f"],
    ["win2", "#dfa33e"], ["win3", "#ffe08a"], ["winB", "#57b5d6"], ["pink0", "#6a1c56"],
    ["pink1", "#ff4f9a"], ["cyan0", "#124d64"], ["cyan1", "#48e3ff"], ["red", "#ff3b4e"],
    ["red0", "#5a1528"], ["lamp", "#ffd27a"], ["lamp0", "#6e5033"], ["cabin", "#fff1c0"],
    ["head", "#fffbe0"], ["tail", "#ff2f45"], ["gold", "#ffc23a"], ["gold0", "#b5741d"],
    ["road", "#0b0c22"], ["rail", "#1f2150"], ["water0", "#05081c"], ["water1", "#08102f"],
    ["water2", "#0e173f"], ["foam", "#39498c"], ["rlight", "#7a522b"], ["rpink", "#58194a"],
    ["rcyan", "#0e4156"], ["moonpath", "#c2cbf0"], ["pool", "#2c2332"]
  ];

  var C = {};
  PALETTE.forEach(function (p, i) { C[p[0]] = i; });

  var RGBA = new Uint32Array(PALETTE.length);
  PALETTE.forEach(function (p, i) {
    var v = parseInt(p[1].slice(1), 16);
    RGBA[i] = (0xff000000 | ((v & 255) << 16) | (v & 0xff00) | (v >> 16)) >>> 0;
  });

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

  // 4x4 Bayer thresholds: dith(x, y, a) is true on a share `a` (0..1) of the pixels, evenly spread.
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

  // 3x5 glyphs, one string of 0/1 per row; "." is one pixel wide.
  var FONT = {
    "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"], "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"], "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"], "7": ["111", "001", "001", "010", "010"],
    "8": ["111", "101", "111", "101", "111"], "9": ["111", "101", "111", "001", "111"],
    ".": ["0", "0", "0", "0", "1"], "W": ["101", "101", "101", "111", "101"],
    "A": ["010", "101", "111", "101", "101"], "R": ["110", "101", "110", "101", "101"],
    "K": ["101", "101", "110", "101", "101"], "O": ["010", "101", "101", "101", "010"],
    "P": ["110", "101", "110", "100", "100"]
  };

  // 5x5 capitals for the neon sign, where a 3-wide W would read as H.
  var BIG = {
    "W": ["10001", "10001", "10101", "10101", "01010"], "A": ["01110", "10001", "11111", "10001", "10001"],
    "R": ["11110", "10001", "11110", "10010", "10001"], "K": ["10001", "10010", "11100", "10010", "10001"],
    "O": ["01110", "10001", "10001", "10001", "01110"], "P": ["11110", "10001", "11110", "10000", "10000"]
  };

  function glyph(f, ch, x, y, c, font) {
    var rows = (font || FONT)[ch];
    for (var r = 0; r < 5; r++) for (var i = 0; i < rows[r].length; i++) {
      if (rows[r][i] === "1") pset(f, x + i, y + r, c);
    }
    return rows[0].length;
  }

  function text(f, s, x, y, c, font) {
    for (var i = 0; i < s.length; i++) x += glyph(f, s[i], x, y, c, font) + 1;
  }

  function toRGBA(f, out) {
    for (var i = 0; i < f.length; i++) out[i] = RGBA[f[i]];
  }

  G.PIX = { W: W, H: H, PALETTE: PALETTE, C: C, RGBA: RGBA, fb: fb, pset: pset, rect: rect,
    dith: dith, hash: hash, rng: rng, BIG: BIG, glyph: glyph, text: text, toRGBA: toRGBA };
})(S);
// pixel-night-city/src/world.js
// Static world of "Jakarta 02.00": fixed geometry plus everything generated once from a seeded
// RNG. Nothing here reads the clock; the renderers animate it as a pure function of t.
(function (G) {
  var PIX = G.PIX, W = PIX.W, H = PIX.H, C = PIX.C;
  var CITY = (G.CITY = G.CITY || {});
  var rnd = PIX.rng(20260928);

  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

  function pick(weighted) {
    var r = rnd(), acc = 0;
    for (var i = 0; i < weighted.length; i++) {
      acc += weighted[i][1];
      if (r < acc) return weighted[i][0];
    }
    return weighted[weighted.length - 1][0];
  }

  var GEO = {
    horizon: 120, waterline: 147, railY: 128, road: [138, 147],
    moon: { x: 64, y: 36, r: 10 },
    cloudBand: [44, 76],
    monas: { x: 206, top: 51, cup: 106 },
    tower: { x: 300, top: 52, base: 127 },
    sign: { x: 43, y: 79, w: 9, h: 39 },
    clock: { x: 262, y: 96, w: 23, h: 11 },
    beacons: [
      { x: 300, y: 51, phase: 0 },      // radio tower tip, the one the tests watch
      { x: 300, y: 82, phase: 0 },
      { x: 300, y: 104, phase: 0 },
      { x: 129, y: 61, phase: 0.7 },    // spire of the tallest office tower
      { x: 89, y: 79, phase: 1.1 }      // mast on the crown tower
    ]
  };

  // Roofs are held down in these spans so Monas and the volcanoes stay in view:
  // [first x, last x, highest roof row allowed].
  var LOW = {
    far: [[214, 272, 110]],
    mid: [[184, 222, 116], [222, 272, 111]],
    near: [[184, 222, 118], [222, 256, 112]]
  };

  function roofRow(layer, x, w, top) {
    var c = x + w / 2, zones = LOW[layer];
    for (var i = 0; i < zones.length; i++) {
      if (c >= zones[i][0] && c <= zones[i][1]) top = Math.max(top, zones[i][2]);
    }
    return top;
  }

  function roofKind() {
    var r = rnd();
    return r < 0.25 ? "tank" : r < 0.4 ? "antenna" : r < 0.55 ? "ac" : "none";
  }

  var x, w, i;

  var far = [];
  for (x = -3; x < W; ) {
    var tall = rnd() < 0.12;
    w = tall ? ri(4, 7) : ri(5, 12);
    far.push({ x: x, w: w, top: roofRow("far", x, w, tall ? ri(88, 97) : ri(101, 113)),
      antenna: tall && rnd() < 0.5 ? ri(2, 5) : 0 });
    x += w + (rnd() < 0.15 ? ri(1, 2) : 0);
  }

  var mid = [];
  for (x = -5; x < W; ) {
    w = ri(10, 22);
    mid.push({ x: x, w: w, top: roofRow("mid", x, w, ri(98, 116)), roof: roofKind() });
    x += w + (rnd() < 0.35 ? ri(1, 3) : 0);
  }

  var landmarks = [
    { x: 84, w: 12, top: 82, kind: "crown" },
    { x: 122, w: 15, top: 72, kind: "spire", spire: 10 },
    { x: 156, w: 11, top: 88, kind: "slant" }
  ];

  // Riverside shophouses (ruko), walked left to right around the two fixed houses.
  var signHouse = { x: 22, w: 27, top: 100, roof: "none" };
  var clockHouse = { x: 256, w: 39, top: 110, roof: "none" };
  var near = [];
  x = -2;
  [[signHouse.x, signHouse.x + signHouse.w], [clockHouse.x, clockHouse.x + clockHouse.w], [W + 2, W + 2]]
    .forEach(function (gap) {
      while (x < gap[0]) {
        var bw = ri(16, 28);
        if (gap[0] - (x + bw) < 12) bw = gap[0] - x;      // the last one before a gap fills it
        near.push({ x: x, w: bw, top: roofRow("near", x, bw, ri(106, 121)), roof: roofKind() });
        x += bw;
      }
      x = gap[1];
    });

  var SPEC = {
    far: { w: 1, h: 1, sx: 2, sy: 3, mx: 1, my: 2, bottom: 118, lit: 0.2, toggle: 0.03, tv: 0,
      off: 255, colours: [[C.win1, 0.75], [C.win2, 0.25]] },
    mid: { w: 1, h: 2, sx: 3, sy: 4, mx: 2, my: 3, bottom: 126, lit: 0.3, toggle: 0.1, tv: 0.01,
      off: C.winOff, colours: [[C.win1, 0.35], [C.win2, 0.35], [C.win3, 0.15], [C.winB, 0.15]] },
    mark: { w: 1, h: 1, sx: 2, sy: 3, mx: 2, my: 2, bottom: 126, lit: 0.26, toggle: 0.08, tv: 0,
      off: C.winOff, colours: [[C.winB, 0.45], [C.win3, 0.3], [C.win2, 0.25]] },
    near: { w: 2, h: 2, sx: 5, sy: 6, mx: 3, my: 4, bottom: 126, lit: 0.34, toggle: 0.12, tv: 0.03,
      off: C.winOff, colours: [[C.win1, 0.25], [C.win2, 0.45], [C.win3, 0.2], [C.winB, 0.1]] }
  };
  var windows = [], win = { far: [], mid: [], mark: [], near: [] };

  // A centred grid of windows on one building; each window is lit, off, a slow toggler or a TV.
  function addWindows(b, layer, over) {
    var s = Object.assign({}, SPEC[layer], over);
    var n = Math.floor((b.w - 2 * s.mx - s.w) / s.sx) + 1;
    var x0 = b.x + Math.floor((b.w - ((n - 1) * s.sx + s.w)) / 2);
    for (var y = (s.top === undefined ? b.top : s.top) + s.my; y + s.h - 1 <= s.bottom; y += s.sy) {
      for (var k = 0; k < n; k++) {
        var r = rnd(), wx = x0 + k * s.sx;
        var one = {
          x: wx, y: y, w: s.w, h: s.h, off: s.off, colour: pick(s.colours),
          kind: r < s.lit ? "lit" : r < s.lit + s.toggle ? "toggle" : r < s.lit + s.toggle + s.tv ? "tv" : "off",
          slot: ri(24, 70), phase: rnd() * 70, seed: windows.length + 1
        };
        if (wx >= 0 && wx + s.w <= W) { windows.push(one); win[layer].push(one); }
      }
    }
  }

  far.forEach(function (b) { addWindows(b, "far"); });
  mid.forEach(function (b) { addWindows(b, "mid"); });
  addWindows(landmarks[0], "mark", { top: landmarks[0].top + 4 });
  addWindows(landmarks[1], "mark", { top: landmarks[1].top + 3, w: landmarks[1].w - 4, sx: 99 });
  addWindows(landmarks[2], "mark", { top: landmarks[2].top + 7, h: 2, sx: 3, sy: 4 });
  near.concat([signHouse, clockHouse]).forEach(function (b) { addWindows(b, "near"); });

  var pillars = [];
  for (x = 8; x < W; x += 48) pillars.push(x);

  // Left edge of a lit bay inside a shopfront, as central as possible but clear of every pillar.
  function bayFor(sx, sw, bw) {
    for (var d = 0; d <= sw; d++) {
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        var bx = sx + ((sw - bw) >> 1) + sgn * d;
        if (bx < sx || bx + bw > sx + sw) continue;
        if (pillars.every(function (p) { return bx + bw <= p - 1 || bx >= p + 6; })) return bx;
      }
    }
    return null;
  }

  // Ground floors seen between the viaduct pillars: mostly shuttered at 2 AM, the warkop is open.
  var shops = near.concat([signHouse, clockHouse]).filter(function (b) { return b.w >= 8; })
    .map(function (b, n) {
      var warkop = b === signHouse, bw = Math.min(b.w - 4, warkop ? 12 : 8);
      var bx = warkop || (b !== clockHouse && n % 3 === 1) ? bayFor(b.x + 2, b.w - 4, bw) : null;
      return { x: b.x + 2, w: b.w - 4, open: bx !== null, bx: bx, bw: bw, warkop: warkop,
        warm: warkop || rnd() < 0.5, awning: pick([[C.red0, 0.4], [C.pink0, 0.3], [C.cyan0, 0.3]]) };
    });

  var trees = [];
  for (x = 185; x <= 227; x += ri(4, 6)) trees.push({ x: x, y: ri(113, 117), r: ri(2, 4) });

  var stars = [];
  while (stars.length < 140) {
    var sx = ri(0, W - 1), sy = Math.floor(Math.pow(rnd(), 1.7) * 86);
    var dx = sx - GEO.moon.x, dy = sy - GEO.moon.y;
    if (dx * dx + dy * dy < 22 * 22) continue;
    stars.push({ x: sx, y: sy, big: rnd() < 0.04, bright: rnd() * 0.8, period: 2 + rnd() * 6,
      phase: rnd() * 6.28 });
  }

  function inBlobs(blobs, px, py) {
    for (var j = 0; j < blobs.length; j++) {
      var bx = (px - blobs[j][0]) / blobs[j][2], by = (py - blobs[j][1]) / blobs[j][3];
      if (bx * bx + by * by <= 1) return true;
    }
    return false;
  }

  // A cloud is a few flat ellipses: moonlit on its upper left edge, lit pink from the city below.
  function cloudMask(cw, ch) {
    var blobs = [], mask = new Uint8Array(cw * ch).fill(255);
    for (var j = ri(3, 5); j > 0; j--) {
      blobs.push([ri(5, cw - 6), ri(ch >> 1, ch - 1), ri(6, Math.max(6, cw >> 2)), ri(2, ch - 1)]);
    }
    for (var y = 0; y < ch; y++) for (var px = 0; px < cw; px++) {
      if (!inBlobs(blobs, px, y)) continue;
      var up = y > 0 && inBlobs(blobs, px, y - 1), down = y < ch - 1 && inBlobs(blobs, px, y + 1);
      mask[y * cw + px] = !up ? (px < cw * 0.6 ? C.cloud2 : C.cloud1)
        : !down ? C.glow1
        : px > cw * 0.55 && PIX.dith(px, y, 0.5) ? C.cloud0 : C.cloud1;
    }
    return mask;
  }

  var clouds = [];
  for (i = 0; i < 5; i++) {
    var cw = ri(34, 78), ch = ri(5, 8);
    clouds.push({ w: cw, h: ch, mask: cloudMask(cw, ch), y: ri(GEO.cloudBand[0], GEO.cloudBand[1] - ch),
      x0: rnd() * (W + cw), speed: 1.2 + rnd() * 2.2 });
  }

  // Pangrango and Gede between Monas and the clock, low hills elsewhere: [peak x, peak row, steepness].
  var PEAKS = [[231, 96, 0.5], [256, 99, 0.55], [36, 111, 0.22], [128, 113, 0.3], [318, 107, 0.45]];
  var mountain = new Int16Array(W);
  for (x = 0; x < W; x++) {
    var m = 124;
    for (i = 0; i < PEAKS.length; i++) {
      m = Math.min(m, PEAKS[i][1] + Math.pow(Math.abs(x - PEAKS[i][0]), 1.18) * PEAKS[i][2]);
    }
    if (Math.abs(x - 256) <= 1) m += 1;                   // Gede's crater
    mountain[x] = Math.round(m + PIX.hash(x, 7, 1) * 1.2);
  }

  var streetlights = [], masts = [];
  for (x = 14; x < W; x += 40) streetlights.push(x);
  for (x = 30; x < W; x += 64) masts.push(x);

  var lanes = [
    { dir: 1, y: GEO.road[0] + 1, speed: 26, vehicles: [
      { x0: 12, len: 8, kind: "car", colour: C.bld4 },
      { x0: 118, len: 18, kind: "bus", colour: C.cyan0 },
      { x0: 214, len: 8, kind: "car", colour: C.red0 },
      { x0: 306, len: 4, kind: "moto", colour: C.bld3 }] },
    { dir: -1, y: GEO.road[0] + 4, speed: 34, vehicles: [
      { x0: 20, len: 8, kind: "car", colour: C.starDim },
      { x0: 104, len: 4, kind: "moto", colour: C.bld3 },
      { x0: 190, len: 8, kind: "car", colour: C.gold0 },
      { x0: 290, len: 9, kind: "taxi", colour: C.cyan0 }] }
  ];

  var ripples = [];
  for (i = 0; i < 46; i++) {
    ripples.push({ x0: rnd() * W, k: ri(2, H - GEO.waterline - 1), len: ri(2, 6),
      speed: (rnd() < 0.5 ? -1 : 1) * (2 + rnd() * 5) });
  }

  CITY.GEO = GEO;
  CITY.WORLD = {
    far: far, mid: mid, landmarks: landmarks, near: near, signHouse: signHouse, clockHouse: clockHouse,
    windows: windows, win: win, shops: shops, trees: trees, stars: stars, clouds: clouds,
    mountain: mountain, streetlights: streetlights, pillars: pillars, masts: masts, lanes: lanes,
    ripples: ripples
  };
})(S);
// pixel-night-city/src/sky.js
// Sky of "Jakarta 02.00": a banded gradient with dithered seams, the moon and its halo, the
// Gede-Pangrango silhouette (all baked once), then twinkling stars, a meteor and drifting clouds.
(function (G) {
  var PIX = G.PIX, W = PIX.W, C = PIX.C, pset = PIX.pset, dith = PIX.dith, hash = PIX.hash;
  var CITY = G.CITY, GEO = CITY.GEO, WORLD = CITY.WORLD;
  var WL = GEO.waterline;

  // [first row, colour] from the top; the 4 rows above each boundary blend by ordered dither.
  var BANDS = [[0, C.void], [12, C.sky0], [28, C.sky1], [44, C.sky2], [60, C.sky3],
    [74, C.sky4], [86, C.glow0], [97, C.glow1], [106, C.glow2], [113, C.glow3]];

  // [dx, dy, radius] from the moon's centre.
  var CRATERS = [[-4, -3, 1.6], [3, 2, 1.3], [-1, 5, 1], [5, -4, 0.9], [-5, 3, 0.8]];

  // One meteor every 17 s, 0.8 s long, starting somewhere in the upper right.
  var METEOR = { offset: 9, period: 17, dur: 0.8, speed: 170 };

  function gradient(bg) {
    for (var y = 0, i = 0; y < WL; y++) {
      while (i + 1 < BANDS.length && BANDS[i + 1][0] <= y) i++;
      var next = BANDS[i + 1], k = next ? (5 - (next[0] - y)) / 5 : 0;
      for (var x = 0; x < W; x++) bg[y * W + x] = k > 0 && dith(x, y, k) ? next[1] : BANDS[i][1];
    }
  }

  function moonPixel(x, y, dx, dy, d, r) {
    for (var i = 0; i < CRATERS.length; i++) {
      var cx = dx - CRATERS[i][0], cy = dy - CRATERS[i][1];
      if (cx * cx + cy * cy <= CRATERS[i][2] * CRATERS[i][2]) return C.moon0;
    }
    var s = (dx * 0.6 + dy * 0.4) / r;                    // lit from the upper left
    if (s > 0.55 || (s > 0.3 && dith(x, y, 0.5))) return C.moon0;
    return d > r - 1.2 && s < -0.35 ? C.white : C.moon1;
  }

  function moon(bg) {
    var m = GEO.moon, R = m.r + 8;
    for (var y = m.y - R; y <= m.y + R; y++) for (var x = m.x - R; x <= m.x + R; x++) {
      var dx = x - m.x, dy = y - m.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d <= m.r) bg[y * W + x] = moonPixel(x, y, dx, dy, d, m.r);
      else if (d <= R && dith(x, y, 0.8 * Math.pow(1 - (d - m.r) / 8, 1.5))) bg[y * W + x] = C.halo;
    }
  }

  function mountains(bg) {
    var mt = WORLD.mountain;
    for (var x = 0; x < W; x++) {
      var lit = x > 0 && mt[x] < mt[x - 1];               // slopes climbing to the right face the moon
      for (var y = mt[x]; y < WL; y++) {
        bg[y * W + x] = y === mt[x] || (lit && y === mt[x] + 1) ? C.mount1 : C.mount0;
      }
    }
  }

  function stars(f, t) {
    var list = WORLD.stars;
    for (var i = 0; i < list.length; i++) {
      var s = list[i], v = s.bright + 0.25 * Math.sin(t * 6.2832 / s.period + s.phase);
      if (v < 0.3) continue;
      if (s.big && v > 0.62) {
        pset(f, s.x, s.y, C.white);
        pset(f, s.x - 1, s.y, C.starDim); pset(f, s.x + 1, s.y, C.starDim);
        pset(f, s.x, s.y - 1, C.starDim); pset(f, s.x, s.y + 1, C.starDim);
      } else {
        pset(f, s.x, s.y, v > 0.62 ? C.star : C.starDim);
      }
    }
  }

  function meteor(t) {
    var n = Math.floor((t - METEOR.offset) / METEOR.period), p = t - METEOR.offset - n * METEOR.period;
    if (p > METEOR.dur) return null;
    var sx = 150 + hash(n, 1, 2) * 150, sy = 4 + hash(n, 3, 4) * 24, run = METEOR.speed * p;
    return { x: sx - 0.88 * run, y: sy + 0.47 * run, p: p };
  }

  function drawMeteor(f, m) {
    var tail = Math.round(16 * Math.min(1, m.p / 0.15, (METEOR.dur - m.p) / 0.2));
    for (var i = tail; i >= 0; i--) {
      var x = Math.round(m.x + 0.88 * i), y = Math.round(m.y - 0.47 * i);
      if (y >= 86 || (i > 8 && !dith(x, y, 0.5))) continue;
      pset(f, x, y, i === 0 ? C.white : i < 4 ? C.star : i < 9 ? C.starDim : C.halo);
    }
  }

  function clouds(f, t) {
    var list = WORLD.clouds;
    for (var i = 0; i < list.length; i++) {
      var c = list[i], span = W + c.w + 20;
      var x0 = Math.round(((c.x0 + c.speed * t) % span + span) % span) - c.w - 10;
      for (var y = 0; y < c.h; y++) for (var x = 0; x < c.w; x++) {
        var v = c.mask[y * c.w + x];
        if (v !== 255) pset(f, x0 + x, c.y + y, v);
      }
    }
  }

  var BG = new Uint8Array(W * WL);
  gradient(BG);
  moon(BG);
  mountains(BG);

  CITY.meteor = meteor;
  CITY.drawSky = function (f, t) {
    f.set(BG);
    stars(f, t);
    var m = meteor(t);
    if (m) drawMeteor(f, m);
    clouds(f, t);
  };
})(S);
// pixel-night-city/src/city.js
// City of "Jakarta 02.00", back to front: far skyline, radio tower, mid blocks, Monas, office
// towers, riverside shophouses, the WARKOP sign and the rooftop clock. Windows switch in slow
// seeded slots, so the layer stays a pure function of t.
(function (G) {
  var PIX = G.PIX, C = PIX.C, rect = PIX.rect, pset = PIX.pset, dith = PIX.dith, hash = PIX.hash;
  var CITY = G.CITY, GEO = CITY.GEO, WORLD = CITY.WORLD;
  var BOTTOM = GEO.road[0], SHOP_Y = GEO.railY + 5;

  var SHADE = {};
  SHADE[C.win3] = C.win2; SHADE[C.win2] = C.win1; SHADE[C.win1] = C.win1; SHADE[C.winB] = C.cyan0;

  // Monas: flame rows as [left, right] offsets from the axis, then the cup ("cawan") rows.
  var FLAME = [[0, 0], [0, 0], [-1, 0], [-1, 1], [-1, 1], [-2, 1], [-2, 2], [-1, 1]];
  var CUP = [[-11, C.starDim], [-10, C.bld4], [-8, C.bld4], [-6, C.bld3]];

  // One clock minute per 2 seconds, starting at 02.00.
  function clockText(t) {
    var m = 120 + Math.floor(t / 2), hh = Math.floor(m / 60) % 24, mm = m % 60;
    return (hh < 10 ? "0" : "") + hh + "." + (mm < 10 ? "0" : "") + mm;
  }

  function windowColour(w, t) {
    if (w.kind === "lit") return w.colour;
    if (w.kind === "tv") return hash(w.seed, Math.floor(t * 7), 3) < 0.55 ? C.winB : C.cyan0;
    if (w.kind === "toggle") {
      return hash(w.seed, Math.floor((t + w.phase) / w.slot), 11) < 0.55 ? w.colour : w.off;
    }
    return w.off;
  }

  function drawWindows(f, list, t) {
    for (var i = 0; i < list.length; i++) {
      var w = list[i], c = windowColour(w, t);
      if (c === 255) continue;                            // an unlit far window is just wall
      rect(f, w.x, w.y, w.w, w.h, c);
      if (w.w > 1 && w.h > 1 && SHADE[c] !== undefined) rect(f, w.x, w.y + w.h - 1, w.w, 1, SHADE[c]);
    }
  }

  function block(f, b, body, rim, top) {
    var y = top === undefined ? b.top : top;
    rect(f, b.x, y, b.w, BOTTOM - y, body);
    rect(f, b.x, y, 1, BOTTOM - y, rim);
    rect(f, b.x, y, b.w, 1, rim);
  }

  function roofDetail(f, b, c) {
    var x = b.x, y = b.top;
    if (b.roof === "tank") {                              // tandon: a water tank on legs
      rect(f, x + 4, y - 4, 3, 1, c);
      rect(f, x + 3, y - 3, 5, 2, c);
      pset(f, x + 3, y - 1, c); pset(f, x + 7, y - 1, c);
    } else if (b.roof === "antenna") {
      rect(f, x + b.w - 4, y - 7, 1, 7, c);
      rect(f, x + b.w - 6, y - 5, 5, 1, c);
      rect(f, x + b.w - 5, y - 3, 3, 1, c);
    } else if (b.roof === "ac") {
      rect(f, x + 2, y - 2, 3, 2, c);
      rect(f, x + 7, y - 2, 3, 2, c);
    }
  }

  function beacon(f, b, t) {
    var on = ((t + b.phase) % 1.5 + 1.5) % 1.5 < 0.35;
    pset(f, b.x, b.y, on ? C.red : C.red0);
    if (on) { pset(f, b.x - 1, b.y, C.red0); pset(f, b.x + 1, b.y, C.red0); pset(f, b.x, b.y - 1, C.red0); }
  }

  function farLayer(f, t) {
    WORLD.far.forEach(function (b) {
      rect(f, b.x, b.top, b.w, BOTTOM - b.top, C.bld3);
      if (b.antenna) rect(f, b.x + (b.w >> 1), b.top - b.antenna, 1, b.antenna, C.bld3);
    });
    drawWindows(f, WORLD.win.far, t);
  }

  function radioTower(f, t) {
    var T = GEO.tower, cx = T.x, y0 = T.top + 6, n = T.base - y0;
    rect(f, cx, T.top, 1, 6, C.bld3);
    for (var y = y0; y < T.base; y++) {
      var hw = Math.round(1 + 4 * (y - y0) / n), p = (y - y0) % 7, o = Math.round(hw * (1 - 2 * p / 7));
      pset(f, cx - hw, y, C.bld3); pset(f, cx + hw, y, C.bld3);
      if (p === 0) rect(f, cx - hw, y, 2 * hw + 1, 1, C.bld3);
      else { pset(f, cx + o, y, C.bld2); pset(f, cx - o, y, C.bld2); }
    }
    for (var i = 0; i < 3; i++) beacon(f, GEO.beacons[i], t);
  }

  function midLayer(f, t) {
    WORLD.mid.forEach(function (b) { block(f, b, C.bld2, C.bld3); roofDetail(f, b, C.bld2); });
    drawWindows(f, WORLD.win.mid, t);
  }

  function tree(f, tr) {
    for (var y = -tr.r; y <= tr.r; y++) for (var x = -tr.r; x <= tr.r; x++) {
      if (x * x + y * y > tr.r * tr.r + 1) continue;
      pset(f, tr.x + x, tr.y + y, x + y < 1 - tr.r ? C.bld2 : C.bld1);   // rim toward the moon
    }
  }

  function monas(f, t) {
    var M = GEO.monas, cx = M.x, tick = Math.floor(t * 9), r, y;
    for (r = 0; r < FLAME.length; r++) {
      if (r === 0 && hash(1, tick, 5) < 0.35) continue;  // the tip licks up and down
      for (var dx = FLAME[r][0]; dx <= FLAME[r][1]; dx++) {
        var h = hash(dx + 9, r, tick), edge = dx === FLAME[r][0] || dx === FLAME[r][1];
        pset(f, cx + dx, M.top + r,
          r === FLAME.length - 1 ? C.gold0 : h < 0.25 ? C.lamp : edge && h > 0.6 ? C.gold0 : C.gold);
      }
    }
    y = M.top + FLAME.length;
    rect(f, cx - 2, y, 5, 1, C.starDim);
    rect(f, cx - 2, y + 1, 5, 1, C.bld4);
    for (y += 2; y < M.cup; y++) {                        // floodlit shaft, widening near the cup
      var hw = y < M.cup - 12 ? 1 : 2;
      rect(f, cx - hw, y, hw + 1, 1, C.starDim);
      rect(f, cx + 1, y, hw, 1, C.bld4);
    }
    for (r = 0; r < CUP.length; r++) rect(f, cx + CUP[r][0], M.cup + r, 1 - 2 * CUP[r][0], 1, CUP[r][1]);
    rect(f, cx - 4, M.cup + 4, 9, 8, C.bld4);
    rect(f, cx - 4, M.cup + 4, 3, 8, C.starDim);
    WORLD.trees.forEach(function (tr) { tree(f, tr); });
  }

  function landmark(f, b) {
    var axis = b.x + (b.w >> 1);
    if (b.kind === "crown") {
      rect(f, b.x + 2, b.top, b.w - 4, 2, C.bld3);
      rect(f, b.x + 1, b.top + 2, b.w - 2, 2, C.bld2);
      block(f, b, C.bld2, C.bld3, b.top + 4);
      for (var x = b.x + 1; x < b.x + b.w - 1; x += 2) pset(f, x, b.top + 4, C.winB);
      rect(f, axis - 1, b.top - 2, 1, 2, C.bld3);
    } else if (b.kind === "spire") {
      rect(f, b.x + 2, b.top, b.w - 4, 3, C.bld3);
      block(f, b, C.bld2, C.bld3, b.top + 3);
      rect(f, axis, b.top - b.spire, 1, b.spire, C.bld3);
    } else {
      for (var i = 0; i < b.w; i++) {                     // roof slanting up to the right
        var top = b.top + Math.round((b.w - 1 - i) * 0.7);
        rect(f, b.x + i, top, 1, BOTTOM - top, i === 0 ? C.bld3 : C.bld2);
        pset(f, b.x + i, top, C.bld3);
      }
    }
  }

  // Ground floor: rolling shutters, and in an open shop one lit bay under a striped awning.
  function shop(f, s) {
    var h = BOTTOM - SHOP_Y, i;
    for (i = 0; i < h; i++) rect(f, s.x, SHOP_Y + i, s.w, 1, i & 1 ? C.bld2 : C.bld1);
    if (!s.open) return;
    var bw = s.bw, bx = s.bx;
    for (i = 0; i < bw; i++) pset(f, bx + i, SHOP_Y, i & 1 ? C.starDim : s.awning);
    rect(f, bx, SHOP_Y + 1, bw, h - 1, s.warm ? C.win2 : C.win1);
    rect(f, bx + 1, BOTTOM - 2, bw - 2, 2, C.bld1);       // counter
    if (!s.warkop) return;
    [2, 7].forEach(function (dx) {                        // two night owls over their coffee
      pset(f, bx + dx + 1, BOTTOM - 4, C.bld0);
      rect(f, bx + dx, BOTTOM - 3, 3, 1, C.bld0);
    });
  }

  function nearLayer(f, t) {
    WORLD.near.forEach(function (b) { block(f, b, C.bld1, C.bld2); roofDetail(f, b, C.bld2); });
    [WORLD.signHouse, WORLD.clockHouse].forEach(function (b) { block(f, b, C.bld1, C.bld2); });
    drawWindows(f, WORLD.win.near, t);
    WORLD.shops.forEach(function (s) { shop(f, s); });
  }

  function haze(f, x0, y0, x1, y1, a, c) {
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (dith(x, y, a)) pset(f, x, y, c);
  }

  // Vertical neon over the warkop; the K stutters for a couple of seconds every 9 s.
  function warkopSign(f, t) {
    var s = GEO.sign, flick = t % 9 < 2.2 && hash(7, Math.floor(t * 12), 1) < 0.5;
    haze(f, s.x - 2, s.y - 2, s.x + s.w + 1, s.y + s.h + 1, 0.3, C.pink0);
    rect(f, s.x - 3, s.y + 6, 3, 1, C.bld2);
    rect(f, s.x - 3, s.y + s.h - 8, 3, 1, C.bld2);
    rect(f, s.x, s.y, s.w, s.h, C.pink0);
    rect(f, s.x + 1, s.y + 1, s.w - 2, s.h - 2, C.bld0);
    "WARKOP".split("").forEach(function (ch, i) {
      PIX.glyph(f, ch, s.x + 2, s.y + 2 + i * 6, i === 3 && flick ? C.pink0 : C.pink1, PIX.BIG);
    });
  }

  function rooftopClock(f, t) {
    var k = GEO.clock, legs = WORLD.clockHouse.top - k.y - k.h;
    rect(f, k.x + 4, k.y + k.h, 1, legs, C.bld2);
    rect(f, k.x + k.w - 5, k.y + k.h, 1, legs, C.bld2);
    haze(f, k.x - 1, k.y - 1, k.x + k.w, k.y + k.h, 0.35, C.cyan0);
    rect(f, k.x, k.y, k.w, k.h, C.cyan0);
    rect(f, k.x + 1, k.y + 1, k.w - 2, k.h - 2, C.void);
    PIX.text(f, clockText(t), k.x + 3, k.y + 3, C.cyan1);
    if (t % 2 >= 1) pset(f, k.x + 11, k.y + 7, C.void);   // the separator blinks
  }

  CITY.clockText = clockText;
  CITY.drawCity = function (f, t) {
    farLayer(f, t);
    radioTower(f, t);
    midLayer(f, t);
    monas(f, t);
    WORLD.landmarks.forEach(function (b) { landmark(f, b); });
    drawWindows(f, WORLD.win.mark, t);
    beacon(f, GEO.beacons[3], t);
    beacon(f, GEO.beacons[4], t);
    nearLayer(f, t);
    warkopSign(f, t);
    rooftopClock(f, t);
  };
})(S);
// pixel-night-city/src/traffic.js
// Riverside traffic of "Jakarta 02.00": the MRT viaduct and its train, the road with cars, a bus,
// a taxi and motorbikes, and the streetlights. Every position is a pure function of t.
(function (G) {
  var PIX = G.PIX, W = PIX.W, C = PIX.C, rect = PIX.rect, pset = PIX.pset, dith = PIX.dith;
  var CITY = G.CITY, GEO = CITY.GEO, WORLD = CITY.WORLD;
  var RY = GEO.railY, ROAD0 = GEO.road[0], ROAD1 = GEO.road[1], LOOP = W + 80;

  // A train every 24 s, alternating direction; a run lasts (W + len) / speed seconds.
  var TRAIN = { offset: 4, period: 24, speed: 110, cars: 3, carLen: 38, gap: 2 };
  TRAIN.len = TRAIN.cars * TRAIN.carLen + (TRAIN.cars - 1) * TRAIN.gap;

  function mod(a, n) { return ((a % n) + n) % n; }

  function train(t) {
    var n = Math.floor((t - TRAIN.offset) / TRAIN.period), p = t - TRAIN.offset - n * TRAIN.period;
    if (p * TRAIN.speed > W + TRAIN.len) return null;
    var dir = mod(n, 2) === 0 ? 1 : -1;
    return { x: dir > 0 ? p * TRAIN.speed - TRAIN.len : W - p * TRAIN.speed, dir: dir, len: TRAIN.len };
  }

  // Vehicles loop around a track a little wider than the screen, so they enter and leave smoothly.
  function cars(t) {
    var out = [];
    WORLD.lanes.forEach(function (lane) {
      lane.vehicles.forEach(function (v) {
        out.push({ x: mod(v.x0 + lane.dir * lane.speed * t, LOOP) - 40, y: lane.y, dir: lane.dir,
          len: v.len, kind: v.kind, colour: v.colour });
      });
    });
    return out;
  }

  function viaduct(f) {
    rect(f, 0, RY - 10, W, 1, C.rail);                    // catenary wire and masts
    WORLD.masts.forEach(function (x) { rect(f, x, RY - 10, 1, 10, C.rail); });
    rect(f, 0, RY, W, 1, C.bld4);                         // rail head
    rect(f, 0, RY + 1, W, 2, C.bld2);                     // box girder
    rect(f, 0, RY + 3, W, 1, C.bld1);
    WORLD.pillars.forEach(function (x) {
      rect(f, x - 1, RY + 4, 7, 1, C.bld2);
      rect(f, x, RY + 5, 5, ROAD0 - RY - 5, C.bld2);
      rect(f, x, RY + 5, 1, ROAD0 - RY - 5, C.bld3);
    });
  }

  // nose/tail: which end (-1 left, +1 right, 0 none) carries the windscreen or the tail lamp.
  function trainCar(f, x, nose, tail) {
    var L = TRAIN.carLen, top = RY - 8, xr = x + L - 1;
    rect(f, x + (nose < 0 ? 4 : 2), top, L - 4 - (nose ? 2 : 0), 1, C.bld4);
    rect(f, x + (nose < 0 ? 1 : 0), top + 1, L - (nose ? 1 : 0), 1, C.starDim);
    rect(f, x, top + 2, L, 3, C.starDim);
    for (var px = x + 3; px < xr - 2; px++) {
      if ((px - x - 3) % 6 < 4) rect(f, px, top + 2, 1, 3, C.cabin);
    }
    rect(f, x, top + 5, L, 1, C.winB);                    // blue stripe
    rect(f, x, top + 6, L, 1, C.bld4);
    rect(f, x + 4, top + 7, 6, 1, C.bld0);                // bogies
    rect(f, xr - 9, top + 7, 6, 1, C.bld0);
    if (nose) {
      var fx = nose > 0 ? xr : x;
      rect(f, fx, top + 2, 1, 2, C.bld0);
      pset(f, fx, top + 5, C.head);
    }
    if (tail) pset(f, tail > 0 ? xr : x, top + 5, C.tail);
  }

  function drawTrain(f, tr) {
    var x0 = Math.round(tr.x), step = TRAIN.carLen + TRAIN.gap;
    for (var i = 0; i < TRAIN.cars; i++) {
      var first = i === 0, last = i === TRAIN.cars - 1;
      var nose = tr.dir > 0 ? (last ? 1 : 0) : (first ? -1 : 0);
      var tail = tr.dir > 0 ? (first ? -1 : 0) : (last ? 1 : 0);
      trainCar(f, x0 + i * step, nose, tail);
      if (!last) rect(f, x0 + i * step + TRAIN.carLen, RY - 5, TRAIN.gap, 2, C.bld0);   // gangway
    }
  }

  function road(f) {
    rect(f, 0, ROAD0, W, 1, C.bld2);                      // kerb
    rect(f, 0, ROAD0 + 1, W, ROAD1 - ROAD0 - 2, C.road);
    for (var x = 0; x < W; x += 8) rect(f, x, ROAD0 + 4, 4, 1, C.bld1);
    rect(f, 0, ROAD1 - 1, W, 1, C.rail);                  // riverside railing
    for (x = 2; x < W; x += 6) pset(f, x, ROAD1 - 2, C.rail);
  }

  // A soft cone under each lamp: dark warm pool at the rim, sodium orange only near the middle.
  function lampPools(f) {
    WORLD.streetlights.forEach(function (sx) {
      var cx = sx + 3;
      for (var y = ROAD0 + 1; y < ROAD1 - 1; y++) {
        var hw = 1.5 + (y - ROAD0) * 0.75;
        for (var x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
          var a = 1 - Math.abs(x - cx) / (hw + 0.5);
          if (a <= 0) continue;
          if (dith(x, y, a * 0.8)) pset(f, x, y, C.pool);
          if (dith(x, y, (a - 0.5) * 0.9)) pset(f, x, y, C.lamp0);
        }
      }
    });
  }

  function vehicle(f, v) {
    var x = Math.round(v.x), y = v.y, L = v.len, d = v.dir;
    var fx = d > 0 ? x + L - 1 : x, rx = d > 0 ? x : x + L - 1;
    if (v.kind === "moto") {
      rect(f, x + 1, y, 2, 1, C.bld3);                    // rider
      rect(f, x, y + 1, L, 1, v.colour);
      pset(f, x, y + 2, C.bld0); pset(f, x + L - 1, y + 2, C.bld0);
    } else if (v.kind === "bus") {
      rect(f, x + 1, y - 1, L - 2, 1, v.colour);
      rect(f, x, y, L, 2, v.colour);
      for (var i = 2; i < L - 2; i += 3) rect(f, x + i, y, 2, 1, C.win2);
      rect(f, x + 1, y + 2, L - 2, 1, C.bld0);
    } else {
      rect(f, x + 2, y, L - 4, 1, v.colour);
      rect(f, x, y + 1, L, 1, v.colour);
      rect(f, x + 1, y + 2, L - 2, 1, C.bld0);
      if (v.kind === "taxi") pset(f, x + (L >> 1), y - 1, C.win3);
    }
    pset(f, fx, y + 1, C.head);
    pset(f, rx, y + 1, C.tail);
    for (var k = 1; k <= 5; k++) {                        // headlight throw on the asphalt
      var bx = fx + d * k;
      if (dith(bx, y + 1, 1 - k * 0.17)) pset(f, bx, y + 1, k < 3 ? C.lamp0 : C.pool);
      if (dith(bx, y + 2, 0.8 - k * 0.15)) pset(f, bx, y + 2, C.pool);
    }
  }

  function streetlights(f) {
    WORLD.streetlights.forEach(function (sx) {
      rect(f, sx, RY + 4, 1, ROAD1 - RY - 4, C.bld3);     // pole down to the railing
      rect(f, sx, RY + 4, 4, 1, C.bld3);                  // arm
      rect(f, sx + 2, RY + 5, 2, 1, C.lamp);
      for (var x = sx + 1; x <= sx + 4; x++) if (dith(x, RY + 6, 0.5)) pset(f, x, RY + 6, C.lamp0);
    });
  }

  CITY.TRAIN = TRAIN;
  CITY.train = train;
  CITY.cars = cars;
  CITY.drawTraffic = function (f, t) {
    viaduct(f);
    var tr = train(t);
    if (tr) drawTrain(f, tr);
    road(f);
    lampPools(f);
    cars(t).forEach(function (v) { vehicle(f, v); });
    streetlights(f);
  };
})(S);
// pixel-night-city/src/water.js
// Canal of "Jakarta 02.00": a rippled, slightly stretched mirror of everything above the
// waterline, recoloured so lights stay lights and the rest sinks into water shades, plus the
// moon path, drifting ripples and a fishing boat with a lantern.
(function (G) {
  var PIX = G.PIX, W = PIX.W, H = PIX.H, C = PIX.C, rect = PIX.rect, pset = PIX.pset, hash = PIX.hash;
  var CITY = G.CITY, GEO = CITY.GEO, WORLD = CITY.WORLD;
  var WL = GEO.waterline, DEPTH = H - WL, STRETCH = 1.25;

  var MIRROR = {
    void: "water0", sky0: "water0", sky1: "water0", sky2: "water1", sky3: "water1", sky4: "water1",
    glow0: "water2", glow1: "water2", glow2: "water2", glow3: "foam", starDim: "water2",
    star: "moonpath", white: "moonpath", moon0: "moonpath", moon1: "moonpath", halo: "water1",
    cloud0: "water1", cloud1: "water2", cloud2: "water2", mount0: "water0", mount1: "water1",
    bld0: "water0", bld1: "water0", bld2: "water0", bld3: "water1", bld4: "water1", winOff: "water0",
    win1: "rlight", win2: "rlight", win3: "rlight", winB: "rcyan", pink0: "rpink", pink1: "rpink",
    cyan0: "rcyan", cyan1: "rcyan", red: "rpink", red0: "water1", lamp: "rlight", lamp0: "water2",
    cabin: "rlight", head: "rlight", tail: "rpink", gold: "rlight", gold0: "rlight", road: "water0",
    rail: "water1", water0: "water0", water1: "water1", water2: "water2", foam: "foam",
    rlight: "rlight", rpink: "rpink", rcyan: "rcyan", moonpath: "moonpath", pool: "water1"
  };
  var REFLECT = new Uint8Array(PIX.PALETTE.length), LIGHT = new Uint8Array(PIX.PALETTE.length);
  var DEEPER = new Uint8Array(PIX.PALETTE.length);
  PIX.PALETTE.forEach(function (p, i) {
    if (!(MIRROR[p[0]] in C)) throw new Error("water.js: no reflection for colour " + p[0]);
    REFLECT[i] = C[MIRROR[p[0]]];
    DEEPER[i] = i;
  });
  [C.rlight, C.rpink, C.rcyan].forEach(function (i) { LIGHT[i] = 1; });
  DEEPER[C.water2] = C.water1; DEEPER[C.water1] = C.water0; DEEPER[C.foam] = C.water2;

  // One fishing boat drifts right across the canal every 70 s.
  var BOAT = { period: 70, speed: 6, y: WL + 12 };

  // Rows alternate their sideways shift (the zigzag that reads as water at this scale), and a
  // light may borrow from the source row above, so lamps stretch into broken vertical streaks.
  function reflect(f, t) {
    var tick = Math.floor(t * 4);
    for (var k = 0; k < DEPTH; k++) {
      var s = WL - 1 - Math.floor(k * STRETCH), src = s * W, above = (s - 1) * W, row = (WL + k) * W;
      var amp = 0.4 + k * 0.05, zig = k > 2 ? (k & 1 ? 1 : -1) : 0, trough = k % 3 === 2;
      var dx = zig + Math.round(Math.sin(k * 0.7 + t * 1.9) * amp + Math.sin(k * 1.9 - t * 2.7) * 0.5);
      for (var x = 0; x < W; x++) {
        var sx = x + dx;
        sx = sx < 0 ? 0 : sx >= W ? W - 1 : sx;
        var c = REFLECT[f[src + sx]];
        if (!LIGHT[c] && k > 1 && LIGHT[REFLECT[f[above + sx]]] && hash(x, k, tick) < 0.45) c = REFLECT[f[above + sx]];
        if (LIGHT[c]) { if (hash(x, k, tick + 97) < 0.15) c = C.water1; }  // light breaks on the waves
        else if (k === 0) c = C.water0;                                    // shadow of the embankment
        else if (trough) c = DEEPER[c];
        f[row + x] = c;
      }
    }
  }

  // Glints under the moon: one short dash per row, each row on its own slow random clock.
  function moonPath(f, t) {
    var mx = GEO.moon.x;
    for (var k = 1; k < DEPTH; k++) {
      var slot = Math.floor(t * 3 + hash(k, 5, 0) * 3);
      if (hash(k, slot, 9) > 0.62) continue;
      var hl = Math.floor(k / 10), cx = mx + Math.round((hash(k, slot, 4) - 0.5) * (1.5 + k * 0.1));
      for (var x = cx - hl - 1; x <= cx + hl + 1; x++) pset(f, x, WL + k, Math.abs(x - cx) <= hl ? C.moonpath : C.starDim);
    }
  }

  function ripples(f, t) {
    WORLD.ripples.forEach(function (r) {
      var span = W + 12, x0 = Math.round(((r.x0 + r.speed * t) % span + span) % span) - 6;
      var row = (WL + r.k) * W;
      for (var i = 0; i < r.len; i++) {
        var x = x0 + i;
        if (x >= 0 && x < W && (f[row + x] === C.water0 || f[row + x] === C.water1)) f[row + x] = C.water2;
      }
    });
  }

  function boat(t) {
    var p = ((t + 25) % BOAT.period + BOAT.period) % BOAT.period, x = p * BOAT.speed - 24;
    return x > W ? null : { x: x, y: BOAT.y + Math.round(Math.sin(t * 1.7) * 0.6) };
  }

  function drawBoat(f, b, t) {
    var x = Math.round(b.x), y = b.y, lx = x + 12;
    for (var k = 2; k < 13; k++) {                        // the lantern on the water
      if (hash(k, Math.floor(t * 5), 3) < 0.6) pset(f, lx + Math.round(Math.sin(t * 3 + k) * 0.8), y + k, C.rlight);
    }
    rect(f, x + 1, y - 1, 18, 1, C.bld4);                 // gunwale with raised bow and stern
    pset(f, x, y - 2, C.bld4); pset(f, x + 19, y - 2, C.bld4);
    rect(f, x + 2, y, 16, 1, C.bld1);
    rect(f, x + 4, y + 1, 12, 1, C.bld0);
    rect(f, x + 6, y - 4, 2, 3, C.bld0);                  // fisherman in a caping hat
    rect(f, x + 5, y - 5, 4, 1, C.bld2);
    rect(f, lx, y - 7, 1, 6, C.bld2);                     // mast and lantern
    pset(f, lx, y - 8, C.lamp);
    pset(f, lx - 1, y - 8, C.lamp0); pset(f, lx + 1, y - 8, C.lamp0); pset(f, lx, y - 9, C.lamp0);
  }

  CITY.drawWater = function (f, t) {
    reflect(f, t);
    moonPath(f, t);
    ripples(f, t);
    var b = boat(t);
    if (b) drawBoat(f, b, t);
  };
})(S);
// pixel-night-city/src/scene.js
// "Jakarta 02.00": one frame of the night city, painted back to front as a pure function of t.
// The water goes last because it mirrors whatever is already drawn above the waterline.
(function (G) {
  var CITY = G.CITY;
  CITY.render = function (f, t) {
    CITY.drawSky(f, t);
    CITY.drawCity(f, t);
    CITY.drawTraffic(f, t);
    CITY.drawWater(f, t);
  };
})(S);
  var fb = S.PIX.fb();
  return { w: S.PIX.W, h: S.PIX.H, draw: function (out, t) { S.CITY.render(fb, t); S.PIX.toRGBA(fb, out); } };
})();
