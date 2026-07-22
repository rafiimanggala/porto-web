import Link from "next/link";

/* Shared case-study primitives. Rendered in the portfolio's dark theme so the
   site stays cohesive; product screenshots carry each project's own identity. */

export function CaseShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_-10%,rgba(95,233,173,0.05),transparent)]" />
      <nav className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[860px] items-center justify-between px-6">
          <Link
            href="/#work"
            className="mono inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-fg"
          >
            <span aria-hidden>&larr;</span> Work
          </Link>
          <Link
            href="/"
            className="mono text-sm font-medium text-fg"
          >
            rafii<span className="text-accent">.</span>
          </Link>
        </div>
      </nav>
      <article className="mx-auto w-full max-w-[860px] px-6 pb-32">{children}</article>
    </main>
  );
}

export function CaseHero({
  eyebrow,
  title,
  subtitle,
  meta,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
}) {
  return (
    <header className="pt-16 sm:pt-24">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="t-hero mt-4">{title}</h1>
      <p className="t-lead mt-6 max-w-[52ch] text-dim">{subtitle}</p>
      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-8 sm:grid-cols-4">
        {meta.map((m) => (
          <div key={m.label}>
            <dt className="eyebrow">{m.label}</dt>
            <dd className="mt-1.5 text-sm text-fg">{m.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

export function Section({
  n,
  kicker,
  title,
  children,
}: {
  n: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-24 scroll-mt-20">
      <div className="flex items-baseline gap-4">
        <span className="mono text-xs text-mute">{n}</span>
        <span className="eyebrow">{kicker}</span>
      </div>
      <h2 className="t-h3 mt-3 max-w-[24ch]">{title}</h2>
      <div className="mt-6 space-y-5 text-dim [&_strong]:font-medium [&_strong]:text-fg">
        {children}
      </div>
    </section>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="t-body max-w-[64ch]">{children}</p>;
}

export function Figure({
  src,
  alt,
  caption,
  frame,
  bare,
}: {
  src: string;
  alt: string;
  caption?: string;
  frame?: boolean;
  bare?: boolean;
}) {
  return (
    <figure className="mt-8">
      <div
        className={
          bare
            ? ""
            : "overflow-hidden rounded-2xl border border-line bg-surface-1 " +
              (frame ? "p-3" : "")
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={"block w-full " + (frame ? "rounded-xl" : "")}
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-mute">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function PhoneRow({
  shots,
}: {
  shots: { src: string; label: string }[];
}) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {shots.map((s) => (
        <figure key={s.src}>
          <div className="overflow-hidden rounded-[20px] border border-line bg-surface-1 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.6)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.label} loading="lazy" className="block w-full" />
          </div>
          <figcaption className="mt-2.5 text-center text-xs text-mute">
            {s.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ReelGrid({
  reels,
}: {
  reels: { src: string; poster: string; label: string }[];
}) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {reels.map((r) => (
        <figure key={r.src}>
          <div className="overflow-hidden rounded-[20px] border border-line bg-surface-1 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.6)]">
            <video
              src={r.src}
              poster={r.poster}
              controls
              playsInline
              preload="none"
              className="block aspect-[9/16] w-full bg-black object-cover"
            />
          </div>
          <figcaption className="mt-2.5 text-center text-xs text-mute">
            {r.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Columns({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 grid gap-8 sm:grid-cols-2">{children}</div>;
}

export function Callout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-surface-1 p-6">
      {title ? (
        <div className="eyebrow mb-2 text-accent">{title}</div>
      ) : null}
      <p className="t-body text-dim">{children}</p>
    </div>
  );
}

export function ProtoButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-bg transition-transform hover:scale-[1.02]"
    >
      Open live prototype
      <span aria-hidden>&rarr;</span>
    </Link>
  );
}

export function NextCase({
  href,
  label,
  title,
}: {
  href: string;
  label: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="mt-28 flex items-center justify-between gap-6 rounded-2xl border border-line bg-surface-1 p-7 transition-colors hover:border-line-strong"
    >
      <div>
        <div className="eyebrow">{label}</div>
        <div className="t-h3 mt-1.5">{title}</div>
      </div>
      <span className="text-2xl text-accent" aria-hidden>
        &rarr;
      </span>
    </Link>
  );
}
