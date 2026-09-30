// The pixel home's content, shared by the server-rendered text (Agent HQ
// legend and fallback list, the journey months, the lab scenes) and by the
// canvas modules, which read it as window.PETA.data (see install.ts).
// Every agent, month and date is real and traced to Rafii's logs, repos or
// this site; client work is anonymised. Statuses as checked 30 Sep 2026.

export type StatusKey = "live" | "call" | "proto" | "paused";
export type Status = { label: string; note: string };
export type Floor = { id: string; name: string; note: string; wall: string; wall2: string };
export type Agent = {
  id: string;
  floor: string;
  name: string;
  plate?: string;
  status: StatusKey;
  kind: "Personal" | "Client";
  does: string;
  runs: string;
  stack: string[];
  since: string;
  link?: { label: string; href: string };
  verbs: string[];
  look: { body: string; shade: string; prop: string };
};
/** [ISO date, short label, what happened] */
export type MonthItem = [string, string, string];
export type Month = { id: string; short: string; label: string; title: string; items: MonthItem[]; unlocks: string[] };
export type Piece = { id: string; name: string; place: string; w: number; h: number; start: number; still: number; detail: string };

const GH = "https://github.com/rafiimanggala/";

export const STATUS: Record<StatusKey, Status> = {
  live: { label: "Running", note: "Working right now" },
  call: { label: "On call", note: "Waits until someone calls it" },
  proto: { label: "In progress", note: "Built, not deployed yet" },
  paused: { label: "Paused", note: "Asleep until I need it again" },
};

// Floors from the roof down. The ground floor is where the agents are made.
export const FLOORS: Floor[] = [
  { id: "trading", name: "Trading floor", note: "Signals and paper trades", wall: "#1f3350", wall2: "#2a4466" },
  { id: "studio", name: "Studio", note: "Video, vision and documents", wall: "#4a2f45", wall2: "#5d3b56" },
  { id: "mail", name: "Mail room", note: "Messages in, messages out", wall: "#6b5436", wall2: "#806645" },
  { id: "client", name: "Client desk", note: "Client work and demos", wall: "#2f4f4a", wall2: "#3c625b" },
  { id: "control", name: "Control room", note: "Where the agents are made", wall: "#1c3a2f", wall2: "#2c5645" },
];

