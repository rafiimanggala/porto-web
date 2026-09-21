import type { Match, ShapeId } from "@/lib/doodle/types";
import { WORDS } from "@/lib/doodle/words";

// Sentences for the polite live region. Kept out of the component so the
// component stays about wiring.

const pct = (m: Match) => Math.round(m.share * 100);

export function strokeMessage(matches: readonly Match[] | null): string {
  if (!matches) return "Not enough ink yet for the matcher to compare.";
  return `Top match: ${WORDS[matches[0].id].word}, ${pct(matches[0])} percent.`;
}

export function timeUpMessage(matches: readonly Match[] | null, word: ShapeId | null): string {
  if (!matches) return "Time's up. There was not enough ink to compare.";
  const top = matches[0];
  const label = `${WORDS[top.id].word}, ${pct(top)} percent`;
  if (top.id === word) return `Time's up. Top match: ${label}. That is your word.`;
  const asked = word ? ` Your word was ${WORDS[word].word}.` : "";
  return `Time's up. Top match: ${label}.${asked}`;
}
