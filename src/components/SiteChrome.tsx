"use client";

import { usePathname } from "next/navigation";
import ScrollProgress from "./fx/ScrollProgress";
import CursorGlow from "./fx/CursorGlow";
import CommandPalette from "./CommandPalette";
import Mascot from "./Mascot";

// Portfolio-site chrome, scoped per route.
// - /demo/*: nothing, so the prototype reads as its own product.
// - / and /skills/*: nothing either. The switchboard is a directory a client
//   scans in seconds; a progress bar for 1.6 screens, a cursor glow and a
//   mascot are three more things competing with six cards.
// - CommandPalette's actions are /dev section anchors, so it only ships there.
export default function SiteChrome() {
  const pathname = usePathname() ?? "/";

  if (pathname.startsWith("/demo")) return null;
  if (pathname === "/" || pathname.startsWith("/skills")) return null;

  const isDev = pathname === "/dev";

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      {isDev ? <CommandPalette /> : null}
      {isDev ? <Mascot /> : null}
      <div className="grain" aria-hidden />
    </>
  );
}
