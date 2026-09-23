/* Animated variants of the HealthWeb1 / EduWeb4 card content, for the
   WorkReel video previews ("videonya kek data dan fitur di mockup tersebut
   bergerak"). Deliberately NOT framer-motion or CSS keyframes: every visual
   is a pure function of a `progress` prop (0..1), so a frame at any instant
   is exactly reproducible -- the same "update(t), zero real-time animation
   state" approach as the threejs-film skill, just for DOM instead of
   canvas. That determinism is what makes frame-by-frame screenshot capture
   (see scripts/record-mockup-video.mjs) line up cleanly into a video: no
   timer drift between the browser's real clock and the capture loop.

   Reveal easing follows animista's `slide-in-fwd-bottom` (0.4s easeOutQuad):
   translateY 8px->0 + opacity 0->1, staggered per row/tile. Numeric values
   (marker readings, table deltas, progress-bar widths) count up inside the
   same local window instead of popping in, so the loop reads as live data
   refreshing rather than a static image fading in piece by piece. */

const easeOutQuad = (t: number) => t * (2 - t);

/** Local 0..1 progress within [start, end] of the overall timeline, eased. */
function windowProgress(progress: number, start: number, end: number) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return easeOutQuad((progress - start) / (end - start));
}

function reveal(local: number): React.CSSProperties {
  return {
    opacity: local,
    transform: `translateY(${(1 - local) * 8}px)`,
  };
}

const HP = {
  bg: "#f8f6ee",
  strip: "#f3f1e6",
  card: "#ffffff",
  card2: "#f3f1e6",
  line: "rgba(28,58,47,0.12)",
  accent: "#c94e12",
  mint: "#2f9e6e",
  amber: "#d98f2f",
  red: "#d94f4f",
  sky: "#2f8fd9",
  ink: "#1c3a2f",
  dim: "#4f6b5c",
  mute: "#7c9186",
};

const HEALTH_MARKERS = [
  { v: 5.4, l: "Total cholesterol", u: "mmol/L", c: HP.amber, dp: 1 },
  { v: 3.4, l: "LDL-C", u: "mmol/L", c: HP.amber, dp: 1 },
  { v: 3.7, l: "Non-HDL", u: "mmol/L", c: HP.amber, dp: 1 },
  { v: 2.31, l: "Calcium", u: "mmol/L", c: HP.mint, dp: 2 },
  { v: 0.34, l: "Uric acid", u: "mmol/L", c: HP.mint, dp: 2 },
];

const HEALTH_TRENDS = [
  { l: "HRV", u: "ms", now: 58, prev: 54 },
  { l: "Resting HR", u: "bpm", now: 51, prev: 53 },
  { l: "Sleep score", u: "", now: 84, prev: 79 },
  { l: "Steps", u: "/day", now: 9240, prev: 8610 },
];

/** Same header chrome as HealthWeb1 (TopStrip + Head + DeviceStrip +
    Segmented), held static -- only the content below animates. */
function HealthChrome() {
  const nav = ["Dashboard", "Insights", "Plan", "Progress", "Enterprise"];
  const devices = ["Readiness", "Resting HR", "HRV", "Sleep score", "Steps", "Active kcal"];
  const tabs = ["Today's plan", "Biomarkers", "Genetics", "Bodyscan", "Vitals"];
  return (
    <>
      <div className="flex shrink-0 items-center justify-between px-3 py-[3px]" style={{ background: HP.strip }}>
        <span className="mono text-[6px]" style={{ color: HP.dim }}>
          Today&apos;s priorities: <span style={{ color: HP.ink }}>Raise dietary nitrate</span>
        </span>
        <span className="mono flex items-center gap-1 text-[6px]" style={{ color: HP.amber }}>
          1 DAY STREAK
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3 px-3 py-2">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md" style={{ background: `linear-gradient(140deg, ${HP.accent}, ${HP.mint})`, color: "#f8f6ee" }} />
        <div className="mx-auto flex items-center gap-0.5">
          {nav.map((n, i) => (
            <span key={n} className="mono rounded-full px-1.5 py-[3px] text-[6.5px]" style={i === 0 ? { background: `${HP.amber}26`, color: HP.ink } : { color: HP.mute }}>
              {n}
            </span>
          ))}
        </div>
        <span className="h-4 w-4 rounded-full" style={{ background: HP.accent }} />
      </div>
      <div className="grid shrink-0 grid-cols-6 gap-1 px-3">
        {devices.map((d) => (
          <div key={d} className="rounded border px-1.5 py-1" style={{ background: HP.card, borderColor: HP.line }}>
            <div className="mono flex items-center gap-1 text-[5.5px]" style={{ color: HP.dim }}>
              <span className="truncate">{d}</span>
            </div>
            <div className="mono mt-1 text-[5px] underline underline-offset-2" style={{ color: HP.mute }}>
              Connect a device
            </div>
          </div>
        ))}
      </div>
      <div className="mx-3 mt-1.5 flex shrink-0 items-center rounded-lg border p-[3px]" style={{ background: HP.card, borderColor: HP.line }}>
        {tabs.map((t, i) => (
          <span key={t} className="mono flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[6px]" style={i === 1 ? { background: `${HP.amber}26`, color: HP.ink } : { color: HP.mute }}>
            {t}
          </span>
        ))}
      </div>
    </>
  );
}

