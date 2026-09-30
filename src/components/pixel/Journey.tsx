import { AGENTS, MONTHS, UNLOCKS, type Month } from "@/pixel/data";
import PixelHead from "./PixelHead";
import { JourneyMount } from "./PixelMount";
import "./pixel.css";

// The journey: February to September 2026 as a list of months, and beside it
// a pixel level (src/pixel/journey.js) where I walk to the flag of the month
// being read. The list is the content; the level only illustrates it.

const MONTH_IDS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const yearMonth = (m: Month) => `2026-${String(MONTH_IDS.indexOf(m.id) + 1).padStart(2, "0")}`;
const bornIn = (m: Month) => AGENTS.filter((a) => a.since.slice(0, 3).toLowerCase() === m.id).map((a) => a.name);

function MonthItem({ m }: { m: Month }) {
  const born = bornIn(m);
  return (
    <li className="month" id={`m-${m.id}`}>
      <span className="m-mark" aria-hidden="true" />
      <p className="m-when">
        <time dateTime={yearMonth(m)}>{m.label}</time>
      </p>
      <h3>{m.title}</h3>
      <ul className="m-items">
        {m.items.map(([dt, label, text]) => (
          <li key={text}>
            <time dateTime={dt}>{label}</time>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className="m-got">
        <span className="m-got-l">Unlocked</span>
        <ul className="m-unlocks">
          {m.unlocks.map((u) => (
            <li key={u} className="unlock chip">
              {UNLOCKS[u]}
            </li>
          ))}
        </ul>
      </div>
      {born.length > 0 && (
        <p className="m-born">
          <span className="m-born-l">Agents born this month:</span> {born.join(", ")}
        </p>
      )}
    </li>
  );
}

export default function Journey() {
  return (
    <section id="journey" aria-labelledby="journey-h" className="px-scope px-journey scroll-mt-4 pt-16 pb-16 sm:pt-24 sm:pb-24">
      <div className="px-wrap">
        <PixelHead id="journey-h" label="Journey" title="From OpenClaw to agents of my own.">
          I met my first AI agent at 01:50 one night in February 2026, and it ended in an error. These are the
          eight months since. Scroll the list and I walk the level: each flag is a month, each block holds
          something I learned, and the agents I built fall in behind me.
        </PixelHead>
        <div className="journey-body">
          <div className="level-wrap" id="level-wrap">
            <div className="px-frame">
              <canvas id="level" aria-hidden="true" />
            </div>
            <p className="level-cap">The level follows the month you are reading.</p>
          </div>
          <div>
            <ol className="months" id="months">
              {MONTHS.map((m) => (
                <MonthItem key={m.id} m={m} />
              ))}
            </ol>
            <div className="months-end" id="months-end">
              <p>
                That brings the line to {AGENTS.length} agents, and the level ends at their building.{" "}
                <a href="#agents">Back to Agent HQ</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <JourneyMount />
    </section>
  );
}
