import type { ComponentProps } from "react";
import { ROUND_SECONDS } from "@/lib/doodle/round";
import type { Phase } from "@/lib/doodle/round";
import type { Match } from "@/lib/doodle/types";
import { WORDS } from "@/lib/doodle/words";

const BUTTON_BASE =
  "mono min-h-11 cursor-pointer rounded-full border px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const BUTTON = `${BUTTON_BASE} border-line text-fg hover:border-line-strong disabled:hover:border-line`;
const BUTTON_PRIMARY = `${BUTTON_BASE} border-fg bg-fg text-bg hover:bg-fg/90`;

export function timerText(phase: Phase, secondsLeft: number): string {
  if (phase === "over") return "Time's up";
  if (phase === "running") return `${secondsLeft}s left`;
  return `${ROUND_SECONDS}s, starts on your first stroke`;
}

// CSS-only countdown: scaleX 1 -> 0 over the round. Idle snaps back to full.
export function TimerBar({ running, over }: { running: boolean; over: boolean }) {
  const drained = running || over;
  return (
    <div aria-hidden className="mt-3 h-1 overflow-hidden rounded-full bg-line">
      <div
        data-doodle-timerbar
        className="h-full w-full origin-left bg-accent"
        style={{
          transform: drained ? "scaleX(0)" : "scaleX(1)",
          opacity: drained ? 1 : 0.35,
          transition: running ? `transform ${ROUND_SECONDS}s linear` : "none",
        }}
      />
    </div>
  );
}

export function Prompt({
  word,
  phase,
  secondsLeft,
}: {
  word: keyof typeof WORDS | null;
  phase: Phase;
  secondsLeft: number;
}) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p aria-live="polite" aria-atomic="true" className="t-h3 text-fg">
          {word ? (
            <>
              Draw: <span data-doodle-word>{WORDS[word].word}</span>
            </>
          ) : (
            <span className="text-dim">Getting ready</span>
          )}
        </p>
        <p data-doodle-timer className="mono nums text-xs text-dim">
          {timerText(phase, secondsLeft)}
        </p>
      </div>
      {word && <p className="mt-1 text-sm text-mute">{WORDS[word].hint}</p>}
    </>
  );
}

type CanvasHandlers = Pick<
  ComponentProps<"canvas">,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
>;

// The drawing surface. touch-action none lives on the canvas only, so the rest
// of the page still scrolls on touch.
export function Pad({
  canvasRef,
  handlers,
  locked,
  hasInk,
  loading,
  top,
}: {
  canvasRef: ComponentProps<"canvas">["ref"];
  handlers: CanvasHandlers;
  locked: boolean;
  hasInk: boolean;
  loading: boolean;
  top: Match | null;
}) {
  return (
    <div className="relative mt-4 overflow-hidden rounded-lg border border-line bg-surface-2">
      <canvas
        ref={canvasRef}
        data-doodle-canvas
        role="img"
        aria-label="Drawing pad. Draw with a finger or mouse, or use the sample sketch button."
        className={`block aspect-[4/3] w-full touch-none select-none text-fg ${
          locked ? "cursor-not-allowed" : "cursor-crosshair"
        }`}
        {...handlers}
      />
      {top && (
        <p
          aria-hidden
          className="mono pointer-events-none absolute left-3 top-3 text-xs text-dim md:hidden"
        >
          sees: {WORDS[top.id].word} {Math.round(top.share * 100)}%
        </p>
      )}
      {!hasInk && (
        <p className="mono pointer-events-none absolute inset-0 grid place-items-center text-xs text-mute">
          {loading ? "Warming up the matcher" : "Draw here"}
        </p>
      )}
    </div>
  );
}

export function Controls({
  phase,
  locked,
  hasInk,
  onClear,
  onSample,
  onNext,
}: {
  phase: Phase;
  locked: boolean;
  hasInk: boolean;
  onClear: () => void;
  onSample: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" className={BUTTON} onClick={onClear} disabled={locked || !hasInk}>
        Clear
      </button>
      <button type="button" className={BUTTON} onClick={onSample} disabled={locked}>
        Try a sample sketch
      </button>
      <button
        type="button"
        className={phase === "over" ? BUTTON_PRIMARY : BUTTON}
        onClick={onNext}
        disabled={phase === "loading"}
      >
        Next word
      </button>
    </div>
  );
}
