"use client";

import Link from "next/link";
import RoleSwap from "@/components/ui/RoleSwap";
import { DOCK_LINKS, WATCHED_SECTIONS, type DockLink } from "./sections";
import { useActiveSection } from "./useActiveSection";

const PILL =
  "flex min-h-11 items-center rounded-full px-3 text-[13px] font-semibold transition-colors duration-200 max-[359px]:px-2.5 sm:px-4 sm:text-sm";
const IDLE = "text-fg hover:bg-surface-3";
const ACTIVE = "bg-accent text-white";

function DockItem({ link, current }: { link: DockLink; current: boolean }) {
  const cls = `${PILL} ${current ? ACTIVE : IDLE}`;
  if (link.external) {
    return (
      <Link href={link.href} className={cls}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} aria-current={current ? "location" : undefined} className={cls}>
      {link.label}
    </a>
  );
}

// Floating pill nav, fixed at the bottom centre. The current section is the filled
// violet pill. 12px side margins and the safe-area inset keep it inside a phone screen.
export default function Dock() {
  const section = useActiveSection(WATCHED_SECTIONS);
  const currentKey = DOCK_LINKS.find((l) => l.sections?.includes(section))?.key;

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-3 z-50 flex justify-center"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-line bg-surface-2/80 p-1.5 shadow-[0_8px_24px_rgba(36,27,75,0.08)] backdrop-blur-md sm:gap-2">
        <span className="font-display px-2 text-xl leading-none text-accent max-[359px]:hidden sm:px-3">
          rafii.
        </span>
        <span aria-hidden="true" className="hidden pr-2 sm:block">
          <RoleSwap className="text-[12px] font-medium text-dim" />
        </span>
        <ul className="flex items-center gap-0.5 sm:gap-1">
          {DOCK_LINKS.map((link) => (
            <li key={link.key}>
              <DockItem link={link} current={link.key === currentKey} />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
