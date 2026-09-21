"use client";

import { useMotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import CardTrack from "./CardTrack";
import Readout from "./Readout";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";
import { useCardPitch, useSnapControls } from "./useSnap";
import { useReadout, type FieldRefs, type ReadoutRefs } from "./useReadout";

// A row of the seven services you drag and snap, with a readout of the numbers
// behind the motion. The readout is written to the DOM from the motion value's
// change event, so it moves at frame rate without a React render per frame.

const STEPS = [
  { label: "Previous card", text: "Prev", delta: -1 },
  { label: "Next card", text: "Next", delta: 1 },
] as const;

function StepButtons({ onStep }: { onStep: (delta: number) => void }) {
  return (
    <div className="flex gap-3">
      {STEPS.map((b) => (
        <button
          key={b.text}
          type="button"
          aria-label={b.label}
          onClick={() => onStep(b.delta)}
          className="mono min-h-11 min-w-20 flex-1 rounded-xl border border-line-strong bg-surface-2 px-5 text-sm text-fg transition-colors hover:bg-surface-3 lg:flex-none"
        >
          {b.text}
        </button>
      ))}
    </div>
  );
}

export default function DragRow() {
  const reduce = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const fieldRefs = useRef<FieldRefs>({});
  const barRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const targetRef = useRef(0); // last index snapped or stepped to
  const readoutRefs = useMemo<ReadoutRefs>(
    () => ({ fields: fieldRefs, bar: barRef, cards: cardRefs }),
    [],
  );

  const { step, stepRef } = useCardPitch(x, trackRef, cardRefs, targetRef);
  const snap = useSnapControls({ x, reduce, stepRef, targetRef, liveRef });
  useReadout(x, stepRef, step, readoutRefs);

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Services, draggable. Use the arrow keys or the buttons to step."
        tabIndex={0}
        onKeyDown={snap.onKeyDown}
        data-testid="drag-row"
        style={{ "--card-w": "min(74vw, 272px)" } as CSSProperties}
        className="overflow-hidden rounded-2xl border border-line bg-surface-1 py-6"
      >
        <CardTrack
          x={x}
          step={step}
          reduce={reduce}
          trackRef={trackRef}
          cardRefs={cardRefs}
          onDragStart={snap.onDragStart}
          onDragEnd={snap.onDragEnd}
        />
      </div>

      <div className="mt-3 h-px w-full bg-line" aria-hidden>
        <div ref={barRef} className="h-px origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <Readout fieldRefs={fieldRefs} />
        <StepButtons onStep={(delta) => snap.goTo(targetRef.current + delta)} />
      </div>

      <p ref={liveRef} role="status" className="sr-only" />
    </div>
  );
}
