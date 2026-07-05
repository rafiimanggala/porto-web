import type { MetadataRoute } from "next";

const base = "https://rafiimanggala.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/work/spotter-eld`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/work/streak`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/work/made-to-measure-shopify`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
