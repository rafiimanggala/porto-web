import Link from "next/link";
import Arrow from "@/components/ui/Arrow";
import RoleSwap from "@/components/ui/RoleSwap";

/* Same chrome as CaseShell (theme-green + sticky nav) but without its 860px
   article wrapper, so the pinned stage can run wide. The reading column is
   re-created by the page around the copy sections. */

export default function WideCaseShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="theme-green relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 50% at 50% -10%, color-mix(in oklab, var(--color-accent) 5%, transparent), transparent)",
        }}
      />
      <nav className="sticky top-0 z-40 h-14 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[860px] items-center justify-between px-6">
          <Link
            href="/#directory"
            className="mono inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-fg"
          >
            <Arrow dir="left" /> Directory
          </Link>
          <Link href="/" className="mono inline-flex items-center gap-2 text-sm font-medium text-fg">
            <span>
              rafii<span className="text-accent">.</span>
            </span>
            <span aria-hidden className="hidden text-mute sm:inline">
              /
            </span>
            <RoleSwap className="hidden text-[12px] font-normal text-dim sm:inline-flex" />
          </Link>
        </div>
      </nav>
      {children}
    </main>
  );
}
