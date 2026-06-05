import type { CSSProperties, ReactNode } from "react";

// ---------- shared primitives ----------

function TabBar({
  paths,
  active,
  accent,
}: {
  paths: string[];
  active: number;
  accent: string;
}) {
  return (
    <div className="mt-auto flex items-center justify-around border-t border-line bg-surface-1/70 px-3 pb-4 pt-3">
      {paths.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke={i === active ? accent : "var(--color-mute)"}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={d} />
        </svg>
      ))}
    </div>
  );
}

function Screen({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col"
      style={{ "--a": accent } as CSSProperties}
    >
      {children}
    </div>
  );
}

const ICON = {
  home: "M3 11l9-7 9 7M5 10v10h14V10",
  activity: "M3 12h4l2-6 4 12 2-6h6",
  flask: "M9 3h6M10 3v6l-5 8.5A1 1 0 0 0 6 19h12a1 1 0 0 0 .9-1.5L14 9V3",
  user: "M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20c0-3.4 3-6 7-6s7 2.6 7 6",
  cards: "M3 7h18v10H3zM3 11h18",
  chart: "M5 20V11M12 20V5M19 20v-6",
  wave: "M3 13c2 0 2.5-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2 2 4 2",
  map: "M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2zM9 4v14M15 6v14",
  star: "M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3 7.2 18.7l.9-5.4L4.2 9.7l5.4-.8z",
  heart: "M12 20s-7-4.6-7-10A4 4 0 0 1 12 8a4 4 0 0 1 7 2c0 5.4-7 10-7 10z",
  book: "M5 5a2 2 0 0 1 2-2h12v14H7a2 2 0 0 0-2 2zM5 5v14",
  help: "M9.2 9a3 3 0 1 1 4 2.8c-.8.5-1.2 1-1.2 2M12 17h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  calendar: "M5 6h14v14H5zM8 3v4M16 3v4M5 10h14",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
};

// ---------- 1 · Health ----------
export function HealthScreen({ accent }: { accent: string }) {
  return (
    <Screen accent={accent}>
      <div className="flex-1 space-y-4 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-dim">Good morning</div>
            <div className="font-semibold text-fg">Health score</div>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-medium"
            style={{ background: `${accent}22`, color: accent }}
          >
            +3 today
          </span>
        </div>

        <div className="flex items-center justify-center py-1">
          <div className="relative grid h-28 w-28 place-items-center">
            <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-line)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="80 100" />
            </svg>
            <div className="absolute text-center">
              <div className="text-2xl font-semibold text-fg">82</div>
              <div className="text-[8px] text-mute">EXCELLENT</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[["HRV", "64ms"], ["Sleep", "7h42"], ["Steps", "8.2k"]].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-line bg-surface-2 p-2">
              <div className="text-[9px] text-mute">{l}</div>
              <div className="mt-0.5 text-xs font-medium text-fg">{v}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-1.5 text-[9px] text-mute">THIS WEEK</div>
          <div className="flex items-end justify-between gap-1.5">
            {[40, 62, 55, 78, 48, 70, 88].map((h, i) => (
              <span key={i} className="flex-1 rounded-sm" style={{ height: `${h * 0.4}px`, background: i === 6 ? accent : `${accent}40` }} />
            ))}
          </div>
        </div>
      </div>
      <TabBar paths={[ICON.home, ICON.activity, ICON.flask, ICON.user]} active={0} accent={accent} />
    </Screen>
  );
}

