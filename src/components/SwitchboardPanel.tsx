"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";
import { skills } from "@/data/skills";

// Number keys 1 to 7 jump to a bay, but ONLY while focus is inside the panel.
// A window-level single-character shortcut with no off switch fails WCAG 2.1.4,
// and it would also steal digits from anything else on the page later.
export default function SwitchboardPanel({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const active = e.target as HTMLElement;
    if (active.closest("input, textarea, select, [contenteditable]")) return;

    const i = Number(e.key);
    if (!Number.isInteger(i) || i < 1 || i > skills.length) return;

    e.preventDefault();
    router.push(`/skills/${skills[i - 1].slug}`);
  };

  return (
    <ul className={className} onKeyDown={onKeyDown}>
      {children}
    </ul>
  );
}
