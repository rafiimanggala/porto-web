"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { automationStages, automationSummary, type Line } from "@/data/automation";

const toneClass: Record<string, string> = {
  add: "text-accent",
  del: "text-[#ff6b6b]",
  ok: "text-accent",
  dim: "text-mute",
  cmd: "text-fg",
};

function LineRow({ l }: { l: Line }) {
  return (
    <div className={`mono text-[12px] leading-relaxed ${toneClass[l.tone ?? "dim"]}`}>
      {l.tone === "cmd" ? <span className="text-accent">$ </span> : null}
      {l.text}
    </div>
  );
}

function ProofFrame() {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-line bg-bg">
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-1 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="mono ml-2 text-[10px] text-mute">vitals-pass.png</span>
        <span className="mono ml-auto text-[10px] text-accent">✓ captured</span>
      </div>
      <div className="flex h-24 items-center justify-center">
        <span className="mono text-xs text-accent">✓ 12/12 passed · chart rendered</span>
      </div>
    </div>
  );
}

export default function AutomationDemo({ progress }: { progress?: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const total = automationStages.length;
  // Scroll-driven count when progress supplied; else manual play state.
  const [scrollCount, setScrollCount] = useState(reduce ? total : 0);
  const [playCount, setPlayCount] = useState(0);
  const [playing, setPlaying] = useState(false);

  useMotionValueEvent(progress ?? ({ on: () => () => {} } as never), "change", (v: number) => {
    setScrollCount(Math.min(total, Math.round(v * (total + 0.4))));
  });

  // Manual Run (used when no scroll progress, e.g. reduced motion or mobile).
  useEffect(() => {
    if (!playing) return;
    if (playCount >= total) { setPlaying(false); return; }
    const t = window.setTimeout(() => setPlayCount((c) => c + 1), 650);
    return () => window.clearTimeout(t);
  }, [playing, playCount, total]);

  const revealed = progress && !reduce ? scrollCount : playCount || (reduce ? total : 0);

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 text-xs text-mute">agent · fix-deploy-test-proof</span>
        {!progress && (
          <button
            type="button"
            onClick={() => { setPlayCount(0); setPlaying(true); }}
            className="mono ml-auto cursor-pointer rounded-md border border-line px-2.5 py-1 text-[11px] text-accent transition-colors hover:border-line-strong"
          >
            {revealed >= total ? "↺ replay" : "▶ run"}
          </button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {automationStages.map((stage, i) => {
          const open = i < revealed;
          return (
            <div key={stage.id} className="rounded-lg border border-line bg-bg p-3">
              <div className="mono mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wider">
                <span className={open ? "text-accent" : "text-mute"}>{stage.label}</span>
                {open && <span className="h-px flex-1 bg-line" />}
              </div>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {stage.lines.map((l, j) => (
                      <LineRow key={j} l={l} />
                    ))}
                    {stage.id === "proof" && <ProofFrame />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <AnimatePresence>
          {revealed >= total && (
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mono flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-line bg-surface-1 p-3 text-[11px] text-dim"
            >
              <span>⏱ {automationSummary.duration}</span>
              <span>{automationSummary.steps}</span>
              <span className="text-accent">{automationSummary.result}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
