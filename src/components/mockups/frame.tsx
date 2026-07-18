"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* Illustrative device frames for NDA-safe product mockups: hand-built UI in
   this site's own design language (never the client's actual colors/type/
   copy), not screenshots. Auto-cycles between a few "screens" per project.
   ACCENT itself lives in ./accent (plain data, no "use client") so Server
   Components can import it directly — a value export resolves to an opaque
   client reference when pulled from a "use client" module like this one. */

function Dots({
  count,
  active,
  accent,
}: {
  count: number;
  active: number;
  accent: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: i === active ? "16px" : "6px",
            background: i === active ? accent : "var(--color-line-strong)",
          }}
        />
      ))}
    </div>
  );
}

export function AutoCycle({
  screens,
  interval = 3800,
  accent,
}: {
  screens: ReactNode[];
  interval?: number;
  accent: string;
}) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || screens.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % screens.length), interval);
    return () => clearInterval(id);
  }, [screens.length, interval, reduce]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0"
          >
            {screens[i]}
          </motion.div>
        </AnimatePresence>
      </div>
      {screens.length > 1 && <Dots count={screens.length} active={i} accent={accent} />}
    </div>
  );
}

function GridTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.4]"
      style={{
        backgroundImage:
          "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        maskImage: "radial-gradient(120% 120% at 100% 0%, #000 10%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(120% 120% at 100% 0%, #000 10%, transparent 70%)",
      }}
    />
  );
}

