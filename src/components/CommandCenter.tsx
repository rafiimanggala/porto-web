"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const AGENTS = [
  { label: "trading", sub: "12 bots" },
  { label: "amadeus", sub: "pulse 14d" },
  { label: "inbox", sub: "3 drafted" },
];

const LOGS = [
  "trading · consensus BTC → HOLD",
  "amadeus · heartbeat ok · wake 2h",
  "inbox · client mail → reply drafted",
  "market · 13F whale position flagged",
  "testengine · browser session recycled",
  "graphify · graph rebuilt · 27k nodes",
  "mahoraga · lesson locked · +1 rule",
];

const SPARK0 = [42, 44, 41, 46, 48, 47, 51, 50, 53, 52, 55, 54, 57, 56, 59, 61];

function sparkPath(v: number[]) {
  const max = Math.max(...v);
  const min = Math.min(...v);
  const span = max - min || 1;
  return v
    .map((y, i) => {
      const x = (i / (v.length - 1)) * 100;
      const yy = 26 - ((y - min) / span) * 22;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${yy.toFixed(1)}`;
    })
    .join(" ");
}

export default function CommandCenter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const [pnl, setPnl] = useState(2.41);
  const [spark, setSpark] = useState<number[]>(SPARK0);
  const [feed, setFeed] = useState<{ id: number; text: string }[]>(
    LOGS.slice(0, 4).map((text, id) => ({ id, text }))
  );
  const [verdict, setVerdict] = useState<"HOLD" | "BUY">("HOLD");
  const seq = useRef(4);
  const step = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !active) return;
    const t = window.setInterval(() => {
      step.current += 1;
      setPnl((p) => {
        const next = p + (Math.random() - 0.45) * 0.18;
        return Math.min(3.1, Math.max(1.7, Number(next.toFixed(2))));
      });
      setSpark((s) => {
        const last = s[s.length - 1];
        const n = Math.min(70, Math.max(34, last + (Math.random() - 0.4) * 6));
        return [...s.slice(1), Math.round(n)];
      });
      setFeed((f) => {
        const id = seq.current++;
        return [...f.slice(-3), { id, text: LOGS[id % LOGS.length] }];
      });
      if (step.current % 3 === 0) setVerdict((v) => (v === "HOLD" ? "BUY" : "HOLD"));
    }, 1600);
    return () => window.clearInterval(t);
  }, [reduce, active]);

  return (
    <div ref={ref} className="card overflow-hidden p-0">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 text-xs text-mute">command-center</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            {!reduce && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="mono text-[10px] text-mute">live</span>
        </span>
      </div>

      <div className="p-4">
        {/* metric row */}
        <div className="grid grid-cols-2 gap-3">
          {/* P&L */}
          <div className="rounded-lg border border-line bg-surface-1 p-3">
            <div className="mono text-[10px] text-mute">P&amp;L · paper</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="mono nums text-xl font-semibold text-accent">
                +{pnl.toFixed(2)}%
              </span>
            </div>
            <svg viewBox="0 0 100 28" className="mt-1 h-7 w-full" preserveAspectRatio="none">
              <path d={sparkPath(spark)} fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* consensus */}
          <div className="rounded-lg border border-line bg-surface-1 p-3">
            <div className="mono text-[10px] text-mute">consensus gate</div>
            <div className="mt-2 space-y-1">
              <div className="mono flex items-center justify-between text-[11px]">
                <span className="text-dim">claude</span>
                <span className="text-fg">{verdict}</span>
              </div>
              <div className="mono flex items-center justify-between text-[11px]">
                <span className="text-dim">groq</span>
                <span className="text-fg">BUY</span>
              </div>
              <div className="mono flex items-center justify-between border-t border-line pt-1 text-[11px]">
                <span className="text-dim">→ exec</span>
                <span style={{ color: verdict === "HOLD" ? "var(--color-mute)" : "var(--color-accent)" }}>
                  {verdict === "HOLD" ? "HOLD · safe" : "BUY · sized"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* agents */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          {AGENTS.map((a, i) => (
            <div key={a.label} className="rounded-lg border border-line bg-surface-1 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
                />
                <span className="mono text-[11px] text-fg">{a.label}</span>
              </div>
              <div className="mono mt-1 text-[9px] text-mute">{a.sub}</div>
            </div>
          ))}
        </div>

        {/* log feed */}
        <div className="mono mt-3 h-[7.5rem] overflow-hidden rounded-lg border border-line bg-bg p-3 text-[11.5px] leading-relaxed">
          <AnimatePresence initial={false}>
            {feed.map((l) => (
              <motion.div
                key={l.id}
                initial={reduce ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-dim"
              >
                <span className="text-accent">›</span> {l.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
