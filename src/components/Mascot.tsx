"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  mascotLines,
  mascotElementLines,
  mascotGreetings,
  mascotIdle,
  mascotFast,
  mascotApproach,
} from "@/data/mascot";

const SECTIONS = ["top", "work", "toolkit", "native", "index", "contact"];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

// cooldowns (ms)
const CD_HOVER = 5500;
const CD_AMBIENT = 9000;
const QUIET_MS = 2000;

export default function Mascot() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [fine, setFine] = useState(true);
  const [muted, setMuted] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [react, setReact] = useState(false);
  const [blink, setBlink] = useState(false);

  const orbRef = useRef<HTMLButtonElement>(null);
  const mutedRef = useRef(false);
  const activeSection = useRef("top");
  const spoken = useRef<Set<string>>(new Set());
  const lastSpoke = useRef(0);
  const mountedAt = useRef(0);
  const dwell = useRef(0);
  const typeT = useRef(0);
  const dismissT = useRef(0);
  const reactT = useRef(0);

  // cursor behaviour trackers
  const lastMove = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastHoverKey = useRef("");
  const approachedAt = useRef(0);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 130, damping: 13 });
  const spy = useSpring(py, { stiffness: 130, damping: 13 });

  const speak = useCallback((text: string) => {
    window.clearTimeout(typeT.current);
    window.clearTimeout(dismissT.current);
    lastSpoke.current = Date.now();
    let i = 0;
    const type = () => {
      i++;
      setBubble(text.slice(0, i));
      if (i < text.length) typeT.current = window.setTimeout(type, 24);
      else dismissT.current = window.setTimeout(() => setBubble(null), 5000);
    };
    type();
  }, []);

  // pick a non-repeating line from a pool
  const fromPool = useCallback((pool: string[]) => {
    const fresh = pool.filter((l) => !spoken.current.has(l));
    const line = pick(fresh.length ? fresh : pool);
    spoken.current.add(line);
    if (spoken.current.size > 24) spoken.current.clear();
    return line;
  }, []);

  const sectionLine = useCallback(
    (sec: string) => fromPool(mascotLines[sec] ?? mascotIdle),
    [fromPool]
  );

  // resolve an element's data-unit key to a line (with family fallback)
  const elementLine = useCallback(
    (key: string): string | null => {
      let pool = mascotElementLines[key];
      if (!pool && key.includes(":")) {
        pool = mascotElementLines[key.split(":")[0]];
      }
      return pool ? fromPool(pool) : null;
    },
    [fromPool]
  );

  const canSpeak = useCallback((cd: number) => {
    const now = Date.now();
    if (mutedRef.current) return false;
    if (now - mountedAt.current < QUIET_MS) return false;
    if (now - lastSpoke.current < cd) return false;
    return true;
  }, []);

  const flashReact = useCallback(() => {
    setReact(true);
    window.clearTimeout(reactT.current);
    reactT.current = window.setTimeout(() => setReact(false), 650);
  }, []);

  // init
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount gate
    setMounted(true);
    mountedAt.current = Date.now();
    lastMove.current = Date.now();
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
    }, 3400);
    return () => window.clearTimeout(t);
  }, [mounted, reduce, speak]);

  // occasional blink
  useEffect(() => {
    if (!mounted || reduce) return;
    const t = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 130);
    }, 4200);
    return () => window.clearInterval(t);
  }, [mounted, reduce]);

  // cursor move: pupil follow + speed + approach
  useEffect(() => {
    if (!mounted || !fine || reduce) return;
    const move = (e: MouseEvent) => {
      const el = orbRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const mag = Math.min(6, d / 14);
      px.set((dx / d) * mag);
      py.set((dy / d) * mag);

      const now = Date.now();
      const dt = now - lastMove.current;
      const moved = Math.hypot(
        e.clientX - lastPos.current.x,
        e.clientY - lastPos.current.y
      );
      lastMove.current = now;
      lastPos.current = { x: e.clientX, y: e.clientY };
      const speed = moved / Math.max(dt, 1); // px/ms

      // approaching the orb
      if (d < 96) {
        flashReact();
        if (now - approachedAt.current > 12000 && canSpeak(CD_AMBIENT)) {
          approachedAt.current = now;
          speak(fromPool(mascotApproach));
        }
        return;
      }

      // fast flick across the page (rare)
      if (speed > 3.2 && moved > 220 && canSpeak(CD_AMBIENT) && Math.random() < 0.5) {
        speak(fromPool(mascotFast));
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [mounted, fine, reduce, px, py, canSpeak, speak, fromPool, flashReact]);

  // hover an element with data-unit → contextual line
  useEffect(() => {
    if (!mounted || !fine || reduce) return;
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const tagged = target?.closest?.("[data-unit]");
      if (!tagged) return;
      const key = tagged.getAttribute("data-unit") || "";
      if (key === lastHoverKey.current) return;
      lastHoverKey.current = key;
      if (!canSpeak(CD_HOVER)) return;
      const line = elementLine(key);
      if (line) speak(line);
    };
    document.addEventListener("mouseover", over, { passive: true });
    return () => document.removeEventListener("mouseover", over);
  }, [mounted, fine, reduce, canSpeak, elementLine, speak]);

  // idle nudge: cursor still for a while
  useEffect(() => {
    if (!mounted || !fine || reduce) return;
    const t = window.setInterval(() => {
      if (Date.now() - lastMove.current > 6500 && canSpeak(CD_AMBIENT)) {
        speak(fromPool(mascotIdle));
        lastMove.current = Date.now(); // avoid immediate re-trigger
      }
    }, 1500);
    return () => window.clearInterval(t);
  }, [mounted, fine, reduce, canSpeak, speak, fromPool]);

  // section dwell → speak (gentle fallback)
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
              if (canSpeak(CD_AMBIENT)) speak(sectionLine(best));
            }, 1600);
          }
        }
      },
      { threshold: [0.25, 0.5, 0.75] }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [mounted, fine, reduce, canSpeak, speak, sectionLine]);

  const onOrbClick = () => {
    if (mutedRef.current) return;
    lastSpoke.current = 0; // bypass cooldown on explicit click
    speak(sectionLine(activeSection.current));
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
            animate={
              reduce
                ? undefined
                : react
                  ? { scale: 1.14 }
                  : { scale: [1, 1.04, 1] }
            }
            transition={
              react
                ? { duration: 0.25, ease: "easeOut" }
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08)" }}
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-full transition-transform"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--color-accent) 80%, white), color-mix(in oklab, var(--color-accent) 55%, transparent))",
              }}
            >
              <motion.span
                className="block rounded-full bg-bg"
                style={{ x: spx, y: spy, width: 10, height: 10 }}
                animate={{ scaleY: blink ? 0.15 : 1, scale: react ? 1.25 : 1 }}
                transition={{ duration: 0.12 }}
              />
            </span>
          </motion.span>
        </button>
      </div>
    </div>
  );
}
