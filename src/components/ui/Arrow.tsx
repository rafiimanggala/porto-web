// A drawn arrow, not a typed one. A lone U+2192 in a span is indexed as an
// icon-by-character by content scanners, and its advance width shifts per
// platform font, which makes hover translation land inconsistently.
export default function Arrow({
  dir = "right",
  className = "",
}: {
  dir?: "right" | "left";
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 8"
      width="20"
      height="8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      style={dir === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M0 4H18" />
      <path d="M14.5 1 18 4l-3.5 3" />
    </svg>
  );
}
