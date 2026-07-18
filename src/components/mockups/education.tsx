import { CardRow, Icon, NavTabs, Pill, Sparkline, Tile } from "./frame";

/* Illustrative recreation of the education-SaaS product, not a screenshot:
   generic labels/numbers in this site's own visual language. Screens map
   to the real build: multi-curriculum subject trees, the quiz engine, and
   the fortnightly AI-generated class-performance email. */

const NAV = ["Classes", "Curriculum", "Quiz hub", "Insights", "Results"];

const SUBJECTS = [
  { label: "Biology", n: 6, icon: "leaf" as const, variants: ["IB", "AP", "Stage 1"] },
  { label: "Chemistry", n: 5, icon: "flask" as const, variants: ["IB", "Senior"] },
  { label: "Physics", n: 3, icon: "atom" as const, variants: ["Units 1/2", "Units 3/4"] },
  { label: "Other", n: 4, icon: "book" as const, variants: ["Forensics", "Marine"] },
];

export function EduWeb1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={0} accent={accent} />
      <div className="mono text-[10px] text-dim">Select a subject to teach</div>
      <div className="grid flex-1 grid-cols-2 gap-2.5">
        {SUBJECTS.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col justify-between rounded-lg border p-3"
            style={{
              borderColor: i === 0 ? `${accent}55` : "var(--color-line)",
              background: i === 0 ? `${accent}0d` : "var(--color-surface-2)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: i === 0 ? `${accent}1f` : "var(--color-surface-3)", color: i === 0 ? accent : "var(--color-mute)" }}>
                <Icon name={s.icon} size={13} />
              </span>
              <span className="mono text-[9px] text-mute">{s.n} variants</span>
            </div>
            <span className="mono text-[10px] text-fg">{s.label}</span>
            <div className="flex flex-wrap gap-1">
              {s.variants.map((v) => (
                <span key={v} className="mono rounded border border-line px-1 py-0.5 text-[7px] text-mute">{v}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EduWeb2({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={1} accent={accent} />
      <div className="mono text-[9px] text-mute">Biology &rsaquo; Unit 3 &rsaquo; Area of study 2 &rsaquo; Topic 4</div>
      <div className="flex-1 space-y-2">
        {[
          { t: "Core concept A", icon: "leaf" as const },
          { t: "Core concept B", icon: "leaf" as const },
          { t: "Core concept C", icon: "leaf" as const },
          { t: "Case study · applied", icon: "book" as const },
          { t: "Sub-topic: lab technique", icon: "flask" as const },
        ].map((row, i) => (
          <CardRow key={row.t} icon={row.icon} title={row.t} sub="assign quiz &middot; view material" accent={accent} active={i === 0} />
        ))}
      </div>
    </div>
  );
}

export function EduWeb3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={2} accent={accent} />
      <div className="mono text-[9px] text-mute">Question map &middot; 24 items</div>
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm border text-center"
            style={{
              borderColor: i < 5 ? `${accent}66` : "var(--color-line)",
              background: i < 5 ? `${accent}1a` : "var(--color-surface-2)",
            }}
          >
            <span className="mono flex h-full items-center justify-center text-[7px] text-dim">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1 space-y-2">
        <div className="rounded-lg border border-line bg-surface-2 p-3">
          <div className="mono flex items-center gap-1.5 text-[9px] text-mute">
            <Icon name="check" size={11} color={accent} />
            correct answer &middot; Q4
          </div>
          <div className="mono mt-1 text-[10px] text-fg">Option D</div>
          <Pill text="feedback attached" accent={accent} />
        </div>
      </div>
    </div>
  );
}

export function EduWeb4({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={3} accent={accent} />
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md" style={{ background: `${accent}1a`, color: accent }}>
          <Icon name="mail" size={16} />
        </span>
        <div className="flex-1">
          <div className="mono text-[10px] text-fg">Fortnightly class summary</div>
          <div className="mono text-[8px] text-mute">generated from real quiz results</div>
        </div>
        <Pill text="sent" accent={accent} solid />
      </div>
      <div className="rounded-lg border border-line bg-surface-2 p-3">
        <div className="mono text-[9px] text-mute">preview &middot; Biology 3/4A</div>
        <div className="mono mt-1.5 h-1 w-full rounded-full bg-line" />
        <div className="mono mt-1 h-1 w-4/5 rounded-full bg-line" />
        <div className="mono mt-1 h-1 w-3/5 rounded-full bg-line" />
      </div>
      <div className="flex-1 flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-3">
        <Icon name="clock" size={12} color="var(--color-mute)" />
        <p className="mono text-[9px] leading-relaxed text-dim">
          In-app preview before send, every 14 days, per class.
        </p>
      </div>
    </div>
  );
}

export function EduMobile1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <div className="mono text-[9px] text-mute">subjects</div>
      <div className="grid grid-cols-2 gap-1.5">
        {SUBJECTS.map((s, i) => (
          <div key={s.label} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
            <Icon name={s.icon} size={12} color={i === 0 ? accent : "var(--color-mute)"} />
            <div className="mono mt-1 text-[9px] uppercase tracking-wide text-mute">{s.label}</div>
            <div className="mono mt-1 text-base font-semibold" style={{ color: i === 0 ? accent : "var(--color-fg)" }}>{s.n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EduMobile2({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <div className="mono text-[9px] text-mute">class results</div>
      {["3/4 Biology A", "Units 3/4 Chem"].map((t, i) => (
        <div key={t} className="rounded-lg border border-line bg-surface-2 p-2.5">
          <div className="mono flex items-center gap-1.5 text-[9px] text-fg">
            <Icon name={i === 0 ? "leaf" : "flask"} size={11} color={i === 0 ? accent : "var(--color-mute)"} />
            {t}
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-line">
            <div
              className="h-full rounded-full"
              style={{ width: i === 0 ? "72%" : "54%", background: accent }}
            />
          </div>
        </div>
      ))}
      <Tile label="term trend" value="+16%" trend="up" accent={accent} />
    </div>
  );
}

export function EduMobile3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <div className="mono flex items-center gap-1.5 text-[9px] text-mute">
        <Icon name="mail" size={11} color={accent} />
        fortnightly summary
      </div>
      <div className="rounded-lg border border-line bg-surface-2 p-2.5">
        <div className="mono text-[9px] text-fg">Biology 3/4A</div>
        <Sparkline points={[58, 61, 60, 65, 69, 71, 74]} accent={accent} width={120} height={24} />
      </div>
      <Pill text="sent to 3 teachers" accent={accent} />
    </div>
  );
}
