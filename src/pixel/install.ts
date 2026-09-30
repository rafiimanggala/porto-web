// Sets up window.PETA before any canvas module runs: the page content as
// PETA.data and the query flags the modules read (?sky=night, ?freeze=12).
import { DATA } from "./data";

type Peta = { data?: typeof DATA; query?: Record<string, string> };

const w = window as unknown as { PETA?: Peta };
const P = (w.PETA = w.PETA ?? {});
P.data = DATA;
try {
  P.query = Object.fromEntries(new URLSearchParams(window.location.search));
} catch {
  P.query = {};
}

export {};
