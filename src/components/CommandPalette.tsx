"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { profile } from "@/data/portfolio";

type Action = {
  label: string;
  hint: string;
  group: "Navigate" | "Contact";
  run: () => void;
};

function goto(sel: string) {
  document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function CommandPalette() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);

  // single entry point so opening/closing always resets cleanly
  const setOpenSafe = useCallback((v: boolean) => {
    openRef.current = v;
    setOpen(v);
    if (!v) {
      setQ("");
      setSel(0);
    }
  }, []);

  const actions = useMemo<Action[]>(
    () => [
      { label: "Selected work", hint: "01", group: "Navigate", run: () => goto("#work") },
      { label: "Custom toolkit", hint: "02", group: "Navigate", run: () => goto("#toolkit") },
      { label: "Native, AI-driven", hint: "03", group: "Navigate", run: () => goto("#native") },
      { label: "Project index", hint: "04", group: "Navigate", run: () => goto("#index") },
      { label: "About", hint: "05", group: "Navigate", run: () => goto("#contact") },
      { label: "Back to top", hint: "↑", group: "Navigate", run: () => goto("#top") },
      { label: `Email ${profile.handle}`, hint: "mailto", group: "Contact", run: () => { window.location.href = `mailto:${profile.email}`; } },
      { label: "Open GitHub", hint: "↗", group: "Contact", run: () => window.open(profile.github, "_blank", "noreferrer") },
    ],
    []
  );

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? actions.filter((a) => a.label.toLowerCase().includes(t)) : actions;
  }, [q, actions]);

  // clamp selection to current result set without an effect
  const active = Math.min(sel, Math.max(0, results.length - 1));

  const close = useCallback(() => setOpenSafe(false), [setOpenSafe]);

  const runAt = useCallback(
    (i: number) => {
      const a = results[i];
      if (!a) return;
      close();
      a.run();
    },
    [results, close]
  );

  // open via cmd/ctrl-K, or a custom event from the nav hint
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenSafe(!openRef.current);
      } else if (e.key === "Escape") {
        setOpenSafe(false);
      }
    };
    const onOpen = () => setOpenSafe(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", onOpen);
    };
  }, [setOpenSafe]);

  // focus the input when opened (no state writes here)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel(Math.min(active + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel(Math.max(active - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(active);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <div
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-label="Command menu"
            className="card relative w-full max-w-lg overflow-hidden p-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="mono text-accent">›</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onListKey}
                placeholder="Jump to a section, or get in touch..."
                className="mono w-full bg-transparent text-sm text-fg outline-none placeholder:text-mute"
              />
              <kbd className="mono rounded border border-line px-1.5 py-0.5 text-[10px] text-mute">
                esc
              </kbd>
            </div>

            <ul className="max-h-[46vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="mono px-3 py-6 text-center text-xs text-mute">
                  no matches
                </li>
              )}
              {results.map((a, i) => (
                <li key={a.label}>
                  <button
                    type="button"
                    onMouseMove={() => setSel(i)}
                    onClick={() => runAt(i)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === active ? "bg-surface-3" : "hover:bg-surface-2"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-accent" : "bg-mute"}`}
                      />
                      <span className="text-sm text-fg">{a.label}</span>
                    </span>
                    <span className="mono text-[10px] uppercase tracking-wider text-mute">
                      {a.hint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mono flex items-center gap-3 border-t border-line px-4 py-2 text-[10px] text-mute">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto">rafii · command menu</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
