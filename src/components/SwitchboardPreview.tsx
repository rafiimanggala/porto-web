// The media anchor for each directory card (Card Grid pattern, editorial
// variation). Purpose-built miniatures, not scaled screenshots: six real
// mockups on the homepage would ship thousands of nodes for something the
// reader only glances at. Every preview is decorative, so the card's
// accessible name still comes from the title and value text alone.
//
// Rules kept per preview: one accent focal point, no motion of its own, and
// nothing implied that the linked cases do not actually show.

const BOX =
  "relative h-[92px] w-full overflow-hidden rounded-lg border border-line bg-[#0b0b0e]";

// A single skeleton bar. Widths are passed in px so the miniature stays crisp
// instead of reflowing into mush at the 1-column breakpoint.
function Bar({ w, h = 4, tone = "line" }: { w: number; h?: number; tone?: "line" | "dim" | "accent" }) {
  const bg =
    tone === "accent"
      ? "bg-accent/70"
      : tone === "dim"
        ? "bg-white/20"
        : "bg-white/10";
  return <span className={`block rounded-full ${bg}`} style={{ width: w, height: h }} />;
}

// 1 · Full-Stack Web Apps: the product shell a client logs into.
function ShellPreview() {
  return (
    <div className={BOX}>
      <div className="absolute inset-y-0 left-0 w-[22px] border-r border-line bg-white/[0.02] p-2">
        <div className="space-y-2">
          <Bar w={10} tone="accent" />
          <Bar w={10} />
          <Bar w={10} />
          <Bar w={10} />
        </div>
      </div>
      <div className="ml-[22px] h-full">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <span className="block h-[4px] w-[32%] rounded-full bg-white/20" />
          <span className="h-[10px] w-[10px] rounded-full border border-line" />
        </div>
        <div className="space-y-[7px] px-3 py-[10px]">
          {["58%", "42%", "50%"].map((w, i) => (
            <div key={w} className="flex items-center justify-between gap-3">
              <span className="block h-[4px] rounded-full bg-white/10" style={{ width: w }} />
              <span
                className={`h-[8px] rounded-full ${i === 0 ? "bg-accent/70" : "bg-white/10"}`}
                style={{ width: 18 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2 · AI Inside Your Product: four inputs read into one score.
function ScorePreview() {
  return (
    <div className={`${BOX} flex items-center gap-3 px-4`}>
      <div className="flex-1 space-y-[7px]">
        {["blood panel", "wearable", "genetics", "body scan"].map((l) => (
          <p key={l} className="mono truncate text-[11px] leading-none text-mute">
            {l}
          </p>
        ))}
      </div>
      <svg width="26" height="52" viewBox="0 0 26 52" aria-hidden>
        {[8, 20, 32, 44].map((y) => (
          <path
            key={y}
            d={`M0 ${y} C 13 ${y}, 13 26, 24 26`}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r="20"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="103 126"
          transform="rotate(-90 26 26)"
        />
        <text
          x="26"
          y="30"
          textAnchor="middle"
          className="mono nums"
          fill="var(--color-fg)"
          fontSize="14"
        >
          82
        </text>
      </svg>
    </div>
  );
}

// 3 · Automation That Runs Itself: the run, and the step that failed.
function PipelinePreview() {
  const steps = ["ok", "ok", "fail", "idle", "idle"] as const;
  return (
    <div className={`${BOX} flex flex-col justify-center gap-3 px-4`}>
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
            <span
              className={`h-[11px] w-[11px] rounded-full border ${
                s === "ok"
                  ? "border-accent bg-accent/70"
                  : s === "fail"
                    ? "border-[#f87171] bg-[#f87171]/70"
                    : "border-line bg-white/5"
              }`}
            />
            {i < steps.length - 1 ? (
              <span
                className={`h-[1px] flex-1 ${s === "ok" ? "bg-accent/40" : "bg-white/10"}`}
              />
            ) : null}
          </div>
        ))}
      </div>
      <p className="mono text-[11px] text-mute">
        step 3 failed <span className="text-[#f87171]">·</span> retried, logged
      </p>
    </div>
  );
}

// 4 · AI Video At Scale: vertical output, scheduled out.
function VideoPreview() {
  return (
    <div className={`${BOX} flex items-center gap-3 px-4`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="relative h-[62px] w-[35px] rounded border border-line bg-white/[0.03]"
        >
          {i === 1 ? (
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              aria-hidden
            >
              <path d="M4 2.5 L9 6 L4 9.5 Z" fill="var(--color-accent)" />
            </svg>
          ) : null}
          <span className="absolute inset-x-[5px] bottom-[5px] block h-[2px] rounded-full bg-white/15" />
        </div>
      ))}
      <div className="ml-1 flex-1 space-y-[7px]">
        <span className="block h-[4px] w-full rounded-full bg-accent/70" />
        <span className="block h-[4px] w-[62%] rounded-full bg-white/10" />
        <span className="block h-[4px] w-[80%] rounded-full bg-white/10" />
        <p className="mono text-[11px] leading-none text-mute">3 of 14 queued</p>
      </div>
    </div>
  );
}

// 5 · Design And Prototypes: wireframe to screens to a clickable build.
function DesignPreview() {
  return (
    <div className={`${BOX} flex items-center gap-2.5 px-4`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[64px] min-w-0 flex-1 rounded border border-line bg-white/[0.03] p-[6px]"
        >
          <div className="space-y-[5px]">
            <span
              className={`block h-[4px] w-full rounded-full ${i === 2 ? "bg-white/20" : "bg-white/10"}`}
            />
            <span className="block h-[4px] w-[62%] rounded-full bg-white/10" />
            {i > 0 ? (
              <span className="block h-[14px] w-full rounded bg-white/[0.06]" />
            ) : (
              <span className="block h-[4px] w-[45%] rounded-full bg-white/10" />
            )}
            {i === 2 ? (
              <span className="block h-[7px] w-[70%] rounded-full bg-accent/70" />
            ) : null}
          </div>
        </div>
      ))}
      <div className="flex shrink-0 flex-col gap-[5px]">
        {["var(--color-accent)", "rgba(255,255,255,0.28)", "rgba(255,255,255,0.14)", "rgba(255,255,255,0.07)"].map(
          (c) => (
            <span
              key={c}
              className="block h-[11px] w-[11px] rounded border border-line"
              style={{ background: c }}
            />
          ),
        )}
      </div>
    </div>
  );
}

// 6 · Fixing Live Systems: the failing call, the fix, the rollback tag.
function RescuePreview() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-[7px] px-4`}>
      <p className="mono flex items-center gap-2 text-[11px] text-mute">
        <span className="rounded bg-[#f87171]/15 px-1 py-[1px] text-[#f87171]">500</span>
        POST /api/send
      </p>
      <p className="mono flex items-center gap-2 text-[11px] text-dim">
        <span className="rounded bg-accent/15 px-1 py-[1px] text-accent">200</span>
        POST /api/send
      </p>
      <p className="mono flex items-center gap-2 text-[11px] text-mute">
        <span className="rounded border border-line px-1 py-[1px]">tag</span>
        rollback point kept
      </p>
    </div>
  );
}

const PREVIEWS: Record<string, () => React.ReactElement> = {
  "full-stack-product-build": ShellPreview,
  "ai-features-in-product": ScorePreview,
  "automation-that-runs-itself": PipelinePreview,
  "ai-video-at-scale": VideoPreview,
  "design-and-prototypes": DesignPreview,
  "live-system-rescue": RescuePreview,
};

export default function SwitchboardPreview({ slug }: { slug: string }) {
  const P = PREVIEWS[slug];
  if (!P) return null;
  return (
    <div aria-hidden className="mt-5">
      <P />
    </div>
  );
}
