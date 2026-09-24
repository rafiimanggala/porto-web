"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { u } from "./MobileSceneKit";
import { M, QUIZ, T } from "./EduPhoneSceneData";
import { PAGE_BODY_TOP, PageShell, PageTitle, Tap, font } from "./EduPhoneSceneKit";
import { LETTERS, Punnett } from "./EduPhoneSceneQuiz";
import { CheckIcon } from "./EduPhoneSceneIcons";

/* Phone page 3: the question card and four full-width answers at real phone size.
   Tapping the right answer turns it green and lights the matching Punnett cell. */

const CARD_H = 62;
const GRID = 44;
const ANS_TOP = PAGE_BODY_TOP + CARD_H + 9;
const ANS_H = 30;
const ANS_GAP = 6;
const FEED_TOP = ANS_TOP + 4 * ANS_H + 3 * ANS_GAP + 9;

function Answer({ p, i, chosen }: { p: MV; i: number; chosen: MV }) {
  const right = i === QUIZ.correct;
  const border = useTransform(chosen, (v) => (right ? `color-mix(in oklab, var(--color-mint) ${(v * 100).toFixed(1)}%, var(--color-line-strong))` : "var(--color-line-strong)"));
  const fade = useTransform(chosen, (v) => (right ? 1 : 1 - 0.55 * v));
  const tint = useTransform(chosen, (v) => (right ? v * 0.22 : 0));
  const mark = useSeg(p, T.tapAnswer[0] + 0.006, T.tapAnswer[1], easeOutBack);
  return (
    <motion.div
      style={{ top: u(ANS_TOP + i * (ANS_H + ANS_GAP)), left: u(M), right: u(M), height: u(ANS_H), borderRadius: u(5), paddingInline: u(7), gap: u(7), borderColor: border, opacity: fade }}
      className="absolute flex items-center overflow-hidden border bg-surface-2"
    >
      <motion.i aria-hidden style={{ opacity: tint, background: "var(--color-mint)" }} className="pointer-events-none absolute inset-0" />
      <span
        className={`${MONO} relative grid shrink-0 place-items-center rounded-full border border-line-strong text-dim`}
        style={{ width: u(14), height: u(14), fontSize: font(12, 10.5), lineHeight: 1 }}
      >
        {LETTERS[i]}
      </span>
      <span className="relative flex-1 tabular-nums text-fg" style={{ fontSize: font(14, 10.5), lineHeight: 1 }}>
        {QUIZ.answers[i]}
      </span>
      {right ? (
        <motion.span
          style={{ scale: mark, opacity: mark, width: u(12), height: u(12), color: "var(--color-mint)" }}
          className="relative block shrink-0"
        >
          <CheckIcon />
        </motion.span>
      ) : null}
    </motion.div>
  );
}

export function QuizPage({ p }: { p: MV }) {
  const chosen = useSeg(p, T.tapAnswer[0], T.tapAnswer[1], easeOutCubic);
  const feedback = useSeg(p, T.feedback[0], T.feedback[1]);
  const feedY = useTransform(feedback, (v) => u(4 * (1 - v)));
  return (
    <PageShell k={3}>
      <PageTitle title="Quiz" caption={QUIZ.chip} />
      <div
        className="absolute flex items-start justify-between border border-line bg-surface-1"
        style={{ left: u(M), right: u(M), top: u(PAGE_BODY_TOP), height: u(CARD_H), borderRadius: u(6), padding: u(7), gap: u(6) }}
      >
        <div className="flex min-w-0 flex-col" style={{ gap: u(4) }}>
          <span className={`${MONO} uppercase tracking-[0.08em] text-mute`} style={{ fontSize: font(12, 10.5), lineHeight: 1 }}>
            Question 1 of 5
          </span>
          <span className="font-medium text-fg" style={{ fontSize: font(15, 10.5), lineHeight: 1.15 }}>
            {QUIZ.question}
          </span>
        </div>
        <div className="shrink-0" style={{ width: u(GRID), height: u(GRID) }}>
          <Punnett size="100%" fontSize={font(14, 10.5)} hot={chosen} />
        </div>
      </div>
      {QUIZ.answers.map((a, i) => (
        <Answer key={a} p={p} i={i} chosen={chosen} />
      ))}
      <motion.p
        style={{ opacity: feedback, y: feedY, left: u(M), top: u(FEED_TOP), fontSize: font(12, 10.5), lineHeight: 1.2, color: "var(--color-mint)" }}
        className="absolute"
      >
        {QUIZ.feedback}
      </motion.p>
      <Tap p={p} span={T.tapAnswer} style={{ left: u(M + 20), top: u(ANS_TOP + ANS_H / 2) }} />
    </PageShell>
  );
}
