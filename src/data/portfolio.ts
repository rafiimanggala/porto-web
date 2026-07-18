// Portfolio content: single source of truth.
// Client work is anonymized (no client names/branding). Personal projects use real names.

export const profile = {
  name: "Rafii Manggala Japamel",
  handle: "rafii",
  role: "AI Engineer · Autonomous Systems",
  location: "Indonesia · UTC+7 · Remote",
  available: true,
  tagline:
    "I build systems where AI agents do the work, not just write the code.",
  thesis:
    "Most people use Claude Code to write functions. I deploy it as the engine: always-on agents that observe, decide, and act in production. Trading bots that reach multi-model consensus before risking capital. A digital twin that reasons from my own decision history. An inbox that fixes client bugs while I sleep. The code is the easy part. The interesting work is the orchestration.",
  email: "rafiimanggala3@gmail.com",
  github: "https://github.com/rafiimanggala",
  linkedin: "https://linkedin.com/in/rafiimanggala",
};

export type Stat = { label: string; value: string; note?: string };

export const stats: Stat[] = [
  { label: "Always-on AI agents", value: "15", note: "launchd, 24/7" },
  { label: "Self-learned rules", value: "59", note: "auto-locked, permanent" },
  { label: "Daily build logs", value: "94", note: "shipped + logged" },
  { label: "Git repositories", value: "39", note: "81 project folders" },
  { label: "Autonomous systems", value: "6", note: "running in production" },
  { label: "Client countries", value: "2", note: "AU · US" },
];

export type Project = {
  id: string;
  title: string;
  kind: "Personal" | "Client" | "Freelance";
  year: string;
  oneLiner: string;
  stack: string[];
  highlights: string[];
  status: "Live" | "Done" | "Building" | "Planned";
  link?: { label: string; href: string };
  accent?: "mint" | "violet" | "amber";
};

// Hero / featured: the strongest "complex AI engineering" showcases.
export const featured: Project[] = [
  {
    id: "trading-command-center",
    title: "Trading Command Center",
    kind: "Personal",
    year: "2026",
    oneLiner:
      "Unified paper-trading platform running 12 AI + algorithmic bots under one dashboard, gated by multi-model consensus.",
    stack: ["FastAPI", "PostgreSQL", "Claude", "Groq", "Alpine.js", "Docker"],
    highlights: [
      "Multi-model consensus gate: Claude and Groq must agree before any trade. Disagreement forces HOLD. Research-backed anti-hallucination design.",
      "Market-regime detector skips trading in volatile conditions; 9 correctness fixes (balance double-counting, position-size caps, real funding-rate API).",
      "12 bots across crypto / forex / stocks / prediction markets + a financial-analysis engine (DCF, peer comp, technicals).",
    ],
    status: "Live",
    link: { label: "GitHub", href: "https://github.com/rafiimanggala/trading-command-center" },
    accent: "mint",
  },
  {
    id: "amadeus",
    title: "Amadeus · Digital Twin",
    kind: "Personal",
    year: "2026",
    oneLiner:
      "An always-on agent that observes my activity, learns my cognitive patterns, and reasons in my own voice.",
    stack: ["Python", "SQLite FTS5", "launchd", "Claude headless", "Telegram"],
    highlights: [
      "Decision-exemplar bank: mines 320 real decisions from my git commits + self-correction logs, retrieved via BM25 so the twin reasons 'as I would' instead of guessing.",
      "Always-on pulse model: heartbeat every 2h + event-triggered wakes, SENSE→THINK→DELIVER cycle via headless Claude, gated to waking hours.",
      "Hard macOS plumbing solved: launchd keychain auth, Full-Disk-Access 'responsible process' gotcha, anti-feedback-loop capture guard.",
    ],
    status: "Live",
    accent: "violet",
  },
  {
    id: "testengine",
    title: "TestEngine",
    kind: "Personal",
    year: "2026",
    oneLiner:
      "Self-hosted MCP server for isolated, parallel browser testing, one Docker container per session.",
    stack: ["TypeScript", "Playwright", "Docker ARM64", "CDP", "SwiftUI"],
    highlights: [
      "27 MCP tools across session / browser / auth / pool / debug; container pool with pre-warm, recycle, and a health monitor enforcing memory/uptime limits.",
      "CDP screencast relayed over WebSocket into a native SwiftUI live viewer; SQLite persistence survives restarts.",
      "Built end-to-end via the superpowers workflow: spec → plans → subagent-driven dev with per-task review.",
    ],
    status: "Done",
    link: { label: "GitHub", href: "https://github.com/rafiimanggala/testengine" },
    accent: "amber",
  },
  {
    id: "market-intel",
    title: "Market Intelligence Agent",
    kind: "Personal",
    year: "2026",
    oneLiner:
      "AI research agent tracking institutional whales, insider buying, and multi-factor signals into Claude-written briefings.",
    stack: ["FastAPI", "PostgreSQL", "Anthropic SDK", "SEC EDGAR", "vectorbt"],
    highlights: [
      "8 services (~5,800 LOC): 13F whale tracker, Form-4 insider scanner, factor engine (value/momentum/quality Z-scores), backtested pattern engine.",
      "Composite signal scoring (whale + insider + factor + pattern) with conviction thresholds; feeds the Trading Command Center for execution.",
    ],
    status: "Live",
    link: { label: "GitHub", href: "https://github.com/rafiimanggala/market-intelligence-agent" },
    accent: "mint",
  },
  {
    id: "content-automation-pipeline",
    title: "Content Automation Pipeline",
    kind: "Personal",
    year: "2026",
    oneLiner:
      "Self-hosted n8n instance turning RSS sources into scripted, voiced short-form video and auto-publishing it to TikTok and Instagram.",
    stack: ["n8n", "OpenAI", "Whisper", "Creatomate", "Google Sheets"],
    highlights: [
      "30+ node workflow: multi-source RSS merge → LLM script rewrite → Whisper voiceover → async render → direct TikTok/Instagram publish, fully unattended.",
      "A separate scraping workflow feeds engagement signals back in, decoupled from publishing so a scrape failure never blocks the posting schedule.",
      "Self-hosted, not a managed SaaS tier: no per-execution billing ceiling, every credential stays under direct control.",
    ],
    status: "Live",
    link: { label: "Case study", href: "/work/content-automation-pipeline" },
    accent: "amber",
  },
  {
    id: "health-platform",
    title: "Health Optimisation Platform",
    kind: "Client",
    year: "2026",
    oneLiner:
      "Health web app ingesting biomarkers, DNA, DEXA scans and wearables into clinical scores + AI recommendations. (AU client)",
    stack: ["React", "Node/Express", "MongoDB", "Firebase", "Render"],
    highlights: [
      "DEXA body-composition parsing across scanner vendors, with auto-crop of report images via PDF operator-list inspection and reference-based percentile scoring (not hardcoded).",
      "Multi-source scoring engine reconciling labs + metrics + scans, with unit conversions and per-report transparency disclosures.",
      "Shipped with a 'Test & Execute' loop: fix → deploy → self-verify via Playwright → screenshot-confirm before reporting.",
    ],
    status: "Live",
    link: { label: "Case study", href: "/work/health-platform" },
    accent: "violet",
  },
  {
    id: "education-saas",
    title: "K-12 Education SaaS",
    kind: "Client",
    year: "2026",
    oneLiner:
      "Curriculum-aligned learning platform for schools with quiz engine, AI tutoring, and subscriptions. (AU client)",
    stack: [".NET 9", "Angular", "PostgreSQL", "MAUI", "Clean Arch / CQRS"],
    highlights: [
      "18 features delivered against a production DB of 995 schools / 12,495 users; 3 AI features (tutoring chat, practice-set generator, weekly insights email).",
      "Deep prod debugging: decompiled DLLs for byte-level image diffs to prove a low-risk deploy; diagnosed an SMTP rate-limit + 9.8K dead-email backlog.",
      "Isolated TestContainers integration tests + a reusable auth handler after finding silently-rejected OpenIddict tokens.",
    ],
    status: "Live",
    link: { label: "Case study", href: "/work/education-saas" },
    accent: "amber",
  },
];

