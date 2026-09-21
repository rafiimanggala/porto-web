"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { hasSkillDemo } from "./demoSlugs";

function DemoSkeleton() {
  return (
    <div
      aria-hidden
      data-state="loading"
      className="h-[420px] rounded-2xl border border-line bg-surface-1 motion-safe:animate-pulse"
    />
  );
}

// The demo is its own chunk and only loads once the slot is close to the
// viewport, so a visitor who never scrolls this far never downloads it.
const DoodleGuess = dynamic(() => import("@/components/skills/doodle/DoodleGuess"), {
  ssr: false,
  loading: () => <DemoSkeleton />,
});

function LazyDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-demo-slot data-state={near ? "requested" : "idle"}>
      {near ? <DoodleGuess /> : <DemoSkeleton />}
    </div>
  );
}

export default function SkillDemo({ slug }: { slug: string }) {
  if (!hasSkillDemo(slug)) return null;
  return <LazyDemo />;
}
