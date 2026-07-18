import { BarRow, CardRow, Icon, NavTabs, Pill, Ring, Sparkline, Tile } from "./frame";

/* Illustrative recreation of the health-optimisation product, not a
   screenshot: generic labels/numbers in this site's own visual language. */

const NAV = ["Overview", "Biomarkers", "Genetics", "Insights"];
const SCORE_HISTORY = [61, 64, 63, 68, 71, 70, 74, 78];

export function HealthWeb1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={1} accent={accent} />
      <div className="grid grid-cols-3 gap-2.5">
        <Tile label="markers" value="70+" accent={accent} />
        <Tile label="flagged" value="9" trend="down" accent={accent} />
        <Tile label="reviewed" value="1mo ago" />
      </div>
      <div className="flex-1 space-y-2">
        <CardRow icon="activity" title="Lipid particle count" sub="above optimal range" accent={accent} active />
        <CardRow icon="activity" title="Inflammation marker" sub="above optimal range" accent={accent} active />
        <CardRow icon="flask" title="Resting metabolic panel" sub="within range" accent={accent} />
        <CardRow icon="flask" title="Micronutrient panel" sub="within range" accent={accent} />
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
        {["Variant class A", "Variant class B", "Variant class C"].map((v, i) => (
          <div key={v} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md" style={{ background: `${accent}1a`, color: accent }}>
              <Icon name="dna" size={13} />
            </span>
            <span className="mono flex-1 text-[10px] text-fg">{v}</span>
            <Pill text="higher risk" accent={accent} tone="down" />
            <span className="mono text-[8px] text-mute">{92 - i * 6}% conf.</span>
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
        <div className="flex-1 space-y-1.5">
          <BarRow label="cardio" value={82} accent={accent} />
          <BarRow label="metabolic" value={91} accent={accent} />
        </div>
        <Sparkline points={SCORE_HISTORY} accent={accent} width={64} height={28} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="rounded-lg border border-line bg-surface-2 p-3">
          <div className="mono flex items-center gap-1.5 text-[9px]" style={{ color: accent }}>
            <Icon name="sparkle" size={11} color={accent} />
            compounding risk
          </div>
          <p className="mono mt-1 text-[9px] leading-relaxed text-dim">
            Two markers read together explain shared risk that neither
            explains alone.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-3">
          <Icon name="activity" size={12} color="var(--color-mute)" />
          <p className="mono text-[9px] leading-relaxed text-dim">
            Metabolic domain trending up 3 checks in a row.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HealthMobile1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col items-center gap-2.5 pt-2">
      <Ring value={78} accent={accent} size={64} />
      <div className="mono text-[9px] text-mute">longevity score</div>
      <Sparkline points={SCORE_HISTORY} accent={accent} width={120} height={26} />
      <div className="mt-1 grid w-full grid-cols-2 gap-1.5">
        <Tile label="cardio" value="82" trend="up" accent={accent} />
        <Tile label="organ" value="90" accent={accent} />
      </div>
    </div>
  );
}

export function HealthMobile2({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <div className="mono text-[9px] text-mute">insights</div>
      {[
        { t: "Cross-domain risk", icon: "sparkle" as const },
        { t: "Metabolic advantage", icon: "activity" as const },
      ].map(({ t, icon }, i) => (
        <div key={t} className="flex items-start gap-2 rounded-lg border border-line bg-surface-2 p-2.5">
          <Icon name={icon} size={12} color={i === 0 ? accent : "var(--color-mute)"} />
          <div className="flex-1">
            <div className="mono text-[9px]" style={{ color: i === 0 ? accent : "var(--color-mute)" }}>{t}</div>
            <div className="mono mt-1 h-1 w-4/5 rounded-full bg-line" />
            <div className="mono mt-1 h-1 w-3/5 rounded-full bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
