/* Illustrative recreation of the K-12 education platform. Hand-built markup,
   not screenshots: the layout, hierarchy and colour family match the real
   product so the work is recognisable, while every product name, logo,
   school, class, teacher and student here is invented. Nothing on this page
   reproduces client content.

   Screens map to the real build: the multi-curriculum subject picker, the
   levelled topic tree, the quiz engine, and the fortnightly AI-generated
   class-performance summary. */

// Near-black + single amber accent, same restraint as the rest of the site
// (globals.css --color-accent). Was a light-mode UI matching the real
// product's own colour family; inverted to the site's dark canvas on
// purpose, with every distinct hue (subject categories, warning states)
// collapsed to the one accent -- the site's literal single-accent language
// over per-category or per-state differentiation.
const P = {
  headerTop: "#16161a",
  headerDark: "#0f0f12",
  body: "#0a0a0b",
  side: "#0f0f12",
  white: "#16161a",
  navy: "#1e1e24",
  navyDeep: "#242429",
  blue: "#ff6a12",
  blueDark: "#ff6a12",
  ink: "#ededef",
  inkDim: "#9a9aa4",
  green: "#ff6a12",
  maroon: "#ff6a12",
};

const SUBJECTS = [
  { l: "Biology", lv: "Units 3 & 4", c: "#ff6a12", icon: "scope" as const },
  { l: "Biology", lv: "Year 10", c: "#ff6a12", icon: "dna" as const },
  { l: "Chemistry", lv: "Units 1 & 2", c: P.green, icon: "flask" as const },
  { l: "Physics", lv: "Year 10", c: "#ff6a12", icon: "atom" as const },
  { l: "Biology", lv: "Year 11", c: "#ff6a12", icon: "cell" as const },
  { l: "Chemistry", lv: "Year 10", c: P.green, icon: "flask" as const },
  { l: "Forensics", lv: "Year 10", c: P.maroon, icon: "scope" as const },
];

const TREE = ["Cells and systems", "Genetics", "Ecosystems", "Scientific method"];

const LESSONS = [
  "Inheritance patterns",
  "Dominant and recessive traits",
  "Punnett squares",
  "Sex-linked inheritance",
  "Haploid and diploid cells",
  "Genetic variation in a population",
  "Mutation and its effects",
  "Modelling a monohybrid cross",
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
  scope: "M9 3h6 M12 3v4 M12 7a5 5 0 0 0-5 5v5h10v-5a5 5 0 0 0-5-5z M5 20h14",
  cell: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  flask: "M10 3h4 M10 3v5.5l-5.2 8.8A2 2 0 0 0 6.5 20h11a2 2 0 0 0 1.7-2.7L14 8.5V3 M8 15h8",
  atom: "M12 14.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z M20.5 12c0 2.2-3.8 4-8.5 4s-8.5-1.8-8.5-4 3.8-4 8.5-4 8.5 1.8 8.5 4z M16.3 4.7c1.9 1.1 1 5.2-2 9.1s-6.9 6.3-8.8 5.2-1-5.2 2-9.1 6.9-6.3 8.8-5.2z",
  dna: "M6 3c4 3.2 8 3.2 12 0 M6 21c4-3.2 8-3.2 12 0 M7.5 7h9 M6.7 11h10.6 M6.7 13h10.6 M7.5 17h9",
  chevR: "M9 5l7 7-7 7",
  chevD: "M5 9l7 7 7-7",
  chevDD: "M5 7l7 6 7-6 M5 12l7 6 7-6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5",
  bookmark: "M6 3.5h12V21l-6-4.2L6 21V3.5z",
  sound: "M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5z M16 9a4 4 0 0 1 0 6",
  spark: "M12 2.5l1.7 5.8 5.8 1.7-5.8 1.7L12 17.5l-1.7-5.8-5.8-1.7 5.8-1.7L12 2.5z",
  users: "M8 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 8 11z M2.5 20c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2 M16 5.2a3.2 3.2 0 0 1 0 6.2 M17 14.9c2.6.3 4.5 2.4 4.5 5.1",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: P.body, color: P.ink }}>
      {children}
    </div>
  );
}