// look.body / look.shade colour the robot, look.prop picks the room's props.
// plate: the part of the name printed on the room's door plate when the full
// name is too long for a narrow room; it is always a piece of the name, so
// the accessible name still contains the visible label.
export const AGENTS: Agent[] = [
  { id: "tcc", floor: "trading", name: "Trading Command Center", plate: "Command Center", status: "call", kind: "Personal",
    does: "Runs 12 paper-trading bots in one dashboard. Claude and Groq both have to agree before any trade; when they disagree, the bot holds.",
    runs: "When I start it, with paper money only",
    stack: ["FastAPI", "PostgreSQL", "Claude", "Groq", "Docker"], since: "Mar 2026",
    link: { label: "Code on GitHub", href: GH + "trading-command-center" },
    verbs: ["Polling the 12 bots", "Holding a consensus vote", "Checking the market regime"],
    look: { body: "#6aa84f", shade: "#37692d", prop: "tickers" } },
  { id: "market", floor: "trading", name: "Market Intelligence Agent", plate: "Market Intelligence", status: "proto", kind: "Personal",
    does: "Tracks big-fund filings, insider buying and factor scores, ranks the signals and writes a briefing. The build is done; it is not deployed yet.",
    runs: "On a schedule, once it is deployed",
    stack: ["FastAPI", "Anthropic SDK", "PostgreSQL", "SEC EDGAR"], since: "May 2026",
    link: { label: "Code on GitHub", href: GH + "market-intelligence-agent" },
    verbs: ["Reading a fund filing", "Ranking today's signals", "Drafting the briefing"],
    look: { body: "#ffe375", shade: "#e0b43a", prop: "filings" } },
  { id: "xmon", floor: "trading", name: "XMON", status: "live", kind: "Personal",
    does: "Polls a list of X accounts, has Claude label each post by market direction, then forward-tests those calls against paper returns.",
    runs: "Always on, through launchd on my Mac",
    stack: ["Node", "Apify", "Claude Haiku", "Hyperliquid API"], since: "Sep 2026",
    verbs: ["Polling tracked accounts", "Labelling a post's direction", "Recording the forward test"],
    look: { body: "#5e645d", shade: "#3b3f3a", prop: "feed" } },

  { id: "content", floor: "studio", name: "Content Automation Pipeline", plate: "Content Automation", status: "live", kind: "Personal",
    does: "Turns RSS news into short videos: an LLM rewrites the script, Whisper voices it, a renderer builds the clip and it posts to TikTok and Instagram.",
    runs: "On a schedule, in my self-hosted n8n",
    stack: ["n8n", "OpenAI", "Whisper", "Creatomate"], since: "Mar 2026",
    link: { label: "Read the case study", href: "/work/content-automation-pipeline" },
    verbs: ["Rewriting a news script", "Recording the voiceover", "Publishing the clip"],
    look: { body: "#ffa9a9", shade: "#d9776f", prop: "film" } },
  { id: "camera", floor: "studio", name: "Camera AI demo", plate: "Camera AI", status: "call", kind: "Personal",
    does: "Recognises me on camera, captions the live feed, transcribes what I say and hands spoken requests to an app-building agent.",
    runs: "When I open it, on my Mac",
    stack: ["Python", "Claude", "mlx-whisper", "MediaPipe"], since: "Sep 2026",
    verbs: ["Finding a face", "Captioning the feed", "Passing on a request"],
    look: { body: "#a6e8fa", shade: "#4a9fc0", prop: "camera" } },
  { id: "tailor", floor: "studio", name: "Resume tailor", status: "proto", kind: "Personal",
    does: "Picks and orders resume bullets for a job description. A code gate blocks anything that is not in my real facts, and the whole engine is served over MCP.",
    runs: "When an agent calls it over MCP",
    stack: ["Python", "Claude", "MCP SDK"], since: "Sep 2026",
    verbs: ["Reading the job post", "Matching real bullets", "Checking every fact"],
    look: { body: "#d6bc80", shade: "#a88a4f", prop: "sewing" } },
  { id: "rag", floor: "studio", name: "Thesis RAG chatbot", plate: "Thesis RAG", status: "live", kind: "Personal",
    does: "Answers questions from a university's thesis guidelines, and screens every new document for poisoned or conflicting content before it enters the index.",
    runs: "Always on, on a server",
    stack: ["n8n", "Qdrant", "FastAPI", "LangChain"], since: "Jun 2026",
    verbs: ["Finding the right passage", "Screening a new document", "Writing a grounded answer"],
    look: { body: "#9cf0cb", shade: "#4fb88f", prop: "books" } },

  { id: "email", floor: "mail", name: "Email Reactor", status: "live", kind: "Personal",
    does: "Sorts my inbox and sends a daily digest. Its client mode opens the right project, tries a fix on a branch and drafts a reply for me to check; that mode is paused for now.",
    runs: "Every hour, through launchd",
    stack: ["Python", "Claude", "Gmail API", "launchd"], since: "May 2026",
    verbs: ["Sorting today's inbox", "Writing the daily digest", "Drafting a reply to check"],
    look: { body: "#a6e8fa", shade: "#2b6f8f", prop: "mail" } },
  { id: "claudeclaw", floor: "mail", name: "ClaudeClaw", status: "paused", kind: "Personal",
    does: "A Telegram bot that answers each message by starting a fresh Claude Code session with the chat history. My first agent outside the terminal.",
    runs: "When I message it on Telegram",
    stack: ["Node", "Claude Code", "Telegram", "Groq"], since: "Feb 2026",
    verbs: ["Reading a Telegram message", "Starting a fresh session", "Typing the reply"],
    look: { body: "#d9543f", shade: "#8a2f22", prop: "planes" } },
  { id: "threads", floor: "mail", name: "Threads MCP", status: "live", kind: "Personal",
    does: "Gives agents Threads as tools: read the feed, draft a post, publish it. Every write stays a dry run until I confirm it.",
    runs: "When an agent calls it over MCP",
    stack: ["Node", "MCP SDK", "Threads API"], since: "Sep 2026",
    verbs: ["Fetching the feed", "Preparing a post", "Waiting for my OK"],
    look: { body: "#ffa9a9", shade: "#b0654a", prop: "spools" } },
  { id: "autoposter", floor: "mail", name: "LinkedIn AutoPoster", plate: "AutoPoster", status: "paused", kind: "Personal",
    does: "Drafted and published a LinkedIn post twice a day. A one-week build from the end of February that I have since paused.",
    runs: "Twice a day, on a schedule",
    stack: ["FastAPI", "Claude", "APScheduler", "Playwright"], since: "Feb 2026",
    verbs: ["Drafting today's post", "Waiting for the posting window", "Publishing to the feed"],
    look: { body: "#4a9fc0", shade: "#2b6f8f", prop: "clock" } },

  { id: "lifelog", floor: "client", name: "Founder's life log", status: "live", kind: "Client",
    does: "For a founder: transcribes voice notes, files each one under a part of life, and syncs wearable data every six hours.",
    runs: "Always on, on a server, through Telegram",
    stack: ["Node", "Telegraf", "Claude", "Groq Whisper", "SQLite"], since: "Apr 2026",
    verbs: ["Transcribing a voice note", "Filing it under a category", "Syncing wearable data"],
    look: { body: "#9cf0cb", shade: "#37692d", prop: "voice" } },
  { id: "sales", floor: "client", name: "B2B sales agents", status: "paused", kind: "Client",
    does: "For a US client: agents that find leads, score them, draft outreach and brief the team before meetings. A demo I delivered in March.",
    runs: "Daily, on a server",
    stack: ["Agent SDK", "Express", "PostgreSQL", "Apify", "Gmail API"], since: "Mar 2026",
    verbs: ["Finding new leads", "Scoring the pipeline", "Drafting an outreach note"],
    look: { body: "#e8743a", shade: "#8e3510", prop: "funnel" } },
  { id: "support", floor: "client", name: "Support agent demo", plate: "Support agent", status: "call", kind: "Personal",
    does: "Reads a customer email, looks up the order with a tool call and drafts the reply, showing each step as it happens. Built to show clients.",
    runs: "When someone sends it an email in the demo",
    stack: ["Next.js", "Claude Code", "systemd", "Caddy"], since: "Jul 2026",
    verbs: ["Reading the customer email", "Looking up the order", "Drafting the reply"],
    look: { body: "#f3f1e6", shade: "#b7bfb2", prop: "bell" } },

  { id: "claude", floor: "control", name: "Claude Code", status: "live", kind: "Personal",
    does: "My main agent and the engine behind every room: a written SOP, long-term memory, a daily log, custom skills and teams of subagents that split big jobs.",
    runs: "Most days, on my Mac Mini",
    stack: ["Claude Code", "Skills", "Subagents", "Hooks", "Markdown memory"], since: "Feb 2026",
    verbs: ["Reading yesterday's log", "Splitting a job across subagents", "Writing today's log"],
    look: { body: "#c94e12", shade: "#8e3510", prop: "desk" } },
  { id: "mahoraga", floor: "control", name: "Mahoraga", status: "live", kind: "Personal",
    does: "Reviews every finished session, turns real mistakes into rules, and loads the locked rules into the next session so the same mistake does not happen twice.",
    runs: "At the start and end of every session, through hooks",
    stack: ["Bash hooks", "Claude headless", "jq"], since: "Apr 2026",
    verbs: ["Reviewing the last session", "Locking a new rule", "Loading rules for the next prompt"],
    look: { body: "#e6e0cf", shade: "#9a917f", prop: "wheel" } },
  { id: "pcmon", floor: "control", name: "PC Monitor", status: "live", kind: "Personal",
    does: "Watches my Mac's disk and memory, clears space before it runs out and takes remote commands over Telegram when I am away from the desk.",
    runs: "Always on, through launchd",
    stack: ["Python", "Bash", "launchd", "Telegram Bot API"], since: "May 2026",
    verbs: ["Checking disk and memory", "Clearing old caches", "Answering a remote command"],
    look: { body: "#8d968a", shade: "#5e645d", prop: "gauges" } },
  { id: "amadeus", floor: "control", name: "Amadeus", status: "paused", kind: "Personal",
    does: "A digital twin that watched what I worked on, woke on a two-hour pulse and reasoned in my voice over Telegram. Paused since June.",
    runs: "Every two hours in waking hours, through launchd",
    stack: ["Python", "SQLite FTS5", "Claude headless", "Telegram"], since: "May 2026",
    verbs: ["Sensing recent activity", "Deciding whether to wake", "Sending a short brief"],
    look: { body: "#b89be0", shade: "#7a5fa8", prop: "mirror" } },
];

