// Pre-generated mascot lines. No runtime AI, picked client-side by what the
// cursor is doing: hovering an element, idling, moving fast, or nearing the orb.
// Voice: a small terminal agent. Dry, witty, <12 words, lowercase-ish.

export const mascotName = "unit";

export const mascotGreetings: string[] = [
  "online. move the cursor, i'm watching.",
  "booted up. hover anything, i'll explain it.",
  "hi. i follow the cursor. not creepy. mostly.",
];

export const mascotIdle: string[] = [
  "still there? poke around.",
  "i don't sleep. perks of being a process.",
  "frozen cursor. take your time, i'll wait.",
  "scroll. hover. click. i react to all of it.",
];

// Cursor moving fast across the screen.
export const mascotFast: string[] = [
  "whoa, easy. i get motion sick.",
  "slow down, i'm trying to read.",
  "speedrunning the portfolio, i see.",
];

// Cursor coming close to the orb.
export const mascotApproach: string[] = [
  "yes? you rang.",
  "up close now, huh. hi.",
  "careful, i bite. kidding. i'm a div.",
];

// Keyed by data-unit attribute on hovered elements.
// `tool:*` and `project:*` fall back to the generic `tool` / `project` pool.
export const mascotElementLines: Record<string, string[]> = {
  "cta:work": ["go on, that's the good stuff."],
  "cta:contact": ["do it. he replies fast.", "this is the say-hi button."],
  "cta:github": ["source's mostly all there."],
  "cta:email": ["yes, that inbox is real."],

  "project:trading-command-center": [
    "two models argue here before any money moves.",
  ],
  "project:amadeus": ["that one thinks it's him. it's close."],
  "project:testengine": ["spins a fresh browser per test. tidy."],
  "project:health-platform": ["reads dexa scans like a tireless intern."],
  project: ["client names hidden, engineering isn't.", "yeah, he shipped this one too."],

  "tool:Mahoraga": ["this hook rewrites its own rules. bold."],
  "tool:Graphify": ["27k nodes from one repo. show-off."],
  "tool:CUA Driver": ["moves a cursor without moving the cursor. wild."],
  tool: ["he built this to build faster. meta.", "small tool, big leverage."],

  native: ["claude drives that phone. boot, build, screenshot, fix."],
  nav: ["jump anywhere. i'll keep up."],
  stack: ["nine stacks. swift on tuesday, .net on wednesday."],
};

// Spoken when visitor dwells in a section (fallback when not hovering anything).
export const mascotLines: Record<string, string[]> = {
  top: [
    "that dashboard on the right? all of it actually runs.",
    "yes, the agents really do the work. i'm proof.",
  ],
  work: [
    "the trading bot makes two models agree before risking money.",
    "amadeus is his digital twin. i'm the friendlier cousin.",
    "click a card for the deep version.",
  ],
  toolkit: [
    "he built tools to build tools. it's tools all the way down.",
    "fleets of agents, review panels, self-correcting loops.",
  ],
  native: [
    "yes, claude really drives the simulator.",
    "react native, maui, swiftui. it ships to all of them.",
  ],
  index: [
    "forty-odd repos. yes, he should sleep more.",
    "half of these run themselves. the rest are getting there.",
  ],
  contact: [
    "this is the part where you say hi.",
    "remote-friendly. his timezone's flexible, mine's always-on.",
  ],
};
