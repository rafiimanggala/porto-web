import type { GlyphName } from "./PipeKitGlyphs";

/* Single source of truth for the content automation scenes. Everything here is invented sample content: no real
   publications, handles, people or brand logos. Scenes import numbers and strings from this file, nothing is
   written twice. */

/* ---------- Run, sheet row, status ladder ---------- */

/** The one sheet row the daily 06:00 run creates (status idea) and carries through to posted, all in the same run (OK_RUN). */
export const ROW_ID = "#0412";
export const STATUS = ["idea", "scripted", "voiced", "rendered", "posted"] as const;
export type Status = (typeof STATUS)[number];
/** A row is picked for publishing once it reaches this status. */
export const READY_STATUS: Status = "rendered";

export const SCHEDULE = { time: "06:00", cadence: "daily", label: "Every day at 06:00" } as const;
export const GRAPH_NODES = 34;
export const TOPIC = "Mental health and wellbeing news";

export const PLATFORMS = ["TikTok", "Instagram"] as const;
export const SHORTS_PLATFORMS = ["TikTok", "Instagram", "YouTube Shorts"] as const;
export type Platform = (typeof SHORTS_PLATFORMS)[number];

/** Seconds the workflow waits before asking a background job for its result. */
export const POLL_SECONDS = 10;

/* ---------- Node catalog: one glyph and one short label per node, so every scene names them the same way ---------- */

export type NodeDef = { readonly glyph: GlyphName; readonly label: string };

export const NODE = {
  schedule: { glyph: "clock", label: "Schedule" },
  feed: { glyph: "rss", label: "RSS" },
  merge: { glyph: "merge", label: "Merge" },
  fresh: { glyph: "filter", label: "New only" },
  pick: { glyph: "code", label: "Pick 1" },
  row: { glyph: "sheet", label: "Sheet" },
  script: { glyph: "ai", label: "Script AI" },
  split: { glyph: "code", label: "Blocks" },
  trends: { glyph: "globe", label: "Trends" },
  keep: { glyph: "filter", label: "Keep 4" },
  join: { glyph: "aggregate", label: "Join" },
  tts: { glyph: "speaker", label: "Voice" },
  whisper: { glyph: "mic", label: "Whisper" },
  lines: { glyph: "edit", label: "Captions" },
  imagine: { glyph: "image", label: "Image" },
  wait: { glyph: "pause", label: "Wait" },
  result: { glyph: "globe", label: "Result" },
  ready: { glyph: "branch", label: "Ready?" },
  render: { glyph: "film", label: "Render" },
  readyRows: { glyph: "filter", label: "Ready" },
  media: { glyph: "upload", label: "Upload" },
  tiktok: { glyph: "vertical-video", label: "TikTok" },
  instagram: { glyph: "vertical-video", label: "Instagram" },
  shorts: { glyph: "vertical-video", label: "Shorts" },
  writeback: { glyph: "edit", label: "Write back" },
  loop: { glyph: "loop", label: "Loop" },
  actor: { glyph: "scraper", label: "Actor" },
  summary: { glyph: "aggregate", label: "Summary" },
  chat: { glyph: "message", label: "Team chat" },
  agent: { glyph: "ai", label: "Agent" },
  vision: { glyph: "eye", label: "Vision" },
  clip: { glyph: "film", label: "Clip" },
} as const satisfies Record<string, NodeDef>;
export type NodeId = keyof typeof NODE;

/* ---------- Sources ---------- */

export const FEEDS = [
  { id: "research", label: "Research news", items: 15, fresh: 3 },
  { id: "psychology", label: "Psychology digest", items: 13, fresh: 2 },
  { id: "clinical", label: "Clinical summaries", items: 10, fresh: 2 },
] as const;
export type FeedId = (typeof FEEDS)[number]["id"];

/** One run scans 38 items, 7 are new since the last run, 1 is picked. */
export const SCAN = { scanned: 38, fresh: 7, picked: 1 } as const;

