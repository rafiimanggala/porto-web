"use client";

import type { KeyboardEvent, Ref } from "react";
import type { Skill } from "@/data/skills";

// One node's DOM half: a real 44px <button> plus its text label. The scene
// moves it every frame with a transform and writes --lo (label opacity) and
// data-side (which side the label sits on); React never re-renders for that.
export default function OrbitNode({
  skill,
  pressed,
  tabStop,
  controls,
  buttonRef,
  onChoose,
  onKeyDown,
  onHover,
}: {
  skill: Skill;
  pressed: boolean;
  tabStop: boolean;
  controls: string | undefined;
  buttonRef: Ref<HTMLButtonElement>;
  onChoose: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onHover: (on: boolean) => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      data-node={skill.slug}
      data-unit={`node:${skill.slug}`}
      aria-label={skill.title}
      aria-pressed={pressed}
      aria-controls={controls}
      tabIndex={tabStop ? 0 : -1}
      onClick={onChoose}
      onKeyDown={onKeyDown}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      className="group/n pointer-events-auto absolute left-0 top-0 h-11 w-11 cursor-pointer rounded-full will-change-transform"
    >
      <span
        data-label
        style={{ opacity: "var(--lo, 0.8)" }}
        className="pointer-events-none absolute left-[calc(50%+18px)] top-1/2 flex w-max -translate-y-1/2 items-baseline gap-1.5 whitespace-nowrap text-left transition-opacity duration-200 [text-shadow:0_0_10px_var(--color-bg),0_0_4px_var(--color-bg)] group-data-[side=left]/n:right-[calc(50%+18px)] group-data-[side=left]/n:left-auto group-data-[side=left]/n:flex-row-reverse group-data-[side=left]/n:text-right"
      >
        <span
          aria-hidden
          className="mono nums text-[10px] text-dim transition-colors duration-200 group-aria-pressed/n:text-accent"
        >
          {String(skill.n).padStart(2, "0")}
        </span>
        <span className="text-[13px] font-medium leading-tight text-fg">{skill.title}</span>
      </span>
    </button>
  );
}
