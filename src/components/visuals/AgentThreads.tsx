"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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
  | { kind: "ts"; text: string }
  | { kind: "message"; text: string }
  | { kind: "reply"; text: string; reaction?: string }
  | { kind: "status"; text: string }
  | { kind: "routine"; text: string }
  | { kind: "email"; from: string; drafted?: boolean }
  // An external party's own words, visually distinct from the bot's own
  // "message" narration so an inbound client email doesn't read as
  // something the bot said.
  | { kind: "incoming"; from: string; text: string }
  | { kind: "tool"; label: string; status: string; desc: string; image: boolean; checklist: string[] }
  // Same real evidence as the "Parallel agent teams" capability card
  // (inventories, audits, and full-stack builds run on 3-5 concurrent
  // agents): a multi-agent breakdown inside one bubble, bold label + arrow
  // per line, closing on the plain sentence the single-agent version used.
  | { kind: "recap"; lines: { label: string; detail: string }[]; text: string };

type Thread = {
  id: string;
  label: string;
  preview: string;
  time: string;
  avatar?: string;
  icon?: boolean;
  script: Beat[];
};

// Threads read as a live multi-agent monitor, grouped by what's being
// watched: Web is the two client platforms Rafii runs point-of-contact
// fixes on, Automation is the scheduled/background agents, Agent is the
// one-off engagements. Content stays grounded in the same real evidence as
// data/skills.ts. Sidebar avatar images are the clone's own c1-c6 mascot
// illustrations, reused thread-for-thread (Design + Prototype shares c2
// with Health Tech there too).
type Group = { id: string; label: string; threads: Thread[] };

