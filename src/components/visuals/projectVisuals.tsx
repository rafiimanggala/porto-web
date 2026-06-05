import type { CSSProperties, ReactNode } from "react";

const ACCENT: Record<string, string> = {
  mint: "#5fe9ad",
  violet: "#a78bfa",
  amber: "#f6b667",
};

function Frame({
  accent,
  label,
  className = "",
  children,
}: {
  accent: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-line ${className}`}
      style={
        {
          background: `radial-gradient(120% 140% at 0% 0%, ${accent}14, transparent 55%), var(--color-surface-1)`,
        } as CSSProperties
      }
    >
      {/* faint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(120% 120% at 100% 0%, #000 10%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(120% 120% at 100% 0%, #000 10%, transparent 70%)",
        }}
      />
      <span className="mono absolute left-3 top-2.5 z-10 text-[9px] uppercase tracking-[0.18em] text-mute">
        {label}
      </span>
      <div className="relative z-[5] h-full">{children}</div>
    </div>
  );
}

function pill(accent: string, text: string, solid = false) {
  return (
    <span
      className="mono rounded px-1.5 py-0.5 text-[9px]"
      style={
        solid
          ? { background: accent, color: "#0b0b0f" }
          : { background: `${accent}1f`, color: accent, border: `1px solid ${accent}40` }
      }
    >
      {text}
    </span>
  );
}

// ---------- 1 · Trading Command Center (candlesticks + consensus) ----------
function TradingVisual({ accent, className }: { accent: string; className?: string }) {
  // [x, wickTop, wickBot, bodyTop, bodyH, up]
  const candles = [
    [8, 14, 44, 20, 14, true],
    [26, 10, 40, 16, 10, false],
    [44, 18, 46, 26, 12, true],
    [62, 8, 34, 12, 8, true],
    [80, 16, 50, 22, 18, false],
    [98, 6, 30, 10, 10, true],
    [116, 12, 38, 18, 6, true],
    [134, 4, 26, 8, 8, false],
    [152, 10, 34, 14, 12, true],
  ] as const;
  const red = "#e06a6a";
  return (
    <Frame accent={accent} label="consensus engine" className={className}>
      <div className="flex h-full flex-col justify-end p-3 pt-6">
        <svg viewBox="0 0 170 56" className="h-[58%] w-full" preserveAspectRatio="none">
          {candles.map(([x, wt, wb, by, bh, up], i) => {
            const c = up ? accent : red;
            return (
              <g key={i}>
                <line x1={Number(x) + 3} y1={wt} x2={Number(x) + 3} y2={wb} stroke={c} strokeWidth="1" opacity="0.7" />
                <rect x={x} y={by} width="6" height={bh} rx="1" fill={c} />
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex items-center gap-1.5">
          {pill(accent, "claude: HOLD")}
          {pill("#e06a6a", "groq: BUY")}
          <span className="text-mute">→</span>
          {pill(accent, "HOLD", true)}
        </div>
      </div>
    </Frame>
  );
}

// ---------- 2 · Amadeus (ECG pulse + decision nodes) ----------
function AmadeusVisual({ accent, className }: { accent: string; className?: string }) {
  return (
    <Frame accent={accent} label="pulse daemon" className={className}>
      <div className="flex h-full flex-col justify-center gap-3 p-3 pt-6">
        <svg viewBox="0 0 180 36" className="h-9 w-full">
          <path
            d="M0,18 H40 l6,-14 6,28 6,-22 5,8 H80 l6,-12 6,24 6,-16 5,4 H130 l6,-10 6,20 6,-14 H180"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex items-center gap-2">
          {["SENSE", "THINK", "DELIVER"].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className="mono text-[9px]" style={{ color: i === 1 ? accent : "var(--color-mute)" }}>{s}</span>
              {i < 2 && <span className="h-px w-3 bg-line-strong" />}
            </span>
          ))}
          <span className="mono ml-auto text-[9px] text-mute">uptime 14d</span>
        </div>
      </div>
    </Frame>
  );
}

// ---------- 3 · TestEngine (parallel browser sessions) ----------
function TestEngineVisual({ accent, className }: { accent: string; className?: string }) {
  return (
    <Frame accent={accent} label="session pool" className={className}>
      <div className="grid h-full grid-cols-3 gap-2 p-3 pt-7">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-md border border-line bg-surface-2">
            <div className="flex items-center gap-1 border-b border-line px-1.5 py-1">
              <span className="h-1 w-1 rounded-full bg-[#ff5f57]" />
              <span className="h-1 w-1 rounded-full bg-[#febc2e]" />
              <span className="h-1 w-1 rounded-full" style={{ background: i === 0 ? accent : "#28c840" }} />
            </div>
            <div className="space-y-1 p-1.5">
              <div className="h-1 w-full rounded-full bg-line" />
              <div className="h-1 w-2/3 rounded-full bg-line" />
              <div className="h-1 w-3/4 rounded-full" style={{ background: `${accent}55` }} />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ---------- 4 · Market Intelligence (factor bars + signal chips) ----------
function MarketVisual({ accent, className }: { accent: string; className?: string }) {
  const bars = [
    ["value", 78],
    ["momentum", 54],
    ["quality", 88],
  ] as const;
  return (
    <Frame accent={accent} label="factor signals" className={className}>
      <div className="flex h-full flex-col justify-center gap-2 p-3 pt-7">
        {bars.map(([l, w]) => (
          <div key={l} className="flex items-center gap-2">
            <span className="mono w-16 text-[9px] text-mute">{l}</span>
            <div className="h-1.5 flex-1 rounded-full bg-line">
              <div className="h-full rounded-full" style={{ width: `${w}%`, background: accent }} />
            </div>
          </div>
        ))}
        <div className="mt-1 flex gap-1.5">
          {pill(accent, "13F whale")}
          {pill(accent, "Form-4 insider")}
        </div>
      </div>
    </Frame>
  );
}

// ---------- 5 · Health Platform (score gauge + biomarker grid) ----------
function HealthVisual({ accent, className }: { accent: string; className?: string }) {
  return (
    <Frame accent={accent} label="clinical scoring" className={className}>
      <div className="flex h-full items-center gap-4 p-3 pt-7">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-line)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="74 100" />
          </svg>
          <span className="absolute mono text-sm font-semibold text-fg">74</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {["DEXA · body comp", "biomarkers · 42", "DNA · variants"].map((l, i) => (
            <div key={l} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: i === 0 ? accent : `${accent}66` }} />
              <span className="mono text-[9px] text-dim">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ---------- 6 · Education SaaS (schools + quiz engine) ----------
function EducationVisual({ accent, className }: { accent: string; className?: string }) {
  return (
    <Frame accent={accent} label="learning platform" className={className}>
      <div className="flex h-full items-center gap-4 p-3 pt-7">
        <div className="shrink-0">
          <div className="mono text-xl font-semibold text-fg">995</div>
          <div className="mono text-[9px] text-mute">schools live</div>
          <div className="mono mt-1.5 text-xl font-semibold text-fg">12.5k</div>
          <div className="mono text-[9px] text-mute">users</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {["AI tutoring chat", "practice-set gen", "weekly insights"].map((l, i) => (
            <div key={l} className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2 py-1" style={i === 0 ? { borderColor: `${accent}55` } : undefined}>
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full text-[7px]" style={{ background: i === 0 ? accent : "var(--color-line)", color: i === 0 ? "#0b0b0f" : "var(--color-mute)" }}>{i + 1}</span>
              <span className="mono text-[9px] text-dim">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

const MAP: Record<
  string,
  (p: { accent: string; className?: string }) => ReactNode
> = {
  "trading-command-center": TradingVisual,
  amadeus: AmadeusVisual,
  testengine: TestEngineVisual,
  "market-intel": MarketVisual,
  "health-platform": HealthVisual,
  "education-saas": EducationVisual,
};

export default function ProjectVisual({
  id,
  accent = "mint",
  className,
}: {
  id: string;
  accent?: "mint" | "violet" | "amber";
  className?: string;
}) {
  const Comp = MAP[id];
  if (!Comp) return null;
  return <Comp accent={ACCENT[accent]} className={className} />;
}
