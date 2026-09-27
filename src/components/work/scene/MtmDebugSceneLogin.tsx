"use client";

import type { MV } from "./HealthSceneParts";
import LoginFlow from "./MtmDebugSceneLoginFlow";
import LoginStack from "./MtmDebugSceneLoginStack";

/* Page 1: the redirect bounces while three copies of the helper fight, then one is left. */

export default function LoginPage({ p }: { p: MV }) {
  return (
    <div className="flex h-full flex-col justify-center px-3">
      <LoginFlow p={p} />
      <div className="max-h-6 min-h-2 flex-1" />
      <LoginStack p={p} />
    </div>
  );
}
