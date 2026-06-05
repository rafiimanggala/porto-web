import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
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
      <Featured />
      <Toolkit />
      <NativeMobile />
      <ProjectIndex />
      <Contact />
    </main>
  );
}
