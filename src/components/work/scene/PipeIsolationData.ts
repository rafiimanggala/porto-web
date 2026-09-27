import { METRIC_SAMPLE, NODE, OK_RUN, SCHEDULE, SCRAPER, type NodeDef } from "./PipeKitData";
import type { SceneCaption } from "./ScrollScene";

/* Isolation scene: copy and the few strings this scene adds on top of PipeKitData. */

export const CAPTIONS: readonly SceneCaption[] = [
  { eyebrow: "01 / Collect", title: "A second workflow, on its own.", body: "It reads a list of tracked accounts and loops through them one by one." },
  { eyebrow: "02 / Store", title: "Signals go to two sheets.", body: "Fresh metrics update the live sheet, and every run is also kept as history." },
  { eyebrow: "03 / Failure", title: "Then something breaks.", body: "One scrape times out overnight, and the log names the exact node and payload." },
  { eyebrow: "04 / Isolated", title: "Publishing never noticed.", body: `The ${OK_RUN.at} run starts on time, because the two workflows share no path.` },
];
export const CHAPTERS = [0, 0.24, 0.5, 0.76, 1] as const;

export const TITLE_A = SCRAPER.name;
export const TITLE_B = OK_RUN.workflow;
export const SHEET_NAMES = SCRAPER.sheets;

/* Node tiles of the two lanes. Glyphs and labels come from the shared node catalog. Lane A names its trigger by its
   cadence and its last tile "Chat": short labels, because 10px labels of neighbouring tiles must not touch on a phone. */
const CADENCE = `${SCHEDULE.cadence.charAt(0).toUpperCase()}${SCHEDULE.cadence.slice(1)}`;
export const LANE_A = [
  { glyph: NODE.schedule.glyph, label: CADENCE },
  { glyph: NODE.row.glyph, label: "Accounts" },
  { glyph: NODE.loop.glyph, label: NODE.loop.label },
  { glyph: NODE.actor.glyph, label: NODE.actor.label },
  { glyph: NODE.row.glyph, label: `${SCRAPER.sheets.length} sheets` },
  { glyph: NODE.chat.glyph, label: "Chat" },
] as const;

/* The two platform tiles get different generic glyphs, a tall clip and a photo frame, so the fork reads without the label. */
export const LANE_B = [
  NODE.schedule,
  NODE.readyRows,
  NODE.media,
  NODE.tiktok,
  { glyph: "image", label: NODE.instagram.label },
  NODE.writeback,
] as const satisfies readonly NodeDef[];
/** Which step of the publishing run lights each tile: the two platform tiles share step 3. */
export const B_GROUP = [0, 1, 2, 3, 3, 4] as const;

/* Metric values the sheets held before this run, so an update has something to replace. */
export const PREVIOUS = [
  { followers: "12.1k", posts: 83, views: "221k" },
  { followers: "7.9k", posts: 41, views: "93k" },
  { followers: "27.5k", posts: 131, views: "598k" },
  { followers: "3.5k", posts: 22, views: "17k" },
] as const satisfies readonly { followers: string; posts: number; views: string }[];

export const SAMPLE_ROWS = METRIC_SAMPLE.length;
/** Historic keeps the last run next to this one. */
export const HISTORY_KEPT = 3;

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const hm = (minutes: number) => `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(Math.floor(minutes % 60))}`;
export const toMinutes = (clock: string) => {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
};
