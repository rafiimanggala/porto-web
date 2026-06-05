"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { mascotLines, mascotGreetings, mascotIdle } from "@/data/mascot";

const SECTIONS = ["top", "work", "toolkit", "capabilities", "index", "about", "contact"];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export default function Mascot() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [fine, setFine] = useState(true);
  const [muted, setMuted] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);

  const orbRef = useRef<HTMLButtonElement>(null);
  const mutedRef = useRef(false);
  const activeSection = useRef("top");
  const spoken = useRef<Set<string>>(new Set());
  const lastSpoke = useRef(0);
  const mountedAt = useRef(0);
  const dwell = useRef(0);
  const typeT = useRef(0);
  const dismissT = useRef(0);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 120, damping: 14 });
  const spy = useSpring(py, { stiffness: 120, damping: 14 });

  const speak = useCallback((text: string) => {
    window.clearTimeout(typeT.current);
    window.clearTimeout(dismissT.current);
    lastSpoke.current = Date.now();
    let i = 0;
    const type = () => {
      i++;
      setBubble(text.slice(0, i));
      if (i < text.length) typeT.current = window.setTimeout(type, 26);
      else dismissT.current = window.setTimeout(() => setBubble(null), 5200);
    };
    type();
  }, []);

  const lineFor = useCallback((sec: string) => {
    const pool = mascotLines[sec] ?? mascotIdle;
    const fresh = pool.filter((l) => !spoken.current.has(l));
    const line = pick(fresh.length ? fresh : pool);
    spoken.current.add(line);
    return line;
  }, []);

  // init
  useEffect(() => {
    setMounted(true);
    mountedAt.current = Date.now();
    setFine(window.matchMedia("(pointer: fine)").matches);
    try {
      const m = localStorage.getItem("mascot-muted") === "1";
      setMuted(m);
      mutedRef.current = m;
    } catch {}
  }, []);

  // greeting
  useEffect(() => {
    if (!mounted || reduce) return;
    const t = window.setTimeout(() => {
      if (!mutedRef.current) speak(pick(mascotGreetings));
    }, 3800);
    return () => window.clearTimeout(t);
  }, [mounted, reduce, speak]);

  // pupil follows cursor
  useEffect(() => {
    if (!mounted || !fine || reduce) return;
    const move = (e: MouseEvent) => {
      const el = orbRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const mag = Math.min(6, d / 14);
      px.set((dx / d) * mag);
      py.set((dy / d) * mag);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [mounted, fine, reduce, px, py]);

  // section dwell → speak
  useEffect(() => {
    if (!mounted) return;
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];
    const io = new IntersectionObserver(
      (ents) => {
        let best = activeSection.current;
        let ratio = 0;
        ents.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > ratio) {
            ratio = e.intersectionRatio;
            best = e.target.id;
          }
        });
        if (best !== activeSection.current) {
          activeSection.current = best;
          window.clearTimeout(dwell.current);
          if (fine && !reduce) {
            dwell.current = window.setTimeout(() => {
              const now = Date.now();
              if (mutedRef.current) return;
              if (now - mountedAt.current < 3000) return;
              if (now - lastSpoke.current < 20000) return;
              speak(lineFor(best));
            }, 2800);
          }
        }
      },
      { threshold: [0.25, 0.5, 0.75] }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [mounted, fine, reduce, speak, lineFor]);

  const onOrbClick = () => {
    if (mutedRef.current) return;
    speak(lineFor(activeSection.current));
  };

  const toggleMute = () => {
    const v = !muted;
    setMuted(v);
    mutedRef.current = v;
    try {
      localStorage.setItem("mascot-muted", v ? "1" : "0");
    } catch {}
    if (v) {
      setBubble(null);
      window.clearTimeout(typeT.current);
      window.clearTimeout(dismissT.current);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6">
      <div aria-live="polite" className="flex justify-end">
        <AnimatePresence>
          {bubble && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.165, 0.84, 0.44, 1] }}
              className="mono max-w-[15rem] rounded-xl border border-line-strong bg-surface-3/95 px-3.5 py-2.5 text-[12.5px] leading-snug text-fg shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm"
            >
              <span className="text-accent">{">"}</span> {bubble}
              <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-accent align-middle" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute the guide" : "Mute the guide"}
          className="mono cursor-pointer rounded-full border border-line bg-surface-2/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-dim backdrop-blur transition-colors hover:text-fg"
        >
          {muted ? "muted" : "mute"}
        </button>

        <button
          ref={orbRef}
          onClick={onOrbClick}
          aria-label="AI guide. Click for a hint about this section."
          className="group relative grid h-14 w-14 cursor-pointer place-items-center rounded-full"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-60 blur-md transition-opacity group-hover:opacity-90"
            style={{ background: "radial-gradient(circle, var(--color-accent), transparent 65%)" }}
          />
          <motion.span
            aria-hidden
            className="relative grid h-14 w-14 place-items-center rounded-full border border-line-strong bg-surface-3"
            animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08)" }}
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--color-accent) 80%, white), color-mix(in oklab, var(--color-accent) 55%, transparent))",
              }}
            >
              <motion.span
                className="block h-2.5 w-2.5 rounded-full bg-bg"
                style={{ x: spx, y: spy }}
              />
            </span>
          </motion.span>
        </button>
      </div>
    </div>
  );
}
