import Link from "next/link";
import Arrow from "@/components/ui/Arrow";

/* Shared frame for the /lab shelf. Same dark tokens and sticky bar as the case
   studies (CaseShell), but wide: the experiments need room to breathe. */

export function LabShell({
  children,
  backHref = "/lab",
  backLabel = "Lab",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 50% at 50% -10%, color-mix(in oklab, var(--color-accent) 5%, transparent), transparent)",
        }}
      />
      <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
        <nav
          aria-label="Lab"
          className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6 lg:px-8"
        >
          <Link
            href={backHref}
            className="mono inline-flex min-h-11 items-center gap-2 text-sm text-dim transition-colors hover:text-fg"
          >
            <Arrow dir="left" /> {backLabel}
          </Link>
          <Link href="/" className="mono inline-flex min-h-11 items-center text-sm font-medium text-fg">
            rafii<span className="text-accent">.</span>
          </Link>
        </nav>
      </header>
      <div className="mx-auto w-full max-w-[1120px] px-6 pb-32 lg:px-8">{children}</div>
    </main>
  );
}

export function LabHeader({
  eyebrow,
  title,
  lead,
  cost,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  cost?: string;
}) {
  return (
    <header className="pt-14 sm:pt-20">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="t-hero mt-4 max-w-[18ch]">{title}</h1>
      <p className="t-lead mt-6 max-w-[58ch] text-dim">{lead}</p>
      {cost ? (
        <p className="mono mt-5 max-w-[68ch] text-xs leading-relaxed text-mute">
          <span className="text-dim">Cost:</span> {cost}
        </p>
      ) : null}
    </header>
  );
}