export type Tool = {
  name: string;
  cmd: string;
  desc: string;
  why: string;
  type: "Skill" | "Hook system" | "CLI" | "Infra";
};

export const toolkit: Tool[] = [
  {
    name: "Mahoraga",
    cmd: "hooks/mahoraga",
    desc: "Self-adaptation system that captures the agent's own failures and promotes real lessons into permanent rules.",
    why: "A genuinely closed-loop self-improving agent: an LLM reviews each session transcript and auto-locks confirmed lessons. 30+ locked patterns.",
    type: "Hook system",
  },
  {
    name: "Graphify",
    cmd: "/graphify",
    desc: "Turns any input (code, docs, papers) into a clustered knowledge graph, self-rebuilding on every commit.",
    why: "Deployed across 6 live projects; one codebase graphed at 27k nodes / 36k edges, queryable in natural language.",
    type: "CLI",
  },
  {
    name: "Seismic Sense",
    cmd: "/seismic",
    desc: "UI/UX structural analysis without screenshots, extracts design DNA and scores live pages deterministically.",
    why: "Replaces token-heavy visual review with structural analysis: ~88% token savings, zero LLM tokens on scoring.",
    type: "Skill",
  },
  {
    name: "Writing DNA",
    cmd: "/dna",
    desc: "Learns a person's writing voice from real messages and generates new text that sounds like them, per recipient.",
    why: "Self-correcting via a feedback log; powers autonomous email drafting that passes as the real author.",
    type: "Skill",
  },
  {
    name: "CUA Driver",
    cmd: "/cua-driver",
    desc: "Drives native macOS apps by accessibility tree without moving the cursor or stealing keyboard focus.",
    why: "Solves the 'macOS has one cursor since 1984' problem via SLEventPostToPid: the only non-VM path to true cursor isolation.",
    type: "Infra",
  },
  {
    name: "wa",
    cmd: "wa auto <url>",
    desc: "4-tier stealth web-automation dispatcher for anti-bot targets (Cloudflare / Turnstile / DataDome).",
    why: "Built on the 2025-26 anti-bot meta: curl_cffi + nodriver (raw CDP), with compile-to-script for cheap token-free reruns.",
    type: "CLI",
  },
  {
    name: "Smart Context Injector",
    cmd: "hooks/memory-inject",
    desc: "Auto-loads relevant project memory by keyword match. Pure bash, ~0 token cost, 230ms.",
    why: "Two-layer retrieval: instant free keyword injection + on-demand semantic search. Persistent memory, no token overhead.",
    type: "Hook system",
  },
  {
    name: "Email Reactor",
    cmd: "launchd · hourly",
    desc: "Reads new client email, warms up the right repo, fixes the issue on a branch, and drafts a reply.",
    why: "A self-driving freelance assistant: spawns headless Claude per inbound email, stops just short of anything irreversible.",
    type: "Infra",
  },
];

