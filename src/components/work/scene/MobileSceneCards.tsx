"use client";

import type { ComponentType } from "react";
import type { MV } from "./HealthSceneParts";
import { BIO, BLOOD, DOMAINS, INSIGHTS, INSIGHT_EXTRA, SPARK, WEARABLE, type BloodRow, type CardKey } from "./MobileSceneData";
import { Pane, TXT, Title, Wipe, u } from "./MobileSceneKit";
import { CardHead } from "./MobileSceneIcons";
import { BioPhone, BloodPhone, DomainsPhone, InsightsPhone, WearablePhone, type BodyProps } from "./MobileScenePhone";

/* Card bodies: the wide variants live here, the phone variants in MobileScenePhone. `a` is where the card starts to draw in. */

const ACCENT = "var(--color-accent)";
const MINT = "var(--color-mint)";
const ROW_LEAD = 0.02;
const ROW_STEP = 0.008;
const ROW_DUR = 0.03;
const rowAt = (a: number, i: number) => a + ROW_LEAD + i * ROW_STEP;

function Dot({ color }: { color: string }) {
  return <i className="shrink-0 rounded-full" style={{ width: u(5), height: u(5), background: color }} />;
}

const flagColor = (flag?: BloodRow["flag"]) => (flag ? ACCENT : MINT);

function BloodWideRow({ p, at, row }: { p: MV; at: number; row: BloodRow }) {
  return (
    <Wipe p={p} a={at} b={at + ROW_DUR} className="flex items-center justify-between border-b border-line" style={{ height: u(13), ...TXT.xs }}>
      <span className="flex items-center text-fg" style={{ gap: u(4) }}>
        <Dot color={flagColor(row.flag)} />
        {row.k}
      </span>
      <span className="tabular-nums text-dim">{row.v}</span>
    </Wipe>
  );
}

function BloodWide({ p, a }: BodyProps) {
  return (
    <Pane>
      <CardHead p={p} a={a} card="blood" wide>Blood</CardHead>
      <div style={{ marginTop: u(2) }}>
        {BLOOD.map((row, i) => (
          <BloodWideRow key={row.k} p={p} at={rowAt(a, i)} row={row} />
        ))}
      </div>
    </Pane>
  );
}

const DOMAIN_COLS = `${u(52)} 1fr ${u(13)}`;

function DomainWideRow({ p, at, label, value }: { p: MV; at: number; label: string; value: number }) {
  return (
    <Wipe p={p} a={at} b={at + ROW_DUR} className="grid items-center" style={{ height: u(12), gridTemplateColumns: DOMAIN_COLS, gap: u(3), ...TXT.xs }}>
      <span className="truncate text-dim">{label}</span>
      <span className="block bg-line-strong" style={{ height: u(2.5), borderRadius: u(2) }}>
        <i className="block h-full origin-left" style={{ width: `${value}%`, background: MINT, borderRadius: u(2) }} />
      </span>
      <span className="text-right tabular-nums text-fg">{value}</span>
    </Wipe>
  );
}

const SHORT_LABEL: Record<string, string> = { "Body comp": "Body" };

function DomainsWide({ p, a }: BodyProps) {
  return (
    <Pane>
      <Title>Domains</Title>
      <div style={{ marginTop: u(2) }}>
        {DOMAINS.map((d, i) => (
          <DomainWideRow key={d.k} p={p} at={rowAt(a, i)} label={SHORT_LABEL[d.k] ?? d.k} value={d.v} />
        ))}
      </div>
    </Pane>
  );
}

const WIDE_INSIGHTS = [...INSIGHTS.map(({ t, tone }) => ({ t, tone })), ...INSIGHT_EXTRA];

function InsightWideRow({ p, at, title, tone }: { p: MV; at: number; title: string; tone: string }) {
  return (
    <Wipe p={p} a={at} b={at + ROW_DUR} className="flex items-center border-b border-line text-fg" style={{ height: u(13), gap: u(4), ...TXT.xs }}>
      <Dot color={tone} />
      <span className="whitespace-nowrap">{title}</span>
    </Wipe>
  );
}

