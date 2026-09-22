"use client";

import type { KeyboardEvent, Ref } from "react";
import type { Skill } from "@/data/skills";
import { nodeStyle } from "./orbitStyle";

// One node's DOM half: a real 44px <button> plus its label chip. The scene
// moves it every frame with a transform and writes --lo (chip visibility, 0 or
// 1), --off (gap from the button's centre to the chip) and data-side (which
// side the chip sits on); React never re-renders for that. --node is the
// service's pastel, the same colour the scene paints the sphere.
export default function OrbitNode({
  skill,
  index,
  pressed,
  tabStop,
  controls,
  buttonRef,
  onChoose,
  onKeyDown,
  onHover,
}: {
  skill: Skill;
  index: number;
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
      style={nodeStyle(index)}
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
        style={{ opacity: "var(--lo, 1)" }}
        className="pointer-events-none absolute left-[calc(50%+var(--off,24px))] top-1/2 flex w-max -translate-y-1/2 items-baseline gap-1.5 whitespace-nowrap rounded-full bg-[var(--node)] px-3 py-1.5 text-left shadow-[inset_0_0_0_1px_rgba(21,32,18,0.14)] transition-[opacity,background-color] duration-200 group-aria-pressed/n:bg-accent group-aria-pressed/n:shadow-none group-data-[side=left]/n:right-[calc(50%+var(--off,24px))] group-data-[side=left]/n:left-auto group-data-[side=left]/n:flex-row-reverse group-data-[side=left]/n:text-right"
      >
        <span
          aria-hidden
          className="nums text-[10px] font-semibold text-fg/70 group-aria-pressed/n:text-white/85"
        >
          {String(skill.n).padStart(2, "0")}
        </span>
        <span className="text-[13px] font-semibold leading-tight text-fg group-aria-pressed/n:text-white">
          {skill.title}
        </span>
      </span>
    </button>
  );
}
