/* Illustrative recreation of the health-optimisation product. Hand-built
   markup, not screenshots: the layout, hierarchy and colour family match the
   real dashboard so the work is recognisable, while every name, number and
   record here is invented. No product wordmark, no patient data.

   Screens map to the real build: device connections, the blood-panel intake,
   the cross-domain longevity score, the biological-age model, and the AI
   insight feed. */

// Near-black + single amber accent, same restraint as the rest of the site
// (globals.css --color-accent). The 6 domain/marker colors below all
// collapsed to one hue on purpose -- a deliberate call to match the site's
// literal single-accent language over per-category differentiation.
const P = {
  bg: "#0a0a0b",
  strip: "#0f0f12",
  card: "#16161a",
  card2: "#1e1e24",
  line: "#242429",
  purple: "#ff6a12",
  mint: "#ff6a12",
  amber: "#ff6a12",
  red: "#ff6a12",
  sky: "#ff6a12",
  pink: "#ff6a12",
  fg: "#ededef",
  dim: "#9a9aa4",
  mute: "#74747f",
};

const DOMAINS = [
  { l: "Cardiovascular", v: 74, band: "Good", c: P.red },
  { l: "Metabolic", v: 93, band: "Elite", c: P.mint },
  { l: "Vitals & Fitness", v: 79, band: "Excellent", c: P.sky },
  { l: "Inflammation", v: 81, band: "Excellent", c: P.amber },
  { l: "Organ", v: 95, band: "Elite", c: P.purple },
  { l: "Body Composition", v: 88, band: "Elite", c: P.pink },
];

const DEVICES = ["Readiness", "Resting HR", "HRV", "Sleep score", "Steps", "Active kcal"];

const TABS = ["Today's plan", "Biomarkers", "Genetics", "Bodyscan", "Vitals"];

const MARKERS = [
  { v: "5.4", l: "Total cholesterol", u: "mmol/L", c: P.amber },
  { v: "3.4", l: "LDL-C", u: "mmol/L", c: P.amber },
  { v: "3.7", l: "Non-HDL", u: "mmol/L", c: P.amber },
  { v: "2.31", l: "Calcium", u: "mmol/L", c: P.mint },
  { v: "0.34", l: "Uric acid", u: "mmol/L", c: P.mint },
];

/* ---------------------------------------------------------------- pieces */

function Glyph({ d, size = 12, w = 1.8 }: { d: string; size?: number; w?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const G = {
  pulse: "M2 12h4l2.2-6 3.6 12 2.4-9 1.6 3H22",
  heart: "M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20z",
  drop: "M12 3.5s5.5 6 5.5 9.6a5.5 5.5 0 0 1-11 0C6.5 9.5 12 3.5 12 3.5z",
  spark: "M12 2.5l1.7 5.8 5.8 1.7-5.8 1.7L12 17.5l-1.7-5.8-5.8-1.7 5.8-1.7L12 2.5z",
  chart: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2",
  dna: "M6 3c4 3.2 8 3.2 12 0 M6 21c4-3.2 8-3.2 12 0 M7.5 7h9 M6.7 11h10.6 M6.7 13h10.6 M7.5 17h9",
  scan: "M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8 M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8 M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16 M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16 M4 12h16",
  flame: "M12 3s.8 3.2-1.4 5.4C8.4 10.6 7 12 7 14.5a5 5 0 0 0 10 0c0-2-1-3.4-2-4.5-.6 1-1.4 1.4-1.4 1.4S14.6 6 12 3z",
  bell: "M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9z M10 18a2 2 0 0 0 4 0",
  chat: "M4 5.5h16v10H9l-5 3.5v-13.5z",
  check: "M4 12.5l5 5L20 6",
};

/* Full-bleed product surface: every screen paints its own background so the
   frame around it can run edge to edge. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: P.bg, color: P.fg }}>
      {children}
    </div>
  );
}

function TopStrip() {
  return (
    <div className="flex shrink-0 items-center justify-between px-3 py-[3px]" style={{ background: P.strip }}>
      <span className="mono text-[6px]" style={{ color: P.dim }}>
        Today&apos;s priorities: <span style={{ color: P.fg }}>Raise dietary nitrate</span>
      </span>
      <span className="mono flex items-center gap-1 text-[6px]" style={{ color: P.amber }}>
        <Glyph d={G.flame} size={7} /> 1 DAY STREAK
      </span>
    </div>
  );
}

function Head({ active = 0 }: { active?: number }) {
  const nav = ["Dashboard", "Insights", "Plan", "Progress", "Enterprise"];
  return (
    <div className="flex shrink-0 items-center gap-3 px-3 py-2">
      {/* Anonymous mark: no client wordmark is reproduced. */}
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md" style={{ background: `linear-gradient(140deg, ${P.purple}, ${P.mint})`, color: "#0b0918" }}>
        <Glyph d={G.pulse} size={11} w={2.2} />
      </span>
      <div className="mx-auto flex items-center gap-0.5">
        {nav.map((n, i) => (
          <span
            key={n}
            className="mono rounded-full px-1.5 py-[3px] text-[6.5px]"
            style={i === active ? { background: `${P.amber}26`, color: P.fg } : { color: P.mute }}
          >
            {n}
          </span>
        ))}
      </div>
      <span className="h-4 w-4 rounded-full" style={{ background: P.purple }} />
    </div>
  );
}

