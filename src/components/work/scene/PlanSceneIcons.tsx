"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SceneIcon, type SceneIconName } from "./SceneIcon";
import { TL } from "./PlanSceneData";

/* Recognition icons of the plan scene. Each one is driven by the same progress
   as the object it names, so it enters and leaves with that object. */

const APPEAR_FROM = 0.85;
const RISE = 3;
const POP = 0.16;
/* Idle tabs keep their icon a step brighter than their label (label floor is
   0.6), so the strip does not read as icons only. */
const TAB_DIM = 0.7;

const useAppear = (t: MV) => ({
  opacity: t,
  scale: useTransform(t, (v) => APPEAR_FROM + (1 - APPEAR_FROM) * v),
  y: useTransform(t, (v) => (1 - v) * RISE),
});

/* Sits in a plan tab and is revealed with the tab label as the tabs fan out.
   Once revealed it follows the label: full strength on the open tab, dimmed on
   the others. */
export function TabIcon({ name, t, active }: { name: SceneIconName; t: MV; active: MV }) {
  const appear = useAppear(t);
  const opacity = useTransform([t, active], ([r, a]: number[]) => r * (TAB_DIM + (1 - TAB_DIM) * a));
  return (
    <motion.span aria-hidden style={{ ...appear, opacity }} className="relative grid shrink-0 place-items-center">
      <SceneIcon name={name} size={32} className="h-7 w-7 @lg:h-8 @lg:w-8" />
    </motion.span>
  );
}

/* Leads the goal selector, inside its left padding so the selector keeps the
   full width of the tab row. It is on stage from the first frame, like the
   selector, and pops when the pointer lands on the goal. */
export function GoalIcon({ p }: { p: MV }) {
  const t = useSeg(p, TL.click[0], TL.click[1] + 0.02, easeOutCubic);
  const scale = useTransform(t, (v) => 1 + POP * Math.sin(Math.PI * v));
  return (
    <motion.span aria-hidden style={{ scale }} className="ml-0.5 grid shrink-0 place-items-center @lg:ml-1">
      <SceneIcon name="goal" size={36} className="h-7 w-7 @lg:h-9 @lg:w-9" />
    </motion.span>
  );
}

/* Sits right after the day label of the first training column, centred on that
   row and clear of the next column. It arrives with the highlight on the
   exercise about to be swapped, turns while the swap runs, and stays as the
   marker of the swapped column. The zero-height slot keeps the head height
   unchanged. The artwork has about 10% empty margin, hence the negative inset. */
export function SwapMark({ p, swap }: { p: MV; swap: MV }) {
  const t = useSeg(p, TL.train.lift[0], TL.train.lift[0] + 0.012, easeOutCubic);
  const style = useAppear(t);
  const rotate = useTransform(swap, (v) => v * 180);
  return (
    <span aria-hidden className="pointer-events-none relative h-0 w-6 shrink-0 @lg:w-8">
      <span className="absolute -left-[3px] top-1/2 -mt-0.5 w-max -translate-y-1/2 @lg:-left-1">
        <motion.span style={style} className="grid place-items-center">
          <motion.span style={{ rotate }} className="grid place-items-center">
            <SceneIcon name="swap" size={40} className="h-[30px] w-[30px] @lg:h-10 @lg:w-10" />
          </motion.span>
        </motion.span>
      </span>
    </span>
  );
}
