import { AGENTS, STATUS, type StatusKey } from "@/pixel/data";
import PixelHead from "./PixelHead";
import { AgentHQMount } from "./PixelMount";
import "./pixel.css";

// Agent HQ: every agent I run is a room in a pixel building (src/pixel/hq*.js).
// The rooms are an APG grid laid over the canvas, built by hq-ui.js with the
// ids below; the card beside it shows the selected agent. Until the building
// is up (and if it ever fails) the same agents read as the plain list at the
// bottom, which is also what crawlers see.

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const word = (n: number) => WORDS[n] ?? String(n);
const Word = (n: number) => word(n).charAt(0).toUpperCase() + word(n).slice(1);
const are = (n: number) => (n === 1 ? "is" : "are");

const ORDER: readonly StatusKey[] = ["live", "call", "proto", "paused"];
const KEY_WORD: Record<StatusKey, string> = { live: "running", call: "on call", proto: "in progress", paused: "paused" };
const count = (st: StatusKey) => AGENTS.filter((a) => a.status === st).length;

// Pixel close glyph (an X on the 16px grid).
const CLOSE_PATH =
  "M3 3h2v2h2v2h2V5h2V3h2v2h-2v2h-2v2h2v2h2v2h-2v-2h-2V9H7v2H5v2H3v-2h2V9h2V7H5V5H3z";

function Legend() {
  return (
    <ul className="legend" aria-label="Status key">
      {ORDER.map((st) => (
        <li key={st}>
          <span className={`pip st-${st}`} aria-hidden="true" />
          <span>
            <b>{count(st)}</b> {KEY_WORD[st]}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Stage() {
  return (
    <div className="hq-body" id="hq-body">
      <div className="hq-stage" id="hq-stage">
        <div className="hq-board" id="hq-board">
          <canvas id="hq-canvas" aria-hidden="true" />
          <div className="hq-grid" id="hq-grid" role="grid" aria-labelledby="agents-h" aria-describedby="hq-help" />
        </div>
        <p className="hq-note">
          <span id="hq-help">Click a room, or Tab into the building, move with the arrow keys and press Enter.</span>{" "}
          The sky over the roof follows Jakarta time; it is <time id="hq-clock">--:--</time> there now.
        </p>
      </div>
      <section className="hq-card px-panel" id="hq-card" aria-labelledby="hq-card-title">
        <button className="btn card-x" id="hq-card-x" type="button" aria-label="Close the agent card" hidden>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d={CLOSE_PATH} />
          </svg>
        </button>
        <div id="hq-card-body" />
      </section>
    </div>
  );
}

export default function AgentHQ() {
  const [live, call, proto, paused] = ORDER.map(count);
  return (
    <section
      id="agents"
      aria-labelledby="agents-h"
      data-mode="side"
      className="px-scope px-hq scroll-mt-4 pt-16 pb-16 sm:pt-24 sm:pb-24"
    >
      <div className="px-wrap">
        <PixelHead id="agents-h" label="Agent HQ" title={`${Word(AGENTS.length)} agents, one room each.`}>
          As of September 2026, {word(live)} {are(live)} running, {word(call)} {call === 1 ? "waits" : "wait"} for a
          call, {word(proto)}{" "}
          {are(proto)} still being built and {word(paused)} {are(paused)} paused. Pick a room to see what it does.
        </PixelHead>
        <Legend />
        <Stage />
        <p className="sr" id="hq-live" role="status" aria-live="polite" />
        <ul className="hq-list" id="hq-list">
          {AGENTS.map((a) => (
            <li key={a.id}>
              <h3>{a.name}</h3>
              <p>
                {STATUS[a.status].label}. {a.does}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <AgentHQMount />
    </section>
  );
}
