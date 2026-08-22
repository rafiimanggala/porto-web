// The media anchor for a proof row. Everything here is pulled from what the row
// actually opens: the case card in src/components/SelectedWork.tsx, or a
// screenshot already shipped for that destination. Nothing is drawn for this
// list, so a preview cannot promise a screen the reader will not land on.
//
// A destination with no card and no screenshot gets no preview. Borrowing a
// neighbour's image to fill the gap is the one dishonest move available here.

import { cases } from "@/components/SelectedWork";

type Frame = {
  key: string;
  thumb?: string;
  thumbFocus?: "top" | "center";
  mockup?: React.ReactNode;
  mockupAccent?: string;
  bleed?: boolean;
};

function fromCase(slug: string): Frame[] {
  const c = cases.find((x) => x.slug === slug);
  if (!c) return [];
  return [
    {
      key: c.slug,
      thumb: c.thumb,
      thumbFocus: c.thumbFocus,
      mockup: c.mockup,
      mockupAccent: c.mockupAccent,
      bleed: c.bleed,
    },
  ];
}

function resolve(href: string): Frame[] {
  if (href.startsWith("/work/")) return fromCase(href.slice("/work/".length));

  // The prototype is the Streak build itself. It gets the detail screen rather
  // than the home screen the case-study row already shows, so the two adjacent
  // rows are not the same picture twice.
  if (href.startsWith("/demo/streak")) {
    return [{ key: "streak-demo", thumb: "/work/streak/d-detail.png" }];
  }

  // /video renders exactly these two cases, so the preview is both of them.
  if (href === "/video") {
    return ["content-automation-pipeline", "ai-video-production"].flatMap(fromCase);
  }

  return [];
}

export function hasProofPreview(href: string) {
  return resolve(href).length > 0;
}

function Pane({ f }: { f: Frame }) {
  if (f.mockup) {
    return (
      <div
        className={`h-full w-full ${f.bleed ? "" : "p-2"}`}
        style={{
          background: `radial-gradient(120% 90% at 50% -10%, ${f.mockupAccent}0f, transparent 60%), var(--color-surface-1)`,
        }}
      >
        {f.mockup}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={f.thumb}
      alt=""
      loading="lazy"
      className={`block h-full w-full object-cover ${
        f.thumbFocus === "center" ? "object-center" : "object-top"
      }`}
    />
  );
}

export default function ProofPreview({ href }: { href: string }) {
  const frames = resolve(href);
  if (frames.length === 0) return null;

  return (
    <div
      aria-hidden
      className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2 sm:w-[248px]"
    >
      {frames.length === 1 ? (
        <Pane f={frames[0]} />
      ) : (
        <div className="grid h-full grid-rows-2 gap-px bg-line">
          {frames.map((f) => (
            <div key={f.key} className="min-h-0 overflow-hidden">
              <Pane f={f} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
