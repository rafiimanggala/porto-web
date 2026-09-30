"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import RoleSwap from "@/components/ui/RoleSwap";
import { isPaused, loadHome, setPaused, subscribePaused, usePixelMount, type Peta } from "@/components/pixel/runtime";
import "@/components/pixel/pixel.css";
import { DOCK_LINKS, WATCHED_SECTIONS, type DockLink } from "./sections";
import { useActiveSection } from "./useActiveSection";
import { SPRING, HOVER_SCALE, TAP_SCALE } from "./springs";

const PILL =
  "flex min-h-11 items-center rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 max-[379px]:px-2 max-[359px]:px-1.5 max-[359px]:text-[12px] sm:px-4 sm:text-sm";
const IDLE = "text-fg hover:bg-surface-3";
const ACTIVE = "bg-accent text-white";

// next/link isn't a motion component on its own, so give it the same spring
// hover/tap the plain-anchor pills get below.
const MotionLink = motion.create(Link);

function DockItem({ link, current }: { link: DockLink; current: boolean }) {
  const cls = `${PILL} ${current ? ACTIVE : IDLE}`;
  const reduce = useReducedMotion();
  if (link.external) {
    return (
      <MotionLink
        href={link.href}
        className={cls}
        whileHover={reduce ? undefined : HOVER_SCALE}
        whileTap={reduce ? undefined : TAP_SCALE}
        transition={SPRING}
      >
        {link.label}
      </MotionLink>
    );
  }
  // data-sections tells the jukung which stretch of the page this link stands for.
  return (
    <motion.a
      href={link.href}
      data-sections={link.sections?.join(" ")}
      aria-current={current ? "location" : undefined}
      className={cls}
      whileHover={reduce ? undefined : HOVER_SCALE}
      whileTap={reduce ? undefined : TAP_SCALE}
      transition={SPRING}
    >
      {link.label}
    </motion.a>
  );
}

function part(pill: HTMLElement, name: string): HTMLCanvasElement {
  const el = pill.querySelector(`canvas[data-part="${name}"]`);
  if (!(el instanceof HTMLCanvasElement)) throw new Error(`dock canvas "${name}" is missing`);
  return el;
}

const mountSea = (P: Peta, pill: HTMLElement) => P.dock.mount({ pill, sea: part(pill, "sea"), boat: part(pill, "boat") });

// The jukung (src/pixel/dock.js): a strip of sea along the pill's top edge,
// clipped to its rounded shape, and the boat in a canvas that rises above it.
function DockSea() {
  const clip = useRef<HTMLSpanElement>(null);
  const pill = useCallback(() => clip.current?.parentElement ?? null, []);
  usePixelMount("dock", pill, loadHome, mountSea, { always: true });
  return (
    <>
      <span ref={clip} aria-hidden="true" className="px-dock-sea">
        <canvas data-part="sea" />
      </span>
      <canvas aria-hidden="true" data-part="boat" className="px-dock-boat" />
    </>
  );
}

// Stops every pixel animation on the page (WCAG 2.2.2). Starts pressed when the
// reader has asked the system for reduced motion.
function PauseButton() {
  const paused = useSyncExternalStore(subscribePaused, isPaused, () => false);
  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label="Pause the pixel animations"
      onClick={() => setPaused(!paused)}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200 max-[359px]:size-10 ${
        paused ? "bg-sun text-pastel-ink" : IDLE
      }`}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M4 3h3v10H4zm5 0h3v10H9z" />
      </svg>
    </button>
  );
}

// Floating pill nav, fixed at the bottom centre. The current section is the filled
// orange pill. 12px side margins and the safe-area inset keep it inside a phone screen.
export default function Dock() {
  const section = useActiveSection(WATCHED_SECTIONS);
  const currentKey = DOCK_LINKS.find((l) => l.sections?.includes(section))?.key;

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-3 z-50 flex justify-center"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="pointer-events-auto relative flex max-w-full items-center gap-1 rounded-full border border-line bg-surface-2/80 px-1.5 pt-3 pb-1.5 shadow-[0_8px_24px_rgba(8,16,12,0.4)] backdrop-blur-md sm:gap-2">
        <DockSea />
        <span className="font-display px-2 text-xl leading-none text-accent max-[439px]:hidden sm:px-3">
          rafii.
        </span>
        <span aria-hidden="true" className="hidden pr-2 sm:block">
          <RoleSwap className="text-[12px] font-medium text-dim" />
        </span>
        <ul className="flex items-center gap-0.5 sm:gap-1">
          {DOCK_LINKS.map((link) => (
            <li key={link.key}>
              <DockItem link={link} current={link.key === currentKey} />
            </li>
          ))}
        </ul>
        <PauseButton />
      </div>
    </nav>
  );
}
