import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import AutomationSection from "@/components/AutomationSection";
import AgentDay from "@/components/AgentDay";
import SelectedWork from "@/components/SelectedWork";
import Featured from "@/components/Featured";
import AgentOS from "@/components/AgentOS";
import Toolkit from "@/components/Toolkit";
import NativeMobile from "@/components/NativeMobile";
import ProjectIndex from "@/components/ProjectIndex";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Rafii Manggala · AI Engineer · Autonomous Systems",
  description:
    "I build systems where AI agents do the work, not just write the code. Trading bots, digital twins, and autonomous infra powered by Claude Code.",
  alternates: { canonical: "/dev" },
};

const DEV_SLUGS = [
  "streak",
  "health-platform",
  "education-saas",
  "made-to-measure-shopify",
  "spotter-eld",
];

export default function DevHome() {
  return (
    <main className="relative">
      <Nav variant="dev" />
      <Hero />
      <AutomationSection />
      <AgentDay />
      <AgentOS />
      <Toolkit />
      <SelectedWork slugs={DEV_SLUGS} />
      <Featured />
      <NativeMobile />
      <ProjectIndex />
      <Contact />
    </main>
  );
}
