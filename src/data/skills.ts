// The switchboard. One array feeds the homepage panel, the number-key router,
// the seven /skills/[slug] pages and generateStaticParams, so a card and the page
// it opens can never drift apart.
//
// Traceability contract: every `evidence` string must be findable as a readable
// sentence inside one of that skill's proof pages. No unsourced numbers.

export type Proof = {
  label: string;
  href: string;
  external?: boolean;
  why: string;
};

export type Skill = {
  slug: string;
  n: number;
  title: string;
  value: string;
  evidence: string;
  tools: string[];
  proof: Proof[];
};

export const skills: Skill[] = [
  {
    slug: "full-stack-product-build",
    n: 1,
    title: "Full-Stack Web Apps",
    value:
      "From nothing to a product your people log into every day. I build all of it and put it live.",
    evidence: "995 schools and 12,495 users on the live system",
    tools: [
      "React",
      ".NET 9",
      "PostgreSQL",
      "Angular",
      "Node/Express",
      "MongoDB",
      "Next.js",
      "Firebase",
    ],
    proof: [
      {
        label: "Health Optimisation Platform",
        href: "/work/health-platform",
        why: "A live web app for an AU client: four data sources, a domain scoring engine, and web plus mobile-reflowed views.",
      },
      {
        label: "K-12 Education SaaS",
        href: "/work/education-saas",
        why: "18 features delivered into an existing production system serving 995 schools and 12,495 users, on .NET 9 and Angular.",
      },
      {
        label: "Spotter ELD",
        href: "/work/spotter-eld",
        why: "Built and deployed end to end, openly usable: trip planning plus auto-generated FMCSA daily log sheets.",
      },
    ],
  },
  {
    slug: "ai-features-in-product",
    n: 2,
    title: "AI Inside Your Product",
    value:
      "AI that does a real job for your users, not a chat box bolted onto the corner.",
    evidence: "Four data sources read into one score",
    tools: [
      "Anthropic SDK",
      "OpenAI",
      "Whisper",
      "Document parsing",
      "Node/Express",
      ".NET 9",
      "Python",
    ],
    proof: [
      {
        label: "Health Optimisation Platform",
        href: "/work/health-platform",
        why: "An AI layer reasons across blood, DNA, DEXA and wearable data to surface compounding risk, then generates plans from it.",
      },
      {
        label: "K-12 Education SaaS",
        href: "/work/education-saas",
        why: "Fortnightly class-performance summaries generated from real quiz data, written for teachers rather than dumped as charts.",
      },
      {
        label: "Market Intelligence Agent",
        href: "https://github.com/rafiimanggala/market-intelligence-agent",
        external: true,
        why: "The same pattern on public data, in an open repo: multi-source signals condensed into written briefings. Personal project.",
      },
    ],
  },
  {
    slug: "automation-that-runs-itself",
    n: 3,
    title: "Automation That Runs Itself",
    value:
      "Your repetitive work happens on schedule, and you can see which step failed.",
    evidence: "30+ node pipeline, self hosted, runs unattended",
    tools: [
      "n8n",
      "Klaviyo",
      "Playwright",
      "launchd",
      "Claude Code",
      "Shopify CLI",
      "Google Sheets",
    ],
    proof: [
      {
        label: "Content Automation Pipeline",
        href: "/work/content-automation-pipeline",
        why: "A 30+ node self-hosted n8n graph: sources in, script and voiceover and render in the middle, publishing out the other end.",
      },
      {
        label: "Made-to-Measure Shopify Platform",
        href: "/work/made-to-measure-shopify",
        why: "Ten live Klaviyo flows replaced every default transactional email, mapped to real order and customer data.",
      },
      {
        label: "Always-on email reactor",
        href: "/dev#agent-os",
        why: "My own infrastructure: an hourly reactor reads inbound client mail, fixes the issue on a branch, and drafts the reply. Personal tooling, shown as capability rather than client deliverable.",
      },
    ],
  },
  {
    slug: "ai-video-at-scale",
    n: 4,
    title: "AI Video At Scale",
    value:
      "Social video produced and published at volume, with scheduling handled for you.",
    evidence: "600+ assets across 14 client accounts",
    tools: [
      "Kling",
      "Veo",
      "Creatomate",
      "Seedance",
      "n8n",
      "Whisper",
      "TikTok and Instagram publishing",
    ],
    proof: [
      {
        label: "AI Video Production at Scale",
        href: "/work/ai-video-production",
        why: "600+ AI-generated and AI-edited video and image assets across 14 client accounts, with anonymised sample campaigns.",
      },
      {
        label: "The AI video lane",
        href: "/video",
        why: "The whole second lane of the site, with the numbers stated plainly and the output shown rather than described.",
      },
      {
        label: "Content Automation Pipeline",
        href: "/work/content-automation-pipeline",
        why: "The delivery backbone behind that output: scripting, voiceover, async render hand-off, then direct publishing.",
      },
    ],
  },
  {
    slug: "design-and-prototypes",
    n: 5,
    title: "Design And Prototypes",
    value:
      "A complicated idea becomes screens people understand, plus a clickable version to try.",
    evidence: "Five responsive screens and a live prototype",
    tools: [
      "Figma",
      "React",
      "Tailwind",
      "Design tokens",
      "Leaflet",
      "Canvas",
    ],
    proof: [
      {
        label: "Streak",
        href: "/work/streak",
        why: "A complete design case: research insight, user flow, wireframes, a small colour and type system, five responsive screens.",
      },
      {
        label: "Clickable prototype",
        href: "/demo/streak",
        why: "The prototype itself, running in the browser: toggle habits, open detail, create one, switch the accent.",
      },
      {
        label: "Spotter ELD",
        href: "/work/spotter-eld",
        why: "A regulated, paper-heavy compliance task compressed into one calm screen, log grid included.",
      },
    ],
  },
  {
    slug: "live-system-rescue",
    n: 6,
    title: "Fixing Live Systems",
    value:
      "Something live is broken or scary to touch. I fix it with proof, behind a tagged rollback.",
    evidence: "9,800 stuck emails traced to the provider",
    tools: [
      "Playwright",
      "Docker",
      "PostgreSQL",
      "MongoDB",
      "Shopify CLI",
      "Git tagged rollbacks",
    ],
    proof: [
      {
        label: "K-12 Education SaaS",
        href: "/work/education-saas",
        why: "Production debugging with real schools on the system: decompiled shipped DLLs to prove a deploy matched what was tested, traced a 9.8K-email backlog to a silent provider rate limit.",
      },
      {
        label: "Made-to-Measure Shopify Platform",
        href: "/work/made-to-measure-shopify",
        why: "Untangled three stacked copies of a broken helper behind a login redirect bug, and verified a suspect CSS change against the deployed bytes.",
      },
      {
        label: "Health Optimisation Platform",
        href: "/work/health-platform",
        why: "Shipped under a fix, deploy, self-verify loop: every change tested end to end through a real browser before it counted as done.",
      },
    ],
  },
  {
    slug: "shopify-storefronts",
    n: 7,
    title: "Custom Shopify Builds",
    value:
      "A stock theme learns a feature Shopify apps can't sell you, built into the theme itself.",
    evidence: "An inline pattern editor, wired to an external API",
    tools: ["Liquid", "JavaScript", "Shopify CLI", "REST APIs", "Klaviyo"],
    proof: [
      {
        label: "Made-to-Measure Shopify Platform",
        href: "/work/made-to-measure-shopify",
        why: "Every read and write goes through an external REST API the theme doesn't control, inside a pure Liquid and vanilla-JS theme with no build pipeline: no React, no bundler, no shortcuts.",
      },
    ],
  },
];

export const skillBySlug = (slug: string) => skills.find((s) => s.slug === slug);