// Unlock icons are drawn in journey.js; names here are what the reader sees.
export const UNLOCKS: Record<string, string> = {
  openclaw: "OpenClaw", multi: "Multi-agent", memory: "Memory", telegram: "Telegram bots",
  swarm: "Agent swarms", mcp: "MCP", vps: "Headless on a VPS", sdk: "Agent SDK",
  adapt: "Self-adaptation", parallel: "Parallel builds", hooks: "Hooks",
  skills: "Skills", twin: "Digital twin", loop: "Closed loop",
  rag: "RAG", companion: "Always-on companion", person: "Person model",
  autonomy: "Long autonomous runs", tools: "Tool use", oss: "Open source",
  fleet: "Agent fleets", browser: "Browser agents", cost: "Cost tracking",
  signals: "Signal agents", own: "An agent of my own", server: "MCP servers",
};

export const MONTHS: Month[] = [
  { id: "feb", short: "FEB", label: "February 2026", title: "The night I met OpenClaw",
    items: [
      ["2026-02-21", "21 Feb", "At 01:50 I was trying OpenClaw, an open-source personal AI agent, and hit my first error with it."],
      ["2026-02-21", "21 Feb", "Ran three Claude agents at once: one wrote files, one changed them, one checked the other two."],
      ["2026-02-23", "23 Feb", "Picked Claude Code as my own agent and gave it OpenClaw's kind of memory: an SOP, long-term notes and a daily log."],
      ["2026-02-26", "26 Feb", "Put an agent inside a Telegram bot, with a task queue and memory. It became ClaudeClaw."],
    ], unlocks: ["openclaw", "multi", "memory", "telegram"] },
  { id: "mar", short: "MAR", label: "March 2026", title: "Agents leave my laptop",
    items: [
      ["2026-03-02", "2 Mar", "First client ship: a health platform, deployed and security-audited by a swarm of agents."],
      ["2026-03-07", "7 Mar", "First MCP tools: Playwright over MCP, so an agent can click through the UI it just built."],
      ["2026-03-15", "15 Mar", "Claude Code running headless on a VPS, signing people in with OAuth."],
      ["2026-03-17", "17 Mar", "A sales-agent demo on the Claude Agent SDK, wired to Gmail, Calendar, Notion and n8n."],
    ], unlocks: ["swarm", "mcp", "vps", "sdk"] },
  { id: "apr", short: "APR", label: "April 2026", title: "Agents that learn from mistakes",
    items: [
      ["2026-04-11", "11 Apr", "Designed Mahoraga: hooks catch my agent's mistakes and promote them into permanent rules."],
      ["2026-04-15", "15 Apr", "One build day, one 95-file mobile app for a client, written by seven agents in parallel."],
      ["2026-04-18", "18 Apr", "My first hook in daily use: it loads the right memory by keyword in about 230 ms."],
    ], unlocks: ["adapt", "parallel", "hooks"] },
  { id: "may", short: "MAY", label: "May 2026", title: "Skills, and a twin",
    items: [
      ["2026-05-08", "8 May", "Four skills in one day, Seismic Sense, Auto-QA, Writing DNA and Code Janitor, published on GitHub."],
      ["2026-05-19", "19 May", "Took the Hermes agent framework apart, six subsystems, and held each one up against my setup."],
      ["2026-05-31", "31 May", "Started Amadeus, a digital twin that reasons from my own past decisions."],
      ["2026-05-31", "31 May", "Mahoraga closed the loop: an LLM now reviews each session and locks the lessons."],
    ], unlocks: ["skills", "twin", "loop"] },
  { id: "jun", short: "JUN", label: "June 2026", title: "The twin goes live",
    items: [
      ["2026-06-02", "2 Jun", "Amadeus went live: three scheduled collectors feeding a model of how I think, reached through Telegram."],
      ["2026-06-10", "10 Jun", "For my thesis, a RAG pipeline whose custom n8n node stops conflicting documents before they reach the index."],
      ["2026-06-22", "22 Jun", "An always-on Claude companion squeezed onto a 1 GB VPS."],
    ], unlocks: ["person", "rag", "companion"] },
  { id: "jul", short: "JUL", label: "July 2026", title: "Long runs and live demos",
    items: [
      ["2026-07-02", "2 Jul", "My first multi-hour autonomous loop: an agent that paced its own work over dozens of rounds."],
      ["2026-07-18", "18 Jul", "A public support agent with real tool calls, live on a VPS."],
      ["2026-07-23", "23 Jul", "ClipCraft, an open-source app built mostly by agents: 306 commits."],
    ], unlocks: ["autonomy", "tools", "oss"] },
  { id: "aug", short: "AUG", label: "August 2026", title: "Back to OpenClaw, from the other side",
    items: [
      ["2026-08-19", "19 Aug", "Scoped a job looking after a client's fleet of OpenClaw agents, the tool I started with in February."],
      ["2026-08-21", "21 Aug", "Browser agents that work inside my own logged-in Chrome."],
      ["2026-08-23", "23 Aug", "A game prototype built by isolated worker agents running in parallel."],
      ["2026-08-31", "31 Aug", "Skill Watcher: measures what each skill costs in tokens with live A/B runs."],
    ], unlocks: ["fleet", "browser", "cost"] },
  { id: "sep", short: "SEP", label: "September 2026", title: "Agents of my own",
    items: [
      ["2026-09-03", "3 Sep", "XMON, a signal agent that labels posts from X by market direction and forward-tests the calls."],
      ["2026-09-18", "18 Sep", "Rasi, an agent that starts from a blank page and thinks for itself. I only build its infrastructure."],
      ["2026-09-20", "20 Sep", "A Threads connector, as a command-line tool and as an MCP server."],
      ["2026-09-24", "24 Sep", "A resume-tailoring engine with its own MCP server and a code gate against made-up facts."],
    ], unlocks: ["signals", "own", "server"] },
];