export function HealthAnimatedCard({ progress }: { progress: number }) {
  const headLocal = windowProgress(progress, 0.03, 0.1);
  const tileLocal = HEALTH_MARKERS.map((_, i) => windowProgress(progress, 0.1 + i * 0.035, 0.1 + i * 0.035 + 0.06));
  const flagLocal = windowProgress(progress, 0.28, 0.34);
  const ctaLocal = windowProgress(progress, 0.34, 0.4);
  const trendsHeadLocal = windowProgress(progress, 0.4, 0.44);
  const rowLocal = HEALTH_TRENDS.map((_, i) => windowProgress(progress, 0.46 + i * 0.11, 0.46 + i * 0.11 + 0.09));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: HP.bg, color: HP.ink }}>
      <HealthChrome />
      <div className="mt-1.5 flex-1 space-y-1.5 overflow-hidden px-3 pb-3">
        <div className="rounded-xl border p-2.5" style={{ background: HP.card, borderColor: HP.line }}>
          <div className="mono flex items-center gap-1 text-[6.5px] tracking-wide" style={{ color: HP.mint, ...reveal(headLocal) }}>
            NEW RESULTS &middot; 3 DAYS AGO
          </div>
          <div className="mt-1 text-[12px] font-semibold tracking-tight" style={reveal(headLocal)}>
            Your blood panel results are in
          </div>
          <div className="mt-0.5 text-[7px]" style={{ color: HP.dim, ...reveal(headLocal) }}>
            <span style={{ color: HP.ink }}>78 markers</span> analysed.{" "}
            <span style={{ color: HP.amber, opacity: flagLocal }}>{Math.round(flagLocal * 12)}</span> flagged for follow-up.
          </div>
          <div className="mt-1.5 grid grid-cols-5 gap-1.5">
            {HEALTH_MARKERS.map((m, i) => (
              <div key={m.l} className="rounded-lg border px-2 py-1.5 text-center" style={{ background: HP.card2, borderColor: HP.line, ...reveal(tileLocal[i]) }}>
                <div className="mono text-[11px] font-semibold" style={{ color: m.c }}>
                  {(m.v * tileLocal[i]).toFixed(m.dp)}
                </div>
                <div className="mono mt-0.5 text-[5.5px] leading-tight" style={{ color: HP.dim }}>
                  {m.l}
                </div>
                <div className="mono text-[5px]" style={{ color: HP.mute }}>
                  {m.u}
                </div>
              </div>
            ))}
          </div>
          <span
            className="mono mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[6.5px]"
            style={{ background: HP.accent, color: "#f8f6ee", ...reveal(ctaLocal) }}
          >
            View full report &rarr;
          </span>
        </div>

        <div className="rounded-xl border p-2.5" style={{ background: HP.card, borderColor: HP.line }}>
          <div className="mono flex items-center gap-1 text-[6.5px] tracking-wide" style={{ color: HP.sky, ...reveal(trendsHeadLocal) }}>
            RECENT TRENDS &middot; 7 DAYS
          </div>
          <div className="mono mt-1.5 grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr] gap-1 border-b pb-1 text-[5px] uppercase tracking-wide" style={{ borderColor: HP.line, color: HP.mute, ...reveal(trendsHeadLocal) }}>
            <span>Metric</span>
            <span>This week</span>
            <span>Last week</span>
            <span>Change</span>
          </div>
          {HEALTH_TRENDS.map((row, i) => {
            const delta = row.now - row.prev;
            const up = delta >= 0;
            const local = rowLocal[i];
            const shownNow = Math.round(row.now * local);
            const shownDelta = Math.round(delta * local);
            return (
              <div key={row.l} className="mono grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr] items-center gap-1 border-b py-[5px] text-[6px]" style={{ borderColor: HP.line, ...reveal(local) }}>
                <span style={{ color: HP.ink }}>{row.l}</span>
                <span style={{ color: HP.dim }}>
                  {shownNow.toLocaleString()}
                  {row.u}
                </span>
                <span style={{ color: HP.mute }}>
                  {row.prev.toLocaleString()}
                  {row.u}
                </span>
                <span style={{ color: up ? HP.mint : HP.red, fontWeight: 600 }}>
                  {up ? "+" : ""}
                  {shownDelta}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const EP = {
  headerTop: "#f3f1e6",
  body: "#f8f6ee",
  white: "#ffffff",
  line: "rgba(28,58,47,0.12)",
  accent: "#c94e12",
  ink: "#1c3a2f",
  inkDim: "#4f6b5c",
};

const EDU_CLASSES = [
  { l: "Class A", sub: "Science 10", n: 28, done: 86, avg: 74 },
  { l: "Class B", sub: "Science 10", n: 26, done: 71, avg: 68 },
  { l: "Class C", sub: "Biology 11", n: 24, done: 92, avg: 81 },
  { l: "Class D", sub: "Biology 11", n: 22, done: 34, avg: 0 },
  { l: "Class E", sub: "Chemistry 10", n: 27, done: 78, avg: 70 },
  { l: "Class F", sub: "Physics 10", n: 25, done: 64, avg: 66 },
];

const EDU_SUBJECTS = [
  { l: "Biology", v: 76, c: "#2f9e6e" },
  { l: "Chemistry", v: 69, c: "#2f8fd9" },
  { l: "Physics", v: 66, c: "#8a5fd9" },
  { l: "Forensics", v: 72, c: "#d94f4f" },
];

function EduChrome() {
  const nav = ["My subjects", "Glossary", "Results", "Saved items", "Quiz hub"];
  return (
    <div className="flex shrink-0 items-center gap-3 px-3 py-2" style={{ background: EP.headerTop }}>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded" style={{ background: "rgba(28,58,47,0.12)", color: EP.ink }} />
      <div className="ml-auto flex items-center gap-2.5">
        {nav.map((n) => (
          <span key={n} className="mono text-[6.5px] uppercase tracking-wide" style={{ color: EP.ink }}>
            {n}
          </span>
        ))}
        <span className="mono grid h-4 w-4 place-items-center rounded-full text-[6px] font-semibold" style={{ background: EP.accent, color: "#f8f6ee" }}>
          ?
        </span>
        <span className="mono grid h-4 w-4 place-items-center rounded-full text-[5.5px] font-semibold" style={{ background: EP.accent, color: "#f8f6ee" }}>
          AK
        </span>
      </div>
    </div>
  );
}

export function EducationAnimatedCard({ progress }: { progress: number }) {
  const headLocal = windowProgress(progress, 0.02, 0.08);
  const rowLocal = EDU_CLASSES.map((_, i) => windowProgress(progress, 0.08 + i * 0.075, 0.08 + i * 0.075 + 0.065));
  const summaryLocal = windowProgress(progress, 0.55, 0.62);
  const activityLocal = windowProgress(progress, 0.62, 0.7);
  const subjLocal = EDU_SUBJECTS.map((_, i) => windowProgress(progress, 0.72 + i * 0.06, 0.72 + i * 0.06 + 0.06));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: EP.body, color: EP.ink }}>
      <EduChrome />
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2.5">
        <div className="flex items-start gap-2">
          <div className="flex-[3] rounded-md p-2.5" style={{ background: EP.white }}>
            <div className="flex items-baseline" style={reveal(headLocal)}>
              <span className="text-[9px] font-semibold">Class performance</span>
              <span className="mono ml-auto text-[6px]" style={{ color: EP.inkDim }}>
                Fortnight to 21 Aug
              </span>
            </div>
            <div className="mono mt-2 grid grid-cols-[1.6fr_0.5fr_1.2fr_0.6fr] gap-1 border-b pb-1 text-[5.5px] uppercase tracking-wide" style={{ borderColor: EP.line, color: EP.inkDim, ...reveal(headLocal) }}>
              <span>Class</span>
              <span>Students</span>
              <span>Quiz completion</span>
              <span>Avg</span>
            </div>
            {EDU_CLASSES.map((c, i) => {
              const local = rowLocal[i];
              const shownDone = Math.round(c.done * local);
              return (
                <div key={c.l} className="mono grid grid-cols-[1.6fr_0.5fr_1.2fr_0.6fr] items-center gap-1 border-b py-[5px] text-[6px]" style={{ borderColor: EP.line, ...reveal(local) }}>
                  <span>
                    {c.l} <span style={{ color: EP.inkDim }}>&middot; {c.sub}</span>
                  </span>
                  <span style={{ color: EP.inkDim }}>{c.n}</span>
                  <span className="flex items-center gap-1">
                    <span className="h-[4px] flex-1 rounded-full" style={{ background: EP.line }}>
                      <span className="block h-full rounded-full" style={{ width: `${shownDone}%`, background: c.done < 50 ? "#d94f4f" : EP.accent }} />
                    </span>
                    <span style={{ color: EP.inkDim }}>{shownDone}%</span>
                  </span>
                  <span style={{ fontWeight: 600, color: c.avg === 0 ? EP.inkDim : EP.ink }}>{c.avg === 0 ? "no data yet" : Math.round(c.avg * local)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex-[2] rounded-md p-2.5" style={{ background: EP.white, borderLeft: `3px solid ${EP.accent}`, ...reveal(summaryLocal) }}>
            <div className="mono flex items-center gap-1 text-[6.5px] font-semibold uppercase tracking-wide" style={{ color: EP.accent }}>
              Fortnightly summary
            </div>
            <div className="mt-1.5 text-[6.5px] leading-relaxed" style={{ color: EP.ink }}>
              Two classes finished the Genetics unit ahead of pace. Punnett squares
              is the weakest topic across all four groups, with the biggest gap in
              Class B.
            </div>
            <div className="mono mt-2 flex items-center gap-1 rounded px-2 py-[4px] text-[6px]" style={{ background: EP.accent, color: "#f8f6ee" }}>
              Email this to my teachers
            </div>
          </div>
        </div>

        <div className="rounded-md p-2.5" style={{ background: EP.white, ...reveal(activityLocal) }}>
          <div className="mono text-[6px] uppercase tracking-wide" style={{ color: EP.inkDim }}>
            Recent quiz activity
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {[
              { c: "Class A", t: "Inheritance patterns", v: "24/28 submitted" },
              { c: "Class C", t: "Punnett squares", v: "22/24 submitted" },
              { c: "Class E", t: "Reaction rates", v: "19/27 submitted" },
              { c: "Class F", t: "Forces and motion", v: "16/25 submitted" },
            ].map((a) => (
              <div key={a.c} className="rounded border px-2 py-1.5" style={{ borderColor: EP.line }}>
                <div className="mono text-[6px] font-semibold">{a.c}</div>
                <div className="mono mt-1 text-[6px]" style={{ color: EP.ink }}>
                  {a.t}
                </div>
                <div className="mono text-[5.5px]" style={{ color: EP.inkDim }}>
                  {a.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md p-2.5" style={{ background: EP.white }}>
          <div className="mono text-[6px] uppercase tracking-wide" style={{ color: EP.inkDim }}>
            Subject breakdown &middot; avg quiz score
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {EDU_SUBJECTS.map((s, i) => {
              const local = subjLocal[i];
              return (
                <div key={s.l} style={reveal(local)}>
                  <div className="mono flex items-baseline text-[6px]">
                    <span style={{ color: EP.ink }}>{s.l}</span>
                    <span className="ml-auto font-semibold" style={{ color: s.c }}>
                      {Math.round(s.v * local)}
                    </span>
                  </div>
                  <div className="mt-[3px] h-[4px] rounded-full" style={{ background: EP.line }}>
                    <div className="h-full rounded-full" style={{ width: `${s.v * local}%`, background: s.c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