/** The 7 new items. Exactly one is picked. */
export const NEW_ITEMS = [
  { feed: "research", title: "Morning light and sleep quality: what 12 studies found", age: "2 h", picked: true },
  { feed: "research", title: "Short walks and mood: a small trial reports", age: "5 h", picked: false },
  { feed: "research", title: "How people describe burnout in workplace surveys", age: "9 h", picked: false },
  { feed: "psychology", title: "Why habit streaks tend to break on day nine", age: "3 h", picked: false },
  { feed: "psychology", title: "Journaling prompts people actually keep using", age: "7 h", picked: false },
  { feed: "clinical", title: "Screen time before bed: summary of a cohort study", age: "4 h", picked: false },
  { feed: "clinical", title: "Breathing exercises and stress ratings: a brief review", age: "11 h", picked: false },
] as const satisfies readonly { feed: FeedId; title: string; age: string; picked: boolean }[];

export const ARTICLE = {
  feed: "research",
  title: "Morning light and sleep quality: what 12 studies found",
  link: "example.org/morning-light-sleep",
  age: "2 h",
  summary: [
    "Twelve studies on daylight exposure were pooled in one review.",
    "People who saw bright light in the first hour after waking tended to fall asleep earlier and more easily.",
    "The effects were small and the studies varied, so the authors ask for larger trials.",
  ],
} as const;

/* ---------- Script: 42 s, 108 words, 5 blocks ---------- */

export const SCRIPT = { seconds: 42, words: 108 } as const;

export const BLOCKS = [
  {
    id: "hook",
    label: "Hook",
    start: 0,
    end: 3,
    words: 8,
    line: "Want better sleep tonight? Start with your morning.",
    text: "Want better sleep tonight? Start with your morning.",
  },
  {
    id: "p1",
    label: "Point 1",
    start: 3,
    end: 15,
    words: 30,
    line: "Get daylight within an hour of waking.",
    text: "Step outside within an hour of waking. Daylight tells your body clock the day has started, and that helps set when you feel sleepy tonight. Ten minutes is a start.",
  },
  {
    id: "p2",
    label: "Point 2",
    start: 15,
    end: 27,
    words: 30,
    line: "Keep the same wake time, even on weekends.",
    text: "Keep the same wake time, even on weekends. A steady start makes a steady bedtime, because your body learns when the day begins. Set one alarm and simply keep it.",
  },
  {
    id: "p3",
    label: "Point 3",
    start: 27,
    end: 38,
    words: 30,
    line: "Dim the lights a couple of hours before bed.",
    text: "Dim the lights a couple of hours before bed. Softer light tells your brain that evening has arrived. Swap the ceiling light for a lamp and put the screen down.",
  },
  {
    id: "cta",
    label: "Call to action",
    start: 38,
    end: 42,
    words: 10,
    line: "Follow along for one small habit a day.",
    text: "Follow along for one small wellbeing habit, every single day.",
  },
] as const;
export type BlockId = (typeof BLOCKS)[number]["id"];

/* ---------- Trending tags: 12 fetched, 4 kept ---------- */

export const TAGS = [
  { tag: "#sleeptips", posts: "84k", kept: true },
  { tag: "#morninglight", posts: "31k", kept: true },
  { tag: "#wellbeing", posts: "212k", kept: true },
  { tag: "#habits", posts: "96k", kept: true },
  { tag: "#selfcare", posts: "340k", kept: false },
  { tag: "#mindfulness", posts: "178k", kept: false },
  { tag: "#calm", posts: "52k", kept: false },
  { tag: "#routine", posts: "67k", kept: false },
  { tag: "#stressrelief", posts: "44k", kept: false },
  { tag: "#circadian", posts: "9k", kept: false },
  { tag: "#energy", posts: "120k", kept: false },
  { tag: "#focus", posts: "205k", kept: false },
] as const;

/* ---------- Voiceover and Whisper timestamps ---------- */

export const VOICE = { engine: "Text to speech", seconds: 41, label: "0:41", transcriber: "Whisper" } as const;

