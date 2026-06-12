import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import SelectedWork from "@/components/SelectedWork";
import Featured from "@/components/Featured";
import Toolkit from "@/components/Toolkit";
import NativeMobile from "@/components/NativeMobile";
import ProjectIndex from "@/components/ProjectIndex";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <SelectedWork />
      <Featured />
      <Toolkit />
      <NativeMobile />
      <ProjectIndex />
      <Contact />
    </main>
  );
}
