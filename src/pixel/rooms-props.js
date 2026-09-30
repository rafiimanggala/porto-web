// Agent HQ room art, part two: what gives each floor its identity (wall,
// ceiling feature, lamp, floor, small decor, fillers for wide rooms) as
// P.roomArt, and the second half of the room props. rooms.js bakes both into
// the shells and draws their moving parts each frame.
(function (P) {
  "use strict";
  const { PAL: C, hash } = P;
  const B = P.bots, A = B.art, rnd = B.rnd;

  // Wall ramps per floor, dark to light: deep, lo, base (data.js wall), hi
  // (data.js wall2), top. Shadows lean blue or purple, highlights yellow.
  const WALLS = {
    trading: ["#0f1729", "#172641", "#1f3350", "#2a4466", "#3e5a7a"],
    studio: ["#211428", "#33203a", "#4a2f45", "#5d3b56", "#7a566a"],
    mail: ["#3a2a22", "#54402e", "#6b5436", "#806645", "#a08658"],
    client: ["#14262a", "#223c3d", "#2f4f4a", "#3c625b", "#5a826f"],
    control: ["#0b1b19", "#132c26", "#1c3a2f", "#2c5645", "#437559"],
  };
  const BULB = "#fff4c8", BULB_OFF = "#6b6f68";
  const CABLES = ["#2b6f8f", "#c94e12", "#e0b43a", "#152012", "#6aa84f"];

  // ---- walls ------------------------------------------------------------------
  // The band under the door plate (the top 14 rows) stays low in contrast so
  // the plate reads; texture starts below it.
  function ceilingShade(q, r, W) { q.R(r.x, r.y, r.w, 1, W[0]); q.R(r.x, r.y + 1, r.w, 1, W[1]); }
  function baseboard(q, r, hi, lo) { q.R(r.x, r.fy - 3, r.w, 1, hi); q.R(r.x, r.fy - 2, r.w, 2, lo); }

  // Trading: fabric panels with a lit lip on each seam, a panelled wainscot.
  function wallTrading(q, r, W) {
    const { R } = q, rail = r.fy - 12;
    R(r.x, r.y, r.w, r.fy - r.y, W[2]);
    for (let x = r.x + 7; x < r.x + r.w - 1; x += 12) { R(x, r.y + 2, 1, rail - r.y - 2, W[1]); R(x + 1, r.y + 14, 1, rail - r.y - 14, W[3]); }
    A.speckle(q, r.x, r.y + 20, r.w, rail - r.y - 20, 0.03, [W[1], W[3]], 3);
    R(r.x, rail, r.w, r.fy - 3 - rail, W[1]); R(r.x, rail, r.w, 1, W[4]); R(r.x, rail + 1, r.w, 1, W[0]);
    for (let x = r.x + 2; x + 12 <= r.x + r.w; x += 15) A.box(q, x, rail + 3, 12, 5, W[3], W[1], W[0]);
    ceilingShade(q, r, W); baseboard(q, r, W[4], "#0d1424");
  }
  // Studio: plaster above, acoustic slats below a capped rail.
  function wallStudio(q, r, W) {
    const { R } = q, rail = r.fy - 15;
    R(r.x, r.y, r.w, r.fy - r.y, W[2]);
    A.speckle(q, r.x, r.y + 15, r.w, rail - r.y - 15, 0.045, [W[1], W[3]], 5);
    R(r.x, rail, r.w, 1, W[4]); R(r.x, rail + 1, r.w, 1, W[0]);
    for (let x = r.x; x < r.x + r.w; x += 3) {
      const h = r.fy - rail - 5;
      R(x, rail + 2, 1, h, W[3]); R(x + 1, rail + 2, 1, h, W[2]); R(x + 2, rail + 2, 1, h, W[1]); R(x, rail + 2, 2, 1, W[4]);
    }
    ceilingShade(q, r, W); baseboard(q, r, W[1], "#150c19");
  }
  // Mail: warm tongue-and-groove boards with grain, a chair rail and a darker
  // panelled wainscot.
  function wallMail(q, r, W) {
    const { R } = q, rail = r.fy - 13;
    R(r.x, r.y, r.w, r.fy - r.y, W[2]);
    for (let x = r.x + 1; x < r.x + r.w; x += 5) {
      R(x, r.y + 2, 1, rail - r.y - 2, W[1]);
      for (let k = 0; k < 3; k++) {
        const gy = r.y + 15 + Math.floor(hash(x, k, 31) * (rail - r.y - 19)), gx = x + 1 + Math.floor(hash(x, k, 32) * 3);
        R(gx, gy, 1, 2 + Math.floor(hash(x, k, 33) * 3), k === 2 ? W[3] : W[1]);
      }
    }
    R(r.x, rail, r.w, 1, W[4]); R(r.x, rail + 1, r.w, 1, W[0]);
    R(r.x, rail + 2, r.w, r.fy - rail - 5, "#4e3a2a");
    for (let x = r.x + 2; x + 11 <= r.x + r.w; x += 14) A.box(q, x, rail + 3, 11, 6, W[1], "#4e3a2a", W[0]);
    ceilingShade(q, r, W); baseboard(q, r, W[4], "#2e2018");
  }
  // Client: teal plaster and a warm oak slat wainscot.
  function wallClient(q, r, W) {
    const { R } = q, rail = r.fy - 12;
    R(r.x, r.y, r.w, r.fy - r.y, W[2]);
    A.speckle(q, r.x, r.y + 15, r.w, rail - r.y - 15, 0.05, [W[1], W[3], W[1]], 7);
    R(r.x, rail, r.w, r.fy - 3 - rail, "#9c7f55");
    for (let y = rail + 2; y < r.fy - 3; y += 2) R(r.x, y, r.w, 1, "#86683f");
    R(r.x, rail, r.w, 1, C.wood1); R(r.x, rail - 1, r.w, 1, W[0]);
    ceilingShade(q, r, W); baseboard(q, r, C.white2, C.grey2);
  }
  // Control: riveted metal panels, a darker kick panel.
  function wallControl(q, r, W) {
    const { R, px } = q, mid = r.y + 26, kick = r.fy - 11;
    R(r.x, r.y, r.w, r.fy - r.y, W[2]);
    A.speckle(q, r.x, r.y + 16, r.w, kick - r.y - 16, 0.02, [W[1], W[3]], 9);
    for (let x = r.x + 4; x < r.x + r.w; x += 16) {
      R(x, r.y + 2, 1, kick - r.y - 2, W[0]); R(x + 1, r.y + 16, 1, kick - r.y - 16, W[3]);
      for (const y of [r.y + 18, mid + 3, kick - 3]) { px(x - 2, y, W[4]); px(x + 3, y, W[4]); }
    }
    R(r.x, mid, r.w, 1, W[0]); R(r.x, mid + 1, r.w, 1, W[3]);
    R(r.x, kick, r.w, r.fy - 3 - kick, W[1]); R(r.x, kick, r.w, 1, W[4]);
    ceilingShade(q, r, W); baseboard(q, r, C.grey3, "#0a1412");
  }

  // ---- ceiling features ---------------------------------------------------------
  const tickerEnd = (r) => (r.win ? r.x + r.w - 24 : r.x + r.w);
  // Trading: the housing of an LED ticker; its text scrolls in live().
  function ceilTicker(q, r, W) {
    const { R } = q, end = tickerEnd(r), y = r.y + 15;
    R(r.x, y, end - r.x, 5, "#080c16"); R(r.x, y, end - r.x, 1, "#33425c"); R(r.x, y + 4, end - r.x, 1, "#04060b");
    for (let x = r.x + 6; x < end - 2; x += 30) R(x, r.y + 12, 1, 3, W[0]);
  }
  // Mail: a pneumatic tube, brass couplings every 24 px; a capsule shoots
  // through it now and then (live()).
  function ceilTube(q, r) {
    const { R } = q, y = r.y + 13;
    R(r.x, y, r.w, 3, "#7e9aa0"); R(r.x, y, r.w, 1, "#d8eef4"); R(r.x, y + 2, r.w, 1, "#46606a");
    for (let x = r.x + 5; x < r.x + r.w - 2; x += 24) { R(x, y - 1, 3, 5, C.sun2); R(x, y - 1, 3, 1, C.sun); R(x + 2, y, 1, 4, "#a87a22"); }
  }
  // Control: a cable tray on hangers, a few cables sagging over its lip.
  const TRAY = ["#1f4f66", "#7a3a16", "#8a7030", "#101a14", "#3f6a35"];
  function ceilTray(q, r) {
    const { R } = q, y = r.y + 13;
    for (let x = r.x + 8; x < r.x + r.w; x += 30) R(x, r.y + 1, 1, 12, "#24302c");
    R(r.x, y, r.w, 3, "#3b4441"); R(r.x, y, r.w, 1, C.grey2); R(r.x, y + 2, r.w, 1, "#1f2624");
    for (let x = r.x + 3; x < r.x + r.w - 9;) {
      const c = TRAY[Math.floor(hash(x, 1, 51) * TRAY.length)], w = 4 + Math.floor(hash(x, 3, 51) * 5), d = 1 + Math.floor(hash(x, 2, 51) * 3);
      let py = y + 2;
      for (let i = 0; i <= w; i++) {
        const yy = y + 2 + Math.round(d * (1 - ((2 * i) / w - 1) ** 2));
        A.line(q, x + i, Math.min(py, yy), x + i, Math.max(py, yy), c); py = yy;
      }
      x += w + 6 + Math.floor(hash(x, 4, 51) * 10);
    }
  }
  // Studio: a lighting grid pipe on clamps; the softbox hangs from it.
  function ceilGrid(q, r) {
    const { R, px } = q, y = r.y + 13;
    R(r.x, y, r.w, 3, "#5d5763"); R(r.x, y, r.w, 1, "#8f8698"); R(r.x, y + 2, r.w, 1, "#1c1621");
    for (let x = r.x + 9; x < r.x + r.w - 3; x += 23) { R(x, y, 2, 3, "#29222d"); px(x, y, "#4a4250"); }
  }

  // ---- lamps --------------------------------------------------------------------
  // Each hangs over the desk from the ceiling at y and returns the row its
  // light starts from.
  function lampBar(q, x, y, lit) {
    const { R } = q;
    R(x, y + 1, 1, 19, "#0b1120");
    R(x - 4, y + 20, 9, 2, "#2b3036"); R(x - 4, y + 20, 9, 1, "#4a535b");
    R(x - 3, y + 22, 7, 1, lit ? BULB : BULB_OFF);
    return y + 23;
  }
  // The softbox: a clamp on the grid pipe, a short rod, a body that widens
  // to its diffuser, lit on its left flank.
  function lampSoftbox(q, x, y, lit) {
    const { R, px } = q, SB = ["#141016", "#1d1820", "#241e28", "#29222d", "#2f2734"];
    R(x - 1, y + 13, 3, 3, "#141016"); px(x - 1, y + 13, "#4a4250");
    R(x, y + 16, 1, 1, "#141016");
    for (let j = 0; j < 5; j++) { R(x - 2 - j, y + 17 + j, 5 + j * 2, 1, SB[j]); px(x - 2 - j, y + 17 + j, "#3a3140"); }
    R(x - 6, y + 22, 13, 1, lit ? "#fbf6e6" : "#5d5763"); R(x - 5, y + 23, 11, 1, lit ? "#e6dcc2" : "#4a4450");
    return y + 24;
  }
  function lampBrass(q, x, y, lit) {
    const { R, px } = q;
    R(x, y + 1, 1, 15, "#2a1d14");
    R(x - 1, y + 16, 3, 1, C.sun2); R(x - 2, y + 17, 5, 1, C.sun2); R(x - 3, y + 18, 7, 1, "#a87a22");
    px(x - 1, y + 16, C.sun); px(x - 2, y + 17, C.sun); px(x + 2, y + 17, "#a87a22"); px(x + 3, y + 18, "#6e4c16");
    R(x - 1, y + 19, 3, 1, lit ? BULB : BULB_OFF);
    return y + 20;
  }
  function lampGlobe(q, x, y, lit) {
    const { R, px } = q;
    R(x, y + 1, 1, 12, "#14262a"); R(x - 1, y + 13, 3, 1, C.grey3);
    A.disc(q, x, y + 17, 3, lit ? "#f3efdc" : "#8f9a92");
    R(x + 1, y + 19, 2, 1, lit ? "#d9d2b8" : "#77827a"); px(x + 3, y + 17, lit ? "#d9d2b8" : "#77827a"); px(x - 1, y + 15, lit ? "#fffdf4" : "#a9b3aa");
    return y + 20;
  }
  function lampCage(q, x, y, lit) {
    const { R, px } = q;
    R(x, y + 16, 1, 2, C.grey3);
    R(x - 2, y + 18, 5, 1, "#437559"); R(x - 3, y + 19, 7, 1, "#2c5645"); px(x + 3, y + 19, "#132c26");
    R(x - 1, y + 20, 3, 1, lit ? BULB : BULB_OFF); px(x - 2, y + 20, C.grey3); px(x + 2, y + 20, C.grey3); px(x, y + 21, C.grey3);
    return y + 21;
  }

  // ---- floors ----------------------------------------------------------------------
  // Trading: carpet tiles in two pile directions.
  function floorTrading(q, r) {
    const { R, px } = q, F = r.fy, T = ["#343e59", "#3c4765"];
    R(r.x, F, r.w, 14, "#262e45");
    [[F + 1, 4], [F + 5, 4], [F + 9, 5]].forEach(([y, h], j) => {
      for (let x = r.x - (j * 5) % 9; x < r.x + r.w; x += 9) {
        const k = (Math.floor((x - r.x + 9) / 9) + j) & 1;
        R(x, y, 8, h - 1, T[k]);
        for (let i = 0; i < 3; i++) {
          const sx = x + Math.floor(hash(x, y + i, 61) * 7), sy = y + Math.floor(hash(x, y + i, 62) * (h - 1));
          if (k) px(sx, sy, "#46537a"); else R(sx, sy, 2, 1, "#2d3650");
        }
      }
    });
    R(r.x, F, r.w, 1, "#161c2e");
  }
  // Studio: dark stage planks with staggered joints and gaffer tape marks.
  function floorStudio(q, r) {
    const { R, px } = q, F = r.fy, PL = ["#2c2331", "#33293a", "#3a2f41"];
    R(r.x, F, r.w, 14, PL[1]);
    [[F + 1, 3], [F + 4, 3], [F + 7, 3], [F + 10, 4]].forEach(([y, h], j) => {
      for (let x = r.x - Math.floor(hash(j, 1, 7) * 20); x < r.x + r.w;) {
        const len = 16 + Math.floor(hash(x, j, 8) * 14);
        R(x, y, len, h, PL[Math.floor(hash(x, j, 9) * 3)]); R(x, y, len, 1, "#473a4f"); R(x + len - 1, y, 1, h, "#1c1621");
        px(x + 3 + Math.floor(hash(x, j, 10) * (len - 6)), y + 1, "#241c29");
        x += len;
      }
    });
    const tx = r.px + 17;
    A.line(q, tx, F + 5, tx + 3, F + 8, C.sun2); A.line(q, tx + 3, F + 5, tx, F + 8, C.sun2);
    R(r.cx + 28, F + 10, 4, 1, C.rose);
    R(r.x, F, r.w, 1, "#17111b");
  }
  // Mail: worn checkerboard linoleum, rows deepening toward the viewer.
  const LINO = [["#b89c6e", "#c6ab7e", "#a88d62"], ["#8a6a48", "#977655", "#7a5c3e"]];
  function floorMail(q, r) {
    const { R, px } = q, F = r.fy;
    R(r.x, F, r.w, 14, LINO[1][0]);
    [[F + 1, 3], [F + 4, 4], [F + 8, 6]].forEach(([y, h], j) => {
      for (let x = r.x, i = 0; x < r.x + r.w; x += 8, i++) {
        const c = LINO[(i + j) & 1];
        R(x, y, 8, h, c[0]); R(x, y, 8, 1, c[1]);
        if (hash(x, j, 11) < 0.35) px(x + 2 + Math.floor(hash(x, j, 12) * 4), y + 1 + Math.floor(hash(x, j, 13) * (h - 1)), c[2]);
      }
    });
    R(r.x, F, r.w, 1, "#3a2416");
  }
  // Client: stone tiles, lit on their top left edges, with a warm rug.
  function floorClient(q, r) {
    const { R } = q, F = r.fy;
    R(r.x, F, r.w, 14, "#948b78");
    [[F + 1, 5, 12], [F + 7, 6, 14]].forEach(([y, h, w], j) => {
      for (let x = r.x - (j ? 7 : 0); x < r.x + r.w; x += w + 1) {
        R(x, y, w, h, "#bdb49b"); R(x, y, w, 1, "#cfc7b0"); R(x, y, 1, h, "#cfc7b0");
        A.speckle(q, x + 1, y + 1, w - 1, h - 1, 0.07, ["#aba287", "#c7bfa6"], 13 + j);
      }
    });
    R(r.x, F, r.w, 1, C.stone3);
  }
  // Control: calm terrazzo with brass divider strips.
  const CHIPS = ["#c5cbbf", "#9aa397", "#5a655b", "#3f5a4b"];
  function floorControl(q, r) {
    const { R } = q, F = r.fy;
    R(r.x, F, r.w, 14, "#6f7a70"); R(r.x, F + 1, r.w, 1, "#7d887d");
    A.speckle(q, r.x, F + 2, r.w, 12, 0.07, CHIPS, 17);
    for (let x = r.x + 20; x < r.x + r.w; x += 32) { R(x, F + 1, 1, 13, "#a0824a"); R(x + 1, F + 1, 1, 13, "#5a4a2e"); }
    R(r.x, F, r.w, 1, "#26302c");
  }

  // ---- decor ---------------------------------------------------------------------
  // Above the bot's head sits one small thing that belongs to the floor.
  function decoClock(q, r) {
    const cx = r.cx + 7, cy = r.y + 26;
    A.disc(q, cx, cy, 4, C.ink); A.disc(q, cx, cy, 3, C.white); A.disc(q, cx + 1, cy + 1, 2, C.white2); A.disc(q, cx, cy, 2, C.white);
    q.R(cx, cy - 2, 1, 3, C.ink); q.R(cx, cy, 2, 1, C.ink); q.px(cx, cy, C.orange);
  }
  function decoOnAir(q, r) {
    const { R } = q, x = r.cx + 1, y = r.y + 23;
    R(x, y, 10, 5, C.ink); R(x + 1, y + 1, 8, 3, "#4a1c18"); R(x + 4, y + 5, 2, 1, C.grey3);
  }
  function decoCalendar(q, r) {
    const { R, px } = q, x = r.cx + 3, y = r.y + 21;
    R(x, y, 8, 10, C.white); R(x, y, 8, 2, C.red); R(x + 7, y + 2, 1, 8, C.white2);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) px(x + 1 + i * 2, y + 3 + j * 2, C.grey2);
    px(x + 5, y + 5, C.red); px(x + 3, y - 1, C.grey3);
  }
  function decoPothos(q, r) {
    const { R, px } = q, x = r.cx + 6, y = r.y + 2;
    R(x, y, 1, 17, "#c9b48a");
    R(x - 3, y + 17, 7, 1, C.bamboo2); R(x - 3, y + 18, 7, 3, C.white2); R(x - 2, y + 21, 5, 1, C.grey1);
    for (const [dx, len] of [[-3, 9], [-1, 6], [2, 11], [3, 5]]) {
      for (let k = 0; k < len; k++) px(x + dx + (k % 3 === 2 ? 1 : 0), y + 19 + k, k % 2 ? C.leaf2 : C.leaf);
      px(x + dx - 1, y + 19 + len, C.leaf3);
    }
    R(x - 4, y + 18, 9, 2, C.leaf); px(x - 4, y + 18, C.leaf2);
  }
  function decoNetBox(q, r) {
    const { R, px } = q, x = r.cx + 1, y = r.y + 21;
    A.line(q, x + 3, r.y + 16, x + 3, y, CABLES[0]); A.line(q, x + 7, r.y + 16, x + 7, y, CABLES[1]);
    R(x, y, 11, 9, C.ink); R(x + 1, y + 1, 9, 7, "#2b3238"); R(x + 1, y + 1, 9, 1, "#3d464d");
    for (let i = 0; i < 4; i++) { px(x + 2 + i * 2, y + 3, "#14181b"); px(x + 2 + i * 2, y + 6, "#14181b"); }
  }
  // Above the desk: acoustic foam in the studio, a meeting board by clients.
  // Egg-crate foam: wedges whose ridges turn a quarter from tile to tile.
  const FOAM = ["#5a4260", "#3d2c43", "#241a29"];
  function foam(q, r) {
    const { R } = q, x = r.cx + 12, y = r.y + 25;
    R(x, y, 26, 8, "#1a121e");
    for (let j = 0; j < 2; j++) for (let i = 0; i < 8; i++) {
      const wx = x + 1 + i * 3, wy = y + 1 + j * 3;
      for (let k = 0; k < 3; k++) if ((i + j) & 1) R(wx + k, wy, 1, 3, FOAM[k]); else R(wx, wy + k, 3, 1, FOAM[k]);
    }
  }
  function meetingBoard(q, r) {
    const { R, px } = q, x = r.cx + 15, y = r.y + 22;
    A.box(q, x, y, 17, 10, C.grey1, C.grey2, C.grey3); R(x + 1, y + 1, 15, 8, C.white);
    R(x + 2, y + 2, 4, 3, C.sun); R(x + 7, y + 2, 4, 3, C.mint); R(x + 2, y + 6, 4, 2, C.rose);
    A.line(q, x + 8, y + 7, x + 11, y + 5, C.blue); A.line(q, x + 11, y + 5, x + 14, y + 6, C.blue); px(x + 14, y + 2, C.red);
  }
  // On the floor: a rug by clients, a coiled cable in the studio, a cable run
  // across the control room.
  function rug(q, r) {
    const { R, px } = q, x = r.cx, y = r.fy + 3;
    R(x, y, 38, 8, C.brick2); R(x + 1, y + 1, 36, 6, C.brick);
    for (let i = 0; i < 36; i++) if ((i + (i >> 2)) % 4 === 0) { px(x + 1 + i, y + 3, C.sun2); px(x + 1 + i, y + 4, "#e8a06a"); }
    for (let i = 0; i < 38; i += 2) { px(x + i, y - 1, C.white2); px(x + i, y + 8, C.white2); }
  }
  const COIL = ["...hHHHh....", ".hHkkkkkHh..", "hk.......kh.", "khHHHHHHHhk.", ".kk.....kk.k", "...kkkkk...kpp"];
  function cableCoil(q, r) {
    A.rows(q, r.cx + 32, r.fy + 7, COIL, { k: "#141016", h: "#5a5062", H: "#8a8094", p: "#c9c3cf" });
  }
  function floorCable(q, r) {
    const { R, px } = q;
    R(r.cx + 36, r.fy + 10, r.x + r.w - r.cx - 36, 1, "#1d2522"); px(r.cx + 36, r.fy + 9, "#1d2522");
  }

  // ---- fillers for wide rooms ----------------------------------------------------------
  // Narrow rooms have no spare wall; wide ones (tablets and phones) get these
  // on either side of the content, each (q, x, F) -> the width it took.
  function cabinet(q, x, F) {
    A.foot(q, x - 1, F + 8, 12);
    A.box(q, x, F - 16, 10, 24, "#8da0b8", "#6d7f96", "#4a5a70");
    for (let j = 0; j < 3; j++) { q.R(x + 1, F - 9 + j * 8, 8, 1, "#4a5a70"); q.R(x + 4, F - 13 + j * 8, 3, 1, C.grey1); }
    return 10;
  }
  function ficus(q, x, F) {
    A.foot(q, x, F + 8, 9);
    A.box(q, x + 1, F + 1, 7, 7, "#d08466", C.brick, C.brick2);
    q.R(x + 4, F - 6, 1, 7, C.wood2);
    A.disc(q, x + 4, F - 10, 4, C.leaf3); A.disc(q, x + 3, F - 11, 3, C.leaf2); A.speckle(q, x, F - 14, 9, 8, 0.2, [C.leaf, C.leaf4], 71);
    return 9;
  }
  function flightCase(q, x, F) {
    A.foot(q, x - 1, F + 8, 14);
    A.box(q, x, F - 2, 12, 10, "#5e645d", "#3b3f3a", "#24272a");
    q.R(x, F + 2, 12, 1, C.grey2); q.R(x + 4, F - 3, 4, 1, C.grey1);
    for (const dx of [0, 11]) { q.px(x + dx, F - 2, C.grey1); q.px(x + dx, F + 7, C.grey1); }
    return 12;
  }
  function lightStand(q, x, F) {
    A.foot(q, x, F + 8, 7);
    A.line(q, x + 3, F - 8, x, F + 7, C.grey3); A.line(q, x + 3, F - 8, x + 6, F + 7, C.grey3); q.R(x + 3, F - 20, 1, 14, C.grey2);
    q.R(x, F - 24, 7, 5, C.ink); q.R(x + 1, F - 23, 5, 3, "#fbf6e6");
    return 7;
  }
  function parcels(q, x, F) {
    A.foot(q, x - 1, F + 8, 13);
    A.box(q, x, F, 11, 8, "#c9a878", "#b08d5c", "#86683f"); q.R(x + 5, F, 1, 8, "#d8c49a");
    A.box(q, x + 2, F - 6, 8, 6, "#c9a878", "#b08d5c", "#86683f"); q.R(x + 2, F - 4, 8, 1, "#d8c49a");
    return 11;
  }
  function monstera(q, x, F) {
    A.foot(q, x, F + 8, 12);
    A.box(q, x + 2, F + 1, 8, 7, C.white, C.white2, C.grey1);
    for (const [cx, cy, rr] of [[x + 3, F - 6, 3], [x + 8, F - 9, 4], [x + 5, F - 13, 3]]) {
      A.disc(q, cx, cy, rr, C.leaf2); A.disc(q, cx - 1, cy - 1, rr - 1, C.leaf);
      q.R(cx, cy - rr, 1, rr * 2, C.leaf3); q.px(cx + 1, cy, C.leaf4); q.px(cx - 2, cy + 1, C.leaf4);
    }
    q.R(x + 6, F - 5, 1, 6, C.leaf3);
    return 12;
  }
  function armchair(q, x, F) {
    A.foot(q, x - 1, F + 8, 16);
    A.box(q, x, F - 8, 14, 12, "#e0a080", "#c97a55", "#9a5536");
    A.box(q, x - 1, F - 2, 16, 6, "#e0a080", "#c97a55", "#9a5536");
    q.R(x + 1, F + 4, 1, 3, C.wood2); q.R(x + 12, F + 4, 1, 3, C.wood2);
    return 14;
  }
  // A water dispenser with its upturned gallon bottle, a fixture of offices
  // here.
  function waterCooler(q, x, F) {
    const { R, px } = q;
    A.foot(q, x - 1, F + 8, 11);
    A.box(q, x, F - 8, 9, 16, "#eef0ea", "#d4d8cf", "#a9aea4");
    R(x + 2, F - 6, 5, 5, "#b7bdb2"); px(x + 3, F - 5, C.red); px(x + 5, F - 5, C.blue); R(x + 2, F - 2, 5, 1, C.grey3);
    R(x + 1, F + 1, 7, 1, "#a9aea4"); px(x + 6, F + 3, C.grey2);
    R(x + 3, F - 10, 3, 2, "#5aa7c4");
    R(x + 2, F - 20, 5, 1, "#bfe6f2"); A.box(q, x + 1, F - 19, 7, 9, "#bfe6f2", "#8fcde3", "#5aa7c4");
    R(x + 1, F - 17, 7, 1, "#6fb3d0"); R(x + 1, F - 13, 7, 1, "#6fb3d0"); R(x + 2, F - 18, 1, 4, "#e2f6fb");
    return 9;
  }
  // A side table: magazines on its shelf, a cactus and a cup on top.
  function sideTable(q, x, F) {
    const { R, px } = q;
    A.foot(q, x, F + 8, 10);
    R(x + 1, F - 1, 1, 9, C.wood2); R(x + 8, F - 1, 1, 9, C.wood2); R(x + 1, F + 4, 8, 1, C.wood);
    R(x, F - 2, 10, 1, C.wood1); R(x, F - 1, 10, 1, C.wood2);
    R(x + 2, F + 3, 6, 1, C.sky); R(x + 3, F + 2, 5, 1, C.rose);
    R(x + 1, F - 5, 4, 3, C.brick); R(x + 1, F - 5, 4, 1, "#d08466"); R(x + 2, F - 10, 2, 5, C.leaf2); R(x + 2, F - 10, 1, 5, C.leaf);
    px(x + 1, F - 8, C.leaf2); px(x + 4, F - 7, C.leaf3); px(x + 2, F - 11, C.rose);
    R(x + 6, F - 4, 2, 2, C.white); px(x + 8, F - 3, C.white2);
    return 10;
  }
  function rack(q, x, F) {
    A.foot(q, x - 1, F + 8, 14);
    q.R(x, F - 26, 12, 34, C.ink); q.R(x + 1, F - 25, 10, 32, "#1c2124"); q.R(x + 1, F - 25, 1, 32, "#3a4247");
    for (let j = 0; j < 6; j++) {
      const y = F - 23 + j * 5;
      q.R(x + 2, y, 8, 4, "#2b3238"); q.R(x + 2, y, 8, 1, "#3d464d"); q.px(x + 8, y + 2, j % 2 ? C.mint : C.sun2);
    }
    return 12;
  }

  // ---- floors table ----------------------------------------------------------------
  const FLOORS = {
    trading: { paintWall: wallTrading, paintFloor: floorTrading, ceiling: ceilTicker, lamp: lampBar, a: decoClock, b: null, ground: null,
      frame: [C.white2, C.grey1, C.grey2], blinds: true, sill: "round", fill: [cabinet, ficus, waterCooler] },
    studio: { paintWall: wallStudio, paintFloor: floorStudio, ceiling: ceilGrid, lamp: lampSoftbox, a: decoOnAir, b: foam, ground: cableCoil,
      frame: ["#4a4250", "#2e2834", "#1c1820"], sill: "round", fill: [flightCase, lightStand] },
    mail: { paintWall: wallMail, paintFloor: floorMail, ceiling: ceilTube, lamp: lampBrass, a: decoCalendar, b: null, ground: null,
      frame: [C.wood1, C.wood, C.wood2], sill: "round", fill: [parcels, parcels] },
    client: { paintWall: wallClient, paintFloor: floorClient, ceiling: () => {}, lamp: lampGlobe, a: decoPothos, b: meetingBoard, ground: rug,
      frame: [C.white, C.white2, C.grey1], sill: "snake", fill: [monstera, armchair, sideTable] },
    control: { paintWall: wallControl, paintFloor: floorControl, ceiling: ceilTray, lamp: lampCage, a: decoNetBox, b: null, ground: floorCable,
      frame: [C.grey2, C.grey3, "#3b3f3a"], sill: "round", fill: [rack, rack] },
  };
  for (const id of Object.keys(FLOORS)) FLOORS[id].wall = WALLS[id];

  // Decor for one room: the small thing over the bot, the piece over the
  // desk, what lies on the floor, and fillers in the margins of wide rooms.
  function decor(q, r, fa, control) {
    if (fa.ground) fa.ground(q, r);
    if (!control && fa.a) fa.a(q, r);
    if (!control && fa.b) fa.b(q, r);
    const F = r.fy, right = r.win ? r.x + r.w - 26 : r.x + r.w - 2;
    let x = r.cx - 3, k = 0;
    while (x - 14 >= r.x - 1) { const f = fa.fill[k++ % fa.fill.length]; x -= 14; f(q, Math.max(r.x, x), F); }
    x = r.cx + 98; k = 1;
    while (x + 12 <= right) { const f = fa.fill[k++ % fa.fill.length]; x += f(q, x, F) + 3; }
  }

  // What moves on a floor: the ticker, the capsule, the network box, the sign.
  let tape = null;
  function tickerTape() {
    if (tape) return tape;
    tape = P.paint(384, 3, (R, px) => {
      for (let x = 0; x < 128;) {
        const up = hash(x, 1, 81) > 0.45, col = up ? B.art.GREEN : B.art.RED;
        if (up) { px(x + 1, 0, col); R(x, 1, 3, 1, col); } else { R(x, 1, 3, 1, col); px(x + 1, 2, col); }
        x += 4;
        const n = 2 + Math.floor(hash(x, 2, 81) * 3);
        for (let i = 0; i < n; i++) { R(x, 0, 1, 3, C.sun); if (hash(x, i, 82) > 0.5) R(x + 1, 0, 1, 3, C.sun); x += hash(x, i, 82) > 0.5 ? 3 : 2; }
        x += 4 + Math.floor(hash(x, 3, 81) * 4);
      }
    });
    const g = tape.getContext("2d");
    g.drawImage(tape, 0, 0, 128, 3, 128, 0, 128, 3); g.drawImage(tape, 0, 0, 256, 3, 256 - 128, 0, 256, 3);
    return tape;
  }
  function live(p, r, t, lit, lx) {
    const id = r.floor.id, g = p.g;
    if (id === "trading" && lit) {
      const s = Math.floor(t * 8), end = tickerEnd(r), y = r.y + 16;
      for (const [a, b] of [[r.x, lx], [lx + 1, end]]) if (b > a) g.drawImage(tickerTape(), (a + s) % 128, 0, b - a, 3, a, y, b - a, 3);
    } else if (id === "mail") {
      const x = 470 - 6 * Math.floor(((t + r.y * 0.037) % 9) * 8);
      if (x > r.x - 5 && x < r.x + r.w) { p.R(x, r.y + 13, 5, 3, C.orange); p.R(x, r.y + 13, 5, 1, C.orange1); p.px(x, r.y + 14, C.sun2); p.px(x + 4, r.y + 14, C.sun2); }
    } else if (id === "control" && r.agent.look.prop !== "desk") {
      const n = Math.floor(t * 4);
      for (let i = 0; i < 4; i++) if (rnd(n + i * 5, r.seed + 3) > 0.45) p.px(r.cx + 3 + i * 2, r.y + 24, lit ? [C.mint, C.sun, C.mint, C.sky][i] : C.grey3);
    } else if (id === "studio" && lit) {
      p.R(r.cx + 2, r.y + 24, 8, 3, C.red); p.R(r.cx + 3, r.y + 25, 6, 1, "#ffb1a3");
    }
  }

  P.roomArt = { floor: (id) => FLOORS[id] || FLOORS.control, decor, live, WALLS };

  // ---- props, second half ------------------------------------------------------------
  const PROPS = B.PROPS, BEZEL = A.BEZEL;

  // Threads as tools: spools on a pegboard strung together like a graph, a
  // message running along one thread, cones of thread on the floor.
  const SPOOLS = [[7, -22, C.rose], [17, -15, C.sky], [27, -22, C.sun], [31, -12, C.mint]];
  PROPS.spools = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      A.box(q, X + 2, F - 26, 36, 18, "#d2b98c", "#b89c6e", "#8a7550");
      for (let y = F - 24; y < F - 9; y += 3) for (let x = X + 4 + ((y - F) & 1); x < X + 37; x += 3) px(x, y, "#8e7752");
      for (const [a, b] of [[0, 1], [1, 2], [1, 3], [2, 3]]) A.line(q, X + SPOOLS[a][0], F + SPOOLS[a][1], X + SPOOLS[b][0], F + SPOOLS[b][1], SPOOLS[a][2]);
      for (const [dx, dy, c] of SPOOLS) {
        const x = X + dx, y = F + dy;
        R(x - 2, y - 3, 5, 1, C.wood1); R(x - 2, y + 3, 5, 1, C.wood2); R(x - 1, y - 2, 3, 5, c); R(x + 1, y - 2, 1, 5, A.mix(c, C.ink, 0.25));
      }
      A.foot(q, X + 41, F + 8, 14);
      R(X + 41, F + 5, 14, 3, C.wood); R(X + 41, F + 5, 14, 1, C.wood1);
      [[45, C.rose], [49, C.sky], [53, C.sun]].forEach(([dx, c]) => {
        const x = X + dx;
        for (let j = 0; j < 9; j++) { const w = 1 + (j >> 2) * 2; R(x - (w >> 1), F - 4 + j, w, 1, j % 3 ? c : A.mix(c, C.ink, 0.2)); }
        px(x, F - 5, C.wood1);
      });
    },
    live(p, r, t, on) {
      const X = r.px, F = r.fy, k = on ? Math.floor(t * 6) : 0;
      SPOOLS.forEach(([dx, dy, c], i) => p.R(X + dx - 1, F + dy - 2 + ((k + i) % 5), 2, 1, A.mix(c, C.ink, 0.35)));
      if (!on) return;
      const [a, b] = [[0, 1], [1, 2], [1, 3], [2, 3]][Math.floor(t / 2) % 4], q = (t % 2) / 2;
      const x = X + SPOOLS[a][0] + (SPOOLS[b][0] - SPOOLS[a][0]) * q, y = F + SPOOLS[a][1] + (SPOOLS[b][1] - SPOOLS[a][1]) * q;
      p.R(x, y, 2, 2, C.white); p.px(x, y, C.mint);
    },
  };

  // AutoPoster, paused: a wall clock and a content calendar with two posts
  // a day, the last ones never sent.
  PROPS.clock = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy, cx = X + 8, cy = F - 18;
      A.disc(q, cx, cy, 6, C.ink); A.disc(q, cx, cy, 5, C.white2); A.disc(q, cx - 1, cy - 1, 4, C.white);
      for (const [dx, dy] of [[0, -4], [4, 0], [0, 4], [-4, 0]]) px(cx + dx, cy + dy, C.grey3);
      A.line(q, cx, cy, cx - 2, cy - 1, C.ink); A.line(q, cx, cy, cx + 2, cy - 3, C.ink); px(cx, cy, C.orange);
      A.box(q, X + 18, F - 27, 36, 20, C.grey1, C.grey2, C.grey3); R(X + 19, F - 26, 34, 18, C.white); R(X + 19, F - 26, 34, 2, C.blue);
      for (let i = 1; i < 5; i++) R(X + 19 + i * 7, F - 24, 1, 16, C.white2);
      for (let j = 1; j < 3; j++) R(X + 19, F - 24 + j * 5 + 1, 34, 1, C.white2);
      for (let d = 0; d < 15; d++) {
        const x = X + 20 + (d % 5) * 7, y = F - 23 + Math.floor(d / 5) * 5 + 1, sent = d < 9;
        R(x, y, 3, 2, sent ? [C.sun, C.mint, C.rose, C.sky][d % 4] : C.grey1); R(x + 3, y + 2, 3, 2, sent ? C.sun : C.grey1);
      }
      R(X + 21, F + 3, 11, 5, C.wood2); R(X + 22, F + 1, 9, 2, C.white); R(X + 23, F, 7, 1, C.white2); A.foot(q, X + 20, F + 8, 13);
    },
    live() {},
  };

  // A founder's voice notes: a waveform screen, a studio mic and the watch
  // whose data syncs every six hours.
  PROPS.voice = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      A.monitor(q, X + 1, F - 26, 28, 15, true);
      R(X + 3, F - 19, 24, 1, "#16322a");
      A.foot(q, X + 33, F + 8, 10);
      A.line(q, X + 37, F + 1, X + 34, F + 7, C.grey3); A.line(q, X + 37, F + 1, X + 40, F + 7, C.grey3);
      R(X + 37, F - 12, 1, 14, C.grey3); R(X + 36, F - 12, 1, 14, C.grey2);
      R(X + 35, F - 22, 5, 9, C.ink); R(X + 36, F - 21, 3, 6, C.grey2);
      for (let j = 0; j < 6; j += 2) { px(X + 36, F - 21 + j, C.grey1); px(X + 38, F - 20 + j, C.grey1); }
      R(X + 34, F - 16, 7, 1, C.ink); R(X + 36, F - 14, 3, 1, C.grey3);
      A.foot(q, X + 43, F + 8, 12);
      A.box(q, X + 43, F - 2, 12, 3, C.wood1, C.wood, C.wood2); R(X + 44, F + 1, 1, 7, C.wood2); R(X + 53, F + 1, 1, 7, C.wood2);
      R(X + 46, F - 3, 6, 1, C.white2);
      R(X + 47, F - 10, 4, 1, C.ink); R(X + 46, F - 9, 6, 6, C.ink); R(X + 47, F - 8, 4, 4, "#1d2a2a"); R(X + 47, F - 3, 4, 1, C.ink);
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy;
      for (let i = 0; i < 12; i++) {
        const a = on ? 1 + Math.floor(Math.abs(Math.sin(t * 5 + i * 0.9)) * 4 * rnd(Math.floor(t * 4) + i, 51)) : 1;
        R(X + 4 + i * 2, F - 19 - a, 1, a * 2 + 1, C.mint);
      }
      if (on) { R(X + 4 + Math.floor(t * 4) % 24, F - 23, 1, 9, "rgba(243,241,230,0.6)"); if (Math.floor(t * 2) % 2) px(X + 25, F - 23, C.red); }
      const beat = on && t % 1 < 0.2;
      px(X + 48, F - 7, C.rose); px(X + 49, F - 7, C.rose); R(X + 48, F - 6, 2, 1, beat ? C.white : C.rose);
    },
    glow: (r) => [[r.px + 3, r.fy - 24, 24, 11]],
  };

  // B2B sales, paused: the funnel on a rolling whiteboard, a stool of leads.
  PROPS.funnel = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy, cx = X + 17;
      A.foot(q, X + 1, F + 8, 42);
      R(X + 5, F - 7, 1, 13, C.grey3); R(X + 37, F - 7, 1, 13, C.grey3); R(X + 2, F + 6, 8, 1, C.grey3); R(X + 34, F + 6, 8, 1, C.grey3);
      for (const x of [X + 2, X + 9, X + 34, X + 41]) px(x, F + 7, C.ink);
      A.box(q, X + 1, F - 27, 42, 21, C.white2, C.grey1, C.grey3); R(X + 3, F - 25, 38, 17, C.white);
      A.speckle(q, X + 3, F - 25, 38, 17, 0.03, [C.white2], 91);
      [[C.sky, C.blue2], [C.mint, C.leaf3], [C.sun, C.sun2], [C.rose, C.red]].forEach(([c, d], k) => {
        for (let j = 0; j < 3; j++) { const w = 26 - k * 6 - j * 2; R(cx - (w >> 1), F - 23 + k * 4 + j, w, 1, j === 2 ? d : c); }
        R(X + 32, F - 22 + k * 4, 3 + (k % 2) * 2, 1, C.grey2);
      });
      px(cx, F - 7 - 2, C.orange); R(X + 4, F - 8, 36, 1, C.grey3);
      R(X + 9, F - 9, 4, 1, C.blue2); R(X + 15, F - 9, 4, 1, C.red); R(X + 21, F - 9, 4, 1, C.leaf3);
      A.foot(q, X + 45, F + 8, 10); R(X + 46, F, 9, 2, C.wood1); R(X + 47, F + 2, 1, 6, C.wood2); R(X + 53, F + 2, 1, 6, C.wood2);
      for (let i = 0; i < 3; i++) R(X + 47, F - 1 - i, 7, 1, [C.white, C.white2, C.white][i]);
    },
    live() {},
  };

  // Support: a counter with the order's parcel, a bell that rings with each
  // email, chat bubbles, and a snake plant by the counter.
  PROPS.bell = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      A.foot(q, X, F + 8, 39);
      R(X, F - 5, 38, 1, C.white); R(X, F - 4, 38, 1, C.stone); R(X, F - 3, 38, 1, C.stone3);
      R(X + 1, F - 2, 36, 8, C.wood); R(X + 1, F + 6, 36, 2, C.wood2);
      for (let i = 0; i < 3; i++) A.box(q, X + 3 + i * 12, F - 1, 9, 6, C.wood2, C.wood, C.wood1);
      A.monitor(q, X + 3, F - 14, 12, 9, true); R(X + 8, F - 6, 2, 1, BEZEL[1]);
      R(X + 5, F - 12, 6, 1, C.sky); R(X + 5, F - 10, 4, 1, C.grey2); R(X + 5, F - 8, 5, 1, C.grey2);
      A.box(q, X + 29, F - 10, 7, 5, "#d8b582", "#b08d5c", "#86683f"); R(X + 32, F - 10, 1, 5, "#e8d4a6");
      R(X + 20, F - 6, 7, 1, C.grey2);
      // The snake plant.
      A.foot(q, X + 43, F + 8, 10);
      A.box(q, X + 44, F + 1, 8, 7, "#d08466", C.brick, C.brick2);
      [[45, 9, C.leaf2], [46, 13, C.leaf3], [47, 10, C.leaf2], [48, 15, C.leaf3], [49, 11, C.leaf2], [50, 8, C.leaf3]].forEach(([dx, h, c]) => {
        R(X + dx, F + 1 - h, 1, h, c); px(X + dx, F + 1 - h, C.sun2);
      });
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy, ring = on && t % 5 < 0.6, lift = ring ? Math.floor(t * 8) % 2 : 0;
      R(X + 21, F - 9 - lift, 5, 3, C.sun2); R(X + 22, F - 10 - lift, 3, 1, C.sun); px(X + 21, F - 9 - lift, C.sun); R(X + 25, F - 8 - lift, 1, 2, "#a87a22");
      R(X + 23, F - 11 - lift, 1, 1, C.grey3);
      if (ring) { px(X + 19, F - 12, C.sun); px(X + 28, F - 12, C.sun); px(X + 23, F - 14, C.sun); }
      const b = on ? Math.floor(t * 0.8) % 3 : 0;
      for (let i = 0; i <= b; i++) {
        const bx = X + 2 + i * 12, by = F - 27 + (i % 2) * 4;
        R(bx, by, 11, 6, C.white); R(bx, by + 5, 11, 1, C.white2); R(bx + (i % 2 ? 8 : 1), by + 6, 2, 1, C.white2);
        if (i === b && on) for (let k = 0; k < 3; k++) px(bx + 3 + k * 2, by + 2, Math.floor(t * 3) % 3 === k ? C.grey3 : C.grey1);
        else { R(bx + 2, by + 2, 7, 1, C.grey2); R(bx + 2, by + 4, 4, 1, C.grey1); }
      }
    },
    glow: (r) => [[r.px + 5, r.fy - 12, 8, 5]],
  };

  // The control room's own wall: the SOP everything runs on, the daily logs
  // on a cabinet, and the server rack with its cables up to the tray.
  PROPS.desk = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      A.box(q, X + 16, F - 27, 26, 16, C.wood1, C.wood, C.wood2); R(X + 17, F - 26, 24, 14, C.white);
      R(X + 19, F - 24, 10, 1, C.orange);
      for (let i = 0; i < 5; i++) { R(X + 21, F - 22 + i * 2, 6 + ((i * 7) % 9), 1, C.grey2); px(X + 19, F - 22 + i * 2, i < 3 ? C.leaf : C.grey1); }
      R(X + 34, F - 25, 5, 5, C.sun); px(X + 38, F - 21, C.sun2); R(X + 35, F - 23, 3, 1, C.sun2);
      R(X + 35, F - 18, 5, 4, C.rose); R(X + 36, F - 16, 3, 1, "#d9776f"); px(X + 37, F - 18, C.red);
      A.foot(q, X + 17, F + 8, 24);
      A.box(q, X + 17, F - 2, 24, 10, C.wood1, C.wood, C.wood2); R(X + 29, F - 1, 1, 8, C.wood2); px(X + 27, F + 3, C.sun2); px(X + 31, F + 3, C.sun2);
      [C.sun, C.mint, C.sky, C.rose, C.orange1].forEach((c, i) => { R(X + 19 + i * 2, F - 9, 2, 7, c); px(X + 19 + i * 2, F - 8, A.mix(c, "#fff6d8", 0.5)); });
      R(X + 33, F - 5, 5, 3, C.brick); R(X + 34, F - 9, 3, 4, C.leaf2); px(X + 35, F - 10, C.leaf); px(X + 33, F - 7, C.leaf3);
      // The rack.
      A.foot(q, X + 42, F + 8, 14);
      for (const [dx, c] of [[46, CABLES[1]], [48, CABLES[0]], [50, CABLES[2]]]) A.line(q, X + dx, F - 29, X + dx + 1, r.y + 16, c);
      R(X + 43, F - 29, 13, 37, C.ink); R(X + 44, F - 28, 11, 35, "#1c2124"); R(X + 44, F - 28, 1, 35, "#3a4247");
      for (let j = 0; j < 6; j++) {
        const y = F - 26 + j * 5;
        R(X + 45, y, 9, 4, "#2b3238"); R(X + 45, y, 9, 1, "#3d464d");
        for (let i = 0; i < 3; i++) px(X + 46 + i * 2, y + 2, "#14181b");
      }
    },
    live(p, r, t) {
      const X = r.px, F = r.fy, n = Math.floor(t * 4);
      for (let j = 0; j < 6; j++) {
        p.px(X + 52, F - 24 + j * 5, rnd(n + j, 71) > 0.35 ? C.mint : "#1f4a3a");
        if (rnd(n + j * 3, 72) > 0.6) p.px(X + 53, F - 24 + j * 5, C.sun);
      }
    },
  };

  // Mahoraga: the eight-spoke wheel turns one notch as a lesson locks in,
  // every eight seconds. The rules it keeps are pinned beside it, one locked.
  PROPS.wheel = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy;
      A.disc(q, X + 19, F - 13, 11, "rgba(10,20,16,0.28)");
      [[35, -25, 7, 8], [44, -23, 7, 8], [37, -15, 8, 6]].forEach(([dx, dy, w, h], i) => {
        A.paper(q, X + dx, F + dy, w, h, C.grey2); px(X + dx + (w >> 1), F + dy, C.red);
        if (i === 1) { R(X + dx + 2, F + dy + 4, 3, 2, C.sun2); px(X + dx + 2, F + dy + 3, C.grey3); px(X + dx + 4, F + dy + 3, C.grey3); px(X + dx + 3, F + dy + 2, C.grey3); }
      });
      A.foot(q, X + 39, F + 8, 12);
      R(X + 44, F - 2, 2, 9, C.wood2); R(X + 40, F + 6, 10, 2, C.wood); R(X + 39, F - 4, 12, 2, C.wood); R(X + 39, F - 4, 12, 1, C.wood1);
      R(X + 40, F - 6, 5, 2, C.white); R(X + 45, F - 6, 5, 2, C.white2); px(X + 45, F - 6, C.grey1);
      q.g.drawImage(wheelFrame(0, false), X + 5, F - 27);
    },
    // The wheel at rest is baked, so the night light falls on it; only the
    // turn, which flashes, is drawn over it.
    live(p, r, t) {
      const q = (t % 8) / 8;
      if (q <= 0.906) return;
      p.g.drawImage(wheelFrame(Math.min(5, Math.floor(((q - 0.906) / 0.094) * 6)), true), r.px + 5, r.fy - 27);
    },
  };
  // Frames of the wheel, made once: six turns within one notch of 45
  // degrees, plain and flashing.
  const wheels = {};
  function wheelFrame(sub, flash) {
    const key = sub + (flash ? "f" : "");
    if (wheels[key]) return wheels[key];
    const a0 = (sub / 6) * (Math.PI / 4);
    const pal = flash ? [C.white, C.white, C.sun, C.sun2] : [C.sun, C.sun2, "#b08a2a", "#7a5418"];
    wheels[key] = P.paint(25, 25, (R, px) => {
      for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
        const c = wheelPixel(x - 12, y - 12, a0, pal);
        if (c) px(x, y, c);
      }
    }, C.ink);
    return wheels[key];
  }
  function wheelPixel(dx, dy, a0, pal) {
    const d = Math.hypot(dx, dy), lit = dx + dy < 0;
    if (d < 1.5) return C.sun;
    if (d < 2.6) return C.orange;
    if (d >= 9.5 && d < 10.6) return lit ? pal[0] : pal[1];
    if (d >= 8.5 && d < 9.5) return pal[2];
    for (let k = 0; k < 8; k++) {
      const a = a0 + (k * Math.PI) / 4, along = dx * Math.cos(a) + dy * Math.sin(a), across = dx * Math.sin(a) - dy * Math.cos(a);
      if (along <= 0) continue;
      if (d < 8.5 && Math.abs(across) < 0.62) return across < 0 ? pal[0] : pal[1];
      if (d >= 10.6 && d < 12.6 && Math.abs(across) < 1.15) return d > 11.6 ? pal[1] : pal[3];
    }
    return null;
  }

  // PC Monitor: a wall screen with a disk gauge and memory bars that fill
  // over twelve seconds; near the top the broom comes out and sweeps the
  // cache away.
  const GAUGE = [["#2f6b52", C.mint], ["#7a6a2a", C.sun], ["#7a3a30", C.red]];
  const gaugeZone = (v) => (v < 0.5 ? 0 : v < 0.8 ? 1 : 2);
  PROPS.gauges = {
    bake(q, r) {
      const { R, px } = q, X = r.px, F = r.fy, cx = X + 9, cy = F - 14;
      A.monitor(q, X, F - 28, 26, 20, true); R(X + 1, F - 8, 24, 1, "rgba(10,20,16,0.3)");
      R(X + 2, F - 26, 22, 2, "#17332c"); R(X + 3, F - 25, 7, 1, "#3f7a66"); px(X + 22, F - 25, C.mint);
      for (let dy = -6; dy <= 0; dy++) for (let dx = -6; dx <= 6; dx++) {
        const d = Math.hypot(dx, dy);
        if (d < 3.6 || d >= 6.1) continue;
        const v = 1 - Math.atan2(-dy, dx) / Math.PI;
        px(cx + dx, cy + dy, GAUGE[gaugeZone(v)][0]);
      }
      R(cx - 6, cy + 1, 13, 1, "#1b2a28"); px(cx, cy, C.grey2);
      R(X + 16, F - 12, 7, 1, "#2a4a40");
      for (let i = 0; i < 4; i++) R(X + 16 + i * 2, F - 21, 1, 9, "#15241f");
      A.foot(q, X + 29, F + 8, 9);
      R(X + 30, F, 7, 7, C.grey2); for (let j = 0; j < 7; j += 2) R(X + 30, F + j, 7, 1, C.grey1); R(X + 29, F - 1, 9, 1, C.grey3);
      px(X + 31, F - 1, C.white); px(X + 34, F, C.white);
      A.foot(q, X + 43, F + 8, 11);
      R(X + 43, F - 10, 11, 18, C.ink); A.box(q, X + 44, F - 9, 9, 16, "#5e645d", "#3b3f3a", "#24272a");
      for (let j = 0; j < 4; j++) R(X + 45, F - 1 + j * 2, 7, 1, "#24272a");
      R(X + 45, F - 7, 7, 1, "#24272a");
    },
    live(p, r, t, on) {
      const { R, px } = p, X = r.px, F = r.fy, cyc = (t % 12) / 12, full = cyc < 0.8;
      const disk = full ? 0.3 + cyc * 0.8 : 0.3, mem = full ? 0.45 + cyc * 0.6 : 0.45;
      const a = Math.PI * (1 - Math.min(0.99, disk)), cx = X + 9, cy = F - 14;
      A.line(p, cx, cy, cx + Math.round(Math.cos(a) * 4), cy - Math.round(Math.sin(a) * 4), GAUGE[gaugeZone(disk)][1]);
      px(cx, cy, C.white);
      for (let i = 0; i < 4; i++) {
        const v = Math.min(1, mem * (0.8 + 0.1 * i)), h = Math.max(1, Math.round(9 * v));
        R(X + 16 + i * 2, F - 12 - h, 1, h, GAUGE[gaugeZone(v)][1]);
      }
      px(X + 46, F - 7, Math.floor(t * 3) % 2 ? C.mint : C.grey3); px(X + 48, F - 7, C.sky);
      const sweep = on && cyc > 0.72 && cyc < 0.86;
      const bx = sweep ? X + 34 + (Math.floor(t * 6) % 2) * 2 : X + 27;
      R(bx, F - 8, 1, 12, C.wood); R(bx - 2, F + 4, 5, 3, C.bamboo); R(bx - 2, F + 6, 5, 1, C.bamboo2);
      if (sweep) for (let i = 0; i < 3; i++) px(bx - 4 + i * 3, F + 6 - (Math.floor(t * 8) + i) % 3, C.stone);
    },
    glow: (r) => [[r.px + 2, r.fy - 26, 22, 16]],
  };

  // Amadeus, paused: my twin in the mirror, and the hourglass of its
  // two-hour pulse, stopped.
  const ARCH = [8, 12, 14, 16, 16];
  PROPS.mirror = {
    bake(q, r, on) {
      const { R, px } = q, X = r.px, F = r.fy, cx = X + 15, top = F - 28;
      A.foot(q, X + 4, F + 8, 22);
      R(X + 6, F, 2, 7, C.wood2); R(X + 22, F, 2, 7, C.wood2); R(X + 4, F + 6, 6, 2, C.wood); R(X + 20, F + 6, 6, 2, C.wood);
      for (let j = 0; j < 29; j++) {
        const w = (ARCH[j] || 18) + 2, gw = w - 6;
        R(cx - (w >> 1), top + j, w, 1, C.ink);
        R(cx - (w >> 1) + 1, top + j, w - 2, 1, j < 2 || j > 26 ? C.sun2 : C.wood);
        if (gw > 0 && j > 1 && j < 27) {
          for (let i = 0; i < gw; i++) px(cx - (gw >> 1) + i, top + j, j / 27 + (P.bayer(i, j) - 0.5) * 0.3 < 0.5 ? "#cfe6ee" : "#9cc3d1");
        }
        if (j >= 2 && j <= 26) { px(cx - (w >> 1) + 1, top + j, C.sun2); px(cx + (w >> 1) - 2, top + j, C.wood2); }
      }
      A.line(q, cx - 5, top + 8, cx - 2, top + 5, C.white); A.line(q, cx - 5, top + 11, cx - 1, top + 7, C.white);
      px(cx - 9, F - 14, C.sun); px(cx + 8, F - 14, C.sun);
      const bot = P.hqArt && P.hqArt.bots[r.agent.id];
      if (bot) { q.g.globalAlpha = 0.5; q.g.drawImage(bot.left.sleep, cx - 5, top + 12); q.g.globalAlpha = 1; }
      A.foot(q, X + 34, F + 8, 16);
      A.box(q, X + 34, F - 3, 16, 3, C.wood1, C.wood, C.wood2); R(X + 36, F, 1, 8, C.wood2); R(X + 47, F, 1, 8, C.wood2);
      R(X + 39, F - 13, 7, 1, C.wood); R(X + 39, F - 4, 7, 1, C.wood);
      A.rows(q, X + 40, F - 12, ["hwwwh", ".hwh.", "..s..", ".hsh.", "hsssh", "hsssh", "hsssh", "hhhhh"], { h: "#cfe6ee", w: "#e9f5f8", s: C.sun2 });
      px(X + 38, F - 12, C.wood2); px(X + 46, F - 12, C.wood2);
    },
    live() {},
  };
})((window.PETA = window.PETA || {}));
