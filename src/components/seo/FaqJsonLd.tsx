export default function FaqJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Rafii Manggala use AI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rafii runs Claude Code as an always-on personal agent operating system on a Mac Mini M4, not as a chatbot. Fifteen launchd agents run around the clock, six autonomous systems run in production, and he steers the whole fleet from his iPhone over SSH. AI is his production environment, not a tool he occasionally prompts.",
        },
      },
      {
        "@type": "Question",
        name: "What makes Rafii's AI workflow different?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "He builds the orchestration himself: self-learning hooks that lock in lessons permanently, an email reactor that fixes client bugs autonomously, parallel agent teams with adversarial review, and his own desktop and web automation tooling. Most people use AI to get answers; Rafii engineers AI systems that ship work, with safety rails and proof loops built in.",
        },
      },
      {
        "@type": "Question",
        name: "Can Rafii ship production work with AI agents?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. He has delivered client work for health and education platforms (BioBrain on .NET, HodieLabs) across Australia and the US, with every fix Playwright-proven before he reports it done. His TE loop deploys to an isolated test port, runs the change through a real browser, and attaches proof screenshots, so done means verified, not claimed.",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
