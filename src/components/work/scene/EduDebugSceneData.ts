/* Scene content and timeline. Illustrative numbers: 9,800 mails at 490 / hr is 20 h. */

export const CAPTIONS = [
  {
    eyebrow: "01 / Symptom",
    title: "9,800 emails, stuck.",
    body: "A backlog builds while the sending job keeps reporting success.",
  },
  {
    eyebrow: "02 / Rule out",
    title: "Same bytes as tested.",
    body: "Decompiling the shipped DLLs shows the build matches what passed testing.",
  },
  {
    eyebrow: "03 / Trace",
    title: "Not the code. The provider.",
    body: "The SMTP provider was silently rate limiting, so sends queued with no error.",
  },
  {
    eyebrow: "04 / Resolve",
    title: "The queue drains at its pace.",
    body: "The sending code was never at fault, and the backlog clears at the provider limit.",
  },
] as const;

export const CHAPTERS = [0, 0.24, 0.5, 0.76, 1] as const;

/* Page changes of the stage, each centred on a chapter boundary. */
export const WIPES = [
  [0.21, 0.27],
  [0.47, 0.53],
  [0.73, 0.79],
] as const;

export const QUEUE_TOTAL = 9800;
export const LIMIT_PER_HOUR = 490;
export const ETA_HOURS = QUEUE_TOTAL / LIMIT_PER_HOUR;
export const OLDEST_HOURS = 12;

/* Queue tank: 7 x 10 envelope tokens, 140 mails each. */
export const TOKEN_COLS = 7;
export const TOKEN_ROWS = 10;
export const TOKENS = TOKEN_COLS * TOKEN_ROWS;
export const PER_TOKEN = QUEUE_TOTAL / TOKENS;
export const FILL = { start: 0.004, drop: 0.014, step: 0.0026 } as const;
export const DRAIN = [0.79, 0.92] as const;
export const CODE_STAMP = [0.92, 0.945] as const;

/* Fill and drain page annotations. */
export const FLAT_NOTE = [0.03, 0.06] as const;
export const THROAT_POP = [0.775, 0.805] as const;
export const THROAT_FADE = [0.775, 0.795] as const;
export const THROAT_SQUEEZE = [0.79, 0.81] as const;
export const LIMIT_LINE = [0.8, 0.86] as const;
export const LIMIT_NOTE = [0.83, 0.87] as const;
export const OK_TAG_AT = { app: 0.588, job: 0.61 } as const;
export const SMTP_LED_AT = { stall: 0.66, open: 0.79 } as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Tokens in the tank so far, continuous; a token counts from the middle of its drop. */
export const tokensAt = (v: number) => clamp((v - FILL.start - FILL.drop / 2) / FILL.step + 1, 0, TOKENS);
export const drainAt = (v: number) => clamp((v - DRAIN[0]) / (DRAIN[1] - DRAIN[0]), 0, 1);
export const levelAt = (v: number) => (tokensAt(v) / TOKENS) * (1 - drainAt(v));

/* Level line height in token rows; it snaps to a row top so it never strikes a token. */
const SNAP_SHARE = 0.3;
export function levelRowsAt(v: number) {
  const d = drainAt(v);
  if (d > 0) return TOKEN_ROWS * (1 - d);
  const rows = tokensAt(v) / TOKEN_COLS;
  if (rows >= TOKEN_ROWS) return TOKEN_ROWS;
  const whole = Math.floor(rows);
  const rise = clamp((rows - whole) / SNAP_SHARE, 0, 1);
  return whole + (rows > 0 ? 1 - Math.pow(1 - rise, 3) : 0);
}
export const queuedAt = (v: number) => QUEUE_TOTAL * levelAt(v);
export const oldestAt = (v: number) => OLDEST_HOURS * (tokensAt(v) / TOKENS);
export const etaAt = (v: number) => ETA_HOURS * (1 - drainAt(v));

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
export const fmtTidy = (n: number) => fmt(Math.round(n / 10) * 10);

/* Byte compare page. */
export const BYTE_ROWS = [
  { off: "0000", bytes: ["4D", "5A", "90", "00", "03", "00"] },
  { off: "0010", bytes: ["B8", "00", "00", "00", "40", "00"] },
  { off: "0020", bytes: ["0E", "1F", "BA", "0E", "00", "B4"] },
  { off: "0030", bytes: ["50", "45", "00", "00", "4C", "01"] },
  { off: "0040", bytes: ["5F", "43", "6F", "72", "44", "6C"] },
  { off: "0050", bytes: ["6C", "4D", "61", "69", "6E", "00"] },
  { off: "0060", bytes: ["2A", "00", "00", "1B", "30", "03"] },
  { off: "0070", bytes: ["7E", "0C", "00", "00", "01", "00"] },
] as const;
export const ROWS = BYTE_ROWS.length;
export const DLL_COUNT = 3;
export const HASH = "9f3c…a71b";

