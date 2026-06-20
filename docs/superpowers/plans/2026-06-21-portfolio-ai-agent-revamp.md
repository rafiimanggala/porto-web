# Portfolio AI/Agent Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive scripted "agent automation" demo, elevate the always-on Agent-OS story, ground the Hero metrics in verified numbers, layer tasteful scroll animation, and install the GEO foundation, in one cohesive porto-web revamp.

**Architecture:** New leaf `"use client"` components consuming existing Tailwind CSS-var tokens and the existing `Reveal` / `Section` / `ScrollProgress` primitives. Scroll motion uses framer-motion `useScroll`/`useTransform`/`useSpring` (no GSAP). Content stays data-driven in `src/data/`. GEO adds static files + JSON-LD + metadata.

**Tech Stack:** Next.js 16 (App Router), React 19, framer-motion (installed), Tailwind v4 (CSS-var `@theme`), Vercel.

## Global Constraints

- Animate ONLY `transform` + `opacity`. Never `top/left/width/height/margin/box-shadow`.
- All reveals `viewport={{ once: true }}`. Never re-fire.
- `prefers-reduced-motion`: degrade to STATIC end-state (opacity 1, no transform/parallax/scrub), via `useReducedMotion()`. Existing `globals.css` already kills CSS animation under reduced-motion.
- Scrub `MotionValue`s wrapped in `useSpring` (stiffness 100, damping 30).
- Pin length 200-400vh. Max 2-3 signature moments total (AutomationDemo scrub, sticky-stack Featured, Hero line-mask).
- Disable pin/scrub/parallax on touch via `window.matchMedia("(hover: hover) and (pointer: fine)")`.
- Canonical name everywhere: `Rafii Manggala Japamel`. Site URL: `https://rafiimanggala.vercel.app`.
- Tokens only: `text-fg/dim/mute/accent`, `bg-bg/surface-1/surface-2`, `border-line/line-strong`, `.card`, `.mono`, `.nums`, `.t-h2/.t-h3`, `.eyebrow`, accent `#5fe9ad`.
- No new runtime deps unless a task explicitly adds one (none do; Lenis deferred).
- Verified metrics (measured 2026-06-21): 94 daily logs, 15 always-on launchd agents, 59 locked self-learned rules, 39 git repos, 81 project folders, 6 autonomous AI systems.

---

### Task 1: GEO foundation (static files + metadata + JSON-LD)

**Files:**
- Create: `public/robots.txt`, `public/llms.txt`, `src/app/sitemap.ts`, `src/components/seo/PersonJsonLd.tsx`
- Modify: `src/app/layout.tsx` (add `metadataBase`, `alternates.canonical`, `openGraph.url`; mount `<PersonJsonLd />`)

**Interfaces:**
- Produces: `<PersonJsonLd />` default export (no props), rendered once in `<body>`.

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://rafiimanggala.vercel.app/sitemap.xml
```

- [ ] **Step 2: Create `public/llms.txt`** (answer-shaped, third-person, canonical name)

```
# Rafii Manggala Japamel

Rafii Manggala Japamel is a freelance AI engineer based in Indonesia (UTC+7) who builds autonomous systems with Claude Code: trading bots, digital twins, and self-running infrastructure that observes, decides, and acts in production. He runs Claude not as a chatbot but as an always-on personal agent OS with persistent memory, self-learning hooks, and safety rails, and ships work for clients in Australia and the United States.

## Selected systems
- Trading Command Center: 12 AI + algorithmic bots gated by Claude+Groq multi-model consensus.
- Amadeus: an always-on digital twin that reasons from his own decision history.
- TestEngine: self-hosted MCP server for isolated parallel browser testing.
- Email Reactor: hourly autonomous agent that fixes client bugs on a branch while he sleeps.

## Contact
- Site: https://rafiimanggala.vercel.app
- GitHub: https://github.com/rafiimanggala
- Email: rafiimanggala3@gmail.com
```

- [ ] **Step 3: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";

const base = "https://rafiimanggala.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/work/spotter-eld`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/work/streak`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
```

- [ ] **Step 4: Create `src/components/seo/PersonJsonLd.tsx`**

