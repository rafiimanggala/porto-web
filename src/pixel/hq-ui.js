// Agent HQ, the DOM half: an APG layout grid laid over the building (rows are
// floors, cells are rooms), a card for the selected agent, and the sizing that
// keeps the canvas on whole device pixels. The canvas itself is aria-hidden;
// everything a reader needs is in the grid and the card.
(function (P) {
  "use strict";
  const { STATUS } = P.data;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ICON_OUT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 2h5v5h-2V5.4L7.7 9.7 6.3 8.3 10.6 4H9zM2 4h5v2H4v6h6V9h2v5H2z"/></svg>';

  // The visible plate text is a piece of the full name; the rest of the name
  // and the status stay in the accessible name only.
  function plateHTML(a) {
    const vis = a.plate || a.name;
    const i = a.name.indexOf(vis);
    const pre = a.name.slice(0, i), post = a.name.slice(i + vis.length);
    return '<span class="plate"><span class="pip st-' + a.status + '" aria-hidden="true"></span>' +
      '<span class="plate-t">' + (pre ? '<span class="sr">' + esc(pre) + "</span>" : "") + esc(vis) +
      (post ? '<span class="sr">' + esc(post) + "</span>" : "") +
      '<span class="sr">, ' + esc(STATUS[a.status].label.toLowerCase()) + "</span></span></span>";
  }

  function buildGrid(S) {
    const grid = S.dom.grid;
    grid.innerHTML = "";
    S.cells = [];
    for (const F of S.L.floors) {
      const row = document.createElement("div");
      row.className = "hq-row";
      row.setAttribute("role", "row");
      const head = document.createElement("div");
      head.className = "hq-sign";
      head.setAttribute("role", "rowheader");
      head.innerHTML = '<span class="sg-name">' + esc(F.fl.name) + '</span><span class="sg-note">' + esc(F.fl.note) + "</span>";
      row.appendChild(head);
      const cells = [];
      for (const r of F.rows.flat()) {
        const cell = document.createElement("div");
        cell.className = "hq-cell";
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-selected", "false");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "hq-room";
        b.tabIndex = -1;
        b.dataset.id = r.agent.id;
        b.innerHTML = plateHTML(r.agent);
        cell.appendChild(b);
        row.appendChild(cell);
        cells.push({ cell, b, r, head });
      }
      grid.appendChild(row);
      S.cells.push(cells);
    }
    placeGrid(S);
  }

  // Move every sign and room box onto its spot in the scaled canvas.
  function placeGrid(S) {
    const s = S.L.s;
    const box = (el, x, y, w, h) => {
      el.style.left = x * s + "px"; el.style.top = y * s + "px";
      el.style.width = w * s + "px"; el.style.height = h * s + "px";
    };
    S.L.floors.forEach((F, fi) => {
      const cells = S.cells[fi];
      box(cells[0].head, F.sign.x, F.sign.y, F.sign.w, F.sign.h);
      for (const c of cells) {
        const r = S.L.rooms.find((q) => q.agent.id === c.b.dataset.id);
        c.r = r;
        box(c.cell, r.x, r.y, r.w, r.h);
      }
    });
  }

  function find(S, id) {
    for (let f = 0; f < S.cells.length; f++) {
      const i = S.cells[f].findIndex((c) => c.b.dataset.id === id);
      if (i >= 0) return { f, i };
    }
    return null;
  }

  function setRoving(S, id) {
    for (const row of S.cells) for (const c of row) c.b.tabIndex = c.b.dataset.id === id ? 0 : -1;
    S.roving = id;
  }

  function onKey(S, e) {
    const at = find(S, e.target.dataset && e.target.dataset.id);
    if (!at) return;
    let { f, i } = at;
    const last = S.cells.length - 1;
    switch (e.key) {
      case "ArrowRight": i = Math.min(i + 1, S.cells[f].length - 1); break;
      case "ArrowLeft": i = Math.max(i - 1, 0); break;
      case "ArrowDown": f = Math.min(f + 1, last); i = Math.min(i, S.cells[f].length - 1); break;
      case "ArrowUp": f = Math.max(f - 1, 0); i = Math.min(i, S.cells[f].length - 1); break;
      case "Home": if (e.ctrlKey) f = 0; i = 0; break;
      case "End": if (e.ctrlKey) f = last; i = S.cells[f].length - 1; break;
      case "Escape": if (S.mode === "sheet" && !S.dom.card.hidden) { closeSheet(S); e.preventDefault(); } return;
      default: return;
    }
    e.preventDefault();
    const c = S.cells[f][i];
    setRoving(S, c.b.dataset.id);
    c.b.focus({ preventScroll: false });
  }

  // ---- the agent card --------------------------------------------------------------
  function cardHTML(a) {
    const st = STATUS[a.status];
    const floor = P.data.FLOORS.find((f) => f.id === a.floor);
    const stack = a.stack.map((x) => '<li class="chip">' + esc(x) + "</li>").join("");
    const verbs = a.verbs.map((x) => "<li>" + esc(x) + "</li>").join("");
    // A case study on this site opens in place; code on GitHub opens a new tab.
    const inSite = a.link && a.link.href.charAt(0) === "/";
    const link = !a.link ? "" : inSite
      ? '<a class="btn primary c-link" href="' + a.link.href + '">' + esc(a.link.label) + "</a>"
      : '<a class="btn primary c-link" href="' + a.link.href + '" target="_blank" rel="noopener">' + esc(a.link.label) + ICON_OUT + '<span class="sr"> (opens in a new tab)</span></a>';
    return '<h3 id="hq-card-title" tabindex="-1">' + esc(a.name) + "</h3>" +
      '<p class="c-status"><span class="tag st-' + a.status + '">' + esc(st.label) + "</span><span>" + esc(st.note) + "</span></p>" +
      '<p class="c-does">' + esc(a.does) + "</p>" +
      '<dl class="c-facts">' +
      "<div><dt>How it runs</dt><dd>" + esc(a.runs) + "</dd></div>" +
      "<div><dt>Room</dt><dd>" + esc(floor.name) + "</dd></div>" +
      "<div><dt>Built for</dt><dd>" + (a.kind === "Client" ? "A client" : "Myself") + "</dd></div>" +
      "<div><dt>Since</dt><dd>" + esc(a.since) + "</dd></div></dl>" +
      '<h4 class="c-h">A typical run</h4><ul class="c-verbs">' + verbs + "</ul>" +
      '<h4 class="c-h">Stack</h4><ul class="c-stack">' + stack + "</ul>" + link;
  }

  function select(S, id, how) {
    const a = P.data.AGENTS.find((x) => x.id === id);
    if (!a) return;
    S.sel = id;
    for (const row of S.cells) for (const c of row) c.cell.setAttribute("aria-selected", String(c.b.dataset.id === id));
    S.dom.cardBody.innerHTML = cardHTML(a);
    S.dirty = true;
    if (S.mode === "sheet") { if (how) openSheet(S, true); }
    else if (how) S.dom.live.textContent = a.name + ", " + STATUS[a.status].label.toLowerCase() + ". Details shown next to the building.";
  }

  function openSheet(S, moveFocus) {
    const card = S.dom.card;
    const fresh = card.hidden;
    card.hidden = false;
    if (fresh && !S.reduce) { card.classList.remove("entering"); void card.offsetWidth; card.classList.add("entering"); }
    if (moveFocus) {
      const h = card.querySelector("#hq-card-title");
      if (h) h.focus({ preventScroll: true });
    }
  }

  function closeSheet(S) {
    const card = S.dom.card;
    if (card.hidden) return;
    card.classList.remove("entering");
    card.hidden = true;
    const back = S.cells.flat().find((c) => c.b.dataset.id === S.sel);
    if (back) back.b.focus({ preventScroll: true });
  }

  // ---- sizing ----------------------------------------------------------------------
  function relayout(S) {
    // The card sits beside the building only when the building can still get
    // its full 2x pixels next to it (860px); otherwise it becomes a sheet.
    const bodyW = S.dom.body.clientWidth;
    const mode = bodyW - 324 - 12 >= 860 ? "side" : "sheet";
    if (mode !== S.mode) {
      S.mode = mode;
      S.dom.section.dataset.mode = mode;
      S.dom.card.hidden = mode === "sheet";
      S.dom.cardX.hidden = mode === "side";
    }
    const cw = S.dom.stage.clientWidth - 12; // the board's pixel frame
    const dpr = window.devicePixelRatio || 1;
    const key = cw + ":" + dpr;
    if (key === S.sizeKey) return;
    S.sizeKey = key;
    const fresh = !S.L;
    S.L = P.hq.layout(cw, dpr);
    S.dom.board.style.width = S.L.artW * S.L.s + "px";
    S.dom.board.style.height = S.L.artH * S.L.s + "px";
    S.canvas.width = S.L.artW;
    S.canvas.height = S.L.artH;
    S.canvas.style.imageRendering = "pixelated";
    S.dom.section.style.setProperty("--hq-s", S.L.s);
    if (fresh) buildGrid(S); else placeGrid(S);
    bake(S);
  }

  function bake(S) {
    S.bk = P.hq.bucket(P.hq.wibHour());
    S.skyLayer = P.hq.bakeSky(S.L, S.bk);
    S.buildLayer = P.hq.bakeBuilding(S.L, S.bk);
    S.dom.section.dataset.sky = S.bk;
    S.dirty = true;
  }

  // Keep the note under the building in step with Jakarta's clock.
  function clockText() {
    const d = new Date(Date.now() + 7 * 3600e3);
    const hh = String(d.getUTCHours()).padStart(2, "0"), mm = String(d.getUTCMinutes()).padStart(2, "0");
    return hh + ":" + mm;
  }

  function tickClock(S) {
    S.dom.clock.textContent = clockText();
    const bk = P.hq.bucket(P.hq.wibHour());
    if (bk !== S.bk) bake(S);
  }

  function wire(S) {
    const grid = S.dom.grid;
    grid.addEventListener("keydown", (e) => onKey(S, e));
    grid.addEventListener("click", (e) => {
      const b = e.target.closest(".hq-room");
      if (!b) return;
      setRoving(S, b.dataset.id);
      select(S, b.dataset.id, e.detail === 0 ? "key" : "click");
    });
    grid.addEventListener("focusin", (e) => {
      const b = e.target.closest(".hq-room");
      if (b) { S.hot = b.dataset.id; S.dirty = true; }
    });
    grid.addEventListener("focusout", () => { S.hot = null; S.dirty = true; });
    grid.addEventListener("pointerover", (e) => {
      const b = e.target.closest(".hq-room");
      S.hot = b ? b.dataset.id : null; S.dirty = true;
    });
    grid.addEventListener("pointerleave", () => { S.hot = null; S.dirty = true; });
    S.dom.cardX.addEventListener("click", () => closeSheet(S));
    S.dom.card.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && S.mode === "sheet") { e.preventDefault(); closeSheet(S); }
    });
    // A drag-resize fires every frame and each new width re-bakes all 18 rooms,
    // so wait until the size settles.
    let settle = 0;
    const ro = new ResizeObserver(() => { clearTimeout(settle); settle = setTimeout(() => relayout(S), 100); });
    ro.observe(S.dom.body);
    const timer = setInterval(() => tickClock(S), 30000);
    return () => { ro.disconnect(); clearTimeout(settle); clearInterval(timer); };
  }

  function mount(opts) {
    const $ = (id) => document.getElementById(id);
    const canvas = $("hq-canvas");
    const S = {
      canvas, g: canvas.getContext("2d"),
      dom: {
        section: $("agents"), body: $("hq-body"), stage: $("hq-stage"), board: $("hq-board"), grid: $("hq-grid"),
        card: $("hq-card"), cardBody: $("hq-card-body"), cardX: $("hq-card-x"), live: $("hq-live"), clock: $("hq-clock"),
      },
      reduce: opts.reduce, clock: 0, acc: 0, dirty: true, still: false,
    };
    P.hq.buildArt();
    relayout(S);
    setRoving(S, "claude");
    select(S, "claude", null);
    tickClock(S);
    const unwire = wire(S);
    return {
      S,
      tick(dt, playing) {
        S.still = !playing;
        if (playing) { S.clock += dt; S.acc += dt; }
        // Pixel motion reads best stepped: redraw at most 30 times a second.
        if (S.dirty || (playing && S.acc >= 1 / 30)) {
          S.acc = 0; S.dirty = false;
          P.hq.frame(S, S.clock);
        }
      },
      setTime(t) { S.clock = t; S.dirty = true; },
      destroy: unwire,
    };
  }

  P.hqUI = { mount };
})((window.PETA = window.PETA || {}));
