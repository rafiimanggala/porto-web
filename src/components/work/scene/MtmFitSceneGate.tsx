"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CartButton } from "./MtmKitCards";
import { T } from "./MtmFitSceneData";

/* On a narrow window there is no pinned bar: a slim row closes the form page and the save page instead, and it opens with the same beat. */
export function GateRow({ p }: { p: MV }) {
  const unlock = useSeg(p, T.unlock[0], T.unlock[1]);
  return <CartButton unlock={unlock} className="h-9! shrink-0 @[520px]:hidden" />;
}

/* The gate: one Add to cart bar pinned to the foot of the window. It slides in as the window opens up, stays locked while the fit is typed
   and saved, and opens when 201 Created lands. Only on a wide, tall window: elsewhere there is no room for it beside the form. */
export function CartGate({ p }: { p: MV }) {
  const shown = useSeg(p, T.cartIn[0], T.cartIn[1], easeOutCubic);
  const unlock = useSeg(p, T.unlock[0], T.unlock[1]);
  const y = useTransform(shown, (s) => (1 - s) * 28);
  return (
    <motion.div style={{ opacity: shown, y }} className="pointer-events-none absolute inset-x-4 bottom-4 z-10 hidden @[520px]:[@media(min-height:820px)]:block">
      <CartButton unlock={unlock} />
    </motion.div>
  );
}