const GROUPS: Group[] = [
  {
    id: "web",
    label: "Web",
    threads: [
      {
        id: "health-tech",
        label: "Health Tech",
        preview: "Live, reasoning across all four sources.",
        time: "9:41",
        avatar: "/mascots/mascot-c2.png",
        script: [
          { kind: "ts", text: "9:41" },
          { kind: "message", text: "Client wants an AI layer that actually reasons across their data, not a chatbot bolted onto the corner." },
          { kind: "reply", text: "Pull blood work, DNA, DEXA scans and wearables into one score. Make the reasoning visible, not a black box." },
          {
            kind: "tool",
            label: "Computer",
            status: "Done",
            desc: "Built the multi-source scoring engine and wired the AI layer to explain each score.",
            image: false,
            checklist: ["4 data sources reconciled", "Per-report transparency added"],
          },
          { kind: "message", text: "Live, the AI layer reasons across all four sources and surfaces compounding risk early." },
        ],
      },
      {
        id: "ed-tech",
        label: "Ed Tech",
        preview: "995 schools, 12,495 users, live.",
        time: "11:04",
        avatar: "/mascots/mascot-c1.png",
        script: [
          { kind: "ts", text: "11:04" },
          { kind: "message", text: "New spec is in: an existing production app needs 18 features added without breaking the system underneath." },
          { kind: "reply", text: "Go through it end to end, and don't take the live system down while you're at it." },
          { kind: "message", text: "Understood, working through the .NET 9 backend and Angular frontend now." },
          {
            kind: "tool",
            label: "Computer",
            status: "Done",
            desc: "Shipped features against the live database, tested each one before merging.",
            image: true,
            checklist: ["995 schools on the system", "12,495 users unaffected", "18 features delivered"],
          },
          {
            kind: "recap",
            lines: [
              { label: "Inventory", detail: "mapped all 18 features against the live schema first" },
              { label: "Audit", detail: "each change checked for breaking risk before merge" },
              { label: "Build", detail: "4 agents shipped in parallel, one per feature cluster" },
            ],
            text: "All 18 shipped, production stayed green the whole way through.",
          },
          { kind: "status", text: "Marked routine: fix, deploy, self-verify" },
          { kind: "message", text: "Every deploy from here runs the same loop before it counts as done." },
        ],
      },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    threads: [
      {
        id: "content-pipeline",
        label: "Content Pipeline",
        preview: "One failure never blocks the schedule.",
        time: "Yesterday",
        avatar: "/mascots/mascot-c3.png",
        script: [
          { kind: "ts", text: "Yesterday, 4:52" },
          { kind: "message", text: "Can we get the content pipeline off manual scheduling entirely?" },
          { kind: "routine", text: "Content Pipeline" },
          { kind: "status", text: "Mapping the 30+ node workflow" },
          { kind: "message", text: "Self-hosted n8n graph is live: sources in, script and voiceover and render in the middle, publishing out the other end." },
          { kind: "ts", text: "Yesterday, 5:20" },
          { kind: "reply", text: "Good, what happens if a scrape fails?" },
          { kind: "message", text: "Publishing keeps running, the scrape workflow is decoupled, so one failure never blocks the schedule." },
          { kind: "reply", text: "Perfect, ship it.", reaction: "👍" },
        ],
      },
      // Real build, not a skill case study: launchd cron reads new client
      // email hourly and reacts. Grounded in the "Email Reactor" entry in
      // data/portfolio.ts (cmd: "launchd · hourly").
      {
        id: "email-reactor",
        label: "Email Reactor",
        preview: "Fix branched, reply drafted, recap ready.",
        time: "Hourly",
        icon: true,
        script: [
          { kind: "ts", text: "6:03" },
          { kind: "email", from: "Client Inbox" },
          { kind: "incoming", from: "Client Inbox", text: "Checkout button throws a 500 on mobile Safari since this morning's deploy." },
          { kind: "status", text: "Warmed up the right repo" },
          {
            kind: "tool",
            label: "Computer",
            status: "Done",
            desc: "Reproduced on a branch, traced it to a null cart-total on an empty promo code, patched and tested.",
            image: false,
            checklist: ["Repro confirmed on branch", "Fix tested against the live cart flow"],
          },
          { kind: "email", from: "Client Inbox", drafted: true },
          { kind: "message", text: "Reply drafted with the fix summary, held for your review. Nothing goes out without you seeing it first." },
          { kind: "ts", text: "6:47" },
          { kind: "reply", text: "What's the recap for today?" },
          {
            kind: "recap",
            lines: [
              { label: "Trigger", detail: "email landed from Client Inbox at 6:03" },
              { label: "Fix", detail: "reproduced, patched and tested on a branch" },
              { label: "Reply", detail: "drafted and held for review inside the hour" },
            ],
            text: "One email in, one fix and drafted reply out, you approve before anything ships.",
          },
        ],
      },
    ],
  },
  {
    id: "agent",
    label: "Agent",
    threads: [
      {
        id: "ai-video",
        label: "AI Video",
        preview: "600+ assets produced, nothing stuck.",
        time: "Yesterday",
        avatar: "/mascots/mascot-c4.png",
        script: [
          { kind: "ts", text: "Yesterday, 6:18" },
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
        avatar: "/mascots/mascot-c5.png",
        script: [
          { kind: "ts", text: "Tuesday, 2:30" },
          { kind: "message", text: "Emails aren't sending, something's stuck." },
          {
            kind: "tool",
            label: "Computer",
            status: "Done",
            desc: "Traced the backlog to a silent SMTP rate limit at the provider, not the app.",
            image: false,
            checklist: ["9,800 stuck emails identified", "Root cause confirmed at provider level"],
          },
          { kind: "message", text: "Root cause traced and fixed behind a tagged rollback. Backlog's clearing now." },
        ],
      },
      {
        id: "shopify",
        label: "Shopify Builds",
        preview: "Inline pattern editor, no build pipeline.",
        time: "Monday",
        avatar: "/mascots/mascot-c6.png",
        script: [
          { kind: "ts", text: "Monday, 10:05" },
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
        avatar: "/mascots/mascot-c2.png",
        script: [
          { kind: "ts", text: "Monday, 8:35" },
          { kind: "message", text: "Idea's ready to test but there's nothing to click yet." },
          { kind: "reply", text: "Turn it into something people can actually try." },
          { kind: "status", text: "Marked routine: reference-first design pass" },
          { kind: "message", text: "Five responsive screens shipped plus a live clickable prototype, closes the pipeline for the week." },
        ],
      },
    ],
  },
];

const THREADS: Thread[] = GROUPS.flatMap((g) => g.threads);

const START_MS = 350;
const TYPE_MS = 800;
const HOLD_MS = 900;

// Per-thread mascot illustration is the avatar itself: no circle mask, no
// crop, no disc behind it, matching the reference clone (its own silhouette
// IS the badge). A loading state overlays a small spinner disc on top while
// a beat is "typing", then fades out once it lands. The pinned sidebar-user
// row has no thread identity, so it keeps the neutral terminal-prompt glyph.
function MailIcon({ size }: { size: number }) {
  return (
    <svg
      width={size * 0.5}
      height={size * 0.5}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function ThreadAvatar({
  loading,
  size = 26,
  avatar,
  icon,
}: {
  loading?: boolean;
  size?: number;
  avatar?: string;
  icon?: ReactNode;
}) {
  if (avatar) {
    return (
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        <span
          aria-hidden
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${avatar})` }}
        />
        <AnimatePresence initial={false}>
          {loading && (
            <motion.span
              key="spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-surface-1"
            >
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
  }

  if (icon) {
    return (
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, background: "linear-gradient(135deg,#6ea8fe,var(--color-accent))" }}
      >
        <AnimatePresence initial={false} mode="wait">
          {loading ? (
            <motion.span
              key="spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <motion.span
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              {icon}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-3"
      style={{ width: size, height: size }}
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

// Small persistent mark on every bot-authored bubble (message, recap, tool
// card) tying every thread back to the same "Email Reactor" identity: all of
// this, across every skill, runs through the same inbox-triggered agent.
function BotEnvelope() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
      style={{ background: "linear-gradient(135deg,#6ea8fe,var(--color-accent))" }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    </span>
  );
}

function BeatBubble({ beat }: { beat: Beat }) {
  if (beat.kind === "ts" || beat.kind === "status") {
    return <div className="mono text-center text-[11px] text-mute">{beat.text}</div>;
  }
  if (beat.kind === "routine") {
    return (
      <div className="mono flex items-center justify-center gap-1.5 text-center text-[11px] text-mute">
        <span>Created routine</span>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        <span className="font-semibold text-fg">{beat.text}</span>
      </div>
    );
  }
  if (beat.kind === "email") {
    return (
      <div className="mono flex items-center justify-center gap-1.5 text-center text-[11px] text-mute">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </span>
        <span>{beat.drafted ? "Drafted a reply to" : "New email from"}</span>
        <span className="font-semibold text-fg">{beat.from}</span>
      </div>
    );
  }
  if (beat.kind === "incoming") {
    return (
      <div className="flex max-w-[78%] flex-col items-start gap-1">
        <span className="mono px-0.5 text-[10.5px] text-mute">{beat.from}</span>
        <div
          className="mono rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-snug text-fg"
          style={{ background: "rgba(110,168,254,.12)" }}
        >
          {beat.text}
        </div>
      </div>
    );
  }
  if (beat.kind === "message") {
    return (
      <div className="flex w-fit max-w-[85%] items-start gap-1.5">
        <BotEnvelope />
        <div className="mono min-w-0 rounded-2xl bg-[rgba(255,255,255,0.06)] px-3.5 py-2.5 text-[12.5px] leading-snug text-fg">
          {beat.text}
        </div>
      </div>
    );
  }
  if (beat.kind === "recap") {
    return (
      <div className="flex w-fit max-w-[90%] items-start gap-1.5">
        <BotEnvelope />
        <div className="mono flex min-w-0 flex-col gap-2 rounded-2xl bg-[rgba(255,255,255,0.06)] px-3.5 py-3 text-[12.5px] leading-snug text-fg">
          <div className="flex flex-col gap-1.5">
            {beat.lines.map((l) => (
              <div key={l.label} className="flex items-baseline gap-1.5">
                <span className="font-semibold text-fg">{l.label}</span>
                <span className="shrink-0 text-accent">&rarr;</span>
                <span className="text-dim">{l.detail}</span>
              </div>
            ))}
          </div>
          <p className="text-fg">{beat.text}</p>
        </div>
      </div>
    );
  }
  if (beat.kind === "reply") {
    return (
      <div className="relative ml-auto w-fit max-w-[85%]">
        <div className="mono rounded-2xl bg-[#ecece8] px-3.5 py-2.5 text-[12.5px] leading-snug text-[#141414]">
          {beat.text}
        </div>
        {beat.reaction && (
          <span className="absolute -bottom-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface-3 text-[11px] leading-none">
            {beat.reaction}
          </span>
        )}
      </div>
    );
  }
  // tool: the decorative gradient block + glass checklist overlay only shows
  // when `image` is set, matching the reference clone (its two other tool
  // beats omit the block and end at the description).
  return (
    <div className="flex w-fit max-w-[85%] items-start gap-1.5">
      <BotEnvelope />
      <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-[#2b2e36]">
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px] font-semibold text-fg">
          <span className="mono">{beat.label}</span>
          <span className="mono inline-flex items-center gap-1.5 text-[11px] font-medium text-[#28c840]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
            {beat.status}
          </span>
        </div>
        <p className="px-3.5 pb-3 text-[12px] leading-relaxed text-dim">{beat.desc}</p>
        {beat.image && (
          <div
            className="relative mx-3.5 mb-3.5 h-[100px] overflow-hidden rounded-lg"
            style={{ background: "linear-gradient(135deg,#2a2f3a,#14161c 60%,#1f2430)" }}
          >
            <div className="absolute inset-x-2.5 bottom-2.5 flex flex-col gap-1.5 rounded-lg bg-black/75 px-2.5 py-2 backdrop-blur-sm">
              {beat.checklist.map((c) => (
                <div key={c} className="mono flex items-center gap-1.5 text-[10.5px] text-dim">
                  <span className="font-bold text-accent">&#10003;</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scripts have grown past the fixed panel height, so the latest beat
  // (recap especially) can land below the fold with nothing to hint it's
  // there. Keep the scroll pinned to whatever just landed.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [step, typing, reduce]);

  useEffect(() => {
    if (reduce || !inView) return;
    if (step >= thread.script.length - 1) return;
    const next = thread.script[step + 1];
    const willType = next.kind === "message" || next.kind === "recap";
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
        <ThreadAvatar loading={typing} avatar={thread.avatar} icon={thread.icon ? <MailIcon size={22} /> : undefined} size={22} />
        {thread.label}
        <svg
          className="ml-auto shrink-0 text-mute"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      </div>
      <div
        ref={scrollRef}
        role="tabpanel"
        id={`panel-${thread.id}`}
        aria-labelledby={`tab-${thread.id}`}
        tabIndex={0}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-2.5 pb-5 sm:px-5"
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
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-surface-3 text-sm text-mute">
          +
        </span>
        <span className="flex h-8 flex-1 items-center truncate rounded-full bg-surface-3 px-3.5 text-[12px] text-mute">
          Message {thread.label}
        </span>
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-surface-3 text-mute">
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
      className="mx-auto w-full overflow-hidden rounded-[24px] border border-line bg-[#1a1a1a] p-0"
      style={{ boxShadow: "0 40px 80px -30px rgba(0,0,0,.6)" }}
    >
      <div className="flex flex-col sm:h-[660px] sm:flex-row">
        <div className="flex shrink-0 flex-col bg-bg sm:w-[232px] sm:border-r sm:border-line">
          <div className="flex shrink-0 items-center justify-between px-3.5 pt-4 pb-3.5">
            <div className="flex gap-1.5">
              <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
            </div>
            <span className="text-lg leading-none text-mute">+</span>
          </div>
          <div className="mono mx-3.5 mb-2 hidden h-[30px] shrink-0 items-center rounded-md bg-surface-3 px-2.5 text-[12px] text-mute sm:flex">
            Search
          </div>
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Agent threads"
            onKeyDown={onKeyDown}
            className="flex flex-row max-sm:overflow-x-auto sm:flex-1 sm:min-h-0 sm:flex-col sm:overflow-y-auto"
          >
            {GROUPS.map((g, gi) => (
              <div key={g.id} className="contents sm:block">
                <div
                  aria-hidden="true"
                  className={`mono flex shrink-0 items-center gap-1.5 px-2.5 pb-1.5 text-[11px] font-medium text-dim ${
                    gi === 0 ? "pt-1" : "mt-1.5 border-t border-line pt-3"
                  }`}
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#28c840] opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#28c840]" />
                  </span>
                  {g.label}
                </div>
                {g.threads.map((t) => {
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
                      className={`min-w-0 shrink-0 cursor-pointer rounded-md px-2 py-2 text-left transition-colors sm:block sm:w-full ${
                        selected ? "bg-surface-3" : "hover:bg-surface-3"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ThreadAvatar size={30} avatar={t.avatar} icon={t.icon ? <MailIcon size={30} /> : undefined} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className={`mono truncate text-[12.5px] ${selected ? "text-fg" : "text-dim"}`}>
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
            ))}
          </div>
          <div className="mono mt-auto hidden shrink-0 items-center gap-2 border-t border-line px-2 pt-2.5 pb-0.5 sm:flex">
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
