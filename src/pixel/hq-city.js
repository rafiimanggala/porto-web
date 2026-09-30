// Agent HQ, the city around the building: the roof and the Jakarta street
// with its traffic. Static parts bake with the building layer; per frame
// only what moves. hq.js calls in at bake and frame time, so nothing here
// reads P.hq while this file loads.
(function (P) {
  "use strict";
  const { paint, bake, flip, hash, bayer, PAL: C } = P;

  // ---- tone -------------------------------------------------------------------------
  // Exterior art is written in day colours and shifted per sky bucket: night
  // leans to moonlit blue so the lamps and lit rooms carry the scene. A colour
  // that starts with "!" gives off its own light and is never shifted.
  const TINT = { day: null, dawn: ["#8a7aa8", 0.22], dusk: ["#b0603a", 0.2], night: ["#1c2a5a", 0.46] };

  function mix(a, b, k) {
    const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((x >> s) & 255) * (1 - k) + ((y >> s) & 255) * k);
    return "#" + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
  }

  const TONERS = {};
  function toner(bk) {
    if (TONERS[bk]) return TONERS[bk];
    const tint = TINT[bk], memo = new Map();
    const T = (col) => {
      if (col[0] === "!") return col.slice(1);
      if (!tint || col[0] !== "#") return col;
      let out = memo.get(col);
      if (!out) { out = mix(col, tint[0], tint[1]); memo.set(col, out); }
      return out;
    };
    return (TONERS[bk] = T);
  }

  // R and px that paint through a bucket's tone.
  function toned(R, bk) {
    const T = toner(bk);
    const TR = (x, y, w, h, col) => R(x, y, w, h, T(col));
    return { R: TR, px: (x, y, col) => TR(x, y, 1, 1, col), T };
  }

  // A baked sprite shifted toward a [colour, amount] tint, for things placed
  // with drawImage; tinted() uses the bucket's own tint.
  function tintWith(src, tint) {
    if (!tint) return src;
    return paint(src.width, src.height, (R, px, g) => {
      g.drawImage(src, 0, 0);
      g.globalCompositeOperation = "source-atop";
      g.globalAlpha = tint[1];
      R(0, 0, src.width, src.height, tint[0]);
    });
  }
  const tinted = (src, bk) => tintWith(src, TINT[bk]);

  // Light in three clean steps round (cx, cy): a solid core, a checker band
  // and a sparse fringe, so it reads as a pool and not as noise.
  function glow(R, cx, cy, rx, ry, col) {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry), b = bayer(cx + x, cy + y);
      if (d < 0.28 || (d < 0.6 && b < 0.5) || (d < 1 && b < 0.13)) R(cx + x, cy + y, 1, 1, col);
    }
  }

  // ---- sprites ----------------------------------------------------------------------
  // Side views facing right; bake adds the 1px ink outline. Wheels carry a
  // rim light that steps round with the distance travelled, so they roll.
  const VPAL = {
    k: C.ink, t: "#23282c", r: "#8d968a", R: "#d8dccd", M: "#a3ab9f", g: "#2a3f4a", G: "#7fa9bb",
    i: "#1c2328", L: "#fff2c0", T: "#d9543f", o: C.orange1, h: C.hair, s: C.skin, S: C.skin2,
    D: C.denim, d: "#1f2c40", W: C.white, w: "#26302c", y: C.sun, c: C.red, P: C.rose, Z: C.blue,
    e: "#8fd49a", E: "#5fb86a", J: "#3f8f4e", j: "#2c6b3a", v: "#1c2328", V: "#8fb8c8",
    Q: "#4d5357", K: "#2f3336", u: "#f59a52", O: C.orange1, n: C.orange, N: C.orange2,
    B: C.red, b: "#a63d2d", x: "#5e645d", A: C.wood, a: C.wood1,
  };
  // Angkot liveries: the pale blue mikrolet and a red one.
  const BLUE = { H: "#b6e3f0", B: "#7cc4dc", b: "#58a6c4", d: "#3a7c98" };
  const RED = { H: "#f7a488", B: "#d9543f", b: "#b8432f", d: "#8a3325" };

  const ANGKOT = [
    "..HHHHHHHHHHHHHHHHHHHHHHHHHHHH....",
    ".BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB...",
    ".BggggggBgggggBiiiiiiBggggggggG...",
    ".BgghhggBgghhgBiihhiiBgghhgggggG..",
    ".BggssggBggssgBiissiiBggssggggggG.",
    ".BgyyyygBgccccBicccciBgWWWWggggggB",
    ".WWWWWWWWWWWWWWicccciWWWWWWWWWWWWW",
    ".TBBBBBBBBBBBBBicccciBBBBBBBBBBBBL",
    ".TBBBBBBBBBBBBBiDDDDiBBBBBBBBBBBBL",
    ".bbbbbbbbbbbbbbMMMMMMbbbbbbbbbbbbo",
    ".ddkkttttkkddddddddddddkkttttkkddM",
    "MddkttrrttkddddddddddddkttrrttkdMM",
    "MM..trRrrt..............trRrrt..MM",
    "....trrrrt..............trrrrt....",
    "....ttrrtt..............ttrrtt....",
    ".....tttt................tttt.....",
  ];
  const BAJAJ = [
    "......QQQQQQQQQQQ.....",
    "....KKKKKKKKKKKKKKK...",
    "...KKKKKKKKKKKKKKKKg..",
    "..OOiPPiiiiihhiiiOggg.",
    ".OOOPPsiiiiihsiiiOgggG",
    ".OOOPPPPiiiiZZZSMOOOOO",
    ".OOOyyyyiiiiZZZiiOOOOO",
    "OOOOyyyyiiiiDDDiiOOOOO",
    "uuuuuuuuuuuuuuuuuuuuuL",
    "TOOOOOOOOOOOOOOOOOOOOn",
    "nnnnnnnnnnnnnnnnnnnnnn",
    "MNNkkkkkNNNNNNNNkkkkk.",
    "M...ttt..........ttt..",
    "...ttrtt........ttrtt.",
    "...trRrt........trRrt.",
    "...ttrtt........ttrtt.",
    "....ttt..........ttt..",
  ];
  // An ojek: the rider in the green jacket and helmet, on a red scooter.
  const OJEK = [
    ".......eEEe.........",
    "......eEEEEv........",
    "......EEEEvV........",
    "......jEEEss........",
    ".....JJJJJJ.........",
    ".....jJJJJJJJ.......",
    ".....jJJJJJ..sM.....",
    ".....jjJJJJ...BBL...",
    "....wwjjjDDDD.BBB...",
    "..TBBBBBBDDDDdBBb...",
    "..bbbbbbbxxxdkBBb...",
    "..bbbbbbxxxxbbbbb...",
    "..kkkkkMMMM..kkkkk..",
    "...ttt.......ttt....",
    "..ttrtt.....ttrtt...",
    "..trRrt.....trRrt...",
    "..ttrtt.....ttrtt...",
    "...ttt.......ttt....",
  ];
  // A driver off his bike, reading his phone while he waits for an order.
  const WAITER = [
    "..hhh..",
    ".hhhhh.",
    ".hhsss.",
    "..sSs..",
    ".JJJJJ.",
    "JEJJJJJ",
    "JjJJJsL",
    "JjJJJj.",
    "sjJJJj.",
    ".jjjjj.",
    ".DDDDD.",
    ".DD.DD.",
    ".Dd.Dd.",
    ".Dd.Dd.",
    ".Dd.Dd.",
    ".kk.kk.",
  ];
  // The cart's seller: cap, a towel over the shoulder, a batik shirt.
  const SELLER = [
    "..ccc..",
    ".cccccc",
    ".hhsss.",
    "..sSs..",
    ".WAAAA.",
    "WWAaAAs",
    "WAAAaA.",
    "AaAAAA.",
    "sAAaAA.",
    ".AAAAA.",
    ".DDDDD.",
    ".DD.DD.",
    ".DD.DD.",
    ".Dd.Dd.",
    ".Dd.Dd.",
    ".kk.kk.",
  ];
  // The roof cat asleep on the coping, tail down and tail up.
  const CAT = [
    ".........O.O.",
    ".........OOOO",
    "...OOoOoOOkOs",
    "..OOOOOOOOOO.",
    "OOOOwwwwwwww.",
  ];
  const CAT_UP = [
    ".........O.O.",
    "O........OOOO",
    "O..OOoOoOOkOs",
    "OOOOOOOOOOOO.",
    "....wwwwwwww.",
  ];
  const CPAL = { O: C.orange1, o: "#c65a24", w: "#f3d9c0", k: "#3b2616", s: C.rose };
  // Pigeons on the coping, standing and pecking.
  const PIGEON = ["...hh", "tbbwn", ".bbb.", "..f.."];
  const PECK = [".....", "tbbwh", ".bbbh", "..f.."];
  const GPAL = { h: "#5e6878", n: "#6fa39a", t: "#4a5260", b: "#9aa3b0", w: "#6b7480", f: "#d9776a" };

  // Second wheel frame: each rim light steps one pixel round the hub.
  function roll(rows) {
    const out = rows.map((r) => r.split(""));
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] !== "R") continue;
        const to = [[1, 1], [1, 0], [0, 1]].find(([dx, dy]) => rows[y + dy] && rows[y + dy][x + dx] === "r");
        if (!to) continue;
        out[y][x] = "r";
        out[y + to[1]][x + to[0]] = "R";
      }
    });
    return out.map((r) => r.join(""));
  }

  // Where the lights sit in each right-facing sprite, outline included.
  const LIGHTS = { angkot: { head: [34, 8, 2], tail: [2, 8, 2] }, bajaj: { head: [22, 9, 1], tail: [1, 10, 1] }, ojek: { head: [17, 8, 1], tail: [3, 10, 1] } };

  let ART = null;
  function art() {
    if (ART) return ART;
    const two = (rows, extra) => {
      const pal = Object.assign({}, VPAL, extra || {});
      return [bake(rows, pal, { outline: C.ink }), bake(roll(rows), pal, { outline: C.ink })];
    };
    const one = (rows, pal) => bake(rows, pal || VPAL, { outline: C.ink });
    const ojek = two(OJEK);
    ART = {
      angkot: two(ANGKOT, BLUE), angkot2: two(ANGKOT, RED), bajaj: two(BAJAJ).map(flip),
      ojekR: ojek, ojekL: ojek.map(flip), waiter: one(WAITER), seller: flip(one(SELLER)),
      cat: [one(CAT, CPAL), one(CAT_UP, CPAL)], pigeon: [one(PIGEON, GPAL), one(PECK, GPAL)],
    };
    ART.pigeonL = ART.pigeon.map(flip);
    return ART;
  }

  // The same sprites shifted to a sky bucket, made once per bucket at bake.
  const TINTED = {};
  function artFor(bk) {
    if (TINTED[bk]) return TINTED[bk];
    const a = art(), out = {};
    for (const k of Object.keys(a)) out[k] = Array.isArray(a[k]) ? a[k].map((c) => tinted(c, bk)) : tinted(a[k], bk);
    // Headlight beams: a wedge widening down to the road in three steps.
    out.beam = paint(24, 11, (R) => {
      for (let x = 0; x < 24; x++) {
        const a = x < 7 ? 0.34 : x < 15 ? 0.2 : 0.1, bot = 2 + Math.floor((x * 9) / 23);
        R(x, x < 12 ? 1 : 0, 1, bot - (x < 12 ? 1 : 0), `rgba(255,230,160,${a})`);
      }
      R(0, 1, 4, 1, "rgba(255,244,200,0.5)");
    });
    out.beamL = flip(out.beam);
    return (TINTED[bk] = out);
  }

  // ---- roof ---------------------------------------------------------------------------
  // What stands on the roof, packed left to right; a narrow building drops the
  // extras that do not fit. P0 is the top row of the parapet coping.
  const ROOFS = new WeakMap(), STREETS = new WeakMap();
  function roofPlan(L) {
    if (ROOFS.has(L)) return ROOFS.get(L);
    const left = L.bx0 + 6, right = L.shaft ? L.shaft.x - 3 : L.bx0 + L.bW - 5;
    const span = right - left, dish = right - 12;
    const want = [
      ["toren", 0, 16], ["stair", 22, 28],
      ["solar", Math.round(span * 0.3), 36, span < 300], ["line", Math.round(span * 0.52), 46],
      ["ac", Math.round(span * 0.77), 24, span < 200],
    ];
    const plan = { P0: L.roofY - 7, dish, cat: L.bx0 + Math.round(L.bW * 0.43), birds: L.bx0 + Math.round(L.bW * 0.6) };
    let end = left - 3;
    for (const [id, at, w, skip] of want) {
      const x = Math.max(left + at, end + 4);
      if (skip || x + w > dish - 4) continue;
      plan[id] = x; end = x + w;
    }
    plan.lineW = 46;
    plan.pots = plan.stair != null ? plan.stair + 32 : left + 20;
    // The widest gap between things, where the mosque behind shows best.
    const spans = [["toren", 16], ["stair", 28], ["solar", 36], ["line", 46], ["ac", 24]]
      .filter(([id]) => plan[id] != null).map(([id, w]) => [plan[id], plan[id] + w]).concat([[dish, dish + 12]]);
    let gap = [left, left];
    for (let i = 1; i < spans.length; i++) if (spans[i][0] - spans[i - 1][1] > gap[1] - gap[0]) gap = [spans[i - 1][1], spans[i][0]];
    plan.gap = Math.round((gap[0] + gap[1]) / 2);
    const sh = L.shaft;
    plan.mast = sh ? [sh.x - 1 + ((sh.w + 2) >> 1), plan.P0 - 36] : [L.bx0 + L.bW - 8, plan.P0 - 22];
    ROOFS.set(L, plan);
    return plan;
  }

  const TANK = ["#9ad6ec", "#6fb6d3", "#4a9fc0", "#3a88ab", "#2b6f8f", "#1f5670"];
  // The toren: a plastic water tank on a steel stand, on every Jakarta roof.
  function toren(R, px, x, P0) {
    const top = P0 - 27, bot = P0 - 10;
    R(x + 1, bot + 2, 1, P0 + 3 - bot, "#5e645d"); R(x + 14, bot + 2, 1, P0 + 3 - bot, "#5e645d");
    for (let i = 0; i < 12; i++) {
      const y = bot + 2 + Math.floor((i * 8) / 12);
      px(x + 2 + i, y, "#7d857a"); px(x + 13 - i, y, "#6b7468");
    }
    R(x, bot, 16, 2, "#8d968a"); R(x, bot, 16, 1, "#b7bfb2");
    R(x, top - 1, 16, bot - top + 1, C.ink);
    const cols = [5, 3, 1, 0, 1, 2, 2, 2, 2, 3, 3, 4, 4, 5];
    for (let i = 0; i < 14; i++) R(x + 1 + i, top, 1, bot - top, TANK[cols[i]]);
    for (let y = top + 4; y < bot - 1; y += 4) for (let i = 0; i < 14; i++) px(x + 1 + i, y, TANK[Math.min(5, cols[i] + 1)]);
    R(x + 3, top - 3, 10, 2, C.ink); R(x + 4, top - 2, 8, 2, TANK[2]); R(x + 4, top - 2, 3, 1, TANK[0]);
    R(x + 6, top - 5, 4, 2, C.ink); R(x + 7, top - 4, 2, 1, TANK[1]);
    R(x + 12, bot + 2, 1, P0 + 3 - bot, "#d8dccd");
  }

  // The stair house: the roof door, a barred window and a lamp over the door.
  function stairHouse(R, px, x, P0, dark) {
    const top = P0 - 19, w = 26, h = P0 + 3 - top;
    R(x - 1, top - 1, w + 2, h + 1, C.ink);
    R(x, top, w, h, "#e9dfc6"); R(x, top, 1, h, "#f6efdc"); R(x + w - 1, top, 1, h, "#c3b594");
    for (let i = 0; i < 20; i++) px(x + 1 + Math.floor(hash(i, x, 51) * (w - 2)), top + 2 + Math.floor(hash(i, x, 52) * 17), hash(i, x, 53) > 0.5 ? "#d8ccad" : "#f6efdc");
    R(x - 3, top - 4, w + 6, 4, C.ink); R(x - 2, top - 3, w + 4, 1, "#f6efdc"); R(x - 2, top - 2, w + 4, 1, "#b7bfb2");
    R(x, top, w, 1, "#c3b594");
    const dx = x + 15;
    R(dx - 1, top + 4, 10, h - 4, C.ink);
    R(dx, top + 5, 8, h - 5, "#9a6a3d"); R(dx, top + 5, 1, h - 5, "#c08a55");
    R(dx + 2, top + 7, 4, 4, "#6d4527"); R(dx + 2, top + 13, 4, 4, "#6d4527"); px(dx + 2, top + 7, "#b07a48");
    px(dx + 6, top + 12, "#e0b43a");
    R(x + 3, top + 5, 8, 7, C.ink); R(x + 4, top + 6, 6, 5, dark ? "!#ffcf7a" : "#8fb8c8");
    for (let i = 1; i < 6; i += 2) R(x + 4 + i, top + 6, 1, 5, "#5e645d");
    R(x + 4, top + 11, 6, 1, "#f6efdc");
    R(dx + 2, top + 1, 4, 2, "#5e645d"); R(dx + 3, top + 3, 2, 1, dark ? "!#fff2c0" : "#d8dccd");
    if (dark) glow(R, dx + 4, top + 4, 7, 5, "!rgba(255,214,140,0.3)");
  }

  // Two solar panels on tilted frames: rows step right as they rise.
  function solar(R, px, x, P0) {
    for (let k = 0; k < 2; k++) {
      const x0 = x + k * 18;
      R(x0 + 3, P0 - 5, 1, 8, "#6b7468"); R(x0 + 13, P0 - 11, 1, 14, "#6b7468");
      for (let r = 0; r < 9; r++) {
        const y = P0 - 4 - r, off = r >> 1;
        const edge = r === 0 || r === 8;
        R(x0 + off, y, 16, 1, edge ? C.ink : "#1f3a66");
        if (edge) continue;
        px(x0 + off, y, C.ink); px(x0 + off + 15, y, C.ink);
        if (r % 2 === 0) R(x0 + off + 1, y, 14, 1, "#36598f");
        for (let c = 4; c < 15; c += 4) px(x0 + off + c, y, "#36598f");
        if (r === 7) R(x0 + off + 1, y, 14, 1, "#b7bfb2");
      }
      for (let i = 0; i < 4; i++) px(x0 + 7 + i + (i >> 1), P0 - 11 + i, "#6f93c8");
    }
  }

  // Two outdoor AC condensers on a stand, pipes dropping behind the parapet.
  function acUnits(R, px, x, P0) {
    for (let k = 0; k < 2; k++) {
      const ux = x + k * 12, uy = P0 - 13;
      R(ux + 1, uy + 8, 1, 8, "#5e645d"); R(ux + 9, uy + 8, 1, 8, "#5e645d");
      R(ux, uy, 11, 9, C.ink); R(ux + 1, uy + 1, 9, 7, "#dfe2d8"); R(ux + 1, uy + 1, 9, 1, "#f3f1e6");
      R(ux + 9, uy + 2, 1, 6, "#b7bfb2");
      R(ux + 2, uy + 2, 5, 5, "#6b7468"); R(ux + 3, uy + 3, 3, 3, "#8d968a"); px(ux + 4, uy + 4, "#3a3f44");
      px(ux + 3, uy + 3, "#b7bfb2"); px(ux + 5, uy + 5, "#b7bfb2");
      for (let y = uy + 2; y < uy + 7; y += 2) R(ux + 7, y, 2, 1, "#9aa294");
    }
    R(x + 5, P0 - 3, 1, 6, "#c08a55"); R(x + 17, P0 - 3, 1, 6, "#c08a55");
  }

  // A satellite dish tipped up at the sky: a tilted oval on a post, its bowl
  // shadowed under the upper rim, with the feed arm and the LNB out front.
  function dishOn(R, px, x, P0) {
    const cx = x + 6, cy = P0 - 11;
    R(cx + 1, cy, 1, P0 + 3 - cy, "#5e645d"); R(cx - 1, cy + 6, 5, 1, "#6b7468");
    const d = (dx, dy) => { const u = (dx - dy) * 0.7071, v = (dx + dy) * 0.7071; return (u * u) / 40 + (v * v) / 10; };
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
      const k = d(dx, dy);
      if (k < 1) px(cx + dx, cy + dy, k > 0.6 ? (dx + dy < 0 ? "#fbfaf2" : "#c9ccc2") : dx + dy < -1 ? "#aeb4aa" : dx + dy > 2 ? "#e6e8e0" : "#d3d7cc");
      else if (d(dx - 1, dy) < 1 || d(dx + 1, dy) < 1 || d(dx, dy - 1) < 1 || d(dx, dy + 1) < 1) px(cx + dx, cy + dy, C.ink);
    }
    for (let i = 0; i < 5; i++) px(cx - 4 - i, cy + 3 - i, i ? "#6b7468" : "#3a3f44");
    R(cx - 9, cy - 3, 2, 2, "#3a3f44"); px(cx - 9, cy - 3, "#6b7468");
  }

  // Poles and the line of the jemuran; the washing itself sways per frame.
  const sag = (i, w) => Math.round((12 * i * (w - 1 - i)) / ((w - 1) * (w - 1)));
  function lineBake(R, px, x, w, P0) {
    const top = P0 - 17;
    for (const lx of [x, x + w - 1]) { R(lx, top, 1, P0 + 3 - top, "#8d968a"); R(lx - 1, top, 3, 1, "#6b7468"); }
    for (let i = 0; i < w; i++) px(x + i, top + 1 + sag(i, w), "#3a3f44");
  }

  // The lift's machine room over the shaft, louvred, with the antenna mast.
  function machineRoom(R, px, sh, P0, dark) {
    const x = sh.x - 1, w = sh.w + 2, top = P0 - 13, h = P0 + 3 - top;
    R(x - 1, top - 1, w + 2, h + 1, C.ink);
    R(x, top, w, h, "#e9dfc6"); R(x, top, 1, h, "#f6efdc"); R(x + w - 1, top, 1, h, "#c3b594");
    R(x - 2, top - 3, w + 4, 3, C.ink); R(x - 1, top - 2, w + 2, 1, "#f6efdc");
    R(x + 3, top + 3, w - 6, 6, C.ink);
    for (let y = top + 4; y < top + 9; y += 2) R(x + 4, y, w - 8, 1, "#9aa294");
    px(x + w - 3, top + 1, dark ? "!#9cf0cb" : "#6b7468");
    const mx = x + (w >> 1), mt = top - 23;
    R(mx, mt, 1, 20, "#8d968a");
    R(mx - 7, mt + 3, 12, 1, "#6b7468");
    for (let i = 0; i < 6; i++) { const hh = 5 - (i >> 1); R(mx - 6 + i * 2, mt + 3 - (hh >> 1), 1, hh, "#8d968a"); }
    for (let i = 1; i < 14; i++) px(mx + 1 + Math.floor(i / 2), mt + 6 + i, i % 3 ? "#5e645d" : "#8d968a");
  }

  // Everything that stands behind the parapet, baked before it is painted.
  function roofBack(R, px, g, L, bk) {
    const plan = roofPlan(L), P0 = plan.P0, dark = bk === "night" || bk === "dusk";
    if (plan.toren != null) toren(R, px, plan.toren, P0);
    if (plan.stair != null) stairHouse(R, px, plan.stair, P0, dark);
    if (plan.solar != null) solar(R, px, plan.solar, P0);
    if (plan.line != null) lineBake(R, px, plan.line, plan.lineW, P0);
    if (plan.ac != null) acUnits(R, px, plan.ac, P0);
    dishOn(R, px, plan.dish, P0);
    if (L.shaft) machineRoom(R, px, L.shaft, P0, dark);
    else { const [mx, mt] = plan.mast; R(mx, mt, 1, 25, "#8d968a"); R(mx - 3, mt + 4, 7, 1, "#8d968a"); }
  }

  // Potted plants lined up on the coping: snake plant, a round shrub and a
  // bougainvillea in flower.
  function roofLedge(R, px, g, L, bk) {
    const plan = roofPlan(L), y = plan.P0 - 1;
    const pot = (x, w) => {
      R(x - 1, y - 4, w + 2, 5, C.ink);
      R(x, y - 3, w, 3, "#b0654a"); R(x, y - 3, w, 1, "#d98a6a"); R(x + w - 1, y - 2, 1, 2, "#8a4a36");
    };
    const x = plan.pots;
    pot(x, 5);
    for (let i = 0; i < 4; i++) R(x + i + (i > 1 ? 1 : 0), y - 5 - (i % 2 ? 6 : 4), 1, i % 2 ? 6 : 4, i % 2 ? "#37692d" : "#6aa84f");
    px(x + 1, y - 10, "#d6c85a"); px(x + 4, y - 9, "#d6c85a");
    const blob = (cx, top, rows, pal) => rows.forEach((w, i) => {
      const x0 = cx - (w >> 1);
      R(x0 - 1, top + i, w + 2, 1, C.ink);
      R(x0, top + i, w, 1, pal[1]);
      if (i < 2) R(x0, top + i, Math.max(1, w >> 1), 1, pal[0]); else R(x0 + w - 2, top + i, 2, 1, pal[2]);
    });
    pot(x + 8, 6);
    blob(x + 11, y - 11, [4, 6, 8, 8, 6], [C.leaf, C.leaf2, C.leaf3]);
    R(x + 8, y - 12, 6, 1, C.ink);
    pot(x + 17, 5);
    blob(x + 19, y - 10, [3, 5, 7, 5], [C.leaf2, C.leaf3, C.leaf4]);
    R(x + 18, y - 11, 4, 1, C.ink);
    for (const [dx, dy] of [[-2, 1], [0, 0], [2, 2], [1, 3], [-1, 3]]) px(x + 19 + dx, y - 10 + dy, dy % 2 ? "#f28bbd" : "#d9468f");
  }

  // ---- roof, per frame ---------------------------------------------------------
  const WASH = [
    { u: 0.12, kind: 0, col: C.sky, sh: "#7fc3d6" },
    { u: 0.31, kind: 1, col: "#b8432f", sh: "#2c3e57" },
    { u: 0.5, kind: 2, col: C.sun, sh: "#e0b43a" },
    { u: 0.69, kind: 3, col: C.denim, sh: "#1f2c40" },
    { u: 0.88, kind: 0, col: C.white, sh: "#c9ccc2" },
  ];

  // One piece of washing pegged at (x, y): shirt, sarong, towel or trousers.
  // The lower half swings a pixel with the wind.
  function cloth(R, x, y, c, sway, T) {
    const col = T(c.col), sh = T(c.sh), s = sway;
    R(x + 1, y - 1, 1, 1, "#e8743a");
    if (c.kind === 0) {
      R(x - 1, y, 7, 2, col); R(x, y + 2, 5, 2, col); R(x + s, y + 4, 5, 2, col); R(x + 4, y + 2, 1, 2, sh); R(x + 4 + s, y + 4, 1, 2, sh);
    } else if (c.kind === 1) {
      R(x, y, 4, 4, col); R(x + s, y + 4, 4, 4, col);
      for (let k = 0; k < 8; k += 2) R(x + (k > 3 ? s : 0), y + k, 4, 1, sh);
      R(x + 1, y, 1, 4, sh); R(x + 1 + s, y + 4, 1, 4, sh);
    } else if (c.kind === 2) {
      R(x, y, 4, 3, col); R(x + s, y + 3, 4, 3, col); R(x, y + 1, 4, 1, sh); R(x + s, y + 4, 4, 1, sh);
    } else {
      R(x, y, 5, 2, col); R(x, y + 2, 2, 2, col); R(x + 3, y + 2, 2, 2, col);
      R(x + s, y + 4, 2, 3, col); R(x + 3 + s, y + 4, 2, 3, col); R(x + 1, y, 1, 2, sh);
    }
  }

  function roofLive(g, p, L, bk, t) {
    const plan = roofPlan(L), P0 = plan.P0, T = toner(bk);
    if (plan.line != null) {
      const top = P0 - 17, w = plan.lineW;
      WASH.forEach((c, i) => {
        const at = Math.round(c.u * (w - 1));
        const sway = Math.floor(t * 2 + i * 0.6) % 3 === 0 ? 1 : 0;
        cloth(p.R, plan.line + at - 2, top + 2 + sag(at, w), c, sway, T);
      });
    }
    const [mx, mt] = plan.mast;
    p.R(mx - 1, mt - 2, 3, 2, Math.floor(t * 1.5) % 2 ? "#ff4a3a" : T("#5a2a22"));
    const A = artFor(bk), peck = Math.floor(t * 1.6) % 3 === 0 ? 1 : 0;
    g.drawImage(A.cat[t % 6 < 0.5 ? 1 : 0], plan.cat, P0 - 6);
    g.drawImage(A.pigeon[0], plan.birds, P0 - 5); g.drawImage(A.pigeonL[peck], plan.birds + 7, P0 - 5);
    g.drawImage(A.pigeon[1 - peck], plan.birds + 15, P0 - 5);
  }

  // ---- the street -------------------------------------------------------------------
  // Rows below groundY: sidewalk, the painted kerb, the road with the far lane
  // (heading right) and the near lane (heading left, as Jakarta drives on the
  // left), then the near kerb at the bottom edge. Everything on the walk
  // stands below the building's base line (groundY + walk), so no street
  // prop ever reaches into a room or the slab under the ground floor.
  const ST = { walk: 2, kerb: 26, road: 31, far: 39, mid: 41, near: 50, edge: 52 };
  const TILE = ["#e2ddce", "#cfc9b9", "#c3bdac", "#aaa392"];
  const ASPH = ["#4b5157", "#3f444a", "#373b40", "#2e3236"];

  // Where the street furniture stands, keyed to the ground-floor rooms: the
  // cart and the ojek base in front of rooms, lamps at the pillars and the
  // lift wherever the walk is free, the pole just past the building's edge.
  function streetPlan(L) {
    if (STREETS.has(L)) return STREETS.get(L);
    const low = L.floors[L.floors.length - 1], row = low.rows[low.rows.length - 1];
    const mid = (r) => r.x + (r.w >> 1);
    const cartRoom = row[Math.min(1, row.length - 2)] || row[0], standRoom = row[Math.min(2, row.length - 1)];
    const plan = { cart: mid(cartRoom) - 12, stand: mid(standRoom) - 28, pole: L.bx0 + L.bW + 2, tree: 16 };
    const busy = [[0, 40], [plan.cart - 16, plan.cart + 34], [plan.stand - 3, plan.stand + 57], [plan.pole - 5, L.artW]];
    const spots = row.slice(1).map((r) => r.x - 2).concat(L.shaft ? [L.shaft.x + (L.shaft.w >> 1)] : []);
    plan.lamps = spots.filter((x) => busy.every(([a, b]) => x + 3 < a || x - 3 > b));
    STREETS.set(L, plan);
    return plan;
  }

  function kerb(R, W, y, rows) {
    R(0, y, W, 1, "#e3e5dc");
    for (let x = 0; x < W; x += 6) {
      const white = (x / 6) % 2 === 0;
      R(x, y + 1, 6, rows, white ? "#f3f1e6" : "#26302c");
      if (rows > 1) R(x, y + rows, 6, 1, white ? "#c9ccc2" : "#1b2220");
    }
  }

  function sidewalk(R, px, L) {
    const y0 = L.groundY + ST.walk, W = L.artW;
    R(0, L.groundY, W, 2, TILE[3]);
    for (let c = 0; c < 4; c++) {
      const y = y0 + c * 6, off = c % 2 ? 6 : 0;
      for (let x = -off; x < W; x += 12) {
        const n = ((x + off) / 12) | 0, hs = (s) => hash(n, c, s);
        R(x, y, 12, 6, hs(61) < 0.3 ? TILE[2] : TILE[1]);
        R(x, y, 11, 1, TILE[0]); R(x + 11, y, 1, 6, TILE[3]); R(x, y + 5, 12, 1, TILE[3]);
        if (hs(62) < 0.14) for (let k = 0; k < 4; k++) px(x + 3 + k + (k >> 1), y + 1 + k, "#a39d8c");
        if (hs(63) < 0.12) { R(x + 5, y + 2, 3, 2, "#bdb6a4"); px(x + 6, y + 3, "#b3ad9a"); }
      }
    }
    // The yellow guide strip for the blind, worn away in places.
    const gy = y0 + 13;
    for (let x = 0; x < W; x += 6) {
      if (hash(x, 9, 64) < 0.08) continue;
      R(x, gy, 5, 3, "#d9bd62"); R(x, gy, 5, 1, "#ecd68a");
      R(x + 1, gy + 1, 3, 1, "#b89a3e"); R(x + 5, gy, 1, 3, TILE[3]);
    }
  }

  function road(R, px, L) {
    const G = L.groundY, y0 = G + ST.road, h = ST.edge - ST.road, W = L.artW;
    R(0, y0 - 1, W, 1, "#2b2f33");
    R(0, y0, W, h, ASPH[1]);
    for (let i = 0; i < W; i++) {
      const x = Math.floor(hash(i, 1, 71) * W), y = y0 + Math.floor(hash(i, 2, 71) * h), k = hash(i, 3, 71);
      R(x, y, k > 0.85 ? 2 : 1, 1, k > 0.5 ? ASPH[0] : ASPH[2]);
    }
    for (const ty of [G + ST.far - 1, G + ST.near - 1]) {
      for (let x = 0; x < W; x++) if (hash(x, ty, 72) < 0.45) px(x, ty, ASPH[2]);
    }
    // Patched repairs and a manhole, as on any Jakarta road.
    for (const [fx, fy, pw, ph] of [[0.18, 3, 16, 4], [0.63, 13, 11, 3]]) {
      const x = Math.round(W * fx);
      R(x - 1, y0 + fy - 1, pw + 2, ph + 2, ASPH[0]); R(x, y0 + fy, pw, ph, ASPH[3]);
    }
    const mx = Math.round(W * 0.44), my = G + ST.near - 6;
    R(mx - 4, my, 9, 3, "#2b2f33"); R(mx - 3, my, 7, 3, "#565c63"); R(mx - 2, my + 1, 5, 1, "#6b7178");
    px(mx, my + 1, "#2b2f33");
    for (let x = -4; x < W; x += 22) { R(x, G + ST.mid, 12, 1, "#e3e5dc"); R(x, G + ST.mid + 1, 12, 1, "#aeb4aa"); }
    const gx = Math.round(W * 0.84);
    R(gx, G + ST.kerb + 1, 9, 3, "#15181c");
    for (let x = gx + 1; x < gx + 9; x += 2) R(x, G + ST.kerb + 1, 1, 3, "#5e645d");
  }

  // Ground surfaces for the building layer; furniture goes in `front`.
  function street(R, px, g, L, bk) {
    const G = L.groundY, W = L.artW;
    sidewalk(R, px, L);
    kerb(R, W, G + ST.kerb, 3);
    road(R, px, L);
    kerb(R, W, G + ST.edge, 1);
    R(L.bx0 - 2, G, L.bW + 4, 1, "#9a917f"); R(L.bx0 - 2, G + 1, L.bW + 4, 1, "#6b6456");
    if (bk === "night" || bk === "dusk") {
      const sp = streetPlan(L);
      for (const x of sp.lamps) glow(R, x, G + 18, 18, 6, "!rgba(255,214,140,0.24)");
      glow(R, sp.cart + 8, G + 22, 16, 3, "!rgba(255,214,140,0.2)");
    }
  }

  // ---- street furniture (the front layer) --------------------------------------------
  const POST = ["#58665f", "#3d4a45", "#28312d"];
  // A pedestrian lamp at the kerb edge of the walk: a lantern on a slim post,
  // short enough to stay below the building's base line.
  function lamp(R, px, x, G, dark) {
    const base = G + ST.kerb - 1, top = G + ST.walk + 2;
    R(x - 2, base - 1, 5, 2, C.ink); R(x - 1, base - 1, 3, 1, POST[0]);
    R(x - 1, top + 5, 3, base - top - 6, C.ink); R(x, top + 5, 1, base - top - 6, POST[1]);
    R(x - 2, top - 1, 5, 7, C.ink); px(x, top - 2, C.ink);
    R(x - 1, top, 3, 1, POST[1]); R(x - 1, top + 4, 3, 1, POST[2]);
    R(x - 1, top + 1, 3, 3, dark ? "!#fff2c0" : "#cfe3ea"); px(x - 1, top + 1, dark ? "!#ffffff" : "#f3f1e6");
    if (dark) glow(R, x, top + 2, 6, 4, "!rgba(255,232,170,0.32)");
  }

  // A concrete power pole past the building's edge, its transformer and the
  // usual tangle of cables reaching over the lift shaft, never over a room.
  function powerPole(R, px, L, x, dark) {
    const G = L.groundY, top = G - 64, h = G + ST.kerb - top;
    R(x, top, 3, h, "#9a9c93"); R(x, top, 1, h, "#c9cbc2"); R(x + 2, top, 1, h, "#76786f");
    R(x + 2, top + 2, 4, 2, "#6b7468"); R(x + 2, top + 2, 4, 1, "#8d968a");
    const wire = (x1, y1, x2, y2, s, col) => {
      let prev = null;
      for (let xx = Math.min(x1, x2); xx <= Math.max(x1, x2); xx++) {
        const u = (xx - x1) / (x2 - x1 || 1), y = Math.round(y1 + (y2 - y1) * u + 4 * s * u * (1 - u));
        if (prev != null && Math.abs(y - prev) > 1) R(xx, Math.min(y, prev) + 1, 1, Math.abs(y - prev) - 1, col);
        R(xx, y, 1, 1, col); prev = y;
      }
    };
    wire(x + 2, top + 2, L.artW, top + 5, 1, "#1f2427");
    if (!L.shaft) return;
    R(x - 9, top + 2, 12, 2, "#6b7468"); R(x - 9, top + 2, 12, 1, "#8d968a");
    for (const ix of [x - 8, x - 4]) R(ix, top, 1, 2, "#e6e8e0");
    R(x - 8, top + 12, 7, 10, C.ink); R(x - 7, top + 13, 5, 8, "#a3ab9f"); R(x - 7, top + 13, 1, 8, "#c9d0c4");
    for (let k = 0; k < 3; k++) R(x - 5 + k * 2, top + 14, 1, 6, "#7d857a");
    R(x - 6, top + 11, 1, 1, "#e6e8e0"); R(x - 4, top + 11, 1, 1, "#e6e8e0"); R(x - 1, top + 16, 1, 2, "#5e645d");
    // The cables tie off on the pillar between the last room and the shaft.
    const anchor = L.shaft.x - 2;
    wire(x - 8, top + 2, anchor, top - 4, 5, "#1f2427");
    wire(x - 5, top + 2, anchor, top + 3, 7, "#2a3034");
    wire(x - 2, top + 3, anchor, top + 9, 4, "#1f2427");
    wire(x, top + 6, anchor, top + 16, 9, "#2a3034");
    R(x - 3, top + 28, 5, 1, "#1f2427"); R(x - 3, top + 32, 5, 1, "#1f2427");
    R(x - 4, top + 29, 1, 3, "#1f2427"); R(x + 1, top + 29, 1, 3, "#1f2427");
    R(x - 1, top + 4, 1, 40, "#2a3034");
    R(x - 7, G - 26, 5, 6, C.ink); R(x - 6, G - 25, 3, 4, "#b7bfb2"); px(x - 5, G - 24, dark ? "!#9cf0cb" : "#3a3f44");
  }

  // A bakso cart: a glass case under a striped awning, the pot open at the
  // end so its steam can rise, a wooden cabinet on one big wheel. It stands
  // at the kerb edge of the walk with the seller by the pot.
  function gerobak(R, px, g, A, x, G, dark, stool) {
    const y = G + ST.kerb - 1;
    R(x - 6, y - 9, 7, 1, "#6d4527"); R(x - 7, y - 10, 2, 1, "#6d4527");
    R(x + 1, y - 4, 1, 4, "#6d4527"); R(x, y, 3, 1, "#4a3020");
    R(x - 1, y - 11, 24, 7, C.ink);
    R(x, y - 10, 22, 5, "#9a6a3d"); R(x, y - 10, 22, 1, "#f3f1e6"); R(x, y - 6, 22, 1, "#6d4527");
    R(x, y - 9, 1, 3, "#c08a55"); R(x + 7, y - 9, 1, 3, "#6d4527"); R(x + 14, y - 9, 1, 3, "#6d4527");
    R(x - 1, y - 17, 15, 7, C.ink);
    R(x, y - 16, 13, 5, "#bfe6ef"); R(x, y - 16, 13, 1, "#e6f5f8");
    for (let k = 0; k < 4; k++) { R(x + 1 + k * 3, y - 12, 2, 1, "#f3f1e6"); px(x + 1 + k * 3, y - 13, "#ffe375"); }
    px(x + 3, y - 14, "#9a6a3d"); px(x + 6, y - 14, "#9a6a3d"); px(x + 9, y - 14, "#9a6a3d"); R(x + 11, y - 15, 1, 3, "#d9543f");
    px(x + 1, y - 15, "#ffffff"); px(x + 2, y - 14, "#ffffff");
    R(x + 14, y - 17, 9, 7, C.ink);
    R(x + 15, y - 16, 7, 5, "#b7bfb2"); R(x + 15, y - 16, 2, 5, "#e6e8e0"); R(x + 20, y - 16, 2, 5, "#8d968a");
    R(x + 15, y - 18, 7, 1, C.ink); R(x + 16, y - 17, 5, 1, "#d8dccd"); px(x + 18, y - 19, C.ink);
    // The striped awning over the case, a scalloped valance, kerupuk hanging.
    R(x - 3, y - 22, 19, 4, C.ink);
    for (let i = 0; i < 17; i++) {
      const red = Math.floor(i / 3) % 2 === 0;
      px(x - 2 + i, y - 21, red ? "#f08a6a" : "#fffbe8"); px(x - 2 + i, y - 20, red ? "#d9543f" : "#e3e5dc");
      if (i % 2 === 0) px(x - 2 + i, y - 18, red ? "#b8432f" : "#c9ccc2");
    }
    px(x - 2, y - 18, "#3a3f44"); R(x - 3, y - 17, 2, 3, "#f2c84b"); px(x - 3, y - 17, "#fff2a8");
    if (stool) {
      R(x - 14, y - 5, 7, 3, C.ink); R(x - 13, y - 4, 5, 1, "#6fb0e8"); R(x - 13, y - 3, 5, 1, "#3f7fc0");
      R(x - 13, y - 2, 1, 3, "#2f5f94"); R(x - 9, y - 2, 1, 3, "#2f5f94"); R(x - 12, y - 1, 3, 1, "#2f5f94");
    }
    const wx = x + 12, wy = y - 6;
    R(wx + 1, wy, 5, 7, C.ink); R(wx, wy + 1, 7, 5, C.ink);
    R(wx + 1, wy + 1, 5, 5, "#6b7468"); R(wx + 2, wy + 2, 3, 3, "#23282c"); px(wx + 3, wy + 3, "#d8dccd");
    px(wx + 3, wy + 1, "#b7bfb2"); px(wx + 1, wy + 3, "#b7bfb2"); px(wx + 5, wy + 3, "#b7bfb2"); px(wx + 3, wy + 5, "#b7bfb2");
    if (dark) { R(x + 6, y - 18, 2, 1, "!#fff2c0"); glow(R, x + 7, y - 14, 9, 5, "!rgba(255,214,140,0.28)"); }
    g.drawImage(A.seller, x + 24, y - 17);
  }

  // The ojek base: two drivers sitting on their bikes, one on his phone.
  function pangkalan(R, px, g, A, x, G, dark) {
    const y = G + ST.kerb - 1;
    g.drawImage(A.ojekR[0], x, y - 19);
    g.drawImage(A.waiter, x + 23, y - 18);
    g.drawImage(A.ojekL[0], x + 33, y - 19);
    if (dark) px(x + 30, y - 11, "!#dff4ff");
  }

  function front(L, bk) {
    const top = L.groundY - 72, sp = streetPlan(L), A = artFor(bk), dark = bk === "night" || bk === "dusk";
    const img = paint(L.artW, L.artH - top, (R0, px0, g) => {
      g.translate(0, -top);
      const { R, px } = toned(R0, bk);
      powerPole(R, px, L, sp.pole, dark);
      gerobak(R, px, g, A, sp.cart, L.groundY, dark, sp.cart - 14 > sp.tree + 24);
      pangkalan(R, px, g, A, sp.stand, L.groundY, dark);
      for (const x of sp.lamps) lamp(R, px, x, L.groundY, dark);
    });
    return { img, x: 0, y: top };
  }

  // A ketapang kencana on the near kerb: flat tiers of small leaves on level
  // branches, lit on top and dark beneath. Traffic passes behind it; the
  // trunk wears the white and black bands of city trees.
  const LEAF = ["#b5dd72", "#7fbf55", "#4f913f", "#2f6a33", "#1d4a26"];
  const BARK = ["#9a7a55", "#6d4f36", "#4a3524"];
  function tier(px, cx, y, half, th, seed) {
    for (let x = -half; x <= half; x++) {
      const k = Math.sqrt(Math.max(0, 1 - (x * x) / ((half + 0.6) * (half + 0.6))));
      const up = Math.round(th * 0.4 * k) + (hash(x, y, seed) < 0.3 ? 1 : 0), dn = Math.round(th * 0.6 * k);
      for (let yy = -up; yy <= dn; yy++) {
        let i = yy === -up ? (x < half / 3 ? 0 : 1) : yy <= 0 ? 1 : yy < dn ? 2 : 3;
        if (i && hash(x + cx, y + yy, seed + 1) < 0.2) i = Math.min(4, i + 1);
        px(cx + x, y + yy, LEAF[i]);
      }
      if (hash(x, y, seed + 2) < 0.28) px(cx + x, y + dn + 1, LEAF[4]);
    }
  }

  function fore(L, bk) {
    const G = L.groundY, h = L.artH - G - 3, cx = 23;
    const art = paint(46, h, (R, px) => {
      R(cx - 1, 2, 3, h - 2, BARK[1]); R(cx - 1, 2, 1, h - 2, BARK[0]); R(cx + 1, 2, 1, h - 2, BARK[2]);
      R(cx - 1, h - 10, 3, 3, "#f3f1e6"); R(cx - 1, h - 7, 3, 2, "#26302c"); R(cx - 1, h - 5, 3, 3, "#f3f1e6");
      [[3, 9, 3], [10, 16, 4], [17, 20, 4], [25, 19, 5]].forEach(([y, half, th], i) => {
        const bw = Math.round(half * 0.8), by = y + Math.round(th * 0.6) + 1;
        R(cx - bw, by, bw * 2 + 1, 1, BARK[2]); px(cx - bw - 1, by - 1, BARK[2]); px(cx + bw + 1, by - 1, BARK[2]);
        tier(px, cx, y, half, th, 90 + i * 7);
      });
    }, C.ink);
    return { img: tinted(art, bk), x: streetPlan(L).tree - cx, y: G + 3 };
  }

  // ---- street, per frame -------------------------------------------------------
  // Each vehicle crosses on its own period, so the street changes all minute
  // long and a paused frame stays exactly where it stopped.
  const FLEET = [
    { k: "angkot", l: "angkot", lane: 0, dir: 1, v: 20, per: 34, ph: 0 },
    { k: "angkot2", l: "angkot", lane: 0, dir: 1, v: 20, per: 34, ph: 17 },
    { k: "ojekR", l: "ojek", lane: 0, dir: 1, v: 31, per: 23, ph: 22.7, dy: 1 },
    { k: "bajaj", l: "bajaj", lane: 1, dir: -1, v: 16, per: 40, ph: 36.3, bob: true },
    { k: "ojekL", l: "ojek", lane: 1, dir: -1, v: 34, per: 19, ph: 16.2, dy: 1 },
  ];
  const STEAM = ["rgba(255,255,255,0.75)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.45)", "rgba(255,255,255,0.3)"];

  function vehicle(g, p, L, A, f, t, dark) {
    const [s0] = A[f.k], w = s0.width, span = L.artW + w + 8;
    const d = ((t + f.ph) % f.per) * f.v;
    if (d > span) return;
    const x = f.dir > 0 ? Math.round(d - w - 4) : Math.round(L.artW + 4 - d);
    const base = L.groundY + (f.lane ? ST.near : ST.far) + (f.dy || 0);
    const bob = f.bob && Math.floor(t * 6) % 3 === 0 ? 1 : 0;
    const y = base - s0.height + 2 - bob;
    g.drawImage(A[f.k][Math.floor(Math.abs(x) / 3) % 2], x, y);
    if (f.bob) for (let k = 0; k < 2; k++) {
      const q = Math.floor(t * 6 + k * 2) % 4;
      p.R(x + w + 1 + k * 3 + q, base - 5 - q, 2 - (q >> 1), 1, STEAM[Math.min(3, q + 1)]);
    }
    if (!dark) return;
    const at = (lx) => (f.dir > 0 ? x + lx : x + w - 1 - lx);
    const { head, tail } = LIGHTS[f.l];
    p.R(at(head[0]), y + head[1], 1, head[2], "#fff2c0");
    p.R(at(tail[0]), y + tail[1], 1, tail[2], "#ff4a3a");
    const by = y + head[1] - 1;
    if (f.dir > 0) g.drawImage(A.beam, at(head[0]) + 1, by); else g.drawImage(A.beamL, at(head[0]) - 24, by);
  }

  function streetLive(g, p, L, bk, t, layer) {
    const sp = streetPlan(L), G = L.groundY, A = artFor(bk), dark = bk === "night" || bk === "dusk";
    if (layer.front) g.drawImage(layer.front.img, layer.front.x, layer.front.y);
    // Steam off the pot, three puffs rising and thinning, and the seller's
    // ladle; the puffs stop short of the building's base line.
    const potX = sp.cart + 18, potY = G + ST.kerb - 21;
    for (let i = 0; i < 3; i++) {
      const step = Math.floor(((t * 0.9 + i / 3) % 1) * 4);
      p.R(potX + (i - 1) * 2 + ((step + i) % 2), potY - step, step < 2 ? 2 : 1, 1, STEAM[step]);
    }
    const dip = Math.floor(t * 2.5) % 2;
    p.R(sp.cart + 21, potY + 1 + dip, 2, 1, toner(bk)("#8d968a")); p.R(sp.cart + 22, potY + 2 + dip, 1, 2 - dip, toner(bk)("#b7bfb2"));
    for (const f of FLEET) if (f.lane === 0) vehicle(g, p, L, A, f, t, dark);
    for (const f of FLEET) if (f.lane === 1) vehicle(g, p, L, A, f, t, dark);
    if (layer.fore) g.drawImage(layer.fore.img, layer.fore.x, layer.fore.y);
  }

  P.hqCity = { toned, toner, tintWith, roofPlan, roofBack, roofLedge, roofLive, street, front, fore, streetLive };
})((window.PETA = window.PETA || {}));
