"use client";

import { useEffect, useMemo, useRef, useState, type Ref, type RefObject } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import type { BriefOption } from "@/data/briefOptions";
import { buildBriefBody, buildMailto } from "./briefText";
import { copyText } from "./copyText";
import { toggleDomId, useBrief } from "./BriefProvider";

type CopyState = "idle" | "copied" | "failed";

const COPY_LABEL: Record<CopyState, string> = {
  idle: "Copy brief",
  copied: "Copied",
  failed: "Copy failed",
};

const COPY_ANNOUNCE: Record<CopyState, string> = {
  idle: "",
  copied: "Brief copied to the clipboard.",
  failed: "Could not copy. Use Send brief instead.",
};

// AnimatePresence in popLayout mode measures the exiting chip through the ref
// it injects, and React 19 hands that to a function component as a plain prop.
function Chip({
  option,
  onRemove,
  ref,
}: {
  option: BriefOption;
  onRemove: (id: string) => void;
  ref?: Ref<HTMLLIElement>;
}) {
  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className="shrink-0"
    >
      <button
        type="button"
        data-chip={option.id}
        onClick={() => onRemove(option.id)}
        aria-label={`Remove ${option.title} from brief`}
        className="mono inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface-2 py-1 pl-4 pr-3 text-[11px] text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
      >
        {option.title}
        <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </motion.li>
  );
}

// Keeps focused elements clear of the bar: browsers honour scroll-padding when
// they scroll a focused control into view.
function useScrollPadding(height: number, active: boolean) {
  useEffect(() => {
    if (!active || height === 0) return;
    const root = document.documentElement;
    const previous = root.style.scrollPaddingBottom;
    root.style.scrollPaddingBottom = `${height + 16}px`;
    return () => {
      root.style.scrollPaddingBottom = previous;
    };
  }, [active, height]);
}

function useBarHeight(
  ref: RefObject<HTMLDivElement | null>,
  active: boolean,
  publish: (height: number) => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    // ResizeObserver reports the initial size as soon as it starts observing.
    const observer = new ResizeObserver(() => publish(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, active, publish]);
}

export default function BriefBar() {
  const { slug, skillTitle, email, chosen, remove, barHeight, setBarHeight } = useBrief();
  const barRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLAnchorElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const count = chosen.length;
  const visible = count > 0;

  useBarHeight(barRef, visible, setBarHeight);
  useScrollPadding(barHeight, visible);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const mailto = useMemo(
    () => buildMailto(email, skillTitle, chosen),
    [email, skillTitle, chosen],
  );

  async function onCopy() {
    const ok = await copyText(buildBriefBody(skillTitle, chosen));
    setCopyState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState("idle"), 2200);
  }

  // A removed chip unmounts, so hand focus to something that still exists.
  function onRemove(id: string) {
    remove(id);
    if (count > 1) sendRef.current?.focus();
    else document.getElementById(toggleDomId(slug, id))?.focus();
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {visible ? `${count} ${count === 1 ? "option" : "options"} in your brief.` : ""}
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {COPY_ANNOUNCE[copyState]}
      </div>
      <AnimatePresence>
        {visible ? (
          <motion.div
            ref={barRef}
            role="region"
            aria-label="Your brief"
            data-brief-bar
            data-brief-count={count}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-line-strong bg-surface-1/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
          >
            <div className="mx-auto flex w-full max-w-[860px] flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <p className="eyebrow shrink-0">
                  Your brief <span aria-hidden className="text-accent">{count}</span>
                </p>
                <ul className="relative -m-1 flex min-w-0 flex-1 gap-2 overflow-x-auto p-1 sm:flex-wrap sm:overflow-visible">
                  <AnimatePresence initial={false} mode="popLayout">
                    {chosen.map((o) => (
                      <Chip key={o.id} option={o} onRemove={onRemove} />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  ref={sendRef}
                  href={mailto}
                  data-unit={`brief:send:${slug}`}
                  className="mono inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-accent px-5 text-xs font-semibold text-bg transition-opacity duration-200 hover:opacity-90 sm:flex-none"
                >
                  Send brief
                </a>
                <button
                  type="button"
                  onClick={onCopy}
                  data-unit={`brief:copy:${slug}`}
                  className="mono inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border border-line-strong px-5 text-xs font-semibold text-fg transition-colors duration-200 hover:border-accent hover:text-accent sm:flex-none"
                >
                  {COPY_LABEL[copyState]}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