```tsx
import { profile } from "@/data/portfolio";

export default function PersonJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Rafii Manggala Japamel",
    alternateName: "Rafii Manggala",
    url: "https://rafiimanggala.vercel.app",
    jobTitle: "AI Engineer",
    description:
      "Freelance AI engineer in Indonesia who builds autonomous systems with Claude Code: trading bots, digital twins, and self-running infrastructure.",
    address: { "@type": "PostalAddress", addressCountry: "ID" },
    email: `mailto:${profile.email}`,
    sameAs: [profile.github, profile.linkedin],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
```

- [ ] **Step 5: Modify `src/app/layout.tsx`** — add `metadataBase`/canonical/og url to the `metadata` export and mount the JSON-LD.

In the `metadata` object add:

```ts
  metadataBase: new URL("https://rafiimanggala.vercel.app"),
  alternates: { canonical: "/" },
```

and inside `openGraph` add `url: "https://rafiimanggala.vercel.app", siteName: "Rafii Manggala Japamel",`.

Add the import `import PersonJsonLd from "@/components/seo/PersonJsonLd";` and render `<PersonJsonLd />` just before `<SiteChrome />` in `<body>`.

- [ ] **Step 6: Verify build + files serve**

Run: `cd ~/projects/porto-web && npm run build`
Expected: build succeeds, `sitemap.xml` route compiled, no type errors.
Run: `npx next start &` then `curl -s localhost:3000/robots.txt | head -1` and `curl -s localhost:3000/llms.txt | head -1` and `curl -s localhost:3000/sitemap.xml | head -3`
Expected: robots returns `User-agent: *`, llms returns `# Rafii Manggala Japamel`, sitemap returns XML. Kill the server after.

- [ ] **Step 7: Validate JSON-LD** — `curl -s localhost:3000 | grep -o '"@type":"Person"'`
Expected: matches once. Optionally paste rendered HTML into search.google.com/test/rich-results.

- [ ] **Step 8: Commit**

```bash
git add public/robots.txt public/llms.txt src/app/sitemap.ts src/components/seo/PersonJsonLd.tsx src/app/layout.tsx
git commit -m "feat(geo): add robots, llms.txt, sitemap, Person JSON-LD, canonical metadata"
```

---

### Task 2: Hero metrics grounded in verified numbers

**Files:**
- Modify: `src/data/portfolio.ts:21-28` (the `stats` array)

**Interfaces:**
- Consumes: `Stat` type (`{ label, value, note? }`), already defined.
- Produces: updated `stats` consumed by `Hero.tsx` (no signature change).

- [ ] **Step 1: Replace the `stats` array** with verified, defensible numbers

```ts
export const stats: Stat[] = [
  { label: "Always-on AI agents", value: "15", note: "launchd, 24/7" },
  { label: "Self-learned rules", value: "59", note: "auto-locked, permanent" },
  { label: "Daily build logs", value: "94", note: "shipped + logged" },
  { label: "Git repositories", value: "39", note: "81 project folders" },
  { label: "Autonomous systems", value: "6", note: "running in production" },
  { label: "Client countries", value: "2", note: "AU · US" },
];
```

- [ ] **Step 2: Verify render** — `npm run build` succeeds; visually the stat strip shows the six values via `CountUp` (note: `CountUp` parses leading digits, so "15"/"59"/"94"/"39"/"6"/"2" animate cleanly).

- [ ] **Step 3: Commit**

```bash
git add src/data/portfolio.ts
git commit -m "feat(hero): ground stat strip in verified agent metrics"
```

---

### Task 3: Hero headline line-mask reveal (signature polish)

**Files:**
- Create: `src/components/ui/LineMask.tsx`
- Modify: `src/components/Hero.tsx:38-44` (wrap the `<h1>` lines)

**Interfaces:**
- Produces: `LineMask` default export — `({ lines: { text: string; className?: string }[] })`. Each line clips up with stagger; static under reduced motion.

