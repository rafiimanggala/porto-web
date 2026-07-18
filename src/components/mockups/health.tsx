import { BarRow, CardRow, Icon, NavTabs, Pill, Ring, Sparkline, Tile } from "./frame";

/* Illustrative recreation of the health-optimisation product, not a
   screenshot: generic labels/numbers in this site's own visual language.
   Screens map to the real build: biomarker parsing, DNA variants, DEXA
   auto-crop + percentile scoring, and the cross-domain longevity score. */

const NAV = ["Overview", "Biomarkers", "Genetics", "DEXA", "Insights"];
const SCORE_HISTORY = [61, 64, 63, 68, 71, 70, 74, 78];
const DOMAINS = [
  { l: "cardio", v: 82 },
  { l: "metabolic", v: 91 },
  { l: "vitals", v: 76 },
  { l: "inflam.", v: 58 },
  { l: "organ", v: 88 },
  { l: "body comp", v: 84 },
];

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
        <CardRow icon="flask" title="Hormone panel" sub="within range" accent={accent} />
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
        <div className="rounded-lg border border-line bg-surface-2 px-3 py-2.5">
          <div className="mono text-[9px] text-mute">variant &times; biomarker cross-check</div>
          <div className="mono mt-1 text-[9px] leading-relaxed text-dim">
            Class A pairs with the elevated lipid panel above &mdash; shared
            metabolic pathway, flagged together.
          </div>
        </div>
      </div>
    </div>
  );
}

export function HealthWeb3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={3} accent={accent} />
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md" style={{ background: `${accent}1a`, color: accent }}>
          <Icon name="scan" size={16} />
        </span>
        <div className="flex-1">
          <div className="mono text-[10px] text-fg">DEXA_report_scan.pdf</div>
          <div className="mono text-[8px] text-mute">auto-cropped &middot; vendor-agnostic parser</div>
        </div>
        <Pill text="parsed" accent={accent} solid />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Tile label="fat mass" value="18.4%" accent={accent} />
        <Tile label="lean mass" value="76.1%" accent={accent} />
        <Tile label="bone density" value="5.5%" />
      </div>
      <div className="flex-1 rounded-lg border border-line bg-surface-2 p-3">
        <div className="mono text-[9px] text-mute">percentile vs. reference population</div>
        <div className="mt-2">
          <BarRow label="percentile" value={72} accent={accent} />
        </div>
        <p className="mono mt-2 text-[9px] leading-relaxed text-dim">
          Scored against age/sex reference percentiles, not a fixed cutoff.
        </p>
      </div>
    </div>
  );
}

export function HealthWeb4({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={4} accent={accent} />
      <div className="flex items-center gap-4 rounded-lg border border-line bg-surface-2 p-3">
        <Ring value={78} accent={accent} size={48} />
        <div className="flex-1">
          <div className="mono text-[9px] text-mute">bio-age vs. chronological</div>
          <div className="mono mt-0.5 text-sm font-semibold text-fg">
            34 <span className="text-[10px] font-normal text-mute">vs 41</span>
          </div>
        </div>
        <Sparkline points={SCORE_HISTORY} accent={accent} width={58} height={26} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {DOMAINS.map((d) => (
          <BarRow key={d.l} label={d.l} value={d.v} accent={accent} />
        ))}
      </div>
      <div className="flex-1 space-y-2">
        <div className="rounded-lg border border-line bg-surface-2 p-3">
          <div className="mono flex items-center gap-1.5 text-[9px]" style={{ color: accent }}>
            <Icon name="sparkle" size={11} color={accent} />
            compounding risk &middot; high confidence
          </div>
          <p className="mono mt-1 text-[9px] leading-relaxed text-dim">
            Two markers read together explain shared risk that neither
            explains alone &mdash; all 6 domains have data.
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
      <div className="mono text-[9px] text-mute">longevity score &middot; bio-age 34</div>
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
        { t: "AI meal + supplement plan", icon: "flask" as const },
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

export function HealthMobile3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2.5 pt-2">
      <div className="mono flex items-center gap-1.5 text-[9px] text-mute">
        <Icon name="scan" size={11} color={accent} />
        DEXA &middot; auto-cropped
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Tile label="fat mass" value="18.4%" accent={accent} />
        <Tile label="lean mass" value="76.1%" accent={accent} />
      </div>
      <div className="rounded-lg border border-line bg-surface-2 p-2.5">
        <BarRow label="percentile" value={72} accent={accent} />
      </div>
    </div>
  );
}
