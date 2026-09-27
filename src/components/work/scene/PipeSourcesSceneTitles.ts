import { ARTICLE, NEW_ITEMS } from "./PipeKitData";

/* Invented headlines for the older rows of each feed, so every row of the list carries real text. Order matches the
   feeds in PipeKitData: research, psychology, clinical. The counts must equal items minus fresh for each feed; the
   builder falls back to a plain line when a list runs short. Each one is 22 characters or fewer, so it fits on one
   line of a feed column at the row size and is never cut with an ellipsis. */

export const OLD_TITLES: readonly (readonly string[])[] = [
  [
    "Sleep debt in teens",
    "Exercise and anxiety",
    "Nature and focus",
    "When to have coffee",
    "Social media and mood",
    "Late-life loneliness",
    "Diet quality and mood",
    "Mindfulness app trial",
    "Shift work and sleep",
    "Gratitude note trial",
    "Night noise, stress",
    "Remote work and mood",
  ],
  [
    "Why we procrastinate",
    "Small wins and drive",
    "The two minute rule",
    "Rumination, explained",
    "Habit stacking basics",
    "Boundaries at work",
    "Resetting a bad day",
    "Decision fatigue",
    "Decoding Sunday dread",
    "Self talk that helps",
    "Reframing a setback",
  ],
  [
    "Insomnia therapy data",
    "Light therapy summary",
    "Sleep hygiene review",
    "Anxiety screening",
    "Melatonin dosing",
    "CBT apps, pooled data",
    "Nap length, alertness",
    "Blue light glasses",
  ],
];

export const FALLBACK_TITLE = "Earlier headline";

/* What the table of records shows for each of the seven new items: the tail of the link and the first words of the
   summary. The picked item reuses the article's own link and first sentence. */
export type RecordText = { readonly slug: string; readonly lead: string };

const OTHER_RECORDS: readonly RecordText[] = [
  { slug: "/short-walks-mood", lead: "A small trial of brief daily walks reports a lift in mood." },
  { slug: "/burnout-surveys", lead: "Workplace surveys show how staff describe exhaustion and distance." },
  { slug: "/habit-streaks", lead: "Streaks tend to break around the ninth day, and most restart quickly." },
  { slug: "/journaling-prompts", lead: "Short prompts kept people writing longer than a blank page did." },
  { slug: "/screen-time-bed", lead: "A cohort study links late screen use with a later bedtime." },
  { slug: "/breathing-stress", lead: "A brief review finds small drops in stress ratings after slow breathing." },
];

export const PICKED_RECORD: RecordText = { slug: ARTICLE.link.replace(/^[^/]+/, ""), lead: ARTICLE.summary[0] };

/** Record text for the item at `index` of NEW_ITEMS. */
export function recordFor(index: number): RecordText {
  if (NEW_ITEMS[index]?.picked) return PICKED_RECORD;
  const others = NEW_ITEMS.slice(0, index).filter((n) => !n.picked).length;
  return OTHER_RECORDS[others] ?? { slug: "/story", lead: NEW_ITEMS[index]?.title ?? FALLBACK_TITLE };
}
