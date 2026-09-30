// Hero art: the room around my desk in Jakarta, baked once per sky bucket,
// and the seated me. hero.js draws only what moves on top of these layers:
// the sky life and the train in the window, the screens, steam and the bots.
(function (P) {
  "use strict";
  const { paint, hash, bayer, clamp, PAL: C } = P;

  const W = 168, H = 116, FLOOR_Y = 84, DESK_Y = 68;
  // Where things sit. hero.js reads these too, so they live in one place.
  const G = {
    W, H, FLOOR_Y, DESK_Y, WALK_Y: 108,
    glass: { x: 9, y: 11, w: 42, h: 46 }, blind: 7,
    mon: { x: 80, y: 30, w: 48, h: 28 }, scr: { x: 81, y: 31, w: 46, h: 24 },
    mon2: { x0: 131, x1: 154, top: 35, bot: 59 },
    phone: { x: 134, y: 53 }, kopi: { x: 125, y: 57 }, mini: { x: 110, y: 60 },
    bulb: { x: 151, y: 39 }, clock: { x: 111, y: 9 }, av: { x: 49, y: 44 },
  };

  // Material ramps, dark to light: shadows lean blue or purple, highlights warm.
  const WALL = ["#1a352d", "#214238", "#294f43", "#315b4e", "#3b695a"];
  const WOOD = ["#472a19", "#6d4527", "#8a5a33", "#a8743f", "#c08a55", "#d8a66c"];
  const TILE = ["#5f5a4f", "#7f786a", "#9c9482", "#b6ad97", "#cbc2aa"];
  const METAL = ["#161a1e", "#22282d", "#313940", "#465159", "#657179"];
  const ALU = ["#788087", "#9fa7ac", "#c2c8ca", "#e2e6e4"];
  const CREAM = ["#979f98", "#bcc3b9", "#d8dcd1", "#eef0e7"];
  const CURT = ["#5a3917", "#845828", "#ab7b36", "#cc9e4d"];
  const TERRA = ["#58291b", "#80402b", "#a6593d", "#c67651"];
  const GOLD = ["#6e4f14", "#a8801f", "#e0b43a", "#ffe375"];
  const LOB = ["#6a1a12", "#a02e1d", "#d9543f", "#f28b6b"];
  const ORNG = [C.orange2, C.orange, C.orange1, "#f59a62"];
  const SKIN = ["#7e4f2f", C.skin2, C.skin, "#dca277"];
  const DENIM = ["#18233a", C.denim, "#3d5475", "#56709a"];
  const HAIR = ["#140c08", C.hair, "#3e2a1e"];
  const SCREEN_BG = "#0e1c24", LIT = ["#ffd35a", "#ffe9a0", "#a6e8fa"];

  // ---- colour helpers -----------------------------------------------------
  const rgbOf = (h) => { const n = parseInt(h.slice(1, 7), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hexOf = (r, g, b) => "#" + ((1 << 24) | (clamp(Math.round(r), 0, 255) << 16) |
    (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255)).toString(16).slice(1);
  const mul = (h, m) => { const c = rgbOf(h); return hexOf(c[0] * m[0], c[1] * m[1], c[2] * m[2]); };
  const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return hexOf(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };

  // Filled circle from a row-width table, never arc().
  function disc(R, cx, cy, r, col) {
    for (let dy = -r; dy <= r; dy++) {
      const hw = Math.floor(Math.sqrt((r + 0.5) * (r + 0.5) - dy * dy));
      R(cx - hw, cy + dy, hw * 2 + 1, 1, col);
    }
  }
  // Draw string rows: "." is empty, other characters are keys of pal.
  function rows(R, strs, ox, oy, pal) {
    strs.forEach((s, y) => { for (let x = 0; x < s.length; x++) if (s[x] !== ".") R(ox + x, oy + y, 1, 1, pal[s[x]]); });
  }

  // ---- the view: Jakarta in three depths, drawn in glass coordinates -----
  const SKIES = {
    day: ["#3a86d8", "#4a96e2", "#5ea8ec", "#76baf2", "#92cbf6", "#b4dcf8"],
    dawn: ["#2a2f66", "#4a3f7e", "#7d5488", "#b86b86", "#e89585", "#ffc98a"],
    dusk: ["#241f52", "#3f2d68", "#77406f", "#b4545d", "#e07a52", "#ffb36b"],
    night: ["#070d24", "#0b1330", "#0f1a3d", "#15224a", "#1b2a56", "#22305e"],
  };
  const VIEW_AMB = { day: [1, 1, 1], dawn: [0.74, 0.64, 0.8], dusk: [0.82, 0.58, 0.6], night: [0.24, 0.28, 0.48] };
  const HAZE = { day: "#b4dcf8", dawn: "#d98a8a", dusk: "#d8744f", night: "#1b2a56" };
  // Far towers [x, width, top, antenna]; the gap at x 7 to 16 keeps Monas clear.
  const FAR_T = [[0, 4, 22], [4, 3, 26], [17, 3, 24], [20, 5, 18, 3], [25, 4, 23], [29, 3, 20], [32, 5, 25], [37, 3, 19, 2], [40, 2, 24]];
  const MID_B = [[0, 7, 32, "#98a9b3"], [7, 4, 37, "#c2b59b"], [11, 7, 38, "#b3bfac"], [18, 6, 32, "#a8a2b6"],
    [24, 5, 29, "#c6bca6"], [29, 6, 34, "#98a9b3"], [35, 7, 30, "#b5a591"]];
  // Red aviation lights on the antenna towers, for hero.js to blink.
  const RED_LIGHTS = FAR_T.filter((t) => t[3]).map(([x, w, top, a]) => [x + (w >> 1), top - a]);

  function skyLayer(bk) {
    const { w, h } = G.glass, ramp = SKIES[bk];
    return paint(w, h, (R, px) => {
      for (let y = 0; y < h; y++) {
        const v = clamp((y - 7) / 33, 0, 1) * 5, i = Math.floor(v), f = v - i;
        for (let x = 0; x < w; x++) px(x, y, i < 5 && f > bayer(x, y) ? ramp[i + 1] : ramp[i]);
      }
      if (bk === "night") {
        for (let i = 0; i < 16; i++) {
          const x = Math.floor(hash(i, 1, 71) * w), y = 8 + Math.floor(hash(i, 2, 71) * 18);
          if (Math.abs(x - 34) > 3 || Math.abs(y - 13) > 3) px(x, y, hash(i, 3, 71) > 0.6 ? C.white : "#9fb0d8");
        }
        disc(R, 34, 13, 2, "#f3ecd0"); disc(R, 35, 12, 2, ramp[0]);
      } else if (bk === "day") {
        for (let y = 8; y < 19; y++) for (let x = 28; x < 39; x++) if (Math.hypot(x - 33, y - 13) < 5 && bayer(x, y) > 0.45) px(x, y, ramp[5]);
        disc(R, 33, 13, 2, "#fff1b8"); disc(R, 33, 13, 1, "#fffbe6");
      } else {
        const [sx, sy, r] = bk === "dusk" ? [27, 26, 3] : [35, 27, 2];
        for (let y = sy - 6; y < sy + 6; y++) for (let x = sx - 7; x < sx + 7; x++) if (Math.hypot(x - sx, y - sy) < r + 4 && bayer(x, y) > 0.4) px(x, y, ramp[5]);
        disc(R, sx, sy, r, "#ffd690"); disc(R, sx, sy, r - 1, "#fff0c8");
        if (bk === "dusk") { R(17, 24, 15, 1, ramp[2]); R(21, 28, 13, 1, ramp[2]); R(30, 22, 8, 1, ramp[3]); }
      }
    });
  }

  function cityLayer(bk) {
    const { w, h } = G.glass, night = bk === "night", litP = { day: 0, dawn: 0.12, dusk: 0.22, night: 0.45 }[bk];
    const tone = (hex, d) => mix(mul(hex, VIEW_AMB[bk]), HAZE[bk], d);
    return paint(w, h, (R, px) => {
      for (const [x, tw, top, ant] of FAR_T) {
        R(x, top, tw, h - top, tone("#6f8fae", 0.55));
        R(x, top, 1, h - top, tone("#94b4d0", 0.55)); R(x + tw - 1, top + 1, 1, h - top, tone("#56708d", 0.55));
        for (let y = top + 2; y < 40; y += 3) R(x + 1, y, tw - 2, 1, tone("#62809e", 0.55));
        if (ant) R(x + (tw >> 1), top - ant, 1, ant, tone("#56708d", 0.5));
        if (night) for (let y = top + 2; y < 38; y += 2) if (hash(x, y, 77) > 0.72) px(x + 1 + ((hash(y, x, 78) * (tw - 2)) | 0), y, "#b89a58");
      }
      monas(R, px, tone, night);
      for (const [x, bw, top, col] of MID_B) midBlock(R, px, tone, litP, x, bw, top, col);
      // Elevated KRL line: deck, piers, catenary poles and the wire.
      const conc = tone("#c2bdb1", 0.2), concD = tone("#8f8b80", 0.2), pole = tone("#4f5750", 0.15);
      R(0, 37, w, 1, conc); R(0, 38, w, 1, concD); R(0, 39, w, 1, tone("#6c695f", 0.2));
      for (let x = 4; x < w; x += 10) R(x, 40, 2, h - 40, concD);
      for (let x = 9; x < w; x += 10) { R(x, 30, 1, 7, pole); R(x - 1, 30, 3, 1, pole); }
      for (let x = 0; x < w; x += 2) px(x, 31, pole);
    });
  }

  // Monas: the obelisk, its cup and the gold flame. Floodlit at night.
  function monas(R, px, tone, night) {
    const lit = (c) => (night ? mix(c, "#efe4c4", 0.45) : c);
    const hi = lit(tone("#f1ebdc", 0.3)), mid = lit(tone("#cfc8b6", 0.3)), lo = lit(tone("#a39c8c", 0.3));
    R(12, 14, 3, 24, mid); R(12, 14, 1, 24, hi); R(14, 15, 1, 23, lo); px(13, 13, hi);
    R(8, 32, 11, 1, hi); R(8, 33, 11, 1, mid); R(9, 34, 9, 1, lo); R(10, 35, 7, 1, lo);
    R(12, 12, 3, 1, GOLD[1]); R(12, 11, 3, 1, GOLD[2]); px(12, 10, GOLD[2]); px(13, 10, GOLD[3]); px(13, 9, GOLD[3]);
    if (night) { px(11, 10, "#8a6a2a"); px(14, 9, "#8a6a2a"); px(13, 8, "#8a6a2a"); }
  }

  function midBlock(R, px, tone, litP, x, bw, top, col) {
    const { h } = G.glass;
    const base = tone(col, 0.25), hi = tone(mix(col, "#ffffff", 0.22), 0.25), lo = tone(mul(col, [0.72, 0.74, 0.84]), 0.25);
    const win = litP > 0.3 ? tone("#2a3350", 0.1) : tone("#5f7d95", 0.2);
    R(x, top, bw, h - top, base); R(x, top, 1, h - top, hi); R(x + bw - 1, top + 1, 1, h - top, lo); R(x, top, bw, 1, hi);
    for (let y = top + 2; y < h; y += 2) for (let xx = x + 1; xx < x + bw - 1; xx += 2) {
      const on = hash(xx, y, 81) < litP;
      px(xx, y, on ? LIT[(hash(xx, y, 82) * 3) | 0] : win);
    }
  }

  // Near kampung: genteng roofs, the mosque and its minaret, toren tanks,
  // a TV antenna and the power cable that sags across everything.
  function frontLayer(bk) {
    const { w, h } = G.glass, night = bk === "night";
    const tone = (hex, d) => mix(mul(hex, VIEW_AMB[bk]), HAZE[bk], d);
    return paint(w, h, (R, px) => {
      for (const [x, rw, ridge] of [[0, 9, 39], [14, 6, 39], [29, 8, 38]]) gable(R, px, tone, x, rw, ridge, 0.14, night);
      mosque(R, px, tone, night);
      for (const [x, rw, ridge] of [[-3, 11, 41], [9, 8, 42], [18, 6, 41], [31, 9, 42], [39, 6, 41]]) gable(R, px, tone, x, rw, ridge, 0.03, night);
      toren(R, tone, 16, 36, "#e0782a"); toren(R, tone, 39, 37, "#3a78c0");
      const pole = tone("#3a3f3a", 0.05);
      R(12, 34, 1, 8, pole); R(10, 35, 5, 1, pole); R(11, 37, 3, 1, pole);
    });
  }

  function gable(R, px, tone, x, rw, ridge, depth, night) {
    const { h } = G.glass, t = TERRA.map((c) => tone(c, depth));
    R(x, ridge, rw, 1, t[0]);
    for (let y = ridge + 1; y < h - 2; y++) {
      const k = y - ridge;
      R(x - k, y, rw + k * 2, 1, k % 2 ? t[2] : t[1]);
      R(x - k, y, 2, 1, t[3]);
    }
    const wall = tone(["#e3d9c3", "#c9e0d0", "#e8c9c9", "#efe3a8"][(hash(x, ridge, 91) * 4) | 0], depth);
    R(x - 2, h - 2, rw + 4, 2, wall);
    px(x + (rw >> 1), h - 1, night && hash(x, 1, 92) > 0.35 ? LIT[0] : tone("#3a3f46", depth));
  }

  function mosque(R, px, tone, night) {
    const dome = ["#1f5a3a", "#2f7a4f", "#46a06a", "#7cc896"].map((c) => tone(c, 0.08));
    const white = tone("#e8e2d0", 0.08), whiteD = tone("#bdb6a4", 0.08);
    R(23, 40, 7, 6, white); R(29, 40, 1, 6, whiteD);
    for (const x of [24, 26, 28]) R(x, 42, 1, 2, night ? LIT[0] : tone("#3a4a42", 0.08));
    R(25, 35, 3, 1, dome[2]); R(24, 36, 5, 1, dome[2]); R(23, 37, 7, 3, dome[1]);
    px(24, 37, dome[3]); px(25, 36, dome[3]); R(23, 37, 1, 3, dome[2]); R(29, 37, 1, 3, dome[0]);
    px(26, 34, GOLD[2]); px(26, 33, GOLD[2]); px(27, 32, GOLD[3]); px(26, 31, GOLD[3]);
    R(34, 29, 2, 17, white); R(35, 29, 1, 17, whiteD); R(33, 32, 4, 1, whiteD);
    R(34, 27, 2, 2, dome[2]); px(34, 26, GOLD[2]);
    if (night) { R(33, 31, 4, 1, "#7cf0a8"); px(26, 30, "#fff3b0"); }
  }

  function toren(R, tone, x, y, col) {
    const c = tone(col, 0.03), d = tone(mul(col, [0.7, 0.7, 0.8]), 0.03), leg = tone("#4a4f4a", 0.03);
    R(x, y, 3, 4, c); R(x + 2, y + 1, 1, 3, d); R(x, y, 3, 1, tone(mix(col, "#ffffff", 0.3), 0.03));
    R(x, y + 4, 1, 2, leg); R(x + 2, y + 4, 1, 2, leg);
  }

  function bakeView(bk) {
    return { sky: skyLayer(bk), city: cityLayer(bk), front: frontLayer(bk) };
  }

  // ---- the room: wall and window --------------------------------------------
  const SHADOW = "rgba(8,20,18,0.38)";

  function wall(R, px) {
    R(0, 0, W, FLOOR_Y, WALL[2]);
    for (let y = 0; y < FLOOR_Y - 4; y++) for (let x = 0; x < W; x++) {
      const b = bayer(x, y);
      // Daylight from the window warms the plaster; the ceiling line and the
      // far corner fall off. Narrow dither bands keep the steps readable.
      const gx = x - 30, gy = (y - 34) * 1.25, glow = 1 - Math.sqrt(gx * gx + gy * gy) / 64;
      const dim = (y < 6 ? (6 - y) / 6 : 0) + (x > 146 ? (x - 146) / 30 : 0);
      let i = 2;
      if (glow > 0.3 + b * 0.1) i = glow > 0.62 + b * 0.1 ? 4 : 3;
      else if (dim > 0.3 + b * 0.2) i = dim > 0.85 + b * 0.1 ? 0 : 1;
      const s = hash(x >> 1, y, 31);
      if (s < 0.035) i = Math.max(0, i - 1); else if (s > 0.982) i = Math.min(4, i + 1);
      if (i !== 2) px(x, y, WALL[i]);
    }
    // Ceramic skirting, the Jakarta kind that matches the floor.
    R(0, FLOOR_Y - 4, W, 1, TILE[4]); R(0, FLOOR_Y - 3, W, 2, TILE[3]); R(0, FLOOR_Y - 1, W, 1, TILE[1]);
    for (let x = 17; x < W; x += 24) R(x, FLOOR_Y - 4, 1, 4, TILE[2]);
  }

  function windowFrame(R, px, g) {
    const { x, y, w, h } = G.glass;
    const fx = x - 3, fy = y - 3, fw = w + 6, fh = h + 6;
    R(fx - 1, fy - 1, fw + 2, fh + 2, WALL[0]);                                   // reveal shadow
    R(fx, fy, fw, fh, WOOD[3]);
    R(fx, fy, fw, 1, WOOD[5]); R(fx, fy, 1, fh, WOOD[5]);                         // lit outer edges
    R(fx + fw - 1, fy, 1, fh, WOOD[1]); R(fx, fy + fh - 1, fw, 1, WOOD[1]);
    R(x - 1, y - 1, w + 2, 1, WOOD[1]); R(x - 1, y - 1, 1, h + 2, WOOD[1]);       // inner shadow
    R(x - 1, y + h, w + 2, 1, WOOD[4]); R(x + w, y - 1, 1, h + 2, WOOD[4]);
    for (let i = 0; i < fh; i += 5) if (hash(i, 3, 5) > 0.5) px(fx + 1, fy + i, WOOD[4]);
    g.clearRect(x, y, w, h);                                                      // glass: the view shows through
    R(x + 20, y, 2, h, WOOD[3]); R(x + 20, y, 1, h, WOOD[4]); R(x + 21, y, 1, h, WOOD[2]);
    R(x + 18, y + 30, 1, 3, WOOD[1]); R(x + 23, y + 30, 1, 3, WOOD[1]);            // latches
    for (const [sx, sy, n] of [[x + 3, y + 42, 9], [x + 6, y + 42, 5], [x + 25, y + 38, 8], [x + 28, y + 38, 4]]) {
      for (let k = 0; k < n; k++) px(sx + k, sy - k, "rgba(255,255,255,0.12)");
    }
  }

  // Roller blind half a hand down, curtain gathered at a tie-back, and the sill.
  function blindAndCurtain(R, px) {
    const { x, y, w } = G.glass;
    R(x - 1, y, w + 2, 2, CREAM[2]); R(x - 1, y, w + 2, 1, CREAM[3]);
    R(x, y + 2, w, 4, "#ddd0b2");
    for (let i = 1; i < w; i += 3) R(x + i, y + 2, 1, 4, "#cfc1a2");
    R(x, y + 6, w, 1, CREAM[1]); R(x, y + 7, w, 1, "rgba(0,0,0,0.18)");
    R(x + w - 5, y + 7, 1, 11, CREAM[1]); R(x + w - 6, y + 18, 3, 2, CREAM[0]);
    R(0, 4, 60, 1, METAL[3]); R(0, 5, 60, 1, METAL[1]); R(0, 3, 2, 3, GOLD[1]); R(58, 3, 2, 3, GOLD[1]);
    for (let yy = 6; yy < 60; yy++) {
      const t = yy < 36 ? (yy - 6) / 30 : (yy - 36) / 23;
      const cw = yy < 36 ? Math.round(15 - t * 8) : Math.round(7 + t * 5);
      for (let i = 0; i < cw; i++) {
        const fold = Math.sin((i / cw) * Math.PI * 3.3 + 0.5);
        px(1 + i, yy, i === cw - 1 ? CURT[0] : fold > 0.55 ? CURT[3] : fold > -0.15 ? CURT[2] : CURT[1]);
      }
      px(1 + cw, yy, SHADOW);
    }
    for (let i = 2; i < 16; i += 3) px(i, 6, GOLD[1]);
    R(1, 35, 8, 2, C.bamboo2); R(1, 35, 8, 1, C.bamboo); R(8, 37, 1, 3, C.bamboo2);
    R(3, 60, 54, 1, CREAM[3]); R(3, 61, 54, 1, CREAM[2]); R(3, 62, 54, 1, CREAM[1]); R(4, 63, 52, 1, WALL[0]);
  }

  // ---- upper wall: split AC, clock, whiteboard, shelf ----------------------
  function aircon(R, px) {
    const x = 60, y = 3, w = 40;
    R(x + 2, y + 10, w - 1, 2, SHADOW);
    R(x + 1, y, w - 2, 1, CREAM[3]); R(x, y + 1, w, 8, CREAM[2]);
    R(x, y + 1, 1, 8, CREAM[3]); R(x + w - 1, y + 1, 1, 8, CREAM[1]);
    for (let i = 2; i < w - 2; i += 2) px(x + i, y + 1, CREAM[1]);
    R(x + 1, y + 5, w - 2, 1, CREAM[1]); R(x + 1, y + 6, w - 2, 1, CREAM[3]);
    R(x + 2, y + 7, w - 4, 1, METAL[2]); R(x + 1, y + 8, w - 2, 1, CREAM[1]); R(x + 1, y + 9, w - 2, 1, CREAM[0]);
    R(x + w - 9, y + 2, 5, 2, METAL[1]);
  }

  function clockFace(R, px) {
    const { x, y } = G.clock;
    disc(R, x + 1, y + 1, 5, SHADOW); disc(R, x, y, 5, METAL[1]); disc(R, x, y, 4, CREAM[3]);
    px(x - 3, y - 4, METAL[3]); px(x - 4, y - 3, METAL[3]); px(x - 5, y - 1, METAL[3]);
    R(x + 1, y + 3, 3, 1, CREAM[1]); px(x + 3, y + 2, CREAM[1]); px(x + 4, y + 1, CREAM[1]);
    for (const [dx, dy] of [[0, -4], [4, 0], [0, 4], [-4, 0]]) px(x + dx, y + dy, METAL[2]);
  }

  function box(R, x, y, w, h, col) {
    R(x, y, w, 1, col); R(x, y + h - 1, w, 1, col); R(x, y, 1, h, col); R(x + w - 1, y, 1, h, col);
  }

  // Whiteboard with the agent loop drawn on it, plus SOP stickies.
  function whiteboard(R, px) {
    const x = 84, y = 15, w = 38, h = 13, pen = "#39424a", red = "#c0392b";
    R(x + 1, y + h, w, 2, SHADOW);
    R(x, y, w, h, ALU[2]); R(x, y, w, 1, ALU[3]); R(x, y, 1, h, ALU[3]); R(x + w - 1, y, 1, h, ALU[0]); R(x, y + h - 1, w, 1, ALU[0]);
    R(x + 1, y + 1, w - 2, h - 2, "#eceee6");
    for (let i = 0; i < 18; i++) px(x + 2 + ((hash(i, 1, 61) * (w - 4)) | 0), y + 2 + ((hash(i, 2, 61) * (h - 4)) | 0), "#dfe2da");
    box(R, x + 4, y + 3, 7, 5, "#3a78c2"); R(x + 6, y + 5, 3, 1, "#3a78c2");
    box(R, x + 15, y + 2, 9, 7, C.orange); R(x + 17, y + 4, 2, 1, C.orange); R(x + 20, y + 4, 2, 1, C.orange); R(x + 18, y + 6, 3, 1, C.orange);
    box(R, x + 28, y + 3, 7, 5, "#2f9a5a"); R(x + 30, y + 5, 3, 1, "#2f9a5a");
    R(x + 11, y + 5, 3, 1, pen); px(x + 13, y + 4, pen); px(x + 13, y + 6, pen);
    R(x + 24, y + 5, 3, 1, pen); px(x + 26, y + 4, pen); px(x + 26, y + 6, pen);
    R(x + 31, y + 8, 1, 2, red); R(x + 20, y + 10, 12, 1, red); R(x + 19, y + 9, 1, 2, red); px(x + 18, y + 9, red); px(x + 20, y + 9, red);
    R(x + 4, y + 10, 5, 1, "#9aa39b"); R(x + 28, y + 11, 4, 1, "#9aa39b");
    R(x + 3, y + h, w - 6, 1, ALU[1]); R(x + 7, y + h - 1, 3, 1, "#3a78c2"); R(x + 11, y + h - 1, 3, 1, red);
    sticky(R, x - 3, y + 1, C.sun, 0); sticky(R, x - 2, y + 7, C.mint, 1);
  }

  function sticky(R, x, y, col, k) {
    R(x + 1, y + 5, 5, 1, SHADOW); R(x, y, 5, 5, col); R(x, y, 5, 1, mix(col, "#ffffff", 0.35));
    R(x + 1, y + 2, 3, 1, "#5e645d"); R(x + 1, y + 3, 2 + k, 1, "#8d968a"); R(x + 4, y + 4, 1, 1, mul(col, [0.8, 0.8, 0.8]));
  }

  // Shelf: books, the OpenClaw lobster that started it all, a small gold
  // Mahoraga wheel, and a pothos trailing down the corner.
  const BOOKS = [[2, 11, "#8f4a2f"], [3, 9, "#2e4a6b"], [2, 12, "#b98636"], [2, 10, "#4e7a5a"], [3, 8, "#6d3a52"], [2, 11, "#c9c0a8"]];
  const LOBSTER = [
    ".l.l.....l.l.",
    ".rlr.....rlr.",
    ".rrr.a.a.rrr.",
    "..rR.e.e.Rr..",
    "...RrrrrrR...",
    "....rlllr....",
    "...R.rrr.R...",
    "..R.rrrrr.R..",
    ".....rRr.....",
    "....rr.rr....",
  ];
  const WHEEL = [
    ".....h.....",
    ".h...G...h.",
    "..GgGGGgG..",
    "..gG.G.Gg..",
    "..G..G..G..",
    "hGGGGhGGGGh",
    "..G..G..G..",
    "..gG.G.Gg..",
    "..GgGGGgG..",
    ".h...G...h.",
    ".....h.....",
  ];

  function shelf(R, px) {
    const x = 123, y = 25, w = W - x;
    R(x + 1, y + 3, w, 2, SHADOW);
    R(x, y, w, 1, WOOD[5]); R(x, y + 1, w, 1, WOOD[3]); R(x, y + 2, w, 1, WOOD[1]);
    for (const bx of [129, 158]) { R(bx, y + 3, 1, 3, METAL[3]); R(bx, y + 3, 3, 1, METAL[2]); }
    let bx = 125;
    for (const [bw, bh, col] of BOOKS) {
      const top = y - bh;
      R(bx, top, bw, bh, col); R(bx, top, 1, bh, mix(col, "#ffffff", 0.18));
      R(bx + bw - 1, top + 1, 1, bh - 1, mul(col, [0.7, 0.7, 0.8])); R(bx, top + 2, bw, 1, mul(col, [0.75, 0.72, 0.7]));
      R(bx, y - 3, bw, 1, mix(col, "#e3d9c3", 0.45));
      bx += bw;
    }
    for (let k = 0; k < 9; k++) R(bx + 1 + (k >> 2), y - 1 - k, 2, 1, k % 3 ? "#3c6b8a" : "#2c5670");
    rows(R, LOBSTER, 140, y - 10, { l: LOB[3], r: LOB[2], R: LOB[1], a: LOB[1], e: C.ink });
    R(143, y - 8, 1, 1, LOB[1]); R(149, y - 8, 1, 1, LOB[1]);
    R(152, y - 1, 9, 1, WOOD[1]); R(155, y - 2, 3, 1, WOOD[2]);
    rows(R, WHEEL, 151, y - 13, { G: GOLD[2], g: GOLD[1], h: GOLD[3] });
    pothos(R, px, 163, y);
  }

  function leaf(R, px, x, y, flip) {
    R(x, y, 2, 2, C.leaf2); px(flip ? x + 1 : x, y, C.leaf); px(flip ? x - 1 : x + 2, y + 1, C.leaf3); px(x + (flip ? 0 : 1), y + 2, C.leaf3);
  }

  function pothos(R, px, x, y) {
    R(x, y - 4, 5, 4, TERRA[2]); R(x - 1, y - 5, 7, 1, TERRA[3]); R(x + 4, y - 4, 1, 4, TERRA[1]); R(x, y - 1, 5, 1, TERRA[1]);
    for (const [lx, ly, f] of [[x - 2, y - 8, 0], [x + 1, y - 9, 1], [x + 3, y - 7, 0], [x - 1, y - 6, 1], [x + 4, y - 10, 0]]) leaf(R, px, lx, ly, f);
    // Two vines over the shelf edge, down the corner of the wall.
    for (const [vx, len, seed] of [[x, 18, 1], [x + 3, 12, 2]]) {
      for (let k = 0; k < len; k++) {
        const sx = vx + Math.round(Math.sin(k * 0.45 + seed) * 1.2);
        px(sx, y + 1 + k, C.leaf3);
        if (k % 3 === 2) leaf(R, px, sx + (k % 2 ? 1 : -2), y + k, k % 2);
      }
    }
  }

  // ---- floor: ceramic tiles in perspective, the rug ------------------------
  const GROUT = [84, 87, 91, 96, 102, 109, 117];

  function floor(R, px) {
    const VX = 84, VY = 16;
    for (let y = FLOOR_Y; y < H; y++) {
      const band = GROUT.findIndex((r, i) => y >= r && y < GROUT[i + 1]);
      const k = (y - VY) / (H - 1 - VY);
      for (let x = 0; x < W; x++) {
        const u = (x - VX) / k / 26 + 50.5, col = Math.floor(u), f = u - col;
        const grout = y === GROUT[band] || Math.min(f, 1 - f) * 26 * k < 0.5;
        let i = hash(col, band, 41) < 0.35 ? 2 : 3;
        if (grout) i = 1;
        else if (y === GROUT[band] + 1 && hash(col, band, 42) < 0.6) i = 4;
        px(x, y, TILE[i]);
      }
    }
    R(0, FLOOR_Y, W, 1, TILE[0]);
  }

  // A kawung-style rug under the chair, drawn with the same perspective.
  function rug(R, px) {
    const RUG = ["#232845", "#343b69", "#4f578c", "#d6c49a", "#8a3f2a", "#b0654a"];
    for (let y = 92; y < 114; y++) {
      const t = (y - 92) / 21, xl = Math.round(22 - t * 12), xr = Math.round(98 + t * 12);
      for (let x = xl; x <= xr; x++) {
        const u = (x - xl) / (xr - xl), edge = Math.min(u, 1 - u) * (xr - xl), ev = Math.min(y - 92, 113 - y);
        let c = RUG[1];
        if (edge < 2 || ev < 1) c = RUG[4];
        else if (edge < 3 || ev < 2) c = RUG[3];
        else if (edge < 5 || ev < 3) c = RUG[5];
        else {
          const cu = u * 9 - Math.floor(u * 9), cv = t * 4 - Math.floor(t * 4);
          const d = Math.abs(cu - 0.5) + Math.abs(cv - 0.5);
          c = d < 0.22 ? RUG[3] : d < 0.34 ? RUG[2] : d > 0.78 ? RUG[0] : RUG[1];
        }
        px(x, y, c);
      }
    }
    for (let x = 11; x < 110; x += 2) px(x, 114, RUG[3]);
  }

  // ---- desk, cables, drawers -------------------------------------------------
  function cables(R, px) {
    // Tidy: three cables bundled under the desk, down to a strip on the floor.
    const ink = METAL[0];
    for (const [xs, xe] of [[104, 115], [118, 118], [142, 121]]) {
      for (let y = 73; y < 87; y++) px(Math.round(xs + (xe - xs) * Math.min(1, (y - 73) / 8)), y, ink);
    }
    R(114, 80, 9, 1, C.orange1);
    R(111, 87, 16, 1, CREAM[3]); R(111, 88, 16, 1, CREAM[1]); R(111, 89, 16, 1, SHADOW);
    for (const x of [114, 118, 121]) R(x, 86, 2, 1, METAL[1]);
  }

  function desk(R, px) {
    const x0 = 68, x1 = 166, dw = x1 - x0 + 1;
    R(x0, 73, dw, FLOOR_Y - 73, SHADOW);                              // the wall under the desk
    R(x0 + 2, FLOOR_Y, dw - 2, 18, "rgba(8,16,20,0.3)");              // and the floor
    R(x0, 63, dw, 1, SHADOW);
    R(x0, 64, dw, 4, WOOD[4]);
    for (let i = 0; i < 40; i++) {
      const gx = x0 + ((hash(i, 1, 51) * dw) | 0), gy = 64 + ((hash(i, 2, 51) * 4) | 0);
      R(gx, gy, 2 + ((hash(i, 3, 51) * 5) | 0), 1, hash(i, 4, 51) > 0.3 ? WOOD[3] : WOOD[5]);
    }
    R(x0, 68, dw, 1, WOOD[5]); R(x0, 69, dw, 3, WOOD[3]); R(x0, 72, dw, 1, WOOD[1]);
    for (let i = 0; i < 14; i++) R(x0 + ((hash(i, 5, 51) * dw) | 0), 70, 3, 1, WOOD[2]);
    R(x0, 64, 1, 9, WOOD[5]); R(x1, 64, 1, 9, WOOD[2]);
    R(69, 73, 3, 29, WOOD[2]); R(69, 73, 1, 29, WOOD[3]); R(69, 101, 3, 1, WOOD[0]);
    pedestal(R, px);
  }

  function pedestal(R, px) {
    const x = 134, w = 30;
    R(x, 73, w, 27, WOOD[3]); R(x, 73, 1, 27, WOOD[4]); R(x + w - 1, 73, 1, 27, WOOD[1]); R(x, 73, w, 1, WOOD[1]);
    for (const [top, hh] of [[75, 7], [83, 8], [92, 7]]) {
      R(x + 2, top, w - 4, hh, WOOD[3]); R(x + 2, top, w - 4, 1, WOOD[4]); R(x + 2, top + hh, w - 4, 1, WOOD[1]);
      for (let i = 0; i < 3; i++) R(x + 3 + ((hash(top, i, 52) * (w - 10)) | 0), top + 2 + i * 2, 4, 1, WOOD[2]);
      R(x + 12, top + (hh >> 1), 6, 1, ALU[2]); R(x + 12, top + (hh >> 1) + 1, 6, 1, WOOD[1]);
    }
    R(x, 100, w, 2, WOOD[0]); R(x - 1, 102, w + 3, 1, SHADOW);
  }

  // ---- on the desk ---------------------------------------------------------------
  function inputs(R, px) {
    R(72, 64, 41, 4, METAL[2]); R(72, 67, 41, 1, METAL[3]); R(113, 65, 1, 3, SHADOW);   // felt mat
    R(74, 64, 23, 4, METAL[1]); R(74, 67, 23, 1, METAL[0]);                              // keyboard case
    for (let r = 0; r < 3; r++) for (let x = 75 + (r % 2); x < 95; x += 3) R(x, 64 + r, 2, 1, r === 0 ? CREAM[3] : CREAM[2]);
    R(75, 64, 2, 1, C.orange1); R(91, 66, 4, 1, CREAM[2]);
    R(102, 65, 3, 1, CREAM[2]); R(101, 66, 5, 1, CREAM[3]); R(101, 67, 5, 1, CREAM[1]); px(103, 65, METAL[3]);
  }

  function monitors(R, px) {
    const m = G.mon, s = G.scr;
    R(m.x + 2, m.y + m.h, m.w - 2, 1, SHADOW);
    R(m.x, m.y, m.w, m.h, METAL[1]);
    R(m.x, m.y, m.w, 1, METAL[3]); R(m.x, m.y, 1, m.h, METAL[3]);
    R(m.x + m.w - 1, m.y + 1, 1, m.h - 1, METAL[0]); R(m.x + 1, m.y + m.h - 1, m.w - 1, 1, METAL[0]);
    R(s.x, s.y, s.w, s.h, SCREEN_BG);
    R(m.x + 1, s.y + s.h, m.w - 2, 1, METAL[2]);
    R(101, 58, 5, 5, METAL[2]); R(101, 58, 1, 5, METAL[3]); R(105, 58, 1, 5, METAL[1]);
    R(95, 63, 17, 1, METAL[4]); R(95, 64, 17, 1, METAL[2]); R(96, 65, 16, 1, SHADOW);
    sticky(R, 76, 34, C.sun, 1); sticky(R, 77, 41, C.rose, 0);
    // Second screen, turned toward me, so its far edge is shorter.
    const { x0, x1, top, bot } = G.mon2;
    R(144, 58, 3, 5, METAL[2]); R(137, 63, 15, 1, METAL[3]); R(137, 64, 15, 1, METAL[1]); R(138, 65, 14, 1, SHADOW);
    for (let x = x0; x <= x1; x++) {
      const k = Math.round(((x - x0) / (x1 - x0)) * 2), t = top + k, b = bot - k;
      R(x, t, 1, b - t + 1, METAL[1]); px(x, t, METAL[3]);
      if (x > x0 && x < x1) R(x, t + 1, 1, b - t - 3, SCREEN_BG);
    }
    R(x0, top, 1, bot - top + 1, METAL[3]);
    R(x1 + 1, top + 3, 2, bot - top - 6, METAL[0]);
    sticky(R, 150, 50, C.sky, 0);
  }

  function miniAndPhone(R, px) {
    const { x, y } = G.mini;
    R(x + 1, y, 12, 1, ALU[3]); R(x, y + 1, 14, 3, ALU[2]); R(x, y + 1, 1, 3, ALU[3]); R(x + 13, y + 1, 1, 3, ALU[1]);
    R(x + 1, y + 3, 12, 1, ALU[1]); R(x + 1, y + 4, 12, 1, METAL[0]); R(x + 1, y + 5, 13, 1, SHADOW);
    px(x + 3, y + 2, METAL[2]); px(x + 5, y + 2, METAL[2]); px(x + 7, y + 2, METAL[2]);
    // Kopi in a glass on a saucer.
    const k = G.kopi;
    R(k.x - 1, k.y + 7, 8, 1, CREAM[3]); R(k.x - 1, k.y + 8, 8, 1, SHADOW);
    R(k.x, k.y, 6, 7, "#cfe1e2"); R(k.x + 1, k.y + 2, 4, 5, "#3b2416"); R(k.x + 1, k.y + 2, 4, 1, "#9a6a3d");
    R(k.x, k.y, 6, 1, "#eef6f5"); R(k.x + 1, k.y + 3, 1, 3, "#5a3622"); px(k.x + 6, k.y + 2, "#cfe1e2"); px(k.x + 6, k.y + 4, "#cfe1e2"); px(k.x + 7, k.y + 3, "#cfe1e2");
    // iPhone on its stand; hero.js draws the terminal.
    const p = G.phone;
    R(p.x, p.y, 5, 10, METAL[0]); R(p.x + 1, p.y + 1, 3, 8, "#07110d"); px(p.x, p.y, METAL[3]);
    R(p.x - 1, p.y + 9, 7, 2, ALU[2]); R(p.x - 1, p.y + 9, 7, 1, ALU[3]); R(p.x - 1, p.y + 11, 7, 1, ALU[0]); R(p.x, p.y + 12, 7, 1, SHADOW);
  }

  // Swing-arm lamp with an orange shade; its bulb and pool are lighting.
  function lamp(R, px) {
    R(157, 65, 10, 1, SHADOW);
    R(158, 62, 6, 1, ORNG[2]); R(157, 63, 8, 1, ORNG[1]); R(156, 64, 10, 1, ORNG[0]);
    R(160, 39, 1, 23, ALU[2]); R(161, 39, 1, 23, ALU[0]); R(159, 37, 3, 2, ALU[1]); px(159, 37, ALU[3]);
    for (let i = 0; i < 5; i++) { R(158 - i, 36 - (i >> 1), 2, 1, ALU[1]); px(158 - i, 36 - (i >> 1), ALU[3]); }
    R(162, 44, 1, 17, SHADOW);
    R(150, 33, 4, 1, ORNG[2]); R(149, 34, 6, 1, ORNG[1]); R(148, 35, 8, 1, ORNG[1]); R(147, 36, 9, 1, ORNG[1]); R(147, 37, 10, 1, ORNG[0]);
    R(149, 34, 1, 3, ORNG[3]); px(148, 35, ORNG[2]); R(154, 35, 2, 2, ORNG[0]);
    R(148, 38, 8, 1, METAL[1]);
  }

  function chair(R, px) {
    R(40, 100, 38, 2, "rgba(8,14,24,0.35)");
    const M = METAL;
    R(47, 51, 5, 26, M[1]); R(48, 50, 3, 1, M[1]); R(47, 51, 1, 26, M[3]); R(51, 52, 1, 25, M[0]);
    for (let y = 52; y < 76; y += 2) for (let x = 48 + ((y >> 1) & 1); x < 51; x += 2) px(x, y, M[2]);
    R(49, 77, 3, 3, M[0]);
    R(49, 78, 23, 1, M[3]); R(49, 79, 23, 2, M[2]); R(49, 81, 23, 1, M[0]); px(72, 79, M[2]); px(72, 80, M[1]);
    R(55, 82, 10, 2, M[0]); R(57, 84, 5, 4, M[0]);
    R(58, 88, 1, 7, C.grey1); R(59, 88, 1, 7, C.grey2); R(60, 88, 1, 7, C.grey3);
    R(47, 95, 26, 1, M[2]); R(45, 96, 30, 1, M[0]); px(44, 97, M[0]); px(75, 97, M[0]);
    for (const cx of [45, 59, 73]) { R(cx - 1, 97, 3, 1, M[1]); R(cx - 2, 98, 5, 2, M[0]); px(cx, 98, M[3]); R(cx - 1, 100, 3, 1, M[0]); }
  }

  // ---- light -------------------------------------------------------------------
  // The room is painted as if lit by day. Each bucket then multiplies every
  // pixel by ambient plus stepped pools from the lamp, the screens and the
  // window, so dusk and night darken toward blue and the lamp warms its pool.
  const AMB = { day: [1, 1, 1], dawn: [0.64, 0.58, 0.78], dusk: [0.66, 0.52, 0.62], night: [0.34, 0.41, 0.68] };
  const HUE = { lamp: [1.24, 1.02, 0.7], screen: [0.64, 1, 1.1] };
  const WIN_HUE = { day: [1.2, 1.14, 0.94], dawn: [1.02, 0.8, 0.92], dusk: [1.18, 0.8, 0.55], night: [0.5, 0.62, 1] };
  const POWER = { day: [0, 0, 1], dawn: [1, 0.8, 0.55], dusk: [1, 0.75, 0.8], night: [1, 1, 0.5] };   // lamp, screens, window

  const len = (dx, dy) => Math.sqrt(dx * dx + dy * dy);
  function rectDist(x, y, rx, ry, rw, rh) {
    const dx = Math.max(rx - x, 0, x - (rx + rw - 1)), dy = Math.max(ry - y, 0, y - (ry + rh - 1));
    return len(dx, dy);
  }
  const underDesk = (x, y) => y > DESK_Y + 4 && x >= 68 && x <= 166;

  function lampI(x, y) {
    const { x: lx, y: ly } = G.bulb;
    if (y < ly - 1) return clamp(1 - len(x - lx, (y - ly) * 1.4) / 11, 0, 1) * 0.55;
    if (underDesk(x, y)) return clamp(1 - len((x - lx) / 26, (y - 76) / 12), 0, 1) * 0.3;
    const pool = 1 - len((x - lx) / 22, (y - 66) / 6.5);
    const cone = 1 - Math.abs(x - lx) / (3 + (y - ly) * 0.85);
    return clamp(Math.max(pool, cone * 0.85, 1 - len(x - lx, y - ly) / 12), 0, 1);
  }
  function screenI(x, y) {
    const m = G.mon, a = 1 - rectDist(x, y, m.x, m.y, m.w, m.h) / 17;
    const b = (1 - rectDist(x, y, 131, 35, 26, 25) / 11) * 0.7;
    const v = clamp(Math.max(a, b), 0, 1);
    return underDesk(x, y) ? v * 0.2 : v;
  }
  function winI(bk, x, y) {
    const g = G.glass;
    let v = bk === "day" ? 0 : clamp(1 - rectDist(x, y, g.x, g.y, g.w, g.h) / 16, 0, 1) * 0.6;
    if (y >= FLOOR_Y) {
      const off = (y - FLOOR_Y) * (bk === "dusk" ? 1.9 : 1.05);
      const inPatch = x >= g.x + 3 + off && x <= g.x + g.w - 3 + off && Math.abs(x - (30.5 + off)) > 1.5;
      if (inPatch) v = Math.max(v, clamp(1.6 - (y - FLOOR_Y) / 22, 0, 1));
    }
    return v;
  }

  // Quantize to thirds; ordered dither only in a narrow band at each step.
  function step(v, x, y, dither) {
    const s = clamp(v, 0, 1) * 3, i = Math.floor(s), f = s - i;
    return (i + (f > (dither ? 0.5 + (bayer(x, y) - 0.5) * 0.34 : 0.5) ? 1 : 0)) / 3;
  }

  // Returns a shared array: read it before the next call. Boxes skip the
  // pixels a source cannot reach, which keeps the bake short.
  const LM = [1, 1, 1];
  function lightAt(bk, x, y, dither) {
    const a = AMB[bk], pw = POWER[bk], wh = WIN_HUE[bk];
    const L = pw[0] && x > 124 && y > 26 ? step(lampI(x, y) * pw[0], x, y, dither) : 0;
    const S = pw[1] && x > 62 && y > 12 && y < 75 ? step(screenI(x, y) * pw[1], x, y, dither) : 0;
    const nearWin = y >= FLOOR_Y || (bk !== "day" && x < 67 && y < 73);
    const Wn = nearWin ? step(winI(bk, x, y) * pw[2], x, y, dither) : 0;
    for (let c = 0; c < 3; c++) LM[c] = clamp(a[c] + (HUE.lamp[c] - a[c]) * L + (HUE.screen[c] - a[c]) * S * 0.8 + (wh[c] - a[c]) * Wn, 0, 1.4);
    return LM;
  }

  // Multiply a canvas by the light it sits in; (ox, oy) is its room position.
  function relight(c, bk, ox, oy, dither) {
    const g = c.getContext("2d"), img = g.getImageData(0, 0, c.width, c.height), d = img.data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (d[i + 3] < 255) continue;
      const m = lightAt(bk, x + ox, y + oy, dither);
      d[i] = d[i] * m[0]; d[i + 1] = d[i + 1] * m[1]; d[i + 2] = d[i + 2] * m[2];
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // Things that give light stay bright after the room is darkened: LEDs on
  // the Mac Mini, the monitor chin, the AC display and the power strip, and
  // the lamp's bulb when it is on.
  function glowing(R, px, bk) {
    const on = bk !== "day";
    px(G.mini.x + 11, G.mini.y + 2, C.white);
    px(125, 56, on ? "#ffb35a" : "#c9a45a");
    R(91, 5, 1, 1, "#7cf0c0"); px(93, 5, on ? "#3a8a6a" : "#2d6a52");
    px(126, 88, "#ff5a4a");
    if (on) {
      R(148, 38, 8, 1, "#fff3c0"); R(149, 39, 6, 1, "rgba(255,227,117,0.55)");
      R(150, 40, 4, 1, "rgba(255,227,117,0.3)");
    }
  }

  function bakeRoom(bk) {
    const room = paint(W, H, (R, px, g) => {
      wall(R, px); windowFrame(R, px, g); blindAndCurtain(R, px);
      aircon(R, px); clockFace(R, px); whiteboard(R, px); shelf(R, px);
      floor(R, px); rug(R, px); cables(R, px); desk(R, px);
      inputs(R, px); monitors(R, px); miniAndPhone(R, px); lamp(R, px); chair(R, px);
    });
    relight(room, bk, 0, 0, true);
    const g = room.getContext("2d");
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    glowing(R, (x, y, col) => R(x, y, 1, 1, col), bk);
    return room;
  }

  // Robots walk through the light: cache one shaded copy per light step.
  const shadeCache = new WeakMap();
  const glows = (r, g, b) => (r === 156 && g === 240 && b === 203) || (r === 255 && g === 227 && b === 117);
  function shaded(src, bk, x, y) {
    if (bk === "day") return src;
    const m = lightAt(bk, x, y, false).slice(), key = bk + m.map((v) => v.toFixed(2)).join();
    let byKey = shadeCache.get(src);
    if (!byKey) { byKey = new Map(); shadeCache.set(src, byKey); }
    let c = byKey.get(key);
    if (!c) {
      c = P.canvas(src.width, src.height);
      c.getContext("2d").drawImage(src, 0, 0);
      const g = c.getContext("2d"), img = g.getImageData(0, 0, c.width, c.height), d = img.data;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] && !glows(d[i], d[i + 1], d[i + 2])) { d[i] *= m[0]; d[i + 1] *= m[1]; d[i + 2] *= m[2]; }
      g.putImageData(img, 0, 0);
      byKey.set(key, c);
    }
    return c;
  }

  // ---- me --------------------------------------------------------------------
  // Seated, facing the monitors, key light from the window behind me. Heads
  // are 12 x 12 string rows; the body is painted in ramps.
  const HEAD = {
    side: [
      "...hHHHH.H..",
      "..HhhhHHHHH.",
      ".HhhHHHHHHHH",
      ".HHHHHHHHHHHH",
      "HHHHHHHHHHHHH",
      "HHHHHHHHHHKsS",
      "KHHHHsSSSSeSS",
      "KHHKsESSSSSSSl",
      ".KHKssSSSSSSs",
      ".KHHKsSSSSSmS",
      "..KHssSSSSSs",
      "....ssSSSs..",
    ],
    turn: [
      "...HHHHHH...",
      "..HhhhhhHH..",
      ".HhhHHHHHHH.",
      ".HHHHHHHHHHH",
      "HHHHHHHHHHHH",
      "HHHKKHHKKHHH",
      "HHseSSSeSSsH",
      "HHsSSSSSSSsH",
      ".HsSSSsSSSs.",
      ".HssSmmmSs..",
      "..HsSSSSs...",
      "...ssSSs....",
    ],
  };
  HEAD.blink = HEAD.side.map((r, i) => (i === 6 ? r.replace("e", "s") : r));
  const HEAD_PAL = { H: HAIR[1], h: HAIR[2], K: HAIR[0], S: SKIN[2], s: SKIN[1], l: SKIN[3], E: SKIN[0], e: C.ink, m: "#7e3a2a" };

  function legs(R, px) {
    const J = DENIM;
    R(3, 29, 21, 5, J[1]); R(3, 29, 21, 1, J[3]); R(3, 30, 21, 1, J[2]); R(3, 33, 21, 1, J[0]);
    R(21, 29, 4, 6, J[1]); R(21, 29, 3, 1, J[3]); px(25, 30, J[1]); px(25, 31, J[1]); px(25, 32, J[0]);
    R(21, 35, 4, 15, J[1]); R(21, 35, 1, 15, J[2]); R(24, 35, 1, 15, J[0]);
    for (let y = 37; y < 49; y += 4) px(22, y, J[2]);
    R(20, 50, 6, 1, J[3]); R(20, 51, 6, 1, J[2]);
    R(21, 52, 6, 1, SKIN[2]); R(21, 52, 1, 1, SKIN[3]); R(20, 53, 9, 1, METAL[0]); px(23, 52, METAL[0]);
  }

  function torso(R, px) {
    const O = ORNG;
    R(8, 11, 3, 3, SKIN[1]); px(8, 11, SKIN[2]);
    for (let y = 13; y < 31; y++) {
      const xl = y === 13 ? 6 : y === 14 || y > 27 ? 4 : 3, xr = y === 13 ? 12 : y < 25 ? 13 : 14;
      R(xl, y, xr - xl + 1, 1, O[1]);
      px(xl, y, O[2]); if (y > 14 && y < 23) px(xl + 1, y, O[2]);      // back, lit by the window
      px(xr, y, O[0]);
    }
    R(8, 13, 3, 1, O[0]); px(7, 13, O[2]);                              // collar
    R(9, 24, 5, 6, O[0]); R(5, 27, 4, 1, O[0]); px(4, 21, O[0]); px(5, 22, O[0]);
  }

  // Near arm on the keys; pose 1 lifts the near hand and drops the far one.
  function arm(R, px, pose) {
    const O = ORNG, S = SKIN, up = pose ? 1 : 0;
    R(7, 14, 4, 1, O[2]); R(6, 15, 6, 4, O[1]); R(6, 15, 1, 4, O[0]); R(7, 15, 1, 4, O[2]); R(11, 15, 1, 4, O[0]);
    R(7, 19, 5, 1, O[0]);
    R(8, 20, 4, 2, S[2]); px(8, 20, S[3]); R(9, 22, 4, 1, S[1]); R(10, 23, 3, 1, S[0]);
    R(12, 21, 6, 1, S[3]); R(12, 22, 6, 1, S[2]); R(12, 23, 6, 1, S[1]);
    R(18, 21 - up, 4, 1, S[3]); R(18, 22 - up, 4, 1, S[2]); R(18, 23 - up, 4, 1, S[1]);
    R(22, 20 - up, 3, 1, S[3]); R(21, 21 - up, 5, 1, S[2]); R(22, 22 - up, 4, 1, S[1]); px(26, 22 - up, S[1]); px(23, 23 - up, S[1]);
    R(27, 21 + up, 2, 1, S[0]); px(29, 22, S[0]);
  }

  function avatar(bk) {
    const out = {};
    for (const [name, head, pose] of [["type0", HEAD.side, 0], ["type1", HEAD.side, 1], ["turn", HEAD.turn, 0], ["blink", HEAD.blink, 0]]) {
      let c = paint(31, 55, (R, px) => { legs(R, px); torso(R, px); arm(R, px, pose); rows(R, head, 4, 0, HEAD_PAL); });
      if (bk !== "day") {
        const before = c.getContext("2d").getImageData(0, 0, c.width, c.height);
        c = rim(reskin(relight(c, bk, G.av.x, G.av.y, true), before, bk), head);
      }
      out[name] = P.outline(c, C.ink);
    }
    return out;
  }

  // The room's multiply turns skin grey under a darker sky, so the upper body
  // takes its own ramp instead: darker and cooler, still brown. The last entry
  // is the mouth, kept a red line rather than a black bar. The feet, in the
  // dark under the desk, keep the room's light.
  const SKIN_AT = {
    dawn: ["#44263a", "#744652", "#a06258", "#ba7e6a", "#6a2e3a"],
    dusk: ["#4c2828", "#7e4a3e", "#a8684a", "#c2825e", "#6a2c28"],
    night: ["#3c2232", "#5e3538", "#7c4c40", "#945e4c", "#4a2229"],
  };
  const SKIN_RGB = [...SKIN, HEAD_PAL.m].map(rgbOf);
  function reskin(c, before, bk) {
    const g = c.getContext("2d"), img = g.getImageData(0, 0, c.width, 30), d = img.data, b = before.data;
    const ramp = SKIN_AT[bk].map(rgbOf);
    for (let i = 0; i < d.length; i += 4) {
      const k = SKIN_RGB.findIndex((s) => s[0] === b[i] && s[1] === b[i + 1] && s[2] === b[i + 2]);
      if (k >= 0) for (let j = 0; j < 3; j++) d[i + j] = ramp[k][j];
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // Screen light on what faces the monitors. On the face it is a 1 px rim on
  // the front edge and a faint cast behind it, on skin only, so the eye, brow
  // and mouth stay dark.
  const RIM = { skin: [0.72, 0.12], hair: [0.3, 0.12], body: [0.45, 0.22] };
  const partOf = (ch) => (!ch ? "" : "Ssl".includes(ch) ? "skin" : "HhK".includes(ch) ? "hair" : "");
  function rim(c, head) {
    const g = c.getContext("2d"), img = g.getImageData(0, 0, c.width, c.height), d = img.data, w = c.width;
    const solid = (x, y) => x < w && d[(y * w + x) * 4 + 3] > 0;
    const glow = rgbOf("#a6e8fa");
    for (let y = 0; y < 34; y++) for (let x = w - 1; x >= 0; x--) {
      if (!solid(x, y)) continue;
      const e = !solid(x + 1, y) ? 0 : !solid(x + 2, y) ? 1 : 2;
      const part = y < head.length ? partOf(head[y][x - 4]) : "body";
      const t = part ? RIM[part][e] || 0 : 0;
      if (!t) continue;
      const i = (y * w + x) * 4;
      for (let k = 0; k < 3; k++) d[i + k] = d[i + k] + (glow[k] - d[i + k]) * t;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function bake(bk) {
    return { view: bakeView(bk), room: bakeRoom(bk), av: avatar(bk) };
  }

  P.heroArt = { G, bake, shaded, RED_LIGHTS, VIEW_AMB, HAZE, mix, mul };
})((window.PETA = window.PETA || {}));