export type Capability = { title: string; desc: string };

export const capabilities: Capability[] = [
  {
    title: "Parallel agent teams",
    desc: "Lead agent delegates to a fleet of teammates: inventories, audits, and full-stack builds run on 3-5 concurrent agents.",
  },
  {
    title: "Multi-agent council review",
    desc: "A 4-agent adversarial panel that must all pass before work is 'done'. Adversarial self-verification built into the workflow.",
  },
  {
    title: "Self-adaptation hooks",
    desc: "Closed-loop learning: LLM transcript review → tentative → confirmed → locked rules, reloaded every session.",
  },
  {
    title: "Headless autonomous spawning",
    desc: "launchd + headless `claude --print` for unattended reactors and always-on daemons, with keychain auth and FDA mastery.",
  },
  {
    title: "Desktop & web automation tiers",
    desc: "Cursor-isolated CUA driver, accessibility-based control, and a curl_cffi→nodriver stealth ladder with compile-to-script.",
  },
  {
    title: "REVISI 1:1 convergence",
    desc: "Enumerate units → diff viewer → 5 parallel agents compare + implement per cluster → rebuild → stop at zero-fix.",
  },
];

// Compact index of everything else, grouped.
export type IndexGroup = { group: string; items: { name: string; note: string; stack: string }[] };

export const projectIndex: IndexGroup[] = [
  {
    group: "Autonomous & AI systems",
    items: [
      { name: "Market Intelligence Agent", note: "13F whale + Form-4 insider + factor signals into briefings", stack: "FastAPI · Anthropic SDK · SEC EDGAR" },
      { name: "ClaudeClaw", note: "Multi-agent Telegram bot (Haiku UI + Opus workers)", stack: "Node · Haiku/Opus · Groq" },
      { name: "Auto-Approve / PC Monitor", note: "Headless Mac controlled fully from iPhone over Telegram", stack: "launchd · Telegram · AppleScript" },
      { name: "Personal Assistant Bot", note: "Telegram twin: voice transcribe + life-category classify + WHOOP", stack: "Node · Claude CLI · Groq" },
      { name: "AI SDR Platform", note: "3 sales agents on a VPS for finance/law firms (US client)", stack: "Agent SDK · Express · PG · MinIO" },
    ],
  },
  {
    group: "Full-stack products",
    items: [
      { name: "K-12 Education SaaS", note: "Curriculum learning platform + AI tutoring, 995 schools (AU client)", stack: ".NET 9 · Angular · PostgreSQL" },
      { name: "Employee Wellbeing App", note: "Psychosocial-risk mapping + ISO 45003 reports (AU client)", stack: "React Native · Express · MongoDB" },
      { name: "AI Surf Forecasting", note: "200+ spots, 16-day forecast, 'Surf DNA' matching (AU client)", stack: "React · Express · MongoDB" },
      { name: "open-wearables", note: "Wearables data full-stack + MCP, full CI/CD", stack: "React/Vite · FastAPI · MCP" },
      { name: "Shopify Fashion Store", note: "Theme fixes + full Klaviyo email program, 10 live flows (AU client)", stack: "Liquid · Klaviyo · Shopify CLI" },
    ],
  },
  {
    group: "Tools & infra",
    items: [
      { name: "Idea Wall", note: "Native macOS menu-bar idea board, zero third-party deps", stack: "Swift 6 · WKWebView · Claude CLI" },
      { name: "Code Janitor", note: "Dead-code + semantic-clone scanner", stack: "Knip · jscpd · LLM layer" },
      { name: "Auto-QA + Wrapup", note: "Post-codegen quality gate + cross-session banners", stack: "Hooks · Seismic · figlet" },
      { name: "Bloomberg / MMT terminals", note: "Command-driven financial terminals", stack: "FastAPI · Alpine · uPlot" },
    ],
  },
];

export const techStack = [
  "TypeScript", "Python", "C# / .NET", "Swift", "React", "Next.js", "React Native",
  "FastAPI", "Express", "PostgreSQL", "MongoDB", "Docker", "Playwright",
  "Anthropic SDK", "MCP", "Claude Code", "launchd", "Tailwind",
];
