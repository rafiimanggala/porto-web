import { profile } from "@/data/portfolio";

// Static stand-in for the shader: the same name, an orange plate printed a
// little out of register under an off-white one. Shown while three.js loads and
// whenever WebGL is missing, so the panel is never an empty box.

const LINE_Y = [128, 240, 352];

export default function WordmarkFallback() {
  const lines = profile.name.toUpperCase().split(" ");
  const face = { fontFamily: "var(--font-display)" };

  return (
    <svg
      viewBox="0 0 800 440"
      role="img"
      aria-label={`${profile.name}, static wordmark`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 h-full w-full p-6"
    >
      <g style={face} fontWeight={700} fontSize={118} textAnchor="middle">
        <g transform="translate(9 -6)" style={{ fill: "var(--color-accent)" }}>
          {lines.map((line, i) => (
            <text key={line} x={400} y={LINE_Y[i] ?? 0}>
              {line}
            </text>
          ))}
        </g>
        <g style={{ fill: "var(--color-fg)" }}>
          {lines.map((line, i) => (
            <text key={line} x={400} y={LINE_Y[i] ?? 0}>
              {line}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
}
