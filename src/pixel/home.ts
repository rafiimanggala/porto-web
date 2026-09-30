// The home page's canvas modules, in dependency order. Each file is a plain
// script that adds itself to window.PETA; install.ts has to run first.
import "./install";
import "./pixel.js";
import "./sprites.js";
import "./bots.js";
import "./rooms-props.js";
import "./rooms.js";
import "./hq-city.js";
import "./hq.js";
import "./hq-ui.js";
import "./hero-art.js";
import "./hero.js";
import "./journey-scenery.js";
import "./journey.js";
import "./dock.js";

export {};