- [ ] **Step 1: Create `src/components/ui/LineMask.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

type Line = { text: string; className?: string };

export default function LineMask({ lines }: { lines: Line[] }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <>
        {lines.map((l, i) => (
          <span key={i} className={l.className}>
            {l.text}
          </span>
        ))}
      </>
    );
  }
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={`block ${l.className ?? ""}`}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {l.text}
          </motion.span>
        </span>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Use it in `Hero.tsx`** — replace the inner spans of the `<h1 className="t-hero">` (currently 3 `<span>`s) with:

```tsx
            <h1 className="t-hero">
              <LineMask
                lines={[
                  { text: "I build systems where", className: "text-grad" },
                  { text: "AI agents do the work,", className: "text-accent" },
                  { text: "not just write the code.", className: "text-grad" },
                ]}
              />
            </h1>
```

Add `import LineMask from "./ui/LineMask";` at top. Remove the now-unused `Reveal delay={0.05}` wrapper around the h1 only if it double-animates (keep the `Reveal` but it now wraps a self-animating h1; to avoid double-motion, drop the `Reveal` wrapper on the h1 and let LineMask own the entrance).

- [ ] **Step 3: Verify** — `npm run build` passes. Manually: headline lines rise in sequence on load; under DevTools reduced-motion emulation they appear static. No layout shift (lines reserve height via `overflow-hidden` block).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/LineMask.tsx src/components/Hero.tsx
git commit -m "feat(hero): line-mask headline reveal, reduced-motion safe"
```

---

### Task 4: AutomationDemo component (scripted Fix -> Deploy -> Test -> Proof)

**Files:**
- Create: `src/data/automation.ts` (scenario data), `src/components/AutomationDemo.tsx`

**Interfaces:**
- `automation.ts` produces: `export const automationStages: Stage[]` where `Stage = { id: "task"|"fix"|"deploy"|"test"|"proof"; label: string; lines: string[]; tone?: "add"|"del"|"ok"|"dim" }` plus `export const automationSummary: { duration: string; steps: string; result: string }`.
- `AutomationDemo` produces: default export `({ progress }: { progress?: MotionValue<number> })`. When `progress` is supplied it drives stage reveal from scroll; when omitted it self-plays via the Run button. `revealedCount` derives from `progress` (0..1 mapped to stage count) or internal state.

- [ ] **Step 1: Create `src/data/automation.ts`**

```ts
export type StageId = "task" | "fix" | "deploy" | "test" | "proof";
export type Line = { text: string; tone?: "add" | "del" | "ok" | "dim" | "cmd" };
export type Stage = { id: StageId; label: string; lines: Line[] };

export const automationStages: Stage[] = [
  {
    id: "task",
    label: "TASK",
    lines: [
      { text: "client.email -> reactor: \"vitals chart returns 403\"", tone: "dim" },
      { text: "agent: warming up repo · branch fix/vitals-403", tone: "cmd" },
    ],
  },
  {
    id: "fix",
    label: "FIX",
    lines: [
      { text: "- if (!token) return res.status(403)", tone: "del" },
      { text: "+ const token = await refreshIfExpired(session)", tone: "add" },
      { text: "+ if (!token) return res.status(401).json({ reason })", tone: "add" },
    ],
  },
  {
    id: "deploy",
    label: "DEPLOY",
    lines: [
      { text: "$ build --target render", tone: "cmd" },
      { text: "bundle 2.1mb · uploaded · live in 47s", tone: "ok" },
    ],
  },
  {
    id: "test",
    label: "TEST",
    lines: [
      { text: "$ playwright test vitals.spec.ts", tone: "cmd" },
      { text: "chart loads · 200 · series rendered", tone: "ok" },
      { text: "12/12 passed", tone: "ok" },
    ],
  },
  {
    id: "proof",
    label: "PROOF",
    lines: [
      { text: "screenshot captured -> vitals-pass.png", tone: "ok" },
    ],
  },
];

export const automationSummary = {
  duration: "3m 12s",
  steps: "5 stages · 0 human keystrokes",
  result: "fixed · verified · proof attached",
};
```

