import { optionsForSlug } from "@/data/briefOptions";

// Per-slug brief selection, kept outside React so every card and the sticky bar
// read one source. `memory` is the working copy; sessionStorage is a best-effort
// mirror so a reload or a hop to another page keeps the chips. Storage can be
// blocked (private modes, site settings), in which case the page still works and
// the choices simply last until the tab reloads.

const KEY_PREFIX = "brief:v1:";

export const EMPTY_IDS: readonly string[] = [];

const memory = new Map<string, readonly string[]>();
const listeners = new Set<() => void>();
let warned = false;

const storageKey = (slug: string) => `${KEY_PREFIX}${slug}`;

function readStored(slug: string): readonly string[] {
  const valid = new Set(optionsForSlug(slug).map((o) => o.id));
  try {
    const raw = window.sessionStorage.getItem(storageKey(slug));
    if (!raw) return EMPTY_IDS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_IDS;
    const ids = parsed.filter((v): v is string => typeof v === "string" && valid.has(v));
    return ids.length > 0 ? Array.from(new Set(ids)) : EMPTY_IDS;
  } catch {
    // Storage blocked or the stored value is not JSON: start from an empty brief.
    return EMPTY_IDS;
  }
}

function writeStored(slug: string, ids: readonly string[]) {
  try {
    if (ids.length === 0) window.sessionStorage.removeItem(storageKey(slug));
    else window.sessionStorage.setItem(storageKey(slug), JSON.stringify(ids));
  } catch (err) {
    if (warned) return;
    warned = true;
    console.warn("Brief storage unavailable, choices last for this page load only.", err);
  }
}

export function getIds(slug: string): readonly string[] {
  if (typeof window === "undefined") return EMPTY_IDS;
  const cached = memory.get(slug);
  if (cached) return cached;
  const loaded = readStored(slug);
  memory.set(slug, loaded);
  return loaded;
}

function setIds(slug: string, next: readonly string[]) {
  memory.set(slug, next.length > 0 ? next : EMPTY_IDS);
  writeStored(slug, next);
  listeners.forEach((notify) => notify());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const isKnown = (slug: string, id: string) =>
  optionsForSlug(slug).some((o) => o.id === id);

export function toggleId(slug: string, id: string) {
  if (!isKnown(slug, id)) return;
  const current = getIds(slug);
  setIds(slug, current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
}

export function removeId(slug: string, id: string) {
  const current = getIds(slug);
  if (!current.includes(id)) return;
  setIds(slug, current.filter((x) => x !== id));
}
