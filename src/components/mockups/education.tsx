import { CardRow, Icon, NavTabs, Pill, Sparkline, Tile } from "./frame";

/* Illustrative recreation of the education-SaaS product, not a screenshot:
   generic labels/numbers in this site's own visual language. */

const NAV = ["Classes", "Curriculum", "Quiz hub", "Results"];

const SUBJECTS = [
  { label: "Biology", n: 6, icon: "leaf" as const },
  { label: "Chemistry", n: 5, icon: "flask" as const },
  { label: "Physics", n: 3, icon: "atom" as const },
  { label: "Other", n: 4, icon: "book" as const },
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
            <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: i === 0 ? `${accent}1f` : "var(--color-surface-3)", color: i === 0 ? accent : "var(--color-mute)" }}>
              <Icon name={s.icon} size={13} />
            </span>
            <span className="mono text-[10px] text-fg">{s.label}</span>
            <span className="mono text-[9px] text-mute">{s.n} variants</span>
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
      <div className="mono text-[9px] text-mute">Unit 3 &rsaquo; Area of study &rsaquo; Topic</div>
      <div className="flex-1 space-y-2">
        {["Core concept A", "Core concept B", "Core concept C", "Case study"].map((t, i) => (
          <CardRow key={t} icon="book" title={t} sub="assign quiz &middot; view material" accent={accent} active={i === 0} />
        ))}
      </div>
    </div>
  );
}

export function EduWeb3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={2} accent={accent} />
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-md border text-center"
            style={{
              borderColor: i < 3 ? `${accent}66` : "var(--color-line)",
              background: i < 3 ? `${accent}1a` : "var(--color-surface-2)",
            }}
          >
            <span className="mono flex h-full items-center justify-center text-[8px] text-dim">
              Q{i + 1}
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1 space-y-2">
        <div className="rounded-lg border border-line bg-surface-2 p-3">
          <div className="mono flex items-center gap-1.5 text-[9px] text-mute">
            <Icon name="check" size={11} color={accent} />
            correct answer
          </div>
          <div className="mono mt-1 text-[10px] text-fg">Option D</div>
          <Pill text="feedback attached" accent={accent} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line bg-surface-2 p-3">
          <span className="mono text-[9px] text-mute">class avg. this term</span>
          <Sparkline points={[58, 61, 60, 65, 69, 71, 74]} accent={accent} width={70} height={22} />
        </div>
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
