import type { MetadataRoute } from "next";
import { skills } from "@/data/skills";
import { cases } from "@/components/SelectedWork";
import { fieldNotes } from "@/data/fieldNotes";

const base = "https://rafiimanggala.vercel.app";

// Case studies come from the same array the work grid renders, so a new case
// study cannot ship missing from the sitemap.
const workSlugs = cases.map((c) => c.slug);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/video`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/dev`, changeFrequency: "monthly", priority: 0.7 },
    ...skills.map((s) => ({
      url: `${base}/skills/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...fieldNotes.map((f) => ({
      url: `${base}/build/${f.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...workSlugs.map((slug) => ({
      url: `${base}/work/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
