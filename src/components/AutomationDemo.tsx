"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    id: "detect",
    label: "detect",
    caption: "Email in",
    lines: [
      "[detect] · scan inbox",
      "→ from: james@hodielabs.com",
      "→ subject: vitals chart returns 403",
      "→ project: hodielabs · warming up…",
    ],
  },
  {
    id: "analyze",
    label: "analyze",
    caption: "Root cause",
    lines: [
      "[analyze] · root cause",
      "→ git log: 20 recent commits read",
      "→ cause: Oura subscription expired (403)",
      "→ plan: guard 403 → graceful fallback UI",
    ],
  },
  {
    id: "fix",
    label: "fix",
    caption: "Patch code",
    lines: [
      "[fix] · patch oura.service.ts",
      "+ if (status === 403) return { error: 'subscription' }",
      "+ <EmptyVitals reason='subscription' />",
      "- throw new Error('Oura fetch failed')",
      "→ commit: fix: handle oura 403 gracefully",
    ],
  },
  {
    id: "deploy",
    label: "deploy",
    caption: "Push live",
    lines: [
      "[deploy] · push + trigger Render",
      "→ build: 12s · bundle 874KB",
      "✓ live · hodielabs.com deployed",
    ],
  },
  {
    id: "test",
    label: "test",
    caption: "Playwright",
    lines: [
      "[test] · playwright e2e",
      "✓ vitals fallback renders correctly",
      "✓ no unhandled console errors",
      "✓ other pages unaffected",
      "✓ 12/12 passed",
    ],
  },
  {
    id: "proof",
    label: "proof",
    caption: "Capture",
    lines: [
      "[proof] · capture + close",
      "→ screenshot saved: proof.png",
      "→ email James: Done + proof attached",
      "✓ CLOSED in 4m 12s",
    ],
  },
];

function lineColor(line: string): string {
  if (line.startsWith("[")) return "text-accent";
  if (line.startsWith("+")) return "text-[#34d399]";
  if (line.startsWith("-")) return "text-[#f87171]";
  if (line.startsWith("✓")) return "text-[#34d399]";
  if (line.startsWith("→")) return "text-dim";
  return "text-mute";
}

export default function AutomationDemo() {
  const reduce = useReducedMotion();
  const termRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [runPhase, setRunPhase] = useState<"idle" | "running" | "done">("idle");

  // auto-scroll terminal
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [shown]);

  // ticker for auto-run
  useEffect(() => {
    if (runPhase !== "running" || active === null) return;
    const step = STEPS[active];
    if (shown < step.lines.length) {
      const t = setTimeout(() => setShown((s) => s + 1), 340);
      return () => clearTimeout(t);
    }
    // step done — mark visited, advance
    setVisited((v) => new Set(v).add(active));
    if (active < STEPS.length - 1) {
      const t = setTimeout(() => {
        setActive((a) => (a !== null ? a + 1 : 0));
        setShown(0);
      }, 380);
      return () => clearTimeout(t);
    }
    setRunPhase("done");
  }, [runPhase, active, shown]);

  function selectStep(i: number) {
    if (runPhase === "running") return;
    setRunPhase("idle");
    setActive(i);
    setShown(reduce ? STEPS[i].lines.length : 0);
    if (!reduce) {
      // animate lines in quickly when manually selecting
      let n = 0;
      const tick = () => {
        n++;
        setShown(n);
        if (n < STEPS[i].lines.length) setTimeout(tick, 180);
        else setVisited((v) => new Set(v).add(i));
      };
      setTimeout(tick, 60);
    } else {
      setVisited((v) => new Set(v).add(i));
    }
  }

  function runAll() {
    setVisited(new Set());
    setActive(0);
    setShown(0);
    setRunPhase(reduce ? "done" : "running");
    if (reduce) {
      setVisited(new Set(STEPS.map((_, i) => i)));
      setActive(STEPS.length - 1);
      setShown(STEPS[STEPS.length - 1].lines.length);
    }
  }

  function reset() {
    setActive(null);
    setShown(0);
    setVisited(new Set());
    setRunPhase("idle");
  }

  const activeLines = active !== null ? STEPS[active].lines : [];

  return (
    <div className="card overflow-hidden p-0">
      {/* macOS chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 text-xs text-mute">te-pipeline · issue → live proof</span>
        <span className="ml-auto flex items-center gap-1.5">
          {runPhase === "running" && (
            <>
              {!reduce && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
              )}
              <span className="mono text-[10px] text-mute">running</span>
            </>
          )}
          {runPhase === "done" && (
            <span className="mono text-[10px] text-[#34d399]">✓ done</span>
          )}
        </span>
      </div>

      <div className="p-4">
        {/* step pills — clickable, wrap on mobile */}
        <div className="mb-3 flex flex-wrap gap-2">
          {STEPS.map((s, i) => {
            const isActive = active === i;
            const isDone = visited.has(i) && active !== i;
            return (
              <button
                key={s.id}
                onClick={() => selectStep(i)}
                disabled={runPhase === "running"}
                className={`mono flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] transition-all duration-200 ${
                  isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : isDone
                    ? "border-[#34d399]/30 bg-[#34d399]/5 text-[#34d399]"
                    : "border-line bg-surface-1 text-mute hover:border-accent/40 hover:text-fg"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-accent" : isDone ? "bg-[#34d399]" : "bg-line"
                  }`}
                />
                {s.label}
                {isDone && <span className="text-[9px] opacity-70">✓</span>}
              </button>
            );
          })}
        </div>

        {/* terminal */}
        <div
          ref={termRef}
          className="mono h-48 overflow-y-auto rounded-lg border border-line bg-bg p-3 text-[11.5px] leading-relaxed sm:h-56"
        >
          {active === null ? (
            <span className="text-mute">
              Click a step to explore, or press ▶ Run All to watch the pipeline…
            </span>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {activeLines.slice(0, shown).map((line, i) => (
                  <motion.div
                    key={`${active}-${i}`}
                    initial={reduce ? false : { opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={lineColor(line)}
                  >
                    {line}
                  </motion.div>
                ))}
              </AnimatePresence>
              {runPhase === "running" && shown < activeLines.length && (
                <motion.span
                  className="inline-block h-3 w-1.5 translate-y-0.5 bg-accent"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                />
              )}
            </>
          )}
        </div>

        {/* step caption (mobile hint) */}
        {active !== null && (
          <p className="mono mt-1.5 text-[10px] text-mute">
            {active + 1}/{STEPS.length} · {STEPS[active].caption}
          </p>
        )}

        {/* controls */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {runPhase !== "done" && (
            <button
              onClick={runAll}
              disabled={runPhase === "running"}
              className="mono flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-[12px] text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ▶ Run All
            </button>
          )}
          {runPhase === "done" && (
            <>
              <span className="mono text-[11px] text-[#34d399]">
                ✓ client issue → live proof in ~4 min
              </span>
              <button
                onClick={reset}
                className="mono ml-auto rounded-lg border border-line px-3 py-1.5 text-[11px] text-mute transition-colors hover:text-fg"
              >
                ↺ Replay
              </button>
            </>
          )}
          {runPhase === "idle" && active !== null && (
            <button
              onClick={reset}
              className="mono ml-auto rounded-lg border border-line px-3 py-1.5 text-[11px] text-mute transition-colors hover:text-fg"
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
