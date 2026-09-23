/* Animated variants of the HealthWeb1 / EduWeb4 card content, for the
   WorkReel video previews ("videonya kek data dan fitur di mockup tersebut
   bergerak"). Deliberately NOT framer-motion or CSS keyframes: every visual
   is a pure function of a `progress` prop (0..1), so a frame at any instant
   is exactly reproducible -- the same "update(t), zero real-time animation
   state" approach as the threejs-film skill, just for DOM instead of
   canvas. That determinism is what makes frame-by-frame screenshot capture
   line up cleanly into a video: no timer drift between the browser's real
   clock and the capture loop.

   Mirrors health.tsx's HealthWeb1 and education.tsx's EduWeb4 after their
   hero-KPI + supporting-tier restructure (2026-09-23 ui-improve pass) --
   these two were an independent reimplementation, not a literal render of
   those components, so they'd gone stale against the old 4-equal-card
   layout. Rebuilt against the live hero card, band/threshold colour rules,
   and BrowserWindow's fixed aspect-[16/10] crop (frame.tsx): everything
   past what that box actually shows (RECENT TRENDS, quiz activity, subject
   breakdown) is real content but sits below the visible crop, so it isn't
   worth animating here.

   Four distinct techniques carry the "more diverse" ask, not one repeated
   reveal: a circular stroke draw-in for the score ring (ringDash below,
   new to this file), a number count-up synced to it, a bar-width race for
   domain/completion bars, and the original staggered card/row reveal.
   Reveal easing follows animista's `slide-in-fwd-bottom` (0.4s
   easeOutQuad): translateY 8px->0 + opacity 0->1, staggered per row/tile. */

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

/** SVG stroke-dasharray for a ring gauge drawing in to `final` percent. */
function ringDash(local: number, final: number) {
  return `${(final * local).toFixed(1)} 100`;
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
  ink: "#1c3a2f",
  dim: "#4f6b5c",
  mute: "#7c9186",
};

// Same "band drives colour, not identity" rule as health.tsx's bandColor():
// two tiers only, since every band present is a positive result.
function healthBandColor(band: string) {
  return band === "Good" ? HP.amber : HP.mint;
}

const HEALTH_DOMAINS = [
  { l: "Cardiovascular", v: 74, band: "Good" },
  { l: "Metabolic", v: 93, band: "Elite" },
  { l: "Vitals & Fitness", v: 79, band: "Excellent" },
  { l: "Inflammation", v: 81, band: "Excellent" },
  { l: "Organ", v: 95, band: "Elite" },
  { l: "Body Composition", v: 88, band: "Elite" },
];

const HEALTH_MARKERS = [
  { v: 5.4, l: "Total cholesterol", u: "mmol/L", c: HP.amber, dp: 1 },
  { v: 3.4, l: "LDL-C", u: "mmol/L", c: HP.amber, dp: 1 },
  { v: 3.7, l: "Non-HDL", u: "mmol/L", c: HP.amber, dp: 1 },
  { v: 2.31, l: "Calcium", u: "mmol/L", c: HP.mint, dp: 2 },
  { v: 0.34, l: "Uric acid", u: "mmol/L", c: HP.mint, dp: 2 },
];