export function BrowserWindow({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-line"
      style={{
        background: `radial-gradient(120% 90% at 50% -10%, ${accent}0f, transparent 60%), var(--color-surface-1)`,
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mono mx-auto flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1 text-[11px] text-mute">
          <span aria-hidden>&#9679;</span>
          {label}
        </div>
      </div>
      <div className="relative aspect-[16/10] p-5 sm:p-6">
        <GridTexture />
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}

export function PhoneWindow({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[240px]">
      <div
        className="overflow-hidden rounded-[2.2rem] border-[6px] border-surface-3 bg-surface-1 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
        style={{
          background: `radial-gradient(120% 90% at 50% -10%, ${accent}0f, transparent 60%), var(--color-surface-1)`,
        }}
      >
        <div className="relative aspect-[9/19.5] px-3 pb-4 pt-6">
          <GridTexture />
          <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-surface-3" />
          <div className="relative h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- shared presentational primitives, reused across all project mockups ---- */

const ICON_PATHS: Record<string, string> = {
  flask: "M10 3h4 M10 3v5.5l-5.2 8.8A2 2 0 0 0 6.5 20h11a2 2 0 0 0 1.7-2.7L14 8.5V3 M8 15h8",
  dna: "M6 3c4 3.2 8 3.2 12 0 M6 21c4-3.2 8-3.2 12 0 M7.5 7h9 M6.7 11h10.6 M6.7 13h10.6 M7.5 17h9",
  activity: "M2 12h4l2.2-6 3.6 12 2.4-9 1.6 3H22",
  sparkle: "M12 2.5l1.7 5.8 5.8 1.7-5.8 1.7L12 17.5l-1.7-5.8-5.8-1.7 5.8-1.7L12 2.5z",
  book: "M4 5.5c2.2-1 5.3-1 8 .3v13.7c-2.7-1.3-5.8-1.3-8-.3V5.5z M20 5.5c-2.2-1-5.3-1-8 .3v13.7c2.7-1.3 5.8-1.3 8-.3V5.5z",
  atom: "M12 12l7-4 M12 12L5 8 M12 12v8 M12 4v8",
  leaf: "M5 19c9 0 14-5 14-14-9 0-14 5-14 14z M5 19c0-4.5 2.3-8 6-10",
  shirt: "M9 4L5 6.5l1.8 3L9 8.3V20h6V8.3l2.2 1.2 1.8-3L15 4l-1.6 1.6a2 2 0 0 1-2.8 0L9 4z",
  ruler: "M3 8h18v8H3z M7 8v3 M11 8v3 M15 8v3",
  tag: "M3 12.5L12.5 3H19a2 2 0 0 1 2 2v6.5L11.5 21 3 12.5z M15 8h.01",
  check: "M4 12.5l5 5L20 6",
};

export function Icon({
  name,
  size = 14,
  color,
}: {
  name: keyof typeof ICON_PATHS;
  size?: number;
  color?: string;
}) {
  const paths = ICON_PATHS[name].split(" M").map((seg, i) => (i === 0 ? seg : `M${seg}`));
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export function IconBadge({ name, accent, active }: { name: keyof typeof ICON_PATHS; accent: string; active?: boolean }) {
  return (
    <span
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
      style={{
        background: active ? `${accent}1f` : "var(--color-surface-3)",
        color: active ? accent : "var(--color-mute)",
      }}
    >
      <Icon name={name} size={13} />
    </span>
  );
}

export function Sparkline({ points, accent, width = 90, height = 26 }: { points: number[]; accent: string; width?: number; height?: number }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => [i * step, height - ((p - min) / range) * height]);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gid = `spark-${accent.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="shrink-0">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} stroke="none" />
      <path d={line} fill="none" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Pill({
  text,
  accent,
  solid,
  tone,
}: {
  text: string;
  accent: string;
  solid?: boolean;
  tone?: "up" | "down";
}) {
  const color = tone === "down" ? "#e06a6a" : tone === "up" ? accent : accent;
  return (
    <span
      className="mono inline-flex items-center rounded px-1.5 py-0.5 text-[9px] leading-none"
      style={
        solid
          ? { background: color, color: "#0b0b0f" }
          : { background: `${color}1f`, color, border: `1px solid ${color}40` }
      }
    >
      {text}
    </span>
  );
}

export function Ring({ value, accent, size = 56 }: { value: number; accent: string; size?: number }) {
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ height: size, width: size }}>
      <svg viewBox="0 0 36 36" className="-rotate-90" style={{ height: size, width: size }}>
        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-line)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${value} 100`}
        />
      </svg>
      <span className="mono absolute text-sm font-semibold text-fg">{value}</span>
    </div>
  );
}

export function BarRow({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="mono w-16 shrink-0 text-[9px] text-mute">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: accent }} />
      </div>
    </div>
  );
}

export function Tile({
  label,
  value,
  sub,
  accent,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
      <div className="mono flex items-center gap-1 text-[9px] uppercase tracking-wide text-mute">
        {label}
        {trend ? (
          <span style={{ color: trend === "up" ? accent : "#e06a6a" }}>{trend === "up" ? "↗" : "↘"}</span>
        ) : null}
      </div>
      <div className="mono mt-1 text-base font-semibold" style={{ color: accent ?? "var(--color-fg)" }}>
        {value}
      </div>
      {sub ? <div className="mono text-[9px] text-mute">{sub}</div> : null}
    </div>
  );
}

export function CardRow({
  title,
  sub,
  accent,
  active,
  icon,
}: {
  title: string;
  sub: string;
  accent: string;
  active?: boolean;
  icon?: keyof typeof ICON_PATHS;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
      style={{
        borderColor: active ? `${accent}55` : "var(--color-line)",
        background: active ? `${accent}0d` : "var(--color-surface-2)",
      }}
    >
      {icon ? <IconBadge name={icon} accent={accent} active={active} /> : null}
      <div>
        <div className="mono text-[10px] text-fg">{title}</div>
        <div className="mono text-[9px] text-mute">{sub}</div>
      </div>
    </div>
  );
}

export function NavTabs({ items, active, accent }: { items: string[]; active: number; accent: string }) {
  return (
    <div className="mono flex gap-1 text-[8px]">
      {items.map((t, i) => (
        <span
          key={t}
          className="rounded-full px-2 py-1"
          style={
            i === active
              ? { background: accent, color: "#0b0b0f" }
              : { background: "var(--color-surface-2)", color: "var(--color-mute)" }
          }
        >
          {t}
        </span>
      ))}
    </div>
  );
}
