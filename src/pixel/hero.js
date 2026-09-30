// Hero scene: my desk in Jakarta. I type at the Mac Mini, and every few
// seconds a new agent takes shape on the main screen, steps out onto the
// desk, hops down and walks out of frame. The window shows the real sky over
// Jakarta right now; the wall clock shows the real time. The room is baked
// once per sky bucket in hero-art.js; this file draws only what moves.
(function (P) {
  "use strict";
  const { hash, PAL: C } = P;
  const A = P.heroArt, G = A.G, W = G.W, H = G.H;
  const SPAWN = 3.2, LIFE = 5.2;
  const SPAWN_X = 99, EDGE_X = 128, LAND_X = 140;   // where a bot appears, leaves the desk, lands
  const SYN = [C.sky, C.mint, C.sun, C.rose, C.white2, C.orange1];

  // ---- the window: sky life behind the city, birds and the KRL in front --
  function drawWindow(S, t) {
    const g = S.g, v = S.art.view, gl = G.glass, bk = S.bk;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(gl.x + x, gl.y + y, w, h); };
    g.save();
    g.beginPath(); g.rect(gl.x, gl.y, gl.w, gl.h); g.clip();
    g.drawImage(v.sky, gl.x, gl.y);
    if (bk === "night") twinkle(R, t);
    if (bk !== "day") plane(R, t); else clouds(R, t);
    g.drawImage(v.city, gl.x, gl.y);
    if (bk !== "day") for (const [x, y] of A.RED_LIGHTS) R(x, y, 1, 1, Math.floor(t * 1.2 + x) % 2 ? "#6a1c18" : "#ff4a3a");
    if (bk !== "night") birds(R, t, bk);
    train(R, t, S.tc);
    g.drawImage(v.front, gl.x, gl.y);
    g.restore();
  }

  function twinkle(R, t) {
    const n = Math.floor(t * 3);
    for (let i = 0; i < 16; i++) {
      const x = Math.floor(hash(i, 1, 71) * G.glass.w), y = 8 + Math.floor(hash(i, 2, 71) * 18);
      if ((Math.abs(x - 34) > 3 || Math.abs(y - 13) > 3) && hash(i, n, 72) < 0.18) R(x, y, 1, 1, "#34406e");
    }
  }

  // Two small clouds drift across the day sky, one pixel every 1.5 s.
  function clouds(R, t) {
    for (let i = 0; i < 2; i++) {
      const x = Math.round(((t / 1.5 + i * 31) % 62) - 12), y = 9 + i * 7;
      R(x + 2, y, 5, 1, "#e6f2fb"); R(x, y + 1, 10, 1, "#f3f8fc"); R(x + 1, y + 2, 9, 1, "#cfe3f3");
    }
  }

  // A plane crossing now and then: only its lights show against the sky.
  function plane(R, t) {
    const p = (t % 14) / 8;
    if (p >= 1) return;
    const x = Math.round(-2 + p * 46), y = Math.round(17 - p * 4);
    if (t % 1 < 0.18) R(x, y, 1, 1, "#ff5a4a");
    if (t % 1.3 < 0.08) R(x + 1, y, 1, 1, "#ffffff");
    else R(x + 1, y, 1, 1, "#5a6078");
  }

  function birds(R, t, bk) {
    const col = bk === "day" ? "#2c3440" : "#2a1a30", bx = 50 - ((t * 3.5) % 64);
    for (let i = 0; i < 3; i++) {
      const x = Math.round(bx + i * 5), y = 14 + (i % 2) * 2 - (i === 2 ? 3 : 0);
      R(x, y, 1, 1, col);
      const up = Math.floor(t * 5 + i * 1.3) % 2 ? -1 : 1;
      R(x - 1, y + up, 1, 1, col); R(x + 1, y + up, 1, 1, col);
    }
  }

  // The KRL on its elevated line: five cars, about every 17 seconds.
  function train(R, t, tc) {
    const n = Math.floor(t / 17), p = (t - n * 17) / 3.4;
    if (p >= 1) return;
    const dir = hash(n, 5, 93) > 0.5 ? 1 : -1, x0 = Math.round(dir > 0 ? -41 + p * 84 : 42 - p * 84);
    for (let c = 0; c < 5; c++) {
      const x = x0 + c * 8, nose = (c === 0 && dir < 0) || (c === 4 && dir > 0);
      R(x + (nose && dir < 0 ? 1 : 0), 33, nose ? 6 : 7, 1, tc.roof);
      R(x, 34, 7, 1, tc.win);
      for (let k = 1; k < 7; k += 2) R(x + k, 34, 1, 1, tc.body);
      R(x, 35, 7, 1, tc.stripe); R(x, 36, 7, 1, tc.under);
      if (c % 2) R(x + 3, 32, 1, 1, tc.under);
    }
  }

  function trainColours(bk) {
    const tone = (hex) => A.mix(A.mul(hex, A.VIEW_AMB[bk]), A.HAZE[bk], 0.2);
    return { roof: tone("#c9ccc4"), win: bk === "night" ? "#ffe39a" : tone("#3a4550"), body: tone("#e6e8e0"),
      stripe: tone("#d9543f"), under: tone("#3a3f46") };
  }

  // ---- screens ------------------------------------------------------------------
  // Main 4K screen: an editor typing one line every 1.1 s; a new agent is
  // printed on it row by row before it steps out.
  function drawMain(S, t, age, bot) {
    const g = S.g, s = G.scr;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(s.x + x, s.y + y, w, h); };
    R(0, 0, s.w, s.h, "#0f1f27"); R(0, 0, s.w, 2, "#0a161c"); R(2, 0, 9, 2, "#17323c"); R(12, 1, 6, 1, "#12262e");
    R(0, 2, 7, s.h - 3, "#0a161c");
    for (let i = 0; i < 9; i++) R(1 + (i % 3 ? 2 : 0), 4 + i * 2, 2 + ((hash(i, 1, 13) * 3) | 0), 1, i === 4 ? C.sky : "#46565c");
    R(0, 11, 7, 1, "#17323c"); R(3, 12, 3, 1, C.sky);
    const c = Math.floor(t / 1.1), p = (t - c * 1.1) / 1.1;
    let cur = 0;
    for (let k = 0; k < 10; k++) {
      const i = c - 9 + k;
      if (i < 0) continue;
      R(8, 3 + k * 2, 1, 1, "#34464c");
      cur = codeLine(R, i, 10, 3 + k * 2, k === 9 ? p : 1);
    }
    if (S.still || Math.floor(t * 2) % 2 === 0) R(cur, 21, 1, 1, C.sun);
    R(0, s.h - 1, s.w, 1, "#1d4f46"); R(1, s.h - 1, 5, 1, "#2f7a6a"); R(s.w - 9, s.h - 1, 7, 1, "#27665a");
    if (age < 0.45 && !S.still) printBot(g, s, age, bot);
  }

  function codeLine(R, i, x, y, frac) {
    let cx = x + ((hash(i, 1, 14) * 3) | 0) * 2;
    if (hash(i, 0, 14) < 0.12) return cx;
    const end = Math.min(x + 35, cx + Math.round((8 + ((hash(i, 2, 14) * 26) | 0)) * Math.min(1, frac * 1.25)));
    for (let j = 0; cx < end; j++) {
      const len = 2 + ((hash(i, 10 + j, 14) * 6) | 0);
      R(cx, y, Math.min(len, end - cx), 1, SYN[(hash(i, 20 + j, 14) * SYN.length) | 0]);
      cx += len + 1;
    }
    return Math.min(cx, x + 35);
  }

  function printBot(g, s, age, bot) {
    const q = age / 0.45, rowsIn = Math.max(1, Math.ceil(q * bot.h)), x = s.x + 18, y = s.y + 6;
    if (age < 0.12) { g.fillStyle = "rgba(156,240,203,0.45)"; g.fillRect(s.x, s.y, s.w, s.h); }
    g.fillStyle = "#123a36"; g.fillRect(x - 2, y - 1, bot.w + 4, bot.h + 2);
    g.drawImage(bot.right.stand, 0, 0, bot.w, rowsIn, x, y, bot.w, rowsIn);
    g.fillStyle = C.mint; g.fillRect(x - 2, y + rowsIn, bot.w + 4, 1);
  }

  // Second screen, turned toward me: a log that scrolls a line every 0.45 s.
  // A line that covers a birth is marked in mint.
  function drawLog(S, t) {
    const g = S.g, n = Math.floor(t / 0.45);
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    for (let k = 0; k < 8; k++) {
      const i = n - k, y = 54 - k * 2;
      if (i < 0) break;
      const born = Math.floor((i * 0.45) / SPAWN) !== Math.floor(((i + 1) * 0.45) / SPAWN);
      const h = hash(i, 3, 15), lvl = born ? C.mint : h < 0.08 ? C.rose : h < 0.22 ? C.sun : C.sky;
      R(133, y, 3, 1, "#46565c"); R(137, y, 1, 1, lvl);
      R(139, y, Math.min(12, 3 + ((hash(i, 4, 15) * 11) | 0)), 1, born ? C.mint : h > 0.6 ? "#8d968a" : C.white2);
    }
  }

  function drawPhone(S, t) {
    const g = S.g, p = G.phone, n = Math.floor(t / 1.5);
    for (let r = 0; r < 3; r++) { g.fillStyle = r === 2 ? C.sun : "#5fd08a"; g.fillRect(p.x + 1, p.y + 2 + r * 2, 1 + ((hash(n + r, r, 16) * 3) | 0), 1); }
    if (S.still || Math.floor(t * 2) % 2) { g.fillStyle = "#5fd08a"; g.fillRect(p.x + 1, p.y + 8, 1, 1); }
  }

  // Wall clock hands at the real minute (or the forced sky's hour).
  function drawClock(S) {
    const g = S.g, { x, y } = G.clock, m = S.wallMin;
    const hand = (a, len, col) => {
      g.fillStyle = col;
      for (let k = 1; k <= len; k++) g.fillRect(x + Math.round(Math.sin(a) * k), y - Math.round(Math.cos(a) * k), 1, 1);
    };
    hand(((m % 720) / 720) * Math.PI * 2, 2, C.ink);
    hand(((m % 60) / 60) * Math.PI * 2, 3, "#2a3136");
    g.fillStyle = C.orange; g.fillRect(x, y, 1, 1);
  }

  function steam(S, t) {
    const g = S.g, k = G.kopi, f = Math.floor(t * 6);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
      g.fillStyle = `rgba(236,238,228,${(0.55 - i * 0.12).toFixed(2)})`;
      g.fillRect(k.x + 2 + j * 2 + Math.round(Math.sin((f + i * 2 + j * 5) * 0.8) * 0.8), k.y - 2 - i * 2 - ((f + j) % 2), 1, 1);
    }
  }

  // ---- me and the agents -------------------------------------------------------
  // Typing, a blink now and then, and every third birth a look at you.
  function drawMe(S, t, n, age) {
    const av = S.art.av;
    let f = av.type0;
    if (!S.still) {
      if (n % 3 === 1 && age > 0.8 && age < 2.2) f = av.turn;
      else if (t % 4.3 < 0.13) f = av.blink;
      else if (Math.floor(t * 5) % 2) f = av.type1;
    }
    S.g.drawImage(f, G.av.x - 1, G.av.y - 1);
  }

  // One bot's life after it is printed on the screen: step out onto the
  // desk, cheer, walk to the edge, hop down to the floor, walk off.
  function drawBot(S, bot, age) {
    if (age < 0.45) return;
    const g = S.g, still = S.still, deskTop = G.DESK_Y - bot.h + 1, floorTop = G.WALK_Y - bot.h + 1;
    const put = (img, x, y) => g.drawImage(A.shaded(img, S.bk, x + 5, y + 7), x, y);
    const walk = still ? bot.right.stand : bot.right.walk[Math.floor(age * 8) % 2];
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    if (age < 0.7) {
      const q = (age - 0.45) / 0.25;
      put(bot.right.stand, SPAWN_X, deskTop - Math.round((1 - q) * 4));
      if (!still && q < 0.6) for (const [dx, dy] of [[-2, 2], [11, 4], [-1, 9], [12, 10]]) R(SPAWN_X + dx, deskTop + dy - Math.round(q * 3), 1, 1, dy % 4 ? C.white : C.mint);
      return;
    }
    if (age < 1.3) { put(still ? bot.right.stand : bot.right.cheer, SPAWN_X, deskTop - (!still && age < 1 && Math.floor(age * 8) % 2 ? 2 : 0)); return; }
    if (age < 2.4) { put(walk, SPAWN_X + Math.round(((age - 1.3) / 1.1) * (EDGE_X - SPAWN_X)), deskTop); return; }
    if (age < 3) {
      const q = (age - 2.4) / 0.6, x = EDGE_X + Math.round(q * (LAND_X - EDGE_X));
      R(LAND_X + 2, G.WALK_Y + 1, Math.max(1, Math.round(q * 6)), 1, "rgba(8,14,24,0.3)");
      put(bot.right.walk[1], x, Math.round(deskTop + q * (floorTop - deskTop) - Math.sin(q * Math.PI) * 7));
      return;
    }
    R(LAND_X + 2, G.WALK_Y + 1, 6, 1, "rgba(8,14,24,0.3)");
    if (age < 3.12 && !still) {
      g.drawImage(A.shaded(bot.right.stand, S.bk, LAND_X + 5, floorTop + 7), 0, 0, bot.w, bot.h, LAND_X - 1, floorTop + 1, bot.w + 2, bot.h - 1);
      R(LAND_X - 2, G.WALK_Y, 1, 1, "#cbc2aa"); R(LAND_X + 11, G.WALK_Y, 1, 1, "#cbc2aa");
      return;
    }
    const x = LAND_X + Math.round((age - 3.12) * 15);
    R(x + 2, G.WALK_Y + 1, 6, 1, "rgba(8,14,24,0.3)");
    put(walk, x, floorTop);
  }

  function frame(S, t) {
    const g = S.g, n = Math.floor(t / SPAWN), age = t - n * SPAWN;
    const list = P.data.AGENTS, botOf = (k) => P.hqArt.bots[list[k % list.length].id];
    drawWindow(S, t);
    g.drawImage(S.art.room, 0, 0);
    drawMain(S, t, age, botOf(n));
    drawLog(S, t); drawPhone(S, t); drawClock(S); steam(S, t);
    if (!S.still && age < 0.5 && Math.floor(age * 16) % 2) { g.fillStyle = "#7a8187"; g.fillRect(G.mini.x + 11, G.mini.y + 2, 1, 1); }
    drawMe(S, t, n, age);
    for (let k = n; k > n - 2 && k >= 0; k--) {
      const a = t - k * SPAWN;
      if (a <= LIFE) drawBot(S, botOf(k), a);
    }
  }

  // ---- time, size, mount ------------------------------------------------------
  function clock() {
    const d = new Date(Date.now() + 7 * 3600e3);
    return String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0");
  }
  const wallMinutes = () => Math.round(P.hq.wibHour() * 60) % 1440;

  // Largest scale that fits, capped at 3 so the desk sits beside the headline
  // instead of towering over it, always whole device pixels.
  function size(S) {
    const cw = S.dom.wrap.clientWidth - 12;
    const dpr = window.devicePixelRatio || 1;
    let s = 1;
    for (const k of P.hq.scales(dpr)) if (k <= 3 && W * k <= cw && k > s) s = k;
    S.canvas.style.width = W * s + "px";
    S.canvas.style.height = H * s + "px";
  }

  function mount() {
    if (!P.hqArt) P.hq.buildArt();
    const canvas = document.getElementById("hero-canvas");
    canvas.width = W; canvas.height = H;
    const S = {
      canvas, g: canvas.getContext("2d"), clock: 1.4, acc: 0, dirty: true, still: false,
      dom: { wrap: document.getElementById("hero-art"), time: document.getElementById("hero-time") },
    };
    // With ?freeze the wall clock keeps the time it had at load.
    const frozen = P.query && P.query.freeze != null;
    const rebake = (bk) => { S.bk = bk; S.art = A.bake(bk); S.tc = trainColours(bk); S.dirty = true; };
    rebake(P.hq.bucket(P.hq.wibHour()));
    S.wallMin = wallMinutes();
    size(S);
    const ro = new ResizeObserver(() => size(S));
    ro.observe(S.dom.wrap);
    const tickClock = () => {
      S.dom.time.textContent = clock();
      const m = wallMinutes();
      if (!frozen && m !== S.wallMin) { S.wallMin = m; S.dirty = true; }
      const bk = P.hq.bucket(P.hq.wibHour());
      if (bk !== S.bk) rebake(bk);
    };
    tickClock();
    const timer = setInterval(tickClock, 15000);
    return {
      S,
      tick(dt, playing) {
        S.still = !playing;
        if (playing) { S.clock += dt; S.acc += dt; }
        if (S.dirty || (playing && S.acc >= 1 / 24)) { S.acc = 0; S.dirty = false; frame(S, S.clock); }
      },
      setTime(t) { S.clock = t; S.dirty = true; },
      destroy() { ro.disconnect(); clearInterval(timer); },
    };
  }

  P.hero = { mount };
})((window.PETA = window.PETA || {}));
