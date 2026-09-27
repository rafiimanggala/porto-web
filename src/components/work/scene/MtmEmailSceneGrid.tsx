"use client";

import { motion, useTransform } from "framer-motion";
import { useSeg, type MV } from "./HealthSceneParts";
import { EMAIL_FLOWS } from "./MtmKitData";
import { T, cellOf } from "./MtmEmailSceneData";
import { gridLeft, gridTop, mixCalc } from "./MtmEmailSceneMath";
import { EmailCard } from "./MtmEmailSceneCard";
import { Plane, TemplateBody, TemplateChip } from "./MtmEmailSceneTemplate";

/* Ten cards, nine recede as the first grows into the template. */

function OtherCard({ p, i, recede }: { p: MV; i: number; recede: MV }) {
  const { col, row } = cellOf(i);
  const opacity = useTransform(recede, (r) => 1 - r);
  const scale = useTransform(recede, (r) => 1 - 0.08 * r);
  const frame = { left: gridLeft(col), top: gridTop(row), width: "var(--colw)", height: "var(--rowh)", opacity, scale };
  return <EmailCard p={p} i={i} frame={frame} />;
}

function Flash({ p }: { p: MV }) {
  const t = useSeg(p, T.arrive[0], T.arrive[1]);
  const opacity = useTransform(t, (v) => Math.sin(Math.PI * v) * 0.35);
  return <motion.i aria-hidden style={{ opacity }} className="pointer-events-none absolute inset-0 bg-fg" />;
}

function HeroCard({ p, expand }: { p: MV; expand: MV }) {
  const show = useSeg(expand, 0.6, 0.95);
  const bodyIn = useSeg(expand, 0.4, 0.9);
  const bodyOut = useSeg(p, T.bodyOut[0], T.bodyOut[1]);
  const bodyOpacity = useTransform([bodyIn, bodyOut], ([a, o]: number[]) => a * (1 - o));
  const left = useTransform(expand, (e) => mixCalc(gridLeft(0), "var(--tl)", e));
  const top = useTransform(expand, (e) => mixCalc(gridTop(0), "var(--tt)", e));
  const width = useTransform(expand, (e) => mixCalc("var(--colw)", "var(--tw)", e));
  const height = useTransform(expand, (e) => mixCalc("var(--rowh)", "var(--th)", e));
  const extras = {
    band: (
      <>
        <Flash p={p} />
        <TemplateChip p={p} show={show} />
      </>
    ),
    body: (
      <motion.div style={{ opacity: bodyOpacity }} className="shrink-0">
        <TemplateBody p={p} />
      </motion.div>
    ),
    overlay: <Plane p={p} />,
  };
  return <EmailCard p={p} i={0} frame={{ left, top, width, height, zIndex: 20 }} extras={extras} />;
}

export function CardGrid({ p, expand, recede }: { p: MV; expand: MV; recede: MV }) {
  return (
    <>
      {EMAIL_FLOWS.slice(1).map((flow, k) => (
        <OtherCard key={flow.id} p={p} i={k + 1} recede={recede} />
      ))}
      <HeroCard p={p} expand={expand} />
    </>
  );
}
