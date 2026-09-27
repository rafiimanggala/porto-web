import { IMAGE_JOBS } from "./PipeKitData";
import { linePath, polyPath, type WirePath } from "./PipeKitPath";
import { NODE_X, PROMPT_RAIL_Y, ROW_Y, SLOT, slotCx, typeWin } from "./PipeRenderData";

/* Chapter 1 in order, per slot: the prompt is typed, a dot carries it down to the Image node, the job chip appears under the
   slot, and the job id leaves the Image node for the Wait node. Every window here follows from the one before it. */

const SLOT_BOTTOM = SLOT.y + SLOT.h;
const CORNER = 9;
/** Units of wire per unit of progress, so a prompt from a far slot takes longer than one from a near slot. */
const SPEED = 7000;
const SEND_LAG = 0.001;
const CHIP_LAG = 0.008;
const DEPART_LAG = 0.003;
const DEPART_LEN = 0.04;

/** The wire a prompt rides: straight down from its slot, along the prompt rail, then down into the Image node. */
export const PROMPT: readonly WirePath[] = IMAGE_JOBS.map((_, i) =>
  i === 0
    ? linePath([NODE_X[0], SLOT_BOTTOM], [NODE_X[0], ROW_Y])
    : polyPath([[slotCx(i), SLOT_BOTTOM], [slotCx(i), PROMPT_RAIL_Y], [NODE_X[0], PROMPT_RAIL_Y], [NODE_X[0], ROW_Y]], CORNER),
);

export const promptWin = (i: number) => {
  const from = typeWin(i)[1] + SEND_LAG;
  return [from, from + PROMPT[i].length / SPEED] as const;
};
export const chipOnAt = (i: number) => promptWin(i)[1] + CHIP_LAG;
export const departWin = (i: number) => [promptWin(i)[1] + DEPART_LAG, promptWin(i)[1] + DEPART_LAG + DEPART_LEN] as const;

/** A job chip is half faded in here: the readout counts it as started only when a reader can see its id. */
export const CHIP_FADE = 0.014;
export const chipSeenAt = (i: number) => chipOnAt(i) + CHIP_FADE / 2;

const LAST = IMAGE_JOBS.length - 1;
/** The Image node glows from the first prompt arriving until the last job id has left. */
export const FIRE = [promptWin(0)[1] - 0.008, departWin(LAST)[1] - 0.012] as const;
