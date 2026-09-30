// Section heading for the pixel sections, in the same language as the work
// reel's and the directory's: a sun pastel label chip, a Titan One heading in
// the accent colour and a dim intro.
export default function PixelHead({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <span className="mb-6 inline-flex w-fit rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pastel-ink">
        {label}
      </span>
      <h2
        id={id}
        className="font-display max-w-[16ch] text-balance text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.98] font-normal tracking-[-0.01em] text-accent"
      >
        {title}
      </h2>
      <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-dim sm:text-lg">{children}</p>
    </>
  );
}