const HEALTH_STATS = [
  { v: "6/9", l: "MARKERS IMPROVING" },
  { v: "7", l: "GOALS" },
  { v: "12%", l: "AVG IMPROVEMENT" },
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
  const headLocal = windowProgress(progress, 0.02, 0.08);
  const ringLocal = windowProgress(progress, 0.06, 0.22);
  const domainLocal = HEALTH_DOMAINS.map((_, i) => windowProgress(progress, 0.2 + i * 0.025, 0.2 + i * 0.025 + 0.05));
  const statsLocal = windowProgress(progress, 0.38, 0.46);
  const resultsHeadLocal = windowProgress(progress, 0.48, 0.56);
  const flagLocal = windowProgress(progress, 0.5, 0.56);
  const tileLocal = HEALTH_MARKERS.map((_, i) => windowProgress(progress, 0.56 + i * 0.045, 0.56 + i * 0.045 + 0.08));
  const ctaLocal = windowProgress(progress, 0.82, 0.9);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: HP.bg, color: HP.ink }}>
      <HealthChrome />
      <div className="mt-1.5 flex-1 space-y-1.5 overflow-hidden px-3 pb-3">
        <div className="rounded-xl p-3" style={{ background: HP.card, border: `1.5px solid ${HP.accent}` }}>
          <div className="mono flex items-center gap-1 text-[6.5px] tracking-wide" style={{ color: HP.accent, ...reveal(headLocal) }}>
            LONGEVITY SCORE
          </div>
          <div className="mono mt-0.5 text-[5.5px]" style={{ color: HP.mute, ...reveal(headLocal) }}>
            Your overall health across all domains
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative grid h-[84px] w-[84px] shrink-0 place-items-center">
              <svg viewBox="0 0 36 36" className="-rotate-90 h-[84px] w-[84px]">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(28,58,47,0.12)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={HP.mint} strokeWidth="3" strokeLinecap="round" strokeDasharray={ringDash(ringLocal, 82)} />
              </svg>
              <span className="absolute text-center">
                <span className="mono block text-[23px] font-semibold leading-none">{Math.round(82 * ringLocal)}</span>
                <span className="mono block text-[5px] tracking-widest" style={{ color: HP.mint, opacity: ringLocal }}>
                  EXCELLENT
                </span>
              </span>
            </div>
            <div className="flex-1 space-y-[5px]">
              {HEALTH_DOMAINS.map((d, i) => {
                const c = healthBandColor(d.band);
                const local = domainLocal[i];
                return (
                  <div key={d.l} style={reveal(local)}>
                    <div className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full" style={{ background: c }} />
                      <span className="mono text-[5.5px]" style={{ color: HP.ink }}>
                        {d.l}
                      </span>
                      <span className="mono text-[5px]" style={{ color: HP.mute }}>
                        {d.band}
                      </span>
                      <span className="mono ml-auto text-[6px] font-semibold">{Math.round(d.v * local)}</span>
                    </div>
                    <div className="mt-[2px] h-[3px] rounded-full" style={{ background: "rgba(28,58,47,0.12)" }}>
                      <div className="h-full rounded-full" style={{ width: `${d.v * local}%`, background: c }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t pt-2" style={{ borderColor: HP.line }}>
            {HEALTH_STATS.map((t) => (
              <div key={t.l} className="text-center" style={reveal(statsLocal)}>
                <div className="mono text-[11px] font-semibold" style={{ color: HP.accent }}>
                  {t.v}
                </div>
                <div className="mono text-[5px]" style={{ color: HP.mute }}>
                  {t.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-2.5" style={{ background: HP.card2 }}>
          <div className="mono flex items-center gap-1 text-[6.5px] tracking-wide" style={{ color: HP.dim, ...reveal(resultsHeadLocal) }}>
            NEW RESULTS &middot; 3 DAYS AGO
          </div>
          <div className="mt-1 text-[10px] font-semibold tracking-tight" style={reveal(resultsHeadLocal)}>
            Your blood panel results are in
          </div>
          <div className="mt-0.5 text-[6.5px]" style={{ color: HP.dim, ...reveal(resultsHeadLocal) }}>
            <span style={{ color: HP.ink }}>78 markers</span> analysed.{" "}
            <span style={{ color: HP.amber, opacity: flagLocal }}>{Math.round(flagLocal * 12)}</span> flagged for follow-up.
          </div>
          <div className="mt-1.5 grid grid-cols-5 gap-1.5">
            {HEALTH_MARKERS.map((m, i) => (
              <div key={m.l} className="rounded-lg px-2 py-1.5 text-center" style={{ background: HP.card, ...reveal(tileLocal[i]) }}>
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
      </div>
    </div>
  );
}

const EP = {
  headerTop: "#f3f1e6",
  body: "#f8f6ee",
  white: "#ffffff",
  side: "#f3f1e6",
  line: "rgba(28,58,47,0.12)",
  accent: "#c94e12",
  red: "#d94f4f",
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

const EDU_STATS = [
  { v: "71%", l: "AVG COMPLETION" },
  { v: "Punnett squares", l: "WEAKEST TOPIC" },
  { v: "Class D", l: "NEEDS A NUDGE" },
];

// Same threshold rule as EduWeb4's topics/subjects arrays: colour by score,
// not by a fixed per-item hue.
const EDU_TOPICS = [
  { l: "Punnett squares", v: 48 },
  { l: "Sex-linked inheritance", v: 57 },
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
  const ringLocal = windowProgress(progress, 0.06, 0.22);
  const insightLocal = windowProgress(progress, 0.22, 0.3);
  const ctaLocal = windowProgress(progress, 0.3, 0.36);
  const statsLocal = windowProgress(progress, 0.36, 0.44);
  const classHeadLocal = windowProgress(progress, 0.46, 0.52);
  const classRowLocal = EDU_CLASSES.map((_, i) => windowProgress(progress, 0.52 + i * 0.06, 0.52 + i * 0.06 + 0.09));
  const topicHeadLocal = windowProgress(progress, 0.88, 0.93);
  // Windows must resolve to local=1 by progress=1 (the clamped max input),
  // not just approach it -- a window ending past 1 leaves its last item
  // visibly short of its final value on the settle frame.
  const topicRowLocal = EDU_TOPICS.map((_, i) => windowProgress(progress, 0.9 + i * 0.03, 0.9 + i * 0.03 + 0.06));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: EP.body, color: EP.ink }}>
      <EduChrome />
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2.5">
        <div className="rounded-md p-3" style={{ background: EP.white, border: `1.5px solid ${EP.accent}` }}>
          <div className="flex items-baseline">
            <span className="mono flex items-center gap-1 text-[6.5px] font-semibold uppercase tracking-wide" style={{ color: EP.accent, ...reveal(headLocal) }}>
              Fortnight avg score
            </span>
            <span className="mono ml-auto text-[6px]" style={{ color: EP.inkDim, ...reveal(headLocal) }}>
              Fortnight to 21 Aug
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative grid h-[72px] w-[72px] shrink-0 place-items-center">
              <svg viewBox="0 0 36 36" className="-rotate-90 h-[72px] w-[72px]">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(28,58,47,0.12)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={EP.accent} strokeWidth="3" strokeLinecap="round" strokeDasharray={ringDash(ringLocal, 72)} />
              </svg>
              <span className="absolute text-center">
                <span className="mono block text-[19px] font-semibold leading-none">{Math.round(72 * ringLocal)}</span>
                <span className="mono block text-[4.5px] tracking-widest" style={{ color: EP.accent, opacity: ringLocal }}>
                  ON TRACK
                </span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[7px] leading-relaxed" style={{ color: EP.ink, ...reveal(insightLocal) }}>
                Two classes finished the Genetics unit ahead of pace. Punnett squares
                is the weakest topic across all four groups, with the biggest gap in
                Class B.
              </div>
              <div
                className="mono mt-1.5 inline-flex w-fit items-center gap-1 rounded px-2 py-[4px] text-[6px]"
                style={{ background: EP.accent, color: "#f8f6ee", ...reveal(ctaLocal) }}
              >
                Email this to my teachers
              </div>
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t pt-2" style={{ borderColor: EP.line }}>
            {EDU_STATS.map((t) => (
              <div key={t.l} className="text-center" style={reveal(statsLocal)}>
                <div className="mono truncate text-[9px] font-semibold" style={{ color: EP.accent }}>
                  {t.v}
                </div>
                <div className="mono text-[5px]" style={{ color: EP.inkDim }}>
                  {t.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md p-2.5" style={{ background: EP.side }}>
          <div className="flex items-baseline" style={reveal(classHeadLocal)}>
            <span className="text-[8px] font-semibold">Class performance</span>
            <span className="mono ml-auto text-[6px]" style={{ color: EP.inkDim }}>
              Fortnight to 21 Aug
            </span>
          </div>
          <div className="mono mt-1.5 grid grid-cols-[1.6fr_0.5fr_1.2fr_0.6fr] gap-1 border-b pb-1 text-[5.5px] uppercase tracking-wide" style={{ borderColor: EP.line, color: EP.inkDim, ...reveal(classHeadLocal) }}>
            <span>Class</span>
            <span>Students</span>
            <span>Quiz completion</span>
            <span>Avg</span>
          </div>
          {EDU_CLASSES.map((c, i) => {
            const local = classRowLocal[i];
            const shownDone = Math.round(c.done * local);
            return (
              <div key={c.l} className="mono grid grid-cols-[1.6fr_0.5fr_1.2fr_0.6fr] items-center gap-1 border-b py-[5px] text-[6px]" style={{ borderColor: EP.line, ...reveal(local) }}>
                <span>
                  {c.l} <span style={{ color: EP.inkDim }}>&middot; {c.sub}</span>
                </span>
                <span style={{ color: EP.inkDim }}>{c.n}</span>
                <span className="flex items-center gap-1">
                  <span className="h-[4px] flex-1 rounded-full" style={{ background: EP.line }}>
                    <span className="block h-full rounded-full" style={{ width: `${shownDone}%`, background: c.done < 50 ? EP.red : EP.accent }} />
                  </span>
                  <span style={{ color: EP.inkDim }}>{shownDone}%</span>
                </span>
                <span style={{ fontWeight: 600, color: c.avg === 0 ? EP.inkDim : EP.ink }}>{c.avg === 0 ? "no data yet" : Math.round(c.avg * local)}</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-md p-2.5" style={{ background: EP.side, ...reveal(topicHeadLocal) }}>
          <div className="mono text-[6px] uppercase tracking-wide" style={{ color: EP.inkDim }}>
            Topic accuracy across all classes
          </div>
          <div className="mt-1.5 space-y-1">
            {EDU_TOPICS.map((t, i) => {
              const local = topicRowLocal[i];
              const c = t.v < 60 ? EP.red : EP.accent;
              return (
                <div key={t.l} style={reveal(local)}>
                  <div className="mono flex items-baseline text-[6px]">
                    <span>{t.l}</span>
                    <span className="ml-auto" style={{ color: t.v < 60 ? EP.red : EP.inkDim }}>
                      {Math.round(t.v * local)}%
                    </span>
                  </div>
                  <div className="mt-[2px] h-[4px] rounded-full" style={{ background: EP.line }}>
                    <div className="h-full rounded-full" style={{ width: `${t.v * local}%`, background: c }} />
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