/** Whisper returns word-level start and end in seconds. First 24 words, the first 9 s. `line` is the caption line. */
export const WORDS = [
  { w: "Want", start: 0.12, end: 0.36, line: 0 },
  { w: "better", start: 0.36, end: 0.7, line: 0 },
  { w: "sleep", start: 0.7, end: 1.08, line: 0 },
  { w: "tonight?", start: 1.14, end: 1.66, line: 1 },
  { w: "Start", start: 1.74, end: 2.02, line: 1 },
  { w: "with", start: 2.02, end: 2.22, line: 1 },
  { w: "your", start: 2.22, end: 2.42, line: 2 },
  { w: "morning.", start: 2.42, end: 2.94, line: 2 },
  { w: "Step", start: 3.2, end: 3.48, line: 3 },
  { w: "outside", start: 3.48, end: 3.96, line: 3 },
  { w: "within", start: 3.96, end: 4.32, line: 3 },
  { w: "an", start: 4.38, end: 4.5, line: 4 },
  { w: "hour", start: 4.5, end: 4.86, line: 4 },
  { w: "of", start: 4.86, end: 5.0, line: 4 },
  { w: "waking.", start: 5.0, end: 5.58, line: 5 },
  { w: "Daylight", start: 5.82, end: 6.3, line: 5 },
  { w: "tells", start: 6.36, end: 6.64, line: 6 },
  { w: "your", start: 6.64, end: 6.82, line: 6 },
  { w: "body", start: 6.82, end: 7.16, line: 6 },
  { w: "clock", start: 7.16, end: 7.56, line: 7 },
  { w: "the", start: 7.66, end: 7.76, line: 7 },
  { w: "day", start: 7.76, end: 8.02, line: 7 },
  { w: "has", start: 8.1, end: 8.3, line: 8 },
  { w: "started,", start: 8.3, end: 8.86, line: 8 },
] as const;
export type Word = (typeof WORDS)[number];

export type CaptionLine = { readonly text: string; readonly start: number; readonly end: number; readonly from: number; readonly count: number };

/** Captions grouped into lines of 2 to 3 words, derived from WORDS. */
export const CAPTION_LINES: readonly CaptionLine[] = Array.from({ length: WORDS[WORDS.length - 1].line + 1 }, (_, line) => {
  const words = WORDS.filter((w) => w.line === line);
  return {
    text: words.map((w) => w.w).join(" "),
    start: words[0].start,
    end: words[words.length - 1].end,
    from: WORDS.indexOf(words[0]),
    count: words.length,
  };
});

/* ---------- Visuals: one image job per block, then the render job ---------- */

/** Each job: a job id, what the abstract illustration shows, and how many "not ready" answers come before the result. */
export const IMAGE_JOBS = [
  { id: "7f3a", block: "hook", subject: "sunrise over an empty bed", polls: 1 },
  { id: "c21e", block: "p1", subject: "window with a beam of daylight", polls: 2 },
  { id: "9b04", block: "p2", subject: "alarm clock at the same hour", polls: 1 },
  { id: "e5d8", block: "p3", subject: "bedside lamp and a crescent moon", polls: 2 },
  { id: "3a6c", block: "cta", subject: "a plus button and a heart", polls: 1 },
] as const satisfies readonly { id: string; block: BlockId; subject: string; polls: number }[];

export const jobLabel = (id: string) => `job ${id}`;

/** The finished video is 0:42 (`seconds`, `label`). The voiceover under it is VOICE, 0:41, so its lane ends 1 s before the video axis.
    `file` is the one name the finished video has everywhere. `jobId` is the render job, shown only as a job id, never as the file name. */
export const RENDER = {
  width: 1080,
  height: 1920,
  fps: 30,
  seconds: 42,
  label: "0:42",
  ratio: "9:16",
  jobId: "b81d",
  polls: 3,
  file: `reel_${ROW_ID.slice(1)}.mp4`,
} as const;

/* ---------- Sheet, publish ---------- */

/** The long-form sheet as the Publish scene reads it: five posted rows, then today's row #0412, rendered. No id is later than ROW_ID. */
export const SHEET_ROWS = [
  { id: "#0407", topic: "Hydration and energy", status: "posted" },
  { id: "#0408", topic: "Gratitude journaling", status: "posted" },
  { id: "#0409", topic: "Walking and focus", status: "posted" },
  { id: "#0410", topic: "Caffeine timing", status: "posted" },
  { id: "#0411", topic: "Evening screen habits", status: "posted" },
  { id: "#0412", topic: "Morning light and sleep", status: "rendered" },
] as const satisfies readonly { id: string; topic: string; status: Status }[];

/** Today's row (ROW_ID) and the row just above it. Sources shows this pair. The `satisfies` keeps the index honest. */
export const RUN_ROW = SHEET_ROWS[5] satisfies { id: typeof ROW_ID };
export const PREV_ROW = SHEET_ROWS[4];

/** Counts read off the sheet itself. The Publish header reads "1 of 6 rows rendered, 5 skipped" from these, not from SCAN.picked. */
export const SHEET_TOTAL = SHEET_ROWS.length;
export const SHEET_RENDERED = SHEET_ROWS.filter((r) => r.status === READY_STATUS).length;
export const SHEET_SKIPPED = SHEET_TOTAL - SHEET_RENDERED;

