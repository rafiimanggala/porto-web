"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import { SIM_APPS, type SimApp } from "./native/screens";

const TLINES = [
  () => "● boot simulator",
  (a: SimApp) => `● render ${a.screen}`,
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
  const appIndex = reduce ? 0 : Math.floor(tick / PHASES) % SIM_APPS.length;
  const app = SIM_APPS[appIndex];
  const Screen = app.Comp;

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
              <div className="mono min-h-[15rem] space-y-1.5 p-5 text-[13px] leading-relaxed">
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
              <div className="relative">
                {/* side buttons */}
                <span className="absolute -left-[2px] top-[108px] h-7 w-[3px] rounded-l bg-surface-3" />
                <span className="absolute -left-[2px] top-[150px] h-11 w-[3px] rounded-l bg-surface-3" />
                <span className="absolute -left-[2px] top-[206px] h-11 w-[3px] rounded-l bg-surface-3" />
                <span className="absolute -right-[2px] top-[170px] h-16 w-[3px] rounded-r bg-surface-3" />

                <div className="relative h-[560px] w-[276px] rounded-[3rem] border-[3px] border-[#2a2a32] bg-[#050507] p-[10px] shadow-[0_40px_90px_rgba(0,0,0,0.6),inset_0_0_2px_rgba(255,255,255,0.15)]">
                  <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-bg">
                    {/* dynamic island */}
                    <div className="absolute left-1/2 top-2 z-20 h-[26px] w-[88px] -translate-x-1/2 rounded-full bg-black" />

                    {/* status bar */}
                    <div className="relative z-10 flex items-center justify-between px-6 pt-3 text-fg">
                      <span className="mono text-[11px] font-medium">9:41</span>
                      <span className="flex items-center gap-1.5">
                        {/* signal */}
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" className="opacity-90">
                          <rect x="0" y="7" width="3" height="4" rx="0.5" />
                          <rect x="4.3" y="5" width="3" height="6" rx="0.5" />
                          <rect x="8.6" y="2.5" width="3" height="8.5" rx="0.5" />
                          <rect x="12.9" y="0" width="3" height="11" rx="0.5" />
                        </svg>
                        {/* battery */}
                        <span className="flex items-center">
                          <span className="h-[10px] w-[18px] rounded-[3px] border border-fg/60 p-[1.5px]">
                            <span className="block h-full w-[70%] rounded-[1px] bg-fg" />
                          </span>
                          <span className="ml-[1px] h-[4px] w-[1.5px] rounded-r bg-fg/60" />
                        </span>
                      </span>
                    </div>

                    {/* app label chip */}
                    <div className="relative z-10 flex justify-center pb-1 pt-1">
                      <span
                        className="mono text-[9px]"
                        style={{ color: app.accent }}
                      >
                        {app.label}
                      </span>
                    </div>

                    <div className="relative h-[calc(100%-3.6rem)]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={appIndex}
                          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4 }}
                          className="h-full"
                        >
                          {phase === 0 && !reduce ? (
                            <div className="grid h-full place-items-center">
                              <div className="flex flex-col items-center gap-3">
                                <span
                                  className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-semibold"
                                  style={{ background: `${app.accent}22`, color: app.accent }}
                                >
                                  {app.label.charAt(0)}
                                </span>
                                <motion.span
                                  className="h-5 w-5 rounded-full border-2 border-line"
                                  style={{ borderTopColor: app.accent }}
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                />
                              </div>
                            </div>
                          ) : phase === 1 && !reduce ? (
                            <div className="flex flex-col gap-3 p-4 pt-5">
                              <div className="shimmer h-24 w-full rounded-2xl" />
                              <div className="grid grid-cols-3 gap-2">
                                <div className="shimmer h-14 rounded-xl" />
                                <div className="shimmer h-14 rounded-xl" />
                                <div className="shimmer h-14 rounded-xl" />
                              </div>
                              <div className="shimmer h-3 w-2/3 rounded-full" />
                              <div className="shimmer h-16 w-full rounded-xl" />
                            </div>
                          ) : (
                            <motion.div
                              initial={reduce ? false : { opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                              className="h-full"
                            >
                              <Screen accent={app.accent} />
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
                            animate={{ opacity: [0, 0.5, 0] }}
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
                            className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-surface-3/90 px-3 py-1 backdrop-blur"
                            style={{ borderColor: `${app.accent}66` }}
                          >
                            <span className="mono text-[10px]" style={{ color: app.accent }}>
                              ✓ verified
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* home indicator */}
                    <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-20 h-1 w-28 -translate-x-1/2 rounded-full bg-fg/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* caption row */}
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {SIM_APPS.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setTick(i * PHASES + (PHASES - 1))}
                className={`mono cursor-pointer text-xs transition-colors ${
                  i === appIndex ? "text-fg" : "text-mute hover:text-dim"
                }`}
              >
                <span style={{ color: i === appIndex ? a.accent : undefined }}>
                  {i === appIndex ? "●" : "○"}
                </span>{" "}
                {a.label}
                <span className="text-mute"> · {a.tag}</span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
