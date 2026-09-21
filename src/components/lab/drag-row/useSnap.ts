import { animate } from "framer-motion";
import type { AnimationPlaybackControls, MotionValue, PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { skills } from "@/data/skills";
import { LAST } from "./useReadout";

const LOOKAHEAD_SECONDS = 0.18; // how far ahead a flick projects before snapping
const SPRING = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 } as const;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

// Measures the distance between two card starts and keeps the same card
// centred when it changes (resize, font load). Returns 0 until measured.
export function useCardPitch(
  x: MotionValue<number>,
  trackRef: RefObject<HTMLUListElement | null>,
  cardRefs: RefObject<(HTMLLIElement | null)[]>,
  targetRef: RefObject<number>,
) {
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const [a, b] = cardRefs.current;
      if (!a || !b) return;
      const next = b.offsetLeft - a.offsetLeft;
      if (next <= 0 || next === stepRef.current) return;
      stepRef.current = next;
      setStep(next);
      x.set(-targetRef.current * next);
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(track);
    return () => watch.disconnect();
  }, [x, trackRef, cardRefs, targetRef]);

  return { step, stepRef };
}

type SnapArgs = {
  x: MotionValue<number>;
  reduce: boolean;
  stepRef: RefObject<number>;
  targetRef: RefObject<number>;
  liveRef: RefObject<HTMLParagraphElement | null>;
};

// Every way of moving to a card: flick and let go, arrow keys, buttons.
export function useSnapControls({ x, reduce, stepRef, targetRef, liveRef }: SnapArgs) {
  const anim = useRef<AnimationPlaybackControls | null>(null);

  const announce = (index: number) => {
    const skill = skills[index];
    if (liveRef.current && skill) {
      liveRef.current.textContent = `Card ${index + 1} of ${skills.length}: ${skill.title}`;
    }
  };

  const goTo = (index: number) => {
    const step = stepRef.current;
    if (!step) return;
    const next = clamp(index, 0, LAST);
    targetRef.current = next;
    anim.current?.stop();
    announce(next);
    if (reduce) {
      x.set(-next * step);
      return;
    }
    anim.current = animate(x, -next * step, SPRING);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const step = stepRef.current;
    if (!step) return;
    const projected = reduce ? x.get() : x.get() + info.velocity.x * LOOKAHEAD_SECONDS;
    goTo(Math.round(-projected / step));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number | undefined> = {
      ArrowRight: targetRef.current + 1,
      ArrowLeft: targetRef.current - 1,
      Home: 0,
      End: LAST,
    };
    const next = moves[e.key];
    if (next === undefined) return;
    e.preventDefault();
    goTo(next);
  };

  return { goTo, onDragEnd, onKeyDown, onDragStart: () => anim.current?.stop() };
}
