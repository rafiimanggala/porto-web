import { HeroMount } from "./PixelMount";
import "./pixel.css";

// The hero's pixel desk: me in Jakarta, drawn live by src/pixel/hero.js. The
// canvas is an image with a full description; the clock in the caption is
// filled in once the art starts.
export default function HeroArt() {
  return (
    <figure id="hero-art" className="px-scope px-hero">
      <div className="px-frame">
        <canvas
          id="hero-canvas"
          role="img"
          aria-label="Pixel illustration: me at my desk in Jakarta, typing at a Mac Mini with two monitors, a glass of kopi and a desk lamp. Every few seconds a new agent takes shape on the main screen, steps out onto the desk and walks off to work. The window shows the Jakarta sky at this hour, with Monas on the skyline."
        />
      </div>
      <figcaption>
        My desk in Jakarta. It is <time id="hero-time">--:--</time> there now, and the window shows that sky.
      </figcaption>
      <HeroMount />
    </figure>
  );
}
