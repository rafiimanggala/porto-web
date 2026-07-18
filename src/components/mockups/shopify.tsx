import { Icon, NavTabs, Pill, Tile } from "./frame";

/* Illustrative recreation of the made-to-measure storefront, not a
   screenshot: generic labels/placeholder swatches in this site's own
   visual language, no client photography or copy reproduced. Screen 4
   maps to the actual headline feature: the inline saved-pattern editor
   (view/edit/clone, never overwrite) built on top of an external fit API. */

const NAV = ["Shop", "Get fitted", "Collections", "Account"];

function Swatch({ tone }: { tone: string }) {
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-line"
      style={{ background: `linear-gradient(160deg, ${tone}33, var(--color-surface-2))` }}
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.25]" preserveAspectRatio="none">
        <defs>
          <pattern id={`stitch-${tone.replace("#", "")}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 10 L10 0" stroke={tone} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#stitch-${tone.replace("#", "")})`} />
      </svg>
      <span className="absolute bottom-2 right-2 grid h-6 w-6 place-items-center rounded-md" style={{ background: "rgba(10,10,11,0.55)", color: tone }}>
        <Icon name="shirt" size={13} />
      </span>
    </div>
  );
}

export function ShopifyWeb1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={0} accent={accent} />
      <div className="flex flex-1 items-center gap-4">
        <div className="w-28 shrink-0">
          <Swatch tone={accent} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="mono text-[13px] font-medium text-fg">One shirt.</div>
          <div className="mono text-[13px] font-medium" style={{ color: accent }}>One story.</div>
          <div className="mono mt-2 flex items-center gap-1.5 text-[9px] text-mute">
            <Icon name="ruler" size={11} color="var(--color-mute)" />
            fitted in 10 minutes
          </div>
          <div className="mono flex items-center gap-1.5 text-[9px] text-mute">
            <Icon name="tag" size={11} color="var(--color-mute)" />
            delivered in 2 weeks
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShopifyWeb2({ accent }: { accent: string }) {
  const opts = [
    { l: "Color", v: accent },
    { l: "Collar", v: "#a78bfa" },
    { l: "Tuck", v: "#f6b667" },
  ];
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={1} accent={accent} />
      <div className="flex flex-1 gap-4">
        <div className="w-28 shrink-0">
          <Swatch tone={accent} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="mono text-[10px] text-fg">Fine cotton &middot; Men</div>
          <div className="grid grid-cols-3 gap-1.5">
            {opts.map((o) => (
              <div key={o.l} className="flex flex-col items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-1.5 text-center">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.v }} />
                <span className="mono text-[8px] text-mute">{o.l}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="ruler" size={11} color={accent} />
            <Pill text="get fitted in store" accent={accent} />
          </div>
          <div className="mono mt-2 text-[9px] text-mute">order before 12pm &middot; ship in 2 weeks</div>
        </div>
      </div>
    </div>
  );
}

export function ShopifyWeb3({ accent }: { accent: string }) {
  const swatches = [
    { c: accent, name: "Core twill" },
    { c: "#a78bfa", name: "Oxford weave" },
    { c: "#f6b667", name: "Brushed flannel" },
  ];
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={2} accent={accent} />
      <div className="grid flex-1 grid-cols-3 gap-2.5">
        {swatches.map((s, i) => (
          <div key={i} className="space-y-1.5">
            <Swatch tone={s.c} />
            <div className="mono text-[8px] text-mute">{s.name}</div>
            <div className="mono flex items-center gap-1 text-[8px]" style={{ color: s.c }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.c }} />
              in stock
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternCard({
  accent,
  name,
  params,
  active,
}: {
  accent: string;
  name: string;
  params: string;
  active?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{
        borderColor: active ? `${accent}55` : "var(--color-line)",
        background: active ? `${accent}0d` : "var(--color-surface-2)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="mono text-[10px] text-fg">{name}</span>
        <div className="flex items-center gap-1.5">
          <Icon name="edit" size={11} color="var(--color-mute)" />
          <Icon name="copy" size={11} color={accent} />
        </div>
      </div>
      <div className="mono mt-1 text-[8px] text-mute">{params}</div>
    </div>
  );
}

export function ShopifyWeb4({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={NAV} active={1} accent={accent} />
      <div className="mono text-[10px] text-dim">Your saved patterns</div>
      <div className="flex-1 space-y-2">
        <PatternCard accent={accent} name="Fitted 12 Jun" params="36/C &middot; 172cm &middot; slv 61 &middot; col 39" active />
        <PatternCard accent={accent} name="Fitted 3 Mar (2)" params="36/C &middot; 172cm &middot; slv 60 &middot; col 39" />
      </div>
      <div className="flex items-center gap-1.5">
        <Icon name="copy" size={11} color={accent} />
        <Pill text="save as new, never overwrite" accent={accent} />
      </div>
    </div>
  );
}

export function ShopifyMobile1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <Swatch tone={accent} />
      <div className="mono text-[10px] text-fg">One shirt. One story.</div>
      <div className="flex items-center gap-1.5">
        <Icon name="ruler" size={11} color={accent} />
        <Pill text="view collection" accent={accent} />
      </div>
    </div>
  );
}

export function ShopifyMobile2({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <div className="mono text-[9px] text-mute">configure</div>
      <div className="grid grid-cols-2 gap-1.5">
        <Tile label="price" value="$189" accent={accent} />
        <Tile label="ready" value="2wk" />
      </div>
      <div className="flex items-center gap-1.5">
        <Icon name="check" size={11} color={accent} />
        <Pill text="add to cart" accent={accent} solid />
      </div>
    </div>
  );
}

export function ShopifyMobile3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <div className="mono text-[9px] text-mute">your patterns</div>
      <PatternCard accent={accent} name="Fitted 12 Jun" params="36/C &middot; 172cm &middot; slv 61" active />
      <PatternCard accent={accent} name="Fitted 3 Mar (2)" params="36/C &middot; 172cm &middot; slv 60" />
      <Pill text="save as new" accent={accent} />
    </div>
  );
}
