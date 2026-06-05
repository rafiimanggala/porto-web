import { profile } from "@/data/portfolio";

const links = [
  { href: "#work", label: "Work" },
  { href: "#toolkit", label: "Toolkit" },
  { href: "#native", label: "Native" },
  { href: "#index", label: "Index" },
  { href: "#contact", label: "About" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6 lg:px-8">
        <a href="#top" className="mono text-sm font-medium text-fg">
          {profile.handle}
          <span className="text-accent">.</span>
        </a>
        <div data-unit="nav" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex h-11 cursor-pointer items-center text-sm text-dim transition-colors duration-200 hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="mono cursor-pointer rounded-full border border-line px-4 py-1.5 text-xs text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          Get in touch
        </a>
      </nav>
    </header>
  );
}
