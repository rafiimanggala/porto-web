// Agent robots, the painters the room art shares, and the first half of the
// room props (rooms-props.js adds the rest). Robots are side-view sprites
// baked once per colour. A prop has a bake part, painted once into the room
// shell, and a live part drawn every frame for what moves, so a frame depends
// only on the room, the agent, the status and the time.
(function (P) {
  "use strict";
  const { bake, flip, hash, PAL: C } = P;

  // ---- colour and painters ---------------------------------------------------
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  // Mix two colours, k in [0, 1]; for ramps made once, never per frame.
  const mix = (a, b, k) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * k)); };

  // Contact shadows lean purple, like every shadow in the rooms.
  const SHADOW = "rgba(16,10,40,0.34)", SHADOW2 = "rgba(16,10,40,0.16)";
  const BEZEL = ["#4d565d", "#30373c", "#1d2226"];
  const GREEN = "#6ee07a", RED = "#ff6b5e";

  // Painters take q = { R, px, g } and draw whole pixels only.
  const art = {
    mix, rgb, SHADOW, BEZEL, GREEN, RED,
    // A box lit from the top left: light top row and left column, shade on
    // the bottom row and the right column.
    box(q, x, y, w, h, hi, base, lo) {
      q.R(x, y, w, h, base);
      q.R(x, y, w, 1, hi); q.R(x, y + 1, 1, h - 1, hi);
      q.R(x + 1, y + h - 1, w - 1, 1, lo); q.R(x + w - 1, y + 1, 1, h - 2, lo);
    },
    // Filled circle from a table of row half-widths (no arcs).
    disc(q, cx, cy, rad, col) {
      for (let dy = -rad; dy <= rad; dy++) {
        const hw = Math.floor(Math.sqrt((rad + 0.5) * (rad + 0.5) - dy * dy));
        q.R(cx - hw, cy + dy, hw * 2 + 1, 1, col);
      }
    },
    // A ring th pixels thick, drawn as the spans left of and right of the hole.
    ring(q, cx, cy, rad, th, col) {
      const w = (r, dy) => Math.floor(Math.sqrt((r + 0.5) * (r + 0.5) - dy * dy));
      for (let dy = -rad; dy <= rad; dy++) {
        const o = w(rad, dy), inner = rad - th;
        if (Math.abs(dy) > inner) { q.R(cx - o, cy + dy, o * 2 + 1, 1, col); continue; }
        const i = w(inner, dy);
        q.R(cx - o, cy + dy, o - i, 1, col); q.R(cx + i + 1, cy + dy, o - i, 1, col);
      }
    },
    // A run of pixels from (x0, y0) to (x1, y1), for wires, yarn and legs.
    line(q, x0, y0, x1, y1, col) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
      for (let i = 0; i <= n; i++) q.px(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), col);
    },
    // Contact shadow under something standing on the floor.
    foot(q, x, y, w) { q.R(x, y, w, 1, SHADOW); q.R(x + 1, y + 1, w - 2, 1, SHADOW2); },
    // Sparse one or two pixel clusters placed by hash: texture, never noise.
    speckle(q, x, y, w, h, rate, cols, seed) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const v = hash(x + i, y + j, seed);
        if (v >= rate) continue;
        q.R(x + i, y + j, hash(x + i, y + j, seed + 1) < 0.4 ? 2 : 1, 1, cols[Math.floor((v / rate) * cols.length)]);
      }
    },
    // Thin-bezel monitor with an ink edge; the screen is (x + 2, y + 2) and
    // (w - 4) x (h - 4). An off screen gets a dim reflection.
    monitor(q, x, y, w, h, on) {
      q.R(x, y, w, h, C.ink);
      q.R(x + 1, y + 1, w - 2, h - 2, BEZEL[1]); q.R(x + 1, y + 1, w - 2, 1, BEZEL[0]);
      q.R(x + 2, y + 2, w - 4, h - 4, on ? "#10262e" : "#0b1215");
      if (!on) art.line(q, x + 3, y + h - 4, x + Math.min(w - 4, 6), y + 3, "#1b2a30");
    },
    // A sheet of paper with ruled lines, lit on the left.
    paper(q, x, y, w, h, ink) {
      q.R(x, y, w, h, C.white); q.R(x + w - 1, y + 1, 1, h - 1, C.white2); q.R(x, y + h - 1, w, 1, C.white2);
      for (let j = 2; j < h - 1; j += 2) q.R(x + 1, y + j, w - 2 - ((j >> 1) % 2), 1, ink || C.grey1);
    },
    // A small sprite from rows of characters; pal maps a character to a colour.
    rows(q, x, y, rows, pal) {
      rows.forEach((row, j) => {
        for (let i = 0; i < row.length;) {
          const ch = row[i];
          let n = 1;
          while (row[i + n] === ch) n++;
          if (pal[ch]) q.R(x + i, y + j, n, 1, pal[ch]);
          i += n;
        }
      });
    },
    // A traffic cone standing on the floor line F: this room is being built.
    cone(q, x, F) {
      art.rows(q, x, F - 5, CONE, { h: C.orange1, o: C.orange, O: C.orange2, w: C.white, W: C.white2, k: C.ink });
      art.foot(q, x, F + 7, 7);
    },
  };
  const CONE = ["...h...", "...ho..", "..hoO..", "..wwW..", "..hoO..", ".hooOO.", ".wwwWW.", ".hooOO.", "hooooOO", "kkkkkkk"];

  // ---- robots ----------------------------------------------------------------
  // 8 x 12 facing right, lit from the top left. a antenna lamp, s stem, B body,
  // H highlight, S shade, V visor, g visor glint, e eye, L chest light,
  // A near arm.
  const HEAD = ["..a.....", "..s.....", ".HHHHHB.", "HBBgVVVB", "HBBVeVeB", "BBBVVVVS", ".BBBBSS.", "..SSSS.."];
  const HEAD_SHUT = ["..a.....", "..s.....", ".HHHHHB.", "HBBgVVVB", "HBBVxVxB", "BBBVVVVS", ".BBBBSS.", "..SSSS.."];
  const BODY = {
    stand: [".HBBBLB.", ".BBABBS.", "..B..S..", "..S..S.."],
    work1: [".HBBBLAA", ".BBBBBS.", "..B..S..", "..S..S.."],
    work2: [".HBBBLB.", ".BBBBBAA", "..B..S..", "..S..S.."],
    walk1: [".HBBBLB.", ".BBABBS.", ".B...S..", ".S....S."],
    walk2: [".HBBBLB.", ".BBABBS.", "...BS...", "...SS..."],
    cheer: [".HBBBLBA", ".BBBBBS.", "..B..S..", "..S..S.."],
  };

  function robot(look) {
    const pal = { a: C.sun, s: C.grey2, B: look.body, H: mix(look.body, "#fff6d8", 0.42), S: look.shade, V: "#17242a",
      g: "#4d7a84", e: "#9cf0cb", x: "#4f6a66", L: look.light || C.sun, A: look.shade };
    const palOff = Object.assign({}, pal, { a: C.grey3 });
    const mk = (head, body, p) => bake(head.concat(body), p || pal, { outline: C.ink });
    const right = {
      stand: mk(HEAD, BODY.stand), blink: mk(HEAD_SHUT, BODY.stand), off: mk(HEAD, BODY.stand, palOff),
      work: [mk(HEAD, BODY.work1), mk(HEAD, BODY.work2)],
      walk: [mk(HEAD, BODY.walk1), mk(HEAD, BODY.walk2)],
      cheer: mk(HEAD, BODY.cheer), sleep: mk(HEAD_SHUT, BODY.stand, palOff),
    };
    const left = {};
    for (const k of Object.keys(right)) left[k] = Array.isArray(right[k]) ? right[k].map(flip) : flip(right[k]);
    return { right, left, w: right.stand.width, h: right.stand.height };
  }

  // A tiny painter bound to one context: every call is whole pixels.
  function pen(g) {
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    return { g, R, px: (x, y, col) => R(x, y, 1, 1, col) };
  }

  // Deterministic wobble in [0, 1) for time step n and a seed.
  const rnd = (n, s) => hash(n | 0, 7, s | 0);

  function zzz(p, x, y, t) {
    const k = (t * 0.8) % 3;
    for (let i = 0; i < 2; i++) {
      const q = (k + i * 1.5) % 3;
      const zx = x + Math.round(q * 2), zy = y - Math.round(q * 3);
      p.R(zx, zy, 3, 1, C.white); p.px(zx + 1, zy + 1, C.white); p.R(zx, zy + 2, 3, 1, C.white);
    }
  }

  // ---- props, first half -------------------------------------------------------
  // bake(q, r, on) paints the still parts into the shell; live(p, r, t, on, bot)
  // draws what moves; glow(r) lists screen rects that light the room at night.
  // r.px is where the prop zone starts (about 56 px wide), r.fy the floor line.
  const PROPS = {};

  // Twelve paper-trading bots on three chart screens, and a stack light for
  // the two models: both green only when they agree on a trade.
  PROPS.tickers = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      art.foot(q, X + 13, F + 8, 18);
      R(X + 14, F + 6, 16, 2, BEZEL[2]); R(X + 14, F + 6, 16, 1, BEZEL[0]);
      R(X + 21, F - 15, 2, 21, BEZEL[1]); R(X + 21, F - 15, 1, 21, BEZEL[0]);
      R(X + 3, F - 15, 38, 2, BEZEL[1]); R(X + 3, F - 15, 38, 1, BEZEL[0]);
      for (let i = 0; i < 3; i++) art.monitor(q, X + i * 15, F - 25, 14, 10, true);
      for (let i = 0; i < 12; i++) px(X + 5 + i * 3, F - 14, "#1d4a2a");
      // The stack light: base, pole and two lamp cells under a cap.
      art.foot(q, X + 45, F + 8, 9);
      R(X + 46, F + 5, 7, 3, BEZEL[1]); R(X + 46, F + 5, 7, 1, BEZEL[0]);
      R(X + 49, F - 8, 1, 13, C.grey3); px(X + 49, F - 8, C.grey2);
      R(X + 47, F - 21, 5, 13, C.ink); R(X + 48, F - 22, 3, 1, C.grey2);
      R(X + 48, F - 20, 3, 5, "#3a2a26"); R(X + 48, F - 14, 3, 5, "#3a2a26");
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy, n = on ? Math.floor(t * 4) : 7;
      candles(p, X + 2, F - 23, n); lineChart(p, X + 17, F - 23, n); book(p, X + 32, F - 23, n);
      for (let i = 0; i < 12; i++) if (rnd(n + i * 7, 13) > 0.6) px(X + 5 + i * 3, F - 14, GREEN);
      const agree = on && Math.floor(t / 2) % 3 === 0;
      R(X + 48, F - 20, 3, 5, agree ? GREEN : "#a33a2e"); R(X + 48, F - 14, 3, 5, agree ? GREEN : "#a8782a");
      R(X + 50, F - 19, 1, 4, agree ? "#3fae55" : "#6e2219"); R(X + 50, F - 13, 1, 4, agree ? "#3fae55" : "#6e4c16");
      px(X + 48, F - 20, agree ? "#d6ffd8" : "#e0806f"); px(X + 48, F - 14, agree ? "#d6ffd8" : "#e6b85e");
    },
    glow: (r) => [[r.px + 2, r.fy - 23, 40, 6]],
  };
  // The three chart screens are 10 x 6: candles, a line with its area and an
  // order book, stepping four times a second while the agent works.
  function candles(p, x, y, n) {
    let v = 3;
    for (let k = 0; k < 5; k++) {
      const up = rnd(n + k, 3) > 0.45, h = 1 + Math.floor(rnd(n + k, 4) * 2);
      v = Math.max(1, Math.min(4, v + (up ? -1 : 1)));
      p.R(x + k * 2 + 1, y + v - 1, 1, h + 2, up ? "#2f7a3e" : "#8a3a33");
      p.R(x + k * 2 + 1, y + v, 1, h, up ? GREEN : RED);
    }
  }
  function lineChart(p, x, y, n) {
    let v = 3;
    for (let k = 0; k < 10; k++) {
      v = Math.max(0, Math.min(5, v + (rnd(n + k, 5) > 0.5 ? 1 : -1)));
      p.R(x + k, y + 6 - v, 1, v, "#1d4a3a"); p.px(x + k, y + 5 - v, C.mint);
    }
  }
  function book(p, x, y, n) {
    for (let j = 0; j < 3; j++) {
      p.R(x, y + j * 2, 1 + Math.floor(rnd(n + j, 6) * 4), 1, GREEN);
      const a = 1 + Math.floor(rnd(n + j, 7) * 4);
      p.R(x + 10 - a, y + j * 2 + 1, a, 1, RED);
    }
  }

  // Fund filings pinned and strung together, a box of them under a
  // magnifier, and a cone: the agent is built but not deployed.
  PROPS.filings = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      art.box(q, X, F - 25, 27, 17, C.wood1, C.wood, C.wood2);
      R(X + 1, F - 24, 25, 15, "#c29a68");
      art.speckle(q, X + 1, F - 24, 25, 15, 0.14, ["#a8804f", "#d8b582"], 21);
      art.paper(q, X + 3, F - 22, 6, 8); art.paper(q, X + 18, F - 23, 6, 7);
      R(X + 11, F - 21, 5, 5, C.sun); R(X + 11, F - 17, 5, 1, C.sun2); R(X + 12, F - 19, 3, 1, "#b08a2a");
      art.paper(q, X + 9, F - 14, 8, 4, C.grey2);
      // A little chart on one sheet, and the yarn that ties the clues.
      art.line(q, X + 19, F - 18, X + 22, F - 21, C.orange);
      art.line(q, X + 5, F - 22, X + 13, F - 14, "#b8402f"); art.line(q, X + 13, F - 14, X + 21, F - 23, "#b8402f");
      for (const [x, y] of [[X + 5, F - 22], [X + 21, F - 23], [X + 13, F - 14], [X + 13, F - 21]]) { px(x, y, C.red); px(x, y - 1, C.rose); }
      // A banker's box, papers standing out of it.
      art.foot(q, X + 29, F + 8, 14);
      art.paper(q, X + 31, F - 7, 4, 4); art.paper(q, X + 36, F - 8, 4, 5);
      R(X + 29, F - 4, 14, 2, "#d8b582"); R(X + 29, F - 3, 14, 1, "#a8875a");
      art.box(q, X + 30, F - 2, 12, 10, "#c9a878", "#b08d5c", "#86683f");
      R(X + 34, F, 4, 1, "#5a4128"); art.paper(q, X + 32, F + 2, 6, 4, C.grey2);
      art.cone(q, X + 47, F);
    },
    live(p, r, t, on) {
      // The magnifier bobs over the box while the agent reads.
      const { R, px } = p, x = r.px + 37, y = r.fy - 13 - (on ? Math.floor(t * 2) % 2 : 0);
      R(x + 1, y, 3, 1, C.ink); R(x, y + 1, 1, 3, C.ink); R(x + 4, y + 1, 1, 3, C.ink); R(x + 1, y + 4, 3, 1, C.ink);
      R(x + 1, y + 1, 3, 3, C.sky); px(x + 1, y + 1, C.white);
      px(x + 4, y + 4, C.wood2); px(x + 5, y + 5, C.wood2); px(x + 6, y + 6, C.wood);
    },
  };

  // A portrait screen of tracked posts, each labelled up or down, and a
  // scope that sweeps for new ones.
  PROPS.feed = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      art.foot(q, X + 4, F + 7, 16);
      R(X + 10, F - 1, 4, 6, BEZEL[1]); R(X + 10, F - 1, 1, 6, BEZEL[0]);
      R(X + 5, F + 5, 14, 2, BEZEL[2]); R(X + 5, F + 5, 14, 1, BEZEL[0]);
      art.monitor(q, X + 2, F - 25, 20, 24, true);
      // A metal cabinet, the scope on top.
      art.foot(q, X + 26, F + 8, 20);
      art.box(q, X + 27, F - 4, 18, 12, "#a3aca2", "#7a8378", "#4f574e");
      R(X + 28, F + 2, 16, 1, "#4f574e"); R(X + 34, F - 1, 4, 1, C.grey1); R(X + 34, F + 4, 4, 1, C.grey1);
      R(X + 31, F - 5, 11, 1, BEZEL[1]);
      art.disc(q, X + 36, F - 11, 5, C.ink); art.disc(q, X + 36, F - 11, 4, "#0d2418");
      R(X + 32, F - 11, 9, 1, "#1b4028"); R(X + 36, F - 15, 1, 9, "#1b4028");
      art.ring(q, X + 36, F - 11, 2, 0, "#1b4028"); px(X + 36, F - 11, "#2f7a3e");
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy, sx = X + 4, sy = F - 23;
      // Posts scroll up a pixel at a time; every seven pixels the list moves on.
      const step = on ? Math.floor(t * 6) : 0, off = step % 7, first = Math.floor(step / 7);
      for (let k = 0; k < 4; k++) {
        const y = sy + 1 + k * 7 - off, id = first + k;
        if (y < sy || y + 4 > sy + 20) continue;
        R(sx + 1, y, 3, 3, [C.rose, C.sky, C.sun, C.mint][Math.floor(rnd(id, 20) * 4)]);
        R(sx + 5, y, 6 + Math.floor(rnd(id, 21) * 5), 1, C.grey1); R(sx + 5, y + 2, 4 + Math.floor(rnd(id, 23) * 4), 1, C.grey3);
        R(sx + 13, y, 2, 2, rnd(id, 22) > 0.45 ? GREEN : RED);
        R(sx, y + 5, 16, 1, "#1a3440");
      }
      // The sweep turns in sixteen steps, eight a second; blips flare as it passes.
      const cx = X + 36, cy = F - 11, a = Math.floor(t * 8) % 16;
      for (let d = 1; d <= 3; d++) px(cx + Math.round(DIRS[a][0] * d), cy + Math.round(DIRS[a][1] * d), GREEN);
      for (let b = 0; b < 3; b++) {
        const ang = (b * 5 + 3) % 16, d = 2 + (b % 2);
        px(cx + Math.round(DIRS[ang][0] * d), cy + Math.round(DIRS[ang][1] * d), (a - ang + 16) % 16 < 4 ? C.mint : "#1f5a34");
      }
    },
    glow: (r) => [[r.px + 4, r.fy - 23, 16, 20]],
  };
  const DIRS = Array.from({ length: 16 }, (_, i) => [Math.cos((i * Math.PI) / 8), Math.sin((i * Math.PI) / 8)]);

  // A film strip running between two reels, the camera that shot it and the
  // clapperboard that marks each take.
  PROPS.film = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      for (const cx of [X + 5, X + 46]) {
        art.disc(q, cx, F - 21, 4, C.ink); art.disc(q, cx, F - 21, 3, C.grey2);
        R(cx - 2, F - 23, 2, 1, C.grey1); px(cx - 3, F - 22, C.grey1); px(cx, F - 21, C.ink);
      }
      R(X + 10, F - 25, 32, 8, C.ink);
      // Camera on a tripod, the lens toward the clapperboard.
      art.foot(q, X + 17, F + 8, 16);
      art.line(q, X + 24, F - 1, X + 19, F + 7, C.grey3); art.line(q, X + 24, F - 1, X + 24, F + 7, C.grey2);
      art.line(q, X + 24, F - 1, X + 29, F + 7, C.grey3);
      R(X + 21, F - 2, 7, 2, BEZEL[1]); R(X + 21, F - 2, 7, 1, BEZEL[0]);
      R(X + 18, F - 12, 4, 2, C.ink); R(X + 22, F - 12, 6, 1, C.ink);
      R(X + 18, F - 10, 12, 8, C.ink); R(X + 19, F - 9, 10, 6, "#3b3f3a"); R(X + 19, F - 9, 10, 1, "#5e645d"); R(X + 19, F - 4, 10, 1, "#2a2d2a");
      R(X + 30, F - 9, 4, 6, C.ink); R(X + 30, F - 8, 3, 4, C.grey3); px(X + 32, F - 7, C.sky); px(X + 31, F - 8, C.grey2);
      px(X + 21, F - 8, "#5a2a22");
      // A coiled cable on the floor, then the slate of the clapperboard.
      art.rows(q, X + 33, F + 4, [".kkkk.", "k.hh.k", ".kkkk."], { k: "#1f2226", h: "#3d4248" });
      R(X + 40, F, 10, 7, C.ink); R(X + 41, F + 1, 8, 5, "#2e3136");
      R(X + 42, F + 2, 5, 1, C.white2); R(X + 42, F + 4, 3, 1, C.grey1);
      art.foot(q, X + 40, F + 7, 11);
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy, g = p.g;
      g.drawImage(filmStrip(), on ? Math.floor(t * 8) % 28 : 5, 0, 32, 8, X + 10, F - 25, 32, 8);
      const k = on ? Math.floor(t * 6) % 3 : 0;
      for (const cx of [X + 5, X + 46]) for (let i = 0; i < 3; i++) px(cx + REEL[(k + i) % 3][0], F - 21 + REEL[(k + i) % 3][1], C.ink);
      if (on && Math.floor(t * 2) % 2) { px(X + 21, F - 8, C.red); px(X + 21, F - 9, "#ff9a8a"); }
      // The clapper snaps shut every four seconds.
      const shut = on && t % 4 < 0.25, y = shut ? F - 2 : F - 4;
      R(X + 40, y, 10, 2, C.ink);
      for (let i = 0; i < 4; i++) R(X + 41 + i * 2 + (shut ? 0 : 1), y + (shut ? 0 : 0), 1, 2, C.white);
      if (!shut) { px(X + 40, F - 2, C.ink); px(X + 40, F - 1, C.ink); }
    },
  };
  const REEL = [[0, -2], [2, 1], [-2, 1]];
  // A long strip of frames, each a small scene, made once and scrolled.
  let strip = null;
  function filmStrip() {
    if (strip) return strip;
    const SCENES = [[C.rose, C.orange2], [C.sky, C.leaf2], [C.sun, C.brick], [C.mint, C.blue2]];
    strip = P.paint(64, 8, (R, px) => {
      R(0, 0, 64, 8, C.ink);
      for (let x = 0; x < 64; x++) if (x % 4 < 2) { px(x, 1, C.grey1); px(x, 6, C.grey1); }
      for (let c = 0; c < 10; c++) {
        const x = c * 7, [sky, ground] = SCENES[c % 4];
        R(x + 1, 2, 6, 2, sky); R(x + 1, 4, 6, 2, ground); px(x + 2 + (c % 3), 3, C.white); px(x + 5, 4, C.ink);
      }
    });
    return strip;
  }

  // A screen of the camera's view, a face found and captioned, and the
  // webcam in a ring light.
  PROPS.camera = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy, sx = X + 3, sy = F - 24;
      art.monitor(q, X + 1, F - 26, 26, 18, true);
      R(sx, sy, 22, 14, "#1d3036"); R(sx, sy + 9, 22, 5, "#16262b");
      // My face on the feed: hair, skin lit from the left, the orange shirt.
      R(sx + 5, sy + 10, 12, 4, C.orange); R(sx + 5, sy + 10, 12, 1, C.orange1); R(sx + 15, sy + 11, 2, 3, C.orange2);
      R(sx + 8, sy + 3, 6, 7, C.skin); R(sx + 13, sy + 4, 1, 6, C.skin2); R(sx + 8, sy + 2, 6, 2, C.hair); R(sx + 7, sy + 3, 1, 4, C.hair);
      R(sx + 10, sy + 10, 3, 1, C.skin2); px(sx + 9, sy + 6, C.ink); px(sx + 12, sy + 6, C.ink); R(sx + 10, sy + 8, 2, 1, C.skin2);
      // Ring light on a stand, the webcam in its centre.
      art.foot(q, X + 37, F + 8, 11);
      art.line(q, X + 42, F + 1, X + 38, F + 7, C.grey3); art.line(q, X + 42, F + 1, X + 46, F + 7, C.grey3);
      R(X + 42, F - 11, 1, 16, C.grey3); R(X + 41, F - 11, 1, 16, C.grey2);
      art.ring(q, X + 42, F - 18, 6, 2, C.ink); art.ring(q, X + 42, F - 18, 5, 0, "#b9bfb3");
      R(X + 40, F - 20, 5, 4, C.ink); px(X + 42, F - 18, C.blue); px(X + 41, F - 19, C.grey3);
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy, sx = X + 3, sy = F - 24;
      if ((t + r.seed) % 4 < 0.15) { px(sx + 9, sy + 6, C.skin); px(sx + 12, sy + 6, C.skin); }
      if (!on) return;
      // Focus brackets breathe a pixel; a label chip and a caption line.
      const b = Math.floor(t * 2) % 2, x0 = sx + 6 - b, y0 = sy + 1 - b, x1 = sx + 15 + b, y1 = sy + 11 + b;
      for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
        R(Math.min(x, x + dx * 2), y, 3, 1, C.sun); R(x, Math.min(y, y + dy * 2), 1, 3, C.sun);
      }
      R(sx + 16, sy + 1, 5, 2, C.mint); px(sx + 17, sy + 1, "#2f7a5e");
      R(sx + 2, sy + 12, 5 + Math.floor(rnd(Math.floor(t * 2), 31) * 13), 1, C.white);
      ringOn(p, X + 42, F - 18);
      px(X + 44, F - 20, C.red);
    },
    glow: (r) => [[r.px + 3, r.fy - 24, 22, 14]],
  };
  // The lit ring, made once and stamped while the camera is on.
  let ringLit = null;
  function ringOn(p, cx, cy) {
    if (!ringLit) ringLit = P.paint(13, 13, (R, px) => art.ring({ R, px }, 6, 6, 5, 0, "#fff6dc"));
    p.g.drawImage(ringLit, cx - 6, cy - 6);
  }

  // A sewing machine running a resume through, a dress form in a tailored
  // jacket, and a cone: still in progress.
  PROPS.sewing = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      art.foot(q, X, F + 8, 32);
      R(X + 1, F - 3, 2, 10, C.wood2); px(X + 1, F - 3, C.wood); R(X + 28, F - 3, 2, 10, C.wood2); R(X + 3, F + 3, 25, 1, "#5a3a22");
      R(X - 1, F - 5, 33, 1, C.wood1); R(X - 1, F - 4, 33, 1, C.wood); R(X - 1, F - 3, 33, 1, "#5a3a22");
      machine(q, X + 3, F);
      dressForm(q, X + 42, F);
      art.cone(q, X + 49, F);
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy;
      // The resume slides under the needle; red marks are the tailored lines.
      const off = on ? Math.floor(t * 6) % 8 : 3;
      R(X + 1 + off, F - 8, 11, 1, C.white); R(X + 1 + off, F - 9, 11, 1, C.white2);
      for (let i = 0; i < 3; i++) px(X + 3 + off + i * 3, F - 9, C.red);
      R(X + 10, F - 11 + (on ? Math.floor(t * 8) % 2 : 0), 1, 2, C.grey1);
    },
  };
  const MACH = ["#eef6ee", "#cfe3d4", "#9fbfae"];
  function machine(q, x, F) {
    const { R, px } = q;
    R(x + 1, F - 20, 21, 1, C.ink); R(x + 1, F - 20, 1, 10, C.ink); R(x + 1, F - 11, 7, 1, C.ink);
    R(x + 7, F - 14, 9, 1, C.ink); R(x + 21, F - 20, 1, 12, C.ink);
    R(x - 1, F - 8, 25, 1, C.ink); R(x - 1, F - 8, 1, 3, C.ink); R(x + 23, F - 8, 1, 3, C.ink);
    R(x + 2, F - 19, 5, 8, MACH[1]); R(x + 7, F - 19, 9, 5, MACH[1]); R(x + 16, F - 19, 5, 11, MACH[1]);
    R(x, F - 7, 23, 2, MACH[1]); R(x, F - 7, 23, 1, MACH[0]);
    R(x + 2, F - 19, 19, 1, MACH[0]); R(x + 2, F - 18, 1, 7, MACH[0]);
    R(x + 7, F - 15, 9, 1, MACH[2]); R(x + 20, F - 18, 1, 10, MACH[2]); R(x + 3, F - 12, 4, 1, MACH[2]);
    R(x + 8, F - 17, 7, 1, C.rose); px(x + 3, F - 16, C.sun2);
    R(x + 22, F - 18, 2, 5, C.wood); R(x + 22, F - 18, 1, 5, C.wood1); px(x + 24, F - 16, C.ink);
    R(x + 11, F - 23, 3, 1, C.wood1); R(x + 11, F - 22, 3, 1, C.red); R(x + 11, F - 21, 3, 1, C.wood2);
    R(x + 4, F - 21, 7, 1, C.rose); R(x + 6, F - 10, 3, 1, C.grey3);
  }
  // Torso rows from the neck down; the jacket is lit from the left.
  const FORM = [4, 7, 8, 8, 8, 7, 6, 5, 5, 6, 7, 7, 6, 4];
  function dressForm(q, cx, F) {
    const { R, px } = q, top = F - 24;
    art.foot(q, cx - 5, F + 7, 11);
    art.line(q, cx, F - 9, cx - 4, F + 6, C.grey3); art.line(q, cx, F - 9, cx + 4, F + 6, C.grey3); R(cx, F - 9, 1, 15, C.grey2);
    R(cx - 1, top - 2, 3, 2, C.wood);
    FORM.forEach((w, j) => { const x = cx - (w >> 1); R(x - 1, top + j, w + 2, 1, C.ink); });
    R(cx - 2, top - 1, 5, 1, C.ink); R(cx - 2, top + FORM.length, 5, 1, C.ink);
    FORM.forEach((w, j) => {
      const x = cx - (w >> 1);
      R(x, top + j, w, 1, C.denim); px(x, top + j, "#3c5373"); px(x + w - 1, top + j, "#1d2a3d");
    });
    art.line(q, cx - 1, top, cx, top + 4, C.white2); px(cx + 1, top + 1, C.white2);
    px(cx, top + 6, C.sun2); px(cx, top + 9, C.sun2); px(cx - 3, top + 3, C.red); px(cx + 2, top + 8, C.red);
    art.line(q, cx - 3, top, cx - 4, top + 8, C.sun2); px(cx - 4, top + 3, C.ink); px(cx - 4, top + 6, C.ink);
  }

  // The thesis shelf: the agent scans a shelf, lifts the passage it wants and
  // checks it; now and then it flags a poisoned document instead.
  PROPS.books = {
    bake(q, r) {
      const { R, px } = q, X = r.px + 4, F = r.fy;
      art.foot(q, X - 1, F + 8, 32);
      R(X, F - 27, 30, 35, C.wood); R(X + 2, F - 25, 26, 31, "#3a2416");
      R(X, F - 27, 30, 1, C.wood1); R(X, F - 26, 1, 34, C.wood1); R(X + 29, F - 26, 1, 34, C.wood2);
      for (const y of [F - 16, F - 5, F + 6]) { R(X + 2, y, 26, 1, C.wood1); R(X + 2, y + 1, 26, 1, C.wood2); R(X + 2, y - 11 + 1, 26, 1, "#2a180d"); }
      for (const b of shelfBooks(r)) {
        R(b.x, b.y, b.w, b.h, b.c[0]); R(b.x + b.w - 1, b.y, 1, b.h, b.c[1]); R(b.x, b.y + 1, b.w, 1, b.band);
      }
      // A graduation cap and a globe on top.
      art.rows(q, X + 2, F - 32, CAP, { h: "#5a616c", b: "#353a42", k: C.ink, c: "#23262c", t: C.sun, T: C.sun2 });
      art.disc(q, X + 22, F - 30, 2, C.blue); R(X + 21, F - 31, 2, 1, C.mint); px(X + 23, F - 29, C.leaf2); R(X + 21, F - 28, 3, 1, C.wood2);
    },
    live(p, r, t, on) {
      if (!on) return;
      const { R, px } = p, books = shelfBooks(r), cyc = Math.floor((t + r.seed) / 3), q = ((t + r.seed) % 3) / 3;
      const pick = books[Math.floor(rnd(cyc, 41) * books.length)];
      if (q < 0.5) {
        // A cursor runs along the spines of the shelf the passage is on.
        const row = books.filter((b) => b.s === pick.s), b = row[Math.min(row.length - 1, Math.floor((q / 0.5) * row.length))];
        R(b.x, b.y + b.h, b.w, 1, C.mint);
        return;
      }
      R(pick.x, pick.y - 2, pick.w, pick.h + 2, pick.c[0]); R(pick.x, pick.y - 2, pick.w, 1, C.mint);
      const bad = rnd(cyc, 42) > 0.75, sx = r.px + 38, sy = r.fy - 21;
      R(sx, sy, 7, 6, bad ? C.red : C.mint); R(sx + 1, sy + 6, 5, 1, bad ? C.red : C.mint); px(sx + 3, sy + 7, bad ? C.red : C.mint);
      if (bad) { px(sx + 2, sy + 1, C.white); px(sx + 4, sy + 1, C.white); px(sx + 3, sy + 2, C.white); px(sx + 2, sy + 3, C.white); px(sx + 4, sy + 3, C.white); }
      else { px(sx + 1, sy + 3, C.ink); px(sx + 2, sy + 4, C.ink); px(sx + 3, sy + 3, C.ink); px(sx + 4, sy + 2, C.ink); px(sx + 5, sy + 1, C.ink); }
    },
  };
  const CAP = ["....hhhh....", ".hhhbtbbbb..", "kkkkkkkkkkkt", "..cccccc...t", "..kkkkkk..tT"];
  const SPINES = [["#b0654a", "#8a4a36"], ["#4a9fc0", "#2b6f8f"], ["#e0b43a", "#a87a22"], ["#6aa84f", "#37692d"],
    ["#ffa9a9", "#d9776f"], ["#e6e0cf", "#9a917f"], ["#8a6fc0", "#5f4a8a"], ["#c94e12", "#8e3510"]];
  const shelves = new WeakMap();
  // The books on the three shelves, one list shared by the bake and the live part.
  function shelfBooks(r) {
    if (shelves.has(r)) return shelves.get(r);
    const X = r.px + 6, F = r.fy, out = [];
    for (let s = 0; s < 3; s++) {
      const bottom = F - 17 + s * 11;
      for (let x = X; ;) {
        const w = hash(x, s, 41) < 0.35 ? 3 : 2, h = 6 + Math.floor(hash(x, s, 42) * 4);
        if (x + w > X + 26) break;
        const c = SPINES[Math.floor(hash(x, s, 43) * SPINES.length)];
        out.push({ x, y: bottom - h + 1, w, h, c, s, band: hash(x, s, 45) < 0.4 ? C.sun2 : mix(c[0], "#fff6d8", 0.4) });
        x += w + (hash(x, s, 44) < 0.18 ? 1 : 0);
      }
    }
    shelves.set(r, out);
    return out;
  }

  // Pigeonholes the inbox is sorted into; an envelope flies from the tray to
  // a slot about once a second.
  PROPS.mail = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      R(X + 2, F - 28, 32, 24, C.ink); art.box(q, X + 3, F - 27, 30, 22, C.wood1, C.wood, C.wood2);
      for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) {
        const x = X + 5 + i * 7, y = F - 25 + j * 7;
        R(x, y, 6, 5, "#2e1c10"); R(x, y, 6, 1, "#1e1208"); px(x + 2, y + 5, C.sun2); R(x + 3, y + 5, 1, 1, C.sun2);
        if (hash(i, j, 41) > 0.35) { R(x + 1, y + 2, 4, 3, C.white); px(x + 2, y + 2, C.grey1); px(x + 4, y + 2, [C.red, C.blue, C.leaf][(i + j) % 3]); }
      }
      // A table with the in-tray, and a sack of mail under it.
      art.foot(q, X + 36, F + 8, 16);
      R(X + 38, F - 2, 1, 9, C.wood2); R(X + 49, F - 2, 1, 9, C.wood2);
      R(X + 36, F - 3, 16, 1, C.wood1); R(X + 36, F - 2, 16, 1, C.wood2);
      R(X + 39, F - 7, 11, 1, C.grey3); R(X + 39, F - 7, 1, 4, C.grey3); R(X + 49, F - 7, 1, 4, C.grey3); R(X + 39, F - 4, 11, 1, C.grey2);
      R(X + 41, F - 6, 6, 2, C.white); px(X + 43, F - 6, C.grey1); R(X + 42, F - 8, 5, 2, C.white2);
      art.rows(q, X + 40, F - 1, SACK, { w: C.white, e: C.red, s: "#7a4a22", h: "#e8d4a0", b: C.bamboo, B: C.bamboo2, d: "#b89a5e" });
    },
    live(p, r, t, on) {
      if (!on) return;
      const X = r.px, F = r.fy, q = (t * 0.9) % 1, n = Math.floor(t * 0.9), slot = Math.floor(rnd(n, 43) * 12);
      const tx = X + 42, ty = F - 9, dx = X + 6 + (slot % 4) * 7, dy = F - 23 + Math.floor(slot / 4) * 7;
      const ex = tx + (dx - tx) * q, ey = ty + (dy - ty) * q - Math.sin(q * Math.PI) * 9;
      p.R(ex, ey, 5, 3, C.white); p.R(ex, ey + 2, 5, 1, C.white2); p.px(ex + 2, ey + 1, C.grey1); p.px(ex + 4, ey, C.red);
    },
  };

  const SACK = ["...w.w..", "..wwew..", "..hbbB..", "..ssss.s", ".hbbbbBs", "hbbbbbBB", "hbddbbBB", "hbbbbBBB", ".BBBBBB."];

  // ClaudeClaw, paused: a framed flight of paper planes, the lobster its
  // name came from, and planes that landed on the floor.
  PROPS.planes = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      art.box(q, X + 1, F - 26, 21, 15, C.wood1, C.wood, C.wood2);
      for (let y = 0; y < 13; y++) for (let x = 0; x < 19; x++) px(X + 2 + x, F - 25 + y, y / 13 + (P.bayer(x, y) - 0.5) * 0.5 < 0.45 ? C.blue : C.sky);
      R(X + 4, F - 17, 5, 2, C.white); R(X + 5, F - 18, 3, 1, C.white); R(X + 13, F - 22, 4, 1, C.white2);
      for (let i = 0; i < 4; i++) px(X + 5 + i * 3, F - 14 - i, C.white2);
      art.rows(q, X + 13, F - 21, ["w.....", "wwww..", "wwwwww", ".ggg.."], { w: C.white, g: C.grey1 });
      // The lobster the name came from, mounted on a plaque with a brass
      // nameplate like a catch.
      art.foot(q, X + 27, F - 10, 18);
      R(X + 26, F - 28, 19, 17, C.ink); R(X + 27, F - 29, 17, 19, C.ink);
      art.box(q, X + 27, F - 28, 17, 17, C.wood1, C.wood, C.wood2);
      R(X + 29, F - 26, 13, 11, "#8a5c33"); R(X + 29, F - 26, 13, 1, C.wood2);
      art.rows(q, X + 29, F - 27, LOBSTER, { k: C.ink, r: C.red, h: C.rose, d: "#8a2f22" });
      R(X + 31, F - 14, 9, 2, C.sun2); R(X + 31, F - 14, 9, 1, C.sun); R(X + 33, F - 13, 5, 1, "#a87a22");
      // Two planes on the floor, and one hanging from the ceiling on a thread.
      art.foot(q, X + 29, F + 8, 10); art.rows(q, X + 29, F + 3, PLANE, PLANE_PAL);
      art.foot(q, X + 42, F + 7, 11); art.rows(q, X + 42, F + 2, PLANE_L, PLANE_PAL);
      R(X + 50, r.y + 17, 1, 14, C.grey2);
      art.rows(q, X + 45, F - 17, PLANE, PLANE_PAL);
    },
    live() {},
  };
  const LOBSTER = [".kk.......kk.", "khrk.....krhk", "krk.k...k.krk", "krrk.k.k.krrk", ".kdrkkkkkrdk.", "..kkrhrrrkk..", ".k.krhrrrk.k.",
    "..kkrrrrrkk..", ".k.krrrrrk.k.", "...kkdrdkk...", "....krrrk....", "...krrkrrk...", "...kkk.kkk..."];
  const PLANE = ["ww........", ".wwww.....", "..wwwwww..", ".wwwwwwwww", "....gggg.."];
  const PLANE_L = ["..........w", "......wwww.", "..wwwwwww..", "wwwwwssss..", "..GGgg....."];
  const PLANE_PAL = { w: C.white, s: C.white2, g: C.grey1, G: C.grey2 };

  P.bots = { robot, pen, zzz, rnd, art, PROPS };
})((window.PETA = window.PETA || {}));
