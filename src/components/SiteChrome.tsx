"use client";

import { usePathname } from "next/navigation";
import ScrollProgress from "./fx/ScrollProgress";
import CursorGlow from "./fx/CursorGlow";
import CommandPalette from "./CommandPalette";
import Mascot from "./Mascot";

// Portfolio-site chrome. Hidden on standalone product demos (/demo/*) so the
// prototype reads as its own product, not a widget on the portfolio.
export default function SiteChrome() {
  const pathname = usePathname();
  if (pathname?.startsWith("/demo")) return null;

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <CommandPalette />
      <Mascot />
      <div className="grain" aria-hidden />
    </>
  );
}
