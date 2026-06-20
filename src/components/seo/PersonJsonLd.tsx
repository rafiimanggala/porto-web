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
