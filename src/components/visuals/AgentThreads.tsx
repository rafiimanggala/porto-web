"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";

/* Named pattern: Tabs (vertical), APG contract -- tablist/tab/tabpanel,
   roving tabindex, automatic activation on Up/Down Arrow (wraps), Home/End
   jump to first/last. Click or arrow-move switches which agent's thread is
   shown; each panel replays its own scripted beats (message -> status ->
   message -> result), same ambient auto-play + typing-dots language as
   ChatDemo, reveal effect is slide-in-blurred-bottom (Animista). This is the
   sidebar-thread-list + active-panel shape x.ai/bot uses for its Talent
   Scout demo, sized as the homepage's single hero proof-screenshot instead
   of a static dashboard. */

type Beat =
  | { kind: "message"; text: string }
  | { kind: "status"; text: string }
  | { kind: "result"; text: string };

type Thread = {
  id: string;
  label: string;
  preview: string;
  time: string;
  script: Beat[];
};

const THREADS: Thread[] = [
  {
    id: "email-reactor",
    label: "Email Reactor",
    preview: "PR #482 open for review.",
    time: "4:15",
    script: [
      { kind: "message", text: "New client email: checkout button stopped saving the cart." },
      { kind: "status", text: "Reproducing on an isolated branch" },
      { kind: "message", text: "Fixed. Tests green, PR #482 open for review." },
      { kind: "result", text: "Routine saved · runs every hour" },
    ],
  },
  {
    id: "trading",
    label: "Trading Bots",
    preview: "Position sized and logged.",
    time: "3:16",
    script: [
      { kind: "message", text: "12 bots flagged a BTC entry. Running it through the consensus gate before sizing." },
      { kind: "status", text: "claude → BUY · groq → BUY" },
      { kind: "message", text: "Both models agree. Position sized and logged to paper P&L." },
      { kind: "result", text: "+2.4% paper P&L this session" },
    ],
  },
  {
    id: "amadeus",
    label: "Amadeus",
    preview: "Drafted a note in your voice.",
    time: "1:15",
    script: [
      { kind: "message", text: "Heartbeat cycle: reviewing today's git commits and the self-correction log." },
      { kind: "status", text: "Matched against 320 stored decision exemplars" },
      { kind: "message", text: "Drafted a note in your voice. Held for review, nothing sent automatically." },
      { kind: "result", text: "Next wake in 2h" },
    ],
  },
  {
    id: "mahoraga",
    label: "Mahoraga",
    preview: "Locked. Won't happen again.",
    time: "0:42",
    script: [
      { kind: "message", text: "Same correction came up twice this session." },
      { kind: "status", text: "Writing a permanent rule from the pattern" },
      { kind: "message", text: "Locked. This won't happen a third time." },
      { kind: "result", text: "59 self-learned rules, permanent" },
    ],
  },
  {
    id: "te-loop",
    label: "TE Loop",
    preview: "12/12 passed. Proof attached.",
    time: "0:08",
    script: [
      { kind: "message", text: "Feature branch ready. Running Fix → Deploy → Test → Proof." },
      { kind: "status", text: "Deployed to an isolated test port · Playwright running" },
      { kind: "message", text: "12/12 passed. Proof screenshot attached." },
      { kind: "result", text: "Marked done, not claimed" },
    ],
  },
];

const START_MS = 350;
const TYPE_MS = 800;
const HOLD_MS = 1000;

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

function BeatBubble({ beat }: { beat: Beat }) {
  if (beat.kind === "message") {
    return (
      <div className="mono max-w-[85%] rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] leading-snug text-fg">
        {beat.text}
      </div>
    );
  }
  if (beat.kind === "status") {
    return (
      <div className="mono flex items-center gap-1.5 text-[11px] text-mute">
        <span className="text-accent">▸</span> {beat.text}
      </div>
    );
  }
  return (
    <div className="mono inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-[11px] text-accent">
      {beat.text}
    </div>
  );
}

// Keyed by thread id at the call site, so switching threads remounts this
// (fresh step state) instead of resetting it via an effect.
function ThreadPanel({ thread, inView }: { thread: Thread; inView: boolean }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(() => (reduce ? thread.script.length - 1 : -1));
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce || !inView) return;
    if (step >= thread.script.length - 1) return;
    const next = thread.script[step + 1];
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
  }, [step, inView, reduce, thread]);

  const visible = reduce ? thread.script : thread.script.slice(0, Math.max(step + 1, 0));

  return (
    <div
      role="tabpanel"
      id={`panel-${thread.id}`}
      aria-labelledby={`tab-${thread.id}`}
      tabIndex={0}
      className="flex h-full flex-col gap-3 overflow-y-auto p-4 sm:p-5"
    >
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
      {!reduce && typing && (
        <div className="w-fit rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
          <TypingDots />
        </div>
      )}
    </div>
  );
}

export default function AgentThreads() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-15% 0px" });
  const [activeId, setActiveId] = useState(THREADS[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeIndex = THREADS.findIndex((t) => t.id === activeId);

  const focusAndActivate = (index: number) => {
    const t = THREADS[(index + THREADS.length) % THREADS.length];
    setActiveId(t.id);
    tabRefs.current[t.id]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusAndActivate(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusAndActivate(activeIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAndActivate(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAndActivate(THREADS.length - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full overflow-hidden rounded-2xl border border-line"
      style={{
        background:
          "radial-gradient(120% 90% at 50% -10%, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 60%), var(--color-surface-1)",
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="mono ml-1 text-xs text-mute">agent-threads</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="mono text-[10px] text-mute">live</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:h-[340px]">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Agent threads"
          onKeyDown={onKeyDown}
          className="flex shrink-0 flex-row overflow-x-auto border-b border-line sm:w-[220px] sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:border-b-0 sm:border-r"
        >
          {THREADS.map((t) => {
            const selected = t.id === activeId;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(t.id)}
                className={`cursor-pointer border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 sm:border-b sm:last:border-b-0 ${
                  selected ? "bg-surface-2" : "hover:bg-surface-2/60"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`mono text-[12.5px] ${selected ? "text-fg" : "text-dim"}`}>
                    {t.label}
                  </span>
                  <span className="mono shrink-0 text-[10px] text-mute">{t.time}</span>
                </div>
                <p className="mono mt-0.5 truncate text-[11px] text-mute">{t.preview}</p>
              </button>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          <ThreadPanel key={activeId} thread={THREADS[activeIndex]} inView={inView} />
        </div>
      </div>
    </div>
  );
}
