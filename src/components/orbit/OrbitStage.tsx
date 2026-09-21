"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { skills } from "@/data/skills";
import OrbitCard from "./OrbitCard";
import OrbitNode from "./OrbitNode";
import { indexOfSlug, useOrbitScene } from "./useOrbitScene";

// The desktop orbit. A canvas host, a layer of seven real <button>s that the
// scene moves every frame, and the evidence card. It mounts invisible and
// inert while three.js loads, then reveals itself once the first frame (and so
// every button position) exists. If the renderer cannot start, onFail hands
// the section back to the accordion.
//
// Focus model: roving tabindex over the nodes. Arrow keys move focus, Enter or
// Space selects, Escape closes the card and returns focus to its node.

const CARD_ID = "orbit-card";

type Props = {
  ready: boolean;
  selected: string | null;
  onSelect: (slug: string | null) => void;
  onReadyChange: (ready: boolean) => void;
  onFail: () => void;
};

// Roving-focus target for a key press, or -1 when the key is not navigation.
function nextIndex(key: string, i: number): number {
  const last = skills.length - 1;
  if (key === "ArrowRight" || key === "ArrowDown") return i === last ? 0 : i + 1;
  if (key === "ArrowLeft" || key === "ArrowUp") return i === 0 ? last : i - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  return -1;
}

export default function OrbitStage({ ready, selected, onSelect, onReadyChange, onFail }: Props) {
  const reduce = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const sceneRef = useOrbitScene({ hostRef, rootRef, buttons, selected, reduce, onReadyChange, onFail });

  const closeCard = () => {
    const i = indexOfSlug(selected);
    onSelect(null);
    if (i >= 0) buttons.current[i]?.focus();
  };

  const onNodeKey = (e: KeyboardEvent, i: number) => {
    const next = nextIndex(e.key, i);
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  const onRootKey = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !selected) return;
    e.stopPropagation();
    closeCard();
  };

  const current = skills.find((s) => s.slug === selected) ?? null;

  return (
    <div
      ref={rootRef}
      data-orbit-stage
      data-state={ready ? "ready" : "booting"}
      aria-hidden={ready ? undefined : true}
      inert={!ready}
      onKeyDown={onRootKey}
      className={`h-[600px] lg:h-[640px] ${ready ? "relative" : "invisible pointer-events-none absolute inset-x-0 top-0"}`}
    >
      <div
        ref={hostRef}
        data-orbit-canvas
        className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      />

      <div role="group" aria-label="Services" className="pointer-events-none absolute inset-0">
        {skills.map((s, i) => (
          <OrbitNode
            key={s.slug}
            skill={s}
            pressed={selected === s.slug}
            tabStop={active === i}
            controls={selected === s.slug ? CARD_ID : undefined}
            buttonRef={(el) => {
              buttons.current[i] = el;
            }}
            onChoose={() => {
              setActive(i);
              onSelect(selected === s.slug ? null : s.slug);
            }}
            onKeyDown={(e) => onNodeKey(e, i)}
            onHover={(on) => sceneRef.current?.setHovered(on ? i : -1)}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center">
        <AnimatePresence mode="wait">
          {current && (
            <OrbitCard key={current.slug} skill={current} cardId={CARD_ID} onClose={closeCard} />
          )}
        </AnimatePresence>
      </div>

      <p className="sr-only" aria-live="polite">
        {current ? `${current.title}: ${current.evidence}` : ""}
      </p>
    </div>
  );
}
