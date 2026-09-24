"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { u } from "./MobileSceneKit";
import { HEAD, HOME_LESSONS, LESSONS, T, type LessonState } from "./EduPhoneSceneData";
import type { Flow } from "./EduPhoneSceneMath";
import { Flash, Header, useBeat, useRect, type Type } from "./EduPhoneSceneKit";
import { BookIcon } from "./EduPhoneSceneIcons";

/* Lesson list. Three rows on the laptop, narrow cards with a gap; on the phone
   the same rows sit tighter and the list takes the full width. Rows are laid out
   by flex, so only the row height and the group width are animated. */

type Props = { p: MV; flow: MotionValue<Flow>; type: Type };

export const LEVEL_TINT = ["var(--color-sky)", "var(--color-sun)"] as const;

export function StateDot({ state, size }: { state: LessonState; size: number }) {
  const solid = state !== "todo";
  return (
    <i
      aria-hidden
      className="shrink-0 rounded-full border"
      style={{
        width: u(size),
        height: u(size),
        background: state === "done" ? "var(--color-mint)" : state === "open" ? "var(--color-accent)" : "transparent",
        borderColor: solid ? "transparent" : "var(--color-line-strong)",
      }}
    />
  );
}

export function LevelChip({ level, fontSize }: { level: 1 | 2; fontSize: MotionValue<string> | string }) {
  return (
    <motion.span
      style={{ fontSize, lineHeight: 1, padding: `${u(2)} ${u(3)}`, borderRadius: u(3), background: `color-mix(in oklab, ${LEVEL_TINT[level - 1]} 38%, transparent)` }}
      className={`${MONO} shrink-0 text-fg`}
    >
      L{level}
    </motion.span>
  );
}

function Row({ p, flow, type, i }: Props & { i: number }) {
  const lesson = LESSONS[i];
  const top = useTransform(flow, (f) => u(HEAD + i * (f.lessons.rowH + f.lessons.rowGap)));
  const height = useTransform(flow, (f) => u(f.lessons.rowH));
  const a = T.listBeat.start + i * T.listBeat.step;
  const beat = useBeat(p, a, a + T.listBeat.dur);
  return (
    <motion.div
      style={{ top, height, borderRadius: u(4), paddingInline: u(5), gap: u(5) }}
      className="absolute inset-x-0 flex items-center overflow-hidden border border-line bg-surface-1"
    >
      <span className="block shrink-0" style={{ width: u(12), height: u(12) }}>
        <BookIcon />
      </span>
      <motion.span style={{ fontSize: type.body, lineHeight: 1.1 }} className="min-w-0 flex-1 truncate text-fg">
        {lesson.title}
      </motion.span>
      <LevelChip level={lesson.level} fontSize={type.label} />
      <StateDot state={lesson.state} size={6} />
      <Flash beat={beat} />
    </motion.div>
  );
}

export default function LessonsGroup(props: Props) {
  const box = useRect(props.flow, (f) => f.lessons.rect);
  return (
    <motion.div style={box} className="absolute">
      <Header type={props.type}>Lessons &middot; Year 10</Header>
      {LESSONS.slice(0, HOME_LESSONS).map((l, i) => (
        <Row key={l.title} {...props} i={i} />
      ))}
    </motion.div>
  );
}
