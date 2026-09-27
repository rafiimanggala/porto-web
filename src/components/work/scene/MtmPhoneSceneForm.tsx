"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { FIELDS, TEXT, validCount } from "./MtmPhoneSceneData";
import type { Flow } from "./MtmPhoneSceneMath";
import { Head, useRect, type Type } from "./MtmPhoneSceneKit";
import Field from "./MtmPhoneSceneField";

/* The get fitted form: a header with a live count of valid fields, and the six fields. It lies right of the grid on the
   desk, drops under it when the window narrows and becomes the second screen of the phone. The count is dropped while the
   header is too narrow for both labels. */

type Props = { p: MV; flow: MotionValue<Flow>; type: Type };

const TOTAL = FIELDS.length;

function Count({ p }: { p: MV }) {
  const text = useTransform(p, (v) => `${validCount(v)}/${TOTAL} in range`);
  const color = useTransform(p, (v) => (validCount(v) === TOTAL ? "var(--color-mint)" : "var(--color-mute)"));
  return (
    <motion.span style={{ color }} className="hidden tabular-nums @[17em]:inline">
      {text}
    </motion.span>
  );
}

export default function FormGroup({ p, flow, type }: Props) {
  const rect = useRect(flow, (f) => f.form.rect);
  const show = useTransform(flow, (f) => f.head);
  return (
    <motion.div style={rect} className="absolute">
      <Head type={type} show={show} right={<Count p={p} />}>
        {TEXT.formHead}
      </Head>
      {FIELDS.map((m, k) => (
        <Field key={m.id} p={p} flow={flow} type={type} k={k} />
      ))}
    </motion.div>
  );
}
