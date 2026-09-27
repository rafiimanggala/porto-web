"use client";

import { useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { Frame } from "./MobileSceneFrame";
import { CAPTIONS, CHAPTERS } from "./MtmPhoneSceneData";
import { flowAt } from "./MtmPhoneSceneMath";
import { Stage, useType } from "./MtmPhoneSceneKit";
import { Bar, Chrome, Grip, Nav, Page, Screen } from "./MtmPhoneSceneDevice";
import { GuideBox, GuidePill, Ruler, Tag, Thumb, ViewItem } from "./MtmPhoneSceneNotes";
import CardsGroup from "./MtmPhoneSceneCards";
import FormGroup from "./MtmPhoneSceneForm";
import { Cart, GateNote } from "./MtmPhoneSceneCart";
import { Pointer } from "./MtmPhoneScenePointer";

/* Responsive reflow scene. A browser window holds a three-across collection grid and the fitting form side by side; a
   pointer passes over the shirts, types two measurements and presses the padlocked button. As the
   window narrows into a phone the nav folds into a menu glyph, the form drops under the grid, the cards fall into one column
   and the add to cart button rides the bottom as a sticky bar, its gate unchanged. Then the phone taps a shirt, scrolls to
   the form under it and fits it. */

const TWO = [0, 1] as const;
const THREE = [0, 1, 2] as const;

export function MtmPhoneVisual({ p }: { p: MV }) {
  const flow = useTransform(p, flowAt);
  const type = useType(p);
  const shared = { p, flow, type };
  return (
    <Stage p={p}>
      <Frame p={p} />
      <Screen p={p}>
        <Page p={p} flow={flow}>
          <CardsGroup {...shared} />
          <FormGroup {...shared} />
        </Page>
        <Nav p={p} flow={flow} type={type} />
        <Bar p={p} />
        <Cart {...shared} />
        <GateNote {...shared} />
        {TWO.map((i) => (
          <GuideBox key={i} p={p} i={i} />
        ))}
      </Screen>
      <Chrome p={p} />
      <Grip p={p} />
      <Ruler p={p} />
      {TWO.map((i) => (
        <GuidePill key={i} p={p} i={i} />
      ))}
      {TWO.map((i) => (
        <Tag key={i} p={p} i={i} />
      ))}
      {THREE.map((i) => (
        <ViewItem key={i} p={p} i={i} />
      ))}
      <Thumb p={p} />
      <Pointer p={p} />
    </Stage>
  );
}

export default function MtmPhoneScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <MtmPhoneVisual p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
