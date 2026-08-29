"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { profile } from "@/data/portfolio";
import CmdkHint from "./ui/CmdkHint";

const devLinks = [
  { href: "#automation", label: "AI" },
  { href: "#ai-day", label: "How I work" },
  { href: "#agent-os", label: "Agent OS" },
  { href: "#toolkit", label: "Toolkit" },
  { href: "#uiux", label: "Design" },
  { href: "#work", label: "Work" },
  { href: "#native", label: "Native" },
  { href: "#index", label: "Index" },
  { href: "#contact", label: "About" },
];

const videoLinks = [
  { href: "#work", label: "Work" },
  { href: "/", label: "Directory" },
];

// The switchboard homepage carries two links and nothing else. The cards are the
// call to action, so a second row of choices above them is the failure mode.
const homeLinks = [
  { href: "#directory", label: "Directory" },
  { href: "/video", label: "AI video" },
];

const linkSets = { dev: devLinks, video: videoLinks, home: homeLinks };

export default function Nav({
  variant = "dev",
}: {
  variant?: "dev" | "video" | "home";
}) {
  const links = linkSets[variant];
  // Nav sits flush with the hero at rest (matches the x.ai/bot reference:
  // no visible chrome until the page moves) and only picks up its border,
  // fill and blur once the user actually scrolls past it.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-bg/70 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="mono flex items-center gap-2 text-sm font-medium text-fg">
          <span
            aria-hidden
            className="flex h-5 w-5 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-[10px] font-bold text-accent"
          >
            &gt;
          </span>
          {profile.handle}
          <span className="text-accent">.</span>
        </Link>
        <div data-unit="nav" className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const cls =
              "link-underline inline-flex h-11 cursor-pointer items-center text-sm text-dim transition-colors duration-200 hover:text-fg";
            // Hash links stay plain anchors so they scroll; route links go
            // through next/link so they do not reload the document.
            return l.href.startsWith("#") ? (
              <a key={l.href} href={l.href} className={cls}>
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className={cls}>
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {variant === "dev" ? <CmdkHint /> : null}
          {variant === "home" ? (
            <a
              href="#directory"
              className="mono cursor-pointer rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-bg transition-colors duration-200"
            >
              View the work
            </a>
          ) : null}
          <a
            href="#contact"
            className="mono cursor-pointer rounded-full border border-line px-4 py-1.5 text-xs text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            Get in touch
          </a>
        </div>
      </nav>
    </header>
  );
}
