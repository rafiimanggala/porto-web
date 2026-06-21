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

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <AutomationSection />
      <AgentDay />
      <AgentOS />
      <Toolkit />
      <SelectedWork />
      <Featured />
      <NativeMobile />
      <ProjectIndex />
      <Contact />
    </main>
  );
}