function DeviceStrip() {
  return (
    <div className="grid shrink-0 grid-cols-6 gap-1 px-3">
      {DEVICES.map((d) => (
        <div key={d} className="rounded border px-1.5 py-1" style={{ background: P.card, borderColor: P.line }}>
          <div className="mono flex items-center gap-1 text-[5.5px]" style={{ color: P.dim }}>
            <span style={{ color: P.purple }}>
              <Glyph d={G.heart} size={6} />
            </span>
            <span className="truncate">{d}</span>
          </div>
          <div className="mono mt-1 text-[5px] underline underline-offset-2" style={{ color: P.mute }}>
            Connect a device
          </div>
        </div>
      ))}
    </div>
  );
}

function Segmented({ active = 1 }: { active?: number }) {
  return (
    <div className="mx-3 mt-1.5 flex shrink-0 items-center rounded-lg border p-[3px]" style={{ background: P.card, borderColor: P.line }}>
      {TABS.map((t, i) => (
        <span
          key={t}
          className="mono flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[6px]"
          style={i === active ? { background: `${P.amber}26`, color: P.fg } : { color: P.mute }}
        >
          <Glyph d={i === 1 ? G.drop : i === 2 ? G.dna : i === 3 ? G.scan : G.pulse} size={6} />
          {t}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- web screens */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border p-2.5 ${className}`} style={{ background: P.card, borderColor: P.line }}>
      {children}
    </div>
  );
}

function SectionLabel({ icon, text, color, right }: { icon: string; text: string; color: string; right?: React.ReactNode }) {
  return (
    <div className="mono flex items-center gap-1 text-[6.5px] tracking-wide" style={{ color }}>
      <Glyph d={icon} size={7} />
      {text}
      {right ? <span className="ml-auto">{right}</span> : null}
    </div>
  );
}

function DomainBars() {
  return (
    <div className="flex-1 space-y-[5px]">
      {DOMAINS.map((d) => (
        <div key={d.l}>
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full" style={{ background: d.c }} />
            <span className="mono text-[5.5px]" style={{ color: P.fg }}>
              {d.l}
            </span>
            <span className="mono text-[5px]" style={{ color: P.mute }}>
              {d.band}
            </span>
            <span className="mono ml-auto text-[6px] font-semibold">{d.v}</span>
          </div>
          <div className="mt-[2px] h-[3px] rounded-full" style={{ background: "#242429" }}>
            <div className="h-full rounded-full" style={{ width: `${d.v}%`, background: `linear-gradient(90deg, ${d.c}, ${P.mint})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Screen 1: the dashboard as it lands, blood-panel intake at the top and the
   next cards running off the bottom of the viewport. */
export function HealthWeb1() {
  return (
    <Shell>
      <TopStrip />
      <Head active={0} />
      <DeviceStrip />
      <Segmented active={1} />
      <div className="mt-1.5 flex-1 space-y-1.5 overflow-hidden px-3 pb-3">
        <Card>
          <SectionLabel icon={G.drop} text="NEW RESULTS &middot; 3 DAYS AGO" color={P.mint} />
          <div className="mt-1 text-[12px] font-semibold tracking-tight">Your blood panel results are in</div>
          <div className="mt-0.5 text-[7px]" style={{ color: P.dim }}>
            <span style={{ color: P.fg }}>78 markers</span> analysed. <span style={{ color: P.amber }}>12</span> flagged for follow-up.
          </div>
          <div className="mt-1.5 grid grid-cols-5 gap-1.5">
            {MARKERS.map((m) => (
              <div key={m.l} className="rounded-lg border px-2 py-1.5 text-center" style={{ background: P.card2, borderColor: P.line }}>
                <div className="mono text-[11px] font-semibold" style={{ color: m.c }}>
                  {m.v}
                </div>
                <div className="mono mt-0.5 text-[5.5px] leading-tight" style={{ color: P.dim }}>
                  {m.l}
                </div>
                <div className="mono text-[5px]" style={{ color: P.mute }}>
                  {m.u}
                </div>
              </div>
            ))}
          </div>
          <span className="mono mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[6.5px]" style={{ background: P.purple, color: "#0b0918" }}>
            View full report &rarr;
          </span>
        </Card>

        <Card>
          <SectionLabel
            icon={G.chart}
            text="GOAL TRACKING"
            color={P.sky}
            right={
              <span className="mono rounded-full px-1.5 py-[2px] text-[5.5px]" style={{ background: "#242429", color: P.dim }}>
                View progress &rsaquo;
              </span>
            }
          />
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {[
              { v: "6/9", l: "MARKERS IMPROVING" },
              { v: "7", l: "GOALS" },
              { v: "12%", l: "AVG IMPROVEMENT" },
            ].map((t) => (
              <div key={t.l} className="rounded-lg border py-1.5 text-center" style={{ background: P.card2, borderColor: P.line }}>
                <div className="mono text-[12px] font-semibold" style={{ color: P.sky }}>
                  {t.v}
                </div>
                <div className="mono text-[5px]" style={{ color: P.mute }}>
                  {t.l}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Runs off the bottom of the frame the way the real page scrolls. */}
        <Card>
          <SectionLabel icon={G.pulse} text="LONGEVITY SCORE" color={P.mint} />
          <div className="mono mt-0.5 text-[5.5px]" style={{ color: P.mute }}>
            Your overall health across all domains
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative grid h-[62px] w-[62px] shrink-0 place-items-center">
              <svg viewBox="0 0 36 36" className="-rotate-90 h-[62px] w-[62px]">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#242429" strokeWidth="3.4" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={P.mint} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="82 100" />
              </svg>
              <span className="absolute text-center">
                <span className="mono block text-[17px] font-semibold leading-none">82</span>
                <span className="mono block text-[4.5px] tracking-widest" style={{ color: P.mint }}>
                  EXCELLENT
                </span>
              </span>
            </div>
            <DomainBars />
          </div>
        </Card>
      </div>
    </Shell>
  );
}

/* Screen 2: the same dashboard scrolled down to the scoring engine. */
export function HealthWeb2() {
  return (
    <Shell>
      <TopStrip />
      <Head active={0} />
      <div className="grid flex-1 grid-cols-5 items-start gap-2 overflow-hidden px-3 py-2">
        <div className="col-span-2 space-y-2">
        <Card className="flex flex-col">
          <SectionLabel icon={G.pulse} text="LONGEVITY SCORE" color={P.mint} />
          <div className="mono text-[5.5px]" style={{ color: P.mute }}>
            Your overall health across all domains
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="relative grid h-[68px] w-[68px] shrink-0 place-items-center">
              <svg viewBox="0 0 36 36" className="-rotate-90 h-[68px] w-[68px]">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#242429" strokeWidth="3.4" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={P.mint} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="82 100" />
              </svg>
              <span className="absolute text-center">
                <span className="mono block text-[18px] font-semibold leading-none">82</span>
                <span className="mono block text-[4.5px] tracking-widest" style={{ color: P.mint }}>
                  EXCELLENT
                </span>
              </span>
            </div>
            <DomainBars />
          </div>
          <div className="mono mt-2 text-[5.5px]" style={{ color: P.dim }}>
            <span style={{ color: P.amber }}>&#9679;</span> Priority: <span style={{ color: P.fg }}>Cardiovascular</span> optimisation
          </div>
          <div className="mono mt-1.5 rounded-md py-1 text-center text-[6px]" style={{ background: "#242429", color: P.dim }}>
            See all insights
          </div>
        </Card>

        <Card>
          <SectionLabel icon={G.chart} text="TODAY'S PLAN" color={P.purple} />
          <div className="mt-1.5 space-y-1">
            {[
              { l: "Zone 2 cardio, 40 minutes", done: true },
              { l: "Add dietary nitrate at lunch", done: true },
              { l: "Strength session, lower body", done: false },
              { l: "Magnesium before bed", done: false },
            ].map((t) => (
              <div key={t.l} className="flex items-center gap-1.5 rounded-md border px-1.5 py-1" style={{ background: P.card2, borderColor: P.line }}>
                <span className="grid h-3 w-3 place-items-center rounded-full" style={{ background: t.done ? `${P.mint}26` : "#242429", color: t.done ? P.mint : P.mute }}>
                  <Glyph d={G.check} size={6} w={2.6} />
                </span>
                <span className="mono text-[6px]" style={{ color: t.done ? P.dim : P.fg }}>
                  {t.l}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel icon={G.scan} text="RECENT UPLOADS" color={P.sky} />
          <div className="mt-1.5 space-y-1">
            {[
              { l: "Blood panel", d: "3 days ago", c: P.mint },
              { l: "DEXA scan", d: "6 weeks ago", c: P.purple },
              { l: "DNA report", d: "4 months ago", c: P.sky },
            ].map((u) => (
              <div key={u.l} className="mono flex items-center gap-1.5 text-[6px]">
                <span className="h-1 w-1 rounded-full" style={{ background: u.c }} />
                <span style={{ color: P.fg }}>{u.l}</span>
                <span className="ml-auto" style={{ color: P.mute }}>
                  {u.d}
                </span>
              </div>
            ))}
          </div>
        </Card>
        </div>

        <div className="col-span-3 space-y-2">
          <Card>
            <SectionLabel
              icon={G.pulse}
              text="BIO AGE"
              color={P.mint}
              right={
                <span className="mono rounded-full px-1.5 py-[2px] text-[5.5px]" style={{ background: `${P.amber}1f`, color: P.amber }}>
                  High confidence &middot; 6/6 domains
                </span>
              }
            />
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[26px] font-semibold leading-none" style={{ color: P.mint }}>
                34
              </span>
              <span className="text-[8px]" style={{ color: P.dim }}>
                years
              </span>
              <span className="text-[8px] font-medium">
                You are <span style={{ color: P.mint }}>5 years</span> younger biologically
              </span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[
                { l: "BLOOD AGE", v: "33", w: "42%", c: P.sky },
                { l: "VITALS AGE", v: "35", w: "26%", c: P.pink },
                { l: "BODY AGE", v: "33", w: "22%", c: P.amber },
                { l: "ACTIVITY AGE", v: "36", w: "10%", c: P.mint },
              ].map((t) => (
                <div key={t.l} className="rounded-lg border py-1.5 text-center" style={{ background: P.card2, borderColor: P.line }}>
                  <div className="mono flex items-center justify-center gap-1 text-[5px]" style={{ color: P.mute }}>
                    <span className="h-[3px] w-[3px] rounded-full" style={{ background: t.c }} />
                    {t.l}
                  </div>
                  <div className="mono mt-0.5 text-[11px] font-semibold">{t.v}</div>
                  <div className="mono text-[4.5px]" style={{ color: P.mute }}>
                    {t.w}
                  </div>
                </div>
              ))}
            </div>
            <div className="mono mt-2 flex items-center gap-1 text-[5.5px]" style={{ color: P.dim }}>
              <Glyph d={G.chart} size={6} /> BIO AGE OVER TIME <span style={{ color: P.mute }}>(5 blood tests)</span>
            </div>
            <div className="mt-1 flex items-end justify-between gap-2">
              {[
                { m: "Dec", v: 39, h: 26 },
                { m: "Feb", v: 38, h: 23 },
                { m: "Apr", v: 36, h: 18 },
                { m: "Jun", v: 35, h: 15 },
                { m: "Aug", v: 34, h: 11 },
              ].map((b) => (
                <div key={b.m} className="flex flex-1 flex-col items-center gap-[2px]">
                  <span className="mono text-[4.5px]" style={{ color: P.mute }}>
                    {b.v}
                  </span>
                  <span className="flex h-[26px] w-full items-end justify-center">
                    <span className="w-[34%] rounded-sm" style={{ height: b.h, background: `linear-gradient(180deg, ${P.mint}, ${P.mint}44)` }} />
                  </span>
                  <span className="mono text-[4.5px]" style={{ color: P.mute }}>
                    {b.m}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionLabel icon={G.spark} text="AGEING SPEED" color={P.sky} />
            <div className="mt-1 flex items-center gap-3">
              <div className="relative grid h-[44px] w-[44px] shrink-0 place-items-center">
                <svg viewBox="0 0 36 36" className="-rotate-90 h-[44px] w-[44px]">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#242429" strokeWidth="3.6" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={P.sky} strokeWidth="3.6" strokeLinecap="round" strokeDasharray="70 100" />
                </svg>
                <span className="mono absolute text-[9px] font-semibold">0.91x</span>
              </div>
              <div>
                <div className="text-[7.5px]">
                  You are ageing <span style={{ color: P.sky }}>0.91 biological years</span> per calendar year.
                </div>
                <div className="mono mt-1 text-[6px]" style={{ color: P.mint }}>
                  &darr; Slowed by 9% vs baseline
                </div>
                <div className="mono text-[5.5px]" style={{ color: P.mute }}>
                  Trend: upload more blood tests to track
                </div>
              </div>
            </div>
            <div className="mono mt-2 flex items-center border-t pt-1.5 text-[6px]" style={{ borderColor: P.line, color: P.dim }}>
              WHAT&apos;S IMPACTING YOUR AGEING SPEED
              <span className="ml-auto" style={{ color: P.mute }}>
                &#9662;
              </span>
            </div>
          </Card>

          <Card>
            <SectionLabel icon={G.spark} text="PRIORITY ACTIONS" color={P.amber} />
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {[
                { l: "Lower LDL-C", s: "Cardiovascular", c: P.red },
                { l: "Hold metabolic gains", s: "Metabolic", c: P.mint },
                { l: "Raise hydration", s: "Organ", c: P.sky },
              ].map((a) => (
                <div key={a.l} className="rounded-lg border px-2 py-1.5" style={{ background: P.card2, borderColor: P.line }}>
                  <div className="mono text-[6px]" style={{ color: P.fg }}>
                    {a.l}
                  </div>
                  <div className="mono mt-0.5 flex items-center gap-1 text-[5px]" style={{ color: P.mute }}>
                    <span className="h-1 w-1 rounded-full" style={{ background: a.c }} />
                    {a.s}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

/* Screen 3: the AI insight feed. */
export function HealthWeb3() {
  const stats = [
    { v: "12", l: "Total insights", from: "#ff6a12", to: "#ff6a12", icon: G.chart },
    { v: "6", l: "Act now", from: "#ff6a12", to: "#ff6a12", icon: G.spark },
    { v: "82", l: "Longevity score", from: "#ff6a12", to: "#ff6a12", icon: G.pulse },
  ];
  const rows = [
    { t: "Keep Zone 2 cardio at 150 minutes weekly", s: "Lipids, metabolic health, cardiovascular resilience", tags: ["Low priority", "Fitness", "Ongoing"], c: P.mint, badge: "On track" },
    { t: "Maintain the dietary quality showing in your lipid panel", s: "ApoB, LDL-C, triglycerides", tags: ["Low priority", "Nutrition", "Ongoing"], c: P.amber, badge: "On track" },
    { t: "Raise daily hydration and electrolyte intake", s: "Uric acid, kidney markers, recovery", tags: ["Medium", "Body", "6 weeks"], c: P.purple, badge: "Act now" },
    { t: "Add a second strength session each week", s: "Lean mass, insulin sensitivity, bone density", tags: ["Medium", "Fitness", "12 weeks"], c: P.sky, badge: "Optimise" },
  ];
  return (
    <Shell>
      <TopStrip />
      <Head active={1} />
      <div className="flex flex-1 flex-col gap-1.5 overflow-hidden px-3 pb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold tracking-tight">Your health insights</span>
          <span className="mono ml-auto text-[10px] font-semibold">12</span>
          <span className="mono text-[5.5px]" style={{ color: P.mute }}>
            insights
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {stats.map((s) => (
            <div key={s.l} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: `linear-gradient(120deg, ${s.from}, ${s.to})`, color: "#08160f" }}>
              <Glyph d={s.icon} size={12} />
              <div>
                <div className="mono text-[12px] font-semibold leading-none">{s.v}</div>
                <div className="mono text-[5.5px] opacity-80">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {["All", "Strengths", "Act now", "Optimise", "On track"].map((c, i) => (
            <span
              key={c}
              className="mono rounded-full border px-1.5 py-[2px] text-[5.5px]"
              style={i === 0 ? { background: P.purple, borderColor: P.purple, color: "#0b0918" } : { borderColor: P.line, color: P.dim }}
            >
              {c}
            </span>
          ))}
          <span className="mx-auto" />
          {["Fitness", "Nutrition", "Sleep", "Mind", "Body"].map((c) => (
            <span key={c} className="mono rounded-full border px-1.5 py-[2px] text-[5.5px]" style={{ borderColor: P.line, color: P.mute }}>
              {c}
            </span>
          ))}
        </div>
        <div className="mono pt-0.5 text-[6.5px]" style={{ color: P.dim }}>
          Biomarker / blood insights
        </div>
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.t} className="flex items-start gap-2 rounded-lg border p-2" style={{ background: P.card, borderColor: P.line }}>
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md" style={{ background: `${r.c}26`, color: r.c }}>
                <Glyph d={G.pulse} size={10} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[8px] font-medium leading-tight">{r.t}</div>
                <span className="mono mt-1 inline-block rounded px-1 py-[1px] text-[5px]" style={{ background: `${r.c}26`, color: r.c }}>
                  {r.badge}
                </span>
                <div className="mono mt-1 text-[5.5px] italic" style={{ color: P.mute }}>
                  {r.s}
                </div>
                <div className="mt-1 flex gap-1">
                  {r.tags.map((t) => (
                    <span key={t} className="mono rounded-full border px-1 py-[1px] text-[5px]" style={{ borderColor: P.line, color: P.dim }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-[3px]">
                <span className="mono rounded-full border px-1.5 py-[2px] text-[5px]" style={{ borderColor: P.line, color: P.dim }}>
                  Learn more
                </span>
                <span className="mono flex items-center gap-1 rounded-full border px-1.5 py-[2px] text-[5px]" style={{ borderColor: P.line, color: P.dim }}>
                  <Glyph d={G.bell} size={5} /> Remind me
                </span>
                <span className="mono flex items-center gap-1 rounded-full px-1.5 py-[2px] text-[5px]" style={{ background: P.purple, color: "#0b0918" }}>
                  <Glyph d={G.chat} size={5} /> Ask AI
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* Screen 4: the body-scan intake, auto-cropped from an uploaded report. */
export function HealthWeb4() {
  const scans = [
    { l: "Total body fat", v: "18.4%", p: 62, c: P.mint },
    { l: "Lean mass index", v: "19.8", p: 74, c: P.sky },
    { l: "Visceral fat", v: "0.41 kg", p: 88, c: P.mint },
    { l: "Android / gynoid", v: "0.92", p: 41, c: P.amber },
    { l: "Bone density", v: "1.24 g/cm2", p: 79, c: P.purple },
  ];
  return (
    <Shell>
      <TopStrip />
      <Head active={0} />
      <Segmented active={3} />
      <div className="mt-1.5 grid flex-1 grid-cols-5 gap-2 overflow-hidden px-3 pb-3">
        <Card className="col-span-2 flex flex-col">
          <SectionLabel icon={G.scan} text="BODYSCAN &middot; DEXA" color={P.purple} />
          <div className="mono mt-0.5 text-[5.5px]" style={{ color: P.mute }}>
            Auto-cropped from the uploaded report
          </div>
          <div className="relative mt-2 flex-1 overflow-hidden rounded-lg border" style={{ background: P.strip, borderColor: P.line }}>
            <div className="absolute inset-0 grid place-items-center">
              <svg viewBox="0 0 120 220" className="h-[88%]" aria-hidden>
                <defs>
                  <linearGradient id="dexa-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.purple} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={P.sky} stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* Region bands, the way a scan report splits the body. */}
                <rect x="6" y="56" width="108" height="52" fill={P.amber} opacity="0.08" />
                <rect x="6" y="108" width="108" height="30" fill={P.mint} opacity="0.08" />
                <path
                  d="M60 6a17 17 0 1 1 0 34 17 17 0 0 1 0-34z M60 44c-14 0-23 7-26 19l-10 40c-1.6 6.6 7.4 9.4 9.4 3l7.6-26 1.6 33c.2 5-.6 10-1.6 15l-7.4 55c-1 7.4 10 9.6 12 2.6l14.4-52 14.4 52c2 7 13 4.8 12-2.6l-7.4-55c-1-5-1.8-10-1.6-15l1.6-33 7.6 26c2 6.4 11 3.6 9.4-3l-10-40c-3-12-12-19-26-19z"
                  fill="url(#dexa-body)"
                  stroke={P.purple}
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <line x1="6" y1="56" x2="114" y2="56" stroke={P.line} strokeWidth="1" strokeDasharray="3 3" />
                <line x1="6" y1="108" x2="114" y2="108" stroke={P.line} strokeWidth="1" strokeDasharray="3 3" />
                <line x1="6" y1="138" x2="114" y2="138" stroke={P.line} strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>
            {[
              { l: "Arms", t: "20%" },
              { l: "Trunk", t: "38%" },
              { l: "Android", t: "58%" },
              { l: "Legs", t: "74%" },
            ].map((r) => (
              <span key={r.l} className="mono absolute right-1.5 text-[5px]" style={{ top: r.t, color: P.mute }}>
                {r.l}
              </span>
            ))}
            <span className="mono absolute left-1.5 top-1.5 rounded px-1 py-[1px] text-[5px]" style={{ background: `${P.purple}33`, color: P.purple }}>
              Region map
            </span>
            <span className="mono absolute bottom-1.5 right-1.5 rounded px-1 py-[1px] text-[5px]" style={{ background: `${P.mint}26`, color: P.mint }}>
              74th percentile
            </span>
          </div>
        </Card>
        <div className="col-span-3 space-y-2 self-start">
          <Card>
            <div className="mono text-[6.5px]" style={{ color: P.dim }}>
              COMPOSITION &middot; VS AGE-MATCHED PERCENTILE
            </div>
            <div className="mt-2 space-y-2">
              {scans.map((s) => (
                <div key={s.l}>
                  <div className="flex items-baseline">
                    <span className="mono text-[6px]" style={{ color: P.fg }}>
                      {s.l}
                    </span>
                    <span className="mono ml-auto text-[6.5px] font-semibold" style={{ color: s.c }}>
                      {s.v}
                    </span>
                    <span className="mono ml-1.5 text-[5px]" style={{ color: P.mute }}>
                      p{s.p}
                    </span>
                  </div>
                  <div className="mt-[3px] h-[3px] rounded-full" style={{ background: "#242429" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.p}%`, background: s.c }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionLabel icon={G.spark} text="REPORT INTAKE" color={P.sky} />
            <div className="mt-1.5 flex items-center gap-1">
              {["Upload PDF", "Parse regions", "Auto-crop", "Score vs cohort"].map((s, i) => (
                <span key={s} className="mono flex items-center gap-1 text-[5.5px]" style={{ color: i < 3 ? P.mint : P.dim }}>
                  <span className="grid h-3 w-3 place-items-center rounded-full" style={{ background: i < 3 ? `${P.mint}26` : "#242429", color: i < 3 ? P.mint : P.mute }}>
                    <Glyph d={G.check} size={6} w={2.4} />
                  </span>
                  {s}
                  {i < 3 ? <span style={{ color: P.mute }}>&rarr;</span> : null}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <div className="mono text-[6.5px]" style={{ color: P.dim }}>
              REGION BREAKDOWN
            </div>
            <div className="mono mt-1.5 grid grid-cols-[1.2fr_repeat(3,0.8fr)] gap-1 border-b pb-1 text-[5px] uppercase tracking-wide" style={{ borderColor: P.line, color: P.mute }}>
              <span>Region</span>
              <span>Fat %</span>
              <span>Lean kg</span>
              <span>Change</span>
            </div>
            {[
              { r: "Arms", f: "14.2", l: "6.8", d: "+0.3" },
              { r: "Legs", f: "17.9", l: "19.4", d: "+0.6" },
              { r: "Trunk", f: "20.1", l: "26.2", d: "-0.4" },
              { r: "Android", f: "22.4", l: "5.1", d: "-0.2" },
            ].map((row) => (
              <div key={row.r} className="mono grid grid-cols-[1.2fr_repeat(3,0.8fr)] gap-1 border-b py-[4px] text-[6px]" style={{ borderColor: "#242429" }}>
                <span style={{ color: P.fg }}>{row.r}</span>
                <span style={{ color: P.dim }}>{row.f}</span>
                <span style={{ color: P.dim }}>{row.l}</span>
                <span style={{ color: row.d.startsWith("-") ? P.mint : P.amber }}>{row.d}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

/* Screen 5: the DNA layer, cross-checked against the blood panel. */
export function HealthWeb5() {
  const variants = [
    { l: "Lipid transport variant", risk: "Higher risk", c: P.red, conf: 92 },
    { l: "Methylation efficiency variant", risk: "Higher risk", c: P.amber, conf: 86 },
    { l: "Caffeine clearance variant", risk: "Typical", c: P.mint, conf: 81 },
    { l: "Vitamin D receptor variant", risk: "Higher risk", c: P.amber, conf: 77 },
    { l: "Iron absorption variant", risk: "Typical", c: P.mint, conf: 74 },
    { l: "Folate metabolism variant", risk: "Typical", c: P.mint, conf: 71 },
    { l: "Omega-3 conversion variant", risk: "Watch", c: P.amber, conf: 68 },
    { l: "Salt sensitivity variant", risk: "Typical", c: P.mint, conf: 64 },
  ];
  return (
    <Shell>
      <TopStrip />
      <Head active={0} />
      <Segmented active={2} />
      <div className="mt-1.5 grid flex-1 grid-cols-5 gap-2 overflow-hidden px-3 pb-3">
        <div className="col-span-3 space-y-1.5 self-start">
          <div className="mono text-[6.5px]" style={{ color: P.dim }}>
            3 higher-risk variants to review <span style={{ color: P.mute }}>&middot; 41 reported</span>
          </div>
          {variants.map((v) => (
            <div key={v.l} className="flex items-center gap-2 rounded-lg border p-2" style={{ background: P.card, borderColor: P.line }}>
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md" style={{ background: `${P.purple}26`, color: P.purple }}>
                <Glyph d={G.dna} size={10} />
              </span>
              <span className="mono flex-1 text-[7px]">{v.l}</span>
              <span className="mono rounded px-1.5 py-[2px] text-[5.5px]" style={{ background: `${v.c}26`, color: v.c }}>
                {v.risk}
              </span>
              <span className="mono text-[5.5px]" style={{ color: P.mute }}>
                {v.conf}% conf.
              </span>
            </div>
          ))}
        </div>
        <div className="col-span-2 space-y-2">
        <Card>
          <SectionLabel icon={G.spark} text="CROSS-DOMAIN CHECK" color={P.mint} />
          <div className="mt-1.5 text-[7px] leading-relaxed" style={{ color: P.dim }}>
            The lipid transport variant sits on the same pathway as the raised
            LDL-C in this month&apos;s panel. Both are flagged together rather
            than as two unrelated findings.
          </div>
          <div className="mt-2 space-y-1">
            {[
              { l: "DNA", v: "Lipid transport" },
              { l: "Blood", v: "LDL-C 3.4" },
              { l: "Scan", v: "Android / gynoid 0.92" },
            ].map((r) => (
              <div key={r.l} className="mono flex items-baseline text-[6px]">
                <span style={{ color: P.mute }}>{r.l}</span>
                <span className="ml-auto" style={{ color: P.fg }}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
          <div className="mono mt-2 flex items-center justify-center gap-1 rounded-md py-1 text-[6px]" style={{ background: P.purple, color: "#0b0918" }}>
            <Glyph d={G.chat} size={6} /> Ask AI about this pairing
          </div>
        </Card>
        <Card>
          <SectionLabel icon={G.dna} text="PATHWAY GROUPS" color={P.purple} />
          <div className="mt-1.5 space-y-1.5">
            {[
              { l: "Lipid handling", n: 9, v: 62, c: P.red },
              { l: "Methylation", n: 6, v: 48, c: P.amber },
              { l: "Detoxification", n: 11, v: 81, c: P.mint },
              { l: "Micronutrient uptake", n: 8, v: 73, c: P.sky },
              { l: "Sleep and circadian", n: 7, v: 88, c: P.mint },
            ].map((g) => (
              <div key={g.l}>
                <div className="mono flex items-baseline text-[6px]">
                  <span style={{ color: P.fg }}>{g.l}</span>
                  <span className="ml-1" style={{ color: P.mute }}>
                    {g.n} variants
                  </span>
                  <span className="ml-auto font-semibold" style={{ color: g.c }}>
                    {g.v}
                  </span>
                </div>
                <div className="mt-[2px] h-[3px] rounded-full" style={{ background: "#242429" }}>
                  <div className="h-full rounded-full" style={{ width: `${g.v}%`, background: g.c }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------- phone screens */

function PhoneHead({ title }: { title: string }) {
  return (
    <div className="shrink-0" style={{ background: P.strip }}>
      <div className="h-4" />
      <div className="flex items-center gap-2 px-3 pb-2">
        <span className="grid h-4 w-4 place-items-center rounded" style={{ background: `linear-gradient(140deg, ${P.purple}, ${P.mint})`, color: "#0b0918" }}>
          <Glyph d={G.pulse} size={9} />
        </span>
        <span className="text-[8px] font-semibold">{title}</span>
        <span className="mono ml-auto flex items-center gap-1 text-[6px]" style={{ color: P.amber }}>
          <Glyph d={G.flame} size={7} /> 1 DAY
        </span>
      </div>
    </div>
  );
}

function PhoneTabs({ active }: { active: number }) {
  const t = [
    { l: "Home", d: G.pulse },
    { l: "Insights", d: G.spark },
    { l: "Plan", d: G.chart },
    { l: "Progress", d: G.scan },
  ];
  return (
    <div className="mt-auto flex shrink-0 items-center justify-around border-t px-2 py-1.5" style={{ borderColor: P.line, background: P.card }}>
      {t.map((x, i) => (
        <span key={x.l} className="mono flex flex-col items-center gap-[2px] text-[5.5px]" style={{ color: i === active ? P.purple : P.mute }}>
          <Glyph d={x.d} size={11} />
          {x.l}
        </span>
      ))}
    </div>
  );
}

export function HealthMobile1() {
  return (
    <Shell>
      <PhoneHead title="Dashboard" />
      <div className="flex-1 space-y-2 overflow-hidden px-2.5 py-2">
        <div className="rounded-xl border p-2.5" style={{ background: P.card, borderColor: P.line }}>
          <div className="mono text-[6px]" style={{ color: P.mint }}>
            LONGEVITY SCORE
          </div>
          <div className="mt-1.5 grid place-items-center">
            <div className="relative grid h-[74px] w-[74px] place-items-center">
              <svg viewBox="0 0 36 36" className="-rotate-90 h-[74px] w-[74px]">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#242429" strokeWidth="3.4" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={P.mint} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="82 100" />
              </svg>
              <span className="absolute text-center">
                <span className="mono block text-[20px] font-semibold leading-none">82</span>
                <span className="mono block text-[5px] tracking-widest" style={{ color: P.mint }}>
                  EXCELLENT
                </span>
              </span>
            </div>
          </div>
          <div className="mt-2 space-y-[5px]">
            {DOMAINS.slice(0, 4).map((d) => (
              <div key={d.l}>
                <div className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full" style={{ background: d.c }} />
                  <span className="mono text-[6px]">{d.l}</span>
                  <span className="mono ml-auto text-[6px] font-semibold">{d.v}</span>
                </div>
                <div className="mt-[2px] h-[3px] rounded-full" style={{ background: "#242429" }}>
                  <div className="h-full rounded-full" style={{ width: `${d.v}%`, background: d.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { v: "34", l: "BIO AGE" },
            { v: "0.91x", l: "AGEING SPEED" },
          ].map((t) => (
            <div key={t.l} className="rounded-lg border py-2 text-center" style={{ background: P.card, borderColor: P.line }}>
              <div className="mono text-[14px] font-semibold" style={{ color: P.mint }}>
                {t.v}
              </div>
              <div className="mono text-[5px]" style={{ color: P.mute }}>
                {t.l}
              </div>
            </div>
          ))}
        </div>
      </div>
      <PhoneTabs active={0} />
    </Shell>
  );
}

export function HealthMobile2() {
  return (
    <Shell>
      <PhoneHead title="Biomarkers" />
      <div className="flex-1 space-y-2 overflow-hidden px-2.5 py-2">
        <div className="rounded-xl border p-2.5" style={{ background: P.card, borderColor: P.line }}>
          <div className="mono flex items-center gap-1 text-[6px]" style={{ color: P.mint }}>
            <Glyph d={G.drop} size={7} /> NEW RESULTS
          </div>
          <div className="mt-1 text-[10px] font-semibold leading-tight">Your blood panel results are in</div>
          <div className="mono mt-1 text-[6px]" style={{ color: P.dim }}>
            78 markers analysed. <span style={{ color: P.amber }}>12</span> flagged.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {MARKERS.slice(0, 4).map((m) => (
            <div key={m.l} className="rounded-lg border px-2 py-1.5" style={{ background: P.card, borderColor: P.line }}>
              <div className="mono text-[13px] font-semibold" style={{ color: m.c }}>
                {m.v}
              </div>
              <div className="mono text-[5.5px]" style={{ color: P.dim }}>
                {m.l}
              </div>
              <div className="mono text-[5px]" style={{ color: P.mute }}>
                {m.u}
              </div>
            </div>
          ))}
        </div>
        <div className="mono rounded-full py-1.5 text-center text-[7px]" style={{ background: P.purple, color: "#0b0918" }}>
          View full report
        </div>
      </div>
      <PhoneTabs active={0} />
    </Shell>
  );
}

export function HealthMobile3() {
  const rows = [
    { t: "Keep Zone 2 cardio at 150 min weekly", c: P.mint, b: "On track" },
    { t: "Maintain dietary quality in your lipid panel", c: P.amber, b: "On track" },
    { t: "Raise hydration and electrolyte intake", c: P.purple, b: "Act now" },
    { t: "Add a second strength session", c: P.sky, b: "Optimise" },
    { t: "Hold your current fibre intake", c: P.mint, b: "Strength" },
    { t: "Recheck vitamin D in 12 weeks", c: P.amber, b: "Act now" },
  ];
  return (
    <Shell>
      <PhoneHead title="Insights" />
      <div className="flex items-center gap-1 px-2.5 pb-1">
        {["All", "Act now", "On track"].map((c, i) => (
          <span
            key={c}
            className="mono rounded-full border px-1.5 py-[2px] text-[5.5px]"
            style={i === 0 ? { background: P.purple, borderColor: P.purple, color: "#0b0918" } : { borderColor: P.line, color: P.dim }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden px-2.5">
        {rows.map((r) => (
          <div key={r.t} className="flex items-start gap-1.5 rounded-lg border p-2" style={{ background: P.card, borderColor: P.line }}>
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded" style={{ background: `${r.c}26`, color: r.c }}>
              <Glyph d={G.pulse} size={9} />
            </span>
            <div className="min-w-0">
              <div className="text-[7px] font-medium leading-tight">{r.t}</div>
              <span className="mono mt-1 inline-block rounded px-1 py-[1px] text-[5px]" style={{ background: `${r.c}26`, color: r.c }}>
                {r.b}
              </span>
            </div>
          </div>
        ))}
      </div>
      <PhoneTabs active={1} />
    </Shell>
  );
}
