"use client";

import { motion, motionValue, useTransform, type MotionValue } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { u } from "./MobileSceneKit";
import { HEAD, QCARD, QUIZ, T } from "./EduPhoneSceneData";
import type { Flow } from "./EduPhoneSceneMath";
import { Flash, Header, useBeat, useRect, type SV, type Type } from "./EduPhoneSceneKit";

/* Quiz card. The question sits beside a small Punnett square; the four answers
   are one row of chips on the laptop and drop, last first, into a stack of
   full-width buttons on the phone. */

type Props = { p: MV; flow: MotionValue<Flow>; type: Type };

export const LETTERS = ["A", "B", "C", "D"] as const;

const HOT_MIX = 0.85;
const NO_HOT = motionValue(0);

function Cell({ i, label, fontSize, hot }: { i: number; label: string; fontSize: SV | string; hot?: MV }) {
  const lit = i === QUIZ.hotCell;
  const wash = useTransform(hot ?? NO_HOT, (v) => v * HOT_MIX);
  const ink = useTransform(hot ?? NO_HOT, (v) => `color-mix(in oklab, var(--color-bg) ${(v * 100).toFixed(1)}%, var(--color-fg))`);
  return (
    <motion.span
      style={{ fontSize, lineHeight: 1, color: lit && hot ? ink : undefined }}
      className={`relative grid place-items-center text-fg ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t" : ""} border-line ${lit ? "bg-accent/30" : ""}`}
    >
      {lit && hot ? <motion.i aria-hidden style={{ opacity: wash, background: "var(--color-mint)" }} className="absolute inset-0" /> : null}
      <span className="relative">{label}</span>
    </motion.span>
  );
}

export function Punnett({ size, fontSize, hot }: { size: SV | string; fontSize: SV | string; hot?: MV }) {
  return (
    <motion.div
      style={{ width: size, height: size, borderRadius: u(3) }}
      className="relative grid grid-cols-2 grid-rows-2 overflow-hidden border border-line-strong bg-surface-2"
    >
      {QUIZ.cells.map((cell, i) => (
        <Cell key={i} i={i} label={cell} fontSize={fontSize} hot={hot} />
      ))}
    </motion.div>
  );
}

function Chip({ p, flow, type, i }: Props & { i: number }) {
  const geo = useTransform(flow, (f) => f.quiz.chips[i]);
  const rect = useTransform(flow, (f) => {
    const c = f.quiz.chips[i];
    return { x: QCARD.pad + c.x, y: QCARD.pad + f.quiz.qH + QCARD.qGap + c.y, w: c.w, h: c.h };
  });
  const box = useRect(rect, (r) => r);
  const letter = useTransform(geo, (c) => c.k);
  const a = T.quizBeat.start + (i + 1) * T.quizBeat.step;
  const beat = useBeat(p, a, a + T.quizBeat.dur);
  return (
    <motion.div
      style={{ ...box, borderRadius: u(4) }}
      className="absolute grid place-items-center overflow-hidden border border-line-strong bg-surface-2"
    >
      <motion.b style={{ opacity: letter, left: u(6), fontSize: type.label }} className="absolute font-semibold text-dim">
        {LETTERS[i]}
      </motion.b>
      <motion.span style={{ fontSize: type.body, lineHeight: 1 }} className="tabular-nums text-fg">
        {QUIZ.answers[i]}
      </motion.span>
      <Flash beat={beat} />
    </motion.div>
  );
}

export default function QuizGroup(props: Props) {
  const { p, flow, type } = props;
  const box = useRect(flow, (f) => f.quiz.rect);
  const cardH = useTransform(flow, (f) => u(f.quiz.cardH));
  const qSize = useTransform(flow, (f) => u(f.quiz.qH));
  const qRight = useTransform(flow, (f) => u(QCARD.pad + f.quiz.qH + 5));
  const beat = useBeat(p, T.quizBeat.start, T.quizBeat.start + T.quizBeat.dur);
  return (
    <motion.div style={box} className="absolute">
      <Header type={type}>{QUIZ.head}</Header>
      <motion.div
        style={{ top: u(HEAD), height: cardH, borderRadius: u(6) }}
        className="absolute inset-x-0 overflow-hidden border border-line bg-surface-1"
      >
        <motion.p
          style={{ left: u(QCARD.pad + 1), top: u(QCARD.pad), right: qRight, height: qSize, fontSize: type.body, lineHeight: 1.15 }}
          className="absolute overflow-hidden text-fg"
        >
          {QUIZ.question}
        </motion.p>
        <motion.div style={{ right: u(QCARD.pad), top: u(QCARD.pad), width: qSize, height: qSize }} className="absolute">
          <Punnett size="100%" fontSize={type.label} />
        </motion.div>
        {QUIZ.answers.map((a, i) => (
          <Chip key={a} {...props} i={i} />
        ))}
        <Flash beat={beat} />
      </motion.div>
    </motion.div>
  );
}
