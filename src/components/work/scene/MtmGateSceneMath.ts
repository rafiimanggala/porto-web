import { easeInOutCubic, easeOutCubic } from "./HealthSceneParts";
import { segAt } from "./MtmKitMath";
import { NODES, T, type Win } from "./MtmGateSceneData";

/* Pure functions of scroll progress used by the gate scene. */

export const linear = (t: number) => t;

const SNAP_C1 = 1.3;
const SNAP_C3 = SNAP_C1 + 1;
export const snap = (t: number) => 1 + SNAP_C3 * Math.pow(t - 1, 3) + SNAP_C1 * Math.pow(t - 1, 2);

export const at = (v: number, w: Win, ease?: (t: number) => number) => segAt(v, w[0], w[1], ease);

export function tokenX(v: number) {
  const forward = T.move.slice(0, 3).reduce((sum, w) => sum + at(v, w, easeInOutCubic), 0);
  const back = at(v, T.move[3], easeInOutCubic);
  return forward - back - 2 * snap(at(v, T.bail.run));
}

export function tokenY(v: number) {
  return -at(v, T.bail.up, easeOutCubic) + snap(at(v, T.bail.down));
}

const CLICK_SPLIT = 0.5;
const SHAKE_AMP = 6;
const SHAKE_TURNS = 4;
const clickAt = (v: number) => (v < CLICK_SPLIT ? T.click[0] : T.click[1]);

export const pressAt = (v: number) => at(v, clickAt(v).press);

export function shakeAt(v: number) {
  const t = at(v, clickAt(v).shake);
  return SHAKE_AMP * (1 - t) * Math.sin(t * SHAKE_TURNS * 2 * Math.PI);
}

export const refuseAt = (v: number) => Math.sin(Math.PI * at(v, clickAt(v).shake));

export const menuAt = (v: number) => at(v, T.open, easeOutCubic) * (1 - at(v, T.close, easeInOutCubic));

/* A token lands when it melts into its node: an eased move has gone 63 percent of its window when it is within 0.2 of the node,
   the fast fall of the bail out has after 20 percent. The state readout and the move counter change at that moment. */
const LAND_FRAC = 0.63;
const BAIL_LAND_FRAC = 0.2;
const landAt = (w: Win, frac: number) => w[0] + (w[1] - w[0]) * frac;
const LANDS = [...T.move.map((w) => landAt(w, LAND_FRAC)), landAt(T.bail.down, BAIL_LAND_FRAC)];
const mid = (w: Win) => (w[0] + w[1]) / 2;
const STATE_EVENTS: readonly (readonly [number, number])[] = [
  [LANDS[0], 1],
  [LANDS[1], 2],
  [LANDS[2], 3],
  [LANDS[3], 2],
  [mid(T.bail.run), 0],
];
const MOVE_ENDS = LANDS;

export const stateAt = (v: number) => STATE_EVENTS.reduce((state, [when, id]) => (v >= when ? id : state), 0);
export const movesAt = (v: number) => MOVE_ENDS.filter((end) => v >= end).length;
export const stateLabel = (v: number) => NODES[stateAt(v)].label.toLowerCase();
