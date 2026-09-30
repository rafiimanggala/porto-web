// Small sprites: the avatar and its jukung, trees, clouds, gulls, sailboats, a dolphin,
// level dots and the flag a cleared landmark keeps.
(function (P) {
  "use strict";
  const { paint, bake, flip, hash, PAL: C } = P;

  const BODY = { H: C.hair, S: C.skin, E: C.ink, O: C.orange, D: C.denim, K: C.hair };
  const HEAD_DOWN = [".HHHH.", "HHHHHH", "HSSSSH", "SESSES", ".SSSS."];
  const HEAD_UP = [".HHHH.", "HHHHHH", "HHHHHH", "HHHHHH", ".SSSS."];
  const HEAD_SIDE = [".HHHH.", "HHHHHH", "HHHSSS", "HHSSES", ".SSSSS"];
  const TORSO = ["OOOOOO", "SOOOOS", "SOOOOS"];
  const TORSO_SWING = ["OOOOOO", "SOOOOO", "OOOOOS"];
  const TORSO_SIDE = [".OOOO.", ".OOSO.", ".OOSO."];
  const TORSO_SIDE_SWING = [".OOOO.", ".OSOO.", "SOOOO."];
  const LEGS = {
    stand: [".DDDD.", ".D..D.", ".K..K."],
    left: [".DDDD.", ".D..K.", ".K...."],
    right: [".DDDD.", ".K..D.", "....K."],
    sideStand: [".DDDD.", "..DD..", "..KK.."],
    sideStep: [".DDDD.", ".D..D.", "K....K"],
  };

  function avatar() {
    const mk = (head, torso, legs, flipIt) => bake(head.concat(torso, legs), BODY, { outline: C.ink, flip: flipIt });
    const down = [mk(HEAD_DOWN, TORSO, LEGS.stand), mk(HEAD_DOWN, TORSO_SWING, LEGS.left),
      mk(HEAD_DOWN, TORSO, LEGS.stand), mk(HEAD_DOWN, TORSO_SWING, LEGS.right)];
    const up = [mk(HEAD_UP, TORSO, LEGS.stand), mk(HEAD_UP, TORSO_SWING, LEGS.left),
      mk(HEAD_UP, TORSO, LEGS.stand), mk(HEAD_UP, TORSO_SWING, LEGS.right)];
    const right = [mk(HEAD_SIDE, TORSO_SIDE, LEGS.sideStand), mk(HEAD_SIDE, TORSO_SIDE_SWING, LEGS.sideStep)];
    const left = right.map(flip);
    const seated = { right: bake(HEAD_SIDE.concat(TORSO_SIDE.slice(0, 2)), BODY, { outline: C.ink }) };
    seated.left = flip(seated.right);
    return { down, up, right, left, seated, w: down[0].width, h: down[0].height };
  }

  // Balinese outrigger canoe, bow to the right, eye on the bow.
  function jukung() {
    const right = paint(25, 9, (R, px) => {
      R(2, 1, 20, 1, C.bamboo);
      for (const x of [6, 17]) { R(x, 0, 1, 3, C.bamboo2); R(x, 6, 1, 2, C.bamboo2); }
      R(3, 3, 18, 1, C.white); R(21, 3, 1, 1, C.white);
      R(2, 4, 20, 1, C.orange); R(22, 4, 2, 1, C.orange2);
      R(3, 5, 18, 1, C.blue);
      px(18, 4, C.white); px(19, 4, C.ink);
      R(2, 7, 20, 1, C.bamboo);
    }, C.ink);
    return { right, left: flip(right), w: right.width, h: right.height };
  }

  const FRONDS = [
    [[5, 3], [4, 3], [3, 4], [2, 4], [1, 5], [0, 6]],
    [[7, 3], [8, 3], [9, 4], [10, 4], [11, 5], [12, 6]],
    [[5, 2], [4, 1], [3, 1], [2, 1], [1, 2]],
    [[7, 2], [8, 1], [9, 1], [10, 1], [11, 2]],
    [[6, 2], [6, 1], [6, 0]],
  ];

  function palm(f) {
    return paint(13, 18, (R, px) => {
      for (let y = 6; y < 18; y++) {
        const x = y < 11 ? 6 : 5;
        R(x, y, 2, 1, y % 3 === 0 ? C.wood2 : C.bamboo2);
      }
      FRONDS.forEach((fr, n) => fr.forEach(([x, y], j) => {
        const droop = f && j >= fr.length - 2 && n < 4 ? 1 : 0;
        px(x, y + droop, j === fr.length - 1 ? C.leaf3 : C.leaf);
        if (n < 4) px(x, y + 1 + droop, C.leaf2);
      }));
      px(5, 5, C.wood2); px(7, 5, C.wood2); px(6, 6, C.wood2);
    }, C.ink);
  }

  function roundTree() {
    return paint(11, 13, (R, px) => {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 11; x++) {
        const dx = x - 5, dy = y - 4.5;
        if (dx * dx + dy * dy > 26) continue;
        const lit = dx + dy;
        px(x, y, lit < -3 ? C.leaf : lit < 3 ? C.leaf2 : C.leaf3);
      }
      px(3, 2, "#8cc45e"); px(4, 3, "#8cc45e"); px(7, 6, C.leaf4);
      R(5, 10, 2, 3, C.wood2);
    }, C.ink);
  }

  // Clouds: a pixel cumulus, puffs rising toward the middle over a flat
  // shaded base, softly outlined so it reads over land and sea alike.
  function cloud(w, h, seed) {
    const n = Math.max(3, Math.round(w / 22));
    const puffs = [[w / 2, h * 0.72, w / 2 - 1, h * 0.24]];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const r = Math.min((h - 2) / 2, h * (0.2 + 0.24 * Math.sin(Math.PI * t)) * (0.85 + 0.3 * hash(i, 1, seed)));
      const x = w * (0.14 + 0.72 * t) + (hash(i, 2, seed) - 0.5) * 6;
      puffs.push([x, Math.max(r + 1, h * 0.62 - r * 0.5), r, r]);
    }
    const inside = (x, y) => puffs.some(([cx, cy, rx, ry]) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1);
    const floor = Math.round(h * 0.8);
    const body = paint(w, h, (R, px) => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!inside(x, y)) continue;
        const shade = y >= floor + (hash(x >> 2, 3, seed) > 0.5 ? 0 : 1);
        const lit = !inside(x, y - 1) || !inside(x, y - 2);
        px(x, y, shade ? "#cfdcd6" : lit ? "#ffffff" : !inside(x - 2, y) ? "#e4ebe3" : C.white);
      }
    }, "#86aaa5");
    const shadow = paint(body.width, body.height, (R, px, g) => {
      g.drawImage(body, 0, 0);
      g.globalCompositeOperation = "source-in";
      R(0, 0, body.width, body.height, "rgba(6, 30, 34, 0.24)");
    });
    return { body, shadow, w: body.width, h: body.height };
  }

  function gull(f) {
    return paint(5, 3, (R, px) => {
      if (f) { R(0, 1, 2, 1, C.white); R(3, 1, 2, 1, C.white); px(2, 2, C.white); px(0, 1, C.grey3); px(4, 1, C.grey3); }
      else { px(0, 0, C.grey3); px(4, 0, C.grey3); px(1, 1, C.white); px(3, 1, C.white); px(2, 2, C.white); }
    });
  }

  function sailboat(f) {
    return paint(11, 12, (R, px) => {
      R(4, 0, 1, 10, C.wood2);
      for (let y = 0; y < 9; y++) {
        const w = 1 + Math.floor(y * (f ? 0.5 : 0.6));
        R(5, y, w, 1, y === 3 || y === 6 ? C.rose : C.white);
      }
      R(0, 9, 11, 1, C.wood); R(1, 10, 9, 1, C.wood2);
    }, C.ink);
  }

  // A dolphin in three poses for its leap: rising, level, diving.
  const DOLPHIN = [
    [".........BB", "......DBBEB", ".....DBBBL.", "...DDBBBL..", "..DBBBLL...", "DDBBLL.....", "D.L........"],
    ["......D.....", "....DDDD....", "D..DBBBBBBB.", "DDBBBBBBBEBB", "D..LLLLLLL.."],
    ["D.D........", "DDBBD......", "..DBBBD....", "...LBBBBD..", ".....LBBBD.", "......LLBEB", ".........BB"],
  ];

  function dolphin() {
    const pal = { D: "#3f5a6e", B: "#7197ad", L: "#d6e4e8", E: C.ink };
    return {
      right: DOLPHIN.map((rows) => bake(rows, pal, { outline: C.ink })),
      left: DOLPHIN.map((rows) => bake(rows, pal, { outline: C.ink, flip: true })),
    };
  }

  function dot(fill, shade, hi) {
    return paint(5, 4, (R, px) => {
      R(1, 0, 3, 1, fill); R(0, 1, 5, 2, fill); R(1, 3, 3, 1, shade); px(1, 1, hi);
    }, C.ink);
  }

  function flag(f) {
    return paint(6, 9, (R) => {
      R(0, 0, 1, 9, C.grey2);
      R(1, f ? 1 : 0, 4, 1, C.sun); R(1, f ? 2 : 1, 3, 1, C.sun); R(1, f ? 3 : 2, 2, 1, C.sun2);
    }, C.ink);
  }

  function build() {
    return {
      avatar: avatar(),
      jukung: jukung(),
      palm: [palm(0), palm(1)],
      round: roundTree(),
      clouds: [cloud(120, 46, 1), cloud(92, 38, 2), cloud(140, 52, 3), cloud(64, 26, 4), cloud(48, 20, 5)],
      gull: [gull(0), gull(1)],
      sailboat: [sailboat(0), sailboat(1)],
      dolphin: dolphin(),
      dotOpen: dot(C.orange, C.orange2, C.orange1),
      dotDone: dot(C.sky, C.blue, "#ffffff"),
      flag: [flag(0), flag(1)],
    };
  }

  P.sprites = { build };
})((window.PETA = window.PETA || {}));
