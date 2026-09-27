import { useTransform } from "framer-motion";
import { useSeg, type MV } from "./HealthSceneParts";
import { useKeys } from "./MtmKitMath";
import { T, type Win } from "./MtmGateSceneData";
import { useFreshMotion, type FreshMotion } from "./MtmGateSceneFields";
import { linear, menuAt, pressAt, shakeAt } from "./MtmGateSceneMath";

/* Motion values shared by the panes, the cart bar and the dropdown. Every one is a pure function of `p`. The wipe positions are
   linear in `p`, because the three beats of a wipe (fade out, sweep, fade in) are timed on them. The tab highlight
   travels in the same windows as the pane wipes, so a tab never says Fresh while the saved pane is still in view. */

export type GateMotion = {
  tab: MV;
  sel: MV;
  selPos: MV;
  unlock: MV;
  slotPos: MV;
  panePos: MV;
  press: MV;
  shake: MV;
  menu: MV;
  hover: MV;
  cancel: MV;
  fresh: FreshMotion;
};

const SLOT_WINS: readonly Win[] = [
  T.click[0].slot,
  T.slotPending,
  T.slotSaved,
  T.slotClear,
  T.slotWarn,
  T.slotBack,
  T.slotFresh,
  T.slotEdit,
  T.click[1].slot,
  T.slotEnd,
];
const SLOT_XS = SLOT_WINS.flatMap((w) => [...w]);
const SLOT_YS = SLOT_WINS.flatMap((_, i) => [i, i + 1]);

export function useGateMotion(p: MV): GateMotion {
  return {
    tab: useKeys(p, [...T.paneFresh, ...T.paneBack], [0, 1, 1, 0]),
    sel: useKeys(p, [...T.choose, ...T.deselect], [0, 1, 1, 0]),
    selPos: useKeys(p, [...T.selWipe, ...T.selBack], [0, 1, 1, 0], linear),
    unlock: useKeys(p, [...T.unlock1, ...T.relock, ...T.unlock2, ...T.relock2], [0, 1, 1, 0, 0, 1, 1, 0], linear),
    slotPos: useKeys(p, SLOT_XS, SLOT_YS, linear),
    panePos: useKeys(p, [...T.paneFit, ...T.paneFresh, ...T.paneBack], [0, 1, 1, 2, 2, 3], linear),
    press: useTransform(p, pressAt),
    shake: useTransform(p, shakeAt),
    menu: useTransform(p, menuAt),
    hover: useKeys(p, T.hoverKeys, T.hoverVals),
    cancel: useSeg(p, T.cancel[0], T.cancel[1]),
    fresh: useFreshMotion(p),
  };
}