function Head({ full = true }: { full?: boolean }) {
  const nav = ["My subjects", "Glossary", "Results", "Saved items", "Quiz hub"];
  return (
    <div className="flex shrink-0 items-center gap-3 px-3 py-2" style={{ background: P.headerTop }}>
      {/* Anonymous mark: the client wordmark and logo are not reproduced. */}
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded" style={{ background: "rgba(255,255,255,0.16)", color: "#ffffff" }}>
        <Glyph d={G.cell} size={13} w={1.9} />
      </span>
      <div className="ml-auto flex items-center gap-2.5">
        {(full ? nav : nav.slice(0, 1)).map((n, i) => (
          <span key={n} className="mono flex items-center gap-[2px] text-[6.5px] uppercase tracking-wide" style={{ color: "#ffffff" }}>
            {n}
            {(i === 0 || n === "Quiz hub") && (
              <span style={{ opacity: 0.7 }}>
                <Glyph d={G.chevD} size={6} w={2.2} />
              </span>
            )}
          </span>
        ))}
        <span style={{ color: "rgba(255,255,255,0.8)" }}>
          <Glyph d={G.sound} size={9} />
        </span>
        <span className="mono grid h-4 w-4 place-items-center rounded-full text-[6px] font-semibold" style={{ background: P.blue, color: "#ffffff" }}>
          ?
        </span>
        <span className="mono grid h-4 w-4 place-items-center rounded-full text-[5.5px] font-semibold" style={{ background: "#ff6a12", color: "#ffffff" }}>
          AK
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- web screens */

export function EduWeb1() {
  return (
    <Shell>
      <Head full={false} />
      <div className="flex flex-1 flex-col justify-center px-4">
        <div className="mono mb-2 text-[7px] uppercase tracking-wide" style={{ color: P.inkDim }}>
          Choose a subject
        </div>
        <div className="grid grid-cols-7 gap-2">
          {SUBJECTS.map((s, i) => (
            <div key={`${s.l}-${i}`} className="overflow-hidden rounded-md" style={{ background: s.c }}>
              <div className="flex flex-col items-center gap-1 px-1 pb-1.5 pt-3" style={{ color: "#ffffff" }}>
                <Glyph d={G[s.icon]} size={20} w={1.4} />
                <span className="mono mt-1 text-[7px] font-semibold uppercase tracking-wide">{s.l}</span>
              </div>
              <div className="mono py-[3px] text-center text-[5.5px]" style={{ background: "rgba(0,0,0,0.22)", color: "#ffffff" }}>
                {s.lv}
              </div>
            </div>
          ))}
        </div>
        <div className="mono mt-3 flex items-center gap-2 text-[6px]" style={{ color: P.inkDim }}>
          <span className="rounded-full px-2 py-[3px]" style={{ background: P.white }}>
            11 course variants downloaded
          </span>
          <span className="rounded-full px-2 py-[3px]" style={{ background: P.white }}>
            Offline content ready
          </span>
        </div>
      </div>
    </Shell>
  );
}

export function EduWeb2() {
  return (
    <Shell>
      <Head />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[22%] shrink-0 px-2 py-2" style={{ background: P.side }}>
          <div className="flex items-center gap-1 rounded-full border px-1.5 py-1" style={{ background: P.white, borderColor: "#242429", color: P.inkDim }}>
            <Glyph d={G.search} size={7} />
            <span className="mono text-[5.5px]">Search</span>
          </div>
          <div className="mono mt-2.5 flex items-center gap-1 text-[6px]" style={{ color: P.ink }}>
            <Glyph d={G.chevDD} size={7} w={2.2} /> Expand all
          </div>
          <div className="mt-2 space-y-2">
            {TREE.map((t, i) => (
              <div key={t} className="mono flex items-center gap-1 text-[7px] font-semibold" style={{ color: i === 1 ? P.blueDark : P.ink }}>
                <Glyph d={G.chevR} size={7} w={2.4} />
                {t}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-hidden px-2.5 py-2">
          <div className="mono text-[6px]" style={{ color: P.inkDim }}>
            <span style={{ color: P.ink, fontWeight: 600 }}>SCIENCE 10</span>{" "}&rsaquo; Genetics &rsaquo; Inheritance patterns
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="mono rounded-t px-2 py-[3px] text-[6.5px] font-semibold" style={{ background: P.white, color: P.ink }}>
              Level 1
            </span>
            <span className="mono rounded-t px-2 py-[3px] text-[6.5px]" style={{ background: "#1e1e24", color: P.inkDim }}>
              Level 2
            </span>
            <span className="mx-auto" style={{ color: P.inkDim }}>
              <Glyph d={G.chevDD} size={8} w={2.2} />
            </span>
            <span className="mono rounded px-2 py-[3px] text-[6.5px]" style={{ background: P.blue, color: "#ffffff" }}>
              Tasks
            </span>
            <span className="mono rounded px-2 py-[3px] text-[6.5px]" style={{ background: P.blue, color: "#ffffff" }}>
              Quiz
            </span>
          </div>
          <div className="mt-1.5 space-y-[3px]">
            {LESSONS.map((l, i) => (
              <div
                key={l}
                className="flex items-center gap-1.5 rounded-sm px-1.5 py-[5px]"
                style={{ background: P.navy, color: "#ffffff", borderLeft: i === 0 ? `2px solid ${P.blue}` : "2px solid transparent" }}
              >
                <Glyph d={G.chevR} size={7} w={2.4} />
                <span className="mono text-[6.5px]">{l}</span>
                <span className="ml-auto" style={{ opacity: 0.75 }}>
                  <Glyph d={G.bookmark} size={8} w={1.6} />
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </Shell>
  );
}

export function EduWeb3() {
  return (
    <Shell>
      <Head />
      <div className="shrink-0 px-3 py-1.5" style={{ background: "#16161a" }}>
        <span className="mono text-[6px]" style={{ color: P.inkDim }}>
          Genetics &rsaquo; Inheritance patterns &rsaquo; Level 1
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center" style={{ background: P.white }}>
        <div className="w-[46%] rounded-lg px-3 py-2.5" style={{ background: P.blue, color: "#ffffff" }}>
          <div className="flex items-center justify-between">
            <span className="mono text-[8px] font-semibold">Q1/10</span>
            <span className="mono text-[8px] font-semibold tracking-wide">LEVEL 1</span>
          </div>
          <div className="mt-2 text-[7px] font-medium leading-snug">
            A recessive trait can appear in a child even when neither parent shows the trait.
          </div>
          <div className="mt-2.5 flex justify-center">
            <div className="flex overflow-hidden rounded">
              <span className="mono px-4 py-[5px] text-[7px] font-semibold" style={{ background: P.navyDeep, color: "#ffffff" }}>
                TRUE
              </span>
              <span className="mono px-4 py-[5px] text-[7px] font-semibold" style={{ background: P.white, color: P.ink }}>
                FALSE
              </span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function EduWeb4() {
  const classes = [
    { l: "Class A", sub: "Science 10", n: 28, done: 86, avg: 74 },
    { l: "Class B", sub: "Science 10", n: 26, done: 71, avg: 68 },
    { l: "Class C", sub: "Biology 11", n: 24, done: 92, avg: 81 },
    { l: "Class D", sub: "Biology 11", n: 22, done: 34, avg: 0 },
    { l: "Class E", sub: "Chemistry 10", n: 27, done: 78, avg: 70 },
    { l: "Class F", sub: "Physics 10", n: 25, done: 64, avg: 66 },
  ];
  const topics = [
    { l: "Punnett squares", v: 48 },
    { l: "Sex-linked inheritance", v: 57 },
    { l: "Mutation and its effects", v: 63 },
    { l: "Dominant traits", v: 88 },
  ];
  return (
    <Shell>
      <Head />
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2.5">
        <div className="flex items-start gap-2">
        <div className="flex-[3] rounded-md p-2.5" style={{ background: P.white }}>
          <div className="flex items-baseline">
            <span className="text-[9px] font-semibold">Class performance</span>
            <span className="mono ml-auto text-[6px]" style={{ color: P.inkDim }}>
              Fortnight to 21 Aug
            </span>
          </div>
          <div className="mono mt-2 grid grid-cols-[1.6fr_0.5fr_1.2fr_0.6fr] gap-1 border-b pb-1 text-[5.5px] uppercase tracking-wide" style={{ borderColor: "#242429", color: P.inkDim }}>
            <span>Class</span>
            <span>Students</span>
            <span>Quiz completion</span>
            <span>Avg</span>
          </div>
          {classes.map((c) => (
            <div key={c.l} className="mono grid grid-cols-[1.6fr_0.5fr_1.2fr_0.6fr] items-center gap-1 border-b py-[5px] text-[6px]" style={{ borderColor: "#242429" }}>
              <span>
                {c.l} <span style={{ color: P.inkDim }}>&middot; {c.sub}</span>
              </span>
              <span style={{ color: P.inkDim }}>{c.n}</span>
              <span className="flex items-center gap-1">
                <span className="h-[4px] flex-1 rounded-full" style={{ background: "#242429" }}>
                  <span className="block h-full rounded-full" style={{ width: `${c.done}%`, background: c.done < 50 ? "#ff6a12" : P.blue }} />
                </span>
                <span style={{ color: P.inkDim }}>{c.done}%</span>
              </span>
              <span style={{ fontWeight: 600, color: c.avg === 0 ? P.inkDim : P.ink }}>{c.avg === 0 ? "no data yet" : c.avg}</span>
            </div>
          ))}
        </div>

        <div className="flex-[2] rounded-md p-2.5" style={{ background: P.white, borderLeft: `3px solid ${P.blue}` }}>
          <div className="mono flex items-center gap-1 text-[6.5px] font-semibold uppercase tracking-wide" style={{ color: P.blueDark }}>
            <Glyph d={G.spark} size={8} /> Fortnightly summary
          </div>
          <div className="mt-1.5 text-[6.5px] leading-relaxed" style={{ color: P.ink }}>
            Two classes finished the Genetics unit ahead of pace. Punnett squares
            is the weakest topic across all four groups, with the biggest gap in
            Class B.
          </div>
          <div className="mt-2 space-y-1">
            {[
              { l: "Weakest topic", v: "Punnett squares" },
              { l: "Strongest topic", v: "Dominant traits" },
              { l: "Needs a nudge", v: "Class D" },
            ].map((r) => (
              <div key={r.l} className="mono flex items-baseline text-[6px]">
                <span style={{ color: P.inkDim }}>{r.l}</span>
                <span className="ml-auto font-semibold">{r.v}</span>
              </div>
            ))}
          </div>
          <div className="mono mt-2 flex items-center gap-1 rounded px-2 py-[4px] text-[6px]" style={{ background: P.blue, color: "#ffffff" }}>
            <Glyph d={G.users} size={7} /> Email this to my teachers
          </div>
          <div className="mono mt-2 border-t pt-1.5 text-[5.5px] uppercase tracking-wide" style={{ borderColor: "#242429", color: P.inkDim }}>
            Topic accuracy across all classes
          </div>
          <div className="mt-1 space-y-1">
            {topics.map((t) => (
              <div key={t.l}>
                <div className="mono flex items-baseline text-[6px]">
                  <span>{t.l}</span>
                  <span className="ml-auto" style={{ color: t.v < 60 ? "#ff6a12" : P.inkDim }}>
                    {t.v}%
                  </span>
                </div>
                <div className="mt-[2px] h-[4px] rounded-full" style={{ background: "#242429" }}>
                  <div className="h-full rounded-full" style={{ width: `${t.v}%`, background: t.v < 60 ? "#ff6a12" : P.blue }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mono mt-2 text-[5.5px]" style={{ color: P.inkDim }}>
            Generated every second Thursday from live quiz data.
          </div>
        </div>
        </div>

        <div className="rounded-md p-2.5" style={{ background: P.white }}>
          <div className="mono text-[6px] uppercase tracking-wide" style={{ color: P.inkDim }}>
            Recent quiz activity
          </div>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {[
              { c: "Class A", t: "Inheritance patterns", s: "Level 2", v: "24/28 submitted" },
              { c: "Class C", t: "Punnett squares", s: "Level 1", v: "22/24 submitted" },
              { c: "Class E", t: "Reaction rates", s: "Level 1", v: "19/27 submitted" },
              { c: "Class F", t: "Forces and motion", s: "Level 2", v: "16/25 submitted" },
            ].map((a) => (
              <div key={a.c} className="rounded border px-2 py-1.5" style={{ borderColor: "#242429" }}>
                <div className="mono flex items-center gap-1 text-[6px] font-semibold">
                  <span className="h-1 w-1 rounded-full" style={{ background: P.blue }} />
                  {a.c}
                  <span className="ml-auto rounded px-1 py-[1px] text-[5px]" style={{ background: "#1e1e24", color: P.inkDim }}>
                    {a.s}
                  </span>
                </div>
                <div className="mono mt-1 text-[6px]" style={{ color: P.ink }}>
                  {a.t}
                </div>
                <div className="mono text-[5.5px]" style={{ color: P.inkDim }}>
                  {a.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------- phone screens */

function PhoneHead({ title }: { title: string }) {
  return (
    <div className="shrink-0" style={{ background: P.headerTop }}>
      <div className="h-4" />
      <div className="flex items-center gap-2 px-3 pb-2">
        <span className="grid h-4 w-4 place-items-center rounded-sm" style={{ background: "rgba(255,255,255,0.16)", color: "#ffffff" }}>
          <Glyph d={G.cell} size={9} />
        </span>
        <span className="text-[8px] font-semibold" style={{ color: "#ffffff" }}>
          {title}
        </span>
        <span className="mono ml-auto grid h-4 w-4 place-items-center rounded-full text-[5.5px] font-semibold" style={{ background: "#ff6a12", color: "#ffffff" }}>
          AK
        </span>
      </div>
    </div>
  );
}

export function EduMobile1() {
  return (
    <Shell>
      <PhoneHead title="My subjects" />
      <div className="flex-1 px-2.5 py-2">
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.slice(0, 6).map((s, i) => (
            <div key={`${s.l}-${i}`} className="overflow-hidden rounded-md" style={{ background: s.c }}>
              <div className="flex flex-col items-center gap-1 px-1 pb-1.5 pt-3" style={{ color: "#ffffff" }}>
                <Glyph d={G[s.icon]} size={22} w={1.4} />
                <span className="mono mt-1 text-[7px] font-semibold uppercase tracking-wide">{s.l}</span>
              </div>
              <div className="mono py-[3px] text-center text-[5.5px]" style={{ background: "rgba(0,0,0,0.22)", color: "#ffffff" }}>
                {s.lv}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function EduMobile2() {
  return (
    <Shell>
      <PhoneHead title="Genetics" />
      <div className="shrink-0 px-2.5 py-1.5" style={{ background: "#16161a" }}>
        <span className="mono text-[5.5px]" style={{ color: P.inkDim }}>
          SCIENCE 10 &rsaquo; Genetics
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1 px-2.5 pt-1.5">
        <span className="mono rounded px-2 py-[3px] text-[6.5px] font-semibold" style={{ background: P.white, color: P.ink }}>
          Level 1
        </span>
        <span className="mono rounded px-2 py-[3px] text-[6.5px]" style={{ background: "#1e1e24", color: P.inkDim }}>
          Level 2
        </span>
        <span className="mono ml-auto rounded px-2 py-[3px] text-[6.5px]" style={{ background: P.blue, color: "#ffffff" }}>
          Quiz
        </span>
      </div>
      <div className="flex-1 space-y-[3px] overflow-hidden px-2.5 pt-1.5">
        {LESSONS.map((l) => (
          <div key={l} className="flex items-center gap-1.5 rounded-sm px-1.5 py-[6px]" style={{ background: P.navy, color: "#ffffff" }}>
            <Glyph d={G.chevR} size={7} w={2.4} />
            <span className="mono text-[6.5px] leading-tight">{l}</span>
            <span className="ml-auto" style={{ opacity: 0.75 }}>
              <Glyph d={G.bookmark} size={8} w={1.6} />
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function EduMobile3() {
  return (
    <Shell>
      <PhoneHead title="Quiz" />
      <div className="shrink-0 px-2.5 py-1.5" style={{ background: "#16161a" }}>
        <span className="mono text-[5.5px]" style={{ color: P.inkDim }}>
          Genetics &rsaquo; Inheritance patterns &rsaquo; Level 1
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center px-2.5" style={{ background: P.white }}>
        <div className="w-full rounded-lg px-2.5 py-2.5" style={{ background: P.blue, color: "#ffffff" }}>
          <div className="flex items-center justify-between">
            <span className="mono text-[8px] font-semibold">Q1/10</span>
            <span className="mono text-[8px] font-semibold tracking-wide">LEVEL 1</span>
          </div>
          <div className="mt-2 text-[7px] font-medium leading-snug">
            A recessive trait can appear in a child even when neither parent shows the trait.
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="mono rounded py-[6px] text-center text-[7px] font-semibold" style={{ background: P.navyDeep, color: "#ffffff" }}>
              TRUE
            </span>
            <span className="mono rounded py-[6px] text-center text-[7px] font-semibold" style={{ background: P.white, color: P.ink }}>
              FALSE
            </span>
          </div>
        </div>
      </div>
    </Shell>
  );
}
