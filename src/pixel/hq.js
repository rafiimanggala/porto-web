// Agent HQ, the building: layout, baked layers and the per-frame scene.
// One canvas at art resolution, scaled by whole device pixels. Floors run
// from the roof down; each floor is a sign band plus one or more rows of
// rooms, and every room is one agent. The DOM grid in hq-ui.js sits on top.
// The roof, the street and its traffic come from hq-city.js.
(function (P) {
  "use strict";
  const { paint, hash, bayer, flip, PAL: C } = P;

  // Room anatomy (art pixels): a 15px band at the top for the door plate,
  // the wall with props, then a 14px floor the bot and desk stand in. The
  // sky band leaves room for the far city over the roof; the street band
  // holds a sidewalk, the painted kerb and two lanes of traffic.
  const K = {
    ROOM_H: 60, FLOOR: 14, SIGN_H: 12, WALL: 3, EDGE: 5, SHAFT: 16,
    SKY_H: 40, ROOF_H: 26, STREET_H: 54,
    ROOM_MIN: 96, ROOM_MAX: 136, WIN_MIN: 122, CONTENT: 96,
  };

  // ---- time of day in Jakarta (UTC+7) ---------------------------------------
  const FORCE = { day: 12, dawn: 5.6, dusk: 17.7, night: 1.9 };
  function wibHour() {
    const q = P.query && P.query.sky;
    if (q && FORCE[q] != null) return FORCE[q];
    const d = new Date(Date.now() + 7 * 3600e3);
    return d.getUTCHours() + d.getUTCMinutes() / 60;
  }
  function bucket(h) {
    if (h >= 5 && h < 6.5) return "dawn";
    if (h >= 6.5 && h < 17) return "day";
    if (h >= 17 && h < 18.75) return "dusk";
    return "night";
  }

  // ---- layout ---------------------------------------------------------------
  // Scales s where s * dpr is a whole number, largest first, never below 1.
  function scales(dpr) {
    const out = [];
    for (let n = Math.floor(3 * dpr + 1e-6); n >= Math.ceil(dpr - 1e-6); n--) out.push(n / dpr);
    return out;
  }

  // Split n rooms into rows of at most `per`, as evenly as possible.
  function rowsOf(n, per) {
    const rows = Math.ceil(n / per), base = Math.floor(n / rows), extra = n % rows;
    return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));
  }

  function fit(cw, dpr) {
    const want = cw >= 820 ? 4 : cw >= 560 ? 3 : 2;
    // Bigger pixels beat the elevator shaft: at each scale, try with the shaft
    // first and drop it only when that is what lets the scale fit.
    for (let per = want; per >= 2; per--) {
      for (const s of scales(dpr)) {
        const artW = Math.floor(cw / s);
        for (const shaft of [true, false]) {
          const need = per * K.ROOM_MIN + (per - 1) * K.WALL + 2 * K.EDGE + (shaft ? K.SHAFT + K.WALL : 0) + 8;
          if (artW >= need) return { s, artW, per, shaft };
        }
      }
    }
    return { s: 1, artW: Math.max(220, Math.floor(cw)), per: 2, shaft: false };
  }

  function placeRoom(agent, fl, x, y, w, index) {
    const r = { agent, floor: fl, x, y, w, h: K.ROOM_H, fy: y + K.ROOM_H - K.FLOOR };
    r.win = w >= K.WIN_MIN;
    // Centre the bot, desk and props in the part of the room the window leaves.
    const room = w - (r.win ? 22 : 0);
    r.cx = x + Math.max(0, Math.floor((room - K.CONTENT) / 2));
    r.px = r.cx + 40;
    r.seed = Math.floor(hash(index, 3, 11) * 100);
    return r;
  }

  function layout(cw, dpr) {
    const { FLOORS, AGENTS } = P.data;
    const f = fit(cw, dpr);
    const side = 8 + 2 * K.EDGE + (f.shaft ? K.SHAFT + K.WALL : 0);
    const room = Math.min(K.ROOM_MAX, Math.floor((f.artW - side - (f.per - 1) * K.WALL) / f.per));
    const inner = f.per * room + (f.per - 1) * K.WALL;
    const bW = inner + 2 * K.EDGE + (f.shaft ? K.SHAFT + K.WALL : 0);
    const bx0 = Math.floor((f.artW - bW) / 2);
    const ix0 = bx0 + K.EDGE;
    const roofY = K.SKY_H + K.ROOF_H;
    let y = roofY;
    const floors = [], rooms = [];
    for (const fl of FLOORS) {
      const list = AGENTS.filter((a) => a.floor === fl.id);
      const sign = { x: ix0, y, w: inner, h: K.SIGN_H };
      y += K.SIGN_H;
      const rows = [];
      let k = 0;
      rowsOf(list.length, f.per).forEach((cnt, ri, all) => {
        const rw = Math.floor((inner - (cnt - 1) * K.WALL) / cnt);
        const row = [];
        let x = ix0;
        for (let i = 0; i < cnt; i++) {
          const w = i === cnt - 1 ? ix0 + inner - x : rw;
          const r = placeRoom(list[k++], fl, x, y, w, rooms.length);
          rooms.push(r); row.push(r);
          x += w + K.WALL;
        }
        rows.push(row);
        y += K.ROOM_H + (ri < all.length - 1 ? K.WALL : 0);
      });
      floors.push({ fl, sign, rows, bottom: y });
      y += K.WALL;
    }
    const groundY = y - K.WALL;
    const shaft = f.shaft ? { x: ix0 + inner + K.WALL, y: roofY, w: K.SHAFT, h: groundY - roofY } : null;
    return { s: f.s, per: f.per, artW: f.artW, artH: groundY + K.STREET_H, bx0, bW, ix0, inner, floors, rooms, shaft, groundY, roofY };
  }

  // Extra canvases and marks that ride along with each baked layer.
  const EXTRA = new WeakMap();

  // ---- sky and the far city ---------------------------------------------------------
  // Ramps run from the zenith down to the roofline, where the glow sits.
  const SKIES = {
    day: ["#3a86d8", "#4a96e2", "#5ea8ec", "#76baf2", "#92cbf6", "#b4dcf8"],
    dawn: ["#2a2f66", "#4a3f7e", "#7d5488", "#b86b86", "#e89585", "#ffc98a"],
    dusk: ["#241f52", "#3f2d68", "#77406f", "#b4545d", "#e07a52", "#ffb36b"],
    night: ["#070d24", "#0b1330", "#0f1a3d", "#15224a", "#1c2a58", "#2a3160"],
  };
  // The far city in two layers, [lit face, body, shade] each, pulled toward
  // the horizon by distance. `win` lights windows, `lit` is the share on.
  const CITY = {
    day: { far: ["#b9d7ee", "#a8cbe6", "#97bddd"], near: ["#9fc2df", "#8ab1d3", "#769fc4"], win: "#c9e0f1", lit: 0,
      marble: ["#f4f8fa", "#dde9f1", "#c3d6e4"], dome: ["#bfe3d3", "#98ccb8", "#79b09c"], flame: ["#ffd35a", "#e0b43a"] },
    dawn: { far: ["#8a6ca0", "#7b5e93", "#6c5085"], near: ["#6a5590", "#5b4880", "#4d3c70"], win: "#ffcf8a", lit: 0.05,
      marble: ["#e6c6d2", "#c8a8bc", "#a98ca4"], dome: ["#7fa0a8", "#678892", "#52717c"], flame: ["#ffd35a", "#e0b43a"] },
    dusk: { far: ["#7e4f7e", "#6e4372", "#5e3865"], near: ["#5a3762", "#4b2d54", "#3e2447"], win: "#ffc46b", lit: 0.12,
      marble: ["#f0b89a", "#d29a84", "#b27e70"], dome: ["#6f8a7c", "#5a7468", "#475e55"], flame: ["#ffe375", "#ffb347"] },
    night: { far: ["#1c2650", "#172048", "#121a3e"], near: ["#121a3a", "#0e1531", "#0b1028"], win: "#ffd35a", lit: 0.2,
      marble: ["#7f8fc4", "#6272a8", "#4a5888"], dome: ["#5fa89a", "#3f8479", "#2d625c"], flame: ["#ffe375", "#ffb347"] },
  };

  // The dithered ramp, one fillRect per run of equal colour.
  function gradient(R, W, H, HZ, ramp) {
    const n = ramp.length - 1;
    for (let y = 0; y < HZ; y++) {
      const v = (y / HZ) * n, i = Math.floor(v), f = v - i;
      let x0 = 0, cur = null;
      for (let x = 0; x <= W; x++) {
        const col = x === W ? null : f > bayer(x, y) && i < n ? ramp[i + 1] : ramp[i];
        if (col === cur) continue;
        if (cur) R(x0, y, x - x0, 1, cur);
        cur = col; x0 = x;
      }
    }
    R(0, HZ, W, H - HZ, ramp[n]);
  }

  function stars(px, W, top, bot, n) {
    for (let i = 0; i < n; i++) {
      const x = Math.floor(hash(i, 1, 5) * W), y = top + Math.floor(hash(i, 2, 5) * (bot - top)), b = hash(i, 3, 5);
      px(x, y, b > 0.9 ? "#ffffff" : b > 0.6 ? "#c8d2f0" : "#6f7db0");
      if (b > 0.97) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) px(x + dx, y + dy, "#46548a");
    }
  }

  // A crescent from a row-width disk minus the same disk moved up and right;
  // the dark part keeps a faint earthshine, the sky round it a dithered glow.
  const MOON = [5, 9, 11, 11, 13, 13, 13, 13, 13, 11, 11, 9, 5];
  const inMoon = (x, y) => y >= 0 && y < MOON.length && x >= (13 - MOON[y]) >> 1 && x < ((13 - MOON[y]) >> 1) + MOON[y];
  function moon(px, mx, my) {
    for (let y = -7; y < 20; y++) for (let x = -7; x < 20; x++) {
      const d = Math.hypot(x - 6, y - 6);
      if (d >= 7 && d < 13 && ((13 - d) / 6) * 0.45 > bayer(mx + x, my + y)) px(mx + x, my + y, "#1d2a5e");
    }
    for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) {
      if (!inMoon(x, y)) continue;
      if (inMoon(x - 5, y + 2)) { px(mx + x, my + y, "#16214c"); continue; }
      const rim = !inMoon(x - 1, y) || !inMoon(x, y + 1);
      px(mx + x, my + y, rim ? "#fffbe8" : inMoon(x - 4, y + 2) ? "#cfcab4" : "#f3f1e6");
    }
    for (const [x, y] of [[3, 8], [2, 10], [5, 11]]) px(mx + x, my + y, "#d8d3bd");
  }

  // A round sun from a distance test, whole pixels, with a dithered halo.
  function sun(R, px, cx, cy, r, cols, halo) {
    const hr = r * 2.2;
    for (let y = -hr; y <= hr; y++) for (let x = -hr; x <= hr; x++) {
      const d = Math.hypot(x, y);
      if (d > r && d < hr && ((hr - d) / (hr - r)) * 0.7 > bayer(cx + x, cy + y)) px(cx + x, cy + y, d < r * 1.5 ? halo[0] : halo[1]);
    }
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x + 0.5, y + 0.5);
      if (d > r) continue;
      px(cx + x, cy + y, d < r * 0.55 ? cols[0] : x + y > r * 0.6 ? cols[2] : cols[1]);
    }
  }

  function tower(R, px, x, top, w, bot, ramp, T, seed) {
    const [hi, base, lo] = ramp, style = Math.floor(hash(seed, 4, 31) * 4);
    R(x, top, w, bot - top, base);
    R(x, top, 1, bot - top, hi); R(x + w - 1, top, 1, bot - top, lo);
    let crown = top;
    if (style === 0 && w >= 7) { R(x + (w >> 1), top - 6, 1, 6, lo); crown = top - 6; }
    else if (style === 1 && w >= 9) { R(x + 2, top - 3, w - 4, 3, base); R(x + 2, top - 3, 1, 3, hi); crown = top - 3; }
    else if (style === 2) {
      for (let k = 0; k < w - 1; k++) { const hh = (w - 1 - k) >> 1; if (hh) R(x + k, top - hh, 1, hh, k ? base : hi); }
      crown = top - ((w - 2) >> 1);
    }
    if (!T.lit) {
      for (let c = x + 2; c < x + w - 2; c += 2) R(c, top + 2, 1, bot - top - 2, T.win);
      for (let y = top + 4; y < bot; y += 3) R(x + 1, y, w - 2, 1, base);
      return crown;
    }
    for (let y = top + 2; y < bot; y += 3) for (let c = x + 2; c < x + w - 2; c += 2) {
      if (hash(c, y, seed) < T.lit) px(c, y, hash(y, c, seed) < 0.7 ? T.win : "#ffb870");
    }
    return crown;
  }

  // Nearer mid-rise blocks: a capped parapet, square windows, a small tank.
  function midrise(R, px, x, top, w, bot, T, seed) {
    const [hi, base, lo] = T.near;
    R(x, top, w, bot - top, base);
    R(x, top, 1, bot - top, hi); R(x + w - 1, top, 1, bot - top, lo); R(x, top, w, 1, hi);
    for (let y = top + 3; y < bot - 2; y += 5) for (let c = x + 2; c < x + w - 3; c += 4) {
      const on = T.lit && hash(c, y, seed) < T.lit * 1.4;
      R(c, y, 2, 2, on ? (hash(y, c, seed) < 0.6 ? T.win : "#9fd0ff") : lo);
    }
    if (hash(seed, 7, 33) < 0.5) { R(x + 2, top - 4, 4, 3, lo); px(x + 2, top - 1, lo); px(x + 5, top - 1, lo); }
    else R(x + w - 3, top - 5, 1, 5, lo);
  }

  // Monas far off: the gold flame, the deck under it, the tapering obelisk.
  function monas(R, px, x, top, bot, T) {
    const [hi, base, lo] = T.marble, [f1, f2] = T.flame;
    for (let y = top + 6; y < bot; y++) {
      const w = y < top + 20 ? 3 : y < top + 36 ? 4 : 5, x0 = x - ((w - 1) >> 1);
      R(x0, y, w, 1, base); px(x0, y, hi); px(x0 + w - 1, y, lo);
    }
    R(x - 2, top + 4, 5, 1, lo); R(x - 1, top + 5, 3, 1, base);
    px(x, top, f1); R(x - 1, top + 1, 3, 2, f1); px(x + 1, top + 2, f2); R(x - 1, top + 3, 3, 1, f2);
    return [x, top];
  }

  // A mosque on the near side: hall, drum, a dome lit from the upper left
  // (floodlit green at night), and a minaret with two balconies.
  const DOME = [4, 8, 10, 12, 14, 14, 16, 16];
  function mosque(R, px, cx, P0, bot, T) {
    const [dhi, dbase, dlo] = T.dome, [hi, base, lo] = T.near, dt = P0 - 22;
    R(cx - 13, dt + 11, 26, bot - dt - 11, base); R(cx - 13, dt + 11, 1, bot - dt - 11, hi); R(cx + 12, dt + 11, 1, bot - dt - 11, lo);
    R(cx - 13, dt + 11, 26, 1, hi);
    for (let k = -2; k <= 2; k++) { R(cx + k * 5 - 1, dt + 14, 3, 4, T.lit ? T.win : lo); px(cx + k * 5 - 1, dt + 14, base); px(cx + k * 5 + 1, dt + 14, base); }
    R(cx - 10, dt + 8, 20, 3, base); R(cx - 10, dt + 8, 20, 1, hi);
    DOME.forEach((w, i) => {
      const x0 = cx - (w >> 1), q = Math.max(1, w >> 2);
      R(x0, dt + i, w, 1, dbase); R(x0, dt + i, q, 1, dhi); R(x0 + w - q, dt + i, q, 1, dlo);
    });
    R(cx, dt - 4, 1, 4, T.flame[1]); px(cx - 1, dt - 6, T.flame[1]); px(cx - 1, dt - 5, T.flame[1]); px(cx, dt - 6, T.flame[1]);
    const mx = cx + 16, mt = P0 - 38;
    R(mx, mt + 5, 4, bot - mt - 5, base); R(mx, mt + 5, 1, bot - mt - 5, hi); R(mx + 3, mt + 5, 1, bot - mt - 5, lo);
    for (const by of [mt + 12, mt + 24]) { R(mx - 1, by, 6, 2, lo); R(mx - 1, by, 6, 1, hi); if (T.lit) px(mx + 1, by + 2, "#9cf0cb"); }
    R(mx + 1, mt + 2, 2, 3, dbase); R(mx + 1, mt + 2, 1, 3, dhi); R(mx + 1, mt - 1, 1, 3, T.flame[1]);
  }

  // Far towers first, then Monas, then the nearer blocks and the mosque.
  // Returns where the red aviation lights and the Monas flame sit.
  function skyline(R, px, L, bk) {
    const T = CITY[bk], P0 = L.roofY - 7, bot = L.groundY, W = L.artW, beacons = [];
    for (let x = -3, i = 0; x < W; i++) {
      const w = 5 + Math.floor(hash(i, 1, 31) * 11);
      const top = P0 - 8 - Math.floor(Math.pow(hash(i, 2, 31), 1.5) * 40);
      const crown = tower(R, px, x, top, w, bot, T.far, T, i);
      if (top < P0 - 30) beacons.push([x + (w >> 1), crown - 1]);
      x += w + Math.floor(hash(i, 3, 31) * 9) - 1;
    }
    const flame = monas(R, px, Math.round(W * 0.47), P0 - 52, bot, T);
    for (let x = -6, i = 0; x < W; i++) {
      const w = 10 + Math.floor(hash(i, 1, 37) * 16);
      if (hash(i, 4, 37) < 0.72) midrise(R, px, x, P0 - 4 - Math.floor(hash(i, 2, 37) * 18), w, bot, T, i);
      x += w + Math.floor(hash(i, 3, 37) * 6);
    }
    mosque(R, px, P.hqCity.roofPlan(L).gap, P0, bot, T);
    return { beacons, flame };
  }

  function bakeSky(L, bk) {
    const P0 = L.roofY - 7, W = L.artW;
    const sky = paint(W, L.artH, (R, px) => {
      gradient(R, W, L.groundY, P0, SKIES[bk]);
      if (bk === "night") { stars(px, W, 1, P0 - 10, 80); moon(px, W - 46, 6); }
      if (bk === "dusk") stars(px, W, 1, 12, 14);
      if (bk === "day") sun(R, px, 26, 12, 5, ["#fffbe0", "#fff0a8", "#ffd978"], ["#dff0fc", "#c6e3fa"]);
      if (bk === "dawn") sun(R, px, Math.round(W * 0.2), P0 - 6, 9, ["#fff0c8", "#ffd49a", "#ffb877"], ["#ffc79a", "#f4a88c"]);
      if (bk === "dusk") sun(R, px, Math.round(W * 0.8), P0 - 5, 10, ["#fff0c0", "#ffc27a", "#ff9e5e"], ["#ffb47a", "#f09065"]);
    });
    let marks = null;
    const city = paint(W, L.artH, (R, px) => { marks = skyline(R, px, L, bk); });
    EXTRA.set(sky, Object.assign({ city }, marks));
    return sky;
  }

  // ---- sky life -------------------------------------------------------------------
  // The shared cloud sprites, tinted to the hour and drifting at three depths.
  // At night they stay thin and dim, lit only by the moon.
  const CLOUD_TINT = { day: null, dawn: ["#ff9fb0", 0.3], dusk: ["#ff9a6b", 0.34], night: ["#1a2350", 0.82] };
  const DRIFT = [{ y: 3, v: 1.1 }, { y: 10, v: 1.8 }, { y: 1, v: 2.7 }];
  const CLOUDS = {};
  function cloudArt(bk) {
    if (CLOUDS[bk]) return CLOUDS[bk];
    const list = P.hqArt.clouds.map((c, i) => (i === 2 ? flip(c.body) : c.body));
    return (CLOUDS[bk] = list.map((c) => P.hqCity.tintWith(c, CLOUD_TINT[bk])));
  }

  function clouds(g, L, bk, t) {
    const set = cloudArt(bk);
    g.globalAlpha = bk === "night" ? 0.62 : 1;
    for (let k = 0; k < DRIFT.length; k++) {
      const c = set[k], span = L.artW + c.width + 24;
      const x = Math.round(((hash(k, 1, 2) * span + t * DRIFT[k].v) % span) - c.width - 12);
      g.drawImage(c, x, DRIFT[k].y);
    }
    g.globalAlpha = 1;
  }

  // A plane crossing at night: steady red wing light, white tail strobe.
  function plane(p, L, t) {
    const x = Math.round(L.artW + 10 - ((t + 9.3) % 90) * 9), y = 11;
    if (x < -12 || x > L.artW + 2) return;
    p.R(x, y, 8, 1, "#2e3a6c"); p.R(x + 6, y - 2, 2, 2, "#2e3a6c"); p.R(x + 3, y + 1, 3, 1, "#26305e");
    p.px(x + 3, y + 1, "#ff4a3a");
    if ((t * 1.3) % 1 < 0.12) p.px(x + 7, y - 2, "#ffffff");
    if ((t * 1.1 + 0.5) % 1 < 0.2) p.px(x + 4, y - 1, "#ff6a4a");
  }

  // A small flock by day and at dusk, now and then, flapping out of step.
  const FLOCK = [[0, 0], [7, 4], [12, -2], [17, 6], [23, 2]];
  function birds(p, L, bk, t) {
    const q = ((t + 9) % 64) * 16;
    if (q > L.artW + 60) return;
    const x0 = Math.round(q - 30), col = bk === "day" ? "#2a3a48" : "#2b1d33";
    FLOCK.forEach(([dx, dy], i) => {
      const x = x0 - dx, y = 18 + dy + (Math.floor(t * 2 + i) % 2);
      if (Math.floor(t * 5 + i * 1.7) % 2 === 0) {
        p.px(x, y, col); p.px(x + 4, y, col); p.px(x + 1, y + 1, col); p.px(x + 3, y + 1, col); p.px(x + 2, y + 2, col);
      } else { p.R(x, y + 1, 2, 1, col); p.R(x + 3, y + 1, 2, 1, col); p.px(x + 2, y + 2, col); }
    });
  }

  function twinkle(p, L, t) {
    for (let i = 0; i < 14; i++) {
      const on = Math.floor(t * 1.7 + i * 5) % 9 !== 0;
      const x = Math.floor(hash(i, 8, 5) * L.artW), y = 2 + Math.floor(hash(i, 9, 5) * (L.roofY - 22));
      p.px(x, y, on ? "#ffffff" : "#3a4a80");
    }
  }

  // Behind the far city: twinkling stars, the plane, the clouds.
  function skyBack(g, p, L, bk, t) {
    if (bk === "night") twinkle(p, L, t);
    if (bk === "night" || bk === "dusk") plane(p, L, t);
    clouds(g, L, bk, t);
  }

  // In front of it: birds, and the red lights on the tallest towers.
  function skyFront(g, p, L, bk, t, city) {
    if (bk !== "night") birds(p, L, bk, t);
    if (!city || (bk !== "night" && bk !== "dusk")) return;
    city.beacons.forEach(([x, y], i) => { if ((t * 0.7 + i * 0.37) % 1 < 0.45) p.px(x, y, "#ff5a4a"); });
    if (city.flame) p.px(city.flame[0], city.flame[1], Math.floor(t * 4) % 2 ? "#ffe375" : "#ffb347");
  }

  // ---- the building -----------------------------------------------------------------
  // Plaster and metal ramps in day colours; the bake shifts them per bucket.
  const PL = { hi: "#f6efdc", base: "#e9dfc6", joint: "#ddd2b6", shade: "#cbbf9f", low: "#b0a283", speck: "#d6cbb0" };
  const MT = { hi: "#c9d0c4", base: "#9aa294", mid: "#8d968a", lo: "#5e645d", rivet: "#e6ebe2", led: "#b7bfb2" };
  // Behind the floor names: painted as is, so the cream text keeps its contrast.
  const SIGN_IN = "#26302c", SIGN_SH = "#1c2522";
  const DIGITS = { 0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110", 4: "101101111001001",
    5: "111100110001110", 6: "011100110101010", 7: "111001010010010", 8: "010101010101010", 9: "010101011001110" };

  // A pilaster down a side of the building: lit edge, shaded edge, rusticated
  // joints and a scatter of plaster speckle.
  function pilaster(R, px, x, y0, y1, right) {
    const h = y1 - y0;
    R(x, y0, K.EDGE, h, PL.base); R(x, y0, 1, h, PL.hi);
    R(x + K.EDGE - 1, y0, 1, h, right ? PL.low : PL.shade);
    if (right) R(x + K.EDGE - 2, y0, 1, h, PL.shade);
    for (let y = y0 + 6; y < y1; y += 8) { R(x + 1, y, K.EDGE - 2, 1, PL.joint); px(x + 1, y + 1, PL.hi); }
    for (let i = 0; i < h / 3; i++) px(x + 1 + Math.floor(hash(i, x, 42) * 3), y0 + Math.floor(hash(i, x, 41) * h), hash(i, x, 43) > 0.5 ? PL.speck : PL.hi);
  }

  function walls(R, px, L) {
    const top = L.roofY, bot = L.groundY;
    R(L.bx0 - 1, top - 1, L.bW + 2, bot - top + 1, C.ink);
    R(L.bx0, top, L.bW, bot - top, PL.base);
    pilaster(R, px, L.bx0, top, bot, false);
    pilaster(R, px, L.bx0 + L.bW - K.EDGE, top, bot, true);
  }

  // The parapet: a projecting coping with a lit top and a shadowed lip, cast
  // in lengths with worn joints, then the wall with scuppers and their stains.
  function parapet(R, px, L) {
    const y = L.roofY - 7, x0 = L.bx0 - 3, w = L.bW + 6;
    R(x0, y, w, 4, C.ink);
    R(x0 + 1, y + 1, w - 2, 1, PL.hi); R(x0 + 1, y + 2, w - 2, 1, PL.base);
    for (let x = x0 + 12; x < x0 + w - 6; x += 22) { px(x, y + 1, PL.joint); px(x, y + 2, PL.low); px(x + 1, y + 2, PL.shade); }
    for (let i = 0; i < w / 5; i++) px(x0 + 2 + Math.floor(hash(i, 5, 45) * (w - 4)), y + 1 + (hash(i, 6, 45) < 0.4 ? 1 : 0), hash(i, 7, 45) < 0.5 ? PL.speck : PL.joint);
    R(L.bx0 - 1, y + 3, L.bW + 2, 1, PL.low);
    R(L.bx0 - 1, y + 4, L.bW + 2, 2, PL.base); R(L.bx0 - 1, y + 5, L.bW + 2, 1, PL.shade);
    for (let i = 0; i < L.bW / 4; i++) px(L.bx0 + Math.floor(hash(i, 8, 45) * L.bW), y + 4, PL.speck);
    for (let x = L.bx0 + 24; x < L.bx0 + L.bW - 16; x += 58) {
      R(x - 1, y + 4, 4, 1, PL.low); R(x, y + 4, 2, 1, "#4a4f49"); px(x, y + 5, "#9a8e72"); px(x + 1, y + 5, PL.low);
    }
  }

  // The metal band that carries each floor's name: a lit top lip with rivets,
  // the dark field the DOM text sits on, and an LED strip along the bottom.
  function signBand(R, R0, px, sg, dark) {
    R(sg.x - 1, sg.y, sg.w + 2, sg.h, MT.base);
    R(sg.x - 1, sg.y, sg.w + 2, 1, MT.hi);
    R(sg.x - 1, sg.y + 1, 1, sg.h - 1, MT.hi); R(sg.x + sg.w, sg.y + 1, 1, sg.h - 1, MT.lo);
    R0(sg.x + 1, sg.y + 2, sg.w - 2, sg.h - 3, SIGN_IN);
    R0(sg.x + 1, sg.y + 2, sg.w - 2, 1, SIGN_SH);
    for (let x = sg.x + 5; x < sg.x + sg.w - 3; x += 16) { px(x, sg.y + 1, MT.rivet); px(x + 1, sg.y + 1, MT.lo); }
    const y = sg.y + sg.h - 1;
    R(sg.x - 1, y, sg.w + 2, 1, MT.lo);
    for (let x = sg.x + 1, i = 0; x < sg.x + sg.w - 1; x += 3, i++) px(x, y, dark ? (i % 4 ? "!#e0b060" : "!#fff0b0") : MT.led);
  }

  // The cut wall between two rooms, lit on its left face.
  function pillar(R, x, y, h) {
    R(x, y, 1, h, "#e3d8bd"); R(x + 1, y, 1, h, PL.shade); R(x + 2, y, 1, h, PL.low);
  }

  // Between floors the slab shows in section across the rooms and as a
  // moulded cornice on the pilasters, projecting past both sides.
  function cornice(R, L, y) {
    const x0 = L.bx0 - 3, w = L.bW + 6, x1 = L.ix0, x2 = L.ix0 + L.inner;
    R(x0 - 1, y - 1, 4, 5, C.ink); R(x0 + w - 3, y - 1, 4, 5, C.ink);
    R(x0, y, w, 1, PL.hi); R(x0, y + 1, w, 1, PL.shade); R(x0, y + 2, w, 1, PL.low);
    R(x1, y, x2 - x1, 1, MT.hi); R(x1, y + 1, x2 - x1, 1, MT.mid); R(x1, y + 2, x2 - x1, 1, MT.lo);
    R(L.bx0, y + 3, K.EDGE, 1, PL.low); R(L.bx0 + L.bW - K.EDGE, y + 3, K.EDGE, 1, PL.low);
  }

  function floorBake(R, R0, px, g, L, F, dark) {
    signBand(R, R0, px, F.sign, dark);
    F.rows.forEach((row, ri) => {
      for (const r of row) P.rooms.shell(R0, g, r, dark);
      const r0 = row[0], rl = row[row.length - 1], y = r0.y + r0.h;
      for (let i = 1; i < row.length; i++) pillar(R, row[i].x - K.WALL, r0.y, r0.h);
      if (L.shaft) pillar(R, rl.x + rl.w, r0.y, r0.h);
      if (y >= L.groundY) return;
      if (ri < F.rows.length - 1) {
        R(r0.x, y, rl.x + rl.w - r0.x, 1, MT.hi); R(r0.x, y + 1, rl.x + rl.w - r0.x, 1, MT.mid); R(r0.x, y + 2, rl.x + rl.w - r0.x, 1, MT.lo);
      } else cornice(R, L, y);
    });
  }

  // An outdoor AC unit on the left pilaster, its drain pipe and the stain.
  function acUnit(R, px, x, y) {
    R(x, y, 7, 6, C.ink);
    R(x + 1, y + 1, 5, 4, "#dfe2d8"); R(x + 1, y + 1, 5, 1, "#f3f1e6"); R(x + 5, y + 2, 1, 3, "#b7bfb2");
    R(x + 1, y + 2, 3, 3, "#6b7468"); px(x + 2, y + 3, "#b7bfb2");
    px(x + 1, y + 6, "#5e645d"); px(x + 5, y + 6, "#5e645d");
    R(x + 4, y + 6, 1, 6, "#b7bfb2");
    for (let k = 0; k < 10; k++) if (hash(k, y, 44) < 0.85 - k * 0.07) px(x + 4 + (k > 5 ? 1 : 0), y + 12 + k, "#d3c7a8");
  }

  // A pot on a cornice end, its creeper trailing down over the ledge.
  function planter(R, px, x, y) {
    R(x - 1, y - 5, 6, 4, C.ink);
    R(x, y - 4, 4, 2, "#b0654a"); R(x, y - 4, 4, 1, "#d98a6a"); px(x + 3, y - 3, "#8a4a36");
    for (let k = 0; k < 6; k++) px(x - 1 + k, y - 6 - (k % 3 === 1 ? 1 : 0), k % 2 ? C.leaf2 : C.leaf);
    px(x + 1, y - 8, C.leaf); px(x + 3, y - 7, "#f28bbd");
    for (let k = 0; k < 11; k++) px(x + (k % 4 === 2 ? 1 : 0), y - 2 + k, k % 3 ? C.leaf2 : C.leaf3);
  }

  // Air conditioners, planters, the downspout and the building number (the
  // count of agents inside, digits stacked on a blue enamel plate).
  function fixtures(R, px, L) {
    const n = L.floors.length;
    L.floors.forEach((F, i) => {
      if (i === n - 1) return;
      acUnit(R, px, L.bx0 - 3, F.sign.y + K.SIGN_H + 16 + (i % 2) * 18);
      if (i % 2 === 0) planter(R, px, L.bx0 - 4, F.bottom);
    });
    const dx = L.bx0 + L.bW - 3, top = L.roofY - 4;
    R(dx - 1, top, 4, 3, "#8d968a"); R(dx - 1, top, 4, 1, "#c3c9be");
    R(dx, top + 3, 2, L.groundY - top - 5, "#8d968a"); R(dx, top + 3, 1, L.groundY - top - 5, "#c3c9be");
    for (let y = top + 14; y < L.groundY - 4; y += 24) R(dx - 1, y, 4, 1, "#5e645d");
    R(dx, L.groundY - 2, 3, 2, "#8d968a"); R(dx, L.groundY - 2, 3, 1, "#c3c9be");
    const num = String(P.data.AGENTS.length), py = L.groundY - 50;
    R(L.bx0, py, K.EDGE, num.length * 6 + 1, "#2b6f8f"); R(L.bx0, py, K.EDGE, 1, "#4a9fc0");
    [...num].forEach((d, i) => {
      const bits = DIGITS[d];
      for (let b = 0; b < 15; b++) if (bits[b] === "1") px(L.bx0 + 1 + (b % 3), py + 1 + i * 6 + Math.floor(b / 3), "#f3f1e6");
    });
  }

  // ---- the neighbours -------------------------------------------------------------
  // Ruko next door, seen as slivers in the margins: pastel storeys with barred
  // windows and an AC box, a striped awning over a rolling door. No signs.
  function ruko(R, x0, x1, G, floors, seed) {
    const w = x1 - x0, top = G - floors * 34 - 6;
    const [wall, wallS] = [["#f2e6b6", "#d9cb98"], ["#cfe6cf", "#a9c9ab"], ["#f0d6c4", "#d4b7a3"]][seed % 3];
    R(x0, top, w, G - top, wall);
    R(x0, top, w, 1, "#fff7e0"); R(x0, top + 1, w, 2, wallS);
    for (let f = 0; f < floors - 1; f++) {
      const y = top + 6 + f * 34;
      R(x0, y + 7, w, 13, "#3a4a52");
      for (let x = x0 + (seed & 1); x < x1; x += 2) R(x, y + 7, 1, 13, "#8d968a");
      R(x0, y + 20, w, 1, "#fff7e0"); R(x0, y + 21, w, 1, wallS);
      if ((f + seed) % 2 === 0) { R(x0, y + 24, Math.min(w, 6), 4, "#dfe2d8"); R(x0, y + 27, Math.min(w, 6), 1, "#9aa294"); }
      R(x0, y + 32, w, 2, "#b7bfb2");
    }
    const dy = G - 27;
    for (let x = x0; x < x1; x++) R(x, dy, 1, 3, (x >> 1) % 2 ? "#f3f1e6" : "#d9543f");
    R(x0, dy + 3, w, 1, "#8a3325");
    for (let y = dy + 5; y < G; y++) R(x0, y, w, 1, y % 2 ? "#9aa294" : "#7d857a");
  }

  function neighbours(R, px, L) {
    if (L.bx0 - 1 > 0) ruko(R, 0, L.bx0 - 1, L.groundY, 3, 0);
    const rx = L.bx0 + L.bW + 1;
    if (rx < L.artW) ruko(R, rx, L.artW, L.groundY, 4, 1);
  }

  // ---- the elevator shaft --------------------------------------------------------
  const SH = { wall: "#1a2226", seam: "#151c1f", speck: "#222c31", rail: "#4b555a", railHi: "#7d8a90", beam: "#2d3a3f",
    door: "#46545b", doorHi: "#5d6c73", doorLo: "#34404a", frame: "#6b7a80", lamp: "#3d4a50" };

  // Where the car stops on each floor, top to bottom.
  const stopsOf = (L) => L.floors.map((F) => F.rows[F.rows.length - 1][0].y + K.ROOM_H - 21);

  function shaftBake(R, px, L) {
    const sh = L.shaft;
    R(sh.x - 1, sh.y, sh.w + 2, sh.h, C.ink);
    R(sh.x, sh.y, sh.w, sh.h, SH.wall);
    for (let x = sh.x + 4; x < sh.x + sh.w - 2; x += 4) R(x, sh.y, 1, sh.h, SH.seam);
    for (let i = 0; i < sh.h / 3; i++) px(sh.x + 1 + Math.floor(hash(i, 3, 81) * (sh.w - 2)), sh.y + Math.floor(hash(i, 4, 81) * sh.h), SH.speck);
    for (const F of L.floors) { R(sh.x, F.sign.y + 4, sh.w, 3, SH.beam); R(sh.x, F.sign.y + 4, sh.w, 1, SH.rail); }
    for (const y of stopsOf(L)) {
      R(sh.x + 3, y + 1, sh.w - 6, 17, SH.frame);
      R(sh.x + 4, y + 2, sh.w - 8, 16, SH.door); R(sh.x + 4, y + 2, 1, 16, SH.doorHi);
      R(sh.x + (sh.w >> 1), y + 2, 1, 16, SH.doorLo); R(sh.x + (sh.w >> 1) + 1, y + 2, 1, 16, SH.doorHi);
      R(sh.x + 2, y + 18, sh.w - 4, 1, SH.railHi);
      R(sh.x + 6, y - 3, 4, 2, SH.lamp);
    }
    R(sh.x + 1, sh.y, 1, sh.h, SH.rail); R(sh.x + sh.w - 2, sh.y, 1, sh.h, SH.rail);
    for (let y = sh.y + 4; y < sh.y + sh.h; y += 10) { px(sh.x + 1, y, SH.railHi); px(sh.x + sh.w - 2, y, SH.railHi); }
  }

  // The car carries a courier bot between random floors; the counterweight
  // rides the other way behind it, and the lamp over the nearest landing lights.
  function carY(stops, t) {
    const leg = 5.5, travel = 2.2;
    const n = Math.floor(t / leg), q = (t % leg) / leg;
    const pick = (k) => stops[Math.floor(hash(k, 1, 77) * stops.length)];
    const from = pick(n), to = pick(n + 1);
    return Math.round(from + (to - from) * P.ease.inOutQuad(Math.min(1, q * (leg / travel))));
  }

  function drawShaft(g, p, L, t, T, dark) {
    const sh = L.shaft;
    if (!sh) return;
    const stops = stopsOf(L), cy = carY(stops, t), { R, px } = p;
    const cw = stops[0] + stops[stops.length - 1] - cy + 3;
    R(sh.x + sh.w - 5, sh.y, 1, cw - sh.y, T("#6b7468"));
    R(sh.x + sh.w - 7, cw, 4, 12, C.ink); R(sh.x + sh.w - 6, cw + 1, 2, 10, T("#5e645d"));
    for (let y = cw + 3; y < cw + 11; y += 3) R(sh.x + sh.w - 6, y, 2, 1, T("#3a3f44"));
    R(sh.x + 6, sh.y, 1, cy - sh.y, T("#8d968a")); R(sh.x + 9, sh.y, 1, cy - sh.y, T("#6b7468"));
    R(sh.x + 1, cy - 2, sh.w - 2, 20, C.ink);
    R(sh.x + 4, cy - 1, sh.w - 8, 1, T("#6b7468"));
    R(sh.x + 2, cy, sh.w - 4, 17, T(C.stone)); R(sh.x + 2, cy, 1, 17, T("#e6dfcb")); R(sh.x + sh.w - 3, cy, 1, 17, T(C.stone2));
    R(sh.x + 3, cy + 1, sh.w - 6, 1, dark ? "#ffe9a8" : T("#f3f1e6"));
    R(sh.x + 3, cy + 2, sh.w - 6, 8, T("#8fb8c8")); px(sh.x + 4, cy + 3, T("#c6e3ec")); px(sh.x + 5, cy + 2, T("#c6e3ec"));
    g.drawImage(P.hqArt.courier.right.stand, sh.x + ((sh.w - P.hqArt.courier.w) >> 1), cy + 3);
    R(sh.x + 9, cy + 10, 4, 3, T(C.white)); px(sh.x + 10, cy + 11, T(C.red));
    R(sh.x + 2, cy + 16, sh.w - 4, 1, T(C.stone3));
    let near = 0;
    stops.forEach((y, i) => { if (Math.abs(y - cy) < Math.abs(stops[near] - cy)) near = i; });
    R(sh.x + 6, stops[near] - 3, 4, 2, "#ffe375");
  }

  function bakeBuilding(L, bk) {
    const city = P.hqCity, dark = bk === "night" || bk === "dusk";
    const b = paint(L.artW, L.artH, (R0, px0, g) => {
      const { R, px } = city.toned(R0, bk);
      neighbours(R, px, L);
      city.roofBack(R, px, g, L, bk);
      walls(R, px, L);
      parapet(R, px, L);
      city.roofLedge(R, px, g, L, bk);
      for (const F of L.floors) floorBake(R, R0, px, g, L, F, dark);
      if (L.shaft) shaftBake(R, px, L);
      fixtures(R, px, L);
      city.street(R, px, g, L, bk);
    });
    EXTRA.set(b, { front: city.front(L, bk), fore: city.fore(L, bk) });
    return b;
  }

  // ---- per frame --------------------------------------------------------------------
  function frame(S, t) {
    const L = S.L, g = S.g, bk = S.bk, city = P.hqCity;
    const p = P.bots.pen(g);
    const dark = bk === "night" || bk === "dusk";
    const sky = EXTRA.get(S.skyLayer) || {}, build = EXTRA.get(S.buildLayer) || {};
    g.clearRect(0, 0, L.artW, L.artH);
    g.drawImage(S.skyLayer, 0, 0);
    skyBack(g, p, L, bk, t);
    if (sky.city) g.drawImage(sky.city, 0, 0);
    skyFront(g, p, L, bk, t, sky);
    g.drawImage(S.buildLayer, 0, 0);
    city.roofLive(g, p, L, bk, t);
    for (const r of L.rooms) P.rooms.draw(g, p, r, t, S);
    drawShaft(g, p, L, t, city.toner(bk), dark);
    city.streetLive(g, p, L, bk, t, build);
  }

  function buildArt() {
    const bots = {};
    for (const a of P.data.AGENTS) bots[a.id] = P.bots.robot(a.look);
    const spr = P.sprites.build();
    const av = spr.avatar;
    // Seated, near arm forward on the keyboard: the second typing frame.
    const base = av.seated.right;
    av.typing = P.paint(base.width, base.height, (R, px, g) => {
      g.drawImage(base, 0, 0);
      R(6, 7, 2, 1, C.skin); px(8, 7, C.ink);
    });
    P.hqArt = {
      bots, avatar: av, sprites: spr,
      courier: P.bots.robot({ body: C.sky, shade: C.blue2, light: C.white }),
      clouds: [spr.clouds[3], spr.clouds[4], spr.clouds[3]],
    };
  }

  P.hq = { K, layout, bakeSky, bakeBuilding, frame, buildArt, wibHour, bucket, scales };
})((window.PETA = window.PETA || {}));
