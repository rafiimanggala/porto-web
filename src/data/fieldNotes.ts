// Field notes: what I already knew about a domain before the kickoff call,
// because I hit it in production.
//
// Traceability contract, stricter than the skills array: every item below is
// something that actually happened on shipped work. No item may state a
// certification, standard, or capability I have not personally worked through.
// A number here must be findable in the case study it links to, or be a public
// fact about the framework named. If an item cannot be sourced, it is cut, not
// softened.
//
// Client identity stays out. These are process lessons, not incident reports:
// no client name, no product name, no school, no patient, no dates tying a
// lesson to a specific engagement.

export type Note = {
  title: string;
  body: string;
  /* Where the reader can check it. Omitted when the item is a public fact
     about an external framework rather than a claim about my own work. */
  source?: { label: string; href: string };
};

export type FieldNote = {
  slug: string;
  n: number;
  domain: string;
  title: string;
  value: string;
  /* Shown in the hero. Must describe shipped work, not ambition. */
  standing: string;
  notes: Note[];
};

export const fieldNotes: FieldNote[] = [
  {
    slug: "education-platforms",
    n: 1,
    domain: "Education",
    title: "Building for schools",
    value:
      "What a K-12 platform runs into that a generic SaaS never does: procurement gates, the school day, and a network you do not control.",
    standing:
      "Shipped into a live K-12 platform serving 995 schools and 12,495 users.",
    notes: [
      {
        title: "Schools vet the software before they buy it",
        body: "Australian and New Zealand jurisdictions assess school software through Safer Technologies 4 Schools, run by Education Services Australia. The Readiness Check is a free self-assessment; a full assessment is evidence-backed and the program itself advises allowing at least three months. Budget for it before the contract is signed, not after a school asks for the report.",
      },
      {
        title: "Your deploy window is set by the timetable",
        body: "A structural front-end change that invalidates client storage behaves very differently at 3am and at 9:15am. Ship anything that touches caching, sessions or service workers outside class hours, and keep the previous container renamed rather than deleted so the rollback is one command instead of a rebuild.",
      },
      {
        title: "The school network is the constraint, not your server",
        body: "Lessons have to survive a bad connection in a classroom, which makes offline availability a product requirement rather than a nice-to-have. Every course variant a school has licensed gets downloaded for local use.",
        source: { label: "K-12 Education SaaS", href: "/work/education-saas" },
      },
      {
        title: "A repeat visit should cost almost nothing",
        body: "Static bundles were being re-fetched in full on every visit: 3.71 MB per returning user. Correct cache headers took that to 1.8 KB, and the same change removed 283 daily 502s that were coming from an unrelated default virtual host. Neither fix touched application code.",
      },
      {
        title: "One curriculum is really a dozen curricula",
        body: "Each state, board and school variant wants its own topic tree over broadly the same content. Model the variant as a first-class thing early. Retrofitting it into a single hardcoded tree is the expensive version of this lesson.",
        source: { label: "K-12 Education SaaS", href: "/work/education-saas" },
      },
      {
        title: "\"The quiz is broken\" is often \"I got logged out\"",
        body: "When a token expires while several requests are in flight, each one can fire its own refresh. Two refreshes hit the same row, the loser gets a concurrency error and a 500, and the client logs the user out mid-session. From the student's side that looks like the quiz failing. Queue refresh behind a single promise, and read the access logs by timestamp instead of trying to reproduce it.",
      },
      {
        title: "Single sign-on is not one integration",
        body: "A department of education, a Catholic diocese and a bookseller each arrive with their own identity provider and their own quirks in the assertion. Treat each as its own piece of work with its own test account, and expect the reply-URL registration on the customer's side to be the slow part.",
      },
    ],
  },
  {
    slug: "health-products",
    n: 2,
    domain: "Health",
    title: "Building health products",
    value:
      "Consumer health in Australia is governed by the Privacy Act, not HIPAA, and the retention rules argue with the delete button. Plus the performance traps specific to clinical payloads.",
    standing:
      "Shipped and maintained a live health platform reconciling four data sources into one clinical scoring system.",
    notes: [
      {
        title: "The Australian Privacy Act is the instrument, not HIPAA",
        body: "For an Australian consumer health product the Australian Privacy Principles apply: destruction and de-identification, access and correction, cross-border disclosure, and the Notifiable Data Breaches scheme. Health information is a sensitive category with its own consent bar. Writing to a HIPAA checklist means solving the wrong problem carefully.",
      },
      {
        title: "Retention fights the delete button, and retention wins",
        body: "State health records legislation sets multi-year retention on clinical records while a user can ask for their account to be destroyed. The workable shape is a soft delete with a short grace window, hard deletion of the non-clinical record, de-identification of what has to be kept, and a disposal log that records what was destroyed and when. A delete endpoint with no disposal register only looks compliant.",
      },
      {
        title: "Slow usually means payload, not query",
        body: "A four-second page turned out to have a query that ran in 0ms with the right index already in use. The whole delay was moving a 212 KB biomarker array over the wire and decoding it. Projecting the sub-fields the endpoint actually needed took it to 0.47s. Run the explain plan before touching indexes, because it tells you which of the two problems you have.",
        source: { label: "Health Optimisation Platform", href: "/work/health-platform" },
      },
      {
        title: "Reads and writes need separate rate-limit buckets",
        body: "Passive dashboard polling shared one bucket with genuine file uploads, so ordinary navigation could exhaust the budget before a user ever attempted a scan upload. The symptom presents as \"upload is broken\", which sends you to the upload code, which is fine. Split the buckets by intent, not by URL prefix.",
      },
      {
        title: "Every lab and scan report has a different layout",
        body: "Parsing has to survive varying report structures, so no hardcoded line offsets: pattern-driven extraction, a report carrying anywhere from one to ten or more scan dates, and percentile scoring read from the report's own reference gauges rather than from constants baked into your code.",
        source: { label: "Health Optimisation Platform", href: "/work/health-platform" },
      },
      {
        title: "A score nobody can trace is a score nobody trusts",
        body: "Every recommendation has to point back to the marker that triggered it, and every domain score has to decompose into the inputs that produced it. This is a data-model decision made at the start, not a reporting feature added at the end.",
        source: { label: "Health Optimisation Platform", href: "/work/health-platform" },
      },
    ],
  },
  {
    slug: "automation-pipelines",
    n: 3,
    domain: "Automation",
    title: "Running automation in production",
    value:
      "Content and business automation fails quietly rather than loudly. These are the failures that produce no error at all.",
    standing:
      "A self-hosted 30+ node pipeline in production, 600+ delivered assets across 14 client accounts, and ten live transactional email flows.",
    notes: [
      {
        title: "Test runs are not free, and the tool will not tell you",
        body: "Pinned sample data is honoured by the editor's run button and ignored by the command-line runner, which re-executes every node for real. Three test runs believed to be free had each made real paid model calls. Check how your runner treats pinned data before you iterate.",
      },
      {
        title: "A secret that works in a test run may not exist in the scheduled run",
        body: "Passing an environment variable to a one-off test process never puts it in the long-running container. The workflow passes every manual test and then throws on the first real cron or webhook trigger, on the one node that reads the secret. Put it in the persistent environment and recreate the container, because a plain restart reuses the old one.",
      },
      {
        title: "A merge step can silently collapse your branches",
        body: "Combining N inputs by position produces one item, not N, and identical keys across branches overwrite each other with no error. It reads as working right up until someone counts the output. Append and combine are different operations and the wrong one is invisible.",
      },
      {
        title: "Measure the model cost before you scale the run",
        body: "An estimate of 32 vision calls per item measured out at 13.3, which changed the plan for a 300-item run to roughly 4,000 calls and five hours. That is a number worth having before the run, not after the invoice.",
      },
      {
        title: "The most frequent item is rarely the easiest one",
        body: "Ordering a backlog by frequency sounds efficient and picked the hardest cases first: the generic entries with the worst source coverage. Hit rate collapsed. Order by expected success, then check the frequency.",
      },
      {
        title: "Deliverability is the provider's problem until you prove it is not",
        body: "A stalled campaign is more often a provider-side queue than a bug in your integration. Trace the message state at the provider before rewriting your own sending code: on one engagement that traced 9,800 stuck emails to the provider rather than to the platform.",
        source: { label: "Fixing Live Systems", href: "/skills/live-system-rescue" },
      },
      {
        title: "Replacing default transactional email is a mapping exercise",
        body: "Ten flows replaced every default notification, each one mapped to real order and customer data rather than to a template's placeholder fields. The work is in the data mapping and the trigger conditions, not in the design of the email.",
        source: { label: "Made-to-Measure Shopify Platform", href: "/work/made-to-measure-shopify" },
      },
    ],
  },
];

export function fieldNoteBySlug(slug: string) {
  return fieldNotes.find((f) => f.slug === slug);
}

// Which field-note pages each skill card should point at. A skill with no
// entry gets no block rather than a stretched connection.
export const notesForSkill: Record<string, string[]> = {
  "full-stack-product-build": ["education-platforms", "health-products"],
  "ai-features-in-product": ["health-products"],
  "automation-that-runs-itself": ["automation-pipelines"],
  "ai-video-at-scale": ["automation-pipelines"],
  "live-system-rescue": ["education-platforms", "health-products"],
};
