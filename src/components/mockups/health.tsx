import { BarRow, CardRow, NavTabs, Pill, Ring, Tile } from "./frame";

/* Illustrative recreation of the health-optimisation product, not a
   screenshot: generic labels/numbers in this site's own visual language. */

const NAV = ["Overview", "Biomarkers", "Genetics", "Insights"];

export function HealthWeb1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={1} accent={accent} />
      <div className="grid grid-cols-3 gap-2.5">
        <Tile label="markers" value="70+" accent={accent} />
        <Tile label="flagged" value="9" accent={accent} />
        <Tile label="reviewed" value="1mo ago" />
      </div>
      <div className="flex-1 space-y-2">
        <CardRow title="Lipid particle count" sub="above optimal range" accent={accent} active />
        <CardRow title="Inflammation marker" sub="above optimal range" accent={accent} active />
        <CardRow title="Resting metabolic panel" sub="within range" accent={accent} />
        <CardRow title="Micronutrient panel" sub="within range" accent={accent} />
      </div>
    </div>
  );
}

export function HealthWeb2({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={2} accent={accent} />
      <div className="mono text-[10px] text-dim">3 higher-risk variants to review</div>
      <div className="flex-1 space-y-2">
        {["Variant class A", "Variant class B", "Variant class C"].map((v) => (
          <div key={v} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2.5">
            <span className="mono text-[10px] text-fg">{v}</span>
            <Pill text="higher risk" accent={accent} tone="down" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HealthWeb3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={3} accent={accent} />
      <div className="flex items-center gap-4 rounded-lg border border-line bg-surface-2 p-3">
        <Ring value={78} accent={accent} size={52} />
        <div className="space-y-1.5">
          <BarRow label="cardio" value={82} accent={accent} />
          <BarRow label="metabolic" value={91} accent={accent} />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="rounded-lg border border-line bg-surface-2 p-3">
          <div className="mono text-[9px]" style={{ color: accent }}>compounding risk</div>
          <p className="mono mt-1 text-[9px] leading-relaxed text-dim">
            Two markers read together explain shared risk that neither
            explains alone.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HealthMobile1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col items-center gap-3 pt-2">
      <Ring value={78} accent={accent} size={64} />
      <div className="mono text-[9px] text-mute">longevity score</div>
      <div className="mt-1 grid w-full grid-cols-2 gap-1.5">
        <Tile label="cardio" value="82" accent={accent} />
        <Tile label="organ" value="90" accent={accent} />
      </div>
    </div>
  );
}

export function HealthMobile2({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <div className="mono text-[9px] text-mute">insights</div>
      {["Cross-domain risk", "Metabolic advantage"].map((t, i) => (
        <div key={t} className="rounded-lg border border-line bg-surface-2 p-2.5">
          <div className="mono text-[9px]" style={{ color: i === 0 ? accent : "var(--color-mute)" }}>{t}</div>
          <div className="mono mt-1 h-1 w-4/5 rounded-full bg-line" />
          <div className="mono mt-1 h-1 w-3/5 rounded-full bg-line" />
        </div>
      ))}
    </div>
  );
}
