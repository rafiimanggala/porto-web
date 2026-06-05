"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type TermLine = { p: string; o: string };

function Output({ text }: { text: string }) {
  // colorize a leading status glyph, keep the rest dim
  const lead = text.startsWith("●");
  return (
    <div className="mt-1 pl-5 text-dim">
      {lead && <span className="text-accent">● </span>}
      {lead ? text.slice(2) : text}
    </div>
  );
}

export default function Terminal({
  lines,
  title,
}: {
  lines: TermLine[];
  title: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [shown, setShown] = useState(0); // fully completed lines
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  useEffect(() => {
    if (reduce || !started || shown >= lines.length) return;
    const full = lines[shown].p;
    if (typed.length < full.length) {
      const t = window.setTimeout(
        () => setTyped(full.slice(0, typed.length + 1)),
        34
      );
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setShown((s) => s + 1);
      setTyped("");
    }, 460);
    return () => window.clearTimeout(t);
  }, [reduce, started, shown, typed, lines]);

  const done = reduce || shown >= lines.length;
  const visible = reduce ? lines.length : shown;

  return (
    <div ref={ref} className="card overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 text-xs text-mute">{title}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" />
          <span className="mono text-[10px] text-mute">live</span>
        </span>
      </div>

      <div className="mono min-h-[13.5rem] space-y-4 p-5 text-[13px] leading-relaxed">
        {lines.slice(0, visible).map((t) => (
          <div key={t.p}>
            <div className="text-fg">
              <span className="text-accent">~ $</span> {t.p}
            </div>
            <Output text={t.o} />
          </div>
        ))}

        {/* line currently being typed */}
        {!done && (
          <div className="text-fg">
            <span className="text-accent">~ $</span> {typed}
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
          </div>
        )}

        {/* resting prompt once everything has printed */}
        {done && (
          <div className="text-fg">
            <span className="text-accent">~ $</span>{" "}
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
          </div>
        )}
      </div>
    </div>
  );
}
