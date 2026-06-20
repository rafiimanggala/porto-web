# Portfolio AI/Agent Revamp + Scroll Animation + GEO Foundation

**Date**: 2026-06-21
**Project**: porto-web (Next.js 16, React 19, framer-motion, Tailwind v4, Vercel)
**Status**: Design approved, pending spec review

## Goal

Surface Rafii's strongest differentiator (running Claude as an always-on autonomous agent OS) on his portfolio, make the site feel alive on scroll without slop, and add the GEO foundation so AI engines can cite him. One push, cohesive revamp.

## Context

Current porto-web shows WHAT he builds (6 product cards) but not HOW he works daily (always-on orchestration, self-learning agent, safety-rails). Site renders fine for bots (SSR) but has no structured-data/entity layer. Aesthetic is dark terminal/command-center; a `CommandCenter` component already exists (macOS window, mono, accent, framer-motion).

## Scope (5 units)

### 1. AutomationDemo (signature interactive section)
- New `src/components/AutomationDemo.tsx` ("use client"), styled like existing `CommandCenter` (macOS window chrome, mono, accent, tokens).
- Plays a SCRIPTED Fix -> Deploy -> Test -> Proof sequence. Content seeded from real projects (TestEngine/HodieLabs TE/trading consensus) for authenticity.
- Stages: TASK received -> FIX (diff lines stream) -> DEPLOY (build log -> live chip) -> TEST (Playwright steps -> green pass count) -> PROOF (faux browser screenshot frame + "proof captured") -> DONE (summary chip).
- Driven by scroll (see unit 4): pinned + scrub. Also a manual Replay button for users who do not scroll.
- No backend, no new deps.

### 2. Agent OS card (the missing story)
- New featured card/section: Rafii's own personal agent system. Covers Mahoraga self-learning (locked rules), hourly client Email Reactor (agent-spawns-agent), Smart Context Injector (0-token memory), SOP hot-reload, keyword modes (AUTO/TR/TC/TE/REVISI).
- Frame safety-rails as engineering maturity (no-push-to-live, deploy gate, isolated-port, email guardrail).
- Add to `Featured` data or a dedicated section; reachable from Nav + command palette.

### 3. Grounded numbers in Hero
- Replace/augment "always-on" claim with verified metrics: locked self-learned rules, always-on agents count, daily-log count, agent-authored commits, BioBrain test-pass, trading bots.
- ALL numbers verified against the real system before they ship (see Open Items). No unverifiable claims.

### 4. Scroll-animation layer (taste-first)
- Stack: framer-motion (`useScroll`/`useTransform`/`useSpring`/`whileInView`) + CSS `animation-timeline: scroll()` for progress bars. Lenis optional (gate reduced-motion + disable on touch). NO GSAP.
- Signature moments (max 2-3 total): (a) AutomationDemo pin+scrub [primary], (b) ONE of horizontal-scroll SelectedWork OR sticky-stack Featured [recommend sticky-stack Featured, lower mobile/a11y risk], (c) Hero headline line-mask reveal.
- Polish everywhere: fade-up reveal stagger (`once:true`, 16-32px, 200-500ms, ease-out cubic-bezier(0.16,1,0.3,1), 40-60ms stagger), scroll progress bar, subtle hero parallax, ProjectIndex scroll-spy.
- Shared helper: a `Reveal` wrapper already exists (`src/components/ui/Reveal.tsx`); reuse/extend rather than reinvent.

### 5. GEO foundation
- `Person` JSON-LD in `<head>` (name, jobTitle, description, address, url, sameAs: GitHub + LinkedIn).
- Answer-shaped third-person bio paragraph on page (the sentence an AI lifts for "who is Rafii Manggala").
- Canonical name form ("Rafii Manggala Japamel") used identically across site + JSON-LD.
- `public/llms.txt` (answer-shaped bio + project facts), `public/robots.txt` (allow GPTBot/ClaudeBot/PerplexityBot/Google-Extended + Sitemap line), `app/sitemap.ts`.
- FAQ block (P1, can follow) with headings mirroring queries.

## Animation conventions (anti-slop, MUST follow)

- Animate transform + opacity only. Never top/left/width/height/margin/box-shadow.
- `once:true` on all reveals. Do not re-fire on re-entry.
- Do NOT fade-up uniformly; above-fold/dense content stays static.
- `prefers-reduced-motion`: degrade to STATIC end-state (opacity 1, no transform/parallax/scrub), not just shorter duration. Parallax gated hardest.
- Scrub values wrapped in `useSpring` (stiffness 100, damping 30).
- Pin length 200-400vh. Sticky-stack max 5 cards, once per page. No scroll-jacking.
- Disable parallax/pin/scrub/Lenis on touch via matchMedia / `(hover:hover) and (pointer:fine)`. Ship simple fade-in on mobile.
- Test page with ALL animation OFF: message must still land.

## Architecture / data flow

- New components are leaf `"use client"` units consuming Tailwind CSS-var tokens; pipe `scrollYProgress` via MotionValue (no per-frame setState).
- Scenario + metrics live in `src/data/` (extend `portfolio.ts` or add `automation.ts` / `agentOs.ts`) so content is data-driven and editable without touching component logic.
- `page.tsx` composition gains AutomationDemo (after Hero or SelectedWork) and Agent OS section; Nav + CommandPalette get anchors.

## Out of scope (YAGNI)

- No GSAP / no second animation runtime.
- No backend, no live agent execution, no real-time data.
- Not both horizontal-scroll AND sticky-stack as signatures (pick one).
- No char-by-char text explode. No WebGL.
- iOS Xamarin-style heavy effects; keep mobile simple.

## Testing / verification

- `npm run build` clean (no type/lint errors).
- `/seismic` structural audit + `/visual-check` pixel review before claiming done.
- Reduced-motion verified (DevTools emulate) -> static, readable.
- Mobile/touch verified -> no pin/scrub/jank.
- Lighthouse: no perf/a11y regression vs current.
- GEO: JSON-LD validates (Rich Results), llms.txt/robots.txt/sitemap return 200.

## Open items (resolve during plan/build)

1. Verify EXACT numbers before they ship (count daily logs, launchd jobs, agent commits, locked rules, test-pass). Placeholder claimed values must be replaced with measured ones.
2. Confirm the +1 signature choice: sticky-stack Featured (recommended) vs horizontal-scroll SelectedWork.
3. LinkedIn URL for sameAs (create if absent) and GitHub bio cleanup are off-repo follow-ups, not blockers for this push.