function InsightsWide({ p, a }: BodyProps) {
  return (
    <Pane>
      <CardHead p={p} a={a} card="insights" wide>Insights</CardHead>
      <div style={{ marginTop: u(2) }}>
        {WIDE_INSIGHTS.map((r, i) => (
          <InsightWideRow key={r.t} p={p} at={rowAt(a, i)} title={r.t} tone={r.tone} />
        ))}
      </div>
    </Pane>
  );
}

const SPARK_MIN = Math.min(...SPARK);
const SPARK_MAX = Math.max(...SPARK);
const SPARK_POINTS = SPARK.map((v, i) => {
  const x = (i / (SPARK.length - 1)) * 120;
  const y = 18 - ((v - SPARK_MIN) / (SPARK_MAX - SPARK_MIN)) * 16;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ");

function Spark() {
  return (
    <svg viewBox="0 0 120 20" preserveAspectRatio="none" className="w-full" style={{ height: u(14), minHeight: u(5), flexShrink: 1, marginTop: u(3) }}>
      <polyline
        points={SPARK_POINTS}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ stroke: MINT }}
      />
    </svg>
  );
}

function WearableWideRow({ p, at, label, value }: { p: MV; at: number; label: string; value: string }) {
  return (
    <Wipe p={p} a={at} b={at + ROW_DUR} className="flex items-center justify-between border-b border-line" style={{ height: u(12.5), ...TXT.xs }}>
      <span className="text-dim">{label}</span>
      <span className="tabular-nums text-fg">{value}</span>
    </Wipe>
  );
}

function WearableWide({ p, a }: BodyProps) {
  return (
    <Pane>
      <CardHead p={p} a={a} card="wearable" wide>Wearable</CardHead>
      <div style={{ marginTop: u(2) }}>
        {WEARABLE.map((w, i) => (
          <WearableWideRow key={w.k} p={p} at={rowAt(a, i)} label={w.long} value={`${w.v} ${w.u}`.trim()} />
        ))}
      </div>
      <Spark />
    </Pane>
  );
}

const GAUGE_FRAC = 0.3875;
const GAUGE = { cx: 50, cy: 50, r: 40 };
const gaugePoint = (frac: number) => {
  const theta = Math.PI * (1 - frac);
  return { x: GAUGE.cx + GAUGE.r * Math.cos(theta), y: GAUGE.cy - GAUGE.r * Math.sin(theta) };
};
const GAUGE_DOT = gaugePoint(GAUGE_FRAC);
const GAUGE_PATH = "M10 50 A40 40 0 0 1 90 50";

function BioWide({ p, a }: BodyProps) {
  return (
    <Pane>
      <CardHead p={p} a={a} card="bio" wide>Bio age</CardHead>
      <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: u(3) }}>
        <svg viewBox="0 0 100 56" style={{ width: u(70), height: u(39) }}>
          <path d={GAUGE_PATH} fill="none" strokeWidth="8" strokeLinecap="round" style={{ stroke: "var(--color-line-strong)" }} />
          <path d={GAUGE_PATH} fill="none" strokeWidth="8" strokeLinecap="round" pathLength={1} strokeDasharray={`${GAUGE_FRAC} 1`} style={{ stroke: MINT }} />
          <circle cx={GAUGE_DOT.x} cy={GAUGE_DOT.y} r="4.5" style={{ fill: ACCENT }} />
        </svg>
        <Wipe p={p} a={a + 0.06} b={a + 0.1} className="flex items-baseline" style={{ gap: u(5) }}>
          <span className="t-hero" style={{ fontSize: u(19) }}>{BIO.age}</span>
          <span className="text-dim" style={TXT.xs}>{BIO.speed} speed</span>
        </Wipe>
      </div>
    </Pane>
  );
}

export const BODIES: Record<Exclude<CardKey, "score">, { wide: ComponentType<BodyProps>; phone: ComponentType<BodyProps> }> = {
  domains: { wide: DomainsWide, phone: DomainsPhone },
  insights: { wide: InsightsWide, phone: InsightsPhone },
  bio: { wide: BioWide, phone: BioPhone },
  blood: { wide: BloodWide, phone: BloodPhone },
  wearable: { wide: WearableWide, phone: WearablePhone },
};
