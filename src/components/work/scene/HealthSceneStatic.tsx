import { CAPTIONS, DOMAINS, PANELS, SCORE, iconTrim } from "./HealthSceneData";
import { PanelHead } from "./HealthScenePanelHead";
import { SceneIcon } from "./SceneIcon";

/* Health case study, prefers-reduced-motion version: the same story as a plain
   stacked read, no pinning and no scrubbing. Each source shows its raw line
   next to the row it parses into, then the score, then the shipped product. */

const MONO = "font-[ui-monospace,SFMono-Regular,Menlo,monospace]";

export default function HealthSceneStatic() {
  return (
    <div className="mx-auto max-w-[860px] px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {PANELS.map((panel) => (
          <div
            key={panel.key}
            className="rounded-xl border border-t-2 border-line-strong bg-surface-1 p-3"
            style={{ borderTopColor: panel.color }}
          >
            <PanelHead panel={panel} variant="still" />
            <ul className="space-y-1.5">
              {panel.rows.map((row) => (
                <li key={row.raw} className="grid grid-cols-2 gap-2 text-[11px]">
                  <span className={`${MONO} truncate text-mute`}>{row.raw}</span>
                  <span className="flex justify-between gap-2 rounded-md bg-surface-2 px-2 py-1 text-fg">
                    <span className="truncate">{row.label}</span>
                    <span className="shrink-0 tabular-nums text-dim">{row.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-line bg-surface-1 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="t-hero text-6xl leading-none text-accent">{SCORE}</div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DOMAINS.map((d) => (
            <li key={d.k} className="flex justify-between rounded-md border border-line px-2 py-1 text-xs">
              <span className="text-dim">{d.k}</span>
              <span className="tabular-nums text-fg">{d.v}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/work/health-platform/dashboard-card.webp"
        alt="The shipped dashboard: longevity score and domain breakdown"
        loading="lazy"
        className="mt-6 block w-full rounded-2xl border border-line-strong"
      />
      <div className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 ${MONO} text-[11px] text-mute`}>
        <span>from</span>
        <span className="flex items-center gap-0.5">
          {PANELS.map((panel) => (
            <SceneIcon key={panel.key} name={panel.icon} size={28} className={`h-7 w-7 ${iconTrim(panel.icon)}`} />
          ))}
        </span>
        <span>
          <span className="text-fg">score {SCORE}</span>, as shipped
        </span>
      </div>
      <p className="mt-3 text-sm text-mute">{CAPTIONS[3].body}</p>
    </div>
  );
}
