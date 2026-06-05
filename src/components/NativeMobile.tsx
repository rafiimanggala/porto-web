"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

type App = {
  id: string;
  label: string;
  tag: string;
  screen: string;
  render: () => React.ReactNode;
};

// --- tiny stylized app screens (pure divs, design tokens) ---
function Bar({ w, c = "bg-line-strong" }: { w: string; c?: string }) {
  return <span className={`block h-2 rounded-full ${c}`} style={{ width: w }} />;
}

function HealthScreen() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="mono text-[10px] text-mute">Today</div>
      <div className="flex items-center gap-4">
        <div className="relative grid h-20 w-20 place-items-center">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-line)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="78 100" />
          </svg>
          <span className="absolute mono text-lg font-semibold text-fg">82</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Bar w="90%" c="bg-accent/70" />
          <Bar w="65%" />
          <Bar w="78%" c="bg-accent/40" />
        </div>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {["Sleep", "Recovery"].map((l) => (
          <div key={l} className="rounded-lg border border-line bg-surface-2 p-2.5">
            <div className="mono text-[9px] text-mute">{l}</div>
            <div className="mono mt-1 text-sm text-fg">{l === "Sleep" ? "7h 42m" : "78%"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceScreen() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="mono text-[10px] text-mute">Balance</div>
      <div className="mono text-2xl font-semibold text-fg">
        $12,480<span className="text-mute">.50</span>
      </div>
      <svg viewBox="0 0 100 30" className="h-10 w-full">
        <polyline
          points="0,24 14,18 28,22 42,10 56,14 70,6 84,9 100,3"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col gap-2">
        {["Groceries", "Transfer in"].map((l, i) => (
          <div key={l} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2">
            <span className="mono text-[10px] text-dim">{l}</span>
            <span className={`mono text-[10px] ${i ? "text-accent" : "text-fg"}`}>
              {i ? "+ $1,200" : "- $84.20"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SurfScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div
        className="relative h-16 overflow-hidden rounded-xl border border-line"
        style={{ background: "linear-gradient(160deg, color-mix(in oklab, var(--color-accent) 30%, transparent), transparent)" }}
      >
        <div className="absolute bottom-2 left-3">
          <div className="mono text-[10px] text-fg">Uluwatu</div>
          <div className="text-accent">★★★★<span className="text-mute">★</span></div>
        </div>
      </div>
      {[
        ["Padang", "1.8m · 12s"],
        ["Bingin", "1.4m · 11s"],
        ["Impossibles", "2.1m · 13s"],
      ].map(([n, d], i) => (
        <div key={n} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2">
          <span className="mono text-[10px] text-dim">{n}</span>
          <span className="mono text-[10px] text-mute">{d}</span>
          <span className="text-accent text-[10px]">{"★".repeat(4 - i)}</span>
        </div>
      ))}
    </div>
  );
}

const APPS: App[] = [
  { id: "health", label: "Health app", tag: "AU client", screen: "DashboardScreen", render: () => <HealthScreen /> },
  { id: "fonova", label: "Fonova", tag: "personal", screen: "WalletScreen", render: () => <FinanceScreen /> },
  { id: "surf", label: "Surf app", tag: "AU client", screen: "ForecastScreen", render: () => <SurfScreen /> },
];

const TLINES = [
  () => "● boot simulator",
  (a: App) => `● render ${a.screen}`,
  () => "→ components mounted",
  () => "→ screenshot captured",
  () => "✓ verified",
];
const PHASES = TLINES.length;

export default function NativeMobile() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !active) return;
    const t = window.setInterval(() => setTick((x) => x + 1), 1400);
    return () => window.clearInterval(t);
  }, [reduce, active]);

  const phase = reduce ? PHASES - 1 : tick % PHASES;
  const appIndex = reduce ? 0 : Math.floor(tick / PHASES) % APPS.length;
  const app = APPS[appIndex];

  return (
    <Section
      id="native"
      index="04"
      label="Native, AI-driven"
      title="I let Claude drive the simulator."
      intro="React Native, .NET MAUI, SwiftUI. The agent boots the simulator, builds the screen, screenshots it, fixes what's off, and verifies, while I review the architecture."
    >
      <div ref={ref}>
        <Reveal>
          <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:items-center lg:gap-0">
            {/* terminal */}
            <div className="card flex-1 overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="mono ml-3 text-xs text-mute">claude-code · ios-sim</span>
              </div>
              <div className="mono min-h-[14rem] space-y-1.5 p-5 text-[13px] leading-relaxed">
                <div className="text-fg">
                  <span className="text-accent">~ $</span> claude build ios --app{" "}
                  {app.id}
                </div>
                {Array.from({ length: phase + 1 }).map((_, i) => (
                  <div
                    key={`${appIndex}-${i}`}
                    className={i === phase ? "text-fg" : "text-dim"}
                  >
                    <span className="pl-3">{TLINES[i](app)}</span>
                    {i === phase && (
                      <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-accent" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* connector pulse (desktop) */}
            <div className="relative hidden h-px w-16 self-center lg:block">
              <div className="absolute inset-0 top-1/2 h-px bg-line-strong" />
              {!reduce && (
                <motion.span
                  className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent"
                  animate={{ x: [0, 56], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ boxShadow: "0 0 8px var(--color-accent)" }}
                />
              )}
            </div>

            {/* phone */}
            <div className="flex justify-center lg:pl-2">
              <div className="relative h-[540px] w-[270px] rounded-[2.6rem] border border-line-strong bg-surface-3 p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-bg" />
                <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-bg">
                  {/* status bar */}
                  <div className="mono flex items-center justify-between px-5 pt-3 text-[9px] text-mute">
                    <span>9:41</span>
                    <span className="flex items-center gap-1">
                      <span className="mono text-[9px] text-dim">{app.label}</span>
                    </span>
                  </div>

                  <div className="relative h-[calc(100%-1.75rem)]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={appIndex}
                        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                        className="h-full"
                      >
                        {/* boot */}
                        {phase === 0 && !reduce ? (
                          <div className="grid h-full place-items-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="mono text-sm text-fg">{app.label}</div>
                              <motion.span
                                className="h-5 w-5 rounded-full border-2 border-line border-t-accent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              />
                            </div>
                          </div>
                        ) : phase === 1 && !reduce ? (
                          <div className="flex flex-col gap-3 p-4 pt-5">
                            {[80, 55, 70, 40, 65].map((w, i) => (
                              <Bar key={i} w={`${w}%`} />
                            ))}
                          </div>
                        ) : (
                          <motion.div
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full"
                          >
                            {app.render()}
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* screenshot flash */}
                    <AnimatePresence>
                      {phase === 3 && !reduce && (
                        <motion.div
                          key="flash"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.55, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.7 }}
                          className="pointer-events-none absolute inset-0 bg-white"
                        />
                      )}
                    </AnimatePresence>

                    {/* verified badge */}
                    <AnimatePresence>
                      {phase === PHASES - 1 && (
                        <motion.div
                          key="badge"
                          initial={reduce ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-accent/40 bg-surface-3/90 px-3 py-1"
                        >
                          <span className="mono text-[10px] text-accent">✓ verified</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* caption row */}
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {APPS.map((a, i) => (
              <span
                key={a.id}
                className={`mono text-xs transition-colors ${i === appIndex ? "text-fg" : "text-mute"}`}
              >
                <span className={i === appIndex ? "text-accent" : "text-mute"}>
                  {i === appIndex ? "●" : "○"}
                </span>{" "}
                {a.label}
                <span className="text-mute"> · {a.tag}</span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
