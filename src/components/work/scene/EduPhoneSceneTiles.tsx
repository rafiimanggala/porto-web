"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { u } from "./MobileSceneKit";
import { lerp, segAt } from "./MobileSceneMath";
import { SUBJECTS, T, TILE } from "./EduPhoneSceneData";
import type { Flow } from "./EduPhoneSceneMath";
import { Flash, Header, useBeat, useRect, type Type } from "./EduPhoneSceneKit";
import { SubjectGlyph } from "./EduPhoneSceneIcons";

/* Subject grid. Four across on the laptop; the last two tiles drop to a second
   row and the row re-flows to two per row. A tile keeps its stacked layout (glyph
   over name) and its sub line fades out with the narrowing frame, before the tile
   starts to get shorter, so the line is never cut by the tile edge. */

type Props = { p: MV; flow: MotionValue<Flow>; type: Type };

const PAD = 5;
const NAME_TOP = 28;
const SUB_TOP = 41;
const HOME_GLYPH_TOP = 3;
const HOME_NAME_TOP = 19.5;

function Tile({ p, flow, type, i }: Props & { i: number }) {
  const s = SUBJECTS[i];
  const geo = useTransform(flow, (f) => f.tiles.items[i]);
  const box = useRect(geo, (g) => g);
  const a = T.tileBeat.start + i * T.tileBeat.step;
  const beat = useBeat(p, a, a + T.tileBeat.dur);
  const glyphTop = useTransform(geo, (g) => u(lerp(PAD, HOME_GLYPH_TOP, g.a)));
  const nameTop = useTransform(geo, (g) => u(lerp(NAME_TOP, HOME_NAME_TOP, g.a)));
  const subOpacity = useTransform(p, (v) => 1 - segAt(v, T.subFade));
  return (
    <motion.div
      style={{ ...box, borderTopColor: s.tint, borderTopWidth: u(1.2), borderRadius: u(5) }}
      className="absolute overflow-hidden border border-line bg-surface-1"
    >
      <motion.span style={{ top: glyphTop, left: u(PAD), width: u(TILE.glyph), height: u(TILE.glyph) }} className="absolute block">
        <SubjectGlyph name={s.glyph} />
      </motion.span>
      <motion.span
        style={{ left: u(PAD), top: nameTop, right: u(3), fontSize: type.name, lineHeight: 1.1 }}
        className="absolute truncate font-medium text-fg"
      >
        {s.name}
      </motion.span>
      <motion.span
        style={{ left: u(PAD), top: u(SUB_TOP), right: u(3), opacity: subOpacity, fontSize: type.label, lineHeight: 1.1 }}
        className="absolute truncate text-dim"
      >
        {s.sub}
      </motion.span>
      <Flash beat={beat} />
    </motion.div>
  );
}

export default function TilesGroup(props: Props) {
  const box = useRect(props.flow, (f) => f.tiles.rect);
  return (
    <motion.div style={box} className="absolute">
      <Header type={props.type}>Subjects</Header>
      {SUBJECTS.map((s, i) => (
        <Tile key={s.name} {...props} i={i} />
      ))}
    </motion.div>
  );
}
