// The pixel scenes on /lab: the four gallery pieces, each drawn by its own
// code. They rest on a still frame; Play runs one at a time, and a scene that
// scrolls out of view stops drawing until it comes back.
(function (P) {
  "use strict";
  const { PIECES } = P.data;

  function fit(canvas, box, w, h) {
    const cw = box.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    const k0 = cw / w;
    const dev = Math.floor(k0 * dpr);
    const k = dev >= dpr ? Math.min(2, dev / dpr) : k0;
    canvas.style.width = Math.round(w * k) + "px";
    canvas.style.height = Math.round(h * k) + "px";
    canvas.style.imageRendering = k >= 1 ? "pixelated" : "auto";
  }

  // root holds one [data-scene="<id>"] block per piece, each with a canvas,
  // a .scene-screen box and a Play button.
  function mount(root) {
    const players = [];
    const observers = [];
    for (const pc of PIECES) {
      const block = root.querySelector('[data-scene="' + pc.id + '"]');
      if (!block) continue;
      const canvas = block.querySelector("canvas");
      const btn = block.querySelector("button");
      const box = block.querySelector(".scene-screen");
      const art = globalThis.GALERI && globalThis.GALERI[pc.id];
      if (!art) { block.classList.add("scene-missing"); btn.disabled = true; continue; }
      canvas.width = art.w; canvas.height = art.h;
      const ctx = canvas.getContext("2d", { alpha: false });
      const img = ctx.createImageData(art.w, art.h);
      const pl = { pc, art, ctx, img, out: new Uint32Array(img.data.buffer), t: pc.still, playing: false, visible: false, btn, canvas, box, acc: 0 };
      const paint = () => { pl.art.draw(pl.out, pl.t); pl.ctx.putImageData(pl.img, 0, 0); };
      pl.paint = paint;
      paint();
      fit(canvas, box, art.w, art.h);
      const ro = new ResizeObserver(() => fit(canvas, box, art.w, art.h));
      ro.observe(box);
      const io = new IntersectionObserver((es) => { pl.visible = es[0].isIntersecting; });
      io.observe(box);
      observers.push(ro, io);
      btn.addEventListener("click", () => setPlaying(pl, !pl.playing));
      players.push(pl);
    }

    function setPlaying(pl, on) {
      for (const q of players) {
        const next = q === pl ? on : false;
        if (next && !q.playing) q.t = q.pc.start;
        q.playing = next;
        q.btn.setAttribute("aria-pressed", String(next));
        q.box.classList.toggle("is-live", next);
      }
    }

    return {
      players,
      // A scene the reader started runs even when the rest of the site is
      // paused: pressing Play is an explicit request for that motion.
      tick(dt) {
        for (const pl of players) {
          if (!pl.playing || !pl.visible) continue;
          pl.t += dt; pl.acc += dt;
          if (pl.acc >= 1 / 30) { pl.acc = 0; pl.paint(); }
        }
      },
      stopAll() { for (const pl of players) setPlaying(pl, false); },
      destroy() { for (const o of observers) o.disconnect(); },
    };
  }

  P.lab = { mount };
})((window.PETA = window.PETA || {}));
