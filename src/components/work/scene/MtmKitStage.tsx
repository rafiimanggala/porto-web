"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { MONO } from "./HealthSceneParts";
import { PRODUCT, SERVICE } from "./MtmKitData";
import { MtmGlyph, type MtmGlyphName } from "./MtmKitGlyphs";
import { toneTint, useMv, type MvIn } from "./MtmKitMath";

/* Frames of the made-to-measure scenes: the storefront window and the tile of an external system. */

const SHADOW = "shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]";

function Dots() {
  return (
    <span aria-hidden className="flex shrink-0 gap-1.5">
      {(["rose", "sun", "mint"] as const).map((tone) => (
        <i key={tone} className="h-2 w-2 rounded-full" style={{ background: toneTint(tone, 0.7) }} />
      ))}
    </span>
  );
}

type StoreWindowProps = {
  /** Optional page heading under the address bar, e.g. the product name. */
  title?: ReactNode;
  /** Path shown in the address pill. Default "/products/tailored-shirt". */
  path?: string;
  /** 0..1: a thin accent load line along the bottom of the bar, e.g. a request in flight. */
  load?: MvIn;
  children?: ReactNode;
  className?: string;
};

/** Browser-like window. Fills its parent (h-full w-full). The body is a positioned box and a size container (@container). */
export function StoreWindow({ title, path = PRODUCT.path, load = 0, children, className = "" }: StoreWindowProps) {
  const l = useMv(load);
  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-line-strong bg-surface-1 ${SHADOW} ${className}`}>
      <div className="relative flex h-8 shrink-0 items-center gap-2.5 border-b border-line bg-surface-2 px-2.5">
        <Dots />
        <span className={`${MONO} flex h-5 min-w-0 flex-1 items-center truncate rounded-full bg-surface-1 px-2.5 text-[10px] leading-none text-dim`}>{path}</span>
        <motion.i aria-hidden style={{ scaleX: l }} className="absolute -bottom-px left-0 h-[2px] w-full origin-left bg-accent" />
      </div>
      {title ? <div className="flex h-9 shrink-0 items-center border-b border-line px-3 text-[13px] font-medium text-fg">{title}</div> : null}
      <div className="@container relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

type ServiceBoxProps = {
  /** Name in mono type, e.g. "Pattern service". Default from the shared data. */
  label?: string;
  /** Second mono line, e.g. "REST API". Default from the shared data. */
  sub?: string;
  glyph?: MtmGlyphName;
  /** 0..1: accent frame, the system is busy. */
  active?: MvIn;
  children?: ReactNode;
  className?: string;
};

/** Neutral tile for an external system. Dashed frame: it lives outside the theme. Height follows its content unless className sets one. */
export function ServiceBox({ label = SERVICE.label, sub = SERVICE.kind, glyph = "server", active = 0, children, className = "" }: ServiceBoxProps) {
  const a = useMv(active);
  return (
    <div aria-hidden className={`relative flex w-full flex-col rounded-xl border border-dashed border-line-strong bg-surface-1/70 p-2.5 ${className}`}>
      <motion.i style={{ opacity: a }} className="pointer-events-none absolute -inset-px rounded-xl border-2 border-accent" />
      <div className="relative flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-2">
          <MtmGlyph name={glyph} size={22} />
        </span>
        <div className={`${MONO} min-w-0 leading-tight`}>
          <p className="truncate text-[11px] text-fg">{label}</p>
          <p className="truncate text-[10px] text-mute">{sub}</p>
        </div>
      </div>
      {children ? <div className="relative mt-2 min-h-0 flex-1">{children}</div> : null}
    </div>
  );
}
