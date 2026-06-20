"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    id: "detect",
    lines: [
      "[detect] · scan inbox",
      "→ from: james@hodielabs.com",
      "→ subject: vitals chart returns 403",
      "→ project: hodielabs · warming up…",
    ],
  },
  {
    id: "analyze",
    lines: [
      "[analyze] · root cause",
      "→ git log: 20 recent commits read",
      "→ cause: Oura subscription expired (403)",
      "→ plan: guard 403 → graceful fallback UI",
    ],
  },
  {
    id: "fix",
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
    lines: [
      "[deploy] · push + trigger Render",
      "→ build: 12s · bundle 874KB",
      "✓ live · hodielabs.com deployed",
    ],
  },
  {
    id: "test",
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
    lines: [
      "[proof] · capture + close",
      "→ screenshot saved: proof.png",
      "→ email James: Done + proof attached",
      "✓ CLOSED in 4m 12s",
    ],
  },
];

const ALL_LINES = STEPS.flatMap((s) => s.lines);
const LINE_STEP = STEPS.flatMap((s, si) => s.lines.map(() => si));

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
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [shown, setShown] = useState(0);

  const currentStep = shown > 0 ? LINE_STEP[shown - 1] : -1;

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [shown]);

  useEffect(() => {
    if (phase !== "running") return;
    if (shown >= ALL_LINES.length) {
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), 360);
    return () => clearTimeout(t);
  }, [phase, shown]);

  function start() {
    if (phase === "running") return;
    if (reduce) {
      setShown(ALL_LINES.length);
      setPhase("done");
      return;
    }
    setShown(0);
    setPhase("running");
  }

  function reset() {
    setShown(0);
    setPhase("idle");
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 text-xs text-mute">te-pipeline · issue → live proof</span>
        <span className="ml-auto">
          {phase === "running" && (
            <span className="flex items-center gap-1.5">
              {!reduce && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
              )}
              <span className="mono text-[10px] text-mute">running</span>
            </span>
          )}
          {phase === "done" && (
            <span className="mono text-[10px] text-[#34d399]">✓ done</span>
          )}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= currentStep ? "bg-accent" : "bg-line"
              }`}
            />
          ))}
        </div>

        <div
          ref={termRef}
          className="mono h-56 overflow-y-auto rounded-lg border border-line bg-bg p-3 text-[11.5px] leading-relaxed"
        >
          {shown === 0 && phase === "idle" && (
            <span className="text-mute">Press ▶ Run to watch the full pipeline…</span>
          )}
          <AnimatePresence initial={false}>
            {ALL_LINES.slice(0, shown).map((line, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={lineColor(line)}
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>
          {phase === "running" && (
            <motion.span
              className="inline-block h-3 w-1.5 translate-y-0.5 bg-accent"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          {phase === "idle" && (
            <button
              onClick={start}
              className="mono flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-[12px] text-accent transition-colors hover:bg-accent/20"
            >
              ▶ Run
            </button>
          )}
          {phase === "done" && (
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
        </div>
      </div>
    </div>
  );
}