// ---------- 2 · Finance ----------
export function FinanceScreen({ accent }: { accent: string }) {
  return (
    <Screen accent={accent}>
      <div className="flex-1 space-y-4 px-4 pt-3">
        <div>
          <div className="text-[10px] text-dim">Total balance</div>
          <div className="mt-0.5 text-2xl font-semibold tracking-tight text-fg">
            $12,480<span className="text-mute">.50</span>
          </div>
          <span className="text-[10px]" style={{ color: accent }}>▲ 2.4% this week</span>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <svg viewBox="0 0 120 40" className="h-12 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,30 14,24 28,28 42,14 56,20 70,10 84,16 98,6 120,9 V40 H0 Z" fill="url(#fg)" />
            <path d="M0,30 14,24 28,28 42,14 56,20 70,10 84,16 98,6 120,9" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="flex gap-2">
          {["Send", "Request", "Top up"].map((a, i) => (
            <span
              key={a}
              className="flex-1 rounded-lg py-1.5 text-center text-[10px] font-medium"
              style={i === 0 ? { background: accent, color: "#0b0b0f" } : { background: "var(--color-surface-2)", color: "var(--color-dim)", border: "1px solid var(--color-line)" }}
            >
              {a}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {[["Groceries", "Today", "- $84.20", false], ["Salary", "Mon", "+ $3,200", true]].map(([n, d, amt, pos]) => (
            <div key={n as string} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2">
              <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: `${accent}1f`, color: accent }}>•</span>
              <div className="flex-1">
                <div className="text-[11px] text-fg">{n as string}</div>
                <div className="text-[9px] text-mute">{d as string}</div>
              </div>
              <span className="text-[11px] font-medium" style={{ color: pos ? accent : "var(--color-fg)" }}>{amt as string}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar paths={[ICON.home, ICON.cards, ICON.chart, ICON.user]} active={0} accent={accent} />
    </Screen>
  );
}

// ---------- 3 · Surf ----------
export function SurfScreen({ accent }: { accent: string }) {
  return (
    <Screen accent={accent}>
      <div className="flex-1 space-y-3.5 px-4 pt-3">
        <div className="relative h-28 overflow-hidden rounded-2xl border border-line" style={{ background: `linear-gradient(160deg, ${accent}40, ${accent}10 60%, transparent)` }}>
          <svg viewBox="0 0 120 30" className="absolute bottom-0 w-full opacity-60" preserveAspectRatio="none">
            <path d="M0,18 Q15,8 30,18 T60,18 T90,18 T120,18 V30 H0 Z" fill={accent} fillOpacity="0.25" />
          </svg>
          <div className="absolute left-3 top-3">
            <div className="text-[10px] text-dim">Now · Uluwatu</div>
            <div className="text-xl font-semibold text-fg">3.4m <span className="text-xs font-normal text-dim">/ 13s</span></div>
            <div className="text-xs" style={{ color: accent }}>★★★★<span className="text-mute">★</span></div>
          </div>
          <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px]" style={{ background: `${accent}22`, color: accent }}>8kt offshore</span>
        </div>

        <div>
          <div className="mb-1.5 text-[9px] text-mute">NEXT HOURS</div>
          <div className="flex items-end justify-between gap-1">
            {[30, 44, 52, 66, 58, 72, 64, 80].map((h, i) => (
              <span key={i} className="flex-1 rounded-sm" style={{ height: `${h * 0.45}px`, background: `${accent}${i > 4 ? "" : "55"}` }} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {[["Padang Padang", "1.8m · 12s", 5], ["Bingin", "1.4m · 11s", 4], ["Impossibles", "2.1m · 13s", 4]].map(([n, d, s]) => (
            <div key={n as string} className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3 py-2">
              <div>
                <div className="text-[11px] text-fg">{n as string}</div>
                <div className="text-[9px] text-mute">{d as string}</div>
              </div>
              <span className="text-[10px]" style={{ color: accent }}>{"★".repeat(s as number)}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar paths={[ICON.wave, ICON.map, ICON.star, ICON.user]} active={0} accent={accent} />
    </Screen>
  );
}

// ---------- 4 · Wellbeing ----------
export function WellbeingScreen({ accent }: { accent: string }) {
  const moods = ["#f87171", "#fbbf24", "#9ca3af", accent, "#34d399"];
  return (
    <Screen accent={accent}>
      <div className="flex-1 space-y-4 px-4 pt-3">
        <div>
          <div className="text-[10px] text-dim">Daily check-in</div>
          <div className="font-semibold text-fg">How are you today?</div>
        </div>

        <div className="flex justify-between px-1">
          {moods.map((c, i) => (
            <span key={i} className="grid place-items-center">
              <span
                className="h-8 w-8 rounded-full"
                style={{ background: `${c}33`, border: i === 3 ? `2px solid ${accent}` : "2px solid transparent" }}
              >
                <span className="mt-2.5 block h-2.5 w-2.5 rounded-full" style={{ marginInline: "auto", background: c }} />
              </span>
            </span>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
          <div className="h-16" style={{ background: `linear-gradient(120deg, ${accent}55, ${accent}10)` }} />
          <div className="flex items-center justify-between p-3">
            <div>
              <div className="text-[9px] text-mute">TODAY&apos;S FOCUS</div>
              <div className="text-xs font-medium text-fg">5-min reset breathing</div>
            </div>
            <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: accent, color: "#0b0b0f" }}>▶</span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-dim">Checked in</span>
            <span className="text-fg">5 / 7 days</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-line">
            <div className="h-full rounded-full" style={{ width: "71%", background: accent }} />
          </div>
        </div>
      </div>
      <TabBar paths={[ICON.home, ICON.heart, ICON.book, ICON.user]} active={1} accent={accent} />
    </Screen>
  );
}

// ---------- 5 · Education ----------
export function EducationScreen({ accent }: { accent: string }) {
  return (
    <Screen accent={accent}>
      <div className="flex-1 space-y-3.5 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-dim">Biology · Year 11</div>
            <div className="font-semibold text-fg">Keep going</div>
          </div>
          <span className="rounded-full px-2 py-0.5 text-[9px]" style={{ background: `${accent}22`, color: accent }}>7-day streak</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface-2 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-fg">Cell Division</div>
            <span className="rounded-md px-2 py-0.5 text-[9px]" style={{ background: accent, color: "#0b0b0f" }}>Resume</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-line">
              <div className="h-full rounded-full" style={{ width: "64%", background: accent }} />
            </div>
            <span className="text-[9px] text-mute">64%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface-2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-fg">Quick quiz</span>
            <span className="text-[9px] text-mute">3 questions</span>
          </div>
          <div className="space-y-1.5">
            {["Mitosis vs meiosis", "Chromosome count", "Phases of mitosis"].map((q, i) => (
              <div key={q} className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5" style={i === 0 ? { borderColor: accent, background: `${accent}14` } : undefined}>
                <span className="grid h-4 w-4 place-items-center rounded-full text-[8px]" style={{ background: i === 0 ? accent : "var(--color-line)", color: i === 0 ? "#0b0b0f" : "var(--color-mute)" }}>{i + 1}</span>
                <span className="text-[10px] text-dim">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TabBar paths={[ICON.home, ICON.book, ICON.help, ICON.user]} active={1} accent={accent} />
    </Screen>
  );
}

// ---------- registry ----------
export type SimApp = {
  id: string;
  label: string;
  tag: string;
  screen: string;
  accent: string;
  Comp: (p: { accent: string }) => ReactNode;
};

export const SIM_APPS: SimApp[] = [
  { id: "health", label: "Health app", tag: "AU client", screen: "DashboardScreen", accent: "#34d399", Comp: HealthScreen },
  { id: "fonova", label: "Fonova", tag: "personal", screen: "WalletScreen", accent: "#7c8cff", Comp: FinanceScreen },
  { id: "surf", label: "Surf app", tag: "AU client", screen: "ForecastScreen", accent: "#22d3ee", Comp: SurfScreen },
  { id: "wellbeing", label: "Wellbeing app", tag: "AU client", screen: "CheckInScreen", accent: "#fb7faf", Comp: WellbeingScreen },
  { id: "biobrain", label: "Education app", tag: "AU client", screen: "LessonScreen", accent: "#f5a524", Comp: EducationScreen },
];
