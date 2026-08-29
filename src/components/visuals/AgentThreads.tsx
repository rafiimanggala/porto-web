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
  | { kind: "reply"; text: string }
  | { kind: "status"; text: string }
  | { kind: "tool"; label: string; status: string; desc: string; checklist: string[] };

type Thread = {
  id: string;
  label: string;
  preview: string;
  time: string;
  color: string;
  script: Beat[];
};

// One thread per skill, matching the reference clone's exact seven, each
// script grounded in that skill's real evidence from data/skills.ts. Sidebar
// avatar colors are the clone's own c1-c6 gradients, reused thread-for-thread
// (Design + Prototype shares c2 with AI Features there too).
const THREADS: Thread[] = [
  {
    id: "full-stack",
    label: "Full-Stack Apps",
    preview: "All 18 shipped, production stayed green.",
    time: "11:04",
    color: "linear-gradient(135deg,#6ea8fe,#3b5bdb)",
    script: [
      { kind: "message", text: "New spec is in: an existing production app needs 18 features added without breaking the system underneath." },
      { kind: "reply", text: "Go through it end to end, and don't take the live system down while you're at it." },
      { kind: "message", text: "Understood, working through the .NET 9 backend and Angular frontend now." },
      {
        kind: "tool",
        label: "Computer",
        status: "Done",
        desc: "Shipped features against the live database, tested each one before merging.",
        checklist: ["995 schools on the system", "12,495 users unaffected", "18 features delivered"],
      },
      { kind: "message", text: "All 18 shipped, production stayed green the whole way through." },
      { kind: "status", text: "Marked routine: fix, deploy, self-verify" },
    ],
  },
  {
    id: "ai-features",
    label: "AI Features",
    preview: "Live, reasoning across all four sources.",
    time: "9:41",
    color: "linear-gradient(135deg,#ffb37a,var(--color-accent))",
    script: [
      { kind: "message", text: "Client wants an AI layer that actually reasons across their data, not a chatbot bolted onto the corner." },
      { kind: "reply", text: "Pull blood work, DNA, DEXA scans and wearables into one score. Make the reasoning visible, not a black box." },
      {
        kind: "tool",
        label: "Computer",
        status: "Done",
        desc: "Built the multi-source scoring engine and wired the AI layer to explain each score.",
        checklist: ["4 data sources reconciled", "Per-report transparency added"],
      },
      { kind: "message", text: "Live, the AI layer reasons across all four sources and surfaces compounding risk early." },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    preview: "One failure never blocks the schedule.",
    time: "Yesterday",
    color: "linear-gradient(135deg,#c6a6ff,#7c5cff)",
    script: [
      { kind: "message", text: "Can we get the content pipeline off manual scheduling entirely?" },
      { kind: "status", text: "Mapping the 30+ node workflow" },
      { kind: "message", text: "Self-hosted n8n graph is live: sources in, script and voiceover and render in the middle, publishing out the other end." },
      { kind: "reply", text: "Good. What happens if a scrape fails?" },
      { kind: "message", text: "Publishing keeps running, the scrape workflow is decoupled, so one failure never blocks the schedule." },
    ],
  },
  {
    id: "ai-video",
    label: "AI Video",
    preview: "600+ assets produced, nothing stuck.",
    time: "Yesterday",
    color: "linear-gradient(135deg,#6fe0c9,#1f9c86)",
    script: [
      { kind: "message", text: "Batch is ready: 14 client accounts, all queued for this week." },
      { kind: "reply", text: "Looks good so far, just confirm scheduling holds across all 14." },
      { kind: "message", text: "Confirmed. 600+ assets produced and published this run, nothing stuck in the queue." },
    ],
  },
  {
    id: "live-system-fix",
    label: "Live-System Fix",
    preview: "Root cause traced, backlog clearing.",
    time: "Tuesday",
    color: "linear-gradient(135deg,#f2c14e,#c9922a)",
    script: [
      { kind: "message", text: "Emails aren't sending, something's stuck." },
      {
        kind: "tool",
        label: "Computer",
        status: "Done",
        desc: "Traced the backlog to a silent SMTP rate limit at the provider, not the app.",
        checklist: ["9,800 stuck emails identified", "Root cause confirmed at provider level"],
      },
      { kind: "message", text: "Root cause traced and fixed behind a tagged rollback. Backlog is clearing now." },
    ],
  },
  {
    id: "shopify",
    label: "Shopify Builds",
    preview: "Inline pattern editor, no build pipeline.",
    time: "Monday",
    color: "linear-gradient(135deg,#ff8fa3,#e0507a)",
    script: [
      { kind: "message", text: "The stock theme can't do what they're asking for, no app sells this feature." },
      { kind: "reply", text: "Build it into the theme directly, keep it simple." },
      { kind: "message", text: "Done, inline pattern editor wired to an external API, pure Liquid and vanilla JS, no build pipeline." },
    ],
  },
  {
    id: "design-prototype",
    label: "Design + Prototype",
    preview: "Five screens shipped plus a live prototype.",
    time: "Monday",
    color: "linear-gradient(135deg,#ffb37a,var(--color-accent))",
    script: [
      { kind: "message", text: "Idea's ready to test but there's nothing to click yet." },
      { kind: "reply", text: "Turn it into something people can actually try." },
      { kind: "status", text: "Marked routine: reference-first design pass" },
      { kind: "message", text: "Five responsive screens shipped plus a live clickable prototype, closes the pipeline for the week." },
    ],
  },
];

const START_MS = 350;
const TYPE_MS = 800;
const HOLD_MS = 1000;

// Same terminal-prompt badge language as OrbGlyph.tsx / Mascot.tsx, with a
// loading state: the `>` glyph cross-fades to a spinner while a beat is
// "typing", then back once it lands. Sidebar rows tint the badge via
// `background` (per-thread identity); the panel header and the sidebar-user
// row stay neutral so the loading spinner keeps full contrast.
function ThreadAvatar({
  loading,
  size = 26,
  background,
}: {
  loading?: boolean;
  size?: number;
  background?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border border-line-strong ${
        background ? "" : "bg-surface-3"
      }`}
      style={{ width: size, height: size, ...(background ? { background } : {}) }}
    >
      <AnimatePresence initial={false} mode="wait">
        {loading ? (
          <motion.span
            key="spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-accent"
          />
        ) : (
          <motion.span
            key="glyph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mono font-semibold text-accent"
            style={{ fontSize: size * 0.36, lineHeight: 1 }}
          >
            &gt;
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

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
      <div className="mono max-w-[85%] rounded-2xl bg-[rgba(255,255,255,0.06)] px-3.5 py-2.5 text-[13px] leading-snug text-fg">
        {beat.text}
      </div>
    );
  }
  if (beat.kind === "reply") {
    return (
      <div className="mono ml-auto max-w-[85%] rounded-2xl bg-[#ecece8] px-3.5 py-2.5 text-[13px] leading-snug text-[#141414]">
        {beat.text}
      </div>
    );
  }
  if (beat.kind === "status") {
    return (
      <div className="mono flex w-fit items-center gap-2 rounded-xl border border-line bg-[rgba(255,255,255,0.03)] px-3.5 py-2.5 text-[11px] text-mute">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        {beat.text}
      </div>
    );
  }
  return (
    <div className="max-w-[90%] overflow-hidden rounded-xl border border-line bg-surface-2">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px] font-semibold text-fg">
        <span className="mono">{beat.label}</span>
        <span className="mono inline-flex items-center gap-1.5 text-[11px] font-medium text-[#28c840]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          {beat.status}
        </span>
      </div>
      <p className="px-3.5 pb-3 text-[12px] leading-relaxed text-dim">{beat.desc}</p>
      <div className="flex flex-col gap-1.5 border-t border-line px-3.5 py-3">
        {beat.checklist.map((c) => (
          <div key={c} className="mono flex items-center gap-1.5 text-[10.5px] text-dim">
            <span className="font-bold text-accent">&#10003;</span>
            {c}
          </div>
        ))}
      </div>
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="mono flex shrink-0 items-center gap-2.5 border-b border-line px-4 py-3 text-[12.5px] text-fg sm:px-5">
        <ThreadAvatar loading={typing} />
        {thread.label}
      </div>
      <div
        role="tabpanel"
        id={`panel-${thread.id}`}
        aria-labelledby={`tab-${thread.id}`}
        tabIndex={0}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5"
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
          <div className="w-fit rounded-2xl bg-[rgba(255,255,255,0.06)] px-3.5 py-2.5">
            <TypingDots />
          </div>
        )}
      </div>
      <div className="mono flex shrink-0 items-center gap-2 border-t border-line px-4 py-2.5 sm:px-5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-sm text-mute">
          +
        </span>
        <span className="flex-1 truncate rounded-full bg-surface-3 px-3 py-1.5 text-[12px] text-mute">
          Message {thread.label}
        </span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-mute">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
          </svg>
        </span>
      </div>
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
      className="card mx-auto w-full overflow-hidden p-0"
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
        <div className="flex shrink-0 flex-col sm:w-[220px] sm:border-r sm:border-line">
          <div className="mono hidden shrink-0 items-center gap-2 border-b border-line px-3.5 py-2.5 text-[11px] text-mute sm:flex">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Search
          </div>
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Agent threads"
            onKeyDown={onKeyDown}
            className="flex flex-row overflow-x-auto border-b border-line sm:flex-1 sm:min-h-0 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:border-b-0"
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
                <div className="flex items-center gap-2.5">
                  <ThreadAvatar size={22} background={t.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`mono text-[12.5px] ${selected ? "text-fg" : "text-dim"}`}>
                        {t.label}
                      </span>
                      <span className="mono shrink-0 text-[10px] text-mute">{t.time}</span>
                    </div>
                    <p className="mono mt-0.5 truncate text-[11px] text-mute">{t.preview}</p>
                  </div>
                </div>
              </button>
            );
            })}
          </div>
          <div className="mono hidden shrink-0 items-center gap-2 border-t border-line px-3.5 py-2.5 sm:flex">
            <ThreadAvatar size={22} />
            <span className="text-xs font-medium text-dim">Rafii</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <ThreadPanel key={activeId} thread={THREADS[activeIndex]} inView={inView} />
        </div>
      </div>
    </div>
  );
}