/** What the publish step writes back to the row. */
export const WRITEBACK = { status: "posted", tiktokId: "tt-88213", instagramId: "ig-40417", at: "06:14" } as const;

/* ---------- Isolation: the scraping workflow and its failed run ---------- */

export const ACCOUNTS = [
  "account_01", "account_02", "account_03", "account_04", "account_05", "account_06",
  "account_07", "account_08", "account_09", "account_10", "account_11", "account_12",
  "account_13", "account_14", "account_15", "account_16", "account_17", "account_18",
] as const;

export const SCRAPER = {
  name: "Metrics scraper",
  tracked: 18,
  sheets: ["Metrics", "Historic"],
  columns: ["account", "followers", "posts", "views"],
  summary: "Scraped 18 of 18 accounts, 18 updated, 18 rows added to history",
} as const;

export const METRIC_SAMPLE = [
  { account: "account_01", followers: "12.4k", posts: 84, views: "230k" },
  { account: "account_02", followers: "8.1k", posts: 41, views: "96k" },
  { account: "account_03", followers: "27.9k", posts: 133, views: "610k" },
  { account: "account_04", followers: "3.6k", posts: 22, views: "18k" },
] as const;

export const FAILED_RUN = {
  number: 4812,
  label: "#4,812",
  at: "03:04",
  workflow: "Metrics scraper",
  node: "Run an Actor",
  item: 7,
  timeoutSeconds: 300,
  error: "The operation timed out after 300 s",
  detail: "Actor run still RUNNING, no result before the limit",
  input: [
    { k: "handle", v: "account_07" },
    { k: "resultsLimit", v: "30" },
    { k: "timeoutSecs", v: "300" },
  ],
} as const;

/** The execution log of the failed run, node by node. */
export const EXEC_LOG = [
  { node: "Schedule", state: "ok", note: "03:04" },
  { node: "Read accounts", state: "ok", note: "18 items" },
  { node: "Loop", state: "ok", note: "item 7 of 18" },
  { node: "Run an Actor", state: "error", note: "300 s" },
  { node: "Append metrics", state: "skipped", note: "" },
  { node: "Append historic", state: "skipped", note: "" },
  { node: "Team chat", state: "skipped", note: "" },
] as const;

/** The daily 06:00 run. One run does it all: it creates row ROW_ID (status idea), carries it through and posts it (`row`). */
export const OK_RUN = { number: 4819, label: "#4,819", at: "06:00", workflow: "Publish pipeline", status: "success", row: ROW_ID } as const;

/* ---------- Shorts variant ---------- */

/** The Shorts variant has its own sheet and its own ids. It never shows ROW_ID or the long-form scan text. `memory` is what the agent
    reads to avoid repeats: three posted rows S-028 to S-030, then the new row `rowId`. No topic here is an exact repeat of `topic`. */
export const SHORTS = {
  topic: "5 small habits for calmer evenings",
  rowId: "S-031",
  memory: [
    { id: "S-028", topic: "3 ways to wind down", status: "posted" },
    { id: "S-029", topic: "4 tiny morning habits", status: "posted" },
    { id: "S-030", topic: "Sleep myths, explained", status: "posted" },
  ],
  agent: { model: "Chat model", memory: "Memory sheet", tool: "Append row" },
  clipSeconds: 5,
  /** Slide title, and what the vision step reads back from the image. */
  slides: [
    { title: "Dim the lights", read: "lamp, low warm light" },
    { title: "Screens off", read: "phone face down on a table" },
    { title: "Warm drink", read: "mug with rising steam" },
    { title: "Write it down", read: "notebook and pen" },
    { title: "Same bedtime", read: "alarm clock set to 22:30" },
  ],
} as const;

/* ---------- Formatting helpers ---------- */

/** 41 becomes "0:41". */
export const fmtClock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** 4812 becomes "4,812", the same on server and client. */
export const fmtInt = (n: number) => n.toLocaleString("en-US");

/** Number of transcript words that have started by time t (seconds). */
export const wordsStartedAt = (t: number) => WORDS.filter((w) => w.start <= t).length;

/** Index of the caption line being spoken at time t, or -1 before the first word. */
export const lineIndexAt = (t: number) => CAPTION_LINES.reduce((hit, l, i) => (t >= l.start ? i : hit), -1);