- [ ] **Step 2: Create `src/components/AutomationDemo.tsx`** (window chrome mirrors `CommandCenter`; stages reveal by `revealed` count; PROOF renders a faux-browser frame)

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { automationStages, automationSummary, type Line } from "@/data/automation";

const toneClass: Record<string, string> = {
  add: "text-accent",
  del: "text-[#ff6b6b]",
  ok: "text-accent",
  dim: "text-mute",
  cmd: "text-fg",
};

function LineRow({ l }: { l: Line }) {
  return (
    <div className={`mono text-[12px] leading-relaxed ${toneClass[l.tone ?? "dim"]}`}>
      {l.tone === "cmd" ? <span className="text-accent">$ </span> : null}
      {l.text}
    </div>
  );
}

function ProofFrame() {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-line bg-bg">
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-1 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="mono ml-2 text-[10px] text-mute">vitals-pass.png</span>
        <span className="mono ml-auto text-[10px] text-accent">✓ captured</span>
      </div>
      <div className="flex h-24 items-center justify-center">
        <span className="mono text-xs text-accent">✓ 12/12 passed · chart rendered</span>
      </div>
    </div>
  );
}

export default function AutomationDemo({ progress }: { progress?: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const total = automationStages.length;
  // Scroll-driven count when progress supplied; else manual play state.
  const [scrollCount, setScrollCount] = useState(reduce ? total : 0);
  const [playCount, setPlayCount] = useState(0);
  const [playing, setPlaying] = useState(false);

  useMotionValueEvent(progress ?? ({ on: () => () => {} } as never), "change", (v: number) => {
    setScrollCount(Math.min(total, Math.round(v * (total + 0.4))));
  });

  // Manual Run (used when no scroll progress, e.g. reduced motion or mobile).
  useEffect(() => {
    if (!playing) return;
    if (playCount >= total) { setPlaying(false); return; }
    const t = window.setTimeout(() => setPlayCount((c) => c + 1), 650);
    return () => window.clearTimeout(t);
  }, [playing, playCount, total]);

  const revealed = progress && !reduce ? scrollCount : playCount || (reduce ? total : 0);

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 text-xs text-mute">agent · fix-deploy-test-proof</span>
        {!progress && (
          <button
            type="button"
            onClick={() => { setPlayCount(0); setPlaying(true); }}
            className="mono ml-auto cursor-pointer rounded-md border border-line px-2.5 py-1 text-[11px] text-accent transition-colors hover:border-line-strong"
          >
            {revealed >= total ? "↺ replay" : "▶ run"}
          </button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {automationStages.map((stage, i) => {
          const open = i < revealed;
          return (
            <div key={stage.id} className="rounded-lg border border-line bg-bg p-3">
              <div className="mono mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-wider">
                <span className={open ? "text-accent" : "text-mute"}>{stage.label}</span>
                {open && <span className="h-px flex-1 bg-line" />}
              </div>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {stage.lines.map((l, j) => (
                      <LineRow key={j} l={l} />
                    ))}
                    {stage.id === "proof" && <ProofFrame />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <AnimatePresence>
          {revealed >= total && (
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mono flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-line bg-surface-1 p-3 text-[11px] text-dim"
            >
              <span>⏱ {automationSummary.duration}</span>
              <span>{automationSummary.steps}</span>
              <span className="text-accent">{automationSummary.result}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify standalone** — temporarily render `<AutomationDemo />` (no progress) on the page; `npm run build` passes; clicking Run reveals stages sequentially and shows the proof frame + summary; reduced-motion shows all stages immediately.

- [ ] **Step 4: Commit**

```bash
git add src/data/automation.ts src/components/AutomationDemo.tsx
git commit -m "feat: scripted AutomationDemo (fix-deploy-test-proof) with manual run"
```

---

### Task 5: Pin + scrub wrapper for AutomationDemo (signature scroll)

**Files:**
- Create: `src/components/AutomationSection.tsx`

**Interfaces:**
- Consumes: `AutomationDemo` (accepts `progress?: MotionValue<number>`).
- Produces: `AutomationSection` default export (no props) — a `~300vh` wrapper with a sticky inner panel; on hover+fine pointers it drives `AutomationDemo` via spring-smoothed `scrollYProgress`; on touch/reduced-motion it renders a normal static section with the manual-Run demo.

- [ ] **Step 1: Create `src/components/AutomationSection.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useReducedMotion } from "framer-motion";
import Section from "./ui/Section";
import AutomationDemo from "./AutomationDemo";

export default function AutomationSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setPinned(mq.matches && !reduce);
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  if (!pinned) {
    // Mobile / reduced-motion: plain section, manual Run, no pin.
    return (
      <Section
        id="automation"
        index="02"
        label="Live automation"
        title="Watch an agent ship a fix."
        intro="A real loop my agents run unattended: read the issue, fix it on a branch, deploy, verify with Playwright, attach proof. Press run."
      >
        <div className="mx-auto max-w-2xl">
          <AutomationDemo />
        </div>
      </Section>
    );
  }

  return (
    <div ref={ref} id="automation" className="relative h-[300vh]">
      <div className="sticky top-0 flex min-h-screen items-center">
        <Section
          index="02"
          label="Live automation"
          title="Watch an agent ship a fix."
          intro="A real loop my agents run unattended: read the issue, fix it on a branch, deploy, verify with Playwright, attach proof. Scroll to run it."
        >
          <div className="mx-auto max-w-2xl">
            <AutomationDemo progress={smooth} />
          </div>
        </Section>
      </div>
    </div>
  );
}
```

Note: confirm `Section` accepts being rendered without an `id` (pass `id` on the outer wrapper instead) and renders `index`/`label`/`title`/`intro`. If `Section` requires `id`, pass `id="automation"` to `Section` in the pinned branch and remove it from the wrapper div. Read `src/components/ui/Section.tsx` before implementing to match its prop contract.

- [ ] **Step 2: Verify pin + scrub** — render `<AutomationSection />` in the page; `npm run build` passes. Desktop: scrolling through the section pins the panel and reveals stages progressively. Mobile emulation / reduced-motion: plain section with a working Run button, no pin.

- [ ] **Step 3: Commit**

```bash
git add src/components/AutomationSection.tsx
git commit -m "feat: pin+scrub AutomationSection, touch/reduced-motion fallback"
```

---

### Task 6: Agent OS section (elevate existing toolkit + capabilities)

**Files:**
- Create: `src/components/AgentOS.tsx`
- Reuse data: `toolkit` and `capabilities` from `src/data/portfolio.ts` (already populated: Mahoraga, Email Reactor, Smart Context Injector, parallel agent teams, council, self-adaptation hooks).

**Interfaces:**
- Produces: `AgentOS` default export (no props). Renders a `Section` (id `agent-os`) with a short thesis line + a grid of the four most distinctive toolkit/capability items as `Reveal`-staggered cards.

- [ ] **Step 1: Create `src/components/AgentOS.tsx`**

```tsx
"use client";

import { toolkit, capabilities } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

const FEATURED_TOOLS = ["Mahoraga", "Email Reactor", "Smart Context Injector"];

export default function AgentOS() {
  const tools = FEATURED_TOOLS.map((n) => toolkit.find((t) => t.name === n)!).filter(Boolean);
  const caps = capabilities.slice(0, 3);

  return (
    <Section
      id="agent-os"
      index="03"
      label="Agent OS"
      title="Not a chatbot. An operating system for agents."
      intro="The part most engineers do not have: a personal agent stack that runs itself, learns from its own mistakes, and never touches production without a gate."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {tools.map((t, i) => (
          <Reveal key={t.name} delay={(i % 3) * 0.06} className="h-full">
            <div className="card flex h-full flex-col p-6">
              <span className="mono text-[11px] text-mute">{t.cmd}</span>
              <h3 className="t-h3 mt-3 text-fg">{t.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{t.desc}</p>
              <p className="mono mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-accent/90">
                {t.why}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {caps.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 0.06}>
            <div className="h-full bg-surface-1 p-5">
              <h4 className="mono text-sm text-fg">{c.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-dim">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Verify** — render in page; `npm run build` passes; cards reveal with stagger; copy reads accurately (it reuses real data).

- [ ] **Step 3: Commit**

```bash
git add src/components/AgentOS.tsx
git commit -m "feat: Agent OS section elevating Mahoraga/Reactor/Context + capabilities"
```

---

### Task 7: Sticky-stack the Featured cards (signature +1)

**Files:**
- Modify: `src/components/Featured.tsx` (wrap the 3 non-hero cards in a sticky-stack; keep the wide hero card as-is)

**Interfaces:**
- Consumes: existing `featured` data, `SpotlightCard`, `ProjectVisual`, `Meta`/`Highlights`/`Tags` helpers (unchanged).
- Behavior: the three `rest` cards become a sticky-stack (each `position: sticky` with incrementing `top`, slight scale-down via scroll). Touch/reduced-motion: fall back to the current grid.

- [ ] **Step 1: Read current `Featured.tsx` fully** (done in spec phase). Add a `StickyStack` wrapper around the `rest.map(...)` block. Add imports `useRef`, `useReducedMotion`, `useEffect`, `useState`.

- [ ] **Step 2: Add a gated sticky-stack renderer** inside `Featured.tsx`, replacing the `{rest.map(...)}` grid block with:

```tsx
        <StickyStack>
          {rest.map((p, i) => (
            <div
              key={p.id}
              className="sticky"
              style={{ top: `calc(6rem + ${i * 1.5}rem)` }}
            >
              <SpotlightCard
                dataUnit={`project:${p.id}`}
                className="flex flex-col p-6 sm:p-7"
              >
                <ProjectVisual id={p.id} accent={p.accent} className="mb-5 h-28" />
                <Meta p={p} />
                <h3 className="t-h3 mt-4 text-fg">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dim">{p.oneLiner}</p>
                <div className="mt-5">
                  <Highlights items={p.highlights} />
                </div>
                <Tags p={p} />
              </SpotlightCard>
            </div>
          ))}
        </StickyStack>
```

and define `StickyStack` (gates to plain stacking under touch/reduced-motion; the visual layering is pure CSS `position: sticky`, so it needs no JS, but we disable it on touch by switching the className):

```tsx
function StickyStack({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [stack, setStack] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setStack(mq.matches && !reduce);
  }, [reduce]);
  // On touch/reduced-motion: normal stacked grid (no sticky). On desktop: sticky-stack.
  return (
    <div className={stack ? "md:col-span-2 space-y-5" : "md:col-span-2 grid gap-5 md:grid-cols-3"}>
      {stack ? children : <PlainCards />}
    </div>
  );
}
```

NOTE: To keep DRY and avoid two card markups, refactor the single card into a `ProjectCard({ p }: { p: Project })` component (extract from the existing `rest.map` body) and render `ProjectCard` in both the sticky and plain branches. Implement `ProjectCard` first, then both branches map over `rest` using it. Replace the placeholder `<PlainCards />` accordingly. This refactor stays within `Featured.tsx`.

- [ ] **Step 3: Verify** — `npm run build` passes. Desktop: scrolling the work section stacks the three cards like a deck (each pins then the next overlaps). Touch/reduced-motion: simple stacked/grid cards, no sticky. Max 3 cards (well under the 5 limit).

- [ ] **Step 4: Commit**

```bash
git add src/components/Featured.tsx
git commit -m "feat(work): sticky-stack featured cards on desktop, grid fallback on touch"
```

---

### Task 8: Page composition + Nav + command palette wiring

**Files:**
- Modify: `src/app/page.tsx` (insert `AutomationSection` and `AgentOS`)
- Modify: `src/components/Nav.tsx` (add anchor links), `src/components/CommandPalette.tsx` (add navigation entries)

**Interfaces:**
- Consumes: `AutomationSection` (id `automation`), `AgentOS` (id `agent-os`).

- [ ] **Step 1: Update `src/app/page.tsx`**

```tsx
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import AutomationSection from "@/components/AutomationSection";
import SelectedWork from "@/components/SelectedWork";
import Featured from "@/components/Featured";
import AgentOS from "@/components/AgentOS";
import Toolkit from "@/components/Toolkit";
import NativeMobile from "@/components/NativeMobile";
import ProjectIndex from "@/components/ProjectIndex";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <AutomationSection />
      <SelectedWork />
      <Featured />
      <AgentOS />
      <Toolkit />
      <NativeMobile />
      <ProjectIndex />
      <Contact />
    </main>
  );
}
```

- [ ] **Step 2: Add nav + palette entries** — Read `src/components/Nav.tsx` and `src/components/CommandPalette.tsx` first to match their existing link/entry data shape, then add two entries: `{ label: "Automation", href: "#automation" }` and `{ label: "Agent OS", href: "#agent-os" }`, placed to match the section order. Do not invent a new data shape; mirror the existing one exactly.

- [ ] **Step 3: Verify** — `npm run build` passes; nav links and palette entries scroll to the new sections; anchor offsets land correctly (sections have ids).

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/Nav.tsx src/components/CommandPalette.tsx
git commit -m "feat: wire AutomationSection + AgentOS into page, nav, command palette"
```

---

### Task 9: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Production build** — Run: `cd ~/projects/porto-web && npm run build`. Expected: zero type/lint errors.

- [ ] **Step 2: Structural audit** — Invoke `/seismic` on the running dev server. Expected: no critical structural regressions vs baseline.

- [ ] **Step 3: Pixel/visual review** — Invoke `/visual-check` (headless render -> PNG -> review) on `/`. Confirm: hero line-mask, AutomationDemo, Agent OS, sticky-stack all render correctly; no overlap/jank.

- [ ] **Step 4: Reduced-motion** — DevTools "Emulate prefers-reduced-motion: reduce". Confirm: no parallax/scrub/pin; AutomationDemo shows all stages; headline static; page fully readable.

- [ ] **Step 5: Mobile/touch** — Emulate a touch device. Confirm: no pin/scrub; AutomationDemo uses Run button; Featured cards are a simple grid; no horizontal overflow.

- [ ] **Step 6: GEO recheck** — `curl` robots.txt / llms.txt / sitemap.xml return 200; rendered HTML contains `"@type":"Person"` and the answer-shaped bio sentence.

- [ ] **Step 7: Lighthouse** — Run Lighthouse on `/`. Confirm: Performance and Accessibility not regressed vs current (target >= 90 both).

- [ ] **Step 8: Final commit / push prep** — Confirm branch `feat/ai-agent-portfolio-revamp` holds all commits. Do NOT push or merge until user approves (Vercel auto-deploys main on push). Report status.

---

## Self-Review

**Spec coverage:**
- Unit 1 AutomationDemo -> Tasks 4 + 5. Covered.
- Unit 2 Agent OS card -> Task 6. Covered (reuses existing data).
- Unit 3 grounded Hero numbers -> Task 2 (verified numbers). Covered.
- Unit 4 scroll-animation layer -> Task 3 (line-mask), Task 5 (pin/scrub), Task 7 (sticky-stack); fade-up reveals reuse existing `Reveal`; scroll progress bar already exists (`fx/ScrollProgress.tsx`). Covered.
- Unit 5 GEO foundation -> Task 1. Covered (FAQ block deferred per spec, noted as P1).

**Placeholder scan:** `<PlainCards />` in Task 7 is explicitly flagged to be replaced by an extracted `ProjectCard` component with the existing markup; no other placeholders. `Section` prop contract and Nav/Palette data shapes flagged "read first" rather than guessed, because those files were not read during planning.

**Type consistency:** `AutomationDemo` prop `progress?: MotionValue<number>` matches `AutomationSection` passing `smooth` (a `useSpring` MotionValue). `Stage`/`Line` types defined in `automation.ts` (Task 4) and consumed only there + in the component. `Stat` type unchanged (Task 2).

**Open decisions resolved:** +1 signature = sticky-stack Featured (Task 7), horizontal-scroll SelectedWork dropped. Hero numbers measured and inlined (Task 2).

**Note for executor:** Tasks 5, 7, 8 require reading `ui/Section.tsx`, `Nav.tsx`, `CommandPalette.tsx`, `SpotlightCard.tsx` before editing to match exact prop/data contracts; the plan flags each inline.
