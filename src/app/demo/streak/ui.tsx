import type { IconKey } from "./data";

/* ---------------------------------------------------------------------------
   Icons: a small stroke set (lucide-flavoured). No emoji, single currentColor.
   --------------------------------------------------------------------------- */

type IconName =
  | IconKey
  | "check"
  | "flame"
  | "calendar"
  | "stats"
  | "home"
  | "plus"
  | "settings"
  | "bell"
  | "back"
  | "chevron"
  | "trophy"
  | "clock"
  | "target";

const paths: Record<IconName, React.ReactNode> = {
  water: <path d="M12 3s6 6.4 6 10.5A6 6 0 0 1 6 13.5C6 9.4 12 3 12 3Z" />,
  run: (
    <>
      <circle cx="13" cy="5" r="1.6" />
      <path d="M5 20l3-4 3 1 1-4-3-2 4-2 2 3 3 1" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 0 5 21.5Z" />
      <path d="M5 4.5v15" />
    </>
  ),
  meditate: (
    <>
      <circle cx="12" cy="5.5" r="2" />
      <path d="M4 19c1.8-3.2 4.7-5 8-5s6.2 1.8 8 5" />
      <path d="M12 14v3" />
    </>
  ),
  sleep: <path d="M20 14.5A8 8 0 1 1 9.5 4 6.2 6.2 0 0 0 20 14.5Z" />,
  stretch: (
    <>
      <circle cx="12" cy="4.5" r="1.6" />
      <path d="M12 7v6m0 0-4 6m4-6 4 6M7 9h10" />
    </>
  ),
  write: (
    <>
      <path d="M4 20h16" />
      <path d="M14.5 5.5l3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </>
  ),
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  flame: (
    <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-.6-.2-1-.2-1 .9.6 2.2 2 2.2 4.5A6 6 0 0 1 6 13.5C6 9 10 7 12 3Z" />
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M4 9.5h16M9 3v4m6-4v4" />
    </>
  ),
  stats: <path d="M5 19V11m5 8V5m5 14v-6m4 6V8" />,
  home: <path d="M4 11l8-7 8 7M6 9.5V20h12V9.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.5 5.5l1.4 1.4m10.2 10.2 1.4 1.4m0-13-1.4 1.4M6.9 17.1l-1.4 1.4" />
    </>
  ),
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 10a2 2 0 0 0 4 0" />,
  back: <path d="M14 6l-6 6 6 6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0Z" />
      <path d="M7 5H4v1a3 3 0 0 0 3 3m10-4h3v1a3 3 0 0 1-3 3M9 19h6m-3-6v6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
};

export function Icon({
  name,
  size = 22,
  stroke = 2,
  className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Streak ring: circular progress with a center slot.
   --------------------------------------------------------------------------- */

export function StreakRing({
  value,
  size = 168,
  stroke = 14,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="st-ringwrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--st-surface-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--st-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 0.7s var(--st-ease)" }}
        />
      </svg>
      <div className="st-ringlabel">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Heatmap: 17 weeks x 7 days. Filled cells use the accent.
   --------------------------------------------------------------------------- */

export function Heatmap({ history }: { history: number[] }) {
  return (
    <div className="st-heat" role="img" aria-label="Completion over the last 17 weeks">
      {history.map((v, i) => (
        <div
          key={i}
          className="st-heatcell"
          style={
            v
              ? {
                  background: "var(--st-accent)",
                  opacity: 0.45 + ((i % 5) / 5) * 0.55,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Weekly bars (stats screen).
   --------------------------------------------------------------------------- */

export function WeekBars({ data }: { data: number[] }) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...data, 1);
  return (
    <div>
      <div className="st-bars">
        {data.map((d, i) => (
          <div
            key={i}
            className="st-bar"
            data-faded={d === 0}
            style={{ height: `${Math.max(8, (d / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="st-bars" style={{ height: "auto", marginTop: 8 }}>
        {labels.map((l, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.7rem",
              color: "var(--st-ink-3)",
              fontWeight: 600,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
