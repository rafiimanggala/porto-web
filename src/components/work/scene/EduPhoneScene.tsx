"use client";

import { useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { Frame, Chrome } from "./MobileSceneFrame";
import { CAPTIONS, CHAPTERS, WARP } from "./EduPhoneSceneData";
import { flowAt } from "./EduPhoneSceneMath";
import { Stage, useType } from "./EduPhoneSceneKit";
import { Nav, Pager, Screen } from "./EduPhoneSceneDevice";
import { GuideBox, GuidePill, Ruler, Tag, ViewItem } from "./EduPhoneSceneNotes";
import TilesGroup from "./EduPhoneSceneTiles";
import LessonsGroup from "./EduPhoneSceneLessons";
import QuizGroup from "./EduPhoneSceneQuiz";
import { LessonsPage, SubjectsPage } from "./EduPhoneScenePages";
import { QuizPage } from "./EduPhoneSceneQuizPage";

/* Responsive reflow scene. A laptop frame holds a four-across subject grid, a
   lesson list and a quiz card side by side. As the frame narrows into a phone the
   blocks re-flow in place (tiles two per row, list full width, answers stacked),
   then the phone pages through its three views. The scroll progress is warped to
   scene time once here, so every piece below reads the same clock. */

const THREE = [0, 1, 2] as const;

function Visual({ p: scroll }: { p: MV }) {
  const p = useTransform(scroll, [...WARP.p], [...WARP.q]);
  const flow = useTransform(p, flowAt);
  const type = useType(p);
  const shared = { p, flow, type };
  return (
    <Stage p={p}>
      <Frame p={p} />
      <Screen p={p}>
        <Pager p={p}>
          <TilesGroup {...shared} />
          <LessonsGroup {...shared} />
          <QuizGroup {...shared} />
          <SubjectsPage p={p} />
          <LessonsPage p={p} />
          <QuizPage p={p} />
        </Pager>
        <Nav flow={flow} type={type} />
        {THREE.map((i) => (
          <GuideBox key={i} p={p} i={i} />
        ))}
      </Screen>
      <Chrome p={p} />
      <Ruler p={p} />
      {THREE.map((i) => (
        <GuidePill key={i} p={p} i={i} />
      ))}
      {THREE.map((i) => (
        <Tag key={i} p={p} i={i} />
      ))}
      {THREE.map((i) => (
        <ViewItem key={i} p={p} i={i} />
      ))}
    </Stage>
  );
}

export default function EduPhoneScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
