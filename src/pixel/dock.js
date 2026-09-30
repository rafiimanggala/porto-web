// The dock's jukung: a strip of sea along the top edge of the site's dock pill
// and a boat that sails over it from link to link as the page scrolls, with
// me at the stern. The React dock owns the links and the scrollspy; this only
// draws. The sea sits in a canvas clipped to the pill's rounded shape, and the
// boat, the gull and the odd fish in a second canvas above it, so the boat can
// rise over the pill's edge. Its position is read straight from scroll, so it
// is right even with motion paused. The animation is the bob, the swell, the
// glints, the wake, a fish now and then, and a gull that lands on the stern
// while I stay on one section and flies off when I sail on.
(function (P) {
  "use strict";
  const { paint, bake, flip, hash, bayer, PAL: C } = P;
  const ABOVE = 18; // art rows above the sea line: room for the sail, me and the gull
  const SEA = 6; // art rows of sea: the dock's whole top padding
  const LAND = 3; // seconds on one spot before the gull glides in; it lands a second later
  const LEAVE = 1.2; // seconds the gull takes to clear the canvas once I sail

  // Water from the crest down to the dock panel, drifting from sky blue towards
  // the panel's green, and the colours that ride on top of it.
  const WATER = ["#4a9fc0", "#3a88a9", "#2d7494", "#23607c", "#1b4d5e", "#173f45"];
  const CREST = "#a6e8fa", FOAM = "#e6f5e8", SHADE = "rgba(12,40,48,0.6)";

  // Jukung, bow to the right: the upswept beak of a prow with its painted eye,
  // an orange band over a blue hull, two outrigger booms bowing down in front
  // of the hull to the near float, and a stern that lifts a little.
  const HULL = [
    "..........................kk.",
    "........................kkwk.",
    "..kk...................kwwk..",
    "..kwk..bab.........babkwwk...",
    "..kwwwwwbwwwwwwwwwwwbwwwwk...",
    "...kOoOoboOoOoOoOoOoboepOk...",
    "...kuuuubuuuuuuuuuuubuuuuk...",
    "....kUUUbUUUUUUUUUUUbUUUk....",
    ".....kkkBkkkkkkkkkkkBkkk.....",
    "..bbbBbbbbBbbbbBbbbbBbbbbBb..",
  ];
  const HULL_PAL = {
    k: C.ink, w: C.white, o: C.orange1, O: C.orange, e: C.white, p: C.ink, u: C.blue, U: C.blue2,
    b: C.bamboo, B: C.bamboo2, a: C.bamboo,
  };
  // Crab-claw sail: the yard across the top, the front spar lashed to the
  // forward boom, white cloth with one red band and its belly in shade, and
  // a merah putih pennant at the masthead flying back over me.
  const SAIL = [
    "......kkkk.",
    ".....kRRRyk",
    ".....kWWWyk",
    "kkkkkkkkkyk",
    "kyyyyyyyyyk",
    ".kwwwwwwwyk",
    "..kwwwwwvyk",
    "...kRRRRvyk",
    "....kwwvvyk",
    ".....kwvvyk",
    "......kvvyk",
    ".......kvyk",
    "........kyk",
  ];
  const SAIL_PAL = { k: C.ink, y: C.bamboo2, R: C.red, W: C.white, w: C.white, v: C.white2 };
  const SAIL_X = 12; // the spar comes down onto the forward boom at x 21
  const HULL_Y = SAIL.length - 3; // the spar ends two rows into the hull
  // A gull standing on the stern post, facing the bow, yellow bill.
  const PERCH = ["...ww.", "ggwwwo", ".ggww.", "...k.."];
  const PERCH_PAL = { w: C.white, g: C.grey2, o: C.sun2, k: C.ink };

  function boat(spr) {
    const hull = bake(HULL, HULL_PAL);
    const sail = bake(SAIL, SAIL_PAL);
    // The sail and me first, then the hull over my lap, so I sit inside the boat.
    const right = paint(hull.width, HULL_Y + hull.height, (R, px, g) => {
      g.drawImage(sail, SAIL_X, 0);
      g.drawImage(spr.avatar.seated.right, 7, HULL_Y - 5);
      g.drawImage(hull, 0, HULL_Y);
    });
    return { right, left: flip(right), w: right.width, h: right.height };
  }

  function gullArt(spr) {
    const right = bake(PERCH, PERCH_PAL, { outline: C.ink });
    return { right, left: flip(right), w: right.width, fly: spr.gull };
  }

  // The still water: the ramp, dithered band to band, and light caught under
  // the surface as short dashes placed by hash. Baked once per width.
  function bakeSea(W) {
    return paint(W, SEA, (R, px) => {
      for (let r = 0; r < SEA; r++) {
        R(0, r, W, 1, WATER[r]);
        if (r > 0 && r < SEA - 1) for (let x = 0; x < W; x++) if (bayer(x, r) < 0.25) px(x, r, WATER[r + 1]);
      }
      for (let r = 3; r < SEA; r++) {
        for (let k = 0; k * 9 < W; k++) {
          if (hash(k, r, 17) < 0.5) continue;
          R(k * 9 + Math.floor(hash(k, r, 18) * 6), r, hash(k, r, 19) > 0.7 ? 3 : 2, 1, WATER[r - 2]);
        }
      }
    });
  }

  // Waves drift left at a different speed per row, so the strip has depth;
  // the glints are fixed points that catch the light for a moment each.
  function swell(g, W, top, t) {
    const rowWave = (row, gap, len, speed, col, seed) => {
      const off = Math.floor(t * speed);
      g.fillStyle = col;
      for (let x = -(off % gap); x < W; x += gap) {
        const k = Math.floor((x + off) / gap);
        g.fillRect(x + Math.floor(hash(k, seed, 3) * 3), top + row, len + (hash(k, seed, 4) > 0.6 ? 1 : 0), 1);
      }
    };
    rowWave(0, 13, 2, 3, FOAM, 1);
    rowWave(1, 9, 3, 2, CREST, 2);
    rowWave(2, 17, 2, 1, WATER[0], 3);
    g.fillStyle = "#ffffff";
    for (let i = 0; i < Math.ceil(W / 40); i++) {
      const period = 3 + hash(i, 5, 9) * 4;
      if ((t + hash(i, 6, 9) * period) % period < 0.2) g.fillRect(Math.floor(hash(i, 7, 9) * W), top + 1 + (i % 2), 1, 1);
    }
  }

  // Now and then a small fish clears the water well away from the boat.
  function fish(g, W, top, t, boatX) {
    const n = Math.floor(t / 23), q = (t % 23) / 1.1;
    if (q >= 1) return;
    let x = Math.floor(hash(n, 1, 71) * (W - 20)) + 10;
    if (Math.abs(x - boatX) < 30) x = (x + W / 2) % W;
    const fx = Math.round(x + q * 10), fy = top - Math.round(Math.sin(q * Math.PI) * 6);
    g.fillStyle = C.grey1; g.fillRect(fx, fy, 3, 1);
    g.fillStyle = C.white; g.fillRect(fx + 2, fy, 1, 1);
    g.fillStyle = C.grey2; g.fillRect(fx - 1, fy - 1 + (q > 0.5 ? 2 : 0), 1, 1);
    if (q < 0.18 || q > 0.82) { g.fillStyle = FOAM; g.fillRect(q < 0.5 ? x - 1 : x + 9, top, 3, 1); g.fillRect(q < 0.5 ? x : x + 10, top - 1, 1, 1); }
  }

  // One art pixel in CSS px: whole device pixels, as close to 1.5 as the
  // screen allows (1.5 at 2x, 4/3 at 3x, 1 at 1x), so the boat stays small
  // enough not to sit on the text scrolling past above the dock.
  function pickScale(dpr) {
    return P.hq.scales(dpr).filter((k) => k <= 2).reduce((best, k) =>
      Math.abs(k - 1.5) < Math.abs(best - 1.5) - 1e-6 ? k : best, 1);
  }

  // opts.pill: the dock's pill (position: relative); opts.sea: a canvas in a
  // box that clips it to the pill's shape; opts.boat: a canvas above the pill.
  // The links that stand for page sections carry data-sections.
  function mount(opts) {
    const { pill, sea: seaCanvas, boat: boatCanvas } = opts;
    const links = Array.from(pill.querySelectorAll("a[data-sections]"));
    const groups = links.map((a) => a.dataset.sections.split(" ").map((id) => document.getElementById(id)).filter(Boolean));
    const spr = P.sprites.build();
    const S = {
      sea: seaCanvas, boatC: boatCanvas, gs: seaCanvas.getContext("2d"), gb: boatCanvas.getContext("2d"),
      links, groups, boat: boat(spr), gull: gullArt(spr), water: null,
      x: -1, face: 1, clock: 0, moveT: -Infinity, off: null, dirty: true, W: 0, s: 1.5, cap: 0,
    };

    function size() {
      S.s = pickScale(window.devicePixelRatio || 1);
      const w = Math.floor(pill.clientWidth / S.s);
      const hB = ABOVE + 3; // the boat canvas reaches three rows into the sea
      S.W = w;
      // The pill's rounded ends, in art px: the boat stays on the straight part.
      S.cap = pill.clientHeight / 2 / S.s;
      seaCanvas.width = w; seaCanvas.height = SEA;
      seaCanvas.style.width = w * S.s + "px";
      seaCanvas.style.height = SEA * S.s + "px";
      boatCanvas.width = w; boatCanvas.height = hB;
      boatCanvas.style.width = w * S.s + "px";
      boatCanvas.style.height = hB * S.s + "px";
      // Row ABOVE of the boat canvas lines up with the sea's first row, which
      // sits on the pill's inner top edge.
      boatCanvas.style.top = -(ABOVE * S.s) + "px";
      S.water = bakeSea(w);
      S.dirty = true;
    }

    // Link centres in art pixels, relative to the pill's inner left edge.
    function centres() {
      const box = seaCanvas.getBoundingClientRect();
      return links.map((a) => { const r = a.getBoundingClientRect(); return (r.left + r.width / 2 - box.left) / S.s; });
    }

    // Boat and gull placement in boat-canvas px for a boat centred on x.
    const boatX = (x) => Math.round(x - S.boat.w / 2);
    const boatY = (bob) => ABOVE + 2 - (S.boat.h - 1) + bob;
    const perch = (x, face, bob) => ({ x: face > 0 ? boatX(x) - 1 : boatX(x) + S.boat.w + 1 - S.gull.w, y: boatY(bob) + HULL_Y - 3 });

    function read() {
      if (!links.length) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(window.scrollY, max);
      const lead = window.innerHeight * 0.4;
      const anchors = groups.map((els) => els.length ? Math.max(0, Math.min(max, els[0].getBoundingClientRect().top + window.scrollY - lead)) : max);
      const c = centres();
      let x = c[0];
      for (let i = 0; i < anchors.length - 1; i++) {
        if (y >= anchors[i]) {
          const span = Math.max(1, anchors[i + 1] - anchors[i]);
          x = c[i] + (c[i + 1] - c[i]) * Math.min(1, (y - anchors[i]) / span);
        }
      }
      if (y >= anchors[anchors.length - 1] - 1) x = c[c.length - 1];
      const half = S.boat.w / 2;
      x = Math.max(S.cap + half, Math.min(S.W - S.cap - half, x));
      if (S.x >= 0 && Math.abs(x - S.x) > 0.3) {
        // A gull standing on the stern takes off from where the boat was.
        if (S.clock - S.moveT >= LAND + 1) S.off = Object.assign(perch(S.x, S.face, 0), { t: S.clock, d: S.face });
        S.face = x > S.x ? 1 : -1;
        S.moveT = S.clock;
      }
      S.x = x;
      S.dirty = true;
    }

    // Foam where the float meets the water, and while sailing a wake off the
    // stern and a splash at the bow. ix is in boat px from the stern side.
    function waterline(g, bx, top, sailing) {
      const d = S.face, w = S.boat.w;
      const at = (ix, y, n) => { for (let i = 0; i < n; i++) g.fillRect(d > 0 ? bx + ix - i : bx + w - 1 - ix + i, y, 1, 1); };
      g.fillStyle = SHADE;
      for (let ix = 3; ix < w - 3; ix++) if (hash(ix + Math.floor(S.clock * 2), 3, 5) > 0.3) at(ix, top + 3, 1);
      for (let ix = 6; ix < w - 6; ix += 3) if (hash(ix, Math.floor(S.clock * 2), 6) > 0.5) at(ix, top + 4, 2);
      g.fillStyle = FOAM;
      at(1, top + 2, 1);
      at(27, top + 2, 1);
      if (!sailing) return;
      const f = Math.floor(S.clock * 8) % 2;
      at(1, top + 2, 4);
      at(-4 - f, top + 1, 3);
      at(-9 - f, top + 2, 3);
      at(-14 - f, top + 1, 2);
      at(27 + f, top + 1, 1);
      at(28 + f, top, 1);
    }

    // Standing on the stern while I stay put; paused, it simply stands there.
    function gull(g, bob, playing) {
      const art = S.gull, d = S.face, p = perch(S.x, d, bob);
      const stand = d > 0 ? art.right : art.left;
      const rest = S.clock - S.moveT;
      if (!playing || rest >= LAND + 0.85) { g.drawImage(stand, p.x, p.y); return; }
      const wing = art.fly[Math.floor(S.clock * 8) % 2];
      if (rest >= LAND) {
        // Gliding in low from behind the stern over most of a second.
        const e = 1 - Math.pow(1 - (rest - LAND) / 0.85, 2);
        g.drawImage(wing, Math.round(p.x + 1 - d * 22 * (1 - e)), Math.round(p.y + 1 - 5 * (1 - e)));
        return;
      }
      const o = S.off, age = o ? S.clock - o.t : LEAVE;
      if (age < LEAVE) g.drawImage(wing, Math.round(o.x + 1 - o.d * 24 * age), Math.round(o.y + 1 - 6 * age));
    }

    function draw(bob, playing) {
      const W = S.W, sailing = playing && S.clock - S.moveT < 0.25;
      const bx = boatX(S.x);
      const gs = S.gs;
      gs.clearRect(0, 0, W, SEA);
      gs.drawImage(S.water, 0, 0);
      swell(gs, W, 0, S.clock);
      waterline(gs, bx, 0, sailing);
      const gb = S.gb;
      gb.clearRect(0, 0, W, ABOVE + 3);
      if (playing) fish(gb, W, ABOVE, S.clock, S.x);
      gb.drawImage(S.face < 0 ? S.boat.left : S.boat.right, bx, boatY(bob));
      gull(gb, bob, playing);
    }

    size();
    const ro = new ResizeObserver(() => { size(); read(); });
    ro.observe(pill);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    read();
    return {
      S,
      tick(dt, playing) {
        if (playing) S.clock += dt;
        const bob = playing ? (Math.sin(S.clock * 2.4) > 0.2 ? 1 : 0) : 0;
        if (S.dirty || playing) { S.dirty = false; draw(bob, playing); }
      },
      setTime(t) { S.clock = t; S.dirty = true; },
      destroy() {
        ro.disconnect();
        window.removeEventListener("scroll", read);
        window.removeEventListener("resize", read);
      },
    };
  }

  P.dock = { mount };
})((window.PETA = window.PETA || {}));
