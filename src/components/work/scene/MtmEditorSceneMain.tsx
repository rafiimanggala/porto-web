"use client";

import type { MV } from "./HealthSceneParts";
import { COLUMN } from "./MtmEditorSceneKit";
import { OriginalCard, OthersList, RowA } from "./MtmEditorSceneList";
import { ActionBar, Editor } from "./MtmEditorSceneEdit";
import { Family } from "./MtmEditorSceneClone";

/* Library, edit and clone share one page. Below the first card the other patterns fold away, the editor rows
   open, then fold again to make room for the copies. Each block trades its own height, one item at a time. */

export default function MainPage({ p }: { p: MV }) {
  return (
    <div className={COLUMN}>
      <RowA p={p} />
      <OriginalCard p={p} />
      <OthersList p={p} />
      <Editor p={p} />
      <Family p={p} />
      <ActionBar p={p} />
    </div>
  );
}
