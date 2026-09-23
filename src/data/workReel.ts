// The scroll-linked work gallery on the homepage (#work). Single source of
// truth for its 7 rows: slug, title and blurb are copied straight from each
// case study's own <Metadata> in src/app/work/<slug>/page.tsx, not rewritten
// here. education-saas and health-platform are NDA client work with no real
// screenshots to show -- their images are captures of the same illustrated
// mockup components (src/components/mockups/health.tsx, education.tsx) the
// case study pages themselves render, shot via src/app/mockup-preview/
// (?project=health|education&screen=N) at the same width the case study
// article uses, so nothing is stretched or empty at the bottom.

export type WorkReelItem = {
  slug: string;
  title: string;
  blurb: string;
  // Short factual highlight for the tilted sticker chip on the card art --
  // same role as viens-la.com's "Partenaire digital de Maison Ferrand depuis
  // 5 ans" caption: one concrete number or fact, not a restatement of blurb.
  caption: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  // Optional looping preview clip, muted/no controls, shown instead of the
  // static image where a real clip exists (only ai-video-production has
  // one -- the others are screenshots of software, not footage, so a still
  // image is the honest preview for them). `image` stays as the <video>'s
  // poster frame either way.
  video?: string;
};

export const workReel: WorkReelItem[] = [
  {
    slug: "ai-video-production",
    title: "AI Video Production at Scale",
    blurb:
      "600+ AI-generated and AI-edited video and image assets across 14 client accounts: UGC ad avatars, 2D and 3D character animation, cinematic b-roll, product film, and scripted scenes.",
    caption: "600+ assets across 14 client accounts",
    image: {
      src: "/work/ai-video-production/10-scope-crowd.jpg",
      width: 960,
      height: 540,
      alt: "A crowd scene from one of the AI-generated video assets produced for this account.",
    },
    video: "/work/ai-video-production/10-scope-crowd.mp4",
  },
  {
    slug: "content-automation-pipeline",
    title: "Content Automation Pipeline",
    blurb:
      "A self-hosted n8n instance that scrapes source content, generates video scripts and voiceover with AI, and publishes to TikTok and Instagram on a schedule.",
    caption: "Self-hosted, zero manual posting",
    image: {
      src: "/work/content-automation-pipeline/01-video-workflow.png",
      width: 1600,
      height: 1000,
      alt: "The n8n workflow that scrapes content, scripts and voices it with AI, then publishes on a schedule.",
    },
  },
  {
    slug: "education-saas",
    title: "K-12 Education SaaS",
    blurb:
      "A curriculum-aligned learning platform for schools: quiz engine, AI-generated performance insights, and production debugging at scale.",
    caption: "Live in production for real schools",
    image: {
      src: "/work/education-saas/insights-card.webp",
      width: 1624,
      height: 1116,
      alt: "The fortnightly class-insights dashboard from the curriculum-aligned learning platform: completion, topic accuracy and which class needs a nudge.",
    },
  },
  {
    slug: "health-platform",
    title: "Health Optimisation Platform",
    blurb:
      "A health web app that reconciles biomarkers, DNA, DEXA scans and wearables into one clinical scoring system, then explains it in plain English.",
    caption: "4 data sources, one clinical score",
    image: {
      src: "/work/health-platform/dashboard-card.webp",
      width: 1624,
      height: 1116,
      alt: "The dashboard of the health optimisation platform, showing connected wearables, flagged blood markers and the six-domain longevity score.",
    },
  },
  {
    slug: "made-to-measure-shopify",
    title: "Made-to-Measure Shopify Platform",
    blurb:
      "A body-measurement pattern-fitting system built into a Shopify theme, plus ten Klaviyo flows that replaced every default transactional email.",
    caption: "10 Klaviyo flows, every default email replaced",
    image: {
      src: "/work/made-to-measure-shopify/storefront-collection.webp",
      width: 1600,
      height: 953,
      alt: "The Shopify storefront collection page for the made-to-measure pattern-fitting platform.",
    },
  },
  {
    slug: "spotter-eld",
    title: "Spotter ELD",
    blurb:
      "Turning a regulated, error-prone task (truck route planning and Hours-of-Service logs) into one calm screen.",
    caption: "Regulated compliance work, one calm screen",
    image: {
      src: "/work/spotter-eld/01-landing.png",
      width: 1280,
      height: 720,
      alt: "The landing screen of Spotter ELD, showing truck route planning and Hours-of-Service logs.",
    },
  },
  {
    slug: "streak",
    title: "Streak",
    blurb:
      "Designing a warm, encouraging habit tracker: research, user flow, design system, and a clickable prototype.",
    caption: "Research to clickable prototype, solo",
    image: {
      src: "/work/streak/d-home.png",
      width: 1340,
      height: 920,
      alt: "The home screen of the Streak habit-tracker prototype.",
    },
  },
];
