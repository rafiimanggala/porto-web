"use client";

import type { CSSProperties } from "react";
import type { MV } from "./HealthSceneParts";
import { BIO, BLOOD, DOMAINS, INSIGHTS, WEARABLE, type Insight } from "./MobileSceneData";
import { Pane, PhoneTitle, font, floorPx, pt, u, useLayout } from "./MobileSceneKit";
import { CardHead } from "./MobileSceneIcons";

export type BodyProps = { p: MV; a: number };

const MINT = "var(--color-mint)";
const PAD = { roomy: 6.3, tight: 7.5 };
const HAIR = `max(${pt(4)}, ${floorPx(2)})`;

const body: CSSProperties = { fontSize: font(14), lineHeight: 1.2 };
const cap: CSSProperties = { fontSize: font(12), lineHeight: 1.2 };
const medium: CSSProperties = { fontWeight: 500 };

function usePad() {
  return useLayout().tight ? PAD.tight : PAD.roomy;
}

function Dot({ color }: { color: string }) {
  return <i className="shrink-0 rounded-full" style={{ width: pt(8), height: pt(8), background: color }} />;
}

function InsightRow({ row, last }: { row: Insight; last: boolean }) {
  return (
    <div className={`flex min-h-0 flex-1 items-center ${last ? "" : "border-b border-line"}`} style={{ gap: pt(9) }}>
      <Dot color={row.tone} />
      <span className="flex min-w-0 flex-col" style={{ gap: pt(1) }}>
        <span className="truncate text-fg" style={{ ...body, ...medium }}>
          {row.t}
        </span>
        <span className="truncate text-dim" style={cap}>
          {row.d}
        </span>
      </span>
    </div>
  );
}

export function InsightsPhone({ p, a }: BodyProps) {
  const { tight } = useLayout();
  const rows = tight ? INSIGHTS.slice(0, 2) : INSIGHTS;
  return (
    <Pane pad={usePad()}>
      <CardHead p={p} a={a} card="insights" wide={false}>
        Insights
      </CardHead>
      <div className="flex min-h-0 flex-1 flex-col" style={{ marginTop: pt(4) }}>
        {rows.map((row, i) => (
          <InsightRow key={row.t} row={row} last={i === rows.length - 1} />
        ))}
      </div>
    </Pane>
  );
}

export function BioPhone({ p, a }: BodyProps) {
  return (
    <Pane pad={usePad()}>
      <CardHead p={p} a={a} card="bio" wide={false}>
        Bio age
      </CardHead>
      <p className="flex min-h-0 flex-1 items-center" style={{ gap: pt(10) }}>
        <span className="t-hero tabular-nums" style={{ fontSize: pt(30), lineHeight: 1 }}>
          {BIO.age}
        </span>
        <span className="truncate text-dim" style={body}>
          ageing speed {BIO.speed}
        </span>
      </p>
    </Pane>
  );
}

function Tile({ k, v, hot }: { k: string; v: string; hot?: boolean }) {
  return (
    <div
      className={`flex min-w-0 items-center justify-between border bg-surface-2 ${hot ? "border-accent" : "border-transparent"}`}
      style={{ ...body, padding: `0 ${pt(10)}`, borderRadius: u(4), gap: pt(8) }}
    >
      <span className={`truncate ${hot ? "text-accent" : "text-dim"}`}>{k}</span>
      <span className="shrink-0 tabular-nums text-fg" style={medium}>
        {v}
      </span>
    </div>
  );
}

const FLAGGED = BLOOD.filter((r) => r.flag).length;
const TIGHT_BLOOD = BLOOD.filter((r) => r.k !== "HbA1c");

export function BloodPhone({ p, a }: BodyProps) {
  const { tight } = useLayout();
  const rows = tight ? TIGHT_BLOOD : BLOOD;
  return (
    <Pane pad={usePad()}>
      <CardHead p={p} a={a} card="blood" wide={false}>
        Blood
      </CardHead>
      <div className="grid min-h-0 flex-1 grid-cols-2" style={{ marginTop: pt(8), gap: pt(6), gridAutoRows: "minmax(0, 1fr)" }}>
        {rows.map((row) => (
          <Tile key={row.k} k={row.k} v={row.v} hot={Boolean(row.flag)} />
        ))}
        {tight ? null : <Tile k="Flags" v={String(FLAGGED)} hot />}
      </div>
    </Pane>
  );
}

function DomainChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-0 flex-col justify-center bg-surface-2" style={{ padding: `0 ${pt(10)}`, borderRadius: u(4), gap: pt(5) }}>
      <div className="flex items-baseline justify-between" style={{ ...body, gap: pt(8) }}>
        <span className="truncate text-dim">{label}</span>
        <span className="shrink-0 tabular-nums text-fg" style={medium}>
          {value}
        </span>
      </div>
      <span className="block bg-line-strong" style={{ height: HAIR, borderRadius: u(2) }}>
        <i className="block h-full" style={{ width: `${value}%`, background: MINT, borderRadius: u(2) }} />
      </span>
    </div>
  );
}

export function DomainsPhone() {
  return (
    <Pane pad={usePad()}>
      <PhoneTitle>Domains</PhoneTitle>
      <div className="grid min-h-0 flex-1 grid-cols-2" style={{ marginTop: pt(8), gap: pt(6), gridAutoRows: "minmax(0, 1fr)" }}>
        {DOMAINS.map((d) => (
          <DomainChip key={d.k} label={d.k} value={d.v} />
        ))}
      </div>
    </Pane>
  );
}

function VitalTile({ name, value, unit }: { name: string; value: string; unit: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center bg-surface-2" style={{ borderRadius: u(4), gap: pt(1) }}>
      <span className="tabular-nums text-fg" style={{ fontSize: font(15), lineHeight: 1.15, fontWeight: 600 }}>
        {value}
        <span className="text-dim" style={{ fontWeight: 400 }}>
          {unit === "%" ? "%" : ""}
        </span>
      </span>
      <span className="text-dim" style={cap}>
        {name}
      </span>
    </div>
  );
}

export function WearablePhone({ p, a }: BodyProps) {
  return (
    <Pane pad={usePad()}>
      <CardHead p={p} a={a} card="wearable" wide={false}>
        Wearable
      </CardHead>
      <div className="grid min-h-0 flex-1 grid-cols-4" style={{ marginTop: pt(8), gap: pt(6) }}>
        {WEARABLE.map((w) => (
          <VitalTile key={w.k} name={w.k} value={w.v} unit={w.u} />
        ))}
      </div>
    </Pane>
  );
}
