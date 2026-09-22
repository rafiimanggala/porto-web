// Heading block of the #directory section. The id is what the section's
// aria-labelledby points at.
export default function DirectoryHead() {
  return (
    <header>
      <span className="mb-6 inline-flex w-fit rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pastel-ink">
        View the work
      </span>
      <h2
        id="directory-h"
        className="font-display max-w-[14ch] text-balance text-[clamp(3rem,10vw,7rem)] leading-[0.95] font-normal tracking-[-0.01em] text-accent"
      >
        What do you need built?
      </h2>
      <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-dim sm:text-lg">
        Seven things I get hired for. Press a node for the case study, the numbers, and the
        stack behind it.
      </p>
    </header>
  );
}
