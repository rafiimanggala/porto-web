// Agent HQ, inside the rooms. Each room's still art (wall, ceiling feature,
// lamp, window, floor, desk, chair and the still parts of its prop) is painted
// once per layout and sky into a scratch canvas, lit for the night there, and
// copied into the building layer. P.rooms.draw then adds only what moves:
// screens, the bot, the moving parts of the prop and the selection marker.
// hq.js owns the building around the rooms; the floor identities (walls,
// floors, lamps, decor) live in rooms-props.js as P.roomArt.
(function (P) {
  "use strict";
  const { PAL: C, bayer } = P;
  const B = P.bots, A = B.art;

  const CHAIR = ["#1b2024", "#2c3338", "#434c53", "#5c6770"];
  // Night light, per level of the lamp's pool from dark to full: a factor on
  // the colour and a shift that turns the dark cool and the centre warm.
  const LIT_K = [0.64, 0.77, 0.9, 1];
  const LIT_ADD = [[-8, -4, 12], [-4, -2, 6], [6, 4, -2], [18, 11, -4]];
  const GLOW_ADD = [[0, 0, 0], [-2, 9, 11], [-4, 18, 22]];
  const PAUSED_K = 0.7, PAUSED_ADD = [-8, -4, 12];

  function painter(g) {
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
    return { g, R, px: (x, y, col) => R(x, y, 1, 1, col) };
  }

  // Where the lamp hangs and where its light starts (filled in by the lamp).
  const lampX = (r) => r.cx + (isControlDesk(r) ? 28 : 24);
  const isControlDesk = (r) => r.agent.look.prop === "desk";

  // ---- window -----------------------------------------------------------------
  // The wall is thick, so the opening shows its sides; the frame is lit from
  // the top left and the panes are cut clear for the sky layer behind.
  const PANES = [[0, 0], [9, 0], [0, 7], [9, 7]];
  const winXY = (r) => [r.x + r.w - 21, r.y + 18];

  function windowBake(q, r, W, fr) {
    const { R } = q, [wx, wy] = winXY(r);
    R(wx - 2, wy - 2, 20, 15, W[0]); R(wx + 17, wy - 1, 1, 14, W[4]);
    R(wx - 1, wy - 1, 18, 14, fr[1]);
    R(wx - 1, wy - 1, 18, 1, fr[0]); R(wx - 1, wy - 1, 1, 14, fr[0]);
    R(wx - 1, wy + 12, 18, 1, fr[2]); R(wx + 16, wy, 1, 13, fr[2]);
    R(wx + 8, wy, 1, 12, fr[2]); R(wx, wy + 6, 16, 1, fr[2]);
    R(wx - 3, wy + 13, 22, 1, fr[0]); R(wx - 3, wy + 14, 22, 1, fr[2]);
    R(wx - 2, wy + 15, 20, 1, "rgba(10,8,30,0.3)");
  }

  // After the panes are cut: glints on the glass, and what stands in front.
  function windowFront(q, r, style) {
    const { R, px } = q, [wx, wy] = winXY(r), glint = "rgba(255,255,255,0.28)";
    A.line(q, wx + 1, wy + 3, wx + 3, wy + 1, glint); A.line(q, wx + 10, wy + 4, wx + 13, wy + 1, glint);
    px(wx + 2, wy + 10, glint);
    if (style.blinds) {
      for (const y of [wy, wy + 2]) { R(wx, y, 7, 1, C.white2); R(wx + 9, y, 7, 1, C.white2); }
      R(wx + 4, wy + 3, 1, 3, C.grey2);
    }
    // A plant on the sill.
    const x = wx + 10, y = wy + 10;
    R(x, y, 5, 3, C.brick); R(x, y, 5, 1, "#d08466"); R(x + 4, y + 1, 1, 2, C.brick2);
    if (style.sill === "snake") {
      for (const [dx, h, c] of [[0, 6, C.leaf2], [1, 9, C.leaf3], [2, 7, C.leaf2], [3, 10, C.leaf3], [4, 5, C.leaf2]]) {
        R(x + dx, y - h, 1, h, c); px(x + dx, y - h, C.sun2);
      }
    } else {
      R(x, y - 3, 5, 3, C.leaf2); R(x + 1, y - 4, 3, 1, C.leaf); px(x, y - 3, C.leaf); px(x + 4, y - 1, C.leaf3); px(x + 2, y - 5, C.rose);
    }
  }

  // ---- desk and chair ------------------------------------------------------------
  // A work desk: top, drawer pedestal, a leg, a monitor on a stand, keyboard,
  // papers and a mug. Only the screen and the steam move.
  function deskBake(q, r, lit) {
    const { R, px } = q, x = r.cx + 13, y = r.fy - 1;
    A.foot(q, x, r.fy + 8, 23);
    R(x + 1, y + 4, 2, 5, C.wood2); px(x + 1, y + 4, C.wood); R(x + 3, y + 4, 11, 2, "#4a2e1a");
    A.box(q, x + 14, y + 4, 8, 5, C.wood1, C.wood, C.wood2);
    R(x + 15, y + 6, 6, 1, C.wood2); R(x + 17, y + 5, 2, 1, C.sun2); R(x + 17, y + 7, 2, 1, C.sun2);
    R(x, y, 23, 1, C.wood1); R(x, y + 1, 23, 1, C.wood); R(x, y + 2, 23, 1, C.wood2); R(x, y + 3, 23, 1, "#3a2414");
    A.monitor(q, x + 4, y - 13, 15, 10, lit);
    px(x + 16, y - 5, lit ? C.mint : C.grey3);
    R(x + 11, y - 3, 2, 2, B.art.BEZEL[1]); px(x + 11, y - 3, B.art.BEZEL[0]); R(x + 8, y - 1, 7, 1, B.art.BEZEL[0]);
    R(x, y - 2, 7, 1, C.grey2); R(x, y - 1, 7, 1, C.grey3);
    for (let i = 0; i < 7; i += 2) px(x + i, y - 2, C.grey1);
    R(x + 15, y - 1, 4, 1, C.white); R(x + 16, y - 2, 3, 1, C.white2);
    const mug = [C.white, C.rose, C.sky, C.sun, C.mint][r.seed % 5];
    R(x + 19, y - 3, 3, 3, mug); R(x + 21, y - 3, 1, 3, A.mix(mug, C.ink, 0.3)); R(x + 19, y - 3, 3, 1, C.hair); px(x + 22, y - 2, mug);
  }

  function deskLive(p, r, t, lit) {
    if (!lit) return;
    const { R, px } = p, x = r.cx + 13, y = r.fy - 1, n = Math.floor(t * 3);
    for (let i = 0; i < 3; i++) R(x + 7, y - 10 + i * 2, 2 + Math.floor(B.rnd(n + i, r.seed) * 7), 1, [C.mint, C.sun, C.sky][i]);
    if (n % 2) px(x + 7 + 2 + Math.floor(B.rnd(n + 2, r.seed) * 7), y - 6, C.white);
    steam(p, x + 20, y - 4, t);
  }

  function steam(p, x, y, t) {
    const k = Math.floor(t * 3) % 3;
    p.px(x + (k === 1 ? 1 : 0), y - k, "rgba(243,241,230,0.7)"); p.px(x + (k === 2 ? 0 : 1), y - k - 2, "rgba(243,241,230,0.35)");
  }

  // The chair the bot sits on: back and base are baked; the front of the
  // seat is drawn again over the bot's legs so it sits down in it.
  function chairBake(q, x, y) {
    const { R, px } = q;
    A.foot(q, x - 2, y + 19, 12);
    R(x - 2, y + 3, 3, 9, C.ink); R(x - 1, y + 4, 2, 7, CHAIR[1]); R(x - 1, y + 4, 1, 6, CHAIR[2]);
    seat(q, x, y);
    R(x + 3, y + 14, 2, 3, CHAIR[1]); R(x + 3, y + 14, 1, 3, CHAIR[2]);
    R(x - 1, y + 17, 10, 1, CHAIR[0]);
    for (const dx of [-1, 4, 8]) px(x + dx, y + 18, C.ink);
  }
  function seat(q, x, y) {
    q.R(x - 2, y + 11, 12, 3, C.ink); q.R(x - 1, y + 11, 10, 1, CHAIR[3]); q.R(x - 1, y + 12, 10, 1, CHAIR[1]);
  }

  // ---- my desk in the control room ------------------------------------------------
  // The Mac Mini, a 4K screen with a 27 inch one beside it, the phone with
  // its SSH terminal, coffee, and me typing; Claude Code's bot stands by.
  function controlBake(q, r) {
    const { R, px } = q, cx = r.cx, F = r.fy, x = cx + 13, y = F - 1;
    // My chair.
    A.foot(q, cx + 1, F + 8, 12);
    R(cx + 1, F - 5, 3, 7, C.ink); R(cx + 2, F - 4, 2, 5, CHAIR[1]); R(cx + 2, F - 4, 1, 4, CHAIR[2]);
    R(cx + 6, F + 4, 2, 2, CHAIR[1]); R(cx + 2, F + 6, 10, 1, CHAIR[0]);
    for (const dx of [2, 7, 11]) px(cx + dx, F + 7, C.ink);
    // The desk, 31 wide, a leg and a drawer pedestal under it.
    A.foot(q, x, F + 8, 31);
    R(x + 1, y + 4, 2, 5, C.wood2); px(x + 1, y + 4, C.wood); R(x + 3, y + 4, 19, 2, "#4a2e1a");
    A.box(q, x + 22, y + 4, 8, 5, C.wood1, C.wood, C.wood2); R(x + 25, y + 5, 2, 1, C.sun2); R(x + 25, y + 7, 2, 1, C.sun2);
    R(x, y, 31, 1, C.wood1); R(x, y + 1, 31, 1, C.wood); R(x, y + 2, 31, 1, C.wood2); R(x, y + 3, 31, 1, "#3a2414");
    // The 27 inch screen behind, then the 4K screen in front of it.
    A.monitor(q, x + 19, y - 14, 11, 10, true); R(x + 25, y - 4, 2, 3, B.art.BEZEL[1]); R(x + 23, y - 1, 6, 1, B.art.BEZEL[0]);
    A.monitor(q, x + 6, y - 15, 17, 11, true); R(x + 14, y - 4, 2, 3, B.art.BEZEL[1]); R(x + 12, y - 1, 6, 1, B.art.BEZEL[0]);
    R(x + 20, y - 16, 3, 3, C.sun); px(x + 22, y - 14, C.sun2);
    // Keyboard, the Mac Mini, the phone on its stand, the mug.
    R(x, y - 2, 6, 1, C.grey2); R(x, y - 1, 6, 1, C.grey3); for (let i = 0; i < 6; i += 2) px(x + i, y - 2, C.grey1);
    R(x + 7, y - 2, 5, 2, C.grey1); R(x + 7, y - 2, 5, 1, C.white2); R(x + 11, y - 1, 1, 1, C.grey2);
    R(x + 18, y - 6, 3, 6, C.ink); R(x + 19, y - 5, 1, 4, "#0c1a14");
    R(x + 27, y - 3, 3, 3, C.white); R(x + 29, y - 3, 1, 3, C.white2); R(x + 27, y - 3, 3, 1, C.hair); px(x + 30, y - 2, C.white);
    statusBoard(q, r);
  }

  // Every agent in the building as a dot, coloured by its status.
  const DOT = { live: C.mint, call: C.sun, proto: C.sky, paused: "#34443e" };
  function statusBoard(q, r) {
    const { R } = q, x = r.cx, y = r.y + 20;
    R(x, y, 14, 11, C.ink); R(x + 1, y + 1, 12, 9, "#0f1d1a"); R(x + 1, y + 1, 12, 1, "#24433a");
    R(x + 2, y + 2, 4, 1, C.orange);
    P.data.AGENTS.forEach((a, i) => q.px(x + 2 + (i % 6) * 2, y + 4 + Math.floor(i / 6) * 2, DOT[a.status] || C.grey3));
    R(x + 6, y + 11, 2, 2, C.grey3);
  }

  function controlLive(p, r, t, S) {
    const { R, px } = p, cx = r.cx, F = r.fy, x = cx + 13, y = F - 1, n = Math.floor(t * 3);
    // The 4K screen: code; the 27 inch: a terminal; the phone: an SSH prompt.
    for (let i = 0; i < 4; i++) R(x + 8 + (i % 2) * 2, y - 13 + i * 2, 2 + Math.floor(B.rnd(n + i, 61) * 9), 1, i === 0 ? C.orange1 : [C.mint, C.sky, C.sun][i % 3]);
    for (let i = 0; i < 3; i++) R(x + 25, y - 12 + i * 2, 1 + Math.floor(B.rnd(n + i + 9, 62) * 3), 1, B.art.GREEN);
    px(x + 19, y - 4 + (n % 2), B.art.GREEN); px(x + 19, y - 5, C.mint);
    px(x + 11, y - 1, n % 3 ? C.white : C.mint);
    steam(p, x + 28, y - 4, t);
    // Status dots: the agents on a call blink.
    P.data.AGENTS.forEach((a, i) => { if (a.status === "call" && n % 2) px(cx + 2 + (i % 6) * 2, r.y + 24 + Math.floor(i / 6) * 2, C.white); });
    const av = P.hqArt.avatar;
    p.g.drawImage(Math.floor(t * 4) % 2 ? av.typing : av.seated.right, cx + 4, F - 7);
    R(cx + 2, F + 1, 11, 3, C.ink); R(cx + 3, F + 1, 9, 1, CHAIR[3]); R(cx + 3, F + 2, 9, 1, CHAIR[1]);
  }

  // ---- night light ------------------------------------------------------------
  // How much of the lamp's light reaches (x, y), from 0 to 1: a cone down the
  // wall, a pool where it lands on the floor and a halo around the shade.
  function pool(r, L, x, y) {
    const dx = x > L.x ? x - L.x : L.x - x;
    if (y < L.y) { const up = (L.y - y) * 1.5, v = 1 - Math.sqrt(dx * dx + up * up) / 10; return v > 0 ? v : 0; }
    const dy = y - L.y, rx = 12 + (r.fy - L.y) * 1.05, fy = (y - r.fy - 6) / 8;
    let v = y < r.fy ? Math.max(0, 1 - dx / (6 + dy * 1.05)) * (1 - dy / 70) : 0;
    const e = 1 - (dx / rx) * (dx / rx) - fy * fy;
    if (e > v) v = e;
    return v > 0 ? v : 0;
  }
  // Screens glow a little onto what is around them: 1 at a screen's edge, 0
  // six pixels out, and -1 on the screen itself.
  function glowAt(glows, x, y) {
    let best = 0;
    for (let n = 0; n < glows.length; n++) {
      const gl = glows[n], x1 = gl[0] + gl[2] - 1, y1 = gl[1] + gl[3] - 1;
      const ddx = x < gl[0] ? gl[0] - x : x > x1 ? x - x1 : 0;
      if (ddx >= 6) continue;
      const ddy = y < gl[1] ? gl[1] - y : y > y1 ? y - y1 : 0;
      if (ddy >= 6) continue;
      if (!ddx && !ddy) return -1;
      const v = 1 - Math.sqrt(ddx * ddx + ddy * ddy) / 6;
      if (v > best) best = v;
    }
    return best;
  }

  // One pass over the room's pixels (ImageData clamps and rounds for us).
  function nightLight(sg, r, L, glows, lit) {
    const im = sg.getImageData(0, 0, r.w, r.h), d = im.data;
    for (let j = 0, o = 0; j < r.h; j++) for (let i = 0; i < r.w; i++, o += 4) {
      if (!d[o + 3]) continue;
      const x = r.x + i, y = r.y + j;
      let k = PAUSED_K, add = PAUSED_ADD, gAdd = GLOW_ADD[0];
      if (lit) {
        const lev = Math.min(3, Math.floor(pool(r, L, x, y) * 3 + bayer(x, y)));
        k = LIT_K[lev]; add = LIT_ADD[lev];
        const gl = glowAt(glows, x, y);
        if (gl < 0) { k = 1; add = GLOW_ADD[0]; } else if (gl > 0) {
          const gv = Math.min(2, Math.floor(gl * 2 + bayer(x + 1, y)));
          if (gv) { gAdd = GLOW_ADD[gv]; k = Math.max(k, 0.84); }
        }
      }
      d[o] = d[o] * k + add[0] + gAdd[0]; d[o + 1] = d[o + 1] * k + add[1] + gAdd[1]; d[o + 2] = d[o + 2] * k + add[2] + gAdd[2];
    }
    sg.putImageData(im, 0, 0);
  }

  // ---- the shell ---------------------------------------------------------------
  // Baked once per layout and sky. R is hq.js's painter for the building layer;
  // the room is painted in a scratch canvas instead and copied over, so the
  // night light can read it back without touching the building layer. Finished
  // rooms are kept by what shapes them: a relayout that leaves a room as it
  // was (most resize events) copies it instead of painting it again.
  const shells = new Map();
  function shell(R0, g, r, dark) {
    const key = [r.x, r.y, r.w, r.h, r.fy, r.cx, r.px, r.win ? 1 : 0, r.seed, r.floor.id, r.agent.id, r.agent.status,
      r.agent.look.prop, dark ? 1 : 0].join();
    let c = shells.get(key);
    if (!c) {
      c = paintShell(r, dark);
      shells.set(key, c);
      if (shells.size > 72) shells.delete(shells.keys().next().value);
    }
    g.clearRect(r.x, r.y, r.w, r.h);
    g.drawImage(c, r.x, r.y);
  }
  function paintShell(r, dark) {
    const fa = P.roomArt.floor(r.floor.id), W = fa.wall;
    const c = P.canvas(r.w, r.h), sg = c.getContext("2d", { willReadFrequently: true });
    const q = painter(sg), lit = r.agent.status !== "paused", control = isControlDesk(r);
    const prop = B.PROPS[r.agent.look.prop];
    sg.setTransform(1, 0, 0, 1, -r.x, -r.y);
    fa.paintWall(q, r, W);
    if (r.win) windowBake(q, r, W, fa.frame);
    fa.ceiling(q, r, W, lampX(r));
    const L = { x: lampX(r), y: fa.lamp(q, lampX(r), r.y, lit) };
    fa.paintFloor(q, r, W);
    P.roomArt.decor(q, r, fa, control);
    if (control) controlBake(q, r);
    else { deskBake(q, r, lit); chairBake(q, r.cx + 4, r.fy - 11); }
    if (prop && prop.bake) prop.bake(q, r, lit);
    sg.setTransform(1, 0, 0, 1, 0, 0);
    if (r.win) {
      const [wx, wy] = winXY(r);
      for (const [dx, dy] of PANES) sg.clearRect(wx + dx - r.x, wy + dy - r.y, 7, 5);
      sg.setTransform(1, 0, 0, 1, -r.x, -r.y);
      windowFront(q, r, fa);
      sg.setTransform(1, 0, 0, 1, 0, 0);
    }
    if (dark) nightLight(sg, r, L, glowsOf(r, prop, control), lit);
    return c;
  }

  function glowsOf(r, prop, control) {
    const x = r.cx + 13, y = r.fy - 1;
    const own = control ? [[x + 8, y - 13, 13, 7], [x + 21, y - 12, 7, 6]] : [[x + 6, y - 11, 11, 6]];
    return prop && prop.glow ? own.concat(prop.glow(r)) : own;
  }

  // ---- every frame ---------------------------------------------------------------
  function botPose(status, seed, t) {
    if (status === "paused") return { spr: "sleep", on: false, lit: false };
    const blink = (t + seed) % 3.7 < 0.15 ? "blink" : "stand";
    if (status === "call") {
      const q = (t + seed) % 11;
      return q < 3.2 ? { spr: "work", on: true, lit: true, ring: q < 0.8 } : { spr: blink, on: false, lit: true };
    }
    if (status === "proto") {
      return (t + seed) % 6 < 3.5 ? { spr: "work", on: true, lit: true } : { spr: blink, on: false, lit: true };
    }
    return { spr: (t + seed) % 5.3 < 0.12 ? "blink" : "work", on: true, lit: true };
  }

  // A bouncing marker over the selected agent, like a cursor in a game menu.
  function drawMarker(p, x, y, t, still) {
    const { R } = p, yy = y - (still ? 0 : Math.floor(t * 3) % 2);
    R(x, yy, 7, 1, C.ink); R(x, yy + 1, 1, 1, C.ink); R(x + 1, yy + 1, 5, 1, C.sun); R(x + 6, yy + 1, 1, 1, C.ink);
    R(x + 1, yy + 2, 1, 1, C.ink); R(x + 2, yy + 2, 3, 1, C.sun); R(x + 5, yy + 2, 1, 1, C.ink);
    R(x + 2, yy + 3, 1, 1, C.ink); R(x + 3, yy + 3, 1, 1, C.sun); R(x + 4, yy + 3, 1, 1, C.ink); R(x + 3, yy + 4, 1, 1, C.ink);
  }

  function draw(g, p, r, t, S) {
    const a = r.agent, bot = P.hqArt.bots[a.id], pose = botPose(a.status, r.seed, t);
    const control = isControlDesk(r), prop = B.PROPS[a.look.prop];
    g.save();
    g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
    P.roomArt.live(p, r, t, pose.lit, lampX(r));
    if (control) controlLive(p, r, t, S); else deskLive(p, r, t, pose.lit);
    if (prop && prop.live) prop.live(p, r, t, pose.on, bot);
    // Seated at the desk; in the control room Claude's bot stands beside mine.
    const bx = control ? r.cx + 45 : r.cx + 4, by = control ? r.fy - 5 : r.fy - 11;
    const side = control ? bot.left : bot.right;
    const spr = pose.spr === "work" ? side.work[Math.floor(t * 5 + r.seed) % 2] : side[pose.spr];
    g.drawImage(spr, bx, by);
    if (!control) seat(p, bx, by);
    if (a.status === "paused") B.zzz(p, bx + 8, by - 3, t + r.seed);
    if (pose.ring) { p.R(bx + 3, by - 9, 3, 5, C.sun); p.R(bx + 4, by - 8, 1, 2, C.ink); p.px(bx + 4, by - 5, C.ink); }
    if (a.status === "paused") { g.fillStyle = "rgba(6,10,24,0.45)"; g.fillRect(r.x, r.y, r.w, r.h); }
    if (S.hot === a.id) { g.fillStyle = "rgba(255,227,117,0.12)"; g.fillRect(r.x, r.y, r.w, r.h); }
    if (S.sel === a.id) drawMarker(p, bx + 2, by - 9, t, S.still);
    g.restore();
  }

  P.rooms = { shell, draw };
})((window.PETA = window.PETA || {}));
