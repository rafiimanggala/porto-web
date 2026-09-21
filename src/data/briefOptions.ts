// Scope options for the "Build your brief" block on /skills/[slug].
//
// Traceability contract: every option describes work already shown on the site.
// Each one is derived only from that skill's tools, its proof entries in
// skills.ts, the field notes in fieldNotes.ts, or the case studies under
// /work. No numbers, no new capability claims, no client names.

export type SkillSlug =
  | "full-stack-product-build"
  | "ai-features-in-product"
  | "automation-that-runs-itself"
  | "ai-video-at-scale"
  | "design-and-prototypes"
  | "live-system-rescue"
  | "shopify-storefronts";

export type BriefOption = {
  id: string;
  title: string;
  detail: string;
};

export const briefOptions: Record<SkillSlug, readonly BriefOption[]> = {
  "full-stack-product-build": [
    {
      id: "new-product",
      title: "A new product, end to end",
      detail:
        "From an empty repo to a live app your people log into, built and deployed by one person.",
    },
    {
      id: "features-in-live",
      title: "Features in a live system",
      detail:
        "New features added to a production codebase without breaking what users already rely on.",
    },
    {
      id: "many-sources",
      title: "Several data sources, one view",
      detail:
        "Separate sources reconciled into one scoring engine, with a dashboard on top.",
    },
    {
      id: "rules-heavy-tool",
      title: "A rules-heavy tool",
      detail:
        "A regulated, paper-heavy task turned into one calm screen that generates the paperwork for you.",
    },
    {
      id: "speed-offline",
      title: "Speed and offline pass",
      detail:
        "Cache headers, trimmed payloads and offline availability for slow or unreliable connections.",
    },
    {
      id: "single-sign-on",
      title: "Single sign-on per customer",
      detail:
        "Each customer's identity provider treated as its own piece of work, with its own test account.",
    },
  ],
  "ai-features-in-product": [
    {
      id: "written-summaries",
      title: "Written summaries from your data",
      detail:
        "Plain-language summaries generated from real records, written for the person who acts on them rather than dumped as charts.",
    },
    {
      id: "cross-source-reasoning",
      title: "Reasoning across several sources",
      detail:
        "An AI layer that reads separate data sources together, surfaces compounding risk and drafts plans from it.",
    },
    {
      id: "document-parsing",
      title: "Reading uploaded documents",
      detail:
        "Parsing that survives varying report layouts: pattern-driven extraction, no hardcoded line offsets.",
    },
    {
      id: "speech-to-text",
      title: "Speech to text",
      detail: "Audio transcribed with Whisper and fed into the rest of your workflow.",
    },
    {
      id: "traceable-outputs",
      title: "Outputs you can trace",
      detail:
        "Every recommendation points back to the input that triggered it, so the result can be trusted and checked.",
    },
    {
      id: "cost-and-limits",
      title: "Model cost and rate limits",
      detail:
        "Model cost measured on a sample before the run scales, and separate rate-limit buckets for reads and uploads.",
    },
  ],
  "automation-that-runs-itself": [
    {
      id: "scheduled-pipeline",
      title: "A scheduled pipeline",
      detail:
        "Sources in, the work in the middle, results published out the other end, self-hosted and unattended.",
    },
    {
      id: "failure-visibility",
      title: "See which step failed",
      detail:
        "Runs you can inspect step by step, so a failure shows up as a failure and not as a missing result.",
    },
    {
      id: "email-flows",
      title: "Transactional email flows",
      detail:
        "Default store emails replaced by Klaviyo flows mapped to real order and customer data.",
    },
    {
      id: "inbox-triage",
      title: "Inbound email triage",
      detail:
        "Incoming mail read, the issue fixed on a branch, and a reply drafted for you to review.",
    },
    {
      id: "browser-tasks",
      title: "Repetitive browser work",
      detail:
        "Steps that live in a web interface, driven by Playwright and scheduled with launchd.",
    },
    {
      id: "cost-check",
      title: "A cost check before a big run",
      detail:
        "Paid model calls measured on a small sample so the invoice is not the first time you learn the number.",
    },
  ],
  "ai-video-at-scale": [
    {
      id: "generated-clips",
      title: "AI-generated clips",
      detail: "Video and image assets generated with Kling, Veo or Seedance.",
    },
    {
      id: "templated-edits",
      title: "Branded, templated edits",
      detail: "Edits rendered through Creatomate from your own assets and brand.",
    },
    {
      id: "captions",
      title: "Captions and transcripts",
      detail: "Speech transcribed with Whisper so captions are ready before publishing.",
    },
    {
      id: "script-and-voice",
      title: "Scripted and voiced videos",
      detail:
        "Scripting, voiceover and an async render hand-off wired into one automated pipeline.",
    },
    {
      id: "publish-schedule",
      title: "Publishing and scheduling",
      detail: "Direct publishing to TikTok and Instagram, with the scheduling handled for you.",
    },
    {
      id: "many-accounts",
      title: "Many accounts, one workflow",
      detail:
        "The same workflow run across several client accounts, with sample campaigns to review first.",
    },
  ],
  "design-and-prototypes": [
    {
      id: "research-and-flow",
      title: "Research insight and user flow",
      detail: "The problem framed first, then the path a person takes through it.",
    },
    {
      id: "wireframes",
      title: "Wireframes",
      detail: "Low-fidelity layouts to settle structure before any visual polish.",
    },
    {
      id: "type-and-colour",
      title: "A small colour and type system",
      detail: "Design tokens that keep every screen consistent and easy to extend.",
    },
    {
      id: "responsive-screens",
      title: "Responsive screens",
      detail: "The key screens designed in Figma for both desktop and phone widths.",
    },
    {
      id: "clickable-prototype",
      title: "A clickable prototype",
      detail:
        "A working version in the browser, built with React and Tailwind, that people can actually try.",
    },
    {
      id: "map-or-canvas",
      title: "Map or canvas views",
      detail: "Prototype screens that include a Leaflet map or a canvas drawing.",
    },
  ],
  "live-system-rescue": [
    {
      id: "diagnose-live-bug",
      title: "Diagnose a live bug",
      detail:
        "The cause found from logs and evidence rather than guessing, on a system that has real users.",
    },
    {
      id: "tagged-rollback",
      title: "Deploy behind a tagged rollback",
      detail:
        "A fix shipped with the previous version kept ready, so reverting is one command and not a rebuild.",
    },
    {
      id: "stuck-emails",
      title: "Stuck or missing emails",
      detail:
        "Message state traced at the provider before any of your own sending code is rewritten.",
    },
    {
      id: "slow-page",
      title: "A page that is too slow",
      detail:
        "The explain plan run first, then the payload or the index fixed, whichever is the real problem.",
    },
    {
      id: "login-and-session",
      title: "Login and session bugs",
      detail:
        "Redirect loops and mid-session logouts traced through the access logs instead of guessed at.",
    },
    {
      id: "verified-in-browser",
      title: "End-to-end verification",
      detail:
        "Every change tested through a real browser before it counts as done.",
    },
  ],
  "shopify-storefronts": [
    {
      id: "inline-editor",
      title: "An inline editor in the theme",
      detail:
        "A customer-facing editing tool built into the theme itself, not bolted on as an app.",
    },
    {
      id: "external-api",
      title: "Theme wired to an external API",
      detail:
        "Every read and write going through a REST API that the theme does not control.",
    },
    {
      id: "no-build-pipeline",
      title: "Plain Liquid and JavaScript",
      detail: "Theme code with no bundler and no build pipeline to maintain.",
    },
    {
      id: "klaviyo-flows",
      title: "Klaviyo order emails",
      detail: "Default notifications replaced by flows mapped to real order and customer data.",
    },
    {
      id: "theme-bug-fix",
      title: "Fix a stubborn theme bug",
      detail:
        "Bugs in the small print, such as a login redirect, checked against the deployed bytes and not the source.",
    },
  ],
};

export function optionsForSlug(slug: string): readonly BriefOption[] {
  return Object.prototype.hasOwnProperty.call(briefOptions, slug)
    ? briefOptions[slug as SkillSlug]
    : [];
}
