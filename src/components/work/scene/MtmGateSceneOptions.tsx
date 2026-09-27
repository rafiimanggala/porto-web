"use client";

import { easeOutCubic, MONO, useSeg, type MV } from "./HealthSceneParts";
import { COLLARS, CUFFS, FABRICS, fabricColor } from "./MtmKitData";
import { OptionChip, Swatch } from "./MtmKitCards";
import { LAYOUT, PICK, T, type Win } from "./MtmGateSceneData";
import { Ink } from "./MtmGateSceneWipe";

/* First page of the configurator: fabric, collar and cuff get chosen. Nothing here needs a fit yet. */

const LABEL = `${MONO} w-12 shrink-0 text-[10px] uppercase tracking-[0.12em] text-mute`;
const FLAT = "[&>div]:aspect-[2/1]";

function FabricSwatch({ i, p }: { i: number; p: MV }) {
  const f = FABRICS[i];
  const sel = useSeg(p, T.fabric[0], T.fabric[1], easeOutCubic);
  return <Swatch color={fabricColor(f)} name={f.name} weave={f.weave} selected={i === PICK.fabric ? sel : 0} className={FLAT} />;
}

function PickChip({ label, on, win, p }: { label: string; on: boolean; win: Win; p: MV }) {
  const t = useSeg(p, win[0], win[1], easeOutCubic);
  return <OptionChip label={label} active={on ? t : 0} />;
}

type ChipRowProps = { title: string; items: readonly string[]; picked: number; win: Win; p: MV };

function ChipRow({ title, items, picked, win, p }: ChipRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={LABEL}>{title}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((label, i) => (
          <PickChip key={label} label={label} on={i === picked} win={win} p={p} />
        ))}
      </div>
    </div>
  );
}

export default function OptionsPage({ p }: { p: MV }) {
  return (
    <Ink className="flex h-full flex-col justify-center gap-2.5" style={{ padding: LAYOUT.panePad }}>
      <div className="grid grid-cols-4 gap-2">
        {FABRICS.map((f, i) => (
          <FabricSwatch key={f.id} i={i} p={p} />
        ))}
      </div>
      <ChipRow title="Collar" items={COLLARS} picked={PICK.collar} win={T.collar} p={p} />
      <ChipRow title="Cuff" items={CUFFS} picked={PICK.cuff} win={T.cuff} p={p} />
    </Ink>
  );
}
