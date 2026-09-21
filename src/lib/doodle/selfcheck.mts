// Run: node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON src/lib/doodle/selfcheck.mts
// (the flag only hides a harmless notice that package.json has no "type").
// Draws synthetic hand-style sketches (userstrokes.ts, built independently of
// the prototype generator) and checks the matcher reads them correctly.

import { register } from "node:module";
import type * as ClassifierModule from "./classifier";
import type * as RngModule from "./rng";
import type * as SampleModule from "./sample";
import type * as ThrottleModule from "./throttle";
import type * as UserModule from "./userstrokes";
import type { ShapeId } from "./types";

const PER_CLASS = 30;
const CLASS_PASS = 0.6;
const CLASSES_NEEDED = 6;
const MIN_EXTENT = 24;
const RUSHED_SHAKE = 3;
const RUSHED_PASS = 0.5;

async function load() {
  register("./ts-resolve.mjs", import.meta.url);
  return {
    classifier: (await import("./classifier")) as typeof ClassifierModule,
    rng: (await import("./rng")) as typeof RngModule,
    sample: (await import("./sample")) as typeof SampleModule,
    throttle: (await import("./throttle")) as typeof ThrottleModule,
    user: (await import("./userstrokes")) as typeof UserModule,
    types: await import("./types"),
  };
}

type Mods = Awaited<ReturnType<typeof load>>;
type Row = { readonly id: ShapeId; readonly hits: number; readonly counts: Record<string, number> };

function evaluate(m: Mods, model: ClassifierModule.Model, shaky: number): Row[] {
  return m.types.SHAPE_IDS.map((id, c) => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < PER_CLASS; i++) {
      const rng = m.rng.mulberry32(9000 + c * 1000 + i);
      const result = m.classifier.classify(model, m.user.drawUserSketch(id, rng, shaky), { minExtent: MIN_EXTENT });
      const top = result ? result[0].id : "none";
      counts[top] = (counts[top] ?? 0) + 1;
    }
    return { id, hits: counts[id] ?? 0, counts };
  });
}

function printConfusion(rows: readonly Row[], ids: readonly ShapeId[]): void {
  const pad = (s: string, n: number) => s.padEnd(n);
  console.log(pad("drawn \\ read as", 16) + ids.map((i) => pad(i, 6)).join("") + "acc");
  for (const r of rows) {
    const cells = ids.map((i) => pad(String(r.counts[i] ?? 0), 6)).join("");
    console.log(pad(r.id, 16) + cells + (r.hits / PER_CLASS).toFixed(2));
  }
}

function checkSamples(m: Mods, model: ClassifierModule.Model): string[] {
  return m.types.SHAPE_IDS.flatMap((id) => {
    const result = m.classifier.classify(model, m.sample.SAMPLE_SKETCHES[id], { minExtent: MIN_EXTENT });
    const top = result ? result[0] : null;
    console.log(`sample ${id.padEnd(6)} -> ${top?.id} ${top ? (top.share * 100).toFixed(0) : "-"}%`);
    return top && top.id === id ? [] : [`sample sketch for ${id} was read as ${top?.id}`];
  });
}

function checkBasics(m: Mods, model: ClassifierModule.Model): string[] {
  const problems: string[] = [];
  if (m.classifier.classify(model, []) !== null) problems.push("empty input should give null");
  const dot = [[{ x: 5, y: 5 }]];
  if (m.classifier.classify(model, dot, { minExtent: MIN_EXTENT }) !== null) problems.push("a dot should give null");
  const bad = [[{ x: Number.NaN, y: 1 }]];
  if (m.classifier.classify(model, bad) !== null) problems.push("non-finite input should give null");
  const sketch = m.user.drawUserSketch("star", m.rng.mulberry32(5));
  const out = m.classifier.classify(model, sketch);
  const total = out ? out.reduce((s, r) => s + r.share, 0) : 0;
  if (Math.abs(total - 1) > 1e-6) problems.push(`shares sum to ${total}, expected 1`);
  const again = m.classifier.classify(m.classifier.buildModel(), sketch);
  if (!out || !again || out[0].score !== again[0].score) problems.push("model is not deterministic");
  return problems;
}

function checkThrottle(m: Mods): string[] {
  let clock = 0;
  const queue: { at: number; fn: () => void }[] = [];
  const timers = {
    now: () => clock,
    setTimer: (fn: () => void, ms: number) => queue.push({ at: clock + ms, fn }),
    clearTimer: () => queue.splice(0, queue.length),
  };
  const calls: number[] = [];
  const t = m.throttle.createThrottle(() => calls.push(clock), 200, timers);
  for (let ms = 0; ms <= 1000; ms += 10) {
    clock = ms;
    queue.filter((q) => q.at <= clock).forEach((q) => { queue.splice(queue.indexOf(q), 1); q.fn(); });
    t.call(ms);
  }
  clock = 1300;
  queue.splice(0, queue.length).forEach((q) => q.fn());
  // calls holds the clock at each run, so gaps are real spacing.
  const gaps = calls.slice(1).map((v, i) => v - calls[i]);
  const tooFast = gaps.filter((g) => g < 200);
  console.log(`throttle: ${calls.length} runs over 1000ms of calls every 10ms`);
  return tooFast.length > 0 ? [`throttle ran with gaps below 200ms: ${tooFast.join(",")}`] : [];
}

async function main() {
  const m = await load();
  const started = performance.now();
  const model = m.classifier.buildModel();
  console.log(`model built in ${(performance.now() - started).toFixed(0)}ms, ${model.prototypes.length} prototypes`);

  const rows = evaluate(m, model, 1);
  printConfusion(rows, m.types.SHAPE_IDS);
  const passing = rows.filter((r) => r.hits / PER_CLASS >= CLASS_PASS).length;
  const total = rows.reduce((s, r) => s + r.hits, 0);
  console.log(`classes at or above ${CLASS_PASS}: ${passing}/${rows.length}, overall ${(total / (rows.length * PER_CLASS)).toFixed(2)}`);

  // Same drawings with three times the hand tremor, a fairer picture of a
  // rushed finger. Lower bar, same requirement of six classes.
  const rushed = evaluate(m, model, RUSHED_SHAKE);
  console.log("\nrushed finger (tremor x" + RUSHED_SHAKE + ")");
  printConfusion(rushed, m.types.SHAPE_IDS);
  const rushedPassing = rushed.filter((r) => r.hits / PER_CLASS >= RUSHED_PASS).length;
  console.log(`classes at or above ${RUSHED_PASS}: ${rushedPassing}/${rushed.length}\n`);

  const problems = [
    ...(passing >= CLASSES_NEEDED ? [] : [`only ${passing} classes reached ${CLASS_PASS} (need ${CLASSES_NEEDED})`]),
    ...(rushedPassing >= CLASSES_NEEDED ? [] : [`rushed pass: only ${rushedPassing} classes reached ${RUSHED_PASS}`]),
    ...checkSamples(m, model),
    ...checkBasics(m, model),
    ...checkThrottle(m),
  ];
  if (problems.length > 0) {
    console.error("\nFAIL");
    problems.forEach((p) => console.error(" - " + p));
    process.exit(1);
  }
  console.log("\nPASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
