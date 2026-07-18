import { NavTabs, Pill, Tile } from "./frame";

/* Illustrative recreation of the made-to-measure storefront, not a
   screenshot: generic labels/placeholder swatches in this site's own
   visual language, no client photography or copy reproduced. */

function Swatch({ tone }: { tone: string }) {
  return (
    <div
      className="aspect-[3/4] w-full rounded-lg border border-line"
      style={{ background: `linear-gradient(160deg, ${tone}33, var(--color-surface-2))` }}
    />
  );
}

export function ShopifyWeb1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={["Shop", "Get fitted", "Collections", "Account"]} active={0} accent={accent} />
      <div className="flex flex-1 items-center gap-4">
        <div className="w-28 shrink-0">
          <Swatch tone={accent} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="mono text-[13px] font-medium text-fg">One shirt.</div>
          <div className="mono text-[13px] font-medium" style={{ color: accent }}>One story.</div>
          <div className="mono mt-2 text-[9px] text-mute">fitted in 10 minutes</div>
          <div className="mono text-[9px] text-mute">delivered in 2 weeks</div>
        </div>
      </div>
    </div>
  );
}

export function ShopifyWeb2({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={["Shop", "Get fitted", "Collections", "Account"]} active={1} accent={accent} />
      <div className="flex flex-1 gap-4">
        <div className="w-28 shrink-0">
          <Swatch tone={accent} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="mono text-[10px] text-fg">Fine cotton &middot; Men</div>
          <div className="grid grid-cols-3 gap-1.5">
            {["Color", "Collar", "Tuck"].map((l) => (
              <div key={l} className="rounded-md border border-line bg-surface-2 px-2 py-1.5 text-center">
                <span className="mono text-[8px] text-mute">{l}</span>
              </div>
            ))}
          </div>
          <Pill text="get fitted in store" accent={accent} />
          <div className="mono mt-2 text-[9px] text-mute">order before 12pm &middot; ship in 2 weeks</div>
        </div>
      </div>
    </div>
  );
}

export function ShopifyWeb3({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <NavTabs items={["Shop", "Get fitted", "Collections", "Account"]} active={2} accent={accent} />
      <div className="grid flex-1 grid-cols-3 gap-2.5">
        {[accent, "#a78bfa", "#f6b667"].map((c, i) => (
          <div key={i} className="space-y-1.5">
            <Swatch tone={c} />
            <div className="mono text-[8px] text-mute">Core twill</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShopifyMobile1({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col gap-2 pt-2">
      <Swatch tone={accent} />
      <div className="mono text-[10px] text-fg">One shirt. One story.</div>
      <Pill text="view collection" accent={accent} />
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
      <Pill text="add to cart" accent={accent} solid />
    </div>
  );
}
