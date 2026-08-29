"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Section from "./ui/Section";
import { skills } from "@/data/skills";

/* Named pattern: Tabs (horizontal), APG contract -- tablist/tab/tabpanel,
   roving tabindex, automatic activation on Left/Right Arrow (wraps),
   Home/End jump to first/last. This is x.ai/bot's "Give each Bot a job"
   role-selector: a row of pill tabs drives a copy panel plus a phone-mock
   that replays a scripted beat sequence per role. Beat vocabulary and
   timing constants are the same ones AgentThreads already established
   (status/message/result, START_MS/TYPE_MS/HOLD_MS), so the two demos read
   as one motion language rather than two invented ones. This section IS the
   site's "Directory" -- there is no separate card-grid alongside it, same
   as the reference clone. */

type Beat =
  | { kind: "status"; text: string }
  | { kind: "message"; text: string }
  | { kind: "reply"; text: string }
  | { kind: "actions"; primaryText: string; href: string; secondaryText: string };

const SHORT_LABEL: Record<string, string> = {
  "full-stack-product-build": "Full-Stack",
  "ai-features-in-product": "AI Features",
  "automation-that-runs-itself": "Automation",
  "ai-video-at-scale": "AI Video",
  "live-system-rescue": "Live Fixes",
  "shopify-storefronts": "Shopify",
};

// The phone-mock's script is its own narrative beat, not a repeat of the
// static copy panel next to it (which already shows skill.value). Text
// ported from the reference clone's ROLES object, grounded in the same
// skill.evidence facts.
const SCRIPT: Record<string, Beat[]> = {
  "full-stack-product-build": [
    { kind: "message", text: "18 features shipped into the production system, tested end to end first." },
    { kind: "actions", primaryText: "View case study", href: "", secondaryText: "See the stack" },
    { kind: "reply", text: "Good, keep the fix, deploy, self-verify loop running on every change." },
  ],
  "ai-features-in-product": [
    { kind: "message", text: "Blood work, DNA, DEXA and wearables reconciled into one transparent score." },
    { kind: "actions", primaryText: "View case study", href: "", secondaryText: "See the stack" },
    { kind: "reply", text: "Make sure every report shows its reasoning, not just the number." },
  ],
  "automation-that-runs-itself": [
    { kind: "message", text: "Sources merged, script rewritten, voiceover rendered, publish queued: all unattended." },
    { kind: "actions", primaryText: "View case study", href: "", secondaryText: "See the stack" },
  ],
  "ai-video-at-scale": [
    { kind: "message", text: "This run: 600+ AI-generated assets produced and published across 14 accounts." },
    { kind: "actions", primaryText: "View the video lane", href: "", secondaryText: "See the stack" },
  ],
  "live-system-rescue": [
    { kind: "message", text: "Backlog traced to a silent SMTP rate limit, fixed behind a tagged rollback." },
    { kind: "reply", text: "Good catch. Confirm it stays fixed after tomorrow's deploy." },
    { kind: "message", text: "Confirmed clean, verified through a real browser before it counted as done." },
  ],
  "shopify-storefronts": [
    { kind: "message", text: "Built into the theme directly, pure Liquid and vanilla JS, no build pipeline." },
    { kind: "actions", primaryText: "View case study", href: "", secondaryText: "See the stack" },
  ],
};

const ROLES = Object.keys(SHORT_LABEL)
  .map((slug) => skills.find((s) => s.slug === slug)!)
  .map((s) => ({
    slug: s.slug,
    n: s.n,
    title: s.title,
    shortLabel: SHORT_LABEL[s.slug] ?? s.title,
    value: s.value,
    script: [
      { kind: "status", text: s.evidence } as Beat,
      ...SCRIPT[s.slug].map((beat) =>
        beat.kind === "actions" ? { ...beat, href: s.proof[0].href } : beat
      ),
    ],
  }));

const START_MS = 350;
const TYPE_MS = 700;
const HOLD_MS = 900;

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

