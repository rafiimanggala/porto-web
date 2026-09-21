// The dock's links and the page sections each one stands for. FAQ has no link of its
// own, so it counts as part of the contact stretch ("Before you reach out").
export type DockLink = {
  key: string;
  label: string;
  href: string;
  external?: boolean;
  sections?: readonly string[];
};

export const DOCK_LINKS: readonly DockLink[] = [
  { key: "home", label: "Home", href: "#home", sections: ["home"] },
  { key: "work", label: "Work", href: "#directory", sections: ["directory"] },
  { key: "lab", label: "Lab", href: "/lab", external: true },
  { key: "contact", label: "Contact", href: "#contact", sections: ["faq", "contact"] },
];

// Section ids the dock watches. Module-level so the observer hook keeps a stable dependency.
export const WATCHED_SECTIONS: readonly string[] = DOCK_LINKS.flatMap((l) => l.sections ?? []);
