"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { StatusStrip } from "./PipeKitStatus";
import { CAPTIONS, CHAPTERS, STATUS_AT, TILE, W, type Geo } from "./PipePublishData";
import { GeoProvider, useBoxGeo } from "./PipePublishGeo";
import { readoutAt } from "./PipePublishMath";
import PostColumn from "./PipePublishPost";
import Sheet from "./PipePublishSheet";
import Upload from "./PipePublishUpload";
import { WriteNode } from "./PipePublishWrite";
import { RidersLayer, WiresLayer } from "./PipePublishWires";

/* Publishing: the sheet is read for ready rows, the media goes up once, two posts go out in parallel, the row records
   the result. The stage keeps a fixed aspect so wires (svg units) and nodes (percent) line up at any size, and the status
   strip under it has exactly the stage's width: one column holds both, sized from the box in cq units. The stage is tall on
   a phone and wide elsewhere (PipePublishGeo). */

const STRIP_H = 26;
const PAD = "var(--pad)";
const GAP = "var(--gap)";
const STAGE_STYLE = { ["--t" as string]: TILE } as CSSProperties;
/* The strip's labels are 10px on a phone and 12px once the box is wide enough for five cells at that size. */
const STRIP_TEXT = "@min-[520px]:text-xs!";

const columnStyle = (H: number) =>
  ({
    width: `min(100cqw - 2 * ${PAD}, (100cqh - 2 * ${PAD} - ${GAP} - ${STRIP_H}px) * ${W} / ${H})`,
    height: `min(100cqh - 2 * ${PAD}, (100cqw - 2 * ${PAD}) * ${H} / ${W} + ${GAP} + ${STRIP_H}px)`,
  }) as CSSProperties;

function Stage({ p, geo }: { p: MV; geo: Geo }) {
  return (
    <GeoProvider value={geo}>
      <div style={columnStyle(geo.H)} className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-[var(--gap)]">
        <div style={STAGE_STYLE} className="relative min-h-0 flex-1 [container-type:size]">
          <WiresLayer p={p} />
          <Upload p={p} />
          {[0, 1].map((i) => (
            <PostColumn key={i} i={i} p={p} />
          ))}
          <WriteNode p={p} />
          <Sheet p={p} />
          <RidersLayer p={p} />
        </div>
        <StatusStrip p={p} statusAt={STATUS_AT} className={STRIP_TEXT} />
      </div>
    </GeoProvider>
  );
}

/* Exported so the WorkReel card preview (mockup-video route) can drive this
   same visual directly with a manually-set progress value, instead of a
   fake mockup animation: one real scene, two places it plays. */
export function PipePublishVisual({ p }: { p: MV }) {
  const box = useRef<HTMLDivElement>(null);
  const geo = useBoxGeo(box);
  return (
    <div ref={box} className="absolute inset-0 [--gap:clamp(14px,2.4cqw,18px)] [--pad:clamp(8px,2.6cqw,20px)] [container-type:size]">
      <Stage key={geo.H} p={p} geo={geo} />
    </div>
  );
}

/* One notch above the header's own 10px from sm up: the readout is the running caption of the story. On a phone the header
   leaves it about 180px beside the eyebrow, so it stays at 10px and on one line ("1 of 6 rows rendered, 5 skipped"). */
function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutAt);
  return <motion.span className="whitespace-nowrap text-[10px] sm:text-[11px]">{text}</motion.span>;
}

export default function PipePublishScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <PipePublishVisual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