function BeatRow({ beat }: { beat: Beat }) {
  if (beat.kind === "status") {
    return (
      <div className="mono flex w-fit items-center gap-2 rounded-xl border border-line bg-[rgba(255,255,255,0.03)] px-3.5 py-2.5 text-[11px] text-mute">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        {beat.text}
      </div>
    );
  }
  if (beat.kind === "message") {
    return (
      <div className="max-w-[92%] rounded-2xl bg-[rgba(255,255,255,0.06)] px-3.5 py-2.5 text-[13px] leading-snug text-fg">
        {beat.text}
      </div>
    );
  }
  if (beat.kind === "reply") {
    return (
      <div className="ml-auto max-w-[92%] rounded-2xl bg-[#ecece8] px-3.5 py-2.5 text-[13px] leading-snug text-[#141414]">
        {beat.text}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={beat.href}
        className="mono inline-flex w-fit items-center gap-1.5 rounded-full border border-line-strong bg-bg px-3 py-1.5 text-[11px] text-accent transition-colors hover:border-accent"
      >
        {beat.primaryText}
        <span aria-hidden>&rarr;</span>
      </Link>
      <span className="mono inline-flex w-fit items-center rounded-full border border-line px-3 py-1.5 text-[11px] text-mute">
        {beat.secondaryText}
      </span>
    </div>
  );
}

function PhoneScreen({ role, active }: { role: (typeof ROLES)[number]; active: boolean }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(() => (reduce ? role.script.length - 1 : -1));
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce || !active) return;
    if (step >= role.script.length - 1) return;
    const next = role.script[step + 1];
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
  }, [step, active, reduce, role]);

  const visible = reduce ? role.script : role.script.slice(0, Math.max(step + 1, 0));

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <AnimatePresence initial={false}>
        {visible.map((beat, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
          >
            <BeatRow beat={beat} />
          </motion.div>
        ))}
      </AnimatePresence>
      {!reduce && typing && (
        <div className="w-fit rounded-2xl bg-[rgba(255,255,255,0.06)] px-3.5 py-2.5">
          <TypingDots />
        </div>
      )}
    </div>
  );
}

export default function RoleSelector({ index }: { index: string }) {
  const [activeSlug, setActiveSlug] = useState(ROLES[0].slug);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-15% 0px" });

  const activeIndex = ROLES.findIndex((r) => r.slug === activeSlug);
  const active = ROLES[activeIndex];

  const focusAndActivate = (i: number) => {
    const r = ROLES[(i + ROLES.length) % ROLES.length];
    setActiveSlug(r.slug);
    tabRefs.current[r.slug]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAndActivate(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAndActivate(activeIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAndActivate(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAndActivate(ROLES.length - 1);
    }
  };

  return (
    <Section
      id="directory"
      index={index}
      label="Directory"
      title="Seven things I get hired for"
    >
      <div ref={containerRef} className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <div
            role="tablist"
            aria-label="What I get hired for"
            onKeyDown={onKeyDown}
            className="flex flex-wrap gap-2"
          >
            {ROLES.map((r) => {
              const selected = r.slug === activeSlug;
              return (
                <button
                  key={r.slug}
                  ref={(el) => {
                    tabRefs.current[r.slug] = el;
                  }}
                  role="tab"
                  id={`role-tab-${r.slug}`}
                  aria-selected={selected}
                  aria-controls={`role-panel-${r.slug}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveSlug(r.slug)}
                  className={`mono cursor-pointer rounded-full border px-4 py-2 text-[12.5px] transition-colors ${
                    selected
                      ? "border-accent bg-surface-2 text-fg"
                      : "border-line text-dim hover:border-line-strong hover:text-fg"
                  }`}
                >
                  {r.shortLabel}
                </button>
              );
            })}
          </div>

          <div
            id={`role-panel-${active.slug}`}
            role="tabpanel"
            aria-labelledby={`role-tab-${active.slug}`}
            tabIndex={0}
            className="mt-6"
          >
            <h3 className="t-h3 text-fg">{active.title}</h3>
            <p className="t-body mt-3 max-w-[52ch] text-dim">{active.value}</p>
          </div>
        </div>

        <div className="card mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] p-0">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="mono nums rounded-sm border border-line px-1.5 py-0.5 text-[10px] text-mute">
              {String(active.n).padStart(2, "0")}
            </span>
            <span className="mono text-[11px] text-fg">{active.shortLabel}</span>
            <span className="relative ml-auto flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
          </div>
          <div className="h-[280px]">
            <PhoneScreen key={active.slug} role={active} active={inView} />
          </div>
        </div>
      </div>
    </Section>
  );
}