// The four live scenes from the pixel gallery (bundled in pieces/*.js).
export const PIECES: Piece[] = [
  { id: "raja", name: "Siang di Raja Ampat", place: "Raja Ampat", w: 480, h: 270, start: 1168, still: 1171,
    detail: "Noon in a lagoon, seen from the waterline. Every 90 seconds the water darkens and a 15 metre mosasaur rises past you." },
  { id: "kahyangan", name: "Senja di Kahyangan", place: "Kahyangan", w: 480, h: 270, start: 3, still: 23.2,
    detail: "A Balinese temple on floating islands just after sunset. A green dragon swims in from the distance every 60 seconds." },
  { id: "neon", name: "Hujan Neon", place: "Hujan Neon", w: 480, h: 270, start: 46, still: 50,
    detail: "A cyberpunk street in the rain: neon signs that fail letter by letter, a maglev every 24 seconds, 770 raindrops." },
  { id: "jakarta", name: "Jakarta 02.00", place: "Jakarta", w: 320, h: 180, start: 4.6, still: 6,
    detail: "Jakarta at two in the morning, from the canal: an MRT every 24 seconds and a meteor every 17." },
];

export const PROFILE = {
  email: "rafiimanggala3@gmail.com",
  github: "https://github.com/rafiimanggala",
  linkedin: "https://www.linkedin.com/in/rafii-japamel-360571276/",
  skillMap: "https://claude.ai/artifact/AFACw5vZfX4iKu3jtqFNDv",
};


export const DATA = { STATUS, FLOORS, AGENTS, UNLOCKS, MONTHS, PIECES, PROFILE };
