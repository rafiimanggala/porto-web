"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { optionsForSlug, type BriefOption } from "@/data/briefOptions";
import { EMPTY_IDS, getIds, removeId, subscribe, toggleId } from "./briefStore";

type BriefContextValue = {
  slug: string;
  skillTitle: string;
  /* Where "Send brief" writes to. Passed in so this client bundle stays free of portfolio data. */
  email: string;
  options: readonly BriefOption[];
  /* Chosen options in the order they were added. */
  chosen: readonly BriefOption[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  /* Height of the sticky bar while it is shown, so the page can pad for it. */
  barHeight: number;
  setBarHeight: (height: number) => void;
};

const BriefContext = createContext<BriefContextValue | null>(null);

export const toggleDomId = (slug: string, optionId: string) =>
  `brief-add-${slug}-${optionId}`;

export function BriefProvider({
  slug,
  skillTitle,
  email,
  children,
}: {
  slug: string;
  skillTitle: string;
  email: string;
  children: ReactNode;
}) {
  const ids = useSyncExternalStore(
    subscribe,
    () => getIds(slug),
    () => EMPTY_IDS,
  );
  const [barHeight, setBarHeight] = useState(0);

  const options = useMemo(() => optionsForSlug(slug), [slug]);
  const chosen = useMemo(
    () =>
      ids
        .map((id) => options.find((o) => o.id === id))
        .filter((o): o is BriefOption => o !== undefined),
    [ids, options],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => toggleId(slug, id), [slug]);
  const remove = useCallback((id: string) => removeId(slug, id), [slug]);

  const value = useMemo<BriefContextValue>(
    () => ({ slug, skillTitle, email, options, chosen, has, toggle, remove, barHeight, setBarHeight }),
    [slug, skillTitle, email, options, chosen, has, toggle, remove, barHeight],
  );

  return <BriefContext.Provider value={value}>{children}</BriefContext.Provider>;
}

export function useBrief(): BriefContextValue {
  const ctx = useContext(BriefContext);
  if (!ctx) throw new Error("useBrief must be used inside <BriefProvider>");
  return ctx;
}

/* Empty block that reserves room under the last section while the bar is up,
   so the bar can never sit on top of the final call to action. */
export function BriefSpacer() {
  const { chosen, barHeight } = useBrief();
  const height = chosen.length > 0 ? barHeight : 0;
  return <div aria-hidden data-brief-spacer style={{ height }} />;
}
