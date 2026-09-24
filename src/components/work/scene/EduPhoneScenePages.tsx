"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { u } from "./MobileSceneKit";
import { LESSONS, M, SUBJECTS, T, type Lesson, type Subject } from "./EduPhoneSceneData";
import { PAGE_BODY_TOP, PageShell, PageTitle, Tap, font, useBeat } from "./EduPhoneSceneKit";
import { BookIcon, CheckIcon, SubjectGlyph } from "./EduPhoneSceneIcons";

/* Phone pages 1 and 2: the subject grid at real phone size (two per row) and the
   full-width lesson list. Text follows the 390 pt scale with rendered floors. */

const TILE_W = 77.5;
const TILE_H = 100;
const TILE_GAP = 5;
const ROW_H = 40;
const ROW_GAP = 3;

function AccBar({ p, acc, tint }: { p: MV; acc: number | null; tint: string }) {
  const fill = useSeg(p, T.bars[0], T.bars[1], easeOutCubic);
  const scaleX = useTransform(fill, (v) => (v * (acc ?? 0)) / 100);
  return (
    <div className="flex items-center" style={{ gap: u(4) }}>
      <div className="relative flex-1 overflow-hidden rounded-full bg-line-strong" style={{ height: u(3) }}>
        <motion.i style={{ scaleX, background: tint }} className="absolute inset-0 origin-left" />
      </div>
      <span className="tabular-nums text-dim" style={{ fontSize: font(12, 10.5), lineHeight: 1 }}>
        {acc === null ? "new" : `${acc}%`}
      </span>
    </div>
  );
}

function BigTile({ p, s, i }: { p: MV; s: Subject; i: number }) {
  const left = M + (i % 2) * (TILE_W + TILE_GAP);
  const top = PAGE_BODY_TOP + Math.floor(i / 2) * (TILE_H + TILE_GAP);
  const beat = useBeat(p, T.tapTile[0], T.tapTile[1]);
  const ring = useTransform(beat, (v) => (i === 0 ? v : 0));
  return (
    <motion.div
      style={{ left: u(left), top: u(top), width: u(TILE_W), height: u(TILE_H), borderTopColor: s.tint, borderTopWidth: u(1.2), borderRadius: u(6), padding: u(7) }}
      className="absolute flex flex-col justify-between border border-line bg-surface-1"
    >
      <motion.i aria-hidden style={{ opacity: ring, borderRadius: "inherit" }} className="pointer-events-none absolute inset-0 border-2 border-accent" />
      <span className="block" style={{ width: u(28), height: u(28) }}>
        <SubjectGlyph name={s.glyph} />
      </span>
      <div className="flex flex-col" style={{ gap: u(3) }}>
        <span className="truncate font-medium text-fg" style={{ fontSize: font(15, 10.5), lineHeight: 1.1 }}>
          {s.name}
        </span>
        <span className="truncate text-dim" style={{ fontSize: font(12, 10.5), lineHeight: 1.1 }}>
          {s.sub}
        </span>
        <span className={`${MONO} truncate text-mute`} style={{ fontSize: font(12, 10.5), lineHeight: 1.1 }}>
          {s.count} lessons
        </span>
        <div style={{ marginTop: u(2) }}>
          <AccBar p={p} acc={s.acc} tint={s.tint} />
        </div>
      </div>
    </motion.div>
  );
}

export function SubjectsPage({ p }: { p: MV }) {
  const tapX = M + TILE_W / 2;
  const tapY = PAGE_BODY_TOP + TILE_H / 2;
  return (
    <PageShell k={1}>
      <PageTitle title="Subjects" caption="Year 10 · 4 subjects" />
      {SUBJECTS.map((s, i) => (
        <BigTile key={s.name} p={p} s={s} i={i} />
      ))}
      <Tap p={p} span={T.tapTile} style={{ left: u(tapX), top: u(tapY) }} />
    </PageShell>
  );
}

function Progress({ p, lesson }: { p: MV; lesson: Lesson }) {
  const t = useSeg(p, T.rowsIn[0], T.rowsIn[1], easeOutBack);
  const arc = useTransform(t, (v) => Math.min(1, v) * 0.6);
  if (lesson.state === "todo") {
    return <i aria-hidden className="shrink-0 rounded-full border border-line-strong" style={{ width: u(14), height: u(14) }} />;
  }
  if (lesson.state === "done") return <DoneMark t={t} />;
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="shrink-0" style={{ width: u(14), height: u(14) }}>
      <circle cx="16" cy="16" r="12" fill="none" strokeWidth="5" style={{ stroke: "var(--color-line-strong)" }} />
      <motion.circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        transform="rotate(-90 16 16)"
        style={{ pathLength: arc, stroke: "var(--color-accent)" }}
      />
    </svg>
  );
}

function DoneMark({ t }: { t: MV }) {
  const scale = useTransform(t, (v) => 0.4 + 0.6 * Math.min(1, v));
  return (
    <motion.span
      style={{ scale, width: u(14), height: u(14), background: "var(--color-mint)", color: "var(--color-pastel-ink)" }}
      className="grid shrink-0 place-items-center rounded-full"
    >
      <span className="block" style={{ width: u(9), height: u(9) }}>
        <CheckIcon />
      </span>
    </motion.span>
  );
}

function LessonRow({ p, lesson, i }: { p: MV; lesson: Lesson; i: number }) {
  return (
    <div
      className="absolute flex items-center border border-line bg-surface-1"
      style={{ left: u(M), right: u(M), top: u(PAGE_BODY_TOP + i * (ROW_H + ROW_GAP)), height: u(ROW_H), borderRadius: u(6), paddingInline: u(7), gap: u(6) }}
    >
      <span className="block shrink-0" style={{ width: u(18), height: u(18) }}>
        <BookIcon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: u(2) }}>
        <span className="truncate font-medium text-fg" style={{ fontSize: font(14, 10.5), lineHeight: 1.1 }}>
          {lesson.title}
        </span>
        <span className={`${MONO} text-dim`} style={{ fontSize: font(12, 10.5), lineHeight: 1 }}>
          Level {lesson.level}
        </span>
      </div>
      <Progress p={p} lesson={lesson} />
    </div>
  );
}

export function LessonsPage({ p }: { p: MV }) {
  return (
    <PageShell k={2}>
      <PageTitle title="Lessons" caption="Biology · Year 10" />
      {LESSONS.map((l, i) => (
        <LessonRow key={l.title} p={p} lesson={l} i={i} />
      ))}
    </PageShell>
  );
}
