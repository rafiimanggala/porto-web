// The dock's links and the page sections each one stands for, in page order, so the
// jukung on the dock sails left to right as the page scrolls. The journey belongs to
// Agents (the level ends at their building). Services and FAQ have no link of their
// own, so they count as the contact stretch ("What do you need built?", "Before you
// reach out"). Lab is another page, so it sits at the end, outside the stretch.
export type DockLink = {
  key: string;
  label: string;
  href: string;
  external?: boolean;
  sections?: readonly string[];
};

export const DOCK_LINKS: readonly DockLink[] = [
  { key: "home", label: "Home", href: "#home", sections: ["home"] },
  { key: "work", label: "Work", href: "#work", sections: ["work"] },
  { key: "agents", label: "Agents", href: "#agents", sections: ["agents", "journey"] },
  { key: "contact", label: "Contact", href: "#contact", sections: ["directory", "faq", "contact"] },
  { key: "lab", label: "Lab", href: "/lab", external: true },
];

// Section ids the dock watches. Module-level so the observer hook keeps a stable dependency.
export const WATCHED_SECTIONS: readonly string[] = DOCK_LINKS.flatMap((l) => l.sections ?? []);
