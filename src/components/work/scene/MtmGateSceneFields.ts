import { useTransform } from "framer-motion";
import { easeOutCubic, type MV } from "./HealthSceneParts";
import { BAD_ENTRY, type Measure } from "./MtmKitData";
import { useMeasureStatus } from "./MtmKitCards";
import { keyframes, segAt, useKeys, useMv } from "./MtmKitMath";
import { FRESH_FIELDS, SLEEVE, T, type Win } from "./MtmGateSceneData";
import { linear } from "./MtmGateSceneMath";

/* Motion of the three fields of the fresh fitting. The fields and the shirt drawing both read it, so they never disagree.
   `reveal` is what the field box shows (its caret is on only while a field is being typed in), `line` is how much of the
   dimension line stands behind the value. Cancel blurs every field, the lines and chips on the shirt retract as the press
   ends, and the boxes empty at once, so a bare shirt never stands next to filled fields or the other way round.
   The sleeve is typed key by key: the box, the chip and the length of the sleeve line all read the same typed string. */

export type FieldMotion = { reveal: MV; status: MV; line: MV };
export type SleeveMotion = { reveal: MV; status: MV; text: MV; cm: MV };
export type FreshMotion = { height: FieldMotion; collar: FieldMotion; sleeve: SleeveMotion };

const CARET_HOLD = 0.99;
const CARET_EMPTY = 0.002;
const KEY_RAMP = 0.002;
const EDIT_MID = (T.edit[0] + T.edit[1]) / 2;

function useTyped(p: MV, measure: Measure, type: Win, ok: Win): FieldMotion {
  const line = useKeys(p, [type[0], type[1], T.linesOff[0], T.linesOff[1]], [0, 1, 1, 0], linear);
  const reveal = useTransform(p, (v) => (v >= T.clear[0] ? 0 : segAt(v, type[0], type[1])));
  const armed = useKeys(p, [ok[0], ok[1], T.cancel[0], T.cancel[1]], [0, 1, 1, 0], linear);
  const status = useMeasureStatus(useMv(measure.sample), [measure.min, measure.max], armed);
  return { reveal, status, line };
}

/* Every key press of the sleeve: 112 typed, backspaced, 64 typed, then the edit that takes the 4 away again. */
type Key = { at: number; text: string };
const BAD = String(BAD_ENTRY.typed);
const FIXED = String(BAD_ENTRY.fixed);
const press = (w: Win, count: number, i: number) => w[0] + (i * (w[1] - w[0])) / count;
const run = (w: Win, text: string, prefix: (i: number) => string): Key[] =>
  Array.from(text, (_, i) => ({ at: press(w, text.length, i), text: prefix(i) }));
const KEYS: readonly Key[] = [
  ...run(T.typeS, BAD, (i) => BAD.slice(0, i + 1)),
  ...run(T.back, BAD, (i) => BAD.slice(0, BAD.length - 1 - i)),
  ...run(T.retype, FIXED, (i) => FIXED.slice(0, i + 1)),
  { at: EDIT_MID, text: FIXED.slice(0, -1) },
];

export const typedAt = (v: number) => KEYS.reduce((text, key) => (v >= key.at ? key.text : text), "");
const numberOf = (text: string) => Number(text) || 0;

/* The line follows the typed number, with a short ramp so a key press does not jump a whole frame. */
const CM_XS = KEYS.flatMap((key) => [key.at, key.at + KEY_RAMP]);
const CM_YS = KEYS.flatMap((key, i) => [i === 0 ? 0 : numberOf(KEYS[i - 1].text), numberOf(key.text)]);
const ARMED_XS = [T.bad[0], T.bad[1], T.back[0], T.back[1], T.ok[0], T.ok[1], T.armOff[0], T.armOff[1]];
const ARMED_YS = [0, 1, 1, 0, 0, 1, 1, 0];
const FOCUS: readonly Win[] = [
  [T.typeS[0], T.typeS[1]],
  [T.back[0], T.retype[1]],
  [T.edit[0], T.cancel[0]],
];

/* The caret sits behind the last typed digit while a key can still land, and at the left edge while the box is empty. */
function sleeveReveal(v: number): number {
  if (v >= T.clear[0]) return 0;
  if (v >= T.cancel[0]) return 1;
  const typed = typedAt(v) !== "";
  if (!FOCUS.some(([a, b]) => v >= a && v < b)) return typed ? 1 : 0;
  return typed ? CARET_HOLD : CARET_EMPTY;
}

function useSleeve(p: MV): SleeveMotion {
  const reveal = useTransform(p, sleeveReveal);
  const armed = useKeys(p, ARMED_XS, ARMED_YS, linear);
  const value = useTransform(p, (v): number => (v < T.retype[0] ? BAD_ENTRY.typed : BAD_ENTRY.fixed));
  const status = useMeasureStatus(value, [SLEEVE.min, SLEEVE.max], armed);
  const text = useTransform(p, (v) => numberOf(typedAt(v)));
  const cm = useTransform(p, (v) => keyframes(v, CM_XS, CM_YS, easeOutCubic));
  return { reveal, status, text, cm };
}

export function useFreshMotion(p: MV): FreshMotion {
  return {
    height: useTyped(p, FRESH_FIELDS[0], T.typeH, T.okH),
    collar: useTyped(p, FRESH_FIELDS[1], T.typeC, T.okC),
    sleeve: useSleeve(p),
  };
}
