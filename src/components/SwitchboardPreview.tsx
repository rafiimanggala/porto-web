// The media anchor for each directory card (Card Grid pattern, editorial
// variation). Mostly purpose-built miniatures, not scaled screenshots: real
// mockups for every card would ship thousands of nodes for something the
// reader only glances at. One card breaks that rule on purpose, where a real
// screenshot exists for openly-showable, non-NDA work (the Shopify
// storefront) and reads more convincingly than an abstract mockup would.
// Every preview is decorative, so the card's accessible name still comes
// from the title and value text alone.
//
// Rules kept per preview: one accent focal point, no motion of its own, and
// nothing implied that the linked cases do not actually show. The two NDA
// engagements behind card 1 (school platform, health platform) never get a
// real screenshot: same "invented name, number and record" rule their case
// study pages already state, applied here as an abstract split panel instead
// of a photo.
//
// BOX sits one surface step above the card (surface-2 on a surface-1 card):
// a box that is nearly the same colour as the card it sits in reads as no
// preview at all, not as restraint.

import Image from "next/image";

const BOX =
  "relative h-[92px] w-full overflow-hidden rounded-lg border border-line-strong bg-surface-2";

// 1 · Full-Stack Web Apps: two NDA engagements, side by side. No real name,
// logo, or record for either half — same rule their case study pages state.
function ShellPreview() {
  return (
    <div className={`${BOX} flex`}>
      <div className="flex flex-1 flex-col justify-center gap-[8px] border-r border-line-strong px-3">
        <span className="mono text-[9px] uppercase tracking-wide text-mute">
          school platform
        </span>
        <div className="space-y-[5px]">
          <span className="block h-[4px] w-full rounded-full bg-white/30" />
          <div className="flex items-center gap-[6px]">
            <span className="h-[8px] w-[8px] shrink-0 rounded-[2px] border border-accent bg-accent/70" />
            <span className="block h-[3px] w-[75%] rounded-full bg-white/22" />
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="h-[8px] w-[8px] shrink-0 rounded-[2px] border border-line-strong bg-white/10" />
            <span className="block h-[3px] w-[58%] rounded-full bg-white/16" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-[8px] px-3">
        <span className="mono text-[9px] uppercase tracking-wide text-mute">
          health platform
        </span>
        <div className="space-y-[6px]">
          <p className="mono text-[11px] leading-none text-dim">
            resting hr <span className="text-accent">61</span>
          </p>
          <p className="mono text-[11px] leading-none text-mute">
            sleep <span className="text-fg">7.4h</span>
          </p>
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
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="4" />
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
                    : "border-line-strong bg-white/12"
              }`}
            />
            {i < steps.length - 1 ? (
              <span
                className={`h-[1px] flex-1 ${s === "ok" ? "bg-accent/40" : "bg-white/16"}`}
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
          className="relative h-[62px] w-[35px] rounded border border-line-strong bg-white/[0.07]"
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
          <span className="absolute inset-x-[5px] bottom-[5px] block h-[2px] rounded-full bg-white/22" />
        </div>
      ))}
      <div className="ml-1 flex-1 space-y-[7px]">
        <span className="block h-[4px] w-full rounded-full bg-accent/70" />
        <span className="block h-[4px] w-[62%] rounded-full bg-white/16" />
        <span className="block h-[4px] w-[80%] rounded-full bg-white/16" />
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
          className="h-[64px] min-w-0 flex-1 rounded border border-line-strong bg-white/[0.06] p-[6px]"
        >
          <div className="space-y-[5px]">
            <span
              className={`block h-[4px] w-full rounded-full ${i === 2 ? "bg-white/30" : "bg-white/16"}`}
            />
            <span className="block h-[4px] w-[62%] rounded-full bg-white/16" />
            {i > 0 ? (
              <span className="block h-[14px] w-full rounded bg-white/[0.1]" />
            ) : (
              <span className="block h-[4px] w-[45%] rounded-full bg-white/16" />
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
        <span className="rounded border border-line-strong px-1 py-[1px]">tag</span>
        rollback point kept
      </p>
    </div>
  );
}

// 7 · Custom Shopify Builds: the live storefront, not a mockup of one.
function ShopifyPreview() {
  return (
    <div className={BOX}>
      <Image
        src="/work/made-to-measure-shopify/storefront-collection.webp"
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/70 via-transparent to-transparent" />
      <span className="absolute bottom-2 left-3 rounded bg-accent/15 px-1.5 py-[1px] text-[9px] font-medium text-accent">
        live storefront
      </span>
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
  "shopify-storefronts": ShopifyPreview,
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
