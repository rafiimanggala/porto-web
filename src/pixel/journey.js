// The learning journey as a side-scrolling level, February to September 2026.
// The month list beside it is the content; scrolling it moves me along the
// level. Each month ends at a flag, each "?" block holds what I unlocked, and
// the agents I built fall in behind me in the month they were born, so the
// line grows from none to eighteen. Everything is derived from my position,
// so scrolling back up rewinds the level. The scenery (one biome per month,
// four parallax layers) is baked by journey-scenery.js; this file moves me,
// composes the layers and draws what changes.
(function (P) {
  "use strict";
  const { hash, PAL: C } = P;
  const H = 144, GROUND = 118, SEG = 220, START = 70, GAP = 11;
  const MONTHS = P.data.MONTHS, N = MONTHS.length;
  const LEN = START + N * SEG + 150;
  const END_X = LEN - 84;

  const monthX = (i) => START + i * SEG;
  const flagX = (i) => monthX(i) + SEG - 34;
  const BLOCKS = MONTHS.flatMap((m, i) => m.unlocks.map((u, j) => ({ id: u, i, x: monthX(i) + 50 + j * 30, y: GROUND - 42 })));

  // Agents in the order they were born, each tagged with its month.
  const KEYS = MONTHS.map((m) => m.label.slice(0, 3).toLowerCase());
  const JOIN = P.data.AGENTS
    .map((a, n) => ({ a, n, i: KEYS.indexOf(a.since.slice(0, 3).toLowerCase()) }))
    .sort((p, q) => p.i - q.i || p.n - q.n);

  // What the sky holds while each month is read: stars, the crescent and its
  // height, the sun's height and halo, and how much cloud drifts by.
  const SKYS = {
    stars: [0, 1, 0.75, 0.12, 0, 0, 0, 0],
    moon: [0, 1, 0.9, 0.2, 0, 0, 0, 0],
    moonY: [12, 12, 26, 44, 50, 50, 50, 50],
    sun: [0, 0, 0, 1, 1, 1, 1, 1],
    sunY: [84, 84, 80, 60, 44, 34, 24, 14],
    halo: [0, 0, 0.2, 0.95, 0.35, 0.85, 0.3, 0.25],
    cover: [0.9, 0.2, 0.3, 0.45, 0.55, 0.5, 0.6, 0.4],
  };

  function art() {
    if (!P.hqArt) P.hq.buildArt();
    const T = (s, col) => P.text(s, col || C.white, C.ink, 1);
    const months = MONTHS.map((m) => T(m.short, C.white));
    return Object.assign({
      pops: Object.fromEntries(Object.entries(P.data.UNLOCKS).map(([k, v]) => [k, T("+" + v, C.sun)])),
      months,
      hudMonth: MONTHS.map((m) => T(m.short + " 2026")),
      digits: Array.from({ length: 27 }, (_, n) => T(String(n).padStart(2, "0"))),
      unlocked: T("UNLOCKED"), agents: T("AGENTS"), of: T("/26"),
      boards: months.map((lab) => P.jscene.sprite(lab.width, lab.height, null, (r) => board(r, lab.width, lab.height)).canvas()),
    }, markerArt(), skyArt(), propArt());
  }

  // ---- baked sprites ---------------------------------------------------------------------
  const J = () => P.jscene;
  const paint = (w, h, fn) => { const r = J().raster(w, h); fn(r); return r.canvas(); };
  const inked = (i, w, h, fn) => J().sprite(w, h, i == null ? null : J().tone(i, 2), fn).canvas();

  function board(r, w, h) {
    r.R(0, 0, w, h, C.wood2); r.R(0, 0, w, 1, C.wood); r.R(0, h - 1, w, 1, "#4a2e1a");
    r.P(1, 1, C.sun2); r.P(w - 2, 1, C.sun2);
  }

  // "?" blocks with a bevel, rivets and a glyph that shines now and then;
  // used ones turn to cracked bronze. Flags: a pole with a gold ball and a
  // cloth with folds in two waving frames.
  function markerArt() {
    const Q = [[1, 0], [2, 0], [3, 0], [0, 1], [4, 1], [4, 2], [2, 3], [3, 3], [2, 4], [2, 6]];
    const block = (shine) => inked(null, 10, 10, (r) => {
      r.E(0, 0, 10, 10, "#e0b43a"); r.E(0, 0, 10, 1, "#ffe375"); r.E(0, 0, 1, 10, "#ffe375");
      r.E(0, 9, 10, 1, "#a8742a"); r.E(9, 1, 1, 9, "#b8842a"); r.E(1, 1, 1, 1, "#fff8d8");
      for (const [x, y] of [[1, 8], [8, 1], [8, 8], [2, 1]]) r.E(x, y, 1, 1, x === 2 ? "#ffe375" : "#8e5a1a");
      for (const [x, y] of Q) { r.E(x + 3, y + 2, 1, 1, "#b8842a"); }
      for (const [x, y] of Q) r.E(x + 2, y + 1, 1, 1, shine ? "#ffffff" : "#8e3510");
    });
    const used = inked(null, 10, 10, (r) => {
      r.E(0, 0, 10, 10, "#9a6a3d"); r.E(0, 0, 10, 1, "#c08a55"); r.E(0, 0, 1, 10, "#c08a55");
      r.E(0, 9, 10, 1, "#5a3620"); r.E(9, 1, 1, 9, "#6d4527");
      for (const [x, y] of [[1, 1], [8, 1], [1, 8], [8, 8]]) r.E(x, y, 1, 1, "#4a2e1a");
      for (const [x, y] of [[2, 2], [3, 3], [3, 4], [4, 5], [5, 5], [6, 6], [6, 7], [5, 3], [6, 2]]) { r.E(x, y, 1, 1, "#3a2414"); r.E(x, y + 1, 1, 1, "#b88450"); }
    });
    const pole = inked(null, 4, 33, (r) => {
      r.E(1, 3, 1, 30, "#d8dccd"); r.E(2, 3, 1, 30, "#6b7584");
      r.E(1, 0, 2, 1, "#ffe375"); r.E(0, 1, 4, 1, "#e0b43a"); r.E(1, 2, 2, 1, "#a8742a"); r.E(1, 1, 1, 1, "#fff8d8");
    });
    const cloth = [0, 1].map((f) => inked(null, 9, 5, (r) => {
      const W = f ? [7, 8, 9, 8, 6] : [8, 9, 8, 7, 5];
      W.forEach((w, y) => {
        r.E(0, y, w, 1, y < 2 ? C.orange1 : y < 4 ? C.orange : C.orange2);
        for (let x = (y + f * 2) % 4; x < w; x += 4) r.E(x, y, 1, 1, y < 2 ? C.orange : C.orange2);
      });
      r.E(0, 0, 2, 1, "#ffb080");
    }));
    return { block: [block(false), block(true)], used, pole, cloth };
  }

  // Sky pieces: the crescent, the sun, its halo, gulls; and cars for July.
  function skyArt() {
    const moon = paint(11, 11, (r) => {
      for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
        const a = (x - 5) ** 2 + (y - 5) ** 2, b = (x - 8) ** 2 + (y - 3.5) ** 2;
        if (a <= 27 && b > 21) r.E(x, y, 1, 1, b < 30 ? "#c9c4ae" : x + y < 7 ? "#ffffff" : "#f3f1e6");
      }
    });
    const sun = paint(15, 15, (r) => {
      for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) {
        const q = (x - 7) ** 2 + (y - 7) ** 2;
        if (q <= 50) r.E(x, y, 1, 1, q < 12 ? "#fffbe6" : q < 28 ? "#fff0b0" : q < 42 ? "#ffe07a" : "#ffc85a");
      }
    });
    const halo = paint(49, 49, (r) => { r.G(24, 24, 24, 24, "#ffd9a0", 0.55); r.G(24, 24, 13, 13, "#fff0c8", 0.5); });
    // A layangan: a diamond on crossed bamboo spars with a ribbon tail.
    const kite = paint(9, 14, (r) => {
      [1, 3, 5, 7, 5, 3, 1].forEach((w, y) => { r.E(4 - (w >> 1), y, w, 1, y < 3 ? "#e8743a" : "#ffe375"); r.E(4 - (w >> 1), y, 1, 1, y < 3 ? "#ffb080" : "#fff8d8"); });
      r.E(4, 0, 1, 7, "#8e5a2a"); r.E(1, 3, 7, 1, "#8e5a2a");
      for (const [x, y] of [[4, 7], [5, 8], [4, 9], [3, 10], [4, 11], [5, 12], [5, 13]]) r.E(x, y, 1, 1, y % 2 ? "#d9543f" : "#f3f1e6");
    });
    const tn = J().tone(5, 1);
    const car = (body, top) => paint(11, 5, (r) => {
      r.E(3, 0, 5, 2, tn(top)); r.E(4, 0, 3, 1, tn("#cfe8f4")); r.E(1, 2, 10, 2, tn(body)); r.E(1, 2, 10, 1, tn(J().mix(body, "#ffffff", 0.35)));
      r.E(10, 2, 1, 1, "#fff2c0"); r.E(1, 3, 1, 1, "#ff5a3a"); r.E(2, 4, 2, 1, "#1a1a22"); r.E(7, 4, 2, 1, "#1a1a22");
    });
    const cars = [["#d9543f", "#a83a2a"], ["#f3f1e6", "#b7bfb2"], ["#4a9fc0", "#2b6f8f"], ["#e0b43a", "#a8842a"], ["#5e645d", "#3a3f3a"]].map(([b, t]) => {
      const right = car(b, t);
      return { right, left: P.flip(right) };
    });
    return { moon, sun, halo, kite, cars };
  }

  // Month props, lit like their month and ringed in ink; parts that move are
  // drawn over them each frame. February to May first.
  function earlyProps() {
    const { WOOD: W, STEEL: S } = J();
    const table = inked(0, 22, 20, (r) => {
      r.R(0, 9, 22, 2, W[1]); r.R(0, 9, 22, 1, W[0]); r.R(1, 11, 20, 1, W[3]);
      r.R(2, 12, 2, 8, W[2]); r.P(2, 12, W[1]); r.R(18, 12, 2, 8, W[3]); r.R(4, 13, 14, 1, W[3]);
      r.R(4, 1, 13, 7, "#454b58"); r.R(4, 1, 13, 1, "#6a7282");
      r.E(5, 2, 11, 5, "#10262e"); r.E(6, 3, 6, 1, C.mint); r.E(6, 4, 8, 1, "#4a7a7a"); r.E(6, 5, 4, 1, "#ff6a4a");
      r.R(2, 8, 17, 1, "#8d968a"); r.R(3, 8, 15, 1, "#b7bfb2"); r.E(4, 9, 13, 1, "#6ad0c0");
      r.R(19, 6, 3, 3, "#f3f1e6"); r.R(19, 6, 3, 1, "#ffffff"); r.P(21, 8, "#b7bfb2"); r.E(20, 5, 1, 1, "#9aa0a8");
    });
    const bubble = inked(null, 8, 9, (r) => {
      r.E(0, 0, 8, 7, "#f3f1e6"); r.E(0, 0, 8, 1, "#ffffff"); r.E(7, 1, 1, 6, "#d8dccd"); r.E(1, 7, 2, 1, "#f3f1e6"); r.E(1, 8, 1, 1, "#f3f1e6");
      r.E(3, 1, 2, 3, C.red); r.E(3, 5, 2, 1, C.red);
    });
    const vps = inked(1, 12, 21, (r) => {
      r.R(0, 0, 12, 19, "#3a404c"); r.R(0, 0, 12, 1, "#6a7282"); r.R(0, 0, 1, 19, "#5a6272"); r.R(11, 1, 1, 18, "#262a34");
      for (let k = 0; k < 4; k++) {
        r.R(1, 2 + k * 4, 10, 3, S[1]); r.R(1, 2 + k * 4, 10, 1, S[0]);
        for (let x = 2; x < 7; x += 2) r.P(x, 3 + k * 4, S[3]);
        r.R(8, 3 + k * 4, 2, 1, "#20262e");
      }
      r.R(1, 19, 2, 2, "#20262e"); r.R(9, 19, 2, 2, "#20262e");
    });
    const post = inked(2, 3, 22, (r) => { r.R(0, 0, 3, 22, W[2]); r.R(0, 0, 1, 22, W[1]); r.R(2, 0, 1, 22, W[3]); r.R(0, 18, 3, 1, W[3]); });
    const wheel = [0, 1, 2, 3].map((k) => inked(null, 13, 13, (r) => {
      for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) {
        const d = Math.hypot(x - 6, y - 6);
        if (Math.abs(d - 5.6) < 0.7) r.E(x, y, 1, 1, x + y < 10 ? "#ffe375" : x + y > 14 ? "#a8742a" : "#e0b43a");
      }
      for (let a = 0; a < 8; a++) {
        const ang = (a * Math.PI) / 4 + (k * Math.PI) / 16;
        for (let d = 2; d <= 4; d++) r.E(6 + Math.round(Math.cos(ang) * d), 6 + Math.round(Math.sin(ang) * d), 1, 1, "#e0b43a");
      }
      r.E(5, 5, 3, 3, C.orange); r.E(5, 5, 1, 1, "#ffb080"); r.E(6, 6, 1, 1, "#fff2b0");
    }));
    const mirror = inked(3, 12, 22, (r) => {
      r.R(0, 0, 12, 20, W[2]); r.R(0, 0, 12, 1, W[1]); r.R(0, 0, 1, 20, W[1]);
      for (let y = 1; y < 19; y++) r.E(1, y, 10, 1, J().mix("#ffd0b0", "#5a68a8", y / 19));
      r.E(2, 3, 1, 6, "#ffffff"); r.E(3, 2, 1, 3, "#ffffff"); r.E(8, 13, 1, 3, "#fff0e0");
      r.R(2, 20, 2, 2, W[3]); r.R(8, 20, 2, 2, W[3]);
    });
    return { table, bubble, vps, post, wheel, mirror };
  }

  // June to September, and Agent HQ at the end.
  function laterProps() {
    const { STEEL: S, WALLS, CONCRETE: K } = J();
    const books = inked(4, 13, 16, (r) => {
      [[1, "#4a9fc0", "#2b6f8f"], [0, "#d9543f", "#8a2f22"], [2, "#e0b43a", "#a8842a"], [0, "#6aa84f", "#37692d"]].forEach(([dx, c, d], k) => {
        const y = 12 - k * 4;
        r.R(dx, y, 12, 4, c); r.R(dx, y, 12, 1, J().mix(c, "#ffffff", 0.35)); r.R(dx, y + 3, 12, 1, d);
        r.R(dx + 10, y + 1, 2, 2, "#f3f1e6"); r.R(dx + 3, y + 1, 4, 1, d);
      });
      r.R(6, 0, 1, 4, C.red);
    });
    const clock = inked(5, 13, 27, (r) => {
      r.R(5, 12, 3, 15, S[2]); r.R(5, 12, 1, 15, S[1]); r.R(4, 25, 5, 2, S[3]);
      for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) {
        const d = Math.hypot(x - 6, y - 6);
        if (d < 6.4) r.R(x, y, 1, 1, d > 5.2 ? (x + y < 11 ? S[0] : S[2]) : x + y > 15 ? "#d8dccd" : "#f3f1e6");
      }
      for (const [x, y] of [[6, 1], [11, 6], [6, 11], [1, 6]]) r.P(x, y, C.ink);
    });
    const lobster = [0, 1].map((up) => inked(null, 10, 9, (r) => {
      const R1 = "#e85a3f", R2 = "#b43a26", R3 = "#7a2418";
      r.R(2, 4, 6, 3, R1); r.R(3, 3, 4, 1, R1); r.R(2, 6, 6, 1, R2); r.R(3, 4, 3, 1, "#ff8a6a");
      r.R(0, 1 - up, 2, 3, R1); r.P(0, 1 - up, "#ff8a6a"); r.R(8, 1 - up, 2, 3, R1); r.P(1, 2 - up, R3); r.P(8, 2 - up, R3);
      r.P(1, 4, R2); r.P(8, 4, R2); r.P(3, 2, R3); r.P(6, 2, R3); r.P(3, 3, C.ink); r.P(6, 3, C.ink);
      r.P(2, 7, R3); r.P(4, 7, R3); r.P(5, 7, R3); r.P(7, 7, R3); r.R(4, 8, 2, 1, R2);
    }));
    const antenna = inked(7, 11, 32, (r) => {
      for (let y = 2; y < 32; y++) { r.P(4, y, S[1]); r.P(6, y, S[2]); if (y % 4 === 0) r.R(4, y, 3, 1, S[2]); else r.P(4 + (y % 2) * 2, y, S[2]); }
      r.R(0, 10, 11, 1, S[1]); r.R(1, 18, 9, 1, S[1]); r.R(1, 9, 1, 2, S[2]); r.R(9, 9, 1, 2, S[2]);
      r.R(7, 21, 3, 1, S[0]); r.R(7, 22, 4, 2, S[1]); r.R(5, 22, 2, 1, S[2]);
      r.R(4, 0, 3, 2, "#5a2a22");
    });
    // The name sits on a sign on the roof, so it reads while I stand at the door.
    const tag = P.text("HQ", "#ffe375", C.ink, 1), tw = tag.width + 4;
    const hq = inked(7, 46, 73, (r) => {
      hqFacade(r, WALLS[2], S, K);
      r.R(19 - (tw >> 1), 0, tw, tag.height, "#1c3a2f"); r.R(19 - (tw >> 1), 0, tw, 1, "#2c5645");
      r.R(16, tag.height, 1, 10 - tag.height, S[3]); r.R(22, tag.height, 1, 10 - tag.height, S[3]);
    });
    hq.getContext("2d").drawImage(tag, 20 - (tag.width >> 1), 1);
    return { books, clock, lobster, antenna, hq };
  }

  function propArt() {
    const { table, bubble, vps, post, wheel, mirror } = earlyProps(), { books, clock, lobster, antenna, hq } = laterProps();
    const props = [
      [monthX(0) + 5, GROUND - 20, table], [monthX(1) + 11, GROUND - 21, vps], [monthX(2) + 18, GROUND - 22, post],
      [monthX(3) + 11, GROUND - 22, mirror], [monthX(4) + 11, GROUND - 16, books], [monthX(5) + 11, GROUND - 27, clock],
      [monthX(7) + 12, GROUND - 32, antenna], [END_X - 8, GROUND - 73, hq],
    ].map(([x, y, img]) => ({ x, y, img }));
    return { props, bubble, wheel, lobster };
  }

  // Agent HQ at the end: five floors of windows with sills and AC units, a
  // water tank and a mast on the roof, the door under an awning.
  function hqFacade(r, wall, S, K) {
    r.R(0, 12, 46, 61, wall[1]); r.R(0, 12, 46, 1, wall[0]); r.R(0, 12, 1, 61, wall[0]); r.R(44, 13, 2, 60, wall[2]);
    r.R(-1, 10, 48, 3, K[1]); r.R(-1, 10, 48, 1, K[0]);
    for (let f = 0; f < 5; f++) {
      const y = 15 + f * 10;
      r.R(1, y + 8, 44, 1, wall[2]);
      for (let k = 0; k < 4; k++) {
        const x = 3 + k * 11;
        r.R(x - 1, y, 8, 7, "#5a6070");
        r.E(x, y + 1, 6, 5, J().tone(7, 2)(f === 4 && k > 0 && k < 3 ? "#ffd98a" : "#9ad0e8"));
        r.E(x + 4, y + 1, 1, 2, "#e8f6fa"); r.R(x - 1, y + 7, 8, 1, S[0]);
        if ((f + k) % 3 === 1 && f < 4) { r.R(x + 1, y + 8, 5, 2, S[1]); r.R(x + 2, y + 9, 3, 1, S[3]); }
      }
    }
    r.R(15, 60, 16, 2, C.orange); r.R(15, 60, 16, 1, C.orange1);
    for (let x = 15; x < 31; x += 3) r.P(x, 61, "#ffffff");
    r.R(17, 62, 12, 11, "#2d3a3f"); r.E(18, 63, 4, 10, "#7ab8d0"); r.E(24, 63, 4, 10, "#7ab8d0"); r.R(22, 63, 2, 10, S[2]);
    const T = ["#8fc4ea", "#5a96c8", "#35699a", "#214870"];
    r.R(30, 5, 1, 5, S[2]); r.R(37, 5, 1, 5, S[3]); r.R(29, 0, 10, 5, T[1]); r.R(29, 0, 10, 1, T[0]); r.R(29, 2, 10, 1, T[2]);
    r.R(5, 2, 1, 8, S[2]); r.R(3, 5, 5, 1, S[1]);
  }

  // ---- layers ---------------------------------------------------------------------------
  // Where the camera sits between the reading positions of two months: the
  // sky, its stars and clouds follow the month being read.
  function readMonth(S) {
    const R = S.read, c = S.cam;
    let i = 0;
    while (i < N - 2 && c >= R[i + 1]) i++;
    const f = R[i + 1] > R[i] ? Math.max(0, Math.min(1, (c - R[i]) / (R[i + 1] - R[i]))) : c >= R[i + 1] ? 1 : 0;
    const w = f < 0.2 ? 0 : f > 0.8 ? 1 : (f - 0.2) / 0.6;
    S.mDay = i; S.mW = w * w * (3 - 2 * w);
  }
  const skyAt = (S, k) => SKYS[k][S.mDay] + (SKYS[k][S.mDay + 1] - SKYS[k][S.mDay]) * S.mW;

  // Screen x of column x = 0 of month i on a layer with parallax f: the layer
  // sits where it was painted while the month is read and slides from there.
  const colX = (S, i, f) => Math.round(monthX(i) - S.read[i] - f * (S.cam - S.read[i]));
  const colEdge = (S, i) => [i ? monthX(i) - S.cam : -1e5, i < N - 1 ? monthX(i + 1) - S.cam : 1e5];

  // A far or mid layer: each month's canvas shows only inside its column of
  // the world, and neighbours dissolve into each other along a dithered seam.
  function layer(g, S, list, f) {
    const { V0, B } = J();
    for (let i = 0; i < N; i++) {
      const [x0, x1] = colEdge(S, i);
      if (x1 + B <= 0 || x0 - B >= S.VW) continue;
      const o = colX(S, i, f) + V0, a = Math.max(0, x0 + B), b = Math.min(S.VW, x1 - B);
      if (b > a) g.drawImage(list[i], a - o, 0, b - a, GROUND, a, 0, b - a, GROUND);
      if (i && x0 + B > 0 && x0 - B < S.VW) seam(g, S, list[i - 1], colX(S, i - 1, f) + V0, list[i], o, x0 - B);
    }
  }
  function seam(g, S, left, lo, right, ro, x) {
    const T = S.tmpG, w = S.tmp.width;
    T.globalCompositeOperation = "copy"; T.drawImage(left, x - lo, 0, w, GROUND, 0, 0, w, GROUND);
    T.globalCompositeOperation = "destination-out"; T.drawImage(S.L.seam, 0, 0);
    g.drawImage(S.tmp, x, 0);
    T.globalCompositeOperation = "copy"; T.drawImage(right, x - ro, 0, w, GROUND, 0, 0, w, GROUND);
    T.globalCompositeOperation = "destination-in"; T.drawImage(S.L.seam, 0, 0);
    g.drawImage(S.tmp, x, 0);
    T.globalCompositeOperation = "source-over";
  }

  function sky(g, S) {
    const L = S.L.sky, tile = (img) => { for (let x = 0; x < S.VW; x += img.width) g.drawImage(img, x, 0); };
    if (S.mW < 1) tile(L[S.mDay]);
    if (S.mW > 0) { g.globalAlpha = S.mW; tile(L[S.mDay + 1]); g.globalAlpha = 1; }
    stars(g, S, skyAt(S, "stars"));
    const A = S.art, sx = Math.round(S.VW * 0.3), mo = skyAt(S, "moon"), su = skyAt(S, "sun");
    // Moon and sun share a column between the two HUD panels, above the blocks.
    if (mo > 0.02) { g.globalAlpha = mo; g.drawImage(A.moon, sx - 5, Math.round(skyAt(S, "moonY"))); }
    if (su > 0.02) {
      const sy = Math.round(skyAt(S, "sunY"));
      g.globalAlpha = su * skyAt(S, "halo"); g.drawImage(A.halo, sx - 24, sy - 24);
      g.globalAlpha = su; g.drawImage(A.sun, sx - 7, sy - 7);
    }
    g.globalAlpha = 1;
    clouds(g, S, skyAt(S, "cover"));
  }

  function stars(g, S, a) {
    if (a <= 0.02) return;
    for (let k = 0; k < 100; k++) {
      const x = Math.floor((((hash(k, 1, 41) * 640 - S.cam * 0.04) % 640) + 640) % 640);
      if (x >= S.VW) continue;
      const y = 2 + Math.floor(hash(k, 2, 41) * 72), tw = (Math.floor(S.clock * 2) + k) % 9 === 0;
      g.globalAlpha = a * (0.35 + hash(k, 3, 41) * 0.65);
      g.fillStyle = tw ? "#8a9ad0" : "#ffffff";
      g.fillRect(x, y, 1, 1);
      if (hash(k, 4, 41) > 0.94 && !tw) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
    }
    g.globalAlpha = 1;
  }

  // Clouds drift slowly and sit at a tenth of the camera's speed; each is
  // drawn in the tint of the month being read, fading into the next.
  function clouds(g, S, cover) {
    const L = S.L.clouds, d = S.mDay, drift = Math.floor(S.clock * 1.5);
    for (let k = 0; k < 14; k++) {
      const pres = Math.min(1, (cover - hash(k, 3, 61)) * 4);
      if (pres <= 0) continue;
      const img = L[d][k % 4], x = Math.round((((hash(k, 1, 61) * 900 - S.cam * 0.12 - drift) % 900) + 900) % 900) - 60;
      if (x > S.VW || x + img.width < 0) continue;
      const y = 18 + Math.floor(hash(k, 2, 61) * 48);
      if (S.mW < 1) { g.globalAlpha = pres; g.drawImage(img, x, y); }
      if (S.mW > 0) { g.globalAlpha = pres * S.mW; g.drawImage(L[d + 1][k % 4], x, y); }
    }
    g.globalAlpha = 1;
  }

  // ---- things that move in the mid layer --------------------------------------------------
  function inColumn(g, S, i, fn) {
    const [x0, x1] = colEdge(S, i);
    const a = Math.max(0, x0), b = Math.min(S.VW, x1);
    if (b <= a) return;
    g.save(); g.beginPath(); g.rect(a, 0, b - a, H); g.clip();
    fn(colX(S, i, 0.6), a, b);
    g.restore();
  }

  function midLive(g, S) {
    const t = S.clock, A = S.art, sp = P.hqArt.sprites;
    // March: the data centre's status lights and the lattice mast's beacon.
    inColumn(g, S, 1, (x) => {
      for (let k = 0; k < 20; k++) { g.fillStyle = (Math.floor(t * 4) + k * 3) % 7 ? "#7dffc4" : "#2c5a4a"; g.fillRect(x + 24 + k * 6, GROUND - 30, 2, 1); }
      g.fillStyle = Math.floor(t * 1.5) % 2 ? "#ff4d3a" : "#5a2a22"; g.fillRect(x + 159, GROUND - 85, 3, 1);
    });
    // May: the sun's glitter on the still lake, under the sun.
    inColumn(g, S, 3, () => {
      const sx = Math.round(S.VW * 0.3), n = Math.floor(t * 4);
      g.fillStyle = "#fff0c8";
      for (let k = 0; k < 9; k++) {
        const y = GROUND - 20 + k * 2, w = 1 + Math.floor(hash(k, n, 71) * 4);
        if (hash(k, n + 1, 71) > 0.25) g.fillRect(sx - (w >> 1) + Math.floor((hash(k, n, 72) - 0.5) * (4 + k)), y, w, 1);
      }
    });
    // July: traffic both ways on the elevated toll road, at the long-run pace.
    inColumn(g, S, 5, (x) => {
      for (let k = 0; k < 9; k++) {
        const dir = k % 2 ? 1 : -1, v = (((hash(k, 1, 81) * 420 + dir * (34 + hash(k, 2, 81) * 26) * t) % 420) + 420) % 420 - 80;
        const car = A.cars[k % A.cars.length];
        g.drawImage(dir > 0 ? car.right : car.left, x + Math.round(v), GROUND - 59 + (dir > 0 ? 0 : 1));
      }
    });
    // August: jukung and a sail bobbing, a dolphin now and then, gulls.
    inColumn(g, S, 6, (x) => {
      const bob = (k) => Math.floor(t * 2 + k) % 2;
      g.drawImage(sp.jukung.right, x + 44, GROUND - 22 + bob(0));
      g.drawImage(sp.jukung.left, x + 176, GROUND - 14 + bob(1));
      g.drawImage(sp.sailboat[bob(2)], x + 262, GROUND - 30);
      const ph = (t % 9) / 1.2;
      if (ph < 1) { const f = Math.min(2, Math.floor(ph * 3)); g.drawImage(sp.dolphin.right[f], x + 112 + Math.round(ph * 22), GROUND - 18 - Math.round(Math.sin(ph * Math.PI) * 9)); }
      for (let k = 0; k < 3; k++) g.drawImage(sp.gull[(Math.floor(t * 4) + k) % 2], x + ((Math.round(20 + k * 70 + t * 6) % 300) - 40), 36 + k * 9 + (k % 2) * 3);
    });
    // A layangan tugs at its string over the far beach, two steps a second.
    // It shows whole or not at all, so no seam leaves a string without a kite.
    const [e0, e1] = colEdge(S, 6), n = Math.floor(t * 2) % 4, B = J().B;
    const kx = colX(S, 6, 0.6) + 150 + (n === 1 ? 1 : n === 3 ? -1 : 0), ky = 26 + (n === 2 ? 1 : 0);
    if (kx > e0 + B && kx + 9 < e1 - B && kx < S.VW) {
      g.fillStyle = "#e8f0f4";
      for (let k = 2; k < 38; k += 2) if (k < 22 || k % 4 === 0) g.fillRect(kx + 4 - k, ky + 7 + Math.round(k * 1.05 - (k * (44 - k)) / 70), 1, 1);
      g.drawImage(A.kite, kx, ky);
    }
  }

  // ---- props ------------------------------------------------------------------------------
  function props(g, p, S) {
    const t = S.clock, A = S.art, sx = (wx) => Math.round(wx - S.cam), vis = (x, w) => x > -w && x < S.VW + 2;
    for (const q of A.props) { const x = sx(q.x); if (vis(x, q.img.width)) g.drawImage(q.img, x, q.y); }
    // February: OpenClaw's lobster by the laptop, and its first error.
    let x = sx(monthX(0) + 29);
    if (vis(x, 40)) { g.drawImage(A.lobster[0], x, GROUND - 10); if (Math.floor(t * 2) % 2) g.drawImage(A.bubble, x + 1, GROUND - 24); }
    // March: the VPS lights.
    x = sx(monthX(1) + 12);
    if (vis(x, 14)) for (let k = 0; k < 4; k++) p.px(x + 9, GROUND - 17 + k * 4, (Math.floor(t * 4) + k) % 3 ? C.mint : "#2c5a4a");
    // April: Mahoraga's wheel on its post, turning a notch every few seconds.
    x = sx(monthX(2) + 19);
    if (vis(x, 16)) g.drawImage(A.wheel[Math.floor(t / 3) % 4], x - 6, GROUND - 32);
    // July: the clock's hand makes the rounds.
    x = sx(monthX(5) + 18);
    if (vis(x, 16)) {
      const h = Math.floor(t * 2) % 4, c = GROUND - 20;
      p.R(x, c - 4, 1, 4, C.ink); p.px(x, c, C.red);
      p.R(x + (h === 2 ? -3 : 0), c + (h === 1 ? 0 : 0), h === 0 || h === 2 ? 3 : 1, 1, C.ink);
      if (h === 1) p.R(x, c, 1, 3, C.ink);
    }
    // August: the fleet waves from the shore just past the flag, where the
    // line of us does not hide it while August is read.
    x = sx(monthX(6) + 204);
    if (vis(x, 40)) for (let k = 0; k < 3; k++) g.drawImage(A.lobster[Math.floor(t * 3 + k) % 2], x + k * 11, GROUND - 10);
    // September: the antenna calls out; so does the mast on Agent HQ.
    const on = Math.floor(t * 2) % 2;
    x = sx(monthX(7) + 17);
    if (vis(x, 16)) { p.R(x, GROUND - 32, 3, 2, on ? C.red : "#5a2a22"); if (on) { p.px(x - 3, GROUND - 32, C.sky); p.px(x + 5, GROUND - 32, C.sky); } }
    x = sx(END_X - 3);
    if (vis(x, 60)) p.R(x, GROUND - 72, 1, 1, Math.floor(t * 1.5) % 2 ? C.red : "#5a2a22");
  }

  function flags(g, S) {
    const A = S.art, wv = Math.floor(S.clock * 3) % 2;
    for (let i = 0; i < N; i++) {
      const x = Math.round(flagX(i) - S.cam);
      if (x < -20 || x > S.VW + 10) continue;
      g.drawImage(A.pole, x - 2, GROUND - 34);
      g.drawImage(A.cloth[wv], x + 1, S.x >= flagX(i) ? GROUND - 30 : GROUND - 13);
      // The month plate hangs on the pole above head height, clear of the line.
      const bx = x - (A.boards[i].width >> 1);
      g.drawImage(A.boards[i], bx, GROUND - 23);
      g.drawImage(A.months[i], bx + 1, GROUND - 22);
    }
  }

  function blocks(g, S) {
    const A = S.art;
    for (const b of BLOCKS) {
      const x = Math.round(b.x - S.cam);
      if (x < -14 || x > S.VW) continue;
      const bump = S.bumps.get(b.id);
      const y = b.y - (bump != null && S.clock - bump < 0.14 ? 3 : 0);
      g.drawImage(S.x >= b.x + 6 ? A.used : A.block[Math.floor(S.clock * 2 + b.x) % 4 === 0 ? 1 : 0], x, y);
    }
  }

  // ---- weather and water ------------------------------------------------------------------
  // February rain over the kampung only: slanted streaks, drips from the
  // eave, crowns in the puddles, all stepped at eight frames a second.
  function rain(g, S) {
    const edge = monthX(1) - S.cam, sp = S.L.spot;
    if (edge + J().B <= 0) return;
    const t = Math.floor(S.clock * 8) / 8, span = monthX(1) + 40;
    g.fillStyle = "rgba(176,198,240,0.5)";
    for (let k = 0; k < 90; k++) {
      const y = Math.floor((hash(k, 1, 51) * 150 + t * (150 + hash(k, 2, 51) * 60)) % 150) - 14;
      const x = Math.floor(hash(k, 3, 51) * span) - 20 - S.cam - (y >> 2);
      if (x < -2 || x > S.VW || x > edge + (hash(k, 4, 51) - 0.5) * 28) continue;
      g.fillRect(x, y, 1, 2); g.fillRect(x - 1, y + 2, 1, 2);
    }
    g.fillStyle = "#bcd0f0";
    for (const [dx, dy] of sp.drips) {
      const x = dx - S.cam, f = (t * 0.9 + hash(dx, 1, 53)) % 1;
      if (x > -2 && x < S.VW) g.fillRect(x, dy + Math.floor(f * (GROUND - 6 - dy)), 1, 2);
    }
    for (const [dx, dy, w] of sp.puddles) {
      const n = Math.floor(S.clock * 6 + hash(dx, 1, 55) * 6), f = n % 4, x = dx - S.cam + 2 + Math.floor(hash(dx, n, 55) * (w - 4));
      if (x < -3 || x > S.VW + 3) continue;
      if (f === 0) g.fillRect(x, dy - 1, 1, 1);
      else if (f === 1) { g.fillRect(x - 1, dy - 1, 1, 1); g.fillRect(x + 1, dy - 1, 1, 1); g.fillRect(x, dy - 2, 1, 1); }
      else if (f === 2) { g.fillRect(x - 2, dy, 1, 1); g.fillRect(x + 2, dy, 1, 1); }
    }
  }

  // May's boardwalk crosses still water, so the whole line of us shows again
  // below it, upside down and dim: the digital twin. Ripples break it.
  function reflect(g, S) {
    const [x0, x1] = colEdge(S, 3), a = Math.max(0, x0), b = Math.min(S.VW, x1);
    if (b <= a) return;
    g.save();
    g.beginPath(); g.rect(a, GROUND + 5, b - a, H - GROUND - 5); g.clip();
    g.globalAlpha = 0.38;
    g.translate(0, 2 * GROUND + 5); g.scale(1, -1);
    actors(g, S);
    g.restore();
    g.fillStyle = "rgba(40,95,138,0.45)";
    for (let y = GROUND + 6 + (Math.floor(S.clock * 3) % 3); y < H - 4; y += 3) g.fillRect(a, y, b - a, 1);
  }

  // ---- actors -----------------------------------------------------------------------------
  function trailAt(S, back) {
    const h = S.hist;
    const i = h.length - 1 - back;
    if (i >= 0) return h[i];
    return { x: h[0].x - -i * S.dir0, y: 0, f: h[0].f };
  }

  function actors(g, S) {
    const joined = JOIN.filter((j) => j.i <= S.flag).length;
    for (let k = joined - 1; k >= 0; k--) {
      const pt = trailAt(S, (k + 1) * GAP);
      const bot = P.hqArt.bots[JOIN[k].a.id];
      const set = pt.f < 0 ? bot.left : bot.right;
      const spr = S.moving ? set.walk[Math.floor(S.clock * 8 + k) % 2] : set.stand;
      g.drawImage(spr, Math.round(pt.x - S.cam) - 4, GROUND - spr.height + 1 - Math.round(pt.y * 0.6));
    }
    const av = P.hqArt.avatar;
    const frames = S.face < 0 ? av.left : av.right;
    const spr = S.jumpY > 0 ? frames[1] : S.moving ? frames[Math.floor(S.clock * 8) % 2] : frames[0];
    g.drawImage(spr, Math.round(S.x - S.cam) - 4, GROUND - spr.height + 1 - Math.round(S.jumpY));
  }

  // Blocks sit 30px apart but their labels are wider, so a label that would
  // overlap one still showing takes the next free line above it.
  function lane(S, b) {
    const w = S.art.pops[b.id].width;
    const near = S.pops.filter((q) => S.clock - q.t < 1.2 && Math.abs(q.x - b.x) < (w + S.art.pops[q.id].width) / 2 + 2);
    let n = 0;
    while (near.some((q) => q.lane === n)) n++;
    return n;
  }

  function effects(g, p, S) {
    S.pops = S.pops.filter((q) => S.clock - q.t < 1.2);
    for (const q of S.pops) {
      const k = (S.clock - q.t) / 1.2;
      const img = S.art.pops[q.id];
      g.globalAlpha = Math.max(0, 1 - k * k);
      g.drawImage(img, Math.round(q.x - S.cam + 6 - img.width / 2), Math.round(q.y - 9 - q.lane * 9 - k * 6));
      g.globalAlpha = 1;
    }
    S.sparks = S.sparks.filter((q) => S.clock - q.t < 0.5);
    for (const q of S.sparks) {
      const r = Math.round((S.clock - q.t) * 16);
      const x = Math.round(q.x - S.cam), y = q.y;
      p.px(x - r, y, C.sun); p.px(x + r, y, C.sun); p.px(x, y - r, C.white); p.px(x, y + r, C.white);
    }
  }

  // Solid panels with an ink rim, so sky, stars and skyline never read as
  // part of the numbers.
  function panel(p, x, y, w, h) {
    p.R(x, y, w, h, C.ink); p.R(x + 1, y + 1, w - 2, h - 2, "#1c3a2f"); p.R(x + 1, y + 1, w - 2, 1, "#2c5645");
  }

  function hud(g, p, S) {
    const A = S.art;
    const m = Math.max(0, Math.min(N - 1, Math.floor((S.cam + S.VW / 2 - START) / SEG)));
    const mm = A.hudMonth[m];
    panel(p, 2, 2, mm.width + 6, mm.height + 6);
    g.drawImage(mm, 5, 5);
    const used = BLOCKS.filter((b) => S.x >= b.x + 6).length;
    const joined = JOIN.filter((j) => j.i <= S.flag).length;
    const rowW = A.unlocked.width + 2 + A.digits[0].width + A.of.width;
    const x0 = S.VW - rowW - 5;
    panel(p, x0 - 3, 2, rowW + 6, 22);
    g.drawImage(A.unlocked, x0, 5); g.drawImage(A.digits[used], x0 + A.unlocked.width + 2, 5); g.drawImage(A.of, x0 + A.unlocked.width + 2 + A.digits[0].width, 5);
    g.drawImage(A.agents, x0, 13); g.drawImage(A.digits[joined], x0 + A.agents.width + 2, 13);
  }

  function draw(S) {
    const g = S.g, p = P.bots.pen(g);
    S.cam = Math.round(Math.max(0, Math.min(LEN - S.VW, S.x - S.VW * 0.62)));
    readMonth(S);
    sky(g, S);
    layer(g, S, S.L.far, 0.3); layer(g, S, S.L.mid, 0.6); midLive(g, S);
    g.drawImage(S.L.front, S.cam, 0, S.VW, H, 0, 0, S.VW, H);
    props(g, p, S); flags(g, S); blocks(g, S); reflect(g, S); actors(g, S);
    rain(g, S); effects(g, p, S); hud(g, p, S);
  }

  // ---- motion -----------------------------------------------------------------------
  function record(S) {
    const h = S.hist, last = h[h.length - 1];
    const dx = S.x - last.x;
    const n = Math.floor(Math.abs(dx));
    for (let k = 1; k <= n; k++) h.push({ x: last.x + Math.sign(dx) * k, y: S.jumpY, f: Math.sign(dx) });
    if (h.length > 400) h.splice(0, h.length - 400);
  }

  function resetTrail(S) {
    S.hist = [];
    for (let k = 300; k >= 0; k--) S.hist.push({ x: S.x - k, y: 0, f: 1 });
    S.dir0 = 1;
  }

  function step(S, dt) {
    const d = S.target - S.x;
    S.moving = Math.abs(d) > 0.5;
    if (!S.moving) { S.x = S.target; S.jumpY = 0; S.jump = null; return; }
    // Walk one month at a reading pace; run when the reader skips ahead.
    const speed = Math.abs(d) > 300 ? Math.min(800, 110 + (Math.abs(d) - 300) * 2) : 110;
    const before = S.x;
    S.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
    S.face = Math.sign(d);
    // Jump into the next block when walking right at a walking pace.
    if (!S.jump && S.face > 0 && speed < 280) {
      const next = BLOCKS.find((b) => b.x + 6 > S.x && b.x + 6 - S.x < speed * 0.2 + 2);
      if (next) S.jump = { t: S.clock, b: next };
    }
    if (S.jump) {
      const q = (S.clock - S.jump.t) / 0.4;
      S.jumpY = q >= 1 ? 0 : 18 * 4 * q * (1 - q);
      if (q >= 1) S.jump = null;
    }
    // Blocks crossed while moving right pop what they held.
    if (S.x > before) {
      for (const b of BLOCKS) {
        if (before < b.x + 6 && S.x >= b.x + 6) {
          S.bumps.set(b.id, S.clock);
          if (speed < 280) S.pops.push({ id: b.id, x: b.x, y: b.y, t: S.clock, lane: lane(S, b) });
        }
      }
    }
    const flag = MONTHS.reduce((f, m, i) => (S.x >= flagX(i) ? i : f), -1);
    if (flag > S.flag) {
      for (let k = JOIN.filter((j) => j.i <= S.flag).length; k < JOIN.filter((j) => j.i <= flag).length; k++) {
        S.sparks.push({ x: S.x - (k + 1) * GAP, y: GROUND - 8, t: S.clock });
      }
    }
    S.flag = flag;
    record(S);
  }

  function place(S, x) {
    S.x = S.target = x;
    S.flag = MONTHS.reduce((f, m, i) => (x >= flagX(i) ? i : f), -1);
    S.face = 1; S.jumpY = 0; S.jump = null; S.moving = false; S.pops = []; S.sparks = [];
    resetTrail(S);
    S.dirty = true;
  }

  // ---- scroll link ------------------------------------------------------------------
  function readScroll(S) {
    const line = window.innerHeight * 0.5;
    let active = -1;
    S.items.forEach((li, i) => { if (li.getBoundingClientRect().top < line) active = i; });
    const endTop = S.dom.end.getBoundingClientRect().top;
    const target = endTop < line ? END_X + 15 : active < 0 ? 26 : flagX(active) + 10;
    if (active !== S.active) {
      S.items.forEach((li, i) => li.classList.toggle("is-active", i === active));
      S.active = active;
    }
    if (target !== S.target) {
      if (S.teleport) place(S, target);
      else S.target = target;
      S.dirty = true;
    }
  }

  function size(S) {
    // clientWidth includes the wrap's own padding (set on phones), and the
    // frame border takes 6px a side, so measure the content box.
    const cs = getComputedStyle(S.dom.wrap);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const cw = S.dom.wrap.clientWidth - pad - 12;
    const dpr = window.devicePixelRatio || 1;
    let s = 1;
    for (const k of P.hq.scales(dpr)) if (k <= 2 && Math.floor(cw / k) >= 220 && k > s) s = k;
    S.VW = Math.floor(cw / s);
    S.canvas.width = S.VW; S.canvas.height = H;
    S.canvas.style.width = S.VW * s + "px";
    S.canvas.style.height = H * s + "px";
    // The camera for each month while it is read, which anchors the parallax.
    S.read = MONTHS.map((m, i) => Math.round(Math.max(0, Math.min(LEN - S.VW, flagX(i) + 10 - S.VW * 0.62))));
    S.dirty = true;
  }

  function mount(opts) {
    const canvas = document.getElementById("level");
    const S = {
      canvas, g: canvas.getContext("2d"), art: null, clock: 0, acc: 0, dirty: true,
      x: 26, target: 26, face: 1, jumpY: 0, flag: -1, active: -1, moving: false,
      bumps: new Map(), pops: [], sparks: [], teleport: opts.reduce,
      dom: { wrap: document.getElementById("level-wrap"), end: document.getElementById("months-end") },
      items: Array.from(document.querySelectorAll("#months > li")),
    };
    S.art = art();
    // The scenery bakes once here (about 20 ms), so a failure still leaves
    // the month list readable.
    S.L = P.jscene.build({ H, GROUND, SEG, LEN, months: N, monthX });
    S.tmp = P.canvas(P.jscene.B * 2, GROUND);
    S.tmpG = S.tmp.getContext("2d");
    resetTrail(S);
    size(S);
    const ro = new ResizeObserver(() => size(S));
    ro.observe(S.dom.wrap);
    const onScroll = () => readScroll(S);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    readScroll(S);
    place(S, S.target);
    return {
      S,
      tick(dt, playing) {
        if (playing) {
          S.clock += dt; S.acc += dt;
          step(S, Math.min(dt, 0.05));
        } else if (S.x !== S.target) place(S, S.target);
        if (S.dirty || (playing && S.acc >= 1 / 30)) { S.acc = 0; S.dirty = false; draw(S); }
      },
      setPlaying(on) { S.teleport = !on && opts.reduce; },
      setTime(t) { S.clock = t; S.dirty = true; },
      jump(x) { place(S, x); },
      destroy() {
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      },
    };
  }

  P.journey = { mount, flagX, END_X };
})((window.PETA = window.PETA || {}));