export const BYTES_TL = {
  decode: { start: 0.272, step: 0.0072, dur: 0.008 },
  scan: { start: 0.338, step: 0.0115, dur: 0.01 },
  hash: [0.418, 0.438],
  stamp: [0.428, 0.456],
} as const;

/** Time at which compare row i is fully matched. */
export const matchedAt = (i: number) => BYTES_TL.scan.start + i * BYTES_TL.scan.step + BYTES_TL.scan.dur;

/* Pipeline page. */
export const PIPE_TL = {
  emit: { start: 0.485, step: 0.01, travel: 0.05 },
  packets: 24,
  drip: { start: 0.56, per: 0.045 },
  trace: { app: [0.575, 0.595], job: [0.595, 0.615], smtp: [0.615, 0.632] },
  doors: [0.632, 0.672],
  pulse: [0.645, 0.7],
  callout: [0.662, 0.69],
  squeeze: [0.655, 0.72],
} as const;

/* Console: the log keeps printing across every chapter. */
export type Tone = "mute" | "fg" | "ok" | "warn" | "acc";
export type LogLine = { t: number; parts: readonly (readonly [string, Tone])[] };

const CH1_LINES = 12;
const CH1_START = 0.004;
const CH1_STEP = 0.0178;

const ch1: LogLine[] = Array.from({ length: CH1_LINES }, (_, i) => {
  const t = CH1_START + i * CH1_STEP;
  const clock = `${String(6 + i).padStart(2, "0")}:00`;
  return {
    t,
    parts: [
      [clock, "mute"],
      [" sendBatch ", "fg"],
      ["OK", "ok"],
      [` sent ${LIMIT_PER_HOUR} queue ${fmtTidy(queuedAt(t))}`, "fg"],
    ],
  };
});

const matchLine = (n: number): LogLine => ({
  t: matchedAt(n - 1) - 0.002,
  parts: [
    ["diff ", "mute"],
    [` rows ${n}/${ROWS} `, "fg"],
    ["equal", "ok"],
  ],
});

const ch2: LogLine[] = [
  { t: 0.278, parts: [["load      ", "mute"], [`qa   ${DLL_COUNT} dll `, "fg"], ["OK", "ok"]] },
  { t: 0.325, parts: [["decompile ", "mute"], [`prod ${DLL_COUNT} dll `, "fg"], ["OK", "ok"]] },
  matchLine(2),
  matchLine(4),
  matchLine(6),
  matchLine(8),
  { t: 0.44, parts: [["sha256 ", "mute"], [`${HASH} both `, "fg"], ["equal", "ok"]] },
  { t: 0.459, parts: [["verdict ", "mute"], ["IDENTICAL", "acc"]] },
];

const ch3: LogLine[] = [
  { t: 0.5, parts: [["18:00 ", "mute"], ["sendBatch ", "fg"], ["OK", "ok"], [` queue ${fmt(QUEUE_TOTAL)}`, "fg"]] },
  { t: 0.54, parts: [["trace ", "mute"], [`outbox holds ${fmt(QUEUE_TOTAL)}`, "fg"]] },
  { t: 0.6, parts: [["trace ", "mute"], ["app ", "fg"], ["OK", "ok"]] },
  { t: 0.618, parts: [["trace ", "mute"], ["job ", "fg"], ["OK", "ok"]] },
  { t: 0.645, parts: [["smtp  ", "mute"], ["accepted, queued ", "fg"], ["OK", "ok"]] },
  { t: 0.672, parts: [["smtp < ", "mute"], ["451 4.7.1 deferred", "warn"]] },
  { t: 0.7, parts: [["error raised: ", "mute"], ["none", "fg"]] },
  { t: 0.72, parts: [["provider limit ", "mute"], [`${LIMIT_PER_HOUR} / hr`, "acc"]] },
];

const DRAIN_HOUR_STEP = 2;
const ch4: LogLine[] = [
  { t: 0.765, parts: [["sender code ", "mute"], ["unchanged", "fg"]] },
  ...Array.from({ length: ETA_HOURS / DRAIN_HOUR_STEP }, (_, i): LogLine => {
    const h = (i + 1) * DRAIN_HOUR_STEP;
    const t = DRAIN[0] + (h / ETA_HOURS) * (DRAIN[1] - DRAIN[0]);
    return {
      t,
      parts: [
        [`+${String(h).padStart(2, "0")}h `, "mute"],
        [`sent ${DRAIN_HOUR_STEP * LIMIT_PER_HOUR} queue ${fmt(QUEUE_TOTAL - h * LIMIT_PER_HOUR)} `, "fg"],
        ["OK", "ok"],
      ],
    };
  }),
  { t: 0.935, parts: [["code diff ", "mute"], ["0 lines", "acc"]] },
];

export const LOG: readonly LogLine[] = [...ch1, ...ch2, ...ch3, ...ch4];
