"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useReducedMotion } from "framer-motion";
import Section from "./ui/Section";
import AutomationDemo from "./AutomationDemo";

export default function AutomationSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setPinned(mq.matches && !reduce);
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  if (!pinned) {
    // Mobile / reduced-motion: plain section, manual Run, no pin.
    return (
      <Section
        id="automation"
        index="01"
        label="Live automation"
        title="Watch an agent ship a fix."
        intro="A real loop my agents run unattended: read the issue, fix it on a branch, deploy, verify with Playwright, attach proof. Press run."
      >
        <div className="mx-auto max-w-2xl">
          <AutomationDemo />
        </div>
      </Section>
    );
  }

  return (
    <div ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex min-h-screen items-center">
        <Section
          id="automation"
          index="01"
          label="Live automation"
          title="Watch an agent ship a fix."
          intro="A real loop my agents run unattended: read the issue, fix it on a branch, deploy, verify with Playwright, attach proof. Scroll to run it."
        >
          <div className="mx-auto max-w-2xl">
            <AutomationDemo progress={smooth} />
          </div>
        </Section>
      </div>
    </div>
  );
}
