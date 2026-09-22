// The scroll-linked work gallery on the homepage (#work). Single source of
// truth for its 7 rows: slug, title and blurb are copied straight from each
// case study's own <Metadata> in src/app/work/<slug>/page.tsx, not rewritten
// here. Real dimensions matter: two of the images below (education-saas,
// health-platform) are pre-cropped thin strips, not full screenshots, which
// is why WorkReel renders every image with object-fit: contain instead of
// cover -- cropping them further would make them illegible.

export type WorkReelItem = {
  slug: string;
  title: string;
  blurb: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
};

export const workReel: WorkReelItem[] = [
  {
    slug: "ai-video-production",
    title: "AI Video Production at Scale",
    blurb:
      "600+ AI-generated and AI-edited video and image assets across 14 client accounts: UGC ad avatars, 2D and 3D character animation, cinematic b-roll, product film, and scripted scenes.",
    image: {
      src: "/work/ai-video-production/10-scope-crowd.jpg",
      width: 960,
      height: 540,
      alt: "A crowd scene from one of the AI-generated video assets produced for this account.",
    },
  },
  {
    slug: "content-automation-pipeline",
    title: "Content Automation Pipeline",
    blurb:
      "A self-hosted n8n instance that scrapes source content, generates video scripts and voiceover with AI, and publishes to TikTok and Instagram on a schedule.",
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
    image: {
      src: "/work/education-saas/quiz-engine-thumb.webp",
      width: 700,
      height: 187,
      alt: "A strip of the quiz engine interface from the curriculum-aligned learning platform.",
    },
  },
  {
    slug: "health-platform",
    title: "Health Optimisation Platform",
    blurb:
      "A health web app that reconciles biomarkers, DNA, DEXA scans and wearables into one clinical scoring system, then explains it in plain English.",
    image: {
      src: "/work/health-platform/score-panel-thumb.webp",
      width: 700,
      height: 103,
      alt: "A strip of the clinical scoring panel that reconciles biomarkers, DNA, DEXA scans and wearables.",
    },
  },
  {
    slug: "made-to-measure-shopify",
    title: "Made-to-Measure Shopify Platform",
    blurb:
      "A body-measurement pattern-fitting system built into a Shopify theme, plus ten Klaviyo flows that replaced every default transactional email.",
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
    image: {
      src: "/work/streak/d-home.png",
      width: 1340,
      height: 920,
      alt: "The home screen of the Streak habit-tracker prototype.",
    },
  },
];
