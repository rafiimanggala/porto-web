"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { BrowserWindow, CardRow, Pill } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";

/* Ambient replay of one real beat from the list above: an Email Reactor
   catching a client bug and shipping the fix on its own. Named pattern: AI
   Chat Interface (Companion chat variant) for the anatomy, Streaming
   Response for the reveal — but scripted and read-only, so the prompt
   composer and follow-up actions from those patterns are dropped on
   purpose. The nested BrowserWindow mid-thread is the same "screen inside
   the window" depth trick x.ai/bot uses for its Salesforce sign-in beat. */

type Beat =
  | { kind: "message"; text: string }
  | { kind: "status"; text: string }
  | { kind: "screen" }
  | { kind: "routine"; text: string };

const SCRIPT: Beat[] = [
  { kind: "message", text: "New client email: checkout button stopped saving the cart." },
  { kind: "status", text: "Reproducing on an isolated branch" },
  { kind: "screen" },
  { kind: "message", text: "Fixed. Tests green, PR #482 open for review." },
  { kind: "routine", text: "Routine saved · runs every hour" },
];

const START_MS = 500;
const TYPE_MS = 900;
const HOLD_MS = 1400;

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-mute"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function ScreenBeat() {
  return (
    <div className="max-w-[240px]">
      <BrowserWindow label="fix-cart-bug" accent={ACCENT.mint}>
        <div className="space-y-2">
          <CardRow title="checkout.ts" sub="+12 -3 lines" accent={ACCENT.mint} icon="edit" active />
          <Pill text="3 tests passed" accent={ACCENT.mint} solid />
        </div>
      </BrowserWindow>
    </div>
  );
}

/* BrowserWindow itself locks its body to aspect-[16/10], which fits a
   fixed screenshot but clips a chat thread that grows as beats arrive.
   Same header chrome, free-height body instead. */
function ChatShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-line"
      style={{
        background: `radial-gradient(120% 90% at 50% -10%, ${ACCENT.mint}0f, transparent 60%), var(--color-surface-1)`,
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mono mx-auto flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1 text-[11px] text-mute">
          <span aria-hidden>&#9679;</span>
          {label}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function BeatBubble({ beat }: { beat: Beat }) {
  if (beat.kind === "message") {
    return (
      <div className="mono max-w-[85%] rounded-xl border border-line bg-surface-2 px-3 py-2 text-[12px] leading-snug text-fg">
        {beat.text}
      </div>
    );
  }
  if (beat.kind === "status") {
    return (
      <div className="mono flex items-center gap-1.5 text-[10px] text-mute">
        <span className="text-accent">▸</span> {beat.text}
      </div>
    );
  }
  if (beat.kind === "screen") return <ScreenBeat />;
  return <Pill text={beat.text} accent={ACCENT.mint} />;
}

export default function ChatDemo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [step, setStep] = useState(-1);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce || !inView) return;
    if (step >= SCRIPT.length - 1) return;
    const next = SCRIPT[step + 1];
    const willType = next.kind === "message";
    const wait = step === -1 ? START_MS : HOLD_MS;
    if (willType) {
      const dotsOn = window.setTimeout(() => setTyping(true), wait);
      const reveal = window.setTimeout(() => {
        setTyping(false);
        setStep((s) => s + 1);
      }, wait + TYPE_MS);
      return () => {
        window.clearTimeout(dotsOn);
        window.clearTimeout(reveal);
      };
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), wait);
    return () => window.clearTimeout(t);
  }, [step, inView, reduce]);

  const visible = reduce ? SCRIPT : SCRIPT.slice(0, Math.max(step + 1, 0));
  const showTyping = !reduce && typing;

  return (
    <div ref={ref} className="mx-auto w-full max-w-[360px]">
      <ChatShell label="Email Reactor">
        <div aria-live="polite" className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {visible.map((beat, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <BeatBubble beat={beat} />
              </motion.div>
            ))}
          </AnimatePresence>
          {showTyping && (
            <div className="rounded-xl border border-line bg-surface-2 px-3 py-2.5">
              <TypingDots />
            </div>
          )}
        </div>
      </ChatShell>
    </div>
  );
}
