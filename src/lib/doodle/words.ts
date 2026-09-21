import type { Rng, ShapeId } from "./types";
import { SHAPE_IDS } from "./types";
import { shuffled } from "./rng";

// What the prompt says and the small hint under it. The hint keeps people
// drawing something the matcher actually knows.
export const WORDS: Readonly<Record<ShapeId, { readonly word: string; readonly hint: string }>> = {
  sun: { word: "sun", hint: "a circle with rays" },
  house: { word: "house", hint: "a box with a roof" },
  tree: { word: "tree", hint: "a round top on a trunk" },
  fish: { word: "fish", hint: "a body with a tail" },
  star: { word: "star", hint: "a pointy star" },
  key: { word: "key", hint: "a ring on a shaft with teeth" },
  cup: { word: "cup", hint: "a mug with a handle" },
  cat: { word: "cat", hint: "a face with ears and whiskers" },
};

// A fresh shuffled deck whose first card is not `last`.
export function freshDeck(rng: Rng, last: ShapeId | null): ShapeId[] {
  const deck = shuffled(SHAPE_IDS, rng);
  if (last === null || deck[0] !== last) return deck;
  return [...deck.slice(1), deck[0]];
}
